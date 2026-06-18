const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engine.ts');
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

const chukyoLogic = `  // ==========================================
  // 【中京競馬場 超特化型オメガ・プロトコル推論エンジン】
  // ==========================================
  const isChukyo = race.venue?.includes("中京") || race.trackName?.includes("中京") || race.raceName?.includes("中京");

  if (isChukyo) {
    tags.push("🐎 中京特化OMEGAエンジン適用中");
    
    // ルール1: 枠順（立ち回りの重要性と内枠有利・外枠不利）
    if (frame >= 1 && frame <= 4) {
      potential += 20;
      tags.push("👑 中京特注: 遠心力を抑えてロスなく回れる内枠(1〜4枠)は絶対的有利");
    } else if (frame >= 7 && frame <= 8) {
      potential -= 15;
      tags.push("🔻 中京減点: 3・4角の下り坂＋タイトなコーナーで外を回される外枠(7〜8枠)は大幅なスタミナロス");
    }

    // ルール2: 急坂適性（阪神・中山での好走歴）
    let hasHillTrackSuccess = false;
    if (horse.pastRaces && horse.pastRaces.length > 0) {
      hasHillTrackSuccess = horse.pastRaces.some(pr => {
        const venue = pr.venue || pr.trackName || pr.raceName || '';
        return (venue.includes("阪神") || venue.includes("中山")) && pr.result !== undefined && pr.result <= 3;
      });
    }
    
    if (hasHillTrackSuccess) {
      potential += 25;
      tags.push("🎯 中京鉄板: 直線の急坂をこなすパワーの証明！同じ急坂コース(阪神・中山)での好走実績あり");
    }
  }
`;

// Insert before line 4337 (index 4336)
lines.splice(4336, 0, chukyoLogic);

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log("Rewrite successful using lines.splice.");
