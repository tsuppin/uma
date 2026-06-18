const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engine.ts');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = "if (trackName.includes('阪神')) {\n      // マニアック1: 阪神ダート1400m専用「芝スタート×外枠×芝用スピード血統」";
const targetStr2 = "if (trackName.includes('阪神')) {\r\n      // マニアック1: 阪神ダート1400m専用「芝スタート×外枠×芝用スピード血統」";

const replaceStr = `if (trackName.includes('阪神')) {
      // ==========================================
      // 【特化ロジック】阪神特化トレンド（2026/06抽出）
      // ==========================================
      // ルール1：1着馬は「5番人気以内」から選ぶ
      if (popularity >= 1 && popularity <= 5) {
        tags.push("👑 阪神特注: 1着候補は信頼の上位人気(5番人気以内)から");
      } else {
        potential -= 30; // 6番人気以下の頭狙いは極めて危険なため大幅減点
        tags.push("⚠️ 阪神減点: 大穴(6番人気以下)の1着狙いは危険");
      }

      // ルール2：「上がり3ハロン最速馬」を重視する
      if (prevRaceData && prevRaceData.last3fTime) {
        const prevLast3f = parseFloat(prevRaceData.last3fTime);
        if (!isNaN(prevLast3f) && prevLast3f <= 34.5) { // 上がりが速い馬を評価
          potential += 20;
          tags.push("🔥 阪神特注: 鋭い末脚(上がり最速候補)を持つ馬");
        }
      }

      // ルール3：脚質は「先行・好位差し」が圧倒的に有利
      if (horse.style === '先行' || horse.style === '好位') {
        potential += 15;
        tags.push("🔥 阪神特注: 圧倒的有利な先行・好位ポジション");
      } else if (horse.style === '追込' || horse.style === '後方') {
        potential -= 20;
        tags.push("⚠️ 阪神減点: 届かない極端な後方待機(追込不利)");
      }

      // ルール4：近走（前走・前々走）で「3着以内」の好走歴がある馬を狙う
      if (prevRaceData && prevRaceData.result <= 3) {
        potential += 20;
        tags.push("🔥 阪神特注: 近走3着以内の好調馬(安定感抜群)");
      }

      // マニアック1: 阪神ダート1400m専用「芝スタート×外枠×芝用スピード血統」`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Replaced using targetStr (LF)");
} else if (content.includes(targetStr2)) {
  content = content.replace(targetStr2, replaceStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Replaced using targetStr2 (CRLF)");
} else {
  console.log("Error: Target string not found.");
}
