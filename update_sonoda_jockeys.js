const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engineNAR.ts');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `    // ルール4：2・3着のヒモには「6〜8番人気」の穴馬を必ず入れる
    if (popularity >= 6 && popularity <= 8) {
      const hasCloseRace = horse.pastRaces && horse.pastRaces.some(pr => pr.timeMargin !== undefined && pr.timeMargin <= 0.5);
      if (hasCloseRace) {
        potential += 20; // ヒモとして拾いやすくするためスコア底上げ
        tags.push("💥 園田特注: ヒモ荒れ必須！僅差健闘歴のある伏兵(6〜8番人気)");
      }
    }`;

const replaceStr = `    // ルール4：2・3着のヒモには「6〜8番人気」の穴馬を必ず入れる
    if (popularity >= 6 && popularity <= 8) {
      const hasCloseRace = horse.pastRaces && horse.pastRaces.some(pr => pr.timeMargin !== undefined && pr.timeMargin <= 0.5);
      if (hasCloseRace) {
        potential += 20; // ヒモとして拾いやすくするためスコア底上げ
        tags.push("💥 園田特注: ヒモ荒れ必須！僅差健闘歴のある伏兵(6〜8番人気)");
      }
    }

    // ==========================================
    // 【特化ロジック】園田競馬場・騎手特化ルール（2026/06分析）
    // ==========================================
    const jName = horse.jockey;
    if (jName) {
      // 騎手ルール1：アタマ候補の強力加点（田野豊 / 小牧太 × 1〜3番人気）
      if (['田野', '小牧太'].some(j => jName.includes(j)) && popularity >= 1 && popularity <= 3) {
        potential += 20;
        tags.push("👑 園田特注: アタマ最有力！絶好調ジョッキー(田野/小牧太)×上位人気");
      }

      // 騎手ルール2：ヒモ穴のピックアップ指示（☆小谷哲 × 5番人気以下）
      if (jName.includes('小谷') && popularity >= 5) {
        potential += 15; // 波乱を起こす可能性が高いためヒモとしてスコア底上げ
        tags.push("💥 園田特注: 波乱メーカー襲来！ヒモ穴に必須の小谷騎手(5番人気以下)");
      }

      // 騎手ルール3：安定感の加点（山本咲 / 下原）
      if (['山本咲', '下原'].some(j => jName.includes(j))) {
        potential += 5;
        tags.push("🎯 園田特注: 抜群の馬券内安定感(山本咲/下原理)");
      }
    }`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Successfully updated Sonoda jockey rules.");
} else {
  console.log("Error: Target string not found.");
}
