// ==========================================
// API Route: /api/state
// GET  → AppState を JSON で返す
// POST → AppState を保存する
// ==========================================

import { NextRequest, NextResponse } from 'next/server';
import { serverReadState, serverWriteState } from '../../lib/server-db';
import { AppState } from '../../types';
import { exec } from 'child_process';

export const dynamic = 'force-dynamic'; // キャッシュ無効化

let isSyncing = false; // 重複実行防止フラグ

function triggerAutoGitSync() {
  if (isSyncing) return;
  isSyncing = true;

  const cmd = `git add keiba_data/app_state.json && git commit -m "chore: auto-sync app_state.json" && git push origin main`;
  
  exec(cmd, { cwd: process.cwd() }, (error, stdout, stderr) => {
    isSyncing = false;
    if (error) {
      // 変更がない場合（nothing to commit）はエラーになるが問題ないため無視
      if (!stdout.includes('nothing to commit') && !stderr.includes('nothing to commit')) {
        console.error('[Auto Git Sync] Failed:', error.message);
      }
    } else {
      console.log('[Auto Git Sync] Success:', stdout);
    }
  });
}

export async function GET() {
  try {
    const state = serverReadState();
    return NextResponse.json(state, { status: 200 });
  } catch (e) {
    console.error('[GET /api/state] エラー:', e);
    return NextResponse.json({ error: 'Failed to read state' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const state = (await request.json()) as AppState;

    if (!state || typeof state !== 'object') {
      return NextResponse.json({ error: 'Invalid state' }, { status: 400 });
    }

    serverWriteState(state);
    
    // 保存後、非同期でGitに自動プッシュする（レスポンスをブロックしない）
    triggerAutoGitSync();

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error('[POST /api/state] エラー:', e);
    return NextResponse.json({ error: 'Failed to save state' }, { status: 500 });
  }
}
