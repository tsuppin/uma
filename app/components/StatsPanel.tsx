"use client";
import { AppState } from "../types";

export default function StatsPanel({ state, onReset }: { state: AppState; onReset?: () => void }) {
  const { stats } = state;
  const completed = state.races.filter(r => r.result);

  const venueStats = completed.reduce((acc, race) => {
    if (!acc[race.venue]) {
      acc[race.venue] = { 
        total: 0, 
        hit: 0, 
        profit: 0,
        win: 0,
        wide: 0,
        trio: 0,
        trifecta: 0,
        quinella: 0,
        exacta: 0
      };
    }
    acc[race.venue].total++;
    if (race.result?.hitTickets?.length) acc[race.venue].hit++;
    acc[race.venue].profit += race.result?.profit || 0;

    if (race.result) {
      const r = race.result;
      const isWinHit = r.hits?.win;
      const isWideHit = r.hits?.wide;
      const isTrioHit = r.hits?.trio || (r.hitTickets && r.hitTickets.length > 0);
      const isTrifectaHit = r.hits?.trifecta;
      const isQuinellaHit = r.hits?.quinella;
      const isExactaHit = r.hits?.exacta;

      if (isWinHit) acc[race.venue].win++;
      if (isWideHit) acc[race.venue].wide++;
      if (isTrioHit) acc[race.venue].trio++;
      if (isTrifectaHit) acc[race.venue].trifecta++;
      if (isQuinellaHit) acc[race.venue].quinella++;
      if (isExactaHit) acc[race.venue].exacta++;
    }

    return acc;
  }, {} as Record<string, { 
    total: number; 
    hit: number; 
    profit: number;
    win: number;
    wide: number;
    trio: number;
    trifecta: number;
    quinella: number;
    exacta: number;
  }>);

  return (
    <div className="fade-in">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 className="section-title m-0">📈 成績・統計</h2>
        {onReset && (
          <button 
            onClick={onReset}
            className="btn btn-secondary fs-sm"
            style={{ padding: '6px 12px' }}
          >
            🗑️ データをリセット
          </button>
        )}
      </div>

      <div className="stats-grid">
        {[
          ["総レース数", stats.totalRaces, "text-primary"],
          ["的中数", stats.hitCount, "text-green"],
        ].map(([label, value, colorClass]) => (
          <div className="stat-card" key={label as string}>
            <div className={`stat-card-value fs-2xl ${colorClass}`}>{value}</div>
            <div className="stat-card-label">{label}</div>
          </div>
        ))}
      </div>

      {completed.length > 0 && (
        <div className="card mt-16">
          <div className="card-header">
            <div className="card-title">🎯 券種別的中率</div>
          </div>
          <div className="p-16 flex flex-col gap-12">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              {[
                { label: "単勝", hits: completed.filter(r => r.result?.hits?.win).length, rate: (completed.filter(r => r.result?.hits?.win).length / completed.length) * 100, color: "var(--color-red)" },
                { label: "馬単", hits: completed.filter(r => r.result?.hits?.exacta).length, rate: (completed.filter(r => r.result?.hits?.exacta).length / completed.length) * 100, color: "var(--accent-blue)" },
                { label: "ワイド", hits: completed.filter(r => r.result?.hits?.wide).length, rate: (completed.filter(r => r.result?.hits?.wide).length / completed.length) * 100, color: "var(--color-blue)" },
                { label: "馬連", hits: completed.filter(r => r.result?.hits?.quinella).length, rate: (completed.filter(r => r.result?.hits?.quinella).length / completed.length) * 100, color: "var(--accent-green)" },
                { label: "三連単", hits: completed.filter(r => r.result?.hits?.trifecta).length, rate: (completed.filter(r => r.result?.hits?.trifecta).length / completed.length) * 100, color: "var(--accent-purple)" },
                { label: "三連複", hits: completed.filter(r => r.result?.hits?.trio || (r.result?.hitTickets && r.result.hitTickets.length > 0)).length, rate: (completed.filter(r => r.result?.hits?.trio || (r.result?.hitTickets && r.result.hitTickets.length > 0)).length / completed.length) * 100, color: "var(--accent-gold)" },
              ].map(item => (
                <div key={item.label} className="bg-elevated p-12 rounded-8 border">
                  <div className="flex justify-between items-center mb-6">
                    <span className="fs-sm fw-600">{item.label}</span>
                    <span className="fs-xs text-muted">{item.hits} / {completed.length} 的中</span>
                  </div>
                  <div className="fs-2xl fw-700 mb-6" style={{ color: item.color }}>
                    {item.rate.toFixed(1)}%
                  </div>
                  <div className="score-bar-wrap no-padding" style={{ height: 6 }}>
                    <div className="score-bar w-100" style={{ height: 6, margin: 0 }}>
                      <div className="score-bar-fill" style={{ width: `${item.rate}%`, background: item.color }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {Object.keys(venueStats).length > 0 && (
        <div className="card">
          <div className="card-header"><div className="card-title">🏟️ 競馬場別成績</div></div>
          <table className="horse-table">
            <thead>
              <tr>
                <th>競馬場</th>
                <th style={{ width: '36px', minWidth: '36px', textAlign: 'center', paddingLeft: '4px', paddingRight: '4px', fontSize: '10px' }}>ﾚｰｽ</th>
                <th>単勝</th>
                <th>馬単</th>
                <th>ワイド</th>
                <th>馬連</th>
                <th>三連単</th>
                <th>三連複</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(venueStats).sort(([v1], [v2]) => {
                const VENUE_ORDER = [
                  "札幌", "函館", "福島", "新潟", "中山", "東京", "中京", "京都", "阪神", "小倉",
                  "帯広", "帯広ば", "帯広ばんえい", "門別", "盛岡", "水沢", "浦和", "船橋", "大井", "川崎", "金沢", "笠松", "名古屋", "園田", "姫路", "高知", "佐賀"
                ];
                const i1 = VENUE_ORDER.indexOf(v1);
                const i2 = VENUE_ORDER.indexOf(v2);
                if (i1 !== -1 && i2 !== -1) return i1 - i2;
                if (i1 !== -1) return -1;
                if (i2 !== -1) return 1;
                return v1.localeCompare(v2);
              }).map(([venue, s]) => {
                const winRate = s.total > 0 ? s.win / s.total : 0;
                const wideRate = s.total > 0 ? s.wide / s.total : 0;
                const trioRate = s.total > 0 ? s.trio / s.total : 0;
                const trifectaRate = s.total > 0 ? s.trifecta / s.total : 0;
                const quinellaRate = s.total > 0 ? s.quinella / s.total : 0;
                const exactaRate = s.total > 0 ? s.exacta / s.total : 0;
                return (
                  <tr key={venue}>
                    <td className="fw-600">{venue}</td>
                    <td style={{ width: '36px', minWidth: '36px', textAlign: 'center', paddingLeft: '4px', paddingRight: '4px', fontSize: '11px' }}>{s.total}</td>
                    <td style={{ color: winRate > 0.4 ? '#ff4d4f' : undefined }}>{(winRate * 100).toFixed(1)}% <span className="fs-xs text-muted">({s.win})</span></td>
                    <td style={{ color: exactaRate > 0.4 ? '#ff4d4f' : undefined }}>{(exactaRate * 100).toFixed(1)}% <span className="fs-xs text-muted">({s.exacta})</span></td>
                    <td style={{ color: wideRate > 0.4 ? '#ff4d4f' : undefined }}>{(wideRate * 100).toFixed(1)}% <span className="fs-xs text-muted">({s.wide})</span></td>
                    <td style={{ color: quinellaRate > 0.4 ? '#ff4d4f' : undefined }}>{(quinellaRate * 100).toFixed(1)}% <span className="fs-xs text-muted">({s.quinella})</span></td>
                    <td style={{ color: trifectaRate > 0.4 ? '#ff4d4f' : undefined }}>{(trifectaRate * 100).toFixed(1)}% <span className="fs-xs text-muted">({s.trifecta})</span></td>
                    <td style={{ color: trioRate > 0.4 ? '#ff4d4f' : undefined }}>{(trioRate * 100).toFixed(1)}% <span className="fs-xs text-muted">({s.trio})</span></td>
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
              <tr><th>日付</th><th>競馬場</th><th>レース</th><th>距離</th><th>1着</th><th>的中</th></tr>
            </thead>
            <tbody>
              {completed.slice().reverse().map(race => {
                return (
                  <tr key={race.id}>
                    <td className="fs-sm text-muted">{race.date}</td>
                    <td>{race.venue}</td>
                    <td>{race.raceNumber}R {race.raceName}</td>
                    <td>{race.surface}{race.distance}m</td>
                    <td className="fw-600">
                      {race.result?.result[0] ? `${race.result.result[0].horseNumber}番 ${race.result.result[0].horseName}` : "—"}
                    </td>
                    <td>
                      {(() => {
                        const r = race.result;
                        if (!r) return "—";
                        
                        const hitTypes: string[] = [];
                        if (r.hits) {
                          if (r.hits.win) hitTypes.push("単勝");
                          if (r.hits.wide) hitTypes.push("ワイド");
                          if (r.hits.quinella) hitTypes.push("馬連");
                          if (r.hits.exacta) hitTypes.push("馬単");
                          if (r.hits.trio) hitTypes.push("三複");
                          if (r.hits.trifecta) hitTypes.push("三単");
                        } else if (r.hitTickets && r.hitTickets.length > 0) {
                          hitTypes.push("三複");
                        }

                        if (hitTypes.length > 0) {
                          return (
                            <div className="flex gap-4 flex-wrap" style={{ gap: '4px' }}>
                              {hitTypes.map(type => {
                                let bg = "tag-blue";
                                if (type === "三複") bg = "tag-gold";
                                else if (type === "三単") bg = "tag-purple";
                                else if (type === "馬連") bg = "tag-green";
                                else if (type === "馬単") bg = "tag-blue";
                                else if (type === "ワイド") bg = "tag-secondary";
                                else if (type === "単勝") bg = "tag-red";
                                
                                return (
                                  <span key={type} className={`tag ${bg} fs-xs`} style={{ padding: '2px 4px', minWidth: 'unset', fontSize: '10px', lineHeight: 1 }}>
                                    {type}
                                  </span>
                                );
                              })}
                            </div>
                          );
                        }
                        return <span className="text-muted fs-sm">不的中</span>;
                      })()}
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
