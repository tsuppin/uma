import pandas as pd
import numpy as np
import lightgbm as lgb
import os

# --- 1. データの読み込みと統合 ---
file_list = [
    "fukushima_2022_full.csv", 
    "fukushima_2023_full.csv", 
    "fukushima_2024_full.csv", 
    "fukushima_2025_full.csv"
]

df_list = []
for file in file_list:
    if os.path.exists(file):
        # データの読み込み
        df_temp = pd.read_csv(file)
        df_list.append(df_temp)
    else:
        print(f"Error: {file} が見つかりません。")

if not df_list:
    print("Error: 学習対象のデータファイルが一つも見つかりません。")
else:
    # 4年分のデータを結合
    df = pd.concat(df_list, ignore_index=True)

    # --- 2. データの前処理（データクレンジングと特徴量エンジニアリング） ---

    # 「着順」のクレンジング（取消・除外などの文字列データを除外）
    df['着順'] = pd.to_numeric(df['着順'], errors='coerce')
    df = df.dropna(subset=['着順'])

    # 目的変数（target）の設定: 3着以内を1、それ以外を0とする2値分類
    df['target'] = (df['着順'] <= 3).astype(int)

    # 「性齢」カラムを「性別」と「年齢」に分割（例: 牝4 -> 性別:牝, 年齢:4）
    df['性別'] = df['性齢'].str[0]
    df['年齢'] = pd.to_numeric(df['性齢'].str[1:], errors='coerce')

    # 「馬体重」カラムを「基準体重」と「増減」に分割（例: 460(+4) -> 460, 4）
    df['馬体重_base'] = df['馬体重'].str.extract(r'^(\d+)').astype(float)
    df['馬体重_増減'] = df['馬体重'].str.extract(r'\(([-+]?\d+)\)').astype(float)

    # 数値として扱うべきカラムの型変換
    numeric_cols = ['枠番', '馬番', '斤量', '単勝', '人気']
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce')

    # 性別をモデルが解釈可能な数値（Label Encoding）に変換
    df['性別'] = df['性別'].map({'牡': 0, '牝': 1, 'セ': 2})

    # --- 3. 特徴量（Features）と目的変数（Target）の定義 ---
    features = [
        '枠番', '馬番', '斤量', '単勝', '人気', 
        '年齢', '性別', '馬体重_base', '馬体重_増減'
    ]

    X = df[features]
    y = df['target']

    # --- 4. LightGBMモデルの学習実行 ---
    # 性別をカテゴリカル変数として指定
    train_data = lgb.Dataset(X, label=y, categorical_feature=['性別'])

    params = {
        'objective': 'binary',
        'metric': 'binary_logloss',
        'boosting_type': 'gbdt',
        'learning_rate': 0.05,
        'num_leaves': 31,
        'max_depth': -1,
        'verbose': -1
    }

    print(f"福島データ総件数 {len(df)} 件の学習を開始します。")
    model = lgb.train(
        params,
        train_data,
        num_boost_round=200
    )
    print("学習プロセスが完了しました。")

    # --- 5. モデルファイルの出力 ---
    # WEBアプリの推論APIで読み込むためのテキスト形式で保存
    output_model_path = 'fukushima_model.txt'
    model.save_model(output_model_path)
    print(f"モデルを出力しました: {output_model_path}")
