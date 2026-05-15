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
  const kinryo = horse.jockeyWeight || 55;
  const popularity = horse.popularity || 99;
  const jockey = horse.jockey || '';
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
  // 馬体重増減エントロピー解析
  // ==========================================
  if (weightChange >= 10 && weightChange <= 20) { potential += 20; tags.push('成長加速'); }
  else if (weightChange >= 22) { potential -= 15; tags.push('太目残り懸念'); }
  else if (weightChange <= -12) { potential -= 20; tags.push('究極仕上げ/疲弊'); }
  else if (-4 <= weightChange && weightChange <= 4) { potential += 10; tags.push('質量安定'); }

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
  // GIS幾何学適性 - 枠順バイアス (盛岡以外)
  // ==========================================
  if (trackName !== '盛岡' && race.venue !== '盛岡') {
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
  } else if (trackName === '名古屋' || trackName === '弥富') {
    const topJockeys = ['岡部誠', '今井貴大', '大畑雅章', '加藤聡一', '丸野勝虎'];
    if (topJockeys.includes(jockey)) { potential += 15; tags.push('鞍上強化'); }
  } else if (trackName === '金沢') {
    // 1. JRA移籍・交流馬エッジ
    if (horse.transferFrom === 'JRA' || (horse.ownerType === 'JRA')) {
      potential += 30; tags.push('金沢:中央勢エッジ');
    }
    // 2. クラス・年齢別の馬格（馬体重）バイアス
    const age = horse.age;
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
  }

  // ---------------------------------------------------
  // 年齢・クラス・人気・上がりタイムの共通バイアス（前半/後半）
  // ---------------------------------------------------
  if (race.raceNumber <= 6) {
    // 前半は1番人気が圧倒的に有利
    if (popularity === 1) {
      potential += 20;
      tags.push('前半:1番人気大加点');
    } else if (popularity >= 6) {
      potential -= 10;
      tags.push('前半:下位人気減点');
    } else {
      // 中位人気は軽く加点
      potential += 5;
      tags.push('前半:中位人気加点');
    }
    // 前半は3歳馬が中心 → 若齢馬は軽く加点
    if (horse.age <= 3) {
      potential += 5;
      tags.push('前半:3歳軽加点');
    }
    // 前半は人気が分散しやすい → トップ人気のボーナスは抑える
    if (popularity <= 2) {
      potential += 5;
      tags.push('前半:トップ人気軽加点');
    }
  } else {
    // 後半は古馬（B級・A級）中心 → 高齢・大型馬に加点
    if (horse.age >= 5) {
      potential += 15;
      tags.push('後半:古馬年齢加点');
    }
    if (weight >= 500) {
      potential += 20;
      tags.push('後半:大型馬パワー加点');
    }
    // 後半はトップ人気が結果に直結 → 強めのボーナス
    if (popularity <= 2) {
      potential += 25;
      tags.push('後半:トップ人気高加点');
    }
    // 後半で下位人気が勝つ傾向を反映
    if (race.raceNumber > 7 && popularity >= 6) {
      potential += 15;
      tags.push('後半:下位人気加点');
    }
    // 速い上がりタイムがある馬に追加ボーナス
    if (horse.pastRaces && horse.pastRaces.some(pr => pr.distance <= 1400 && pr.result <= 3)) {
      potential += 15;
      tags.push('後半:速い上がり期待');
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
  // 【新設】オッズの歪み（Odds Distortion）解析
  // ==========================================
  const odds = horse.odds || 10;

  // 1. 1番人気の過剰人気（不振リスク）
  if (popularity === 1) {
    if (odds < 2.0) {
      potential -= 15;
      tags.push('⚠️過剰人気警戒(期待値低)');
    } else if (odds < 3.5) {
      potential -= 5;
      tags.push('⚠️1番人気:取りこぼし注意');
    }
  }

  // 2. 過小評価馬（大穴）の激走ポテンシャル
  if (odds >= 50.0) {
    // 激走のトリガーとなる要因（血統、実績、先行力など）があれば大幅加点
    const hasTrigger = tags.some(t => t.match(/(血統|実績|先行|スピード|キレ|底力)/));
    if (hasTrigger) {
      potential += 25;
      tags.push('🔥歪み:過小評価(爆穴候補)');
    } else {
      potential += 10;
      tags.push('🔎歪み:ヒモ荒れ警戒');
    }
  }

  const darkness = (potential / 100) * Math.pow(odds, 1.1);

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
