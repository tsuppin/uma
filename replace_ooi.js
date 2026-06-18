const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engineNAR.ts');
let content = fs.readFileSync(filePath, 'utf8');

// The block starts with "  else if (trackName.includes('大井')) {"
// and ends right before "  else if (trackName.includes('川崎')) {"

const startIndex = content.indexOf("  else if (trackName.includes('大井')) {");
const endIndex = content.indexOf("  else if (trackName.includes('川崎')) {");

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `  else if (trackName.includes('大井')) {
    // ==========================================
    // 【完全減点方式】大井特化・最新トレンドプロトコル（2026/06抽出）
    // ==========================================
    const popularity = horse.popularity || 99;
    const weightChange = horse.weightChange || 0;
    const prevRace = horse.pastRaces && horse.pastRaces.length > 0 ? horse.pastRaces[0] : null;
    const isJpnGrade = race.raceName && race.raceName.match(/Jpn[1-3I-III]/i);
    const is3yoRace = race.raceName && race.raceName.includes('3歳');
    const isKobaRace = !is3yoRace && !isJpnGrade && race.raceClass && race.raceClass.match(/[ABC]級/i);
    
    // AI予想（馬券構築）ロジックにおける制限事項
    // 1. 1着予想の制限（人気ロジック）: 3番人気以下は1着固定に推奨しない（大幅減点）
    if (popularity >= 3) {
      potential -= 50;
      tags.push("⚠️ 大井AI制限: 1・2番人気勝率75%のため、3番人気以下の1着評価を大幅減点");
    }

    // 2. 1着予想の制限（脚質ロジック）: 差し・追込馬は1着固定除外（ヒモ評価）
    if (horse.style === '差し' || horse.style === '追込') {
      potential -= 30;
      tags.push("⚠️ 大井AI制限: 差し・追込馬は前を捕まえきれないため1着候補から除外(ヒモ狙い)");
    }

    // 4. 3着ヒモ穴の無作為抽出ロジック（darkness補正）
    if (popularity >= 10) {
      // 外部のdarkness計算で拾われやすくするためタグを付与
      tags.push("🌟 大井AIヒモ荒れ枠: 二桁人気の伏兵を強制ピックアップ");
    }

    // ■ 共通減点基準（全レース対象）
    // 1. 馬体重変動ペナルティ: 【-20点】
    if (weightChange <= -5 || weightChange >= 6) {
      potential -= 20;
      tags.push("❌ 大井減点: 馬体重異常変動(-5kg以下or+6kg以上)ペナルティ");
    }

    // 2. 枠順（内枠）ペナルティ: 【-15点】
    if (frame >= 1 && frame <= 4) {
      potential -= 15;
      tags.push("❌ 大井減点: 不利な内枠(1〜4枠)ペナルティ");
    }

    // 3. 非・継続騎乗（乗り替わり）ペナルティ: 【-10点】
    const prevRaceJockey = prevRace ? prevRace.jockey : horse.prevJockey;
    if (!prevRaceJockey || !horse.jockey || !horse.jockey.includes(prevRaceJockey.replace(/[☆▲△◇]/g, ''))) {
      potential -= 10;
      tags.push("❌ 大井減点: 乗り替わり(非・継続騎乗)ペナルティ");
    }

    // 4. 展開（後方待機）ペナルティ: 【-10点】
    if (prevRace && prevRace.corner4Position >= 3) {
      potential -= 10;
      tags.push("❌ 大井減点: 前走4角3番手以下の後方待機ペナルティ");
    }

    // 5. 毛色ペナルティ: 【-5点】
    if (horse.coatColor && horse.coatColor !== '鹿毛' && horse.coatColor !== '黒鹿毛') {
      potential -= 5;
      tags.push(\`❌ 大井減点: 優勢毛色以外の毛色(\${horse.coatColor})ペナルティ\`);
    }

    // ■ 条件別・レース別減点基準
    // 6. 古馬戦における「年齢」ペナルティ: 【-10点】
    if (isKobaRace && horse.age >= 5) {
      potential -= 10;
      tags.push("❌ 大井減点: 古馬戦における5歳以上の高齢馬ペナルティ");
    }

    // 7. 若駒戦における「性別」ペナルティ: 【-10点】
    if (is3yoRace && (horse.gender === '牡' || horse.gender === 'セン')) {
      potential -= 10;
      tags.push("❌ 大井減点: 3歳戦における牡馬・セン馬ペナルティ(牝馬優勢)");
    }

    // 8. 後半レースにおける「前走敗退」ペナルティ: 【-15点】
    const isLatterHalf = race.raceNumber && race.raceNumber >= 6;
    if (isLatterHalf && prevRace && prevRace.result >= 2) {
      potential -= 15;
      tags.push("❌ 大井減点: 後半レースにおける前走2着以下の敗退馬ペナルティ");
    }

    // 9. 交流重賞における「地方所属」ペナルティ: 【-30点】
    if (isJpnGrade) {
      const isJRAHorse = horse.belonging?.includes('JRA') || horse.stableLocation?.match(/(美浦|栗東)/) || (horse.jockey && ['ルメール', '川田', '武豊', '戸崎', '松山', '坂井', '横山武', '岩田望', '西村淳'].some(j => horse.jockey.includes(j)));
      if (!isJRAHorse) {
        potential -= 30;
        tags.push("❌ 大井Jpn減点: 交流重賞における地方所属馬(致命的ペナルティ)");
      }
    }
  } 
`;

  content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
  
  // also modify the weight bonus logic
  content = content.replace("if (horse.jockeyWeight && horse.jockeyWeight <= 53 && (horse.style === '逃げ' || horse.style === '先行')) {", "if (!trackName.includes('大井') && horse.jockeyWeight && horse.jockeyWeight <= 53 && (horse.style === '逃げ' || horse.style === '先行')) {");

  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Successfully replaced Ooi specific logic with penalty system.");
} else {
  console.log("Could not find start or end index.");
}
