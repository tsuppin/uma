"use client";
import { Race } from "../types";



export default function RaceCard({ race, onClick, onDelete }: { race: Race; onClick: () => void; onDelete?: () => void }) {
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
      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--accent-red)",
            cursor: "pointer",
            fontSize: "1.2rem",
            padding: "4px 8px",
            marginLeft: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0.7,
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = "1"}
          onMouseLeave={e => e.currentTarget.style.opacity = "0.7"}
          title="レースを削除"
        >
          🗑️
        </button>
      )}
      <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginLeft: "4px" }}>›</span>
    </div>
  );
}
