const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engine.ts');
let content = fs.readFileSync(filePath, 'utf8');

const anchor = `    // 岩手リーディング全般のフォロー(残りのトップ騎手)
    const isIwateEliteJ = ["山本聡", "高松亮", "菅原辰"].some(j => jockey.includes(j));`;

const newRules = `    // 11. 水沢過去実績ルール1〜3: 過去5走に基づくアタマ判定・隠れ好調馬・大敗無視
    if (horse.pastRaces && horse.pastRaces.length > 0) {
      let hasTop3InPast5 = false;
      let hasWinOrSecondIn3to5 = false;
      let hasBigLossInPast5 = false;
      let recent2RacesPoor = false;

      const past5 = horse.pastRaces.slice(0, 5);
      past5.forEach((pr, index) => {
        if (pr.result !== undefined) {
          if (pr.result <= 3) hasTop3InPast5 = true;
          if (pr.result >= 10) hasBigLossInPast5 = true;
          if (index >= 2 && index <= 4 && pr.result <= 2) {
            hasWinOrSecondIn3to5 = true;
          }
        }
      });

      const recent2 = past5.slice(0, 2);
      let poorCount = 0;
      recent2.forEach(pr => {
        if (pr.result !== undefined && pr.result >= 4) poorCount++;
      });
      if (poorCount === recent2.length && recent2.length > 0) recent2RacesPoor = true;

      // ルール1: 過去5走で一度も3着以内がない馬はアタマ(1着)候補から切る
      if (!hasTop3InPast5 && past5.length >= 3) {
        potential -= 20;
        tags.push("⚠️ 水沢減点: 過去5走で馬券内(3着以内)ゼロの馬はアタマ候補から消し");
      }

      // ルール2: 前走・前々走が不振でも、3〜5走前に「連対(1〜2着)実績」があれば巻き返せる
      if (recent2RacesPoor && hasWinOrSecondIn3to5) {
        potential += 25;
        tags.push("💥 水沢大穴特注: 近2走不振でも3〜5走前に連対実績あり！巻き返し必至の隠れ好調馬");
      }

      // ルール3: 近走に「二桁着順(大敗)」が混ざっていてもマイナス評価にしない
      if (hasTop3InPast5 && hasBigLossInPast5) {
        potential += 10; // 大敗による不当な人気の落ち込みを補正
        tags.push("🌟 水沢救済: 近走に二桁大敗があっても好走歴があれば巻き返し可能(大敗無視ルール)");
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
