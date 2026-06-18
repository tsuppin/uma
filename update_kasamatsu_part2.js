const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engineNAR.ts');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `    // ルール4：前走「1〜3着」の好走馬の勢いを素直に評価する
    if (prevRace && prevRace.result >= 1 && prevRace.result <= 3) {
      potential += 25;
      tags.push("🔥 笠松特注: 勢いを素直に評価すべき前走1〜3着の好走馬");
    }`;

const replaceStr = `    // ルール4：前走「1〜3着」の好走馬の勢いを素直に評価する
    if (prevRace && prevRace.result >= 1 && prevRace.result <= 3) {
      potential += 25;
      tags.push("🔥 笠松特注: 勢いを素直に評価すべき前走1〜3着の好走馬");
    }

    // 追加ルール1：圧倒的な勝率を誇る「4歳馬」を狙う
    if (horse.age === 4) {
      potential += 25;
      tags.push("🔥 笠松特注: 勝率が極めて高い圧倒的有利な4歳馬");
    }

    // 追加ルール2：前走で「1着・2着」だった馬の勢いを素直に信頼する（既存ルール4の上乗せ）
    if (prevRace && (prevRace.result === 1 || prevRace.result === 2)) {
      potential += 15;
      tags.push("🔥 笠松特注: 勢いそのままに連勝・好走が見込める前走1〜2着馬");
    }

    // 追加ルール3：馬体重の増減が「±5kg以内」の安定した馬を頭（1着）にする
    const weightChange = horse.weightChange || 0;
    if (weightChange >= -5 && weightChange <= 5) {
      potential += 15;
      tags.push("👑 笠松特注: 馬体重安定(±5kg以内)の勝負気配(1着候補)");
    } else if (weightChange >= 10 || weightChange <= -10) {
      potential -= 15;
      tags.push("⚠️ 笠松減点: 極端な馬体重増減による割り引き");
    }

    // 追加ルール4：「1番人気」は1着固定ではなく、「連対（2着以内）」として馬券に組み込む
    if (popularity === 1) {
      // 1番人気の絶対的な頭固定を防ぎ、相手（ヒモ・連対）になりやすくする
      potential -= 10;
      tags.push("⚠️ 笠松特注: 1番人気は1着を取りこぼしやすいため2着(連対)候補推奨");
    }`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Successfully updated Kasamatsu specific logic (part 2).");
} else {
  console.log("Error: Target string not found.");
}
