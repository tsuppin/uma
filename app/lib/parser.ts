import { Horse, PastRace, Race } from "../types";
import { generateId } from "./storage";

// ==========================================
// フォーマット自動判別
// ==========================================
export function detectFormat(text: string): "jra" | "nar" {
  if (/枠\d[白黒赤青黄緑橙桃]/.test(text)) return "jra";
  return "nar";
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
  let venue = "川崎", raceNumber = 1, distance = 1200, headCount = 0, raceName = "";
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
    if (/^\d+[\t\s]+\d+[\t\s]+[^\t\s]+/.test(l)) {
      if (!l.includes("頭") && !l.includes("番") && !l.includes("人") && !l.includes("kg") && !l.includes("m") && !l.includes(":") && !l.match(/\d{2}\/\d{2}\/\d{2}/)) {
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
    }
  }

  if (kinryoIdx !== -1) {
    const kMatch = lines[kinryoIdx].trim().match(/^\((\d{2,3}(?:\.\d)?)\)$/);
    if (kMatch) kinryo = parseFloat(kMatch[1]);

    if (kinryoIdx - 1 >= 0) jockey = lines[kinryoIdx - 1].trim();
    if (kinryoIdx + 1 < profileEndIdx) trainer = lines[kinryoIdx + 1].trim();
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
      const prSurf: PastRace["surface"] = courseAttr.includes("芝") ? "芝" : "ダート";

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
    stableLocation: "地方"
  };
}

// ==========================================
// JRA出馬表パーサー（中央競馬）- フルデータ対応版
// ==========================================
export function parseJRAText(rawText: string): {
  horses: Horse[]; venue: string; raceNumber: number;
  date?: string; raceName?: string; distance?: number; surface?: Race["surface"]; condition?: Race["condition"]; headCount?: number;
} {
  const lines = rawText.split("\n").map(l => l.trim());

  // ヘッダー解析: "3回京都6日 11R"
  const headerMatch = rawText.match(/(\d+)回(.+?)(\d+)日\s*(\d+)R/);
  const venue = headerMatch?.[2]?.trim() || "";
  const raceNumber = headerMatch ? parseInt(headerMatch[4]) : 1;

  // レース名・距離・馬場・条件
  let raceName = "";
  let distance = 0;
  let surface: Race["surface"] = "ダート";
  let condition: Race["condition"] = "良";
  for (let i = 0; i < Math.min(lines.length, 30); i++) {
    const l = lines[i];
    const dm = l.match(/(\d{3,4})(ダ|芝)/);
    if (dm) { distance = parseInt(dm[1]); surface = dm[2] === "芝" ? "芝" : "ダート"; }
    if (/^(良|稍重|重|不良)$/.test(l) && !condition) condition = l as Race["condition"];
    if (l.match(/(S|G)[Ⅰ-Ⅲ]|リステッド|特別|勝クラス|OP|オープン/) && !raceName) raceName = l;
  }

  const blockStarts: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    // 枠番の検出を大幅に強化 (行頭のスペース、枠と数値の間のスペース/タブ/全角スペースの揺れに完全対応)
    if (/^[\s\t　]*枠[\s\t　]*\d/.test(lines[i])) {
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

  return { horses, venue, raceNumber, raceName, distance: distance || undefined, surface, condition, headCount: horses.length };
}

function parseJRAHorse(lines: string[]): Partial<Horse> | null {
  if (!lines[0]) return null;

  const frameMatch = lines[0].match(/枠[\s\t　]*(\d)/);
  const frame = frameMatch ? parseInt(frameMatch[1]) : 1;
  const tabParts = lines[0].split(/\t/);
  let number = tabParts[1] ? parseInt(tabParts[1].trim()) : 0;
  let idx = 1;

  // 馬番のパースを極限まで頑健化 (前後のスペース・タブのトリム、ブリンカーや空行の自動スキップに対応)
  if (!number) {
    while (idx < lines.length) {
      const cleanLine = (lines[idx] || "").trim();
      if (/^\d+$/.test(cleanLine)) {
        number = parseInt(cleanLine);
        idx++;
        break;
      }
      if (cleanLine === "" || cleanLine === "ブリンカー" || cleanLine === "勝負服の画像") {
        idx++;
      } else {
        break;
      }
    }
  }

  let hasBlinker = false;
  if ((lines[idx] || "").includes("ブリンカー")) { hasBlinker = true; idx++; }

  // カタカナの「マルガイ」「マルチ」の誤削除を廃止し、正式な馬名そのまま登録する
  const name = (lines[idx] || "").trim(); idx++;
  while (idx < lines.length && (lines[idx] === "" || /^\d+$/.test(lines[idx].trim()))) idx++;

  const owner = lines[idx] || ""; idx++;
  while (idx < lines.length && (lines[idx] === "" || lines[idx] === "勝負服の画像")) idx++;

  const breeder = lines[idx] || ""; idx++;
  while (idx < lines.length && lines[idx] === "") idx++;

  let trainer = "";
  let stableLocation = "";
  const tm = (lines[idx] || "").match(/^(.+?)\s*[\(（]([栗美][東浦])[\)）]/);
  if (tm) { trainer = tm[1].trim(); stableLocation = tm[2]; idx++; }
  else if (lines[idx]) { trainer = lines[idx]; idx++; }

  let sire = "", dam = "", bms = "";
  while (idx < lines.length && (lines[idx] === "" || lines[idx].includes("："))) {
    const l = lines[idx];
    if (l === "父：") { idx++; sire = lines[idx] || ""; idx++; }
    else if (l === "母：") { idx++; dam = lines[idx] || ""; idx++; }
    else if (l.startsWith("(母の父：")) { bms = l.replace(/^\(母の父：/, "").replace(/\)$/, "").trim(); idx++; }
    else idx++;
  }

  let odds = 0, popularity = 0;
  while (idx < lines.length) {
    const l = lines[idx];
    if (/^\d+\.?\d+$/.test(l) && !l.includes(":")) { odds = parseFloat(l); idx++; break; }
    idx++;
  }
  const pm = (lines[idx] || "").match(/(\d+)番人気/);
  if (pm) { popularity = parseInt(pm[1]); idx++; }

  let horseWeight = 480, horseWeightChange = 0;
  let gender: Horse["gender"] = "牡"; let age = 4;
  let coatColor = "";
  let kinryo = 55;
  let jockey = "";

  while (idx < lines.length) {
    const l = lines[idx] || "";
    const wm = l.match(/^(\d+)kg/);
    if (wm) {
      horseWeight = parseInt(wm[1]); idx++;
      const wcm = (lines[idx] || "").match(/\(([+-]?\d+|初出走)\)/);
      if (wcm) { horseWeightChange = wcm[1] === "初出走" ? 0 : parseInt(wcm[1]) || 0; idx++; }
      break;
    }
    idx++;
  }
  while (idx < lines.length && (lines[idx] === "" || lines[idx] === "勝負服の画像")) idx++;

  const gm = (lines[idx] || "").match(/([牡牝セ]|せん)(\d+)\/(.+)/);
  if (gm) {
    gender = (gm[1] === "セ" || gm[1] === "せん") ? "セン" : gm[1] as "牡"|"牝";
    age = parseInt(gm[2]);
    coatColor = gm[3].trim();
    idx++;
  }
  while (idx < lines.length && lines[idx] === "") idx++;

  const kMatch = (lines[idx] || "").match(/(\d+\.?\d*)kg/);
  if (kMatch) { kinryo = parseFloat(kMatch[1]); idx++; }
  while (idx < lines.length && lines[idx] === "") idx++;

  jockey = (lines[idx] || "").trim(); idx++;
  while (idx < lines.length && lines[idx] === "") idx++;

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
    const distM2 = distL.match(/(\d+)(ダ|芝)/);
    const prDist = distM2 ? parseInt(distM2[1]) : 0;
    const prSurf: PastRace["surface"] = (distM2?.[2] === "芝" || distL.includes("芝")) ? "芝" : "ダート";
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
    const wn = lines[idx] || "";
    const wnm = wn.match(/^(.+?)\((\d+\.?\d*)\)$/);
    if (wnm && /[\u3040-\u9FFF\u30A0-\u30FF]/.test(wnm[1])) {
      winnerName = wnm[1].trim();
      timeDiff = parseFloat(wnm[2]);
      idx++;
    }

    while (idx < lines.length && lines[idx] === "") idx++;

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
  };
}
