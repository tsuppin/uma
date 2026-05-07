import { Horse, PastRace, Race } from "../types";
import { generateId } from "./storage";

// ==========================================
// フォーマット自動判別
// ==========================================
export function detectFormat(text: string): "jra" | "nar" {
  if (/枠\d[白黒赤青黄緑橙桃]/.test(text)) return "jra";
  return "nar";
}

// ==========================================
// NAR出馬表パーサー（地方競馬）
// ==========================================
export function parseNARText(rawText: string): {
  horses: Horse[]; venue: string; raceNumber: number;
  date: string; distance: number; surface: Race["surface"];
  condition: Race["condition"]; headCount: number; raceName: string;
} {
  const lines = rawText.split("\n").map(l => l.trim());

  // ヘッダー解析
  let date = new Date().toISOString().slice(0, 10);
  let venue = "大井", raceNumber = 1, distance = 1200, headCount = 0, raceName = "";
  const surface: Race["surface"] = "ダート";
  let condition: Race["condition"] = "良";

  for (let i = 0; i < Math.min(lines.length, 20); i++) {
    const l = lines[i];
    const dateM = l.match(/(\d{4})\/(\d+)\/(\d+)/);
    if (dateM) date = `${dateM[1]}-${String(dateM[2]).padStart(2,"0")}-${String(dateM[3]).padStart(2,"0")}`;

    const venueM = l.match(/^(.{1,6})\s+(\d+)R$/);
    if (venueM) { venue = venueM[1].trim(); raceNumber = parseInt(venueM[2]); }

    const distM = l.match(/(\d+)m.*?(\d+)頭/);
    if (distM) { distance = parseInt(distM[1]); headCount = parseInt(distM[2]); }

    const condM = l.match(/馬場状態[：:]\s*(.+)/);
    if (condM) {
      const c = condM[1].trim();
      if ((["良","稍重","重","不良"] as string[]).includes(c)) condition = c as Race["condition"];
    }

    // クラス名（Ｃ３〜 or レース名）
    if (/^[Ａ-Ｚ][０-９]/.test(l) || l.includes("クラス") || l.includes("特別")) raceName = l;
  }

  // 馬ブロック分割: 行が "枠 番 馬名" パターン
  const blockStarts: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    // 枠(1桁) 番(1-2桁) 馬名 のパターンをより柔軟に検知
    if (/^\d+[\t\s]+\d+[\t\s]+[^\t\s]+/.test(l)) blockStarts.push(i);
  }

  const horses: Horse[] = [];
  for (let bi = 0; bi < blockStarts.length; bi++) {
    const start = blockStarts[bi];
    const end = bi + 1 < blockStarts.length ? blockStarts[bi + 1] : lines.length;
    const h = parseNARHorse(lines.slice(start, end));
    if (h?.name) horses.push(h as Horse);
  }

  return { horses, venue, raceNumber, date, distance, surface, condition, headCount: headCount || horses.length, raceName };
}

function parseNARHorse(lines: string[]): Partial<Horse> | null {
  if (!lines[0]) return null;

  // "1 1 ジーティートレイン(大井)"
  const hp = lines[0].trim().split(/[\t\s]+/);
  if (hp.length < 3) return null;

  const frame = parseInt(hp[0]);
  const number = parseInt(hp[1]);
  const name = (hp[2] || "").replace(/\(.+?\)$/, "").trim();

  let idx = 1;
  let sire = "", dam = "";

  // 父・母の抽出 (全角・半角スペース両対応)
  while (idx < Math.min(lines.length, 10)) {
    const l = lines[idx].trim();
    if (l.includes("父") && !sire) { sire = l.replace(/^.*?父\s+/, "").trim(); idx++; }
    else if (l.includes("母") && !dam) { dam = l.replace(/^.*?母\s+/, "").trim(); idx++; }
    else if (l.match(/^[牡牝セ]|せん/)) break;
    else idx++;
  }

  // 性齢 "牡3"
  let gender: Horse["gender"] = "牡", age = 3;
  const gm = (lines[idx] || "").match(/([牡牝セ]|せん)(\d)/);
  if (gm) { gender = (gm[1] === "セ" || gm[1] === "せん") ? "セン" : gm[1] as "牡"|"牝"; age = parseInt(gm[2]); idx++; }

  // 毛色・増減などのメタデータ + オッズの探索
  let odds = 0, popularity = 0;
  while (idx < lines.length && !lines[idx].match(/\d{2}\/\d{2}\/\d{2}/)) {
    const l = lines[idx].trim();
    if (!l) { idx++; continue; }

    // オッズ判定 (例: "2.5" 単独行、または "2.5 (1)" 形式)
    const om = l.match(/^(\d+\.\d+)(?:\s*\((\d+)人\))?$/);
    if (om) {
      odds = parseFloat(om[1]);
      if (om[2]) popularity = parseInt(om[2]);
      idx++;
      continue;
    }

    if (l.match(/^[栗栃鹿黒青芦粕白]毛?$/) || l === "—" || l === "-" || l === "ー" || l === "未定") {
      idx++; continue;
    }
    
    // 馬体重
    const wm = l.match(/(\d+)kg/);
    if (wm) break; // 馬体重行に来たら抜ける
    
    // 騎手名らしきものがあればストップ
    if (l.length >= 2 && l.length <= 5 && !/\d/.test(l)) break;

    idx++;
  }

  // 馬体重・増減
  let weight = 480, weightChange = 0;
  if (lines[idx]) {
    const wm = lines[idx].match(/(\d+)kg/);
    if (wm) { weight = parseInt(wm[1]); idx++; }
  }
  
  if (lines[idx]) {
    const wcm = lines[idx].match(/\(([±+-]?\d+|初出走|[\d]+)\)/);
    if (wcm) {
      const val = wcm[1].replace("±", "");
      weightChange = val === "初出走" ? 0 : parseInt(val) || 0;
      idx++;
    }
  }

  // 騎手
  while (idx < lines.length && (lines[idx] === "" || lines[idx].match(/^[栗栃鹿黒青芦粕白]毛?$/) || lines[idx].includes("ブリンカー"))) idx++;

  let jockey = "", kinryo = 56;
  if (lines[idx]) {
    const rawJockey = lines[idx].replace(/^[▲△☆◇]/, "").trim();
    const jm = rawJockey.match(/^(.+?)\s+(\d+\.\d+|\d{2})$/);
    if (jm) {
      jockey = jm[1].trim();
      kinryo = parseFloat(jm[2]);
    } else {
      jockey = rawJockey;
    }
    idx++;
  }
  
  const km = (lines[idx] || "").match(/\((\d+\.?\d*)\)/);
  if (km) { kinryo = parseFloat(km[1]); idx++; }

  const trainer = lines[idx] || ""; idx++;
  const owner = lines[idx] || ""; idx++;
  idx++; // 生産者

  // 前走データ
  const pastRaces: PastRace[] = [];
  while (idx < lines.length && pastRaces.length < 5) {
    const l = lines[idx].trim();
    if (!l) { idx++; continue; }
    
    const pp = l.split(/[\t\s]+/);
    if (pp.length < 4) { idx++; continue; }

    const prResult = parseInt(pp[0]) || 0;
    const dm = (pp[1] || "").match(/(\d{2})\/(\d{2})\/(\d{2})/);
    const prDate = dm ? `20${dm[1]}-${dm[2]}-${dm[3]}` : "";
    const prVenue = pp[2]?.trim() || "";
    const distStr = pp[3] || "";
    const distM = distStr.match(/(\d+)m/);
    const prDist = distM ? parseInt(distM[1]) : 0;
    const prSurf: PastRace["surface"] = distStr.includes("芝") ? "芝" : "ダート";
    const prCond: PastRace["condition"] = (["良","稍重","重","不良"] as string[]).includes(pp[4])
      ? pp[4] as PastRace["condition"] : "良";
    idx++;

    const raceClass = lines[idx] || ""; idx++;

    const info = lines[idx] || "";
    const im = info.match(/(\d+)頭\s+(\d+)番\s+(\d+)人\s+(.+?)\s+(\d+\.\d+)\s+(\d+)kg/);
    const prJockey = im ? im[4].trim().replace(/^[▲△☆◇]/, "") : "";
    const prWeight = im ? parseInt(im[6]) : 480;
    idx++;

    const tl = lines[idx] || "";
    const tm = tl.match(/^(\d+:\d+[:.]\d+)/);
    const prTime = tm ? tm[1].replace(/(\d+:\d+):(\d+)$/, "$1.$2") : "";
    idx++;

    if (prDate && prResult) {
      pastRaces.push({
        date: prDate, venue: prVenue, raceName: raceClass, raceClass,
        distance: prDist, surface: prSurf, condition: prCond,
        result: prResult, time: prTime,
        corner4Position: 5, cornerOuterCount: 1,
        weight: prWeight, jockey: prJockey, odds: 0, prize: 0,
      });
    }
  }

  return {
    id: generateId(), number, frame, name, age, gender,
    weight, weightChange,
    jockey: jockey.replace(/\s+/g, " "), jockeyWeight: kinryo,
    trainer, owner, sire, dam, bms: "",
    bloodline: sire || "", style: "", odds, popularity, pastRaces,
  };
}

// ==========================================
// JRA出馬表パーサー（中央競馬）
// ==========================================
export function parseJRAText(rawText: string): { horses: Horse[]; venue: string; raceNumber: number } {
  const lines = rawText.split("\n").map(l => l.trim());

  const headerMatch = rawText.match(/\d+回(.+?)\d+日\s*(\d+)R/);
  const venue = headerMatch?.[1]?.trim() || "";
  const raceNumber = headerMatch ? parseInt(headerMatch[2]) : 1;

  const blockStarts: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^枠\d/.test(lines[i])) blockStarts.push(i);
  }

  const horses: Horse[] = [];
  for (let bi = 0; bi < blockStarts.length; bi++) {
    const start = blockStarts[bi];
    const end = bi + 1 < blockStarts.length ? blockStarts[bi + 1] : lines.length;
    const h = parseJRAHorse(lines.slice(start, end));
    if (h?.name) horses.push(h as Horse);
  }

  return { horses, venue, raceNumber };
}

function parseJRAHorse(lines: string[]): Partial<Horse> | null {
  if (!lines[0]) return null;

  const frameMatch = lines[0].match(/枠(\d)/);
  const frame = frameMatch ? parseInt(frameMatch[1]) : 1;
  const parts = lines[0].split(/\t/);
  let number = parts[1] ? parseInt(parts[1].trim()) : 0;
  let idx = 1;

  if (!number && lines[idx] && /^\d+$/.test(lines[idx])) { number = parseInt(lines[idx]); idx++; }

  let hasBlinker = false;
  if ((lines[idx] || "").includes("ブリンカー")) { hasBlinker = true; idx++; }

  const name = (lines[idx] || "").replace(/^(マルガイ|マルチ)/, "").trim(); idx++;
  while (idx < lines.length && (lines[idx] === "" || lines[idx].includes("("))) idx++; // 戦績行や空行スキップ

  const owner = lines[idx] || ""; idx++;
  while (idx < lines.length && (lines[idx] === "" || lines[idx] === "勝負服の画像")) idx++;
  const breeder = lines[idx] || ""; idx++;
  while (idx < lines.length && lines[idx] === "") idx++;

  let trainer = "";
  const tm = (lines[idx] || "").match(/^(.+?)\s*[\(（][栗美][東浦][\)）]/);
  if (tm) { trainer = tm[1].trim(); idx++; }
  else if (lines[idx]) { trainer = lines[idx]; idx++; }
  while (idx < lines.length && (lines[idx] === "" || lines[idx].includes("："))) {
    // 父・母などの血統情報を先に拾う
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
  
  let gender: Horse["gender"] = "牡"; let age = 4;
  let horseWeight = 480, horseWeightChange = 0;
  let kinryo = 55;

  // 馬体重・増減 (JRA)
  while (idx < lines.length) {
    const l = lines[idx] || "";
    const wm = l.match(/^(\d+)kg/);
    if (wm) {
      horseWeight = parseInt(wm[1]);
      idx++;
      const wcm = (lines[idx] || "").match(/\(([+-]?\d+|初出走|[\d]+)\)/);
      if (wcm) {
        const val = wcm[1].replace("±", "");
        horseWeightChange = val === "初出走" ? 0 : parseInt(val) || 0;
        idx++;
      }
      break;
    }
    idx++;
  }
  while (idx < lines.length && (lines[idx] === "" || lines[idx] === "勝負服の画像")) idx++;

  // 性齢 "牡5/栗"
  const gm = (lines[idx] || "").match(/([牡牝セ]|せん)(\d+)\//);
  if (gm) {
    gender = (gm[1] === "セ" || gm[1] === "せん") ? "セン" : gm[1] as "牡"|"牝";
    age = parseInt(gm[2]);
    idx++;
  }
  while (idx < lines.length && lines[idx] === "") idx++;

  // 斤量 "55.0kg"
  const kMatch = (lines[idx] || "").match(/(\d+\.?\d*)kg/);
  if (kMatch) {
    kinryo = parseFloat(kMatch[1]);
    idx++;
  }
  while (idx < lines.length && lines[idx] === "") idx++;

  // 騎手
  const jockey = (lines[idx] || "").trim(); idx++;
  while (idx < lines.length && lines[idx] === "") idx++;

  const pastRaces: PastRace[] = [];
  while (idx < lines.length && pastRaces.length < 5) {
    const dl = lines[idx] || "";
    const dm = dl.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
    if (!dm) { idx++; continue; }
    
    const prDate = `${dm[1]}-${String(dm[2]).padStart(2,"0")}-${String(dm[3]).padStart(2,"0")}`;
    const dp = dl.split(/[\t\s]+/);
    const prVenue = dp[dp.length - 1]?.trim() || "";
    idx++;

    const prRaceName = lines[idx] || ""; idx++;
    const prRaceClass = lines[idx] || ""; idx++;
    
    const rl = lines[idx] || "";
    const rm = rl.match(/(\d+)着/);
    const prResult = rm ? parseInt(rm[1]) : 0;
    idx++;

    const popLine = lines[idx] || ""; idx++; // 人気行
    
    const jl = lines[idx] || "";
    const prJockey = jl.split(/[\t\s]+/)[0]?.trim() || "";
    idx++;
    
    const distL = lines[idx] || "";
    const distM = distL.match(/(\d+)(ダ|芝)/);
    const prDist = distM ? parseInt(distM[1]) : 0;
    const prSurf: PastRace["surface"] = (distM?.[2] === "芝" || distL.includes("芝")) ? "芝" : "ダート";
    idx++;
    
    const tl = lines[idx] || "";
    const prTime = /\d+:\d+/.test(tl) ? tl : ""; 
    if (prTime) idx++;
    
    while (idx < lines.length && lines[idx] === "") idx++;
    
    const cands = ["良","稍重","重","不良"];
    let prCond: PastRace["condition"] = "良";
    if (cands.includes(lines[idx] || "")) { 
      prCond = lines[idx] as PastRace["condition"]; 
      idx++; 
    }
    
    const wl = lines[idx] || "";
    const wm = wl.match(/^(\d+)kg/);
    const prWeight = wm ? parseInt(wm[1]) : 480;
    if (wm) idx++;
    
    while (idx < lines.length && (lines[idx] === "" || /^\d+\s+\d/.test(lines[idx]) || lines[idx].includes("F"))) idx++;
    
    if (prDate && prResult) {
      pastRaces.push({
        date: prDate, venue: prVenue, raceName: prRaceName, raceClass: prRaceClass,
        distance: prDist, surface: prSurf, condition: prCond,
        result: prResult, time: prTime,
        corner4Position: 5, cornerOuterCount: 1,
        weight: prWeight, jockey: prJockey, odds: 0, prize: 0,
      });
    }
  }

  return {
    id: generateId(), number, frame, name, age, gender,
    weight: horseWeight, weightChange: horseWeightChange,
    jockey: jockey.replace(/\s+/g, " "), jockeyWeight: kinryo,
    trainer, owner, sire, dam, bms,
    bloodline: [sire, bms].filter(Boolean).join(" / "),
    style: "", odds, popularity, pastRaces,
    isHelmetChange: hasBlinker,
  };
}
