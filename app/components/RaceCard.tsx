"use client";
import { Race } from "../types";



export default function RaceCard({ race, onClick, onDelete }: { race: Race; onClick: () => void; onDelete?: () => void }) {
  const hasResult = !!race.result;
  const hasPrediction = (race.predictions?.length || 0) > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className="race-card flex items-center gap-12 p-12-16 bg-surface border rounded-sm pointer w-full text-left transition-all"
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
      {hasResult && (() => {
        const r = race.result;
        if (!r) return null;
        
        const hasHit = r.hits 
          ? Object.values(r.hits).some(Boolean)
          : (r.hitTickets && r.hitTickets.length > 0);
          
        if (hasHit) {
          const hitTypes: string[] = [];
          if (r.hits) {
            if (r.hits.win) hitTypes.push("単勝");
            if (r.hits.wide) hitTypes.push("ワイド");
            if (r.hits.quinella) hitTypes.push("馬連");
            if (r.hits.exacta) hitTypes.push("馬単");
            if (r.hits.trio) hitTypes.push("三複");
            if (r.hits.trifecta) hitTypes.push("三単");
          } else {
            hitTypes.push("的中");
          }
          return (
            <span className="tag tag-green" title={hitTypes.join(", ")}>
              的中 ({hitTypes.join("/")})
            </span>
          );
        }
        return <span className="tag tag-muted">不的中</span>;
      })()}
      {!hasResult && hasPrediction && (
        <span className="tag tag-blue">予想済み</span>
      )}
      {!hasPrediction && (
        <span className="tag tag-muted">未予想</span>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="btn-icon text-red ml-8"
          title="レースを削除"
          aria-label={`${race.venue} ${race.raceNumber}R 削除`}
        >
          🗑️
        </button>
      )}
      <span className="text-muted fs-sm ml-4" aria-hidden="true">›</span>
    </button>
  );
}
