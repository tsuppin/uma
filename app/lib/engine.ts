// ==========================================
// 土屋プロトコル - 物理演算予測エンジン
// Notebook: 競馬予想_20260430052742.ipynb を移植
// ==========================================

import { Horse, Prediction, Race, LearningPatch, Formation } from '../types';

// ==========================================
// Yatomi Physics Logic (弥富・名古屋競馬)
// ==========================================
export function calculateYatomiPhysics(
  horse: Horse,
  pastRace: Horse['pastRaces'][0] | undefined,
  windSpeed: number,
  isHeadwind: boolean,
  trackCondition: string,
  isInBiasActive: boolean
): number {
  if (!pastRace) return 0;
  
  let adjTime = pastRace.time ? parseFloat(pastRace.time.replace(':', '').replace('.', '')) : 0;

  // 1. WIND_VECTOR 補正
  if (isHeadwind && windSpeed >= 4.0) {
    if (pastRace.corner4Position <= 4) {
      adjTime += 0.3; // 先行馬：空気抵抗増大
    } else {
      adjTime -= 0.2; // スリップストリーム効果
    }
  }

  // 2. TRACK_WIDTH_LOSS 補正
  const nPosition = pastRace.cornerOuterCount || 1;
  if (nPosition > 1) {
    adjTime -= (nPosition - 1) * 0.15;
  }

  // 3. POWER_STRIDE_DYNAMICS 補正
  const weight = horse.weight;
  if (trackCondition === '良') {
    if (weight < 480) {
      adjTime += 0.2;
    } else if (weight >= 500 && pastRace.otherVenueExp) {
      adjTime -= 0.3;
    }
  }

  // 4. DYNAMIC_BIAS_DETECTOR
  if (isInBiasActive) {
    if (horse.frame <= 3 && pastRace.cornerOuterCount === 1) {
      adjTime -= 0.4;
    }
  }

  const classBaseTime = pastRace.classBaseTime || adjTime + 0.5;
  return adjTime <= classBaseTime ? 1 : 0; // 物理的狙い馬タグ
}

// ==========================================
// Tsuchiya Protocol - スコア計算
// ==========================================
export function calculateTsuchiyaScore(horse: Horse, race: Race, learningPatches: LearningPatch[]): Prediction {
  let potential = 100.0;
  const bloodline = horse.bloodline || '';
  const jockey = horse.jockey || '';
  const trackName = race.trackName;
  const dist = race.distance;
  const condition = race.condition;
  const weight = horse.weight;
  const weightChange = horse.weightChange;
  const frame = horse.frame;
  const number = horse.number;
  const gender = horse.gender;
  const kinryo = horse.jockeyWeight || 55;
  const popularity = horse.popularity || 99;
  const headCount = race.headCount || 10;
  const tags: string[] = [];

  // ==========================================
  // 【全場共通】斤量体重比 - 物理的限界デッドライン
  // ==========================================
  const weightRatio = (kinryo / weight) * 100;
  if (gender === '牝' && weightRatio > 12.5) {
    potential -= 40;
    tags.push('斤量限界超過');
  } else if ((gender === '牡' || gender === 'セン') && weightRatio > 12.6) {
    potential -= 40;
    tags.push('斤量限界超過');
  }

  // ==========================================
  // PMR (Physical Mass Ratio) 解析
  // ==========================================
  if (dist <= 1400) {
    // スプリント・マイル
    if (460 <= weight && weight <= 490) {
      potential += 15;
      tags.push('PMR最適（短距離）');
    } else if (weight > 510) {
      potential -= 10;
    } else if (weight < 440) {
      potential -= 15;
    }
  } else if (dist <= 2000) {
    // 中距離
    if (480 <= weight && weight <= 520) {
      potential += 20;
      tags.push('PMR黄金帯域');
    } else if (weight > 520) {
      potential += 10;
    } else if (weight < 450) {
      potential += 5;
    }
  } else {
    // 長距離
    if (460 <= weight && weight <= 480) {
      potential += 15;
      tags.push('PMR最適（長距離）');
    } else if (weight >= 530) {
      potential += 10;
    }
  }

  // ==========================================
  // 馬体重増減エントロピー解析
  // ==========================================
  if (weightChange >= 10) {
    potential += 15;
    tags.push('出力拡張Turbo');
  } else if (weightChange <= -10) {
    potential += 5;
    tags.push('冷却効率UP');
  } else if (-4 <= weightChange && weightChange <= 4) {
    potential += 5;
    tags.push('質量安定');
  }

  // ==========================================
  // GIS幾何学適性 - 枠順バイアス
  // ==========================================
  if (frame <= 3) {
    potential += 15;
    tags.push('内枠最短経路');
  } else if (frame >= 10) {
    potential -= 5;
  }

  // ==========================================
  // 【笠松競馬】
  // ==========================================
  if (trackName === '笠松') {
    if (horse.transferFrom === 'JRA' && (horse.jraEarnings || 0) === 0) {
      potential -= 25;
      tags.push('JRA未収得賞金の罠');
    }
    if (weight >= 510) { potential += 25; tags.push('絶対パワー'); }
    else if (weight <= 430) { potential -= 35; tags.push('足切り'); }

    if (dist === 800 && (condition === '重' || condition === '不良')) {
      if (frame >= 7) { potential += 30; tags.push('外枠絶対優位'); }
      if (frame === 1) { potential -= 40; tags.push('1枠死滅'); }
    }

    if (bloodline.includes('Roberto')) { potential += 15; tags.push('Roberto血統'); }
    if (bloodline.includes('Northern Dancer')) { potential -= 15; }

    if (jockey === '渡邊竜也') {
      if (popularity === 1 && headCount >= 10) { potential -= 30; }
      else if (5 <= frame && frame <= 8) { potential += 25; tags.push('渡邊中外枠エッジ'); }
    }
  }

  // ==========================================
  // 【大井競馬】
  // ==========================================
  else if (trackName === '大井') {
    if (bloodline.includes('キングマンボ')) { potential += 20; tags.push('ベアリング効果抗力'); }
    if (condition === '良') {
      if (bloodline.includes('イスラボニータ') || bloodline.includes('スクリーンヒーロー')) {
        potential += 25; tags.push('良馬場芝適性');
      }
    } else if (condition === '重' || condition === '不良') {
      if (bloodline.includes('ゴールドアリュール') || bloodline.includes('ドレフォン') || bloodline.includes('クロフネ')) {
        potential += 30; tags.push('重馬場パワー型');
      }
    }

    if (condition === '重' || condition === '不良') {
      if (frame === 1) { potential -= 30; tags.push('不良馬場の罠'); }
      else if (frame >= 4) { potential += 20; }
    }

    if (dist === 1600 && bloodline.includes('ヘニーヒューズ')) {
      potential += 45; tags.push('大井1600特注ヘニーヒューズ');
    }
    if (dist === 1650) {
      if (frame === 3) { potential += 35; tags.push('1650特注3枠'); }
      else if (frame === 8) { potential += 30; }
    }

    const combo = `${horse.trainer} × ${jockey}`;
    const goldenCombos: Record<string, number> = {
      '佐々木洋一 × 矢野貴之': 40, '林正人 × 町田直希': 40,
      '荒山勝徳 × 笹川翼': 30
    };
    if (goldenCombos[combo]) {
      potential += goldenCombos[combo];
      tags.push(`黄金コンビ(${goldenCombos[combo]})`);
    }

    if (horse.prizeCloseFlag) { potential -= 60; tags.push('ヤラズ判定'); }
    if (horse.rotation === '叩き2走目') { potential += 30; tags.push('叩き2走目'); }

    // 大井距離別1番人気
    if (popularity === 1) {
      if (dist === 1200) { potential += 20; }
      if (dist === 2000) { potential += 40; }
    }
    if (jockey === '矢野貴之' && (dist === 1200 || dist === 1400)) { potential += 15; }
    if (jockey === '笹川翼' && dist >= 1600) { potential += 15; }
  }

  // ==========================================
  // 【門別競馬】
  // ==========================================
  else if (trackName === '門別') {
    if (headCount === 16) { potential -= 20; tags.push('16頭フルゲートリスク'); }
    if (condition === '不良') { potential -= 10; }

    if (dist === 1000 && frame === 4) { potential += 25; tags.push('門別1000m4枠支配'); }
    if (dist === 1100 && frame <= 3) { potential += 20; }

    const weightDiff = weightChange;
    if (weightDiff >= 5) { potential += 30; tags.push('成長曲線EVA'); }
    else if (weightDiff <= -10) { potential -= 20; }

    const powerSires = ['パイロ', 'ホッコータルマエ', 'ルヴァンスレーヴ'];
    const speedSires = ['シニスターミニスター', 'ヘニーヒューズ', 'アジアエクスプレス'];
    const newSires = ['ナダル', 'マインドユアビスケッツ'];

    if (powerSires.some(s => bloodline.includes(s))) { potential += 35; tags.push('門別パワー血統'); }
    if (speedSires.some(s => bloodline.includes(s))) { potential += 25; tags.push('門別スピード均衡'); }
    if (newSires.some(s => bloodline.includes(s))) { potential += 20; tags.push('新興勢力'); }

    if (bloodline.includes('ダノンレジェンド')) {
      if (frame <= 2 && headCount >= 10) { potential -= 30; tags.push('内枠揉まれリスク'); }
      else { potential += 25; }
    }
    if (bloodline.includes('モーニン')) { potential -= 15; tags.push('モーニン割引'); }
    if (['ロードカナロア', 'ドゥラメンテ', 'キズナ'].some(s => bloodline.includes(s))) {
      potential -= 20; tags.push('芝寄り過剰人気');
    }

    if (horse.prevInnerLoadExp && frame >= 5) {
      potential += 35; tags.push('前走内負荷跳ね返り');
    }
  }

  // ==========================================
  // 【名古屋/弥富競馬】
  // ==========================================
  else if (trackName === '名古屋' || trackName === '弥富') {
    const windSpeed = race.windSpeed || 0;
    if (windSpeed >= 4) {
      if (weight >= 500) { potential += 10; }
      else if (weight < 460) { potential -= 10; tags.push('空気抵抗リスク'); }
    }

    const topJockeys = ['岡部誠', '今井貴大', '大畑雅章', '加藤聡一', '丸野勝虎'];
    const isYariTrainer = horse.trainer === '角田輝也' && horse.ownerType === '一口馬主' && horse.isTransferFirstRace;
    const isYazu = horse.isAuction && horse.isAfterRest && horse.isTransferFirstRace;

    if (isYariTrainer) { potential += 25; tags.push('角田厩舎一口ヤリ'); }
    if (isYazu) { potential -= 30; tags.push('ヤズ判定'); }

    if (jockey === '加藤聡一' && popularity === 1) {
      potential += 15;
      if (frame <= 3) { potential += 5; }
      tags.push('加藤聡一銀行');
    }
    if (jockey === '岡部誠' && frame >= 7 && popularity === 1) {
      potential += 10; tags.push('岡部外枠王道');
    }
    if (jockey === '宮下瞳') { potential -= 5; }

    const prevTopJockeys = [...topJockeys];
    const isPrevTop = prevTopJockeys.includes(horse.prevJockey || '');
    const isCurrTop = topJockeys.includes(jockey);
    if (isPrevTop && !isCurrTop) { potential -= 15; tags.push('鞍上弱化'); }
    else if (!isPrevTop && isCurrTop) { potential += 15; tags.push('鞍上強化'); }

    if (horse.isHelmetChange) { potential += 5; tags.push('ヘルメット黒変更'); }
  }

  // ==========================================
  // 汎用スコアリング (全場共通ベース・補正)
  // ==========================================
  
  // 前走成績の反映 (データ不足時のスコア多様化)
  if (horse.pastRaces && horse.pastRaces.length > 0) {
    const pr1 = horse.pastRaces[0];
    if (pr1 && pr1.result > 0) {
      if (pr1.result === 1) {
        potential += 15;
        tags.push('前走1着ボーナス');
      } else if (pr1.result <= 3) {
        potential += 8;
        tags.push('前走好走');
      } else if (pr1.result >= 10) {
        potential -= 10;
      }
    }
    
    // 前々走
    const pr2 = horse.pastRaces[1];
    if (pr2 && pr2.result === 1) {
      potential += 10;
    }
  }

  // JRA/その他競馬場用の騎手スコアリング
  if (!['笠松', '大井', '門別', '名古屋', '弥富'].includes(trackName)) {
    const jockeyMap: Record<string, number> = {
      'D.レー': 25, 'C.ルメール': 25, '川田将': 25,
      '武豊': 20, '坂井瑠': 20, '横山武史': 20,
      '松山弘': 15, '岩田望': 15, '北村友': 10, '西村淳': 10
    };
    const jockeyBonus = jockeyMap[jockey] || 0;
    if (jockeyBonus > 0) {
      potential += jockeyBonus;
      tags.push(`騎手加点(${jockeyBonus})`);
    }
  }

  // ==========================================
  // WIN5特化ロジック
  // ==========================================
  if (race.isWin5) {
    if (popularity === 1 && potential < 100) {
      potential -= 60;
      tags.push('WIN5：1番人気パージ');
    }
  }

  // ==========================================
  // 動的学習パッチの適用
  // ==========================================
  for (const patch of learningPatches) {
    if (!patch.active) continue;
    if (patch.track && patch.track !== trackName) continue;
    if (patch.condition && patch.condition !== condition) continue;

    for (const adj of patch.adjustments) {
      const horseValue = (horse as unknown as Record<string, unknown>)[adj.field];
      let applies = false;
      const val = typeof horseValue === 'number' ? horseValue : 0;
      
      if (adj.operator === '>=' && val >= adj.value) applies = true;
      else if (adj.operator === '<=' && val <= adj.value) applies = true;
      else if (adj.operator === '==' && val === adj.value) applies = true;
      else if (adj.operator === '>' && val > adj.value) applies = true;
      else if (adj.operator === '<' && val < adj.value) applies = true;
      
      if (applies) {
        potential += adj.scoreAdjust;
        tags.push(`学習パッチ(${patch.version})`);
      }
    }
  }

  // Darkness（期待値の闇）= (Potential / 100) * (オッズ ^ 1.1)
  const odds = horse.odds || 10;
  const darkness = (potential / 100) * Math.pow(odds, 1.1);

  return {
    horseId: horse.id,
    horseName: horse.name,
    horseNumber: horse.number,
    potential: Math.round(potential * 10) / 10,
    darkness: Math.round(darkness * 100) / 100,
    evIndex: potential,
    aptitudeTags: tags,
    rank: 0,
  };
}

// ==========================================
// フォーメーション生成 (3-3-7 / 13点)
// ==========================================
export function generateFormation(predictions: Prediction[], raceType: Formation['type'] = 'trifecta'): Formation {
  // Potential上位3頭を軸に
  const sortedByPotential = [...predictions].sort((a, b) => b.potential - a.potential);
  const top3 = sortedByPotential.slice(0, 3);
  const axisNos = top3.map(p => p.horseNumber);

  // 軸以外でDarkness上位4頭
  const others = predictions.filter(p => !axisNos.includes(p.horseNumber));
  const sortedByDarkness = [...others].sort((a, b) => b.darkness - a.darkness);
  const dark4 = sortedByDarkness.slice(0, 4);
  const darkNos = dark4.map(p => p.horseNumber);

  const col1 = axisNos;
  const col2 = axisNos;
  const col3 = [...new Set([...axisNos, ...darkNos])].sort((a, b) => a - b);

  let tickets: number[][] = [];

  if (raceType === 'trifecta_exact') {
    // 三連単フォーメーション (3-3-7) 30点
    for (const first of col1) {
      for (const second of col2) {
        if (first === second) continue;
        for (const third of col3) {
          if (first === third || second === third) continue;
          tickets.push([first, second, third]);
        }
      }
    }
  } else {
    // 三連複13点生成 (デフォルト)
    const ticketSet = new Set<string>();
    
    // 軸3頭の組み合わせ (1点)
    const axisCombos = combinations(axisNos, 3);
    for (const combo of axisCombos) {
      ticketSet.add(combo.sort((a, b) => a - b).join('-'));
    }

    // 軸2頭 + ヒモ4頭 (12点)
    const axisPairs = combinations(axisNos, 2);
    for (const pair of axisPairs) {
      for (const dark of darkNos) {
        const ticket = [...pair, dark].sort((a, b) => a - b);
        ticketSet.add(ticket.join('-'));
      }
    }

    tickets = Array.from(ticketSet).map(t => t.split('-').map(Number));
  }

  return {
    type: raceType,
    col1,
    col2,
    col3,
    tickets,
    totalPoints: tickets.length,
    axisHorses: axisNos,
    darkHorses: darkNos,
  };
}

// ==========================================
// WIN5フォーメーション
// ==========================================
export function generateWin5Picks(races: Race[], allPredictions: Record<string, Prediction[]>): { raceId: string; picks: number[]; }[] {
  return races.map(race => {
    const preds = allPredictions[race.id] || [];
    const sorted = [...preds].sort((a, b) => b.evIndex - a.evIndex);
    const top3 = sorted.slice(0, 3).map(p => p.horseNumber);
    return { raceId: race.id, picks: top3 };
  });
}

// ==========================================
// 自学習パッチ生成
// ==========================================
export function generateLearningPatch(
  race: Race,
  predictions: Prediction[],
  actualResult: { rank: number; horseNumber: number; }[],
  existingPatches: LearningPatch[]
): LearningPatch | null {
  const winner = actualResult.find(r => r.rank === 1);
  if (!winner) return null;

  const winnerPred = predictions.find(p => p.horseNumber === winner.horseNumber);
  const winnerHorse = race.horses.find(h => h.number === winner.horseNumber);
  if (!winnerPred || !winnerHorse) return null;

  const axisRank = predictions.findIndex(p => p.horseNumber === winner.horseNumber) + 1;
  
  // 予測が外れた場合にパッチを生成
  if (axisRank > 3) {
    const adjustments = [];

    // 馬体重が特定範囲にある場合の補正
    if (winnerHorse.weight >= 480 && winnerHorse.weight <= 520) {
      adjustments.push({
        field: 'weight',
        operator: '>=',
        value: 480,
        scoreAdjust: 10,
      });
    }

    if (winnerHorse.weightChange >= 10) {
      adjustments.push({
        field: 'weightChange',
        operator: '>=',
        value: 10,
        scoreAdjust: 15,
      });
    }

    if (adjustments.length === 0) return null;

    const version = `v${existingPatches.length + 1}.${Math.floor(Math.random() * 9 + 1)}`;
    
    return {
      id: `patch_${Date.now()}`,
      version,
      date: new Date().toISOString(),
      description: `${race.venue} ${race.raceName} - 勝ち馬(${winnerHorse.name})の特性学習`,
      track: race.trackName,
      condition: race.condition,
      adjustments,
      active: true,
    };
  }

  return null;
}

// ==========================================
// ユーティリティ
// ==========================================
function combinations<T>(arr: T[], size: number): T[][] {
  if (size === 0) return [[]];
  if (arr.length < size) return [];
  const [first, ...rest] = arr;
  const withFirst = combinations(rest, size - 1).map(combo => [first, ...combo]);
  const withoutFirst = combinations(rest, size);
  return [...withFirst, ...withoutFirst];
}

export function sortPredictions(predictions: Prediction[]): Prediction[] {
  return [...predictions].sort((a, b) => {
    // 1. Potential（EVIndex）で降順
    if (Math.abs(b.potential - a.potential) > 0.01) {
      return b.potential - a.potential;
    }
    // 2. 同スコアなら期待値の闇(Darkness)で降順
    if (Math.abs(b.darkness - a.darkness) > 0.01) {
      return b.darkness - a.darkness;
    }
    // 3. それでも同値なら馬番でバラけさせる（中央枠有利などの微細なタイブレーク）
    const aTie = Math.abs(a.horseNumber - 5); // 5番に近いほど優先など
    const bTie = Math.abs(b.horseNumber - 5);
    if (aTie !== bTie) return aTie - bTie;
    
    return a.horseNumber - b.horseNumber;
  }).map((p, i) => ({ ...p, rank: i + 1 }));
}
