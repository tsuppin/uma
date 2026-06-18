const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engineNAR.ts');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `    // 新ルール4: 毛色は「鹿毛」と「黒鹿毛」が優勢(勝率67%)
    const isGoodColor = horse.coatColor && (horse.coatColor === '鹿毛' || horse.coatColor === '黒鹿毛');
    if (isGoodColor) {
      potential += 10;
      tags.push(\`💎 大井特注: 大井で優勢な毛色(\${horse.coatColor})\`);
    }`;

const replaceStr = `    // 新ルール4: 毛色は「鹿毛」と「黒鹿毛」が優勢(勝率67%)
    const isGoodColor = horse.coatColor && (horse.coatColor === '鹿毛' || horse.coatColor === '黒鹿毛');
    if (isGoodColor) {
      potential += 10;
      tags.push(\`💎 大井特注: 大井で優勢な毛色(\${horse.coatColor})\`);
    }

    // ==========================================
    // 【追加】大井特化・騎手＆負担重量プロトコル（2026/06抽出）
    // ==========================================
    
    // 第3弾ルール1: 前走から「継続騎乗」しているコンビを積極的に狙う(勝率67%)
    const prevRaceJockey = horse.pastRaces && horse.pastRaces.length > 0 ? horse.pastRaces[0].jockey : horse.prevJockey;
    if (prevRaceJockey && horse.jockey && horse.jockey.includes(prevRaceJockey.replace(/[☆▲△◇]/g, ''))) {
      potential += 25;
      tags.push("🏇 大井特注: 呼吸の合う継続騎乗コンビ(勝率67%)");
    }

    // 第3弾ルール2: 「トップジョッキー」と序盤の「減量騎手」の活躍
    const isOhiTopJockey = horse.jockey && ['矢野', '笹川', '森泰斗', '御神本', '和田譲', '西啓太'].some(j => horse.jockey.includes(j));
    const isApprentice = horse.jockey && horse.jockey.match(/[☆▲△◇]/);
    const isEarlyRace = race.raceNumber && race.raceNumber <= 4;
    
    if (isOhiTopJockey) {
      potential += 15;
      tags.push("👑 大井特注: 信頼のトップジョッキー");
    } else if (isApprentice && isEarlyRace) {
      potential += 20;
      tags.push("🔥 大井特注: 序盤レース(1〜4R)での減量騎手の積極策");
    }

    // 第3弾ルール3: 交流重賞（メインレース）は「JRA所属騎手」が上位を独占
    if (isJpnGrade) {
      const isJraTopJockey = horse.jockey && ['戸崎', '岩田望', '坂井', '西村淳', 'ルメール', '川田', '武豊', '松山'].some(j => horse.jockey.includes(j));
      if (isJraTopJockey) {
        potential += 20; // 以前のJRA所属馬加点と併せてさらにプラス
        tags.push("👑 大井Jpn特注: 交流重賞におけるJRAトップジョッキーの技術");
      }
    }

    // 第3弾ルール4: 重い「負担重量（56.0kg以上）」を苦にしない
    const currentWeight = horse.jockeyWeight || 55;
    if (currentWeight >= 56.0) {
      potential += 10;
      tags.push("💪 大井特注: 56kg以上の重斤量を苦にしない馬力");
    }`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Successfully updated Ooi specific logic (jockey and weight).");
} else {
  console.log("Error: Target string not found.");
}
