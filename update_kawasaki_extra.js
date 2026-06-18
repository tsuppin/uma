const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engineNAR.ts');
let content = fs.readFileSync(filePath, 'utf8');

const searchString = `    // --- [既存のマニアックルール] --------------------------
    if (dist === 1500 && frame <= 3 && horse.style === '逃げ') {
      potential += 20;
      tags.push("🔥 川崎マニアック: 日本一タイトなコーナーをロスなく回る川崎1500m内枠逃げ");
    }`;

const newExtraLogic = `    // --- [その他の特注ルール (年齢・距離・斤量・厩舎)] --------------------------
    
    // 特注ルール1: 古馬戦では「7歳以上の高齢馬（特に牝馬）」の激走に警戒する
    if (!is3yo && !(race.raceName && race.raceName.includes('2歳'))) {
      if (horse.age >= 7) {
        if (horse.gender === '牝') {
          potential += 20;
          tags.push("💥 川崎特注: 重馬場で経験値が活きるベテラン高齢牝馬(7歳以上)");
        } else {
          potential += 10;
          tags.push("💥 川崎特注: 重馬場をこなす経験豊富な7歳以上の高齢馬");
        }
      }
    }

    // 特注ルール2: 「距離変更（短縮・延長）」のローテーションを苦にしない
    if (prevRaceData && prevRaceData.dist && prevRaceData.dist !== dist) {
      potential += 5; // ペナルティを与えず、むしろ適性変化をプラスに評価
      tags.push("📈 川崎特注: ペースが変わる距離変更ローテでの変わり身に期待");
    }

    // 特注ルール3: 「減量騎手（若手）」は思い切って軽視し、正規斤量の騎手を信頼する
    if (jName.includes('☆') || jName.includes('△') || jName.includes('▲') || jName.includes('◇') || jName.includes('★')) {
      potential -= 15;
      tags.push("⚠️ 川崎減点: ペース判断の難しい重馬場での減量騎手(経験不足)は軽視");
    }

    // 特注ルール4: 当日の「絶好調厩舎（調教師）」の固め打ちに乗る
    const trainer = horse.trainer || '';
    if (['田邊', '佐々仁', '高月'].some(t => trainer.includes(t))) {
      potential += 15;
      tags.push("👑 川崎特注: 当日の馬場に合っている絶好調厩舎(田邊/佐々仁/高月)の勝負馬");
    }

    // --- [既存のマニアックルール] --------------------------
    if (dist === 1500 && frame <= 3 && horse.style === '逃げ') {
      potential += 20;
      tags.push("🔥 川崎マニアック: 日本一タイトなコーナーをロスなく回る川崎1500m内枠逃げ");
    }`;

if (content.includes(searchString)) {
  content = content.replace(searchString, newExtraLogic);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Replacement successful.");
} else {
  console.log("Error: could not find search string");
}
