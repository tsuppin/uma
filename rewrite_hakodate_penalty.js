const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engine.ts');
let content = fs.readFileSync(filePath, 'utf8');

const regex = /if \(isHakodate\) \{[\s\S]*?(?=  \/\/ ==========================================\r?\n  \/\/ 【阪神競馬場)/;

const newLogic = `if (isHakodate) {
    // 函館競馬場 完全減点方式（持ち点100点からのマイナス評価）
    potential = 100;
    tags.push("🦑 函館特化減点方式OMEGAエンジン適用中(100点スタート)");

    const isTurf = race.surface === "芝";
    const isDirt = race.surface === "ダート";
    const prevJockeyName = prevRaceData?.jockey || horse.prevJockey || '';
    const cleanPrevJockey = prevJockeyName.replace(/[☆▲△◇★]/g, '').trim();
    const cleanCurrentJockey = jockey.replace(/[☆▲△◇★]/g, '').trim();
    const isJockeyChanged = cleanPrevJockey && cleanPrevJockey !== cleanCurrentJockey;
    const isApprentice = jockey.match(/[☆▲△◇★]/);
    const isSpecialJockey = isApprentice || jockey.includes("横山和生") || jockey.includes("小沢大仁");

    // 【1. 脚質・位置取りに関する減点】
    let isRule1Exempt = false;
    if (prevRaceData && prevRaceData.result >= 10 && prevRaceData.corner4Position !== undefined && prevRaceData.corner4Position <= 3) {
      isRule1Exempt = true; // 例外（救済）
    }

    if (!isRule1Exempt) {
      if (prevRaceData && prevRaceData.corner4Position !== undefined && prevRaceData.corner4Position >= 6) {
        potential -= 20;
        tags.push("⚠️ 函館減点1-A: 直線の短い函館で致命的な前走4角6番手以降(差し・追込)");
      } else if (prevRaceData && prevRaceData.corner1Position !== undefined && prevRaceData.corner2Position !== undefined) {
        if (prevRaceData.corner1Position >= 4 && prevRaceData.corner2Position >= 4) {
          potential -= 10;
          tags.push("⚠️ 函館減点1-B: 前走1〜2コーナーが中団〜後方でテンのスピード不足");
        }
      }
    } else {
      tags.push("🌟 函館救済: 前走大敗でも4角3番手以内の先行力があるため脚質減点免除");
    }

    // 【2. 馬体重・コンディションに関する減点】
    if (typeof horse.weightChange === 'number') {
      if (horse.weightChange <= -10) {
        potential -= 20;
        tags.push("⚠️ 函館減点2-A: 滞在競馬での大幅馬体減(-10kg以上)はコンディション不安");
      } else if (horse.weightChange >= -8 && horse.weightChange <= -4) {
        potential -= 5;
        tags.push("⚠️ 函館減点2-B: 滞在競馬での小幅な馬体減(-4〜-8kg)による割引");
      }
    }

    // 【3. 性別・年齢に関する減点】
    if (horse.gender === '牡' || horse.gender === 'セ') {
      potential -= 10;
      tags.push("⚠️ 函館減点3-A: 夏は牝馬！牝馬優勢データに基づく牡馬・セン馬割引");
    }
    if (horse.age >= 5) {
      potential -= 10;
      tags.push("⚠️ 函館減点3-B: 若馬優勢データに基づく高齢馬(5歳以上)割引");
    }

    // 【4. 枠順・人気に関する減点】
    if (frame === 1) {
      potential -= 10;
      tags.push("⚠️ 函館減点4-A: 包まれるリスクが大きい最内1枠割引");
    }
    if (popularity === 1) {
      potential -= 15;
      tags.push("⚠️ 函館減点4-B: 勝率8.3%の1番人気アタマ評価割引(連軸候補推奨)");
    }

    // 【5. 前走実績・騎手（乗り替わり）の減点】
    if (!isJockeyChanged && prevRaceData && prevRaceData.result !== undefined && prevRaceData.result >= 6) {
      potential -= 15;
      tags.push("⚠️ 函館減点5-A: 前走6着以下からの「継続騎乗」は巻き返し困難");
    }
    if (prevRaceData && prevRaceData.result !== undefined && (prevRaceData.result < 1 || prevRaceData.result > 5)) {
      if (!isJockeyChanged || !isSpecialJockey) {
        potential -= 10;
        tags.push("⚠️ 函館減点5-B: 前走掲示板外で、有効な乗り替わり(減量・横山和・小沢)がないため割引");
      }
    }

    // 【6. ブリンカー着用馬の特殊減点フィルター】
    if (horse.useBlinkers) {
      let blinkerPenalty = false;
      if (frame !== 7) {
        potential -= 20;
        tags.push("⚠️ 函館減点6-A: ブリンカー着用馬は7枠以外大幅割引");
        blinkerPenalty = true;
      }
      if (prevRaceData && prevRaceData.distance !== undefined && prevRaceData.distance <= dist) {
        potential -= 10;
        tags.push("⚠️ 函館減点6-B: ブリンカー着用馬の同距離・距離延長は割引(距離短縮のみ狙い)");
        blinkerPenalty = true;
      }
      if (prevRaceData && prevRaceData.result !== undefined && (prevRaceData.result <= 3 || prevRaceData.result >= 9)) {
        potential -= 10;
        tags.push("⚠️ 函館減点6-C: ブリンカー着用馬で前走4〜8着以外(中途半端な着順以外)は割引");
        blinkerPenalty = true;
      }
      
      if (!blinkerPenalty && frame === 7 && prevRaceData && prevRaceData.distance > dist && prevRaceData.result >= 4 && prevRaceData.result <= 8) {
        tags.push("👑 函館ブリンカー特注: 減点ゼロ！黄金条件クリアの超特注穴馬");
      }
    }
  }
`;

if (regex.test(content)) {
  content = content.replace(regex, newLogic);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Replacement successful.");
} else {
  console.log("Regex did not match.");
}
