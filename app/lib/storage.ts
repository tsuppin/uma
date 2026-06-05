// ==========================================
// データ管理 - サーバーサイドAPI経由
// localStorage ではなくサーバーのJSONファイルに保存
// どのブラウザ・スマホモードでも確実に永続化される
// ==========================================

import { AppState, Race, LearningPatch, RaceResult } from '../types';
import { updateMasterDataWithRace, updateMasterDataWithResult } from './db';
import { syncToGitHub } from './githubSync';
import { loadStateFromIDB, saveStateToIDB } from './indexeddb';

export const defaultState: AppState = {
  races: [],
  learningPatches: [],
  modelVersion: 'TsuchiyaProtocol-Omega v7.0',
  stats: {
    totalRaces: 0,
    hitCount: 0,
    hitRate: 0,
    totalInvested: 0,
    totalReturn: 0,
    roi: 0,
  },
  masterData: {
    horses: {},
    jockeys: {}
  }
};

// ==========================================
// サーバーからの状態ロード（非同期）
// ==========================================
export async function loadStateFromServer(): Promise<AppState> {
  if (typeof window === 'undefined') return defaultState;
  try {
    const data = await loadStateFromIDB();
    if (data) {
      return data as AppState;
    }
    
    // IndexedDBにデータがない場合は、古いLocalStorageからのマイグレーションを試みる
    const oldData = localStorage.getItem('keiba_app_state');
    if (oldData) {
      const parsed = JSON.parse(oldData) as AppState;
      saveStateToIDB(parsed).catch(console.error); // IndexedDBへ移行
      return parsed;
    }
    
    return defaultState;
  } catch (e) {
    console.error('[storage] IndexedDBからの読み込み失敗:', e);
    return defaultState;
  }
}

// ==========================================
// サーバーへの状態保存（非同期・fire-and-forget）
// ==========================================
export async function saveStateToServer(state: AppState): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await saveStateToIDB(state);
    
    // GitHubへ自動同期（バックグラウンド実行）
    // JSON文字列化はGitHubAPI送信のためだけに行う（IDBへは生オブジェクトで保存済）
    syncToGitHub(JSON.stringify(state)).catch(err => console.error(err));
  } catch (e) {
    console.error('[storage] IndexedDBへの保存失敗:', e);
    window.dispatchEvent(new CustomEvent('storage-save-error', { detail: { reason: 'local_error' } }));
  }
}

// ==========================================
// 状態変更関数（同期的にReact stateを更新し、非同期でサーバーに保存）
// ==========================================

export function addRace(state: AppState, race: Race): AppState {
  const newState = {
    ...state,
    races: [...state.races, race],
    masterData: updateMasterDataWithRace(state.masterData, race)
  };
  saveStateToServer(newState); // 非同期保存
  return newState;
}

export function updateRace(state: AppState, updatedRace: Race): AppState {
  const newState = {
    ...state,
    races: state.races.map(r => r.id === updatedRace.id ? updatedRace : r),
    masterData: updateMasterDataWithRace(state.masterData, updatedRace)
  };
  saveStateToServer(newState);
  return newState;
}

export function addResult(state: AppState, result: RaceResult): AppState {
  const race = state.races.find(r => r.id === result.raceId);
  const updatedRaces = state.races.map(r => {
    if (r.id === result.raceId) {
      return { ...r, result };
    }
    return r;
  });

  // 統計更新
  const completedRaces = updatedRaces.filter(r => r.result);
  const hitRaces = completedRaces.filter(r => r.result?.hitTickets && r.result.hitTickets.length > 0);
  const totalReturn = completedRaces.reduce((sum, r) => sum + (r.result?.profit || 0), 0);

  const newState = {
    ...state,
    races: updatedRaces,
    stats: {
      totalRaces: completedRaces.length,
      hitCount: hitRaces.length,
      hitRate: completedRaces.length > 0 ? hitRaces.length / completedRaces.length : 0,
      totalInvested: completedRaces.length * 1300, // 13点 × 100円
      totalReturn,
      roi: completedRaces.length > 0 ? (totalReturn - completedRaces.length * 1300) / (completedRaces.length * 1300) : 0,
    },
    masterData: race ? updateMasterDataWithResult(state.masterData, result, race) : state.masterData
  };
  saveStateToServer(newState);
  return newState;
}

export function addLearningPatch(state: AppState, patch: LearningPatch): AppState {
  const newState = {
    ...state,
    learningPatches: [...state.learningPatches, patch],
    modelVersion: `TsuchiyaProtocol-Omega ${patch.version}`,
  };
  saveStateToServer(newState);
  return newState;
}

export function togglePatch(state: AppState, patchId: string): AppState {
  const newState = {
    ...state,
    learningPatches: state.learningPatches.map((p: LearningPatch) =>
      p.id === patchId ? { ...p, active: !p.active } : p
    ),
  };
  saveStateToServer(newState);
  return newState;
}

export function deleteRace(state: AppState, raceId: string): AppState {
  const newState = {
    ...state,
    races: state.races.filter(r => r.id !== raceId),
  };
  saveStateToServer(newState);
  return newState;
}

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ==========================================
// 後方互換（他コンポーネントからのimport対応）
// ==========================================
export function saveState(state: AppState): void {
  saveStateToServer(state);
}
