import { Horse, PastRace, Race } from "../types";
import { generateId } from "./storage";

// ==========================================
// フォーマット自動判別
// ==========================================
export function detectFormat(text: string): "jra" | "nar" | "rakuten" {
  if (text.includes("楽天競馬") || text.includes("Rakuten Mobile")) return "rakuten";
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
  // レース情報が集まっている先頭20行程度から検索する（馬名や所属による誤爆を防ぐため）
  const headLines = text.split("\n").slice(0, 20).join("\n");
  
  // 「大井 11R」や「東京11R」のような明確なパターンを優先
  for (const track of ALL_TRACKS) {
    if (new RegExp(`${track}\\s*\\d+R`).test(headLines)) {
      return track;
    }
  }

  // 単純な出現確認（ヘッダー部分のみ）
  for (const track of ALL_TRACKS) {
    if (headLines.includes(track)) {
      return track;
    }
  }
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

  // ヘッダー解析: "3回京都6日 11R"
  const headerMatch = rawText.match(/(\d+)回(.+?)(\d+)日\s*(\d+)R/);
  const venue = headerMatch?.[2]?.trim() || extractVenue(rawText) || "";
  const raceNumber = headerMatch ? parseInt(headerMatch[4]) : 1;

  // レース名・距離・馬場・条件
  let raceName = "";
  let distance = 0;
  let surface: Race["surface"] = "ダート";
  let condition: Race["condition"] = "良";
  for (let i = 0; i < Math.min(lines.length, 30); i++) {
    const l = lines[i];
    const dm = l.match(/(\d{3,4})(ダ|芝|障)/);
    if (dm) { distance = parseInt(dm[1]); surface = dm[2] === "障" ? "障害" : (dm[2] === "芝" ? "芝" : "ダート"); }
    if (/^(良|稍重|重|不良)$/.test(l) && !condition) condition = l as Race["condition"];
    if (l.match(/(S|G)[Ⅰ-Ⅲ]|リステッド|特別|勝クラス|OP|オープン/) && !raceName) raceName = l;
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
    horses, venue, raceNumber, raceName, distance: distance || undefined, surface, condition, headCount: horses.length,
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

    // Horse Weight
    const wm = l.match(/^(\d+)kg$/) || l.match(/^(\d{3})$/);
    if (wm) {
      horseWeight = parseInt(wm[1]);
      idx++;
      const nextLine = (lines[idx] || "").trim();
      const wcm = nextLine.match(/^\(([+-]?\d+|初出走)\)$/);
      if (wcm) { horseWeightChange = wcm[1] === "初出走" ? 0 : parseInt(wcm[1]) || 0; idx++; }
      continue;
    }

    // Kinryo (55.0) or Kinryo + Jockey (e.g. "55.0 ルメール", "55.0☆ルメール", "55.0(ルメール)")
    const kinryoJockeyMatch = l.match(/^(\d{2}(?:\.\d)?)(?:kg)?\s*[☆△▲◇☆★]?\s*([^\d\.\s\(（]+)/);
    
    if (kinryoJockeyMatch && kinryoJockeyMatch[2].trim() !== "kg" && parseFloat(kinryoJockeyMatch[1]) >= 48 && parseFloat(kinryoJockeyMatch[1]) <= 65) {
      kinryo = parseFloat(kinryoJockeyMatch[1]);
      jockey = kinryoJockeyMatch[2].trim();
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
           jockey = nextLine;
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

    // Popularity
    const pm = l.match(/^(\d+)番人気$/);
    if (pm) { popularity = parseInt(pm[1]); idx++; continue; }

    // Trainer with stable
    const tm = l.match(/^(.+?)\s*[\(（]([栗美][東浦])[\)）]$/);
    if (tm && !trainer) { trainer = tm[1].trim(); stableLocation = tm[2]; idx++; continue; }

    // Pedigree
    if (l.startsWith("父：") || l.startsWith("父:")) {
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
      const isOwner = l.includes("(有)") || l.includes("(株)") || l.includes("レーシング") || l.includes("ファーム") || l.includes("ホールディングス") || l.includes("牧場") || l.includes("クラブ") || l.includes("組合");
      if (isOwner) { owner = l; idx++; continue; }
      if (!jockey && !isOwner) { jockey = l; idx++; continue; }
      if (!trainer && !l.match(/^[栗美][東浦]$/) && !isOwner) { trainer = l; idx++; continue; }
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
    // 1	1	-	ジャングルポケット
    const startMatch = line.match(/^(\d+)\s+(\d+)\s+([^\s]+)\s+(.+)$/);
    if (startMatch) {
      const frame = parseInt(startMatch[1]);
      const number = parseInt(startMatch[2]);
      const sire = startMatch[4];
      
      if (lineIndex + 15 < lines.length) {
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
            if (lines[j].match(/^\d{3}\s*\d{3}$/)) {
                horseWeight = parseInt(lines[j].split(/\s+/)[0]);
            } else if (lines[j].match(/^[+-]\d+$/)) {
                horseWeightChange = parseInt(lines[j]);
            }
        }

        horses.push({
          id: generateId(),
          number,
          frame,
          name,
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
          pastRaces: [],
          stableLocation: affiliation || "地方",
        });
      }
      lineIndex += 15;
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

