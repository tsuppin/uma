export function parseRakutenKeibaText(rawText: string): {
  horses: Horse[]; venue: string; raceNumber: number;
  date: string; distance: number; surface: Race["surface"];
  condition: Race["condition"]; headCount: number; raceName: string;
  startTime?: string; weather?: string;
} {
  const lines = rawText.split("\n").map(l => l.trim());
  let venue = "";
  let raceNumber = 1;
  let date = new Date().toISOString().slice(0, 10);
  let distance = 1400;
  let surface: Race["surface"] = "ダート";
  let condition: Race["condition"] = "良";
  let headCount = 0;
  let raceName = "";
  let startTime = "";
  let weather = "";

  for (let i = 0; i < Math.min(lines.length, 50); i++) {
    const l = lines[i];
    // 日付の抽出 (例: 2026年6月22日 第3回 浦和競馬)
    const dateM = l.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
    if (dateM && !l.includes("前日")) {
      date = `${dateM[1]}-${String(dateM[2]).padStart(2,"0")}-${String(dateM[3]).padStart(2,"0")}`;
    }
    // 例: ダ1,300m 天候：曇 ダ：重 発走時刻13:30
    const infoM = l.match(/(ダ|芝|障)?([,\d]+)m.*天候：([^\s]+).*馬場状態：([^\s]+)|(ダ|芝|障)?([,\d]+)m.*天候：([^\s]+).*([ダ芝障])：([^\s]+)/);
    if (infoM) {
      const surfStr = infoM[1] || infoM[5] || infoM[8];
      if (surfStr) surface = surfStr === "障" ? "障害" : (surfStr === "芝" ? "芝" : "ダート");
      const distStr = infoM[2] || infoM[6];
      if (distStr) distance = parseInt(distStr.replace(/,/g, ""));
      const wStr = infoM[3] || infoM[7];
      if (wStr) weather = wStr;
      const cStr = infoM[4] || infoM[9];
      if (cStr) condition = cStr as Race["condition"];
    }
    const timeM = l.match(/発走時刻(\d{2}:\d{2})/);
    if (timeM) startTime = timeM[1];

    // レース名 (埼玉シリーズ開幕賞　Ｃ３六七)
    if (l.includes("賞金 1着")) {
      if (i > 0) raceName = lines[i-1].trim() + (lines[i-2] ? " " + lines[i-2].trim() : "");
    }
    // 競馬場・レース番号
    const headM = l.match(/^(.+?競馬場)\s+(\d+)R/);
    if (headM) {
      venue = headM[1].replace("競馬場", "");
      raceNumber = parseInt(headM[2]);
    }
  }

  const horses: Horse[] = [];
  let lineIndex = 0;
  
  while (lineIndex < lines.length) {
    const line = lines[lineIndex];
    // 1	1	-	ジャングルポケット または 6	-	ビーチパトロール (枠番省略時)
    const startMatch = line.match(/^(\d+)\s+(\d+)\s+([^\s]+)\s+(.+)$/);
    const startMatchMissingWaku = line.match(/^(\d+)\s+([^\s]+)\s+(.+)$/);

    let frame = 0;
    let number = 0;
    let sire = "";
    let matched = false;

    if (startMatch) {
      frame = parseInt(startMatch[1]);
      number = parseInt(startMatch[2]);
      sire = startMatch[4];
      matched = true;
    } else if (startMatchMissingWaku) {
      number = parseInt(startMatchMissingWaku[1]);
      frame = 0; // 枠番は省略されているため0とする
      sire = startMatchMissingWaku[3];
      matched = true;
    }

    if (matched) {
        const name = lines[lineIndex + 1];
        const dam = lines[lineIndex + 2];
        const damSire = lines[lineIndex + 3].replace(/^\(|\)$/g, '');
        const oddsInfo = lines[lineIndex + 4]; // 8.6 （2人気）
        const owner = lines[lineIndex + 6];
        const breeder = lines[lineIndex + 7];
        const sexAge = lines[lineIndex + 8]; // 牝8
        const color = lines[lineIndex + 9];
        const weight = parseFloat(lines[lineIndex + 10]); // 54.0
        const jockey = lines[lineIndex + 11];
        const affiliation = lines[lineIndex + 12].replace(/^（|）$/g, ''); // （船　橋）
        const trainer = lines[lineIndex + 15]; // 平山真
        
        let gender: Horse["gender"] = "牡";
        let age = 3;
        const gm = sexAge.match(/([牡牝セ]|せん)(\d+)/);
        if (gm) {
          gender = (gm[1] === "セ" || gm[1] === "せん") ? "セン" : gm[1] as Horse["gender"];
          age = parseInt(gm[2]);
        }
        
        let odds = 0;
        let popularity = 0;
        const om = oddsInfo.match(/([\d\.]+)\s*（(\d+)人気/);
        if (om) {
          odds = parseFloat(om[1]);
          popularity = parseInt(om[2]);
        }

        let horseWeight = 480;
        let horseWeightChange = 0;
        for (let j = lineIndex + 16; j < Math.min(lineIndex + 25, lines.length); j++) {
            const hwMatch = lines[j].match(/^(\d{3})\s*(\d{3})$/);
            if (hwMatch) {
                horseWeight = parseInt(hwMatch[2]);
            } else if (lines[j].match(/^[+-]\d+|±0$/)) {
                horseWeightChange = parseInt(lines[j].replace('±0', '0'));
            }
        }

        const pastRaces: PastRace[] = [];
        let rIndex = lineIndex + 16;
        while (rIndex < lines.length) {
          if (lines[rIndex] === "過去映像") {
            const prVenueDate = lines[rIndex + 1]; // 浦和 26.05.25
            const prRaceName1 = lines[rIndex + 2]; // Ｃ３七
            const prRaceName2 = lines[rIndex + 3]; // Ｃ３七
            const prCondStr = lines[rIndex + 4]; // 1300左ダ 2人
            const prJockeyWeight = lines[rIndex + 5]; // 岡村健 54.0
            const prTimeDiff = lines[rIndex + 6]; // 1:24.6 (0.3)
            const prPaceWeightNumber = lines[rIndex + 7]; // 39.2 450k 1番
            const prPassing = lines[rIndex + 8]; // 1-1-1-1
            const prWinner = lines[rIndex + 9]; // ニシノテンカ

            if (prVenueDate && prCondStr && prTimeDiff && prPaceWeightNumber && prPassing && prWinner) {
              const vdMatch = prVenueDate.match(/^([^\s]+)\s+(\d{2})\.(\d{2})\.(\d{2})/);
              let pVenue = "", pDate = "";
              if (vdMatch) {
                pVenue = vdMatch[1];
                pDate = `20${vdMatch[2]}-${vdMatch[3]}-${vdMatch[4]}`;
              }

              const condMatch = prCondStr.match(/(\d+)(左|右)?(ダ|芝|障)\s+(\d+)人/);
              let pDist = 0, pSurf: Race["surface"] = "ダート", pPop = 0;
              if (condMatch) {
                pDist = parseInt(condMatch[1]);
                pSurf = condMatch[3] === "障" ? "障害" : (condMatch[3] === "芝" ? "芝" : "ダート");
                pPop = parseInt(condMatch[4]);
              }

              const jwMatch = prJockeyWeight.match(/^(.+?)\s+([\d\.]+)/);
              let pJockey = "", pWeight = 54;
              if (jwMatch) {
                pJockey = jwMatch[1];
                pWeight = parseFloat(jwMatch[2]);
              }

              const tMatch = prTimeDiff.match(/([\d:]+\.\d)\s*\(([-+]?\d+\.\d+)\)/) || prTimeDiff.match(/([\d:]+\.\d)/);
              let pTime = "", pDiff = 0;
              if (tMatch) {
                pTime = tMatch[1];
                pDiff = tMatch[2] ? parseFloat(tMatch[2]) : 0;
              }

              const pwnMatch = prPaceWeightNumber.match(/([\d\.]+)\s+(\d+)k\s+(\d+)番/);
              let p3fStr = "", pHWeight = 0, pNumber = 0;
              if (pwnMatch) {
                p3fStr = pwnMatch[1];
                pHWeight = parseInt(pwnMatch[2]);
                pNumber = parseInt(pwnMatch[3]);
              }

              let pResult = 0;
              const pResultLine = lines[rIndex - 3];
              if (pResultLine && pResultLine.match(/^\d+$/)) {
                 pResult = parseInt(pResultLine);
              }
              
              let pCondition: PastRace["condition"] = "良";
              const pConditionLine = lines[rIndex - 2];
              if (pConditionLine && pConditionLine.match(/^(良|稍重|重|不良|稍|不)$/)) {
                  if (pConditionLine === "稍") pCondition = "稍重";
                  else if (pConditionLine === "不") pCondition = "不良";
                  else pCondition = pConditionLine as PastRace["condition"];
              }
              
              let pHeadCount = 0;
              const pHeadCountLine = lines[rIndex - 1];
              if (pHeadCountLine && pHeadCountLine.match(/^(\d+)頭$/)) {
                  pHeadCount = parseInt(pHeadCountLine.replace('頭', ''));
              }

              pastRaces.push({
                date: pDate,
                venue: pVenue,
                raceName: prRaceName1,
                distance: pDist,
                surface: pSurf,
                condition: pCondition,
                result: pResult,
                headCount: pHeadCount,
                popularity: pPop,
                jockeyWeight: pWeight,
                time: pTime,
                corner4Position: prPassing ? parseInt(prPassing.split('-').pop() || "5") : 5,
                cornerOuterCount: 1,
                passingPositions: prPassing,
                last3fTime: p3fStr,
                weight: pHWeight,
                jockey: pJockey,
                winnerName: prWinner,
                timeDiff: pDiff,
                odds: 0,
                prize: 0,
                raceClass: prRaceName2
              });
            }
            rIndex += 9;
          } else {
             // 次の馬の始まりが見つかったら抜ける
             if (lines[rIndex] && lines[rIndex].match(/^\d+\s+[^\s]+\s+.*$/)) {
                break;
             }
             rIndex++;
          }
        }

        let totalResults, venueResults, distanceResults, courseResults, under1400Results, from1401To1600Results, from1601To1800Results, over1801Results;
        let bestTimes: Record<string, string> = {};
        
        for (let i = lineIndex + 16; i < rIndex; i++) {
            if (lines[i] === "持ち時計") {
                if (i >= 8) {
                    totalResults = parseResultString(lines[i - 8]);
                    venueResults = parseResultString(lines[i - 7]);
                    distanceResults = parseResultString(lines[i - 6]);
                    courseResults = parseResultString(lines[i - 5]);
                    under1400Results = parseResultString(lines[i - 4]);
                    from1401To1600Results = parseResultString(lines[i - 3]);
                    from1601To1800Results = parseResultString(lines[i - 2]);
                    over1801Results = parseResultString(lines[i - 1]);
                }
                
                let j = i + 1;
                let currentDistance: string | null = null;
                while (j < rIndex) {
                    if (lines[j].match(/^\d+$/) || lines[j].match(/^[^\d]+\d+$/)) {
                        currentDistance = lines[j];
                    } else if (lines[j].match(/^[^\d]{1,2}\d{4}[^\s]+$/)) {
                         if (currentDistance) {
                             const timeStrMatch = lines[j].match(/(\d)(\d{2})(\d)/);
                             if (timeStrMatch) {
                                 bestTimes[currentDistance] = `${timeStrMatch[1]}:${timeStrMatch[2]}.${timeStrMatch[3]}`;
                             }
                         }
                    }
                    j++;
                }
                break;
            }
        }

        horses.push({
          id: generateId(),
          number,
          frame,
          name,
          birthday,
          jockeyWinRate,
          jockeyPlaceRate,
          bestWeight,
          belonging: affiliation || undefined,
          age,
          gender,
          coatColor: color || undefined,
          weight: horseWeight,
          weightChange: horseWeightChange,
          jockey,
          jockeyWeight: weight,
          trainer,
          owner,
          breeder,
          sire,
          dam,
          bms: damSire,
          bloodline: sire || "",
          style: "中団",
          odds,
          popularity,
          pastRaces,
          stableLocation: affiliation || "地方",
          totalResults,
          venueResults,
          distanceResults,
          courseResults,
          under1400Results,
          from1401To1600Results,
          from1601To1800Results,
          over1801Results,
          bestTimes: Object.keys(bestTimes).length > 0 ? bestTimes : undefined,
        });

        lineIndex = rIndex; // 次の馬へ進める
      } else {
        lineIndex += 15;
      }
    } else {
      lineIndex++;
    }
  }

  return {
    horses, venue, raceNumber, date, distance, surface, condition,
    headCount: horses.length, raceName,
    startTime: startTime || undefined, weather: weather || undefined
  };
}


export function parseJRAOfficialText(rawText: string): {
  horses: Horse[]; venue: string; raceNumber: number;