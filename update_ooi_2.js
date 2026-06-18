const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engineNAR.ts');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `    // ルール3: 馬体重の増減が「±5kg以内」の馬が勝ち切る
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
    }`;

const replaceStr = `    // ルール1(改): 馬体重の増減が「-4kg〜+5kg」の馬が圧倒的有利
    const weightChange = horse.weightChange || 0;
    if (weightChange >= -4 && weightChange <= 5) {
      potential += 25;
      tags.push("👑 大井特注: 馬体重安定(-4kg〜+5kg)の圧倒的勝負気配");
    } else if (weightChange >= 10 || weightChange <= -10) {
      potential -= 20;
      tags.push("⚠️ 大井危険: 大幅な馬体重増減は割引(状態不安定)");
    }
    
    // ルール4(改): 3着に穴馬が飛び込む「ヒモ荒れ」に注意
    if (popularity >= 10) {
      tags.push("🌟 大井特注: ヒモ荒れ候補の二桁人気伏兵");
    }

    // ==========================================
    // 【追加】大井特化・馬の属性プロトコル（2026/06抽出）
    // ==========================================
    
    // 新ルール2: ダートグレード競走（交流重賞）は「JRA所属馬」が上位を独占
    const isJpnGrade = race.raceName && race.raceName.match(/Jpn[1-3I-III]/i);
    if (isJpnGrade) {
      const isJRAHorse = horse.belonging?.includes('JRA') || horse.stableLocation?.match(/(美浦|栗東)/) || (horse.jockey && ['ルメール', '川田', '武豊', '戸崎', '松山', '坂井', '横山武'].some(j => horse.jockey.includes(j)));
      if (isJRAHorse) {
        potential += 40;
        tags.push("👑 大井Jpn特注: 交流重賞におけるJRA所属馬の圧倒的実力");
      } else {
        potential -= 30;
        tags.push("⚠️ 大井Jpn危険: 交流重賞における地方所属馬の能力差");
      }
    }

    // 新ルール3: 古馬戦は「4歳馬」、若駒戦(3歳戦)は「牝馬」が活躍
    const is3yoRace = race.raceName && race.raceName.includes('3歳');
    const isKobaRace = !is3yoRace && !isJpnGrade && race.raceClass && race.raceClass.match(/[ABC]級/i);
    
    if (isKobaRace && horse.age === 4) {
      potential += 20;
      tags.push("🔥 大井特注: 古馬戦(C・B級)で勢いのある4歳馬");
    } else if (is3yoRace && !isJpnGrade && horse.gender === '牝') {
      potential += 25;
      tags.push("🔥 大井特注: 3歳戦における仕上がりの早い牝馬");
    }

    // 新ルール4: 毛色は「鹿毛」と「黒鹿毛」が優勢(勝率67%)
    const isGoodColor = horse.coatColor && (horse.coatColor === '鹿毛' || horse.coatColor === '黒鹿毛');
    if (isGoodColor) {
      potential += 10;
      tags.push(\`💎 大井特注: 大井で優勢な毛色(\${horse.coatColor})\`);
    }`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Successfully updated Ooi specific logic (horse attributes).");
} else {
  console.log("Error: Target string not found.");
}
