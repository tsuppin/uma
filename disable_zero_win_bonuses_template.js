const fs = require('fs');

const files = ['app/lib/engine.ts', 'app/lib/engineNAR.ts', 'app/lib/engineJRA.ts'];
const keywordsToDisable = [
  '期待値クロス',
  '筒井勇騎手',
  '中穴候補',
  '波乱メーカー陣営',
  'ノーザンファーム生産',
  '必勝パターン: 外枠',
  '名古屋短距離特注',
  '若駒の順調なビルドアップ',
  'タイム異常値',
  '大幅距離短縮ローテ',
  '究極の末脚',
  '優秀な年齢',
  '減量騎手(▲★等)はアタマ',
  '左回り長直線',
  '信頼度抜群の上がり上位差し馬',
  '揉まれない中外枠',
  '鬼脚',
  '名古屋短距離: 外枠',
  '一般騎手から減量騎手',
  '存分に末脚を発揮できる後方待機馬',
  '前傾ハイペース適合',
  '持ち時計優秀',
  '本命馬の同枠/隣枠',
  '前残り多発コース'
];

let changedAny = false;

files.forEach(filepath => {
  if (fs.existsSync(filepath)) {
    let content = fs.readFileSync(filepath, 'utf8');
    let lines = content.split('\n');
    let modified = false;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      if (line.includes('tags.push(') || line.includes('holeReasons.push(')) {
        let shouldDisable = keywordsToDisable.some(kw => line.includes(kw));
        if (shouldDisable) {
          // Look at previous 4 lines for potential += or distortionBoost += or holeBonus +=
          for (let j = i - 1; j >= Math.max(0, i - 4); j--) {
            if (lines[j].match(/^\s*(potential|distortionBoost|holeBonus|kasamatsuBonus)\s*\+=/) && !lines[j].includes('// [PERFORMANCE FIX]')) {
              lines[j] = lines[j].replace(/^(.*)$/, '/* [PERFORMANCE FIX] $1 */');
              modified = true;
              console.log(`Disabled in ${filepath}: L${j+1}: ${lines[j].trim()} (Triggered by: ${line.trim()})`);
            }
          }
        }
      }
    }

    if (modified) {
      fs.writeFileSync(filepath, lines.join('\n'), 'utf8');
      changedAny = true;
    }
  }
});

console.log("Modifications complete.");
