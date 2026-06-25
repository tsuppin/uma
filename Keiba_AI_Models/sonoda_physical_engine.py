import numpy as np

def calculate_sonoda_physical_score(
    row, race_num=1, distance=1400, surface='ダ',
    trainer_wins_today=0, model_dir=None
):
    """
    園田競馬場 物理スコア計算（園田特化パッチ適用版）
    主要バイアス:
      - 1周1051m、直線213mという超小回りコース。日本屈指の前残り絶対馬場。
      - 吉村智洋、田中学などのトップジョッキーへの依存度が極端に高い。
      - 上位人気の信頼度が他場より圧倒的に高い（ガチガチの決着が多い）。
      - 差し・追い込みはよほど実力差がない限りノーチャンス。
    """
    score = 50.0

    # 特徴量取得
    weight        = float(row.get('馬体重', 480))
    weight_change = float(row.get('増減', 0.0))
    jockey_weight = float(row.get('斤量', 55.0))
    pop           = int(row.get('人気', 10))
    frame_num     = int(row.get('枠', 4))
    horse_num     = int(row.get('馬番', 8))
    total_horses  = int(row.get('頭数', 12))  # 出走頭数
    corner_pos    = float(row.get('4角番手', 99.0))
    prev_corner1  = float(row.get('前走1角番手', 99.0))
    prev_result   = int(row.get('前走着順', 1))
    odds          = float(row.get('単勝オッズ', 50.0))
    jockey        = str(row.get('騎手', ''))
    prev_jockey   = str(row.get('前走騎手', jockey))

    # 園田のトップジョッキーとヒモ穴メーカー
    sonoda_top_jockeys = ['吉村智', '田中学', '下原里', '廣瀬航']
    sonoda_upset_jockeys = ['鴨宮祥', '大山真', '長谷部', '杉浦健'] # よく3着に突っ込んでくる穴ジョッキー

    # --- 1. 園田減点: 前走4着以下の凡走 ---
    # 直線が短いため、園田で前走4着以下の馬（＝好位を取れなかった馬）は基本的に巻き返しが厳しい
    if prev_result >= 4:
        if prev_corner1 >= 5:
            # 前走でもテンに行けなかった馬は園田では致命的
            score -= 10.0
        else:
            # テンに行けたがバテた場合は、距離短縮などでワンチャンスあるため微減点
            score -= 3.0

    # --- 2. ⚠️ 園田減点: 上位人気馬の不穏な乗り替わり ---
    # 園田では「勝負気配」が騎手起用に露骨に出る。
    # 1〜2番人気の馬で、前走がトップジョッキー（吉村・田中など）だったのに、
    # 今回一般ジョッキーに乗り替わっている場合は「ヤラズ（勝負気配なし）」の危険大。
    if pop <= 2:
        prev_is_top = any(m in prev_jockey for m in sonoda_top_jockeys)
        curr_is_top = any(m in jockey for m in sonoda_top_jockeys)
        if prev_is_top and not curr_is_top:
            score -= 15.0 # 不穏な乗り替わりによる大幅減点

    # --- 3. ✨ 状態キープ: 好走時のベスト体重を維持 ---
    # 園田の小回りを器用に立ち回るには、太め残りよりもスッキリ仕上がっていることが重要。
    if prev_result <= 3:
        if -2 <= weight_change <= 2:
            score += 5.0 # 好走時のベスト体重をキープしている馬をシンプルに加点

    # --- 4. ⚠️ 園田減点: 1着候補としては信頼度減(4番人気以下) ---
    # 園田のレースは1〜3番人気が非常に強く、4番人気以下の馬が「頭（1着）」まで突き抜けるケースは極端に少ない。
    if pop >= 4:
        # スコア上限を抑えつける（絶対的な中心にはさせない）
        score -= 8.0
        if pop >= 7:
            score -= 5.0

    # --- 5. ⚠️ 園田減点: 枠番と馬番の不一致(マイナスバイアス) ---
    # 園田（特に1400m）は内枠有利だが、フルゲート（12頭）の時の大外枠（8枠11〜12番）は
    # 最初のコーナーまでの距離が短いため外を回され続けて致命的な距離損（マイナスバイアス）となる。
    if frame_num >= 7 and horse_num >= 10 and total_horses >= 11:
        # テンが遅い外枠の馬はノーチャンス
        if prev_corner1 >= 5:
            score -= 12.0

    # --- 6. 💥 園田特注: 絶好のヒモ穴推奨フラグ成立！(波乱メーカー陣営) ---
    # 園田で波乱が起きるとすれば「インに潜り込んだ中穴馬」か「穴ジョッキーの3着強襲」。
    if 4 <= pop <= 8:
        if any(m in jockey for m in sonoda_upset_jockeys):
            if frame_num <= 3 or prev_corner1 <= 4:
                # 穴ジョッキー×内枠 または 穴ジョッキー×先行力 は、ヒモ（2着・3着）として強烈な加点
                score += 15.0 # ヒモ穴フラグ

    # --- 園田の基本バイアス（前残り） ---
    if prev_corner1 <= 2:
        score += 8.0
    elif corner_pos >= 7 and corner_pos != 99.0:
        score -= 10.0 # 後方待機は園田では無理

    # スコアのクリッピング（0〜100）
    score = max(0.0, min(100.0, score))

    return score
