# =============================================================================
# ml/train_chukyo.py  （前走特徴量対応版）
# =============================================================================

import pandas as pd
import numpy as np
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from train_utils import preprocess_common, ALL_FEATURES, train_and_save_model

VENUE_NAME = 'chukyo'

file_list = [
    "chukyo_2022_full.csv",
    "chukyo_2023_full.csv",
    "chukyo_2024_full.csv",
    "chukyo_2025_full.csv",
]

df_list = []
for file in file_list:
    if os.path.exists(file):
        df_temp = pd.read_csv(file)
        df_list.append(df_temp)
        print(f"✅ {file}: {len(df_temp)} 行")
    else:
        print(f"⚠️  {file}: 見つかりません")

if not df_list:
    print("❌ データが見つかりません。")
else:
    df = pd.concat(df_list, ignore_index=True)
    df = preprocess_common(df)

    # 中京専用追加特徴量: シリカ砂50%のタフなダートに特化
    # （ダートフラグを特徴量化）
    if '芝ダ' in df.columns:
        df['is_dirt'] = (df['芝ダ'] == 'ダ').astype(int)
    elif '距離' in df.columns:
        df['is_dirt'] = 0  # デフォルト0（芝想定）

    features = ALL_FEATURES + ['is_dirt'] if 'is_dirt' in df.columns else ALL_FEATURES

    train_and_save_model(
        df=df,
        features=features,
        venue_name=VENUE_NAME,
        model_params={"num_leaves": 63, "learning_rate": 0.05},
        num_boost_round=300
    )
