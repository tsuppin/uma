const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engine.ts');
let content = fs.readFileSync(filePath, 'utf8');

const anchor = `    // 岩手リーディング全般のフォロー(残りのトップ騎手)
    const isIwateEliteJ = ["山本聡", "高松亮", "菅原辰"].some(j => jockey.includes(j));`;

const newRules = `    // 12. 水沢乗り替わりルール1〜3: 継続騎乗の圧倒的有利と「手戻り」の特注
    const prevJockeyNameMiz = prevRaceData?.jockey || horse.prevJockey || '';
    const cleanPrevJockeyMiz = prevJockeyNameMiz.replace(/[☆▲△◇★]/g, '').trim();
    const cleanCurrentJockeyMiz = jockey.replace(/[☆▲△◇★]/g, '').trim();
    
    if (cleanPrevJockeyMiz) {
      const isJockeyChangedMiz = cleanPrevJockeyMiz !== cleanCurrentJockeyMiz;
      
      if (!isJockeyChangedMiz) {
        // ルール1: 継続騎乗は無条件で高評価(連対馬の約79%)
        potential += 20;
        tags.push("👑 水沢特注: コンビ確立済みの「継続騎乗」は連対率激高の鉄板条件");
        
        // ルール3: 「当日好調な騎手」×「継続騎乗」は鉄板の軸馬
        if (jockey.includes("坂井瑛") || jockey.includes("村上忍") || jockey.includes("佐々志")) {
          potential += 25; // さらに上乗せ
          tags.push("🎯 水沢大鉄板: 好調騎手(坂井瑛・村上忍・佐々志)×継続騎乗の最強コンボ！迷わず軸へ");
        }
      } else {
        // 乗り替わり発生時
        let isReturnAndGood = false;
        
        // 過去2〜5走前に現在の騎手で連対(1〜2着)実績があるかチェック(手戻り)
        if (horse.pastRaces && horse.pastRaces.length >= 2) {
          for (let i = 1; i < horse.pastRaces.length && i < 5; i++) {
            const pr = horse.pastRaces[i];
            if (pr.jockey) {
              const cleanPrJockey = pr.jockey.replace(/[☆▲△◇★]/g, '').trim();
              if (cleanPrJockey === cleanCurrentJockeyMiz && pr.result !== undefined && pr.result <= 2) {
                isReturnAndGood = true;
                break;
              }
            }
          }
        }
        
        // ルール2: 乗り替わりは基本割引だが、「手戻り」はプラス評価
        if (isReturnAndGood) {
          potential += 20;
          tags.push("💥 水沢大穴特注: 過去の好走コンビ復活！主戦騎手への「手戻り」は大幅プラスの狙い目");
        } else {
          potential -= 15;
          tags.push("⚠️ 水沢減点: 継続騎乗が圧倒的有利なため、新規の乗り替わりは割引");
        }
      }
    }

    // 岩手リーディング全般のフォロー(残りのトップ騎手)
    const isIwateEliteJ = ["山本聡", "高松亮", "菅原辰"].some(j => jockey.includes(j));`;

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
