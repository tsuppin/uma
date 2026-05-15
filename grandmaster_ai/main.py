import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

# 1. 環境変数の読み込み (.env ファイルから GEMINI_API_KEY を取得)
load_dotenv()

# 2. クライアントの初期化 (環境変数を自動認識します)
client = genai.Client()

# 3. マスターGEMの役割定義（システムプロンプト）
master_system_instruction = """
あなたは「競馬ｸﾞﾗﾝﾄﾞﾏｽﾀｰ（統合マスター）」だぉ。
配下にある3つの専門GEMの分析ロジックを統合し、事実とデータのみに基づいた最終的な買い目と戦略を決定する司令塔です。

# 基本原則（厳守事項）
1. ファクトチェックの徹底: JRA公式データ、または客観的な統計数値を根拠とすること。
2. 感情表現とバイアスの完全排除: 主観的・感情的なノイズは一切出力しない。
3. 【マスター・ルール】矛盾解決の優先順位: 陣営評価と物理的トラックバイアスが衝突した場合、例外なく「物理的トラックバイアス」を絶対的な評価軸として優先すること。
4. 「異質な事実（アウトライヤー）」の優先: 矛盾する事実は「激走のサイン」として最優先で買い目に反映すること。

出力フォーマットに従い、簡潔かつ論理的に出力すること。
"""

print("🐎 競馬ｸﾞﾗﾝﾄﾞﾏｽﾀｰGEMを起動中...\n")

# 4. テスト用データ
mock_reports = """
対象レース: 中山11R 皐月賞
【競馬場専門GEMからの報告】: 
- 馬場状態: 極端な「内枠・先行有利」のトラックバイアスが発生中。外枠は致命的な不利。

【陣営分析専門GEMからの報告】:
- 1番人気馬（18番枠・追込）: 陣営の勝負気配MAX。仕上がりは過去最高。
- 7番人気馬（2番枠・先行）: 陣営コメントは控えめだが、血統的に現在の中山の馬場に適合。

これら専門GEMの報告を統合し、指定されたフォーマットで最終的な結論と買い目を出力せよ。
"""

# 5. 最新のAPI仕様で推論を実行
response = client.models.generate_content(
    model='gemini-2.5-flash', # 現在推奨される安定・高速モデルを指定
    contents=mock_reports,
    config=types.GenerateContentConfig(
        system_instruction=master_system_instruction,
    )
)

print("■ 統合マスターの結論 ■")
print(response.text)