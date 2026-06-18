const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engine.ts');
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

const kantoLogic = `  // ==========================================
  // 【中山競馬場 超特化型オメガ・プロトコル推論エンジン】
  // ==========================================
  const isNakayama = race.venue?.includes("中山") || race.trackName?.includes("中山") || race.raceName?.includes("中山");

  if (isNakayama) {
    tags.push("🐎 中山特化OMEGAエンジン適用中");
    
    // 中山の立ち回り（内枠有利）
    if (frame >= 1 && frame <= 4) {
      potential += 15;
      tags.push("👑 中山特注: タイトなコーナーをロスなく回る機動力と立ち回りが活きる内枠");
    }

    // 中山実績と東京実績の相反チェック
    let hasNakayamaSuccess = false;
    let hasTokyoSuccess = false;
    if (horse.pastRaces && horse.pastRaces.length > 0) {
      hasNakayamaSuccess = horse.pastRaces.some(pr => pr.venue?.includes("中山") && pr.result !== undefined && pr.result <= 3);
      hasTokyoSuccess = horse.pastRaces.some(pr => pr.venue?.includes("東京") && pr.result !== undefined && pr.result <= 3);
    }

    if (hasNakayamaSuccess) {
      potential += 25;
      tags.push("🎯 中山鉄板: 直線の急坂と小回りをこなす機動力・スタミナの証明！中山好走実績あり");
    } else if (hasTokyoSuccess && !hasNakayamaSuccess) {
      potential -= 20;
      tags.push("🔻 中山危険: 東京での好走実績のみ。直線の長い瞬発力勝負に偏っており、中山特有の急坂・小回り(機動力)適性に欠ける危険な人気馬の可能性");
    }
  }

  // ==========================================
  // 【東京競馬場 超特化型オメガ・プロトコル推論エンジン】
  // ==========================================
  const isTokyoSpecial = race.venue?.includes("東京") || race.trackName?.includes("東京") || race.raceName?.includes("東京");

  if (isTokyoSpecial) {
    tags.push("🐎 東京特化OMEGAエンジン適用中");
    
    // 東京の瞬発力（上がり3ハロン重視）
    let hasFastLatePace = false;
    if (horse.pastRaces && horse.pastRaces.length > 0) {
      hasFastLatePace = horse.pastRaces.some(pr => pr.last3F !== undefined && pr.last3F <= 33.9);
    }
    
    if (hasFastLatePace) {
      potential += 25;
      tags.push("👑 東京鉄板: 日本一長い直線を突き抜ける破壊力抜群の末脚！上がり33秒台の瞬発力実績あり");
    }
    
    if (horse.style === "差し" || horse.style === "追込") {
      potential += 15;
      tags.push("🌟 東京特注: 長い直線で存分に末脚を発揮できる後方待機馬(差し・追い込み)");
    }

    // 東京実績と中山実績の相反チェック
    let hasNakayamaSuccess = false;
    let hasTokyoSuccess = false;
    if (horse.pastRaces && horse.pastRaces.length > 0) {
      hasNakayamaSuccess = horse.pastRaces.some(pr => pr.venue?.includes("中山") && pr.result !== undefined && pr.result <= 3);
      hasTokyoSuccess = horse.pastRaces.some(pr => pr.venue?.includes("東京") && pr.result !== undefined && pr.result <= 3);
    }

    if (!hasTokyoSuccess && hasNakayamaSuccess) {
      potential -= 20;
      tags.push("🔻 東京危険: 中山での好走実績のみ。小回りの立ち回りやスタミナに偏っており、東京で最も重要な「スピードと極限の瞬発力」に欠ける危険な馬");
    }
  }
`;

// Insert before line 4337 (which is index 4336)
const chukyoIndex = lines.findIndex(line => line.includes('【中京競馬場 超特化型オメガ・プロトコル推論エンジン】'));
if (chukyoIndex !== -1) {
  // Insert exactly before the block
  lines.splice(chukyoIndex - 1, 0, kantoLogic);
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  console.log("Rewrite successful. Inserted Kanto logic.");
} else {
  console.log("Error: could not find Chukyo marker.");
}
