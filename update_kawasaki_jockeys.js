const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engineNAR.ts');
let content = fs.readFileSync(filePath, 'utf8');

// The block to replace is:
//    // ルール6: 当日乗れている「好調騎手」を味方につける
//    const jName = horse.jockey || '';
//    if (['町田', '山林'].some(j => jName.includes(j))) {
//      if (popularity >= 4) {
//        potential += 20;
//        tags.push("👑 川崎特注: 穴をあける好調ジョッキー(町田/山林信)の一発");
//      } else {
//        potential += 10;
//        tags.push("👑 川崎特注: 信頼の好調ジョッキー(町田/山林信)");
//      }
//    }

const searchString = `// ルール6: 当日乗れている「好調騎手」を味方につける
    const jName = horse.jockey || '';
    if (['町田', '山林'].some(j => jName.includes(j))) {
      if (popularity >= 4) {
        potential += 20;
        tags.push("👑 川崎特注: 穴をあける好調ジョッキー(町田/山林信)の一発");
      } else {
        potential += 10;
        tags.push("👑 川崎特注: 信頼の好調ジョッキー(町田/山林信)");
      }
    }`;

const newJockeyLogic = `// --- [騎手のルール (追加4箇条)] --------------------------
    const jName = horse.jockey || '';

    // 騎手ルール1: 軸馬に迷ったら「町田直」と「矢野貴之」を信頼する
    if (['町田', '矢野'].some(j => jName.includes(j))) {
      potential += 15;
      tags.push("👑 川崎特注: 信頼度抜群の軸候補ジョッキー(町田直/矢野貴之)");
    }

    // 騎手ルール2: 「野畑凌」は3連系の「3着付け」で狙う
    if (jName.includes('野畑')) {
      potential += 10; // アタマというよりはヒモとしての評価底上げ
      tags.push("💥 川崎特注: 3着(ヒモ)候補として必ず押さえたい野畑凌騎手");
    }

    // 騎手ルール3: 波乱の使者「山林信」をヒモ穴（2着）に警戒する
    if (jName.includes('山林') && popularity >= 4) {
      potential += 20; // 穴馬に乗った時に激走するためヒモ穴として強力加点
      tags.push("💥 川崎特注: 荒れるレースの使者！ヒモ穴に必須の山林信騎手");
    }

    // 騎手ルール4: 遠征してくる「他場を主戦とする騎手」の一発に注意する
    if (['澤田', '西啓太', '笠野', '達城'].some(j => jName.includes(j))) {
      potential += 15;
      tags.push("💥 川崎特注: 遠征・スポット参戦で勝負気配の高い他場主戦騎手");
    }`;

if (content.includes(searchString)) {
  content = content.replace(searchString, newJockeyLogic);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Replacement successful.");
} else {
  console.log("Error: could not find search string");
}
