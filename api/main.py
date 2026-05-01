import lightgbm as lgb
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os

# FastAPIアプリケーションの初期化
app = FastAPI(title="Tsuchiya Protocol-Omega API", description="Predictive Inference Engine for Horse Racing")

# --- 1. 学習済みモデルの読み込み ---
# プロジェクトルートに配置されるモデルファイルを指定
MODEL_PATH = 'lightgbm_model.txt'

model = None
if os.path.exists(MODEL_PATH):
    try:
        # ファイルからBoosterをロード（ここでファイル内の全ての木構造や特徴量が読み込まれます）
        model = lgb.Booster(model_file=MODEL_PATH)
    except Exception as e:
        print(f"モデルの読み込みに失敗しました: {e}")
else:
    print(f"警告: モデルファイル {MODEL_PATH} が見つかりません。")

# --- 2. 入力データの定義 ---
# モデルの feature_names に対応した入力データを受け取るスキーム
class RaceInput(BaseModel):
    # 例: ground_type, distance, weather, track_condition など10個の特徴量を配列で受け取る
    features: list[float] 

# --- 3. 予測推論用エンドポイント ---
@app.post("/api/predict")
def predict_race(data: RaceInput):
    if model is None:
        raise HTTPException(status_code=503, detail="Model is not loaded.")
        
    try:
        # 入力データをNumPy配列に変換 (1行 x 特徴量数の2次元配列)
        input_data = np.array([data.features])
        
        # モデルによる推論実行
        # sigmoidが設定されているため、0.0〜1.0の確率値が出力されます
        prediction = model.predict(input_data)
        
        # 予測確率を返す (アンサンブルの入力値としてそのまま利用可能)
        return {
            "status": "success",
            "probability": float(prediction[0])
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ヘルスチェック
@app.get("/health")
def health_check():
    return {"status": "healthy", "model_loaded": model is not None}

# ローカルテスト用 (uvicorn main:app --reload で起動)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
