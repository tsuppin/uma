// ==========================================
// LocalStorage データ管理
// ==========================================

import { AppState, Race, LearningPatch, RaceResult } from '../types';
import { INITIAL_PATCHES } from './constants';

const STORAGE_KEY = 'tsuchiya_keiba_ai_v1';

import { updateMasterDataWithRace, updateMasterDataWithResult } from './db';

const defaultState: AppState = {
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

export function loadState(): AppState {
  if (typeof window === 'undefined') return defaultState;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const state = stored ? { ...defaultState, ...JSON.parse(stored) } : defaultState;
    
    // masterData がなければ初期化
    if (!state.masterData) {
      state.masterData = defaultState.masterData;
    }
    
    // 初期パッチをマージ (既存のIDがあればスキップ)
    const existingIds = new Set(state.learningPatches.map(p => p.id));
    const mergedPatches = [
      ...state.learningPatches,
      ...INITIAL_PATCHES.filter(p => !existingIds.has(p.id))
    ];
    
    return { ...state, learningPatches: mergedPatches };
  } catch {
    return defaultState;
  }
}

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.error('Failed to save state');
  }
}

export function addRace(state: AppState, race: Race): AppState {
  const newState = {
    ...state,
    races: [...state.races, race],
    masterData: updateMasterDataWithRace(state.masterData, race)
  };
  saveState(newState);
  return newState;
}

export function updateRace(state: AppState, updatedRace: Race): AppState {
  const newState = {
    ...state,
    races: state.races.map(r => r.id === updatedRace.id ? updatedRace : r),
    masterData: updateMasterDataWithRace(state.masterData, updatedRace)
  };
  saveState(newState);
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
  saveState(newState);
  return newState;
}

export function addLearningPatch(state: AppState, patch: LearningPatch): AppState {
  const newState = {
    ...state,
    learningPatches: [...state.learningPatches, patch],
    modelVersion: `TsuchiyaProtocol-Omega ${patch.version}`,
  };
  saveState(newState);
  return newState;
}

export function togglePatch(state: AppState, patchId: string): AppState {
  const newState = {
    ...state,
    learningPatches: state.learningPatches.map(p =>
      p.id === patchId ? { ...p, active: !p.active } : p
    ),
  };
  saveState(newState);
  return newState;
}

export function deleteRace(state: AppState, raceId: string): AppState {
  const newState = {
    ...state,
    races: state.races.filter(r => r.id !== raceId),
  };
  saveState(newState);
  return newState;
}

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
