const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engine.ts');
let content = fs.readFileSync(filePath, 'utf8');

const anchor = 'tags.push("🌟 函館マイスター騎手：コース熟知と積極策エッジ");\r\n    }';

const newRules = `tags.push("🌟 函館マイスター騎手：コース熟知と積極策エッジ");
    }

    // 7. 新ルール1: 1番人気は1着固定を避け、連軸やヒモとして扱う
    if (popularity === 1) {
      potential -= 10; // アタマ（1着）の確率が低いため減点
      tags.push("⚠️ 函館特注: 1番人気は1着固定のリスク大(勝率8.3%)。連軸や2〜3着候補へ");
    }

    // 8. 新ルール2: 勝馬の条件は「4コーナーで5番手以内」の逃げ・先行馬
    if (prevRaceData && prevRaceData.corner4Position !== undefined && prevRaceData.corner4Position <= 5) {
      potential += 15; // 強力な勝ち馬条件
      tags.push("👑 函館特注: 圧倒的有利な「4角5番手以内」の先行力");
    }

    // 9. 新ルール3: 1着候補には「2〜5番人気」の中位人気馬を狙う
    if (popularity >= 2 && popularity <= 5) {
      potential += 15; // 1着候補としてスコアを底上げ
      tags.push("👑 函館特注: 1番人気よりも1着になる確率が極めて高い2〜5番人気の中穴候補");
    }

    // 10. 新ルール4: 前走「大敗馬(二桁着順)」のコース替わり巻き返し
    if (prevRaceData && prevRaceData.result >= 10) {
      const isCourseChanged = prevRaceData.venue && !prevRaceData.venue.includes('函館');
      if (isCourseChanged) {
        potential += 25; // 大敗ペナルティを大きく相殺する加点
        tags.push("💥 函館穴馬: 前走二桁着順からのコース替わり(小回り・洋芝)による一変警戒");
      }
    }

    // 11. 特注騎手: 横山和生騎手
    if (jockey.includes("横山和生")) {
      potential += 20;
      tags.push("👑 函館特注: 函館コースと相性抜群で絶好調の横山和生騎手");
    }`;

// Fallback logic for LF/CRLF
let index = content.indexOf(anchor);
if (index === -1) {
  index = content.indexOf(anchor.replace(/\r\n/g, '\n'));
  if (index !== -1) {
    content = content.replace(anchor.replace(/\r\n/g, '\n'), newRules);
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
