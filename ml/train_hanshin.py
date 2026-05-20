# =============================================================================
# ml/train_hanshin.py  （前走特徴量対応版）
# 阪神: G1多数・データ量豊富 → num_leaves=63
# =============================================================================

import pandas as pd
import numpy as np
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from train_utils import preprocess_common, ALL_FEATURES, train_and_save_model

VENUE_NAME = 'hanshin'

file_list = [
    "hanshin_2022_full.csv",
    "hanshin_2023_full.csv",
    "hanshin_2024_full.csv",
    "hanshin_2025_full.csv",
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
    train_and_save_model(
        df=df,
        features=ALL_FEATURES,
        venue_name=VENUE_NAME,
        model_params={"num_leaves": 63, "learning_rate": 0.04},
        num_boost_round=300
    )
