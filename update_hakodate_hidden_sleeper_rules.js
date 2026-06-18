const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engine.ts');
let content = fs.readFileSync(filePath, 'utf8');

const anchor = `      // 条件4: 馬体重が「プラス体重」または「維持」であること
      if (typeof horse.weightChange === 'number' && horse.weightChange >= 0) {
        potential += 15;
        tags.push("💥 函館大穴特注: 人気薄でもコンディションをしっかり維持(プラス体重)している勝負気配");
      }
    }`;

const newRules = `      // 条件4: 馬体重が「プラス体重」または「維持」であること
      if (typeof horse.weightChange === 'number' && horse.weightChange >= 0) {
        potential += 15;
        tags.push("💥 函館大穴特注: 人気薄でもコンディションをしっかり維持(プラス体重)している勝負気配");
      }
    }

    // 36. 函館・馬券戦略ルール1&4: 3連単は万馬券前提で広く買い、アタマ固定は避けてボックス・マルチ推奨
    if (popularity <= 5) {
      tags.push("🎫 函館馬券戦略: 荒れ模様で万馬券多発！ヒモには手広く穴馬(前走大敗馬など)を流すこと");
      tags.push("🎫 函館馬券戦略: 1馬身以内の大接戦多発のため、1着固定よりマルチやボックス推奨");
    }

    // 37. 函館・調教師ルール: 仕上げに長けた「安田翔伍厩舎」と「鹿戸雄一厩舎」
    if (horse.trainer && (horse.trainer.includes("安田翔伍") || horse.trainer.includes("鹿戸雄一"))) {
      potential += 15;
      tags.push("👑 函館調教師特注: 滞在競馬のコンディション調整が抜群に上手い安田翔伍・鹿戸雄一厩舎");
    }

    // 38. 函館・大穴一発ルール: 「前走ダート大敗」からの「今回芝」への条件替わり
    if (isTurf && prevRaceData && prevRaceData.surface && prevRaceData.surface.includes('ダート') && prevRaceData.result !== undefined && prevRaceData.result >= 10) {
      potential += 25;
      tags.push("💥 函館大穴特注: 前走ダート大敗からの芝替わり！洋芝のパワー勝負で突如覚醒する超大穴パターン");
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
