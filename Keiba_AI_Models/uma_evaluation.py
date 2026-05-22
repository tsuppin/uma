import pandas as pd
import numpy as np

def calculate_smart_expected_value(df, prob_col='Potential', odds_col='odds', top_n=5):
    """
    過度な穴馬狙いを抑制し、現実的な期待値を算出する新ロジック
    """
    df = df.copy()

    # 1. 確率の平滑化（アンサンブルモデルの極端な自信過剰を補正）
    # 0〜1の範囲を維持しつつ、極端な低確率をマイルドに持ち上げ、高確率をわずかに抑える
    df['Adjusted_Prob'] = np.power(df[prob_col], 0.7)

    # 2. 基礎評価（AI予測確率）による足切り
    if 'race_id' in df.columns:
        df['Rank_in_Race'] = df.groupby('race_id')['Adjusted_Prob'].rank(ascending=False, method='min')
    else:
        df['Rank_in_Race'] = df['Adjusted_Prob'].rank(ascending=False, method='min')

    # 3. 新しい評価指標の算出（オッズの0.15乗を廃止し、期待値へ移行）
    # 上位N頭のみ「補正勝率 × オッズ」を計算し、それ以外は0（ノイズ排除）
    df['Smart_Score'] = np.where(
        df['Rank_in_Race'] <= top_n,
        df['Adjusted_Prob'] * df[odds_col],
        0.0 
    )

    return df.sort_values(by='Smart_Score', ascending=False)
