const fs = require('fs');

const files = ['app/lib/engine.ts', 'app/lib/engineNAR.ts', 'app/lib/engineJRA.ts'];
const keywordsToDisable = [
  '期待値クロス',
  '筒井勇騎手(2〜3着付け推奨)',
  'ヒモ荒れを演出する中穴候補',
  '絶好のヒモ穴推奨フラグ成立！(波乱メーカー陣営)',
  'ノーザンファーム生産(育成力抜群)',
  '必勝パターン: 外枠(7枠)',
  '名古屋短距離特注: 7枠',
  '若駒の順調なビルドアップ',
  'タイム異常値(着順不問',
  '3連系:タイム異常値ブースト',
  '激走フラグ: 大幅距離短縮ローテ',
  '究極の末脚・上がり最速候補(軸推奨)',
  '優秀な年齢(3歳/4歳)',
  '左回り長直線コースでの極限の末脚実績',
  '信頼度抜群の上がり上位差し馬',
  '揉まれない中外枠×差し・好位',
  '鬼脚(上がり33秒台実績)',
  '必勝パターン: 外枠(5枠)',
  '名古屋短距離: 外枠(5枠)優位',
  '一般騎手から減量騎手',
  '存分に末脚を発揮できる後方待機馬',
  '前傾ハイペース適合(差し追込有利)',
  '持ち時計優秀 (指数',
  '絶好のヒモ穴推奨フラグ成立！(本命馬の同枠',
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
          // Look at previous 3 lines for potential += or distortionBoost +=
          for (let j = i - 1; j >= Math.max(0, i - 3); j--) {
            if (lines[j].match(/^\s*(potential|distortionBoost|holeBonus)\s*\+=/) && !lines[j].includes('// [PERFORMANCE FIX]')) {
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

if (!changedAny) {
  console.log("No files were modified.");
} else {
  console.log("Modifications complete.");
}
