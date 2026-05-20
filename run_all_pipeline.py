"""
run_all_pipeline.py

=============================================================================
Tsuchiya Protocol-Omega - 一斉データ生成＆再学習バッチ
=============================================================================
このスクリプトは、`data/` ディレクトリ配下に配置された各競馬場のテキストファイルを自動検知し、
1. 32次元の学習用CSVデータの生成（build_training_data.py の呼び出し）
2. LightGBMモデルの再学習（train_[venue].py の呼び出し）
を全自動で実行します。

[ディレクトリ構造の前提]
keiba_app/
  ├─ data/
  │   ├─ tokyo/
  │   │   └─ tokyo_2024.txt
  │   ├─ ooi/
  │   │   └─ ooi_2024.txt
  ...
"""

import os
import subprocess
import glob
import sys

# 競馬場名（英名）と日本語名のマッピング
VENUE_MAP = {
    'tokyo': '東京',
    'nakayama': '中山',
    'kyoto': '京都',
    'hanshin': '阪神',
    'chukyo': '中京',
    'sapporo': '札幌',
    'hakodate': '函館',
    'fukushima': '福島',
    'niigata': '新潟',
    'kokura': '小倉',
    'ooi': '大井',
    'kasamatsu': '笠松',
    'kawasaki': '川崎',
    'funabashi': '船橋',
    'urawa': '浦和',
    'morioka': '盛岡',
    'kanazawa': '金沢'
}

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, 'data')
    ml_dir = os.path.join(base_dir, 'ml')
    
    if not os.path.exists(data_dir):
        print(f"❌ エラー: {data_dir} が見つかりません。")
        print("   プロジェクトのルートに 'data' フォルダを作成し、テキストデータを配置してください。")
        sys.exit(1)

    # dataフォルダ内のサブディレクトリ（競馬場）を取得
    venues = [d for d in os.listdir(data_dir) if os.path.isdir(os.path.join(data_dir, d))]
    
    if not venues:
        print("⚠️  データフォルダが空です。'data/tokyo/' のようなフォルダを作成しテキストを入れてください。")
        sys.exit(0)

    print(f"🚀 一斉学習パイプラインを開始します。対象競馬場: {venues}\n")

    for venue in venues:
        venue_path = os.path.join(data_dir, venue)
        txt_files = glob.glob(os.path.join(venue_path, "*.txt"))
        
        if not txt_files:
            print(f"⏭️  [{venue}] テキストファイルが見つからないためスキップします。")
            continue
            
        print(f"===========================================================")
        print(f"🔥 [{venue}] パイプライン開始")
        print(f"===========================================================")
        
        jp_venue_name = VENUE_MAP.get(venue, venue)
        out_csv = os.path.join(venue_path, f"{venue}_full.csv")
        
        # 1. データ生成 (build_training_data.py)
        print(f"\n[1/2] 📝 テキストデータから学習用CSVを生成中... ({len(txt_files)} ファイル)")
        build_cmd = [
            sys.executable, 
            os.path.join(ml_dir, 'build_training_data.py'),
            '--dir', venue_path,
            '--venue', jp_venue_name,
            '--out', out_csv
        ]
        
        try:
            subprocess.run(build_cmd, check=True)
            print(f"✅ CSV生成完了: {out_csv}")
        except subprocess.CalledProcessError as e:
            print(f"❌ CSV生成中にエラーが発生しました: {e}")
            continue

        # 2. モデル再学習 (train_*.py)
        train_script = os.path.join(ml_dir, f"train_{venue}.py")
        if not os.path.exists(train_script):
            print(f"⚠️  学習スクリプトが見つかりません: {train_script}")
            print(f"   この競馬場モデルの自動学習はスキップされます。")
            continue
            
        print(f"\n[2/2] 🧠 LightGBMモデルを再学習中...")
        train_cmd = [sys.executable, train_script]
        
        try:
            # 実行ディレクトリを ml_dir ではなく base_dir（ルート）に統一するか、
            # train_*.py 内で data/ フォルダを参照できるようにする
            # ※ 各 train_*.py は現在カレントディレクトリのcsvを探す実装になっている場合は注意
            # ここでは train_script を呼び出すが、cwd=venue_path にすることで、
            # train_*.py がカレントの `[venue]_full.csv` を読めるようにする。
            subprocess.run(train_cmd, cwd=venue_path, check=True)
            print(f"✅ モデル学習完了: {venue}")
        except subprocess.CalledProcessError as e:
            print(f"❌ モデル学習中にエラーが発生しました: {e}")

    print(f"\n🎉 全てのパイプライン処理が完了しました！")

if __name__ == "__main__":
    main()
