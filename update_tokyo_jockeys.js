const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engine.ts');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `    // ルール5：相手候補・ヒモ穴には「丹内祐次騎手」×「中位人気」
    const isTannaiStrict = horse.jockey && horse.jockey.includes('丹内');
    if (isTannaiStrict && popularity >= 3 && popularity <= 6) {
      potential += 20; // ヒモとして拾いやすくするためスコアを底上げ
      tags.push("💥 東京特注: ヒモ荒れ誘発！丹内騎手の中位人気馬(高配当の使者)");
    }`;

const replaceStr = `    // ルール5：相手候補・ヒモ穴には「丹内祐次騎手」×「中位人気」
    const isTannaiStrict = horse.jockey && horse.jockey.includes('丹内');
    if (isTannaiStrict && popularity >= 3 && popularity <= 6) {
      potential += 20; // ヒモとして拾いやすくするためスコアを底上げ
      tags.push("💥 東京特注: ヒモ荒れ誘発！丹内騎手の中位人気馬(高配当の使者)");
    }

    // ルール6：「荻野極騎手・F.ゴンサルベス騎手」×「中位人気」の伏兵
    const isOginoGoncalves = horse.jockey && ['荻野極', 'ゴンサルベス'].some(j => horse.jockey.includes(j));
    if (isOginoGoncalves && popularity >= 2 && popularity <= 6) {
      potential += 15;
      tags.push("🔥 東京特注: 伏兵を上位に持ってくる名手(荻野極/ゴンサルベス)");
    }

    // ルール7：大穴狙いなら中堅・若手騎手(木幡巧/木幡初/丸山)の二桁人気馬
    const isKowataMaruyama = horse.jockey && ['木幡巧', '木幡初', '丸山'].some(j => horse.jockey.includes(j));
    if (isKowataMaruyama && popularity >= 10) {
      potential += 15; // 大穴でもスコア底上げでヒモに残す
      tags.push("💥 東京特注: 超大穴の激走警戒！中堅騎手の爆穴枠(木幡/丸山)");
    }`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Successfully updated Tokyo jockey rules.");
} else {
  console.log("Error: Target string not found.");
}
