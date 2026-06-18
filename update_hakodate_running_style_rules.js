const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engine.ts');
let content = fs.readFileSync(filePath, 'utf8');

const anchor = `    // 22. 函館・枠順ルール4: 最内「1枠」の1着固定は危険
    if (frame === 1) {
      potential -= 15; // アタマ候補から下げる
      tags.push("⚠️ 函館枠順減点: 包まれるリスクが高く1着を取りこぼしやすい最内1枠");
    }`;

const newRules = `    // 22. 函館・枠順ルール4: 最内「1枠」の1着固定は危険
    if (frame === 1) {
      potential -= 15; // アタマ候補から下げる
      tags.push("⚠️ 函館枠順減点: 包まれるリスクが高く1着を取りこぼしやすい最内1枠");
    }

    // 23. 函館・脚質ルール1&3: 1着・2着の絶対条件は「4コーナー5番手以内」(前残り)
    if (horse.style === '差し' || horse.style === '追込') {
      potential -= 25; // 差し・追込は届かない
      tags.push("⚠️ 函館脚質減点: 後方待機(差し・追込)は圧倒的不利。1着候補からは完全除外");
    } else if (prevRaceData && prevRaceData.corner4Position !== undefined) {
      if (prevRaceData.corner4Position > 5) {
        potential -= 20;
        tags.push("⚠️ 函館脚質減点: 4角6番手以降からの直線の短さによる物理的な届かなさ");
      }
    }

    // 24. 函館・脚質ルール2: 迷ったら「逃げ馬（4角1番手）」の1着固定
    if (horse.style === '逃げ' || (prevRaceData && prevRaceData.corner4Position === 1)) {
      potential += 25;
      tags.push("👑 函館脚質特注: 最強の脚質「逃げ(4角先頭)」。高確率で逃げ切りが発生するためアタマ固定推奨");
    }

    // 25. 函館・脚質ルール4: 「上がり3ハロン」より「テンの速さ（1〜2角の位置取り）」
    if (prevRaceData && prevRaceData.corner1Position !== undefined && prevRaceData.corner2Position !== undefined) {
      if (prevRaceData.corner1Position <= 3 && prevRaceData.corner2Position <= 3) {
        potential += 15;
        tags.push("👑 函館脚質特注: 上がり最速よりテンの速さ！1〜2角を前目で通過するダッシュ力を高く評価");
      }
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
