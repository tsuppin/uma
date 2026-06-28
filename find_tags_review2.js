const fs = require('fs');
const files = ['app/lib/engine.ts', 'app/lib/engineNAR.ts'];
const keywords = [
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
  '減量騎手',
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
  '前残り多発コース',
  'トップ騎手',
  '前走4着以下の凡走',
  '4番人気以下'
];

let out = '';
files.forEach(filepath => {
  if (fs.existsSync(filepath)) {
    // Read as utf8 (assuming source is utf8, if it's utf8 but prints mojibake in console, writing to file is safer)
    const content = fs.readFileSync(filepath, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, i) => {
      keywords.forEach(keyword => {
        if (line.includes(keyword)) {
          const start = Math.max(0, i - 3);
          const end = Math.min(lines.length - 1, i + 1);
          out += `\n=== File: ${filepath} | Keyword: ${keyword} ===\n`;
          for (let j = start; j <= end; j++) {
            out += `L${j+1}: ${lines[j]}\n`;
          }
        }
      });
    });
  }
});
fs.writeFileSync('tags_review_output2.txt', out, 'utf8');
console.log('Done');
