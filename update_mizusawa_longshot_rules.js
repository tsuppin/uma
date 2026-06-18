const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engine.ts');
let content = fs.readFileSync(filePath, 'utf8');

const anchor = `    // 岩手リーディング全般のフォロー(残りのトップ騎手)
    const isIwateEliteJ = ["山本聡", "高松亮", "菅原辰"].some(j => jockey.includes(j));`;

const newRules = `    // 13. 水沢・穴馬(6〜8番人気)の激走条件
    if (popularity >= 6 && popularity <= 8) {
      // 穴条件1: 坂井瑛・小林凌の継続騎乗
      const isSakaiOrKobayashi = jockey.includes("坂井瑛") || jockey.includes("小林凌");
      if (isSakaiOrKobayashi && cleanPrevJockeyMiz && cleanPrevJockeyMiz === cleanCurrentJockeyMiz) {
        potential += 25;
        tags.push("💥 水沢超大穴特注: 穴メーカー(坂井瑛・小林凌)の継続騎乗は激走のサイン！絶対買い");
      }
      
      // 穴条件2: 近2走大敗でも3〜5走前に好走歴(1着など)あり
      let recent2Poor = false;
      let winIn3to5 = false;
      if (horse.pastRaces && horse.pastRaces.length >= 3) {
        let poorCount = 0;
        for (let i = 0; i < 2 && i < horse.pastRaces.length; i++) {
          if (horse.pastRaces[i].result !== undefined && horse.pastRaces[i].result >= 4) poorCount++;
        }
        if (poorCount === 2 || (horse.pastRaces.length === 1 && poorCount === 1)) recent2Poor = true;
        
        for (let i = 2; i < 5 && i < horse.pastRaces.length; i++) {
          if (horse.pastRaces[i].result !== undefined && horse.pastRaces[i].result <= 3) winIn3to5 = true;
        }
      }
      if (recent2Poor && winIn3to5) {
        potential += 20;
        tags.push("💥 水沢超大穴特注: 人気ガタ落ちの今が狙い目！3〜5走前に上位好走歴がある隠れ実力馬");
      }
      
      // 穴条件3: 過去に好走した騎手への手戻り
      let isReturnToGoodJockey = false;
      if (cleanPrevJockeyMiz && cleanPrevJockeyMiz !== cleanCurrentJockeyMiz && horse.pastRaces && horse.pastRaces.length >= 2) {
        for (let i = 1; i < horse.pastRaces.length && i < 5; i++) {
          const pr = horse.pastRaces[i];
          if (pr.jockey && pr.jockey.replace(/[☆▲△◇★]/g, '').trim() === cleanCurrentJockeyMiz && pr.result !== undefined && pr.result <= 3) {
            isReturnToGoodJockey = true;
            break;
          }
        }
      }
      if (isReturnToGoodJockey) {
        potential += 20;
        tags.push("💥 水沢超大穴特注: 過去の好走コンビ復活！主戦騎手への「手戻り」は激走のサイン");
      }

      // 穴条件4: ヒモ(2・3着候補)として狙うなら「内枠・中枠(1〜5枠)」
      if (frame >= 1 && frame <= 5) {
        potential += 15;
        tags.push("🎫 水沢馬券戦略: 外枠有利で人気が落ちる1〜5枠の中穴馬こそ、ヒモ荒れ(2・3着)の絶好のターゲット");
      }
    }

    // 岩手リーディング全般のフォロー(残りのトップ騎手)
    const isIwateEliteJ = ["山本聡", "高松亮", "菅原辰"].some(j => jockey.includes(j));`;

// robust CRLF/LF replace
let index = content.indexOf(anchor);
if (index === -1) {
  const normAnchor = anchor.replace(/\r\n/g, '\n');
  index = content.indexOf(normAnchor);
  if (index !== -1) {
    content = content.replace(normAnchor, newRules.replace(/\r\n/g, '\n'));
  }
} else {
  content = content.replace(anchor, newRules);
}

if (index !== -1) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Rewrite successful.");
} else {
  console.log("Error: could not find strings");
}
