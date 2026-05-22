import numpy as np
import joblib
import os

def calculate_tokyo_physical_score(row, model_dir='/content/drive/MyDrive/Keiba_AI_Models/'):
    score = 50.0

    # ベースパワー評価 (運動方程式ベース)
    weight = float(row.get('馬体重', 480))
    weight_change = float(row.get('増減', 0.0))
    weight_ratio = weight / float(row.get('斤量', 55.0))
    score += (weight_ratio - (480 / 55.0)) * 2.5

    try:
        knowledge_path = os.path.join(model_dir, 'tokyo_knowledge_base.pkl')
        if not os.path.exists(knowledge_path):
            return score
        
        knowledge = joblib.load(knowledge_path)

        # 特徴量抽出
        course_type = str(row.get('コース', row.get('馬場状態', '芝')))
        is_dirt = 'ダ' in course_type
        has_blinker = row.get('ブリンカー', 0) == 1 or 'B' in str(row.get('馬具', ''))
        last_3f = float(row.get('上がり3F', 99.9))
        corner_pos = float(row.get('4角番手', 99.0))
        odds = float(row.get('単勝オッズ', 1.0))
        pop = int(row.get('人気', 10))
        frame_num = int(row.get('枠', 4))
        trainer_name = str(row.get('調教師', ''))
        affiliation = str(row.get('所属', ''))
        jockey_name = str(row.get('騎手', ''))
        jockey_affiliation = str(row.get('騎手所属', ''))
        is_jockey_change = row.get('乗り替わり', 0) == 1 or row.get('前走騎手', '') != jockey_name

        # --- 0. オッズ歪みと10万馬券トリガー（NEW） ---
        if 'odds_distortion_dynamics' in knowledge:
            odd_dyn = knowledge['odds_distortion_dynamics']
            
            if odds <= odd_dyn['solid_favorite_max_odds']:
                score += odd_dyn['solid_favorite_bonus']
            elif odd_dyn['mid_hole_min_odds'] <= odds <= odd_dyn['mid_hole_max_odds']:
                score += odd_dyn['mid_hole_win_bonus']
                
            # 70倍以上の過小評価（大穴・超大穴）
            if odds >= odd_dyn['extreme_longshot_min_odds']:
                base_buff = odd_dyn['extreme_longshot_base_buff']
                if odds >= odd_dyn['super_extreme_min_odds']:
                    base_buff += 5.0 # 100倍超えはさらに逆数スコアを加算
                
                # 陣営の勝負サイン（ブリンカー）との強烈な掛け合わせ
                if has_blinker:
                    score += (base_buff * odd_dyn['blinker_synergy_multiplier'])
                else:
                    score += base_buff

        # --- 1. 大穴激走の4条件（複合フラグ検知） ---
        if 'longshot_explosion_dynamics' in knowledge:
            led = knowledge['longshot_explosion_dynamics']
            cond1_blinker = has_blinker
            is_miho_jockey = '美浦' in jockey_affiliation or '東' in jockey_affiliation
            cond2_jockey = is_miho_jockey and is_jockey_change
            if is_dirt:
                cond3_speed = last_3f <= led['dirt_speed_req']
            else:
                cond3_speed = last_3f <= led['turf_speed_req']
            cond4_weight = led['weight_stable_min'] <= weight_change <= led['weight_stable_max']
            
            if odds >= led['target_min_odds']:
                match_count = sum([cond1_blinker, cond2_jockey, cond3_speed, cond4_weight])
                if match_count == 4:
                    score += led['composite_explosion_bonus']
                elif match_count == 3:
                    score += led['partial_explosion_bonus']

        # --- 2. タイム・上がり3Fの高速化シフト ---
        if not is_dirt and 'turf_speed_dynamics' in knowledge:
            tsd = knowledge['turf_speed_dynamics']
            if last_3f <= tsd['turf_extreme_3f_threshold']:
                score += tsd['turf_extreme_3f_bonus']
            elif last_3f >= 35.0 and last_3f != 99.9:
                score += tsd['turf_slow_3f_penalty']

        if is_dirt and 'dirt_closer_dynamics' in knowledge:
            dcd = knowledge['dirt_closer_dynamics']
            if last_3f <= dcd.get('dirt_ultra_fast_3f_threshold', 35.9):
                score += dcd.get('dirt_ultra_fast_3f_bonus', 8.5)
            elif corner_pos >= 8 and corner_pos != 99.0 and last_3f <= dcd.get('dirt_fast_3f_threshold', 36.9):
                score += dcd.get('dirt_late_spurt_bonus', 5.0)

        # --- 3. 騎手シナジー・陣営の意図 ---
        if 'jockey_synergy_dynamics' in knowledge:
            jsd = knowledge['jockey_synergy_dynamics']
            if '美浦' in jockey_affiliation or '東' in jockey_affiliation:
                score += jsd['miho_jockey_bonus']
            elif '栗東' in jockey_affiliation or '西' in jockey_affiliation:
                score += jsd['ritto_jockey_penalty']
            if any(hj in jockey_name for hj in jsd.get('hot_jockeys', [])):
                score += jsd.get('hot_jockey_bonus', 0)
            if is_jockey_change and row.get('前走騎手', '') != '':
                score += jsd.get('jockey_change_bonus', 0)

        # --- 4. 馬体重変動の落ち着き (単独) ---
        if 'weight_stability_dynamics' in knowledge:
            wsd = knowledge['weight_stability_dynamics']
            if wsd['stable_min'] <= weight_change <= wsd['stable_max']:
                score += wsd['stable_bonus']
            elif abs(weight_change) >= 10.0:
                score += wsd['extreme_penalty']

        # --- 5. 所属・厩舎バイアス（美浦無双） ---
        if 'stable_bias_dynamics' in knowledge:
            sbd = knowledge['stable_bias_dynamics']
            if '美浦' in affiliation or '東' in trainer_name or '関東' in affiliation:
                score += sbd['miho_base_bonus']
            elif '栗東' in affiliation or '西' in trainer_name or '関西' in affiliation:
                score += sbd['ritto_penalty']

        # --- 6. 枠順バイアスのフラット化と新傾向反映 ---
        if 'frame_bias_dynamics' in knowledge:
            fbd = knowledge['frame_bias_dynamics']
            if frame_num >= 6:
                score += fbd.get('outer_frame_bonus', 0.0)
            elif frame_num <= 3:
                score += fbd.get('inner_frame_penalty', 0.0)
            if is_dirt and frame_num == 1:
                score += fbd.get('dirt_frame_1_bonus', 5.0)
            if frame_num in fbd.get('mid_frames', [4, 5]):
                score += fbd.get('mid_frame_bonus', 3.5)

    except Exception as e:
        pass

    return score