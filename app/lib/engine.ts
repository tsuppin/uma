import { Horse, Prediction, Race, LearningPatch, Formation, MasterData } from '../types';

// ==========================================
// Yatomi Physics Logic (弥富・名古屋競馬)
// ==========================================
export function calculateYatomiPhysics(
  horse: Horse,
  pastRace: Horse['pastRaces'][0] | undefined,
  windSpeed: number,
  isHeadwind: boolean,
  trackCondition: string,
  isInBiasActive: boolean
): number {
  if (!pastRace) return 0;
  
  let adjTime = pastRace.time ? parseFloat(pastRace.time.replace(':', '').replace('.', '')) : 0;

  // 1. WIND_VECTOR 補正
  if (isHeadwind && windSpeed >= 4.0) {
    if (pastRace.corner4Position <= 4) {
      adjTime += 0.3; // 先行馬：空気抵抗増大
    } else {
      adjTime -= 0.2; // スリップストリーム効果
    }
  }

  // 2. TRACK_WIDTH_LOSS 補正
  const nPosition = pastRace.cornerOuterCount || 1;
  if (nPosition > 1) {
    adjTime -= (nPosition - 1) * 0.15;
  }

  // 3. POWER_STRIDE_DYNAMICS 補正
  const weight = horse.weight;
  if (trackCondition === '良') {
    if (weight < 480) {
      adjTime += 0.2;
    } else if (weight >= 500 && pastRace.otherVenueExp) {
      adjTime -= 0.3;
    }
  }

  // 4. DYNAMIC_BIAS_DETECTOR
  if (isInBiasActive) {
    if (horse.frame <= 3 && pastRace.cornerOuterCount === 1) {
      adjTime -= 0.4;
    }
  }

  const classBaseTime = pastRace.classBaseTime || adjTime + 0.5;
  return adjTime <= classBaseTime ? 1 : 0; // 物理的狙い馬タグ
}

// ==========================================
// Tsuchiya Protocol - スコア計算
// ==========================================
export function calculateTsuchiyaScore(
  horse: Horse, 
  race: Race, 
  learningPatches: LearningPatch[],
  masterData: MasterData
): Prediction {
  let potential = 100.0;
  const bloodline = horse.bloodline || '';
  const trackName = race.trackName;
  const dist = race.distance;
  const condition = race.condition;
  const weight = horse.weight;
  const weightChange = horse.weightChange;
  const frame = horse.frame;
  const gender = horse.gender;
  const age = horse.age;
  const odds = horse.odds || 10;
  const kinryo = horse.jockeyWeight || 55;
  const popularity = horse.popularity || 99;
  const jockey = horse.jockey || '';
  const oddsSS = horse.oddsStandardScore || 50;
  const headCount = race.headCount || 10;
  const tags: string[] = [];

  // ==========================================
  // 【新設】データベース（MasterData）連携
  // ==========================================
  const hm = masterData.horses?.[horse.name];
  const jm = masterData.jockeys?.[horse.jockey];

  if (hm) {
    // コース実績加点
    const courseWins = hm.results.filter(r => r.venue === race.venue && r.rank === 1).length;
    if (courseWins > 0) {
      potential += 20;
      tags.push(`コース実績馬(${courseWins}勝)`);
    }
    // 距離実績
    const distTop3 = hm.results.filter(r => Math.abs(r.distance - race.distance) <= 100 && r.rank <= 3).length;
    if (distTop3 > 0) {
      potential += 15;
      tags.push(`距離・近接適性(${distTop3}回)`);
    }
  }

  // ==========================================
  // 【新設】直近の走績（Form）解析 - 1,2,3着を当てる核
  // ==========================================
  if (horse.pastRaces && horse.pastRaces.length > 0) {
    const validPastRaces = horse.pastRaces.filter(pr => pr.result > 0);
    const recent5 = validPastRaces.slice(0, 5);
    
    // 近5走での好走（連対・3着以内）
    const top3Count = recent5.filter(pr => pr.result <= 3).length;
    const winsCount = recent5.filter(pr => pr.result === 1).length;
    
    if (winsCount >= 2) { potential += 40; tags.push(`近5走で${winsCount}勝`); }
    if (top3Count >= 3) { potential += 35; tags.push('近5走安定勢(50%超)'); }
    else if (top3Count >= 1) { potential += 15; tags.push('近走好走実績あり'); }

    // 掲示板（5着以内）確保
    const top5Count = recent5.filter(pr => pr.result <= 5).length;
    if (top5Count >= 4) { potential += 20; tags.push('入着率エリート'); }

    // 上昇気配（直近3走の着順が改善傾向）
    if (recent5.length >= 3 && recent5[0].result < recent5[1].result && recent5[1].result < recent5[2].result) {
      potential += 25;
      tags.push('3走連続上昇');
    }
  }

  // ==========================================
  // 【新設】人脈・相性・陣営の思惑 (Human Network & Intention)
  // ==========================================
  const eliteJockeys = ['ルメール', '川田将雅', '武豊', '坂井瑠星', '戸崎圭太', 'モレイラ', 'レーン', '横山武史', '笹川翼', '御神本訓', '吉村智洋', '渡邊竜也', '岡部誠'];
  const isEliteJockey = eliteJockeys.some(ej => jockey.includes(ej));

  // 1. 馬と騎手の相性（主戦騎手ボーナス）
  if (horse.pastRaces && horse.pastRaces.length > 0) {
    // 過去の騎乗履歴をチェック
    const pastRides = horse.pastRaces.filter(pr => pr.jockey && jockey && pr.jockey.includes(jockey.split(' ')[0] || jockey));
    const pastWins = pastRides.filter(pr => pr.result === 1).length;
    const pastTop3 = pastRides.filter(pr => pr.result <= 3).length;

    if (pastWins > 0) {
      potential += 20;
      tags.push('🤝主戦騎手(勝利実績)');
    } else if (pastTop3 > 0) {
      potential += 10;
      tags.push('🤝主戦騎手(好走実績)');
    } else if (pastRides.length === 0) {
      // 初騎乗（乗り替わり）
      // 陣営の思惑：前走負けていて、今回エリート騎手に乗り替わりなら「勝負気配（ヤリ）」
      if (horse.pastRaces[0].result > 3 && isEliteJockey) {
        potential += 35;
        tags.push('🔥勝負気配(エリート乗り替わり)');
      }
    }
  }

  // 2. 騎手と調教師の黄金ライン（相性）
  const trainer = horse.trainer || '';
  if (trainer && jockey) {
    if (trainer.includes('笹野') && jockey.includes('渡邊')) {
      potential += 30; tags.push('🌟黄金ライン(笹野×渡邊)');
    } else if (trainer.includes('友道') && (jockey.includes('川田') || jockey.includes('ルメール') || jockey.includes('武豊'))) {
      potential += 25; tags.push('🌟勝負ライン(友道×エリート)');
    } else if (trainer.includes('矢作') && jockey.includes('坂井')) {
      potential += 30; tags.push('🌟黄金ライン(矢作×坂井)');
    } else if (trainer.includes('木村') && jockey.includes('ルメール')) {
      potential += 30; tags.push('🌟黄金ライン(木村×ルメール)');
    } else if (trainer.includes('中内田') && jockey.includes('川田')) {
      potential += 30; tags.push('🌟黄金ライン(中内田×川田)');
    } else if (trainer.includes('打越') && jockey.includes('吉村')) {
      potential += 25; tags.push('🌟黄金ライン(打越×吉村)');
    }
  }

  // 3. 陣営の思惑（仕上げ・叩き）
  // 前走大敗からしっかり絞ってきた場合
  if (weightChange < 0 && weightChange >= -10 && horse.pastRaces && horse.pastRaces.length > 0 && horse.pastRaces[0].result > 5) {
    potential += 15;
    tags.push('🔥メイチ仕上げ推測(馬体重絞り)');
  }

  // ==========================================
  // 【新設】レース展開シミュレーション（先行争いの激しさ予測）
  // ==========================================
  const frontRunnersCount = race.horses.filter(h => h.style === '逃げ' || h.style === '先行' || h.style === '好位').length;
  const isHighPaceSim = frontRunnersCount >= 6; // 先行馬が多い -> 激戦 -> 差し有利
  const isSlowPaceSim = frontRunnersCount <= 2; // 先行馬が少ない -> 展開利 -> 逃げ有利

  // ==========================================
  // 【全場共通】鞍上（騎手）エリート補正
  // ==========================================
  if (isEliteJockey) {
    potential += 25;
    tags.push('👑エリート鞍上');
  }

  if (jm && jm.venueStats[race.venue]) {
    const vs = jm.venueStats[race.venue];
    if (vs.total >= 3) {
      const winRate = vs.wins / vs.total;
      const top3Rate = vs.top3 / vs.total;
      if (winRate > 0.20) { potential += 25; tags.push('会場勝率エリート'); }
      else if (top3Rate > 0.40) { potential += 20; tags.push('会場安定勢'); }
    }
  }

  // ==========================================
  // 【全場共通】斤量体重比 - 物理的限界デッドライン
  // ==========================================
  const weightRatio = (kinryo / weight) * 100;
  if (gender === '牝' && weightRatio > 12.5) {
    potential -= 50;
    tags.push('斤量限界超過');
  } else if ((gender === '牡' || gender === 'セン') && weightRatio > 12.6) {
    potential -= 50;
    tags.push('斤量限界超過');
  }

  // ==========================================
  // PMR (Physical Mass Ratio) 解析
  // ==========================================
  if (dist <= 1400) {
    if (460 <= weight && weight <= 490) { potential += 15; tags.push('PMR最適（短距離）'); }
    else if (weight > 510) { potential -= 10; }
    else if (weight < 440) { potential -= 15; }
  } else if (dist <= 2000) {
    if (480 <= weight && weight <= 520) { potential += 20; tags.push('PMR黄金帯域'); }
    else if (weight > 520) { potential += 15; tags.push('大型馬パワー'); }
    else if (weight < 450) { potential += 5; }
  } else {
    if (460 <= weight && weight <= 480) { potential += 15; tags.push('PMR最適（長距離）'); }
    else if (weight >= 530) { potential += 15; tags.push('スタミナ型質量'); }
  }

  // ==========================================
  // 馬体重増減エントロピー解析（成長 vs 絞り込み vs 疲弊）
  // ==========================================
  if (weightChange >= 10) {
    if (weightChange <= 16) {
      potential += 25; 
      tags.push('🚀馬体充実(成長加速)'); 
    } else {
      potential -= 15; 
      tags.push('⚠️太目残り・調整不足'); 
    }
  } else if (weightChange <= -10) {
    // 京都の実証分析に基づき、-24kgまでの絞り込みを「仕上げ」として再定義
    if (weightChange >= -24) {
      potential += 20; 
      tags.push('🎯仕上げ確変(究極の絞り込み)');
    } else {
      potential -= 30;
      tags.push('⚠️過剰消耗(パワーダウン警戒)');
    }
  } else if (-4 <= weightChange && weightChange <= 4) {
    potential += 10;
    tags.push('質量安定');
  }

  // ==========================================
  // 【新設】特殊馬具・厩舎所属・マーケット偏差値
  // ==========================================
  // 1. 特殊馬具（ブリンカー）解析
  if (horse.useBlinkers) {
    const blinkerHorses = race.horses.filter(h => h.useBlinkers).length;
    let blinkerBonus = 20;
    
    // 希少性によるブースト（着用馬が少ないほど一変の期待値が高い）
    if (blinkerHorses <= 2) {
      blinkerBonus += 15;
      tags.push('🎯特殊馬具(希少一変期待)');
    } else if (blinkerHorses >= 5) {
      blinkerBonus -= 10;
      tags.push('📢ブリンカー多用(効果分散)');
    } else {
      tags.push('🎯特殊馬具(集中力向上)');
    }

    // 馬体重絞り込みとのシナジー（陣営の「ここが勝負」のサイン）
    if (weightChange <= -10 && weightChange >= -24) {
      blinkerBonus += 25;
      tags.push('🚀勝負気配(馬体減×ブリンカー)');
    }
    
    potential += blinkerBonus;
  }

  // 2. 厩舎所属エリア（栗東/美浦）
  if (trackName !== '東京' && race.venue !== '東京') {
    if (horse.stableLocation === '栗東') {
      potential += 15;
      tags.push('🏰西高東低(栗東所属)');
    } else if (horse.stableLocation === '美浦') {
      potential += 5;
    }
  }

  // 3. オッズ偏差値解析（歪みの標準化）
  if (horse.oddsStandardScore) {
    if (horse.oddsStandardScore >= 65) {
      potential += 25;
      tags.push('💎不当過小評価(歪み特大)');
    } else if (horse.oddsStandardScore <= 35) {
      potential -= 15;
      tags.push('⚠️不当過剰評価');
    }
  }

  // ==========================================
  // 【新設】過去走パフォーマンス（着順・タイム差）解析
  // ==========================================
  if (horse.pastRaces && horse.pastRaces.length > 0) {
    const lastRace = horse.pastRaces[0];
    const tDiff = lastRace.timeDiff ?? 9.9;
    
    // ① アタマ(1着)候補の王道：前走僅差または上位着順
    if (tDiff < 0) {
      potential += 35; // 前走圧勝
      tags.push(`🔥前走圧勝実績(着差${tDiff}秒)`);
    } else if (tDiff <= 1.0 || lastRace.result <= 3) {
      potential += 25;
      tags.push('🔥王道パターン(前走好走/僅差)');
    }
    
    // ② JRA転入馬の「格上」評価（大敗無視）
    const isJRATransfer = horse.pastRaces.some(pr => pr.venue.match(/(東京|中山|阪神|京都|新潟|中京|小倉|福島|函館|札幌)/));
    if (isJRATransfer && tDiff >= 2.0) {
      potential += 40;
      tags.push('🚀JRA転入馬(格上/前走大敗無視)');
    }
    
    // ③ ヒモ穴(2-3着)：近走大敗だが5走以内に好走歴あり
    if (tDiff >= 3.0 && horse.pastRaces.slice(1, 5).some(pr => pr.result <= 3)) {
      potential -= 15; // 1着確率は下がる
      tags.push('💎隠れた実力馬(過去5走以内好走)');
    }

    // ④ タイム・上がり性能解析（クラス別スイートスポット）
    const isLowerClass = horse.raceClass?.match(/(未勝利|1勝クラス|新馬)/);
    const isUpperClass = horse.raceClass?.match(/(2勝クラス|3勝クラス|オープン|重賞|リステッド|G[123])/);
    
    // 下位クラス：上がり性能重視（末脚上位実績）
    const last3fTimes = horse.pastRaces.map(pr => parseFloat(pr.last3fTime || '99.9'));
    const best3f = Math.min(...last3fTimes);
    if (isLowerClass && best3f <= 34.2) {
      potential += 30;
      tags.push('🚀下位クラス末脚エッジ');
    }
    
    // 上位クラス：走破タイム（持ち時計）重視
    if (isUpperClass) {
      const sameDistRaces = horse.pastRaces.filter(pr => pr.distance === race.distance);
      const bestTime = sameDistRaces.length > 0 ? Math.min(...sameDistRaces.map(pr => parseFloat(pr.time || '999'))) : 999;
      if (bestTime < 999) {
        potential += 25;
        tags.push('🛡️上位クラス持ち時計エッジ');
      }
    }

    // ⑤ 隠れた「タイム異常値」検知：着順は大敗でもタイム差が極少な馬
    const hiddenGem = horse.pastRaces.find(pr => pr.result >= 8 && pr.timeDiff !== undefined && pr.timeDiff <= 0.5);
    if (hiddenGem) {
      potential += 35;
      tags.push('💎タイム異常値(着順不問・実力不一致)');
    }
    
    // 通過順位による展開利（川崎・門別・笠松等）
    if (lastRace.passingPositions) {
      const pos = lastRace.passingPositions.split('-').map(Number);
      if ((pos[0] <= 3 || pos[1] <= 3) && (trackName === '川崎' || trackName === '門別' || trackName === '笠松')) {
        potential += 15;
        tags.push('🏇先行・展開利(検証済み)');
      }
    }
  }

  // ==========================================
  // 【新設】展開・ポジション適性解析（クラス別交差評価）
  // ==========================================
  const hStyle = horse.style || '中団';
  const isLClass = horse.raceClass?.match(/(未勝利|1勝クラス|新馬)/);
  const isUClass = horse.raceClass?.match(/(2勝クラス|3勝クラス|オープン|重賞|リステッド|G[123])/);

  if (isLClass) {
    // 下位クラス：差し・追い込み有利
    if (hStyle === '中団' || hStyle === '後方') {
      potential += 25;
      tags.push('🏹下位クラス:差し・追い込み展開利');
      if (isHighPaceSim) {
        potential += 15;
        tags.push('🏹ハイペース激戦:末脚ブースト');
      }
    }
  } else if (isUClass) {
    // 上位クラス：先行・好位有利
    if (hStyle === '逃げ' || hStyle === '先行' || hStyle === '好位') {
      potential += 30;
      tags.push('🏰上位クラス:先行・好位展開利');
      if (isSlowPaceSim) {
        potential += 20;
        tags.push('🏰スローペース単騎:展開利ブースト');
      }
    }
  }

  // ==========================================
  // ==========================================
  // 【新設】斤量比率（負担重量 ÷ 馬体重）解析
  // ==========================================
  // 平均11〜12%。13%超は重く、11%未満はパワー優位。
  const jockWeightRatio = (kinryo / weight) * 100;
  if (jockWeightRatio < 11.0) {
    potential += 35; // 500kg超大型馬の圧倒的パワー
    tags.push('💪斤量比率10%台(パワー無双)');
  } else if (jockWeightRatio <= 12.5) {
    potential += 20; // 450-490kg前後の適正サイズ
    tags.push('💪斤量比率適正(勝ちきり期待)');
  } else if (jockWeightRatio >= 14.0) {
    potential -= 20; // 小柄な馬の1着は厳しい
    tags.push('⚠️斤量高負荷(2-3着ヒモ穴特化)');
  }

  // ==========================================
  // 【新設】絶対斤量（負担重量）解析
  // ==========================================
  // 55kgが最多勝利。54kg以下はヒモ、57kg以上は後半のみ信頼。
  if (kinryo === 55) {
    potential += 25; 
    tags.push('🎯黄金斤量(55kg)');
  } else if (kinryo <= 54) {
    potential -= 15;
    tags.push('🎐軽量馬(2-3着ヒモ穴特化)');
  } else if (kinryo >= 57) {
    if (race.raceNumber >= 7) {
      potential += 20;
      tags.push('🏰重量実力馬(後半勝負)');
    } else {
      potential -= 15;
      tags.push('⚠️重量負担(前半戦回避)');
    }
  }

  // 馬格(500kg+) と 成長(+10kg+) のシナジー評価
  if (weight >= 500 && weightChange >= 10) {
    potential += 25;
    tags.push('🚀大型馬×大幅増(成長パワーアップ)');
  }

  // ==========================================
  // 【新設】盛岡競馬場 時間帯・枠順・クラス別バイアス解析
  // ==========================================
  if (trackName === '盛岡' || race.venue === '盛岡') {

    
    // 枠順バイアス（全時間帯共通の強力な傾向）
    if (frame >= 7) {
      potential += 30; tags.push('盛岡:外枠絶対優位');
    } else if (frame === 1) {
      potential += 20; tags.push('盛岡:最内枠健闘');
    } else if (frame === 2 || frame === 4) {
      potential -= 25; tags.push('盛岡:死滅枠(2/4枠)懸念');
    }

    if (race.raceNumber >= 7) {
      if (popularity >= 6 && popularity <= 10) {
        potential += 25; tags.push('盛岡後半:波乱警戒(大穴)');
      }
      
      // 1200m戦の上級クラス（後半戦）における上がりタイム要求
      if (dist === 1200 && horse.pastRaces && horse.pastRaces.length > 0) {
        // 近走1200mで好走（末脚上位相当）しているか
        const pastFast = horse.pastRaces.some(pr => pr.distance <= 1400 && pr.result <= 3);
        if (pastFast) {
          potential += 20; tags.push('盛岡後半1200m:末脚要求適合');
        }
      }
    }
    
    // 盛岡特有の馬特性ボーナス
    // 1. 前走1着馬の連勝（勢い）ボーナス
    if (horse.pastRaces && horse.pastRaces.length > 0 && horse.pastRaces[0].result === 1) {
      potential += 25; tags.push('盛岡:前走1着(連勝期待)');
    }
    // 2. ベテラン高齢馬（9歳以上）の激走警戒
    if (horse.age >= 9) {
      potential += 20; tags.push('盛岡:ベテラン激走警戒');
    }
    // 3. 特効上位騎手とヒモ穴（若手・減量）の傾向
    if (jockey.includes('高松') || jockey.includes('高橋悠') || jockey.includes('山本聡')) {
      potential += 25; tags.push('盛岡:特効上位騎手(頭候補)');
    } else if (jockey.includes('塚本涼') || jockey.includes('坂井瑛') || /[☆△▲◇]/.test(jockey)) {
      potential += 15; tags.push('盛岡:ヒモ穴警戒(減量/若手)');
    }
  }

  // ==========================================
  // GIS幾何学適性 - 枠順バイアス (盛岡・東京以外)
  // ==========================================
  if (trackName !== '盛岡' && trackName !== '東京' && race.venue !== '盛岡' && race.venue !== '東京') {
    if (frame <= 3) { potential += 15; tags.push('内枠最短経路'); }
    else if (frame >= (headCount - 1)) { potential += 10; tags.push('外枠被せなし'); }
  }

  // ==========================================
  // 血統・適性解析
  // ==========================================
  const dirtSires = ['ヘニーヒューズ', 'シニスターミニスター', 'ホッコータルマエ', 'パイロ', 'ドレフォン', 'マジェスティックウォリアー', 'ダノンレジェンド', 'コパノリッキー', 'フリオーソ'];
  const turfSires = ['ディープインパクト', 'ハーツクライ', 'キズナ', 'エピファネイア', 'モーリス', 'ロードカナロア', 'ドゥラメンテ'];

  if (race.surface === 'ダート') {
    if (dirtSires.some(s => bloodline.includes(s))) { potential += 25; tags.push('ダートエリート血統'); }
  } else {
    if (turfSires.some(s => bloodline.includes(s))) { potential += 25; tags.push('芝エリート血統'); }
  }

  // ==========================================
  // 競馬場別ロジック
  // ==========================================
  if (trackName === '笠松') {
    if (horse.transferFrom === 'JRA' && (horse.jraEarnings || 0) === 0) { potential -= 25; tags.push('JRA未収得賞金の罠'); }
    if (weight >= 510) { potential += 25; tags.push('絶対パワー'); }
    else if (weight <= 430) { potential -= 35; tags.push('足切り'); }
    if (dist === 800 && (condition === '重' || condition === '不良')) {
      if (frame >= 7) { potential += 30; tags.push('外枠絶対優位'); }
      if (frame === 1) { potential -= 40; tags.push('1枠死滅'); }
    }
    if (bloodline.includes('Roberto')) { potential += 15; tags.push('Roberto血統'); }
    if (jockey === '渡邊竜也') {
      if (popularity === 1 && headCount >= 10) { potential -= 30; }
      else if (5 <= frame && frame <= 8) { potential += 25; tags.push('渡邊中外枠エッジ'); }
    }
  } else if (trackName === '大井') {
    if (bloodline.includes('キングマンボ')) { potential += 20; tags.push('ベアリング効果抗力'); }
    if (condition === '良' && (bloodline.includes('イスラボニータ') || bloodline.includes('スクリーンヒーロー'))) {
      potential += 25; tags.push('良馬場芝適性');
    } else if ((condition === '重' || condition === '不良') && (bloodline.includes('ゴールドアリュール') || bloodline.includes('ドレフォン') || bloodline.includes('クロフネ'))) {
      potential += 30; tags.push('重馬場パワー型');
    }
    if (dist === 1600 && bloodline.includes('ヘニーヒューズ')) { potential += 45; tags.push('大井1600特注ヘニーヒューズ'); }
    const goldenCombos: Record<string, number> = { '佐々木洋一 × 矢野貴之': 40, '林正人 × 町田直希': 40, '荒山勝徳 × 笹川翼': 30 };
    if (goldenCombos[`${horse.trainer} × ${jockey}`]) { potential += goldenCombos[`${horse.trainer} × ${jockey}`]; tags.push('黄金コンビ'); }
  } else if (trackName === '川崎') {
    // 川崎実証分析：中枠（4枠・5枠）の圧倒的優位性
    if (frame === 4 || frame === 5) {
      potential += 30;
      tags.push('川崎:中枠無双(1着候補)');
    }
    // 川崎実証分析：極端な内枠・外枠の勝ちきれなさ
    if (frame === 1 || frame === 8) {
      potential -= 15;
      tags.push('川崎:1・8枠(頭は危険)');
    }

    // 川崎実証分析：騎手傾向（トップジョッキーと穴メーカー）
    const kawasakiElite = ['矢野貴', '笹川翼'];
    const kawasakiLeaders = ['町田直', '新原周', '野畑凌', '伊藤裕'];
    const kawasakiUpsets = ['古岡勇', '藤江渉'];

    if (kawasakiElite.some(j => jockey.includes(j))) {
      potential += 25;
      tags.push('川崎:トップジョッキー(軸信頼)');
    } else if (kawasakiLeaders.some(j => jockey.includes(j))) {
      potential += 15;
      tags.push('川崎:主力ジョッキー(好調)');
    }

    if (kawasakiUpsets.some(j => jockey.includes(j))) {
      potential += 20;
      tags.push('川崎:穴メーカー(一発警戒)');
    }

    // 川崎実証分析：特別・交流戦の遠征騎手（ルメール、御神本など）
    if (race.raceName?.match(/(交流|重賞|杯|記念|チャレンジ)/)) {
      if (jockey.match(/(ルメー|御神訓|川田|武豊|モレイラ|田山旺)/)) {
        potential += 30;
        tags.push('川崎:特別戦エリート騎手');
      }
    }

    // 川崎実証分析：馬の属性（血統・馬格・年齢）
    if (bloodline.includes('ミスターメロディ')) {
      potential += 35;
      tags.push('川崎:特注ミスターメロディ産駒');
    }
    if (weight >= 500) {
      potential += 20;
      tags.push('川崎:大型馬パワー');
    }
    if (gender === '牝') {
      potential += 10;
      tags.push('川崎:牝馬健闘傾向');
    }
    if (horse.age === 3 || horse.age === 4) {
      potential += 15;
      tags.push('川崎:3-4歳若駒エッジ');
    }

    // 川崎実証分析：展開・時間帯・距離バイアス
    if (race.raceNumber <= 6) {
      // 前半：スタミナ持久力勝負 ＆ 上位人気の堅実性
      if (popularity <= 2) {
        potential += 20;
        tags.push('川崎前半:上位人気信頼');
      }
      if (horse.style === '先行' || horse.style === '逃げ') {
        potential += 15;
        tags.push('川崎前半:先行押し切り期待');
      }
    } else {
      // 後半：鋭い末脚の要求 ＆ 伏兵の台頭
      if (horse.pastRaces && horse.pastRaces.some(pr => pr.result <= 3)) {
        potential += 15;
        tags.push('川崎後半:末脚キレ要求');
      }
      if (popularity >= 4 && popularity <= 7) {
        potential += 15;
        tags.push('川崎後半:中穴警戒');
      }
    }

    // 距離別展開ロジック
    if (dist <= 900) {
      potential += 25;
      tags.push('川崎900m:超スピード決着適性');
    } else if (dist >= 2000) {
      potential += 20;
      tags.push('川崎長距離:スタミナ・道中待機');
    }
  } else if (trackName === '門別') {
    const powerSires = ['パイロ', 'ホッコータルマエ', 'ルヴァンスレーヴ'];
    if (powerSires.some(s => bloodline.includes(s))) { potential += 35; tags.push('門別パワー血統'); }
    if (weightChange >= 5) { potential += 30; tags.push('成長曲線EVA'); }
    
    // 門別実証分析：牝馬の活躍傾向（上位独占事例あり）
    if (gender === '牝') {
      potential += 15;
      tags.push('門別:牝馬優勢');
    }
    
    // 門別実証分析：若い3歳馬による古馬撃破
    if (race.raceName?.includes('3歳以上') && horse.age === 3) {
      potential += 20;
      tags.push('門別:3歳馬古馬撃破');
    }
    
    // 門別実証分析：後半レースのベテラン・せん馬の底力
    if (race.raceNumber >= 8) {
      if (horse.age >= 6) {
        potential += 15;
        tags.push('門別後半:ベテラン底力');
      }
      if (gender === 'セン') {
        potential += 20;
        tags.push('門別後半:せん馬激走警戒');
      }
    }
    
    // 門別実証分析：先行力重視（上がり最速よりポジション）
    if (horse.style === '逃げ' || horse.style === '先行') {
      potential += 20;
      tags.push('門別:先行力優位');
    }
    
    // 門別実証分析：騎手傾向（固め打ちと安定感）
    const monbetsuElite = ['小野楓', '阿部龍', '落合玄', '桑村真'];
    const monbetsuStable = ['服部茂', '岩橋勇'];
    
    if (monbetsuElite.some(j => jockey.includes(j))) {
      potential += 25;
      tags.push('門別:トップジョッキー(頭候補)');
    } else if (monbetsuStable.some(j => jockey.includes(j))) {
      potential += 15;
      tags.push('門別:安定ジョッキー(ヒモ候補)');
    }
    
    // 減量騎手（▲△など）による波乱と好走
    if (/[▲△☆★◇]/.test(jockey)) {
      potential += 20;
      tags.push('門別:減量騎手(波乱警戒)');
    }
    
    // 門別実証分析：枠順バイアス（中〜外枠優勢、4枠苦戦）
    if (frame === 6 || frame === 7) {
      potential += 25;
      tags.push('門別:6-7枠(1着有力)');
    } else if (frame === 5) {
      potential += 20;
      tags.push('門別:5枠(2着期待)');
    } else if (frame === 8) {
      potential += 20;
      tags.push('門別:8枠(ヒモ席巻)');
    } else if (frame === 4) {
      potential -= 20;
      tags.push('門別:4枠(最苦戦傾向)');
    }
  }

  // ==========================================
  // 【新設】京都競馬場 馬体重変動・成長バイアス解析
  // ==========================================
  if (trackName === '京都' || race.venue === '京都') {
    // ① 極限の絞り込み（-10kg〜-24kg）：勝負気配MAX
    if (weightChange <= -10 && weightChange >= -24) {
      potential += 35; // 一般の絞り込み加算に加え、京都専用の特大ブースト
      tags.push('京都:極限の仕上げ(激走フラグ)');
    } else if (weightChange < -25) {
      potential -= 25;
      tags.push('⚠️京都:過剰な馬体減(消耗懸念)');
    }

    // ② 成長と立て直し（3歳以下 +10kg〜+14kg）
    if (age <= 3 && weightChange >= 10 && weightChange <= 14) {
      potential += 30;
      tags.push('京都:若駒成長シナジー(大幅増)');
    } else if (weightChange > 16) {
      potential -= 25;
      tags.push('⚠️京都:過剰な馬体増(調整不足)');
    }

    // ③ 特殊馬具（ブリンカー）：京都一変トリガー
    if (horse.useBlinkers) {
      potential += 25;
      tags.push('京都:ブリンカー着用(一変トリガー)');
    }

    // ④ 血統バイアス（種牡馬適性）
    const sire = horse.sire || '';
    if (race.surface === 'ダート') {
      if (sire.includes('ルヴァンスレーヴ')) {
        potential += 40;
        tags.push('京都ダート:ルヴァンスレーヴ産駒(特注)');
      } else if (sire.includes('ドレフォン') || sire.includes('シニスターミニスター')) {
        potential += 30;
        tags.push('京都ダート:パワー血統(爆発期待)');
      }
    } else if (race.surface === '芝') {
      if (sire.includes('エピファネイア')) {
        potential -= 15; // 1着候補としては割り引き
        tags.push('京都芝:エピファネイア(ヒモ特化)');
      } else if (sire.includes('ゴールドシップ') && race.distance >= 2000) {
        potential += 25;
        tags.push('京都芝長距離:スタミナ血統(Gシップ)');
      }
    }
    if (sire.includes('コントレイル') || sire.includes('キズナ')) {
      potential += 25;
      tags.push('京都:万能・勝負強さ(上位血統)');
    }

    // ⑤ 厩舎・所属バイアス（栗東ホームアドバンテージ）
    const trainer = horse.trainer || '';
    if (horse.stableLocation === '栗東') {
      potential += 20;
      tags.push('🏰京都ホーム:栗東所属馬');
      
      // 京都特注エリート厩舎（ホットハンド実績）
      if (trainer.match(/(高野友和|田中克典|斉藤崇史|佐藤悠太)/)) {
        potential += 25;
        tags.push('🔥京都エリート厩舎(勝負気配)');
      }
    } else if (horse.stableLocation === '美浦') {
      potential -= 15;
      tags.push('⚠️京都アウェイ:美浦所属馬(割引)');
      if (popularity <= 3) {
        potential -= 15; // 危険な関東馬
        tags.push('⚠️危険な人気馬(アウェイ美浦)');
      }
    }

    // ⑥ 枠順バイアス（中〜外枠優勢）
    if (frame === 6) {
      potential += 35;
      tags.push('京都:6枠(1着最多・最強枠)');
    } else if (frame === 5) {
      potential += 30;
      tags.push('京都:5枠(安定感抜群・軸推奨)');
    } else if (frame === 3 || frame === 7) {
      potential += 20;
      tags.push('京都:3-7枠(上位進出期待)');
    } else if (frame === 2) {
      potential -= 25;
      tags.push('⚠️京都:2枠(最弱・割引対象)');
    } else if (frame === 1 || frame === 4) {
      potential -= 15;
      tags.push('⚠️京都:1-4枠(包まれ懸念)');
    }
    
    // 脚質×枠順シナジー（交差特徴量）
    const hStyle = horse.style || '中団';
    if ((hStyle === '逃げ' || hStyle === '先行') && (frame === 1 || frame === 2)) {
      if (popularity <= 3) {
        potential -= 20;
        tags.push('⚠️危険な人気馬(内枠×先行の罠)');
      }
    } else if ((hStyle === '中団' || hStyle === '後方') && (frame >= 5 && frame <= 7)) {
      potential += 25;
      tags.push('🚀京都シナジー(外枠×差し)');
    }
  } else if (trackName === '名古屋' || trackName === '弥富') {
    const topJockeys = ['岡部誠', '今井貴大', '大畑雅章', '加藤聡一', '丸野勝虎'];
    if (topJockeys.includes(jockey)) { potential += 15; tags.push('鞍上強化'); }
  } else if (trackName === '金沢') {
    // 1. JRA移籍・交流馬エッジ
    if (horse.transferFrom === 'JRA' || (horse.ownerType === 'JRA')) {
      potential += 30; tags.push('金沢:中央勢エッジ');
    }
    // 2. クラス・年齢別の馬格（馬体重）バイアス
    if (age <= 3) {
      if (weight <= 400) { potential += 10; tags.push('金沢3歳:小柄牝馬許容'); }
    } else {
      // 古馬戦（後半）は500kg超のパワー必須
      if (weight >= 500) { potential += 25; tags.push('金沢古馬:大型馬パワー優位'); }
      else if (weight <= 440) { potential -= 20; tags.push('金沢古馬:パワー不足懸念'); }
    }
    // 3. 後半レース（上級クラス）の末脚持続力
    if (race.raceNumber >= 9) {
      // 過去に速い上がり（ここでは実績で代用）がある馬を評価
      if (horse.pastRaces && horse.pastRaces.some(r => r.result <= 3)) {
        potential += 15; tags.push('金沢後半:末脚持続期待');
      }
    }
  } else if (trackName === '東京') {
    // 東京実証分析：物理・馬体パラメータ（フィジカル特徴量）
    // 1. 大幅な馬体重増減（±10kg以上）の明暗
    if (weightChange >= 10) {
      potential += 25;
      tags.push('東京:大幅プラス体重(成長ヤリ)');
    } else if (weightChange <= -10) {
      potential -= 30;
      tags.push('東京:大幅マイナス体重(消耗懸念)');
    }
    
    // 2. 馬格（500kg以上の大型馬）の物理的優位
    if (weight >= 500) {
      potential += 20;
      tags.push('東京:大型馬パワー優位');
    }
    
    // 3. 空間物理：外枠のスムーズな加速空間確保
    if (frame >= 6) {
      potential += 40;
      tags.push('東京:外枠(空間物理的優位・加速空間)');
    } else if (frame <= 3) {
      potential -= 30;
      tags.push('東京:内枠(密集・砂被りリスク)');
    }

    // 4. 性別・馬格バイアス：牡馬優勢と大型牝馬限定の活躍
    if (gender === '牝') {
      if (weight < 500) {
        potential -= 25;
        tags.push('東京:牝馬(パワー不足懸念)');
      } else {
        potential += 20;
        tags.push('東京:大型牝馬(物理的優位)');
      }
    } else {
      potential += 15;
      tags.push('東京:牡・セン(絶対的優位)');
    }

    // 5. 年齢・世代バイアス：4-5歳充実期と高齢馬のヒモ穴
    if (age === 4 || age === 5) {
      potential += 25;
      tags.push('東京:4-5歳充実期(頭候補)');
    } else if (age >= 6) {
      potential -= 10;
      tags.push('東京:高齢馬(3着ヒモ穴警戒)');
    }

    // 6. 騎手シナジー補正：役割別の特性評価
    if (jockey.includes('ルメー')) {
      potential += 45; // 勝ち切るシナジー最大（WIN5/単勝向け）
      tags.push('東京:ルメール(1着勝負強さ特大)');
    } else if (jockey.includes('戸崎')) {
      potential += 35; // 馬券圏内安定度最大（3連系軸向け）
      tags.push('東京:戸崎(2-3着安定感エリート)');
    } else if (jockey.match(/(岩田康|三浦|横山和)/)) {
      if (popularity >= 6) {
        potential += 30; // 穴馬激走シナジー（ヒモ穴向け）
        tags.push('東京:爆発力ジョッキー(穴警戒)');
      } else {
        potential += 15;
        tags.push('東京:爆発力ジョッキー');
      }
    }

    // 7. 厩舎・所属エリア補正：ホーム（美浦）の絶対的優位
    const trainerName = horse.trainer || '';
    if (horse.stableLocation === '美浦') {
      potential += 30;
      tags.push('東京:美浦所属(ホームアドバンテージ)');
      
      // 特定の好調厩舎
      if (trainerName.match(/(高木登|木村哲也|上原博之)/)) {
        potential += 20;
        tags.push('東京:絶好調厩舎(美浦エリート)');
      }
    } else if (horse.stableLocation === '栗東') {
      // 栗東馬は基本マイナスだが、日曜後半・重賞のみ意地を見せる
      if (race.raceNumber >= 10 || race.raceName?.match(/(重賞|カップ|記念)/)) {
        potential += 15;
        tags.push('東京後半:栗東馬の意地');
      } else {
        tags.push('東京:遠征栗東馬(アウェイ不利)');
      }
    }

    // 8. 東京特注血統補正：コース性質に合致する血統ブースト
    const sire = horse.sire || '';
    if (race.surface === 'ダート') {
      // 米国系パワー型（東京ダート無双）
      if (sire.match(/(ヘニーヒューズ|ダノンレジェンド|シニスターミニスター|マインドユアビスケッツ|Into Mischief)/)) {
        potential += 40;
        tags.push('東京ダート:米国系パワー特注血統');
      }
    } else {
      // 王道瞬発力型（東京芝の直線勝負）
      if (sire.match(/(サートゥルナーリア|キタサンブラック|レイデオロ|キズナ)/)) {
        potential += 35;
        tags.push('東京芝:王道瞬発力血統');
      }
    }
    
    // 芝ダート不問・二刀流爆弾（穴の急先鋒）
    if (sire.includes('モズアスコット')) {
      potential += 35;
      tags.push('🔥二刀流爆弾(モズアスコット産駒)');
    }

    // 9. 市場心理・オッズ歪み補正：東京開催特有の人気バランス
    // ① 信頼の1番人気（1.7倍〜2.9倍）
    if (popularity === 1 && odds >= 1.7 && odds <= 2.9) {
      potential += 20;
      tags.push('東京:信頼の1番人気(期待値適合)');
    }
    
    // ② 中穴の勝ちきり（4〜6番人気、10〜30倍）
    if (popularity >= 4 && popularity <= 6 && odds >= 10 && odds <= 30) {
      potential += 25;
      tags.push('東京:中穴勝ちきり警戒(過小評価)');
    }
    
    // ③ 大穴の激走（10番人気以下、50倍以上）
    if (popularity >= 10 && odds >= 50) {
      potential += 35;
      tags.push('東京:オッズ偏差値特大(爆穴ポテンシャル)');
    }

    // 10. 前走着差バイアス：二極化解析（王道 vs 一変）
    if (horse.pastRaces && horse.pastRaces.length > 0) {
      const lastRace = horse.pastRaces[0];
      const tDiff = lastRace.timeDiff ?? 9.9;
      
      // ① 王道の信頼：上位人気且つ前走1秒未満の惜敗
      if (popularity <= 3 && tDiff < 1.0) {
        potential += 25;
        tags.push('東京:王道パターン(前走僅差)');
      }
      
      // ② 一変の爆発：前走1秒以上の大敗 ＋ 変わり身のトリガー
      if (tDiff >= 1.0 && (horse.useBlinkers || frame >= 6 || weightChange >= 10)) {
        potential += 30;
        tags.push('東京:一変パターン(前走大敗×トリガー)');
      }

      // 11. 条件変更・隠れた適性の開花（一変の急先鋒）
      // ① 芝⇔ダート替わり
      if (lastRace.surface !== race.surface) {
        potential += 45;
        tags.push('🚀東京:二刀流替わり(一変警戒)');
      }
      // ② 距離変更（大幅な距離短縮・延長）
      if (Math.abs(lastRace.distance - race.distance) >= 200) {
        potential += 25;
        tags.push('🚀東京:距離変更(追走負荷一変)');
      }
      // ③ 東京直線：末脚性能の再評価（上がり3F）
      if (lastRace.last3fTime) {
        const l3f = parseFloat(lastRace.last3fTime);
        if (l3f <= 34.5 && race.surface === '芝') {
          potential += 25;
          tags.push('東京芝:高速末脚実績あり');
        } else if (l3f <= 36.5 && race.surface === 'ダート') {
          potential += 25;
          tags.push('東京ダート:鋭い末脚実績');
        }
      }
    }

    // 12. 馬場状態適応力（良馬場スペシャリスト）
    if (condition === '良') {
      const ryoResults = horse.pastRaces?.filter(pr => pr.condition === '良' && pr.result <= 3).length || 0;
      if (ryoResults >= 2) {
        potential += 20;
        tags.push('☀️良馬場実績(高速決着適応)');
      }
    }

    // 13. 東京展開・脚質バイアス：芝の差し vs ダートの先行
    if (race.surface === '芝') {
      if (horse.style === '中団' || horse.style === '後方' || horse.style === '追込') {
        potential += 30;
        tags.push('東京芝:差し・追込優位(直線末脚)');
        // 後半レース（上級条件）ではさらに差しが強調
        if (race.raceNumber >= 7) {
          potential += 15;
          tags.push('東京後半芝:差し加速バイアス');
        }
      } else if (horse.style === '逃げ') {
        potential -= 25;
        tags.push('東京芝:逃げ馬(標的・失速リスク)');
      }
    } else {
      // ダート：先行〜中団のパワー押し切り
      if (horse.style === '先行' || horse.style === '好位' || horse.style === '中団') {
        potential += 25;
        tags.push('東京ダート:好位〜中団(パワー押し切り)');
      }
      // 前半のダート戦のみ前残り警戒
      if (race.raceNumber <= 6 && horse.style === '逃げ') {
        potential += 20;
        tags.push('東京前半ダート:前残り・先行警戒');
      }
    }
  }

  // ---------------------------------------------------
  // 年齢・クラス・人気・上がりタイムの共通バイアス（前半/後半）
  // ---------------------------------------------------
  // レースフェーズ解析（前半:1-6R vs 後半:7-12R）
  // ---------------------------------------------------
  if (race.raceNumber <= 6) {
    // 前半：差し・追い込み展開利 ＆ 中穴（7-8人気）の台頭
    if (horse.style === '中団' || horse.style === '後方') {
      potential += 20;
      tags.push('前半:差し・追い込み波乱警戒');
    }
    if (popularity >= 6 && popularity <= 8) {
      potential += 25;
      tags.push('前半:中穴激走ゾーン');
    }
    // 1番人気の取りこぼし注意
    if (popularity === 1) {
      potential += 5;
      tags.push('前半:1番人気(単勝期待値低め)');
    }
  } else {
    // 後半：先行・好位押し切り ＆ 人気サイド vs 超大穴の二極化
    if (horse.style === '逃げ' || horse.style === '先行' || horse.style === '好位') {
      potential += 25;
      tags.push('後半:先行・好位実力押し切り');
    }
    // 1番人気の信頼度アップ
    if (popularity === 1) {
      potential += 30;
      tags.push('後半:1番人気(単勝期待値高)');
    }
    // 超大穴（11人気以降）の特大配当トリガー
    if (popularity >= 11) {
      potential += 20;
      tags.push('🔥後半:超大穴特大配当警戒');
    }
    // 後半は古馬（B級・A級）中心 → 高齢・大型馬に加点
    if (horse.age >= 5) {
      potential += 15;
      tags.push('後半:古馬年齢加点');
    }
    if (weight >= 500) {
      potential += 20;
      tags.push('後半:大型馬パワー加点');
    }
  }

  // ---------------------------------------------------
  // 上位3頭枠順バイアス（実績分析に基づく固定加点）
  // ---------------------------------------------------
  if (frame === 6 || frame === 7) {
    potential += 15; tags.push('枠:6-7上位優位');
  } else if (frame === 5) {
    potential += 10; tags.push('枠:5上位候補');
  } else if (frame === 8) {
    potential += 12; tags.push('枠:8ヒモ期待');
  } else if (frame === 4) {
    potential -= 8; tags.push('枠:4苦戦');
  }

  // 動的学習パッチの適用
  for (const patch of learningPatches) {
    if (!patch.active) continue;
    if (patch.track && patch.track !== trackName) continue;
    if (patch.condition && patch.condition !== condition) continue;
    for (const adj of patch.adjustments) {
      const field = adj.field as keyof Horse;
      const val = horse[field];
      let applies = false;
      if (typeof val === 'number') {
        if (adj.operator === '>=' && val >= Number(adj.value)) applies = true;
        else if (adj.operator === '<=' && val <= Number(adj.value)) applies = true;
        else if (adj.operator === '==' && val === Number(adj.value)) applies = true;
      } else if (typeof val === 'string' && typeof adj.value === 'string') {
        if (adj.operator === 'includes' && val.includes(adj.value)) applies = true;
        else if (adj.operator === '==' && val === adj.value) applies = true;
      }
      if (applies) { potential += adj.scoreAdjust; tags.push(`学習パッチ(${patch.version})`); }
    }
  }

  // ==========================================
  // 【新設】オッズ偏差値 (Odds Deviation) システム
  // ==========================================
  const impliedProb = 1.0 / (odds || 999.9);
  // AI算出勝率（暫定評価値を0-1スケールに近似：500点を50%勝率と仮定）
  const aiWinProb = Math.min(potential / 1000.0, 1.0);
  const oddsDeviation = aiWinProb - impliedProb;

  // ① 過小評価（不当穴馬）の検知と爆発的ブースト
  if (oddsDeviation >= 0.05) { // 期待値が5%以上プラス乖離
    const deviationBonus = Math.floor(oddsDeviation * 250); // 乖離幅に応じた加点
    potential += deviationBonus;
    tags.push(`💎期待値乖離(+${(oddsDeviation * 100).toFixed(1)}%)`);
    
    // 強力なトリガー（ブリンカー・激絞り）とのシナジー
    const hasSynergyTrigger = tags.some(t => t.match(/(ブリンカー|極限の仕上げ|一変トリガー|激走フラグ)/));
    if (hasSynergyTrigger) {
      potential += 45;
      tags.push('🚀期待値シナジー(歪み×一変トリガー)');
    }
  }

  // ② 危険な過剰人気馬（過大評価）の割引
  if (oddsDeviation <= -0.15) { // 期待値が15%以上マイナス乖離
    potential -= 35;
    tags.push('⚠️期待値マイナス乖離(過剰人気)');
    if (odds < 2.5) {
      potential -= 25; // 人気馬の皮を被った伏兵（AI視点）を排除
      tags.push('⚠️危険な過剰人気馬');
    }
  }

  // ==========================================
  // 【新設】3連系特化型「闇の期待値 (Darkness)」解析
  // ==========================================
  // WIN5向け(potential)は物理・シナジー重視、3連系向け(darkness)はオッズの歪み・人気逆数を重視
  let distortionBoost = 1.0;
  
  // オッズ偏差値による過小評価ブースト
  const currentOddsSS = horse.oddsStandardScore || 50;
  if (currentOddsSS <= 35) {
    distortionBoost += 0.4;
    tags.push('💎3連系:オッズ偏差値ブースト');
  }
  
  // 人気の逆数的な設計：人気がないほどスコアが加速
  if (popularity >= 10) {
    distortionBoost += (popularity - 9) * 0.15;
    tags.push('🌌人気逆数加速(爆穴補正)');
  }

  // 斤量比率（14%超）によるヒモ穴ブースト
  if (jockWeightRatio >= 14.0) {
    distortionBoost += 0.6;
    tags.push('💎3連系:高負荷激走ブースト');
  }

  // 軽量馬（54kg以下）によるヒモ穴ブースト
  if (kinryo <= 54) {
    distortionBoost += 0.4;
    tags.push('💎3連系:軽量激走ブースト');
  }

  // 隠れた実力馬（近走大敗だが5走以内実績あり）ブースト
  const lastTDiff = (horse.pastRaces && horse.pastRaces[0]) ? (horse.pastRaces[0].timeDiff ?? 0) : 0;
  if (lastTDiff >= 3.0 && horse.pastRaces && horse.pastRaces.slice(1, 5).some(pr => pr.result <= 3)) {
    distortionBoost += 0.5;
    tags.push('💎3連系:隠れた実力激走ブースト');
  }

  // タイム異常値（着順大敗・タイム僅差）ブースト
  if (horse.pastRaces && horse.pastRaces.find(pr => pr.result >= 8 && pr.timeDiff !== undefined && pr.timeDiff <= 0.5)) {
    distortionBoost += 0.6;
    tags.push('💎3連系:タイム異常値ブースト');
  }

  // 京都芝×エピファネイア（ヒモ穴特化）
  if (trackName === '京都' && race.surface === '芝' && horse.sire?.includes('エピファネイア')) {
    distortionBoost += 0.4;
    tags.push('💎3連系:エピファネイア適性ブースト');
  }

  const darkness = (potential / 100) * Math.pow(odds, 1.1) * distortionBoost;

  return {
    horseId: horse.id, horseName: horse.name, horseNumber: horse.number,
    potential: Math.round(potential * 10) / 10,
    darkness: Math.round(darkness * 100) / 100,
    evIndex: potential,
    aptitudeTags: tags,
    rank: 0,
  };
}

// ==========================================
// フォーメーション生成・その他 (既存)
// ==========================================
export function generateFormation(predictions: Prediction[], raceType: Formation['type'] = 'trifecta'): Formation {
  const sortedByPotential = [...predictions].sort((a, b) => b.potential - a.potential);
  const top3 = sortedByPotential.slice(0, 3);
  const axisNos = top3.map(p => p.horseNumber);
  const others = predictions.filter(p => !axisNos.includes(p.horseNumber));
  const sortedByDarkness = [...others].sort((a, b) => b.darkness - a.darkness);
  const dark4 = sortedByDarkness.slice(0, 4);
  const darkNos = dark4.map(p => p.horseNumber);

  const col1 = axisNos;
  const col2 = axisNos;
  const col3 = [...new Set([...axisNos, ...darkNos])].sort((a, b) => a - b);

  let tickets: number[][] = [];
  if (raceType === 'trifecta_exact') {
    for (const first of col1) {
      for (const second of col2) {
        if (first === second) continue;
        for (const third of col3) {
          if (first === third || second === third) continue;
          tickets.push([first, second, third]);
        }
      }
    }
  } else {
    const ticketSet = new Set<string>();
    combinations(axisNos, 3).forEach(c => ticketSet.add(c.sort((a,b)=>a-b).join('-')));
    combinations(axisNos, 2).forEach(p => darkNos.forEach(d => ticketSet.add([...p, d].sort((a,b)=>a-b).join('-'))));
    tickets = Array.from(ticketSet).map(t => t.split('-').map(Number));
  }

  return { type: raceType, col1, col2, col3, tickets, totalPoints: tickets.length, axisHorses: axisNos, darkHorses: darkNos };
}

export function generateWin5Picks(races: Race[], allPredictions: Record<string, Prediction[]>): { raceId: string; picks: number[]; }[] {
  return races.map(race => ({ raceId: race.id, picks: (allPredictions[race.id] || []).sort((a, b) => b.evIndex - a.evIndex).slice(0, 3).map(p => p.horseNumber) }));
}

export function generateLearningPatch(race: Race, predictions: Prediction[], actualResult: { rank: number; horseNumber: number; }[], existingPatches: LearningPatch[]): LearningPatch | null {
  const adjustments: any[] = [];
  let learningTargetName = "";

  // 1〜3着馬をすべてチェックし、AIが低く評価していた馬から複合的に学習する
  const top3Results = actualResult.filter(r => r.rank <= 3);
  
  for (const result of top3Results) {
    const horse = race.horses.find(h => h.number === result.horseNumber);
    if (!horse) continue;
    
    const aiRank = predictions.findIndex(p => p.horseNumber === result.horseNumber) + 1;
    
    // AIが軽視していた（4位以下）のに好走した場合、その馬から反省点を見つける
    if (aiRank > 3) {
      if (!learningTargetName) learningTargetName = horse.name;

      // 馬体重バイアス
      if (horse.weight >= 480) adjustments.push({ field: 'weight', operator: '>=', value: 480, scoreAdjust: 10 });
      else if (horse.weight <= 440) adjustments.push({ field: 'weight', operator: '<=', value: 440, scoreAdjust: 10 });

      // 馬体重増減バイアス
      if (horse.weightChange >= 10) adjustments.push({ field: 'weightChange', operator: '>=', value: 10, scoreAdjust: 15 });
      else if (horse.weightChange <= -10) adjustments.push({ field: 'weightChange', operator: '<=', value: -10, scoreAdjust: 10 });

      // 枠順バイアス
      if (horse.frame <= 2) adjustments.push({ field: 'frame', operator: '<=', value: 2, scoreAdjust: 15 });
      else if (horse.frame >= 7) adjustments.push({ field: 'frame', operator: '>=', value: 7, scoreAdjust: 15 });

      // 年齢バイアス（ベテラン・若駒激走）
      if (horse.age >= 8) adjustments.push({ field: 'age', operator: '>=', value: 8, scoreAdjust: 20 });
      else if (horse.age === 3) adjustments.push({ field: 'age', operator: '==', value: 3, scoreAdjust: 15 });

      // 騎手・血統バイアス
      if (horse.jockey) adjustments.push({ field: 'jockey', operator: 'includes', value: horse.jockey.replace(/[☆△▲◇]/g, ''), scoreAdjust: 15 });
      if (horse.sire) adjustments.push({ field: 'sire', operator: 'includes', value: horse.sire, scoreAdjust: 15 });
    }
  }

  // 重複ルールの排除
  const uniqueAdjustments = adjustments.filter((adj, index, self) =>
    index === self.findIndex((t) => t.field === adj.field && t.value === adj.value)
  );

  if (uniqueAdjustments.length === 0) return null;

  return { 
    id: `patch_${Date.now()}`, 
    version: `v${existingPatches.length + 1}.1`, 
    date: new Date().toISOString(), 
    description: `${race.venue} - 好走馬(${learningTargetName}等)の特性学習`, 
    track: race.trackName, 
    condition: race.condition, 
    adjustments: uniqueAdjustments, 
    active: true 
  };
}

function combinations<T>(arr: T[], size: number): T[][] {
  if (size === 0) return [[]];
  if (arr.length < size) return [];
  const [first, ...rest] = arr;
  return [...combinations(rest, size - 1).map(combo => [first, ...combo]), ...combinations(rest, size)];
}

export function sortPredictions(predictions: Prediction[]): Prediction[] {
  return [...predictions].sort((a, b) => b.potential - a.potential || b.darkness - a.darkness || a.horseNumber - b.horseNumber).map((p, i) => ({ ...p, rank: i + 1 }));
}
