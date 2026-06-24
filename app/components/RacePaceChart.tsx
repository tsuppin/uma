"use client";
import { Horse, Prediction } from "../types";

export default function RacePaceChart({ horses, predictions }: { horses: Horse[], predictions?: Prediction[] }) {
  // 脚質に応じてグループ化
  const getStyleGroup = (style: string) => {
    switch (style) {
      case "逃げ": return 0;
      case "先行": return 1;
      case "中団": return 2;
      case "差し": return 3;
      case "追込": return 4;
      default: return 2;
    }
  };

  const groups = [
    { label: "逃げ", horses: horses.filter(h => getStyleGroup(h.style || "") === 0) },
    { label: "先行", horses: horses.filter(h => getStyleGroup(h.style || "") === 1) },
    { label: "中団", horses: horses.filter(h => getStyleGroup(h.style || "") === 2) },
    { label: "差し", horses: horses.filter(h => getStyleGroup(h.style || "") === 3) },
    { label: "追込", horses: horses.filter(h => getStyleGroup(h.style || "") === 4) },
  ];

  // 全馬の予想タグから展開予想テキストを抽出
  let pacePredictionText = "Mペース（標準的な流れ）予想";
  if (predictions) {
    const paceTags = predictions.flatMap(p => p.tags || []).filter(t => t.includes("展開利"));
    if (paceTags.length > 0) {
      if (paceTags[0].includes("前傾ラップ(H)")) {
        pacePredictionText = "🔥 ハイペース(H)予想：差し・追込有利";
      } else if (paceTags[0].includes("スロー(S)")) {
        pacePredictionText = "🐢 スローペース(S)予想：逃げ・先行有利";
      }
    }
  }

  const isHighPace = pacePredictionText.includes("ハイペース");
  const isSlowPace = pacePredictionText.includes("スローペース");

  return (
    <div className="card" style={{ marginBottom: "24px" }}>
      <h3 className="fs-md mb-12">🏁 AI展開予想図（隊列表）</h3>
      
      <div style={{ marginBottom: "12px", padding: "8px", borderRadius: "8px", backgroundColor: isHighPace ? "rgba(255, 60, 60, 0.15)" : isSlowPace ? "rgba(60, 150, 255, 0.15)" : "var(--color-bg-secondary)", border: `1px solid ${isHighPace ? "var(--color-red)" : isSlowPace ? "var(--color-blue)" : "var(--border-color)"}` }}>
        <div style={{ fontWeight: 700, color: isHighPace ? "var(--color-red)" : isSlowPace ? "var(--color-blue)" : "var(--text-color)", textAlign: "center" }}>
          {pacePredictionText}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", background: "var(--color-bg-tertiary)", padding: "16px", borderRadius: "8px", border: "1px solid var(--border-color)", overflowX: "auto" }}>
        
        {/* Track Header */}
        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.8rem", borderBottom: "1px dashed var(--border-color)", paddingBottom: "4px", minWidth: "400px" }}>
          <span>← 前（ハナ）</span>
          <span>後方 →</span>
        </div>

        {/* Track Lanes */}
        <div style={{ display: "flex", gap: "8px", marginTop: "8px", minHeight: "80px", minWidth: "400px" }}>
          {groups.map((g, i) => {
            // ペースに応じた有利・不利のハイライト
            let highlightClass = "";
            if (isHighPace && (i === 3 || i === 4)) highlightClass = "pace-advantage";
            if (isSlowPace && (i === 0 || i === 1)) highlightClass = "pace-advantage";

            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", borderRight: i < 4 ? "1px solid var(--border-color)" : "none", position: "relative" }}>
                {highlightClass && (
                  <div style={{ position: "absolute", inset: 0, background: "var(--color-gold)", opacity: 0.15, borderRadius: "4px", pointerEvents: "none" }} />
                )}
                <div style={{ fontSize: "0.75rem", color: highlightClass ? "var(--color-gold)" : "var(--text-muted)", fontWeight: highlightClass ? 700 : 400 }}>{g.label}</div>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px", padding: "8px 4px", zIndex: 1 }}>
                  {g.horses.map(h => {
                    const frameClass = h.frame >= 1 && h.frame <= 8 ? `frame-${h.frame}` : "frame-other";
                    return (
                      <div key={h.number} className={`frame-badge ${frameClass}`} style={{ width: "28px", height: "28px", fontSize: "0.9rem", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }} title={`${h.name} (${h.style})`}>
                        {h.number}
                      </div>
                    );
                  })}
                  {g.horses.length === 0 && <span style={{ opacity: 0.2 }}>-</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "8px", textAlign: "right" }}>
        ※過去の通過順位や脚質からAIが推測した相対的なポジションです。
      </div>
    </div>
  );
}
