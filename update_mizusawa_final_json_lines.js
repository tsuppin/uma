const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engine.ts');
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

const newRules = `    // --- 水沢特化 減点方式ロジックデータ (AIナレッジ完全準拠) ---
    // 初期スコアはベース100点からスタート
    
    // ==========================================
    // 免除・例外・無視ルールの事前判定
    // ==========================================
    
    // 無視ルール: 以下のペナルティは水沢では発動させないよう相殺する
    // 1. 馬体重の2桁増減 (±10kg以上)
    if (typeof horse.weightChange === 'number' && Math.abs(horse.weightChange) >= 10) {
      potential += 10; // 一般的な大幅増減ペナルティを相殺
      tags.push("🌟 水沢救済: 馬体重の2桁増減(±10kg以上)でも好走多数。水沢では変動の大きさによるマイナス評価は不要");
    }
    
    // 2. 近走の二桁着順 (10〜12着などの大敗歴があっても減点しない)
    if (horse.pastRaces && horse.pastRaces.length > 0) {
      const hasBigLossInPast5 = horse.pastRaces.slice(0, 5).some(pr => pr.result !== undefined && pr.result >= 10);
      if (hasBigLossInPast5) {
        potential += 10; // 他でかかっているかもしれないペナルティを相殺
        tags.push("🌟 水沢救済: 近走に二桁大敗があっても巻き返し可能(大敗無視ルール)");
      }
    }
    
    // (性別・年齢の割引は元の共通ロジックに依存するため、ここでボーナスを与えて相殺)
    if (horse.sex === "牝") {
      potential += 5;
      tags.push("🌟 水沢馬特注: ダート戦でも牡馬相手に勝ち切る牝馬の台頭(パワー不足判定無効化)");
    }
    if (age >= 7) {
      potential += 5;
      tags.push("🌟 水沢馬特注: 馬場を知り尽くした7歳以上のベテラン馬(衰え判定無効化)");
    }

    // 過去実績データ準備
    let hasTop3InPast5 = false;
    let recent2RacesPoor = false;
    let hasWinOrSecondIn3to5 = false;
    let corner1Max3 = false;
    let isReturnAndGood = false;
    
    if (horse.pastRaces && horse.pastRaces.length > 0) {
      const past5 = horse.pastRaces.slice(0, 5);
      past5.forEach((pr, index) => {
        if (pr.result !== undefined && pr.result <= 3) hasTop3InPast5 = true;
        if (index >= 2 && index <= 4 && pr.result !== undefined && pr.result <= 2) {
          hasWinOrSecondIn3to5 = true;
        }
      });
      
      let poorCount = 0;
      for (let i = 0; i < 2 && i < horse.pastRaces.length; i++) {
        if (horse.pastRaces[i].result !== undefined && horse.pastRaces[i].result >= 4) poorCount++;
      }
      if (poorCount === 2 || (horse.pastRaces.length === 1 && poorCount === 1)) recent2RacesPoor = true;
      
      corner1Max3 = past5.some(pr => pr.corner1Position !== undefined && pr.corner1Position <= 3);
      
      const cleanCurrentJockeyMiz = jockey.replace(/[☆▲△◇★]/g, '').trim();
      for (let i = 1; i < horse.pastRaces.length && i < 5; i++) {
        const pr = horse.pastRaces[i];
        if (pr.jockey && pr.jockey.replace(/[☆▲△◇★]/g, '').trim() === cleanCurrentJockeyMiz && pr.result !== undefined && pr.result <= 3) {
          isReturnAndGood = true;
          break;
        }
      }
    }
    
    const prevJockeyNameMiz = prevRaceData?.jockey || horse.prevJockey || '';
    const cleanPrevJockeyMiz = prevJockeyNameMiz.replace(/[☆▲△◇★]/g, '').trim();
    const cleanCurrentJockeyMiz = jockey.replace(/[☆▲△◇★]/g, '').trim();
    const isJockeyChangedMiz = cleanPrevJockeyMiz ? cleanPrevJockeyMiz !== cleanCurrentJockeyMiz : false;

    // 穴馬特例免除 (6〜8番人気)
    const isDarkHorse = popularity >= 6 && popularity <= 8;
    const isSakaiOrKobayashi = jockey.includes("坂井瑛") || jockey.includes("小林凌");
    const isDarkHorseExempt = isDarkHorse && isSakaiOrKobayashi && cleanPrevJockeyMiz === cleanCurrentJockeyMiz;
    
    if (isDarkHorseExempt) {
      tags.push("💥 水沢超大穴免除: 穴メーカー(坂井瑛・小林凌)の継続騎乗により、乗り替わり・内枠のペナルティを無効化");
    }

    // ==========================================
    // 減点ルールの適用 (Deduction Rules)
    // ==========================================

    // ルール1: 過去5走好走実績なし
    if (!hasTop3InPast5 && horse.pastRaces && horse.pastRaces.length >= 3) {
      potential -= 50;
      tags.push("🔻 水沢大幅減点: 過去5走好走実績なし(-50点)");
    }
    
    // ルール2: 近走不振かつ巻き返し要素なし
    if (recent2RacesPoor && !hasWinOrSecondIn3to5) {
      potential -= 30;
      tags.push("🔻 水沢減点: 近走不振かつ巻き返し要素なし(-30点)");
    }
    
    // ルール3: 非継続騎乗（乗り替わり）
    if (isJockeyChangedMiz) {
      if (isReturnAndGood) {
        tags.push("🌟 水沢特例: 手戻りのため非継続騎乗の減点を免除(0点)");
      } else if (isDarkHorseExempt) {
        // 免除
      } else {
        potential -= 30;
        tags.push("🔻 水沢減点: 非継続騎乗(乗り替わり)(-30点)");
      }
    } else if (cleanPrevJockeyMiz && cleanPrevJockeyMiz === cleanCurrentJockeyMiz) {
      potential += 10; // 連対率79%のバフとして多少は残す
      tags.push("👑 水沢特注: コンビ確立済みの「継続騎乗」は連対率激高の鉄板条件");
    }
    
    // ルール4: 内〜中枠の割引
    if (frame >= 1 && frame <= 5) {
      if (isDarkHorseExempt) {
        tags.push("🌟 水沢特例: 穴メーカー継続騎乗のため内〜中枠の減点を免除");
      } else {
        potential -= 20;
        tags.push("🔻 水沢減点: 内〜中枠の割引(-20点)");
      }
    } else {
      potential += 10;
      tags.push("👑 水沢特注: 圧倒的有利な外枠(6〜8枠)");
      if (frame === 8) {
        potential += 10;
        tags.push("🎯 水沢鉄板: 迷ったら8枠！大特注の連軸候補");
      }
    }
    
    // ルール5: 後方脚質（差し・追込）
    if (horse.style === "差し" || horse.style === "追込" || (!corner1Max3 && horse.style !== "逃げ" && horse.style !== "先行")) {
      potential -= 20;
      tags.push("🔻 水沢減点: 後方脚質(差し・追込)のアタマ候補割引(-20点)");
    }
    
    // ルール6: 上がり最速の過信
    if (prevRaceData?.last3F) {
      if (popularity <= 3) {
        potential -= 10;
        tags.push("🔻 水沢減点: 稍重馬場での上がり最速馬は過信禁物(-10点)");
      }
    } else if (popularity <= 3 && horse.style === "追込") {
      potential -= 10;
      tags.push("🔻 水沢減点: 上位人気でも差し遅れリスク高(-10点)");
    }
    
    // ルール7: 1番人気の単勝リスク
    if (popularity === 1) {
      potential -= 15;
      tags.push("🔻 水沢減点: 1番人気の単勝リスク(-15点)");
    }

    // 岩手特有のトップ騎手補正
    if (jockey.includes("村上忍") || jockey.includes("坂井瑛") || jockey.includes("佐々志") || jockey.includes("山本政") || jockey.includes("小林凌")) {
      tags.push("🎯 水沢特注: 当日好調騎手");
    }`;

const before = lines.slice(0, 4343).join('\n');
const after = lines.slice(4598).join('\n');

const newContent = before + '\n' + newRules + '\n' + after;
fs.writeFileSync(filePath, newContent, 'utf8');
console.log("Rewrite successful.");
