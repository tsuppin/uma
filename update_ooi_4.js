const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engineNAR.ts');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `    // 第3弾ルール4: 重い「負担重量（56.0kg以上）」を苦にしない
    const currentWeight = horse.jockeyWeight || 55;
    if (currentWeight >= 56.0) {
      potential += 10;
      tags.push("💪 大井特注: 56kg以上の重斤量を苦にしない馬力");
    }`;

const replaceStr = `    // 第3弾ルール4: 重い「負担重量（56.0kg以上）」を苦にしない
    const currentWeight = horse.jockeyWeight || 55;
    if (currentWeight >= 56.0) {
      potential += 10;
      tags.push("💪 大井特注: 56kg以上の重斤量を苦にしない馬力");
    }

    // ==========================================
    // 【追加】大井特化・展開＆実績＆厩舎プロトコル（2026/06抽出）
    // ==========================================
    
    // 第4弾ルール1: 前走で「逃げ・先行（最終コーナー2番手以内）」だった馬がそのまま押し切る
    const prevRace = horse.pastRaces && horse.pastRaces.length > 0 ? horse.pastRaces[0] : null;
    if (prevRace && prevRace.corner4Position >= 1 && prevRace.corner4Position <= 2) {
      potential += 25;
      tags.push("🏇 大井特注: 前走4角2番手以内の前残り(展開絶対有利)");
    }

    // 第4弾ルール2: 後方からの「上がり最速」の馬は頭（1着固定）では狙いにくい
    if (horse.style === '差し' || horse.style === '追込') {
      // 1着を取りこぼしやすいのでポテンシャルをわずかに下げて連下（ヒモ）に留める
      potential -= 15;
      tags.push("⚠️ 大井特注: 重馬場の差し・追込は届かず2〜3着まで(頭狙い危険)");
    }

    // 第4弾ルール3: メイン級のレース（後半戦）は「前走1着馬」の連勝に逆らわない
    const isLatterHalf = race.raceNumber && race.raceNumber >= 6;
    if (isLatterHalf && prevRace && prevRace.result === 1) {
      potential += 30;
      tags.push("👑 大井特注: 後半戦(6R以降)は前走1着馬の勢いを素直に評価");
    }

    // 第4弾ルール4: 「絶好調な調教師（厩舎）」の所属馬に注目する
    const isTopTrainer = horse.trainer && ['阪本一', '的場直', '藤田輝', '荒山勝', '森下淳', '荒木英'].some(t => horse.trainer.includes(t));
    if (isTopTrainer) {
      potential += 15;
      tags.push("🔥 大井特注: 当日絶好調・リーディング上位の強力な厩舎力");
    }`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Successfully updated Ooi specific logic (running style, past race, trainer).");
} else {
  console.log("Error: Target string not found.");
}
