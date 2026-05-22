"""
api/main.py
=============================================================================
Tsuchiya Protocol-Omega API
32特徴量対応版（前走データ + 騎手・種牡馬・調教師TE + 地方競馬特化ファクター + 物理環境ファクター追加）

特徴量一覧（順序厳守）:
  [ベース 15]
  1.  wakuban            枠番
  2.  umaban             馬番
  3.  kinryo             斤量
  4.  tansho             単勝オッズ
  5.  ninki              人気
  6.  nenrei             年齢
  7.  seibetsu           性別 (牡=0, 牝=1, セン=2)
  8.  bataiju_base       馬体重（kg）
  9.  bataiju_zohen      馬体重増減（kg）
  10. kinryo_weight_ratio 斤量体重比（斤量 / 馬体重）
  11. race_month         出走月（1〜12）
  12. cushion_value      クッション値 (デフォルト: 9.5)
  13. moisture           含水率 (デフォルト: 10.0)
  14. is_roberto_line    Roberto系種牡馬フラグ（1.0=該当, 0.0=非該当）
  15. is_heavy_track_sire 道悪パワー型種牡馬フラグ（1.0=該当, 0.0=非該当）

  [前走・展開 14]
  16. prev_result        前走着順
  17. prev_last3f        前走上がり3F（秒）
  18. prev_time_diff     前走タイム差（1着との差・秒）
  19. prev_popularity    前走人気
  20. prev_distance      前走距離（m）
  21. distance_change    距離変化（今走 - 前走, m）
  22. interval_weeks     出走間隔（週）
  23. prev_top3_flag     前走3着以内フラグ（0 or 1）
  24. is_jockey_changed  乗り替わりフラグ（0=継続, 1=乗り替わり）
  25. jockey_te_diff     今走と前走の騎手TE勝率の差分（強化乗り替わり指標）
  26. is_transfer        転入初戦フラグ（前走と競馬場が異なれば1.0）
  27. class_drop_flag    降級馬フラグ（前走からクラスが落ちていれば1.0）
  28. first_corner_pos   前走初角順位（例: 3-3-2 なら 3.0）
  29. makuri_flag        前走マクリフラグ（道中で順位を3つ以上上げたら1.0）

  [Target Encoding 3]
  30. jockey_win_rate_te 騎手×会場の勝率（Target Encoding）
  31. sire_win_rate_te   種牡馬×会場の勝率（Target Encoding）
  32. trainer_win_rate_te 調教師×会場の勝率（Target Encoding）
=============================================================================
"""

import sys
import io
import os
import glob
from contextlib import asynccontextmanager
import lightgbm as lgb
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# =============================================================================
# API メタデータ定義
# =============================================================================
import sys
sys.path.append('Keiba_AI_Models')
try:
    import keiba_system
    import pandas as pd
    import sqlite3
    import datetime
    V5_ENABLED = True
except ImportError:
    V5_ENABLED = False
    print("⚠️ Keiba_AI_Models のインポートに失敗したため、v5 APIは無効化されます。")

app = FastAPI(
    title="Tsuchiya Protocol-Omega API",
    description="32特徴量対応 競馬予測推論エンジン",
    version="4.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
    kinryo_weight_ratio: float = Field(default=0.114, description="斤量体重比")
    race_month:         float = Field(default=6.0, description="出走月")
    cushion_value:      float = Field(default=9.5, description="クッション値")
    moisture:           float = Field(default=10.0, description="含水率")
    is_roberto_line:    float = Field(default=0.0, description="Roberto系フラグ")
    is_heavy_track_sire: float = Field(default=0.0, description="道悪パワー型種牡馬フラグ")
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
    is_transfer:        float = Field(default=0.0, description="転入初戦フラグ")
    class_drop_flag:    float = Field(default=0.0, description="降級馬フラグ")
    first_corner_pos:   float = Field(default=0.0, description="前走初角位置")
    makuri_flag:        float = Field(default=0.0, description="前走マクリフラグ")
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


class V5HorseInput(BaseModel):
    horse_number: int
    horse_name: str
    jockey: str
    trainer: str
    sire: str = "不明"
    broodmare_sire: str = "不明"
    horse_weight: float
    jockey_weight: float
    
class V5RaceInput(BaseModel):
    venue: str
    distance: int
    horses: list[V5HorseInput]

class V5LearnInput(BaseModel):
    venue: str
    distance: int
    results: list[dict] # {horse_number, horse_name, jockey, trainer, horse_weight, jockey_weight, actual_rank}

# =============================================================================
# ヘルパー関数
# =============================================================================

FEATURE_ORDER = [
    'wakuban', 'umaban', 'kinryo', 'tansho', 'ninki',
    'nenrei', 'seibetsu', 'bataiju_base', 'bataiju_zohen',
    'kinryo_weight_ratio', 'race_month',
    'cushion_value', 'moisture',
    'is_roberto_line', 'is_heavy_track_sire',
    'prev_result', 'prev_last3f', 'prev_time_diff', 'prev_popularity',
    'prev_distance', 'distance_change', 'interval_weeks', 'prev_top3_flag',
    'is_jockey_changed', 'jockey_te_diff',
    'is_transfer', 'class_drop_flag', 'first_corner_pos', 'makuri_flag',
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


@app.post("/api/predict/v5", response_model=PredictionResponse)
def predict_v5(data: V5RaceInput):
    if not V5_ENABLED:
        raise HTTPException(status_code=500, detail="v5モデルが利用できません")
    
    records = []
    for h in data.horses:
        pwr = h.horse_weight / h.jockey_weight if h.jockey_weight > 0 else 0
        inertia = h.horse_weight * h.jockey_weight
        records.append({
            'distance': data.distance,
            'track_name': data.venue,
            'horse_number': h.horse_number,
            'horse_name': h.horse_name,
            'jockey': h.jockey,
            'trainer': h.trainer,
            'sire': h.sire,
            'broodmare_sire': h.broodmare_sire,
            'horse_weight': h.horse_weight,
            'jockey_weight': h.jockey_weight,
            'pwr': pwr,
            'inertia': inertia
        })
        
    df_race = pd.DataFrame(records)
    df_encoded = keiba_system.encoder.fit_transform(df_race, is_train=False)
    darkness = keiba_system.predict_darkness(df_encoded)
    
    predictions = []
    for i, score in enumerate(darkness):
        predictions.append(
            HorsePrediction(
                horse_index=i,
                top3_probability=float(score),
                rank_score=float(score * 100)
            )
        )
        
    return PredictionResponse(
        venue=data.venue,
        horse_count=len(data.horses),
        predictions=predictions
    )


@app.post("/api/learn/v5")
def learn_v5(data: V5LearnInput):
    if not V5_ENABLED:
        raise HTTPException(status_code=500, detail="v5モデルが利用できません")
    
    records = []
    today = datetime.datetime.now().strftime('%Y年%m月%d日')
    for r in data.results:
        horse_weight = float(r.get('horse_weight', 480))
        jockey_weight = float(r.get('jockey_weight', 55))
        pwr = horse_weight / jockey_weight if jockey_weight > 0 else 0
        inertia = horse_weight * jockey_weight
        
        records.append((
            today, data.venue, 1, data.distance,
            int(r.get('horse_number', 0)), str(r.get('horse_name', '不明')), 
            str(r.get('jockey', '不明')), str(r.get('trainer', '不明')),
            '不明', '不明', horse_weight, jockey_weight,
            pwr, inertia, 0.0,
            int(r.get('actual_rank', 99)), 0.0, 1
        ))
        
    try:
        conn = sqlite3.connect(keiba_system.DB_PATH)
        conn.executemany('''
            INSERT INTO training_logs (
                date, track_name, race_num, distance,
                horse_number, horse_name, jockey, trainer,
                sire, broodmare_sire, horse_weight, jockey_weight,
                pwr, inertia, darkness_score,
                actual_rank, actual_time, is_truth
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', records)
        conn.commit()
        conn.close()
        
        # キック
        keiba_system.full_retraining()
        return {"status": "success", "message": "v5 full_retraining completed."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# ローカル起動
# =============================================================================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
