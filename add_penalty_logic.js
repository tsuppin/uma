/**
 * engine.ts と engineNAR.ts に完全な減点方式（potential -= N;）を追加するスクリプト
 * 挿入位置: darkness計算の直前（return文の前）
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join('c:', 'Users', 'tsuyoshi_tsuchiya', '.gemini', 'antigravity', 'scratch', 'keiba_app', 'app', 'lib');

// ==========================================
// engine.ts 用の減点ブロック
// ==========================================
const ENGINE_PENALTY_BLOCK = `
  // ==========================================
  // ✅【完全減点方式】明示的ペナルティブロック（potential -= N;）
  // 不利条件が揃った場合に積極的に減点を行う
  // ==========================================

  // ─────────────────────────────────────────
  // 【A-1】全場共通：連続凡走ペナルティ
  // ─────────────────────────────────────────
  if (horse.pastRaces && horse.pastRaces.length >= 2) {
    const recentTwoRaces = horse.pastRaces.slice(0, 2);
    const bothBad = recentTwoRaces.every(pr => pr.result >= 8);
    if (bothBad && popularity > 4) {
      potential -= 25;
      tags.push("❌ 連続凡走ペナルティ: 直近2走連続8着以下×上位人気外");
    }
  }

  // ─────────────────────────────────────────
  // 【A-2】全場共通：前走大敗×低人気 二重ペナルティ
  // ─────────────────────────────────────────
  if (prevRaceData && prevRaceData.result >= 10 && popularity >= 5) {
    potential -= 15;
    tags.push("❌ 前走10着以下×4番人気以下ペナルティ");
  }

  // ─────────────────────────────────────────
  // 【A-3】全場共通：調教評価 C 以下ペナルティ
  // ─────────────────────────────────────────
  if (horse.trainingRating) {
    const rating = horse.trainingRating.toUpperCase();
    if (rating === "C" || rating === "D" || rating === "E") {
      potential -= 20;
      tags.push("❌ 調教評価C以下ペナルティ(明らかな仕上がり不足)");
    }
  }

  // ─────────────────────────────────────────
  // 【A-4】全場共通：逃げ・先行馬 × 多頭数（16頭以上）ペナルティ
  // ─────────────────────────────────────────
  if ((horse.style === '逃げ') && headCount >= 16) {
    potential -= 20;
    tags.push("❌ 逃げ馬×多頭数ペナルティ: 16頭以上では包まれるリスク大");
  }

  // ─────────────────────────────────────────
  // 【A-5】全場共通：長距離 × 追込馬 × 距離延長ペナルティ
  // ─────────────────────────────────────────
  if (dist >= 2400 && horse.style === '追込' && prevRaceData && prevRaceData.distance < dist) {
    potential -= 20;
    tags.push("❌ 距離延長×追込馬×長距離ペナルティ(末脚届かないリスク)");
  }

  // ─────────────────────────────────────────
  // 【A-6】全場共通：連闘（5日以内出走）×重斤量ペナルティ
  // ─────────────────────────────────────────
  if (horse.isAfterRest === false && prevRaceData && kinryo >= 58) {
    // 前走日付が5日以内かを確認（prevRaceData.dateがある場合）
    if (prevRaceData.date) {
      const prevDate = new Date(prevRaceData.date);
      const raceDate = new Date(race.date || Date.now());
      const diffDays = (raceDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays <= 7) {
        potential -= 25;
        tags.push("❌ 連闘×重斤量ペナルティ(短期ローテ×58kg以上の過負荷)");
      }
    }
  }

  // ─────────────────────────────────────────
  // 【B-1】東京専用ペナルティ
  // ─────────────────────────────────────────
  if (trackName && trackName.includes('東京')) {
    // 東京ダート1600m：差し・追込 × 内枠(1〜3枠) → 前の砂をかぶる
    if (race.surface === 'ダート' && dist === 1600 && frame <= 3 &&
        (horse.style === '差し' || horse.style === '追込')) {
      potential -= 25;
      tags.push("❌ 東京D1600ペナルティ: 内枠差し追込は砂かぶりで前半消耗大");
    }

    // 東京芝短距離：追込 × 外枠(7枠以上) → 捌けない
    if (race.surface === '芝' && dist <= 1400 && frame >= 7 && horse.style === '追込') {
      potential -= 20;
      tags.push("❌ 東京芝短距離ペナルティ: 外枠追込は直線が詰まりやすい");
    }

    // 東京芝中長距離：逃げ馬 × 多頭数 × 外枠 → ハナを切れないリスク
    if (race.surface === '芝' && dist >= 1800 && horse.style === '逃げ' && frame >= 7 && headCount >= 12) {
      potential -= 20;
      tags.push("❌ 東京芝ペナルティ: 多頭数外枠の逃げ馬(ハナ争い激化リスク)");
    }
  }

  // ─────────────────────────────────────────
  // 【B-2】中山専用ペナルティ
  // ─────────────────────────────────────────
  if (trackName && trackName.includes('中山')) {
    // 外枠(7枠以上) × 芝短距離・マイル → コーナーロスが大きい
    if (race.surface === '芝' && dist <= 1600 && frame >= 7) {
      potential -= 25;
      tags.push("❌ 中山芝ペナルティ: 外枠はスパイラルカーブで大きなロス");
    }
    // 差し・追込 × 芝2000m以下 → 直線310mでは届かない
    if (race.surface === '芝' && dist <= 2000 &&
        (horse.style === '差し' || horse.style === '追込') && frame >= 6) {
      potential -= 20;
      tags.push("❌ 中山芝外枠差しペナルティ: 短い直線×外枠差しは物理的に不利");
    }
  }

  // ─────────────────────────────────────────
  // 【B-3】函館・小倉・福島（小回りコース）専用ペナルティ
  // ─────────────────────────────────────────
  const isSmallCourse = trackName && ['函館', '小倉', '福島'].some(t => trackName.includes(t));
  if (isSmallCourse) {
    // 差し × 外枠(6枠以上) × 小回りコース → 直線で詰まりやすい
    if (frame >= 6 && horse.style === '差し') {
      potential -= 20;
      tags.push("❌ 小回りコースペナルティ: 外枠差しは直線が短く届きにくい");
    }
    // 追込 × 脚質（函館・小倉・福島ではほぼ無効）→ さらに追加減点
    if (horse.style === '追込') {
      potential -= 25;
      tags.push("❌ 小回りコース追込ペナルティ: 直線が短すぎて物理的に届かない");
    }
  }

  // ─────────────────────────────────────────
  // 【B-4】新潟千直（芝1000m）専用ペナルティ
  // ─────────────────────────────────────────
  if (trackName && trackName.includes('新潟') && race.surface === '芝' && dist === 1000) {
    // 内枠(1〜2枠) → ラチ際が荒れやすく圧倒的不利
    if (frame <= 2) {
      potential -= 30;
      tags.push("❌ 新潟千直ペナルティ: 内枠は内ラチ沿いが荒れており致命的不利");
    }
    // 差し・追込 × 内〜中枠 → 直線一本勝負で砂かぶりリスク
    if ((horse.style === '差し' || horse.style === '追込') && frame <= 4) {
      potential -= 20;
      tags.push("❌ 新潟千直ペナルティ: 差し追込の内枠は前が壁になりやすい");
    }
  }

  // ─────────────────────────────────────────
  // 【B-5】阪神専用ペナルティ
  // ─────────────────────────────────────────
  if (trackName && trackName.includes('阪神')) {
    // 阪神芝中長距離(1600m〜2200m) × 外枠(6枠以上) × 差し・追込
    if (race.surface === '芝' && dist >= 1600 && dist <= 2200 &&
        frame >= 6 && (horse.style === '差し' || horse.style === '追込')) {
      potential -= 25;
      tags.push("❌ 阪神芝ペナルティ: 内回り専門コースで外枠差しは展開に左右されすぎる");
    }
    // 阪神ダート短距離(1400m以下) × 外枠(8枠) → 砂かぶりロス大
    if (race.surface === 'ダート' && dist <= 1400 && frame === 8) {
      potential -= 20;
      tags.push("❌ 阪神ダート短距離ペナルティ: 最外枠は序盤の砂かぶりが致命的");
    }
  }

  // ─────────────────────────────────────────
  // 【C-1】血統不適性ペナルティ
  // ─────────────────────────────────────────
  const sireName = horse.sire || '';

  // 芝特化血統 × ダート重賞
  const isTurfOnlySire = ['ディープインパクト', 'ハーツクライ', 'コントレイル', 'エフフォーリア'].some(s => sireName.includes(s));
  const isDirtStakes = race.surface === 'ダート' && race.raceName && race.raceName.match(/G[1-3I-III]|重賞|特別ステークス/);
  if (isTurfOnlySire && isDirtStakes) {
    potential -= 20;
    tags.push("❌ 血統不適性ペナルティ: 芝特化血統×ダート重賞(適性外の勝負)");
  }

  // ダート特化血統 × 芝重賞
  const isDirtOnlySire = ['シニスターミニスター', 'ヘニーヒューズ', 'パイロ', 'ゴールドアリュール'].some(s => sireName.includes(s));
  const isTurfStakes = race.surface === '芝' && race.raceName && race.raceName.match(/G[1-3I-III]|重賞|特別ステークス/);
  if (isDirtOnlySire && isTurfStakes) {
    potential -= 20;
    tags.push("❌ 血統不適性ペナルティ: ダート特化血統×芝重賞(コース適性に疑問)");
  }

  // 洋芝不向き軽量スピード血統 × 函館・札幌の芝
  const isSpeedOnlySire = ['ロードカナロア', 'ダイワメジャー', 'キンシャサノキセキ', 'ミッキーアイル'].some(s => sireName.includes(s));
  const isYoshibaCourse = trackName && (trackName.includes('函館') || trackName.includes('札幌')) && race.surface === '芝';
  if (isSpeedOnlySire && isYoshibaCourse) {
    potential -= 20;
    tags.push("❌ 洋芝血統不適ペナルティ: スピード系血統は重い洋芝で能力を発揮しにくい");
  }

  // ─────────────────────────────────────────
  // 【D-1】ローテーション不利ペナルティ
  // ─────────────────────────────────────────
  // 長期休み明け × 非エリート騎手 × 重賞
  if (horse.isAfterRest && race.raceName && race.raceName.match(/G[1-3I-III]|重賞/)) {
    const isEliteJockeyRider = ELITE_JOCKEYS.some(ej => jockey.includes(ej));
    if (!isEliteJockeyRider) {
      potential -= 20;
      tags.push("❌ 長期休み明け×非エリート騎手×重賞ペナルティ(仕上がり不安)");
    }
  }

  // ─────────────────────────────────────────
  // 【D-2】レース適性ミスマッチペナルティ
  // ─────────────────────────────────────────
  // 初ダート × ダート重賞（実績なし）
  if (race.surface === 'ダート' && horse.pastRaces && horse.pastRaces.length > 0) {
    const hasAllTurf = horse.pastRaces.every(pr => pr.surface === '芝');
    if (hasAllTurf && race.raceName && race.raceName.match(/G[1-3I-III]|重賞/)) {
      potential -= 25;
      tags.push("❌ 初ダート×ダート重賞ペナルティ: 実績ゼロの未知数すぎる条件");
    }
  }

  // ─────────────────────────────────────────
  // 【D-3】斤量急増ペナルティ（前走より3kg以上増）
  // ─────────────────────────────────────────
  if (prevRaceData && prevRaceData.jockeyWeight) {
    const prevKinryo = prevRaceData.jockeyWeight;
    const kinryoDiff = kinryo - prevKinryo;
    if (kinryoDiff >= 3) {
      potential -= 15;
      tags.push(\`❌ 斤量急増ペナルティ: 前走比+\${kinryoDiff}kg(パフォーマンス低下リスク)\`);
    }
  }
`;

// ==========================================
// engineNAR.ts 用の減点ブロック（地方競馬専用）
// ==========================================
const ENGINE_NAR_PENALTY_BLOCK = `
  // ==========================================
  // ✅【完全減点方式】NAR地方競馬専用ペナルティブロック（potential -= N;）
  // ==========================================

  // ─────────────────────────────────────────
  // 【NAR-A】全場共通：連続凡走ペナルティ
  // ─────────────────────────────────────────
  if (horse.pastRaces && horse.pastRaces.length >= 2) {
    const recentTwoRaces = horse.pastRaces.slice(0, 2);
    const bothBad = recentTwoRaces.every(pr => pr.result >= 8);
    if (bothBad && (horse.popularity || 99) > 4) {
      potential -= 25;
      tags.push("❌ NAR連続凡走ペナルティ: 直近2走連続8着以下");
    }
  }

  // ─────────────────────────────────────────
  // 【NAR-B】全場共通：調教評価 C 以下ペナルティ
  // ─────────────────────────────────────────
  if (horse.trainingRating) {
    const rating = horse.trainingRating.toUpperCase();
    if (rating === "C" || rating === "D" || rating === "E") {
      potential -= 20;
      tags.push("❌ NAR調教C以下ペナルティ(仕上がり不足)");
    }
  }

  // ─────────────────────────────────────────
  // 【NAR-C】小回りコース専用追込ペナルティ
  // ─────────────────────────────────────────
  const narSmallCourse = ['大井', '川崎', '浦和', '船橋', '高知', '笠松', '金沢', '佐賀'].some(t => race.trackName?.includes(t));
  if (narSmallCourse && horse.style === '追込') {
    potential -= 30;
    tags.push("❌ NAR小回りコース追込ペナルティ: 直線が短く末脚が届きにくい");
  }

  // ─────────────────────────────────────────
  // 【NAR-D】大外枠×小回りコースペナルティ
  // ─────────────────────────────────────────
  const narSmallTrack = ['浦和', '川崎', '笠松', '佐賀'].some(t => race.trackName?.includes(t));
  if (narSmallTrack && (horse.frame || 99) >= 8) {
    potential -= 20;
    tags.push("❌ NAR大外枠×超小回りペナルティ: コーナーロスが致命的");
  }

  // ─────────────────────────────────────────
  // 【NAR-E】前走大敗×低人気ペナルティ
  // ─────────────────────────────────────────
  const narPrevRace = horse.pastRaces && horse.pastRaces.length > 0 ? horse.pastRaces[0] : null;
  if (narPrevRace && narPrevRace.result >= 10 && (horse.popularity || 99) >= 5) {
    potential -= 15;
    tags.push("❌ NAR前走10着以下×低人気ペナルティ");
  }

  // ─────────────────────────────────────────
  // 【NAR-F】血統不適性：地方ダートに不向きな芝専門血統
  // ─────────────────────────────────────────
  const narSire = horse.sire || '';
  const isTurfOnlyNAR = ['ディープインパクト', 'コントレイル', 'エピファネイア'].some(s => narSire.includes(s));
  if (isTurfOnlyNAR && race.surface === 'ダート') {
    potential -= 15;
    tags.push("❌ NAR血統不適ペナルティ: 芝専門血統は地方ダートで能力を出し切れないリスク");
  }
`;

function addPenaltyToEngine(filename, penaltyBlock, targetSearch) {
  const filepath = path.join(BASE_DIR, filename);
  if (!fs.existsSync(filepath)) {
    console.log(`ファイルが見つかりません: ${filepath}`);
    return;
  }

  let content = fs.readFileSync(filepath, 'utf-8');

  // 既にペナルティブロックが追加済みか確認
  if (content.includes('✅【完全減点方式】明示的ペナルティブロック') || 
      content.includes('✅【完全減点方式】NAR地方競馬専用ペナルティブロック')) {
    console.log(`[SKIP] ${filename}: 既にペナルティブロックが追加済みです`);
    return;
  }

  // 挿入位置を探す
  const insertBefore = targetSearch;
  const insertIndex = content.indexOf(insertBefore);
  if (insertIndex === -1) {
    console.log(`[ERROR] ${filename}: 挿入位置 "${insertBefore.substring(0, 50)}..." が見つかりません`);
    return;
  }

  // ペナルティブロックを挿入
  const newContent = content.slice(0, insertIndex) + penaltyBlock + '\n' + content.slice(insertIndex);
  fs.writeFileSync(filepath, newContent, 'utf-8');
  console.log(`[OK] ${filename}: ペナルティブロックを追加しました`);
}

console.log('=== 完全減点方式 ペナルティロジック追加開始 ===\n');

// engine.ts への追加
// "darkness" 計算の直前（return文の前）に挿入
addPenaltyToEngine(
  'engine.ts',
  ENGINE_PENALTY_BLOCK,
  '  const darkness = (potential / 100) * Math.pow(odds, 1.1) * distortionBoost;'
);

// engineNAR.ts への追加
// ==========================================
// engineNAR.ts への追加
// ==========================================
// engineNAR.ts の return { 直前に挿入
addPenaltyToEngine(
  'engineNAR.ts',
  ENGINE_NAR_PENALTY_BLOCK,
  '  return {\n    horseId: horse.id,'
);

console.log('\n=== 完了 ===');
