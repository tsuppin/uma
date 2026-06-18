const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engine.ts');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `    // ルール7：大穴狙いなら中堅・若手騎手(木幡巧/木幡初/丸山)の二桁人気馬
    const isKowataMaruyama = horse.jockey && ['木幡巧', '木幡初', '丸山'].some(j => horse.jockey.includes(j));
    if (isKowataMaruyama && popularity >= 10) {
      potential += 15; // 大穴でもスコア底上げでヒモに残す
      tags.push("💥 東京特注: 超大穴の激走警戒！中堅騎手の爆穴枠(木幡/丸山)");
    }`;

const replaceStr = `    // ルール7：大穴狙いなら中堅・若手騎手(木幡巧/木幡初/丸山)の二桁人気馬
    const isKowataMaruyama = horse.jockey && ['木幡巧', '木幡初', '丸山'].some(j => horse.jockey.includes(j));
    if (isKowataMaruyama && popularity >= 10) {
      potential += 15; // 大穴でもスコア底上げでヒモに残す
      tags.push("💥 東京特注: 超大穴の激走警戒！中堅騎手の爆穴枠(木幡/丸山)");
    }

    // ルール8：1着は絶対に関東馬(美浦)！関西馬(栗東)のアタマ狙いは危険
    if (horse.stableLocation && horse.stableLocation.includes('美浦')) {
      potential += 15;
      tags.push("👑 東京特注: 1着固定の絶対条件！地元・美浦(関東)所属馬");
    } else if (horse.stableLocation && horse.stableLocation.includes('栗東')) {
      potential -= 20; // アタマとしては大きく割引き、ヒモとしての評価に留める
      tags.push("⚠️ 東京減点: アタマ(1着)は危険。2・3着の相手までの栗東(関西)所属馬");
    }

    // ルール9：集中力アップで激走を呼ぶ「ブリンカー着用馬」
    if (horse.useBlinkers) {
      potential += 20; // 勝ち切るケースや大穴を開けるケースが多発しているため高評価
      tags.push("💥 東京特注: 集中力MAX！大穴激走も狙えるブリンカー着用馬");
    }`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Successfully updated Tokyo final rules.");
} else {
  console.log("Error: Target string not found.");
}
