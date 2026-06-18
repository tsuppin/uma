const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engine.ts');
let content = fs.readFileSync(filePath, 'utf8');

const anchorStart = `    // ルール3: 芝2000m vs 芝2200m の真逆の脚質適性`;
const anchorEnd = `      }
    }`;

// Use regex to replace the block
const regex = /\s*\/\/\s*ルール3: 芝2000m vs 芝2200m の真逆の脚質適性[\s\S]*?(?=\s*\/\/ ==========================================|\n\s*\}\n\s*\}\n\s*\/\/\s*==========================================)/;

const newLogic = `
    // ルール3: 芝コースの距離別特化ロジック
    if (race.surface === "芝") {
      const distance = parseInt(race.distance || "0", 10);
      const style = horse.style || "";

      if (distance === 1200) {
        // 芝1200m: ペース落ち着くがタフ。内枠で1400m以上実績馬が有利
        if (frame >= 1 && frame <= 4) {
          let hasLongerDistanceSuccess = false;
          if (horse.pastRaces && horse.pastRaces.length > 0) {
            hasLongerDistanceSuccess = horse.pastRaces.some(pr => {
              const prDist = parseInt(pr.distance || "0", 10);
              return prDist >= 1400 && pr.result !== undefined && pr.result <= 3;
            });
          }
          if (hasLongerDistanceSuccess) {
            potential += 25;
            tags.push("👑 中京芝1200m鉄板: スタミナが問われる急坂コース！ロスなく回れる内枠＋1400m以上での好走実績(スタミナ証明)を持つ最強の狙い目");
          } else {
            potential += 10;
            tags.push("🌟 中京芝1200m特注: 緩やかな上り坂発走でペースが落ち着くため、タイトなコーナーをロスなく回れる内枠が有利");
          }
        }
      } else if (distance === 1400) {
        // 芝1400m: ペース激化で内枠の差し・追い込み有利
        if (style === "差し" || style === "追込") {
          if (frame >= 1 && frame <= 4) {
            potential += 25;
            tags.push("👑 中京芝1400m鉄板: 1200mよりもペースが上がる逆転現象！前が潰れる展開を内からロスなく強襲する内枠の差し・追い込み馬");
          } else {
            potential += 10;
            tags.push("🌟 中京芝1400m特注: 激しいペースにより差し・追い込みが決まりやすい");
          }
        }
      } else if (distance === 1600) {
        // 芝1600m: 内枠の先行＋瞬発力勝負
        if (frame >= 1 && frame <= 4) {
          if (style === "逃げ" || style === "先行") {
            let hasFastLatePace = false;
            if (horse.pastRaces && horse.pastRaces.length > 0) {
              hasFastLatePace = horse.pastRaces.some(pr => pr.last3F !== undefined && pr.last3F <= 33.9);
            }
            if (hasFastLatePace) {
              potential += 25;
              tags.push("👑 中京芝1600m鉄板: 特殊ポケット発走で圧倒的内枠有利！スローからの瞬発力勝負に対応できる「鋭い上がり(33秒台以下)実績を持つ内枠先行馬」");
            } else {
              potential += 15;
              tags.push("🌟 中京芝1600m特注: 最初のコーナーまでの距離が短いため圧倒的内枠有利の先行馬");
            }
          }
        }
      } else if (distance === 2000) {
        // 芝2000m: ペースが遅くなり逃げ・先行が圧倒的有利 + リピーター
        if (style === "逃げ" || style === "先行") {
          potential += 20;
          tags.push("👑 中京芝2000m特注: 上り坂スタートでペースが落ち着くため、ロスなく運べる逃げ・先行馬が圧倒的有利");
          
          let isRepeater = false;
          let failedAt2200 = false;
          if (horse.pastRaces && horse.pastRaces.length > 0) {
            isRepeater = horse.pastRaces.some(pr => {
              const venue = pr.venue || pr.trackName || pr.raceName || '';
              return venue.includes("中京") && pr.result !== undefined && pr.result <= 3;
            });
            failedAt2200 = horse.pastRaces.some(pr => {
              const venue = pr.venue || pr.trackName || pr.raceName || '';
              const prDist = parseInt(pr.distance || "0", 10);
              return venue.includes("中京") && prDist === 2200 && (pr.style === "逃げ" || pr.style === "先行") && pr.result !== undefined && pr.result >= 4;
            });
          }
          
          if (isRepeater) {
            potential += 15;
            tags.push("🎯 中京芝2000m鉄板: 中京好走実績あり！特殊コースを得意とするリピーターの逃げ・先行馬");
          }
          if (failedAt2200) {
            potential += 25;
            tags.push("🎯 中京芝2000m超鉄板: タフな2200mで先行して粘れなかった馬の距離短縮！ペースが落ち着くここは絶好の狙い目");
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

let lines = content.split('\n');
let startIndex = lines.findIndex(l => l.includes('ルール3: 芝2000m vs 芝2200m の真逆の脚質適性'));
let endIndex = lines.findIndex((l, i) => i > startIndex && l.includes('【水沢競馬場 超特化型オメガ・プロトコル推論エンジン】'));

if (startIndex !== -1 && endIndex !== -1) {
  // endIndex is the 水沢競馬場 marker. We replace from startIndex to endIndex - 2 (since there is `  }` before the marker)
  lines.splice(startIndex, (endIndex - 3) - startIndex, newLogic);
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  console.log("Rewrite successful.");
} else {
  console.log("Error: could not find markers.");
}
