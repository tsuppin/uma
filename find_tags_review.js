const fs = require('fs');
const files = ['app/lib/engine.ts', 'app/lib/engineNAR.ts', 'app/lib/engineJRA.ts'];
const keywords = [
  '期待値クロス',
  '筒井勇',
  'スピード負けしやすい7歳以上',
  'ヒモ荒れを演出する中穴',
  '波乱フェーズ',
  '上位人気馬の不穏な乗り替わり',
  '波乱メーカー陣営',
  'ノーザンファーム生産',
  '名古屋必勝パターン: 外枠(7枠)',
  '名古屋短距離特注: 7枠',
  '若駒の順調なビルドアップ',
  'タイム異常値',
  '大幅距離短縮ローテ',
  '東京での減量騎手',
  '究極の末脚・上がり最速',
  '優秀な年齢(3歳/4歳)',
  '減量騎手(▲★等)はアタマ・軸としての信頼度低',
  '左回り長直線コースでの極限の末脚',
  '東京で信頼度抜群の上がり上位',
  '揉まれない中外枠×差し・好位',
  '鬼脚(上がり33秒台実績)',
  '東京ダート：差し届かずリスク',
  '名古屋必勝パターン: 外枠(5枠)',
  '名古屋短距離: 外枠(5枠)',
  '名古屋減量恩恵',
  '存分に末脚を発揮できる後方待機馬',
  '前傾ハイペース適合',
  '末脚不発リスク',
  'テンのスピード不足',
  '持ち時計優秀',
  '前残り馬場で届かない後方脚質',
  'ペースに戸惑う距離変更ローテーション',
  '本命馬の同枠/隣枠',
  '前残り多発コース',
  'トップ騎手(田野/小牧太)以外の騎乗',
  '前走4着以下の凡走',
  '1着候補としては信頼度減(4番人気以下)'
];

files.forEach(filepath => {
  if (fs.existsSync(filepath)) {
    const content = fs.readFileSync(filepath, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, i) => {
      keywords.forEach(keyword => {
        if (line.includes(keyword)) {
          const start = Math.max(0, i - 5);
          const end = Math.min(lines.length - 1, i + 2);
          console.log(`\n=== File: ${filepath} | Keyword: ${keyword} ===`);
          for (let j = start; j <= end; j++) {
            console.log(`L${j+1}: ${lines[j]}`);
          }
        }
      });
    });
  }
});
