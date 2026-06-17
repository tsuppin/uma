import { Race, UnifiedWaveLevel } from '../types';

export function calculateUnifiedWaveLevel(race: Race): UnifiedWaveLevel {
  let score = 50; // ベーススコア
  const factors: string[] = [];

  // =====================================
  // 1. 全国共通ベーススコア計算
  // =====================================
  
  // 1-A. レースフェーズ（前半/後半）
  if (race.raceNumber <= 6) {
    score -= 10;
    factors.push('前半レース(-10)');
  } else if (race.raceNumber >= 7) {
    score += 10;
    factors.push('後半レース(+10)');
  }

  // 1-B. 出走頭数
  if (race.headCount <= 10) {
    score -= 10;
    factors.push(`少頭数${race.headCount}頭(-10)`);
  } else if (race.headCount >= 15) {
    score += 15;
    factors.push(`多頭数${race.headCount}頭(+15)`);
  }

  // 1-C. クラス（暫定：レース名から推測）
  const rName = race.raceName || '';
  if (rName.includes('未勝利') || rName.includes('新馬') || rName.includes('選抜')) {
    score += 15;
    factors.push('未勝利/新馬/選抜戦(+15)');
  } else if (rName.includes('特別') || rName.match(/Jpn|G[1-3]/)) {
    score -= 10;
    factors.push('特別/重賞戦(-10)');
  }

  // 1-D. オッズ構造（1強判定）
  // 有効なオッズを持つ馬を抽出
  const horsesWithOdds = race.horses.filter(h => h.odds && h.odds > 0).sort((a, b) => a.odds! - b.odds!);
  if (horsesWithOdds.length >= 2) {
    const odds1 = horsesWithOdds[0].odds!;
    const odds2 = horsesWithOdds[1].odds!;
    if (odds1 < 2.0 && odds2 >= odds1 * 2.0) {
      score -= 20;
      factors.push('1番人気圧倒的1強(-20)');
    } else if (odds1 >= 4.0) {
      score += 15;
      factors.push('1番人気オッズ4倍以上・混戦(+15)');
    }
  }

  // =====================================
  // 2. 競馬場ローカル補正（固有バイアス）
  // =====================================
  const track = race.trackName || '';
  
  // -- 東京 --
  if (track.includes('東京')) {
    // ルメールやレーン騎乗時は堅実
    const hasElite = race.horses.some(h => h.jockey && (h.jockey.includes('ルメール') || h.jockey.includes('レーン')));
    if (hasElite) {
      score -= 15;
      factors.push('東京:ルメール/レーン出走(-15)');
    }
    // ダート戦で10番人気以下が出走しているか（穴台頭要因）
    const hasDirtDarkhorse = race.horses.some(h => h.popularity && h.popularity >= 10);
    if (race.surface === 'ダート' && hasDirtDarkhorse) {
      score += 20;
      factors.push('東京:ダート10番人気以下出走(+20)');
    }
    // 穴騎手
    const hasTannai = race.horses.some(h => h.jockey && h.jockey.includes('丹内') && h.popularity && h.popularity >= 3 && h.popularity <= 6);
    if (hasTannai) {
      score += 30;
      factors.push('東京:丹内祐次(中穴)出走(+30)');
    }
  }

  // -- 笠松 --
  if (track.includes('笠松')) {
    const hasWatanabe = race.horses.some(h => h.jockey && h.jockey.includes('渡邊竜'));
    if (hasWatanabe) {
      score -= 10;
      factors.push('笠松:渡邊竜也出走(-10)');
    }
    const hasMatsumoto = race.horses.some(h => h.jockey && h.jockey.includes('松本一') && h.popularity && h.popularity >= 5 && h.popularity <= 7);
    if (hasMatsumoto) {
      score += 15;
      factors.push('笠松:松本一(中穴)出走(+15)');
    }
  }

  // -- 阪神 --
  if (track.includes('阪神')) {
    // 内枠先行馬が多いと堅い
    const innerFrontRunners = race.horses.filter(h => h.frame <= 4 && (h.style === '逃げ' || h.style === '先行'));
    if (innerFrontRunners.length >= 2) {
      score -= 10;
      factors.push('阪神:内枠先行馬複数(-10)');
    }
  }

  // -- 園田 --
  if (track.includes('園田')) {
    // 4枠or6枠に4番人気以下の穴馬がいるか
    const hasMiddleDark = race.horses.some(h => (h.frame === 4 || h.frame === 6) && h.popularity && h.popularity >= 4);
    if (hasMiddleDark) {
      score += 15;
      factors.push('園田:4/6枠に中穴馬出走(+15)');
    }
  }

  // =====================================
  // プロ馬券師理論: 波乱度（荒れやすさ）5つの基準
  // =====================================
  
  const popSortedHorses = [...race.horses].sort((a, b) => {
    const popA = a.popularity || (a.odds ? a.odds : 99);
    const popB = b.popularity || (b.odds ? b.odds : 99);
    return popA - popB;
  });

  const topPops = popSortedHorses.slice(0, 3);
  const darkHorses = popSortedHorses.slice(4);

  // 1. 人気馬に不安要素があるか
  let hasPopAnxiety = false;
  let anxietyFactors = [];
  for (const popH of topPops) {
    if (popH.pastRaces && popH.pastRaces.length > 0) {
      const prev = popH.pastRaces[0];
      if (prev.passingPositions && prev.passingPositions.startsWith('1-1') && prev.result <= 3) {
        hasPopAnxiety = true;
        anxietyFactors.push('人気馬の前走逃げ');
      }
      if (popH.isAfterRest) {
        hasPopAnxiety = true;
        anxietyFactors.push('人気馬の休み明け');
      } else if (prev.date && race.date) {
        const prevDate = new Date(prev.date);
        const raceDate = new Date(race.date);
        if ((raceDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24) >= 180) {
          hasPopAnxiety = true;
          anxietyFactors.push('人気馬の半年以上休み明け');
        }
      }
      if ((prev.condition === '重' || prev.condition === '不良') && prev.result <= 3 && race.condition === '良') {
        hasPopAnxiety = true;
        anxietyFactors.push('人気馬の前走道悪好走→今回良馬場');
      }
    }
    if (popH.frame >= 7) {
      hasPopAnxiety = true;
      anxietyFactors.push('人気馬の大外枠');
    }
  }

  if (hasPopAnxiety) {
    score += 20;
    factors.push(`人気馬不安要素あり(+20: ${anxietyFactors[0]})`);
  }

  // 2. 実力差が縮まる「ハンデ戦」か
  if (rName.includes('ハンデ')) {
    score += 20;
    factors.push('ハンデ戦(+20)');
  } else {
    const kinryos = race.horses.map(h => h.jockeyWeight).filter(w => w && w > 0);
    if (kinryos.length > 0) {
      const maxK = Math.max(...kinryos);
      const minK = Math.min(...kinryos);
      if (maxK - minK >= 4.0) {
        score += 15;
        factors.push('斤量差4kg以上(実質ハンデ戦相当)(+15)');
      }
    }
  }

  // 3. 不確定要素が多い「牝馬限定の重賞」や「2歳戦」か
  if (rName.includes('牝') && (rName.includes('重賞') || rName.match(/G[1-3]/) || rName.match(/Jpn/))) {
    score += 20;
    factors.push('牝馬限定重賞(+20)');
  }
  const is2yo = race.horses.length > 0 && race.horses.every(h => h.age === 2) || rName.includes('2歳');
  if (is2yo) {
    score += 20;
    factors.push('2歳戦(+20)');
  }

  // 4. 激走条件を持つ「穴馬」が複数いるか
  let darkTriggerCount = 0;
  for (const darkH of darkHorses) {
    let isTrigger = false;
    if (darkH.gender === 'セン') isTrigger = true;
    if (darkH.prevJockey && darkH.jockey !== darkH.prevJockey) isTrigger = true;
    if (darkH.useBlinkers) isTrigger = true;
    if (darkH.pastRaces && darkH.pastRaces.length > 0 && darkH.pastRaces[0].distance) {
      if (darkH.pastRaces[0].distance > race.distance) isTrigger = true;
    }
    if (isTrigger) darkTriggerCount++;
  }
  
  if (darkTriggerCount >= 2) {
    score += 25;
    factors.push(`激走条件を持つ穴馬複数(${darkTriggerCount}頭)(+25)`);
  }

  // 5. 荒れやすい季節やコース設定（夏競馬など）か
  const raceMonthStr = race.date ? race.date.split('-')[1] : null;
  const rMonth = raceMonthStr ? parseInt(raceMonthStr, 10) : 0;
  if (race.season === 'summer' || rMonth === 7 || rMonth === 8) {
    score += 20;
    factors.push('夏競馬(波乱の宝庫)(+20)');
  }

  // =====================================
  // 3. スコアクリッピングとレベル判定
  // =====================================
  score = Math.max(0, Math.min(100, score));

  let level: 1 | 2 | 3 | 4 | 5 = 3;
  let category: "鉄板" | "堅実" | "中波乱" | "波乱" | "大波乱" = "中波乱";

  if (score <= 20) {
    level = 1;
    category = "鉄板";
  } else if (score <= 40) {
    level = 2;
    category = "堅実";
  } else if (score <= 60) {
    level = 3;
    category = "中波乱";
  } else if (score <= 80) {
    level = 4;
    category = "波乱";
  } else {
    level = 5;
    category = "大波乱";
  }

  return {
    score,
    level,
    category,
    factors
  };
}
