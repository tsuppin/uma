# =============================================================================
# ml/train_tokyo.py  （テキストデータ対応版）
#
# 東京競馬場専用 LightGBM モデル学習スクリプト
#
# ■ データの指定方法（2通り）
#   方法A: テキストディレクトリを指定（推奨）
#     DATA_SOURCE = 'text'
#     TEXT_DIR    = 'data/tokyo/'  ← .txt ファイルを格納するディレクトリ
#
#   方法B: CSVファイルを指定（後方互換）
#     DATA_SOURCE = 'csv'
#     （tokyo_2022_full.csv ～ tokyo_2025_full.csv を ml/ に配置）
#
# ■ 東京競馬場の特性
#   - 直線 525.9m（JRA内2位）→ 上がり3F が勝敗に直結
#   - 左回り → 中枠の期待値が高い（芝2000mなど）
#   - 開催数 JRA 最多 → データ量が多く精度向上が期待できる
# =============================================================================

import pandas as pd
import numpy as np
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from train_utils import (
    preprocess_common,
    preprocess_from_text_df,
    load_training_df_from_text_dir,
    ALL_FEATURES,
    get_available_features,
    train_and_save_model,
)

# =============================================================================
# 設定
# =============================================================================

VENUE_NAME  = 'tokyo'

# ---------- データソースを選択 ----------
DATA_SOURCE = 'text'        # 'text' または 'csv'
TEXT_DIR    = 'data/tokyo'  # テキストファイルのディレクトリ
VENUE_FILTER = '東京'        # テキストから東京のデータだけ抽出

CSV_FILES = [
    "tokyo_2022_full.csv",
    "tokyo_2023_full.csv",
    "tokyo_2024_full.csv",
    "tokyo_2025_full.csv",
]
# ----------------------------------------

# =============================================================================
# 1. データ読み込み
# =============================================================================

if DATA_SOURCE == 'text':
    # ---- テキストディレクトリから読み込み ----
    print(f"\n[DATA] テキストディレクトリ: {os.path.abspath(TEXT_DIR)}")
    df = load_training_df_from_text_dir(TEXT_DIR, venue_filter=VENUE_FILTER)

    if df.empty:
        print(f"\n[HINT] '{TEXT_DIR}' ディレクトリに東京の出馬表・成績テキスト (.txt) を配置してください。")
        print("       例: data/tokyo/20250518_tokyo_11R.txt")
        sys.exit(1)

else:
    # ---- CSV から読み込み（後方互換）----
    print(f"\n[DATA] CSVモード")
    df_list = []
    for file in CSV_FILES:
        if os.path.exists(file):
            df_temp = pd.read_csv(file)
            df_list.append(df_temp)
            print(f"  [OK] {file}: {len(df_temp)} 行")
        else:
            print(f"  [SKIP] {file}: 見つかりません")

    if not df_list:
        print("[ERROR] データが見つかりません。")
        sys.exit(1)

    df = pd.concat(df_list, ignore_index=True)
    df = preprocess_common(df)

print(f"\n[INFO] 統合データ: {len(df)} 行 / 列数: {len(df.columns)}")

# =============================================================================
# 2. 東京競馬場専用の追加特徴量
#    直線が長いため「上がり3F × 距離カテゴリ」の交互作用が重要
# =============================================================================

# 距離カテゴリ: 2000m以上=スタミナ勝負(1) / 未満=瞬発力勝負(0)
if '距離' in df.columns:
    dist_numeric = pd.to_numeric(df['距離'], errors='coerce').fillna(1600)
    df['dist_category'] = (dist_numeric >= 2000).astype(int)
else:
    df['dist_category'] = 0

# 前走上がり3F × 距離カテゴリの交互作用
# （長距離で速い上がりを出した馬を高く評価）
df['last3f_x_dist'] = df.get('prev_last3f', pd.Series(0.0, index=df.index)) * (1 + df['dist_category'] * 0.3)

# 東京特有: 中枠（4〜6番枠）補正フラグ
# 芝2000mは内枠が「包まれるリスク」を持つため中枠の期待値が高い
if '枠番' in df.columns:
    df['middle_frame_flag'] = df['枠番'].between(4, 6).astype(int)
else:
    df['middle_frame_flag'] = 0

# 最終特徴量リスト
TOKYO_EXTRA_FEATURES = ['dist_category', 'last3f_x_dist', 'middle_frame_flag']
TOKYO_FEATURES = ALL_FEATURES + TOKYO_EXTRA_FEATURES

# =============================================================================
# 3. モデルパラメータ（東京専用チューニング）
# =============================================================================

TOKYO_PARAMS = {
    'objective':         'binary',
    'metric':            'binary_logloss',
    'boosting_type':     'gbdt',
    'learning_rate':     0.03,    # データ量が多いので低めのLRで細かく
    'num_leaves':        63,      # 末脚×距離の複雑な交互作用を捉える
    'max_depth':         8,
    'min_child_samples': 20,
    'feature_fraction':  0.8,
    'bagging_fraction':  0.8,
    'bagging_freq':      5,
    'verbose':           -1,
}

# =============================================================================
# 4. 学習 & モデル保存
# =============================================================================

model = train_and_save_model(
    df=df,
    features=TOKYO_FEATURES,
    venue_name=VENUE_NAME,
    model_params=TOKYO_PARAMS,
    num_boost_round=500,
)

print(f"\n[DONE] 東京競馬場モデルの学習・保存が完了しました。")
print(f"  モデル: {VENUE_NAME}_ensemble_model.txt")
print(f"  FI:     {VENUE_NAME}_feature_importance.json")
