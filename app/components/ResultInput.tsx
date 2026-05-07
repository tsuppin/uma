"use client";
import { useState } from "react";
import { Race, RaceResult } from "../types";
import { generateFormation } from "../lib/engine";

type ResultRow = { rank: number; horseNumber: number; horseName: string; time: string; odds: number; prize: number; };

export default function ResultInput({ race, onSubmit, onCancel }: {
  race: Race;
  onSubmit: (result: RaceResult) => void;
  onCancel: () => void;
}) {
  const existing = race.result;
  const [pasteText, setPasteText] = useState("");
  const [parseError, setParseError] = useState("");
  const [results, setResults] = useState<ResultRow[]>(
    existing?.result || Array.from({ length: Math.min(3, race.horses.length) }, (_, i) => ({
      rank: i + 1, horseNumber: 0, horseName: "", time: "", odds: 0, prize: 0,
    }))
  );
  const [profit, setProfit] = useState(existing?.profit || 0);

  // ==========================================
  // テキスト貼り付けパーサー
  // ==========================================
  const parsePasteText = () => {
    setParseError("");
    const lines = pasteText.split("\n").map(l => l.trim());
    const parsedMap = new Map<number, ResultRow>();

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      // セクション終了判定
      if ((line === "払戻金" || line === "コーナー通過順位" || line.startsWith("タイム")) && parsedMap.size > 0) break;
      if (line.startsWith("単勝") && line.includes("円") && parsedMap.size > 0) break;

      // スキップ行
      if (line.includes("着順") || line.includes("馬名(所属)") || line.includes("タイム(着差)")) continue;

      let rank = 0, horseNumber = 0, horseName = "", time = "";

      // --- パターン1: JRA タブ区切り "1\t3\t5\tクインズショコラ1番人気" ---
      if (line.includes("\t")) {
        const parts = line.split("\t");
        const r = parseInt(parts[0]);
        // parts[1]=枠, parts[2]=馬番
        const n = parts.length >= 3 ? parseInt(parts[2]) : parseInt(parts[1]);
        if (r >= 1 && r <= 20 && n >= 1 && n <= 28) {
          rank = r;
          horseNumber = n;
          // 馬名は parts[3] か parts[2]
          const rawName = parts.length >= 4 ? parts[3] : (parts[2] || "");
          horseName = rawName
            .replace(/\d+番人気$/, "")
            .replace(/ブリンカー|マルチ|着用/g, "")
            .trim();
        }
      }

      // --- パターン2: スペース区切り "1 3 5 クインズショコラ..." ---
      if (rank === 0) {
        const parts = line.split(/\s+/);
        // 先頭3要素が全て数値 → JRA形式 (着, 枠, 馬番)
        if (parts.length >= 3 && /^\d+$/.test(parts[0]) && /^\d+$/.test(parts[1]) && /^\d+$/.test(parts[2])) {
          const r = parseInt(parts[0]);
          const ku = parseInt(parts[1]);
          const n = parseInt(parts[2]);
          if (r >= 1 && r <= 20 && ku >= 1 && ku <= 8 && n >= 1 && n <= 28) {
            rank = r;
            horseNumber = n;
            horseName = parts.slice(3).find(p => /[\u3040-\u9FFF\u30A0-\u30FF]/.test(p) || (p.length > 1 && !/^\d+$/.test(p))) || "";
            horseName = horseName.replace(/\d+番人気$/, "").replace(/ブリンカー|マルチ|着用/g, "").trim();
          }
        }
        // 先頭2要素が数値 → NAR形式 (着, 馬番)
        else if (parts.length >= 2 && /^\d+$/.test(parts[0]) && /^\d+$/.test(parts[1])) {
          const r = parseInt(parts[0]);
          const n = parseInt(parts[1]);
          if (r >= 1 && r <= 20 && n >= 1 && n <= 28) {
            rank = r;
            horseNumber = n;
            horseName = parts.slice(2).find(p => p.length > 1 && !/^\d+$/.test(p)) || "";
            horseName = horseName.replace(/\d+番人気$/, "").replace(/ブリンカー|マルチ|着用/g, "").trim();
          }
        }
      }

      // --- パターン3: NAR縦並び 着順のみの行 "1" "6" "9" "馬名" ---
      if (rank === 0 && /^\d+$/.test(line)) {
        const r = parseInt(line);
        if (r >= 1 && r <= 20 && i + 3 < lines.length) {
          const l1 = lines[i + 1], l2 = lines[i + 2], l3 = lines[i + 3];
          if (/^\d+$/.test(l1) && /^\d+$/.test(l2) && !/^\d/.test(l3) && l3.length > 1) {
            rank = r;
            horseNumber = parseInt(l2);
            horseName = l3.replace(/\(.+?\)$/, "").trim();
          } else if (/^\d+$/.test(l1) && !/^\d/.test(l2) && l2.length > 1) {
            rank = r;
            horseNumber = parseInt(l1);
            horseName = l2.replace(/\(.+?\)$/, "").trim();
          }
        }
      }

      // --- パターン4: "1着 3番 馬名" 形式 ---
      if (rank === 0) {
        const m = line.match(/^(\d+)[着位]\s*(?:枠\d+)?\s*(\d+)番?\s+([^\s\d][^\s]*)/);
        if (m) {
          rank = parseInt(m[1]);
          horseNumber = parseInt(m[2]);
          horseName = m[3].replace(/\d+番人気$/, "").trim();
        }
      }

      // 馬名が取れていない場合、後続行の日本語行を探す
      if (rank > 0 && !horseName) {
        for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
          const nl = lines[j].trim();
          if (!nl || /^\d/.test(nl) || nl.includes("/") || nl.length <= 1) continue;
          if (nl === "払戻金" || nl === "コーナー通過順位") break;
          if (/[\u3040-\u9FFF\u30A0-\u30FF]/.test(nl)) {
            horseName = nl.replace(/\d+番人気$/, "").replace(/ブリンカー|マルチ|着用/g, "").trim();
            break;
          }
        }
      }

      // タイム抽出（近隣6行から探す）
      for (let j = i; j < Math.min(i + 6, lines.length); j++) {
        const tm = lines[j].match(/(\d+:\d+\.\d+|\d+:\d+:\d+)/);
        if (tm) {
          time = tm[1].replace(/(\d+:\d+):(\d+)$/, "$1.$2");
          break;
        }
      }

      // 登録
      if (rank >= 1 && rank <= 20 && (horseNumber > 0 || horseName) && !parsedMap.has(rank)) {
        if (!horseName && horseNumber > 0) {
          horseName = race.horses.find(h => h.number === horseNumber)?.name || "";
        }
        parsedMap.set(rank, { rank, horseNumber, horseName, time, odds: 0, prize: 0 });
      }
    }

    const parsed = Array.from(parsedMap.values()).sort((a, b) => a.rank - b.rank);

    if (parsed.length === 0) {
      setParseError("着順を解析できませんでした。形式を確認してください。");
      return;
    }

    const top3 = [1, 2, 3].map(r => parsed.find(p => p.rank === r) || { rank: r, horseNumber: 0, horseName: "", time: "", odds: 0, prize: 0 });
    setResults(top3);
  };

  const updateResult = (idx: number, field: string, value: unknown) => {
    setResults(prev => prev.map((r, i) => {
      if (i !== idx) return r;
      const updated = { ...r, [field]: value };
      if (field === "horseNumber") {
        const h = race.horses.find(h => h.number === value);
        if (h) updated.horseName = h.name;
      }
      return updated;
    }));
  };

  const addRow = () => {
    setResults(prev => [...prev, { rank: prev.length + 1, horseNumber: 0, horseName: "", time: "", odds: 0, prize: 0 }]);
  };

  const removeRow = (idx: number) => {
    setResults(prev => prev.filter((_, i) => i !== idx).map((r, i) => ({ ...r, rank: i + 1 })));
  };

  // 的中判定
  const formation = race.predictions ? generateFormation(race.predictions) : null;
  const resultNums = results.slice(0, 3).map(r => r.horseNumber).filter(Boolean).sort((a, b) => a - b);
  const hitTickets = formation ? formation.tickets.filter(ticket => {
    const sorted = [...ticket].sort((a, b) => a - b);
    return sorted.length === 3 && sorted.every((n, i) => n === resultNums[i]);
  }) : [];

  const handleSubmit = () => {
    if (results[0]?.horseNumber === 0) { alert("1着馬番を入力してください"); return; }
    onSubmit({
      raceId: race.id,
      result: results.filter(r => r.horseNumber > 0),
      hitTickets,
      profit,
      learningApplied: false,
    });
  };

  return (
    <div className="fade-in">
      <div className="section-header">
        <h2 className="section-title">✅ 結果入力</h2>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn-secondary" onClick={onCancel}>キャンセル</button>
          <button className="btn btn-primary" onClick={handleSubmit}>💾 確定・自学習開始</button>
        </div>
      </div>

      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "16px" }}>
        {race.venue} {race.raceNumber}R {race.raceName} / {race.surface} {race.distance}m
      </div>

      {/* 📋 テキスト貼り付け・解析エリア */}
      <div className="card fade-in">
        <div className="card-header">
          <div className="card-title">📋 レース結果テキスト貼り付け（自動入力）</div>
        </div>
        <div className="alert alert-info">
            💡 レース結果をそのまま貼り付けると自動解析します。JRA・地方競馬どちらにも対応。
            <br />
            <code style={{ fontSize: "0.75rem", display: "block", marginTop: "6px", color: "var(--text-secondary)" }}>
              対応形式: JRAタブ区切り / スペース区切り / 地方競馬縦並び形式
            </code>
        </div>

        <div className="form-group">
          <label className="form-label">結果テキスト（5000文字まで）</label>
          <textarea
            className="form-textarea"
            style={{ minHeight: "180px", fontFamily: "monospace", fontSize: "0.8rem" }}
            value={pasteText}
            onChange={e => { setPasteText(e.target.value); setParseError(""); }}
            placeholder={`例:\n1着 3番 クラウンヴィラン 1:14.2\n2着 8番 バイアーナ 1:14.5\n3着 12番 シナモンデイジー 1:14.8\n\n（JRA・地方競馬の結果テキストをそのまま貼付けもOK）`}
            maxLength={5000}
          />
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "4px", textAlign: "right" }}>
            {pasteText.length} / 5000文字
          </div>
        </div>

        {parseError && (
          <div className="alert alert-warning">
            ⚠️ {parseError}
          </div>
        )}

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="btn btn-primary"
            onClick={parsePasteText}
            disabled={!pasteText.trim()}
            style={{ opacity: pasteText.trim() ? 1 : 0.5 }}
          >
            🔍 テキストを解析
          </button>
          <button className="btn btn-secondary" onClick={() => setPasteText("")}>
            クリア
          </button>
        </div>

        {/* クイック入力ガイド */}
        <hr className="divider" />
        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
          <div style={{ fontWeight: 600, marginBottom: "8px" }}>🏇 クイック馬番入力</div>
          <div style={{ display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
            {[1, 2, 3].map((rank, ri) => (
              <div key={rank} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span className={`rank-badge rank-${rank}`}>{rank}着</span>
                <select
                  className="form-select"
                  style={{ width: "80px" }}
                  value={results[ri]?.horseNumber || 0}
                  onChange={e => {
                    const num = +e.target.value;
                    const h = race.horses.find(h => h.number === num);
                    setResults(prev => {
                      const next = [...prev];
                      while (next.length <= ri) next.push({ rank: next.length + 1, horseNumber: 0, horseName: "", time: "", odds: 0, prize: 0 });
                      next[ri] = { ...next[ri], horseNumber: num, horseName: h?.name || "" };
                      return next;
                    });
                  }}
                >
                  <option value={0}>—</option>
                  {race.horses.map(h => (
                    <option key={h.id} value={h.number}>{h.number}番 {h.name}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ✏️ 手動入力・詳細エリア */}
      <div className="card fade-in" style={{ marginTop: "16px" }}>
        <div className="card-header">
          <div className="card-title">✏️ 着順・詳細入力</div>
        </div>
        <table className="horse-table">
            <thead>
              <tr>
                <th>着順</th><th>馬番</th><th>馬名</th>
                <th>走破タイム</th><th>単勝オッズ</th><th>賞金(万円)</th><th></th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i}>
                  <td>
                    <span className={`rank-badge rank-${i < 3 ? i + 1 : "other"}`}>{r.rank}着</span>
                  </td>
                  <td>
                    <select
                      className="form-select"
                      style={{ width: "90px" }}
                      value={r.horseNumber}
                      onChange={e => updateResult(i, "horseNumber", +e.target.value)}
                    >
                      <option value={0}>—</option>
                      {race.horses.map(h => (
                        <option key={h.id} value={h.number}>{h.number}番</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ fontWeight: r.horseName ? 600 : 400, color: r.horseName ? "var(--text-primary)" : "var(--text-muted)" }}>
                    {r.horseName || (r.horseNumber ? race.horses.find(h => h.number === r.horseNumber)?.name || "—" : "—")}
                  </td>
                  <td>
                    <input className="form-input" style={{ width: "100px" }} value={r.time}
                      onChange={e => updateResult(i, "time", e.target.value)} placeholder="1:14.2" />
                  </td>
                  <td>
                    <input type="number" className="form-input" style={{ width: "80px" }} step={0.1}
                      value={r.odds || ""} onChange={e => updateResult(i, "odds", +e.target.value)} placeholder="倍" />
                  </td>
                  <td>
                    <input type="number" className="form-input" style={{ width: "100px" }}
                      value={r.prize || ""} onChange={e => updateResult(i, "prize", +e.target.value)} placeholder="万円" />
                  </td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => removeRow(i)}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn btn-secondary btn-sm" style={{ marginTop: "8px" }} onClick={addRow}>
            ＋ 着順追加
          </button>
        </div>

      {/* 的中確認 */}
      {formation && resultNums.length >= 3 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">🎯 的中確認</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              3連複 {resultNums.join("-")} で判定中
            </div>
          </div>
          {hitTickets.length > 0 ? (
            <div className="alert alert-success">
              🎉 的中！ 買い目 {hitTickets.map(t => t.join("-")).join(", ")} が的中しました
            </div>
          ) : (
            <div className="alert alert-warning">
              😞 今回は不的中でした。AIが自動学習して次回に活かします。
            </div>
          )}
          <div className="form-group" style={{ marginTop: "12px" }}>
            <label className="form-label">払戻金額（円）</label>
            <input type="number" className="form-input" value={profit || ""}
              onChange={e => setProfit(+e.target.value)} placeholder="的中した場合の払戻金額を入力" />
          </div>
        </div>
      )}

      {/* 予想との比較 */}
      {race.predictions && race.predictions.length > 0 && results.some(r => r.horseNumber > 0) && (
        <div className="card">
          <div className="card-header"><div className="card-title">📊 予想との比較</div></div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {race.predictions.slice(0, 7).map((p, i) => {
              const hitResult = results.find(r => r.horseNumber === p.horseNumber);
              const isHit = !!hitResult;
              return (
                <div key={p.horseId} style={{
                  padding: "10px 14px",
                  background: isHit ? "var(--accent-green)15" : "var(--bg-surface)",
                  border: `1px solid ${isHit ? "var(--accent-green)40" : "var(--border)"}`,
                  borderRadius: "8px", textAlign: "center", minWidth: "80px",
                }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>予想{i + 1}位</div>
                  <div style={{ fontWeight: 700, color: isHit ? "var(--accent-green)" : "var(--text-primary)" }}>
                    {p.horseNumber}番
                  </div>
                  <div style={{ fontSize: "0.75rem" }}>{p.horseName}</div>
                  {isHit && (
                    <div style={{ color: "var(--accent-green)", fontSize: "0.7rem", fontWeight: 700 }}>
                      {hitResult.rank}着 ✓
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
