const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engineNAR.ts');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `      // 騎手ルール3：安定感の加点（山本咲 / 下原）
      if (['山本咲', '下原'].some(j => jName.includes(j))) {
        potential += 5;
        tags.push("🎯 園田特注: 抜群の馬券内安定感(山本咲/下原理)");
      }
    }`;

const replaceStr = `      // 騎手ルール3：安定感の加点（山本咲 / 下原）
      if (['山本咲', '下原'].some(j => jName.includes(j))) {
        potential += 5;
        tags.push("🎯 園田特注: 抜群の馬券内安定感(山本咲/下原理)");
      }
    }

    // ==========================================
    // 【特化ロジック】園田競馬場・枠順オカルト＆セオリー（2026/06分析）
    // ==========================================

    // 枠順ルール1：「枠番」と「馬番」が一致している馬（アタマ候補として強力加点）
    if (frame === horse.horseNumber) {
      potential += 15;
      tags.push("👑 園田特注: アタマの強烈サイン！枠番と馬番が一致(勝率異常のオカルト)");
    }

    // 枠順ルール2：レース後半（5R以降）は外枠有利、前半は内枠有利
    if (race.raceNumber) {
      if (race.raceNumber >= 5 && frame >= 5) {
        potential += 5;
        tags.push("📈 園田特注: 後半レース(5R以降)の外枠有利バイアス");
      } else if (race.raceNumber <= 4 && frame <= 4) {
        potential += 5;
        tags.push("📈 園田特注: 前半レース(1〜4R)の内枠有利バイアス");
      }
    }

    // 枠順ルール3：本命馬(1番人気)と同枠・隣枠のヒモ穴推奨
    const favHorse = race.horses.find(h => h.popularity === 1);
    if (favHorse && favHorse.frame && popularity >= 4) {
      if (Math.abs(frame - favHorse.frame) <= 1) {
        potential += 10; // ヒモ穴としてスコア底上げ
        tags.push("💥 園田特注: 本命と同枠・隣接枠のヒモ穴(ゾロ目・連番決着パターン)");
      }
    }`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Successfully updated Sonoda frame rules.");
} else {
  console.log("Error: Target string not found.");
}
