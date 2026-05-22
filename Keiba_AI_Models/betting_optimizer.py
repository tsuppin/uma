
import numpy as np

class BettingOptimizer:
    def __init__(self, ev_threshold=1.5, core_prob_threshold=0.3):
        # ev_threshold: 期待値(EV)がこの値以上の馬を「穴馬（バリュー馬）」として扱う
        # core_prob_threshold: モデルの予測勝率がこの値以上の馬を「絶対的な軸馬」として扱う
        self.ev_threshold = ev_threshold
        self.core_prob_threshold = core_prob_threshold
        
    def calculate_ev(self, predictions, odds_data):
        '''モデルの勝率とオッズから期待値(EV)を計算'''
        for p in predictions:
            horse_num = p['num']
            win_odds = odds_data.get(horse_num, 0)
            p['ev'] = p['win_prob'] * win_odds
        return predictions
        
    def find_cutoff_index(self, predictions):
        '''スコアの断層（急激な確率低下）を見つけ、買い目の対象頭数を絞る'''
        sorted_preds = sorted(predictions, key=lambda x: x['win_prob'], reverse=True)
        if len(sorted_preds) < 2: return len(sorted_preds)
        
        max_drop = 0
        cutoff = len(sorted_preds)
        for i in range(1, len(sorted_preds)):
            drop = sorted_preds[i-1]['win_prob'] - sorted_preds[i]['win_prob']
            # 例: 予測確率が10%以上急落するポイントを「断層」とする
            if drop > 0.10 and drop > max_drop:
                max_drop = drop
                cutoff = i
        
        # 最低でも上位4頭は馬券対象に残す、最大でも8頭まで等の安全策
        return max(4, min(cutoff, 8))
        
    def generate_3renpuku_formation(self, predictions, odds_data):
        '''3連複フォーメーションの買い目を自動構築'''
        preds_with_ev = self.calculate_ev(predictions, odds_data)
        cutoff = self.find_cutoff_index(preds_with_ev)
        
        # 断層より上の馬（購入対象）
        target_horses = sorted(preds_with_ev, key=lambda x: x['win_prob'], reverse=True)[:cutoff]
        
        # 役割の分類
        core_horses = [h for h in target_horses if h['win_prob'] >= self.core_prob_threshold]
        value_horses = [h for h in target_horses if h['ev'] >= self.ev_threshold]
        solid_horses = target_horses # 3列目は対象馬すべて
        
        # ※軸馬が不在の場合のフェイルセーフ（一番勝率の高い馬を暫定軸にする）
        if not core_horses and target_horses:
            core_horses = [target_horses[0]]
            
        # ※バリュー馬が不在の場合のフェイルセーフ（期待値トップを暫定バリューにする）
        if not value_horses and target_horses:
            value_horses = sorted(target_horses, key=lambda x: x['ev'], reverse=True)[:1]
            
        tickets = []
        # フォーメーションの組み合わせ生成 (軸 - 穴 - 相手)
        for core in core_horses:
            for value in value_horses:
                for solid in solid_horses:
                    # 3頭すべてが異なる馬番の場合のみ買い目に追加
                    nums = tuple(sorted([core['num'], value['num'], solid['num']]))
                    if len(set(nums)) == 3:
                        tickets.append(nums)
                        
        return list(set(tickets)) # 重複買い目の排除
