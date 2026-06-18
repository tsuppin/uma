const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engine.ts');
let content = fs.readFileSync(filePath, 'utf8');

const anchor = `    // 25. 函館・脚質ルール4: 「上がり3ハロン」より「テンの速さ（1〜2角の位置取り）」
    if (prevRaceData && prevRaceData.corner1Position !== undefined && prevRaceData.corner2Position !== undefined) {
      if (prevRaceData.corner1Position <= 3 && prevRaceData.corner2Position <= 3) {
        potential += 15;
        tags.push("👑 函館脚質特注: 上がり最速よりテンの速さ！1〜2角を前目で通過するダッシュ力を高く評価");
      }
    }`;

const newRules = `    // 25. 函館・脚質ルール4: 「上がり3ハロン」より「テンの速さ（1〜2角の位置取り）」
    if (prevRaceData && prevRaceData.corner1Position !== undefined && prevRaceData.corner2Position !== undefined) {
      if (prevRaceData.corner1Position <= 3 && prevRaceData.corner2Position <= 3) {
        potential += 15;
        tags.push("👑 函館脚質特注: 上がり最速よりテンの速さ！1〜2角を前目で通過するダッシュ力を高く評価");
      }
    }

    // 26. 函館・前走実績ルール1: 前走「掲示板（1〜5着）確保馬」の信頼度は高い
    if (prevRaceData && prevRaceData.result !== undefined && prevRaceData.result >= 1 && prevRaceData.result <= 5) {
      potential += 15;
      tags.push("👑 函館実績特注: 前走掲示板(1〜5着)確保で好調を維持している堅実な軸候補");
    }

    // 27. 函館・前走実績ルール2: 前走「6着〜9着」の馬が美味しい配当を連れてくる
    if (prevRaceData && prevRaceData.result !== undefined && prevRaceData.result >= 6 && prevRaceData.result <= 9) {
      potential += 20; // 穴馬としての期待値
      tags.push("💥 函館実績特注: 前走6〜9着の中途半端に負けた馬による適性変化の巻き返し(中穴)");
    }

    // 28. 函館・前走実績ルール3: 前走「二桁着順（大敗）」でも、先行力があれば切らない
    if (prevRaceData && prevRaceData.result >= 10) {
      if (prevRaceData.corner1Position !== undefined && prevRaceData.corner1Position <= 3) {
        potential += 25; // 先行力があれば大穴
        tags.push("💥 函館実績特注: 前走二桁着順の大敗でも、テンの速さ(前目通過)がある一発警戒の大穴");
      }
    }

    // 29. 函館・前走実績ルール4: 前走が「他場（広いコース）」からのコース替わりを狙う
    if (prevRaceData && prevRaceData.venue) {
      if (prevRaceData.venue.includes('東京') || prevRaceData.venue.includes('新潟') || prevRaceData.venue.includes('京都') || prevRaceData.venue.includes('中京')) {
        potential += 15;
        tags.push("🌟 函館実績特注: 広いコース(東京・新潟・京都など)で差し届かなかった馬の小回り替わり一変");
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
