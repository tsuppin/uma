const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engineNAR.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Find the block for 門別
const startIndex = content.indexOf("  else if (trackName.includes('門別')) {");
const endIndex = content.indexOf("  else if (trackName.includes('盛岡')) {");

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `  else if (trackName.includes('門別')) {
    // ==========================================
    // 【完全減点方式】門別特化・最新トレンドプロトコル（2026/06抽出）
    // ==========================================
    const popularity = horse.popularity || 99;
    const prevRace = horse.pastRaces && horse.pastRaces.length > 0 ? horse.pastRaces[0] : null;

    let mombetsuPenalty = 0;

    // Rule 1: 枠順ペナルティ（内枠）
    if (frame >= 1 && frame <= 4) {
      mombetsuPenalty += 15;
      tags.push("❌ 門別減点: 不利な内枠(1〜4枠)ペナルティ");
    }

    // Rule 2: 前走成績ペナルティ（大敗）
    if (prevRace && prevRace.result >= 6) {
      mombetsuPenalty += 20;
      tags.push("❌ 門別減点: 前走6着以下(大敗)ペナルティ");
    }

    // Rule 3: 脚質・上がりペナルティ（差し・追込）
    if (horse.style === '差し' || horse.style === '追込') {
      mombetsuPenalty += 10;
      tags.push("❌ 門別減点: 前残り馬場における差し・追込ペナルティ(ヒモ推奨)");
    }

    // Rule 4: ローテーションペナルティ（距離変更）
    if (prevRace && prevRace.distance !== race.distance) {
      mombetsuPenalty += 10;
      tags.push("❌ 門別減点: 距離変更(ローテーション)ペナルティ");
    }

    // 特例3: 相手候補限定の騎手特例（減量騎手、服部茂、岩橋勇）
    const isApprentice = horse.jockey && horse.jockey.match(/[☆▲△◇]/);
    const isHimoJockey = horse.jockey && (horse.jockey.includes('服部茂') || horse.jockey.includes('岩橋勇'));
    
    if (isApprentice || isHimoJockey) {
      // 2〜3着候補（ヒモ）としての評価を保つため、枠と脚質の減点を免除する
      if (frame >= 1 && frame <= 4) mombetsuPenalty -= 15;
      if (horse.style === '差し' || horse.style === '追込') mombetsuPenalty -= 10;
      
      // 頭（1着）候補からは外すため、ベースポテンシャルをわずかに削る
      potential -= 5;
      tags.push("🌟 門別特例: ヒモ職人(服部/岩橋/減量騎手)による枠・脚質ペナルティ免除");
    }

    // 特例1 & 2: 落合玄騎手・小国博計厩舎の特例オーバーライド
    if (popularity === 1 || popularity === 2) {
      if (horse.jockey && horse.jockey.includes('落合')) {
        mombetsuPenalty = 0; // すべての減点を免除
        potential += 30; // 確定軸としての絶対的ボーナス加点
        tags.push("👑 門別特例: 落合玄騎手×上位人気の絶対的信頼(全減点免除)");
      } else if (horse.trainer && horse.trainer.includes('小国')) {
        mombetsuPenalty = Math.floor(mombetsuPenalty / 2); // 減点を半減
        potential += 15; // 信頼軸としてのボーナス加点
        tags.push("👑 門別特例: 小国博計厩舎×上位人気の安定感(減点半減)");
      }
    }

    // 最終的なペナルティをポテンシャルから減算
    potential -= Math.max(0, mombetsuPenalty);
  }
`;

  content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Successfully refactored Mombetsu logic to penalty system.");
} else {
  console.log("Could not find start or end index.");
}
