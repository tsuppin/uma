const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engine.ts');
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

const kizunaLogic = `
    // ルール4: 血統適性（キズナ産駒の圧倒的パワー）
    if (horse.sire && horse.sire.includes("キズナ")) {
      potential += 15;
      tags.push("🌟 中京特注: タフな急坂コースをこなすパワーの血統！キズナ産駒");
      
      if (race.surface === "ダート") {
        const distance = parseInt(race.distance || "0", 10);
        if (distance === 1800) {
          potential += 30; // 圧倒的な回収率211%への特大ボーナス
          tags.push("👑 中京ダート1800m超鉄板: 勝率14.2%・単回値211%の最強血統！中京ダート1800mのキズナ産駒は無条件で買い");
        }
      }
    }`;

const mizusawaIndex = lines.findIndex(line => line.includes('【水沢競馬場 超特化型オメガ・プロトコル推論エンジン】'));

if (mizusawaIndex !== -1) {
  // mizusawaIndex is 4567. We want to insert before `  }` which is at 4564.
  // We'll just splice at mizusawaIndex - 3.
  lines.splice(mizusawaIndex - 3, 0, kizunaLogic);
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  console.log("Rewrite successful.");
} else {
  console.log("Error finding marker.");
}
