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

# 道悪パワー型種牡馬（湿潤馬場・含水率が高い時に激走）
HEAVY_TRACK_SIRES = [
    "ゴールドアリュール", "クロフネ", "ドレフォン", "マインドユアビスケッツ",
    "シニスターミニスター", "パイロ", "サウスヴィグラス", "ヘニーヒューズ",
    "エスポワールシチー", "スマートファルコン", "ホッコータルマエ",
    "コパノリッキー", "マジェスティックウォリアー"
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
    prev2 = past_races[1] if len(past_races) >= 2 else None

    row = _build_base_row(race_info, horse, actual_result, prev, prev2, race_date_obj)
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
    prev2 = past_races[2] if len(past_races) >= 3 else None
    actual_result = target_race.get('result', 0)

    return _build_base_row(
        synthetic_race_info,
        synthetic_horse,
        actual_result,
        prev,
        prev2,
        target_race_date
    )


def _build_base_row(
    race_info:      Dict[str, Any],
    horse:          Dict[str, Any],
    actual_result:  int,
    prev:           Optional[Dict[str, Any]],
    prev2:          Optional[Dict[str, Any]],
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
        'bms':       horse.get('bms', ''),
        'owner':     horse.get('owner', ''),
        'breeder':   horse.get('breeder', ''),

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
        'weight_chg_plus': 1.0 if float(horse.get('weight_chg', 0) or 0) > 0 else 0.0,
        'weight_chg_zero': 1.0 if float(horse.get('weight_chg', 0) or 0) == 0 else 0.0,
        'weight_chg_minus': 1.0 if float(horse.get('weight_chg', 0) or 0) < 0 else 0.0,
        'weight_chg_severe_minus': 1.0 if float(horse.get('weight_chg', 0) or 0) <= -10 else 0.0,
        'has_blinker':   1.0 if horse.get('has_blinker') else 0.0,
        'is_apprentice_jockey': 1.0 if horse.get('is_apprentice') else 0.0,
        'kinryo_weight_ratio': float(horse.get('kinryo', 55.0) or 55.0) / float(horse.get('weight', 480) or 480) if float(horse.get('weight', 480) or 480) > 0 else 0.11,
        
        # 枠順バイアスフラグ
        'frame_5_win_boost': 1.0 if float(horse.get('frame', 0) or 0) == 5 else 0.0,
        'outer_frame_advantage': 1.0 if float(horse.get('frame', 0) or 0) in (7, 8) else 0.0,
        'frame_1_trap_penalty': 1.0 if float(horse.get('frame', 0) or 0) == 1 else 0.0,
        
        # 騎手バイアスフラグ
        'is_yokoyama_kazuo': 1.0 if '横山和生' in horse.get('jockey', '') else 0.0,
        'is_ozawa_daijin': 1.0 if '小沢大仁' in horse.get('jockey', '') else 0.0,
        'apprentice_light_female': 1.0 if (
            horse.get('is_apprentice') 
            and horse.get('gender') == '牝' 
            and 50.0 <= float(horse.get('kinryo', 55.0) or 55.0) <= 53.0
        ) else 0.0,

        # レース条件
        '距離':          float(race_info.get('distance', 0) or 0),
        '馬場':          float(SURFACE_VALUES.get(race_info.get('surface', 'ダート'), 1)),
        '馬場状態':      float(CONDITION_VALUES.get(race_info.get('condition', '良'), 0)),
        '頭数':          float(race_info.get('head_count', 0) or 0),
        'race_month':    float(race_date_obj.month) if race_date_obj else 6.0,
        
        # 隊列・展開情報
        'overall_pack_length': float(race_info.get('overall_pack_length', 0.0)),
        'overall_is_compact':  float(race_info.get('overall_is_compact', 0.0)),
        'overall_is_elongated': float(race_info.get('overall_is_elongated', 0.0)),
        
        # 環境データ
        'cushion_value': float(race_info.get('cushion_value') or float('nan')),
        'moisture':      float(race_info.get('moisture') or float('nan')),
        
        # 血統系統フラグ
        'is_roberto_line': 1.0 if horse.get('sire') in ROBERTO_SIRES else 0.0,
        'is_heavy_track_sire': 1.0 if horse.get('sire') in HEAVY_TRACK_SIRES else 0.0,
        
        # 新規追加（レース単位の特徴量・ターゲット等として蓄積するため）
        'race_furlong_time': race_info.get('race_furlong_time', ''),
        'race_agari': race_info.get('race_agari', ''),
        'race_corner_3': race_info.get('race_corner_3', ''),
        'race_corner_4': race_info.get('race_corner_4', ''),
        'horse_passing': horse.get('passing', ''),
        'horse_last3f': horse.get('last3f', 0.0),
    }

    # Furlong time parsing (if available)
    furlong_str = race_info.get('race_furlong_time', '')
    first_3f_time = 0.0
    last_3f_time = 0.0
    avg_furlong = 0.0
    if furlong_str:
        try:
            furlongs = [float(x.strip()) for x in furlong_str.replace(',', '.').split('-') if x.strip()]
            if len(furlongs) >= 3:
                first_3f_time = sum(furlongs[:3])
                last_3f_time = sum(furlongs[-3:])
            if furlongs:
                avg_furlong = sum(furlongs) / len(furlongs)
        except Exception:
            pass
            
    row.update({
        'race_first_3f': first_3f_time,
        'race_last_3f': last_3f_time,
        'race_avg_furlong': avg_furlong,
    })

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
        class_up_flag = 1.0 if prev_rank < current_rank and prev_rank > 0 else 0.0
        
        # 全過去走から適性を算出
        past_races_all = horse.get('past_races', [])
        heavy_runs, heavy_top3 = 0, 0
        left_runs, left_top3 = 0, 0
        LEFT_HANDED_TRACKS = ["東京", "中京", "新潟", "川崎", "船橋", "浦和", "盛岡"]
        
        for pr in past_races_all:
            cond = pr.get('condition')
            res = pr.get('result', 0)
            if cond in ['稍重', '重', '不良']:
                heavy_runs += 1
                if 0 < res <= 3:
                    heavy_top3 += 1
            if pr.get('venue') in LEFT_HANDED_TRACKS:
                left_runs += 1
                if 0 < res <= 3:
                    left_top3 += 1
                    
        heavy_track_aptitude = float(heavy_top3 / heavy_runs) if heavy_runs > 0 else 0.0
        left_handed_aptitude = float(left_top3 / left_runs) if left_runs > 0 else 0.0
        
        # 初角位置・マクリ判定・ごぼう抜き指数・各コーナー通過順位
        prev_passing = prev.get('passing', '')
        first_corner_pos = 0.0
        makuri_flag = 0.0
        prev_corner34_overtake = 0.0
        prev_corner1_pos = 0.0
        prev_corner2_pos = 0.0
        prev_corner4_pos = 0.0
        prev_corner4_within_5 = 0.0

        if prev_passing and '-' in prev_passing:
            parts = prev_passing.split('-')
            if parts[0].isdigit():
                first_corner_pos = float(parts[0])
                prev_corner1_pos = float(parts[0])
            if len(parts) >= 2 and parts[1].isdigit():
                prev_corner2_pos = float(parts[1])
            if len(parts) >= 2 and parts[0].isdigit() and parts[-1].isdigit():
                if int(parts[0]) - int(parts[-1]) >= 3:
                    makuri_flag = 1.0
            if len(parts) >= 2 and parts[-2].isdigit() and parts[-1].isdigit():
                prev_corner34_overtake = float(int(parts[-2]) - int(parts[-1]))
            if parts[-1].isdigit():
                prev_corner4_pos = float(parts[-1])
                prev_corner4_within_5 = 1.0 if int(parts[-1]) <= 5 else 0.0
        elif prev_passing and prev_passing.isdigit():
            first_corner_pos = float(prev_passing)
            prev_corner1_pos = float(prev_passing)
            prev_corner4_pos = float(prev_passing)
            prev_corner4_within_5 = 1.0 if int(prev_passing) <= 5 else 0.0

        # 前々走コーナー通過順位
        prev2_corner1_pos = 0.0
        prev2_corner2_pos = 0.0
        if prev2:
            prev2_passing = prev2.get('passing', '')
            if prev2_passing and '-' in prev2_passing:
                p2_parts = prev2_passing.split('-')
                if p2_parts[0].isdigit():
                    prev2_corner1_pos = float(p2_parts[0])
                if len(p2_parts) >= 2 and p2_parts[1].isdigit():
                    prev2_corner2_pos = float(p2_parts[1])
            elif prev2_passing and prev2_passing.isdigit():
                prev2_corner1_pos = float(prev2_passing)

        # 馬場替わり判定
        prev_surface = prev.get('surface', '')
        current_surface = race_info.get('surface', '')
        surface_change = 1.0 if prev_surface and current_surface and prev_surface != current_surface else 0.0

        # 馬体重トレンド判定 (今走体重 - 前走体重)
        prev_weight = float(prev.get('weight', 0) or 0)
        current_weight = float(horse.get('weight', 0) or 0)
        weight_trend = current_weight - prev_weight if prev_weight > 0 and current_weight > 0 else 0.0

        row.update({
            'prev_result':     float(prev.get('result', 0) or 0),
            'prev_last3f':     float(prev.get('last3f', 0) or 0),
            'prev_last3f_rank': float(prev.get('last3f_rank', 0) or 0),
            'prev_front3f':    float(prev.get('front3f', 0) or 0),
            'prev_time_diff':  float(prev.get('time_diff', 0) or 0),
            'prev_popularity': float(prev.get('popularity', 0) or 0),
            'prev_distance':   float(prev.get('distance', 0) or 0),
            'prev_head_count': float(prev.get('head_count', 0) or 0),
            'weight_trend':    float(weight_trend),
            'distance_change': float((race_info.get('distance', 0) or 0) - (prev.get('distance', 0) or 0)),
            'is_distance_reduction': 1.0 if ((race_info.get('distance', 0) or 0) - (prev.get('distance', 0) or 0)) < 0 else 0.0,
            'interval_weeks':  float(_weeks_between(race_date_obj, prev_date_obj)),
            'prev_top3_flag':  1.0 if prev.get('result', 0) and prev['result'] <= 3 else 0.0,
            'prev_jockey':     prev.get('jockey', ''),
            'is_jockey_changed': 1.0 if prev.get('jockey') and horse.get('jockey') and prev.get('jockey') != horse.get('jockey') else 0.0,
            'jockey_change_to_special': 1.0 if (
                (prev.get('jockey') and horse.get('jockey') and prev.get('jockey') != horse.get('jockey')) 
                and ('横山和生' in horse.get('jockey', '') or '小沢大仁' in horse.get('jockey', '') or horse.get('is_apprentice'))
            ) else 0.0,
            'is_transfer':     is_transfer,
            'class_drop_flag': class_drop_flag,
            'class_up_flag':   class_up_flag,
            'surface_change':  surface_change,
            'first_corner_pos': first_corner_pos,
            'prev_corner1_pos': prev_corner1_pos,
            'prev_corner2_pos': prev_corner2_pos,
            'prev_corner4_pos': prev_corner4_pos,
            'prev_corner4_within_5': prev_corner4_within_5,
            'prev2_corner1_pos': prev2_corner1_pos,
            'prev2_corner2_pos': prev2_corner2_pos,
            'makuri_flag':     makuri_flag,
            'prev_corner34_overtake': prev_corner34_overtake,
            'heavy_track_aptitude': heavy_track_aptitude,
            'left_handed_aptitude': left_handed_aptitude,
        })
    else:
        row.update({
            'prev_result': 0.0, 'prev_last3f': 0.0, 'prev_last3f_rank': 0.0, 'prev_front3f': 0.0, 'prev_time_diff': 0.0,
            'prev_popularity': 0.0, 'prev_distance': 0.0, 'distance_change': 0.0,
            'prev_head_count': 0.0, 'weight_trend': 0.0,
            'interval_weeks': 0.0, 'prev_top3_flag': 0.0,
            'prev_jockey': '',
            'is_jockey_changed': 0.0,
            'is_transfer': 0.0,
            'class_drop_flag': 0.0,
            'class_up_flag': 0.0,
            'surface_change': 0.0,
            'first_corner_pos': 0.0,
            'prev_corner1_pos': 0.0,
            'prev_corner2_pos': 0.0,
            'prev_corner4_pos': 0.0,
            'prev_corner4_within_5': 0.0,
            'prev2_corner1_pos': 0.0,
            'prev2_corner2_pos': 0.0,
            'is_distance_reduction': 0.0,
            'makuri_flag': 0.0,
            'prev_corner34_overtake': 0.0,
            'heavy_track_aptitude': 0.0,
            'left_handed_aptitude': 0.0,
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
    if mode == 'auto':
        if parsed.get('format') == 'jra_result':
            mode = 'result'
        else:
            first_horse = horses[0] if horses else {}
            actual_result_candidate = first_horse.get('frame', 0)
            if 1 <= actual_result_candidate <= 18:
                mode = 'result'
            else:
                mode = 'past'

    rows = []
    for horse in horses:
        if mode == 'result':
            # 成績表モード
            if parsed.get('format') == 'jra_result':
                actual_result = horse.get('result', 0)
            else:
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
