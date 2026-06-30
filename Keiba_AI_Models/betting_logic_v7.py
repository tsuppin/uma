import numpy as np
import pandas as pd
import itertools

class AdvancedBettingLogic:
    def __init__(self, total_budget=10000, race_distance=1400):
        self.total_budget = total_budget
        self.race_distance = race_distance
        
        # 距離に応じたケリー基準のフラクション（割引係数）
        # 短距離(波乱含み)はクォーター(0.25)、中長距離はハーフ(0.5)など
        self.kelly_fraction = 0.25 if race_distance < 1600 else 0.5

    def calculate_kelly_fraction(self, win_prob, odds):
        '''フラクショナル・ケリー基準による資金配分率の計算'''
        b = odds - 1.0
        if b <= 0:
            return 0.0
        q = 1.0 - win_prob
        kelly = (b * win_prob - q) / b
        
        if kelly <= 0:
            return 0.0
        return kelly * self.kelly_fraction

    def generate_tickets(self, df_preds):
        '''
        df_preds: DataFrame containing ['horse_num', 'win_prob', 'odds']
        '''
        df = df_preds.copy()
        
        # 期待値(EV)の計算
        df['ev'] = df['win_prob'] * df['odds']
        
        # --- 1. 評価軸の2極化（軸馬とヒモ穴の選定） ---
        # 軸馬（安定感重視）：勝率(予測確率)トップ2頭
        jiku_df = df.nlargest(2, 'win_prob')
        jiku_horses = jiku_df['horse_num'].tolist()
        
        # ヒモ穴（爆発力重視）：軸馬以外で、期待値(EV)が1.0以上の馬上位5頭
        himo_df = df[~df['horse_num'].isin(jiku_horses)]
        himo_df = himo_df[himo_df['ev'] >= 0.8].nlargest(5, 'ev') # 穴狙いのためEV閾値を少し緩和
        himo_horses = himo_df['horse_num'].tolist()
        
        if not jiku_horses or not himo_horses:
            return {"status": "error", "message": "軸馬またはヒモ穴の条件を満たす馬がいません。ケン（見送り）を推奨します。"}

        # --- 2. フォーメーションの自動生成 ---
        tickets = []
        
        # 1. 単勝（本命・確勝狙いロジック）- 的中率特化
        # 予測勝率が極めて高い馬（例：勝率40%以上）を対象とする
        for _, row in df.iterrows():
            if row['win_prob'] >= 0.40:
                tickets.append({
                    'type': '単勝(本命)',
                    'combination': (row['horse_num'],),
                    'score': row['win_prob'] * 2.0  # スコアを底上げして優先度を高くする
                })
                
        # 2. 単勝（バリュー・期待値狙いロジック）- 回収率特化
        # 勝率自体は中程度（10%以上）だが、期待値(EV)が1.2以上ある美味しいオッズの馬を対象とする
        for _, row in df.iterrows():
            if 0.10 <= row['win_prob'] < 0.40 and row['ev'] >= 1.2:
                tickets.append({
                    'type': '単勝(穴狙い)',
                    'combination': (row['horse_num'],),
                    'score': row['ev'] * 1.5
                })
        
        # ワイド流し（軸馬からヒモ穴へ）
        for jiku in jiku_horses:
            for himo in himo_horses:
                comb = tuple(sorted([jiku, himo]))
                
                # 仮想的な合成確率とオッズ（実際はワイドオッズを取得すべきですが、簡易的に計算）
                jiku_prob = jiku_df[jiku_df['horse_num'] == jiku]['win_prob'].values[0]
                himo_ev = himo_df[himo_df['horse_num'] == himo]['ev'].values[0]
                
                # 組合わせのスコア
                comb_score = jiku_prob * himo_ev 
                
                tickets.append({
                    'type': 'ワイド',
                    'combination': comb,
                    'score': comb_score
                })
        
        # 馬連流し（連対重視：軸馬から、勝率が一定以上のヒモへ流す）
        # 馬連は2着以内が必要なため、単なるEVだけでなく最低限の勝率を要求する
        umaren_himo_df = df[~df['horse_num'].isin(jiku_horses)]
        # EVが0.9以上、かつ勝率が上位の馬を抽出（ワイドより厳しめ）
        umaren_himo_df = umaren_himo_df[(umaren_himo_df['ev'] >= 0.9) & (umaren_himo_df['win_prob'] >= 0.05)].nlargest(4, 'win_prob')
        umaren_himo_horses = umaren_himo_df['horse_num'].tolist()
        
        for jiku in jiku_horses:
            for himo in umaren_himo_horses:
                comb = tuple(sorted([jiku, himo]))
                
                jiku_prob = jiku_df[jiku_df['horse_num'] == jiku]['win_prob'].values[0]
                himo_prob = umaren_himo_df[umaren_himo_df['horse_num'] == himo]['win_prob'].values[0]
                
                # 馬連用のスコア（連対確率の掛け合わせを意識）
                comb_score = jiku_prob * himo_prob * 1.5 
                
                tickets.append({
                    'type': '馬連',
                    'combination': comb,
                    'score': comb_score
                })
        
        # 3連複フォーメーション（軸1頭 - 軸+ヒモ - ヒモ）
        for jiku in jiku_horses:
            # 2頭目はもう1頭の軸馬、またはヒモ上位2頭
            second_horses = [h for h in jiku_horses if h != jiku] + himo_horses[:2]
            # 3頭目はヒモ穴全頭
            third_horses = himo_horses
            
            for h2 in set(second_horses):
                for h3 in third_horses:
                    if len(set([jiku, h2, h3])) == 3: # 3頭すべて異なる場合
                        comb = tuple(sorted([jiku, h2, h3]))
                        
                        tickets.append({
                            'type': '3連複',
                            'combination': comb,
                            'score': 1.0 # ここは実際の3連複オッズ取得後に再計算を推奨
                        })

        # 3連単フォーメーション（1着:軸馬 -> 2着:軸+上位ヒモ -> 3着:全ヒモ）
        # 買い目点数が増えすぎるのを防ぐため、ある程度絞ったフォーメーション
        for h1 in jiku_horses:
            # 2着候補（もう1頭の軸馬、またはヒモ上位2頭）
            second_horses = [h for h in jiku_horses if h != h1] + himo_horses[:2]
            # 3着候補（2着候補 + 残りのヒモ穴）
            third_horses = second_horses + himo_horses[2:]
            
            for h2 in set(second_horses):
                if h1 == h2: continue
                for h3 in set(third_horses):
                    if h1 == h3 or h2 == h3: continue
                    
                    comb = (h1, h2, h3) # 3連単は着順が意味を持つのでソートしない
                    
                    # 簡易的なスコア（1着馬の勝率 × 2着馬の勝率 × 3着馬のEV）
                    h1_prob = jiku_df[jiku_df['horse_num'] == h1]['win_prob'].values[0]
                    h2_val = df[df['horse_num'] == h2]['win_prob'].values[0]
                    h3_val = df[df['horse_num'] == h3]['ev'].values[0]
                    
                    comb_score = h1_prob * h2_val * h3_val * 0.5 # 3連単は難易度が高いのでスコアを補正
                    
                    tickets.append({
                        'type': '3連単',
                        'combination': comb,
                        'score': comb_score
                    })

        # --- 3. 重複排除と足切りフィルター ---
        unique_tickets = []
        seen = set()
        for t in tickets:
            ticket_id = f"{t['type']}_{t['combination']}"
            if ticket_id not in seen:
                seen.add(ticket_id)
                unique_tickets.append(t)
                
        # ※ここにトリガミ防止フィルター（合成オッズ < 1.0 を除外）などを追加可能
        
        return {
            "status": "success",
            "jiku_horses": jiku_horses,
            "himo_horses": himo_horses,
            "recommended_tickets": unique_tickets
        }