"use client";
import { AppState, TagStats } from "../types";
import { useState } from "react";

export default function BacktestPanel({ state, onResetStats }: { state: AppState; onResetStats?: () => void }) {
  const tagStats: TagStats[] = state.tagStats || [];
  const [sortBy, setSortBy] = useState<"fired" | "hitRate" | "winRate" | "evaluation">("fired");
  const [minFired, setMinFired] = useState(3);
  const [selectedVenue, setSelectedVenue] = useState<string>("全競馬場");

  // 競馬場一覧を動的に取得
  const venues = ["全競馬場", ...Array.from(new Set(tagStats.map(t => t.venue || "不明"))).sort()];

  // タグの集計（全競馬場の場合はタグ名でグループ化）
  const aggregatedTags = selectedVenue === "全競馬場"
    ? Object.values(tagStats.reduce((acc, t) => {
        if (!acc[t.tag]) {
          acc[t.tag] = { ...t, venue: "全競馬場" };
        } else {
          acc[t.tag].fired += t.fired;
          acc[t.tag].win += t.win;
          acc[t.tag].top3 += t.top3;
          acc[t.tag].hitRate = acc[t.tag].top3 / acc[t.tag].fired;
          acc[t.tag].winRate = acc[t.tag].win / acc[t.tag].fired;
        }
        return acc;
      }, {} as Record<string, import("../types").TagStats>))
    : tagStats.filter(t => (t.venue || "不明") === selectedVenue);

  // フィルタリング
  const filtered = aggregatedTags
    .filter(t => t.fired >= minFired)
    .sort((a, b) => {
      if (sortBy === "fired") return b.fired - a.fired;
      if (sortBy === "hitRate") return b.hitRate - a.hitRate;
      if (sortBy === "evaluation") return a.hitRate - b.hitRate; // 判定（要見直し等）の悪い順
      return b.winRate - a.winRate;
    });

  // 競馬場別サマリーを集計
  const venueMap: Record<string, { fired: number; win: number; top3: number; tagCount: number }> = {};
  for (const t of tagStats) {
    const v = t.venue || "不明";
    if (!venueMap[v]) venueMap[v] = { fired: 0, win: 0, top3: 0, tagCount: 0 };
    venueMap[v].fired += t.fired;
    venueMap[v].win += t.win;
    venueMap[v].top3 += t.top3;
    venueMap[v].tagCount += 1;
  }

  const totalFired = aggregatedTags.reduce((s, t) => s + t.fired, 0);

  const avgHitRate = totalFired > 0
    ? aggregatedTags.reduce((s, t) => s + t.hitRate * t.fired, 0) / totalFired
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
      <div className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 className="section-title">🔬 バックテスト分析</h2>
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            AIの各ルール（タグ）が実際の結果でどれだけ有効だったか検証します
          </div>
        </div>
        {onResetStats && (
          <button
            onClick={() => {
              if (confirm("バックテストのデータをすべてリセットしますか？\n(過去のレース記録は消えませんが、集計データが初期化されます)")) {
                onResetStats();
              }
            }}
            style={{
              padding: "6px 12px",
              background: "var(--accent-red)",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            データクリア
          </button>
        )}
      </div>

      {/* 競馬場別サマリーカード */}
      {Object.keys(venueMap).length > 0 && (
        <div className="card" style={{ marginBottom: "16px" }}>
          <div className="card-header"><div className="card-title">🏟️ 競馬場別 複勝率サマリー</div></div>
          <div style={{ overflowX: "auto" }}>
            <table className="horse-table" style={{ fontSize: "12px" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>競馬場</th>
                  <th style={{ textAlign: "center" }}>タグ数</th>
                  <th style={{ textAlign: "center" }}>発動回数</th>
                  <th style={{ textAlign: "center" }}>複勝率</th>
                  <th style={{ textAlign: "center" }}>勝率</th>
                  <th style={{ minWidth: "100px" }}>バー</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(venueMap)
                  .sort((a, b) => (b[1].top3 / Math.max(b[1].fired, 1)) - (a[1].top3 / Math.max(a[1].fired, 1)))
                  .map(([venue, s]) => {
                    const hr = s.fired > 0 ? s.top3 / s.fired : 0;
                    const wr = s.fired > 0 ? s.win / s.fired : 0;
                    return (
                      <tr
                        key={venue}
                        onClick={() => setSelectedVenue(venue === selectedVenue ? "全競馬場" : venue)}
                        style={{ cursor: "pointer", background: selectedVenue === venue ? "rgba(59,130,246,0.1)" : undefined }}
                      >
                        <td className="fw-600" style={{ color: selectedVenue === venue ? "var(--accent-blue)" : undefined }}>
                          {selectedVenue === venue ? "▶ " : ""}{venue}
                        </td>
                        <td style={{ textAlign: "center", color: "var(--text-muted)" }}>{s.tagCount}</td>
                        <td style={{ textAlign: "center" }}>{s.fired}</td>
                        <td style={{ textAlign: "center", fontWeight: 700, color: getHitColor(hr) }}>
                          {(hr * 100).toFixed(1)}%
                          <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block" }}>{s.top3}/{s.fired}</span>
                        </td>
                        <td style={{ textAlign: "center", color: getHitColor(wr) }}>
                          {(wr * 100).toFixed(1)}%
                        </td>
                        <td>
                          <div style={{ background: "var(--bg-elevated)", borderRadius: "4px", height: "8px", overflow: "hidden" }}>
                            <div style={{
                              width: `${Math.min(hr * 100, 100)}%`,
                              height: "100%",
                              background: getHitColor(hr),
                              borderRadius: "4px",
                            }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            <div style={{ padding: "8px 12px", fontSize: "11px", color: "var(--text-muted)" }}>
              ※ 競馬場名をクリックすると下のタグ一覧がその競馬場に絞り込まれます
            </div>
          </div>
        </div>
      )}

      {/* 全体サマリーカード */}
      <div className="stats-grid" style={{ marginBottom: "16px" }}>
        <div className="stat-card">
          <div className="stat-card-value" style={{ color: "var(--accent-blue)" }}>
            {filtered.length}
          </div>
          <div className="stat-card-label">{selectedVenue === "全競馬場" ? "全タグ数" : `${selectedVenue}のタグ数`}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value" style={{ color: "var(--accent-gold)" }}>{totalFired}</div>
          <div className="stat-card-label">発動総数</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value" style={{ color: getHitColor(avgHitRate) }}>
            {(avgHitRate * 100).toFixed(1)}%
          </div>
          <div className="stat-card-label">平均複勝率</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value" style={{ color: "var(--accent-green)" }}>
            {filtered.filter(t => t.hitRate >= 0.5).length}
          </div>
          <div className="stat-card-label">有効ルール（50%+）</div>
        </div>
      </div>

      {/* フィルター・ソートUI */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <div className="card-header"><div className="card-title">🔍 フィルター・並び替え</div></div>
        <div className="p-16" style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end" }}>
          {/* 競馬場フィルター */}
          <div>
            <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
              競馬場
            </label>
            <select
              value={selectedVenue}
              onChange={e => setSelectedVenue(e.target.value)}
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                padding: "6px 10px",
                borderRadius: "6px",
                fontSize: "13px",
              }}
            >
              {venues.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          {/* 最低発動回数 */}
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

          {/* ソート */}
          <div>
            <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
              並び替え
            </label>
            <div style={{ display: "flex", gap: "6px" }}>
              {(["fired", "hitRate", "winRate", "evaluation"] as const).map(s => (
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
                  {s === "fired" ? "発動回数" : s === "hitRate" ? "複勝率" : s === "winRate" ? "勝率" : "判定"}
                </button>
              ))}
            </div>
          </div>

          {/* リセット */}
          {selectedVenue !== "全競馬場" && (
            <button
              onClick={() => setSelectedVenue("全競馬場")}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "12px",
                cursor: "pointer",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
              }}
            >
              ✕ 絞り込み解除
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <div className="empty-state-title">
            {tagStats.length === 0
              ? "まだバックテストデータがありません"
              : `条件に一致するタグがありません`}
          </div>
          <div className="empty-state-desc">
            {tagStats.length === 0
              ? "出馬表を入力→AI予想→結果入力を繰り返すことでデータが蓄積されます"
              : "フィルターを変更してみてください"}
          </div>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              🏷️ {selectedVenue === "全競馬場" ? "全競馬場" : `【${selectedVenue}】`} タグ別的中率（{filtered.length}件）
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="horse-table" style={{ fontSize: "12px", tableLayout: "fixed", width: "100%" }}>
              <colgroup>
                <col style={{ width: "calc(100% - 350px)" }} />
                <col style={{ width: "55px" }} />
                <col style={{ width: "75px" }} />
                <col style={{ width: "75px" }} />
                <col style={{ width: "75px" }} />
                <col style={{ width: "75px" }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>タグ名（AIルール）</th>
                  <th style={{ textAlign: "center" }}>発動</th>
                  <th style={{ textAlign: "center" }}>複勝率</th>
                  <th style={{ textAlign: "center" }}>勝率</th>
                  <th style={{ textAlign: "center" }}>判定</th>
                  <th>バー</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => {
                  const label = getHitLabel(t.hitRate);
                  return (
                    <tr key={i}>
                      <td style={{
                        fontSize: "11px",
                        wordBreak: "break-all",
                        whiteSpace: "normal",
                        lineHeight: "1.4",
                        overflow: "hidden",
                        display: "table-cell",
                        verticalAlign: "middle",
                        paddingRight: "8px",
                      }}>
                        <div style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          wordBreak: "break-all",
                        }} title={t.tag}>
                          {t.tag}
                        </div>
                      </td>
                      <td style={{ textAlign: "center", fontWeight: "bold" }}>
                        {t.fired}
                      </td>
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
