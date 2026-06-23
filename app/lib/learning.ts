import { Race, MasterData, LearningPatch } from '../types';

export function analyzeRaceResultsAndLearn(
  races: Race[],
  currentMasterData: MasterData
): { newPatches: LearningPatch[], updatedMasterData: MasterData } {
  // 現在のMasterDataをディープコピー（副作用を防ぐため）
  const updatedMasterData: MasterData = JSON.parse(JSON.stringify(currentMasterData));
  if (!updatedMasterData.horses) updatedMasterData.horses = {};
  if (!updatedMasterData.jockeys) updatedMasterData.jockeys = {};

  const newPatches: LearningPatch[] = [];
  const today = new Date().toISOString().split('T')[0];

  // 競馬場・芝ダートごとに結果をグルーピング
  const trackGroups: Record<string, { 
    venue: string, 
    surface: string, 
    results: Race[], 
    hugePayouts: number, 
    top3WeightSum: number, 
    top3WeightCount: number 
  }> = {};

  // 今日の騎手の勝利数をカウントする用
  const todaysJockeyWins: Record<string, number> = {};

  for (const race of races) {
    if (!race.result || !race.result.result) continue; // 結果がまだないレースはスキップ

    const groupKey = `${race.trackName}_${race.surface}`;
    if (!trackGroups[groupKey]) {
      trackGroups[groupKey] = { venue: race.trackName, surface: race.surface, results: [], hugePayouts: 0, top3WeightSum: 0, top3WeightCount: 0 };
    }
    trackGroups[groupKey].results.push(race);

    // 上がり最速のタイムと馬名を記録
    let fastest3FTime = 999.9;
    let fastest3FHorse = "";
    
    // 万馬券（10000円以上）の発生をチェック
    let isHugePayout = false;
    if (race.result.refunds) {
      if (race.result.refunds.trifecta && race.result.refunds.trifecta.some(t => t.payout >= 10000)) isHugePayout = true;
      if (race.result.refunds.trio && race.result.refunds.trio.some(t => t.payout >= 10000)) isHugePayout = true;
    }
    if (isHugePayout) trackGroups[groupKey].hugePayouts++;

    // 全体ペースの計算 (lapTimesがある場合)
    let calculatedPace = "M"; // H, M, S
    if (race.result.lapTimes && race.result.lapTimes.length >= 6) {
      const first3f = race.result.lapTimes.slice(0, 3).reduce((a, b) => a + parseFloat(b), 0);
      const last3fNum = race.result.lapTimes.slice(-3).reduce((a, b) => a + parseFloat(b), 0);
      const diff = first3f - last3fNum;
      if (diff <= -1.0) calculatedPace = "H"; // 前半の方が速い
      else if (diff >= 1.0) calculatedPace = "S"; // 前半の方が遅い
    }

    // ==========================================
    // 1. MasterData Update (データベース自動蓄積)
    // ==========================================
    for (const res of race.result.result) {
      if (!updatedMasterData.horses[res.horseName]) {
        updatedMasterData.horses[res.horseName] = {
          name: res.horseName,
          results: [],
          incidents: [],
        };
      }
      const horseData = updatedMasterData.horses[res.horseName];
      if (!horseData.incidents) horseData.incidents = [];

      // A. 大差圧勝の記録
      if (res.rank === 1 && res.margin && (res.margin.includes('大差') || res.margin.includes('1.0'))) {
        horseData.results.push({
          date: today,
          rank: res.rank,
          venue: race.trackName,
          distance: race.distance,
          time: res.time,
          passing: res.passing,
          pace: calculatedPace,
          condition: race.condition
        });
        horseData.incidents.push({ date: today, venue: race.trackName, note: "大差圧勝" });
      } else {
        // 通常の記録
        horseData.results.push({
          date: today,
          rank: res.rank,
          venue: race.trackName,
          distance: race.distance,
          time: res.time,
          passing: res.passing,
          pace: calculatedPace,
          condition: race.condition
        });
      }

      // B. 競走中不利の記録
      if (race.result.incidents && race.result.incidents.includes(res.horseName)) {
        horseData.incidents.push({ date: today, venue: race.trackName, note: "レース中不利" });
      }

      // C. 上がり最速馬の特定
      if (res.last3f) {
        const timeNum = parseFloat(res.last3f);
        if (!isNaN(timeNum) && timeNum < fastest3FTime) {
          fastest3FTime = timeNum;
          fastest3FHorse = res.horseName;
        }
      }

      // 馬体重の集計（上位3頭）
      if (res.rank <= 3 && res.weight) {
        trackGroups[groupKey].top3WeightSum += res.weight;
        trackGroups[groupKey].top3WeightCount++;
      }

      // 騎手勝利数カウント
      if (res.jockey && res.rank === 1) {
        if (!todaysJockeyWins[res.jockey]) todaysJockeyWins[res.jockey] = 0;
        todaysJockeyWins[res.jockey] += 1;
      }
    }

    // D. 上がり最速で負けた馬の記録（隠れ穴馬）
    if (fastest3FHorse) {
      const targetHorse = race.result.result.find(r => r.horseName === fastest3FHorse);
      if (targetHorse && targetHorse.rank >= 4) { // 4着以下で負けている場合
        const hData = updatedMasterData.horses[fastest3FHorse];
        if (hData) hData.incidents!.push({ date: today, venue: race.trackName, note: "上がり最速で敗退" });
      }
    }
  }

  // ==========================================
  // 2. Dynamic Learning Patches Generation (馬場バイアス検知)
  // ==========================================
  for (const [groupKey, group] of Object.entries(trackGroups)) {
    if (group.results.length < 3) continue; // サンプル数3レース以上で判定

    let innerFrameTop3 = 0;
    let frontRunnerTop3 = 0;
    let totalTop3 = 0;

    for (const race of group.results) {
      const top3 = race.result!.result.filter(r => r.rank <= 3);
      for (const t of top3) {
        totalTop3++;
        const horse = race.horses.find(h => h.name === t.horseName);
        if (horse) {
          if (horse.frame <= 3) innerFrameTop3++;
          if (horse.style === '逃げ' || horse.style === '先行') frontRunnerTop3++;
        }
      }
    }

    // A. 枠順バイアス（イン有利）
    if (totalTop3 > 0 && innerFrameTop3 / totalTop3 >= 0.5) {
      newPatches.push({
        id: `auto-bias-inner-${groupKey}-${Date.now()}`,
        version: "1.0",
        date: today,
        description: `【自動検知】${group.venue} ${group.surface}: 超イン有利（内枠天国）バイアス`,
        track: group.venue,
        active: true,
        adjustments: [
          { field: "frame", operator: "<=", value: 3, scoreAdjust: 15 }
        ]
      });
    }

    // B. 脚質バイアス（前残り有利）
    if (totalTop3 > 0 && frontRunnerTop3 / totalTop3 >= 0.55) {
      newPatches.push({
        id: `auto-bias-front-${groupKey}-${Date.now()}`,
        version: "1.0",
        date: today,
        description: `【自動検知】${group.venue} ${group.surface}: 前残り（逃げ・先行有利）バイアス`,
        track: group.venue,
        active: true,
        adjustments: [
          { field: "style", operator: "==", value: "逃げ", scoreAdjust: 20 },
          { field: "style", operator: "==", value: "先行", scoreAdjust: 15 }
        ]
      });
    }

    // C. 波乱バイアス（万馬券多発による大穴ブースト）
    if (group.hugePayouts >= 2) {
      newPatches.push({
        id: `auto-bias-volatile-${groupKey}-${Date.now()}`,
        version: "1.0",
        date: today,
        description: `【自動検知】${group.venue} ${group.surface}: 波乱馬場（万馬券多発）による大穴ブースト`,
        track: group.venue,
        active: true,
        adjustments: [
          { field: "popularity", operator: "==", value: 1, scoreAdjust: -15 }, // 1番人気を減点
          { field: "popularity", operator: ">=", value: 6, scoreAdjust: 15 }   // 6番人気以降を加点
        ]
      });
    }

    // D. パワー馬場バイアス（上位馬の平均馬体重が重い）
    if (group.top3WeightCount > 0) {
      const avgWeight = group.top3WeightSum / group.top3WeightCount;
      if (avgWeight >= 490) {
        newPatches.push({
          id: `auto-bias-power-${groupKey}-${Date.now()}`,
          version: "1.0",
          date: today,
          description: `【自動検知】${group.venue} ${group.surface}: 深い砂（タフな馬場）による大型馬ブースト`,
          track: group.venue,
          active: true,
          adjustments: [
            { field: "weight", operator: ">=", value: 500, scoreAdjust: 15 }
          ]
        });
      }
    }
  }

  // E. 騎手のリアルタイム確変（今日の調子）パッチ
  for (const [jockeyName, wins] of Object.entries(todaysJockeyWins)) {
    if (wins >= 3) {
      newPatches.push({
        id: `auto-bias-jockey-${jockeyName}-${Date.now()}`,
        version: "1.0",
        date: today,
        description: `【自動検知】${jockeyName}騎手 固め打ち・確変状態（本日3勝以上）`,
        active: true,
        adjustments: [
          { field: "jockey", operator: "==", value: jockeyName, scoreAdjust: 20 }
        ]
      });
    }
  }

  return { newPatches, updatedMasterData };
}
