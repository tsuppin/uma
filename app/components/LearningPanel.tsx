"use client";
import { AppState, LearningPatch } from "../types";
import { togglePatch, saveState } from "../lib/storage";
import { generateId } from "../lib/storage";
import { useState } from "react";

export default function LearningPanel({ state, onStateChange }: { state: AppState; onStateChange: (s: AppState) => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newPatch, setNewPatch] = useState({ description: "", track: "", condition: "", field: "weight", operator: ">=", value: 500, scoreAdjust: 10 });

  const handleToggle = (id: string) => {
    onStateChange(togglePatch(state, id));
  };

  const handleAdd = () => {
    const patch: LearningPatch = {
      id: generateId(),
      version: `v${state.learningPatches.length + 1}.0`,
      date: new Date().toISOString(),
      description: newPatch.description || "手動パッチ",
      track: newPatch.track || undefined,
      condition: newPatch.condition as LearningPatch["condition"] || undefined,
      adjustments: [{
        field: newPatch.field,
        operator: newPatch.operator,
        value: newPatch.value,
        scoreAdjust: newPatch.scoreAdjust,
      }],
      active: true,
    };
    const newState = { ...state, learningPatches: [...state.learningPatches, patch], modelVersion: `TsuchiyaProtocol-Omega ${patch.version}` };
    saveState(newState);
    onStateChange(newState);
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    const newState = { ...state, learningPatches: state.learningPatches.filter(p => p.id !== id) };
    saveState(newState);
    onStateChange(newState);
  };

  return (
    <div className="fade-in">
      <div className="section-header">
        <h2 className="section-title">🧬 AI学習パッチ管理</h2>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn-secondary" onClick={() => {
            const json = JSON.stringify(state.learningPatches, null, 2);
            navigator.clipboard.writeText(json);
            alert("パッチデータをクリップボードにコピーしました。これをAntigravityに伝えてGitに反映させてください。");
          }}>📤 エクスポート</button>
          <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>＋ 手動パッチ追加</button>
        </div>
      </div>

      <div className="alert alert-info">
        💡 結果入力時に自動生成される学習パッチが蓄積されます。パッチを有効化するとスコア計算に反映されます。
        現在のモデルバージョン: <strong>{state.modelVersion}</strong>
      </div>

      {showAdd && (
        <div className="card">
          <div className="card-header"><div className="card-title">➕ 手動パッチ追加</div></div>
          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">説明</label>
              <input className="form-input" value={newPatch.description} onChange={e => setNewPatch(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">対象競馬場（空=全場）</label>
              <input className="form-input" value={newPatch.track} onChange={e => setNewPatch(p => ({ ...p, track: e.target.value }))} placeholder="大井, 門別 など" />
            </div>
            <div className="form-group">
              <label className="form-label">対象馬場状態（空=全て）</label>
              <select className="form-select" value={newPatch.condition} onChange={e => setNewPatch(p => ({ ...p, condition: e.target.value }))}>
                <option value="">全て</option>
                {["良","稍重","重","不良"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">対象フィールド</label>
              <select className="form-select" value={newPatch.field} onChange={e => setNewPatch(p => ({ ...p, field: e.target.value }))}>
                <option value="weight">馬体重</option>
                <option value="weightChange">馬体重増減</option>
                <option value="frame">枠番</option>
                <option value="jockeyWeight">斤量</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">条件</label>
              <select className="form-select" value={newPatch.operator} onChange={e => setNewPatch(p => ({ ...p, operator: e.target.value }))}>
                {[">=","<=","==",">","<"].map(op => <option key={op}>{op}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">閾値</label>
              <input type="number" className="form-input" value={newPatch.value} onChange={e => setNewPatch(p => ({ ...p, value: +e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">スコア調整</label>
              <input type="number" className="form-input" value={newPatch.scoreAdjust} onChange={e => setNewPatch(p => ({ ...p, scoreAdjust: +e.target.value }))} />
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleAdd}>追加</button>
        </div>
      )}

      {state.learningPatches.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🧬</div>
          <div className="empty-state-title">学習パッチがありません</div>
          <div className="empty-state-desc">結果を入力すると自動的に学習パッチが生成されます</div>
        </div>
      ) : (
        <div className="card">
          <table className="horse-table">
            <thead>
              <tr>
                <th>バージョン</th><th>日付</th><th>説明</th><th>競馬場</th><th>条件</th><th>調整内容</th><th>状態</th><th></th>
              </tr>
            </thead>
            <tbody>
              {state.learningPatches.map(patch => (
                <tr key={patch.id}>
                  <td><span className="tag tag-purple">{patch.version}</span></td>
                  <td style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{patch.date.slice(0, 10)}</td>
                  <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{patch.description}</td>
                  <td>{patch.track || <span style={{ color: "var(--text-muted)" }}>全場</span>}</td>
                  <td>{patch.condition || <span style={{ color: "var(--text-muted)" }}>全て</span>}</td>
                  <td style={{ fontSize: "0.75rem", fontFamily: "monospace" }}>
                    {patch.adjustments.map((a, i) => (
                      <span key={i}>{a.field} {a.operator} {a.value} → {a.scoreAdjust > 0 ? `+${a.scoreAdjust}` : a.scoreAdjust}</span>
                    ))}
                  </td>
                  <td>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                      <input type="checkbox" checked={patch.active} onChange={() => handleToggle(patch.id)} />
                      <span style={{ fontSize: "0.75rem", color: patch.active ? "var(--accent-green)" : "var(--text-muted)" }}>
                        {patch.active ? "有効" : "無効"}
                      </span>
                    </label>
                  </td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(patch.id)}>削除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
