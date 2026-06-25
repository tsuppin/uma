import numpy as np

def calculate_kanazawa_physical_score(
    row, race_num=1, distance=1400, surface='ダ',
    trainer_wins_today=0, model_dir=None
):
    """
    金沢競馬場 物理スコア計算（金沢特化パッチ適用版）
    主要バイアス:
      - 「インの砂が極端に深い」という日本一特殊なトラックバイアス
      - 内ラチ沿いを走ると著しく減速するため、全馬が馬場の真ん中〜外寄りを通る
      - そのため「内枠（1〜2枠）」は内に押し込められて深い砂を走らされる圧倒的不利枠
      - 外枠の逃げ・先行馬が圧倒的に有利
      - 減量騎手（新人）はセオリー通りにインベタを回って自滅するケースが多い
    """
    score = 50.0

    # 特徴量取得
    weight        = float(row.get('馬体重', 480))
    weight_change = float(row.get('増減', 0.0))
    jockey_weight = float(row.get('斤量', 55.0))
    frame_num     = int(row.get('枠', 4))
    corner_pos    = float(row.get('4角番手', 99.0))
    prev_corner1  = float(row.get('前走1角番手', 99.0))
    odds          = float(row.get('単勝オッズ', 50.0))
    jockey        = str(row.get('騎手', ''))
    interval      = int(row.get('間隔', 4))

    # 金沢のトップジョッキー（イン明け・馬場読みが的確）
    kanazawa_masters = ['吉原寛', '青柳正', '米倉知', '栗原大', '中島龍']

    # --- 1. ✨ 状態キープ: 好走時のベスト体重を維持（金沢パワー特化） ---
    # 金沢の深い砂をこなすには「パワー（雄大な馬格）」が必須。
    # 単に維持するだけでなく、馬格がある（490kg以上）状態でキープ、または微増（パワーアップ）を高く評価
    if weight >= 490:
        if -2 <= weight_change <= 6:
            score += 8.0 # 金沢の重いダートを押し切るパワー状態キープ
    elif weight < 440:
        # 馬格がない馬は深い砂に足を取られやすいためマイナス
        score -= 5.0

    # --- 2. 🪽 裸同然の軽斤量(52kg): 減量騎手×先行力 ---
    # 新人（減量騎手: 53kg以下想定）は、金沢特有の「イン開け（内を空けて走る）」が上手くできず、
    # ロスを防ごうとして最内（一番砂が深くて重い場所）を走ってしまい自滅する罠がある。
    if jockey_weight <= 53.0:
        if frame_num <= 3:
            # 内枠の減量騎手は「最悪の罠」として大幅減点
            score -= 12.0
        elif frame_num >= 6 and prev_corner1 <= 3:
            # 外枠で、かつテンが速い逃げ先行馬なら、自然と馬場の良い外目を通れるので減量効果がフルに活きる
            score += 10.0

    # --- 3. 枠と脚質の絶対バイアス（金沢特有のイン砂の深さ） ---
    # 金沢は外枠の先行馬が絶対的に有利
    if frame_num >= 6 and prev_corner1 <= 3:
        score += 8.0
    
    # 1枠・2枠は砂を被るだけでなく、深い砂を走らされるため致命的
    if frame_num <= 2:
        if prev_corner1 >= 4:
            # テンが遅い内枠馬は間違いなく深いインに閉じ込められる
            score -= 15.0
        else:
            # テンが速くても、外に出すのに脚を使うため少しマイナス
            score -= 3.0

    # --- 4. 金沢マイスター補正 ---
    if any(m in jockey for m in kanazawa_masters):
        score += 5.0
        # トップジョッキーは外枠を引くと馬場の良いところを確実に通す
        if frame_num >= 5:
            score += 4.0

    # スコアのクリッピング（0〜100）
    score = max(0.0, min(100.0, score))

    return score
