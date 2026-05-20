"""
predict_race.py

=============================================================================
Tsuchiya Protocol-Omega - テキストベース予想実行スクリプト
=============================================================================
ユーザーから提供された「出馬表テキスト（.txt）」をパースして32次元の特徴量を生成し、
学習済みのLightGBMモデルを用いて各馬の予測スコアと予想印（◎ ◯ ▲ △）を出力します。

使用方法:
  py predict_race.py --file 予想したい出馬表.txt --venue 大井
"""

import argparse
import os
import sys
import pandas as pd
import lightgbm as lgb

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ml.build_training_data import build_df_from_file
from ml.train_utils import preprocess_common, ALL_FEATURES

# 競馬場名（日本語）からローマ字へのマッピング（モデルファイル名解決用）
JP_TO_ROMAN = {
    '東京': 'tokyo',
    '中山': 'nakayama',
    '京都': 'kyoto',
    '阪神': 'hanshin',
    '中京': 'chukyo',
    '札幌': 'sapporo',
    '函館': 'hakodate',
    '福島': 'fukushima',
    '新潟': 'niigata',
    '小倉': 'kokura',
    '大井': 'ooi',
    '笠松': 'kasamatsu',
    '川崎': 'kawasaki',
    '船橋': 'funabashi',
    '浦和': 'urawa',
    '盛岡': 'morioka',
    '金沢': 'kanazawa'
}

def predict(df: pd.DataFrame, venue: str):
    if df.empty:
        print("❌ 解析に失敗したか、出走馬データが見つかりませんでした。")
        return

    # 会場名の解決
    roman_venue = JP_TO_ROMAN.get(venue, venue.lower())
    
    # 欠損埋め等の前処理
    df = preprocess_common(df)
    
    # 特徴量のフィルタリング
    available_features = [f for f in ALL_FEATURES if f in df.columns]
    if len(available_features) < len(ALL_FEATURES):
        missing = set(ALL_FEATURES) - set(available_features)
        print(f"⚠️  一部の特徴量が欠損しています。0で埋め合わせます: {missing}")
        for col in missing:
            df[col] = 0.0
            
    X = df[ALL_FEATURES]
    
    # モデルのロード
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, 'api', 'models', f"{roman_venue}.txt")
    
    if not os.path.exists(model_path):
        print(f"❌ エラー: 学習済みモデルが見つかりません: {model_path}")
        print("   先に該当競馬場のモデルを学習させてください。")
        return
        
    print(f"✅ モデルロード完了: {model_path}")
    booster = lgb.Booster(model_file=model_path)
    
    # 推論
    preds = booster.predict(X)
    
    # 結果の整理
    results = []
    for i, pred in enumerate(preds):
        horse_name = df.iloc[i].get('horse_name', f'馬{i+1}')
        horse_num = df.iloc[i].get('馬番', i+1)
        jockey = df.iloc[i].get('jockey', '不明')
        sire = df.iloc[i].get('sire', '不明')
        results.append({
            '馬番': int(horse_num),
            '馬名': horse_name,
            '騎手': jockey,
            '種牡馬': sire,
            'スコア': float(pred)
        })
        
    # スコア降順ソート
    results.sort(key=lambda x: x['スコア'], reverse=True)
    
    # 印の付与
    marks = ['◎', '◯', '▲', '△', '△', '△']
    
    print(f"\n===========================================================")
    print(f"🚀 {venue}競馬 予測結果（{len(results)}頭立て）")
    print(f"===========================================================\n")
    
    print(f"{'印':<2} {'馬番':<3} {'馬名':<15} {'スコア':<8} {'騎手':<10} {'種牡馬'}")
    print("-" * 60)
    for i, res in enumerate(results):
        mark = marks[i] if i < len(marks) else "  "
        print(f"{mark:<2} {res['馬番']:<4} {res['馬名']:<15} {res['スコア']:.4f}   {res['騎手']:<10} {res['種牡馬']}")
        
    print("\n※スコアは上位3着以内に入る確率（シグモイド出力）を示します。")

def main():
    parser = argparse.ArgumentParser(description='出馬表テキストから予測を実行する')
    parser.add_argument('--file', '-f', required=True, help='出馬表のテキストファイル')
    parser.add_argument('--venue', '-v', required=True, help='対象の競馬場（例: 大井）')
    
    args = parser.parse_args()
    
    if not os.path.exists(args.file):
        print(f"❌ エラー: ファイルが見つかりません ({args.file})")
        sys.exit(1)
        
    print(f"⏳ テキストを解析しています: {args.file} (モード: 出馬表)")
    df = build_df_from_file(args.file, venue_filter=args.venue, mode='past')
    
    predict(df, args.venue)

if __name__ == "__main__":
    main()
