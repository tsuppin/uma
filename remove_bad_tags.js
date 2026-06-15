const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join('c:', 'Users', 'tsuyoshi_tsuchiya', '.gemini', 'antigravity', 'scratch', 'keiba_app', 'app', 'lib');
const filesToProcess = ['engine.ts', 'engineNAR.ts'];

const targetTags = [
  "地方ダート特注: 深い砂を力でねじ伏せる圧倒的パワー血統",
  "JRA特化OMEGAエンジン適用中",
  "安定馬体(1着候補:±8kg内)",
  "斤量比率適正(勝ちきり期待)",
  "若駒ダート:末脚一閃期待(差し切り)",
  "物理黄金比:負担極小・圧倒的パワーアドバンテージ",
  "ブリンカー着用（集中力UP）",
  "期待値シナジー(歪み×一変トリガー)",
  "初ブリンカー装着による集中力激変期待",
  "前半:差し・追い込み波乱警戒",
  "若駒フェーズ適合(2-3歳期待)",
  "西高東低(栗東所属)",
  "中央からの刺客: JRA転入初戦の絶対的能力上位",
  "阪神特化OMEGAエンジン適用中",
  "大型馬パワーボーナス(500kg以上)",
  "若駒ダート×ブリンカー(集中力UP)",
  "後半フェーズ:鋭い末脚(上がり重視)",
  "PMR最適（短距離）"
];

for (const file of filesToProcess) {
  const filePath = path.join(BASE_DIR, file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');
  let lines = content.split('\n');
  let modified = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('tags.push(')) {
      for (const tag of targetTags) {
        if (line.includes(tag) && !line.trim().startsWith('//')) {
          // tags.push の行をコメントアウト
          lines[i] = line.replace('tags.push(', '// [要見直し] tags.push(');
          modified = true;
          console.log(`[${file}] コメントアウト: ${tag}`);
          
          // 直前の行が /* [減点方式] potential += ... */ のようになっている場合、
          // 既にコメントアウトされているが、もし生きていればコメントアウトする
          if (i > 0) {
            const prevLine = lines[i - 1];
            if (prevLine.includes('potential +=') && !prevLine.trim().startsWith('//') && !prevLine.trim().startsWith('/*')) {
               lines[i - 1] = '// [要見直し] ' + prevLine.trimStart();
            }
          }
        }
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log(`${file} を更新しました。`);
  } else {
    console.log(`${file} に変更はありませんでした。`);
  }
}
