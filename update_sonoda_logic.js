const fs = require('fs');
let content = fs.readFileSync('app/lib/engineNAR.ts', 'utf8');

// 1. 人気ロジック変更: 4番人気以下-10 → 1・2番人気-12 + 逃げ+10 + 4番人気以下-8
const oldPopularityBlock = `    // -----------------------------------------------------
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
    }`;

const newPopularityBlock = `    // -----------------------------------------------------
    // 【1. 基本能力・適性による減点】 (2026/06 8レース分析反映)
    // -----------------------------------------------------
    // 人気減点：1・2番人気は過信禁物（メイショウロンド/シマノダイヤモンド等1位→大敗の実績）
    if (popularity === 1 || popularity === 2) {
      potential -= 12;
      tags.push(\`⚠️ 園田減点: 上位人気過信禁物（\${popularity}番人気大敗頻発の実績あり）\`);
    } else if (popularity >= 4) {
      potential -= 8;
      tags.push("⚠️ 園田減点: 1着候補としては信頼度減(4番人気以下)");
    }

    // 逃げ馬加点【+10点】：2026/06の複数レースで逃げ馬の展開利得を確認
    if (horse.style === '逃げ') {
      potential += 10;
      tags.push("🌟 園田優先: 逃げ馬の展開利得(2026/06複数レース実績)");
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
    }`;

if (content.includes(oldPopularityBlock)) {
  content = content.replace(oldPopularityBlock, newPopularityBlock);
  console.log('✅ 人気ロジック+逃げ馬加点 置換成功');
} else {
  console.log('❌ 人気ロジック置換失敗 - 文字列が見つかりません');
  // デバッグ: 近い行を確認
  const idx = content.indexOf('人気減点【-10点】');
  console.log('人気減点の位置:', idx);
  if (idx > 0) console.log('周辺テキスト:', content.substring(idx - 50, idx + 200));
}

// 2. 枠ペナルティ強化: -5 → -8
const oldFrameBlock = `    // 馬場傾向減点（前半1〜4R）【-5点】：外枠（5〜8枠）
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
    }`;

const newFrameBlock = `    // 馬場傾向減点（前半1〜4R）【-8点】：外枠（5〜8枠）― -5から強化
    const raceNumMatch = race.raceName ? race.raceName.match(/(\\d+)R/) : null;
    const raceNum = raceNumMatch ? parseInt(raceNumMatch[1], 10) : (race.raceNumber || 0);
    if (raceNum >= 1 && raceNum <= 4 && frame >= 5) {
      potential -= 8;
      tags.push("⚠️ 園田減点: 前半レースの外枠不利(強化)");
    }
    
    // 馬場傾向減点（後半5〜12R）【-8点】：内枠（1〜4枠）― -5から強化
    if (raceNum >= 5 && raceNum <= 12 && frame <= 4) {
      potential -= 8;
      tags.push("⚠️ 園田減点: 後半レースの内枠不利(強化)");
    }`;

if (content.includes(oldFrameBlock)) {
  content = content.replace(oldFrameBlock, newFrameBlock);
  console.log('✅ 枠ペナルティ強化 置換成功');
} else {
  console.log('❌ 枠ペナルティ置換失敗');
  const idx = content.indexOf('前半レースの外枠不利');
  console.log('外枠不利の位置:', idx);
  if (idx > 0) console.log('周辺テキスト:', content.substring(idx - 200, idx + 100));
}

fs.writeFileSync('app/lib/engineNAR.ts', content, 'utf8');
console.log('✅ ファイル書き込み完了');
