import { MasterData, Race, RaceResult } from "../types";

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
            date: pr.date, rank: pr.result, venue: pr.venue, distance: pr.distance, weight: pr.weight, time: pr.time
          });
        }
        
        // 自己ベストタイムの更新
        if (pr.time && pr.time.includes(':')) {
          const key = `${pr.venue}_${pr.distance}`;
          if (!hm.bestTime) hm.bestTime = {};
          const parseTime = (t: string) => {
            const [m, s] = t.split(':');
            return parseFloat(m) * 60 + parseFloat(s);
          };
          const currentSec = parseTime(pr.time);
          if (!hm.bestTime[key] || currentSec < parseTime(hm.bestTime[key])) {
            hm.bestTime[key] = pr.time;
          }
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
  if (!newMasterData.laps) newMasterData.laps = {};

  // 1. ラップタイム (ハロンタイム) の蓄積
  if (result.lapTimes && result.lapTimes.length > 0) {
    const key = `${race.venue}_${race.distance}_${race.surface}`;
    if (!newMasterData.laps[key]) {
      newMasterData.laps[key] = [];
    }
    const alreadyExists = newMasterData.laps[key].some(l => l.date === race.date);
    if (!alreadyExists) {
      newMasterData.laps[key].push({
        venue: race.venue,
        distance: race.distance,
        surface: race.surface,
        laps: result.lapTimes,
        cornerPassings: result.cornerPassings,
        date: race.date
      });
    }
  }

  // 2. 勝ち馬プロフィールの蓄積
  if (result.winnerProfile) {
    const wp = result.winnerProfile;
    if (!newMasterData.horses[wp.horseName]) {
      newMasterData.horses[wp.horseName] = { name: wp.horseName, results: [] };
    }
    const hm = newMasterData.horses[wp.horseName];
    if (wp.sire) hm.sire = wp.sire;
    if (wp.dam) hm.dam = wp.dam;
    if (wp.owner) hm.owner = wp.owner;
    if (wp.breeder) hm.breeder = wp.breeder;
  }

  // 3. 出来事 (incidents) の馬個別蓄積
  if (result.incidents) {
    const incidentText = result.incidents;
    race.horses.forEach(h => {
      // 出来事テキストに馬名が含まれているか確認
      if (incidentText.includes(h.name)) {
        if (!newMasterData.horses[h.name]) {
          newMasterData.horses[h.name] = { name: h.name, results: [] };
        }
        const hm = newMasterData.horses[h.name];
        if (!hm.incidents) hm.incidents = [];
        const alreadyHas = hm.incidents.some(inc => inc.date === race.date);
        if (!alreadyHas) {
          hm.incidents.push({
            date: race.date,
            venue: race.venue,
            note: incidentText
          });
        }
      }
    });
  }

  result.result.forEach(r => {
    // 4. 馬の結果を蓄積
    if (!newMasterData.horses[r.horseName]) {
      newMasterData.horses[r.horseName] = { name: r.horseName, results: [] };
    }
    const hm = newMasterData.horses[r.horseName];
    
    // 所属の永続化
    const rWithBelonging = r as { belonging?: string };
    if (rWithBelonging.belonging) {
      hm.belonging = rWithBelonging.belonging;
    }

    // 重複チェック
    if (!hm.results.some(old => old.date === race.date && old.venue === race.venue)) {
      hm.results.push({
        date: race.date,
        rank: r.rank,
        venue: race.venue,
        distance: race.distance,
        weight: r.weight,
        time: r.time
      });
    }

    // 自己ベストタイムの更新
    if (r.time && r.time.includes(':')) {
      const key = `${race.venue}_${race.distance}`;
      if (!hm.bestTime) hm.bestTime = {};
      const parseTime = (t: string) => {
        const [m, s] = t.split(':');
        return parseFloat(m) * 60 + parseFloat(s);
      };
      const currentSec = parseTime(r.time);
      if (!hm.bestTime[key] || currentSec < parseTime(hm.bestTime[key])) {
        hm.bestTime[key] = r.time;
      }
    }

    // 5. 騎手の成績を更新
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
