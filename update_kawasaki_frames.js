const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engineNAR.ts');
let content = fs.readFileSync(filePath, 'utf8');

const searchString = `    // ルール2: 「内枠(1〜3枠) × 外枠(7〜8枠)」の組み合わせを狙う
    if (frame <= 3) {
      if (popularity <= 3) {
        potential += 15;
        tags.push("👑 川崎特注: アタマ有力！勝率の高い内枠(1〜3枠)の好走馬");
      } else {
        potential += 5;
        tags.push("📈 川崎特注: アタマに突き抜ける可能性を秘める内枠");
      }
    } else if (frame >= 7) {
      if (popularity >= 4) {
        potential += 20;
        tags.push("💥 川崎特注: ヒモ穴必須！高配当を演出する外枠(7〜8枠)の使者");
      }
    }`;

const newFrameLogic = `    // --- [枠順のルール (追加5箇条)] --------------------------
    // ルール1＆3: アタマ（1着）を狙うなら「2枠」、そして土台となる「1〜3枠」
    if (frame === 2) {
      potential += 25;
      tags.push("👑 川崎特注: アタマ最有力！圧倒的勝率を誇る「2枠」");
    } else if (frame === 1 || frame === 3) {
      potential += 15;
      tags.push("👑 川崎特注: 馬券の土台として極めて優秀な内枠(1・3枠)");
    }

    // ルール2: 2着付け（ヒモ）には「7枠」を絶対に入れる
    // ルール4: 「内枠×外枠」の組み合わせを狙うための外枠評価
    if (frame === 7) {
      potential += 20; // 2着に頻発するためヒモとして強力加点
      tags.push("💥 川崎特注: 2着(ヒモ)に絶対不可欠！強烈な連対率を誇る「7枠」");
    } else if (frame === 8) {
      potential += 10;
      tags.push("💥 川崎特注: 内枠×外枠のヒモ候補となる「8枠」");
    }

    // ルール5: 「4枠」と「6枠」は思い切って軽視する
    if (frame === 4 || frame === 6) {
      potential -= 15;
      tags.push("⚠️ 川崎減点: 極めて不振な「4枠」「6枠」(思い切って軽視)");
    }`;

if (content.includes(searchString)) {
  content = content.replace(searchString, newFrameLogic);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Replacement successful.");
} else {
  console.log("Error: could not find search string");
}
