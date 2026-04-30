"use client";
import { useState } from "react";
import { Race, RaceResult } from "../types";
import { generateFormation } from "../lib/engine";
import { generateId } from "../lib/storage";

export default function ResultInput({ race, onSubmit, onCancel }: {
  race: Race;
  onSubmit: (result: RaceResult) => void;
  onCancel: () => void;
}) {
  const existing = race.result;
  const [results, setResults] = useState<{ rank: number; horseNumber: number; horseName: string; time: string; odds: number; prize: number; }[]>(
    existing?.result || Array.from({ length: Math.min(3, race.horses.length) }, (_, i) => ({
      rank: i + 1, horseNumber: 0, horseName: "", time: "", odds: 0, prize: 0,
    }))
  );
  const [profit, setProfit] = useState(existing?.profit || 0);

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

  // 的中判定
  const formation = race.predictions ? generateFormation(race.predictions) : null;
  const resultNums = results.slice(0, 3).map(r => r.horseNumber).filter(Boolean).sort((a, b) => a - b);

  const hitTickets = formation ? formation.tickets.filter(ticket => {
    const sorted = [...ticket].sort((a, b) => a - b);
    return sorted.length === 3 && sorted.every((n, i) => n === resultNums[i]);
  }) : [];

  const handleSubmit = () => {
    if (results[0].horseNumber === 0) { alert("1着馬番を入力してください"); return; }
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

      <div className="card">
        <div className="card-header">
          <div className="card-title">🏁 着順入力</div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            {race.venue} {race.raceNumber}R {race.raceName}
          </div>
        </div>

        <table className="horse-table">
          <thead>
            <tr>
              <th>着順</th><th>馬番</th><th>馬名</th><th>走破タイム</th><th>単勝オッズ</th><th>賞金</th>
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
                    style={{ width: "80px" }}
                    value={r.horseNumber}
                    onChange={e => updateResult(i, "horseNumber", +e.target.value)}
                  >
                    <option value={0}>—</option>
                    {race.horses.map(h => (
                      <option key={h.id} value={h.number}>{h.number}番</option>
                    ))}
                  </select>
                </td>
                <td>{r.horseName || (r.horseNumber ? race.horses.find(h => h.number === r.horseNumber)?.name || "—" : "—")}</td>
                <td><input className="form-input" style={{ width: "100px" }} value={r.time} onChange={e => updateResult(i, "time", e.target.value)} placeholder="1:14.2" /></td>
                <td><input type="number" className="form-input" style={{ width: "80px" }} step={0.1} value={r.odds || ""} onChange={e => updateResult(i, "odds", +e.target.value)} /></td>
                <td><input type="number" className="form-input" style={{ width: "100px" }} value={r.prize || ""} onChange={e => updateResult(i, "prize", +e.target.value)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="btn btn-secondary btn-sm" style={{ marginTop: "8px" }} onClick={addRow}>＋ 着順追加</button>
      </div>

      {/* 的中確認 */}
      {formation && resultNums.length >= 3 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">🎯 的中確認</div>
          </div>
          {hitTickets.length > 0 ? (
            <div className="alert alert-success">
              🎉 的中！ {hitTickets.map(t => t.join("-")).join(", ")} が的中しました
            </div>
          ) : (
            <div className="alert alert-warning">
              😞 今回は不的中でした。AIが自動学習して次回に活かします。
            </div>
          )}
          <div className="form-group">
            <label className="form-label">払戻金額（円）</label>
            <input type="number" className="form-input" value={profit || ""} onChange={e => setProfit(+e.target.value)} placeholder="的中した場合の払戻金額" />
          </div>
        </div>
      )}

      {/* 予想との比較 */}
      {race.predictions && race.predictions.length > 0 && (
        <div className="card">
          <div className="card-header"><div className="card-title">📊 予想との比較</div></div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {race.predictions.slice(0, 7).map((p, i) => {
              const isHit = resultNums.includes(p.horseNumber);
              const rank = resultNums.indexOf(p.horseNumber) + 1;
              return (
                <div key={p.horseId} style={{
                  padding: "10px 14px",
                  background: isHit ? "var(--accent-green)15" : "var(--bg-surface)",
                  border: `1px solid ${isHit ? "var(--accent-green)40" : "var(--border)"}`,
                  borderRadius: "8px",
                  textAlign: "center",
                  minWidth: "80px",
                }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>予想{i + 1}位</div>
                  <div style={{ fontWeight: 700, color: isHit ? "var(--accent-green)" : "var(--text-primary)" }}>
                    {p.horseNumber}番
                  </div>
                  <div style={{ fontSize: "0.75rem" }}>{p.horseName}</div>
                  {isHit && <div style={{ color: "var(--accent-green)", fontSize: "0.7rem", fontWeight: 700 }}>{rank}着 ✓</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
