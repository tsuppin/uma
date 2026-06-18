const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engine.ts');
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

const nakayamaStart = lines.findIndex(l => l.includes('【中山競馬場 超特化型オメガ・プロトコル推論エンジン】'));
const tokyoStart = lines.findIndex(l => l.includes('【東京競馬場 超特化型オメガ・プロトコル推論エンジン】'));

if (nakayamaStart !== -1 && tokyoStart !== -1) {
  const replacement = `  // ==========================================
  // 【中山競馬場 超特化型オメガ・プロトコル推論エンジン】
  // ==========================================
  const isNakayamaSpecial = race.venue?.includes("中山") || race.trackName?.includes("中山") || race.raceName?.includes("中山");

  if (isNakayamaSpecial) {
    tags.push("🐎 中山特化OMEGAエンジン適用中");
    
    // 中山の立ち回り（内枠有利）
    if (frame >= 1 && frame <= 4) {
      potential += 15;
      tags.push("👑 中山特注: タイトなコーナーをロスなく回る機動力と立ち回りが活きる内枠");
    }

    // 中山実績と東京実績の相反チェック ＋ 急坂適性チェック
    let hasHillSuccess = false;
    let hasFlatSuccess = false;
    let hasTokyoSuccess = false;
    if (horse.pastRaces && horse.pastRaces.length > 0) {
      hasHillSuccess = horse.pastRaces.some(pr => {
        const v = pr.venue || pr.trackName || pr.raceName || '';
        return (v.includes("中山") || v.includes("阪神") || v.includes("中京")) && pr.result !== undefined && pr.result <= 3;
      });
      hasFlatSuccess = horse.pastRaces.some(pr => {
        const v = pr.venue || pr.trackName || pr.raceName || '';
        return (v.includes("新潟") || v.includes("小倉")) && pr.result !== undefined && pr.result <= 3;
      });
      hasTokyoSuccess = horse.pastRaces.some(pr => {
        const v = pr.venue || pr.trackName || pr.raceName || '';
        return v.includes("東京") && pr.result !== undefined && pr.result <= 3;
      });
    }

    if (hasHillSuccess) {
      potential += 25;
      tags.push("🎯 急坂鉄板(中山): 他の急坂コース(中山・阪神・中京)での好走実績あり！直線の急坂をこなすパワーの証明");
    } 
    
    if (!hasHillSuccess) {
      if (hasTokyoSuccess) {
        potential -= 20;
        tags.push("🔻 中山危険: 東京での好走実績のみ。直線の長い瞬発力勝負に偏っており、中山特有の急坂・小回り(機動力)適性に欠ける危険な人気馬の可能性");
      }
      if (hasFlatSuccess) {
        potential -= 25;
        tags.push("🔻 急坂危険(中山): 急坂での好走実績がなく、新潟や小倉などの平坦コースでの好走実績に偏る。急坂で一気に失速する危険な平坦専用機");
      }
    }
  }

  // ==========================================
  // 【阪神競馬場 超特化型オメガ・プロトコル推論エンジン】
  // ==========================================
  const isHanshinSpecial = race.venue?.includes("阪神") || race.trackName?.includes("阪神") || race.raceName?.includes("阪神");

  if (isHanshinSpecial) {
    tags.push("🐎 阪神特化OMEGAエンジン適用中");

    let hasHillSuccess = false;
    let hasFlatSuccess = false;
    if (horse.pastRaces && horse.pastRaces.length > 0) {
      hasHillSuccess = horse.pastRaces.some(pr => {
        const v = pr.venue || pr.trackName || pr.raceName || '';
        return (v.includes("中山") || v.includes("阪神") || v.includes("中京")) && pr.result !== undefined && pr.result <= 3;
      });
      hasFlatSuccess = horse.pastRaces.some(pr => {
        const v = pr.venue || pr.trackName || pr.raceName || '';
        return (v.includes("新潟") || v.includes("小倉")) && pr.result !== undefined && pr.result <= 3;
      });
    }

    if (hasHillSuccess) {
      potential += 25;
      tags.push("🎯 急坂鉄板(阪神): 他の急坂コース(中山・阪神・中京)での好走実績あり！直線の急坂をこなすタフなパワーの証明");
    } else if (hasFlatSuccess && !hasHillSuccess) {
      potential -= 25;
      tags.push("🔻 急坂危険(阪神): 急坂での好走実績がなく、新潟や小倉などの平坦コースでの好走実績に偏る。急坂で一気に失速する危険な平坦専用機");
    }
  }
`;

  lines.splice(nakayamaStart, tokyoStart - nakayamaStart, replacement);
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  console.log("Rewrite successful.");
} else {
  console.log("Could not find markers.");
}
