const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engineNAR.ts');
let content = fs.readFileSync(filePath, 'utf8');

const searchString = `    // --- [既存のマニアックルール] --------------------------
    if (dist === 1500 && frame <= 3 && horse.style === '逃げ') {
      potential += 20;
      tags.push("🔥 川崎マニアック: 日本一タイトなコーナーをロスなく回る川崎1500m内枠逃げ");
    }`;

const newPastResultLogic = `    // --- [前走以前の実績ルール (追加4箇条)] --------------------------
    
    // 実績ルール1: 「前走2着・3着」の惜敗馬を素直に「1着」で狙う
    if (prevRaceData && (prevRaceData.result === 2 || prevRaceData.result === 3)) {
      potential += 15;
      tags.push("👑 川崎特注: 勝ち切るチャンス！好調を維持する前走惜敗馬");
    }

    // 実績ルール2: 前走大敗馬は「川崎での好走歴」または「前々走の勝利」を確認する
    if (prevRaceData && prevRaceData.result >= 6 && horse.pastRaces && horse.pastRaces.length > 1) {
      let hasGoodKawasaki = false;
      let hasRecentWin = false;
      for (let i = 1; i < horse.pastRaces.length; i++) {
        const r = horse.pastRaces[i];
        if (r.venue && r.venue.includes('川崎') && r.result <= 3) hasGoodKawasaki = true;
        if (r.result === 1) hasRecentWin = true;
      }
      if (hasGoodKawasaki || hasRecentWin) {
        potential += 20;
        tags.push("💥 川崎特注: 前走大敗は罠！近5走に隠れた川崎適性・地力の高さに警戒");
      }
    }

    // 実績ルール3: 「JRAからの転入馬」や「他地区の重賞実績馬」の底力を重視する
    const isFromJRA = horse.transferFrom === 'JRA' || horse.belonging === 'JRA';
    let hasGradedStakes = false;
    if (horse.pastRaces) {
      for (const r of horse.pastRaces) {
        // 重賞や特別戦のざっくりとした判定
        if (r.raceName && (r.raceName.includes('重賞') || r.raceName.includes('スプリント') || r.raceName.includes('G') || r.raceName.includes('Jpn'))) {
          hasGradedStakes = true;
        }
      }
    }
    if (isFromJRA || hasGradedStakes) {
      potential += 15;
      tags.push("💥 川崎特注: 重馬場でモノを言うJRA転入馬・他地区重賞実績馬の「底力」");
    }

    // 実績ルール4: 「超短距離（900m〜1200m）」を使われてきたスピード馬を評価する
    let usedInShortDist = false;
    if (horse.pastRaces) {
      for (let i = 0; i < Math.min(horse.pastRaces.length, 5); i++) {
        if (horse.pastRaces[i].dist <= 1200) {
          usedInShortDist = true;
          break;
        }
      }
    }
    if (usedInShortDist) {
      potential += 10;
      tags.push("💥 川崎特注: 時計の速い馬場でスピード負けしない超短距離(900〜1200m)経験馬");
    }

    // --- [既存のマニアックルール] --------------------------
    if (dist === 1500 && frame <= 3 && horse.style === '逃げ') {
      potential += 20;
      tags.push("🔥 川崎マニアック: 日本一タイトなコーナーをロスなく回る川崎1500m内枠逃げ");
    }`;

if (content.includes(searchString)) {
  content = content.replace(searchString, newPastResultLogic);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Replacement successful.");
} else {
  console.log("Error: could not find search string");
}
