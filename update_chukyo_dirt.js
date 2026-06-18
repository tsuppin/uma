const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engine.ts');
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

const dirtLogic = `
    // ルール5: ダートコースの距離別特化ロジック (1800m vs 1900m)
    if (race.surface === "ダート") {
      const distance = parseInt(race.distance || "0", 10);
      const style = horse.style || "";

      if (distance === 1800) {
        // 1800mは逃げ・先行有利
        if (style === "逃げ" || style === "先行") {
          potential += 15;
          tags.push("🌟 中京ダート1800m特注: 前で立ち回れる逃げ・先行馬が有利");
        } else if (style === "差し" || style === "追込") {
          potential -= 10;
          tags.push("🔻 中京ダート1800m減点: 前が止まりにくく、後方待機の差し・追い込み馬は届きにくい");
        }
      } else if (distance === 1900) {
        // 1900mは差し・追い込み有利 ＋ 1800m敗退からの出し入れ
        if (style === "逃げ" || style === "先行") {
          potential -= 15;
          tags.push("🔻 中京ダート1900m減点: スタート直後の急坂でスタミナを激しく消耗するため、逃げ・先行馬には過酷な条件");
        } else if (style === "差し" || style === "追込") {
          potential += 20;
          tags.push("👑 中京ダート1900m特注: 前がバテる展開で脚を溜められる差し・追い込み馬が圧倒的に有利");
          
          // 出し入れ判定: 前走(または過去)中京ダート1800mで4着以下
          let missedAt1800 = false;
          if (horse.pastRaces && horse.pastRaces.length > 0) {
            missedAt1800 = horse.pastRaces.some(pr => {
              const venue = pr.venue || pr.trackName || pr.raceName || '';
              const prDist = parseInt(pr.distance || "0", 10);
              return venue.includes("中京") && prDist === 1800 && (pr.style === "差し" || pr.style === "追込") && pr.result !== undefined && pr.result >= 4;
            });
          }
          if (missedAt1800) {
            potential += 25; // 絶好の狙い目
            tags.push("🎯 中京ダート1900m超鉄板: 1800mで展開が向かず届かなかった差し・追い込み馬！前が崩れるここは絶好の狙い目");
          }
        }
      }
    }`;

const mizusawaIndex = lines.findIndex(l => l.includes('【水沢競馬場 超特化型オメガ・プロトコル推論エンジン】'));
if (mizusawaIndex !== -1) {
  // Insert exactly before } closing Chukyo block
  lines.splice(mizusawaIndex - 3, 0, dirtLogic);
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  console.log("Rewrite successful.");
} else {
  console.log("Could not find marker.");
}
