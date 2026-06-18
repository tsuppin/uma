const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engine.ts');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `    // ルール9：集中力アップで激走を呼ぶ「ブリンカー着用馬」
    if (horse.useBlinkers) {
      potential += 20; // 勝ち切るケースや大穴を開けるケースが多発しているため高評価
      tags.push("💥 東京特注: 集中力MAX！大穴激走も狙えるブリンカー着用馬");
    }`;

const replaceStr = `    // ルール9：集中力アップで激走を呼ぶ「ブリンカー着用馬」
    if (horse.useBlinkers) {
      potential += 15; 
      tags.push("💥 東京特注: 集中力UP！一変の可能性を秘めるブリンカー着用馬");
      
      // ブリンカー激走の黄金パターン（先行or内枠 × 前走大敗）
      const isInnerFrame = frame <= 3;
      const isFrontRunner = horse.style === '逃げ' || horse.style === '先行';
      const isPrevBigLoss = prevRaceData && prevRaceData.result >= 7;
      
      if ((isInnerFrame || isFrontRunner) && isPrevBigLoss && popularity >= 6) {
        potential += 30; // 特大万馬券の使者として劇的にスコアを上げる
        tags.push("🚨 東京爆穴: 【特大万馬券の使者】ブリンカー×(内枠or先行)×前走大敗の黄金激走パターン！");
      }
    }`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Successfully updated Tokyo blinker synergy rules.");
} else {
  console.log("Error: Target string not found.");
}
