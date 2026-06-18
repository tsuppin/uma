const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engineNAR.ts');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `    // 追加ルール4：「1番人気」は1着固定ではなく、「連対（2着以内）」として馬券に組み込む
    if (popularity === 1) {
      // 1番人気の絶対的な頭固定を防ぎ、相手（ヒモ・連対）になりやすくする
      potential -= 10;
      tags.push("⚠️ 笠松特注: 1番人気は1着を取りこぼしやすいため2着(連対)候補推奨");
    }`;

const replaceStr = `    // 追加ルール4：「1番人気」は1着固定ではなく、「連対（2着以内）」として馬券に組み込む
    if (popularity === 1) {
      // 1番人気の絶対的な頭固定を防ぎ、相手（ヒモ・連対）になりやすくする
      potential -= 10;
      tags.push("⚠️ 笠松特注: 1番人気は1着を取りこぼしやすいため2着(連対)候補推奨");
    }

    // 追加ルール5：減量騎手（☆松本一、▲井口など）の起用を軽視しない（ヒモ穴）
    const isApprenticeKasamatsu = horse.jockey && horse.jockey.match(/[☆▲△◇]/);
    if (isApprenticeKasamatsu) {
      potential += 15;
      tags.push("🌟 笠松特注: 軽斤量を活かして馬券圏内に飛び込む減量騎手(ヒモ穴必須)");
    }

    // 追加ルール6：上位の特別戦は「笹野博厩舎 × 渡邊竜也騎手」を無条件で信頼する
    const isSpecialRace = race.raceName && race.raceName.includes('特別');
    if (isSpecialRace && horse.trainer && horse.trainer.includes('笹野') && horse.jockey && horse.jockey.includes('渡邊竜')) {
      potential += 40; // 黄金タッグの確定軸
      tags.push("👑 笠松鉄板: 特別戦における笹野博厩舎×渡邊竜也騎手の黄金タッグ");
    }

    // 追加ルール7：極端な追い込み馬より、前走で「1〜4番手」につけている先行馬を選ぶ
    if (horse.style === '逃げ' || horse.style === '先行') {
      potential += 20;
      tags.push("🔥 笠松特注: 小回りコースで圧倒的有利な先行力");
    } else if (horse.style === '差し' || horse.style === '追込') {
      potential -= 15;
      tags.push("⚠️ 笠松減点: 小回りコースで不発になりやすい後方脚質");
    }

    // 追加ルール8：牡馬・牝馬の「性別格差」は考えなくて良い（むしろ牝馬が強い）
    if (horse.sex === '牝') {
      potential += 15;
      tags.push("🔥 笠松特注: 牡馬相手でも勝ち切る勝負強い牝馬");
    }`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Successfully updated Kasamatsu specific logic (part 3).");
} else {
  console.log("Error: Target string not found.");
}
