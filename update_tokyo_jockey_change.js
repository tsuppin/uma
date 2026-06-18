const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engine.ts');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `    // ルール13：【波乱の使者】「前走大敗（二桁着順）」からの豹変
    if (prevRaceData && prevRaceData.result >= 10) {
      // ヒモとして残すために加点
      potential += 15;
      tags.push("💥 東京特注: 前走大敗(二桁着順)からの豹変警戒(高配当の使者)");
    }`;

const replaceStr = `    // ルール13：【波乱の使者】「前走大敗（二桁着順）」からの豹変
    if (prevRaceData && prevRaceData.result >= 10) {
      // ヒモとして残すために加点
      potential += 15;
      tags.push("💥 東京特注: 前走大敗(二桁着順)からの豹変警戒(高配当の使者)");
    }

    // ==========================================
    // 【特化ロジック】東京競馬場・乗り替わり3パターン（2026/06分析）
    // ==========================================
    const isJockeyChanged = prevRaceData && horse.jockey && prevRaceData.jockey && horse.jockey !== prevRaceData.jockey;
    const isTopJockeyStrict = horse.jockey && ['ルメール', 'レーン', '川田', '松山', '横山武', 'モレイラ'].some(j => horse.jockey.includes(j));

    if (isJockeyChanged) {
      // ルール14：【最も頻出する勝ちパターン】「前走惜敗馬（3〜5着）」 × 「有力・中堅騎手への乗り替わり」
      if (prevRaceData.result >= 3 && prevRaceData.result <= 5) {
        potential += 20;
        tags.push("👑 東京特注: 陣営の勝負気配！前走惜敗からの鞍上強化(乗り替わり)で勝ち切る");
      }

      // ルール15：【確勝を期す陣営のサイン】「重賞・OP敗退」 × 「トップジョッキーへの乗り替わり」
      if (isCurrentRaceLowerClass && isTopJockeyStrict && prevRaceData.raceName && (prevRaceData.raceName.match(/G[1-3I-III]/i) || prevRaceData.raceName.includes('OP') || prevRaceData.raceName.includes('オープン')) && prevRaceData.result >= 6) {
        potential += 25;
        tags.push("👑 東京特注: 絶対勝つ陣営のサイン！重賞敗退からの自己条件×トップジョッキーへの乗り替わり");
      }

      // ルール16：【大穴・波乱の使者】「前走大敗」 × 「勢いのある若手騎手への乗り替わり」
      if (prevRaceData.result >= 10 && popularity >= 6) {
        potential += 20; // ヒモ穴としての価値をさらに上げる
        tags.push("💥 東京特注: 大波乱の立役者！前走大敗からの乗り替わり一変警戒");
      }
    }`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Successfully updated Tokyo jockey change rules.");
} else {
  console.log("Error: Target string not found.");
}
