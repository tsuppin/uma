"use client";
import { useState, useEffect } from "react";
import { Race, Formation } from "../types";
import { generateFormation } from "../lib/engine";
import MobileRaceEntry from "./MobileRaceEntry";

function FrameBadge({ frame }: { frame: number }) {
  const frameClass = frame >= 1 && frame <= 8 ? `frame-${frame}` : "frame-other";
  return <span className={`frame-badge ${frameClass}`}>{frame}</span>;
}

function SyntheticOddsBadge({ odds }: { odds: number }) {
  if (odds <= 0) return null;
  const level = odds >= 20 ? "great" : odds >= 13 ? "good" : "bad";
  const colors: Record<string, string> = { great: "var(--color-green)", good: "var(--color-gold)", bad: "var(--color-red)" };
  const labels: Record<string, string> = { great: "✅ 期待値大", good: "⚠️ 許容範囲", bad: "🚫 ケン推奨" };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
      <div style={{ fontSize: "2.2rem", fontWeight: 900, color: colors[level], lineHeight: 1, textShadow: `0 0 20px ${colors[level]}40` }}>
        {odds}倍
      </div>
      <div style={{ fontSize: "0.7rem", fontWeight: 700, color: colors[level], background: `${colors[level]}20`, border: `1px solid ${colors[level]}50`, borderRadius: "4px", padding: "2px 8px" }}>
        {labels[level]}
      </div>
    </div>
  );
}

function RiskBadge({ level }: { level: "safe" | "normal" | "risk" }) {
  const config: Record<string, { label: string; color: string; icon: string }> = {
    safe: { label: "低リスク", color: "var(--color-green)", icon: "🟢" },
    normal: { label: "中リスク", color: "var(--color-gold)", icon: "🟡" },
    risk: { label: "高リスク", color: "var(--color-red)", icon: "🔴" },
  };
  const c = config[level];
  return (
    <span style={{ fontSize: "0.72rem", fontWeight: 700, color: c.color, background: `${c.color}18`, border: `1px solid ${c.color}50`, borderRadius: "4px", padding: "2px 8px" }}>
      {c.icon} {c.label}
    </span>
  );
}

const TICKET_TYPES: { value: Formation["type"]; label: string; icon: string; desc: string }[] = [
  { value: "win",             label: "単勝",   icon: "🥇", desc: "1点集中・最高回収率" },
  { value: "exacta",          label: "馬単",   icon: "🎯", desc: "裏表注意" },
  { value: "wide",           label: "ワイド", icon: "🌊", desc: "プロ推奨・最強馬券" },
  { value: "quinella",       label: "馬連",   icon: "🔗", desc: "最大5点以内" },
  { value: "trifecta_exact", label: "三連単", icon: "⚡", desc: "4点以内・着順確定時のみ" },
  { value: "trifecta",       label: "三連複", icon: "🎰", desc: "荒れた時に回収" },
];

export default function PredictionView({ race, onRunPrediction, onEnterResult, onBack }: {
  race: Race;
  onRunPrediction: () => void;
  onEnterResult: () => void;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<"horses" | "prediction" | "formation" | "win5">("horses");
  const [formationType, setFormationType] = useState<Formation["type"]>("quinella");
  const predictions = race.predictions || [];
  const hasPrediction = predictions.length > 0;

  useEffect(() => {
    if (hasPrediction && race.waveLevel) {
      const lvl = race.waveLevel.level;
      if (lvl <= 2) {
        setFormationType("quinella"); // 鉄板・堅実なレースは馬連
      } else if (lvl === 3) {
        setFormationType("wide"); // 中波乱はワイド
      } else {
        setFormationType("trifecta"); // 波乱・大波乱は3連複
      }
    }
  }, [hasPrediction, race.waveLevel]);

  const maxPotential = Math.max(...predictions.map(p => p.potential), 1);
  const formation: Formation | null = hasPrediction
    ? generateFormation(predictions, formationType, race)
    : null;

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
          {!hasPrediction && <button type="button" className="btn btn-primary" onClick={onRunPrediction}>🛰️ 予想実行</button>}
          {hasPrediction && !race.result && (
            <><button type="button" className="btn btn-secondary" onClick={onRunPrediction}>🔄 再予想</button>
            <button type="button" className="btn btn-success" onClick={onEnterResult}>✅ 結果入力</button></>
          )}
          {race.result && <button type="button" className="btn btn-secondary" onClick={onEnterResult}>📊 結果確認</button>}
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

      {tab === "horses" && (
        <div className="card" style={{ padding: 0, background: 'transparent', border: 'none' }}>
          <MobileRaceEntry horses={race.horses} />
        </div>
      )}

      {tab === "prediction" && hasPrediction && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">📊 土屋プロトコル解析結果</div>
            <div className="fs-xs text-muted">A評価（軸）: 上位3頭 / B評価（ヒモ穴）: Darkness上位</div>
          </div>
          <table className="horse-table">
            <thead><tr><th>順位</th><th>馬番</th><th>馬名</th><th>Potential</th><th>Darkness</th><th>タグ</th></tr></thead>
            <tbody>
              {predictions.map((p, i) => {
                const isAxis = i < 3;
                const isDark = !isAxis && i < 7;
                const numBg = isAxis ? "bg-gold-muted" : isDark ? "bg-purple-muted" : "bg-elevated";
                const numText = isAxis ? "text-gold" : isDark ? "text-purple" : "text-muted";
                const numBorder = isAxis ? "border-gold-50" : "no-border";
                return (
                  <tr key={p.horseId}>
                    <td><span className={`rank-badge rank-${i < 3 ? i + 1 : "other"}`}>{i + 1}</span></td>
                    <td><span className={`horse-num ${numBg} ${numText} ${numBorder}`}>{p.horseNumber}</span></td>
                    <td className={isAxis ? "fw-700" : ""}>
                      {p.horseName}
                      {isAxis && <span className="ml-6 fs-xs text-gold">◎軸</span>}
                      {isDark && <span className="ml-6 fs-xs text-purple">▲闇</span>}
                    </td>
                    <td>
                      <div className="score-bar-wrap">
                        <div className="score-bar w-80">
                          <div className="score-bar-fill" style={{ width: `${(p.potential / maxPotential) * 100}%`, background: isAxis ? "var(--gradient-gold)" : "var(--gradient-blue)" }} />
                        </div>
                        <span className={`score-value ${isAxis ? "text-gold" : "text-primary"}`}>{p.potential}</span>
                      </div>
                    </td>
                    <td className="fw-600 fs-sm text-purple">{p.darkness.toFixed(2)}</td>
                    <td>
                      <div className="tags-wrap">
                        {(p.aptitudeTags || []).slice(0, 3).map((tag, ti) => <span key={ti} className={`tag ${isAxis ? "tag-gold" : "tag-blue"}`}>{tag}</span>)}
                        {(p.aptitudeTags || []).length > 3 && <span className="tag text-muted">+{(p.aptitudeTags || []).length - 3}</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {race.result && (() => {
            const hasHit = race.result.hits ? Object.values(race.result.hits).some(Boolean) : (race.result.hitTickets && race.result.hitTickets.length > 0);
            const hitLabels: string[] = [];
            if (race.result.hits) {
              if (race.result.hits.trio) hitLabels.push("三連複");
              if (race.result.hits.trifecta) hitLabels.push("三連単");
              if (race.result.hits.quinella) hitLabels.push("馬連");
              if (race.result.hits.exacta) hitLabels.push("馬単");
            } else if (race.result.hitTickets && race.result.hitTickets.length > 0) { hitLabels.push("三連複"); }
            return (
              <div className="alert alert-success mt-16 flex flex-col gap-6">
                <div>✅ 確定済み — 1着: {race.result.result[0]?.horseName} ({race.result.result[0]?.horseNumber}番)</div>
                {hasHit ? <div className="fw-700 text-green flex items-center gap-6">🎉 的中！ ({hitLabels.join(", ")})</div>
                        : <div className="text-muted">😞 不的中（次回に向け自動学習完了）</div>}
              </div>
            );
          })()}
        </div>
      )}

      {tab === "formation" && formation && (
        <div className="fade-in">
          {/* 券種セレクター */}
          <div className="card" style={{ padding: "16px", marginBottom: "12px" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>券種を選択</div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {TICKET_TYPES.map(t => {
                const isActive = formationType === t.value;
                return (
                  <button key={t.value} type="button" onClick={() => setFormationType(t.value)}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", padding: "10px 16px", border: isActive ? "2px solid var(--color-gold)" : "1px solid var(--border-color)", borderRadius: "10px", background: isActive ? "var(--bg-gold-muted)" : "var(--bg-elevated)", cursor: "pointer", transition: "all 0.2s", minWidth: "72px" }}>
                    <span style={{ fontSize: "1.4rem" }}>{t.icon}</span>
                    <span style={{ fontWeight: 700, fontSize: "0.85rem", color: isActive ? "var(--color-gold)" : "var(--text-primary)" }}>{t.label}</span>
                    <span style={{ fontSize: "0.62rem", color: isActive ? "var(--color-gold)" : "var(--text-muted)", whiteSpace: "nowrap" }}>{t.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 合成オッズ・点数・投資額ダッシュボード */}
          <div className="card" style={{ padding: "20px", marginBottom: "12px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", alignItems: "start" }}>
              <div style={{ textAlign: "center", borderRight: "1px solid var(--border-color)", paddingRight: "16px" }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "8px", textTransform: "uppercase" }}>合成オッズ</div>
                <SyntheticOddsBadge odds={formation.syntheticOdds} />
              </div>
              <div style={{ textAlign: "center", borderRight: "1px solid var(--border-color)", paddingRight: "16px" }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "8px", textTransform: "uppercase" }}>点数 / 上限</div>
                <div style={{ fontSize: "1.8rem", fontWeight: 900, lineHeight: 1 }}>
                  <span style={{ color: formation.totalPoints > formation.limitPoints ? "var(--color-red)" : "var(--text-primary)" }}>{formation.totalPoints}</span>
                  <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: 400 }}>/{formation.limitPoints}点</span>
                </div>
                <div style={{ marginTop: "6px" }}><RiskBadge level={formation.riskLevel} /></div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "8px", textTransform: "uppercase" }}>推奨投資額目安</div>
                <div style={{ fontSize: "1.0rem", fontWeight: 700, color: "var(--color-gold)" }}>
                  {formation.type === "win" ? "1,000〜3,000円" : `${formation.totalPoints * 100}円〜`}
                </div>
                <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "4px" }}>100円×{formation.totalPoints}点ベース</div>
              </div>
            </div>
          </div>

          {/* 戦略カード */}
          <div className="card" style={{ padding: "16px", marginBottom: "12px", borderLeft: "3px solid var(--color-blue)", background: "linear-gradient(135deg, var(--bg-card) 0%, rgba(59,130,246,0.04) 100%)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <span style={{ fontSize: "1.1rem" }}>{TICKET_TYPES.find(t => t.value === formationType)?.icon}</span>
              <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>{TICKET_TYPES.find(t => t.value === formationType)?.label}の正しい買い方</span>
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>{formation.strategy}</div>
            <hr style={{ margin: "12px 0", border: "none", borderTop: "1px solid var(--border-color)" }} />
            <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--color-gold)", fontWeight: 700, whiteSpace: "nowrap" }}>💰 資金管理</span>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.6, whiteSpace: "pre-line" }}>{formation.stakeGuide}</div>
            </div>
          </div>

          {/* NGパターン警告 */}
          {formation.warningMessage && (
            <div style={{ padding: "12px 16px", marginBottom: "12px", borderRadius: "10px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", fontSize: "0.8rem", color: "#ef4444", fontWeight: 600, display: "flex", gap: "8px", alignItems: "flex-start" }}>
              <span style={{ flexShrink: 0 }}>⚠️</span>
              <span>{formation.warningMessage}</span>
            </div>
          )}

          {/* フォーメーション表示（単勝以外） */}
          {formationType !== "win" && formation.col1.length > 0 && (
            <div className="card" style={{ marginBottom: "12px" }}>
              <div className="card-header"><div className="card-title">🗂️ フォーメーション</div></div>
              <div className="formation-grid">
                {[
                  ["1列目（軸）", formation.col1, "text-gold", "bg-gold-muted", "border-gold-50"],
                  ...(formation.col2 && formation.col2.length > 0 ? [["2列目", formation.col2, "text-gold", "bg-gold-muted", "border-gold-50"]] : []),
                  ...(formation.col3 ? [["3列目（相手）", formation.col3, "text-blue", "bg-blue-muted", "border-blue-50"]] : []),
                ].map(([title, horses, textClass, bgClass, borderClass]) => (
                  <div className="formation-col" key={title as string}>
                    <div className="formation-col-title">{title as string}</div>
                    <div className="formation-horses">
                      {(horses as number[]).map(n => <span key={n} className={`horse-num ${textClass} ${bgClass} ${borderClass}`}>{n}</span>)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mb-12">
                <div className="fs-sm text-muted mb-8">
                  <span className="tag tag-gold">軸{formation.axisHorses.length}頭</span>
                  {formation.axisHorses.map(n => { const h = race.horses.find(h => h.number === n); return <span key={n} className="ml-8 fw-600">{n}番 {h?.name}</span>; })}
                </div>
                {formation.darkHorses.length > 0 && (
                  <div className="fs-sm text-muted">
                    <span className="tag tag-purple">闇ヒモ</span>
                    {formation.darkHorses.map(n => { const h = race.horses.find(h => h.number === n); return <span key={n} className="ml-8">{n}番 {h?.name}</span>; })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 単勝専用 推奨馬カード */}
          {formationType === "win" && formation.col1.length > 0 && (
            <div className="card" style={{ marginBottom: "12px" }}>
              <div className="card-header"><div className="card-title">🥇 単勝推奨馬</div></div>
              {formation.col1.map(n => {
                const h = race.horses.find(h => h.number === n);
                return (
                  <div key={n} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px", background: "var(--bg-gold-muted)", borderRadius: "12px", border: "2px solid var(--color-gold)" }}>
                    <span style={{ width: "56px", height: "56px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "var(--color-gold)", color: "#fff", fontWeight: 900, fontSize: "1.4rem" }}>{n}</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--color-gold)" }}>{h?.name || `${n}番`}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>{h?.jockey} / {h?.odds ? `${h.odds}倍` : "オッズ不明"}</div>
                    </div>
                    <div style={{ marginLeft: "auto", textAlign: "right" }}>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>推定回収(100円)</div>
                      <div style={{ fontWeight: 800, fontSize: "1.3rem", color: "var(--color-gold)" }}>{h?.odds ? `${Math.round(h.odds * 100)}円` : "—"}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 買い目一覧 */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: "12px" }}>
              <div className="fw-700">買い目一覧
                <span style={{ marginLeft: "8px", fontSize: "0.75rem", padding: "2px 8px", borderRadius: "6px",
                  background: formation.totalPoints > formation.limitPoints ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.12)",
                  color: formation.totalPoints > formation.limitPoints ? "#ef4444" : "var(--color-green)", fontWeight: 700 }}>
                  計 {formation.totalPoints} 点
                </span>
              </div>
              <div className="fs-sm text-muted">100円×{formation.totalPoints}点 = <strong>{formation.totalPoints * 100}円</strong></div>
            </div>
            <div className="ticket-list">
              {formation.tickets.map((ticket, i) => {
                let isHit = false;
                if (race.result) {
                  const r1 = race.result.result[0]?.horseNumber || 0;
                  const r2 = race.result.result[1]?.horseNumber || 0;
                  const r3 = race.result.result[2]?.horseNumber || 0;
                  if (formationType === "trifecta") {
                    const resTrio = [r1, r2, r3].filter(Boolean).sort((a, b) => a - b);
                    const sortedT = [...ticket].sort((a, b) => a - b);
                    isHit = sortedT.length === 3 && sortedT.every((n, j) => n === resTrio[j]);
                  } else if (formationType === "wide") {
                    const resWideMatches: number[][] = [];
                    if (r1 && r2) resWideMatches.push([r1, r2].sort((a,b)=>a-b));
                    if (r1 && r3) resWideMatches.push([r1, r3].sort((a,b)=>a-b));
                    if (r2 && r3) resWideMatches.push([r2, r3].sort((a,b)=>a-b));
                    const sortedT = [...ticket].sort((a, b) => a - b);
                    isHit = sortedT.length === 2 && resWideMatches.some(match => match[0] === sortedT[0] && match[1] === sortedT[1]);
                  } else if (formationType === "trifecta_exact") {
                    isHit = ticket.length === 3 && ticket.every((n, j) => n === [r1, r2, r3].filter(Boolean)[j]);
                  } else if (formationType === "quinella") {
                    const resQ = [r1, r2].filter(Boolean).sort((a, b) => a - b);
                    const sortedT = [...ticket].sort((a, b) => a - b);
                    isHit = sortedT.length === 2 && sortedT.every((n, j) => n === resQ[j]);
                  } else if (formationType === "exacta") {
                    const resE = [r1, r2].filter(Boolean);
                    isHit = ticket.length === 2 && ticket.every((n, j) => n === resE[j]);
                  } else if (formationType === "win") {
                    isHit = ticket.length === 1 && ticket[0] === r1;
                  }
                }
                return (
                  <div key={i} className={`ticket-item ${isHit ? "hit" : ""}`}>
                    <span className="fs-xs text-muted w-20">{String(i + 1).padStart(2, "0")}</span>
                    {ticket.map((n, j) => {
                      const isAxisHorse = formation.axisHorses.includes(n);
                      return (
                        <span key={j}>
                          <span 
                            className={`ticket-num ${formationType === 'win' ? "bg-elevated" : (isAxisHorse ? "bg-gold-muted text-gold" : "bg-elevated text-primary")}`}
                            style={formationType === 'win' ? { color: '#ffffff' } : undefined}
                          >
                            {n}
                          </span>
                          {j < ticket.length - 1 && <span className="text-muted ml-4 mr-4">{formationType === "trifecta_exact" || formationType === "exacta" ? "→" : "-"}</span>}
                        </span>
                      );
                    })}
                    {isHit && <span className="fw-900 text-green">✓</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* NG行動チェックリスト */}
          <div className="card" style={{ marginTop: "12px", padding: "16px", background: "linear-gradient(135deg, var(--bg-card) 0%, rgba(139,92,246,0.04) 100%)", border: "1px solid rgba(139,92,246,0.2)" }}>
            <div style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: "12px" }}>⚠️ 絶対にやってはいけないNG行動</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {["多点買いで合成オッズを崩壊させる", "外すのを恐れて人気馬を保険に入れ、無駄な点数を増やす", "当たった時の払い戻し額を計算・想定せずに買う", "負けを取り返そうとして掛け金を上げる", "どんなレースでも買い方を固定してしまう"].map((ng, idx) => (
                <div key={idx} style={{ display: "flex", gap: "8px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  <span style={{ color: "#ef4444", flexShrink: 0 }}>✗</span>
                  <span>{ng}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}