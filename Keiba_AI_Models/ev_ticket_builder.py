
import pandas as pd
import numpy as np

def calculate_true_ev(result_df, odds_dict=None):
    '''
    AIの予測スコア(Darkness等)を疑似勝率に変換し、実際のオッズと掛け合わせて
    純粋な統計的期待値(EV)を算出する後処理アルゴリズム。
    '''
    df = result_df.copy()
    
    # スコアをSoftmax関数的に疑似確率(0.0〜1.0)へ変換
    scores = df['darkness'].values
    exp_scores = np.exp(scores - np.max(scores))
    df['win_prob'] = exp_scores / exp_scores.sum()
    
    # オッズデータが提供されている場合はTrue EVを計算、ない場合は人気から疑似オッズを生成
    if odds_dict:
        df['actual_odds'] = df['num'].map(odds_dict).fillna(10.0)
    else:
        df['actual_odds'] = df['pop'] * 1.5 + 2.0 # オッズ未提供時のフォールバック近似値
        
    # 統計的期待値 (EV) = 予測勝率 × オッズ
    df['expected_value'] = df['win_prob'] * df['actual_odds']
    
    # EVと基礎スコアをブレンドして最終ランクを決定 (過度な穴狙いを防ぐため)
    df['final_rank_score'] = (df['darkness'] * 0.6) + (df['expected_value'] * 0.4)
    
    return df.sort_values('final_rank_score', ascending=False)

def generate_formations(ranked_nums):
    '''
    指定された点数（三連単2-4-6、三連複3-3-7）を維持して買い目を構築
    '''
    st_1 = ranked_nums[:2]
    st_2 = ranked_nums[:4]
    st_3 = ranked_nums[:6]
    
    sf_1 = ranked_nums[:3]
    sf_2 = ranked_nums[:3]
    sf_3 = ranked_nums[:7]
    
    return {
        'sanrentan': {'1st': st_1, '2nd': st_2, '3rd': st_3},
        'sanrenpuku': {'1st': sf_1, '2nd': sf_2, '3rd': sf_3}
    }
