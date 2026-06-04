// ==========================================
// API Route: /api/state
// GET  → AppState を JSON で返す
// POST → AppState を保存する
// ==========================================

import { NextRequest, NextResponse } from 'next/server';
import { serverReadState, serverWriteState } from '../../lib/server-db';
import { AppState } from '../../types';

export const dynamic = 'force-dynamic'; // キャッシュ無効化

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
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error('[POST /api/state] エラー:', e);
    return NextResponse.json({ error: 'Failed to save state' }, { status: 500 });
  }
}
