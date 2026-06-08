"use client";
import { AppState, LearningPatch } from "../types";
import { togglePatch, saveStateToServer, generateId } from "../lib/storage";
import { useState, useMemo } from "react";

const PAGE_SIZE = 50;

// jockey/sire の value がラップデータっぽいか判定
function isSuspiciousAdjustment(adj: { field: string; value: unknown }): boolean {
  if (adj.field !== "jockey" && adj.field !== "sire") return false;
  if (typeof adj.value !== "string") return false;
  return /\d+F|\d{2,}\.\d/.test(adj.value) || /^\d[\d\s]+\d$/.test(adj.value.trim());
}

function hasSuspiciousPatch(patch: LearningPatch): boolean {
  return patch.adjustments.some(isSuspiciousAdjustment);
}

export default function LearningPanel({ state, onStateChange }: { state: AppState; onStateChange: (s: AppState) => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newPatch, setNewPatch] = useState({ description: "", track: "", condition: "", field: "weight", operator: ">=", value: 500, scoreAdjust: 10 });
  const [page, setPage] = useState(0);
  const [filterText, setFilterText] = useState("");
  const [showSuspiciousOnly, setShowSuspiciousOnly] = useState(false);

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
    saveStateToServer(newState);
    onStateChange(newState);
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    const newState = { ...state, learningPatches: state.learningPatches.filter(p => p.id !== id) };
    saveStateToServer(newState);
    onStateChange(newState);
  };

  const handleDeleteAll = () => {
    if (!confirm(`全${state.learningPatches.length}件のパッチを削除しますか？\nこの操作は元に戻せません。`)) return;
    const newState = { ...state, learningPatches: [], modelVersion: "TsuchiyaProtocol-Omega v7.0" };
    saveStateToServer(newState);
    onStateChange(newState);
  };

  const handleDeleteSuspicious = () => {
    const count = state.learningPatches.filter(hasSuspiciousPatch).length;
    if (!confirm(`異常パッチ ${count} 件を削除しますか？\n（騎手名フィールドにラップデータが混入しているもの）`)) return;
    const newState = { ...state, learningPatches: state.learningPatches.filter(p => !hasSuspiciousPatch(p)) };
    saveStateToServer(newState);
    onStateChange(newState);
    setShowSuspiciousOnly(false);
    setPage(0);
  };

  const filtered = useMemo(() => {
    let list = state.learningPatches;
    if (showSuspiciousOnly) list = list.filter(hasSuspiciousPatch);
    if (filterText.trim()) {
      const q = filterText.trim().toLowerCase();
      list = list.filter(p =>
        p.description.toLowerCase().includes(q) ||
        (p.track || "").toLowerCase().includes(q) ||
        p.version.toLowerCase().includes(q) ||
        p.adjustments.some(a => String(a.value).toLowerCase().includes(q))
      );
    }
    return list;
  }, [state.learningPatches, filterText, showSuspiciousOnly]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const suspiciousCount = state.learningPatches.filter(hasSuspiciousPatch).length;

  const handleFilterChange = (val: string) => { setFilterText(val); setPage(0); };
  const handleSuspiciousToggle = () => { setShowSuspiciousOnly(v => !v); setPage(0); };

  return (
    <div className="fade-in">
      <div className="section-header">
        <h2 className="section-title">🧬 AI学習パッチ管理</h2>
        <div className="flex gap-8" style={{ flexWrap: "wrap" }}>
          <button className="btn btn-secondary" onClick={() => {
            navigator.clipboard.writeText(JSON.stringify(state.learningPatches, null, 2));
            alert("パッチデータをクリップボードにコピーしました。");
          }}>📤 エクスポート</button>
          {suspiciousCount > 0 && (
            <button className="btn btn-warning" onClick={handleDeleteSuspicious}>
              ⚠️ 異常削除 ({suspiciousCount})
            </button>
          )}
          {state.learningPatches.length > 0 && (
            <button className="btn btn-danger" onClick={handleDeleteAll}>🗑 全削除</button>
          )}
          <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>＋ 手動追加</button>
        </div>
      </div>

      <div className="alert alert-info">
        💡 パッチを有効化するとスコア計算に反映されます。
        モデル: <strong>{state.modelVersion}</strong>　
        合計: <strong>{state.learningPatches.length}件</strong>
        {suspiciousCount > 0 && (
          <span style={{ color: "var(--accent-orange)", marginLeft: "12px" }}>
            ⚠️ 異常パッチ {suspiciousCount}件（騎手名フィールドに不正データ）
          </span>
        )}
      </div>

      {showAdd && (
        <div className="card">
          <div className="card-header"><div className="card-title">➕ 手動パッチ追加</div></div>
          <div className="grid-3">
            <div className="form-group">
              <label className="form-label" htmlFor="patch-desc">説明</label>
              <input id="patch-desc" className="form-input" value={newPatch.description} onChange={e => setNewPatch(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="patch-track">対象競馬場（空=全場）</label>
              <input id="patch-track" className="form-input" value={newPatch.track} onChange={e => setNewPatch(p => ({ ...p, track: e.target.value }))} placeholder="大井, 門別 など" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="patch-cond">対象馬場状態（空=全て）</label>
              <select id="patch-cond" className="form-select" value={newPatch.condition} onChange={e => setNewPatch(p => ({ ...p, condition: e.target.value }))}>
                <option value="">全て</option>
                {["良","稍重","重","不良"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="patch-field">対象フィールド</label>
              <select id="patch-field" className="form-select" value={newPatch.field} onChange={e => setNewPatch(p => ({ ...p, field: e.target.value }))}>
                <option value="weight">馬体重</option>
                <option value="weightChange">馬体重増減</option>
                <option value="frame">枠番</option>
                <option value="jockeyWeight">斤量</option>
                <option value="jockey">騎手名</option>
                <option value="sire">父馬</option>
                <option value="age">馬齢</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="patch-op">条件</label>
              <select id="patch-op" className="form-select" value={newPatch.operator} onChange={e => setNewPatch(p => ({ ...p, operator: e.target.value }))}>
                {[">=","<=","==",">","<","includes"].map(op => <option key={op}>{op}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="patch-val">閾値</label>
              <input id="patch-val" className="form-input" value={String(newPatch.value)} onChange={e => setNewPatch(p => ({ ...p, value: isNaN(Number(e.target.value)) ? (e.target.value as unknown as number) : Number(e.target.value) }))} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="patch-adj">スコア調整</label>
              <input id="patch-adj" type="number" className="form-input" value={newPatch.scoreAdjust} onChange={e => setNewPatch(p => ({ ...p, scoreAdjust: +e.target.value }))} />
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
          {/* 検索・フィルタバー */}
          <div className="flex gap-8 mb-12" style={{ flexWrap: "wrap", alignItems: "center" }}>
            <input
              className="form-input"
              style={{ flex: 1, minWidth: "200px", maxWidth: "320px" }}
              placeholder="🔍 説明・競馬場・バージョンで検索..."
              value={filterText}
              onChange={e => handleFilterChange(e.target.value)}
            />
            <button
              className={`btn ${showSuspiciousOnly ? "btn-warning" : "btn-secondary"}`}
              onClick={handleSuspiciousToggle}
            >
              ⚠️ 異常のみ {showSuspiciousOnly ? "✓" : ""}
            </button>
            <span className="fs-xs text-muted">
              {filtered.length}件表示 / 全{state.learningPatches.length}件
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="horse-table">
              <thead>
                <tr>
                  <th>バージョン</th>
                  <th>日付</th>
                  <th>説明</th>
                  <th>競馬場</th>
                  <th>馬場</th>
                  <th>調整内容</th>
                  <th>状態</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(patch => {
                  const suspicious = hasSuspiciousPatch(patch);
                  return (
                    <tr key={patch.id} style={suspicious ? { background: "rgba(245,158,11,0.08)" } : {}}>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <span className="tag tag-purple">{patch.version}</span>
                        {suspicious && (
                          <span title="騎手名フィールドに不正なデータが含まれています" style={{ marginLeft: "4px", cursor: "help" }}>⚠️</span>
                        )}
                      </td>
                      <td className="fs-xs text-muted" style={{ whiteSpace: "nowrap" }}>{patch.date.slice(0, 10)}</td>
                      <td style={{ maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{patch.description}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{patch.track || <span className="text-muted">全場</span>}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{patch.condition || <span className="text-muted">全て</span>}</td>
                      <td className="fs-xs" style={{ maxWidth: "280px", fontFamily: "monospace" }}>
                        {patch.adjustments.map((a, i) => (
                          <div key={i} style={{
                            color: isSuspiciousAdjustment(a) ? "var(--accent-orange)" : undefined,
                            borderBottom: i < patch.adjustments.length - 1 ? "1px dashed var(--border)" : undefined,
                            padding: "2px 0",
                          }}>
                            <span style={{ opacity: 0.7 }}>{a.field}</span>
                            {" "}{a.operator}{" "}
                            <strong>{String(a.value)}</strong>
                            <span style={{ color: a.scoreAdjust > 0 ? "var(--accent-green)" : "var(--accent-red)", marginLeft: "4px" }}>
                              → {a.scoreAdjust > 0 ? `+${a.scoreAdjust}` : a.scoreAdjust}
                            </span>
                          </div>
                        ))}
                      </td>
                      <td>
                        <label className="flex items-center gap-6 cursor-pointer">
                          <input type="checkbox" checked={patch.active} onChange={() => handleToggle(patch.id)} aria-label={`${patch.version} 有効化`} />
                          <span className={`fs-xs ${patch.active ? "text-green" : "text-muted"}`}>
                            {patch.active ? "有効" : "無効"}
                          </span>
                        </label>
                      </td>
                      <td>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(patch.id)}>削除</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ページネーション */}
          {totalPages > 1 && (
            <div className="flex gap-8 mt-12" style={{ justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
              <button className="btn btn-secondary" onClick={() => setPage(0)} disabled={page === 0}>«</button>
              <button className="btn btn-secondary" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>‹</button>
              <span className="fs-sm text-muted">
                {page + 1} / {totalPages} ページ　({page * PAGE_SIZE + 1}〜{Math.min((page + 1) * PAGE_SIZE, filtered.length)}件)
              </span>
              <button className="btn btn-secondary" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>›</button>
              <button className="btn btn-secondary" onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}>»</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
