const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engineNAR.ts');
let content = fs.readFileSync(filePath, 'utf8');

const startIndex = content.indexOf("else if (trackName.includes('園田') || trackName.includes('姫路')) {");
const endIndex = content.indexOf("else if (trackName.includes('高知')) {");

if (startIndex !== -1 && endIndex !== -1) {
  const before = content.slice(0, startIndex);
  const after = content.slice(endIndex);
  
  const replacement = `else if (trackName.includes('園田') || trackName.includes('姫路')) {
    // ==========================================
    // 【特化ロジック】園田競馬場・完全減点方式（2026/06分析）
    // ==========================================
    // 初期スコアを「100点」にリセット
    potential = 100;
    
    const popularity = horse.popularity || 99;
    const prevRaceData = horse.pastRaces && horse.pastRaces.length > 0 ? horse.pastRaces[0] : undefined;
    
    // -----------------------------------------------------
    // 【1. 基本能力・適性による減点】
    // -----------------------------------------------------
    // 人気減点【-10点】：当日「4番人気以下」
    if (popularity >= 4) {
      potential -= 10;
      tags.push("⚠️ 園田減点: 1着候補としては信頼度減(4番人気以下)");
    }
    
    // 馬体重減点【-20点】：前走比で±10kg以上
    if (typeof horse.weightChange === 'number' && Math.abs(horse.weightChange) >= 10) {
      potential -= 20;
      tags.push("⚠️ 園田消去法: 極端な馬体重変動(±10kg以上)によるアタマ除外");
    }
    
    // 距離ローテ減点【-10点】：前走の距離が異なる
    if (prevRaceData && prevRaceData.distance !== undefined && prevRaceData.distance !== dist) {
      potential -= 10;
      tags.push("⚠️ 園田減点: ペースに戸惑う距離変更ローテーション");
    }

    // -----------------------------------------------------
    // 【2. 過去実績・脚質による減点】
    // -----------------------------------------------------
    let top3Count = 0;
    let allWorseThan6 = true;
    let olderGoodRun = false;
    let recentSlump = false;
    
    if (horse.pastRaces && horse.pastRaces.length > 0) {
      const recentRaces = horse.pastRaces.slice(0, 5);
      recentRaces.forEach((pr, index) => {
        if (pr.result && pr.result <= 3) {
          top3Count++;
          allWorseThan6 = false;
          if (index >= 2) { olderGoodRun = true; } // 3走前〜5走前に好走
        } else if (pr.result && pr.result <= 5) {
          allWorseThan6 = false;
        }
        if (index < 2 && pr.result && pr.result >= 6) {
          recentSlump = true; // 前走・前々走が6着以下
        }
      });
      
      // スランプ減点【-20点】：過去5走すべて6着以下
      if (allWorseThan6 && recentRaces.length >= 3) {
        potential -= 20;
        tags.push("⚠️ 園田消去法: 過去すべて6着以下の完全スランプ");
      }
    }
    
    // 前走着順減点【-10点】：前走4着以下（ただし過去5走中3回以上1-3着の馬は免除）
    if (prevRaceData && prevRaceData.result >= 4) {
      if (top3Count < 3) {
        potential -= 10;
        tags.push("⚠️ 園田減点: 前走4着以下の凡走");
      }
    }

    // 脚質（通過順）減点【-10点】：前走4角9番手以下（※追い込み馬はヒモ穴フラグBで救済される場合あり）
    if (horse.style === '追込' || horse.style === '後方') {
      potential -= 10;
      tags.push("⚠️ 園田減点: 前走後方待機(展開待ちリスク)");
    }
    
    // -----------------------------------------------------
    // 【3. 騎手・陣営による減点】
    // -----------------------------------------------------
    const jName = horse.jockey || '';
    const tName = horse.trainer || '';
    const isTopJockey = ['田野', '小牧太'].some(j => jName.includes(j));
    
    // 騎手力減点【-15点】：田野豊・小牧太以外
    if (!isTopJockey) {
      potential -= 15;
      tags.push("⚠️ 園田減点: トップ騎手(田野/小牧太)以外の騎乗");
    }
    
    // 継続騎乗不信減点【-10点】：上位人気かつ乗り替わり（トップ騎手へは免除）
    const isJockeyChanged = prevRaceData && prevRaceData.jockey && jName !== prevRaceData.jockey;
    if (popularity <= 3 && isJockeyChanged && !isTopJockey) {
      potential -= 10;
      tags.push("⚠️ 園田減点: 上位人気馬の不穏な乗り替わり");
    }
    
    // 単騎出し減点【-5点】
    if (tName) {
      const sameTrainerCount = race.horses.filter(h => h.trainer && h.trainer.includes(tName)).length;
      if (sameTrainerCount === 1) {
        potential -= 5;
        tags.push("⚠️ 園田減点: 同厩舎の多頭出しがない単騎参戦");
      }
    }

    // -----------------------------------------------------
    // 【4. 枠順による減点】
    // -----------------------------------------------------
    // 枠・馬番不一致減点【-15点】
    if (frame !== horse.horseNumber) {
      potential -= 15;
      tags.push("⚠️ 園田減点: 枠番と馬番の不一致(マイナスバイアス)");
    }
    
    // 馬場傾向減点（前半1〜4R）【-5点】：外枠（5〜8枠）
    const raceNumMatch = race.raceName ? race.raceName.match(/(\\d+)R/) : null;
    const raceNum = raceNumMatch ? parseInt(raceNumMatch[1], 10) : (race.raceNumber || 0);
    if (raceNum >= 1 && raceNum <= 4 && frame >= 5) {
      potential -= 5;
      tags.push("⚠️ 園田減点: 前半レースの外枠不利");
    }
    
    // 馬場傾向減点（後半5〜12R）【-5点】：内枠（1〜4枠）
    if (raceNum >= 5 && raceNum <= 12 && frame <= 4) {
      potential -= 5;
      tags.push("⚠️ 園田減点: 後半レースの内枠不利");
    }

    // -----------------------------------------------------
    // 【ヒモ穴推奨フラグ（別枠加点）】
    // -----------------------------------------------------
    if (popularity >= 5) {
      let isHimoHole = false;
      let himoReason = "";
      
      // フラグA：前走凡走 × 3〜5走前に好走
      if (recentSlump && olderGoodRun) {
        isHimoHole = true; himoReason = "隠れた実力(過去好走歴)";
      }
      // フラグB：前走後方待機、または距離短縮
      if (horse.style === '追込' || horse.style === '後方') {
        isHimoHole = true; himoReason = "追い込み一変";
      }
      if (prevRaceData && prevRaceData.distance !== undefined && prevRaceData.distance > dist) {
        isHimoHole = true; himoReason = "大幅な距離短縮恩恵";
      }
      // フラグC：陣営の波乱使者（小谷哲 / 尾林二 / 碇清次）
      if (jName.includes('小谷') || ['尾林二', '碇清次'].some(t => tName.includes(t))) {
        isHimoHole = true; himoReason = "波乱メーカー陣営";
      }
      // フラグD：恩恵乗り替わり（斤量1.0kg以上減）
      if (isJockeyChanged && prevRaceData && prevRaceData.burdenWeight && horse.burdenWeight) {
        const prevW = parseFloat(prevRaceData.burdenWeight);
        const currW = parseFloat(horse.burdenWeight);
        if (!isNaN(prevW) && !isNaN(currW) && (prevW - currW) >= 1.0) {
          isHimoHole = true; himoReason = "乗り替わり軽量化";
        }
      }
      // フラグE：本命馬と同枠・隣枠
      const favHorse = race.horses.find(h => h.popularity === 1);
      if (favHorse && favHorse.frame && Math.abs(frame - favHorse.frame) <= 1) {
        isHimoHole = true; himoReason = "本命馬の同枠/隣枠";
      }
      
      if (isHimoHole) {
        // ヒモ穴として拾いやすくするため救済加点
        potential += 30;
        tags.push(\`💥 園田特注: 絶好のヒモ穴推奨フラグ成立！(\${himoReason})\`);
      }
    }
  }
  `;
  
  fs.writeFileSync(filePath, before + replacement + after, 'utf8');
  console.log("Rewrite successful.");
} else {
  console.log("Error: could not find indices");
}
