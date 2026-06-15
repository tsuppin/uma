/**
 * engine.ts と engineNAR.ts を加点方式から減点方式に変換するNode.jsスクリプト v3
 * バックアップファイルから再変換する（最終版）
 *
 * 変更内容:
 * 1. let potential = 500 → let potential = 1000 (初期値を高く)
 * 2. potential += 固定数値; → コメントアウト (すべてのパターンに対応)
 * 3. potential += 変数; のような動的な加点は維持（adj.scoreAdjust, deviationBonus等）
 * 4. コメント修正
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join('c:', 'Users', 'tsuyoshi_tsuchiya', '.gemini', 'antigravity', 'scratch', 'keiba_app', 'app', 'lib');

// 動的変数（コメントアウトしない変数名のリスト）
const DYNAMIC_VARS = [
  'hanshinScore', 'boost', 'dynamicBoost', 'blinkerBonus', 
  'adj.scoreAdjust', 'deviationBonus', 'goldenCombos',
  // 三項演算子パターンは別途処理
];

function convertFile(filepath) {
  const bakPath = filepath + '.bak';
  
  // バックアップが存在する場合はバックアップから読み込む
  const sourcePath = fs.existsSync(bakPath) ? bakPath : filepath;
  console.log(`読み込み元: ${sourcePath}`);

  let content = fs.readFileSync(sourcePath, 'utf-8');
  let commentedCount = 0;
  let initialValueChanged = false;

  // 1. 初期値を変更 (let potential = 500)
  content = content.replace(
    /(\s*let potential\s*=\s*)500(;)/g,
    (match, before, after) => {
      initialValueChanged = true;
      return `${before}1000${after}  // [減点方式] 初期値を1000に変更`;
    }
  );

  // 2. コメント修正
  content = content.replace(
    /\/\/ AI算出勝率（暫定評価値を0-1スケールに近似：500点を50%勝率と仮定）/g,
    '// AI算出勝率（減点方式：初期値1000から減点、1000点=満点として比率計算）'
  );

  // 3. potential += を含む行を処理
  // 行ごとに処理する
  const lines = content.split('\n');
  const newLines = lines.map((line, lineIdx) => {
    const lineNum = lineIdx + 1;
    
    // potential += が含まれていない行はスキップ
    if (!line.includes('potential +=')) {
      return line;
    }
    
    const trimmed = line.trim();
    
    // 既にコメントアウトされている行はスキップ
    if (trimmed.startsWith('//') || trimmed.startsWith('/*')) {
      return line;
    }
    
    // 動的変数を使った加点はスキップ
    const isDynamic = DYNAMIC_VARS.some(v => line.includes(`potential += ${v}`)) 
                   || (line.includes('goldenCombos[') && line.includes('potential +='));
    if (isDynamic) {
      return line;
    }
    
    // 三項演算子パターン (potential += (cond) ? N : M;)  → コメントアウト対象
    // 固定数値パターン (potential += N;)　→ コメントアウト対象
    
    // potential += が含まれており、動的でない場合はコメントアウト
    // パターン1: 行全体が potential += N; の場合
    const singleLineMatch = line.match(/^(\s*)(potential \+= .+;)\s*(\/\/.*)?$/);
    if (singleLineMatch) {
      const [full, indent, code, comment] = singleLineMatch;
      // 動的変数でないことを再確認
      if (!DYNAMIC_VARS.some(v => code.includes(v)) && !code.includes('goldenCombos[')) {
        commentedCount++;
        const commentStr = comment ? ` ${comment}` : '';
        return `${indent}// [減点方式] ${code}${commentStr}`;
      }
    }
    
    // パターン2: { potential += N; tags.push(...); } のようなインライン形式
    // potential += N; の部分だけを /* */ でコメントアウト
    const hasFixedAdd = /potential \+= \d+;/.test(line);
    const hasTernaryAdd = /potential \+= \(.*\) \? \d+ : \d+;/.test(line) || 
                          /potential \+= .*\? \d+ : \d+;/.test(line);
    
    if (hasFixedAdd || hasTernaryAdd) {
      const modified = line.replace(
        /(potential \+= )([^;]+;)/g,
        (m, prefix, rest) => {
          // 動的変数を含む場合はスキップ
          if (DYNAMIC_VARS.some(v => rest.includes(v)) || rest.includes('goldenCombos')) {
            return m;
          }
          commentedCount++;
          return `/* [減点方式] ${prefix}${rest} */`;
        }
      );
      return modified;
    }
    
    return line;
  });

  content = newLines.join('\n');

  // 上書き保存
  fs.writeFileSync(filepath, content, 'utf-8');
  console.log(`変更完了: ${filepath}`);
  if (initialValueChanged) {
    console.log(`  初期値変更: 500 → 1000`);
  }
  console.log(`  コメントアウト件数: ${commentedCount}`);
}

console.log('=== 加点方式 → 減点方式 変換開始（バックアップから再変換 v3）===\n');

['engine.ts', 'engineNAR.ts'].forEach((filename) => {
  const filepath = path.join(BASE_DIR, filename);
  if (fs.existsSync(filepath)) {
    console.log(`\n処理中: ${filepath}`);
    try {
      convertFile(filepath);
    } catch (e) {
      console.error(`エラー: ${e.message}`);
      console.error(e.stack);
    }
  } else {
    console.log(`ファイルが見つかりません: ${filepath}`);
  }
});

console.log('\n=== 変換完了 ===');
