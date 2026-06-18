const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engine.ts');
let content = fs.readFileSync(filePath, 'utf8');

const regex = /const isMizusawa = race\.venue\?\.includes\("水沢"\)[\s\S]*?(?=  \/\/ ==========================================\r?\n  \/\/ 【名古屋・弥富競馬場)/;

const newLogic = `const isMizusawa = race.venue?.includes("水沢") || race.trackName?.includes("水沢") || race.raceName?.includes("水沢");

  if (isMizusawa) {
    tags.push("🐎 水沢特化OMEGAエンジン適用中");

    // 1. 超小回り（右回り）の物理バイアス
    if (horse.style === "逃げ" || horse.style === "先行") {
      potential += 20;
      tags.push("🏃 水沢超小回り物理: 逃げ・先行の絶対的優位");
    } else if (horse.style === "追込") {
      potential -= 25;
      tags.push("❌ 水沢追込困難: 直線が短く物理的に届かない");
    }

    // 2. 枠順バイアス (最新データ反映)
    // 従来は内枠有利と言われていたが、最新傾向では外枠(6〜8枠)が圧倒的有利
    if (frame >= 6) {
      potential += 25;
      tags.push("👑 水沢特注: 半分以上のレースで勝利する圧倒的有利な外枠(6〜8枠)");
    }

    // 3. 冬期特注・馬場凍結バイアス
    const raceMonth = race.date ? parseInt(race.date.split("-")[1] || "0") : 0;
    const isWinterMizusawa = raceMonth === 12 || raceMonth <= 3;
    if (isWinterMizusawa) {
      if (weight >= 500) {
        potential += 15;
        tags.push("⛄ 水沢冬期馬場: 凍結・重い砂をこなす大型パワー馬");
      }
      if (horse.style === "逃げ") {
        potential += 15;
        tags.push("⛄ 水沢冬期馬場: 前が止まらない冬の逃げ馬ボーナス");
      }
    }

    // 4. 新ルール1: 1番人気は「連軸（ヒモ）」としての信頼度は高いが、単勝の過信は禁物
    if (popularity === 1) {
      potential -= 10;
      tags.push("⚠️ 水沢特注: 1番人気は複勝率75%も勝率33%。1着固定より連軸推奨");
    }

    // 5. 新ルール3: 前走「3着以内」の近走好調馬を狙う
    if (prevRaceData && prevRaceData.result !== undefined && prevRaceData.result >= 1 && prevRaceData.result <= 3) {
      potential += 20;
      tags.push("👑 水沢特注: 前走3着以内の好調馬が順当に勝ち切る傾向");
    }

    // 6. 新ルール4: 騎手の特徴（本命党は「村上忍騎手」、穴党は「坂井瑛騎手」）
    if (jockey.includes("村上忍") && popularity <= 2) {
      potential += 25;
      tags.push("🎯 水沢鉄板: 人気馬に乗った村上忍騎手の抜群の信頼度");
    }
    if (jockey.includes("坂井瑛") && popularity >= 4) {
      potential += 30;
      tags.push("💥 水沢大穴特注: 伏兵馬を次々と勝たせる穴メーカー坂井瑛騎手");
    }
    
    // 岩手リーディング全般のフォロー
    const isIwateEliteJ = ["山本聡", "高松亮", "菅原辰", "山本政"].some(j => jockey.includes(j));
    if (isIwateEliteJ) {
      potential += 10;
      tags.push("🌟 岩手トップジョッキー絶対信頼度");
    }
  }
`;

if (regex.test(content)) {
  content = content.replace(regex, newLogic);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Replacement successful.");
} else {
  console.log("Regex did not match.");
}
