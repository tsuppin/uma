"use client";
import { useState } from "react";
import { Race, Horse } from "../types";
import { generateId } from "../lib/storage";
import { detectFormat, parseNARText, parseJRAText } from "../lib/parser";

const CONDITIONS: Race["condition"][] = ["良","稍重","重","不良"];
const SURFACES: Race["surface"][] = ["ダート","芝"];

export default function RaceForm({ onSubmit, onCancel }: {
  onSubmit: (race: Race) => void;
  onCancel: () => void;
}) {
  const [pasteText, setPasteText] = useState("");
  const [parseError, setParseError] = useState("");
  const [parsed, setParsed] = useState<{
    horses: Horse[]; venue: string; raceNumber: number;
    date?: string; distance?: number; surface?: Race["surface"];
    condition?: Race["condition"]; headCount?: number; raceName?: string;
  } | null>(null);

  // レース基本情報（解析後に確認・修正）
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

    const fmt = detectFormat(pasteText);
    let result: ReturnType<typeof parseNARText> | ReturnType<typeof parseJRAText>;

    if (fmt === "nar") {
      result = parseNARText(pasteText);
    } else {
      result = parseJRAText(pasteText);
    }

    if (result.horses.length === 0) {
      setParseError(`馬情報を解析できませんでした（検出フォーマット: ${fmt === "nar" ? "地方競馬" : "JRA"}）\n出馬表の全テキストをコピーして貼り付けてください。`);
      return;
    }

    setParsed(result);
    if (result.venue) setVenue(result.venue);
    if (result.raceNumber) setRaceNumber(result.raceNumber);
    if ("date" in result && result.date) setDate(result.date);
    if ("distance" in result && result.distance) setDistance(result.distance);
    if ("surface" in result && result.surface) setSurface(result.surface);
    if ("condition" in result && result.condition) setCondition(result.condition);
    if ("raceName" in result && result.raceName) setRaceName(result.raceName);
  };

  const handleSubmit = () => {
    if (!parsed || parsed.horses.length === 0) { alert("先に出馬表を解析してください"); return; }
    if (!venue) { alert("競馬場を入力してください"); return; }
    onSubmit({
      id: generateId(), date, venue, raceNumber,
      raceName: raceName || `${raceNumber}R`,
      distance, surface, condition,
      headCount: parsed.horses.length,
      isWin5, windSpeed,
      trackName: venue,
      horses: parsed.horses,
    });
  };

  const updateHorse = (idx: number, field: keyof Horse, value: unknown) => {
    if (!parsed) return;
    setParsed({ ...parsed, horses: parsed.horses.map((h, i) => i === idx ? { ...h, [field]: value } : h) });
  };

  const removeHorse = (idx: number) => {
    if (!parsed) return;
    setParsed({ ...parsed, horses: parsed.horses.filter((_, i) => i !== idx) });
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

      {/* Step1: テキスト貼り付け */}
      {!parsed && (
        <div className="card fade-in">
          <div className="card-header"><div className="card-title">📋 出馬表テキスト貼り付け</div></div>
          <div className="alert alert-info">
            💡 <strong>JRA・地方競馬（NAR）どちらも対応。</strong><br />
            出馬表ページを<strong>Ctrl+A → Ctrl+C</strong>でコピーして貼り付けてください。<br />
            JRA: 「枠1白」が含まれる形式 ／ 地方: 「天候：」「馬場状態：」が含まれる形式
          </div>
          <div className="form-group">
            <label className="form-label">出馬表テキスト</label>
            <textarea
              className="form-textarea"
              style={{ minHeight: "300px", fontFamily: "monospace", fontSize: "0.78rem" }}
              value={pasteText}
              onChange={e => { setPasteText(e.target.value); setParseError(""); }}
              placeholder={"JRA形式:\n2回東京2日 12R\n枠1白\t1\nスナッピードレッサ\n...\n\n地方競馬形式:\n2026/4/29\n大井 2R\nＣ３二三\n1200m    13頭...\n天候：曇 馬場状態：稍重\n1\t1\tダーカザンブラック(大井)\n　父　サートゥルナーリア\n..."}
            />
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "4px", textAlign: "right" }}>
              {pasteText.length.toLocaleString()} 文字
            </div>
          </div>
          {parseError && <div className="alert alert-warning">⚠️ {parseError}</div>}
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn btn-primary" style={{ fontSize: "1rem", padding: "10px 28px" }}
              onClick={handleParse} disabled={!pasteText.trim()}>
              🔍 解析実行
            </button>
            <button className="btn btn-secondary" onClick={() => setPasteText("")}>クリア</button>
          </div>
        </div>
      )}

      {/* Step2: 確認・修正 */}
      {parsed && (
        <div className="fade-in">
          <div className="alert alert-success">
            ✅ {parsed.horses.length}頭を解析完了（{detectFormat(pasteText) === "nar" ? "地方競馬" : "JRA"}形式）
            <button className="btn btn-secondary btn-sm" style={{ marginLeft: "12px" }} onClick={() => setParsed(null)}>
              ← 貼り直す
            </button>
          </div>

          {/* レース情報 */}
          <div className="card">
            <div className="card-header"><div className="card-title">🏇 レース情報（確認・修正）</div></div>
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
                <label className="form-label">レース名・クラス</label>
                <input className="form-input" value={raceName} onChange={e => setRaceName(e.target.value)} />
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
                <label className="form-label">風速(m/s)・WIN5</label>
                <div style={{ display: "flex", gap: "6px" }}>
                  <input type="number" className="form-input" step={0.5} value={windSpeed}
                    onChange={e => setWindSpeed(+e.target.value)} placeholder="風速" />
                  <select className="form-select" style={{ width: "100px" }}
                    value={isWin5 ? "1" : "0"} onChange={e => setIsWin5(e.target.value === "1")}>
                    <option value="0">通常</option>
                    <option value="1">WIN5</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 出走馬一覧 */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">🐴 出走馬確認（{parsed.horses.length}頭）</div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                ※馬体重は前走の値。当日発表後に修正可能
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="horse-table">
                <thead>
                  <tr>
                    <th>枠</th><th>馬番</th><th>馬名</th><th>性齢</th>
                    <th>騎手</th><th>斤量</th><th>体重</th><th>増減</th>
                    <th>父</th><th>オッズ</th>
                    <th>前走</th><th>前々走</th><th>3走前</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.horses.map((h, i) => (
                    <tr key={h.id}>
                      <td><span className={`frame-badge frame-${h.frame}`}>{h.frame}</span></td>
                      <td style={{ fontWeight: 700, color: "var(--accent-gold)" }}>{h.number}</td>
                      <td>
                        <input className="form-input"
                          style={{ width: "110px", padding: "4px 8px", fontSize: "0.8rem" }}
                          value={h.name} onChange={e => updateHorse(i, "name", e.target.value)} />
                        {h.isHelmetChange && <span className="tag tag-purple" style={{ marginLeft: "4px", fontSize: "0.65rem" }}>B</span>}
                      </td>
                      <td style={{ fontSize: "0.8rem", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                        {h.gender}{h.age}
                      </td>
                      <td>
                        <input className="form-input"
                          style={{ width: "80px", padding: "4px 8px", fontSize: "0.8rem" }}
                          value={h.jockey} onChange={e => updateHorse(i, "jockey", e.target.value)} />
                      </td>
                      <td style={{ fontSize: "0.8rem" }}>{h.jockeyWeight}</td>
                      <td>
                        <input type="number" className="form-input"
                          style={{ width: "64px", padding: "4px 8px", fontSize: "0.8rem" }}
                          value={h.weight} onChange={e => updateHorse(i, "weight", +e.target.value)} />
                      </td>
                      <td>
                        <input type="number" className="form-input"
                          style={{ width: "55px", padding: "4px 8px", fontSize: "0.8rem" }}
                          value={h.weightChange} onChange={e => updateHorse(i, "weightChange", +e.target.value)} />
                      </td>
                      <td style={{ fontSize: "0.72rem", color: "var(--text-muted)", maxWidth: "90px",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {h.sire || "—"}
                      </td>
                      <td>
                        <input type="number" className="form-input" step={0.1}
                          style={{ width: "60px", padding: "4px 8px", fontSize: "0.8rem" }}
                          value={h.odds || ""} onChange={e => updateHorse(i, "odds", +e.target.value)}
                          placeholder="倍" />
                      </td>
                      {[0, 1, 2].map(pi => {
                        const pr = h.pastRaces[pi];
                        return (
                          <td key={pi} style={{ fontSize: "0.7rem", whiteSpace: "nowrap" }}>
                            {pr ? (
                              <span style={{ color: pr.result <= 3 ? "var(--accent-green)" : "var(--text-muted)" }}>
                                {pr.venue} <strong>{pr.result}着</strong><br />
                                {pr.surface}{pr.distance}m {pr.condition}
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
