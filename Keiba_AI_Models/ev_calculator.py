
import numpy as np

def calculate_true_ev(ai_win_prob, odds_array, min_ai_prob=0.04):
    '''
    オッズのノイズによる過大評価を排除した真の期待値（エッジ）算出関数
    
    Parameters:
    ai_win_prob (array-like): AIが算出した勝率
    odds_array (array-like): 実際の単勝オッズ
    min_ai_prob (float): ボトムフィルターの閾値（デフォルト4%未満は除外）
    
    Returns:
    np.ndarray: 修正された期待値（エッジ）スコア
    '''
    ai_win_prob = np.array(ai_win_prob)
    odds_array = np.array(odds_array)

    # 大衆予測確率（控除率を加味）
    public_win_prob = 0.8 / odds_array
    
    # 1. 差分（エッジ）の算出：割り算（比率）によるオッズ依存の跳ね上がりを防ぐ
    edge_score = ai_win_prob - public_win_prob
    
    # 2. ボトムフィルター：AI勝率が著しく低い馬は強制的に除外（大穴ノイズ対策）
    edge_score = np.where(ai_win_prob < min_ai_prob, -999.0, edge_score)
    
    return edge_score
