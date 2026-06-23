import { Horse, PastRace, Race, MasterData } from '../types';

export const ELITE_JOCKEYS_NAR = ["森泰斗", "御神本訓史", "矢野貴之", "笹川翼", "吉原寛人", "和田譲治", "山崎誠士", "吉村智洋", "赤岡修次", "山口勲", "吉村智", "下原理"];
export const ELITE_JOCKEYS_JRA = ["ルメール", "川田将雅", "武豊", "戸崎圭太", "松山弘平", "横山武史", "坂井瑠星", "岩田望来", "西村淳也", "モレイラ", "レーン"];

// 1. 乗り替わり評価
export function analyzeJockeyChange(horse: Horse) {
  const currentJockey = horse.jockey || "";
  const pastRaces = horse.pastRaces || [];
  
  if (pastRaces.length === 0 || !currentJockey) {
    return { isChange: false, isEliteSwitch: false, isPrimaryReturn: false };
  }

  const prevJockey = pastRaces[0].jockey || "";
  const isChange = prevJockey !== "" && currentJockey !== prevJockey;

  let isEliteSwitch = false;
  if (isChange) {
    const isCurrentElite = ELITE_JOCKEYS_NAR.some(j => currentJockey.includes(j)) || ELITE_JOCKEYS_JRA.some(j => currentJockey.includes(j));
    const isPrevElite = ELITE_JOCKEYS_NAR.some(j => prevJockey.includes(j)) || ELITE_JOCKEYS_JRA.some(j => prevJockey.includes(j));
    if (isCurrentElite && !isPrevElite) {
      isEliteSwitch = true;
    }
  }

  let isPrimaryReturn = false;
  if (isChange) {
    // 過去走（前走以外）で1〜3着に入った時の騎手と同じか？
    const goodRaces = pastRaces.slice(1).filter(pr => pr.result >= 1 && pr.result <= 3);
    for (const gr of goodRaces) {
      if (gr.jockey && currentJockey.includes(gr.jockey)) {
        isPrimaryReturn = true;
        break;
      }
    }
  }

  return { isChange, isEliteSwitch, isPrimaryReturn, prevJockey };
}

// 2. 馬体重・ベスト体重評価
export function analyzeWeight(horse: Horse) {
  const currentWeight = horse.weight || 0;
  const weightChange = typeof horse.weightChange === 'number' ? horse.weightChange : 0;
  const pastRaces = horse.pastRaces || [];

  if (currentWeight === 0) {
    return { hasWeightData: false };
  }

  // 1〜3着時の馬体重の平均をベスト体重とする
  const goodWeights = pastRaces.filter(pr => pr.result >= 1 && pr.result <= 3 && pr.weight && pr.weight > 0).map(pr => pr.weight || 0);
  let bestWeight = 0;
  if (goodWeights.length > 0) {
    bestWeight = goodWeights.reduce((a, b) => a + b, 0) / goodWeights.length;
  } else {
    // 好走歴がない場合は過去すべての平均
    const allWeights = pastRaces.filter(pr => pr.weight && pr.weight > 0).map(pr => pr.weight || 0);
    if (allWeights.length > 0) {
      bestWeight = allWeights.reduce((a, b) => a + b, 0) / allWeights.length;
    }
  }

  let diffFromBest = 0;
  let isIdeal = false;
  
  if (bestWeight > 0) {
    diffFromBest = currentWeight - bestWeight;
    isIdeal = Math.abs(diffFromBest) <= 4;
  }

  // 成長分か太め残りの判定
  let isGrowth = false;
  let isFat = false;

  if (weightChange >= 10 || diffFromBest >= 10) {
    if (horse.age <= 3 && pastRaces.length > 0) {
      const prevDate = new Date(pastRaces[0].date);
      const now = new Date();
      const monthsDiff = (now.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      if (monthsDiff >= 3) {
        isGrowth = true; // 3歳以下で3ヶ月以上の休み明けなら成長分
      } else {
        isFat = true; // 間隔が詰まっているのに大幅プラスは太め
      }
    } else {
      isFat = true; // 古馬の大幅プラスは基本的に太め残り（割引）
    }
  }

  return { hasWeightData: true, bestWeight, diffFromBest, isIdeal, isGrowth, isFat, weightChange };
}

// 3. 通過順位の推移（レース展開）評価
export function analyzePassingPositions(horse: Horse) {
  const pastRaces = horse.pastRaces || [];
  if (pastRaces.length === 0 || !pastRaces[0].passingPositions) {
    return { isMakuri: false, isTare: false, isKouhou: false, firstPos: 0, lastPos: 0 };
  }

  const positions = pastRaces[0].passingPositions.split('-').map(Number).filter(n => !isNaN(n));
  if (positions.length < 2) {
    return { isMakuri: false, isTare: false, isKouhou: false, firstPos: positions[0] || 0, lastPos: positions[0] || 0 };
  }

  const firstPos = positions[0];
  const lastPos = positions[positions.length - 1];
  const maxPos = Math.max(...positions);
  const minPos = Math.min(...positions);

  // まくり: 道中後方（7番手以下）から直線で一気に上位（3番手以内）に押し上げる
  const isMakuri = firstPos >= 7 && lastPos <= 3;
  
  // 垂れ（失速）: 道中先行（2番手以内）していたが最後に大きく失速（5番手以下）
  const isTare = firstPos <= 2 && lastPos >= 5;

  // 後方まま: ずっと10番手以降
  const isKouhou = maxPos >= 10 && minPos >= 10;

  return { isMakuri, isTare, isKouhou, firstPos, lastPos };
}

// 4. 走破タイムの簡易スピード指数（m/s基準の偏差的アプローチ）
export function parseTime(timeStr: string): number {
  if (!timeStr) return 0;
  const match = timeStr.match(/(?:(\d+):)?(\d{1,2}(?:\.\d+)?)/);
  if (!match) return 0;
  const mins = match[1] ? parseInt(match[1]) : 0;
  const secs = parseFloat(match[2]);
  return mins * 60 + secs;
}

export function calculateSpeedIndex(pastRace: PastRace): number {
  if (!pastRace.time || !pastRace.distance) return 0;
  
  const seconds = parseTime(pastRace.time);
  if (seconds <= 0) return 0;

  // 基本速度 (m/s)
  let speed = pastRace.distance / seconds;

  // 馬場状態による簡易補正（タイムを標準化するため、速い馬場での記録は割り引く）
  // ダート: 不良・重だと足抜きが良くタイムが速くなるためスピード値を割り引く
  // 芝: 不良・重だと時計がかかるためスピード値をかさ上げする
  if (pastRace.surface === 'ダート') {
    if (pastRace.condition === '稍重') speed *= 0.99;
    if (pastRace.condition === '重') speed *= 0.98;
    if (pastRace.condition === '不良') speed *= 0.97;
  } else if (pastRace.surface === '芝') {
    if (pastRace.condition === '稍重') speed *= 1.01;
    if (pastRace.condition === '重') speed *= 1.02;
    if (pastRace.condition === '不良') speed *= 1.03;
  }

  // 大井など砂が深いコースはタイムが遅くなるためかさ上げ
  if (pastRace.venue === '大井' || pastRace.venue === '水沢') {
    speed *= 1.015;
  }
  // 中央のダートは時計が出やすいため少し割り引く
  const jraTracks = ["東京", "中山", "京都", "阪神", "中京", "新潟", "福島", "小倉", "函館", "札幌"];
  if (jraTracks.includes(pastRace.venue) && pastRace.surface === 'ダート') {
    speed *= 0.985;
  }

  // 指数化（基準を100付近にするためのスカラー）
  // ダート1200mで1:13.0 (73s) => 約16.4 m/s。これを100くらいにしたい。
  const index = (speed - 15.0) * 50; 
  return Math.max(0, Math.round(index));
}

export function getBestSpeedIndex(horse: Horse): number {
  if (!horse.pastRaces || horse.pastRaces.length === 0) return 0;
  const indices = horse.pastRaces.map(calculateSpeedIndex).filter(i => i > 0);
  if (indices.length === 0) return 0;
  return Math.max(...indices);
}

// 5. 斤量差（Jockey Weight Diff）評価
export function analyzeJockeyWeightDiff(horse: Horse) {
  const currentWeight = horse.jockeyWeight || 0;
  if (currentWeight === 0 || !horse.pastRaces || horse.pastRaces.length === 0) return { diff: 0, isLightWinReturn: false };

  // 過去の勝利時の斤量を取得
  const winWeights = horse.pastRaces.filter(pr => pr.result === 1 && pr.jockeyWeight && pr.jockeyWeight > 0).map(pr => pr.jockeyWeight!);
  if (winWeights.length === 0) return { diff: 0, isLightWinReturn: false };

  // 勝利時の平均斤量
  const avgWinWeight = winWeights.reduce((a, b) => a + b, 0) / winWeights.length;
  
  // 今回の斤量が勝利時より3kg以上重い＝斤量泣き
  const diff = currentWeight - avgWinWeight;

  return { diff, isLightWinReturn: diff >= 3 };
}

// 6. オッズ・人気（Odds / Popularity）評価
export function analyzeOddsAndPopularity(horse: Horse) {
  const currentPop = horse.popularity || 0;
  if (currentPop === 0 || !horse.pastRaces || horse.pastRaces.length === 0) return { isOvervalued: false, isFlukeWin: false };

  const prevRace = horse.pastRaces[0];
  
  // 前走大穴（人気6以上、またはオッズ30倍以上）で好走（1〜3着）した馬が、今回上位人気（1〜3番人気）になっているか
  const wasLongshot = (prevRace.popularity && prevRace.popularity >= 6) || (prevRace.odds && prevRace.odds >= 30.0);
  const isOvervalued = wasLongshot && prevRace.result <= 3 && currentPop <= 3;
  
  return { isOvervalued, isFlukeWin: wasLongshot && prevRace.result === 1 };
}

// 7. 不利からの巻き返し（Incidents Bounce Back）評価
export function analyzeIncidents(horse: Horse, masterData: MasterData) {
  const hm = masterData.horses?.[horse.name];
  if (!hm || !hm.incidents || hm.incidents.length === 0) return { hasDisadvantage: false, note: "" };

  const pastRaces = horse.pastRaces || [];
  if (pastRaces.length === 0) return { hasDisadvantage: false, note: "" };

  // `learning.ts` で保存された前走の不利録を探す
  const recentIncident = hm.incidents.find(i => {
    // 日付が近い、もしくは最新のものを不利とする（簡易的に、前走で負けている＆不利タグがあるかを判定）
    const incidentNote = i.note || "";
    const isDisadvantage = incidentNote.includes("不利") || incidentNote.includes("大外ぶん回し") || incidentNote.includes("前が壁");
    return isDisadvantage && pastRaces[0].result >= 4; // 前走負けていることが条件
  });

  if (recentIncident) {
    return { hasDisadvantage: true, note: recentIncident.note };
  }

  return { hasDisadvantage: false, note: "" };
}

// 8. 地方競馬のクラス降級判定 (NAR Class Drop)
function getNarClassValue(className: string): number {
  if (!className) return 999;
  const match = className.match(/([A-C])([1-3])/);
  if (match) {
    const letter = match[1];
    const num = parseInt(match[2]);
    const base = letter === 'A' ? 10 : letter === 'B' ? 20 : 30;
    return base + num;
  }
  return 999;
}

export function analyzeNARClassDrop(currentClass?: string, pastClass?: string) {
  if (!currentClass || !pastClass) return { isClassDrop: false, diff: 0, prevClass: "", currClass: "" };
  const curVal = getNarClassValue(currentClass);
  const pastVal = getNarClassValue(pastClass);
  if (curVal === 999 || pastVal === 999) return { isClassDrop: false, diff: 0, prevClass: "", currClass: "" };
  
  if (curVal > pastVal) {
    // クラスの数値が大きい＝下のクラス（降級）
    return { isClassDrop: true, prevClass: pastClass, currClass: currentClass, diff: curVal - pastVal };
  }
  return { isClassDrop: false, diff: 0, prevClass: "", currClass: "" };
}

// 9. 叩き2戦目（休み明け2戦目）の巻き返し判定
export function analyzeRotationBounceBack(horse: Horse) {
  if (!horse.pastRaces || horse.pastRaces.length < 2) return { isBounceBack: false };

  const parseDate = (d: string) => new Date(d.replace(/\//g, '-')).getTime();
  const today = new Date().getTime();
  
  const race0Date = parseDate(horse.pastRaces[0].date);
  const race1Date = parseDate(horse.pastRaces[1].date);

  const daysBetween0And1 = (race0Date - race1Date) / (1000 * 60 * 60 * 24);
  
  // 2走前と前走の間隔が約80日（2ヶ月半）以上あいていた＝前走は休み明けだった
  if (daysBetween0And1 >= 80) {
    if (horse.pastRaces[0].result >= 4) { // 休み明けで負けている
      const daysSinceLastRace = (today - race0Date) / (1000 * 60 * 60 * 24);
      // 今回が中1週〜中5週（約10日〜45日）なら、叩き2戦目の一変を期待
      if (daysSinceLastRace >= 10 && daysSinceLastRace <= 45) {
        return { isBounceBack: true };
      }
    }
  }

  return { isBounceBack: false };
}

// 10. 調教タイム解析（上がり1Fのキレ）
export function analyzeTrainingTime(horse: Horse) {
  if (!horse.trainingTime) return { isExcellent: false, last1f: 0 };
  const parts = horse.trainingTime.split('-');
  if (parts.length > 0) {
    const lastPart = parts[parts.length - 1].trim();
    // "11.5" などの数値部分を抽出
    const match = lastPart.match(/(\d+\.\d+)/);
    if (match) {
      const last1f = parseFloat(match[1]);
      if (!isNaN(last1f) && last1f <= 11.4) {
        return { isExcellent: true, last1f };
      }
    }
  }
  return { isExcellent: false, last1f: 0 };
}
