const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engine.ts');
let content = fs.readFileSync(filePath, 'utf8');

const anchor = `    // 6. 新ルール4: 騎手の特徴（本命党は「村上忍騎手」、穴党は「坂井瑛騎手」）
    if (jockey.includes("村上忍") && popularity <= 2) {
      potential += 25;
      tags.push("🎯 水沢鉄板: 人気馬に乗った村上忍騎手の抜群の信頼度");
    }`;

const newRules = `    // 7. 新ルール5: ダート戦でも「牝馬」を軽視しない
    if (horse.gender === '牝') {
      potential += 15;
      tags.push("🌟 水沢馬特注: ダート戦でも牡馬相手に勝ち切る牝馬の台頭");
    }

    // 8. 新ルール6: 7歳以上の「ベテラン馬（高齢馬）」の激走に注意
    if (horse.age >= 7) {
      potential += 15;
      tags.push("👑 水沢馬特注: 馬場を知り尽くした7歳以上のベテラン馬による熟練の走り");
    }

    // 6. 新ルール4: 騎手の特徴（本命党は「村上忍騎手」、穴党は「坂井瑛騎手」）
    if (jockey.includes("村上忍") && popularity <= 2) {
      potential += 25;
      tags.push("🎯 水沢鉄板: 人気馬に乗った村上忍騎手の抜群の信頼度");
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
