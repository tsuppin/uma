const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engine.ts');
let content = fs.readFileSync(filePath, 'utf8');

const anchor = `        // 条件3: 前走成績が「4着〜8着」の惜しい馬
        if (prevRaceData.result !== undefined && prevRaceData.result >= 4 && prevRaceData.result <= 8) {
          potential += 15;
          tags.push("💥 函館ブリンカー特注: あと一歩足りなかった馬(前走4〜8着)へのカンフル剤！中穴の使者");
        }
      }
    }`;

const newRules = `        // 条件3: 前走成績が「4着〜8着」の惜しい馬
        if (prevRaceData.result !== undefined && prevRaceData.result >= 4 && prevRaceData.result <= 8) {
          potential += 15;
          tags.push("💥 函館ブリンカー特注: あと一歩足りなかった馬(前走4〜8着)へのカンフル剤！中穴の使者");
        }
      }
    }

    // 35. 函館・穴馬(6〜8番人気)の特注条件
    if (popularity >= 6 && popularity <= 8) {
      // 条件1: 「減量騎手」または「小沢大仁騎手」が騎乗している
      if (jockey.match(/[☆▲△◇★]/) || jockey.includes("小沢大仁")) {
        potential += 20;
        tags.push("💥 函館大穴特注: 穴メーカー(減量騎手・小沢大仁)による積極策がハマる期待値大");
      }
      
      // 条件2: 前走が「6着以下(二桁着順含む)」で人気を落としている
      if (prevRaceData && prevRaceData.result !== undefined && prevRaceData.result >= 6) {
        potential += 15;
        tags.push("💥 函館大穴特注: 前走大敗で人気落ちした馬のコース替わり・斤量減による一変");
      }
      
      // 条件3: 「牝馬」であること
      if (horse.gender === '牝') {
        potential += 15;
        tags.push("💥 函館大穴特注: 夏の牝馬法則！人気薄でも激走しやすい牝馬");
      }
      
      // 条件4: 馬体重が「プラス体重」または「維持」であること
      if (typeof horse.weightChange === 'number' && horse.weightChange >= 0) {
        potential += 15;
        tags.push("💥 函館大穴特注: 人気薄でもコンディションをしっかり維持(プラス体重)している勝負気配");
      }
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
