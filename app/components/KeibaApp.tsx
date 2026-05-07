"use client";
import { useState, useEffect } from "react";
import { AppState, Race, RaceResult } from "../types";
import { loadState, saveState, addRace, updateRace, addResult, addLearningPatch, generateId } from "../lib/storage";
import { calculateTsuchiyaScore, generateFormation, generateLearningPatch, sortPredictions } from "../lib/engine";
import RaceForm from "./RaceForm";
import RaceCard from "./RaceCard";
import PredictionView from "./PredictionView";
import ResultInput from "./ResultInput";
import LearningPanel from "./LearningPanel";
import Win5Panel from "./Win5Panel";
import StatsPanel from "./StatsPanel";

type View = "dashboard" | "new_race" | "prediction" | "result" | "learning" | "win5" | "stats";

export default function KeibaApp() {
  const [state, setState] = useState<AppState | null>(null);
  const [view, setView] = useState<View>("dashboard");
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(null);

  useEffect(() => {
    setState(loadState());
  }, []);

  if (!state) return (
    <div className="loading" style={{ minHeight: "100vh" }}>
      <span className="pulse">🛰️</span> システム起動中...
    </div>
  );

  const selectedRace = state.races.find(r => r.id === selectedRaceId) || null;

  const handleNewRace = (race: Race) => {
    const newState = addRace(state, race);
    setState(newState);
    setSelectedRaceId(race.id);
    setView("prediction");
  };

  const handleRunPrediction = (race: Race) => {
    const predictions = race.horses.map(h =>
      calculateTsuchiyaScore(h, race, state.learningPatches, state.masterData)
    );
    const sorted = sortPredictions(predictions);
    const formation = generateFormation(sorted);
    const updated = { ...race, predictions: sorted, formation } as Race & { formation: unknown };
    const newState = updateRace(state, updated);
    setState(newState);
  };

  const handleAddResult = (result: RaceResult, raceId: string) => {
    const race = state.races.find(r => r.id === raceId);
    if (!race || !race.predictions) return;
    const actualResult = result.result.map(r => ({ rank: r.rank, horseNumber: r.horseNumber }));
    const patch = generateLearningPatch(race, race.predictions, actualResult, state.learningPatches);
    let newState = addResult(state, result);
    if (patch) {
      newState = addLearningPatch(newState, patch);
    }
    setState(newState);
    setView("dashboard");
  };

  const stats = state.stats;

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="header">
        <div className="header-logo">🛰️ 土屋プロトコル</div>
        <div className="header-version">Omega v7.0</div>
        <div className="header-spacer" />
        <div className="header-stats">
          <div className="stat-badge">
            📊 <span>的中率:</span><span className="value">{(stats.hitRate * 100).toFixed(1)}%</span>
          </div>
          <div className="stat-badge">
            💹 <span>ROI:</span><span className="value" style={{ color: stats.roi >= 0 ? "var(--accent-green)" : "var(--accent-red)" }}>
              {(stats.roi * 100).toFixed(1)}%
            </span>
          </div>
          <div className="stat-badge">
            🏇 <span>レース数:</span><span className="value">{stats.totalRaces}</span>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <nav className="sidebar">
        <div className="nav-section">メイン</div>
        {([
          ["dashboard", "🏠", "ダッシュボード"],
          ["new_race", "➕", "新規レース登録"],
          ["win5", "🎯", "WIN5予想"],
          ["stats", "📈", "成績・統計"],
        ] as [View, string, string][]).map(([v, icon, label]) => (
          <div key={v} className={`nav-item ${view === v ? "active" : ""}`} onClick={() => setView(v)}>
            <span className="nav-icon">{icon}</span>{label}
          </div>
        ))}

        <div className="nav-section">AI学習</div>
        <div className={`nav-item ${view === "learning" ? "active" : ""}`} onClick={() => setView("learning")}>
          <span className="nav-icon">🧬</span>学習パッチ管理
        </div>

        {state.races.length > 0 && (
          <div className="mobile-hidden">
            <div className="nav-section">直近レース</div>
            {state.races.slice(-5).reverse().map(race => (
              <div
                key={race.id}
                className={`nav-item ${selectedRaceId === race.id ? "active" : ""}`}
                onClick={() => { setSelectedRaceId(race.id); setView("prediction"); }}
              >
                <span className="nav-icon">{race.result ? "✅" : "🏇"}</span>
                <span style={{ fontSize: "0.78rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {race.venue} {race.raceNumber}R
                </span>
              </div>
            ))}
          </div>
        )}
      </nav>

      {/* Main */}
      <main className="main-content">
        {view === "dashboard" && (
          <Dashboard state={state} onSelectRace={(id) => { setSelectedRaceId(id); setView("prediction"); }} onNewRace={() => setView("new_race")} />
        )}
        {view === "new_race" && (
          <RaceForm onSubmit={handleNewRace} onCancel={() => setView("dashboard")} />
        )}
        {view === "prediction" && selectedRace && (
          <PredictionView
            race={selectedRace}
            onRunPrediction={() => handleRunPrediction(selectedRace)}
            onEnterResult={() => setView("result")}
            onBack={() => setView("dashboard")}
          />
        )}
        {view === "result" && selectedRace && (
          <ResultInput
            race={selectedRace}
            onSubmit={(result) => handleAddResult(result, selectedRace.id)}
            onCancel={() => setView("prediction")}
          />
        )}
        {view === "learning" && (
          <LearningPanel state={state} onStateChange={setState} />
        )}
        {view === "win5" && (
          <Win5Panel state={state} />
        )}
        {view === "stats" && (
          <StatsPanel state={state} />
        )}
        {view === "prediction" && !selectedRace && (
          <div className="empty-state">
            <div className="empty-state-icon">🏇</div>
            <div className="empty-state-title">レースを選択してください</div>
          </div>
        )}
      </main>
    </div>
  );
}

function Dashboard({ state, onSelectRace, onNewRace }: { state: AppState; onSelectRace: (id: string) => void; onNewRace: () => void }) {
  const { stats } = state;
  const pending = state.races.filter(r => !r.result);
  const completed = state.races.filter(r => r.result).slice(-10).reverse();

  return (
    <div className="fade-in">
      <div className="section-header">
        <h1 className="section-title">🛰️ ダッシュボード</h1>
        <button className="btn btn-primary" onClick={onNewRace}>➕ 新規レース登録</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-value">{stats.totalRaces}</div>
          <div className="stat-card-label">総レース数</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value" style={{ color: "var(--accent-green)" }}>{stats.hitCount}</div>
          <div className="stat-card-label">的中数</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{(stats.hitRate * 100).toFixed(1)}%</div>
          <div className="stat-card-label">的中率</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value" style={{ color: stats.roi >= 0 ? "var(--accent-green)" : "var(--accent-red)" }}>
            {(stats.roi * 100).toFixed(1)}%
          </div>
          <div className="stat-card-label">ROI</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{state.learningPatches.filter(p => p.active).length}</div>
          <div className="stat-card-label">有効学習パッチ</div>
        </div>
      </div>

      {pending.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">⏳ 未予測・未確定レース</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {pending.map(race => (
              <RaceCard key={race.id} race={race} onClick={() => onSelectRace(race.id)} />
            ))}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">✅ 確定済みレース（直近10件）</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {completed.map(race => (
              <RaceCard key={race.id} race={race} onClick={() => onSelectRace(race.id)} />
            ))}
          </div>
        </div>
      )}

      {state.races.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🛰️</div>
          <div className="empty-state-title">まだレースが登録されていません</div>
          <div className="empty-state-desc">出馬表を入力して予想を開始しましょう</div>
          <button className="btn btn-primary" onClick={onNewRace}>➕ 最初のレースを登録</button>
        </div>
      )}
    </div>
  );
}
