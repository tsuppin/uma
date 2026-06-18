const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engineNAR.ts');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `  else if (trackName.includes('門別') || trackName.includes('盛岡')) {
    // マニアック: 地方屈指の大箱コース（直線が長く差しが届く）
    if ((horse.style === '差し' || horse.style === '追込') && isNarSire) {
      // [減点方式] potential += 40;
      tags.push(\`🔥 \${trackName.replace(/競馬場/g, '')}マニアック: 地方屈指の大箱コースで末脚が爆発するパワー型差し馬\`);
    }
  }`;

const replaceStr = `  else if (trackName.includes('門別')) {
    const popularity = horse.popularity || 99;
    const prevRace = horse.pastRaces && horse.pastRaces.length > 0 ? horse.pastRaces[0] : null;

    // ルール1：1着候補（アタマ）は圧倒的に有利な「外枠（5〜8枠）」から選ぶ
    if (frame >= 5) {
      potential += 25;
      tags.push("🔥 門別特注: 圧倒的有利な外枠(5〜8枠)からの好走");
    }

    // ルール2：相手や中穴候補には「前走5着以内（掲示板）」の馬を必ず組み込む
    if (popularity >= 4 && popularity <= 9 && prevRace && prevRace.result <= 5) {
      potential += 20;
      tags.push("🌟 門別特注: 前走掲示板確保の好調な中穴(ヒモ必須)");
    }

    // ルール3：絶対的軸として「落合玄騎手 × 上位人気（1〜2番人気）」を信頼する
    if (horse.jockey && horse.jockey.includes('落合') && (popularity === 1 || popularity === 2)) {
      potential += 40;
      tags.push("👑 門別鉄板: 落合玄騎手×上位人気(連対率100%の絶対軸)");
    }

    // マニアック: 地方屈指の大箱コース（直線が長く差しが届く）
    if ((horse.style === '差し' || horse.style === '追込') && isNarSire) {
      potential += 15;
      tags.push(\`🔥 \${trackName.replace(/競馬場/g, '')}マニアック: 地方屈指の大箱コースで末脚が爆発するパワー型差し馬\`);
    }
  }
  else if (trackName.includes('盛岡')) {
    // マニアック: 地方屈指の大箱コース（直線が長く差しが届く）
    if ((horse.style === '差し' || horse.style === '追込') && isNarSire) {
      potential += 15;
      tags.push(\`🔥 \${trackName.replace(/競馬場/g, '')}マニアック: 地方屈指の大箱コースで末脚が爆発するパワー型差し馬\`);
    }
  }`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Successfully updated Mombetsu specific logic.");
} else {
  console.log("Error: Target string not found.");
}
