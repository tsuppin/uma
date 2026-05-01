import lightgbm as lgb
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os

app = FastAPI(title="Tsuchiya Protocol-Omega Final API", description="High-Precision Win Probability Inference")

# --- 1. 学習済みモデルの読み込み ---
# 添付ファイルのテキストを 'final_horse_model.txt' としてサーバーに配置します
MODEL_PATH = 'final_horse_model.txt'

model = None
if os.path.exists(MODEL_PATH):
    try:
        # ファイルからBoosterをロード（既存の学習内容と木構造がすべて読み込まれます）
        model = lgb.Booster(model_file=MODEL_PATH)
    except Exception as e:
        print(f"モデルの読み込みに失敗しました: {e}")
else:
    print(f"警告: モデルファイル {MODEL_PATH} が見つかりません。")

# --- 2. 入力データの定義 ---
# モデルの feature_names に対応した入力データを受け取るスキーム
# ※ファイルに記載されている順番と完全に一致させる必要があります
class RaceInput(BaseModel):
    wakuban: float          # 枠番
    umaban: float           # 馬番
    kinryo: float           # 斤量
    tansho: float           # 単勝
    ninki: float            # 人気
    distance: float         # distance
    physics_penalty: float  # physics_penalty
    sire_bonus: float       # sire_bonus

# --- 3. 予測推論用エンドポイント ---
@app.post("/api/predict")
def predict_race(data: RaceInput):
    if model is None:
        raise HTTPException(status_code=503, detail="Final model is not loaded.")

    try:
        # 入力データを抽出し、モデルが期待する順序の1次元配列（1行 x 8列）に変換
        input_features = [
            data.wakuban,
            data.umaban,
            data.kinryo,
            data.tansho,
            data.ninki,
            data.distance,
            data.physics_penalty,
            data.sire_bonus
        ]
        input_data = np.array([input_features])
        
        # 推論の実行（sigmoidが設定されているため 0.0〜1.0 の確率値が出力されます）
        prediction = model.predict(input_data)
        
        return {
            "status": "success",
            "win_probability": float(prediction[0])
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ヘルスチェック
@app.get("/health")
def health_check():
    return {"status": "healthy", "final_model_loaded": model is not None}

# ローカルテスト用 (uvicorn main:app --reload で起動)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
