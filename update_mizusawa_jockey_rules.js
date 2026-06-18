const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engine.ts');
let content = fs.readFileSync(filePath, 'utf8');

const anchor = `    // 6. 新ルール4: 騎手の特徴（本命党は「村上忍騎手」、穴党は「坂井瑛騎手」）
    if (jockey.includes("村上忍") && popularity <= 2) {
      potential += 25;
      tags.push("🎯 水沢鉄板: 人気馬に乗った村上忍騎手の抜群の信頼度");
    }
    if (jockey.includes("坂井瑛") && popularity >= 4) {
      potential += 30;
      tags.push("💥 水沢大穴特注: 伏兵馬を次々と勝たせる穴メーカー坂井瑛騎手");
    }
    
    // 岩手リーディング全般のフォロー
    const isIwateEliteJ = ["山本聡", "高松亮", "菅原辰", "山本政"].some(j => jockey.includes(j));
    if (isIwateEliteJ) {
      potential += 10;
      tags.push("🌟 岩手トップジョッキー絶対信頼度");
    }`;

const newRules = `    // 6. 水沢騎手ルール1: 坂井瑛騎手は「波乱を呼ぶ穴メーカー」
    if (jockey.includes("坂井瑛") && popularity >= 4) {
      potential += 30;
      tags.push("💥 水沢大穴特注: 人気薄の馬を勝たせる波乱の穴メーカー・坂井瑛騎手(無条件で買い)");
    }

    // 7. 水沢騎手ルール2: 村上忍騎手は「人気馬騎乗時の軸」
    if (jockey.includes("村上忍") && popularity <= 2) {
      potential += 25;
      tags.push("🎯 水沢鉄板: 上位人気馬に乗った際の安定感は随一。村上忍騎手の連軸推奨");
    }

    // 8. 水沢騎手ルール3: 山本政騎手は「3連系のヒモ（3着候補）」に最適
    if (jockey.includes("山本政")) {
      // 1着候補としての極端な加点は避け、ヒモとしてのタグ付け
      potential += 10;
      tags.push("🎫 水沢馬券戦略: 山本政騎手は1着(アタマ)より3連複・3連単のヒモ(3着候補)として最適");
    }

    // 9. 水沢騎手ルール4: 小林凌騎手は「人気薄の2・3着」で高配当を演出
    if (jockey.includes("小林凌") && popularity >= 6) {
      potential += 20;
      tags.push("💥 水沢大穴特注: 人気薄の小林凌騎手はヒモ荒れ要員として高配当を演出する警戒対象");
    }

    // 10. 水沢騎手ルール5: 佐々志騎手は「上位人気馬で手堅く勝負」
    if (jockey.includes("佐々志") && popularity <= 3) {
      potential += 20;
      tags.push("🎯 水沢鉄板: 上位人気馬の実力を引き出し手堅く結果を出す佐々志騎手");
    }

    // 岩手リーディング全般のフォロー(残りのトップ騎手)
    const isIwateEliteJ = ["山本聡", "高松亮", "菅原辰"].some(j => jockey.includes(j));
    if (isIwateEliteJ) {
      potential += 10;
      tags.push("🌟 岩手トップジョッキー絶対信頼度");
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
