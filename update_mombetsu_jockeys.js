const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engineNAR.ts');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `    // ルール3：絶対的軸として「落合玄騎手 × 上位人気（1〜2番人気）」を信頼する
    if (horse.jockey && horse.jockey.includes('落合') && (popularity === 1 || popularity === 2)) {
      potential += 40;
      tags.push("👑 門別鉄板: 落合玄騎手×上位人気(連対率100%の絶対軸)");
    }`;

const replaceStr = `    // ルール3：絶対的軸として「落合玄騎手 × 上位人気（1〜2番人気）」を信頼する
    if (horse.jockey && horse.jockey.includes('落合') && (popularity === 1 || popularity === 2)) {
      potential += 40;
      tags.push("👑 門別鉄板: 落合玄騎手×上位人気(連対率100%の絶対軸)");
    }

    // 騎手ルール2：2〜3着の相手（ヒモ）には「減量騎手（☆、△、▲）」を積極的に狙う
    const isApprentice = horse.jockey && horse.jockey.match(/[☆▲△◇]/);
    if (isApprentice) {
      // 1着候補にはなりにくいため頭抜けた加点は避けるが、確実なヒモとして評価
      potential += 10;
      tags.push("🌟 門別特注: 減量騎手(☆△▲)の軽斤量を活かした2〜3着粘り込み(ヒモ必須)");
    }

    // 騎手ルール3：服部茂騎手と岩橋勇騎手は「2〜3着付け」で組み合わせる
    const isHimoJockey = horse.jockey && (horse.jockey.includes('服部茂') || horse.jockey.includes('岩橋勇'));
    if (isHimoJockey) {
      // 勝ちきれない（1着にならない）傾向があるため、あえて少し減点して頭候補から外しヒモ枠に入れる
      potential -= 10;
      tags.push("🌟 門別特注: 確実に2〜3着に持ってくるベテラン・中堅(服部・岩橋)");
    }`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Successfully updated Mombetsu specific jockey logic.");
} else {
  console.log("Error: Target string not found.");
}
