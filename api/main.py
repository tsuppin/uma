"""
api/main.py
=============================================================================
Tsuchiya Protocol-Omega API
24特徴量対応版（前走データ + 騎手・種牡馬・調教師TE + 強化乗り替わり・環境データ追加）

特徴量一覧（順序厳守）:
  [ベース 11]
  1.  wakuban            枠番
  2.  umaban             馬番
  3.  kinryo             斤量
  4.  tansho             単勝オッズ
  5.  ninki              人気
  6.  nenrei             年齢
  7.  seibetsu           性別 (牡=0, 牝=1, セン=2)
  8.  bataiju_base       馬体重（kg）
  9.  bataiju_zohen      馬体重増減（kg）
  10. cushion_value      クッション値 (デフォルト: 9.5)
  11. moisture           含水率 (デフォルト: 10.0)

  [前走 10]
  12. prev_result        前走着順
  13. prev_last3f        前走上がり3F（秒）
  14. prev_time_diff     前走タイム差（1着との差・秒）
  15. prev_popularity    前走人気
  16. prev_distance      前走距離（m）
  17. distance_change    距離変化（今走 - 前走, m）
  18. interval_weeks     出走間隔（週）
  19. prev_top3_flag     前走3着以内フラグ（0 or 1）
  20. is_jockey_changed  乗り替わりフラグ（0=継続, 1=乗り替わり）
  21. jockey_te_diff     今走と前走の騎手TE勝率の差分（強化乗り替わり指標）

  [Target Encoding 3]
  22. jockey_win_rate_te 騎手×会場の勝率（Target Encoding）
  23. sire_win_rate_te   種牡馬×会場の勝率（Target Encoding）
  24. trainer_win_rate_te 調教師×会場の勝率（Target Encoding）
=============================================================================
"""

import lightgbm as lgb
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import os

# =============================================================================
# アプリ初期化
# =============================================================================
app = FastAPI(
    title="Tsuchiya Protocol-Omega API",
    description="24特徴量対応 競馬予測推論エンジン",
    version="2.2.0"
)

# =============================================================================
# モデルロード（競馬場別に複数モデルを管理）
# =============================================================================

SUPPORTED_VENUES = [
    'tokyo', 'nakayama', 'kyoto', 'hanshin', 'chukyo',
    'niigata', 'fukushima', 'kokura', 'hakodate', 'sapporo'
]

models: dict = {}

for venue in SUPPORTED_VENUES:
    model_path = f'{venue}_ensemble_model.txt'
    if os.path.exists(model_path):
        try:
            models[venue] = lgb.Booster(model_file=model_path)
            print(f"✅ モデルロード成功: {venue}")
        except Exception as e:
            print(f"⚠️  モデルロード失敗 [{venue}]: {e}")
    else:
        print(f"⚠️  モデルファイル未検出: {model_path}")

# =============================================================================
# リクエスト・レスポンス定義
# =============================================================================

class HorseFeatures(BaseModel):
    """1頭分の特徴量（18項目）"""
    # ---- ベース特徴量 ----
    wakuban:            float = Field(..., description="枠番")
    umaban:             float = Field(..., description="馬番")
    kinryo:             float = Field(..., description="斤量（kg）")
    tansho:             float = Field(default=0.0, description="単勝オッズ")
    ninki:              float = Field(default=0.0, description="人気順位")
    nenrei:             float = Field(default=4.0, description="年齢")
    seibetsu:           float = Field(default=0.0, description="性別: 牡=0, 牝=1, セン=2")
    bataiju_base:       float = Field(default=480.0, description="馬体重（kg）")
    bataiju_zohen:      float = Field(default=0.0, description="馬体重増減（kg）")
    cushion_value:      float = Field(default=9.5, description="クッション値")
    moisture:           float = Field(default=10.0, description="含水率")
    # ---- 前走特徴量 ----
    prev_result:        float = Field(default=0.0, description="前走着順（不明=0）")
    prev_last3f:        float = Field(default=0.0, description="前走上がり3F（秒）")
    prev_time_diff:     float = Field(default=0.0, description="前走タイム差（秒）")
    prev_popularity:    float = Field(default=0.0, description="前走人気")
    prev_distance:      float = Field(default=0.0, description="前走距離（m）")
    distance_change:    float = Field(default=0.0, description="距離変化（今走-前走, m）")
    interval_weeks:     float = Field(default=4.0, description="出走間隔（週）")
    prev_top3_flag:     float = Field(default=0.0, description="前走3着以内フラグ")
    is_jockey_changed:  float = Field(default=0.0, description="乗り替わりフラグ(1=乗替, 0=継続)")
    jockey_te_diff:     float = Field(default=0.0, description="今走と前走の騎手TE勝率差分")
    # ---- Target Encoding ----
    jockey_win_rate_te: float = Field(default=0.1, description="騎手×会場の勝率（TE）")
    sire_win_rate_te:   float = Field(default=0.1, description="種牡馬×会場の勝率（TE）")
    trainer_win_rate_te: float = Field(default=0.1, description="調教師×会場の勝率（TE）")


class RaceInput(BaseModel):
    """レース入力（複数頭対応）"""
    venue:  str = Field(..., description=f"競馬場コード: {SUPPORTED_VENUES}")
    horses: list[HorseFeatures]


class HorsePrediction(BaseModel):
    horse_index:      int
    top3_probability: float
    rank_score:       float   # 同レース内での相対スコア（0〜100）


class PredictionResponse(BaseModel):
    venue:        str
    horse_count:  int
    predictions:  list[HorsePrediction]


# =============================================================================
# ヘルパー関数
# =============================================================================

FEATURE_ORDER = [
    'wakuban', 'umaban', 'kinryo', 'tansho', 'ninki',
    'nenrei', 'seibetsu', 'bataiju_base', 'bataiju_zohen',
    'cushion_value', 'moisture',
    'prev_result', 'prev_last3f', 'prev_time_diff', 'prev_popularity',
    'prev_distance', 'distance_change', 'interval_weeks', 'prev_top3_flag',
    'is_jockey_changed', 'jockey_te_diff',
    'jockey_win_rate_te', 'sire_win_rate_te', 'trainer_win_rate_te'
]

def horse_to_array(h: HorseFeatures) -> list[float]:
    return [getattr(h, feat) for feat in FEATURE_ORDER]


# =============================================================================
# エンドポイント
# =============================================================================

@app.post("/api/predict", response_model=PredictionResponse)
def predict_race(data: RaceInput):
    """
    複数頭分の特徴量を受け取り、各馬の「3着以内確率」を返す。
    同レース内での相対スコア（rank_score）も付加する。
    """
    venue = data.venue.lower()

    if venue not in models:
        raise HTTPException(
            status_code=503,
            detail=f"競馬場 '{venue}' のモデルが利用できません。"
                   f"利用可能: {list(models.keys())}"
        )

    model = models[venue]

    # 全馬の特徴量を行列化
    X = np.array([horse_to_array(h) for h in data.horses])

    try:
        probs = model.predict(X)  # shape: (n_horses,)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"推論エラー: {str(e)}")

    # 相対スコアの計算（同レース内で最低0・最高100に正規化）
    prob_min = probs.min()
    prob_max = probs.max()
    if prob_max > prob_min:
        rank_scores = (probs - prob_min) / (prob_max - prob_min) * 100
    else:
        rank_scores = np.full_like(probs, 50.0)

    predictions = [
        HorsePrediction(
            horse_index=i,
            top3_probability=float(probs[i]),
            rank_score=float(rank_scores[i])
        )
        for i in range(len(data.horses))
    ]

    return PredictionResponse(
        venue=venue,
        horse_count=len(data.horses),
        predictions=predictions
    )


@app.get("/api/predict/single")
def predict_single(
    venue: str,
    wakuban: float, umaban: float, kinryo: float,
    tansho: float = 0.0, ninki: float = 0.0, nenrei: float = 4.0,
    seibetsu: float = 0.0, bataiju_base: float = 480.0, bataiju_zohen: float = 0.0,
    prev_result: float = 0.0, prev_last3f: float = 0.0, prev_time_diff: float = 0.0,
    prev_popularity: float = 0.0, prev_distance: float = 0.0, distance_change: float = 0.0,
    interval_weeks: float = 4.0, prev_top3_flag: float = 0.0, jockey_win_rate_te: float = 0.1
):
    """1頭単体のシンプルな GET 推論エンドポイント（テスト用）"""
    horse = HorseFeatures(
        wakuban=wakuban, umaban=umaban, kinryo=kinryo, tansho=tansho, ninki=ninki,
        nenrei=nenrei, seibetsu=seibetsu, bataiju_base=bataiju_base, bataiju_zohen=bataiju_zohen,
        prev_result=prev_result, prev_last3f=prev_last3f, prev_time_diff=prev_time_diff,
        prev_popularity=prev_popularity, prev_distance=prev_distance, distance_change=distance_change,
        interval_weeks=interval_weeks, prev_top3_flag=prev_top3_flag, jockey_win_rate_te=jockey_win_rate_te
    )
    data = RaceInput(venue=venue, horses=[horse])
    result = predict_race(data)
    return result.predictions[0]


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "loaded_models": list(models.keys()),
        "feature_count": len(FEATURE_ORDER),
        "features": FEATURE_ORDER
    }


@app.get("/api/venues")
def list_venues():
    return {
        "supported": SUPPORTED_VENUES,
        "loaded": list(models.keys()),
        "not_loaded": [v for v in SUPPORTED_VENUES if v not in models]
    }


# =============================================================================
# ローカル起動
# =============================================================================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
