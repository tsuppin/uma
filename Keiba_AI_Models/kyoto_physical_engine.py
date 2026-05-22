import numpy as np
import joblib
import os

def calculate_kyoto_physical_score(row, race_num=1, trainer_wins_today=0, model_dir='/content/drive/MyDrive/Keiba_AI_Models/'):
    score = 50.0

    # ベースパワー評価 (運動方程式ベース)
    weight = float(row.get('馬体重', 480))
    weight_change = float(row.get('増減', 0.0))
    weight_ratio = weight / float(row.get('斤量', 55.0))
    score += (weight_ratio - (480 / 55.0)) * 2.5

    try:
        knowledge_path = os.path.join(model_dir, 'kyoto_knowledge_base.pkl')
        if not os.path.exists(knowledge_path):
            return score

        knowledge = joblib.load(knowledge_path)

        # 特徴量抽出
        pop = int(row.get('人気', 10))
        frame_num = int(row.get('枠', 4))
        has_blinker = row.get('ブリンカー', 0) == 1 or 'B' in str(row.get('馬具', ''))
        jockey = str(row.get('騎手', ''))
        trainer = str(row.get('調教師', ''))
        affiliation = str(row.get('所属', ''))
        
        front_runner_score = float(row.get('先行力', 0.0))
        closer_score = float(row.get('上がりポテンシャル', 0.0))
        odds_deviation = float(row.get('オッズ偏差値', 50.0)) # 出馬表前処理フェーズでの算出値を想定

        # --- 新規：オッズ偏差値 × クラスの交差バイアス適用 ---
        if 'kyoto_odds_dynamics' in knowledge:
            kd_odds = knowledge['kyoto_odds_dynamics']
            
            if race_num <= kd_odds['early_race_max_r']:
                # 前半：過剰人気ペナルティと過小評価大穴の拾い上げ
                if pop == 1:
                    score += kd_odds['early_fav_penalty']
                if odds_deviation >= kd_odds['high_odds_dev_threshold']:
                    score += kd_odds['early_longshot_odds_bonus']
            
            elif race_num >= kd_odds['late_race_min_r']:
                # 後半：オッズ収束に伴う1番人気の信頼度評価
                if pop == 1:
                    score += kd_odds['late_fav_bonus']

        # --- 過去の京都バイアス（枠順・馬個体・陣営・騎手）適用 ---
        if 'kyoto_frame_dynamics' in knowledge:
            kd_frame = knowledge['kyoto_frame_dynamics']
            if frame_num == 6: score += kd_frame['frame_6_sweet_spot_bonus']
            elif frame_num in [1, 2, 3] and front_runner_score > 50.0: score += kd_frame['inner_front_runner_synergy']
            elif frame_num in [7, 8] and pop >= kd_frame['outer_frame_pop_threshold']: score += kd_frame['outer_frame_upset_bonus']

        if 'kyoto_horse_dynamics' in knowledge:
            kd_horse = knowledge['kyoto_horse_dynamics']
            if abs(weight_change) >= kd_horse['extreme_weight_change_min']: score += kd_horse['extreme_weight_change_bonus']
            if has_blinker: score += kd_horse['blinker_bonus']

        if 'kyoto_jockey_dynamics' in knowledge:
            kd_jockey = knowledge['kyoto_jockey_dynamics']
            if any(j in jockey for j in kd_jockey['tier1_hot_jockeys']):
                score += kd_jockey['tier1_base_bonus']
                if "松山" in jockey and race_num >= 6: score += kd_jockey['tier1_late_race_matsuyama_bonus']
            elif any(j in jockey for j in kd_jockey['tier2_solid_jockeys']): score += kd_jockey['tier2_bonus']
            elif any(j in jockey for j in kd_jockey['upset_jockeys']) and pop >= kd_jockey['upset_pop_threshold']:
                score += kd_jockey['upset_jockey_bonus']

        if 'kyoto_trainer_dynamics' in knowledge:
            kd_trainer = knowledge['kyoto_trainer_dynamics']
            if '栗東' in affiliation or '西' in trainer: score += kd_trainer['ritto_base_bonus']
            elif '美浦' in affiliation or '東' in trainer: score += kd_trainer['miho_base_penalty']
            if trainer_wins_today >= 1: score += kd_trainer['same_day_win_penalty']
            if any(t in trainer for t in kd_trainer['hot_trainers_top3']): score += kd_trainer['hot_trainer_bonus']

    except Exception as e:
        pass

    return score