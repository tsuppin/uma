const fs = require('fs');

const files = ['app/lib/constants.ts', 'app/lib/learningPatch.ts'];
const keywordsToDisable = [
  '期待値クロス',
  '筒井勇',
  'スピード負けしやすい',
  '中穴候補',
  '波乱フェーズ',
  '上位人気馬の不穏な乗り替わり',
  '波乱メーカー陣営',
  'ノーザンファーム',
  '必勝パターン: 外枠(7枠)',
  '名古屋短距離特注: 7枠',
  '若駒の順調なビルドアップ',
  'タイム異常値',
  '大幅距離短縮ローテ',
  '究極の末脚',
  '優秀な年齢',
  '減量騎手(▲★等)はアタマ',
  '左回り長直線',
  '信頼度抜群の上がり',
  '揉まれない中外枠',
  '鬼脚',
  '差し届かずリスク',
  '必勝パターン: 外枠(5枠)',
  '外枠(5枠)優位',
  '一般騎手から減量騎手',
  '後方待機馬',
  '前傾ハイペース適合',
  '末脚不発リスク',
  'テンのスピード不足',
  '持ち時計優秀',
  '届かない後方脚質',
  '距離変更ローテーション',
  '本命馬の同枠',
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
      let shouldDisable = keywordsToDisable.some(kw => line.includes(kw));
      if (shouldDisable && line.includes('scoreAdjust:')) {
        // Change scoreAdjust: X to scoreAdjust: 0 if it's a positive number.
        // Or if it's a negative tag, keep it? The user requested "対応して". 
        // For patches in constants.ts, we can just set active: false for that block.
        // The easiest way is to look for "active: true" within the next 10 lines and change it to false.
        for (let j = i; j <= i + 10; j++) {
           if (lines[j] && lines[j].includes('active: true')) {
             lines[j] = lines[j].replace('active: true', 'active: false // [PERFORMANCE FIX] 勝率0%のため無効化');
             modified = true;
             console.log(`Disabled patch in ${filepath} around L${i+1}`);
             break;
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
  console.log("No patches were modified.");
} else {
  console.log("Patch modifications complete.");
}
