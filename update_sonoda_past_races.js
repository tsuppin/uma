const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engineNAR.ts');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `    // 枠順ルール3：本命馬(1番人気)と同枠・隣枠のヒモ穴推奨
    const favHorse = race.horses.find(h => h.popularity === 1);
    if (favHorse && favHorse.frame && popularity >= 4) {
      if (Math.abs(frame - favHorse.frame) <= 1) {
        potential += 10; // ヒモ穴としてスコア底上げ
        tags.push("💥 園田特注: 本命と同枠・隣接枠のヒモ穴(ゾロ目・連番決着パターン)");
      }
    }`;

const replaceStr = `    // 枠順ルール3：本命馬(1番人気)と同枠・隣枠のヒモ穴推奨
    const favHorse = race.horses.find(h => h.popularity === 1);
    if (favHorse && favHorse.frame && popularity >= 4) {
      if (Math.abs(frame - favHorse.frame) <= 1) {
        potential += 10; // ヒモ穴としてスコア底上げ
        tags.push("💥 園田特注: 本命と同枠・隣接枠のヒモ穴(ゾロ目・連番決着パターン)");
      }
    }

    // ==========================================
    // 【特化ロジック】園田競馬場・過去5走の隠れた実績評価（2026/06分析）
    // ==========================================
    if (horse.pastRaces && horse.pastRaces.length > 0) {
      const recentRaces = horse.pastRaces.slice(0, 5);
      
      let top3Count = 0;
      let allWorseThan6 = true;
      let recentSlump = true;
      let olderGoodRun = false;

      recentRaces.forEach((pr, index) => {
        if (pr.result && pr.result <= 3) {
          top3Count++;
          allWorseThan6 = false;
          if (index >= 2) { // 3走前〜5走前
            olderGoodRun = true;
          } else { // 前走・前々走 (index 0, 1)
            recentSlump = false;
          }
        } else if (pr.result && pr.result <= 5) {
          allWorseThan6 = false; // 4,5着は完全なスランプ(6着以下)ではない
          if (index < 2) {
            recentSlump = false; // 直近凡走(6着以下)ではない
          }
        }
      });

      // 過去実績ルール1：鉄板アタマ（過去5走で3回以上馬券内）
      if (top3Count >= 3) {
        potential += 15;
        tags.push("👑 園田特注: 過去5戦で3回以上好走の安定感(鉄板アタマ候補)");
      }

      // 過去実績ルール2：スランプ馬の大幅減点（過去5走すべて6着以下）
      if (allWorseThan6 && recentRaces.length >= 3) {
        potential -= 20;
        tags.push("⚠️ 園田消去法: 過去すべて6着以下の完全スランプ(アタマ・対抗から除外)");
      }

      // 過去実績ルール3：爆裂ヒモ穴（直近凡走で人気落ち × 3〜5走前に好走歴あり）
      if (recentSlump && olderGoodRun && popularity >= 6) {
        potential += 20; // ヒモとして拾いやすくするためスコア底上げ
        tags.push("💥 園田特注: 直近の大敗で人気急落の隠れた実力馬！絶好のヒモ穴推奨");
      }
    }`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Successfully updated Sonoda past races rules.");
} else {
  console.log("Error: Target string not found.");
}
