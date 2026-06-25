import numpy as np
import joblib
import os

def calculate_hanshin_physical_score(
    row, race_num=1, distance=1600, surface='芝',
    trainer_wins_today=0, model_dir=None
):
    """
    阪神競馬場 物理スコア計算（阪神特化パッチ適用版）
    主要バイアス:
      - ゴール前の「急坂」が全てを分けるタフなコース
      - 外回り芝: 差し・追い込み有利（上がり3Fとスタミナ重視）
      - 内回り・ダート: 基本は先行有利だが、急坂による前傾ハイペースで「差し・追い込みの強襲」が頻発する
      - 距離短縮ローテ（スタミナの持ち越し）が他場以上に強烈な効果を生む
    """
    score = 50.0

    weight        = float(row.get('馬体重', 480))
    weight_change = float(row.get('増減', 0.0))
    jockey_weight = float(row.get('斤量', 55.0))
    weight_ratio  = weight / jockey_weight
    score += (weight_ratio - (480 / 55.0)) * 2.5

    pop           = int(row.get('人気', 10))
    frame_num     = int(row.get('枠', 4))
    horse_num     = int(row.get('馬番', 8))
    last_3f       = float(row.get('上がり3F', 99.9))
    corner_pos    = float(row.get('4角番手', 99.0))
    prev_distance = float(row.get('前走距離', distance))
    distance_change = distance - prev_distance
    odds          = float(row.get('単勝オッズ', 50.0))
    jockey        = str(row.get('騎手', ''))
    trainer       = str(row.get('調教師', ''))
    affiliation   = str(row.get('所属', ''))
    sex           = str(row.get('性別', '牡'))
    sire          = str(row.get('父', ''))

    is_outer_course = distance >= 1800 and surface == '芝'
    is_inner_course = distance < 1800  and surface == '芝'
    is_dirt         = surface == 'ダ' or surface == 'ダート'
    has_blinker     = row.get('ブリンカー', 0) == 1 or 'B' in str(row.get('馬具', ''))

    # --- 1. 🔥 JRA極秘: 距離短縮ショック(豊富なスタミナ×末脚爆発) ---
    # 阪神は急坂のため、前走でより長い距離を走っていた「スタミナ」がそのまま急坂での「末脚の持続力」に直結する
    if distance_change <= -200:
        if last_3f <= 35.0 and last_3f != 99.9:
            # 豊富なスタミナと末脚を併せ持つ馬の距離短縮は阪神で無双する
            score += 10.0
            
            # --- 2. 💎 激走フラグ: 大幅距離短縮ローテ ---
            # 400m以上の短縮はスタミナの絶対的優位を作り出す激走フラグ
            if distance_change <= -400:
                score += 7.0

    # --- 3. ⚡前傾ハイペース適合(差し追込有利) ---
    # 阪神の内回りやダートは、急坂があるにも関わらずテンが速くなり前傾ラップになりやすい。
    # 結果として先行馬が坂でパタリと止まり、後方からの差し追込が強烈に決まる。
    if is_inner_course or is_dirt:
        if corner_pos >= 8 and corner_pos != 99.0:
            # 他場では届かない位置（後方）からの差し・追い込み馬を大きく評価
            score += 8.0
            # もしそれが距離短縮馬（スタミナ担保）ならさらに確実
            if distance_change <= -200:
                score += 5.0

    # --- 4. コース別基本バイアス（既存踏襲） ---
    if is_outer_course:
        # 阪神外回り: 上がり勝負 → 末脚馬有利
        if last_3f <= 33.5 and last_3f != 99.9:
            score += 7.0
        elif last_3f <= 34.5:
            score += 4.0
        # 外枠は不利（外回りでも直線で詰まる）
        if frame_num >= 7:
            score -= 2.5
        elif frame_num <= 3:
            score += 2.0

    if is_inner_course:
        # 阪神内回り: 基本は先行有利（ハイペース崩れ以外）
        if corner_pos <= 4 and corner_pos != 0:
            score += 5.0
        if frame_num <= 3:
            score += 4.0
        elif frame_num >= 7:
            score -= 3.0

    if is_dirt:
        # ダート: 内枠有利（特に短距離）
        if frame_num == 1:
            score += 7.0
        elif frame_num <= 3:
            score += 4.0
        elif frame_num >= 7:
            score -= 3.0
        # ダート先行の基本（ハイペース崩れ以外）
        if corner_pos <= 4 and corner_pos != 0:
            score += 4.0

    # --- 5. 距離別補正 ---
    if distance <= 1200:
        if weight >= 500:
            score += 3.0
    elif distance >= 2200:
        stamina_sires = ['ディープインパクト', 'ハーツクライ', 'オルフェーヴル', 'ゴールドシップ']
        if any(s in sire for s in stamina_sires):
            score += 5.0

    # --- 6. 牝馬補正 ---
    if '牝' in sex and surface == '芝' and distance <= 1600:
        score += 4.0

    # --- 7. 騎手補正（関西拠点騎手有利） ---
    ritto_jockeys = ['川田', '武豊', '福永', '岩田', '和田竜', '北村友', '幸英']
    if any(j in jockey for j in ritto_jockeys):
        score += 4.5
    miho_jockeys = ['戸崎', 'ルメール', 'デムーロ', '横山武']
    if any(j in jockey for j in miho_jockeys):
        score += 2.0

    # --- 8. 馬体重・厩舎・ブリンカー等の微調整 ---
    if '栗東' in affiliation or '西' in trainer:
        score += 3.0
    elif '美浦' in affiliation or '東' in trainer:
        score -= 1.5

    if -2 <= weight_change <= 4:
        score += 2.5
    elif abs(weight_change) >= 14:
        score -= 4.0

    if has_blinker and pop >= 6:
        score += 3.5

    # スコアのクリッピング（0〜100）
    score = max(0.0, min(100.0, score))

    return score
