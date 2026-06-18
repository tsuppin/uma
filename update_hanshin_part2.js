const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engine.ts');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `      // ルール4：近走（前走・前々走）で「3着以内」の好走歴がある馬を狙う
      if (prevRaceData && prevRaceData.result <= 3) {
        potential += 20;
        tags.push("🔥 阪神特注: 近走3着以内の好調馬(安定感抜群)");
      }`;

const replaceStr = `      // ルール4：近走（前走・前々走）で「3着以内」の好走歴がある馬を狙う
      if (prevRaceData && prevRaceData.result <= 3) {
        potential += 20;
        tags.push("🔥 阪神特注: 近走3着以内の好調馬(安定感抜群)");
      }

      // ルール5：好調な騎手の「固め打ち」を狙う
      const hotJockeysHanshin = ['坂井瑠星', '川田将雅', '岩田望来', '幸英明', '西塚洸二', '田口貫太', '北村友一'];
      const isHotJockey = horse.jockey && hotJockeysHanshin.some(j => horse.jockey.includes(j));
      if (isHotJockey) {
        potential += 20;
        tags.push("👑 阪神特注: 固め打ちが目立つ絶好調ジョッキー");
      }

      // ルール6：「トップジョッキーへの乗り替わり」と「継続騎乗」
      if (prevRaceData && horse.jockey && prevRaceData.jockey) {
        // ※文字列に斤量記号などが含まれる場合を考慮して部分一致や名前のコア部分で判定するのが望ましいが、簡易的に
        const cleanCurrentJockey = horse.jockey.replace(/[☆▲△◇★]/g, '');
        const cleanPrevJockey = prevRaceData.jockey.replace(/[☆▲△◇★]/g, '');
        
        if (cleanCurrentJockey === cleanPrevJockey) {
          potential += 10;
          tags.push("🔥 阪神特注: 馬の癖を知り尽くした継続騎乗のアドバンテージ");
        } else if (isHotJockey) {
          potential += 15;
          tags.push("🔥 阪神特注: 勝負気配の高いトップジョッキーへの乗り替わり");
        }
      }

      // ルール7：「減量特典」だけを理由に買わない
      const isApprenticeHanshin = horse.jockey && horse.jockey.match(/[☆▲△◇★]/);
      if (isApprenticeHanshin) {
        potential -= 10;
        tags.push("⚠️ 阪神減点: 減量特典(△▲等)のみを理由にした過信は禁物");
      }`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Successfully updated Hanshin specific logic (part 2).");
} else {
  console.log("Error: Target string not found.");
}
