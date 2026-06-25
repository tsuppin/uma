import numpy as np

def calculate_mombetsu_physical_score(
    row, race_num=1, distance=1200, surface='ダ',
    trainer_wins_today=0, model_dir=None
):
    """
    門別競馬場 物理スコア計算（門別特化パッチ適用版）
    主要バイアス:
      - 地方競馬としては異例の「コースが広く、直線が長い（330m）」
      - そのため、他場のような「逃げ・内枠絶対有利」ではなく「外差し」が普通に届く実力勝負のコース
      - 若駒（2歳戦）が非常に多く、成長度合い（馬体増）がそのまま直結しやすい
      - 直線が長いため、騎手の「剛腕（追える力）」が問われ、若手の減量騎手は直線で追い負けしやすい
    """
    score = 50.0

    # 特徴量取得
    weight        = float(row.get('馬体重', 480))
    weight_change = float(row.get('増減', 0.0))
    jockey_weight = float(row.get('斤量', 55.0))
    pop           = int(row.get('人気', 10))
    frame_num     = int(row.get('枠', 4))
    corner_pos    = float(row.get('4角番手', 99.0))
    prev_corner1  = float(row.get('前走1角番手', 99.0))
    prev_result   = int(row.get('前走着順', 1))
    odds          = float(row.get('単勝オッズ', 50.0))
    jockey        = str(row.get('騎手', ''))
    interval      = int(row.get('間隔', 4))
    age           = int(row.get('年齢', 3))

    # 門別の剛腕/トップジョッキー
    mombetsu_masters = ['落合玄', '桑村真', '石川倭', '服部茂', '阿部龍']

    # --- 1. ❌ 門別減点: 前走6着以下(大敗)ペナルティ の見直し ---
    # 門別は広く実力が出やすいため、前走が小回り（他地区）での大敗や、
    # 砂を被って大敗した馬が、外枠に入ってあっさり巻き返すことが多々ある。
    if prev_result >= 6:
        # 2歳・3歳戦での大敗は「成長過程」や「展開不向き」ですぐ巻き返すためペナルティ免除
        if age <= 3:
            pass # 減点なし
        # 古馬で、かつ今回も内枠（1〜3枠）に入ってしまった場合は砂被り懸念継続で減点
        elif frame_num <= 3:
            score -= 8.0
        # 古馬でも外枠（6〜8枠）に入り、スムーズに外を回せる形なら「巻き返し期待」で逆に加点
        elif frame_num >= 6 and prev_corner1 <= 5:
            score += 5.0
        else:
            score -= 4.0

    # --- 2. ⚠️ 太め残り: 余裕残しの馬体増・調整不足の懸念 の見直し ---
    # 門別は2歳・3歳戦がメインであり、成長期の+10kgは「太め残り」ではなく「成長分・パワーアップ」。
    if weight_change >= 10.0:
        if age <= 3:
            # 成長期の馬体増は、深い門別のダートをこなすパワー獲得として大きく評価
            score += 6.0
        elif interval < 8:
            # 古馬で間隔が詰まっている（8週未満）のに+10kg以上は、流石に調整ミス（太め残り）
            score -= 7.0

    # --- 3. 🪽/💡 裸同然の軽斤量(52kg) & 減量起用(-3kg) の見直し ---
    # 門別は直線が長く（330m）、最後にバテ比べの追い合いになる。
    # ここで減量騎手（若手・腕力不足）は、ベテランの剛腕ジョッキーに「追い負け」して差される罠がある。
    if jockey_weight <= 53.0:
        if distance == 1000:
            # 1000mの短距離戦なら、直線の追い合いになる前に「テンの速さ」と「軽さ」でそのまま逃げ切れるため大プラス
            if prev_corner1 <= 2:
                score += 12.0
        else:
            # 1200m以上のレースでは、直線で剛腕ジョッキーに差される可能性が高いためマイナス
            if corner_pos >= 5:
                # 差し馬に乗った若手減量は直線で全く伸びない致命傷
                score -= 10.0
            else:
                # 逃げ先行でも最後に差されるリスクがあり微減点
                score -= 3.0

    # --- 4. 門別特有のトラックバイアス（外差し・トップジョッキー） ---
    # 門別は外からスムーズに加速して差してくる馬（外差し）がよく決まる
    if frame_num >= 6 and 4 <= prev_corner1 <= 8:
        score += 6.0
    
    # 門別の直線を力強く追えるトップジョッキーの加点
    if any(m in jockey for m in mombetsu_masters):
        score += 8.0
        if corner_pos >= 5:
            # 直線が長いので、腕っぷしの強い騎手の差し・追い込みは他場より届く
            score += 4.0

    # スコアのクリッピング（0〜100）
    score = max(0.0, min(100.0, score))

    return score
