import requests
from bs4 import BeautifulSoup
import time

def fetch_race_data(race_id):
    """netkeibaから対象レースの出馬表データを取得する関数"""
    # ターゲットURLの構築
    url = f"https://race.netkeiba.com/race/shutuba.html?race_id={race_id}"
    print(f"🔍 ネット競馬からデータ抽出中... URL: {url}")

    # 【重要】相手サーバーに負荷をかけないための1秒待機（スクレイピングの基本マナー）
    time.sleep(1)

    # WebページのHTMLデータを取得
    headers = {'User-Agent': 'Mozilla/5.0'} # ロボット弾きを回避
    response = requests.get(url, headers=headers)
    
    # netkeibaは文字コードがEUC-JPなので、文字化け対策を行う
    response.encoding = 'EUC-JP'
    soup = BeautifulSoup(response.text, 'html.parser')

    # 1. レース名の抽出
    race_title_elem = soup.find('div', class_='RaceName')
    race_title = race_title_elem.text.strip() if race_title_elem else "不明なレース"

    # 2. 出走馬リストの抽出
    horse_data_list = []
    # 'HorseList'というクラス名がついたHTMLの行(trタグ)を全て探す
    horses = soup.find_all('tr', class_='HorseList')

    for horse in horses:
        try:
            # 必要な情報をHTMLタグから削り出す
            umaban = horse.find('td', class_='Umaban').text.strip()
            horse_name = horse.find('span', class_='HorseName').text.strip()
            jockey = horse.find('td', class_='Jockey').text.strip()
            
            # GEMに読ませやすいフォーマットに整形
            horse_info = f"- {umaban}番: {horse_name} (騎手: {jockey})"
            horse_data_list.append(horse_info)
        except AttributeError:
            continue # データが空の行はスキップ

    # 統合マスターGEMに渡す「レポート」の形に結合
    report_text = f"対象レース: {race_title}\n\n【出走馬リスト】\n"
    report_text += "\n".join(horse_data_list)

    return report_text

# テスト実行用ブロック（このファイル単体で実行した時だけ動く）
if __name__ == "__main__":
    # 例として「2023年 有馬記念」のレースIDを指定
    # ※netkeibaのURL「race_id=〇〇」の数字部分です
    sample_race_id = "202306050811" 
    
    # 関数を実行して結果を表示
    result = fetch_race_data(sample_race_id)
    print("\n--- 抽出結果 ---")
    print(result)