const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engine.ts');
let content = fs.readFileSync(filePath, 'utf8');

const anchor = `    // 11. 特注騎手: 横山和生騎手
    if (jockey.includes("横山和生")) {
      potential += 20;
      tags.push("👑 函館特注: 函館コースと相性抜群で絶好調の横山和生騎手");
    }`;

const newRules = `    // 11. 函館・騎手ルール1: 無条件で「横山和生騎手」を軸にする（一強ルール）
    if (jockey.includes("横山和生")) {
      potential += 30; // 圧倒的な勝率のため最大級の加点
      tags.push("👑 函館騎手特注: 圧倒的無双状態！絶対軸の横山和生騎手");
    }

    // 16. 函館・騎手ルール2: 大穴狙いは「小沢大仁騎手」に託す
    if (jockey.includes("小沢大仁")) {
      if (popularity >= 4) {
        potential += 25; // 穴馬に乗ったときの激走を高く評価
        tags.push("💥 函館騎手特注: 万馬券の使者！人気薄で激走する小沢大仁騎手");
      } else {
        potential += 10;
      }
    }

    // 17. 函館・騎手ルール3: 斤量の軽い「減量騎手（若手）」が波乱を呼ぶ
    if (jockey.match(/[☆▲△◇★]/)) {
      potential += 15;
      tags.push("💥 函館騎手特注: 斤量差を活かして波乱を演出する減量騎手(ヒモ穴必須)");
    }

    // 18. 函館・騎手ルール4: 迷ったら「横山ファミリー」で固める
    if (jockey.includes("横山") && !jockey.includes("横山和生")) {
      potential += 15;
      tags.push("👑 函館騎手特注: 和生に続く横山ファミリー(武史・琉人・典弘)の好走");
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
