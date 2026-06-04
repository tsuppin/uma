"use client";
import { useState, useEffect, useCallback } from "react";
import { AppState, Race, RaceResult } from "../types";
import {
  loadStateFromServer,
  addRace,
  updateRace,
  addResult,
  addLearningPatch,
  deleteRace,
  defaultState
} from "../lib/storage";
import { calculateTsuchiyaScore, generateFormation, generateLearningPatch, sortPredictions } from "../lib/engine";
import RaceForm from "./RaceForm";
import RaceCard from "./RaceCard";
import PredictionView from "./PredictionView";
import ResultInput from "./ResultInput";
import LearningPanel from "./LearningPanel";
import Win5Panel from "./Win5Panel";
import StatsPanel from "./StatsPanel";
import KnowledgePanel from "./KnowledgePanel";
import ScrapingPanel from "./ScrapingPanel";

type View = "dashboard" | "new_race" | "prediction" | "result" | "learning" | "win5" | "stats" | "knowledge" | "scraping";

export default function KeibaApp() {
  const [state, setState] = useState<AppState>(defaultState);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [view, setView] = useState<View>("dashboard");
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // サーバーからデータを読み込む
  useEffect(() => {
    loadStateFromServer()
      .then((loaded) => {
        setState(loaded);
        setIsLoaded(true);
      })
      .catch(() => {
        setLoadError("サーバーへの接続に失敗しました。Next.js が起動しているか確認してください。");
        setState(defaultState);
        setIsLoaded(true);
      });
  }, []);

  // storage-save-error イベントをリッスン
  const handleStorageError = useCallback((e: Event) => {
    const reason = (e as CustomEvent).detail?.reason;
    if (reason === 'server_error') {
      setSaveError('⚠️ サーバーへの保存に失敗しました。サーバーが起動しているか確認してください。');
    } else {
      setSaveError('⚠️ データの保存に失敗しました。');
    }
    // 5秒後に自動消去
    setTimeout(() => setSaveError(null), 5000);
  }, []);

  useEffect(() => {
    window.addEventListener('storage-save-error', handleStorageError);
    return () => window.removeEventListener('storage-save-error', handleStorageError);
  }, [handleStorageError]);

  // ロード中
  if (!isLoaded) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: '16px',
        color: 'var(--text-muted, #aaa)',
        background: 'var(--bg, #0f1117)',
      }}>
        <div style={{ fontSize: '48px' }}>🛰️</div>
        <div style={{ fontSize: '18px', fontWeight: 600 }}>土屋プロトコル 起動中...</div>
        <div style={{ fontSize: '13px' }}>サーバーからデータを読み込んでいます</div>
        {loadError && (
          <div style={{ color: '#ef4444', fontSize: '13px', maxWidth: '380px', textAlign: 'center', marginTop: '8px' }}>
            {loadError}
          </div>
        )}
      </div>
    );
  }

  const selectedRace = state.races.find(r => r.id === selectedRaceId) || null;

  const handleNewRace = (race: Race) => {
    const newState = addRace(state, race);
    setState(newState);
    setSelectedRaceId(race.id);
    setView("prediction");
  };

  const handleRunPrediction = (race: Race) => {
    setIsProcessing(true);
    setTimeout(() => {
      const predictions = race.horses.map(h =>
        calculateTsuchiyaScore(h, race, state.learningPatches, state.masterData)
      );
      const sorted = sortPredictions(predictions);
      const formation = generateFormation(sorted);
      const updated = { ...race, predictions: sorted, formation } as Race & { formation: unknown };
      const newState = updateRace(state, updated);
      setState(newState);
      setIsProcessing(false);
    }, 100);
  };

  const handleAddResult = (result: RaceResult, raceId: string) => {
    const race = state.races.find(r => r.id === raceId);
    const predictions = race?.predictions;
    if (!race || !predictions) return;
    setIsProcessing(true);
    setTimeout(() => {
      const actualResult = result.result.map(r => ({ rank: r.rank, horseNumber: r.horseNumber }));
      const patch = generateLearningPatch(race, predictions, actualResult, state.learningPatches);
      let newState = addResult(state, result);
      if (patch) {
        newState = addLearningPatch(newState, patch);
      }
      setState(newState);
      setIsProcessing(false);
      setView("dashboard");
    }, 100);
  };

  // スクレイピングタブ用ハンドラー
  const handleScrapingAddRace = (race: Race) => {
    const newState = addRace(state, race);
    setState(newState);
    setSelectedRaceId(race.id);
  };

  const handleScrapingRunPrediction = (race: Race) => {
    const predictions = race.horses.map(h =>
      calculateTsuchiyaScore(h, race, state.learningPatches, state.masterData)
    );
    const sorted = sortPredictions(predictions);
    const formation = generateFormation(sorted);
    const updated = { ...race, predictions: sorted, formation } as Race & { formation: unknown };
    const newState = updateRace(state, updated);
    setState(newState);
  };

  const handleScrapingAddResult = (result: RaceResult, raceId: string) => {
    const race = state.races.find(r => r.id === raceId);
    const predictions = race?.predictions;
    if (!race || !predictions) return;
    const actualResult = result.result.map(r => ({ rank: r.rank, horseNumber: r.horseNumber }));
    const patch = generateLearningPatch(race, predictions, actualResult, state.learningPatches);
    let newState = addResult(state, result);
    if (patch) {
      newState = addLearningPatch(newState, patch);
    }
    setState(newState);
  };

  const handleDeleteRace = (id: string) => {
    if (confirm("本当にこのレースを削除しますか？")) {
      setState(deleteRace(state, id));
      if (selectedRaceId === id) setSelectedRaceId(null);
    }
  };

  const stats = state.stats;

  return (
    <div className="app-shell">
      {/* 保存エラートースト */}
      {saveError && (
        <div style={{
          position: 'fixed',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          background: '#7c2d12',
          border: '1px solid #dc2626',
          color: '#fef2f2',
          padding: '12px 20px',
          borderRadius: '10px',
          fontSize: '13px',
          maxWidth: '90vw',
          boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          lineHeight: '1.5',
        }}>
          <span style={{ flex: 1 }}>{saveError}</span>
          <button
            onClick={() => setSaveError(null)}
            style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', fontSize: '18px', lineHeight: 1, flexShrink: 0 }}
          >✕</button>
        </div>
      )}

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
          ["scraping", "🌐", "スクレイピング"],
          ["win5", "🎯", "WIN5予想"],
          ["stats", "📈", "成績・統計"],
          ["knowledge", "📚", "ナレッジ＆AI"],
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
                <span className="fs-xs ellipsis">
                  {race.venue} {race.raceNumber}R
                </span>
              </div>
            ))}
          </div>
        )}
      </nav>

      {/* Main */}
      <main className="main-content relative">
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50 rounded-8 backdrop-blur-sm">
            <div className="bg-surface p-24 rounded-12 border text-center">
              <div className="fs-xl mb-12">⏳ 解析中...</div>
              <div className="text-muted fs-sm">出馬表の解析/学習処理を実行しています</div>
            </div>
          </div>
        )}

        {view === "dashboard" && (
          <Dashboard state={state} onSelectRace={(id) => { setSelectedRaceId(id); setView("prediction"); }} onNewRace={() => setView("new_race")} onDeleteRace={handleDeleteRace} />
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
        {view === "knowledge" && (
          <KnowledgePanel />
        )}
        {view === "scraping" && (
          <ScrapingPanel
            state={state}
            onAddRace={handleScrapingAddRace}
            onRunPrediction={handleScrapingRunPrediction}
            onAddResult={handleScrapingAddResult}
          />
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

function Dashboard({ state, onSelectRace, onNewRace, onDeleteRace }: { state: AppState; onSelectRace: (id: string) => void; onNewRace: () => void; onDeleteRace: (id: string) => void }) {
  const { stats } = state;
  const pending = state.races.filter(r => !r.result);
  const completed = state.races.filter(r => r.result).slice(-24).reverse();

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
          <div className="stat-card-value text-green">{stats.hitCount}</div>
          <div className="stat-card-label">的中数</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{(stats.hitRate * 100).toFixed(1)}%</div>
          <div className="stat-card-label">的中率</div>
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
          <div className="flex flex-col gap-8">
            {pending.map(race => (
              <RaceCard key={race.id} race={race} onClick={() => onSelectRace(race.id)} onDelete={() => onDeleteRace(race.id)} />
            ))}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">✅ 確定済みレース（直近24レース）</div>
          </div>
          <div className="flex flex-col gap-8">
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
