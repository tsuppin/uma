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
  const trackGroups: Record<string, { venue: string, surface: string, results: Race[] }> = {};

  // 今日の騎手の勝利数をカウントする用（簡易版）
  const todaysJockeyWins: Record<string, number> = {};

  for (const race of races) {
    if (!race.result || !race.result.result) continue; // 結果がまだないレースはスキップ

    const groupKey = `${race.trackName}_${race.surface}`;
    if (!trackGroups[groupKey]) {
      trackGroups[groupKey] = { venue: race.trackName, surface: race.surface, results: [] };
    }
    trackGroups[groupKey].results.push(race);

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
        });
        horseData.incidents.push({ date: today, venue: race.trackName, note: "大差圧勝" });
      }

      // B. 競走中不利の記録
      if (race.result.incidents && race.result.incidents.includes(res.horseName)) {
        horseData.incidents.push({ date: today, venue: race.trackName, note: "レース中不利" });
      }

      // 騎手勝利数カウント
      if (res.jockey && res.rank === 1) {
        if (!todaysJockeyWins[res.jockey]) todaysJockeyWins[res.jockey] = 0;
        todaysJockeyWins[res.jockey] += 1;
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
    // 3着以内の半数以上(50%以上)が1〜3枠の場合（通常期待値は約37.5%）
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
    // 3着以内の55%以上が逃げ・先行の場合
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
  }

  // C. 騎手のリアルタイム確変（今日の調子）パッチ
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
