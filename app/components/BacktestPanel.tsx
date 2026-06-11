"use client";
import { AppState, TagStats } from "../types";
import { useState } from "react";

export default function BacktestPanel({ state }: { state: AppState }) {
  const tagStats: TagStats[] = state.tagStats || [];
  const [sortBy, setSortBy] = useState<"fired" | "hitRate" | "winRate">("fired");
  const [minFired, setMinFired] = useState(3);

  const filtered = tagStats
    .filter(t => t.fired >= minFired)
    .sort((a, b) => {
      if (sortBy === "fired") return b.fired - a.fired;
      if (sortBy === "hitRate") return b.hitRate - a.hitRate;
      return b.winRate - a.winRate;
    });

  const totalFired = tagStats.reduce((s, t) => s + t.fired, 0);
  const avgHitRate = tagStats.length > 0
    ? tagStats.reduce((s, t) => s + t.hitRate * t.fired, 0) / Math.max(totalFired, 1)
    : 0;

  const getHitColor = (rate: number) => {
    if (rate >= 0.6) return "var(--accent-green)";
    if (rate >= 0.4) return "var(--accent-gold)";
    if (rate >= 0.25) return "var(--text-primary)";
    return "var(--accent-red)";
  };

  const getHitLabel = (rate: number) => {
    if (rate >= 0.6) return { text: "有効", bg: "#14532d", border: "#16a34a" };
    if (rate >= 0.4) return { text: "普通", bg: "#713f12", border: "#ca8a04" };
    if (rate >= 0.25) return { text: "要観察", bg: "#1c1917", border: "#78716c" };
    return { text: "要見直し", bg: "#450a0a", border: "#dc2626" };
  };

  return (
    <div className="fade-in">
      <div className="section-header">
        <h2 className="section-title">📊 バックテスト分析</h2>
        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
          AIの各ルール（タグ）が実際の結果でどれだけ有効だったか検証します
        </div>
      </div>

      {/* サマリーカード */}
      <div className="stats-grid" style={{ marginBottom: "16px" }}>
        <div className="stat-card">
          <div className="stat-card-value" style={{ color: "var(--accent-blue)" }}>{tagStats.length}</div>
          <div className="stat-card-label">記録済みタグ数</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value" style={{ color: "var(--accent-gold)" }}>{totalFired}</div>
          <div className="stat-card-label">タグ発動総数</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value" style={{ color: getHitColor(avgHitRate) }}>
            {(avgHitRate * 100).toFixed(1)}%
          </div>
          <div className="stat-card-label">加重平均複勝率</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value" style={{ color: "var(--accent-green)" }}>
            {tagStats.filter(t => t.hitRate >= 0.5 && t.fired >= 3).length}
          </div>
          <div className="stat-card-label">有効ルール数（複勝率50%+）</div>
        </div>
      </div>

      {/* フィルター・ソートUI */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <div className="card-header"><div className="card-title">🔍 フィルター・並び替え</div></div>
        <div className="p-16" style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
              最低発動回数
            </label>
            <select
              value={minFired}
              onChange={e => setMinFired(Number(e.target.value))}
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                padding: "6px 10px",
                borderRadius: "6px",
                fontSize: "13px",
              }}
            >
              <option value={1}>1回以上</option>
              <option value={3}>3回以上</option>
              <option value={5}>5回以上</option>
              <option value={10}>10回以上</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
              並び替え
            </label>
            <div style={{ display: "flex", gap: "6px" }}>
              {(["fired", "hitRate", "winRate"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    cursor: "pointer",
                    background: sortBy === s ? "var(--accent-blue)" : "var(--bg-elevated)",
                    border: `1px solid ${sortBy === s ? "var(--accent-blue)" : "var(--border)"}`,
                    color: "var(--text-primary)",
                  }}
                >
                  {s === "fired" ? "発動回数" : s === "hitRate" ? "複勝率" : "勝率"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <div className="empty-state-title">
            {tagStats.length === 0
              ? "まだバックテストデータがありません"
              : `発動回数${minFired}回以上のタグがありません`}
          </div>
          <div className="empty-state-desc">
            {tagStats.length === 0
              ? "出馬表を入力→AI予想→結果入力を繰り返すことでデータが蓄積されます"
              : "フィルターを「1回以上」に変更してみてください"}
          </div>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">🏷️ タグ別 的中率ランキング（{filtered.length}件）</div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="horse-table" style={{ fontSize: "12px" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", minWidth: "200px" }}>タグ名（AIルール）</th>
                  <th style={{ textAlign: "center", width: "60px" }}>発動回数</th>
                  <th style={{ textAlign: "center", width: "80px" }}>複勝率</th>
                  <th style={{ textAlign: "center", width: "80px" }}>勝率</th>
                  <th style={{ textAlign: "center", width: "80px" }}>判定</th>
                  <th style={{ minWidth: "120px" }}>複勝バー</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => {
                  const label = getHitLabel(t.hitRate);
                  return (
                    <tr key={i}>
                      <td style={{ fontFamily: "monospace", fontSize: "11px", maxWidth: "240px", wordBreak: "break-all" }}>
                        {t.tag}
                      </td>
                      <td style={{ textAlign: "center", fontWeight: 600 }}>{t.fired}</td>
                      <td style={{ textAlign: "center", fontWeight: 700, color: getHitColor(t.hitRate) }}>
                        {(t.hitRate * 100).toFixed(1)}%
                        <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block" }}>
                          {t.top3}/{t.fired}
                        </span>
                      </td>
                      <td style={{ textAlign: "center", color: getHitColor(t.winRate) }}>
                        {(t.winRate * 100).toFixed(1)}%
                        <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block" }}>
                          {t.win}/{t.fired}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: label.bg,
                          border: `1px solid ${label.border}`,
                          color: label.border,
                          whiteSpace: "nowrap",
                        }}>
                          {label.text}
                        </span>
                      </td>
                      <td>
                        <div style={{ background: "var(--bg-elevated)", borderRadius: "4px", height: "8px", overflow: "hidden" }}>
                          <div style={{
                            width: `${Math.min(t.hitRate * 100, 100)}%`,
                            height: "100%",
                            background: getHitColor(t.hitRate),
                            borderRadius: "4px",
                            transition: "width 0.5s ease",
                          }} />
                        </div>
                        <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>
                          勝率 {(t.winRate * 100).toFixed(0)}%
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 凡例 */}
      <div className="card" style={{ marginTop: "16px" }}>
        <div className="card-header"><div className="card-title">📖 判定基準</div></div>
        <div className="p-16" style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {[
            { label: "有効", color: "#16a34a", desc: "複勝率60%以上。このルールは使える" },
            { label: "普通", color: "#ca8a04", desc: "複勝率40〜60%。標準的な精度" },
            { label: "要観察", color: "#78716c", desc: "複勝率25〜40%。データを積む" },
            { label: "要見直し", color: "#dc2626", desc: "複勝率25%未満。ルールを見直す" },
          ].map(item => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
              <span style={{
                padding: "2px 8px",
                borderRadius: "4px",
                border: `1px solid ${item.color}`,
                color: item.color,
                fontWeight: 700,
                fontSize: "11px",
              }}>{item.label}</span>
              <span style={{ color: "var(--text-muted)" }}>{item.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
