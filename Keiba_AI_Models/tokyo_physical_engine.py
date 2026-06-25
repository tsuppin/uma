import numpy as np
import joblib
import os

def calculate_tokyo_physical_score(row, race_num=1, distance=1600, surface='芝', trainer_wins_today=0, model_dir='/content/drive/MyDrive/Keiba_AI_Models/'):
    """
    東京競馬場 物理スコア計算（東京特化パッチ適用版）
    主要バイアス:
      - 「究極の末脚（上がり3F）」がすべてを決める、日本一フェアで直線の長い（525m）コース
      - 減量騎手（若手）は直線の叩き合いでベテランに技術・腕力で圧倒されるため消し推奨
      - JRA最高峰の舞台ゆえに「ノーザンファーム生産馬」「3〜4歳の成長期」の基礎スペックが直結
    """
    score = 50.0

    # 特徴量抽出
    weight        = float(row.get('馬体重', 480))
    weight_change = float(row.get('増減', 0.0))
    jockey_weight = float(row.get('斤量', 55.0))
    weight_ratio  = weight / jockey_weight
    score += (weight_ratio - (480 / 55.0)) * 2.5

    pop           = int(row.get('人気', 10))
    frame_num     = int(row.get('枠', 4))
    last_3f       = float(row.get('上がり3F', 99.9))
    corner_pos    = float(row.get('4角番手', 99.0))
    prev_distance = float(row.get('前走距離', distance))
    distance_change = distance - prev_distance
    prev_result   = int(row.get('前走着順', 1))
    margin        = float(row.get('着差', 9.9))
    time_idx      = float(row.get('タイム指数', 50.0))
    odds          = float(row.get('単勝オッズ', 50.0))
    jockey        = str(row.get('騎手', ''))
    trainer       = str(row.get('調教師', ''))
    affiliation   = str(row.get('所属', ''))
    sex           = str(row.get('性別', '牡'))
    sire          = str(row.get('父', ''))
    breeder       = str(row.get('生産者', ''))
    age           = int(row.get('年齢', 3))
    
    is_dirt = surface == 'ダ' or surface == 'ダート'

    # --- 1. 🔥 東京新特注: 究極の末脚・上がり最速候補（爆発確定） ---
    # 東京の長い直線（525m）では、他場とは次元の違う「上がり33秒台実績」を持つ差し・追い込み馬が無双する
    if not is_dirt:
        if last_3f <= 33.9 and last_3f != 99.9:
            score += 15.0 # 鬼脚ボーナス
            if corner_pos >= 7 and corner_pos != 99.0:
                score += 5.0 # 長い直線で存分に末脚を発揮できる後方待機馬をさらに加点
        elif last_3f <= 34.5:
            score += 7.0
    else:
        # ダートでも上がり上位（35秒台〜36秒台前半）は強いが、差し届かずリスクもある
        if last_3f <= 36.5 and last_3f != 99.9:
            score += 6.0

    # --- 2. ⚠️ 東京減点方式: 減量騎手(▲★等)はアタマ・軸としての信頼度低 ---
    # コース形態と直線の長さで「腕の差（道中の折り合いや直線の追い）」が露骨に出るため、若手は消し推奨
    if jockey_weight <= 53.0:
        if pop <= 3:
            # 人気馬に乗った若手は過剰人気になりやすく、直線で追い負ける致命的リスク
            score -= 12.0
        else:
            score -= 5.0

    # --- 3. 👑 ノーザンファーム生産 × 若駒（3〜4歳）の基礎スペック ---
    if 'ノーザンファーム' in breeder or 'ノーザンF' in breeder:
        score += 8.0 # 育成力抜群
        if age in [3, 4]:
            score += 5.0 # 成長期トレンド：若駒の順調なビルドアップ

    # --- 4. 🔥 期待値クロス: 前走大敗も着差僅か（オッズ盲点） ---
    # 前走6着以下だが着差0.5秒以内の実力馬は、東京の直線で容易に逆転可能
    if prev_result >= 6 and margin <= 0.5:
        score += 8.0
        if pop >= 5:
            score += 4.0 # オッズ盲点で期待値クロス

    # --- 5. 💎 激走フラグ: 大幅距離短縮 ＆ タイム異常値 ---
    if distance_change <= -400:
        score += 7.0 # スタミナを末脚に全振りできる距離短縮ローテ
    
    if time_idx >= 105.0: # 持ち時計優秀・タイム異常値
        score += 10.0 # タイム異常値ブースト（3連系軸推奨）

    # --- 6. ⚠️ 展開バイアス（ダート短距離の揉まれリスク・差し届かずリスク） ---
    if is_dirt:
        if distance <= 1400:
            if frame_num >= 5:
                # 東京ダート短距離は揉まれない中外枠の好位・差しが特注
                if 3 <= corner_pos <= 8:
                    score += 8.0
            if corner_pos >= 10:
                # 逆にテンのスピード不足で後方追走のままだと、ダートでは差し届かずリスク割引
                score -= 6.0

    # --- 7. ✨ 状態キープ: 好走時のベスト体重を維持 ---
    if prev_result <= 3 and -2 <= weight_change <= 2:
        score += 4.0

    # ==============================================================
    # 既存の .pkl ロジックフォールバック（レガシー互換用）
    # ==============================================================
    try:
        knowledge_path = os.path.join(model_dir, 'tokyo_knowledge_base.pkl')
        if os.path.exists(knowledge_path):
            knowledge = joblib.load(knowledge_path)
            # 50倍以上の超大穴に対する動的ブーストのみ継承
            if 'odds_distortion_dynamics' in knowledge:
                odd_dyn = knowledge['odds_distortion_dynamics']
                if odds >= odd_dyn.get('extreme_longshot_min_odds', 70.0):
                    score += odd_dyn.get('extreme_longshot_base_buff', 10.0)
            
            # 美浦（関東）所属バイアス
            if 'stable_bias_dynamics' in knowledge:
                sbd = knowledge['stable_bias_dynamics']
                if '美浦' in affiliation or '東' in trainer:
                    score += sbd.get('miho_base_bonus', 3.0)
    except Exception as e:
        pass

    # スコアのクリッピング（0〜100）
    score = max(0.0, min(100.0, score))

    return score