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

  // 馬ブロック分割: 行が "N\tN\t馬名(...)" パターン
  const blockStarts: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^\d\t\d+\t[^\t]+/.test(lines[i])) blockStarts.push(i);
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

  // "1\t1\tダーカザンブラック(大井)"
  const hp = lines[0].split("\t");
  const frame = parseInt(hp[0]) || 1;
  const number = parseInt(hp[1]) || 1;
  const name = (hp[2] || "").replace(/\(.+?\)$/, "").trim();

  let idx = 1;

  // 父・母
  let sire = "", dam = "";
  for (let i = idx; i < Math.min(idx + 4, lines.length); i++) {
    const l = lines[i];
    if (/^\s*父\s+/.test(l)) { sire = l.replace(/^\s*父\s+/, "").trim(); }
    else if (/^\s*母\s+/.test(l)) { dam = l.replace(/^\s*母\s+/, "").trim(); }
  }
  // Skip 父/母 lines
  while (idx < lines.length && /^\s*[父母]\s/.test(lines[idx])) idx++;

  // 性齢 "牝4"
  let gender: Horse["gender"] = "牡", age = 4;
  const gm = (lines[idx] || "").match(/([牡牝セ]|せん)(\d)/);
  if (gm) { gender = (gm[1] === "セ" || gm[1] === "せん") ? "セン" : gm[1] as "牡"|"牝"; age = parseInt(gm[2]); idx++; }

  // 毛色
  if (lines[idx] && /毛$/.test(lines[idx])) idx++;

  // 馬体重・増減
  let weight = 480, weightChange = 0;
  const wm = (lines[idx] || "").match(/(\d+)kg/);
  if (wm) { weight = parseInt(wm[1]); idx++; }
  const wcm = (lines[idx] || "").match(/\(([+-]?\d+)\)/);
  if (wcm) { weightChange = parseInt(wcm[1]); idx++; }

  // 騎手
  let jockey = "", kinryo = 56;
  if (lines[idx] && !/^\(/.test(lines[idx]) && !/^\d/.test(lines[idx])) {
    jockey = lines[idx].replace(/^[▲△☆◇]/, "").trim(); idx++;
  }
  const km = (lines[idx] || "").match(/\((\d+\.?\d*)\)/);
  if (km) { kinryo = parseFloat(km[1]); idx++; }

  // 調教師・馬主・生産者
  const trainer = lines[idx] || ""; idx++;
  const owner = lines[idx] || ""; idx++;
  idx++; // 生産者スキップ

  // 前走データ
  const pastRaces: PastRace[] = [];
  while (idx < lines.length && pastRaces.length < 5) {
    const l = lines[idx];
    const pp = l.split("\t");
    if (pp.length < 4) { idx++; continue; }

    const resultStr = pp[0];
    if (resultStr === "除外" || resultStr === "取消") { idx += 4; continue; }

    const prResult = parseInt(resultStr);
    if (!prResult) { idx++; continue; }

    // 日付 "26/04/15" → "2026-04-15"
    const dm = (pp[1] || "").match(/(\d{2})\/(\d{2})\/(\d{2})/);
    const prDate = dm ? `20${dm[1]}-${dm[2]}-${dm[3]}` : "";
    const prVenue = pp[2]?.trim() || "";
    const distStr = pp[3] || "";
    const distM = distStr.match(/(\d+)m/);
    const prDist = distM ? parseInt(distM[1]) : 0;
    const prSurf: PastRace["surface"] = distStr.includes("芝") ? "芝" : "ダート";
    const condStr = pp[4]?.trim() || "";
    const prCond: PastRace["condition"] = (["良","稍重","重","不良"] as string[]).includes(condStr)
      ? condStr as PastRace["condition"] : "良";
    idx++;

    // クラス
    const raceClass = lines[idx] || ""; idx++;

    // "13頭 2番 2人 笹川翼 54.0 462kg 3-3"
    const info = lines[idx] || "";
    const im = info.match(/(\d+)頭\s+(\d+)番\s+(\d+)人\s+(.+?)\s+\d+\.\d+\s+(\d+)kg/);
    const prJockey = im ? im[4].trim().replace(/^[▲△☆◇]/, "") : "";
    const prWeight = im ? parseInt(im[5]) : 480;
    idx++;

    // タイム行 "1:15:6(38.5) アイビーブリザード(+1.6)"
    const tl = lines[idx] || "";
    const tm = tl.match(/^(\d+:\d+[:.]\d+)/);
    // "1:15:6" → "1:15.6"
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
    bloodline: sire || "", style: "", odds: 0, popularity: 0, pastRaces,
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

  const name = (lines[idx] || "").replace(/^マルガイ/, "").trim(); idx++;
  if (lines[idx] && lines[idx].includes("(")) idx++; // 戦績行

  const owner = lines[idx] || ""; idx++;
  while (idx < lines.length && lines[idx] === "") idx++;
  const breeder = lines[idx] || ""; idx++;
  while (idx < lines.length && lines[idx] === "") idx++;

  let trainer = "";
  const tm = (lines[idx] || "").match(/^(.+?)\s*[\(（][栗美][東浦][\)）]/);
  if (tm) { trainer = tm[1].trim(); idx++; }
  else if (lines[idx]) { trainer = lines[idx]; idx++; }
  while (idx < lines.length && lines[idx] === "") idx++;

  let sire = "", dam = "", bms = "";
  while (idx < lines.length) {
    const l = lines[idx];
    if (l === "父：") { idx++; sire = lines[idx] || ""; idx++; }
    else if (l === "母：") { idx++; dam = lines[idx] || ""; idx++; }
    else if (l.startsWith("(母の父：")) { bms = l.replace(/^\(母の父：/, "").replace(/\)$/, "").trim(); idx++; break; }
    else if (/^\d+\./.test(l) || l === "") break;
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
  while (idx < lines.length && (lines[idx] === "" || lines[idx] === "勝負服の画像")) idx++;

  let gender: Horse["gender"] = "牡"; let age = 4;
  const gm = (lines[idx] || "").match(/([牡牝セ]|せん)(\d+)\//);
  if (gm) { gender = (gm[1] === "セ" || gm[1] === "せん") ? "セン" : gm[1] as "牡"|"牝"; age = parseInt(gm[2]); idx++; }
  while (idx < lines.length && lines[idx] === "") idx++;

  let kinryo = 55;
  const kMatch = (lines[idx] || "").match(/(\d+\.?\d*)kg/);
  if (kMatch) { kinryo = parseFloat(kMatch[1]); idx++; }
  while (idx < lines.length && lines[idx] === "") idx++;

  const jockey = (lines[idx] || "").trim(); idx++;
  while (idx < lines.length && lines[idx] === "") idx++;

  const pastRaces: PastRace[] = [];
  while (idx < lines.length && pastRaces.length < 4) {
    const dl = lines[idx] || "";
    const dm = dl.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
    if (!dm) { idx++; continue; }
    const prDate = `${dm[1]}-${String(dm[2]).padStart(2,"0")}-${String(dm[3]).padStart(2,"0")}`;
    const dp = dl.split(/\t/);
    const prVenue = dp[1]?.trim() || "";
    idx++;
    const raceName = lines[idx] || ""; idx++;
    const raceClass = lines[idx] || ""; idx++;
    const rl = lines[idx] || "";
    const rm = rl.match(/(\d+)着/);
    const prResult = rm ? parseInt(rm[1]) : 0;
    idx++;
    idx++; // 人気行
    const jl = lines[idx] || "";
    const prJockey = jl.split(/\t/)[0]?.trim() || "";
    idx++;
    const distL = lines[idx] || "";
    const distM = distL.match(/(\d+)(ダ|芝)/);
    const prDist = distM ? parseInt(distM[1]) : 0;
    const prSurf: PastRace["surface"] = distM?.[2] === "芝" ? "芝" : "ダート";
    idx++;
    const tl = lines[idx] || "";
    const prTime = /\d+:\d+/.test(tl) ? tl : ""; if (prTime) idx++;
    while (idx < lines.length && lines[idx] === "") idx++;
    const cands = ["良","稍重","重","不良"];
    let prCond: PastRace["condition"] = "良";
    if (cands.includes(lines[idx] || "")) { prCond = lines[idx] as PastRace["condition"]; idx++; }
    const wl = lines[idx] || "";
    const wm = wl.match(/^(\d+)kg/);
    const prWeight = wm ? parseInt(wm[1]) : 480;
    if (wm) idx++;
    while (idx < lines.length && lines[idx] === "") idx++;
    if (lines[idx] && /^\d/.test(lines[idx]) && !lines[idx].match(/\d{4}年/)) idx++;
    if (lines[idx] && /[^\d\s]/.test(lines[idx]) && !lines[idx].match(/\d{4}年/)) idx++;
    while (idx < lines.length && lines[idx] === "") idx++;
    if (prDate && prResult) {
      pastRaces.push({
        date: prDate, venue: prVenue, raceName, raceClass,
        distance: prDist, surface: prSurf, condition: prCond,
        result: prResult, time: prTime,
        corner4Position: 5, cornerOuterCount: 1,
        weight: prWeight, jockey: prJockey, odds: 0, prize: 0,
      });
    }
  }

  const w = pastRaces[0]?.weight || 480;
  const w2 = pastRaces[1]?.weight || w;

  return {
    id: generateId(), number, frame, name, age, gender,
    weight: w, weightChange: w - w2,
    jockey: jockey.replace(/\s+/g, " "), jockeyWeight: kinryo,
    trainer, owner, sire, dam, bms,
    bloodline: [sire, bms].filter(Boolean).join(" / "),
    style: "", odds, popularity, pastRaces,
    isHelmetChange: hasBlinker,
  };
}
