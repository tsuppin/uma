import React, { useState } from 'react';
import { AppState, Race } from '../types';
import { addRace, updateRace, addResult, addLearningPatch } from '../lib/storage';
import { calculateTsuchiyaScore, generateFormation, sortPredictions, generateAILearningPatch } from '../lib/engine';

interface Props {
  state: AppState;
  onStateChange: (state: AppState) => void;
  onCancel: () => void;
}

export default function BulkProcessPanel({ state, onStateChange, onCancel }: Props) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [track, setTrack] = useState('東京');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState('');

  const handleBulkAnalysis = async () => {
    setIsProcessing(true);
    let currentState = state;

    try {
      for (let i = 1; i <= 12; i++) {
        setProgress(`レース ${i}/12: 情報を取得中...`);
        
        const res = await fetch('/api/scrape-race', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date, track, raceNumber: i })
        });

        if (!res.ok) {
          console.warn(`Race ${i} fetch failed`);
          setProgress(`レース ${i}/12: 情報が取得できませんでした。スキップします。`);
          continue;
        }

        const data = await res.json();
        if (!data.raceData || !data.raceData.horses || data.raceData.horses.length === 0) {
          setProgress(`レース ${i}/12: 出馬表データがありません。スキップします。`);
          continue;
        }

        setProgress(`レース ${i}/12: データを登録中...`);
        const newRace: Race = {
          ...data.raceData,
          id: `race_${Date.now()}_${i}`,
        } as Race;
        currentState = addRace(currentState, newRace);

        setProgress(`レース ${i}/12: AIが予想中...`);
        const predictions = newRace.horses.map(h =>
          calculateTsuchiyaScore(h, newRace, currentState.learningPatches, currentState.masterData)
        );
        const sorted = sortPredictions(predictions);
        const formation = generateFormation(sorted);
        const updatedRace = { ...newRace, predictions: sorted, formation };
        currentState = updateRace(currentState, updatedRace as any);

        if (data.resultData && data.resultData.result && data.resultData.result.length > 0) {
          setProgress(`レース ${i}/12: AIが反省・学習中...`);
          const resultObj = { raceId: updatedRace.id, result: data.resultData.result, payouts: [] };
          
          const patch = await generateAILearningPatch(updatedRace, sorted, data.resultData.result);
          
          currentState = addResult(currentState, resultObj);
          if (patch) {
            currentState = addLearningPatch(currentState, patch);
          }
        }
        
        onStateChange(currentState); // 1レース終わるごとに状態を更新
      }

      setProgress('全レースの一括解析と学習が完了しました！');
      setTimeout(() => {
        setIsProcessing(false);
        onCancel();
      }, 2000);
    } catch (e) {
      console.error(e);
      setProgress('エラーが発生しました。処理を中断します。');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="section-header">
        <h1 className="section-title">📅 全レース一括学習 (自動バックテスト)</h1>
        <button className="btn btn-secondary" onClick={onCancel} disabled={isProcessing}>戻る</button>
      </div>

      <div className="card max-w-2xl">
        <p className="mb-16 text-muted">
          指定した開催日の全12レースの出馬表と結果をGeminiで一括取得し、自動でAI予想と自己反省を行います。大量のラーニングパッチを一度に生成できます。
        </p>

        <div className="form-group">
          <label>開催日</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} disabled={isProcessing} className="form-control" />
        </div>

        <div className="form-group">
          <label>競馬場</label>
          <select value={track} onChange={(e) => setTrack(e.target.value)} disabled={isProcessing} className="form-control">
            {["東京", "中山", "京都", "阪神", "中京", "新潟", "福島", "小倉", "函館", "札幌", "大井", "川崎", "船橋", "浦和", "盛岡", "水沢", "門別", "園田", "姫路", "名古屋", "笠松", "金沢", "高知", "佐賀", "帯広"].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {isProcessing && (
          <div className="mt-16 p-16 bg-surface border rounded-8 text-center">
            <div className="mb-8">⏳ 処理中...</div>
            <div className="text-primary font-bold">{progress}</div>
          </div>
        )}

        {!isProcessing && (
          <button className="btn btn-primary mt-16 w-full" onClick={handleBulkAnalysis}>
            一括バックテストを開始
          </button>
        )}
      </div>
    </div>
  );
}
