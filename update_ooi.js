const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engineNAR.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add Ooi specific rules
const ooiTarget = `  else if (trackName.includes('大井')) {`;
const ooiReplacement = `  else if (trackName.includes('大井')) {
    // ==========================================
    // 【新設】大井特化・最新トレンドプロトコル（2026/06抽出）
    // ==========================================
    const popularity = horse.popularity || 99;
    
    // ルール1: 1番人気・2番人気の勝率が極めて高い（頭固定推奨）
    if (popularity === 1 || popularity === 2) {
      potential += 40; // 勝率75%の鉄板データとして加点
      tags.push("🎯 大井特注: 1・2番人気の頭固定推奨(勝率75%データ)");
    }
    
    // ルール2: 圧倒的な「外枠（5〜8枠）」有利の傾向
    if (frame >= 5) {
      potential += 30; // 1着の67%、連対の17/24が5〜8枠
      tags.push("🔥 大井特注: 圧倒的有利な外枠(5〜8枠)からの好走");
    } else if (race.condition === '重') {
      potential -= 20; // 重馬場の内枠は不利
      tags.push("⚠️ 大井危険: 重馬場の不利な内枠(1〜4枠)");
    }
    
    // ルール3: 馬体重の増減が「±5kg以内」の馬が勝ち切る
    const weightChange = horse.weightChange || 0;
    if (weightChange >= -5 && weightChange <= 5) {
      potential += 20;
      tags.push("👑 大井特注: 馬体重安定(±5kg以内)の勝負気配");
    } else if (weightChange >= 10 || weightChange <= -10) {
      potential -= 20;
      tags.push("⚠️ 大井危険: 大幅な馬体重増減は割引(状態不安定)");
    }
    
    // ルール4: 3着に穴馬が飛び込む「ヒモ荒れ」に注意
    if (popularity >= 10) {
      // 穴馬はdarknessスコアで上位にきやすくするためタグ付与と少しのポテンシャル維持
      tags.push("🌟 大井特注: ヒモ荒れ候補の二桁人気伏兵");
    }
`;

content = content.replace(ooiTarget, ooiReplacement);

// 2. Fix darkness calculation
const returnTarget = `  return {
    horseId: horse.id,
    horseName: horse.name,
    horseNumber: horse.number,
    potential: Math.max(0, potential), // 最低0点
    darkness: 0,
    evIndex: 0,
    aptitudeTags: tags
  };`;

const returnReplacement = `  const finalPotential = Math.round(Math.max(0, potential) * 10) / 10;
  const darkness = (finalPotential / 100) * Math.pow(odds, 1.1);

  return {
    horseId: horse.id,
    horseName: horse.name,
    horseNumber: horse.number,
    potential: finalPotential,
    darkness: Math.round(darkness * 100) / 100,
    evIndex: finalPotential,
    aptitudeTags: tags,
    tags: tags
  };`;

content = content.replace(returnTarget, returnReplacement);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully updated Ooi specific logic and darkness calculation in engineNAR.ts.");
