# =============================================================================
# ml/train_hakodate.py  （前走特徴量対応版）
# =============================================================================

import pandas as pd
import numpy as np
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from train_utils import preprocess_common, ALL_FEATURES, train_and_save_model

VENUE_NAME = 'hakodate'

file_list = [
    "hakodate_2022_full.csv",
    "hakodate_2023_full.csv",
    "hakodate_2024_full.csv",
    "hakodate_2025_full.csv",
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

    # 函館特化：上がり3ハロン関連の特徴量を学習から完全に除外する
    hakodate_features = [
        f for f in ALL_FEATURES 
        if f not in ('prev_last3f', 'prev_last3f_rank')
    ]

    # 函館特化：コーナー通過順位に対する単調性制約（小さい＝前方にいるほど高評価）
    # prev_corner4_within_5 は大きい（True=1.0）ほど高評価
    from train_utils import get_available_features
    available_features = get_available_features(df, hakodate_features)

    monotone_constraints = []
    for feat in available_features:
        if feat in ('prev_corner1_pos', 'prev_corner2_pos', 'prev_corner4_pos', 'frame_1_trap_penalty'):
            monotone_constraints.append(-1)
        elif feat in (
            'prev_corner4_within_5', 
            'frame_5_win_boost', 'outer_frame_advantage',
            'is_yokoyama_kazuo', 'is_ozawa_daijin', 
            'is_apprentice_jockey', 'apprentice_light_female', 
            'jockey_change_to_special'
        ):
            monotone_constraints.append(1)
        else:
            monotone_constraints.append(0)

    mc_str = "(" + ",".join(map(str, monotone_constraints)) + ")"

    model_params = {
        "num_leaves": 31, 
        "learning_rate": 0.05,
        "monotone_constraints": mc_str
    }

    train_and_save_model(
        df=df,
        features=available_features,
        venue_name=VENUE_NAME,
        model_params=model_params,
        num_boost_round=300
    )
