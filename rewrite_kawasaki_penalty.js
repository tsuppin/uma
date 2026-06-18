const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engineNAR.ts');
let content = fs.readFileSync(filePath, 'utf8');

const searchString = `  else if (trackName.includes('川崎')) {
    // ==========================================
    // 【特化ロジック】川崎競馬場・6つの必勝ルール ＋ 4つの馬ルール（2026/06分析）
    // ==========================================
    const popularity = horse.popularity || 99;
    const prevRaceData = horse.pastRaces && horse.pastRaces.length > 0 ? horse.pastRaces[0] : undefined;

    // --- [基本ルール] -------------------------------------`;

const newStartLogic = `  else if (trackName.includes('川崎')) {
    // ==========================================
    // 【特化ロジック】川崎競馬場・減点方式ルール（2026/06/15分析）
    // ==========================================
    const popularity = horse.popularity || 99;
    const prevRaceData = horse.pastRaces && horse.pastRaces.length > 0 ? horse.pastRaces[0] : undefined;
    
    // ※川崎特化：基本スコアを100点からスタートし、減点方式で評価する
    potential = 100;
    
    const isHeavyTrack = race.condition === '重' || race.condition === '不良' || race.condition === '稍重';
    const jName = horse.jockey || '';

    // --- [減点ルール] -------------------------------------
    
    // 減点1. 枠順による減点（Frame Deduction）
    if (frame === 4 || frame === 6) {
      potential -= 20;
      tags.push("⚠️ 川崎減点: 極端な不振傾向の「4枠」「6枠」(連対候補から除外推奨)");
    }

    // 減点2. 騎手・斤量による減点（Jockey & Weight Deduction）
    if (jName.includes('☆') || jName.includes('△') || jName.includes('▲') || jName.includes('◇') || jName.includes('★')) {
      potential -= 25;
      tags.push("⚠️ 川崎減点: 重馬場で難易度アップ。若手・減量騎手の経験不足を軽視");
    }

    // 減点3. 馬体重による減点（Weight Change Deduction）
    if (typeof horse.weightChange === 'number' && horse.weightChange >= 1 && horse.weightChange <= 9) {
      potential -= 10;
      tags.push("⚠️ 川崎減点: 中途半端なプラス体重(+1〜+9kg)。仕上がり不安");
    }

    // 減点4. 脚質・上がりタイムによる減点（Running Style Deduction）
    if (isHeavyTrack && dist !== 900) {
      if (horse.style === '差し' || horse.style === '追込' || horse.style === '後方') {
        let hasFastest3f = false;
        if (horse.pastRaces) {
          for (const r of horse.pastRaces) {
             if (r.last3fTime) {
               const last3f = parseFloat(r.last3fTime);
               if (!isNaN(last3f) && last3f < 39.0) { // 上がり最速の目安
                 hasFastest3f = true;
                 break;
               }
             }
          }
        }
        if (!hasFastest3f) {
          potential -= 30; // 激高の減点
          tags.push("🚫 川崎致命的減点: 圧倒的末脚を持たない差し・追込馬(重馬場では届かない)");
        }
      }
    }

    // 減点5. 前走成績と実績による減点（Past Performance Deduction）
    if (prevRaceData && prevRaceData.result >= 6) {
      let isExempt = false;
      
      // 免除条件1: 近5走以内に「川崎コース」での好走歴（3着以内）
      if (horse.pastRaces) {
        for (let i = 0; i < Math.min(horse.pastRaces.length, 5); i++) {
          const r = horse.pastRaces[i];
          if (r.venue && r.venue.includes('川崎') && r.result <= 3) isExempt = true;
        }
      }
      // 免除条件2: JRAからの転入初戦、または他場での重賞実績
      const isFromJRA = horse.transferFrom === 'JRA' || horse.belonging === 'JRA';
      let hasGradedStakes = false;
      if (horse.pastRaces) {
        for (const r of horse.pastRaces) {
          if (r.raceName && (r.raceName.includes('重賞') || r.raceName.includes('スプリント') || r.raceName.includes('G') || r.raceName.includes('Jpn'))) {
            hasGradedStakes = true;
          }
        }
      }
      if (isFromJRA || hasGradedStakes) isExempt = true;
      // 免除条件3: 鞍上がリーディング上位騎手または他場主戦スポット騎乗
      let isJockeyChangedK = false;
      if (prevRaceData.jockey && (!jName.includes(prevRaceData.jockey) && !prevRaceData.jockey.includes(jName))) {
        isJockeyChangedK = true;
      }
      if (isJockeyChangedK && ['町田', '矢野', '澤田', '西啓太'].some(j => jName.includes(j))) {
        isExempt = true;
      }

      if (!isExempt) {
        potential -= 25;
        tags.push("⚠️ 川崎減点: 前走大敗かつ一変のサイン(コース実績/底力/勝負鞍上)が皆無");
      }
    }

    // 減点6. 中穴狙い（6〜8番人気）の減点フィルタ（Longshot Filter）
    if (popularity >= 6 && popularity <= 8) {
      if (prevRaceData && prevRaceData.result >= 6) {
        potential -= 20;
        tags.push("⚠️ 川崎減点: 中穴狙いフィルタ除外。前走大敗の中途半端な穴馬");
      }
    }

    // --- [加点ルール (減点方式ベースの特注加点)] --------------------------`;

const endIndex = content.indexOf(`    // --- [既存のマニアックルール] --------------------------`, content.indexOf(`  else if (trackName.includes('川崎')) {`));

if (content.includes(searchString) && endIndex !== -1) {
  // Replace the entire Kawasaki block with just the penalty mode logic
  const before = content.slice(0, content.indexOf(`  else if (trackName.includes('川崎')) {`));
  const after = content.slice(endIndex);
  
  const modifiedAfter = `    // --- [既存のマニアックルール] --------------------------
    if (dist === 1500 && frame <= 3 && horse.style === '逃げ') {
      potential += 20;
      tags.push("🔥 川崎マニアック: 日本一タイトなコーナーをロスなく回る川崎1500m内枠逃げ");
    }
  }` + after.substring(after.indexOf(`\n  else if (trackName.includes('船橋')) {`));

  fs.writeFileSync(filePath, before + newStartLogic + "\n" + modifiedAfter, 'utf8');
  console.log("Rewrite successful.");
} else {
  console.log("Error: could not find strings");
}
