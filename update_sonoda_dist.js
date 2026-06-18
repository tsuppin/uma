const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engineNAR.ts');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `    // マニアック2: 大外枠の絶望
    if (frame >= 7 && dist === 1400) {
      potential -= 30;
      tags.push("⚠️ 園田危険: 1400mの1コーナーで外を回される致命的な距離ロス（外枠減点）");
    }
  }`;

const replaceStr = `    // マニアック2: 大外枠の絶望
    if (frame >= 7 && dist === 1400) {
      potential -= 30;
      tags.push("⚠️ 園田危険: 1400mの1コーナーで外を回される致命的な距離ロス（外枠減点）");
    }

    // ==========================================
    // 【特化ロジック】園田競馬場・距離変更とタイム差大敗のトラップ（2026/06分析）
    // ==========================================
    if (prevRaceData) {
      // 距離ルール1：アタマの王道「同距離ローテ」
      if (prevRaceData.distance === dist) {
        potential += 10;
        tags.push("👑 園田特注: アタマの王道！ペース慣れしている同距離ローテ");
      }

      // 距離ルール2：ヒモ穴を呼ぶ「大幅な距離短縮組」
      if (prevRaceData.distance !== undefined && prevRaceData.distance > dist && popularity >= 6) {
        potential += 15; // 距離短縮による一変を期待してヒモ穴スコアを底上げ
        tags.push("💥 園田特注: 一変の可能性大！距離短縮でペースが向くヒモ穴候補");
      }

      // 距離ルール3：最大のトラップ「前走タイム差大敗」は巻き返し候補
      if (prevRaceData.timeMargin !== undefined && prevRaceData.timeMargin >= 1.0) {
        // NAR汎用の大敗ペナルティ等を相殺し、穴馬としてフラット〜プラスに評価するための救済加点
        const recoveryBonus = popularity >= 6 ? 15 : 5;
        potential += recoveryBonus;
        tags.push("💥 園田特注: 前走1.0秒以上の大差負けは罠！人気落ちなら美味しい巻き返し候補");
      }
    }
  }`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Successfully updated Sonoda distance rules.");
} else {
  console.log("Error: Target string not found.");
}
