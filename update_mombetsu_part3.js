const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engineNAR.ts');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `    // 騎手ルール3：服部茂騎手と岩橋勇騎手は「2〜3着付け」で組み合わせる
    const isHimoJockey = horse.jockey && (horse.jockey.includes('服部茂') || horse.jockey.includes('岩橋勇'));
    if (isHimoJockey) {
      // 勝ちきれない（1着にならない）傾向があるため、あえて少し減点して頭候補から外しヒモ枠に入れる
      potential -= 10;
      tags.push("🌟 門別特注: 確実に2〜3着に持ってくるベテラン・中堅(服部・岩橋)");
    }`;

const replaceStr = `    // 騎手ルール3：服部茂騎手と岩橋勇騎手は「2〜3着付け」で組み合わせる
    const isHimoJockey = horse.jockey && (horse.jockey.includes('服部茂') || horse.jockey.includes('岩橋勇'));
    if (isHimoJockey) {
      // 勝ちきれない（1着にならない）傾向があるため、あえて少し減点して頭候補から外しヒモ枠に入れる
      potential -= 10;
      tags.push("🌟 門別特注: 確実に2〜3着に持ってくるベテラン・中堅(服部・岩橋)");
    }

    // 調教師ルール1：「小国博計厩舎 × 1〜2番人気」は無条件で信頼する
    if (horse.trainer && horse.trainer.includes('小国') && (popularity === 1 || popularity === 2)) {
      potential += 35;
      tags.push("👑 門別鉄板: 小国厩舎×上位人気(複勝率100%の絶対軸)");
    }

    // 脚質ルール2：「上がり最速」の差し馬は1着ではなく「2〜3着（ヒモ）」にする
    if (horse.style === '差し' || horse.style === '追込') {
      // 1着候補からは外しつつ、ヒモとして拾うために少しポテンシャルを落とす
      potential -= 15;
      tags.push("⚠️ 門別特注: 差し・追込は届かず2〜3着まで(頭固定危険・ヒモ必須)");
    }

    // ローテルール3：1着候補は「前走と同距離」を走る馬から選ぶ
    if (prevRace && prevRace.distance === race.distance) {
      potential += 20;
      tags.push("🔥 門別特注: 信頼の前走同距離ローテーション");
    }`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Successfully updated Mombetsu specific logic (part 3).");
} else {
  console.log("Error: Target string not found.");
}
