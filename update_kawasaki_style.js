const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engineNAR.ts');
let content = fs.readFileSync(filePath, 'utf8');

const searchString = `    // ルール3: 重馬場特有の「上がり最速馬」を重視する
    const isHeavyTrack = race.condition === '重' || race.condition === '不良' || race.condition === '稍重';
    if (isHeavyTrack) {
      if (horse.style === '追込' || horse.style === '差し') {
        potential += 15;
        tags.push("💥 川崎特注: 渋った馬場で浮上する末脚自慢");
      }
      if (prevRaceData && prevRaceData.last3fTime) {
        const last3f = parseFloat(prevRaceData.last3fTime);
        if (!isNaN(last3f) && last3f < 39.0) {
          potential += 20;
          tags.push("💥 川崎特注: 渋った馬場に直結する前走の鋭い上がりタイム");
        }
      }
    }`;

const newStyleLogic = `    // --- [脚質のルール (追加3箇条)] --------------------------
    const isHeavyTrack = race.condition === '重' || race.condition === '不良' || race.condition === '稍重';
    
    // 脚質ルール1: 馬券の基本軸は「前走1〜4番手の先行馬」を信用する
    if (prevRaceData && prevRaceData.corner4Position !== undefined && prevRaceData.corner4Position <= 4) {
      potential += 15;
      tags.push("👑 川崎特注: 馬券の基本軸となる前走1〜4番手の先行馬(前残り)");
    }

    // 脚質ルール2: 差し・追込馬は「上がり最速」を出せる馬に限定する
    if (isHeavyTrack && (horse.style === '追込' || horse.style === '差し' || horse.style === '後方')) {
      if (prevRaceData && prevRaceData.last3fTime) {
        const last3f = parseFloat(prevRaceData.last3fTime);
        if (!isNaN(last3f) && last3f < 39.0) {
          potential += 30; // 上がり最速級なら強力加点
          tags.push("💥 川崎特注: 渋った馬場で強引に前を飲み込む圧倒的な上がり最速馬");
        } else {
          potential -= 10; // 中途半端な差し馬は届かないため減点
          tags.push("⚠️ 川崎減点: 渋った馬場では届かない中途半端な末脚の差し馬");
        }
      } else {
        potential -= 10;
        tags.push("⚠️ 川崎減点: 渋った馬場では届かない中途半端な末脚の差し馬");
      }
    }

    // 脚質ルール3: 超短距離「900m戦」は、あえて「差し馬」の一発を狙う
    if (dist === 900 && (horse.style === '差し' || horse.style === '追込' || horse.style === '後方')) {
      potential += 20; // 900mのハイペースで前が潰れる展開を想定
      tags.push("💥 川崎特注: 前が潰れるハイペース必至！900m戦で波乱を呼ぶ差し馬の一発");
    }`;

if (content.includes(searchString)) {
  content = content.replace(searchString, newStyleLogic);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Replacement successful.");
} else {
  console.log("Error: could not find search string");
}
