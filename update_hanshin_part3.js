const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engine.ts');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `      // ルール7：「減量特典」だけを理由に買わない
      const isApprenticeHanshin = horse.jockey && horse.jockey.match(/[☆▲△◇★]/);
      if (isApprenticeHanshin) {
        potential -= 10;
        tags.push("⚠️ 阪神減点: 減量特典(△▲等)のみを理由にした過信は禁物");
      }`;

const replaceStr = `      // ルール7：「減量特典」だけを理由に買わない
      const isApprenticeHanshin = horse.jockey && horse.jockey.match(/[☆▲△◇★]/);
      if (isApprenticeHanshin) {
        potential -= 10;
        tags.push("⚠️ 阪神減点: 減量特典(△▲等)のみを理由にした過信は禁物");
      }

      // ルール8：「1〜5枠（内・中枠）」が有利で、大外の8枠は絶望的
      if (frame >= 1 && frame <= 5) {
        potential += 10;
        tags.push("🔥 阪神特注: 有利な内〜中枠(1〜5枠)でロスなく運べる");
      } else if (frame === 8) {
        potential -= 25;
        tags.push("⚠️ 阪神減点: 1着が絶望的な大外8枠の極端な距離ロス");
      } else if (frame === 6 || frame === 7) {
        potential -= 10;
        tags.push("⚠️ 阪神減点: 外枠(6・7枠)の距離ロス");
      }

      // ルール9：「馬体重の変動が少ない馬（±8kg以内）」の信頼度
      if (prevRaceData && typeof horse.weightChange === 'number') {
        const absChange = Math.abs(horse.weightChange);
        if (absChange === 0) {
          potential += 15;
          tags.push("👑 阪神特注: 究極の勝負仕上げ(馬体重増減±0kg)");
        } else if (absChange <= 8) {
          potential += 10;
          tags.push("🔥 阪神特注: 安定した状態キープ(馬体重増減±8kg以内)");
        } else {
          potential -= 15;
          tags.push("⚠️ 阪神減点: 状態不安の大幅な馬体重変動(±9kg以上)");
        }
      }

      // ルール10：馬券は「2着・3着に人気薄」のヒモ荒れを狙う
      if (popularity >= 6) {
        // ヒモ穴として拾えるようにベーススコアを底上げして残す
        potential += 15;
        tags.push("💥 阪神特注: 2・3着のヒモ荒れ大穴候補");
      }`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Successfully updated Hanshin specific logic (part 3).");
} else {
  console.log("Error: Target string not found.");
}
