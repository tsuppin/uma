const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engine.ts');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `  // ==========================================
  // 【新設】東京最新トレンドプロトコル (2026/06抽出データ)
  // ==========================================
  if (trackName.includes('東京')) {`;

const replaceStr = `  // ==========================================
  // 【新設】東京最新トレンドプロトコル (2026/06抽出データ)
  // ==========================================
  if (trackName.includes('東京')) {
    // ==========================================
    // 【減点方式】東京競馬場・消去法評価ロジック（2026/06分析）
    // ==========================================
    
    // 1. 【所属による減点】「栗東（関西）」所属馬の1着固定
    if (horse.stableLocation && horse.stableLocation.includes('栗東')) {
      potential -= 30; // 1着候補から完全除外するため大幅減点
      tags.push("⚠️ 東京消去法: アタマ(1着)は絶望的。ヒモまでの評価となる栗東(関西)所属馬");
    }

    // 2. 【人気と騎手による減点】過信禁物の1番人気
    const isMaiden = race.raceName && (race.raceName.includes('未勝利') || race.raceName.includes('新馬'));
    if (!isMaiden && popularity === 1) {
      const isLemaireLanePenalty = horse.jockey && ['ルメール', 'レーン'].some(j => horse.jockey.includes(j));
      if (!isLemaireLanePenalty) {
        potential -= 25; // 軸馬として中〜大幅減点
        tags.push("⚠️ 東京消去法: 危険な1番人気(ルメール/レーン以外の過信禁物)");
      }
    }

    // 3. 【馬体重と年齢による減点】古馬の仕上がり不足
    if (age >= 4 && typeof horse.weightChange === 'number' && Math.abs(horse.weightChange) >= 10) {
      potential -= 20; // 中減点
      tags.push("⚠️ 東京消去法: 古馬の馬体重±10kg以上変動(仕上がり不足・太め残り)");
    }

    // 4. 【コースと脚質による減点】展開不利による致命傷
    if (race.surface === 'ダート' && dist === 1600) {
      if (['後方', '追込'].includes(horse.style)) {
        potential -= 30; // 大幅減点
        tags.push("⚠️ 東京消去法: D1600mで絶対に届かない極端な後方待機(追込)");
      }
    } else if (race.surface === 'ダート' && (dist === 1300 || dist === 1400)) {
      if (frame <= 2 && ['中団', '差し'].includes(horse.style)) {
        potential -= 20; // 中減点
        tags.push("⚠️ 東京消去法: D短距離の砂を被って揉まれる内枠(1・2枠)×差し馬");
      }
    }

    // 5. 【前走実績による減点】起爆剤のない大敗馬
    if (prevRaceData && prevRaceData.result >= 10) {
      const hasBlinkers = horse.useBlinkers;
      const isTannaiOrApprentice = horse.jockey && (horse.jockey.includes('丹内') || horse.jockey.match(/[☆▲△◇★]/));
      const isDirtTurfChange = prevRaceData.surface && race.surface && prevRaceData.surface !== race.surface;
      
      if (!hasBlinkers && !isTannaiOrApprentice && !isDirtTurfChange) {
        potential -= 40; // 完全消し(除外)
        tags.push("⚠️ 東京消去法: 起爆剤(変化)が一つもない前走大敗馬(完全消し)");
      }
    }

`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Successfully updated Tokyo penalty rules.");
} else {
  console.log("Error: Target string not found.");
}
