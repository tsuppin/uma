const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engine.ts');
let content = fs.readFileSync(filePath, 'utf8');

const anchor = `    // 2. 枠順バイアス (最新データ反映)
    // 従来は内枠有利と言われていたが、最新傾向では外枠(6〜8枠)が圧倒的有利
    if (frame >= 6) {
      potential += 25;
      tags.push("👑 水沢特注: 半分以上のレースで勝利する圧倒的有利な外枠(6〜8枠)");
    }`;

const newRules = `    // 2. 枠順バイアス (最新データ反映)
    if (frame >= 6) {
      potential += 20; // 外枠ベース加点
      tags.push("👑 水沢特注: 全12レース中11レースで連対する圧倒的有利な外枠(6〜8枠)");
      
      // 8枠の大特注ルール
      if (frame === 8) {
        potential += 15; // 8枠はさらに強力な加点
        tags.push("🎯 水沢鉄板: 迷ったら8枠！7レースで連対する大特注の連軸候補");
      }
    } else if (frame >= 1 && frame <= 5) {
      // 1〜5枠のヒモ推奨ルール
      tags.push("🎫 水沢馬券戦略: 内〜中枠(1〜5枠)はアタマより外枠(特に8枠)からのヒモ・相手候補として手広く流すべし");
    }`;

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
