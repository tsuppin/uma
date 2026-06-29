# /// script
# requires-python = ">=3.9"
# dependencies = [
#     "pandas",
#     "numpy",
#     "scikit-learn",
#     "lightgbm",
#     "xgboost",
#     "catboost",
#     "joblib"
# ]
# ///

import pandas as pd
import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import lightgbm as lgb
import xgboost as xgb
from catboost import CatBoostRegressor, CatBoostClassifier
import warnings
warnings.filterwarnings('ignore')

def main():
    print("Starting training process for Central Keiba...")
    
    # 1. データの読み込み
    data_path = 'keiba_data/master_keiba_data.csv'
    if not os.path.exists(data_path):
        print(f"Error: Data file not found at {data_path}")
        return
        
    print(f"Loading data from {data_path}...")
    df = pd.read_csv(data_path)

    # 2. 中央競馬のフィルタリング
    central_venues = ['東京', '中山', '京都', '阪神', '中京', '小倉', '新潟', '福島', '札幌', '函館']
    initial_len = len(df)
    df = df[df['会場'].isin(central_venues)]
    print(f"Filtered Central Keiba venues: {len(df)} / {initial_len} rows retained.")

    # 3. 前処理・特徴量エンジニアリング
    target_rank = '着順_num'
    target_hit = '的中'
    
    # 欠損値の削除 (最低限ターゲットがない行は除外)
    df = df.dropna(subset=[target_rank, target_hit])

    # 特徴量とするカラム
    numeric_features = ['枠番', '馬番', '斤量', '単勝', '人気', '体重', '体重増減', '年齢']
    categorical_features = ['性別', '会場', '騎手', '調教師']
    
    # 実際のデータフレームに存在するカラムのみを使用する
    numeric_features = [col for col in numeric_features if col in df.columns]
    categorical_features = [col for col in categorical_features if col in df.columns]
    
    print(f"Numeric features: {numeric_features}")
    print(f"Categorical features: {categorical_features}")
    
    # NaNを補完（中央値や文字列置換）
    for col in numeric_features:
        df[col] = pd.to_numeric(df[col], errors='coerce')
        df[col] = df[col].fillna(df[col].median())
        
    for col in categorical_features:
        df[col] = df[col].fillna('unknown').astype(str)

    # Label Encoding
    encoders = {}
    for col in categorical_features:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
        encoders[col] = le
        
    features = numeric_features + categorical_features

    X = df[features]
    y_rank = df[target_rank]
    y_hit = df[target_hit]

    # データ分割
    X_train, X_test, y_rank_train, y_rank_test, y_hit_train, y_hit_test = train_test_split(
        X, y_rank, y_hit, test_size=0.2, random_state=42
    )

    # 的中率向上のため、上位着順（1〜3着）の学習を重視する重み（Loss Function調整の代替）
    weight_train_rank = np.where(y_rank_train <= 3, 5.0, 1.0)
    weight_test_rank = np.where(y_rank_test <= 3, 5.0, 1.0)

    # モデル保存ディレクトリの作成
    save_dir = 'latest_models/central_keiba'
    os.makedirs(save_dir, exist_ok=True)
    
    # --- 着順予測 (回帰) ---
    print("\n[1/2] Training Rank models (Regression)...")
    
    # LightGBM
    print(" - Training LightGBM...")
    lgb_rank = lgb.LGBMRegressor(random_state=42, n_estimators=200, n_jobs=-1, objective='rmse')
    lgb_rank.fit(X_train, y_rank_train, sample_weight=weight_train_rank, eval_set=[(X_test, y_rank_test)], eval_sample_weight=[weight_test_rank])
    joblib.dump(lgb_rank, os.path.join(save_dir, 'lgb_rank_model.pkl'))
    
    # XGBoost
    print(" - Training XGBoost...")
    xgb_rank = xgb.XGBRegressor(random_state=42, n_estimators=200, n_jobs=-1, objective='reg:squarederror')
    xgb_rank.fit(X_train, y_rank_train, sample_weight=weight_train_rank, eval_set=[(X_test, y_rank_test)], sample_weight_eval_set=[weight_test_rank], verbose=False)
    xgb_rank.save_model(os.path.join(save_dir, 'xgb_rank_model.json'))
    
    # CatBoost
    print(" - Training CatBoost...")
    cat_features_indices = [X.columns.get_loc(c) for c in categorical_features]
    cat_rank = CatBoostRegressor(random_state=42, iterations=200, verbose=False, thread_count=-1, loss_function='RMSE')
    cat_rank.fit(X_train, y_rank_train, sample_weight=weight_train_rank, cat_features=cat_features_indices, eval_set=(X_test, y_rank_test))
    cat_rank.save_model(os.path.join(save_dir, 'cat_rank_model.cbm'))

    # --- 的中予測 (分類) ---
    print("\n[2/2] Training Hit models (Classification)...")
    
    # LightGBM
    print(" - Training LightGBM...")
    lgb_hit = lgb.LGBMClassifier(random_state=42, n_estimators=200, n_jobs=-1, class_weight='balanced')
    lgb_hit.fit(X_train, y_hit_train, eval_set=[(X_test, y_hit_test)])
    joblib.dump(lgb_hit, os.path.join(save_dir, 'lgb_hit_model.pkl'))
    
    # XGBoost
    print(" - Training XGBoost...")
    # 的中（1）の割合が少ないため、scale_pos_weight等でバランスをとる（ここでは簡単化のためデフォルトに近い形で）
    xgb_hit = xgb.XGBClassifier(random_state=42, n_estimators=200, n_jobs=-1, scale_pos_weight=3)
    xgb_hit.fit(X_train, y_hit_train, eval_set=[(X_test, y_hit_test)], verbose=False)
    xgb_hit.save_model(os.path.join(save_dir, 'xgb_hit_model.json'))
    
    # CatBoost
    print(" - Training CatBoost...")
    cat_hit = CatBoostClassifier(random_state=42, iterations=200, verbose=False, thread_count=-1, auto_class_weights='Balanced')
    cat_hit.fit(X_train, y_hit_train, cat_features=cat_features_indices, eval_set=(X_test, y_hit_test))
    cat_hit.save_model(os.path.join(save_dir, 'cat_hit_model.cbm'))

    # エンコーダと特徴量リストの保存
    joblib.dump(encoders, os.path.join(save_dir, 'label_encoders.pkl'))
    joblib.dump(features, os.path.join(save_dir, 'feature_cols.pkl'))
    
    print("\nSuccess! All models trained and saved to 'latest_models/central_keiba'.")

if __name__ == '__main__':
    main()
