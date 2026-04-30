"use client";
import { useState } from "react";
import { Race, Prediction, Formation } from "../types";
import { generateFormation } from "../lib/engine";

const FRAME_BG = ["","#e2e8f0","#1a1a1a","#e53e3e","#3182ce","#d69e2e","#2f855a","#d6bcfa","#fc8181"];
const FRAME_COLOR = ["","#000","#fff","#fff","#fff","#000","#fff","#000","#000"];

function FrameBadge({ frame }: { frame: number }) {
  return (
    <span className="frame-badge" style={{ background: FRAME_BG[frame] || "#666", color: FRAME_COLOR[frame] || "#fff" }}>
      {frame}
    </span>
  );
}

export default function PredictionView({ race, onRunPrediction, onEnterResult, onBack }: {
  race: Race;
  onRunPrediction: () => void;
  onEnterResult: () => void;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<"horses" | "prediction" | "formation" | "win5">("horses");
  const [formationType, setFormationType] = useState<"trifecta" | "quinella" | "exacta">("trifecta");
  const predictions = race.predictions || [];
  const hasPrediction = predictions.length > 0;
  const maxPotential = Math.max(...predictions.map(p => p.potential), 1);

  const formation: Formation | null = hasPrediction ? generateFormation(predictions, formationType) : null;

  return (
    <div className="fade-in">
      <div className="section-header">
        <div>
          <div className="section-title">🏇 {race.date} {race.venue} {race.raceNumber}R {race.raceName}</div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px", display: "flex", gap: "12px" }}>
            <span>{race.surface} {race.distance}m</span>
            <span>馬場: {race.condition}</span>
            <span>{race.headCount}頭立て</span>
            {race.isWin5 && <span className="tag tag-purple">WIN5</span>}
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn-secondary btn-sm" onClick={onBack}>← 戻る</button>
          {!hasPrediction && (
            <button className="btn btn-primary" onClick={onRunPrediction}>🛰️ 予想実行</button>
          )}
          {hasPrediction && !race.result && (
            <>
              <button className="btn btn-secondary" onClick={onRunPrediction}>🔄 再予想</button>
              <button className="btn btn-success" onClick={onEnterResult}>✅ 結果入力</button>
            </>
          )}
          {race.result && (
            <button className="btn btn-secondary" onClick={onEnterResult}>📊 結果確認</button>
          )}
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === "horses" ? "active" : ""}`} onClick={() => setTab("horses")}>🐴 出馬表</button>
        {hasPrediction && <>
          <button className={`tab ${tab === "prediction" ? "active" : ""}`} onClick={() => setTab("prediction")}>📊 予想結果</button>
          <button className={`tab ${tab === "formation" ? "active" : ""}`} onClick={() => setTab("formation")}>🎯 買い目</button>
        </>}
        {race.isWin5 && <button className={`tab ${tab === "win5" ? "active" : ""}`} onClick={() => setTab("win5")}>🎯 WIN5</button>}
      </div>

      {/* 出馬表タブ */}
      {tab === "horses" && (
        <div className="card">
          <table className="horse-table">
            <thead>
              <tr>
                <th>枠</th><th>馬番</th><th>馬名</th><th>性齢</th>
                <th>騎手</th><th>斤量</th><th>馬体重</th><th>増減</th>
                <th>父</th><th>脚質</th><th>オッズ</th><th>前走</th>
              </tr>
            </thead>
            <tbody>
              {race.horses.map(h => (
                <tr key={h.id}>
                  <td><FrameBadge frame={h.frame} /></td>
                  <td>
                    <span className="horse-num" style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}>
                      {h.number}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{h.name || "—"}</td>
                  <td style={{ color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{h.gender}{h.age}</td>
                  <td>{h.jockey || "—"}</td>
                  <td style={{ color: "var(--text-muted)" }}>{h.jockeyWeight}</td>
                  <td style={{ fontWeight: 600 }}>{h.weight}kg</td>
                  <td style={{ color: h.weightChange > 0 ? "var(--accent-red)" : h.weightChange < 0 ? "var(--accent-blue)" : "var(--text-muted)" }}>
                    {h.weightChange > 0 ? `+${h.weightChange}` : h.weightChange}
                  </td>
                  <td style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{h.sire || "—"}</td>
                  <td style={{ fontSize: "0.75rem" }}>{h.style || "—"}</td>
                  <td style={{ color: "var(--accent-gold)", fontWeight: 700 }}>{h.odds ? `${h.odds}倍` : "—"}</td>
                  <td style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    {h.pastRaces[0] ? `${h.pastRaces[0].venue} ${h.pastRaces[0].result}着` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!hasPrediction && (
            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <button className="btn btn-primary" onClick={onRunPrediction} style={{ fontSize: "1rem", padding: "12px 32px" }}>
                🛰️ 土屋プロトコル実行
              </button>
            </div>
          )}
        </div>
      )}

      {/* 予想結果タブ */}
      {tab === "prediction" && hasPrediction && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">📊 土屋プロトコル解析結果</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              A評価（軸）: 上位3頭 / B評価（ヒモ穴）: Darkness上位
            </div>
          </div>
          <table className="horse-table">
            <thead>
              <tr>
                <th>順位</th><th>馬番</th><th>馬名</th>
                <th>Potential</th><th>Darkness</th>
                <th>タグ</th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((p, i) => {
                const horse = race.horses.find(h => h.id === p.horseId);
                const isAxis = i < 3;
                const isDark = !isAxis && i < 7;
                return (
                  <tr key={p.horseId}>
                    <td>
                      <span className={`rank-badge rank-${i < 3 ? i + 1 : "other"}`}>{i + 1}</span>
                    </td>
                    <td>
                      <span className="horse-num" style={{
                        background: isAxis ? "var(--accent-gold)30" : isDark ? "var(--accent-purple)20" : "var(--bg-elevated)",
                        color: isAxis ? "var(--accent-gold)" : isDark ? "var(--accent-purple)" : "var(--text-muted)",
                        border: isAxis ? "1px solid var(--accent-gold)50" : "none",
                      }}>
                        {p.horseNumber}
                      </span>
                    </td>
                    <td style={{ fontWeight: isAxis ? 700 : 400 }}>
                      {p.horseName}
                      {isAxis && <span style={{ marginLeft: "6px", fontSize: "0.7rem", color: "var(--accent-gold)" }}>◎軸</span>}
                      {isDark && <span style={{ marginLeft: "6px", fontSize: "0.7rem", color: "var(--accent-purple)" }}>▲闇</span>}
                    </td>
                    <td>
                      <div className="score-bar-wrap">
                        <div className="score-bar" style={{ maxWidth: "80px" }}>
                          <div className="score-bar-fill" style={{
                            width: `${(p.potential / maxPotential) * 100}%`,
                            background: isAxis ? "var(--gradient-gold)" : "var(--gradient-blue)",
                          }} />
                        </div>
                        <span className="score-value" style={{ color: isAxis ? "var(--accent-gold)" : "var(--text-primary)" }}>
                          {p.potential}
                        </span>
                      </div>
                    </td>
                    <td style={{ color: "var(--accent-purple)", fontWeight: 600, fontSize: "0.85rem" }}>
                      {p.darkness.toFixed(2)}
                    </td>
                    <td>
                      <div className="tags-wrap">
                        {(p.aptitudeTags || []).slice(0, 3).map((tag, ti) => (
                          <span key={ti} className={`tag ${isAxis ? "tag-gold" : "tag-blue"}`}>{tag}</span>
                        ))}
                        {(p.aptitudeTags || []).length > 3 && (
                          <span className="tag" style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
                            +{(p.aptitudeTags || []).length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {race.result && (
            <div className="alert alert-success" style={{ marginTop: "16px" }}>
              ✅ 確定済み — 1着: {race.result.result[0]?.horseName} ({race.result.result[0]?.horseNumber}番)
              {race.result.hitTickets && race.result.hitTickets.length > 0 && ` 🎉 的中！`}
            </div>
          )}
        </div>
      )}

      {/* 買い目タブ */}
      {tab === "formation" && formation && (
        <div className="fade-in">
          <div className="card">
            <div className="card-header">
              <div className="card-title">🎯 精密フォーメーション（13点）</div>
              <select
                className="form-select"
                style={{ width: "auto", fontSize: "0.8rem" }}
                value={formationType}
                onChange={e => setFormationType(e.target.value as typeof formationType)}
              >
                <option value="trifecta">三連複</option>
                <option value="quinella">馬連</option>
                <option value="exacta">馬単</option>
              </select>
            </div>

            <div className="formation-grid">
              {[
                ["1列目（軸）", formation.col1, "var(--accent-gold)"],
                ["2列目（軸）", formation.col2 || [], "var(--accent-gold)"],
                ["3列目（相手）", formation.col3 || [], "var(--accent-blue)"],
              ].map(([title, horses, color]) => (
                <div className="formation-col" key={title as string}>
                  <div className="formation-col-title">{title as string}</div>
                  <div className="formation-horses">
                    {(horses as number[]).map(n => (
                      <span key={n} className="horse-num" style={{ background: `${color}20`, color: color as string, border: `1px solid ${color}50` }}>
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: "12px" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "8px" }}>
                <span className="tag tag-gold">軸3頭</span>
                {formation.axisHorses.map(n => {
                  const h = race.horses.find(h => h.number === n);
                  return <span key={n} style={{ marginLeft: "8px", fontWeight: 600 }}>{n}番 {h?.name}</span>;
                })}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                <span className="tag tag-purple">闇ヒモ</span>
                {formation.darkHorses.map(n => {
                  const h = race.horses.find(h => h.number === n);
                  return <span key={n} style={{ marginLeft: "8px" }}>{n}番 {h?.name}</span>;
                })}
              </div>
            </div>

            <hr className="divider" />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <div style={{ fontWeight: 700 }}>買い目一覧（計 {formation.totalPoints} 点）</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>100円×{formation.totalPoints}点 = {formation.totalPoints * 100}円</div>
            </div>
            <div className="ticket-list">
              {formation.tickets.map((ticket, i) => {
                const isHit = race.result?.hitTickets?.some(h =>
                  h.length === ticket.length && h.every((n, j) => n === ticket[j])
                );
                return (
                  <div key={i} className={`ticket-item ${isHit ? "hit" : ""}`}>
                    <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", minWidth: "18px" }}>{String(i + 1).padStart(2, "0")}</span>
                    {ticket.map((n, j) => (
                      <span key={j}>
                        <span className="ticket-num" style={{
                          background: formation.axisHorses.includes(n) ? "var(--accent-gold)30" : "var(--bg-elevated)",
                          color: formation.axisHorses.includes(n) ? "var(--accent-gold)" : "var(--text-primary)",
                        }}>{n}</span>
                        {j < ticket.length - 1 && <span style={{ color: "var(--text-muted)", margin: "0 2px" }}>-</span>}
                      </span>
                    ))}
                    {isHit && <span style={{ color: "var(--accent-green)", fontWeight: 900 }}>✓</span>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="alert alert-warning">
            ⚠️ 合成オッズが13.0倍を下回る場合は「見（ケン）」を推奨。資金配分はハーフ・ケリー基準（総資金の1%以下）を厳守。
          </div>
        </div>
      )}
    </div>
  );
}
