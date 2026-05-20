"""
accumulate_data.py

=============================================================================
Tsuchiya Protocol-Omega - テキストベース結果蓄積スクリプト
=============================================================================
ユーザーから提供された「レース結果テキスト（.txt）」をパースして正解ラベル（target）付きの
32次元特徴量を生成し、該当する競馬場のマスターデータ（CSV）へ追記します。

使用方法:
  py accumulate_data.py --file レース結果.txt --venue 大井 --csv data/ooi/ooi_full.csv
"""

import argparse
import os
import sys
import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ml.build_training_data import build_df_from_file

def main():
    parser = argparse.ArgumentParser(description='レース結果テキストをマスターCSVに蓄積する')
    parser.add_argument('--file', '-f', required=True, help='レース結果のテキストファイル')
    parser.add_argument('--venue', '-v', required=True, help='対象の競馬場（例: 大井）')
    parser.add_argument('--csv', '-c', required=False, help='追記先のCSVファイルパス。省略時は自動推論')
    
    args = parser.parse_args()
    
    if not os.path.exists(args.file):
        print(f"❌ エラー: 結果テキストファイルが見つかりません ({args.file})")
        sys.exit(1)
        
    print(f"⏳ テキストを解析しています: {args.file} (モード: 成績表)")
    df_new = build_df_from_file(args.file, venue_filter=args.venue, mode='result')
    
    if df_new.empty:
        print("❌ 解析に失敗したか、有効な成績データが見つかりませんでした。")
        sys.exit(1)
        
    # 追記先CSVの決定
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    JP_TO_ROMAN = {
        '東京': 'tokyo', '中山': 'nakayama', '京都': 'kyoto', '阪神': 'hanshin',
        '中京': 'chukyo', '札幌': 'sapporo', '函館': 'hakodate', '福島': 'fukushima',
        '新潟': 'niigata', '小倉': 'kokura', '大井': 'ooi', '笠松': 'kasamatsu',
        '川崎': 'kawasaki', '船橋': 'funabashi', '浦和': 'urawa', '盛岡': 'morioka',
        '金沢': 'kanazawa'
    }
    
    target_csv = args.csv
    if not target_csv:
        roman_venue = JP_TO_ROMAN.get(args.venue, args.venue.lower())
        target_csv = os.path.join(base_dir, 'data', roman_venue, f"{roman_venue}_full.csv")
        
    print(f"📝 追記先データベース: {target_csv}")
    
    # CSVが存在しない場合は新規作成、存在する場合は追記
    if not os.path.exists(target_csv):
        # ディレクトリの作成
        os.makedirs(os.path.dirname(target_csv), exist_ok=True)
        print("⚠️  CSVファイルが存在しません。新規作成します。")
        df_new.to_csv(target_csv, index=False, encoding='utf-8-sig')
        print(f"✅ {len(df_new)}件のデータを新規保存しました。")
    else:
        # 既存CSVのバックアップを作成しておく（安全性確保）
        backup_csv = target_csv + ".bak"
        import shutil
        shutil.copy2(target_csv, backup_csv)
        
        # 既存データ件数確認
        df_existing = pd.read_csv(target_csv)
        print(f"📊 現在のデータ件数: {len(df_existing)}行")
        
        # ヘッダーなしで追記
        df_new.to_csv(target_csv, mode='a', header=False, index=False, encoding='utf-8-sig')
        print(f"✅ {len(df_new)}件のデータを追記しました。")
        print(f"📊 新しい総データ件数: {len(df_existing) + len(df_new)}行")
        print(f"💡 バックアップを {backup_csv} に作成しました。")

    print("\n🎉 データの蓄積が完了しました！")
    print("   次回のモデル再学習時に、このデータが学習に反映されます。")

if __name__ == "__main__":
    main()
