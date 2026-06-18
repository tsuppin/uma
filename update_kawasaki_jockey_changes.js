const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engineNAR.ts');
let content = fs.readFileSync(filePath, 'utf8');

const searchString = `    // --- [既存のマニアックルール] --------------------------
    if (dist === 1500 && frame <= 3 && horse.style === '逃げ') {
      potential += 20;
      tags.push("🔥 川崎マニアック: 日本一タイトなコーナーをロスなく回る川崎1500m内枠逃げ");
    }`;

const newJockeyChangeLogic = `    // --- [乗り替わりのルール (追加4箇条)] --------------------------
    let isJockeyChangedK = false;
    if (prevRaceData && prevRaceData.jockey) {
      // 騎手名が部分一致しない場合を乗り替わりと判定
      if (!jName.includes(prevRaceData.jockey) && !prevRaceData.jockey.includes(jName)) {
        isJockeyChangedK = true;
      }
    }

    // 乗り替わりルール1: 「前走好走（1着・2着）＋継続騎乗」のコンビは素直に信頼する
    if (prevRaceData && prevRaceData.result <= 2 && !isJockeyChangedK) {
      potential += 15;
      tags.push("👑 川崎特注: 勝ち負け必至！前走連対＋継続騎乗の堅軸コンビ");
    }

    // 乗り替わりルール2: 「トップジョッキーへの乗り替わり」は勝負気配
    if (isJockeyChangedK && ['矢野', '町田', '御神本', '森泰', '笹川'].some(j => jName.includes(j))) {
      potential += 20;
      tags.push("👑 川崎特注: 陣営の勝負気配！トップジョッキーへの鞍上強化");
    }

    // 乗り替わりルール3: 前走大敗馬の「乗り替わり」を一変（激走）のサインとして穴で狙う
    if (prevRaceData && prevRaceData.result >= 6 && isJockeyChangedK) {
      potential += 15;
      tags.push("💥 川崎特注: 前走大敗からのカンフル剤！乗り替わりによる一変警戒");
    }

    // 乗り替わりルール4: 「他場を主戦とする騎手」への乗り替わりは特注
    if (isJockeyChangedK && ['澤田', '西啓太', '笠野', '達城'].some(j => jName.includes(j))) {
      potential += 15;
      tags.push("💥 川崎特注: 勝算あり？他場主戦ジョッキーへの意欲的な乗り替わり");
    }

    // --- [既存のマニアックルール] --------------------------
    if (dist === 1500 && frame <= 3 && horse.style === '逃げ') {
      potential += 20;
      tags.push("🔥 川崎マニアック: 日本一タイトなコーナーをロスなく回る川崎1500m内枠逃げ");
    }`;

if (content.includes(searchString)) {
  content = content.replace(searchString, newJockeyChangeLogic);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Replacement successful.");
} else {
  console.log("Error: could not find search string");
}
