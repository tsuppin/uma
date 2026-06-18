const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engine.ts');
let content = fs.readFileSync(filePath, 'utf8');

const anchor = `    // 29. 函館・前走実績ルール4: 前走が「他場（広いコース）」からのコース替わりを狙う
    if (prevRaceData && prevRaceData.venue) {
      if (prevRaceData.venue.includes('東京') || prevRaceData.venue.includes('新潟') || prevRaceData.venue.includes('京都') || prevRaceData.venue.includes('中京')) {
        potential += 15;
        tags.push("🌟 函館実績特注: 広いコース(東京・新潟・京都など)で差し届かなかった馬の小回り替わり一変");
      }
    }`;

const newRules = `    // 29. 函館・前走実績ルール4: 前走が「他場（広いコース）」からのコース替わりを狙う
    if (prevRaceData && prevRaceData.venue) {
      if (prevRaceData.venue.includes('東京') || prevRaceData.venue.includes('新潟') || prevRaceData.venue.includes('京都') || prevRaceData.venue.includes('中京')) {
        potential += 15;
        tags.push("🌟 函館実績特注: 広いコース(東京・新潟・京都など)で差し届かなかった馬の小回り替わり一変");
      }
    }

    // --- 乗り替わりロジック判定 ---
    const prevJockeyName = prevRaceData?.jockey || horse.prevJockey || '';
    const cleanPrevJockey = prevJockeyName.replace(/[☆▲△◇★]/g, '').trim();
    const cleanCurrentJockey = jockey.replace(/[☆▲△◇★]/g, '').trim();
    const isJockeyChanged = cleanPrevJockey && cleanPrevJockey !== cleanCurrentJockey;

    // 30. 函館・乗り替わりルール1：「好調騎手（横山和生・小沢大仁）」への乗り替わりは黙って買い
    if (isJockeyChanged && (jockey.includes("横山和生") || jockey.includes("小沢大仁"))) {
      potential += 20;
      tags.push("👑 函館乗替特注: 勝負気配MAX！絶好調騎手(横山和生・小沢大仁)への乗り替わり");
    }

    // 31. 函館・乗り替わりルール2: ベテラン・中堅から「減量騎手」へのスイッチによる一変
    const isApprentice = jockey.match(/[☆▲△◇★]/);
    const wasApprentice = prevJockeyName.match(/[☆▲△◇★]/);
    if (isJockeyChanged && isApprentice && !wasApprentice) {
      potential += 15;
      tags.push("💥 函館乗替特注: ベテランからの減量騎手スイッチ！斤量恩恵による粘り込み一変警戒");
    }

    // 32. 函館・乗り替わりルール3: トップジョッキーからの「格下がり乗り替わり」でも切ってはいけない
    const topJockeysForHakodate = ["川田将雅", "ルメール", "戸崎圭太", "武豊"];
    const wasTopJockey = topJockeysForHakodate.some(tj => prevJockeyName.includes(tj));
    if (isJockeyChanged && wasTopJockey) {
      potential += 10;
      tags.push("🌟 函館乗替特注: トップジョッキーからの乗り替わりによる人気落ち妙味(消し厳禁)");
    }

    // 33. 函館・乗り替わりルール4: 「継続騎乗」で狙えるのは、前走で好走（掲示板確保）している馬のみ
    if (!isJockeyChanged && cleanCurrentJockey) {
      if (prevRaceData && prevRaceData.result !== undefined && prevRaceData.result <= 5) {
        potential += 15;
        tags.push("👑 函館乗替特注: 前走掲示板確保からの「継続騎乗」は手堅い勝負気配");
      } else if (prevRaceData && prevRaceData.result >= 6) {
        potential -= 15;
        tags.push("⚠️ 函館乗替減点: 前走大敗からの「継続騎乗」は巻き返しの可能性が低く割引");
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
