import { Race, MasterData, LearningPatch } from '../types';

export function analyzeRaceResultsAndLearn(
  races: Race[],
  currentMasterData: MasterData
): { newPatches: LearningPatch[], updatedMasterData: MasterData } {
  // 現在のMasterDataをディープコピー（副作用を防ぐため）
  const updatedMasterData: MasterData = JSON.parse(JSON.stringify(currentMasterData));
  if (!updatedMasterData.horses) updatedMasterData.horses = {};
  if (!updatedMasterData.jockeys) updatedMasterData.jockeys = {};
  if (!updatedMasterData.sires) updatedMasterData.sires = {};

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

  // 今日の騎手・種牡馬の勝利数・馬券内をカウントする用
  const todaysJockeyWins: Record<string, number> = {};
  const todaysSireWins: Record<string, number> = {};
  const todaysSireTop3: Record<string, number> = {};

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

      // A. 通常の記録と大差圧勝の記録
      const resultEntry = {
        date: today,
        rank: res.rank,
        venue: race.trackName,
        distance: race.distance,
        time: res.time,
        passing: res.passing,
        pace: calculatedPace,
        condition: race.condition,
        weight: res.weight,
        odds: res.odds,
        popularity: res.popularity,
        weightChange: res.weightChange,
        jockeyWeight: res.jockeyWeight,
        jockey: res.jockey
      };
      horseData.results.push(resultEntry);

      if (res.rank === 1 && res.margin && (res.margin.includes('大差') || res.margin.includes('1.0'))) {
        horseData.incidents.push({ date: today, venue: race.trackName, note: "大差圧勝" });
      }

      // 隊列（cornerPassings）の不利解析
      if (race.result.cornerPassings && race.result.cornerPassings.length > 0) {
        // 例: "3角: 1,2(3,4)(5,6,7)"
        const corner3 = race.result.cornerPassings.find(c => c.includes('3角') || c.startsWith('3:'));
        const corner4 = race.result.cornerPassings.find(c => c.includes('4角') || c.startsWith('4:'));
        const targetNumberStr = res.horseNumber.toString();

        if (corner3 && corner4) {
          // カッコで囲まれた並走グループを抽出
          const getGroupSizeAndPosition = (cornerStr: string, hNum: string) => {
            const match = cornerStr.match(new RegExp(`\\(([^\\)]*?\\b${hNum}\\b[^\\)]*?)\\)`));
            if (match) {
              const horsesInGroup = match[1].split(/[^\d]+/).filter(s => s.trim() !== "");
              const posIndex = horsesInGroup.indexOf(hNum);
              return { size: horsesInGroup.length, posIndex };
            }
            return { size: 1, posIndex: 0 };
          };

          const c3Info = getGroupSizeAndPosition(corner3, targetNumberStr);
          const c4Info = getGroupSizeAndPosition(corner4, targetNumberStr);

          // 大外ぶん回し判定（3角・4角ともに3頭以上の大外を回された）
          if (c3Info.size >= 3 && c3Info.posIndex === c3Info.size - 1 && c4Info.size >= 3 && c4Info.posIndex === c4Info.size - 1) {
             horseData.incidents.push({ date: today, venue: race.trackName, note: "3〜4角大外ぶん回しの不利" });
          }

          // 包まれ不利判定（内側にいて、着順が悪いか弾けなかった）
          if (c3Info.size >= 3 && c3Info.posIndex === 0 && res.rank >= 4) {
             horseData.incidents.push({ date: today, venue: race.trackName, note: "道中包まれ不利・前が壁の可能性" });
          }
        }
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

      // 種牡馬のカウント
      const horseSire = horseData.sire;
      if (horseSire) {
        if (!updatedMasterData.sires![horseSire]) {
          updatedMasterData.sires![horseSire] = { name: horseSire, totalRaces: 0, wins: 0, top3: 0 };
        }
        updatedMasterData.sires![horseSire].totalRaces++;
        if (res.rank === 1) {
          updatedMasterData.sires![horseSire].wins++;
          if (!todaysSireWins[horseSire]) todaysSireWins[horseSire] = 0;
          todaysSireWins[horseSire]++;
        }
        if (res.rank <= 3) {
          updatedMasterData.sires![horseSire].top3++;
          if (!todaysSireTop3[horseSire]) todaysSireTop3[horseSire] = 0;
          todaysSireTop3[horseSire]++;
        }
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


    // B. 脚質バイアス（前残り有利・差し有利）
    if (totalTop3 > 0) {
      const frontRatio = frontRunnerTop3 / totalTop3;
      if (frontRatio >= 0.55) {
        let desc = `【自動検知】${group.venue} ${group.surface}: 前残り（逃げ・先行有利）バイアス`;
        let score = 15;
        if (group.results.some(r => {
           let calcPace = "M";
           if (r.result && r.result.lapTimes && r.result.lapTimes.length >= 6) {
             const f3 = r.result.lapTimes.slice(0, 3).reduce((a, b) => a + parseFloat(b), 0);
             const l3 = r.result.lapTimes.slice(-3).reduce((a, b) => a + parseFloat(b), 0);
             if (f3 - l3 <= -1.0) calcPace = "H";
           }
           return calcPace === "H";
        })) {
           desc = `【自動検知】${group.venue} ${group.surface}: Hペースでも前が止まらない超前残り馬場`;
           score = 25;
        }
        
        newPatches.push({
          id: `auto-bias-front-${groupKey}-${Date.now()}`,
          version: "1.0",
          date: today,
          description: desc,
          track: group.venue,
          active: true,
          adjustments: [
            { field: "style", operator: "==", value: "逃げ", scoreAdjust: score + 5 },
            { field: "style", operator: "==", value: "先行", scoreAdjust: score }
          ]
        });
      } else if (frontRatio <= 0.25) { // 差し・追込が75%以上
        newPatches.push({
          id: `auto-bias-stretch-${groupKey}-${Date.now()}`,
          version: "1.0",
          date: today,
          description: `【自動検知】${group.venue} ${group.surface}: 差し・追込有利（外差し馬場）バイアス`,
          track: group.venue,
          active: true,
          adjustments: [
            { field: "style", operator: "==", value: "差し", scoreAdjust: 20 },
            { field: "style", operator: "==", value: "追込", scoreAdjust: 15 }
          ]
        });
      }
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

  // 種牡馬データの「当日の勝利数・馬券内数」更新
  if (updatedMasterData.sires) {
    for (const sName in updatedMasterData.sires) {
      updatedMasterData.sires[sName].todayWins = todaysSireWins[sName] || 0;
      updatedMasterData.sires[sName].todayTop3 = todaysSireTop3[sName] || 0;
    }
  }

  return { newPatches, updatedMasterData };
}
