const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engine.ts');
let text = fs.readFileSync(filePath, 'utf8');

const oldLogicStart = text.indexOf('    // 季節ごとの馬場傾向');
const oldLogicEnd = text.indexOf('  // 【阪神競馬場 超特化型オメガ・プロトコル推論エンジン】', oldLogicStart);

if (oldLogicStart !== -1 && oldLogicEnd !== -1) {
  const newLogic = `    // 季節ごとの馬場傾向
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
          let hasHill1200Success = horse.pastRaces && horse.pastRaces.some(pr => (pr.venue?.includes("中山") || pr.venue?.includes("阪神") || pr.venue?.includes("中京")) && parseInt(pr.distance||"0",10) === 1200 && pr.result <= 3);
          if (hasHill1200Success) {
            potential += 25;
            tags.push("🎯 中山芝1200m超鉄板: 急坂コースの1200m好走実績を持つ内枠！下り坂ハイペースでも止まらない最強の狙い目");
          } else {
            potential += 15;
            tags.push("👑 中山芝1200m鉄板: 下り坂でハイペース。ロスなく回れる内枠が圧倒的有利！");
          }
        } else if (frame >= 7 && frame <= 8) {
          potential -= 20;
          tags.push("🔻 中山芝1200m減点: 下り坂でスピードに乗る中、大外枠は大きな距離ロスとなり不利");
        }
      } else if (distance === 1600) {
        if (frame >= 1 && frame <= 4) {
          let hasNakayama1600Success = horse.pastRaces && horse.pastRaces.some(pr => pr.venue?.includes("中山") && parseInt(pr.distance||"0",10) === 1600 && pr.result <= 3);
          if (hasNakayama1600Success) {
            potential += 30;
            tags.push("🎯 中山芝1600m超鉄板: 特殊条件の中山マイルで好走実績を持つ内枠馬！他場マイル実績馬を出し抜く絶好の狙い目");
          } else {
            potential += 20;
            tags.push("👑 中山芝1600m鉄板: 特殊ポケット発走。最初のコーナーまで短く内枠が圧倒的有利！");
          }
        }
      } else if (distance === 1800) {
        if ((style === "逃げ" || style === "先行") && frame >= 1 && frame <= 4) {
          potential += 25;
          tags.push("👑 中山芝1800m超鉄板: スタート直後の急坂でペースが落ち着くため、遠心力ロスを防げる内枠の逃げ・先行馬が圧倒的有利！");
        }
      } else if (distance === 2000) {
        if (style === "差し" || style === "追込") {
          let failedAt1800 = horse.pastRaces && horse.pastRaces.some(pr => pr.venue?.includes("中山") && parseInt(pr.distance||"0",10) === 1800 && (pr.style==="差し"||pr.style==="追込") && pr.result >= 4);
          if (failedAt1800) {
              potential += 30;
              tags.push("🎯 中山芝2000m超鉄板: 1800mで展開が向かず届かなかった差し・追い込み馬！ポジション争いが激化するここは絶好の『出し入れ』の舞台");
          } else {
              potential += 20;
              tags.push("🌟 中山芝2000m特注: 1角までが長くポジション争いが激化。前半で脚を使う前残りが厳しくなり、差し・追い込み馬が浮上！");
          }
        } else if (style === "逃げ" || style === "先行") {
          potential -= 15;
          tags.push("🔻 中山芝2000m減点: ペースが激しくなりやすく、逃げ・先行馬には厳しい展開");
        }
      } else if (distance === 2200) {
        if (style === "差し") {
          let hasFastPace = horse.pastRaces && horse.pastRaces.some(pr => pr.last3F && pr.last3F <= 34.5);
          if (hasFastPace) {
              potential += 25;
              tags.push("👑 中山芝2200m鉄板: なぜかスローペースになりやすい条件。中団から速い上がり3ハロンを繰り出せる馬が優秀な成績を残す特注舞台");
          }
        }
      } else if (distance === 2500) {
        let firstTime2500 = !(horse.pastRaces && horse.pastRaces.some(pr => pr.venue?.includes("中山") && parseInt(pr.distance||"0",10) === 2500));
        if (firstTime2500 && !(race.raceName && race.raceName.includes("有馬記念"))) { // 下級条件想定
            potential += 20;
            tags.push("🎯 中山芝2500m特注: 他距離で通用しなかった馬が集まる下級条件。未知の適性を秘めた「中山2500m初出走馬」が狙い目！");
        } else {
            potential += 15;
            tags.push("🌟 中山芝2500m特注: 有馬記念の舞台。アップダウンが多く非常にタフなコース。高い総合力とスタミナが問われる");
        }
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
      } else if (distance === 2400) {
        let prevMiddleDistance = horse.pastRaces && horse.pastRaces.length > 0 && parseInt(horse.pastRaces[0].distance||"0",10) >= 1800 && parseInt(horse.pastRaces[0].distance||"0",10) <= 2100;
        let firstTime2400 = !(horse.pastRaces && horse.pastRaces.some(pr => pr.venue?.includes("中山") && parseInt(pr.distance||"0",10) === 2400));
        if (prevMiddleDistance && firstTime2400) {
            potential += 25;
            tags.push("🎯 中山ダート2400m超鉄板: メンバーレベルが下がる長距離戦。中距離(1800〜2100m)で高いレベルの相手と戦ってきた馬の初出走は絶好の狙い目！");
        }
      }
    }
  // ==========================================
`;

  const finalStr = text.substring(0, oldLogicStart) + newLogic + text.substring(oldLogicEnd);
  fs.writeFileSync(filePath, finalStr, 'utf8');
  console.log("Rewrite successful.");
} else {
  console.log("Could not find markers.");
}
