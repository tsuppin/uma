const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engine.ts');
let content = fs.readFileSync(filePath, 'utf8');

const anchor = `    // 岩手リーディング全般のフォロー(残りのトップ騎手)
    const isIwateEliteJ = ["山本聡", "高松亮", "菅原辰"].some(j => jockey.includes(j));`;

const newRules = `    // 14. 水沢・その他特注ルール1〜3: 上がり最速過信禁物・ヒモ荒れ必至・馬体重変動無視
    // ルール1 & 2: 上がり最速の過信禁物とガチガチ決着の否定
    if (popularity <= 3) {
      tags.push("⚠️ 水沢馬券戦略: 稍重では「上がり最速馬」の1着取りこぼしが多発。テンの速さを重視せよ");
      tags.push("🎫 水沢馬券戦略: 上位人気(1〜3番人気)のみの決着はほぼ皆無。ヒモには必ず4番人気以下の中穴〜大穴を混ぜるべし");
    }

    // ルール3: 馬体重の2桁増減はマイナス評価にしない
    if (typeof horse.weightChange === 'number' && Math.abs(horse.weightChange) >= 10) {
      potential += 10; // 他の共通ロジックによる大幅増減ペナルティを相殺
      tags.push("🌟 水沢救済: 馬体重の2桁増減(±10kg以上)でも好走多数。水沢では変動の大きさによるマイナス評価は不要");
    }

    // 岩手リーディング全般のフォロー(残りのトップ騎手)
    const isIwateEliteJ = ["山本聡", "高松亮", "菅原辰"].some(j => jockey.includes(j));`;

// robust CRLF/LF replace
let index = content.indexOf(anchor);
if (index === -1) {
  const normAnchor = anchor.replace(/\r\n/g, '\n');
  index = content.indexOf(normAnchor);
  if (index !== -1) {
    content = content.replace(normAnchor, newRules.replace(/\r\n/g, '\n'));
  }
} else {
  content = content.replace(anchor, newRules);
}

if (index !== -1) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Rewrite successful.");
} else {
  console.log("Error: could not find strings");
}
