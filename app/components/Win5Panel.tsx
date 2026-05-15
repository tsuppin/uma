"use client";
import { useState } from "react";
import { AppState } from "../types";
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
          <div className="flex flex-col gap-8">
            {availableRaces.map((race) => {
              const isSelected = selectedRaceIds.includes(race.id);
              const order = selectedRaceIds.indexOf(race.id) + 1;
              return (
                <div
                  key={race.id}
                  onClick={() => toggleRace(race.id)}
                  className={`flex items-center gap-12 p-12-16 border rounded-8 pointer transition-all ${isSelected ? 'bg-gold-muted border-gold' : 'bg-surface'}`}
                  style={isSelected ? { backgroundColor: "var(--accent-gold)15", borderColor: "var(--accent-gold)50" } : {}}
                >
                  <div className={`rounded-circle flex items-center justify-center fw-900 fs-sm ${isSelected ? 'text-gold' : 'text-transparent'}`}
                    style={{
                      width: "24px", height: "24px",
                      border: `2px solid ${isSelected ? "var(--accent-gold)" : "var(--border)"}`,
                      background: isSelected ? "var(--accent-gold)20" : "transparent",
                    }}>
                    {isSelected ? order : ""}
                  </div>
                  <div className="flex-1">
                    <div className="fw-600">
                      {race.date} {race.venue} {race.raceNumber}R {race.raceName}
                    </div>
                    <div className="fs-xs text-muted">
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
            <div className="fs-sm text-muted">
              合計 {totalCombinations} 点 / {totalCombinations * 100}円
            </div>
          </div>
          <div className="flex flex-col gap-12">
            {win5Picks.map((pick, i) => {
              const race = state.races.find(r => r.id === pick.raceId);
              if (!race) return null;
              const preds = race.predictions || race.horses.map(h => calculateTsuchiyaScore(h, race, state.learningPatches, state.masterData));
              const sorted = sortPredictions(preds);
              return (
                <div key={pick.raceId} className="bg-surface rounded-8 p-14 border">
                  <div className="fw-700 mb-10 fs-md">
                    レース{i + 1}: {race.venue} {race.raceNumber}R {race.raceName}
                  </div>
                  <div className="flex gap-8 flex-wrap">
                    {pick.picks.map((num, j) => {
                      const pred = sorted.find(p => p.horseNumber === num);
                      const horse = race.horses.find(h => h.number === num);
                      return (
                        <div key={num} className={`p-8-12 border rounded-8 text-center ${j === 0 ? 'border-gold' : ''}`}
                          style={j === 0 ? { backgroundColor: "var(--accent-gold)20", borderColor: "var(--accent-gold)50" } : { backgroundColor: "var(--bg-elevated)" }}>
                          <div className={`fw-900 fs-lg ${j === 0 ? 'text-gold' : 'text-primary'}`}>{num}番</div>
                          <div className="fs-xs text-secondary">{horse?.name}</div>
                          <div className="fs-xs text-muted">EV: {pred?.potential}</div>
                          {j === 0 && <div className="fs-xs text-gold fw-700">◎本命</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="alert alert-warning mt-16">
            ⚠️ WIN5は全5レース的中が必要です。1番人気パージロジック適用済み。合成オッズを必ず確認してください。
          </div>
        </div>
      )}
    </div>
  );
}
