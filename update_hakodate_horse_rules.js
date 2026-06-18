const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engine.ts');
let content = fs.readFileSync(filePath, 'utf8');

const anchor = `    // 11. 特注騎手: 横山和生騎手
    if (jockey.includes("横山和生")) {
      potential += 20;
      tags.push("👑 函館特注: 函館コースと相性抜群で絶好調の横山和生騎手");
    }`;

const newRules = `    // 11. 特注騎手: 横山和生騎手
    if (jockey.includes("横山和生")) {
      potential += 20;
      tags.push("👑 函館特注: 函館コースと相性抜群で絶好調の横山和生騎手");
    }

    // 12. 函館・馬ルール1: 夏の函館は「牝馬」を積極的に狙う
    if (horse.gender === '牝') {
      potential += 15;
      tags.push("👑 函館馬特注: 夏は牝馬！函館で勝率の高い牝馬の激走");
    }

    // 13. 函館・馬ルール2: 馬体重は「維持」または「プラス体重」の馬を選ぶ
    if (typeof horse.weightChange === 'number') {
      if (horse.weightChange <= -10) {
        potential -= 15;
        tags.push("⚠️ 函館減点: 滞在競馬でコンディション崩れが疑われる大幅な馬体減(-10kg以上)");
      } else if (horse.weightChange >= 0) {
        potential += 10;
        tags.push("👑 函館馬特注: 滞在競馬で好調を維持している馬体増・維持");
      }
    }

    // 14. 函館・馬ルール3: 古馬混合戦でも「若い馬（3〜4歳）」を中心にする
    if (horse.age === 3 || horse.age === 4) {
      potential += 15;
      tags.push("👑 函館馬特注: 高齢馬より圧倒的に成績が良いフレッシュな若馬(3〜4歳)");
    } else if (horse.age >= 5) {
      potential -= 10;
      tags.push("⚠️ 函館減点: 函館コースでは勝率が極端に落ちる高齢馬(5歳以上)");
    }

    // 15. 函館・馬ルール4: 函館適性の高い「特定種牡馬の産駒」
    const sireName = horse.sire || '';
    if (isTurf && (sireName.includes('キズナ') || sireName.includes('エピファネイア'))) {
      potential += 20;
      tags.push("👑 函館馬特注: 洋芝適性抜群のキズナ/エピファネイア産駒");
    } else if (isDirt && sireName.includes('サンダースノー')) {
      potential += 20;
      tags.push("👑 函館馬特注: 函館小回りダートで複数勝利を挙げるサンダースノー産駒");
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
