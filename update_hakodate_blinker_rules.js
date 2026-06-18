const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engine.ts');
let content = fs.readFileSync(filePath, 'utf8');

const anchor = `    // 33. 函館・乗り替わりルール4: 「継続騎乗」で狙えるのは、前走で好走（掲示板確保）している馬のみ
    if (!isJockeyChanged && cleanCurrentJockey) {
      if (prevRaceData && prevRaceData.result !== undefined && prevRaceData.result <= 5) {
        potential += 15;
        tags.push("👑 函館乗替特注: 前走掲示板確保からの「継続騎乗」は手堅い勝負気配");
      } else if (prevRaceData && prevRaceData.result >= 6) {
        potential -= 15;
        tags.push("⚠️ 函館乗替減点: 前走大敗からの「継続騎乗」は巻き返しの可能性が低く割引");
      }
    }`;

const newRules = `    // 33. 函館・乗り替わりルール4: 「継続騎乗」で狙えるのは、前走で好走（掲示板確保）している馬のみ
    if (!isJockeyChanged && cleanCurrentJockey) {
      if (prevRaceData && prevRaceData.result !== undefined && prevRaceData.result <= 5) {
        potential += 15;
        tags.push("👑 函館乗替特注: 前走掲示板確保からの「継続騎乗」は手堅い勝負気配");
      } else if (prevRaceData && prevRaceData.result >= 6) {
        potential -= 15;
        tags.push("⚠️ 函館乗替減点: 前走大敗からの「継続騎乗」は巻き返しの可能性が低く割引");
      }
    }

    // 34. 函館・ブリンカー特注ルール1〜3: 7枠 × 距離短縮 × 前走4〜8着
    if (horse.useBlinkers) {
      // 条件1: 絶対条件は枠順が「7枠」であること
      if (frame === 7) {
        potential += 25;
        tags.push("👑 函館ブリンカー特注: 異常な連対率を誇る「ブリンカー着用×7枠」の黄金条件");
      }

      if (prevRaceData) {
        // 条件2: 前走からの「距離短縮」であること
        if (prevRaceData.distance !== undefined && prevRaceData.distance > dist) {
          potential += 20;
          tags.push("💥 函館ブリンカー特注: ペースアップにカチッとハマる「ブリンカー着用×距離短縮」の一変警戒");
        }

        // 条件3: 前走成績が「4着〜8着」の惜しい馬
        if (prevRaceData.result !== undefined && prevRaceData.result >= 4 && prevRaceData.result <= 8) {
          potential += 15;
          tags.push("💥 函館ブリンカー特注: あと一歩足りなかった馬(前走4〜8着)へのカンフル剤！中穴の使者");
        }
      }
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
