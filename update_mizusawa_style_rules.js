const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engine.ts');
let content = fs.readFileSync(filePath, 'utf8');

const anchor = `    // 1. 超小回り（右回り）の物理バイアス
    if (horse.style === "逃げ" || horse.style === "先行") {
      potential += 20;
      tags.push("🏃 水沢超小回り物理: 逃げ・先行の絶対的優位");
    } else if (horse.style === "追込") {
      potential -= 25;
      tags.push("❌ 水沢追込困難: 直線が短く物理的に届かない");
    }`;

const newRules = `    // 1. 水沢・脚質ルール1&3: 前残りの「逃げ・先行馬」絶対優位 (テンの速さ重視)
    const isFrontRunner = horse.style === "逃げ" || horse.style === "先行" || (prevRaceData && prevRaceData.corner1Position !== undefined && prevRaceData.corner1Position <= 3);
    if (isFrontRunner) {
      potential += 25;
      tags.push("🏃 水沢脚質特注: 稍重馬場で前残りが顕著！アタマ(1着)候補の逃げ・先行馬");
      tags.push("🏃 水沢脚質特注: 上がりタイムよりもテンの速さ(1角の位置取り)を絶対視すべし");
    }
    
    // 1b. 水沢・脚質ルール2: 「差し・追込馬」は2・3着の相手候補(ヒモ)
    const isCloser = horse.style === "差し" || horse.style === "追込" || (!isFrontRunner && prevRaceData && prevRaceData.corner1Position !== undefined && prevRaceData.corner1Position >= 6);
    if (isCloser) {
      potential -= 10; // アタマの確率が低いためやや割引
      tags.push("🎫 水沢馬券戦略: 差し・追込馬はアタマ(1着)では狙わず、2〜3着のヒモとして扱うべし");
    }`;

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
