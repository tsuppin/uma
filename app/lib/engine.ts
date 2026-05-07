import { Horse, Prediction, Race, LearningPatch, Formation, MasterData } from '../types';

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
export function calculateTsuchiyaScore(
  horse: Horse, 
  race: Race, 
  learningPatches: LearningPatch[],
  masterData: MasterData
): Prediction {
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
  // 【新設】データベース（MasterData）連携
  // ==========================================
  const hm = masterData.horses?.[horse.name];
  const jm = masterData.jockeys?.[horse.jockey];

  if (hm) {
    // コース実績加点
    const courseWins = hm.results.filter(r => r.venue === race.venue && r.rank === 1).length;
    if (courseWins > 0) {
      potential += 15;
      tags.push(`コース実績馬(${courseWins}勝)`);
    }
    // 距離実績
    if (hm.results.some(r => r.distance === race.distance && r.rank <= 3)) {
      potential += 10;
      tags.push('距離適性あり');
    }
  }

  if (jm && jm.venueStats[race.venue]) {
    const vs = jm.venueStats[race.venue];
    if (vs.total >= 3) {
      const winRate = vs.wins / vs.total;
      const top3Rate = vs.top3 / vs.total;
      if (winRate > 0.20) { potential += 20; tags.push('会場勝率エリート'); }
      else if (top3Rate > 0.40) { potential += 15; tags.push('会場安定勢'); }
    }
  }

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
    if (460 <= weight && weight <= 490) { potential += 15; tags.push('PMR最適（短距離）'); }
    else if (weight > 510) { potential -= 10; }
    else if (weight < 440) { potential -= 15; }
  } else if (dist <= 2000) {
    if (480 <= weight && weight <= 520) { potential += 20; tags.push('PMR黄金帯域'); }
    else if (weight > 520) { potential += 10; }
    else if (weight < 450) { potential += 5; }
  } else {
    if (460 <= weight && weight <= 480) { potential += 15; tags.push('PMR最適（長距離）'); }
    else if (weight >= 530) { potential += 10; }
  }

  // ==========================================
  // 馬体重増減エントロピー解析
  // ==========================================
  if (weightChange >= 10) { potential += 15; tags.push('出力拡張Turbo'); }
  else if (weightChange <= -10) { potential += 5; tags.push('冷却効率UP'); }
  else if (-4 <= weightChange && weightChange <= 4) { potential += 5; tags.push('質量安定'); }

  // ==========================================
  // GIS幾何学適性 - 枠順バイアス
  // ==========================================
  if (frame <= 3) { potential += 15; tags.push('内枠最短経路'); }
  else if (frame >= 10) { potential -= 5; }

  // ==========================================
  // 競馬場別ロジック
  // ==========================================
  if (trackName === '笠松') {
    if (horse.transferFrom === 'JRA' && (horse.jraEarnings || 0) === 0) { potential -= 25; tags.push('JRA未収得賞金の罠'); }
    if (weight >= 510) { potential += 25; tags.push('絶対パワー'); }
    else if (weight <= 430) { potential -= 35; tags.push('足切り'); }
    if (dist === 800 && (condition === '重' || condition === '不良')) {
      if (frame >= 7) { potential += 30; tags.push('外枠絶対優位'); }
      if (frame === 1) { potential -= 40; tags.push('1枠死滅'); }
    }
    if (bloodline.includes('Roberto')) { potential += 15; tags.push('Roberto血統'); }
    if (jockey === '渡邊竜也') {
      if (popularity === 1 && headCount >= 10) { potential -= 30; }
      else if (5 <= frame && frame <= 8) { potential += 25; tags.push('渡邊中外枠エッジ'); }
    }
  } else if (trackName === '大井') {
    if (bloodline.includes('キングマンボ')) { potential += 20; tags.push('ベアリング効果抗力'); }
    if (condition === '良' && (bloodline.includes('イスラボニータ') || bloodline.includes('スクリーンヒーロー'))) {
      potential += 25; tags.push('良馬場芝適性');
    } else if ((condition === '重' || condition === '不良') && (bloodline.includes('ゴールドアリュール') || bloodline.includes('ドレフォン') || bloodline.includes('クロフネ'))) {
      potential += 30; tags.push('重馬場パワー型');
    }
    if (dist === 1600 && bloodline.includes('ヘニーヒューズ')) { potential += 45; tags.push('大井1600特注ヘニーヒューズ'); }
    const goldenCombos: Record<string, number> = { '佐々木洋一 × 矢野貴之': 40, '林正人 × 町田直希': 40, '荒山勝徳 × 笹川翼': 30 };
    if (goldenCombos[`${horse.trainer} × ${jockey}`]) { potential += goldenCombos[`${horse.trainer} × ${jockey}`]; tags.push('黄金コンビ'); }
    if (horse.prizeCloseFlag) { potential -= 60; tags.push('ヤラズ判定'); }
  } else if (trackName === '門別') {
    const powerSires = ['パイロ', 'ホッコータルマエ', 'ルヴァンスレーヴ'];
    if (powerSires.some(s => bloodline.includes(s))) { potential += 35; tags.push('門別パワー血統'); }
    if (weightChange >= 5) { potential += 30; tags.push('成長曲線EVA'); }
  } else if (trackName === '名古屋' || trackName === '弥富') {
    const topJockeys = ['岡部誠', '今井貴大', '大畑雅章', '加藤聡一', '丸野勝虎'];
    if (topJockeys.includes(jockey)) { potential += 15; tags.push('鞍上強化'); }
  }

  // 動的学習パッチの適用
  for (const patch of learningPatches) {
    if (!patch.active) continue;
    if (patch.track && patch.track !== trackName) continue;
    if (patch.condition && patch.condition !== condition) continue;
    for (const adj of patch.adjustments) {
      const val = (horse as any)[adj.field];
      let applies = false;
      if (adj.operator === '>=' && val >= adj.value) applies = true;
      else if (adj.operator === '<=' && val <= adj.value) applies = true;
      else if (adj.operator === '==' && val === adj.value) applies = true;
      if (applies) { potential += adj.scoreAdjust; tags.push(`学習パッチ(${patch.version})`); }
    }
  }

  const odds = horse.odds || 10;
  const darkness = (potential / 100) * Math.pow(odds, 1.1);

  return {
    horseId: horse.id, horseName: horse.name, horseNumber: horse.number,
    potential: Math.round(potential * 10) / 10,
    darkness: Math.round(darkness * 100) / 100,
    evIndex: potential,
    aptitudeTags: tags,
    rank: 0,
  };
}

// ==========================================
// フォーメーション生成・その他 (既存)
// ==========================================
export function generateFormation(predictions: Prediction[], raceType: Formation['type'] = 'trifecta'): Formation {
  const sortedByPotential = [...predictions].sort((a, b) => b.potential - a.potential);
  const top3 = sortedByPotential.slice(0, 3);
  const axisNos = top3.map(p => p.horseNumber);
  const others = predictions.filter(p => !axisNos.includes(p.horseNumber));
  const sortedByDarkness = [...others].sort((a, b) => b.darkness - a.darkness);
  const dark4 = sortedByDarkness.slice(0, 4);
  const darkNos = dark4.map(p => p.horseNumber);

  const col1 = axisNos;
  const col2 = axisNos;
  const col3 = [...new Set([...axisNos, ...darkNos])].sort((a, b) => a - b);

  let tickets: number[][] = [];
  if (raceType === 'trifecta_exact') {
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
    const ticketSet = new Set<string>();
    combinations(axisNos, 3).forEach(c => ticketSet.add(c.sort((a,b)=>a-b).join('-')));
    combinations(axisNos, 2).forEach(p => darkNos.forEach(d => ticketSet.add([...p, d].sort((a,b)=>a-b).join('-'))));
    tickets = Array.from(ticketSet).map(t => t.split('-').map(Number));
  }

  return { type: raceType, col1, col2, col3, tickets, totalPoints: tickets.length, axisHorses: axisNos, darkHorses: darkNos };
}

export function generateWin5Picks(races: Race[], allPredictions: Record<string, Prediction[]>): { raceId: string; picks: number[]; }[] {
  return races.map(race => ({ raceId: race.id, picks: (allPredictions[race.id] || []).sort((a, b) => b.evIndex - a.evIndex).slice(0, 3).map(p => p.horseNumber) }));
}

export function generateLearningPatch(race: Race, predictions: Prediction[], actualResult: { rank: number; horseNumber: number; }[], existingPatches: LearningPatch[]): LearningPatch | null {
  const winner = actualResult.find(r => r.rank === 1);
  if (!winner) return null;
  const winnerHorse = race.horses.find(h => h.number === winner.horseNumber);
  if (!winnerHorse) return null;
  const axisRank = predictions.findIndex(p => p.horseNumber === winner.horseNumber) + 1;
  if (axisRank > 3) {
    const adjustments = [];
    if (winnerHorse.weight >= 480 && winnerHorse.weight <= 520) adjustments.push({ field: 'weight', operator: '>=', value: 480, scoreAdjust: 10 });
    if (winnerHorse.weightChange >= 10) adjustments.push({ field: 'weightChange', operator: '>=', value: 10, scoreAdjust: 15 });
    if (adjustments.length === 0) return null;
    return { id: `patch_${Date.now()}`, version: `v${existingPatches.length + 1}.1`, date: new Date().toISOString(), description: `${race.venue} - 勝ち馬(${winnerHorse.name})の特性学習`, track: race.trackName, condition: race.condition, adjustments, active: true };
  }
  return null;
}

function combinations<T>(arr: T[], size: number): T[][] {
  if (size === 0) return [[]];
  if (arr.length < size) return [];
  const [first, ...rest] = arr;
  return [...combinations(rest, size - 1).map(combo => [first, ...combo]), ...combinations(rest, size)];
}

export function sortPredictions(predictions: Prediction[]): Prediction[] {
  return [...predictions].sort((a, b) => b.potential - a.potential || b.darkness - a.darkness || a.horseNumber - b.horseNumber).map((p, i) => ({ ...p, rank: i + 1 }));
}
