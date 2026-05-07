"use client";
import { useState } from "react";
import { AppState, Race } from "../types";
import { calculateTsuchiyaScore, sortPredictions } from "../lib/engine";

export default function Win5Panel({ state }: { state: AppState }) {
  const [selectedRaceIds, setSelectedRaceIds] = useState<string[]>([]);
  const [win5Picks, setWin5Picks] = useState<{ raceId: string; picks: number[]; }[]>([]);

  const availableRaces = state.races.filter(r => !r.result);

  const toggleRace = (id: string) => {
    setSelectedRaceIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 5) { alert("WIN5は最大5レースです"); return prev; }
      return [...prev, id];
    });
  };

  const handleAnalyze = () => {
    const picks = selectedRaceIds.map(id => {
      const race = state.races.find(r => r.id === id);
      if (!race) return { raceId: id, picks: [] };
      const preds = race.predictions || race.horses.map(h => calculateTsuchiyaScore(h, race, state.learningPatches, state.masterData));
      const sorted = sortPredictions(preds);
      return { raceId: id, picks: sorted.slice(0, 3).map(p => p.horseNumber) };
    });
    setWin5Picks(picks);
  };

  // 全組み合わせ数
  const totalCombinations = win5Picks.length === 5 ? win5Picks.reduce((acc, p) => acc * p.picks.length, 1) : 0;

  return (
    <div className="fade-in">
      <div className="section-header">
        <h2 className="section-title">🎯 WIN5予想</h2>
        {selectedRaceIds.length > 0 && (
          <button className="btn btn-primary" onClick={handleAnalyze}>🛰️ AI解析実行</button>
        )}
      </div>

      <div className="alert alert-info">
        💡 WIN5対象レース（最大5レース）を選択して予想を実行します。AIが各レースの上位3頭を推奨します。
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">レース選択（{selectedRaceIds.length}/5）</div>
        </div>
        {availableRaces.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-title">未確定レースがありません</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {availableRaces.map((race, i) => {
              const isSelected = selectedRaceIds.includes(race.id);
              const order = selectedRaceIds.indexOf(race.id) + 1;
              return (
                <div
                  key={race.id}
                  onClick={() => toggleRace(race.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "12px 16px",
                    background: isSelected ? "var(--accent-gold)15" : "var(--bg-surface)",
                    border: `1px solid ${isSelected ? "var(--accent-gold)50" : "var(--border)"}`,
                    borderRadius: "8px", cursor: "pointer", transition: "all 0.2s",
                  }}
                >
                  <div style={{
                    width: "24px", height: "24px",
                    border: `2px solid ${isSelected ? "var(--accent-gold)" : "var(--border)"}`,
                    borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    color: isSelected ? "var(--accent-gold)" : "transparent",
                    fontWeight: 900, fontSize: "0.8rem", flexShrink: 0,
                    background: isSelected ? "var(--accent-gold)20" : "transparent",
                  }}>
                    {isSelected ? order : ""}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>
                      {race.date} {race.venue} {race.raceNumber}R {race.raceName}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {race.surface} {race.distance}m / {race.condition} / {race.headCount}頭
                    </div>
                  </div>
                  {isSelected && <span className="tag tag-gold">レース{order}</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {win5Picks.length === 5 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">🎯 WIN5推奨買い目</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              合計 {totalCombinations} 点 / {totalCombinations * 100}円
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {win5Picks.map((pick, i) => {
              const race = state.races.find(r => r.id === pick.raceId);
              if (!race) return null;
              const preds = race.predictions || race.horses.map(h => calculateTsuchiyaScore(h, race, state.learningPatches, state.masterData));
              const sorted = sortPredictions(preds);
              return (
                <div key={pick.raceId} style={{ background: "var(--bg-surface)", borderRadius: "8px", padding: "14px", border: "1px solid var(--border)" }}>
                  <div style={{ fontWeight: 700, marginBottom: "10px", fontSize: "0.9rem" }}>
                    レース{i + 1}: {race.venue} {race.raceNumber}R {race.raceName}
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {pick.picks.map((num, j) => {
                      const pred = sorted.find(p => p.horseNumber === num);
                      const horse = race.horses.find(h => h.number === num);
                      return (
                        <div key={num} style={{
                          padding: "8px 12px",
                          background: j === 0 ? "var(--accent-gold)20" : "var(--bg-elevated)",
                          border: `1px solid ${j === 0 ? "var(--accent-gold)50" : "var(--border)"}`,
                          borderRadius: "8px", textAlign: "center",
                        }}>
                          <div style={{ fontWeight: 900, color: j === 0 ? "var(--accent-gold)" : "var(--text-primary)", fontSize: "1.1rem" }}>{num}番</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{horse?.name}</div>
                          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>EV: {pred?.potential}</div>
                          {j === 0 && <div style={{ fontSize: "0.65rem", color: "var(--accent-gold)", fontWeight: 700 }}>◎本命</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="alert alert-warning" style={{ marginTop: "16px" }}>
            ⚠️ WIN5は全5レース的中が必要です。1番人気パージロジック適用済み。合成オッズを必ず確認してください。
          </div>
        </div>
      )}
    </div>
  );
}
