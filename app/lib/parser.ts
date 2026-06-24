import { Horse, PastRace, Race } from "../types";
import { generateId } from "./storage";

// ==========================================
// フォーマット自動判別
// ==========================================
export function detectFormat(text: string): "jra" | "jra_official" | "nar" | "rakuten" | "rakuten_result" {
  if (text.includes("楽天競馬") || text.includes("Rakuten Mobile")) {
    if (text.includes("競走成績") && text.includes("■全着順")) return "rakuten_result";
    return "rakuten";
  }
  if (text.includes("JRA 日本中央競馬会") || text.includes("ホーム>競馬メニュー>出馬表")) return "jra_official";
  if (/枠\d[白黒赤青黄緑橙桃]/.test(text)) return "jra";
  const venue = extractVenue(text);
  const jraTracks = ["東京", "中山", "京都", "阪神", "中京", "新潟", "福島", "小倉", "函館", "札幌"];
  
  if (venue && !jraTracks.includes(venue)) return "nar";
  if (text.includes("本賞金") || text.includes("ダ短") || text.includes("ダマ")) return "nar"; // 楽天競馬等の特有フォーマット
  
  return "jra";
}

function estimateStyle(pastRaces: PastRace[]): Horse["style"] {
  if (pastRaces.length === 0) return "中団";
  let frontCount = 0, midCount = 0, backCount = 0;

  pastRaces.forEach(pr => {
    if (pr.passingPositions) {
      const pos = pr.passingPositions.split('-').map(Number);
      const firstPos = pos[0];
      if (firstPos === 1) frontCount += 2;
      else if (firstPos <= 4) frontCount++;
      else if (firstPos <= 8) midCount++;
      else backCount++;
    }
  });

  if (frontCount > midCount && frontCount > backCount) return frontCount >= 3 ? "逃げ" : "先行";
  if (backCount > frontCount && backCount > midCount) return "差し";
  return "中団";
}

const ALL_TRACKS = [
  // 中央
  "東京", "中山", "京都", "阪神", "中京", "新潟", "福島", "小倉", "函館", "札幌",
  // 地方
  "大井", "川崎", "船橋", "浦和", "門別", "盛岡", "水沢", "金沢", "笠松", "名古屋", "園田", "姫路", "高知", "佐賀", "帯広"
];

export function extractVenue(text: string): string | null {
  // レース情報が集まっている先頭100行程度から検索する（馬名や所属による誤爆を防ぐため）
  const headLines = text.split("\n").slice(0, 100).join("\n");
  
  // 「大井 11R」や「東京11R」のような明確なパターンを優先
  for (const track of ALL_TRACKS) {
    if (new RegExp(`${track}\\s*\\d+R`).test(headLines)) {
      return track;
    }
  }

  // 〇回〇〇〇日 のようなパターンを最優先
  const kaiMatch = headLines.match(/\d+回([^\d\s]+)\d+日/);
  if (kaiMatch) {
     for (const track of ALL_TRACKS) {
       if (kaiMatch[1].includes(track)) return track;
     }
  }

  // 単純な出現確認（ヘッダー部分のみ）
  let bestTrack = null;
  let minIndex = Infinity;
  for (const track of ALL_TRACKS) {
    const idx = headLines.indexOf(track);
    if (idx !== -1 && idx < minIndex) {
      minIndex = idx;
      bestTrack = track;
    }
  }
  if (bestTrack) return bestTrack;
  return null;
}

// ==========================================
// NAR出馬表パーサー（地方競馬）- フルデータ対応版
// ==========================================
export function parseNARText(rawText: string): {
  horses: Horse[]; venue: string; raceNumber: number;
  date: string; distance: number; surface: Race["surface"];
  condition: Race["condition"]; headCount: number; raceName: string;
  startTime?: string; weather?: string;
} {
  const lines = rawText.split("\n").map(l => l.trim());

  let date = new Date().toISOString().slice(0, 10);
  let venue = extractVenue(rawText) || "";
  let raceNumber = 1, distance = 1200, headCount = 0, raceName = "";
  const surface: Race["surface"] = "ダート";
  let condition: Race["condition"] = "良";
  let startTime = "";
  let weather = "";

  for (let i = 0; i < Math.min(lines.length, 25); i++) {
    const l = lines[i];
    if (!l) continue;

    // 日付: 2026/5/12
    const dateM = l.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
    if (dateM) date = `${dateM[1]}-${String(dateM[2]).padStart(2,"0")}-${String(dateM[3]).padStart(2,"0")}`;

    // 開催場・R: 川崎 11R
    const venueM = l.match(/^(.+?)\s+(\d+)R$/);
    if (venueM) { venue = venueM[1].trim(); raceNumber = parseInt(venueM[2]); }

    // 距離・頭数・発走時刻: 900m    12頭    発走20:15
    const distM = l.match(/(\d+)m/);
    if (distM) distance = parseInt(distM[1]);
    const hcM = l.match(/(\d+)頭/);
    if (hcM) headCount = parseInt(hcM[1]);
    const stM = l.match(/発走\s*(\d{2}:\d{2})/);
    if (stM) startTime = stM[1];

    // 天候・馬場状態: 天候：晴 馬場状態：良
    const weatherM = l.match(/天候[：:]\s*(.+?)(?:\s|$)/) || l.match(/天候[：:]\s*([^\s]+)/);
    if (weatherM) weather = weatherM[1].trim().split(" ")[0];
    const condM = l.match(/馬場状態[：:]\s*(.+?)(?:\s|$)/) || l.match(/馬場状態[：:]\s*([^\s]+)/);
    if (condM) {
      const c = condM[1].trim().split(" ")[0];
      if ((["良","稍重","重","不良"] as string[]).includes(c)) condition = c as Race["condition"];
    }

    // レース名
    if (i === 2 && !venueM && !dateM && !distM) {
      raceName = l;
    }
  }

  if (!raceName) {
    for (let i = 0; i < Math.min(lines.length, 10); i++) {
      const l = lines[i];
      if (l.includes("特別") || l.includes("オープン") || l.includes("チャレンジ") || l.includes("重賞") || l.includes("スプリント")) {
        raceName = l;
        break;
      }
    }
  }

  const blockStarts: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    if (/^[1-8][\t\s]+(?:[1-9]|1[0-8])[\t\s]+[^\t\s]+/.test(l) && /[ァ-ヶー]/.test(l)) {
      if (!l.includes("頭") && !l.includes("番") && !l.includes("人") && !l.includes("kg") && !l.includes("m") && !l.includes(":") && !l.includes("3F") && !l.includes("着") && !l.match(/\d{2}\/\d{2}\/\d{2}/)) {
        blockStarts.push(i);
      }
    }
  }

  const horses: Horse[] = [];
  for (let bi = 0; bi < blockStarts.length; bi++) {
    const start = blockStarts[bi];
    const end = bi + 1 < blockStarts.length ? blockStarts[bi + 1] : lines.length;
    const h = parseNARHorse(lines.slice(start, end));
    if (h?.name) horses.push(h as Horse);
  }

  return {
    horses, venue, raceNumber, date, distance, surface, condition,
    headCount: headCount || horses.length, raceName,
    startTime: startTime || undefined, weather: weather || undefined
  };
}

function parseNARHorse(lines: string[]): Partial<Horse> | null {
  if (!lines[0]) return null;

  const hp = lines[0].trim().split(/[\t\s]+/);
  if (hp.length < 3) return null;

  // 調教情報の抽出
  let trainingTime = "";
  let trainingRating = "";
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const hasCourse = trimmed.includes("坂路") || trimmed.includes("南W") || trimmed.includes("ウッド") || 
                      trimmed.includes("Ｗ") || trimmed.includes("坂") || trimmed.includes("芝") || 
                      trimmed.includes("ポリ") || trimmed.includes("ダート") || trimmed.includes("ＤＰ");
    const hasTimePattern = /\d{2}\.\d[ \t\-\s]*\d{2}\.\d/g.test(trimmed) || 
                           /\d{2}\.\d[ \t\-\s]*-\d{2}\.\d/g.test(trimmed) || 
                           trimmed.includes("馬なり") || trimmed.includes("強め") || trimmed.includes("一杯");
    if (hasCourse && (hasTimePattern || trimmed.match(/\d{2}\.\d/))) {
      trainingTime = trimmed;
    }
    const ratingMatch = trimmed.match(/(?:調教評価|追切評価|調教|評価)[\s:：]*(S|[A-C][+-]?)/i) || 
                        trimmed.match(/^[【\s]*(S|[A-C][+-]?)[】\s]*$/);
    if (ratingMatch) {
      trainingRating = ratingMatch[1].toUpperCase();
    }
  }

  const frame = parseInt(hp[0]);
  const number = parseInt(hp[1]);
  const rawName = hp[2] || "";
  let name = rawName;
  let belonging = "";

  const nameBelongingM = rawName.match(/^(.+?)\((.+?)\)$/);
  if (nameBelongingM) {
    name = nameBelongingM[1].trim();
    belonging = nameBelongingM[2].trim();
  }

  let sire = "";
  let dam = "";
  let gender: Horse["gender"] = "牡";
  let age = 3;
  let coatColor = "";
  let weight = 480;
  let weightChange = 0;
  let jockey = "";
  let kinryo = 54;
  let trainer = "";
  let owner = "";
  let breeder = "";
  let transferFrom = "";
  let jraEarnings = 0;
  let stableLocation = "";

  let pastRaceStartIdx = -1;
  for (let i = 1; i < lines.length; i++) {
    const l = lines[i].trim();
    if (!l) continue;
    const isPastRaceHeader = /^(?:\d+|取消|除外|中止|失格)\s+\d{2}\/\d{2}\/\d{2}/.test(l) || /^(?:\d+|取消|除外|中止|失格)\t\d{2}\/\d{2}\/\d{2}/.test(l);
    if (isPastRaceHeader) {
      pastRaceStartIdx = i;
      break;
    }
  }

  const profileEndIdx = pastRaceStartIdx !== -1 ? pastRaceStartIdx : lines.length;

  let kinryoIdx = -1;
  for (let i = 1; i < profileEndIdx; i++) {
    const l = lines[i].trim();
    if (l.match(/^\(\d{2,3}(?:\.\d)?\)$/)) {
      kinryoIdx = i;
      break;
    }
  }

  for (let i = 1; i < profileEndIdx; i++) {
    const l = lines[i].trim();
    if (!l) continue;

    if (l.includes("父") && !sire) {
      sire = l.replace(/^.*?父\s+/, "").trim();
    } else if (l.includes("母") && !dam) {
      dam = l.replace(/^.*?母\s+/, "").trim();
    } else if (l.match(/^[牡牝セ]|せん/) && l.match(/\d+/)) {
      const gm = l.match(/([牡牝セ]|せん)(\d+)/);
      if (gm) {
        gender = (gm[1] === "セ" || gm[1] === "せん") ? "セン" : gm[1] as Horse["gender"];
        age = parseInt(gm[2]);
      }
    } else if (l.match(/^(?:栗|栃栗|鹿|黒鹿|青鹿|青|芦|白|粕)毛$/)) {
      coatColor = l;
    } else if (l.match(/^\d+kg$/)) {
      weight = parseInt(l);
    } else if (l.match(/^\(([±+-]?\d+|初出走|[\d]+|±\d+)\)$/)) {
      const wcm = l.match(/\(([±+-]?\d+|初出走|[\d]+|±\d+)\)/);
      if (wcm) {
        const val = wcm[1].replace("±", "");
        weightChange = val === "初出走" ? 0 : parseInt(val) || 0;
      }
    } else if (l.includes("本賞金") || l.includes("収得賞金") || l.includes("賞金")) {
      const prizeM = l.match(/(?:本賞金|収得賞金|賞金)[：:]?\s*([\d,]+)/);
      if (prizeM) {
        const rawPrize = parseInt(prizeM[1].replace(/,/g, ""));
        jraEarnings = rawPrize < 100000 ? rawPrize : Math.round(rawPrize / 10000);
      }
    }
  }

  if (kinryoIdx !== -1) {
    const kMatch = lines[kinryoIdx].trim().match(/^\((\d{2,3}(?:\.\d)?)\)$/);
    if (kMatch) kinryo = parseFloat(kMatch[1]);

    if (kinryoIdx - 1 >= 0) jockey = lines[kinryoIdx - 1].trim();
    if (kinryoIdx + 1 < profileEndIdx) {
      const rawTrainer = lines[kinryoIdx + 1].trim();
      trainer = rawTrainer;
      const trainerBelongingM = rawTrainer.match(/^(.+?)\((.+?)\)$/) || rawTrainer.match(/^(.+?)（(.+?)）$/);
      if (trainerBelongingM) {
        trainer = trainerBelongingM[1].trim();
        stableLocation = trainerBelongingM[2].trim();
      }
    }
    if (kinryoIdx + 2 < profileEndIdx) owner = lines[kinryoIdx + 2].trim();
    if (kinryoIdx + 3 < profileEndIdx) breeder = lines[kinryoIdx + 3].trim();
  }

  // ==========================================
  // 過去走データのパース
  // ==========================================
  const pastRaces: PastRace[] = [];
  if (pastRaceStartIdx !== -1) {
    let pIdx = pastRaceStartIdx;
    while (pIdx < lines.length && pastRaces.length < 5) {
      const l1 = lines[pIdx]?.trim() || "";
      if (!l1) { pIdx++; continue; }

      const isPastRaceHeader = /^(?:\d+|取消|除外|中止|失格)\s+\d{2}\/\d{2}\/\d{2}/.test(l1) || /^(?:\d+|取消|除外|中止|失格)\t\d{2}\/\d{2}\/\d{2}/.test(l1);
      if (!isPastRaceHeader) {
        pIdx++;
        continue;
      }

      const p1 = l1.split(/[\t\s]+/);
      if (p1.length < 3) { pIdx++; continue; }

      const rawResult = p1[0];
      const isNumericResult = /^\d+$/.test(rawResult);
      const prResult = isNumericResult ? parseInt(rawResult) : 0;

      const dateMatch = p1[1].match(/(\d{2})\/(\d{2})\/(\d{2})/);
      const prDate = dateMatch ? `20${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : "";
      const prVenue = p1[2] || "";
      
      const courseAttr = p1[3] || "";
      const directionM = courseAttr.match(/([右左]|直線)/);
      const prDirection = directionM ? directionM[1] as PastRace["direction"] : "";
      const distMatch = courseAttr.match(/(\d+)m/);
      const prDist = distMatch ? parseInt(distMatch[1]) : 0;
      const prSurf: PastRace["surface"] = courseAttr.includes("障") ? "障害" : (courseAttr.includes("芝") ? "芝" : "ダート");

      const prCond = (p1[4] || "良") as PastRace["condition"];

      pIdx++;

      const prRaceClass = lines[pIdx]?.trim() || "";
      pIdx++;

      const nextLine = lines[pIdx]?.trim() || "";
      const isNextHeader = /^(?:\d+|取消|除外|中止|失格)\s+\d{2}\/\d{2}\/\d{2}/.test(nextLine) || /^(?:\d+|取消|除外|中止|失格)\t\d{2}\/\d{2}\/\d{2}/.test(nextLine);

      let prHeadCount = 0;
      let prFrameNumber = 0;
      let prPopularity = 0;
      let prJockey = "";
      let prKinryo = 0;
      let prWeight = 480;
      let passingPositions = "";
      let prTime = "";
      let last3fTime = "";
      let winnerName = "";
      let timeDiff = 0;

      if (!isNextHeader && pIdx < lines.length) {
        const l3 = lines[pIdx]?.trim() || "";
        const p3 = l3.split(/[\t\s]+/);
        
        const hcMatch = l3.match(/(\d+)頭/);
        if (hcMatch) prHeadCount = parseInt(hcMatch[1]);

        const fnMatch = l3.match(/(\d+)番/);
        if (fnMatch) prFrameNumber = parseInt(fnMatch[1]);

        const popMatch = l3.match(/(\d+)人/);
        if (popMatch) prPopularity = parseInt(popMatch[1]);

        let jockeyFound = false;
        p3.forEach(part => {
          if (part.includes("頭") || part.includes("番") || part.includes("人")) return;
          if (part.match(/^\d{3}kg$/)) {
            prWeight = parseInt(part);
          } else if (part.match(/^\d{2}\.\d$/)) {
            prKinryo = parseFloat(part);
          } else if (part.match(/^\d+(?:-\d+)+$/)) {
            passingPositions = part;
          } else if (part.length >= 2 && part.length <= 5 && !jockeyFound) {
            prJockey = part;
            jockeyFound = true;
          }
        });

        pIdx++;

        const l4 = lines[pIdx]?.trim() || "";
        if (l4) {
          const timeMatch = l4.match(/^(\d+:\d+[:.]\d+)/) || l4.match(/^(\d+[:.]\d+)/);
          if (timeMatch) {
            prTime = timeMatch[1].replace(/:(\d+)$/, ".$1");
          }

          const last3fMatch = l4.match(/\((\d{2}\.\d)\)/);
          if (last3fMatch) last3fTime = last3fMatch[1];

          const winnerMatch = l4.match(/\s+([^\s\(\)]+?)\(([-+]\d+\.\d+)\)/) || l4.match(/\s+([^\s\(\)]+?)\(([-+]\d+)\)/);
          if (winnerMatch) {
            winnerName = winnerMatch[1].trim();
            timeDiff = parseFloat(winnerMatch[2]);
          }
        }
        pIdx++;
      }

      if (prDate) {
        pastRaces.push({
          date: prDate,
          venue: prVenue,
          raceName: prRaceClass,
          raceClass: prRaceClass,
          distance: prDist,
          direction: prDirection || undefined,
          surface: prSurf,
          condition: prCond,
          result: prResult,
          headCount: prHeadCount || undefined,
          frameNumber: prFrameNumber || undefined,
          popularity: prPopularity || undefined,
          jockeyWeight: prKinryo || undefined,
          time: prTime,
          corner4Position: passingPositions ? parseInt(passingPositions.split('-').pop() || "5") : 5,
          cornerOuterCount: 1,
          passingPositions: passingPositions || undefined,
          last3fTime: last3fTime || undefined,
          weight: prWeight,
          jockey: prJockey,
          winnerName: winnerName || undefined,
          timeDiff: timeDiff || undefined,
          odds: 0,
          prize: 0
        });
      }
    }
  }

  const calculatedStyle = estimateStyle(pastRaces);
 
  // JRAからの転入自動検知
  let detectedTransfer = transferFrom;
  let detectedJRAEarnings = jraEarnings;
 
  if (belonging === "中央" || belonging === "ＪＲＡ" || belonging === "JRA") {
    detectedTransfer = "JRA";
  }
 
  const jraVenues = ["東京", "中山", "京都", "阪神", "中京", "新潟", "福島", "小倉", "函館", "札幌"];
  const hasJRAPastRace = pastRaces.some(pr => jraVenues.includes(pr.venue));
  if (hasJRAPastRace) {
    detectedTransfer = "JRA";
    if (detectedJRAEarnings === 0) {
      // 過去走の賞金からJRA収得賞金を概算 (万単位)
      const totalPrize = pastRaces.reduce((sum, pr) => {
        if (jraVenues.includes(pr.venue)) {
          return sum + (pr.prize || 0);
        }
        return sum;
      }, 0);
      detectedJRAEarnings = totalPrize;
    }
  }
 
  return {
    id: generateId(),
    number,
    frame,
    name,
    belonging: belonging || undefined,
    age,
    gender,
    coatColor: coatColor || undefined,
    weight,
    weightChange,
    jockey,
    jockeyWeight: kinryo,
    trainer,
    owner,
    breeder: breeder || undefined,
    sire,
    dam,
    bms: "",
    bloodline: sire || "",
    style: calculatedStyle,
    odds: 0,
    popularity: 0,
    pastRaces,
    stableLocation: stableLocation || belonging || "地方",
    transferFrom: detectedTransfer || undefined,
    jraEarnings: detectedJRAEarnings || undefined,
    trainingTime: trainingTime || undefined,
    trainingRating: trainingRating || undefined
  };
}

// ==========================================
// JRA出馬表パーサー（中央競馬）- フルデータ対応版
// ==========================================
export function parseJRAText(rawText: string): {
  horses: Horse[]; venue: string; raceNumber: number;
  date?: string; raceName?: string; distance?: number; surface?: Race["surface"]; condition?: Race["condition"]; headCount?: number;
  cushionValue?: number; moistureContent?: number; temporaryFencePosition?: string;
} {
  const lines = rawText.split("\n").map(l => l.trim());

  // ヘッダー解析: "3回京都6日 11R" または "3回京都6日 11レース"
  const headerMatch = rawText.match(/(\d+)回(.+?)(\d+)日\s*(\d+)(?:R|レース)/);
  const venue = headerMatch?.[2]?.trim() || extractVenue(rawText) || "";
  const raceNumber = headerMatch ? parseInt(headerMatch[4]) : 1;

  const dateMatch = rawText.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  const date = dateMatch ? `${dateMatch[1]}-${String(dateMatch[2]).padStart(2,"0")}-${String(dateMatch[3]).padStart(2,"0")}` : new Date().toISOString().slice(0, 10);

  // レース名・距離・馬場・条件
  let raceName = "";
  let distance = 0;
  let surface: Race["surface"] = "ダート";
  let condition: Race["condition"] = "良";
  for (let i = 0; i < Math.min(lines.length, 100); i++) {
    const l = lines[i];
    const dm = l.match(/(\d{3,4})(ダ|芝|障)/);
    if (dm) { distance = parseInt(dm[1]); surface = dm[2] === "障" ? "障害" : (dm[2] === "芝" ? "芝" : "ダート"); }
    if (/^(良|稍重|重|不良)$/.test(l) && !condition) condition = l as Race["condition"];
    if (l.match(/(S|G)[Ⅰ-Ⅲ]|リステッド|特別|勝クラス|OP|オープン/) && !raceName) raceName = l;
  }

  // レース結果フォーマットの判定とパース
  const isResultFormat = rawText.includes("着順") && rawText.includes("馬名") && rawText.includes("タイム") && rawText.includes("払戻金");
  if (isResultFormat) {
    let resultBlockStarts: number[] = [];
    for (let i = 0; i < lines.length; i++) {
      if (/^\d+\s*[\t　]+\s*枠\d/.test(lines[i])) {
        resultBlockStarts.push(i);
      }
    }
    const horses: Horse[] = [];
    for (let bi = 0; bi < resultBlockStarts.length; bi++) {
      const start = resultBlockStarts[bi];
      const end = (bi < resultBlockStarts.length - 1) ? resultBlockStarts[bi+1] : start + 6;
      const blockLines = lines.slice(start, end).filter(l => l !== "");
      
      const combinedStr = blockLines.join("\t");
      const combined = combinedStr.split(/\t+/).map(s => s.trim()).filter(s => s !== "");
      
      let frame = 0, number = 0, name = "", gender: "牡"|"牝"|"セン" = "牡", age = 3, kinryo = 55, jockey = "";
      let horseWeight = 0, horseWeightChange = 0, trainer = "", popularity = 0;
      
      if (combined.length >= 7) {
        const frameMatch = combined[1].match(/枠(\d)/);
        if (frameMatch) frame = parseInt(frameMatch[1]);
        number = parseInt(combined[2]) || 0;
        name = combined[3].replace("ブリンカー着用", "");
        
        const gaMatch = combined[4].match(/^([牡牝セ]|せん)(\d+)/);
        if (gaMatch) {
          gender = (gaMatch[1] === "セ" || gaMatch[1] === "せん") ? "セン" : (gaMatch[1] as "牡"|"牝");
          age = parseInt(gaMatch[2]);
        }
        kinryo = parseFloat(combined[5]) || 55;
        jockey = combined[6];
        
        for (let j = 7; j < combined.length; j++) {
          const field = combined[j];
          const wm = field.match(/^(\d{3})(?:\(([+-]?\d+|初出走)\))?$/);
          if (wm) {
            horseWeight = parseInt(wm[1]);
            if (wm[2]) horseWeightChange = wm[2] === "初出走" ? 0 : (parseInt(wm[2]) || 0);
            if (j + 1 < combined.length) trainer = combined[j+1];
            if (j + 2 < combined.length) popularity = parseInt(combined[j+2]) || 0;
            break;
          }
        }
        
        horses.push({
          id: `H${number}`, number, frame, name, age, gender, coatColor: "", weight: horseWeight, weightChange: horseWeightChange,
          jockey, jockeyWeight: kinryo, trainer, owner: "", sire: "", dam: "", bms: "", bloodline: "", style: "",
          pastRaces: [], popularity
        });
      }
    }
    return { horses, venue, raceNumber, raceName, date, distance: distance || undefined, surface, condition, headCount: horses.length };
  }

  // クッション値、含水率、仮柵位置の自動抽出
  let cushionValue: number | undefined;
  let moistureContent: number | undefined;
  let temporaryFencePosition: string | undefined;

  const fenceM = rawText.match(/([A-D])コース/);
  if (fenceM) temporaryFencePosition = fenceM[1];

  const cushionM = rawText.match(/クッション値[：:\s]*(\d+\.?\d*)/);
  if (cushionM) cushionValue = parseFloat(cushionM[1]);

  const moistureM = rawText.match(/含水率[：:\s]*(?:芝)?(\d+\.?\d*)/) || rawText.match(/含水率[：:\s]*(\d+\.?\d*)%/);
  if (moistureM) moistureContent = parseFloat(moistureM[1]);

  const blockStarts: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    // 枠番の検出を大幅に強化 (行頭のスペース、枠と数値の間のスペース/タブ/全角スペースの揺れに完全対応)
    if (/^[\s\t　]*枠[\s\t　]*\d/.test(lines[i])) {
      blockStarts.push(i);
    } 
    // 最新フォーマット: 1 1 スナッピードレッサ などの 枠番 馬番 馬名 のパターン
    else if (/^[1-8][\t\s]+(?:[1-9]|1[0-8])[\t\s]+[^\t\s]+/.test(l) && /[ァ-ヶー]/.test(l)) {
      if (!l.includes("頭") && !l.includes("番") && !l.includes("人") && !l.includes("kg") && !l.includes("m") && !l.includes(":") && !l.includes("3F") && !l.includes("着") && !l.match(/\d{2}\/\d{2}\/\d{2}/)) {
        blockStarts.push(i);
      }
    }
    // テーブル形式でのコピペ: 行1=枠, 行2=馬番
    else if (i < lines.length - 2 && /^[1-8]$/.test(l) && /^[1-9]$|^1[0-8]$/.test(lines[i+1].trim())) {
      blockStarts.push(i);
    }
    // テーブル形式でのコピペ2: 行1=枠と馬番 (スペース区切り), 行2=馬名
    else if (i < lines.length - 1 && /^[1-8][\s\t　]+(?:[1-9]|1[0-8])$/.test(l)) {
      blockStarts.push(i);
    }
  }

  const horses: Horse[] = [];
  for (let bi = 0; bi < blockStarts.length; bi++) {
    const start = blockStarts[bi];
    const end = bi + 1 < blockStarts.length ? blockStarts[bi + 1] : lines.length;
    const h = parseJRAHorse(lines.slice(start, end));
    if (h?.name) horses.push(h as Horse);
  }

  return { 
    horses, venue, raceNumber, raceName, date, distance: distance || undefined, surface, condition, headCount: horses.length,
    cushionValue, moistureContent, temporaryFencePosition
  };
}

function parseJRAHorse(lines: string[]): Partial<Horse> | null {
  if (!lines[0]) return null;

  // 調教情報の抽出
  let trainingTime = "";
  let trainingRating = "";
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const hasCourse = trimmed.includes("坂路") || trimmed.includes("南W") || trimmed.includes("ウッド") || 
                      trimmed.includes("Ｗ") || trimmed.includes("坂") || trimmed.includes("芝") || 
                      trimmed.includes("ポリ") || trimmed.includes("ダート") || trimmed.includes("ＤＰ");
    const hasTimePattern = /\d{2}\.\d[ \t\-\s]*\d{2}\.\d/g.test(trimmed) || 
                           /\d{2}\.\d[ \t\-\s]*-\d{2}\.\d/g.test(trimmed) || 
                           trimmed.includes("馬なり") || trimmed.includes("強め") || trimmed.includes("一杯");
    if (hasCourse && (hasTimePattern || trimmed.match(/\d{2}\.\d/))) {
      trainingTime = trimmed;
    }
    const ratingMatch = trimmed.match(/(?:調教評価|追切評価|調教|評価)[\s:：]*(S|[A-C][+-]?)/i) || 
                        trimmed.match(/^[【\s]*(S|[A-C][+-]?)[】\s]*$/);
    if (ratingMatch) {
      trainingRating = ratingMatch[1].toUpperCase();
    }
  }

  let frame = 1;
  let number = 0;
  let name = "";
  let idx = 1;
  let hasBlinker = false;

  let trainer = "";
  let stableLocation = "";
  let sire = "", dam = "", bms = "";
  let odds = 0, popularity = 0;
  let horseWeight = 480, horseWeightChange = 0;
  let gender: Horse["gender"] = "牡"; let age = 4;
  let coatColor = "";
  let kinryo = 55;
  let jockey = "";
  let owner = "";
  let breeder = "";

  const frameMatch = lines[0].match(/枠[\s\t　]*(\d)/);
  if (frameMatch) {
    frame = parseInt(frameMatch[1]);
  }

  // 1 1 スナッピードレッサ のようなパターンを抽出
  const multiMatch = lines[0].match(/^(\d+)[\s\t　]+(\d+)[\s\t　]+([^\s\t　]+)/);
  if (multiMatch) {
    frame = parseInt(multiMatch[1]);
    number = parseInt(multiMatch[2]);
    name = multiMatch[3];
  } else {
    // 枠と馬番だけが同じ行にあるパターン (例: "1 1" や "1\t1")
    const twoNumMatch = lines[0].match(/^(\d+)[\s\t　]+(\d+)$/);
    if (twoNumMatch) {
      frame = parseInt(twoNumMatch[1]);
      number = parseInt(twoNumMatch[2]);
    } else {
      const tabParts = lines[0].split(/\t/);
      if (tabParts.length > 1 && /^\d+$/.test(tabParts[1].trim())) {
        frame = parseInt(tabParts[0].trim()) || frame;
        number = parseInt(tabParts[1].trim());
      }
    }
  }

  if (!name) {
    // 馬番のパースを極限まで頑健化 (前後のスペース・タブのトリム、ブリンカーや空行の自動スキップに対応)
    if (!number) {
      while (idx < lines.length) {
        const cleanLine = (lines[idx] || "").trim();
        if (/^\d+$/.test(cleanLine)) {
          number = parseInt(cleanLine);
          idx++;
          break;
        }
        if (cleanLine === "" || cleanLine.includes("勝負服") || cleanLine === "ブリンカー" || /^\[[外地抽]\]$/.test(cleanLine)) {
          idx++;
        } else {
          break;
        }
      }
    }

    // Skip any pre-name elements like "勝負服", "ブリンカー", or icons
    while (idx < lines.length) {
      const cleanLine = (lines[idx] || "").trim();
      if (cleanLine === "" || cleanLine.includes("勝負服") || cleanLine.includes("ブリンカー") || /^\[[外地抽]\]$/.test(cleanLine)) {
        if (cleanLine.includes("ブリンカー")) hasBlinker = true;
        idx++;
      } else {
        break;
      }
    }

    // カタカナの「マルガイ」「マルチ」の誤削除を廃止し、正式な馬名そのまま登録する
    name = (lines[idx] || "").trim(); idx++;

    // 直後の数行を先読みして、馬主・生産牧場・調教師を順に取得するパターン (Netkeiba JRA出馬表縦並び)
    const tempLines: {text: string, idx: number}[] = [];
    let tempIdx = idx;
    while(tempIdx < lines.length && tempLines.length < 4) {
       const cl = lines[tempIdx].trim();
       if(cl !== "" && !/^\d+$/.test(cl) && !cl.includes("勝負服")) {
          tempLines.push({text: cl, idx: tempIdx});
       }
       tempIdx++;
    }
    if (tempLines.length >= 4 && (tempLines[3].text.startsWith("父：") || tempLines[3].text.startsWith("父:"))) {
       owner = tempLines[0].text;
       breeder = tempLines[1].text;
       const tmMatch = tempLines[2].text.match(/^(.+?)\s*[\(（]([栗美][東浦])[\)）]/);
       if (tmMatch) {
         trainer = tmMatch[1].trim();
         stableLocation = tmMatch[2];
       } else {
         trainer = tempLines[2].text;
       }
       idx = tempLines[3].idx; // Advance idx to the '父：' line so the main loop can parse pedigree
    }

    while (idx < lines.length && (lines[idx] === "" || /^\d+$/.test(lines[idx].trim()) || lines[idx].includes("勝負服"))) {
      if (idx >= tempLines[3]?.idx) break; // If we advanced, don't skip over Sire
      idx++;
    }
  } else {
    while (idx < lines.length) {
      const cleanLine = (lines[idx] || "").trim();
      if (cleanLine === "" || cleanLine.includes("勝負服") || cleanLine.includes("ブリンカー") || /^\[[外地抽]\]$/.test(cleanLine)) {
        if (cleanLine.includes("ブリンカー")) hasBlinker = true;
        idx++;
      } else {
        break;
      }
    }
  }

  // Extract remaining fields using heuristics to handle different copy-paste layouts (table vs list)
  const unrecognizedLines: string[] = [];
  while (idx < lines.length) {
    const l = (lines[idx] || "").trim();
    
    if (l === "" || l.includes("勝負服") || l === "B" || l === "☆" || l === "勝負服の画像" || l === "ブリンカー") {
      idx++; continue;
    }

    // Past races start
    if (l.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/)) {
      break;
    }

    // Gender and Age
    const gm = l.match(/^([牡牝セ]|せん)(\d+)(?:\/(.*))?$/);
    if (gm) {
      gender = (gm[1] === "セ" || gm[1] === "せん") ? "セン" : gm[1] as "牡"|"牝";
      age = parseInt(gm[2]);
      if (gm[3]) coatColor = gm[3].trim();
      idx++; continue;
    }

    // Horse Weight (e.g. "474kg(+14)" or "474kg")
    const wm = l.match(/^(\d{3})(?:kg)?(?:\(([+-]?\d+|初出走)\))?$/);
    if (wm) {
      horseWeight = parseInt(wm[1]);
      if (wm[2]) {
        horseWeightChange = wm[2] === "初出走" ? 0 : parseInt(wm[2]) || 0;
      }
      idx++;
      continue;
    }

    // Kinryo (55.0) or Kinryo + Jockey (e.g. "55.0 ルメール", "55.0☆ルメール", "55.0(ルメール)")
    const kinryoJockeyMatch = l.match(/^(\d{2}(?:\.\d)?)(?:kg)?\s*[☆△▲◇☆★]?\s*([^\d\.\s\(（]+)/);
    
    if (kinryoJockeyMatch && kinryoJockeyMatch[2].trim() !== "kg" && parseFloat(kinryoJockeyMatch[1]) >= 48 && parseFloat(kinryoJockeyMatch[1]) <= 65) {
      kinryo = parseFloat(kinryoJockeyMatch[1]);
      jockey = kinryoJockeyMatch[2].replace(/^[☆△▲◇☆★]/, "").trim();
      idx++;
      continue;
    } else if (l.match(/^\d{2}\.\dkg$/) || (l.match(/^\d{2}\.\d$/) && parseFloat(l) >= 48 && parseFloat(l) <= 65)) {
      kinryo = parseFloat(l.replace("kg", "")); 
      idx++; 
      
      // Usually Jockey comes right after Kinryo in table format
      let tempIdx = idx;
      while(tempIdx < lines.length && lines[tempIdx].trim() === "") tempIdx++;

      if (tempIdx < lines.length && !lines[tempIdx].match(/\d/)) {
        const nextLine = lines[tempIdx].trim();
        const isOwner = nextLine.includes("(有)") || nextLine.includes("(株)") || nextLine.includes("レーシング") || nextLine.includes("ファーム") || nextLine.includes("ホールディングス") || nextLine.includes("牧場") || nextLine.includes("クラブ") || nextLine.includes("組合");
        
        if (isOwner) {
           if (!owner) owner = nextLine;
           idx = tempIdx + 1;
        } else {
           jockey = nextLine.replace(/^[☆△▲◇☆★]/, "").trim();
           idx = tempIdx + 1;
        }
      }

      // Usually Trainer comes after Jockey
      if (idx < lines.length && !lines[idx].match(/\d/) && !trainer) {
        const tmLine = lines[idx].trim();
        const tmMatch = tmLine.match(/^(.+?)\s*[\(（]([栗美][東浦])[\)）]/);
        if (tmMatch) {
          trainer = tmMatch[1].trim();
          stableLocation = tmMatch[2];
        } else {
          // Netkeiba sometimes has "栗東" then "木村" on next line
          if (tmLine.match(/^[栗美][東浦]$/)) {
            stableLocation = tmLine;
            idx++;
            if (idx < lines.length) trainer = lines[idx].trim();
          } else {
            trainer = tmLine;
          }
        }
        idx++;
      }
      
      continue;
    }

    // Odds
    if (l.match(/^[\d\.]+$/)) {
      const val = parseFloat(l);
      if (!isNaN(val) && val > 0) {
        odds = val;
        idx++;
        continue;
      }
    }

    // Popularity (e.g. "13番人気" or "(13番人気)")
    const pm = l.match(/^\(?(\d+)番人気\)?$/);
    if (pm) { popularity = parseInt(pm[1]); idx++; continue; }

    // Trainer with stable
    const tm = l.match(/^(.+?)\s*[\(（]([栗美][東浦])[\)）]$/);
    if (tm && !trainer) { trainer = tm[1].trim(); stableLocation = tm[2]; idx++; continue; }

    // Pedigree
    if (l.startsWith("父：") || l.startsWith("父:")) {
      if (unrecognizedLines.length >= 3) {
        if (!owner) owner = unrecognizedLines[unrecognizedLines.length - 3];
        if (!breeder) breeder = unrecognizedLines[unrecognizedLines.length - 2];
        if (!trainer) {
          trainer = unrecognizedLines[unrecognizedLines.length - 1];
          const tm = trainer.match(/^(.+?)\s*[\(（]([栗美][東浦])[\)）]/);
          if (tm) { trainer = tm[1].trim(); stableLocation = tm[2]; }
        }
      }
      sire = l.replace(/^父[：:]/, "").trim();
      if (!sire && idx + 1 < lines.length) { sire = lines[idx + 1].trim(); idx++; }
      idx++; continue;
    }
    if (l.startsWith("母：") || l.startsWith("母:")) {
      dam = l.replace(/^母[：:]/, "").trim();
      if (!dam && idx + 1 < lines.length) { dam = lines[idx + 1].trim(); idx++; }
      idx++; continue;
    }
    if (l.includes("母の父")) {
      bms = l.replace(/^.*?母の父[：:]?/, "").replace(/[\(\)（）]/g, "").trim();
      idx++; continue;
    }

    // Unknown string without numbers is probably jockey if we haven't found it yet
    if (!l.match(/\d/)) {
      const isOwnerKeywords = l.includes("(有)") || l.includes("(株)") || l.includes("レーシング") || l.includes("ファーム") || l.includes("ホールディングス") || l.includes("牧場") || l.includes("クラブ") || l.includes("組合");
      
      // JRA公式PC版では、馬体重の直後に「馬主」「生産者」「調教師」と続く傾向がある
      // すでに馬主が埋まっておらず、前後のフィールド状況から騎手より馬主である可能性が高い場合
      if (isOwnerKeywords || (!owner && horseWeight > 0 && !trainer && lines[idx+1] === "")) {
        if (!owner) owner = l;
        idx++; continue;
      }
      if (isOwnerKeywords && owner && !breeder) {
        breeder = l;
        idx++; continue;
      }
      if (!jockey && !isOwnerKeywords && kinryo > 0 && lines[idx-1] === "") { jockey = l; idx++; continue; }
      if (!trainer && !l.match(/^[栗美][東浦]$/) && !isOwnerKeywords) { trainer = l; idx++; continue; }
    }

    idx++; // Skip unrecognized lines
  }

  const pastRaces: PastRace[] = [];
  while (idx < lines.length && pastRaces.length < 5) {
    const dl = lines[idx] || "";
    const dm = dl.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
    if (!dm) { idx++; continue; }

    const prDate = `${dm[1]}-${String(dm[2]).padStart(2,"0")}-${String(dm[3]).padStart(2,"0")}`;
    const dlParts = dl.split(/[\t\s]+/);
    let prVenue = dlParts[dlParts.length - 1]?.trim() || "";
    idx++;
    if (prVenue === dm[0] || prVenue.match(/^\d{4}年/)) {
      prVenue = lines[idx] || ""; idx++;
    }

    const prRaceName = lines[idx] || ""; idx++;
    const prRaceClass = lines[idx] || ""; idx++;

    const rl = lines[idx] || "";
    const rm = rl.match(/(\d+)着/);
    const prResult = rm ? parseInt(rm[1]) : 0;
    let prHeadCount = 0, prFrameNumber = 0;
    const hm = rl.match(/(\d+)頭\s*(\d+)番/);
    if (hm) { prHeadCount = parseInt(hm[1]); prFrameNumber = parseInt(hm[2]); }
    idx++;

    let prPopularity = 0;
    const popM = (lines[idx] || "").match(/(\d+)番人気/);
    if (popM) { prPopularity = parseInt(popM[1]); idx++; }

    const jl = lines[idx] || "";
    const prJockey = jl.split(/[\t\s]+/)[0]?.trim().replace(/^[▲△☆◇]/, "") || "";
    let prKinryo = 0;
    const kjm = jl.match(/(\d+\.?\d*)kg/);
    if (kjm) prKinryo = parseFloat(kjm[1]);
    idx++;

    const distL = lines[idx] || "";
    const distM2 = distL.match(/(\d+)(ダ|芝|障)/);
    const prDist = distM2 ? parseInt(distM2[1]) : 0;
    const prSurf: PastRace["surface"] = (distM2?.[2] === "障" || distL.includes("障")) ? "障害" : ((distM2?.[2] === "芝" || distL.includes("芝")) ? "芝" : "ダート");
    idx++;

    const tl = lines[idx] || "";
    const prTime = /\d+:\d+/.test(tl) ? tl.trim() : "";
    if (prTime) idx++;

    while (idx < lines.length && lines[idx] === "") idx++;

    const condCands = ["良","稍重","重","不良"];
    let prCond: PastRace["condition"] = "良";
    if (condCands.includes(lines[idx] || "")) { prCond = lines[idx] as PastRace["condition"]; idx++; }

    if (/^\d{2,3}$/.test(lines[idx] || "")) idx++;

    const wl = lines[idx] || "";
    const wm2 = wl.match(/^(\d+)kg/);
    const prWeight = wm2 ? parseInt(wm2[1]) : 480;
    if (wm2) idx++;

    while (idx < lines.length && lines[idx] === "") idx++;

    let passingPositions = "";
    const posL = lines[idx] || "";
    if (/^\d+(?:[\t\-]\d+)+$/.test(posL)) {
      passingPositions = posL.replace(/\t/g, "-");
      idx++;
    }

    let last3fTime = "";
    const f3l = lines[idx] || "";
    const f3m = f3l.match(/3F\s*(\d+\.\d)/) || f3l.match(/^(\d{2}\.\d)$/);
    if (f3m) { last3fTime = f3m[1]; idx++; }

    let winnerName = "";
    let timeDiff: number | undefined;
    
    let tempIdx = idx;
    while (tempIdx < lines.length && tempIdx < idx + 3) {
      const wn = (lines[tempIdx] || "").trim();
      if (!wn) { tempIdx++; continue; }
      const wnm = wn.match(/^(.+?)\(([-+]?\d+\.?\d*)\)$/) || wn.match(/^(.+?)\(([-+]?\d+)\)$/);
      if (wnm && /[\u3040-\u9FFF\u30A0-\u30FF\uFF00-\uFFEF]/.test(wnm[1])) {
        winnerName = wnm[1].trim();
        timeDiff = parseFloat(wnm[2]);
        idx = tempIdx + 1;
        break;
      }
      tempIdx++;
    }

    while (idx < lines.length && lines[idx] === "") idx++;

    // 出遅れフラグとペース表記の事前スキャン
    let isStumbled = false;
    let halonPace = "";
    
    let scanEnd = idx;
    while (scanEnd < lines.length) {
      const nextLine = lines[scanEnd] || "";
      if (scanEnd > idx && (nextLine.match(/\d{4}年\d{1,2}月\d{1,2}日/) || nextLine.startsWith("枠") || nextLine.includes("調教評価") || nextLine.includes("追切評価"))) {
        break;
      }
      scanEnd++;
    }

    for (let k = idx - 10; k < scanEnd; k++) {
      if (k < 0) continue;
      const scanLine = (lines[k] || "").trim();
      if (scanLine.includes("出遅") || scanLine.includes("ゲート不善")) {
        isStumbled = true;
      }
      const paceM = scanLine.match(/(\d{2}\.\d\s*-\s*\d{2}\.\d)/);
      if (paceM) {
        halonPace = paceM[1].replace(/\s+/g, "");
      }
    }

    if (prDate && prResult) {
      const corner4pos = passingPositions
        ? parseInt(passingPositions.split("-").pop() || "5")
        : 5;
      pastRaces.push({
        date: prDate, venue: prVenue, raceName: prRaceName, raceClass: prRaceClass,
        distance: prDist, surface: prSurf, condition: prCond,
        result: prResult,
        headCount: prHeadCount || undefined,
        frameNumber: prFrameNumber || undefined,
        popularity: prPopularity || undefined,
        jockeyWeight: prKinryo || undefined,
        time: prTime,
        corner4Position: corner4pos,
        cornerOuterCount: 1,
        passingPositions: passingPositions || undefined,
        last3fTime: last3fTime || undefined,
        weight: prWeight,
        jockey: prJockey,
        winnerName: winnerName || undefined,
        timeDiff,
        odds: 0, prize: 0,
        isStumbled: isStumbled || undefined,
        halonPace: halonPace || undefined
      });
    }
  }

  const calculatedStyle = estimateStyle(pastRaces);

  return {
    id: generateId(), number, frame, name, age, gender,
    coatColor,
    weight: horseWeight, weightChange: horseWeightChange,
    jockey: jockey.replace(/\s+/g, " "), jockeyWeight: kinryo,
    trainer, owner, breeder, sire, dam, bms,
    stableLocation: stableLocation as Horse["stableLocation"],
    bloodline: [sire, bms].filter(Boolean).join(" / "),
    style: calculatedStyle, odds, popularity, pastRaces,
    useBlinkers: hasBlinker,
    trainingTime: trainingTime || undefined,
    trainingRating: trainingRating || undefined,
  };
}

// ==========================================
// 楽天競馬出馬表パーサー - フルデータ対応版
// ==========================================
function parseResultString(str: string): [number, number, number, number] | undefined {
  if (!str || !str.match(/^\d+$/)) return undefined;
  if (str.length === 4) {
      return [parseInt(str[0]), parseInt(str[1]), parseInt(str[2]), parseInt(str[3])];
  } else if (str.length === 5) {
      return [parseInt(str[0]), parseInt(str[1]), parseInt(str[2]), parseInt(str.slice(3))];
  } else if (str.length > 5) {
      return [parseInt(str[0]), parseInt(str[1]), parseInt(str[2]), parseInt(str.slice(3))];
  }
  return undefined;
}

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
  date: string; distance: number; surface: Race["surface"];
  condition: Race["condition"]; headCount: number; raceName: string;
} {
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l !== '');
  
  let date = "";
  let venue = "";
  let raceNumber = 0;
  let distance = 0;
  let surface: Race["surface"] = "ダート";
  let condition: Race["condition"] = "良";
  let raceName = "";
  
  for (let i = 0; i < Math.min(lines.length, 50); i++) {
      const line = lines[i];
      const dateMatch = line.match(/^(\d{4}年\d{1,2}月\d{1,2}日)（[^）]+）\s*\d+回([^0-9]+)\d+日\s*(\d+)レース/);
      if (dateMatch) {
           date = dateMatch[1].replace(/年|月/g, '-').replace('日', '');
           venue = dateMatch[2].trim();
           raceNumber = parseInt(dateMatch[3]);
      }
      
      const distMatch = line.match(/コース：([\d,]+)メートル（(ダート|芝|障害)・/);
      if (distMatch) {
          distance = parseInt(distMatch[1].replace(',', ''));
          surface = distMatch[2] === "ダート" ? "ダート" : (distMatch[2] === "芝" ? "芝" : "障害");
      }

      if (line.match(/^20\d{2}年\d{1,2}月\d{1,2}日/) && !dateMatch) {
          const m = line.match(/(\d+)回([^0-9]+)\d+日\s+発走時刻：/);
          if (m) {
              venue = m[2].trim();
          }
      }
      if (line.includes("歳未勝利") || line.includes("歳以上") || line.includes("新馬")) {
          if (!raceName) raceName = line;
      }
  }
  
  const horses: Horse[] = [];
  const blockStarts: number[] = [];
  
  for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(/^枠[1-8][白黒赤青黄緑橙桃]\s*(\d+)/)) {
          blockStarts.push(i);
      }
  }
  
  for (let i = 0; i < blockStarts.length; i++) {
      const start = blockStarts[i];
      const end = i < blockStarts.length - 1 ? blockStarts[i+1] : lines.length;
      const horseBlock = lines.slice(start, end);
      
      const line1Match = horseBlock[0].match(/^枠([1-8])[白黒赤青黄緑橙桃]\s*(\d+)/);
      let frame = line1Match ? parseInt(line1Match[1]) : 0;
      let number = line1Match ? parseInt(line1Match[2]) : 0;
      
      let offset = 1;
      if (horseBlock[offset] === 'ブリンカー着用') offset++;
      let name = horseBlock[offset]; offset++;
      let odds = parseFloat(horseBlock[offset]); offset++;
      let pop = 0;
      if (horseBlock[offset].match(/\((\d+)番人気\)/)) {
          pop = parseInt(horseBlock[offset].match(/\((\d+)番人気\)/)![1]);
          offset++;
      }
      
      let horseWeight = 0;
      let horseWeightChange = 0;
      if (horseBlock[offset].match(/^(\d{3})kg\(([-+]?\d+|初出走)\)/)) {
          const hwMatch = horseBlock[offset].match(/^(\d{3})kg\(([-+]?\d+|初出走)\)/)!;
          horseWeight = parseInt(hwMatch[1]);
          if (hwMatch[2] !== '初出走') horseWeightChange = parseInt(hwMatch[2]);
          offset++;
      }
      
      let owner = horseBlock[offset]; offset++;
      let breeder = horseBlock[offset]; offset++;
      let trainer = horseBlock[offset].replace(/\([^\)]+\)/, '').trim(); offset++;
      
      let sire = horseBlock[offset].replace('父：', ''); offset++;
      let dam = horseBlock[offset].replace('母：', ''); offset++;
      let bms = horseBlock[offset].replace('(母の父：', '').replace(')', ''); offset++;
      
      if (horseBlock[offset] === '勝負服の画像') offset++;
      
      let sex: Horse["gender"] = "牡", age = 0, coat = "";
      const sexAgeMatch = horseBlock[offset].match(/^([牡牝セセン])(\d+)\/(.+)$/);
      if (sexAgeMatch) {
           sex = (sexAgeMatch[1] === "セ" || sexAgeMatch[1] === "セン") ? "セン" : sexAgeMatch[1] as Horse["gender"];
           age = parseInt(sexAgeMatch[2]);
           coat = sexAgeMatch[3];
           offset++;
      }
      
      let weight = parseFloat(horseBlock[offset].replace('kg', '')); offset++;
      let jockey = horseBlock[offset]; offset++;
      
      const pastRaces: PastRace[] = [];
      
      for (let j = offset; j < horseBlock.length; j++) {
          const dateVenueMatch = horseBlock[j].match(/^(\d{4}年\d{1,2}月\d{1,2}日)\s+(.+)$/);
          if (dateVenueMatch) {
              let prDate = dateVenueMatch[1].replace(/年|月/g, '-').replace('日', '');
              let prVenue = dateVenueMatch[2]; j++;
              let prRaceName = horseBlock[j]; j++;
              
              let result = 0, headCount = 0;
              let resMatch = horseBlock[j].match(/(\d+)着\s*(\d+)頭/);
              if (resMatch) {
                  result = parseInt(resMatch[1]);
                  headCount = parseInt(resMatch[2]);
              } j++;
              
              let prPop = 0;
              if (horseBlock[j].match(/(\d+)番人気/)) {
                  prPop = parseInt(horseBlock[j].match(/(\d+)番人気/)![1]);
              } j++;
              
              let prJockey = "", prJWeight = 55;
              let jwMatch = horseBlock[j].match(/^(.+?)\s+([\d.]+)kg/);
              if (jwMatch) {
                  prJockey = jwMatch[1];
                  prJWeight = parseFloat(jwMatch[2]);
              } j++;
              
              let prDist = 0, prSurf: Race["surface"] = "ダート";
              let dsMatch = horseBlock[j].match(/(\d+)(ダ|芝|障)/);
              if (dsMatch) {
                  prDist = parseInt(dsMatch[1]);
                  prSurf = dsMatch[2] === "ダ" ? "ダート" : (dsMatch[2] === "芝" ? "芝" : "障害");
              } j++;
              
              let prTime = horseBlock[j]; j++;
              
              let prCond: PastRace["condition"] = "良";
              if (horseBlock[j].match(/^(良|稍重|重|不良|稍|不)$/)) {
                  let c = horseBlock[j];
                  if (c === "稍") prCond = "稍重";
                  else if (c === "不") prCond = "不良";
                  else prCond = c as PastRace["condition"];
              } j++;
              
              let prHWeight = 0;
              if (horseBlock[j] && horseBlock[j].match(/(\d{3})kg/)) {
                  prHWeight = parseInt(horseBlock[j].match(/(\d{3})kg/)![1]);
              } j++;
              
              let prPassing = horseBlock[j] ? horseBlock[j].replace(/\s+/g, '-') : ""; j++;
              
              let pr3f = "";
              if (horseBlock[j] && horseBlock[j].startsWith("3F")) {
                   pr3f = horseBlock[j].replace("3F", "").trim(); j++;
              }
              
              let prWinner = horseBlock[j] || "";
              let timeDiff = 0;
              if (prWinner.includes("(")) {
                  const diffM = prWinner.match(/\(([-+]?[\d.]+)\)$/);
                  if (diffM) timeDiff = parseFloat(diffM[1]);
                  prWinner = prWinner.replace(/\([-+]?[\d.]+\)$/, '');
              }
              
              pastRaces.push({
                   date: prDate,
                   venue: prVenue,
                   raceName: prRaceName,
                   raceClass: prRaceName,
                   distance: prDist,
                   surface: prSurf,
                   condition: prCond,
                   result: result,
                   headCount: headCount,
                   popularity: prPop,
                   jockey: prJockey,
                   jockeyWeight: prJWeight,
                   time: prTime,
                   weight: prHWeight,
                   passingPositions: prPassing,
                   last3fTime: pr3f,
                   winnerName: prWinner,
                   timeDiff: timeDiff,
                   odds: 0,
                   prize: 0
              });
          }
      }
      
      horses.push({
          id: generateId(),
          number, frame, name, horseWeight, horseWeightChange,
          owner, breeder, trainer, sire, dam, bms, bloodline: sire, gender: sex, age, coatColor: coat,
          weight: horseWeight, jockeyWeight: weight, jockey, odds, popularity: pop, pastRaces,
          style: estimateStyle(pastRaces)
      });
  }
  
  return { date, venue, raceNumber, distance, surface, condition, headCount: horses.length, raceName, horses };
}

export function parseRakutenKeibaResultText(rawText: string): { race: Partial<Race>, result: RaceResult } {
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l !== '');
  
  const race: Partial<Race> = {
      date: "",
      venue: "",
      raceNumber: 0,
      distance: 0,
      surface: "ダート",
      condition: "良",
      raceName: ""
  };
  
  const result: RaceResult = {
      raceId: "",
      result: [],
      lapTimes: [],
      last4fTime: "",
      last3fTime: "",
      cornerPassings: []
  };

  for (let i = 0; i < Math.min(lines.length, 60); i++) {
      const line = lines[i];
      const vrMatch = line.match(/^(.+)競馬場\s+(\d+)R/);
      if (vrMatch && !race.venue) {
          race.venue = vrMatch[1];
          race.raceNumber = parseInt(vrMatch[2]);
      }
      
      const dateMatch = line.match(/^(\d{4}年\d{1,2}月\d{1,2}日)/);
      if (dateMatch) {
          race.date = dateMatch[1].replace(/年|月/g, '-').replace('日', '');
      }
      
      const distMatch = line.match(/^(ダ|芝)(\d{1,3}(?:,\d{3})?)m/);
      if (distMatch) {
          race.surface = distMatch[1] === "ダ" ? "ダート" : "芝";
          race.distance = parseInt(distMatch[2].replace(',', ''));
      }
      const condMatch = line.match(/(ダ|芝)：(良|稍重|重|不良)/);
      if (condMatch) {
          race.condition = condMatch[2] as Race["condition"];
      }
  }
  
  result.raceId = `${race.date}_${race.venue}_${race.raceNumber}`;
  
  let inResultBlock = false;
  let inTimeBlock = false;
  let inCornerBlock = false;
  
  for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line === "■全着順") {
          inResultBlock = true;
          while (i + 1 < lines.length && !lines[i + 1].match(/^\d+\s+\d+\s+\d+/)) {
              i++;
          }
          continue;
      }
      if (line === "■タイム") {
          inResultBlock = false;
          inTimeBlock = true;
          continue;
      }
      if (line === "■コーナー通過順位") {
          inTimeBlock = false;
          inCornerBlock = true;
          continue;
      }
      if (line === "■払戻金") {
          inCornerBlock = false;
          break; 
      }
      
      if (inResultBlock) {
          const rowMatch = line.match(/^(\d+)\s+(\d+)\s+(\d+)\s+(.+?)\s+([牡牝セセン]\d+\s*\/[^	\s]+)\s+([\d.]+)\s+(\d+)/);
          if (rowMatch) {
              const rank = parseInt(rowMatch[1]);
              const frame = parseInt(rowMatch[2]);
              const number = parseInt(rowMatch[3]);
              const name = rowMatch[4];
              const weight = parseInt(rowMatch[7]);
              
              i++;
              const line2 = lines[i];
              let weightChange = 0;
              let jockey = "";
              if (line2) {
                  const pMatch = line2.match(/^([-+±]?\d+)\s+(.+)$/);
                  if (pMatch) {
                      weightChange = pMatch[1] === "±0" ? 0 : parseInt(pMatch[1]);
                      jockey = pMatch[2].trim();
                  }
              }
              
              i++;
              const line3 = lines[i];
              let time = "", margin = "", last3f = "", trainer = "", popularity = 0;
              if (line3) {
                  const parts = line3.split('\t').map(p => p.trim());
                  if (parts.length >= 6) {
                      time = parts[1];
                      margin = parts[2];
                      last3f = parts[3];
                      trainer = parts[4];
                      popularity = parseInt(parts[5]);
                  } else {
                      const m3 = line3.match(/\)\s+([\d:.]+)\s*(.*?)\s+([\d.]+)\s+(.+?)\s+(\d+)$/);
                      if (m3) {
                          time = m3[1]; margin = m3[2]; last3f = m3[3]; trainer = m3[4]; popularity = parseInt(m3[5]);
                      }
                  }
              }
              
              result.result.push({
                  rank,
                  horseNumber: number,
                  horseName: name,
                  time,
                  margin,
                  last3f,
                  trainer,
                  popularity,
                  weight,
                  weightChange,
                  jockey,
                  odds: 0,
                  prize: 0
              });
          }
      }
      
      if (inTimeBlock) {
          if (line.startsWith("ハロンタイム")) {
              const lapsStr = line.replace("ハロンタイム", "").trim();
              result.lapTimes = lapsStr.split('-').map(s => s.trim());
          }
          if (line.startsWith("上がり")) {
              const agariStr = line.replace("上がり", "").trim();
              const m4f = agariStr.match(/4F\s+([\d.]+)/);
              if (m4f) result.last4fTime = m4f[1];
              const m3f = agariStr.match(/3F\s+([\d.]+)/);
              if (m3f) result.last3fTime = m3f[1];
          }
      }
      
      if (inCornerBlock) {
          if (line.match(/^[１-４]角/)) {
              result.cornerPassings?.push(line.trim());
          }
      }
  }
  
  return { race, result };
}
