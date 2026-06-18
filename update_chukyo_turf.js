const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engine.ts');
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

const newLogic = `
    // ルール3: 芝2000m vs 芝2200m の真逆の脚質適性
    if (race.surface === "芝") {
      const distance = parseInt(dist || race.distance || "0", 10);
      const style = horse.style || "";

      if (distance === 2000) {
        // 芝2000m: ペースが遅くなり逃げ・先行が圧倒的有利
        if (style === "逃げ" || style === "先行") {
          potential += 20;
          tags.push("👑 中京芝2000m特注: 上り坂スタートでペースが落ち着くため、ロスなく運べる逃げ・先行馬が圧倒的有利");
          
          // 2200mで先行してバテた馬の巻き返し
          let failedAt2200 = false;
          if (horse.pastRaces && horse.pastRaces.length > 0) {
            failedAt2200 = horse.pastRaces.some(pr => {
              const venue = pr.venue || pr.trackName || pr.raceName || '';
              const prDist = parseInt(pr.distance || "0", 10);
              return venue.includes("中京") && prDist === 2200 && (pr.style === "逃げ" || pr.style === "先行") && pr.result !== undefined && pr.result >= 4;
            });
          }
          if (failedAt2200) {
            potential += 25;
            tags.push("🎯 中京芝2000m鉄板: タフな2200mで先行して粘れなかった馬の距離短縮！ペースが落ち着くここは絶好の狙い目");
          }
        } else if (style === "差し" || style === "追込") {
          potential -= 15;
          tags.push("🔻 中京芝2000m減点: ペースが遅く、タイトなコーナーで外を回らされる後方待機馬(差し・追い込み)は不利");
        }
      } else if (distance === 2200) {
        // 芝2200m: ペースが激しくなり差し・追い込みが有利
        if (style === "差し" || style === "追込") {
          potential += 20;
          tags.push("👑 中京芝2200m特注: 序盤から激しいポジション争いが発生。急坂を2回登るタフな展開で脚を溜められる差し・追い込み馬が有利");
          
          // 2000mで差し届かなかった馬の巻き返し
          let failedAt2000 = false;
          if (horse.pastRaces && horse.pastRaces.length > 0) {
            failedAt2000 = horse.pastRaces.some(pr => {
              const venue = pr.venue || pr.trackName || pr.raceName || '';
              const prDist = parseInt(pr.distance || "0", 10);
              return venue.includes("中京") && prDist === 2000 && (pr.style === "差し" || pr.style === "追込") && pr.result !== undefined && pr.result >= 4;
            });
          }
          if (failedAt2000) {
            potential += 25;
            tags.push("🎯 中京芝2200m鉄板: スローペースの2000mで差し届かなかった馬の距離延長！展開が向くここは絶好の狙い目");
          }
        } else if (style === "逃げ" || style === "先行") {
          potential -= 15;
          tags.push("🔻 中京芝2200m減点: 序盤の激しい争い＋急坂2回のタフな展開で、逃げ・先行馬は後半に失速しやすい");
        }
      }
    }`;

// Find the line index for `  // 【水沢競馬場 超特化型オメガ・プロトコル推論エンジン】`
let mizusawaIndex = lines.findIndex(line => line.includes('【水沢競馬場 超特化型オメガ・プロトコル推論エンジン】'));
if (mizusawaIndex !== -1) {
  // It's line 4389. The `  }` for Chukyo is at 4386. So insert at `mizusawaIndex - 3`.
  lines.splice(mizusawaIndex - 3, 0, newLogic);
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  console.log("Rewrite successful. Inserted at " + (mizusawaIndex - 3));
} else {
  console.log("Error: could not find Mizusawa marker");
}
