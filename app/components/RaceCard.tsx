"use client";
import { Race } from "../types";

const FRAME_COLORS = ["","#e2e8f0","#1a1a1a","#e53e3e","#3182ce","#d69e2e","#2f855a","#d6bcfa","#fc8181"];

export default function RaceCard({ race, onClick }: { race: Race; onClick: () => void }) {
  const hasResult = !!race.result;
  const hasPrediction = (race.predictions?.length || 0) > 0;

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 16px",
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--accent-gold)50")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
    >
      <div style={{ fontSize: "1.2rem" }}>{hasResult ? "✅" : hasPrediction ? "🎯" : "🏇"}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "2px" }}>
          {race.date} {race.venue} {race.raceNumber}R {race.raceName}
        </div>
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", gap: "12px" }}>
          <span>{race.surface} {race.distance}m</span>
          <span>{race.condition}</span>
          <span>{race.headCount}頭立て</span>
          {race.isWin5 && <span className="tag tag-purple">WIN5</span>}
        </div>
      </div>
      {hasResult && race.result?.hitTickets && race.result.hitTickets.length > 0 && (
        <span className="tag tag-green">的中</span>
      )}
      {!hasResult && hasPrediction && (
        <span className="tag tag-blue">予想済み</span>
      )}
      {!hasPrediction && (
        <span className="tag" style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}>未予想</span>
      )}
      <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>›</span>
    </div>
  );
}
