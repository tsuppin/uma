import pandas as pd
import numpy as np
import lightgbm as lgb
import os

# --- 1. データの読み込みと統合 ---
# スキーマが統一されている raw データ（_full.csv）をベースに結合します。
file_list = [
    "chukyo_2022_full.csv", 
    "chukyo_2023_full.csv", 
    "chukyo_2024_full.csv", 
    "chukyo_2025_full.csv"
]

df_list = []
for file in file_list:
    if os.path.exists(file):
        df_temp = pd.read_csv(file)
        df_list.append(df_temp)
    else:
        print(f"Warning: {file} が見つかりません。")

if not df_list:
    print("Error: 学習対象のデータファイルが一つも見つかりません。")
else:
    # 全年分のデータを縦に結合
    df = pd.concat(df_list, ignore_index=True)

    # --- 2. データの前処理（物理的・統計的モデリングのためのクレンジング） ---

    # 着順のクレンジング（「除外」や「取消」などの非数値を排除）
    df['着順'] = pd.to_numeric(df['着順'], errors='coerce')
    df = df.dropna(subset=['着順'])

    # 目的変数の設定（例：3着以内に入る確率を予測する2値分類モデル）
    df['target'] = (df['着順'] <= 3).astype(int)

    # 複合テキストデータ（性齢）から「性別」と「年齢」を分離
    df['性別'] = df['性齢'].str[0]
    df['年齢'] = pd.to_numeric(df['性齢'].str[1:], errors='coerce')

    # 複合テキストデータ（馬体重）から「基礎体重」と「増減」を分離（例: "480(+2)" -> 480, 2）
    df['馬体重_base'] = df['馬体重'].str.extract(r'^(\d+)').astype(float)
    df['馬体重_増減'] = df['馬体重'].str.extract(r'\(([-+]?\d+)\)').astype(float)

    # 数値化が必要なカラムの型変換
    numeric_cols = ['枠番', '馬番', '斤量', '単勝', '人気']
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce')

    # 性別をカテゴリ変数用の数値（Label Encoding）に変換
    df['性別'] = df['性別'].map({'牡': 0, '牝': 1, 'セ': 2, 'セ': 2}) # セン馬の表記揺れ対応含め

    # --- 3. 学習に使用する特徴量の選択 ---
    features = [
        '枠番', '馬番', '斤量', '単勝', '人気', 
        '年齢', '性別', '馬体重_base', '馬体重_増減'
    ]

    X = df[features]
    y = df['target']

    # --- 4. LightGBMによるモデル学習 ---
    # LightGBM用のデータセット作成（性別をカテゴリカル特徴量として明示）
    train_data = lgb.Dataset(X, label=y, categorical_feature=['性別'])

    # モデルパラメータの設定
    params = {
        'objective': 'binary',        # 2値分類（確率出力用）
        'metric': 'binary_logloss',
        'boosting_type': 'gbdt',
        'learning_rate': 0.05,
        'num_leaves': 31,
        'max_depth': -1,
        'verbose': -1
    }

    print(f"総データ数 {len(df)} 件の学習を開始します...")
    model = lgb.train(
        params,
        train_data,
        num_boost_round=200
    )
    print("学習が完了しました。")

    # --- 5. モデルの保存 ---
    # WEBアプリ（API）側で即時ロードできるよう、テキスト形式で保存します。
    model_path = 'chukyo_ensemble_model.txt'
    model.save_model(model_path)
    print(f"モデルファイルを出力しました: {model_path}")
