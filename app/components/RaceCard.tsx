"use client";
import { Race } from "../types";



export default function RaceCard({ race, onClick, onDelete }: { race: Race; onClick: () => void; onDelete?: () => void }) {
  const hasResult = !!race.result;
  const hasPrediction = (race.predictions?.length || 0) > 0;

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-12 p-12-16 bg-surface border rounded-sm pointer transition-all"
      style={{ transition: "all 0.2s" }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--accent-gold)50")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
    >
      <div className="fs-xl">{hasResult ? "✅" : hasPrediction ? "🎯" : "🏇"}</div>
      <div className="flex-1 min-w-0">
        <div className="fw-700 fs-md mb-2">
          {race.date} {race.venue} {race.raceNumber}R {race.raceName}
        </div>
        <div className="fs-xs text-muted flex gap-12">
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
        <span className="tag text-muted" style={{ background: "var(--bg-elevated)" }}>未予想</span>
      )}
      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="bg-transparent border-transparent text-red pointer fs-xl p-4-8 ml-8 flex items-center justify-center"
          style={{ opacity: 0.7 }}
          onMouseEnter={e => e.currentTarget.style.opacity = "1"}
          onMouseLeave={e => e.currentTarget.style.opacity = "0.7"}
          title="レースを削除"
          aria-label={`${race.venue} ${race.raceNumber}R 削除`}
        >
          🗑️
        </button>
      )}
      <span className="text-muted fs-sm ml-4">›</span>
    </div>
  );
}
