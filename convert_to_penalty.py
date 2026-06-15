"""
engine.ts と engineNAR.ts を加点方式から減点方式に変換するスクリプト

変更内容:
1. potential = 500 → potential = 1000 (初期値を高く)
2. potential += N; → // [減点方式] potential += N; (加点を全てコメントアウト)
   ただし、potential += adj.scoreAdjust のような動的な加点は維持
"""

import re
import shutil
from pathlib import Path

def convert_file(filepath: str) -> None:
    path = Path(filepath)
    
    # バックアップ作成
    backup = path.with_suffix(path.suffix + '.bak')
    shutil.copy2(path, backup)
    print(f"バックアップ作成: {backup}")
    
    content = path.read_text(encoding='utf-8-sig')
    original_content = content
    
    # 1. 初期値を変更 (let potential = 500)
    content = re.sub(
        r'(\s*let potential\s*=\s*)500(;)',
        r'\g<1>1000\2  // [減点方式] 初期値を1000に変更',
        content
    )
    
    # 2. potential += 固定数値; の行をコメントアウト
    #    例: potential += 35; → // [減点方式] potential += 35;
    #    ただし potential += adj.scoreAdjust のような動的な式は除外
    def replace_potential_add(match):
        indent = match.group(1)
        full_line = match.group(0)
        inner = match.group(2)  # += の後の部分
        
        # 動的な式（変数が含まれる）はスキップ
        # 固定数値のみ（数値、小数、負数）をコメントアウト対象とする
        if re.match(r'^[\d.]+;', inner.strip()):
            # 固定数値の加点 → コメントアウト
            return f"{indent}// [減点方式] {full_line.strip()}"
        else:
            # 動的な式（変数含む）はそのまま残す
            return full_line
    
    content = re.sub(
        r'([ \t]*)potential \+= ([\d\w.()+\-*/\s]+;)',
        replace_potential_add,
        content
    )
    
    if content != original_content:
        path.write_text(content, encoding='utf-8')
        
        # 変更件数を数える
        added_comments = len(re.findall(r'// \[減点方式\]', content))
        print(f"変更完了: {filepath}")
        print(f"  コメントアウト件数: {added_comments}")
    else:
        print(f"変更なし: {filepath}")


if __name__ == '__main__':
    base = Path(r'c:\Users\tsuyoshi_tsuchiya\.gemini\antigravity\scratch\keiba_app\app\lib')
    
    for filename in ['engine.ts', 'engineNAR.ts']:
        filepath = base / filename
        if filepath.exists():
            print(f"\n処理中: {filepath}")
            convert_file(str(filepath))
        else:
            print(f"ファイルが見つかりません: {filepath}")
    
    print("\n完了！")
