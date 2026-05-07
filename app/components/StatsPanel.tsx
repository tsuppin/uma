"use client";
import { AppState } from "../types";

export default function StatsPanel({ state }: { state: AppState }) {
  const { stats } = state;
  const completed = state.races.filter(r => r.result);

  const venueStats = completed.reduce((acc, race) => {
    if (!acc[race.venue]) acc[race.venue] = { total: 0, hit: 0, profit: 0 };
    acc[race.venue].total++;
    if (race.result?.hitTickets?.length) acc[race.venue].hit++;
    acc[race.venue].profit += race.result?.profit || 0;
    return acc;
  }, {} as Record<string, { total: number; hit: number; profit: number; }>);

  return (
    <div className="fade-in">
      <div className="section-header">
        <h2 className="section-title">📈 成績・統計</h2>
      </div>

      <div className="stats-grid">
        {[
          ["総レース数", stats.totalRaces, "🏇", "var(--text-primary)"],
          ["的中数", stats.hitCount, "✅", "var(--accent-green)"],
          ["的中率", `${(stats.hitRate * 100).toFixed(1)}%`, "🎯", "var(--accent-gold)"],
          ["総投資", `¥${stats.totalInvested.toLocaleString()}`, "💴", "var(--text-secondary)"],
          ["総払戻", `¥${stats.totalReturn.toLocaleString()}`, "💰", "var(--accent-gold)"],
          ["ROI", `${(stats.roi * 100).toFixed(1)}%`, "📊", stats.roi >= 0 ? "var(--accent-green)" : "var(--accent-red)"],
        ].map(([label, value, icon, color]) => (
          <div className="stat-card" key={label as string}>
            <div style={{ fontSize: "1.5rem", marginBottom: "4px" }}>{icon}</div>
            <div className="stat-card-value" style={{ fontSize: "1.5rem", color: color as string }}>{value}</div>
            <div className="stat-card-label">{label}</div>
          </div>
        ))}
      </div>

      {Object.keys(venueStats).length > 0 && (
        <div className="card">
          <div className="card-header"><div className="card-title">🏟️ 競馬場別成績</div></div>
          <table className="horse-table">
            <thead>
              <tr><th>競馬場</th><th>レース数</th><th>的中数</th><th>的中率</th><th>収支</th></tr>
            </thead>
            <tbody>
              {Object.entries(venueStats).map(([venue, s]) => {
                const hitRate = s.total > 0 ? s.hit / s.total : 0;
                const invested = s.total * 1300;
                const profit = s.profit - invested;
                return (
                  <tr key={venue}>
                    <td style={{ fontWeight: 600 }}>{venue}</td>
                    <td>{s.total}</td>
                    <td style={{ color: "var(--accent-green)" }}>{s.hit}</td>
                    <td>{(hitRate * 100).toFixed(1)}%</td>
                    <td style={{ color: profit >= 0 ? "var(--accent-green)" : "var(--accent-red)", fontWeight: 700 }}>
                      {profit >= 0 ? "+" : ""}{profit.toLocaleString()}円
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {completed.length > 0 && (
        <div className="card">
          <div className="card-header"><div className="card-title">📋 レース履歴</div></div>
          <table className="horse-table">
            <thead>
              <tr><th>日付</th><th>競馬場</th><th>レース</th><th>距離</th><th>1着</th><th>的中</th><th>収支</th></tr>
            </thead>
            <tbody>
              {completed.slice().reverse().map(race => {
                const isHit = (race.result?.hitTickets?.length || 0) > 0;
                const invested = 1300;
                const profit = (race.result?.profit || 0) - invested;
                return (
                  <tr key={race.id}>
                    <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{race.date}</td>
                    <td>{race.venue}</td>
                    <td>{race.raceNumber}R {race.raceName}</td>
                    <td>{race.surface}{race.distance}m</td>
                    <td style={{ fontWeight: 600 }}>
                      {race.result?.result[0] ? `${race.result.result[0].horseNumber}番 ${race.result.result[0].horseName}` : "—"}
                    </td>
                    <td>
                      {isHit
                        ? <span className="tag tag-green">的中</span>
                        : <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>不的中</span>
                      }
                    </td>
                    <td style={{ fontWeight: 700, color: profit >= 0 ? "var(--accent-green)" : "var(--accent-red)" }}>
                      {profit >= 0 ? "+" : ""}{profit.toLocaleString()}円
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {completed.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <div className="empty-state-title">まだ確定済みレースがありません</div>
          <div className="empty-state-desc">レース結果を入力すると統計が表示されます</div>
        </div>
      )}
    </div>
  );
}
