const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engineNAR.ts');
let content = fs.readFileSync(filePath, 'utf8');

const startIndex = content.indexOf("  else if (trackName.includes('笠松')) {");
const endIndex = content.indexOf("  else if (trackName.includes('園田') || trackName.includes('姫路')) {");

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `  else if (trackName.includes('笠松')) {
    // ==========================================
    // 【特化ロジック】笠松特化・完全減点方式ハイブリッド（2026/06抽出）
    // ==========================================
    const popularity = horse.popularity || 99;
    const prevRace = horse.pastRaces && horse.pastRaces.length > 0 ? horse.pastRaces[0] : null;

    let kasamatsuPenalty = 0;
    const weightChange = horse.weightChange || 0;
    const absWeightChange = Math.abs(weightChange);

    // --- 減点スクリーニング（不安要素の排除） ---

    // 減点ルール1：内枠（1枠〜3枠）に入った馬 (-20pt)
    if (frame >= 1 && frame <= 3) {
      kasamatsuPenalty += 20;
      tags.push("❌ 笠松減点: 圧倒的に不利な内枠(1〜3枠)");
    } else if (frame >= 4 && frame <= 5) {
      kasamatsuPenalty += 10;
      tags.push("⚠️ 笠松減点: 不利な中枠(4〜5枠)ペナルティ");
    }

    // 減点ルール2：年齢が「5歳以上（特に7歳以上の高齢馬）」
    if (horse.age >= 7) {
      kasamatsuPenalty += 20;
      tags.push("❌ 笠松減点: スピード負けしやすい7歳以上の高齢馬");
    } else if (horse.age === 5 || horse.age === 6) {
      kasamatsuPenalty += 10;
      tags.push("⚠️ 笠松減点: 4歳馬に劣る5〜6歳馬");
    }

    // 減点ルール3：馬体重の増減が「±6kg以上（特に±10kg以上の2桁増減）」
    if (absWeightChange >= 10) {
      kasamatsuPenalty += 20;
      tags.push("❌ 笠松減点: 状態のブレが疑われる馬体重±10kg以上の大幅増減");
    } else if (absWeightChange >= 6) {
      kasamatsuPenalty += 10;
      tags.push("⚠️ 笠松減点: 状態不安定な馬体重±6〜9kgの変動");
    }

    // 減点ルール4：前走が「6着以下」の大敗馬
    if (prevRace && prevRace.result >= 6) {
      kasamatsuPenalty += 20;
      tags.push("❌ 笠松減点: 巻き返しが難しい前走6着以下の大敗馬");
    }

    // 減点ルール5：前走の通過順位が「5番手以降」の差し・追い込み馬
    if (horse.style === '差し' || horse.style === '追込') {
      kasamatsuPenalty += 15;
      tags.push("❌ 笠松減点: 前残り馬場で届かない後方脚質(差し・追い込み)");
    }

    // --- プラス評価（加点・特例オーバーライド） ---

    // 外枠（特に7枠・8枠）を重視
    if (frame >= 6) {
      potential += 20;
      if (frame >= 7) potential += 10;
      tags.push("🔥 笠松特注: 勝率の高い有利な外枠(6〜8枠)");
    }

    // 圧倒的な勝率を誇る「4歳馬」
    if (horse.age === 4) {
      potential += 25;
      tags.push("🔥 笠松特注: 勝率が極めて高い圧倒的有利な4歳馬");
    }

    // 前走1〜3着の好走馬の勢い
    if (prevRace && prevRace.result >= 1 && prevRace.result <= 3) {
      potential += 25;
      tags.push("🔥 笠松特注: 勢いを素直に評価すべき前走1〜3着の好走馬");
      if (prevRace.result === 1 || prevRace.result === 2) {
        potential += 15;
        tags.push("🔥 笠松特注: 勢いそのままに連勝・好走が見込める前走1〜2着馬");
      }
    }

    // 馬体重安定
    if (absWeightChange <= 5) {
      potential += 15;
      tags.push("👑 笠松特注: 馬体重安定(±5kg以内)の勝負気配(1着候補)");
    }

    // 軸馬は「1・2番人気」、相手には「中穴」
    if (popularity === 1 || popularity === 2) {
      potential += 30;
      tags.push("👑 笠松鉄板: 信頼度の高い上位人気(1・2番人気軸)");
    } else if (popularity >= 4 && popularity <= 7) {
      potential += 15;
      tags.push("🌟 笠松特注: ヒモ荒れを演出する中穴候補(4〜7番人気必須)");
    } else if (popularity >= 8) {
      kasamatsuPenalty += 15; // 8番人気以下は来にくい
    }

    // 1番人気は連対候補
    if (popularity === 1) {
      potential -= 10;
      tags.push("⚠️ 笠松特注: 1番人気は1着を取りこぼしやすいため2着(連対)候補推奨");
    }

    // 騎手の評価（渡邊竜也、筒井勇、東川・松本、減量騎手）
    if (horse.jockey) {
      if (horse.jockey.includes('渡邊竜')) {
        potential += 30;
        tags.push("👑 笠松特注: 勝ち切る力を見せる渡邊竜也騎手(1着候補)");
      } else if (horse.jockey.includes('筒井勇')) {
        potential += 10;
        tags.push("🌟 笠松特注: 馬券圏内への安定感抜群の筒井勇騎手(2〜3着付け推奨)");
      } else if (horse.jockey.includes('東川慎') || horse.jockey.includes('松本')) {
        potential += 20;
        tags.push("🔥 笠松特注: 複数勝利を挙げる好調騎手(東川・松本)");
      }
      
      const isApprenticeKasamatsu = horse.jockey.match(/[☆▲△◇]/);
      if (isApprenticeKasamatsu) {
        potential += 15;
        tags.push("🌟 笠松特注: 軽斤量を活かして馬券圏内に飛び込む減量騎手(ヒモ穴必須)");
      }
    }

    // 特別戦の「笹野博厩舎 × 渡邊竜也騎手」
    const isSpecialRace = race.raceName && race.raceName.includes('特別');
    if (isSpecialRace && horse.trainer && horse.trainer.includes('笹野') && horse.jockey && horse.jockey.includes('渡邊竜')) {
      potential += 40;
      tags.push("👑 笠松鉄板: 特別戦における笹野博厩舎×渡邊竜也騎手の黄金タッグ");
    }

    // 先行力（逃げ・先行）
    if (horse.style === '逃げ' || horse.style === '先行') {
      potential += 20;
      tags.push("🔥 笠松特注: 小回りコースで圧倒的有利な先行力");
    }

    // 牝馬の強さ
    if (horse.sex === '牝') {
      potential += 15;
      tags.push("🔥 笠松特注: 牡馬相手でも勝ち切る勝負強い牝馬");
    }

    // 最終ペナルティの適用
    potential -= Math.max(0, kasamatsuPenalty);
  }
`;

  content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Successfully refactored Kasamatsu logic to penalty system.");
} else {
  console.log("Could not find start or end index.");
}
