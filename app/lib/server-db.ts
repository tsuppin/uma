// ==========================================
// サーバーサイド データ永続化モジュール
// Node.js fs を使った JSON ファイル保存
// どのブラウザ・モードでも確実に保存される
// ==========================================

import fs from 'fs';
import path from 'path';
import { AppState } from '../types';
import { INITIAL_PATCHES } from './constants';

// 保存先: プロジェクトルート/keiba_data/app_state.json
const DATA_DIR = path.join(process.cwd(), 'keiba_data');
const STATE_FILE = path.join(DATA_DIR, 'app_state.json');

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

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function serverReadState(): AppState {
  try {
    ensureDataDir();

    if (!fs.existsSync(STATE_FILE)) {
      // ファイルが存在しない場合はデフォルト状態を返す
      return { ...defaultState, learningPatches: INITIAL_PATCHES };
    }

    const raw = fs.readFileSync(STATE_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as AppState;

    // masterData がなければ初期化
    if (!parsed.masterData) {
      parsed.masterData = defaultState.masterData;
    }

    // 初期パッチをマージ (既存のIDがあればスキップ)
    const existingIds = new Set(parsed.learningPatches.map(p => p.id));
    const mergedPatches = [
      ...parsed.learningPatches,
      ...INITIAL_PATCHES.filter(p => !existingIds.has(p.id))
    ];

    return { ...parsed, learningPatches: mergedPatches };
  } catch (e) {
    console.error('[server-db] 読み込みエラー:', e);
    return { ...defaultState, learningPatches: INITIAL_PATCHES };
  }
}

export function serverWriteState(state: AppState): void {
  try {
    ensureDataDir();
    const serialized = JSON.stringify(state, null, 0); // minified JSON
    fs.writeFileSync(STATE_FILE, serialized, 'utf-8');
  } catch (e) {
    console.error('[server-db] 書き込みエラー:', e);
    throw e; // 呼び出し元でエラーを検知させる
  }
}
