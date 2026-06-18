const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engineNAR.ts');
let content = fs.readFileSync(filePath, 'utf8');

const searchString = `    // --- [既存のマニアックルール] --------------------------
    if (dist === 1500 && frame <= 3 && horse.style === '逃げ') {
      potential += 20;
      tags.push("🔥 川崎マニアック: 日本一タイトなコーナーをロスなく回る川崎1500m内枠逃げ");
    }`;

const newHimoLogic = `    // --- [6〜8番人気の穴馬（ヒモ穴）を狙う4つの条件] --------------------------
    if (popularity >= 6 && popularity <= 8) {
      let himoPoints = 0;
      let reasons = [];

      // 条件1: 「前走3着〜5着」の善戦馬
      if (prevRaceData && prevRaceData.result >= 3 && prevRaceData.result <= 5) {
        himoPoints += 10;
        reasons.push("前走善戦");
      }

      // 条件2: 「1〜2枠（内枠）」または「7〜8枠（外枠）」
      if (frame <= 2 || frame >= 7) {
        himoPoints += 5;
        reasons.push("極端枠");
      }

      // 条件3: 近走で「4番手以内」の先行策をとれた経験がある馬
      let hasEarlySpeed = false;
      if (horse.pastRaces) {
        for (let i = 0; i < Math.min(horse.pastRaces.length, 3); i++) {
          if (horse.pastRaces[i].corner4Position !== undefined && horse.pastRaces[i].corner4Position <= 4) {
            hasEarlySpeed = true;
            break;
          }
        }
      }
      if (hasEarlySpeed) {
        himoPoints += 10;
        reasons.push("先行力");
      }

      // 条件4: 「継続騎乗」または「好調騎手への乗り替わり」
      const isGoodJockeyRide = isJockeyChangedK && ['町田', '新原', '矢野', '御神本', '森泰'].some(j => jName.includes(j));
      if (!isJockeyChangedK || isGoodJockeyRide) {
        himoPoints += 10;
        reasons.push(!isJockeyChangedK ? "継続騎乗" : "勝負乗替");
      }

      // 複数条件クリアで強力なヒモ穴として評価
      if (himoPoints >= 20) {
        potential += 20;
        tags.push(\`💥 川崎特注: 高配当の使者！6〜8番人気の好走条件合致(\${reasons.join(', ')})\`);
      }
    }

    // --- [既存のマニアックルール] --------------------------
    if (dist === 1500 && frame <= 3 && horse.style === '逃げ') {
      potential += 20;
      tags.push("🔥 川崎マニアック: 日本一タイトなコーナーをロスなく回る川崎1500m内枠逃げ");
    }`;

if (content.includes(searchString)) {
  content = content.replace(searchString, newHimoLogic);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Replacement successful.");
} else {
  console.log("Error: could not find search string");
}
