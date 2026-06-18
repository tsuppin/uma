const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engineNAR.ts');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `      // 過去実績ルール3：爆裂ヒモ穴（直近凡走で人気落ち × 3〜5走前に好走歴あり）
      if (recentSlump && olderGoodRun && popularity >= 6) {
        potential += 20; // ヒモとして拾いやすくするためスコア底上げ
        tags.push("💥 園田特注: 直近の大敗で人気急落の隠れた実力馬！絶好のヒモ穴推奨");
      }
    }`;

const replaceStr = `      // 過去実績ルール3：爆裂ヒモ穴（直近凡走で人気落ち × 3〜5走前に好走歴あり）
      if (recentSlump && olderGoodRun && popularity >= 6) {
        potential += 20; // ヒモとして拾いやすくするためスコア底上げ
        tags.push("💥 園田特注: 直近の大敗で人気急落の隠れた実力馬！絶好のヒモ穴推奨");
      }
    }

    // ==========================================
    // 【特化ロジック】園田競馬場・乗り替わりの勝負気配（2026/06分析）
    // ==========================================
    if (prevRaceData && horse.jockey && prevRaceData.jockey) {
      const isJockeyChanged = horse.jockey !== prevRaceData.jockey;
      
      if (isJockeyChanged) {
        // 乗り替わりルール1：勝負の乗り替わり（田野豊 / 小牧太へのスイッチ）
        if (['田野', '小牧太'].some(j => horse.jockey.includes(j))) {
          potential += 15;
          tags.push("👑 園田特注: 陣営の勝負気配！トップ騎手への勝負の乗り替わり");
        }

        // 乗り替わりルール3：ヒモ穴の強力ピックアップ（乗り替わり＋負担重量1.0kg以上減）
        // 型定義に依存せず安全に比較するため、パースして数値として比較
        const prevWeight = parseFloat(prevRaceData.burdenWeight);
        const currWeight = parseFloat(horse.burdenWeight);
        if (!isNaN(prevWeight) && !isNaN(currWeight)) {
          const weightDiff = prevWeight - currWeight;
          if (weightDiff >= 1.0) {
            potential += 15; // ヒモ穴としてスコア底上げ
            tags.push("💥 園田特注: 激走のサイン！乗り替わりによる負担重量1.0kg以上の軽量化");
          }
        }
      } else {
        // 乗り替わりルール2：上位人気の継続騎乗の信頼
        if (popularity >= 1 && popularity <= 3) {
          potential += 10;
          tags.push("🎯 園田特注: 陣営の信頼の証拠！上位人気馬の継続騎乗(手堅いアタマ候補)");
        }
      }
    }`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Successfully updated Sonoda jockey switch rules.");
} else {
  console.log("Error: Target string not found.");
}
