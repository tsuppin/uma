import numpy as np

def calculate_urawa_physical_score(
    row, race_num=1, distance=1400, surface='ダ',
    trainer_wins_today=0, model_dir=None
):
    """
    浦和競馬場 物理スコア計算（浦和特化パッチ適用版）
    主要バイアス:
      - 極端な小回り・短い直線による「絶対的な前残り」
      - 内枠はテンが速くないと砂を被って揉まれる（揉まれ弱さに直結）
      - 外枠の逃げ先行馬がスムーズにレースを進めやすい
      - 減量騎手（若手）のイン突きはコーナーで膨れやすく罠になりやすい
      - 浦和マイスター（森泰斗、笹川翼、和田譲治など）の先行馬は特注
    """
    score = 50.0

    # 特徴量取得（取得できない場合はデフォルト値を設定）
    weight        = float(row.get('馬体重', 480))
    weight_change = float(row.get('増減', 0.0))
    jockey_weight = float(row.get('斤量', 55.0))
    pop           = int(row.get('人気', 10))
    frame_num     = int(row.get('枠', 4))
    corner_pos    = float(row.get('4角番手', 99.0))
    prev_corner1  = float(row.get('前走1角番手', 99.0))  # 前走の初角位置でテンの速さを推測
    odds          = float(row.get('単勝オッズ', 50.0))
    jockey        = str(row.get('騎手', ''))
    interval      = int(row.get('間隔', 4)) # 週休
    
    # 浦和マイスター（南関トップかつ浦和特注ジョッキー）
    urawa_masters = ['森泰斗', '笹川翼', '和田譲治', '御神本', '矢野貴', '本橋孝']

    # --- 1. 🎯 浦和の鉄板本命: 先行力のある1番人気 ---
    # 1番人気だが、差し馬（前走4角番手が6番手以降）は評価を下げる
    if pop == 1:
        if prev_corner1 <= 3 or corner_pos <= 3:
            score += 15.0 # 先行力のある1番人気は鉄板
        elif prev_corner1 >= 6:
            score -= 10.0 # 浦和で差し・追い込みの1番人気は過信禁物（波乱フェーズ）

    # --- 2. ⚔️ 浦和の前残り: 逃げ・先行馬の絶対的優位 ---
    # 逃げ先行（初角または4角で3番手以内）
    if prev_corner1 <= 3 or corner_pos <= 3:
        score += 10.0
        # 外枠（6〜8枠）の先行馬はスムーズに好位を取れるのでさらに加点
        if frame_num >= 6:
            score += 5.0
    
    # 後方待機（4角10番手以降）はノーチャンスに近い
    if corner_pos >= 10 and corner_pos != 99.0:
        score -= 15.0

    # --- 3. 👑 浦和マイスター: コースのクセを熟知したトップジョッキー ---
    # マイスターが「先行馬」に乗った時のみ強力な加点
    if any(m in jockey for m in urawa_masters):
        if prev_corner1 <= 4 or corner_pos <= 4:
            score += 12.0 # 的中率最重視の特注加点
        else:
            score += 3.0  # 差し馬の場合は騎手腕で少しカバー

    # --- 4. 🪽/💡 減量騎手（若手）の罠 ---
    # 斤量が53kg以下（減量騎手起用と推定される）の場合
    if jockey_weight <= 53.0:
        # 内枠（1〜3枠）だとコーナーで包まれたり膨れたりしてロスが大きい
        if frame_num <= 3:
            score -= 8.0
        # 外枠の逃げ馬なら邪魔されないのでプラス
        elif frame_num >= 7 and prev_corner1 <= 2:
            score += 5.0

    # --- 5. ⚠️ 太め残り: 余裕残しの馬体増・調整不足 ---
    # +10kg以上の大幅馬体増だが、休み明け（間隔10週以上など）ではない場合は調整ミスの疑い
    if weight_change >= 10.0 and interval < 10:
        score -= 5.0
    
    # --- 6. 枠番の基本バイアス ---
    # 浦和は1枠が砂を被って揉まれるリスクが高いため、テンが遅い1枠はマイナス
    if frame_num == 1 and prev_corner1 >= 5:
        score -= 8.0

    # --- 7. 学習パッチ (Local Auto-Correction) 準拠の全体補正 ---
    # 基本的に前に行けるかどうかがすべて。
    # 体重比率（パワー）もダート小回りでは重要
    weight_ratio = weight / jockey_weight
    score += (weight_ratio - (480 / 55.0)) * 2.0

    # スコアのクリッピング（0〜100）
    score = max(0.0, min(100.0, score))

    return score
