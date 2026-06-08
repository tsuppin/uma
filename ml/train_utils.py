# -*- coding: utf-8 -*-
# =============================================================================
import sys, io
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
# =============================================================================
# ml/train_utils.py
# 全競馬場モデルで共通利用する特徴量エンジニアリング関数
# =============================================================================

import pandas as pd
import numpy as np
import os
import json
from datetime import datetime


# =============================================================================
# 1. 前走特徴量エンジニアリング
#    CSVに前走カラムが存在しない場合は NaN -> 0 でフォールバックする
# =============================================================================

def add_prev_race_features(df: pd.DataFrame, current_distance_col: str = '距離') -> pd.DataFrame:
    """
    前走データの特徴量を生成して df に追加する。

    想定するCSVカラム名（存在しない場合は 0 でフォールバック）:
        前走着順     : 前走の着順（除外・取消は NaN）
        前走上がり3F : 前走のラスト3F時計（秒）
        前走タイム差 : 前走の1着馬とのタイム差（0=1着）
        前走人気     : 前走の人気順位
        前走距離     : 前走のレース距離（m）
        前走日付     : 前走の日付（YYYY-MM-DD など）
        騎手         : 騎手名
    """

    # ---- 前走着順 ----------------------------------------
    if '前走着順' in df.columns:
        df['prev_result'] = pd.to_numeric(df['前走着順'], errors='coerce')
    else:
        df['prev_result'] = np.nan

    # ---- 前走上がり3F ----------------------------------------
    if '前走上がり3F' in df.columns:
        df['prev_last3f'] = pd.to_numeric(df['前走上がり3F'], errors='coerce')
    elif '前走上がり' in df.columns:
        df['prev_last3f'] = pd.to_numeric(df['前走上がり'], errors='coerce')
    else:
        df['prev_last3f'] = np.nan

    # ---- 前走タイム差（1着との差）--------------------------
    if '前走タイム差' in df.columns:
        df['prev_time_diff'] = pd.to_numeric(df['前走タイム差'], errors='coerce')
    else:
        df['prev_time_diff'] = np.nan

    # ---- 前走人気 -------------------------------------------
    if '前走人気' in df.columns:
        df['prev_popularity'] = pd.to_numeric(df['前走人気'], errors='coerce')
    else:
        df['prev_popularity'] = np.nan

    # ---- 前走距離 -------------------------------------------
    if '前走距離' in df.columns:
        df['prev_distance'] = pd.to_numeric(df['前走距離'], errors='coerce')
    else:
        df['prev_distance'] = np.nan

    # ---- 距離変化（今走 - 前走） ----------------------------
    if current_distance_col in df.columns and 'prev_distance' in df.columns:
        current_dist = pd.to_numeric(df[current_distance_col], errors='coerce')
        df['distance_change'] = current_dist - df['prev_distance']
    else:
        df['distance_change'] = np.nan

    # ---- 出走間隔（週） -------------------------------------
    if '前走日付' in df.columns and '日付' in df.columns:
        try:
            df['race_date']  = pd.to_datetime(df['日付'],   errors='coerce')
            df['prev_date']  = pd.to_datetime(df['前走日付'], errors='coerce')
            df['interval_weeks'] = (df['race_date'] - df['prev_date']).dt.days / 7.0
            df.drop(columns=['race_date', 'prev_date'], inplace=True, errors='ignore')
        except Exception:
            df['interval_weeks'] = np.nan
    else:
        df['interval_weeks'] = np.nan

    # ---- 前走好走フラグ（3着以内 = 1）-----------------------
    df['prev_top3_flag'] = (df['prev_result'] <= 3).astype(float)
    df.loc[df['prev_result'].isna(), 'prev_top3_flag'] = np.nan

    # ---- 派生指標：距離補正タイム差 & 通過順位バイアス ----
    # 前走タイム差 / 前走距離 * 1000
    df['prev_time_diff_norm'] = np.where(df['prev_distance'] > 0, (df['prev_time_diff'] / df['prev_distance']) * 1000.0, 0.0)
    
    # 初角位置 / 前走頭数
    if 'prev_head_count' in df.columns:
        df['prev_head_count'] = pd.to_numeric(df['prev_head_count'], errors='coerce')
        df['prev_position_ratio'] = np.where(df['prev_head_count'] > 0, df['first_corner_pos'] / df['prev_head_count'], 0.0)
    else:
        df['prev_position_ratio'] = 0.0

    # 着順と人気の乖離（期待裏切り度合い）
    df['prev_pop_result_gap'] = df['prev_result'] - df['prev_popularity']

    # 左右回り適性とコース替わり
    LEFT_HANDED_TRACKS = ["東京", "中京", "新潟", "川崎", "船橋", "浦和", "盛岡"]
    venue_col = '場所' if '場所' in df.columns else 'venue'
    if venue_col in df.columns:
        df['is_left_handed'] = df[venue_col].isin(LEFT_HANDED_TRACKS).astype(float)
    else:
        df['is_left_handed'] = 0.0

    # NaN を 0 で埋める（LightGBM は NaN を内部処理するが明示的に対応）
    prev_cols = [
        'prev_result', 'prev_last3f', 'prev_time_diff',
        'prev_popularity', 'prev_distance', 'distance_change',
        'interval_weeks', 'prev_top3_flag',
        'is_transfer', 'class_drop_flag', 'class_up_flag', 'first_corner_pos', 'makuri_flag',
        'prev_corner34_overtake', 'heavy_track_aptitude', 'left_handed_aptitude',
        'is_roberto_line', 'prev_time_diff_norm', 'prev_position_ratio',
        'weight_trend', 'prev_last3f_rank', 'prev_pop_result_gap', 'is_left_handed'
    ]
    for col in prev_cols:
        if col in df.columns:
            df[col] = df[col].fillna(0)
        else:
            df[col] = 0.0

    return df


# =============================================================================
# 2. 騎手 Target Encoding（騎手 × 競馬場ごとの勝率を連続値化）
# =============================================================================

def add_jockey_target_encoding(
    df: pd.DataFrame,
    jockey_col: str = '騎手',
    prev_jockey_col: str = 'prev_jockey',
    target_col: str = 'target',
    venue_col: str = '場所',
    smoothing: float = 10.0
) -> pd.DataFrame:
    """
    騎手の勝率を Target Encoding で連続値化する。
    スムージング係数（smoothing）でサンプル数が少ない騎手の過学習を防ぐ。

    出力カラム: 'jockey_win_rate_te'
    """
    if jockey_col not in df.columns or target_col not in df.columns:
        df['jockey_win_rate_te'] = 0.0
        df['jockey_te_diff'] = 0.0
        return df

    global_mean = df[target_col].mean()

    # 競馬場カラムが存在する場合は「騎手 × 場所」の複合キーで集計
    if venue_col in df.columns:
        group_key = [jockey_col, venue_col]
    else:
        group_key = [jockey_col]

    stats = df.groupby(group_key)[target_col].agg(['count', 'mean'])
    stats.columns = ['count', 'mean']

    # スムージング式: (count × mean + smoothing × global_mean) / (count + smoothing)
    stats['te_value'] = (
        (stats['count'] * stats['mean'] + smoothing * global_mean)
        / (stats['count'] + smoothing)
    )

    if venue_col in df.columns:
        df = df.join(stats['te_value'].rename('jockey_win_rate_te'), on=group_key)
    else:
        df = df.join(stats['te_value'].rename('jockey_win_rate_te'), on=jockey_col)

    df['jockey_win_rate_te'] = df['jockey_win_rate_te'].fillna(global_mean)

    # 前走騎手のTE計算と差分の算出
    if prev_jockey_col in df.columns:
        if venue_col in df.columns:
            prev_group_key = [prev_jockey_col, venue_col]
        else:
            prev_group_key = [prev_jockey_col]
        
        df = df.join(stats['te_value'].rename('prev_jockey_win_rate_te'), on=prev_group_key)
        df['prev_jockey_win_rate_te'] = df['prev_jockey_win_rate_te'].fillna(global_mean)
        
        # 継続騎乗の場合はTEは同じになるので差分は0になる
        # 差分＝今走の勝率 － 前走の勝率（プラスなら強化）
        df['jockey_te_diff'] = df['jockey_win_rate_te'] - df['prev_jockey_win_rate_te']
        df.drop(columns=['prev_jockey_win_rate_te'], inplace=True)
    else:
        df['jockey_te_diff'] = 0.0

    return df


def add_sire_target_encoding(
    df: pd.DataFrame,
    sire_col: str = 'sire',
    target_col: str = 'target',
    venue_col: str = '場所',
    smoothing: float = 10.0
) -> pd.DataFrame:
    """
    種牡馬の勝率を Target Encoding で連続値化する。
    出力カラム: 'sire_win_rate_te'
    """
    # 互換性: 種牡馬カラムがなければ0.0でフォールバック
    if sire_col not in df.columns or target_col not in df.columns:
        df['sire_win_rate_te'] = 0.0
        return df

    global_mean = df[target_col].mean()

    # 競馬場カラムが存在する場合は「種牡馬 × 場所」の複合キーで集計
    if venue_col in df.columns:
        group_key = [sire_col, venue_col]
    else:
        group_key = [sire_col]

    stats = df.groupby(group_key)[target_col].agg(['count', 'mean'])
    stats.columns = ['count', 'mean']

    # スムージング式
    stats['te_value'] = (
        (stats['count'] * stats['mean'] + smoothing * global_mean)
        / (stats['count'] + smoothing)
    )

    if venue_col in df.columns:
        df = df.join(stats['te_value'].rename('sire_win_rate_te'), on=group_key)
    else:
        df = df.join(stats['te_value'].rename('sire_win_rate_te'), on=sire_col)

    df['sire_win_rate_te'] = df['sire_win_rate_te'].fillna(global_mean)

    return df


def add_trainer_target_encoding(
    df: pd.DataFrame,
    trainer_col: str = 'trainer',
    target_col: str = 'target',
    venue_col: str = '場所',
    smoothing: float = 10.0
) -> pd.DataFrame:
    """
    調教師の勝率を Target Encoding で連続値化する。
    出力カラム: 'trainer_win_rate_te'
    """
    if trainer_col not in df.columns or target_col not in df.columns:
        df['trainer_win_rate_te'] = 0.0
        return df

    global_mean = df[target_col].mean()

    if venue_col in df.columns:
        group_key = [trainer_col, venue_col]
    else:
        group_key = [trainer_col]

    stats = df.groupby(group_key)[target_col].agg(['count', 'mean'])
    stats.columns = ['count', 'mean']
    stats['te_value'] = (
        (stats['count'] * stats['mean'] + smoothing * global_mean)
        / (stats['count'] + smoothing)
    )

    if venue_col in df.columns:
        df = df.join(stats['te_value'].rename('trainer_win_rate_te'), on=group_key)
    else:
        df = df.join(stats['te_value'].rename('trainer_win_rate_te'), on=trainer_col)

    df['trainer_win_rate_te'] = df['trainer_win_rate_te'].fillna(global_mean)

    return df


def add_bms_target_encoding(
    df: pd.DataFrame,
    bms_col: str = 'bms',
    target_col: str = 'target',
    venue_col: str = '場所',
    smoothing: float = 10.0
) -> pd.DataFrame:
    """
    母父(BMS)の勝率を Target Encoding で連続値化する。
    出力カラム: 'bms_win_rate_te'
    """
    if bms_col not in df.columns or target_col not in df.columns:
        df['bms_win_rate_te'] = 0.0
        return df

    global_mean = df[target_col].mean()
    group_key = [bms_col, venue_col] if venue_col in df.columns else [bms_col]

    stats = df.groupby(group_key)[target_col].agg(['count', 'mean'])
    stats.columns = ['count', 'mean']
    stats['te_value'] = (stats['count'] * stats['mean'] + smoothing * global_mean) / (stats['count'] + smoothing)

    df = df.join(stats['te_value'].rename('bms_win_rate_te'), on=group_key) if venue_col in df.columns else df.join(stats['te_value'].rename('bms_win_rate_te'), on=bms_col)
    df['bms_win_rate_te'] = df['bms_win_rate_te'].fillna(global_mean)
    return df

def add_owner_target_encoding(
    df: pd.DataFrame,
    owner_col: str = 'owner',
    target_col: str = 'target',
    venue_col: str = '場所',
    smoothing: float = 10.0
) -> pd.DataFrame:
    """馬主の勝率を TE で連続値化する"""
    if owner_col not in df.columns or target_col not in df.columns:
        df['owner_win_rate_te'] = 0.0
        return df
    global_mean = df[target_col].mean()
    group_key = [owner_col, venue_col] if venue_col in df.columns else [owner_col]
    stats = df.groupby(group_key)[target_col].agg(['count', 'mean'])
    stats.columns = ['count', 'mean']
    stats['te_value'] = (stats['count'] * stats['mean'] + smoothing * global_mean) / (stats['count'] + smoothing)
    df = df.join(stats['te_value'].rename('owner_win_rate_te'), on=group_key) if venue_col in df.columns else df.join(stats['te_value'].rename('owner_win_rate_te'), on=owner_col)
    df['owner_win_rate_te'] = df['owner_win_rate_te'].fillna(global_mean)
    return df

def add_breeder_target_encoding(
    df: pd.DataFrame,
    breeder_col: str = 'breeder',
    target_col: str = 'target',
    venue_col: str = '場所',
    smoothing: float = 10.0
) -> pd.DataFrame:
    """生産者の勝率を TE で連続値化する"""
    if breeder_col not in df.columns or target_col not in df.columns:
        df['breeder_win_rate_te'] = 0.0
        return df
    global_mean = df[target_col].mean()
    group_key = [breeder_col, venue_col] if venue_col in df.columns else [breeder_col]
    stats = df.groupby(group_key)[target_col].agg(['count', 'mean'])
    stats.columns = ['count', 'mean']
    stats['te_value'] = (stats['count'] * stats['mean'] + smoothing * global_mean) / (stats['count'] + smoothing)
    df = df.join(stats['te_value'].rename('breeder_win_rate_te'), on=group_key) if venue_col in df.columns else df.join(stats['te_value'].rename('breeder_win_rate_te'), on=breeder_col)
    df['breeder_win_rate_te'] = df['breeder_win_rate_te'].fillna(global_mean)
    return df



def add_trainer_jockey_target_encoding(
    df: pd.DataFrame,
    trainer_col: str = 'trainer',
    jockey_col: str = '騎手',
    target_col: str = 'target',
    smoothing: float = 10.0
) -> pd.DataFrame:
    """
    調教師×騎手の勝負ラインの勝率を Target Encoding で連続値化する。
    出力カラム: 'trainer_jockey_win_rate_te'
    """
    if trainer_col not in df.columns or jockey_col not in df.columns or target_col not in df.columns:
        df['trainer_jockey_win_rate_te'] = 0.0
        return df

    global_mean = df[target_col].mean()
    group_key = [trainer_col, jockey_col]

    stats = df.groupby(group_key)[target_col].agg(['count', 'mean'])
    stats.columns = ['count', 'mean']
    stats['te_value'] = (
        (stats['count'] * stats['mean'] + smoothing * global_mean)
        / (stats['count'] + smoothing)
    )

    df = df.join(stats['te_value'].rename('trainer_jockey_win_rate_te'), on=group_key)
    df['trainer_jockey_win_rate_te'] = df['trainer_jockey_win_rate_te'].fillna(global_mean)
    
    return df

# =============================================================================
# 3. 標準化された特徴量リストの取得
# =============================================================================

# ベース特徴量（環境データ追加）
BASE_FEATURES = [
    '枠番', '馬番', '斤量', '単勝', '人気',
    '年齢', '性別', '馬体重_base', '馬体重_増減',
    'kinryo_weight_ratio', 'race_month',
    'cushion_value', 'moisture',
    'is_roberto_line', 'is_heavy_track_sire'
]

# 追加された前走・展開特徴量
PREV_RACE_FEATURES = [
    'prev_result',       # 前走着順
    'prev_last3f',       # 前走上がり3F
    'prev_last3f_rank',  # 前走上がり3F順位
    'prev_front3f',      # 前走前半ペース（未取得時は0.0）
    'prev_time_diff',    # 前走タイム差
    'prev_time_diff_norm', # 距離補正タイム差
    'prev_popularity',   # 前走人気
    'prev_distance',     # 前走距離
    'distance_change',   # 距離変化
    'surface_change',    # 馬場替わりフラグ（芝↔ダート=1）
    'interval_weeks',    # 出走間隔（週）
    'prev_top3_flag',    # 前走3着以内フラグ
    'is_jockey_changed', # 乗り替わりフラグ(1=乗替, 0=継続)
    'jockey_te_diff',    # 今走と前走の騎手TE勝率の差分
    'is_transfer',       # 転入初戦フラグ
    'class_drop_flag',   # 降級馬フラグ
    'class_up_flag',     # 昇級馬フラグ
    'first_corner_pos',  # 前走初角位置
    'prev_position_ratio', # 前走通過順位バイアス
    'makuri_flag',       # 前走マクリフラグ
    'prev_corner34_overtake', # 前走3-4角ごぼう抜き指数
    'weight_trend',      # 馬体重トレンド
    'heavy_track_aptitude', # 道悪適性
    'left_handed_aptitude', # 左回り適性
    'prev_pop_result_gap',  # 前走人気着順乖離
    'is_left_handed',       # 左回りフラグ
]

# Target Encoding特徴量
TARGET_ENCODING_FEATURES = [
    'jockey_win_rate_te',         # 騎手×場所 勝率
    'sire_win_rate_te',           # 種牡馬×場所 勝率
    'trainer_win_rate_te',        # 調教師×場所 勝率
    'bms_win_rate_te',            # 母父×場所 勝率
    'trainer_jockey_win_rate_te', # 調教師×騎手ライン 勝率
    'owner_win_rate_te',          # 馬主×場所 勝率
    'breeder_win_rate_te',        # 生産者×場所 勝率
]

# 全特徴量（合計37）
ALL_FEATURES = BASE_FEATURES + PREV_RACE_FEATURES + TARGET_ENCODING_FEATURES


def get_available_features(df: pd.DataFrame, desired_features: list) -> list:
    """
    df に実際に存在するカラムのみを返す（安全フィルター）。
    """
    available = [f for f in desired_features if f in df.columns]
    missing   = [f for f in desired_features if f not in df.columns]
    if missing:
        print(f"⚠️  以下の特徴量がデータフレームに存在しないため除外されます: {missing}")
    return available


# =============================================================================
# 4. 共通の前処理パイプライン
# =============================================================================

def preprocess_common(df: pd.DataFrame) -> pd.DataFrame:
    """
    全競馬場共通の前処理を行う:
    - 着順の数値化（除外・取消を排除）
    - 目的変数の生成（3着以内 = 1）
    - 性別のLabel Encoding
    - 馬体重の分解（base / 増減）
    - 数値カラムの型変換
    - 前走特徴量の追加
    - 騎手 Target Encoding の追加
    """

    # 着順のクレンジング
    df['着順'] = pd.to_numeric(df['着順'], errors='coerce')
    df = df.dropna(subset=['着順']).copy()

    # 目的変数
    df['target'] = (df['着順'] <= 3).astype(int)

    # 性齢分割
    if '性齢' in df.columns:
        df['性別'] = df['性齢'].str[0]
        df['年齢'] = pd.to_numeric(df['性齢'].str[1:], errors='coerce')

    # 馬体重の分解
    if '馬体重' in df.columns:
        df['馬体重_base'] = df['馬体重'].str.extract(r'^(\d+)').astype(float)
        df['馬体重_増減'] = df['馬体重'].str.extract(r'\(([-+]?\d+)\)').astype(float)

    # 数値カラムの型変換
    numeric_cols = ['枠番', '馬番', '斤量', '単勝', '人気', 'cushion_value', 'moisture']
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
            
    # ---- 環境データ等のフォールバック --------------------------
    if 'cushion_value' not in df.columns:
        df['cushion_value'] = 9.5
    else:
        df['cushion_value'] = df['cushion_value'].fillna(9.5)

    if 'moisture' not in df.columns:
        df['moisture'] = 10.0
    else:
        df['moisture'] = df['moisture'].fillna(10.0)

    # ---- 物理環境ファクターのフォールバック --------------------------
    if 'kinryo_weight_ratio' not in df.columns:
        # 斤量と馬体重カラムがあれば計算、なければ平均的な0.114
        if '斤量' in df.columns and '馬体重_base' in df.columns:
            df['kinryo_weight_ratio'] = df['斤量'] / df['馬体重_base'].replace(0, 480)
        else:
            df['kinryo_weight_ratio'] = 0.114
            
    if 'race_month' not in df.columns:
        df['race_month'] = 6.0
        
    if 'is_roberto_line' not in df.columns:
        df['is_roberto_line'] = 0.0
        
    if 'is_heavy_track_sire' not in df.columns:
        df['is_heavy_track_sire'] = 0.0

    # 性別の数値化
    if '性別' in df.columns:
        df['性別'] = df['性別'].map({'牡': 0, '牝': 1, 'セ': 2})

    # 前走特徴量の追加
    df = add_prev_race_features(df)

    # 乗り替わりフラグのフォールバック
    if 'is_jockey_changed' not in df.columns:
        df['is_jockey_changed'] = 0.0

    # Target Encoding の追加
    df = add_jockey_target_encoding(df)
    df = add_sire_target_encoding(df)
    df = add_trainer_target_encoding(df)
    df = add_bms_target_encoding(df)
    df = add_trainer_jockey_target_encoding(df)
    df = add_owner_target_encoding(df)
    df = add_breeder_target_encoding(df)

    # 追加フラグのフォールバック
    if 'surface_change' not in df.columns:
        df['surface_change'] = 0.0
    if 'prev_front3f' not in df.columns:
        df['prev_front3f'] = 0.0
    if 'weight_trend' not in df.columns:
        df['weight_trend'] = 0.0
    if 'prev_last3f_rank' not in df.columns:
        df['prev_last3f_rank'] = 0.0

    return df


# =============================================================================
# 5. Feature Importance の保存
# =============================================================================

def save_feature_importance(model, feature_names: list, venue_name: str) -> None:
    """
    学習済みモデルの Feature Importance をコンソール出力 & JSON保存する。
    """
    importances = model.feature_importance(importance_type='gain')
    fi_dict = dict(zip(feature_names, importances.tolist()))
    fi_sorted = dict(sorted(fi_dict.items(), key=lambda x: x[1], reverse=True))

    print(f"\n[FI] [{venue_name}] Feature Importance (gain):")
    for feat, score in fi_sorted.items():
        bar = '#' * min(int(score / max(fi_sorted.values()) * 30), 30)
        print(f"  {feat:<25} {bar} {score:.2f}")

    out_path = f"{venue_name}_feature_importance.json"
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(fi_sorted, f, ensure_ascii=False, indent=2)
    print(f"\n[OK] Feature Importance saved: {out_path}")


# =============================================================================
# 6. モデルの学習・保存（共通テンプレート）
# =============================================================================

def train_and_save_model(
    df: pd.DataFrame,
    features: list,
    venue_name: str,
    model_params: dict | None = None,
    num_boost_round: int = 300
):
    """
    共通の LightGBM 学習・保存テンプレート。
    各競馬場の train_*.py から呼び出す。
    """
    import lightgbm as lgb

    available_features = get_available_features(df, features)
    X = df[available_features]
    y = df['target']

    default_params = {
        'objective': 'binary',
        'metric': 'binary_logloss',
        'boosting_type': 'gbdt',
        'learning_rate': 0.05,
        'num_leaves': 63,          # 旧31から拡大（前走特徴量の複雑な相互作用を捉える）
        'max_depth': 8,
        'min_child_samples': 20,   # 過学習防止
        'feature_fraction': 0.8,
        'bagging_fraction': 0.8,
        'bagging_freq': 5,
        'verbose': -1
    }
    if model_params:
        default_params.update(model_params)

    train_data = lgb.Dataset(X, label=y, categorical_feature=['性別'])

    print(f"\n[START] [{venue_name}] total={len(df)} rows / features={len(available_features)} ...")
    model = lgb.train(
        default_params,
        train_data,
        num_boost_round=num_boost_round,
        callbacks=[lgb.log_evaluation(period=50)]
    )
    print(f"[DONE] [{venue_name}] training complete")

    model_path = f"{venue_name}_ensemble_model.txt"
    model.save_model(model_path)
    print(f"[SAVE] model saved: {model_path}")

    save_feature_importance(model, available_features, venue_name)

    return model


# =============================================================================
# 7. テキストデータ由来 DataFrame の前処理
#    build_training_data.py が出力する DataFrame をそのまま学習に使う
# =============================================================================

# テキストパーサー出力のカラム名 -> 学習用カラム名 のマッピング
_TEXT_COL_MAP = {
    '枠番':              '枠番',
    '馬番':              '馬番',
    '斤量':              '斤量',
    '単勝':              '単勝',
    '人気':              '人気',
    '年齢':              '年齢',
    '性別':              '性別',
    '馬体重_base':       '馬体重_base',
    '馬体重_増減':       '馬体重_増減',
    'cushion_value':     'cushion_value',
    'moisture':          'moisture',
    'prev_result':       'prev_result',
    'prev_last3f':       'prev_last3f',
    'prev_time_diff':    'prev_time_diff',
    'prev_popularity':   'prev_popularity',
    'prev_distance':     'prev_distance',
    'distance_change':   'distance_change',
    'interval_weeks':    'interval_weeks',
    'prev_top3_flag':    'prev_top3_flag',
    'is_jockey_changed': 'is_jockey_changed',
    'jockey_te_diff':    'jockey_te_diff',
}


def preprocess_from_text_df(df: pd.DataFrame) -> pd.DataFrame:
    """
    build_training_data.py が生成した DataFrame を学習用に前処理する。

    - target カラムはすでに存在する前提（0/1）
    - 騎手 Target Encoding を追加
    - NaN を 0 で埋める
    """
    df = df.copy()

    # ---- target の確認・作成 ----
    if 'target' not in df.columns:
        if 'result' in df.columns:
            df['target'] = (pd.to_numeric(df['result'], errors='coerce') <= 3).astype(int)
        else:
            raise ValueError("target / result カラムが DataFrame に存在しません。")

    # ---- 騎手カラムの存在確認 (venue -> 場所 へのエイリアス) ----
    if 'jockey' in df.columns and '騎手' not in df.columns:
        df['騎手'] = df['jockey']
    if 'venue' in df.columns and '場所' not in df.columns:
        df['場所'] = df['venue']

    # ---- 数値カラムの型変換 ----
    numeric_cols = [
        '枠番', '馬番', '斤量', '単勝', '人気', '年齢', '性別',
        '馬体重_base', '馬体重_増減', 'cushion_value', 'moisture',
        'prev_result', 'prev_last3f', 'prev_time_diff', 'prev_popularity',
        'prev_distance', 'distance_change', 'interval_weeks', 'prev_top3_flag',
        'is_jockey_changed'
    ]
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

    # ---- Target Encoding ----
    df = add_jockey_target_encoding(df, jockey_col='騎手', venue_col='場所')
    df = add_sire_target_encoding(df, sire_col='sire', venue_col='場所')
    df = add_trainer_target_encoding(df, trainer_col='trainer', venue_col='場所')
    df = add_bms_target_encoding(df, bms_col='bms', venue_col='場所')
    df = add_trainer_jockey_target_encoding(df, trainer_col='trainer', jockey_col='騎手')
    df = add_owner_target_encoding(df, owner_col='owner', venue_col='場所')
    df = add_breeder_target_encoding(df, breeder_col='breeder', venue_col='場所')

    # ---- 新規特徴量のフォールバック ----
    if 'surface_change' not in df.columns:
        df['surface_change'] = 0.0
    if 'prev_front3f' not in df.columns:
        df['prev_front3f'] = 0.0
    if 'weight_trend' not in df.columns:
        df['weight_trend'] = 0.0
    if 'prev_last3f_rank' not in df.columns:
        df['prev_last3f_rank'] = 0.0

    return df


def load_training_df_from_text_dir(
    text_dir: str,
    venue_filter: str = None,
    mode: str = 'auto',
) -> pd.DataFrame:
    """
    テキストディレクトリを直接指定して学習用 DataFrame を生成・前処理する。
    build_training_data + preprocess_from_text_df を一発で呼び出すショートカット。
    """
    # ローカルインポート（循環参照を避けるため）
    from build_training_data import build_df_from_dir

    df_raw = build_df_from_dir(text_dir, venue_filter=venue_filter, mode=mode)
    if df_raw.empty:
        return df_raw

    df = preprocess_from_text_df(df_raw)
    return df


# =============================================================================
# （以下 元のコメント）

if __name__ == "__main__":
    import numpy as np
    print("=== train_utils.py 単体テスト ===\n")

    n = 10
    # ダミーデータでテスト
    dummy = pd.DataFrame({
        '着順':      [1, 2, 3, 4, 5, 6, 1, 2, 3, 10],
        '枠番':      [1, 2, 3, 4, 5, 6, 7, 8, 1, 2],
        '馬番':      [1, 3, 5, 7, 9, 11, 2, 4, 6, 8],
        '斤量':      [57, 56, 55, 57, 56, 55, 58, 57, 56, 55],
        '単勝':      [3.5, 5.0, 8.0, 12.0, 20.0, 30.0, 2.0, 4.0, 6.0, 100.0],
        '人気':      [1, 2, 3, 4, 5, 6, 1, 2, 3, 10],
        '性齢':      ['牡4', '牝3', 'セ5', '牡4', '牝3', '牡6', '牡4', '牝3', 'セ5', '牡7'],
        '馬体重':    ['480(+2)', '450(-4)', '500(0)', '490(+6)', '440(-2)', '510(+4)', '480(0)', '460(+2)', '500(-2)', '520(+10)'],
        '騎手':      ['川田', 'ルメール', '武豊', '川田', 'ルメール', '武豊', '川田', 'ルメール', '武豊', '松山'],
        '場所':      ['東京'] * 10,
        '前走着順':  ['1', '3', '2', '5', '1', '4', '2', '6', '3', '8'],
        '前走上がり3F': ['33.5', '34.0', '33.8', '35.1', '33.9', '36.0', '33.2', '34.5', '33.7', '37.0'],
        '前走タイム差': ['0', '0.3', '0.1', '0.8', '0', '0.5', '0.2', '1.2', '0.4', '2.1'],
        '前走人気':  ['1', '2', '3', '5', '1', '4', '2', '6', '3', '8'],
        '前走距離':  ['1600', '1600', '1800', '2000', '1400', '2400', '1600', '2000', '1600', '2200'],
        '距離':      ['1600'] * 10,
        'sire':      ['ロードカナロア', 'ディープインパクト', 'キズナ', 'ロードカナロア', 'モーリス', 'キズナ', 'ロードカナロア', 'ディープインパクト', 'モーリス', 'キズナ'],
        'trainer':   ['中内田', '木村', '矢作', '中内田', '木村', '矢作', '中内田', '木村', '矢作', '友道'],
        'prev_jockey': ['川田', 'ルメール', '武豊', 'ルメール', '武豊', '川田', '川田', '武豊', 'ルメール', '松山'],
        'is_jockey_changed': [0, 0, 0, 1, 1, 1, 0, 1, 1, 0],
    })

    processed = preprocess_common(dummy)
    available = get_available_features(processed, ALL_FEATURES)

    print(f"[OK] preprocessing done: {len(processed)} rows x {len(processed.columns)} cols")
    print(f"[OK] valid features: {len(available)}")
    print(f"   -> {available}")
    print(f"\n[SAMPLE] prev race features:")
    print(processed[['prev_result', 'prev_last3f', 'prev_time_diff', 'prev_popularity', 'distance_change', 'jockey_win_rate_te']].head())
    print("\n[OK] All tests passed")
