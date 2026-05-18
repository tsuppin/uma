"use client";
import { useState } from "react";
import { Race, Formation } from "../types";
import { generateFormation } from "../lib/engine";



function FrameBadge({ frame }: { frame: number }) {
  const frameClass = frame >= 1 && frame <= 8 ? `frame-${frame}` : 'frame-other';
  return (
    <span className={`frame-badge ${frameClass}`}>
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
  const [formationType, setFormationType] = useState<"trifecta" | "trifecta_exact" | "quinella" | "exacta">("trifecta");
  const predictions = race.predictions || [];
  const hasPrediction = predictions.length > 0;
  const maxPotential = Math.max(...predictions.map(p => p.potential), 1);

  const formation: Formation | null = hasPrediction ? generateFormation(predictions, formationType) : null;

  return (
    <div className="fade-in">
      <div className="section-header">
        <div>
          <div className="section-title">🏇 {race.date} {race.venue} {race.raceNumber}R {race.raceName}</div>
          <div className="fs-sm text-muted mt-4 flex gap-12">
            <span>{race.surface} {race.distance}m</span>
            <span>馬場: {race.condition}</span>
            <span>{race.headCount}頭立て</span>
            {race.isWin5 && <span className="tag tag-purple">WIN5</span>}
          </div>
        </div>
        <div className="flex gap-8">
          <button type="button" className="btn btn-secondary btn-sm" onClick={onBack}>← 戻る</button>
          {!hasPrediction && (
            <button type="button" className="btn btn-primary" onClick={onRunPrediction}>🛰️ 予想実行</button>
          )}
          {hasPrediction && !race.result && (
            <>
              <button type="button" className="btn btn-secondary" onClick={onRunPrediction}>🔄 再予想</button>
              <button type="button" className="btn btn-success" onClick={onEnterResult}>✅ 結果入力</button>
            </>
          )}
          {race.result && (
            <button type="button" className="btn btn-secondary" onClick={onEnterResult}>📊 結果確認</button>
          )}
        </div>
      </div>

      <nav className="tabs" aria-label="予測ビュータブ">
        <button type="button" className={`tab ${tab === "horses" ? "active" : ""}`} onClick={() => setTab("horses")}>🐴 出馬表</button>
        {hasPrediction && <>
          <button type="button" className={`tab ${tab === "prediction" ? "active" : ""}`} onClick={() => setTab("prediction")}>📊 予想結果</button>
          <button type="button" className={`tab ${tab === "formation" ? "active" : ""}`} onClick={() => setTab("formation")}>🎯 買い目</button>
        </>}
        {race.isWin5 && <button type="button" className={`tab ${tab === "win5" ? "active" : ""}`} onClick={() => setTab("win5")}>🎯 WIN5</button>}
      </nav>

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
                    <span className="horse-num">
                      {h.number}
                    </span>
                  </td>
                  <td className="fw-600">{h.name || "—"}</td>
                  <td className="text-secondary nowrap">{h.gender}{h.age}</td>
                  <td>{h.jockey || "—"}</td>
                  <td className="text-muted">{h.jockeyWeight}</td>
                  <td className="fw-600">{h.weight}kg</td>
                  <td className={h.weightChange > 0 ? "text-red" : h.weightChange < 0 ? "text-blue" : "text-muted"}>
                    {h.weightChange > 0 ? `+${h.weightChange}` : h.weightChange}
                  </td>
                  <td className="fs-xs text-muted">{h.sire || "—"}</td>
                  <td className="fs-xs">{h.style || "—"}</td>
                  <td className="fw-700 text-gold">{h.odds ? `${h.odds}倍` : "—"}</td>
                  <td className="fs-xs text-muted">
                    {h.pastRaces[0] ? `${h.pastRaces[0].venue} ${h.pastRaces[0].result}着` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!hasPrediction && (
            <div className="mt-20 text-center">
              <button type="button" className="btn btn-primary p-12-32 fs-lg" onClick={onRunPrediction}>
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
            <div className="fs-xs text-muted">
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
                const isAxis = i < 3;
                const isDark = !isAxis && i < 7;
                const numBg = isAxis ? "bg-gold-muted" : isDark ? "bg-purple-muted" : "bg-elevated";
                const numText = isAxis ? "text-gold" : isDark ? "text-purple" : "text-muted";
                const numBorder = isAxis ? "border-gold-50" : "no-border";
                return (
                  <tr key={p.horseId}>
                    <td>
                      <span className={`rank-badge rank-${i < 3 ? i + 1 : "other"}`}>{i + 1}</span>
                    </td>
                    <td>
                      <span className={`horse-num ${numBg} ${numText} ${numBorder}`}>
                        {p.horseNumber}
                      </span>
                    </td>
                    <td className={isAxis ? "fw-700" : ""}>
                      {p.horseName}
                      {isAxis && <span className="ml-6 fs-xs text-gold">◎軸</span>}
                      {isDark && <span className="ml-6 fs-xs text-purple">▲闇</span>}
                    </td>
                    <td>
                      <div className="score-bar-wrap">
                        <div className="score-bar w-80">
                          <div className="score-bar-fill" style={{
                            width: `${(p.potential / maxPotential) * 100}%`,
                            background: isAxis ? "var(--gradient-gold)" : "var(--gradient-blue)",
                          }} />
                        </div>
                        <span className={`score-value ${isAxis ? 'text-gold' : 'text-primary'}`}>
                          {p.potential}
                        </span>
                      </div>
                    </td>
                    <td className="fw-600 fs-sm text-purple">
                      {p.darkness.toFixed(2)}
                    </td>
                    <td>
                      <div className="tags-wrap">
                        {(p.aptitudeTags || []).slice(0, 3).map((tag, ti) => (
                          <span key={ti} className={`tag ${isAxis ? "tag-gold" : "tag-blue"}`}>{tag}</span>
                        ))}
                        {(p.aptitudeTags || []).length > 3 && (
                          <span className="tag text-muted">
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

          {race.result && (() => {
            const hasHit = race.result.hits 
              ? Object.values(race.result.hits).some(Boolean)
              : (race.result.hitTickets && race.result.hitTickets.length > 0);
            
            const hitLabels: string[] = [];
            if (race.result.hits) {
              if (race.result.hits.trio) hitLabels.push("三連複");
              if (race.result.hits.trifecta) hitLabels.push("三連単");
              if (race.result.hits.quinella) hitLabels.push("馬連");
              if (race.result.hits.exacta) hitLabels.push("馬単");
            } else if (race.result.hitTickets && race.result.hitTickets.length > 0) {
              hitLabels.push("三連複");
            }

            return (
              <div className="alert alert-success mt-16 flex flex-col gap-6">
                <div>
                  ✅ 確定済み — 1着: {race.result.result[0]?.horseName} ({race.result.result[0]?.horseNumber}番)
                </div>
                {hasHit ? (
                  <div className="fw-700 text-green flex items-center gap-6">
                    🎉 的中！ ({hitLabels.join(", ")})
                  </div>
                ) : (
                  <div className="text-muted">
                    😞 不的中（次回に向け自動学習完了）
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* 買い目タブ */}
      {tab === "formation" && formation && (
        <div className="fade-in">
          <div className="card">
            <div className="card-header">
              <div className="card-title">🎯 買い目</div>
              <select
                className="form-select w-auto fs-sm"
                value={formationType}
                onChange={e => setFormationType(e.target.value as typeof formationType)}
                aria-label="馬券種別選択"
              >
                <option value="trifecta">三連複</option>
                <option value="trifecta_exact">三連単</option>
                <option value="quinella">馬連</option>
                <option value="exacta">馬単</option>
              </select>
            </div>

            <div className="formation-grid">
              {[
                ["1列目（軸）", formation.col1, "text-gold", "bg-gold-muted", "border-gold-50"],
                ["2列目（軸）", formation.col2 || [], "text-gold", "bg-gold-muted", "border-gold-50"],
                ...(formation.col3 ? [["3列目（相手）", formation.col3, "text-blue", "bg-blue-muted", "border-blue-50"]] : []),
              ].map(([title, horses, textClass, bgClass, borderClass]) => (
                <div className="formation-col" key={title as string}>
                  <div className="formation-col-title">{title as string}</div>
                  <div className="formation-horses">
                    {(horses as number[]).map(n => (
                      <span key={n} className={`horse-num ${textClass} ${bgClass} ${borderClass}`}>
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-12">
              <div className="fs-sm text-muted mb-8">
                <span className="tag tag-gold">軸3頭</span>
                {formation.axisHorses.map(n => {
                  const h = race.horses.find(h => h.number === n);
                  return <span key={n} className="ml-8 fw-600">{n}番 {h?.name}</span>;
                })}
              </div>
              <div className="fs-sm text-muted">
                <span className="tag tag-purple">闇ヒモ</span>
                {formation.darkHorses.map(n => {
                  const h = race.horses.find(h => h.number === n);
                  return <span key={n} className="ml-8">{n}番 {h?.name}</span>;
                })}
              </div>
            </div>

            <hr className="divider" />
            <div className="flex items-center justify-between mb-12">
              <div className="fw-700">買い目一覧（計 {formation.totalPoints} 点）</div>
              <div className="fs-sm text-muted">100円×{formation.totalPoints}点 = {formation.totalPoints * 100}円</div>
            </div>
            <div className="ticket-list">
              {formation.tickets.map((ticket, i) => {
                let isHit = false;
                if (race.result) {
                  if (race.result.hitTicketsMap) {
                    const activeType = formationType === 'trifecta' ? 'trio' : formationType;
                    const hitMapList = race.result.hitTicketsMap[activeType as keyof typeof race.result.hitTicketsMap] || [];
                    isHit = hitMapList.some(h =>
                      h.length === ticket.length && h.every((n, j) => n === ticket[j])
                    );
                  } else {
                    const r1 = race.result.result[0]?.horseNumber || 0;
                    const r2 = race.result.result[1]?.horseNumber || 0;
                    const r3 = race.result.result[2]?.horseNumber || 0;

                    if (formationType === 'trifecta') {
                      const resTrio = [r1, r2, r3].filter(Boolean).sort((a,b)=>a-b);
                      const sortedT = [...ticket].sort((a,b)=>a-b);
                      isHit = sortedT.length === 3 && sortedT.every((n, j) => n === resTrio[j]);
                    } else if (formationType === 'trifecta_exact') {
                      const resTrifecta = [r1, r2, r3].filter(Boolean);
                      isHit = ticket.length === 3 && ticket.every((n, j) => n === resTrifecta[j]);
                    } else if (formationType === 'quinella') {
                      const resQuinella = [r1, r2].filter(Boolean).sort((a,b)=>a-b);
                      const sortedT = [...ticket].sort((a,b)=>a-b);
                      isHit = sortedT.length === 2 && sortedT.every((n, j) => n === resQuinella[j]);
                    } else if (formationType === 'exacta') {
                      const resExacta = [r1, r2].filter(Boolean);
                      isHit = ticket.length === 2 && ticket.every((n, j) => n === resExacta[j]);
                    }
                  }
                }
                return (
                  <div key={i} className={`ticket-item ${isHit ? "hit" : ""}`}>
                    <span className="fs-xs text-muted w-20">{String(i + 1).padStart(2, "0")}</span>
                    {ticket.map((n, j) => (
                      <span key={j}>
                        <span className={`ticket-num ${formation.axisHorses.includes(n) ? "bg-gold-muted text-gold" : "bg-elevated text-primary"}`}>
                          {n}
                        </span>
                        {j < ticket.length - 1 && <span className="text-muted ml-4 mr-4">
                          {['trifecta_exact', 'exacta'].includes(formationType) ? '→' : '-'}
                        </span>}
                      </span>
                    ))}
                    {isHit && <span className="fw-900 text-green">✓</span>}
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
