const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engineNAR.ts');
let content = fs.readFileSync(filePath, 'utf8');

const startIndex = content.indexOf("  else if (trackName.includes('笠松')) {");
const endIndex = content.indexOf("  else if (trackName.includes('園田') || trackName.includes('姫路')) {");

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `  else if (trackName.includes('笠松')) {
    // ==========================================
    // 【特化ロジック】笠松特化トレンド（2026/06抽出）
    // ==========================================
    const popularity = horse.popularity || 99;
    const prevRace = horse.pastRaces && horse.pastRaces.length > 0 ? horse.pastRaces[0] : null;

    // ルール1：外枠（特に7枠・8枠）を重視する
    if (frame >= 6) {
      potential += 20;
      if (frame >= 7) potential += 10; // 7, 8枠はさらにプラス
      tags.push("🔥 笠松特注: 勝率の高い有利な外枠(6〜8枠)");
    } else {
      potential -= 10;
      tags.push("⚠️ 笠松減点: 不利な内・中枠(1〜5枠)ペナルティ");
    }

    // ルール2：軸馬は「1・2番人気」、相手には「中穴」を絡める
    if (popularity === 1 || popularity === 2) {
      potential += 30;
      tags.push("👑 笠松鉄板: 信頼度の高い上位人気(1・2番人気軸)");
    } else if (popularity >= 4 && popularity <= 7) {
      potential += 15;
      tags.push("🌟 笠松特注: ヒモ荒れを演出する中穴候補(4〜7番人気必須)");
    } else if (popularity >= 8) {
      potential -= 15; // 8番人気以下の大穴は来にくい
    }

    // ルール3：特定の「好調騎手」をマークする
    if (horse.jockey) {
      if (horse.jockey.includes('渡邊竜')) {
        potential += 30;
        tags.push("👑 笠松特注: 勝ち切る力を見せる渡邊竜也騎手(1着候補)");
      } else if (horse.jockey.includes('筒井勇')) {
        potential += 10; // 頭にはなりにくい程度の加点
        tags.push("🌟 笠松特注: 馬券圏内への安定感抜群の筒井勇騎手(2〜3着付け推奨)");
      } else if (horse.jockey.includes('東川慎') || horse.jockey.includes('松本')) {
        potential += 20;
        tags.push("🔥 笠松特注: 複数勝利を挙げる好調騎手(東川・松本)");
      }
    }

    // ルール4：前走「1〜3着」の好走馬の勢いを素直に評価する
    if (prevRace && prevRace.result >= 1 && prevRace.result <= 3) {
      potential += 25;
      tags.push("🔥 笠松特注: 勢いを素直に評価すべき前走1〜3着の好走馬");
    }
  }
`;

  content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Successfully refactored Kasamatsu logic.");
} else {
  console.log("Could not find start or end index.");
}
