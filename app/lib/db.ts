import { AppState, Race, Horse, RaceResult, MasterData, HorseMaster, JockeyMaster } from "../types";

// ==========================================
// データベース（MasterData）管理ロジック
// ==========================================

export function updateMasterDataWithRace(masterData: MasterData, race: Race): MasterData {
  const newMasterData = { ...masterData };
  if (!newMasterData.horses) newMasterData.horses = {};
  if (!newMasterData.jockeys) newMasterData.jockeys = {};

  race.horses.forEach(h => {
    // 1. 馬データの更新（基本情報）
    if (!newMasterData.horses[h.name]) {
      newMasterData.horses[h.name] = { name: h.name, results: [] };
    }
    const hm = newMasterData.horses[h.name];
    hm.lastWeight = h.weight;
    hm.lastWeightChange = h.weightChange;

    // 出馬表に含まれる過去走データを蓄積
    if (h.pastRaces && h.pastRaces.length > 0) {
      h.pastRaces.forEach(pr => {
        if (!pr.date || !pr.result) return;
        
        // 1.1 馬の履歴
        const exists = hm.results.some(old => old.date === pr.date && old.venue === pr.venue);
        if (!exists) {
          hm.results.push({
            date: pr.date, rank: pr.result, venue: pr.venue, distance: pr.distance
          });
        }

        // 1.2 過去走の騎手データも蓄積 (精度向上)
        if (pr.jockey) {
          if (!newMasterData.jockeys[pr.jockey]) {
            newMasterData.jockeys[pr.jockey] = { name: pr.jockey, totalRaces: 0, wins: 0, top3: 0, venueStats: {} };
          }
          const pjm = newMasterData.jockeys[pr.jockey];
          if (!exists) { // 新規データの場合のみ加算
            pjm.totalRaces++;
            if (!pjm.venueStats[pr.venue]) pjm.venueStats[pr.venue] = { total: 0, wins: 0, top3: 0 };
            pjm.venueStats[pr.venue].total++;
            if (pr.result === 1) { pjm.wins++; pjm.venueStats[pr.venue].wins++; }
            if (pr.result <= 3) { pjm.top3++; pjm.venueStats[pr.venue].top3++; }
          }
        }
      });
      hm.results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    // 2. 騎手データの更新（出走回数など）
    if (!newMasterData.jockeys[h.jockey]) {
      newMasterData.jockeys[h.jockey] = { 
        name: h.jockey, totalRaces: 0, wins: 0, top3: 0, venueStats: {} 
      };
    }
    const jm = newMasterData.jockeys[h.jockey];
    jm.totalRaces++;
    if (!jm.venueStats[race.venue]) {
      jm.venueStats[race.venue] = { total: 0, wins: 0, top3: 0 };
    }
    jm.venueStats[race.venue].total++;
  });

  return newMasterData;
}

export function updateMasterDataWithResult(masterData: MasterData, result: RaceResult, race: Race): MasterData {
  const newMasterData = { ...masterData };
  if (!newMasterData.horses) newMasterData.horses = {};
  if (!newMasterData.jockeys) newMasterData.jockeys = {};

  result.result.forEach(r => {
    // 1. 馬の結果を蓄積
    if (newMasterData.horses[r.horseName]) {
      const hm = newMasterData.horses[r.horseName];
      // 重複チェック
      if (!hm.results.some(old => old.date === race.date && old.venue === race.venue)) {
        hm.results.push({
          date: race.date,
          rank: r.rank,
          venue: race.venue,
          distance: race.distance
        });
      }
    }

    // 2. 騎手の成績を更新
    const horse = race.horses.find(h => h.name === r.horseName);
    if (horse && newMasterData.jockeys[horse.jockey]) {
      const jm = newMasterData.jockeys[horse.jockey];
      const vs = jm.venueStats[race.venue];
      
      if (r.rank === 1) {
        jm.wins++;
        if (vs) vs.wins++;
      }
      if (r.rank <= 3) {
        jm.top3++;
        if (vs) vs.top3++;
      }
    }
  });

  return newMasterData;
}
