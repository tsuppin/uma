const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engine.ts');
let content = fs.readFileSync(filePath, 'utf8');

const target = "if (trackName.includes('東京')) {";
const startIndex = content.indexOf(target);

if (startIndex !== -1) {
  const insertStr = `
    // ==========================================
    // 【特化ロジック】東京競馬場・絶対的5ルール（2026/06分析）
    // ==========================================
    
    // ルール1：「C.ルメール騎手・D.レーン騎手」×「上位人気」
    const isLemaireLaneStrict = horse.jockey && ['ルメール', 'レーン'].some(j => horse.jockey.includes(j));
    if (isLemaireLaneStrict && popularity >= 1 && popularity <= 3) {
      potential += 25;
      tags.push("👑 東京特注: ルメール/レーン×上位人気の圧倒的信頼度(確勝級)");
    }

    // ルール2：「2枠・5枠」×「先行脚質」の優位性
    if ((frame === 2 || frame === 5) && horse.style === '先行') {
      potential += 20;
      tags.push("🔥 東京特注: 絶好枠(2・5枠)からの先行抜け出し(展開超有利)");
    }

    // ルール3：3歳馬の大幅プラス、古馬の馬体維持
    if (typeof horse.weightChange === 'number') {
      if (age === 3 && horse.weightChange >= 10) {
        potential += 15;
        tags.push("🔥 東京特注: 3歳馬の大幅馬体重プラス(成長分でパフォーマンス向上)");
      } else if (age >= 4 && horse.weightChange >= -4 && horse.weightChange <= 4) {
        potential += 10;
        tags.push("👑 東京特注: 古馬の馬体重維持(±4kg以内)による安定感");
      }
    }

    // ルール4：血統適性「キズナ産駒」「モズアスコット産駒」
    if (horse.sire && ['キズナ', 'モズアスコット'].some(s => horse.sire.includes(s))) {
      potential += 15;
      tags.push("🎯 東京特注: 馬場を問わない絶好の血統適性(キズナ/モズアスコット)");
    }

    // ルール5：相手候補・ヒモ穴には「丹内祐次騎手」×「中位人気」
    const isTannaiStrict = horse.jockey && horse.jockey.includes('丹内');
    if (isTannaiStrict && popularity >= 3 && popularity <= 6) {
      potential += 20; // ヒモとして拾いやすくするためスコアを底上げ
      tags.push("💥 東京特注: ヒモ荒れ誘発！丹内騎手の中位人気馬(高配当の使者)");
    }
`;
  
  const newContent = content.substring(0, startIndex + target.length) + insertStr + content.substring(startIndex + target.length);
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log("Successfully inserted Tokyo 5 rules.");
} else {
  console.log("Error finding target");
}
