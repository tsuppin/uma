// ==========================================
// LocalStorage データ管理
// ==========================================

import { AppState, Race, LearningPatch, RaceResult } from '../types';
import { INITIAL_PATCHES } from './constants';

const STORAGE_KEY = 'tsuchiya_keiba_ai_v1';

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
};

export function loadState(): AppState {
  if (typeof window === 'undefined') return defaultState;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const state = stored ? { ...defaultState, ...JSON.parse(stored) } : defaultState;
    
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
  };
  saveState(newState);
  return newState;
}

export function updateRace(state: AppState, updatedRace: Race): AppState {
  const newState = {
    ...state,
    races: state.races.map(r => r.id === updatedRace.id ? updatedRace : r),
  };
  saveState(newState);
  return newState;
}

export function addResult(state: AppState, result: RaceResult): AppState {
  const updatedRaces = state.races.map(race => {
    if (race.id === result.raceId) {
      return { ...race, result };
    }
    return race;
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
