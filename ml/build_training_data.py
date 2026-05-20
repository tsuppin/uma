# -*- coding: utf-8 -*-
# =============================================================================
# ml/build_training_data.py
# テキストファイルから学習用 DataFrame を生成するパイプライン
#
# ■ 学習データ生成の仕組み（「過去走シフト方式」）
#
#   テキストは【出馬表（出走前）】でも【成績表（出走後）】でも対応。
#
#   ・成績表テキスト（着順が含まれる場合）:
#     → 各馬の「今走の着順」をターゲットに、「過去走[0]」を前走特徴量として使う。
#
#   ・出馬表テキスト（着順が未知の場合）:
#     → 各馬の「過去走[0]の着順」をターゲットに、「過去走[1]」を前走特徴量として使う。
#       これにより、1枚の出馬表から馬1頭につき1学習サンプルを生成できる。
#
#   どちらのモードも自動判定して処理する。
#
# ■ 使い方
#   (A) 単一テキストファイルのパース:
#       df = build_df_from_file("race_text.txt")
#
#   (B) ディレクトリ一括パース:
#       df = build_df_from_dir("data/tokyo/", venue_filter="東京")
#
#   (C) スクリプトとして直接実行:
#       py ml/build_training_data.py --dir data/tokyo/ --out training_tokyo.csv
# =============================================================================

import sys
import io
import os
import re
import glob
import argparse
from datetime import datetime, date
from typing import Optional, List, Dict, Any

import pandas as pd
import numpy as np

# パーサーのインポート
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from text_parser import parse_text, GENDER_VALUES, CONDITION_VALUES, SURFACE_VALUES

if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# 代表的なRoberto系種牡馬（笠松・大井等の砂適性血統）
ROBERTO_SIRES = [
    "グラスワンダー", "スクリーンヒーロー", "モーリス", "エピファネイア",
    "ブライアンズタイム", "シンボリクリスエス", "エスポワールシチー", "スマートファルコン",
    "マヤノトップガン", "タニノギムレット", "タイムパラドックス", "ストロングリターン",
    "ゴールドアクター", "リオンディーズ", "ルヴァンスレーヴ"
]

# =============================================================================
# 1. 1頭分の特徴量辞書を生成する関数
# =============================================================================

def _date_str_to_date(s: str) -> Optional[date]:
    """'YYYY-MM-DD' 文字列を date オブジェクトに変換する"""
    try:
        return datetime.strptime(s, "%Y-%m-%d").date()
    except Exception:
        return None


def _weeks_between(d1: Optional[date], d2: Optional[date]) -> float:
    """2つの日付の差を週数で返す。不明な場合は 0 を返す"""
    if d1 and d2 and d1 > d2:
        return (d1 - d2).days / 7.0
    return 0.0


def build_row_from_result(
    race_info: Dict[str, Any],
    horse: Dict[str, Any],
    actual_result: int,
    race_date_obj: Optional[date] = None,
) -> Optional[Dict[str, Any]]:
    """
    【成績表モード】
    今走の実際の着順 (actual_result) をターゲットに、
    horse['past_races'][0] を前走特徴量として使ってサンプルを生成する。
    """
    past_races = horse.get('past_races', [])
    prev = past_races[0] if len(past_races) >= 1 else None

    row = _build_base_row(race_info, horse, actual_result, prev, race_date_obj)
    return row


def build_row_from_past(
    race_info: Dict[str, Any],
    horse: Dict[str, Any],
) -> Optional[Dict[str, Any]]:
    """
    【出馬表モード（着順未知）】
    horse['past_races'][0] の着順をターゲットに、
    horse['past_races'][1] を前走特徴量として使ってサンプルを生成する。
    horse['past_races'][0] の日付に基づいてレース情報を再現する。
    """
    past_races = horse.get('past_races', [])
    if len(past_races) < 1:
        return None

    target_race = past_races[0]  # ← ターゲットとなる「最新の過去走」
    if not target_race.get('result'):
        return None

    # 過去走をレースとして使う
    synthetic_race_info = {
        'venue':      target_race.get('venue', race_info.get('venue', '')),
        'date':       target_race.get('date', ''),
        'distance':   target_race.get('distance', race_info.get('distance', 0)),
        'surface':    target_race.get('surface', race_info.get('surface', 'ダート')),
        'condition':  target_race.get('condition', race_info.get('condition', '良')),
        'head_count': target_race.get('head_count', race_info.get('head_count', 0)),
        'race_class': target_race.get('race_class', race_info.get('race_class', '')),
        'race_name':  target_race.get('race_name', race_info.get('race_name', '')),
    }

    # 馬属性（年齢を過去走時点に補正）
    synthetic_horse = dict(horse)
    current_age = horse.get('age', 4)
    current_race_date = _date_str_to_date(race_info.get('date', ''))
    target_race_date  = _date_str_to_date(target_race.get('date', ''))

    if current_race_date and target_race_date:
        age_delta = (current_race_date.year - target_race_date.year)
        synthetic_horse['age'] = max(2, current_age - age_delta)

    # 体重・斤量は過去走の値を使う
    synthetic_horse['weight']     = target_race.get('weight', horse.get('weight', 480))
    synthetic_horse['weight_chg'] = 0  # 過去走の増減は不明のため 0 に設定
    synthetic_horse['kinryo']     = target_race.get('kinryo', horse.get('kinryo', 55.0))
    synthetic_horse['popularity'] = target_race.get('popularity', 0)
    synthetic_horse['frame']      = target_race.get('frame', horse.get('frame', 0))

    prev = past_races[1] if len(past_races) >= 2 else None
    actual_result = target_race.get('result', 0)

    return _build_base_row(
        synthetic_race_info,
        synthetic_horse,
        actual_result,
        prev,
        target_race_date
    )


def _build_base_row(
    race_info:      Dict[str, Any],
    horse:          Dict[str, Any],
    actual_result:  int,
    prev:           Optional[Dict[str, Any]],
    race_date_obj:  Optional[date],
) -> Dict[str, Any]:
    """特徴量辞書を組み立てる内部関数"""

    # --- 基本特徴量 ---
    row: Dict[str, Any] = {
        # メタ情報
        'venue':     race_info.get('venue', ''),
        'race_date': race_info.get('date', ''),
        'horse_name': horse.get('name', ''),
        'jockey':    horse.get('jockey', ''),
        'trainer':   horse.get('trainer', ''),
        'sire':      horse.get('sire', ''),

        # ターゲット変数
        'target':    1 if actual_result <= 3 and actual_result > 0 else 0,
        'result':    actual_result,

        # ベース特徴量 (9個)
        '枠番':          float(horse.get('frame', 0) or 0),
        '馬番':          float(horse.get('number', 0) or 0),
        '斤量':          float(horse.get('kinryo', 55.0) or 55.0),
        '単勝':          float(horse.get('odds', 0) or 0),
        '人気':          float(horse.get('popularity', 0) or 0),
        '年齢':          float(horse.get('age', 4) or 4),
        '性別':          float(GENDER_VALUES.get(horse.get('gender', '牡'), 0)),
        '馬体重_base':   float(horse.get('weight', 480) or 480),
        '馬体重_増減':   float(horse.get('weight_chg', 0) or 0),

        # レース条件
        '距離':          float(race_info.get('distance', 0) or 0),
        '馬場':          float(SURFACE_VALUES.get(race_info.get('surface', 'ダート'), 1)),
        '馬場状態':      float(CONDITION_VALUES.get(race_info.get('condition', '良'), 0)),
        '頭数':          float(race_info.get('head_count', 0) or 0),
        
        # 環境データ
        'cushion_value': float(race_info.get('cushion_value') or float('nan')),
        'moisture':      float(race_info.get('moisture') or float('nan')),
        
        # 血統系統フラグ
        'is_roberto_line': 1.0 if horse.get('sire') in ROBERTO_SIRES else 0.0,
    }

    # --- 前走特徴量 (8個) ---
    if prev:
        prev_date_obj = _date_str_to_date(prev.get('date', ''))
        
        # 転入初戦判定
        prev_venue = prev.get('venue', '')
        current_venue = race_info.get('venue', '')
        is_transfer = 1.0 if prev_venue and current_venue and prev_venue != current_venue else 0.0
        
        # クラス降級判定
        def _get_class_rank(c: str) -> int:
            if not c: return 0
            if 'A' in c or 'Ａ' in c or 'オープン' in c or 'OP' in c or '重賞' in c: return 3
            if 'B' in c or 'Ｂ' in c or '3勝' in c or '2勝' in c: return 2
            if 'C' in c or 'Ｃ' in c or '1勝' in c or '未勝利' in c or '新馬' in c: return 1
            return 0
            
        current_rank = _get_class_rank(race_info.get('race_class') or race_info.get('race_name', ''))
        prev_rank = _get_class_rank(prev.get('race_class', ''))
        class_drop_flag = 1.0 if prev_rank > current_rank and current_rank > 0 else 0.0
        
        # 初角位置・マクリ判定
        prev_passing = prev.get('passing', '')
        first_corner_pos = 0.0
        makuri_flag = 0.0
        if prev_passing and '-' in prev_passing:
            parts = prev_passing.split('-')
            if parts[0].isdigit():
                first_corner_pos = float(parts[0])
            if len(parts) >= 2 and parts[0].isdigit() and parts[-1].isdigit():
                # 初角順位 - 最終角順位 >= 3 ならマクリ
                if int(parts[0]) - int(parts[-1]) >= 3:
                    makuri_flag = 1.0
        elif prev_passing and prev_passing.isdigit():
            first_corner_pos = float(prev_passing)

        row.update({
            'prev_result':     float(prev.get('result', 0) or 0),
            'prev_last3f':     float(prev.get('last3f', 0) or 0),
            'prev_time_diff':  float(prev.get('time_diff', 0) or 0),
            'prev_popularity': float(prev.get('popularity', 0) or 0),
            'prev_distance':   float(prev.get('distance', 0) or 0),
            'distance_change': float((race_info.get('distance', 0) or 0) - (prev.get('distance', 0) or 0)),
            'interval_weeks':  float(_weeks_between(race_date_obj, prev_date_obj)),
            'prev_top3_flag':  1.0 if prev.get('result', 0) and prev['result'] <= 3 else 0.0,
            'prev_jockey':     prev.get('jockey', ''),
            'is_jockey_changed': 1.0 if prev.get('jockey') and horse.get('jockey') and prev.get('jockey') != horse.get('jockey') else 0.0,
            'is_transfer':     is_transfer,
            'class_drop_flag': class_drop_flag,
            'first_corner_pos': first_corner_pos,
            'makuri_flag':     makuri_flag,
        })
    else:
        row.update({
            'prev_result': 0.0, 'prev_last3f': 0.0, 'prev_time_diff': 0.0,
            'prev_popularity': 0.0, 'prev_distance': 0.0, 'distance_change': 0.0,
            'interval_weeks': 0.0, 'prev_top3_flag': 0.0,
            'prev_jockey': '',
            'is_jockey_changed': 0.0,
            'is_transfer': 0.0,
            'class_drop_flag': 0.0,
            'first_corner_pos': 0.0,
            'makuri_flag': 0.0,
        })

    return row


# =============================================================================
# 2. 1つのテキストファイルから学習行を生成
# =============================================================================

def build_rows_from_text(
    text: str,
    venue_filter: Optional[str] = None,
    mode: str = 'auto'
) -> List[Dict[str, Any]]:
    """
    テキスト文字列を解析して学習行のリストを返す。

    Args:
        text:         テキストデータ（JRA/NAR の出馬表・成績表）
        venue_filter: 指定した場合、その競馬場のデータのみ抽出
        mode:         'result'  → 成績表モード（着順が含まれる）
                      'past'    → 出馬表モード（過去走から生成）
                      'auto'    → 自動判定（デフォルト）
    Returns:
        学習行の辞書リスト
    """
    parsed = parse_text(text)
    race_info = parsed['race_info']
    horses    = parsed['horses']

    if not horses:
        return []

    if venue_filter and race_info.get('venue') != venue_filter:
        return []

    race_date_obj = _date_str_to_date(race_info.get('date', ''))

    # モード自動判定:
    # 馬番[0]の frame が "着順" として解釈できる（1〜頭数の範囲）かつ
    # past_races[0]が実際の過去走(日付あり)なら成績表モード
    if mode == 'auto':
        first_horse = horses[0] if horses else {}
        actual_result_candidate = first_horse.get('frame', 0)
        # 成績表: 最初のフィールドが着順(1〜18)として妥当
        # 出馬表: 最初のフィールドが枠番(1〜8)
        # NAR format では frame フィールドが着順として入ることがある
        if 1 <= actual_result_candidate <= 18:
            mode = 'result'
        else:
            mode = 'past'

    rows = []
    for horse in horses:
        if mode == 'result':
            # 成績表モード: frame フィールドが着順
            actual_result = horse.get('frame', 0)
            row = build_row_from_result(race_info, horse, actual_result, race_date_obj)
        else:
            # 出馬表モード: past_races[0] から生成
            row = build_row_from_past(race_info, horse)

        if row:
            row['source_file'] = ''  # ファイル名は呼び出し元で設定
            rows.append(row)

    return rows


def build_df_from_file(filepath: str, venue_filter: Optional[str] = None, mode: str = 'auto') -> pd.DataFrame:
    """1つのテキストファイルから学習用 DataFrame を生成する"""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
            text = f.read()
    except Exception as e:
        print(f"[WARN] {filepath}: 読み込みエラー -> {e}")
        return pd.DataFrame()

    rows = build_rows_from_text(text, venue_filter=venue_filter, mode=mode)
    for row in rows:
        row['source_file'] = os.path.basename(filepath)

    df = pd.DataFrame(rows)
    return df


# =============================================================================
# 3. ディレクトリ一括パース
# =============================================================================

def build_df_from_dir(
    directory: str,
    venue_filter: Optional[str] = None,
    mode: str = 'auto',
    extensions: List[str] = None,
    verbose: bool = True,
) -> pd.DataFrame:
    """
    ディレクトリ内の全テキストファイルを解析して学習用 DataFrame を生成する。

    Args:
        directory:    テキストファイルが格納されているディレクトリ
        venue_filter: 競馬場フィルター（例: "東京"）
        mode:         'result' / 'past' / 'auto'
        extensions:   対象拡張子リスト（デフォルト: ['.txt', '.dat', '.log']）
        verbose:      進捗を出力するか
    Returns:
        全ファイルを結合した学習用 DataFrame
    """
    if extensions is None:
        extensions = ['.txt', '.dat', '.log', '.text']

    all_files = []
    for ext in extensions:
        all_files.extend(glob.glob(os.path.join(directory, f'**/*{ext}'), recursive=True))
        all_files.extend(glob.glob(os.path.join(directory, f'*{ext}')))

    all_files = sorted(set(all_files))

    if not all_files:
        print(f"[WARN] {directory}: テキストファイルが見つかりません。")
        return pd.DataFrame()

    if verbose:
        print(f"[INFO] {directory}: {len(all_files)} ファイルを処理します...")

    dfs = []
    ok_count  = 0
    err_count = 0

    for fpath in all_files:
        df_part = build_df_from_file(fpath, venue_filter=venue_filter, mode=mode)
        if not df_part.empty:
            dfs.append(df_part)
            ok_count += len(df_part)
        else:
            err_count += 1

    if not dfs:
        print(f"[WARN] 有効なデータが生成されませんでした。")
        return pd.DataFrame()

    df = pd.concat(dfs, ignore_index=True)

    if verbose:
        print(f"[OK] {len(all_files)} ファイル処理完了 / 学習行数: {len(df)} / エラー: {err_count}")

    return df


# =============================================================================
# 4. CLI エントリポイント
# =============================================================================

def main():
    parser = argparse.ArgumentParser(
        description='テキストファイルから競馬学習データを生成する'
    )
    parser.add_argument('--dir',  '-d', required=True,  help='テキストファイルのディレクトリ')
    parser.add_argument('--out',  '-o', default='training_data.csv', help='出力CSVファイル名')
    parser.add_argument('--venue','-v', default=None,   help='競馬場フィルター (例: 東京)')
    parser.add_argument('--mode', '-m', default='auto', choices=['auto', 'result', 'past'],
                        help='モード: result=成績表, past=出馬表, auto=自動')
    args = parser.parse_args()

    df = build_df_from_dir(
        directory=args.dir,
        venue_filter=args.venue,
        mode=args.mode,
        verbose=True
    )

    if df.empty:
        print("[ERROR] データが生成されませんでした。")
        return

    df.to_csv(args.out, index=False, encoding='utf-8-sig')
    print(f"\n[SAVED] {args.out}")
    print(f"  行数: {len(df)} / 列数: {len(df.columns)}")
    print(f"  target分布:\n{df['target'].value_counts().to_string()}")
    print(f"\n  列一覧: {list(df.columns)}")


if __name__ == '__main__':
    main()
