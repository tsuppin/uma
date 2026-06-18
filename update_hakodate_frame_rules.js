const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engine.ts');
let content = fs.readFileSync(filePath, 'utf8');

const anchor = `    // 15. 函館・馬ルール4: 函館適性の高い「特定種牡馬の産駒」
    const sireName = horse.sire || '';
    if (isTurf && (sireName.includes('キズナ') || sireName.includes('エピファネイア'))) {
      potential += 20;
      tags.push("👑 函館馬特注: 洋芝適性抜群のキズナ/エピファネイア産駒");
    } else if (isDirt && sireName.includes('サンダースノー')) {
      potential += 20;
      tags.push("👑 函館馬特注: 函館小回りダートで複数勝利を挙げるサンダースノー産駒");
    }`;

const newRules = `    // 15. 函館・馬ルール4: 函館適性の高い「特定種牡馬の産駒」
    const sireName = horse.sire || '';
    if (isTurf && (sireName.includes('キズナ') || sireName.includes('エピファネイア'))) {
      potential += 20;
      tags.push("👑 函館馬特注: 洋芝適性抜群のキズナ/エピファネイア産駒");
    } else if (isDirt && sireName.includes('サンダースノー')) {
      potential += 20;
      tags.push("👑 函館馬特注: 函館小回りダートで複数勝利を挙げるサンダースノー産駒");
    }

    // 19. 函館・枠順ルール1: アタマ（1着）で狙うなら「5枠」が最強
    if (frame === 5) {
      potential += 20;
      tags.push("👑 函館枠順特注: 1着回数トップ(勝率25%)！アタマで狙える最強の5枠");
    }

    // 20. 函館・枠順ルール2: 連軸・ヒモには迷わず「7枠」を入れる
    if (frame === 7) {
      potential += 15;
      tags.push("👑 函館枠順特注: 異常な連対率(約54%)を誇る7枠は軸・ヒモに必須");
    }

    // 21. 函館・枠順ルール3: 「7枠-8枠」の外枠ワンツー決着を狙う
    if (frame === 8) {
      potential += 10;
      tags.push("🌟 函館枠順特注: 7枠との強力な外枠ワンツー決着が狙える8枠");
    }

    // 22. 函館・枠順ルール4: 最内「1枠」の1着固定は危険
    if (frame === 1) {
      potential -= 15; // アタマ候補から下げる
      tags.push("⚠️ 函館枠順減点: 包まれるリスクが高く1着を取りこぼしやすい最内1枠");
    }`;

// robust CRLF/LF replace
let index = content.indexOf(anchor);
if (index === -1) {
  const normAnchor = anchor.replace(/\r\n/g, '\n');
  index = content.indexOf(normAnchor);
  if (index !== -1) {
    content = content.replace(normAnchor, newRules.replace(/\r\n/g, '\n'));
  }
} else {
  content = content.replace(anchor, newRules);
}

if (index !== -1) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Rewrite successful.");
} else {
  console.log("Error: could not find strings");
}
