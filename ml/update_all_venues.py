#!/usr/bin/env python3
# =============================================================================
# ml/update_all_venues.py
# 既存の全競馬場モデル（9場）を前走特徴量追加版に一括更新するスクリプト
# =============================================================================

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from train_utils import preprocess_common, ALL_FEATURES, get_available_features, train_and_save_model

import pandas as pd

# =============================================================================
# 各競馬場の設定定義
# =============================================================================

VENUE_CONFIGS = [
    {
        "name": "chukyo",
        "display": "中京",
        "files": ["chukyo_2022_full.csv", "chukyo_2023_full.csv",
                  "chukyo_2024_full.csv", "chukyo_2025_full.csv"],
        "params": {
            # 中京: シリカ砂50%のタフなダート → min_child_samples大きめで安定化
            "num_leaves": 63,
            "learning_rate": 0.05,
        }
    },
    {
        "name": "fukushima",
        "display": "福島",
        "files": ["fukushima_2022_full.csv", "fukushima_2023_full.csv",
                  "fukushima_2024_full.csv", "fukushima_2025_full.csv"],
        "params": {
            # 福島: ローカル開催でデータ量が少なめ → num_leaves小さめ
            "num_leaves": 31,
            "learning_rate": 0.05,
        }
    },
    {
        "name": "hakodate",
        "display": "函館",
        "files": ["hakodate_2022_full.csv", "hakodate_2023_full.csv",
                  "hakodate_2024_full.csv", "hakodate_2025_full.csv"],
        "params": {
            # 函館: 夏ローカル・洋芝 → 特徴は少なめだが洋芝特性を捉える
            "num_leaves": 31,
            "learning_rate": 0.05,
        }
    },
    {
        "name": "hanshin",
        "display": "阪神",
        "files": ["hanshin_2022_full.csv", "hanshin_2023_full.csv",
                  "hanshin_2024_full.csv", "hanshin_2025_full.csv"],
        "params": {
            # 阪神: G1多数・データ量豊富 → num_leaves拡大
            "num_leaves": 63,
            "learning_rate": 0.04,
        }
    },
    {
        "name": "kokura",
        "display": "小倉",
        "files": ["kokura_2022_full.csv", "kokura_2023_full.csv",
                  "kokura_2024_full.csv", "kokura_2025_full.csv"],
        "params": {
            "num_leaves": 31,
            "learning_rate": 0.05,
        }
    },
    {
        "name": "kyoto",
        "display": "京都",
        "files": ["kyoto_2022_full.csv", "kyoto_2023_full.csv",
                  "kyoto_2024_full.csv", "kyoto_2025_full.csv"],
        "params": {
            # 京都: 内回り・外回りの2コース存在 → 表現力上げる
            "num_leaves": 63,
            "learning_rate": 0.04,
        }
    },
    {
        "name": "nakayama",
        "display": "中山",
        "files": ["nakayama_2022_full.csv", "nakayama_2023_full.csv",
                  "nakayama_2024_full.csv", "nakayama_2025_full.csv"],
        "params": {
            # 中山: 急坂・内枠有利が明確 → 枠順の非線形性を捉える
            "num_leaves": 63,
            "learning_rate": 0.04,
        }
    },
    {
        "name": "niigata",
        "display": "新潟",
        "files": ["niigata_2022_full.csv", "niigata_2023_full.csv",
                  "niigata_2024_full.csv", "niigata_2025_full.csv"],
        "params": {
            # 新潟: 千直（芝1000m）などユニークなコースあり
            "num_leaves": 63,
            "learning_rate": 0.05,
        }
    },
    {
        "name": "sapporo",
        "display": "札幌",
        "files": ["sapporo_2022_full.csv", "sapporo_2023_full.csv",
                  "sapporo_2024_full.csv", "sapporo_2025_full.csv"],
        "params": {
            # 札幌: 夏ローカル・洋芝（函館と同様）
            "num_leaves": 31,
            "learning_rate": 0.05,
        }
    },
]


# =============================================================================
# 一括更新実行
# =============================================================================

def run_all():
    results = []

    for config in VENUE_CONFIGS:
        venue_name = config["name"]
        display    = config["display"]
        file_list  = config["files"]

        print(f"\n{'='*60}")
        print(f"  🏇  {display}（{venue_name}）の更新を開始します")
        print(f"{'='*60}")

        # -- データ読み込み --
        df_list = []
        for file in file_list:
            if os.path.exists(file):
                df_temp = pd.read_csv(file)
                df_list.append(df_temp)
                print(f"  ✅ {file}: {len(df_temp)} 行")
            else:
                print(f"  ⚠️  {file}: 見つかりません（スキップ）")

        if not df_list:
            print(f"  ❌ {display}: データが一件もないのでスキップします")
            results.append({"venue": display, "status": "SKIP", "rows": 0})
            continue

        df = pd.concat(df_list, ignore_index=True)

        # -- 共通前処理（前走特徴量 + Target Encoding）--
        df = preprocess_common(df)

        # -- モデル学習・保存 --
        model = train_and_save_model(
            df=df,
            features=ALL_FEATURES,
            venue_name=venue_name,
            model_params=config.get("params"),
            num_boost_round=300,
        )

        results.append({
            "venue": display,
            "status": "OK",
            "rows": len(df),
            "model_path": f"{venue_name}_ensemble_model.txt"
        })

    # -- 結果サマリー --
    print(f"\n{'='*60}")
    print("  📋 更新結果サマリー")
    print(f"{'='*60}")
    for r in results:
        status_icon = "✅" if r["status"] == "OK" else "⚠️ "
        msg = f"  {status_icon} {r['venue']:<6}"
        if r["status"] == "OK":
            msg += f"  {r['rows']:>6} 件  → {r['model_path']}"
        else:
            msg += "  データなし（スキップ）"
        print(msg)

    ok_count = sum(1 for r in results if r["status"] == "OK")
    print(f"\n  合計 {ok_count}/{len(VENUE_CONFIGS)} 場のモデルを更新しました。")


if __name__ == "__main__":
    run_all()
