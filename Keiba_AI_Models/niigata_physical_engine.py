import numpy as np
import joblib
import os

def calculate_niigata_physical_score(row, race_num=1, distance=1600, surface='芝', trainer_wins_today=0, model_dir='/content/drive/MyDrive/Keiba_AI_Models/'):
    score = 50.0

    # ベースパワー評価 (運動方程式ベース)
    weight = float(row.get('馬体重', 480))
    weight_change = float(row.get('増減', 0.0))
    weight_ratio = weight / float(row.get('斤量', 55.0))
    score += (weight_ratio - (480 / 55.0)) * 2.5

    try:
        knowledge_path = os.path.join(model_dir, 'niigata_knowledge_base.pkl')
        if not os.path.exists(knowledge_path):
            return score

        knowledge = joblib.load(knowledge_path)

        # 特徴量抽出
        pop = int(row.get('人気', 10))
        odds = float(row.get('単勝オッズ', 50.0))
        frame_num = int(row.get('枠', 4))
        horse_num = int(row.get('馬番', 8))
        jockey = str(row.get('騎手', ''))
        trainer = str(row.get('調教師', ''))
        affiliation = str(row.get('所属', ''))
        sex = str(row.get('性別', '牡'))
        age = int(row.get('年齢', 4))

        # --- 新規：オッズ歪み（過大・過小評価）バイアスの適用 ---
        if 'niigata_odds_distortion_dynamics' in knowledge:
            od = knowledge['niigata_odds_distortion_dynamics']
            is_underdog = pop >= od['underdog_pop_threshold']

            # 1. 新潟千直（芝1000m）における「内枠」の不当な過小評価を突く
            if distance == 1000 and frame_num in [1, 2, 3] and is_underdog:
                score += od['straight_1000_inner_underdog_bonus']

            # 2. 重賞・特別戦における「高齢馬（7歳以上）」の過小評価を突く
            if race_num >= od['late_special_race_min_r'] and age >= 7 and is_underdog:
                score += od['veteran_underdog_bonus']

            # 3. 芝戦における「牝馬」のオッズ妙味
            if surface == '芝' and '牝' in sex:
                score += od['female_turf_mixed_bonus']

            # 4. 後半特別戦・重賞における「1番人気」の過剰人気（被りすぎ）ペナルティ
            if race_num >= od['late_special_race_min_r'] and pop == 1:
                # 単勝3.0倍未満の圧倒的人気を危険視する
                if odds < 3.0:
                    score += od['late_special_fav_penalty']

        # --- 過去の新潟ダイナミクス適用（枠順・波乱・馬個体・騎手・陣営） ---
        if 'niigata_frame_dynamics' in knowledge:
            fd = knowledge['niigata_frame_dynamics']
            if frame_num == 1 and horse_num == 1: score += fd.get('frame1_gate1_bonus', 6.5)
            if distance == 1000 and frame_num == 1: score += fd.get('frame1_straight_1000_bonus', 8.0)
            if race_num >= fd.get('late_race_min_r', 10) and frame_num in [1, 2]: score += fd.get('late_race_inner_revival_bonus', 5.0)

        if 'niigata_may16_dynamics' in knowledge:
            nd = knowledge['niigata_may16_dynamics']
            if race_num <= nd.get('solid_early_max_r', 5) and pop <= 5: score += nd.get('solid_early_fav_bonus', 3.5)
            elif race_num in nd.get('upset_trigger_races', [6, 11]) and pop >= nd.get('upset_longshot_pop_threshold', 7): score += nd.get('upset_longshot_bonus', 8.0)

        if 'niigata_horse_dynamics' in knowledge:
            hd = knowledge['niigata_horse_dynamics']
            # 年齢と性別の基本ベース加点はオッズ歪みと重複しないように調整済み想定

        if 'niigata_jockey_dynamics' in knowledge:
            jd = knowledge['niigata_jockey_dynamics']
            if any(j in jockey for j in jd.get('absolute_stability_jockey', [])): score += jd.get('absolute_stability_bonus', 5.5)

        if 'niigata_trainer_dynamics' in knowledge:
            td = knowledge['niigata_trainer_dynamics']
            if trainer_wins_today >= 1: score += td.get('same_day_win_penalty', -4.5)

    except Exception as e:
        pass

    return score