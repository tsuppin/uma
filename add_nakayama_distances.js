const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engine.ts');
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

const logic = `
    // 季節ごとの馬場傾向
    let month = 0;
    if (race.date) {
      const parts = race.date.split('-');
      if (parts.length >= 2) {
        month = parseInt(parts[1], 10);
      }
    }
    
    const distance = parseInt(race.distance || dist || "0", 10);
    const style = horse.style || "";
    const surface = race.surface || "";

    // 秋開催 (9月, 10月) - 開幕直後で内枠有利
    if (month === 9 || month === 10) {
      if (frame >= 1 && frame <= 4) {
        potential += 15;
        tags.push("🍂 中山秋開催特注: 開幕直後の良好な馬場で内枠(1〜4枠)が圧倒的有利");
      } else if (frame >= 7 && frame <= 8) {
        potential -= 15;
        tags.push("🔻 中山秋開催減点: 良好な馬場で外枠から前に行くのは困難");
      }
    }
    // 冬・春開催 (12月, 1月, 2月, 3月, 4月) - タフな馬場、スタミナ必須
    if ([12, 1, 2, 3, 4].includes(month)) {
      if (surface === "芝") {
        tags.push("❄️ 中山冬春特注: 時計・上がりがかかるタフな馬場でスタミナが必須");
      } else if (surface === "ダート") {
        tags.push("❄️ 中山冬春ダート特注: 乾燥したタフな砂でバテバテの消耗戦(スタミナ必須)");
      }
    }

    // 距離別特化ロジック
    if (surface === "芝") {
      if (distance === 1200) {
        if (frame >= 1 && frame <= 4) {
          potential += 20;
          tags.push("👑 中山芝1200m鉄板: 下り坂でハイペース。ロスなく回れる内枠が圧倒的有利！");
        } else if (frame >= 7 && frame <= 8) {
          potential -= 20;
          tags.push("🔻 中山芝1200m減点: 下り坂でスピードに乗る中、大外枠は大きな距離ロスとなり不利");
        }
      } else if (distance === 1600) {
        if (frame >= 1 && frame <= 4) {
          potential += 20;
          tags.push("👑 中山芝1600m鉄板: 特殊ポケット発走。最初のコーナーまで短く内枠が圧倒的有利！");
        }
      } else if (distance === 1800) {
        if ((style === "逃げ" || style === "先行") && frame >= 1 && frame <= 4) {
          potential += 25;
          tags.push("👑 中山芝1800m超鉄板: スタート直後の急坂でペースが落ち着くため、遠心力ロスを防げる内枠の逃げ・先行馬が圧倒的有利！");
        }
      } else if (distance === 2000) {
        if (style === "差し" || style === "追込") {
          potential += 20;
          tags.push("🌟 中山芝2000m特注: 1角までが長くポジション争いが激化。前半で脚を使う前残りが厳しくなり、差し・追い込み馬が浮上！");
        } else if (style === "逃げ" || style === "先行") {
          potential -= 15;
          tags.push("🔻 中山芝2000m減点: ペースが激しくなりやすく、逃げ・先行馬には厳しい展開");
        }
      } else if (distance === 2500) {
        potential += 15;
        tags.push("🌟 中山芝2500m特注: 有馬記念の舞台。アップダウンが多く非常にタフなコース。高い総合力とスタミナが問われる");
      }
    } else if (surface === "ダート") {
      if (distance === 1200) {
        if ((style === "逃げ" || style === "先行") && frame >= 5 && frame <= 8) {
          potential += 25;
          tags.push("👑 中山ダート1200m鉄板: 芝スタート。芝部分を長く走れてスピードに乗りやすい外枠の逃げ・先行馬が圧倒的有利！");
        }
      } else if (distance === 1800) {
        const trainer = horse.trainerName || "";
        if (trainer.includes("西") || trainer.includes("栗") || trainer.includes("関西")) {
          potential += 20;
          tags.push("🎯 中山ダート1800m特注: わざわざ輸送費をかけて関東のタフな舞台に挑んでくる「勝負気配の高い関西馬」！");
        }
      }
    }`;

const hanshinIndex = lines.findIndex(l => l.includes('【阪神競馬場 超特化型オメガ・プロトコル推論エンジン】'));

if (hanshinIndex !== -1) {
  // Insert exactly before the closing bracket of Nakayama block, which should be two lines above the Hanshin banner
  lines.splice(hanshinIndex - 2, 0, logic);
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  console.log("Rewrite successful.");
} else {
  console.log("Error finding marker.");
}
