"use client";
import { useState } from "react";
import { Race, Horse, PastRace } from "../types";
import { generateId } from "../lib/storage";

// ==========================================
// JRA出馬表テキストパーサー
// ==========================================
function parseJRAText(rawText: string): { horses: Horse[]; venue: string; raceNumber: number } {
  const horses: Horse[] = [];

  // レースヘッダー解析 "2回東京2日 12R"
  const headerMatch = rawText.match(/\d+回(.+?)\d+日\s*(\d+)R/);
  const venue = headerMatch?.[1]?.trim() || "";
  const raceNumber = headerMatch ? parseInt(headerMatch[2]) : 1;

  // 詳細ブロックを枠Nで分割（枠1白, 枠2黒 など）
  const blockRegex = /枠\d+[^\n]*/g;
  const lines = rawText.split("\n").map(l => l.trim());

  // 枠行のインデックスを収集
  const blockStarts: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^枠\d/.test(lines[i])) blockStarts.push(i);
  }

  for (let bi = 0; bi < blockStarts.length; bi++) {
    const start = blockStarts[bi];
    const end = bi + 1 < blockStarts.length ? blockStarts[bi + 1] : lines.length;
    const block = lines.slice(start, end);
    const horse = parseHorseBlock(block);
    if (horse && horse.name) horses.push(horse as Horse);
  }

  return { horses, venue, raceNumber };
}

function parseHorseBlock(lines: string[]): Partial<Horse> | null {
  if (!lines[0]) return null;

  // 枠番・馬番 "枠1白\t1" or "枠1白\t1\n..."
  const frameMatch = lines[0].match(/枠(\d)/);
  const frame = frameMatch ? parseInt(frameMatch[1]) : 1;
  const parts = lines[0].split(/\t/);
  let number = parts[1] ? parseInt(parts[1].trim()) : 0;

  let idx = 1;

  // 馬番が次行にある場合
  if (!number && lines[idx] && /^\d+$/.test(lines[idx].trim())) {
    number = parseInt(lines[idx].trim());
    idx++;
  }

  // ブリンカー
  let hasBlinker = false;
  if ((lines[idx] || "").includes("ブリンカー")) { hasBlinker = true; idx++; }

  // 馬名（マルガイ除去）
  const rawName = (lines[idx] || "").trim();
  const name = rawName.replace(/^マルガイ/, "").trim();
  idx++;

  // 戦績・総賞金 "(2.3.5.11)\t4,182.1万円"
  let record = "";
  if (lines[idx] && lines[idx].includes("(")) {
    record = lines[idx].split(/\t/)[0] || "";
    idx++;
  }

  // 馬主
  const owner = lines[idx] || ""; idx++;
  // 生産者
  while (idx < lines.length && lines[idx] === "") idx++;
  const breeder = lines[idx] || ""; idx++;
  // 調教師(所属)
  while (idx < lines.length && lines[idx] === "") idx++;
  let trainer = "";
  const trainerMatch = (lines[idx] || "").match(/^(.+?)\s*[\(（][栗美][東浦][\)）]/);
  if (trainerMatch) { trainer = trainerMatch[1].trim(); idx++; }
  else if (lines[idx] && !lines[idx].includes("父：")) { trainer = lines[idx]; idx++; }
  while (idx < lines.length && lines[idx] === "") idx++;

  // 血統
  let sire = "", dam = "", bms = "";
  while (idx < lines.length) {
    const l = lines[idx];
    if (l === "父：") { idx++; sire = lines[idx] || ""; idx++; }
    else if (l === "母：") { idx++; dam = lines[idx] || ""; idx++; }
    else if (l.startsWith("(母の父：")) {
      bms = l.replace(/^\(母の父：/, "").replace(/\)$/, "").trim(); idx++; break;
    } else if (/^\d+\./.test(l) || l === "") break;
    else idx++;
  }

  // オッズ（単独数値行）
  let odds = 0, popularity = 0;
  while (idx < lines.length) {
    const l = lines[idx];
    if (/^\d+\.?\d+$/.test(l) && !l.includes(":")) { odds = parseFloat(l); idx++; break; }
    idx++;
  }
  // 人気
  const popMatch = (lines[idx] || "").match(/(\d+)番人気/);
  if (popMatch) { popularity = parseInt(popMatch[1]); idx++; }

  // 勝負服 / 空白スキップ
  while (idx < lines.length && (lines[idx] === "" || lines[idx] === "勝負服の画像")) idx++;

  // 性齢 "牡5/鹿"
  let gender: Horse["gender"] = "牡"; let age = 4;
  const glMatch = (lines[idx] || "").match(/([牡牝セ])(\d+)\//);
  if (glMatch) {
    gender = glMatch[1] === "セ" ? "セン" : glMatch[1] as "牡" | "牝";
    age = parseInt(glMatch[2]); idx++;
  }
  while (idx < lines.length && lines[idx] === "") idx++;

  // 斤量 "58.0kg"
  let kinryo = 55;
  const kinMatch = (lines[idx] || "").match(/(\d+\.?\d*)kg/);
  if (kinMatch) { kinryo = parseFloat(kinMatch[1]); idx++; }
  while (idx < lines.length && lines[idx] === "") idx++;

  // 騎手
  const jockey = (lines[idx] || "").trim(); idx++;
  while (idx < lines.length && lines[idx] === "") idx++;

  // 前走〜4走前パース
  const pastRaces: PastRace[] = [];
  while (idx < lines.length && pastRaces.length < 4) {
    const dateLine = lines[idx] || "";
    const dateMatch = dateLine.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
    if (!dateMatch) { idx++; continue; }

    const date = `${dateMatch[1]}-${String(dateMatch[2]).padStart(2,"0")}-${String(dateMatch[3]).padStart(2,"0")}`;
    const dp = dateLine.split(/\t/);
    const prVenue = dp[1]?.trim() || "";
    idx++;

    const raceName = lines[idx] || ""; idx++;
    const raceClass = lines[idx] || ""; idx++;

    // "5着\t16頭 5番"
    const rl = lines[idx] || "";
    const resMatch = rl.match(/(\d+)着/);
    const headMatch = rl.match(/(\d+)頭\s*(\d+)番/);
    const prResult = resMatch ? parseInt(resMatch[1]) : 0;
    idx++;

    // 人気行
    const prPopLine = lines[idx] || ""; idx++;

    // 騎手\t斤量 行
    const prJockLine = lines[idx] || "";
    const prJockey = prJockLine.split(/\t/)[0]?.trim() || "";
    idx++;

    // 距離+馬場 "1400ダ"
    const distLine = lines[idx] || "";
    const distMatch = distLine.match(/(\d+)(ダ|芝)/);
    const prDist = distMatch ? parseInt(distMatch[1]) : 0;
    const prSurf: PastRace["surface"] = distMatch?.[2] === "芝" ? "芝" : "ダート";
    idx++;

    // タイム
    const tl = lines[idx] || "";
    const prTime = /\d+:\d+/.test(tl) ? tl : "";
    if (prTime) idx++;

    // 空白
    while (idx < lines.length && lines[idx] === "") idx++;

    // 馬場状態
    const condCandidates = ["良", "稍重", "重", "不良"];
    let prCond: PastRace["condition"] = "良";
    if (condCandidates.includes(lines[idx] || "")) { prCond = lines[idx] as PastRace["condition"]; idx++; }

    // 馬体重
    const wl = lines[idx] || "";
    const wMatch = wl.match(/^(\d+)kg/);
    const prWeight = wMatch ? parseInt(wMatch[1]) : 480;
    if (wMatch) idx++;

    // 空白〜コーナー通過・着差行をスキップ
    while (idx < lines.length && lines[idx] === "") idx++;
    if (lines[idx] && /^\d/.test(lines[idx]) && !lines[idx].match(/\d{4}年/)) idx++; // corner
    if (lines[idx] && /[^\d\s]/.test(lines[idx]) && !lines[idx].match(/\d{4}年/)) idx++; // winner(diff)
    while (idx < lines.length && lines[idx] === "") idx++;

    pastRaces.push({
      date, venue: prVenue, raceName, raceClass,
      distance: prDist, surface: prSurf, condition: prCond,
      result: prResult, time: prTime,
      corner4Position: 5, cornerOuterCount: 1,
      weight: prWeight, jockey: prJockey, odds: 0, prize: 0,
    });
  }

  // 馬体重: 直近前走の馬体重を使用（レース当日は未公開のため）
  const latestWeight = pastRaces[0]?.weight || 480;
  const prevWeight = pastRaces[1]?.weight || latestWeight;
  const weightChange = latestWeight - prevWeight;

  return {
    id: generateId(), number, frame, name,
    age, gender, weight: latestWeight, weightChange,
    jockey: jockey.replace(/\s+/g, " "),
    jockeyWeight: kinryo, trainer, owner,
    sire, dam, bms,
    bloodline: [sire, bms].filter(Boolean).join(" / "),
    style: "", odds, popularity, pastRaces,
    isHelmetChange: hasBlinker,
  };
}

// ==========================================
// メインコンポーネント
// ==========================================
const CONDITIONS: Race["condition"][] = ["良", "稍重", "重", "不良"];
const SURFACES: Race["surface"][] = ["ダート", "芝"];

export default function RaceForm({ onSubmit, onCancel }: {
  onSubmit: (race: Race) => void;
  onCancel: () => void;
}) {
  const [pasteText, setPasteText] = useState("");
  const [parsed, setParsed] = useState<{ horses: Horse[]; venue: string; raceNumber: number } | null>(null);
  const [parseError, setParseError] = useState("");

  // レース基本情報（貼り付け後に入力）
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [venue, setVenue] = useState("");
  const [raceNumber, setRaceNumber] = useState(1);
  const [raceName, setRaceName] = useState("");
  const [distance, setDistance] = useState(1400);
  const [surface, setSurface] = useState<Race["surface"]>("ダート");
  const [condition, setCondition] = useState<Race["condition"]>("良");
  const [isWin5, setIsWin5] = useState(false);
  const [windSpeed, setWindSpeed] = useState(0);

  const handleParse = () => {
    setParseError("");
    if (!pasteText.trim()) { setParseError("テキストを貼り付けてください"); return; }
    const result = parseJRAText(pasteText);
    if (result.horses.length === 0) {
      setParseError("馬情報を解析できませんでした。\n枠番（枠1白、枠2黒…）が含まれるJRA出馬表のテキストを貼り付けてください。");
      return;
    }
    setParsed(result);
    if (result.venue) setVenue(result.venue);
    if (result.raceNumber) setRaceNumber(result.raceNumber);
  };

  const handleSubmit = () => {
    if (!parsed || parsed.horses.length === 0) { alert("先に出馬表を解析してください"); return; }
    const race: Race = {
      id: generateId(), date, venue, raceNumber,
      raceName: raceName || `${raceNumber}R`,
      distance, surface, condition,
      headCount: parsed.horses.length,
      isWin5, windSpeed,
      trackName: venue,
      horses: parsed.horses,
    };
    onSubmit(race);
  };

  const removeHorse = (idx: number) => {
    if (!parsed) return;
    setParsed({ ...parsed, horses: parsed.horses.filter((_, i) => i !== idx) });
  };

  const updateHorse = (idx: number, field: keyof Horse, value: unknown) => {
    if (!parsed) return;
    const horses = parsed.horses.map((h, i) => i === idx ? { ...h, [field]: value } : h);
    setParsed({ ...parsed, horses });
  };

  return (
    <div className="fade-in">
      <div className="section-header">
        <h2 className="section-title">➕ 新規レース登録</h2>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn-secondary" onClick={onCancel}>キャンセル</button>
          {parsed && <button className="btn btn-primary" onClick={handleSubmit}>💾 保存して予想へ</button>}
        </div>
      </div>

      {/* Step 1: テキスト貼り付け */}
      {!parsed && (
        <div className="card fade-in">
          <div className="card-header">
            <div className="card-title">📋 出馬表テキスト貼り付け</div>
          </div>
          <div className="alert alert-info">
            💡 <strong>JRA・地方競馬の出馬表ページをすべて選択（Ctrl+A）してコピー</strong>し、そのまま貼り付けてください。<br />
            枠番（枠1白、枠2黒…）が含まれる詳細データを自動解析します。
          </div>
          <div className="form-group">
            <label className="form-label">出馬表テキスト</label>
            <textarea
              className="form-textarea"
              style={{ minHeight: "280px", fontFamily: "monospace", fontSize: "0.78rem" }}
              value={pasteText}
              onChange={e => { setPasteText(e.target.value); setParseError(""); }}
              placeholder={"ここにJRA出馬表テキストを貼り付け\n\n例:\n2回東京2日 12R\n枠1白\t1\nブリンカー着用\nフィリップ\n(2.3.5.11)\t4,182.1万円\n..."}
            />
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "4px", textAlign: "right" }}>
              {pasteText.length.toLocaleString()} 文字
            </div>
          </div>
          {parseError && (
            <div className="alert alert-warning">⚠️ {parseError}</div>
          )}
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className="btn btn-primary"
              style={{ fontSize: "1rem", padding: "10px 28px" }}
              onClick={handleParse}
              disabled={!pasteText.trim()}
            >
              🔍 解析実行
            </button>
            <button className="btn btn-secondary" onClick={() => setPasteText("")}>クリア</button>
          </div>
        </div>
      )}

      {/* Step 2: レース情報入力＋解析結果確認 */}
      {parsed && (
        <div className="fade-in">
          <div className="alert alert-success">
            ✅ {parsed.horses.length}頭の出走馬を解析しました
            <button
              className="btn btn-secondary btn-sm"
              style={{ marginLeft: "12px" }}
              onClick={() => setParsed(null)}
            >
              ← 貼り直す
            </button>
          </div>

          {/* レース基本情報 */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">🏇 レース基本情報</div>
            </div>
            <div className="grid-4" style={{ gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">開催日</label>
                <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">競馬場</label>
                <input className="form-input" value={venue} onChange={e => setVenue(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">レース番号</label>
                <input type="number" className="form-input" min={1} max={12} value={raceNumber} onChange={e => setRaceNumber(+e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">レース名</label>
                <input className="form-input" value={raceName} onChange={e => setRaceName(e.target.value)} placeholder="未勝利戦、2勝クラス など" />
              </div>
              <div className="form-group">
                <label className="form-label">距離 (m)</label>
                <input type="number" className="form-input" value={distance} onChange={e => setDistance(+e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">馬場種別</label>
                <select className="form-select" value={surface} onChange={e => setSurface(e.target.value as Race["surface"])}>
                  {SURFACES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">馬場状態</label>
                <select className="form-select" value={condition} onChange={e => setCondition(e.target.value as Race["condition"])}>
                  {CONDITIONS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">風速 (m/s)</label>
                <input type="number" className="form-input" step={0.5} value={windSpeed} onChange={e => setWindSpeed(+e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">WIN5</label>
                <select className="form-select" value={isWin5 ? "1" : "0"} onChange={e => setIsWin5(e.target.value === "1")}>
                  <option value="0">通常</option>
                  <option value="1">WIN5対象</option>
                </select>
              </div>
            </div>
          </div>

          {/* 解析結果テーブル */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">🐴 解析済み出走馬（{parsed.horses.length}頭）</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                ※馬体重は直近前走の値。レース当日に修正してください。
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="horse-table">
                <thead>
                  <tr>
                    <th>枠</th><th>馬番</th><th>馬名</th><th>性齢</th>
                    <th>騎手</th><th>斤量</th><th>馬体重</th><th>増減</th>
                    <th>父</th><th>母父</th><th>オッズ</th><th>人気</th>
                    <th>前走</th><th>前々走</th><th>3走前</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.horses.map((h, i) => (
                    <tr key={h.id}>
                      <td>
                        <span className={`frame-badge frame-${h.frame}`}>{h.frame}</span>
                      </td>
                      <td style={{ fontWeight: 700, color: "var(--accent-gold)" }}>{h.number}</td>
                      <td>
                        <div>
                          <input
                            className="form-input"
                            style={{ width: "120px", padding: "4px 8px", fontSize: "0.8rem" }}
                            value={h.name}
                            onChange={e => updateHorse(i, "name", e.target.value)}
                          />
                          {h.isHelmetChange && <span className="tag tag-purple" style={{ marginLeft: "4px" }}>B</span>}
                        </div>
                      </td>
                      <td style={{ fontSize: "0.8rem", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                        {h.gender}{h.age}
                      </td>
                      <td>
                        <input
                          className="form-input"
                          style={{ width: "90px", padding: "4px 8px", fontSize: "0.8rem" }}
                          value={h.jockey}
                          onChange={e => updateHorse(i, "jockey", e.target.value)}
                        />
                      </td>
                      <td style={{ fontSize: "0.8rem" }}>{h.jockeyWeight}</td>
                      <td>
                        <input
                          type="number"
                          className="form-input"
                          style={{ width: "70px", padding: "4px 8px", fontSize: "0.8rem" }}
                          value={h.weight}
                          onChange={e => updateHorse(i, "weight", +e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-input"
                          style={{ width: "60px", padding: "4px 8px", fontSize: "0.8rem" }}
                          value={h.weightChange}
                          onChange={e => updateHorse(i, "weightChange", +e.target.value)}
                        />
                      </td>
                      <td style={{ fontSize: "0.72rem", color: "var(--text-muted)", maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {h.sire || "—"}
                      </td>
                      <td style={{ fontSize: "0.72rem", color: "var(--text-muted)", maxWidth: "80px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {h.bms || "—"}
                      </td>
                      <td style={{ color: "var(--accent-gold)", fontWeight: 700 }}>
                        <input
                          type="number"
                          className="form-input"
                          style={{ width: "65px", padding: "4px 8px", fontSize: "0.8rem" }}
                          step={0.1}
                          value={h.odds || ""}
                          onChange={e => updateHorse(i, "odds", +e.target.value)}
                        />
                      </td>
                      <td style={{ fontSize: "0.8rem" }}>{h.popularity || "—"}</td>
                      {/* 前走〜3走前 */}
                      {[0, 1, 2].map(prIdx => {
                        const pr = h.pastRaces[prIdx];
                        return (
                          <td key={prIdx} style={{ fontSize: "0.7rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                            {pr ? (
                              <span style={{ color: pr.result <= 3 ? "var(--accent-green)" : "var(--text-muted)" }}>
                                {pr.venue} {pr.result}着
                                <br />{pr.surface}{pr.distance}m {pr.condition}
                              </span>
                            ) : "—"}
                          </td>
                        );
                      })}
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => removeHorse(i)}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
            <button className="btn btn-secondary" onClick={() => setParsed(null)}>← 貼り直す</button>
            <button className="btn btn-primary" style={{ fontSize: "1rem", padding: "10px 28px" }} onClick={handleSubmit}>
              💾 保存して予想へ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
