import { Horse, Prediction, Race, LearningPatch, Formation, MasterData } from '../types';
import { calculateNARScore } from './engineNAR';

// モジュール共通のエリート騎手リスト
const ELITE_JOCKEYS = ["ルメール", "川田将雅", "武豊", "坂井瑠星", "戸崎圭太", "モレイラ", "レーン", "横山武史", "デムーロ", "松山弘平", "川田", "坂井", "戸崎", "笹川翼", "御神本訓", "吉村智洋", "渡邊竜也", "岡部誠"];

// ==========================================
// タイム文字列（コロン・ドット形式 "1:28.4" 等）を秒数（88.4）に安全変換するヘルパー
// ==========================================
function parseTimeToSeconds(timeStr: string | undefined): number {
  if (!timeStr) return 0;
  const str = timeStr.toString().trim();
  const parts = str.split(':');
  if (parts.length === 2) {
    const mins = parseFloat(parts[0]) || 0;
    const secs = parseFloat(parts[1]) || 0;
    return mins * 60 + secs;
  }
  return parseFloat(str) || 0;
}

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
  
  // 文字列置換によるスケール誤差を解消し、物理計算を秒数ベースで正しく行う
  let adjTime = parseTimeToSeconds(pastRace.time);
  if (adjTime === 0) return 0;

  // 1. WIND_VECTOR 補正（秒数ベースで0.3秒、0.2秒の風速補正が本来のスケールで機能）
  if (isHeadwind && windSpeed >= 4.0) {
    if (pastRace.corner4Position <= 4) {
      adjTime += 0.3; // 先行馬：空気抵抗増大（0.3秒遅延）
    } else {
      adjTime -= 0.2; // スリップストリーム効果（0.2秒短縮）
    }
  }

  // 2. TRACK_WIDTH_LOSS 補正
  const nPosition = pastRace.cornerOuterCount || 1;
  if (nPosition > 1) {
    adjTime -= (nPosition - 1) * 0.15; // 外を回った頭数に応じた距離ロス補正
  }

  // 3. POWER_STRIDE_DYNAMICS 補正
  const weight = horse.weight;
  if (trackCondition === '良') {
    if (weight < 480) {
      adjTime += 0.2; // パワー負け
    } else if (weight >= 500 && pastRace.otherVenueExp) {
      adjTime -= 0.3; // 大型馬パワーアドバンテージ
    }
  }

  // 4. DYNAMIC_BIAS_DETECTOR
  if (isInBiasActive) {
    if (horse.frame <= 3 && pastRace.cornerOuterCount === 1) {
      adjTime -= 0.4; // イン伸びバイアス
    }
  }

  // 基準タイムも秒数にパースして比較
  const baseTimeStr = pastRace.classBaseTime?.toString() || '';
  const classBaseTime = baseTimeStr ? parseTimeToSeconds(baseTimeStr) : adjTime + 0.5;

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
  // 地方競馬（NAR）の判定（変数名の衝突を避けるため直接判定）
  if (race.trackName && ['大井', '川崎', '船橋', '浦和', '盛岡', '水沢', '門別', '名古屋', '弥富', '笠松', '園田', '姫路', '高知', '佐賀', '金沢'].some(t => race.trackName!.includes(t))) {
    return calculateNARScore(horse, race, learningPatches, masterData);
  }

  const hm = masterData.horses?.[horse.name];
  const jm = masterData.jockeys?.[horse.jockey];

  // ==========================================
  // 【新設】④ プロフィール（血統・生産者）の自動補完ロジック
  // ==========================================
  let bloodline = horse.bloodline || '';
  let horseBreeder = horse.breeder || '';
  if (hm) {
    if (!bloodline && hm.sire) {
      bloodline = `${hm.sire} / ${hm.dam || 'Unknown'}`;
    }
    if (!horseBreeder && hm.breeder) {
      horseBreeder = hm.breeder;
    }
  }

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
  const headCount = race.headCount || 10;
  
  let potential = 500;
  let distortionBoost = 1.0;
  let isTargetYatomi = false;
  const tags: string[] = [];

  // ==========================================
  // 【新設】◎ データ・ドリブン・コア（最適化ロジック）
  // 機械学習の結果から導き出された最も重要な「物理・人間」要素を最優先評価
  // ==========================================
  
  // 【追加】オッズの歪み（期待値）ロジック＆PCI（ペースチェンジインデックス）分析
  const prevRaceData = horse.pastRaces && horse.pastRaces.length > 0 ? horse.pastRaces[0] : undefined;
  
  if (odds >= 15.0) {
    if (prevRaceData) {
      if (prevRaceData.isStumbled || prevRaceData.cornerOuterCount >= 4) {
        potential += 35;
        tags.push("💰 期待値爆発: 前走物理的不利(度外視) × 大穴オッズ");
      }
      if (prevRaceData.halonPace) {
        const paceParts = prevRaceData.halonPace.split('-');
        if (paceParts.length === 2) {
          const front3f = parseFloat(paceParts[0]);
          const back3f = parseFloat(paceParts[1]);
          if (front3f < back3f - 1.5 && (horse.style === '差し' || horse.style === '追込')) {
            potential += 30;
            tags.push("💰 期待値爆発: 前走ハイペース被害の差し馬 × 大穴");
          }
        }
      }
    }
  } else if (odds <= 2.5 && popularity === 1) {
    if (weight > 0) {
      const kinryoWeightRatio = (kinryo / weight) * 100;
      if (kinryoWeightRatio >= 12.0) {
        potential -= 40;
        tags.push("⚠️ 過剰人気トラップ: 1番人気 × 物理的過負荷(斤量比12%超)");
      }
    }
    if (race.surface === 'ダート' && prevRaceData?.surface === '芝') {
      potential -= 30;
      tags.push("⚠️ 過剰人気トラップ: 1番人気 × 初ダートの不確実性");
    }
  }

  // ==========================================
  // 【追加】最強の複合ファクター（黄金コンボ）判定
  // ==========================================
  
  // コンボ1: 物理的絶対優位（小回り × 内枠 × 先行）
  const isTightCourse = ['浦和', '函館', '福島', '小倉', '高知'].some(t => trackName.includes(t));
  if (isTightCourse && frame <= 3 && (horse.style === '逃げ' || horse.style === '先行')) {
    potential += 45;
    tags.push("🔥 黄金コンボ: 小回り × 内枠 × 逃げ先行 (絶対物理優位)");
  }

  // コンボ2: 期待値の爆発（前走の不利 × 枠順の好転）
  if (prevRaceData && prevRaceData.cornerOuterCount >= 4 && frame <= 4) {
    potential += 40;
    tags.push("🔥 黄金コンボ: 前走大外ロス度外視 × 今回好枠替わり");
  }

  // コンボ3: 危険なトラップ（物理的過負荷 × タフな馬場）
  if (weight > 0 && ['重', '不良'].includes(condition)) {
    const kinryoWeightRatio = (kinryo / weight) * 100;
    if (kinryoWeightRatio >= 12.0) {
      potential -= 50;
      tags.push("❄️ 危険コンボ: 物理的過負荷(斤量比12%超) × タフな重馬場");
    }
  }

  // コンボ4: 陣営の勝負気配（エリート騎手への乗り替わり）
  const eliteJockeys = ['ルメール', '川田', '武豊', 'モレイラ', 'レーン', '御神本', '吉村', '赤岡'];
  if (prevRaceData && prevRaceData.jockey !== jockey && eliteJockeys.some(j => jockey.includes(j))) {
    potential += 35;
    tags.push("🔥 黄金コンボ: エリート騎手への勝負の乗り替わり");
  }

  // ==========================================
  // 【追加】JRA専用・最強の複合ファクター判定
  // ==========================================
  const isJraCourse = ['東京', '中山', '京都', '阪神', '中京', '新潟', '福島', '小倉', '函館', '札幌'].some(t => trackName.includes(t));

  if (isJraCourse) {
    // JRAコンボ1: 外厩帰り × トップ騎手 × 休み明け初戦
    if (horse.isAfterRest && eliteJockeys.some(j => jockey.includes(j))) {
      potential += 45;
      tags.push("🔥 JRA極秘: トップ外厩仕上げ × エリート騎手の勝負気配");
    }

    // JRAコンボ2: 馬場改修（仮柵移動） × 内枠 × 先行馬
    if (race.temporaryFencePosition && race.temporaryFencePosition !== 'A' && frame <= 3 && (horse.style === '逃げ' || horse.style === '先行')) {
      potential += 40;
      tags.push("🔥 JRA極秘: 仮柵移動(新品のイン) × 内枠先行絶対優位");
    }

    // JRAコンボ3: 上がり3F最速実績 × 直線の長いコース
    const isLongStraight = ['東京', '新潟', '阪神'].some(t => trackName.includes(t));
    if (isLongStraight && prevRaceData && prevRaceData.last3fTime) {
      const last3f = parseFloat(prevRaceData.last3fTime);
      if (!isNaN(last3f) && last3f <= 34.0) {
        potential += 35;
        tags.push("🔥 JRA極秘: 長い直線 × 鬼脚(上がり33秒台実績)");
      }
    }

    // JRAコンボ4: 前走ハイペース被害馬 × 今回の「逃げ馬不在」
    const frontRunnersCount = race.horses.filter(h => h.style === '逃げ').length;
    if (horse.style === '逃げ' && frontRunnersCount <= 1 && prevRaceData && prevRaceData.halonPace) {
      const paceParts = prevRaceData.halonPace.split('-');
      if (paceParts.length === 2) {
        const front3f = parseFloat(paceParts[0]);
        const back3f = parseFloat(paceParts[1]);
        if (front3f < back3f - 1.5) {
          potential += 35;
          tags.push("🔥 JRA極秘: 前走ハイペース被害馬の「単騎逃げ」濃厚");
        }
      }
    }

    // ==========================================
    // 【追加】JRAアドバンスド・プロトコル（極秘条件）
    // ==========================================

    // JRAアドバンスコンボ1: 中山マイスター（急坂適性血統×リピーター）
    if (trackName.includes('中山')) {
      const isPowerSire = ['ルーラーシップ', 'ドレフォン', 'ヘニーヒューズ', 'ステイゴールド', 'オルフェーヴル', 'キズナ'].some(s => (horse.sire || '').includes(s));
      const isRepeater = horse.pastRaces?.some(pr => pr.venue.includes('中山') && pr.result <= 3);
      if (isPowerSire && isRepeater) {
        potential += 40;
        tags.push("🔥 JRA極秘: 中山マイスター(リピーター×急坂適性血統)");
      }
    }

    // JRAアドバンスコンボ2: 夏の牝馬・滞在競馬
    const isLocalStayTrack = ['札幌', '函館', '小倉'].some(t => trackName.includes(t));
    const raceMonth = new Date(race.date).getMonth() + 1;
    if (isLocalStayTrack && (raceMonth >= 7 && raceMonth <= 9) && gender === '牝') {
      potential += 35;
      tags.push("🔥 JRA極秘: 夏の滞在競馬における牝馬の激走");
    }

    // JRAアドバンスコンボ3: 距離短縮ショック
    if (prevRaceData && prevRaceData.distance > dist && (horse.style === '差し' || horse.style === '追込')) {
      potential += 30;
      tags.push("🔥 JRA極秘: 距離短縮ショック(豊富なスタミナ×末脚爆発)");
    }

    // JRAアドバンスコンボ4: 初ダートの米国型血統覚醒
    if (race.surface === 'ダート' && prevRaceData?.surface === '芝') {
      const isUsDirtSire = ['シニスターミニスター', 'マジェスティックウォリアー', 'ヘニーヒューズ', 'パイロ', 'マクフィ', 'ダノンレジェンド', 'キンシャサノキセキ', 'エスポワールシチー'].some(s => (horse.sire || '').includes(s));
      if (isUsDirtSire) {
        potential += 50; // オッズが落ちやすいため期待値が跳ね上がる
        tags.push("🔥 JRA極秘: 初ダート×ダート特化血統(覚醒の可能性大)");
      }
    }

    // ==========================================
    // 【追加】東京マニアック特化プロトコル（ニッチな高回収率ロジック）
    // ==========================================
    if (trackName.includes('東京')) {
      // マニアック1: 東京ダート1600m専用「芝スタート×大外枠×米国血統」
      if (race.surface === 'ダート' && dist === 1600 && frame >= 6 && (horse.style === '逃げ' || horse.style === '先行')) {
        const isUsDirtSpeed = ['ヘニーヒューズ', 'ドレフォン', 'シニスターミニスター', 'マクフィ', 'アジアエクスプレス'].some(s => (horse.sire || '').includes(s));
        if (isUsDirtSpeed) {
          potential += 40;
          tags.push("🔥 東京D1600特注: 芝スタートを活かす外枠×米国スピード血統");
        }
      }

      // マニアック2: 雨の東京芝専用「不良馬場×内枠逃げ×重戦車血統」
      if (race.surface === '芝' && ['重', '不良'].includes(condition) && frame <= 2 && horse.style === '逃げ') {
        const isHeavyTank = ['バゴ', 'ハービンジャー', 'フランケル', 'ステイゴールド', 'オルフェーヴル', 'キズナ'].some(s => (horse.sire || '').includes(s));
        if (isHeavyTank) {
          potential += 45;
          tags.push("🔥 雨の東京特注: キレ味無効化の泥んこ馬場を逃げ粘る重戦車");
        }
      }

      // マニアック3: 左回りの天才（サウスポーの逆襲）
      // 前走が右回りで敗北（4着以下）し、今回左回りの東京に変わる馬を狙う
      if (prevRaceData && (prevRaceData.direction === '右' || ['中山', '阪神', '京都', '福島', '小倉', '函館', '札幌'].some(t => prevRaceData.venue?.includes(t)))) {
        if (prevRaceData.result >= 4) {
          potential += 35;
          tags.push("🔥 東京特注: 右回り惨敗からの左回り替わり(サウスポーの逆襲)");
        }
      }

      // マニアック4: ダービー＆JC専用「東京2400m×トニービン内包血統」
      if (dist === 2400 && race.surface === '芝') {
        const isTonyBinBlood = ['ハーツクライ', 'ルーラーシップ', 'ドゥラメンテ', 'ジャスタウェイ', 'スワーヴリチャード'].some(s => (horse.sire || '').includes(s) || (horse.bms || '').includes(s));
        if (isTonyBinBlood) {
          potential += 30;
          tags.push("🔥 東京2400特注: 過酷な直線を登り切る底力(トニービン内包)");
        }
      }
    }

    // ==========================================
    // 【追加】東京重賞特化プロトコル（絶対能力と適性の極み）
    // ==========================================
    const isTokyoStakes = trackName.includes('東京') && race.raceName && race.raceName.match(/G[1-3I-III]/i);
    
    if (isTokyoStakes) {
      // 東京重賞1: 東京の帝王（ルメール×ノーザン系馬主・有力血統）
      const isNorthernOwner = ['サンデー', 'キャロット', 'シルク', '社台', 'ダノン', 'サトノ', '金子'].some(o => (horse.owner || '').includes(o));
      if (jockey.includes('ルメール') && isNorthernOwner) {
        potential += 50;
        tags.push("👑 東京特注: 東京の帝王ルメール×ノーザン系勝負馬");
      }

      // 東京重賞2: 究極の瞬発力証明（上がり最速実績×距離延長）
      if (prevRaceData && prevRaceData.last3fTime) {
        const last3f = parseFloat(prevRaceData.last3fTime);
        if (!isNaN(last3f) && last3f <= 33.9 && dist > prevRaceData.distance) {
          potential += 40;
          tags.push("👑 東京特注: 距離延長でさらに活きる究極の瞬発力");
        }
      }

      // 東京重賞3: 格の違い（G1大敗からのG2/G3格下がり×差し馬）
      const isG2orG3 = race.raceName.match(/G[23]/i) || race.raceName.match(/G(II|III)/i);
      const isPrevG1 = prevRaceData?.raceClass?.match(/G[1I]/i) || prevRaceData?.raceName?.match(/G[1I]/i);
      if (isG2orG3 && isPrevG1 && (horse.style === '差し' || horse.style === '追込')) {
        potential += 45;
        tags.push("👑 東京特注: G1揉まれ経験馬の格下がり(展開不問の差し)");
      }

      // 東京重賞4: 外枠のクリーンラン（多頭数×外枠×王道血統）
      if (headCount >= 14 && frame >= 6) {
        const isRoyalSire = ['キタサンブラック', 'エピファネイア', 'ロードカナロア', 'ディープインパクト', 'スワーヴリチャード', 'ドゥラメンテ', 'モーリス'].some(s => (horse.sire || '').includes(s));
        if (isRoyalSire) {
          potential += 35;
          tags.push("👑 東京特注: 多頭数外枠のクリーンラン(王道血統)");
        }
      }
    }

    // ==========================================
    // 【追加】阪神マニアック特化プロトコル（ニッチな高回収率ロジック）
    // ==========================================
    if (trackName.includes('阪神')) {
      // マニアック1: 阪神ダート1400m専用「芝スタート×外枠×芝用スピード血統」
      if (race.surface === 'ダート' && dist === 1400 && frame >= 6) {
        const isTurfSpeed = ['ロードカナロア', 'キンシャサノキセキ', 'ダイワメジャー', 'ミッキーアイル', 'イスラボニータ'].some(s => (horse.sire || '').includes(s));
        if (isTurfSpeed) {
          potential += 40;
          tags.push("🔥 阪神D1400特注: 芝スタートを活かす外枠×芝用スピード血統");
        }
      }

      // マニアック2: 京都との真逆適性「平坦負けからの急坂替わり（パワーの逆襲）」
      if (prevRaceData && prevRaceData.venue?.includes('京都') && prevRaceData.result >= 4) {
        if (weight >= 500 || ['キズナ', 'エピファネイア', 'ルーラーシップ', 'ハービンジャー', 'オルフェーヴル'].some(s => (horse.sire || '').includes(s))) {
          potential += 45;
          tags.push("🔥 阪神特注: 前走京都(平坦)スピード負けからの急坂パワー替わり");
        }
      }

      // マニアック3: 阪神内回り専用「ロンスパ特化型血統（マクリの美学）」
      if (race.surface === '芝' && (dist === 2000 || dist === 2200)) {
        if (horse.style === '差し' || horse.style === '後方' || horse.style === '中団') {
          const isLongSpurt = ['ステイゴールド', 'オルフェーヴル', 'ゴールドシップ', 'エピファネイア', 'スクリーンヒーロー'].some(s => (horse.sire || '').includes(s));
          if (isLongSpurt) {
            potential += 35;
            tags.push("🔥 阪神内回り特注: 3コーナーからマクり上げるロンスパ血統");
          }
        }
      }

      // マニアック4: 阪神外回り1600m専用「距離短縮組（タフペース経験）の優位性」
      if (race.surface === '芝' && dist === 1600) {
        if (prevRaceData && prevRaceData.distance <= 1400 && prevRaceData.last3fTime) {
          const prevLast3f = parseFloat(prevRaceData.last3fTime);
          if (!isNaN(prevLast3f) && prevLast3f <= 34.5) {
            potential += 35;
            tags.push("🔥 阪神外回り特注: ハイペース経験(距離短縮)のタフネスと末脚");
          }
        }
      }
    }

    // ==========================================
    // 【追加】函館マニアック特化プロトコル（ニッチな高回収率ロジック）
    // ==========================================
    if (trackName.includes('函館')) {
      // マニアック1: 100%洋芝専用機「欧州型重戦車ブラッドの覚醒」
      if (race.surface === '芝') {
        const isEuroPower = ['ハービンジャー', 'バゴ', 'フランケル', 'キングカメハメハ', 'ルーラーシップ', 'ワークフォース', 'ノヴェリスト'].some(s => (horse.sire || '').includes(s));
        if (isEuroPower) {
          potential += 40;
          tags.push("🔥 函館芝特注: 時計のかかる重厚な洋芝で覚醒する欧州型パワー血統");
        }
      }

      // マニアック2: 函館ダート1000m専用「最内枠のロケットスタート」
      if (race.surface === 'ダート' && dist === 1000 && frame <= 2 && (horse.style === '逃げ' || horse.style === '先行')) {
        potential += 45;
        tags.push("🔥 函館D1000特注: 最初のコーナーまでの短さを活かす最内枠ロケットスタート");
      }

      // マニアック3: 滞在競馬の恩恵「夏は牝馬（ストレスフリー理論）」
      if (gender === '牝') {
        potential += 20;
        tags.push("🔥 函館特注: 長距離輸送のストレスがない滞在競馬で躍動する牝馬");
      }

      // マニアック4: 洋芝リンク理論「本州惨敗からの札幌・函館リンク」
      if (prevRaceData && !prevRaceData.venue?.match(/(函館|札幌)/) && prevRaceData.result >= 4) {
        const hasHokkaidoRecord = horse.pastRaces?.some(pr => pr.venue?.match(/(函館|札幌)/) && pr.result <= 3);
        if (hasHokkaidoRecord) {
          potential += 45;
          tags.push("🔥 函館特注: 本州惨敗で人気落ちからの洋芝(北海道)適性大爆発");
        }
      }
    }

    // ==========================================
    // 【追加】新潟マニアック特化プロトコル（ニッチな高回収率ロジック）
    // ==========================================
    if (trackName.includes('新潟')) {
      // マニアック1: 新潟千直（芝1000m）専用「大外枠の絶対神」
      if (race.surface === '芝' && dist === 1000) {
        if (frame >= 7) {
          potential += 50;
          tags.push("🔥 新潟千直特注: 荒れていない外ラチ沿いを走れる大外枠の絶対神");
        } else if (frame <= 2) {
          potential -= 30; // 内枠は圧倒的不利
        }
      }

      // マニアック2: 日本最長659mの直線「究極の上がり最速・大外一気」
      if (race.surface === '芝' && dist > 1400) {
        if (horse.style === '差し' || horse.style === '追込') {
          if (prevRaceData && prevRaceData.last3fTime) {
            const prevLast3f = parseFloat(prevRaceData.last3fTime);
            if (!isNaN(prevLast3f) && prevLast3f <= 33.5) {
              potential += 40;
              tags.push("🔥 新潟外回り特注: 日本最長の直線を大外一気で突き抜ける鬼脚");
            }
          }
        }
      }

      // マニアック3: 平坦サウスポー「急坂右回りからの平坦左回り替わり」
      if (prevRaceData && prevRaceData.venue?.match(/(中山|阪神)/) && prevRaceData.result >= 4) {
        const hasFlatSouthpawRecord = horse.pastRaces?.some(pr => pr.venue?.match(/(新潟|中京|東京)/) && pr.result <= 3);
        if (hasFlatSouthpawRecord) {
          potential += 35;
          tags.push("🔥 新潟特注: 急坂右回り惨敗からの平坦左回り替わり(サウスポー)");
        }
      }

      // マニアック4: 新潟ダート1200m専用「テンの速さ至上主義（内枠逃げ）」
      if (race.surface === 'ダート' && dist === 1200) {
        if (frame <= 3 && horse.style === '逃げ') {
          potential += 40;
          tags.push("🔥 新潟D1200特注: キツいコーナーをロスなく回る内枠の逃げ馬");
        }
      }
    }

    // ==========================================
    // 【追加】福島マニアック特化プロトコル（ニッチな高回収率ロジック）
    // ==========================================
    if (trackName.includes('福島')) {
      // マニアック1: ステイゴールド系の庭「マクリの美学」
      if (race.surface === '芝' && (horse.style === '差し' || horse.style === '追込' || horse.style === '後方')) {
        const isStayGold = ['ステイゴールド', 'オルフェーヴル', 'ゴールドシップ', 'ナカヤマフェスタ', 'ドリームジャーニー'].some(s => (horse.sire || '').includes(s));
        if (isStayGold) {
          potential += 45;
          tags.push("🔥 福島芝特注: 小回りで長く良い脚を持続させるステイゴールド系(マクリ)");
        }
      }

      // マニアック2: 荒れ馬場の洋芝リンク「北海道実績馬の降臨」
      if (race.surface === '芝' && ['稍重', '重', '不良'].includes(condition)) {
        const hasHokkaidoRecord = horse.pastRaces?.some(pr => pr.venue?.match(/(函館|札幌)/) && pr.result <= 3);
        if (hasHokkaidoRecord) {
          potential += 35;
          tags.push("🔥 福島特注: 荒れて時計のかかる馬場で覚醒する洋芝(北海道)適性馬");
        }
      }

      // マニアック3: 福島ダート1150m専用「芝スタート×スピード絶対主義」
      if (race.surface === 'ダート' && dist === 1150) {
        if (frame >= 6 && horse.style === '逃げ') {
          potential += 40;
          tags.push("🔥 福島D1150特注: 芝スタートを活かしてハナを奪いきる外枠の逃げ馬");
        }
      }

      // マニアック4: 小回りの先行力「内枠・逃げ先行のインベタ」
      if (frame <= 3 && (horse.style === '逃げ' || horse.style === '先行')) {
        potential += 30;
        tags.push("🔥 福島特注: コーナーのキツい小回りをロスなく立ち回る内枠先行馬");
      }
    }

    // ==========================================
    // 【追加】宝塚記念（阪神2200m・グランプリ）特化プロトコル
    // ==========================================
    const isTakarazukaKinen = trackName.includes('阪神') && race.raceName && race.raceName.includes('宝塚記念');
    if (isTakarazukaKinen) {
      // 宝塚特注1: 梅雨の非根幹タフネス（ステイゴールド系・ロベルト系・欧州系 × 牝馬）
      const isToughSire = ['ステイゴールド', 'オルフェーヴル', 'ゴールドシップ', 'ナカヤマフェスタ', 'バゴ', 'ルーラーシップ', 'エピファネイア', 'スクリーンヒーロー', 'モーリス', 'ハービンジャー'].some(s => (horse.sire || '').includes(s));
      if (isToughSire) {
        potential += 40;
        tags.push("👑 宝塚特注: 梅雨の荒れ馬場に強いタフネス血統");
        if (gender === '牝') {
          potential += 20;
          tags.push("👑 宝塚特注: 荒れ馬場・非根幹距離で覚醒する牝馬 (+20)");
        }
      }

      // 宝塚特注2: グランプリ適性（阪神内回り・中山の好走実績）
      const hasGrandPrixExp = horse.pastRaces?.some(pr => 
        (pr.venue.includes('阪神') || pr.venue.includes('中山')) && 
        pr.distance >= 2000 && pr.result <= 3 && (pr.raceClass?.match(/G[12]/i) || pr.raceName?.match(/G[12]/i))
      );
      if (hasGrandPrixExp) {
        potential += 35;
        tags.push("👑 宝塚特注: 阪神・中山で証明済みの小回りグランプリ適性");
      }

      // 宝塚特注3: スタミナ証明（前走・天皇賞春組からの距離短縮）
      if (prevRaceData?.raceName?.includes('天皇賞') && prevRaceData?.distance >= 3000) {
        potential += 30;
        tags.push("👑 宝塚特注: 天皇賞(春)経由の絶対的スタミナ証明(距離短縮)");
      }

      // 宝塚特注4: 大外枠の悲劇（8枠ペナルティ）※極端な外枠は不利
      if (frame === 8) {
        potential -= 30;
        tags.push("⚠️ 宝塚危険: 過去データで圧倒的不利な8枠(外々を回されるロス)");
      }
    }

    // ==========================================
    // 【追加】阪神重賞特化プロトコル（外回りの末脚と内回りのパワー）
    // ==========================================
    const isHanshinStakes = trackName.includes('阪神') && race.raceName && race.raceName.match(/G[1-3I-III]/i);
    
    if (isHanshinStakes) {
      // 阪神重賞1: 川田将雅の庭（阪神重賞×川田×上位人気）
      if (jockey.includes('川田') && popularity <= 3) {
        potential += 40;
        tags.push("👑 阪神特注: 阪神重賞における川田将雅の鉄板騎乗");
      }

      // 阪神重賞2: 外回り（1600m・2400m）の鬼脚と王道血統（桜花賞・阪神JF等）
      if (dist === 1600 || dist === 2400) {
        const isHanshinOuterSire = ['ディープインパクト', 'キズナ', 'エピファネイア', 'ロードカナロア', 'ドゥラメンテ'].some(s => (horse.sire || '').includes(s));
        if (isHanshinOuterSire && prevRaceData && parseFloat(prevRaceData.last3fTime || '99') <= 34.0) {
          potential += 45;
          tags.push("👑 阪神特注: 外回りコース特有の究極の瞬発力と王道血統");
        }
      }

      // 阪神重賞3: 内回り（2000m・2200m）の先行力（大阪杯など）
      if (dist === 2000 || dist === 2200) {
        if ((horse.style === '逃げ' || horse.style === '先行') && frame <= 5) {
          potential += 35;
          tags.push("👑 阪神特注: ごまかしの利かない内回り重賞での内枠先行力");
        }
      }

      // 阪神重賞4: 急坂マイスター（阪神・中山での重賞実績）
      const hasHillExp = horse.pastRaces?.some(pr => 
        (pr.venue.includes('阪神') || pr.venue.includes('中山')) && 
        pr.result <= 3 && (pr.raceClass?.match(/G[1-3]/i) || pr.raceName?.match(/G[1-3I-III]/i))
      );
      if (hasHillExp) {
        potential += 30;
        tags.push("👑 阪神特注: ゴール前の急坂を苦にしないパワーと実績");
      }
    }

    // ==========================================
    // 【追加】中山重賞特化プロトコル（機動力と急坂パワーの極み）
    // ==========================================
    const isNakayamaStakes = trackName.includes('中山') && race.raceName && race.raceName.match(/G[1-3I-III]/i);
    
    if (isNakayamaStakes) {
      // 中山重賞1: 究極の小回りアドバンテージ（内枠×逃げ先行）
      if (frame <= 4 && (horse.style === '逃げ' || horse.style === '先行')) {
        potential += 35;
        tags.push("👑 中山特注: 短い直線と急坂を味方につける内枠先行絶対有利");
      }

      // 中山重賞2: ステイ・ロベルトの庭（急坂・小回り特化血統）
      const isNakayamaSire = ['ステイゴールド', 'オルフェーヴル', 'ゴールドシップ', 'スクリーンヒーロー', 'エピファネイア', 'モーリス', 'バゴ', 'ルーラーシップ'].some(s => (horse.sire || '').includes(s));
      if (isNakayamaSire) {
        potential += 40;
        tags.push("👑 中山特注: 中山重賞で無類の強さを誇るパワー＆タフネス血統");
      }

      // 中山重賞3: ローカル・小回り巧者の下剋上（ローカル競馬場での好走実績）
      // 福島・小倉などの小回りコースで勝てる馬は、コーナーを加速しながら回る「機動力（まくり）」がある
      const hasLocalExp = horse.pastRaces?.some(pr => 
        ['福島', '小倉', '函館', '札幌'].some(t => pr.venue.includes(t)) && pr.result <= 2
      );
      if (hasLocalExp && (horse.style === '先行' || horse.style === '差し')) {
        potential += 30; 
        tags.push("👑 中山特注: 厳しい小回りコースで培われた圧倒的『機動力』");
      }

      // 中山重賞4: 直線一気の罠回避（極端な後方待機馬のペナルティ）
      // 中山は直線が310mしかないため、後方からの直線一気は物理的にほぼ不可能
      if (horse.style === '追込' && !isNakayamaSire) {
        potential -= 35;
        tags.push("⚠️ 中山危険: 短い直線で届かない『追込馬』の物理的絶望（消し）");
      }
    }

    // ==========================================
    // 【追加】函館重賞特化プロトコル（100%洋芝と日本一短い直線の攻略）
    // ==========================================
    const isHakodateStakes = trackName.includes('函館') && race.raceName && race.raceName.match(/G[1-3I-III]/i);
    
    if (isHakodateStakes) {
      // 函館重賞1: 100%洋芝適性（欧州・パワー型血統）
      const isYoshibaSire = ['ハービンジャー', 'バゴ', 'ルーラーシップ', 'キングカメハメハ', 'クロフネ', 'ヘニーヒューズ', 'ステイゴールド', 'フランケル', 'Frankel', 'ロベルト'].some(s => (horse.sire || '').includes(s));
      if (isYoshibaSire) {
        potential += 40;
        tags.push("👑 函館特注: 重い洋芝をパワーでねじ伏せる欧州・タフネス血統");
      }

      // 函館重賞2: 日本一短い直線の絶対法則（逃げ・先行）
      if (horse.style === '逃げ' || horse.style === '先行') {
        potential += 35;
        tags.push("👑 函館特注: JRA最短の直線(262m)を活かす絶対的な前残り");
      }

      // 函館重賞3: 北海道マイスター（函館・札幌での好走実績）
      const hasHokkaidoExp = horse.pastRaces?.some(pr => 
        (pr.venue.includes('函館') || pr.venue.includes('札幌')) && pr.result <= 3
      );
      if (hasHokkaidoExp) {
        potential += 30;
        tags.push("👑 函館特注: 特殊な100%洋芝環境（北海道）での実績証明");
      }

      // 函館重賞4: 絶望の直線一気（追込馬ペナルティ）
      // 直線が262mしかないため、後方待機の馬はよほど展開が向かない限り届かない
      if (horse.style === '追込' && !isYoshibaSire) {
        potential -= 40;
        tags.push("⚠️ 函館危険: 日本一短い直線では物理的に届かない『追込馬』（消し）");
      }
    }

    // ==========================================
    // 【追加】小倉重賞特化プロトコル（超高速・平坦・小回りの攻略）
    // ==========================================
    const isKokuraStakes = trackName.includes('小倉') && race.raceName && race.raceName.match(/G[1-3I-III]/i);
    
    if (isKokuraStakes) {
      // 小倉重賞1: 超高速野芝の絶対スピード（スプリント・スピード血統）
      const isKokuraSpeedSire = ['ロードカナロア', 'ビッグアーサー', 'ミッキーアイル', 'ダイワメジャー', 'キンシャサノキセキ', 'ディープインパクト', 'サクラバクシンオー', 'ファインニードル', 'マクフィ'].some(s => (horse.sire || '').includes(s));
      if (isKokuraSpeedSire) {
        potential += 40;
        tags.push("👑 小倉特注: 超高速馬場に適合する絶対的なスピード血統");
      }

      // 小倉重賞2: 平坦・小回りの逃げ切り（テンの速さと内枠先行）
      if (frame <= 5 && (horse.style === '逃げ' || horse.style === '先行')) {
        potential += 35;
        tags.push("👑 小倉特注: 小回り＆平坦コースでの止まらない逃げ・先行");
      }

      // 小倉重賞3: 軽量馬の平坦コース無双（軽斤量の恩恵）
      // 小倉記念や北九州記念などハンデ戦が多い。平坦なため軽い馬がスイスイ走る
      if (kinryo <= 53 && horse.gender === '牝') {
        potential += 30;
        tags.push("👑 小倉特注: 坂のない平坦コースで躍動する軽斤量の牝馬");
      } else if (kinryo <= 54) {
        potential += 20;
        tags.push("👑 小倉特注: 平坦コースの軽斤量アドバンテージ");
      }

      // 小倉重賞4: 小倉巧者のリピーター（過去の小倉実績）
      const hasKokuraExp = horse.pastRaces?.some(pr => 
        pr.venue.includes('小倉') && pr.result <= 3
      );
      if (hasKokuraExp) {
        potential += 30;
        tags.push("👑 小倉特注: 独特の高速小回りコースに対する完全なコース適性");
      }
    }

    // ==========================================
    // 【追加】京都重賞特化プロトコル（淀の坂越えと超高速馬場の適性）
    // ==========================================
    const isKyotoStakes = trackName.includes('京都') && race.raceName && race.raceName.match(/G[1-3I-III]/i);
    
    if (isKyotoStakes) {
      // 京都重賞1: 淀の申し子（超高速馬場と下り坂に適合する王道血統）
      // ディープ系やハーツクライ系など、下り坂から惰性でキレる血統
      const isKyotoSire = ['ディープインパクト', 'キズナ', 'コントレイル', 'ハーツクライ', 'スワーヴリチャード', 'ダイワメジャー', 'エピファネイア', 'ジャスタウェイ'].some(s => (horse.sire || '').includes(s));
      if (isKyotoSire) {
        potential += 40;
        tags.push("👑 京都特注: 淀の軽い芝に完璧に適合する究極のスピード・キレ血統");
      }

      // 京都重賞2: 坂の下り適性（京都好走実績 ＋ 優れた上がりタイム）
      const hasKyotoAgility = horse.pastRaces?.some(pr => 
        pr.venue.includes('京都') && pr.result <= 3 && parseFloat(pr.last3fTime || '99') <= 34.5
      );
      if (hasKyotoAgility) {
        potential += 35;
        tags.push("👑 京都特注: 3コーナーの「淀の坂」を器用に下るバランスとコース実績");
      }

      // 京都重賞3: 長距離G1の絶対セオリー（天皇賞春・菊花賞の内枠ロスなし）
      if (dist >= 3000 && frame <= 4) {
        potential += 45;
        tags.push("👑 京都特注: 3000m超えの長距離戦における『内枠』の絶対的スタミナ温存有利");
      }

      // 京都重賞4: 外回りの究極の斬れ味（外回りコースの差し・追込）
      // 京都外回り（1600, 1800, 2200, 2400, 3000, 3200）は平坦な直線を長く使える
      const isOuterCourseDist = [1600, 1800, 2200, 2400, 3000, 3200].includes(dist);
      if (isOuterCourseDist && (horse.style === '差し' || horse.style === '追込') && isKyotoSire) {
        potential += 30;
        tags.push("👑 京都特注: 平坦な長い直線で爆発する『外回り特化の末脚』");
      }
    }

    // ==========================================
    // 【追加】新潟重賞特化プロトコル（日本一長い直線と千直の攻略）
    // ==========================================
    const isNiigataStakes = trackName.includes('新潟') && race.raceName && race.raceName.match(/G[1-3I-III]/i);
    
    if (isNiigataStakes) {
      // 新潟重賞1: 千直の絶対法則（1000m直線の大外枠）
      // アイビスサマーダッシュなど、千直はラチ沿いを走れる大外枠が圧倒的有利
      if (dist === 1000 && frame >= 7) {
        potential += 50;
        tags.push("👑 新潟特注: 千直(1000m)における大外枠(7〜8枠)の絶対的アドバンテージ");
      }

      // 新潟重賞2: 日本一長い直線の鬼脚（上がり33秒台前半の実績）
      // 外回り（1600m・2000m）は直線が659mあり、究極の瞬発力と持続力が問われる
      if ((dist === 1600 || dist === 2000) && prevRaceData && parseFloat(prevRaceData.last3fTime || '99') <= 33.5) {
        potential += 45;
        tags.push("👑 新潟特注: 日本一長い直線(659m)で爆発する究極の瞬発力(上がり33秒台前半)");
      }

      // 新潟重賞3: 平坦・長直線のスピード血統
      const isNiigataSire = ['ディープインパクト', 'キズナ', 'ハーツクライ', 'スワーヴリチャード', 'エピファネイア', 'ロードカナロア', 'リアルスティール', 'サトノダイヤモンド'].some(s => (horse.sire || '').includes(s));
      if (isNiigataSire && dist > 1000) {
        potential += 35;
        tags.push("👑 新潟特注: 長い直線と平坦コースに完璧に適合するスピード血統");
      }

      // 新潟重賞4: 新潟巧者（過去の新潟好走実績）
      const hasNiigataExp = horse.pastRaces?.some(pr => 
        pr.venue.includes('新潟') && pr.result <= 3
      );
      if (hasNiigataExp) {
        potential += 30;
        tags.push("👑 新潟特注: 独特の左回り超ロング直線に対するコース適性の証明");
      }
    }

    // ==========================================
    // 【追加】札幌重賞特化プロトコル（大回り・平坦の100%洋芝）
    // ==========================================
    const isSapporoStakes = trackName.includes('札幌') && race.raceName && race.raceName.match(/G[1-3I-III]/i);
    
    if (isSapporoStakes) {
      // 札幌重賞1: 100%洋芝適性（欧州・タフネス血統）
      const isYoshibaSire = ['ハービンジャー', 'バゴ', 'ルーラーシップ', 'キングカメハメハ', 'クロフネ', 'スクリーンヒーロー', 'ステイゴールド', 'ゴールドシップ', 'オルフェーヴル'].some(s => (horse.sire || '').includes(s));
      if (isYoshibaSire) {
        potential += 40;
        tags.push("👑 札幌特注: 力のいる洋芝をねじ伏せる欧州・タフネス血統");
      }

      // 札幌重賞2: 大回り・平坦コースの持続力（コーナーでの機動力）
      // 札幌は函館と違い、コーナーが大きくて緩やかなため、外から長く良い脚を使う「マクリ」や「差し」が決まりやすい
      if (horse.style === '差し' && isYoshibaSire) {
        potential += 35;
        tags.push("👑 札幌特注: 大きなコーナーで失速しない洋芝適性馬の長く良い脚（マクリ・差し）");
      } else if (horse.style === '先行') {
        potential += 20;
        tags.push("👑 札幌特注: 大回り平坦コースでしぶとく粘り込む先行力");
      }

      // 札幌重賞3: 北海道マイスター（函館・札幌での好走実績）
      const hasHokkaidoExp = horse.pastRaces?.some(pr => 
        (pr.venue.includes('函館') || pr.venue.includes('札幌')) && pr.result <= 3
      );
      if (hasHokkaidoExp) {
        potential += 30;
        tags.push("👑 札幌特注: 特殊な100%洋芝環境（北海道）に対する完全な適性証明");
      }

      // 札幌重賞4: スーパーG2の格の違い（札幌記念のG1実績馬）
      // 札幌記念(G2)は秋のG1を見据えた超一級馬が集まるため、過去にG1で5着以内の実績がある馬が地力の違いを見せる
      const isSapporoKinen = race.raceName.includes('札幌記念');
      const hasG1Class = horse.pastRaces?.some(pr => (pr.raceClass?.match(/G[1I]/i) || pr.raceName?.match(/G[1I]/i)) && pr.result <= 5);
      if (isSapporoKinen && hasG1Class) {
        potential += 45;
        tags.push("👑 札幌特注: スーパーG2(札幌記念)における『G1級』の絶対的な地力の違い");
      }
    }

    // ==========================================
    // 【追加】中京重賞特化プロトコル（左回りのタフな直線と内枠先行）
    // ==========================================
    const isChukyoStakes = trackName.includes('中京') && race.raceName && race.raceName.match(/G[1-3I-III]/i);
    
    if (isChukyoStakes) {
      // 中京重賞1: 魔の左回り・タフネス血統（坂と長い直線に耐えるパワー）
      const isChukyoSire = ['キングカメハメハ', 'ロードカナロア', 'エピファネイア', 'モーリス', 'ルーラーシップ', 'ハーツクライ', 'ドゥラメンテ'].some(s => (horse.sire || '').includes(s));
      if (isChukyoSire) {
        potential += 35;
        tags.push("👑 中京特注: 長い直線と急坂を耐え抜くタフなパワー系血統");
      }

      // 中京重賞2: 中京の絶対セオリー（内枠・先行有利）
      // 直線は長いが、馬場が渋ったりコーナーの形状上、内枠の逃げ先行が非常に残る
      if (frame <= 4 && (horse.style === '逃げ' || horse.style === '先行')) {
        potential += 40;
        tags.push("👑 中京特注: コース形状がもたらす『内枠×先行』の絶対的有利");
      }

      // 中京重賞3: 左回りマイスター（東京・中京・新潟の実績）
      const hasLeftTurnExp = horse.pastRaces?.some(pr => 
        (pr.venue.includes('東京') || pr.venue.includes('中京') || pr.venue.includes('新潟')) && pr.result <= 3
      );
      if (hasLeftTurnExp) {
        potential += 30;
        tags.push("👑 中京特注: ごまかしの利かない左回りコースの好走実績");
      }
    }

    // ==========================================
    // 【追加】福島重賞特化プロトコル（極限の小回りと機動力）
    // ==========================================
    const isFukushimaStakes = trackName.includes('福島') && race.raceName && race.raceName.match(/G[1-3I-III]/i);
    
    if (isFukushimaStakes) {
      // 福島重賞1: ローカル小回りの鬼（ステイゴールド・ロベルト系）
      const isFukushimaSire = ['ステイゴールド', 'オルフェーヴル', 'ゴールドシップ', 'スクリーンヒーロー', 'エピファネイア', 'ナカヤマフェスタ'].some(s => (horse.sire || '').includes(s));
      if (isFukushimaSire) {
        potential += 40;
        tags.push("👑 福島特注: 荒れた小回りを捲り切るローカル特化のタフネス血統");
      }

      // 福島重賞2: 直線292mの機動力（マクリ・先行）
      // 直線が極端に短いため、4コーナーで前列にいないと物理的に届かない
      if (horse.style === '逃げ' || horse.style === '先行') {
        potential += 35;
        tags.push("👑 福島特注: 直線292mの絶望を回避する先行力");
      }

      // 福島重賞3: 荒れるハンデ戦のセオリー（軽斤量）
      // 七夕賞や福島記念など、斤量が軽い逃げ馬が波乱を起こす
      if (kinryo <= 54) {
        potential += 30;
        tags.push("👑 福島特注: 波乱のハンデ戦における軽斤量アドバンテージ");
      }

      // 福島重賞4: 直線一気の完全否定（追込馬ペナルティ）
      if (horse.style === '追込') {
        potential -= 40;
        tags.push("⚠️ 福島危険: 短い直線とタイトなコーナーでは絶望的な『追込馬』（消し）");
      }
    }
  }

  // ==========================================
  // 【追加】阪神専用バイアス（ローカル学習結果の反映）
  // ==========================================
  if (trackName.includes('阪神')) {
    let hanshinScore = 0;
    const isHanshinSire = ['キズナ', 'ホッコータルマエ', 'ハーツクライ', 'マジェスティックウォリアー', 'シュヴァルグラン', 'モズアスコット', 'Essential Quality'].some(s => (horse.sire || '').includes(s));
    const isHanshinJockey = ['西村 淳也', '鮫島 克駿', '小牧 加矢太', '森 一馬', '上野 翔', '西塚 洸二', '太宰 啓介', '角田 大和', '高倉 稜', '菱田 裕二'].some(j => jockey.includes(j));

    if (weight >= 480) hanshinScore += 10;
    if (frame <= 2) hanshinScore += 15;
    if (isHanshinSire) hanshinScore += 15;
    if (isHanshinJockey) hanshinScore += 15;
    if (horse.age === 3) hanshinScore += 15;

    if (hanshinScore >= 25) {
      potential += hanshinScore;
      tags.push(`🔥 阪神特注馬: AI学習済み特化バイアス合致 (+${hanshinScore})`);
    }
  }

  // 1. 斤量体重比（kinryo_weight_ratio）の最適化
  if (weight > 0) {
    const kinryoWeightRatio = (kinryo / weight) * 100;
    if (kinryoWeightRatio < 11.5) {
      potential += 30;
      tags.push("👑 物理黄金比:負担極小・圧倒的パワーアドバンテージ");
    } else if (kinryoWeightRatio >= 12.5) {
      potential -= 30;
      tags.push("⚠️ 物理的過負荷:小柄馬の斤量負担ペナルティ");
    }
  }

  // 2. 馬格（馬体重ベース）の絶対評価
  if (weight >= 500) {
    potential += 15;
    tags.push("💪 大型馬パワーボーナス(500kg以上)");
  } else if (weight > 0 && weight <= 440) {
    potential -= 15;
    tags.push("⚠️ 小型馬パワー不足ペナルティ(440kg以下)");
  }

  // 3. エリート騎手への極大ブースト（騎手ファクター最大化）
  const cleanJockey = jockey.replace(/[▲△☆◇]/g, '').trim();
  const isEliteJockey = ELITE_JOCKEYS.some(ej => cleanJockey.includes(ej));
  if (isEliteJockey) {
    potential += 40;
    tags.push("👑 トップジョッキー絶対値ブースト(最重要人間ファクター)");
  }

  // ==========================================
  // 【新設】③ 馬体重の長期的トレンド（成長・本格化・激ヤセ）判定
  // ==========================================
  if (hm && hm.results && hm.results.length >= 3 && weight > 0) {
    // 過去3戦で馬体重データがあるものを抽出
    const recentWeights = hm.results
      .filter(r => r.weight && r.weight > 0)
      .slice(0, 3)
      .map(r => r.weight as number);
    
    if (recentWeights.length >= 2) {
      const avgRecentWeight = recentWeights.reduce((a, b) => a + b, 0) / recentWeights.length;
      const longTermDiff = weight - avgRecentWeight;

      if (age <= 4 && longTermDiff >= 10 && longTermDiff <= 25) {
        potential += 20;
        tags.push(`💪 成長期・本格化(長期馬体増 +${Math.round(longTermDiff)}kg)`);
      } else if (longTermDiff <= -15) {
        potential -= 25;
        tags.push(`⚠️ 大幅馬体減リスク(長期馬体減 ${Math.round(longTermDiff)}kg)`);
      }
    }
  }

  // ==========================================
  // 【新設】① 調教タイムの数値化スコアリング
  // ==========================================
  if (horse.trainingTime) {
    const timeStr = horse.trainingTime;
    const timeNumbers = timeStr
      .replace(/[\[\]\(\)（）]/g, ' ')
      .split(/[\s\- \t]/)
      .map(part => parseFloat(part.trim()))
      .filter(num => !isNaN(num) && num > 0 && num < 100);

    const isSlope = timeStr.includes("坂路") || timeStr.includes("坂");
    const isWood = timeStr.includes("ウッド") || timeStr.includes("南W") || timeStr.includes("Ｗ");

    if (isSlope && timeNumbers.length >= 2) {
      const overall = timeNumbers[0];
      const last1f = timeNumbers[timeNumbers.length - 1];
      if (overall <= 50.5 && last1f <= 11.8) {
        potential += 35;
        tags.push("🔥 坂路超抜時計(極上の仕上がり)");
      } else if (overall <= 52.5 && last1f <= 12.2) {
        potential += 20;
        tags.push("⚡ 坂路好時計(スピード十分)");
      } else if (overall <= 54.0 && last1f <= 12.5) {
        potential += 10;
        tags.push("📈 坂路順調(及第点の動き)");
      }
    } else if (isWood && timeNumbers.length >= 2) {
      const overall = timeNumbers[0];
      const last1f = timeNumbers[timeNumbers.length - 1];
      if (overall <= 64.5 && last1f <= 11.0) {
        potential += 35;
        tags.push("🔥 ウッド超抜時計(極限のキレ)");
      } else if (overall <= 66.5 && last1f <= 11.5) {
        potential += 20;
        tags.push("⚡ ウッド好調教(推進力十分)");
      } else if (overall <= 69.0 && last1f <= 12.0) {
        potential += 10;
        tags.push("📈 ウッド順調(推進力十分)");
      }
    }
  }

  // 調教評価印による補正
  if (horse.trainingRating) {
    const rating = horse.trainingRating.toUpperCase();
    if (rating === "S") {
      potential += 30;
      tags.push("🌟 調教S評価(超絶状態)");
    } else if (rating === "A") {
      potential += 20;
      tags.push("⭐ 調教A評価(好仕上がり)");
    } else if (rating === "B+") {
      potential += 10;
      tags.push("👍 調教B+評価(状態良好)");
    }
  }

  // ==========================================
  // 【新設】② 生産者（ブリーダー）のブランド評価
  // ==========================================
  if (horseBreeder) {
    const breederName = horseBreeder;
    const isGradeOrSpecial = race.raceName?.match(/(GⅠ|GⅡ|GⅢ|重賞|特別|ステークス|カップ)/);

    if (breederName.includes("ノーザンファーム")) {
      if (isGradeOrSpecial) {
        potential += 30;
        tags.push("👑 ノーザンファーム生産(大舞台エリート)");
      } else {
        potential += 15;
        tags.push("👑 ノーザンファーム生産(育成力抜群)");
      }
    } else if (
      breederName.includes("社台ファーム") || 
      breederName.includes("白老ファーム") || 
      breederName.includes("追分ファーム")
    ) {
      if (isGradeOrSpecial) {
        potential += 15;
        tags.push("🏰 社台グループ生産(高水準ブランド)");
      } else {
        potential += 8;
        tags.push("🏰 社台グループ生産(好気配)");
      }
    } else if (
      breederName.includes("ダーレー") || 
      breederName.includes("ヤナガワ牧場") || 
      breederName.includes("三嶋牧場") || 
      breederName.includes("グランド牧場") || 
      breederName.includes("ノースヒルズ") ||
      breederName.includes("下河辺牧場") ||
      breederName.includes("千代田牧場") ||
      breederName.includes("ケイアイファーム")
    ) {
      potential += 8;
      tags.push(`🐎 有名実力牧場生産(${breederName.replace(/牧場|ファーム/g, '')})`);
    }
  }

  // ==========================================
  // 【新設】③ 同騎手・乗り替わりの精査
  // ==========================================
  const cleanCurrentJockey = jockey.replace(/[▲△☆◇]/g, '').trim();
  const prevRace = horse.pastRaces && horse.pastRaces[0];
  const prevJockey = prevRace?.jockey || horse.prevJockey || '';
  const cleanPrevJockey = prevJockey.replace(/[▲△☆◇]/g, '').trim();

  if (cleanCurrentJockey && cleanPrevJockey) {
    if (cleanCurrentJockey === cleanPrevJockey) {
      potential += 15;
      tags.push("🤝 継続騎乗(人馬一体の絆)");
    } else {
      const isCurrentElite = ELITE_JOCKEYS.some(ej => cleanCurrentJockey.includes(ej));
      const isPrevElite = ELITE_JOCKEYS.some(ej => cleanPrevJockey.includes(ej));

      if (isCurrentElite && !isPrevElite) {
        potential += 25;
        tags.push("⚡ 鞍上強化：リーディングへの勝負乗り替え");
      } else if (!isCurrentElite && isPrevElite) {
        potential -= 10;
        tags.push("⚠️ 鞍上交代(リーディングから乗り替わり)");
      } else {
        tags.push("🏇 鞍上交代(新コンビ)");
      }
    }
  }

  // ==========================================
  // 【新設】J-① トラックバイアス物理判定（クッション値・含水率・仮柵位置）
  // ==========================================
  const temporaryFence = race.temporaryFencePosition || '';
  const cushion = race.cushionValue;
  const moisture = race.moistureContent;

  if (temporaryFence === 'C' || temporaryFence === 'D') {
    if (frame <= 3 && (horse.style === '逃げ' || horse.style === '先行' || horse.style === '好位')) {
      potential += 25;
      tags.push("🧬 仮柵移動バイアス適合(内有利)");
    }
  }

  if (race.surface === '芝') {
    if (cushion !== undefined && cushion < 8.0) {
      const softBlood = ['キズナ', 'エピファネイア', 'ハービンジャー', 'オルフェーヴル', 'ゴールドシップ', 'モーリス'];
      const hasSoftBlood = softBlood.some(sb => bloodline.includes(sb));
      if (hasSoftBlood) {
        potential += 15;
        tags.push(`☔ クッション値低馬場適合(${bloodline.split(' / ')[0]})`);
      }
    }
  } else if (race.surface === 'ダート') {
    if (moisture !== undefined && moisture >= 12.0) {
      if (horse.style === '逃げ' || horse.style === '先行') {
        potential += 20;
        tags.push("☔ 高含水率ダート: 前残りスピードバイアス適合");
      }
    }
  }

  // ==========================================
  // 【新設】J-② 前走物理的ロス（外回し・出遅れ）克服判定
  // ==========================================
  if (prevRace) {
    const wasOuterRun = prevRace.cornerOuterCount >= 4;
    const isCloseMatch = prevRace.timeDiff !== undefined && prevRace.timeDiff <= 0.5;
    
    if (wasOuterRun && isCloseMatch) {
      if (frame <= 4) {
        potential += 25;
        tags.push("📐 前走外回しロス克服(好枠替わり)");
      }
    }

    const didStumble = prevRace.isStumbled;
    const isFastest3f = prevRace.last3fTime !== undefined && parseFloat(prevRace.last3fTime) <= 34.0;
    const isReasonableDiff = prevRace.timeDiff !== undefined && prevRace.timeDiff <= 0.6;

    if (didStumble && isFastest3f && isReasonableDiff) {
      potential += 20;
      tags.push("🚀 前走出遅れ度外視(末脚極上)");
    }
  }

  // ==========================================
  // 【新設】J-③ クラス基準タイム精度向上（前走ペース・馬場補正）
  // ==========================================
  if (prevRace && prevRace.halonPace) {
    const paceParts = prevRace.halonPace.split('-');
    if (paceParts.length === 2) {
      const front3f = parseFloat(paceParts[0]);
      const back3f = parseFloat(paceParts[1]);
      
      if (!isNaN(front3f) && !isNaN(back3f)) {
        const isHighPace = front3f < back3f - 1.0;
        const isSlowPace = front3f > back3f + 1.0;

        if (isHighPace && (horse.style === '逃げ' || horse.style === '先行')) {
          potential += 15;
          tags.push("⏱️ 緩ペース替わりで持続力発揮");
        } else if (isSlowPace && dist < prevRace.distance) {
          potential += 15;
          tags.push("⏱️ 持続力勝負への条件好転");
        }
      }
    }
  }

  // ==========================================
  // 【新設】J-④ 厩舎別「勝負調教パターン」解析
  // ==========================================
  if (horse.trainer && horse.trainingTime) {
    const trainerName = horse.trainer;
    const timeStr = horse.trainingTime;
    const timeNumbers = timeStr
      .replace(/[\[\]\(\)（）]/g, ' ')
      .split(/[\s\- \t]/)
      .map(part => parseFloat(part.trim()))
      .filter(num => !isNaN(num) && num > 0 && num < 100);

    const isSlope = timeStr.includes("坂路") || timeStr.includes("坂");
    const isWood = timeStr.includes("ウッド") || timeStr.includes("南W") || timeStr.includes("Ｗ");

    if (timeNumbers.length >= 2) {
      const overall = timeNumbers[0];
      const last1f = timeNumbers[timeNumbers.length - 1];

      if (trainerName.includes("中内田")) {
        if (isSlope && last1f <= 11.8) {
          potential += 30;
          tags.push("🎯 中内田×勝負坂路仕上げ");
        }
      } else if (trainerName.includes("矢作")) {
        if (isWood && overall <= 64.5 && last1f <= 11.2) {
          potential += 30;
          tags.push("🎯 矢作×極限ウッド仕上げ");
        }
      } else if (trainerName.includes("友道")) {
        if (isWood && overall <= 65.5 && last1f <= 11.5) {
          potential += 25;
          tags.push("🎯 友道×本気ウッド仕上げ");
        }
      } else if (trainerName.includes("木村") || trainerName.includes("国枝")) {
        if (isWood && overall <= 65.0 && last1f <= 11.3) {
          potential += 25;
          tags.push("🎯 関東エリート×本気ウッド仕上げ");
        }
      }
    }
  }

  // ==========================================
  // 【新設】J-⑤ 初芝・初ダート路線変更変心予測
  // ==========================================
  if (horse.pastRaces && horse.pastRaces.length > 0) {
    const hasOnlyRunGrass = horse.pastRaces.every(pr => pr.surface === '芝');
    const hasOnlyRunDirt = horse.pastRaces.every(pr => pr.surface === 'ダート');

    if (race.surface === 'ダート' && hasOnlyRunGrass) {
      const dirtSires = ['ヘニーヒューズ', 'シニスターミニスター', 'ホッコータルマエ', 'パイロ', 'ドレフォン', 'マジェスティックウォリアー', 'キズナ', 'ルーラーシップ', 'ロードカナロア'];
      const isDirtSire = dirtSires.some(ds => bloodline.includes(ds));
      if (isDirtSire) {
        potential += 35;
        tags.push("🌀 砂替わり変心警戒(ダート強力血統)");
      }
    } else if (race.surface === '芝' && hasOnlyRunDirt) {
      const grassSires = ['ディープインパクト', 'ハーツクライ', 'ロードカナロア', 'エピファネイア', 'モーリス', 'キタサンブラック', 'ドゥラメンテ', 'ハービンジャー'];
      const isGrassSire = grassSires.some(gs => bloodline.includes(gs));
      if (isGrassSire) {
        potential += 20;
        tags.push("🌱 芝替わり変心警戒(芝エリート血統)");
      }
    }
  }

  // ==========================================
  // 【高知競馬場 超特化型オメガ・プロトコル推論エンジン】
  // ==========================================
  const isKochi = race.venue?.includes("高知") || race.trackName?.includes("高知") || race.raceName?.includes("高知");
  if (isKochi) {
    tags.push("🌴 高知特化OMEGAエンジン適用中");

    // 1. 枠順バイアス（イン荒れ・外枠外伸び）
    if (frame >= 7) {
      potential += 30;
      tags.push("📈 高知外枠アドバンテージ(砂厚・イン避け)");
    } else if (frame <= 2) {
      potential -= 25;
      tags.push("⚠️ 高知内枠ペナルティ(内砂深くロス懸念)");
    }

    // 2. 一発逆転ファイナルレース（最終レース）の波乱・穴馬補正
    const isFinalRace = race.raceNumber >= 11;
    if (isFinalRace) {
      tags.push("🔥 一発逆転ファイナルレース・波乱モード");
      if (popularity >= 6 || odds >= 15.0) {
        potential += 35;
        tags.push("⚡ ファイナル激走穴馬エッジ");
      } else if (popularity === 1) {
        potential -= 20; // 最終レースの1番人気信頼度低下
        tags.push("⚠️ ファイナル1番人気被り割引");
      }
    }

    // 3. 高知リーディングジョッキーバイアス（赤岡、宮川、多田羅）
    const isKochiEliteJ = ["赤岡", "宮川", "多田羅"].some(j => jockey.includes(j));
    if (isKochiEliteJ) {
      potential += 35;
      tags.push("👑 高知トップジョッキー補正");
    }
  }

  // ==========================================
  // 【大井競馬場 超特化型オメガ・プロトコル推論エンジン】
  // ==========================================
  const isOhi = race.venue?.includes("大井") || race.trackName?.includes("大井") || race.raceName?.includes("大井");
  if (isOhi) {
    tags.push("🗼 大井特化OMEGAエンジン適用中");

    // 1. 大型パワー馬加点（タフなオーストラリア産白砂対応）
    if (weight >= 500) {
      potential += 25;
      tags.push("💪 大井白砂パワー適合(500kg以上)");
    }

    // 2. 距離別の脚質適性（大井の長い直線）
    if (dist >= 1600) {
      if (horse.style === "差し" || horse.style === "追込") {
        potential += 25;
        tags.push("🏹 外回り長距離・末脚特注");
      }
    } else {
      if (horse.style === "逃げ" || horse.style === "先行") {
        potential += 20;
        tags.push("🏃 短距離・前残り優位");
      }
    }

    // 3. 大井エリートジョッキー（御神本、矢野、笹川、森泰）
    const isOhiEliteJ = ["御神本", "矢野", "笹川", "森泰"].some(j => jockey.includes(j));
    if (isOhiEliteJ) {
      potential += 30;
      tags.push("👑 大井リーディングジョッキーエッジ");
    }
  }

  // ==========================================
  // 【浦和競馬場 超特化型オメガ・プロトコル推論エンジン】
  // ==========================================
  const isUrawa = race.venue?.includes("浦和") || race.trackName?.includes("浦和") || race.raceName?.includes("浦和");
  if (isUrawa) {
    tags.push("📐 浦和特化OMEGAエンジン適用中");

    // 1. 極端な内枠先行絶対有利
    if (frame <= 3 && (horse.style === "逃げ" || horse.style === "先行")) {
      potential += 40;
      tags.push("🚀 浦和極小回り・内枠先行絶対有利");
    } else if (horse.style === "追込") {
      potential -= 30;
      tags.push("❌ 浦和小回り追込困難割引");
    }
  }

  // ==========================================
  // 【帯広ばんえい競馬 超特化型オメガ・プロトコル推論エンジン】
  // ==========================================
  const isObihiro = race.venue?.includes("帯広") || race.trackName?.includes("帯広") || race.raceName?.includes("帯広");
  if (isObihiro) {
    tags.push("🏇 帯広ばんえい特化OMEGAエンジン適用中");

    // 1. 大型馬絶対優位（ソリを引く圧倒的パワー）
    if (weight >= 900) {
      potential += 35;
      tags.push("💪 ばんえい規格外パワー馬(900kg以上)");
    } else if (weight < 850) {
      potential -= 20;
      tags.push("⚠️ ばんえい小柄馬パワー不足割引");
    }

    // 2. ばんえいリーディング騎手（西将太、鈴木恵、阿部など）
    const isBaneiEliteJ = ["西将", "鈴木恵", "阿部"].some(j => jockey.includes(j));
    if (isBaneiEliteJ) {
      potential += 30;
      tags.push("👑 ばんえいエリートジョッキー補正");
    }
  }

  // ==========================================
  // 【新潟競馬場 超特化型オメガ・プロトコル推論エンジン】
  // ==========================================
  const isNiigata = race.venue?.includes("新潟") || race.trackName?.includes("新潟") || race.raceName?.includes("新潟");

  if (isNiigata) {
    tags.push("🌾 新潟特化OMEGAエンジン適用中");

    // 【新設】新潟コース実績＆千直マイスター判定
    if (horse.pastRaces && horse.pastRaces.length > 0) {
      const isTurf = race.surface === "芝";
      
      // ① 新潟直線1000m（千直）専用実績
      if (dist === 1000 && isTurf) {
        const hasChokuGood = horse.pastRaces.some(pr => 
          (pr.venue?.includes("新潟") || pr.direction === "直線") && 
          pr.distance === 1000 && 
          pr.result <= 3
        );
        if (hasChokuGood) {
          potential += 35;
          tags.push("👑 千直マイスター: 新潟直線1000mでの好走実績あり(適性抜群)");
        }

        // 【新設】新潟千直におけるテンの「ダッシュ力」判定
        // 過去3走以内で最初のコーナー通過順位が3番手以内（1番手〜3番手）の先行実績があるか判定
        const hasFastDash = horse.pastRaces.slice(0, 3).some(pr => {
          if (!pr.passingPositions) return false;
          const firstPos = parseInt(pr.passingPositions.split('-')[0] || '99', 10);
          return firstPos > 0 && firstPos <= 3;
        });

        if (hasFastDash) {
          potential += 25;
          tags.push("⚡ 千直ダッシュ力: 過去走でテン3番手以内の先行力あり(スピード優位)");
        }
      } 
      // ② 新潟コース一般リピーター実績（千直以外）
      else {
        const niigataTop3Count = horse.pastRaces.filter(pr => 
          pr.venue?.includes("新潟") && 
          pr.result <= 3
        ).length;
        if (niigataTop3Count > 0) {
          potential += 20;
          tags.push(`🐎 新潟リピーターエッジ: 過去に新潟での好走実績あり(${niigataTop3Count}回)`);
        }
      }
    }

    const isTurf = race.surface === "芝";

    // 【新設】新潟芝における「超高速馬場への高速時計適性」の判定
    if (isTurf && (race.condition === "良" || race.condition === "稍重") && horse.pastRaces && horse.pastRaces.length > 0) {
      const parseTimeToSeconds = (timeStr: string | undefined): number => {
        if (!timeStr) return 999;
        const cleanStr = timeStr.toString().trim();
        if (cleanStr.includes(":")) {
          const parts = cleanStr.split(":");
          const minutes = parseFloat(parts[0] || "0");
          const seconds = parseFloat(parts[1] || "0");
          return minutes * 60 + seconds;
        }
        return parseFloat(cleanStr) || 999;
      };

      const hasFastTimeRecord = horse.pastRaces.some(pr => {
        if (pr.distance !== dist || !pr.time || pr.result > 5) return false;
        
        const seconds = parseTimeToSeconds(pr.time);
        
        if (dist === 1000 && seconds <= 55.5) return true;
        if (dist === 1200 && seconds <= 68.2) return true;
        if (dist === 1400 && seconds <= 80.8) return true;
        if (dist === 1600 && seconds <= 93.2) return true;
        if (dist === 1800 && seconds <= 105.8) return true;
        if (dist === 2000 && seconds <= 118.8) return true;
        if (dist === 2400 && seconds <= 144.5) return true;
        return false;
      });

      if (hasFastTimeRecord) {
        potential += 30;
        tags.push("⚡ 高速時計エッジ: 新潟高速芝に適した持ち時計実績あり(スピード証明)");
      }
    }

    // 1. 市場評価・オッズパラメータ（オッズの歪みと過小評価の検知）
    const isDirt = race.surface === "ダート";
    const isGradeOrSpecial = race.raceName?.match(/(GⅠ|GⅡ|GⅢ|重賞|特別|ステークス|カップ)/);
    const isStrongHeadwind = race.isHeadwind && (race.windSpeed !== undefined && race.windSpeed >= 3.0);
    const prevRace = horse.pastRaces && horse.pastRaces[0];

    if (isTurf) {
      // 芝レースにおける1番人気の過大評価（被りすぎ）減点
      if (popularity === 1 || odds <= 2.5) {
        potential -= 8; // 中京・中山芝での的中率向上のため-25から-8へ緩和
        tags.push("⚠️ 芝1番人気被り警戒(オッズ歪み補正)");
      }
      // 芝の牡牝混合戦における牝馬への加点（過剰な二重加算を適正化、短距離ボーナスと統合）
      const isMixed = !race.raceName?.includes("牝");
      if (isMixed && gender === "牝") {
        if (dist <= 1400) {
          potential += 12; // 二重加算を廃止し、短距離混合戦では+12の適正値に統合
          tags.push("🎯 短距離混合戦 of 牝馬エッジ");
        } else {
          potential += 8;
          tags.push("🎯 混合戦 of 牝馬(期待値エッジ)");
        }
      }
    }
    
    // 重賞における高齢馬（7歳以上）の復活期待値加点（的中率重視で抑制）
    if (isGradeOrSpecial && age >= 7) {
      potential += 8;
      tags.push("🔥 高齢実績馬の補正");
    }

    // 新潟直線1000m（千直）における圧倒的有利な「外枠（6枠〜8枠）」の物理エッジと激走条件
    if (dist === 1000 && isTurf) {
      if (frame >= 6) {
        potential += 25;
        tags.push("⚡ 千直外枠の圧倒的物理アドバンテージ");
        
        // 【激走】「前走ダート」×「7・8枠」の芝スタートスピード恩恵
        if (prevRace && prevRace.surface === "ダート" && frame >= 7) {
          potential += 20;
          tags.push("⚡ 千直適性：前走ダートダッシュ力×外枠黄金シナジー");
        }
      } else if (frame <= 2) {
        // 【激走】「1〜2枠」×「追込馬」: 意図的に下げてから外へ出す戦術トレンド
        if (horse.style === "追込") {
          potential += 15;
          tags.push("🎯 千直内枠追込：大外ラチ沿いトラバース急襲エッジ");
        } else {
          potential -= 20;
          tags.push("⚠️ 千直内枠の物理的絶望バイアス(馬場荒れ)");
        }
      }

      // 【激走】芝・大幅距離短縮ローテ×斤量減
      if (prevRace && prevRace.distance >= 1500) {
        const prevJockeyWeight = prevRace.jockeyWeight || 55;
        if (prevJockeyWeight - kinryo >= 1) {
          potential += 35;
          tags.push("⚡ 新潟千直：大幅距離短縮ローテ×斤量減エッジ");
        } else if (kinryo < prevJockeyWeight) {
          potential += 25;
          tags.push("⚡ 千直激変：大幅距離短縮ローテ×斤量減エッジ");
        }
      }
    }

    // 【新設】新潟芝における「内回り」と「外回り」の厳密な区別と脚質適合
    const isInnerTrack = race.trackName?.includes("内") || race.raceName?.includes("内回り") || race.trackName?.includes("内回り");
    
    // 内回り：1200m、1400m、および明示的な2000m内回りなど
    const isNiigataInnerTurf = isTurf && (
      [1200, 1400].includes(dist) || 
      (dist === 2000 && isInnerTrack)
    );
    
    // 外回り：1600m、1800m、および明示的・暗黙の2000m外回り、それ以上の外回りなど
    const isNiigataOuterTurf = isTurf && (
      [1600, 1800].includes(dist) || 
      (dist === 2000 && !isInnerTrack) ||
      (dist > 2000 && !isInnerTrack)
    );

    // ① 新潟芝・内回り（直線353m）の小回り先行バイアス
    if (isNiigataInnerTurf) {
      if (horse.style === "逃げ" || horse.style === "先行") {
        potential += 25;
        tags.push("📐 新潟内回りエッジ: 小回り先行の展開アドバンテージ");
      }
    }

    // ② 新潟芝・外回り（直線658.7m）の末脚・キレ味バイアスと特注激走条件
    if (isNiigataOuterTurf) {
      // 芝外回り直線658.7mにおける「差し・追込・中団」の極限瞬発力ブースト
      if (horse.style === "差し" || horse.style === "追込" || horse.style === "中団") {
        potential += 20;
        tags.push("🚀 新潟外回りエッジ: 直線658mの極限瞬発力ブースト");
      }

      // 開催最終週（重賞）における内枠イン突き逆張りエッジ
      const isFinalWeekStakes = race.raceName?.match(/(新潟記念|新潟２歳|新潟2歳)/) !== null;
      if (isFinalWeekStakes && frame <= 3) {
        potential += 35;
        tags.push("📐 新潟最終週外回り：全車外出しの逆張りイン突きエッジ");
      }

      // 芝外回りにおける「人気薄の逃げ馬」の過小評価補正
      if (horse.style === "逃げ" && (popularity >= 6 || odds >= 12.0)) {
        potential += 30;
        tags.push("🏃 新潟芝外回り：人気薄逃げ馬スロー逃げ残りエッジ");
      }
    }

    // 2. 空間物理・馬体パラメータ（ダイナミックな枠順バイアスと性齢）
    if (isTurf) {
      if (dist !== 1000) {
        // ダイナミックな枠順バイアス（前半レースと後半レースの差別化、千直を除く芝）
        if (race.raceNumber <= 6) {
          // 前半レース：内枠有利
          if (frame <= 3) {
            potential += 15;
            tags.push("📐 前半芝レースの内枠優位");
          }
        } else {
          // 後半レース：外枠有利
          if (frame >= 6) {
            potential += 25;
            tags.push("📈 後半荒れ馬場の外枠バイアス");
          }
        }
      }
    } else if (isDirt) {
      if (dist === 1200) {
        // 新潟ダート1200m：芝スタートにより長く芝を走れる外枠が圧倒的有利
        if (frame >= 6) {
          potential += 25;
          tags.push("⚡ 新潟ダ1200m：芝スタート外枠ダッシュエッジ");
        } else if (frame <= 2) {
          potential -= 15;
          tags.push("⚠️ 新潟ダ1200m：内枠芝スタート距離短不利");
        }

        // 【激走】新潟ダ1200m「牝馬の逃げ」（超平坦直線恩恵）
        if (gender === "牝" && horse.style === "逃げ") {
          if (frame >= 6) {
            potential += 40;
            tags.push("⚡ 新潟ダ1200m：芝スタート外枠×快速牝馬逃げの最強スピードシナジー");
          } else {
            potential += 25;
            tags.push("⚡ 新潟ダ1200m牝馬逃げ：超平坦路盤スピード持続エッジ");
          }
        }
      } else if (dist === 1800) {
        // 新潟ダ1800m 砂の物理特性（砂理学）補正
        const raceDate = race.date ? new Date(race.date) : null;
        const raceMonth = raceDate ? raceDate.getMonth() + 1 : 0;
        const isSummer = raceMonth === 7 || raceMonth === 8;

        if (isSummer && condition === "良") {
          // 夏の良馬場：さらさら砂で高いスタミナ・キックバック回避が求められる
          if (prevRace && prevRace.distance < 1800 && frame >= 6) {
            potential += 30;
            tags.push("🌾 新潟ダ1800m夏良馬場：スタミナ要求さらさら砂×距離延長・外枠エッジ");
          } else if (frame >= 6) {
            potential += 15;
            tags.push("📈 ダート戦：砂被り回避の外枠優位");
          } else if (frame <= 2) {
            potential -= 10;
            tags.push("⚠️ ダート戦：砂被り・揉まれ内枠割引");
          }
        } else if (condition !== "良" || raceMonth === 10 || raceMonth === 11) {
          // 雨での含水率上昇時、または秋開催の砂細粒化（粘性泥濘馬場）：スピード減少のためパワー先行優位
          if (horse.style === "逃げ" || horse.style === "先行") {
            potential += 30;
            tags.push("🌾 新潟ダ1800m粘性泥濘馬場：パワー型前残り先行エッジ");
          }
          if (frame >= 6) {
            potential += 15;
            tags.push("📈 ダート戦：砂被り回避の外枠優位");
          } else if (frame <= 2) {
            potential -= 10;
            tags.push("⚠️ ダート戦：砂被り・揉まれ内枠割引");
          }
        } else {
          // 一般ダート：外枠のキックバック回避優位
          if (frame >= 6) {
            potential += 15;
            tags.push("📈 ダート戦：砂被り回避の外枠優位");
          } else if (frame <= 2) {
            potential -= 10;
            tags.push("⚠️ ダート戦：砂被り・揉まれ内枠割引");
          }
        }

        // 【激走】新潟ダ1800m「距離延長×外枠」（ストレスフリー追走）
        if (prevRace && prevRace.distance < 1800 && frame >= 6 && !(isSummer && condition === "良")) {
          potential += 20;
          tags.push("📈 新潟ダ1800m：砂被り回避外枠×距離延長エッジ");
        }
      } else {
        // その他のダート
        if (frame >= 6) {
          potential += 15;
          tags.push("📈 ダート戦：砂被り回避の外枠優位");
        } else if (frame <= 2) {
          potential -= 10;
          tags.push("⚠️ ダート戦：砂被り・揉まれ内枠割引");
        }
      }
    }

    // 3. 時系列パフォーマンスパラメータ（時間帯および風・水分量による脚質の有利不利）
    if (isTurf) {
      if (race.raceNumber <= 5) {
        // 前半レース（1R〜5R）: 先行馬（前残り）絶対有利加点
        if (horse.style === "逃げ" || horse.style === "先行") {
          potential += 25;
          tags.push("🏃 前半戦 of 先行・前残りアドバンテージ");
        }
      } else {
        // 後半レース（6R〜12R、特に特別戦・重賞）: 差し・追込馬有利加点（ただし強風時は先行優遇）
        if (isStrongHeadwind) {
          // 直線向かい風強風：差し馬は風の壁で届かず、スリップストリームを利用できる先行・好位馬が有利
          if (horse.style === "先行" || horse.style === "好位") {
            potential += 30;
            tags.push("🌬️ 強風向かい風直線：風よけ先行・好位エッジ");
          } else if (horse.style === "差し" || horse.style === "追込") {
            potential += 10; // 大幅に加点を減退
            tags.push("⚠️ 強風向かい風直線：差し馬風の壁リスク割引");
          }
        } else {
          // 通常時または追い風：長い直線を活かしたキレ味優遇
          if (horse.style === "差し" || horse.style === "追込") {
            potential += 30;
            tags.push("🏹 後半戦 of 外差し・末脚特注");
          }
        }
      }
    } else if (isDirt) {
      // 新潟ダート：含水率（馬場状態）に応じた脚質の動的調整
      if (condition === "稍重" || condition === "重") {
        // 湿潤時（脚抜きの良い高速馬場）：スピードを活かした差し馬の成績向上
        if (horse.style === "逃げ" || horse.style === "先行") {
          potential += 20;
          tags.push("🏃 新潟ダート：前残り先行アドバンテージ");
        } else if (horse.style === "差し" || horse.style === "追込") {
          potential += 15;
          tags.push("⚡ 湿潤新潟ダート：脚抜き良高速適性(差し追込バフ)");
        }
      } else {
        // 乾燥時（良）または泥濘時（不良）：粘り気や摩擦が激しく「パワー型前残り」が極端化
        if (horse.style === "逃げ" || horse.style === "先行") {
          potential += 35;
          tags.push("💪 新潟ダート粘性馬場：パワー型前残り先行エッジ強化");
        } else if (horse.style === "差し" || horse.style === "追込") {
          potential -= 10;
          tags.push("❌ 新潟ダート粘性馬場：過酷なキックバック差し割引");
        }
      }
    }

    // 4. 馬体重変動の「トレンド」読み取り（勝ち切り安定と紐穴の分離による的中率強化）
    const absWeightChange = Math.abs(weightChange);
    if (weightChange >= 0 && weightChange <= 6) {
      potential += 25;
      tags.push("🏆 新潟勝ち切り条件：馬体重安定ゾーン（±0〜+6kg）");
    } else if (absWeightChange <= 8) {
      potential += 15;
      tags.push("📈 新潟馬体重安定トレンド（±8kg以内）");
    } else if (absWeightChange >= 10) {
      potential += 10; // 大幅増減は1着率低下のため小加点に抑制（紐穴）
      tags.push("⚠️ 大幅馬体重増減（2・3着激走の紐穴期待値）");
      if (popularity >= 6 || odds >= 12.0) {
        potential += 10;
        tags.push("⚡ 大幅増減・妙味穴馬補正");
      }
    }

    // 5. 人間系シナジー・陣営パラメータ（特注騎手と勝負所の陣営評価）
    // 減量特注騎手「舟山瑠泉」騎手への適正な斤量恩恵補正
    if (jockey.includes("舟山") || jockey.includes("瑠泉")) {
      potential += 15;
      tags.push("🌟 新潟減量ジョッキー:舟山瑠泉");
    }

    // 格が上がる後半戦（9R〜12R of 特別戦・重賞）におけるトップジョッキー＆関西馬（栗東）優位の補正
    if (race.raceNumber >= 9) {
      // 栗東（関西馬）所属
      const isRitto = horse.stableLocation?.includes("栗東") || horse.trainer?.includes("栗東") || horse.trainer?.includes("美浦") === false;
      if (isRitto) {
        potential += 25;
        tags.push("✈️ メイン戦遠征関西馬(栗東)エッジ");
      }
      // エリート騎手
      const eliteJockeys = ["ルメール", "川田将雅", "武豊", "坂井瑠星", "戸崎圭太", "モレイラ", "レーン", "横山武史", "デムーロ"];
      const isElite = eliteJockeys.some(ej => jockey.includes(ej));
      if (isElite) {
        potential += 30;
        tags.push("👑 メイン戦トップジョッキーバイアス");
      }
    }
  }

  // ==========================================
  // 【京都競馬場 超特化型オメガ・プロトコル推論エンジン】
  // ==========================================
  const isKyoto = race.venue?.includes("京都") || race.trackName?.includes("京都") || race.raceName?.includes("京都");

  if (isKyoto) {
    tags.push("⛩️ 京都特化OMEGAエンジン適用中");

    const isTurf = race.surface === "芝";
    const isDirt = race.surface === "ダート";
    const isOuterTrack = isTurf && [1600, 1800, 2200, 2400, 3000, 3200].includes(dist);
    const isInnerTrack = isTurf && !isOuterTrack;
    const isGradeOrSpecial = race.raceName?.match(/(GⅠ|GⅡ|GⅢ|G1|G2|G3|GI|GII|GIII|重賞|特別|ステークス|カップ)/i);

    // 1. 人間系シナジーと特定の乗り替わり・騎乗適正
    // ② 岩田康誠騎手の「イン突き」エッジ (特別・重賞×1〜4枠)
    if (jockey.includes("岩田康") && frame <= 4 && isGradeOrSpecial) {
      potential += 35;
      tags.push("👑 岩田康×京都イン突きエッジ");
    } else if (jockey.includes("岩田康") && frame <= 4) {
      potential += 15;
      tags.push("👑 岩田康誠×京都内枠：必殺イン突きバイアス適合");
    }

    // ③ 川田将雅騎手の「剛腕先行押し切り」エッジ (芝2200m外回り)
    if (jockey.includes("川田") && isTurf && dist === 2200 && 
        (horse.style === "逃げ" || horse.style === "先行" || horse.style === "好位" || horse.style === "差し")) {
      potential += 35;
      tags.push("👑 川田将雅×京都芝2200m先行押し切りエッジ");
    } else if (jockey.includes("川田") && isTurf && dist === 2200) {
      potential += 20;
      tags.push("👑 川田将雅×京都芝2200m：先行持続・淀の坂下り最適化");
    }

    // 2. 馬体重のマイナス変動（究極の勝負気配と夏負け・輸送減りリスクのバランス）
    if (weightChange < 0 && weightChange >= -8) {
      potential += 8; // 的中率向上のため過剰加点を+15から+8へ抑制
      tags.push("🔥 京都絞り込み仕上げ");
      
      // オッズ偏差値が高い（人気薄の穴馬）場合、さらなる期待値ブースト
      if (popularity >= 6 || odds >= 10.0) {
        potential += 10; // +25から+10へ適正化
        tags.push("⚡ 京都仕上げ穴馬補正");
      }
    }

    // ① 馬体重減少（-4kg以上）× 内枠（1〜4枠）の「淀の坂越え」機動力補正 (芝内回り)
    if (isInnerTrack && weightChange <= -4 && frame <= 4) {
      potential += 25;
      tags.push("⛰️ 淀の坂越え：馬体絞りイン立ち回り");
    } else if (weightChange <= -4 && frame <= 4) {
      potential += 15;
      tags.push("📈 京都登坂物理:馬体絞り(-4kg以上)×内枠アドバンテージ");
    }

    // 3. 枠順バイアスの自動更新（トラックバイアスの激変適応）
    // 前半戦（1R〜6R）：内枠復活バイアス
    if (race.raceNumber <= 6) {
      if (frame <= 3) {
        potential += 20;
        tags.push("📐 京都前半戦の内枠復活バイアス");
      }
    } else {
      // 後半戦（7R〜12R）：荒れ馬場外差し外枠バイアス
      if (frame >= 6) {
        potential += 20;
        tags.push("📈 京都後半戦の外枠・イン避けバイアス");
      }
    }

    // 過去の京都好走実績によるコース相性補正
    if (horse.pastRaces && horse.pastRaces.length > 0) {
      const kyotoTop3 = horse.pastRaces.filter(pr => pr.venue?.includes("京都") && pr.result <= 3).length;
      if (kyotoTop3 > 0) {
        potential += 15;
        tags.push(`🐎 京都実績馬リピートエッジ(${kyotoTop3}回)`);
      }
    }

    // 京都適合血統（種牡馬）ブースト
    const sireUpper = horse.sire?.toUpperCase() || "";
    const bloodlineUpper = horse.bloodline?.toUpperCase() || "";
    if (sireUpper.includes("キタサンブラック") && isTurf && dist === 1400) {
      potential += 20;
      tags.push("🧬 京都芝1400m適性：キタサンブラック産駒スタミナエッジ");
    }

    // ④ 改修後ダート（1800m）のスタミナ血統補正
    if (isDirt && dist === 1800 && 
        (sireUpper.includes("キズナ") || sireUpper.includes("サンダースノー") || sireUpper.includes("シニスターミニスター") || sireUpper.includes("ドレフォン") ||
         bloodlineUpper.includes("キズナ") || bloodlineUpper.includes("サンダースノー") || bloodlineUpper.includes("シニスターミニスター") || bloodlineUpper.includes("ドレフォン")) &&
        (horse.style === "逃げ" || horse.style === "先行" || horse.style === "好位")) {
      potential += 30;
      tags.push("🧬 改修後タフダート：スタミナ・パワー血統エッジ");
    } else if ((sireUpper.includes("サンダースノー") || sireUpper.includes("キズナ")) && isDirt && dist === 1800) {
      potential += 20;
      tags.push("🧬 京都ダ1800m適性：改修後タフダート適合血統(サンダースノー/キズナ)");
    }

    // ⑤ ハンデ戦（芝2400m）の「軽量馬優遇」と「実績不足の重斤量馬ペナルティ」
    const isHandicap = race.raceName?.includes("ハンデ");
    const hasG1Record = horse.pastRaces?.some(pr => 
      (pr.raceClass?.toUpperCase() === "G1" || pr.raceClass?.toUpperCase() === "GⅠ" || pr.raceName?.includes("GⅠ") || pr.raceName?.includes("G1")) &&
      pr.result <= 2
    );

    if (isHandicap && isTurf && dist === 2400) {
      if (kinryo <= 55 && (age === 4 || age === 5)) {
        potential += 30;
        tags.push("⚖️ 軽量若駒ハンデ優遇(55kg以下)");
      } else if (kinryo <= 55) {
        potential += 15;
        tags.push("⚖️ 京都芝2400mハンデ戦：軽量馬(55kg以下)絶対優位");
      } else if (kinryo >= 57 && !hasG1Record) {
        potential -= 35;
        tags.push("⚠️ 実績不足重ハンデペナルティ(57kg以上×GI実績なし)");
      } else if (kinryo >= 57) {
        potential -= 15;
        tags.push("⚠️ 京都芝2400mハンデ戦：実績不足重斤量(57kg以上)割引");
      }
    }

    // 芝外回りコースにおけるスリングショット効果（好位差し適合）と大外一気（追込届かず）の判定
    if (isOuterTrack) {
      if (horse.style === "逃げ" || horse.style === "先行" || horse.style === "好位" || horse.style === "差し") {
        potential += 15;
        tags.push("📐 京都外回り物理:スリングショット効果好位差し適合");
      } else if (horse.style === "追込") {
        potential -= 25;
        tags.push("❌ 京都外回り物理:極端な追込届かず絶望バイアス割引");
      }
    }

    // 4. オッズ偏差値と過剰人気の検知
    // 1番人気の過剰人気（低期待値）の割り引き
    if (popularity === 1 && odds <= 2.2) {
      potential -= 10; // 中京・中山芝での的中率向上のため-30から-10へ緩和
      tags.push("⚠️ 京都1番人気過剰被り割引(期待値補正)");
    }
    // スコア上位かつオッズ偏差値乖離（大衆軽視の極上大穴）の検知
    if (potential >= 530 && odds >= 25.0) {
      potential += 40;
      tags.push("⚡ 京都特選:超大穴妙味期待値");
    }

    // 5. ベースライン補正（特殊馬具・ブリンカー＆栗東所属ホームアドバンテージと「関東(美浦)エリート遠征馬」の再評価）
    // 特殊馬具（ブリンカー着用）激変期待値
    if (horse.useBlinkers) {
      potential += 10; // 的中率向上のため+30から+10へ適正化（自滅リスク考慮）
      tags.push("🎯 京都ブリンカー着用適正化");
    }

    // 所属バイアス（栗東馬の圧倒的優位）と美浦エリート遠征馬のエッジ
    const isRittoKyoto = horse.stableLocation?.includes("栗東") || horse.trainer?.includes("栗東") || horse.trainer?.includes("美浦") === false;

    if (isRittoKyoto) {
      potential += 20; // +35から+20へバランス調整
      tags.push("🏰 京都本家:栗東所属馬ホームエッジ");
    } else {
      if (isGradeOrSpecial) {
        potential += 15; // 特別・重賞に遠征してくる美浦の有力馬は逆にプラス評価（ルメール等の勝負遠征）
        tags.push("✈️ 京都遠征美浦精鋭馬エッジ");
      } else {
        potential -= 5; // 的中率低下防止のためアウェイ減点を-15から-5へ大幅緩和
        tags.push("⚠️ 美浦所属馬(京都アウェイ割引)");
      }
    }
  }

  // ==========================================
  // 【東京競馬場 超特化型オメガ・プロトコル推論エンジン】
  // ==========================================
  const isTokyo = race.venue?.includes("東京") || race.trackName?.includes("東京") || race.raceName?.includes("東京");

  if (isTokyo) {
    tags.push("🗼 東京特化OMEGAエンジン適用中");

    const isTurf = race.surface === "芝";
    const isDirt = race.surface === "ダート";
    const isGradeOrSpecial = race.raceName?.match(/(GⅠ|GⅡ|GⅢ|重賞|特別|ステークス|カップ)/);
    const isStrongHeadwind = race.isHeadwind && (race.windSpeed !== undefined && race.windSpeed >= 3.0);

    // 1. 人間系シナジーと陣営の意図
    // 馬具ブースト（ブリンカー着用）の評価適正化（芝・ダートと脚質の考慮）
    if (horse.useBlinkers) {
      if (isDirt && dist <= 1400) {
        potential += 25;
        tags.push("🎯 東京ダート短距離：ブリンカー集中力バフ");
      } else if (isTurf && (horse.style === "逃げ" || horse.style === "先行")) {
        potential += 15;
        tags.push("🔥 東京芝先行：ブリンカー勝負仕上げ");
      } else {
        potential += 5; // 差し・追込や芝長距離は自滅リスクを考慮して微加点
        tags.push("🎯 ブリンカー着用（自滅リスク考慮の微加点）");
      }
    }

    // C.ルメール騎手 × 8枠（大外）の黄金エッジ
    if (jockey.includes("ルメー") && frame === 8) {
      potential += 20;
      tags.push("👑 東京ルメール×8枠大外：抜群のコース取りエッジ");
    }

    // 「西高東低」の適正化（アウェイ栗東馬の過少評価排除と特別・重賞でのエッジ評価）
    const isMiho = horse.stableLocation?.includes("美浦") || horse.trainer?.includes("美浦");
    const isRitto = horse.stableLocation?.includes("栗東") || horse.trainer?.includes("栗東") || (!isMiho && horse.stableLocation === "栗東");

    if (isMiho && race.raceNumber <= 8 && !isGradeOrSpecial) {
      potential += 10;
      tags.push("🏠 東京下級条件：美浦ホームアドバンテージ");
    } else if (isRitto && (race.raceNumber >= 9 || isGradeOrSpecial)) {
      potential += 25;
      tags.push("✈️ メイン戦遠征関西馬(栗東)エッジ");
    }

    // 東京適合血統（種牡馬）ブースト
    const sireUpper = horse.sire?.toUpperCase() || "";
    if (sireUpper.includes("キタサンブラック")) {
      potential += 15;
      tags.push("🧬 東京適性：キタサンブラック産駒エッジ");
    } else if (sireUpper.includes("パイロ") || sireUpper.includes("ジャスタウェイ")) {
      potential += 10;
      tags.push(`🧬 東京適性：${horse.sire}産駒穴期待`);
    }

    // 2. レースフェーズ（条件）と戦績データ・物理環境の連動評価
    if (isTurf) {
      if (race.raceNumber <= 5) {
        // 前半レース（下級条件）：前残り（逃げ・先行）有利
        if (horse.style === "逃げ" || horse.style === "先行") {
          potential += 20;
          tags.push("📐 前半芝戦の先行・前残りアドバンテージ");
        }
      } else {
        // 後半レース（上級条件）：差し・追込（極上末脚）有利（向かい風によるバイアス変動）
        if (isStrongHeadwind) {
          // 強風の直線向かい風：差し馬は風の壁で失速するリスクあり、先行・好位を優遇
          if (horse.style === "先行" || horse.style === "好位") {
            potential += 30;
            tags.push("🌬️ 強風向かい風直線：風よけ先行・好位エッジ");
          } else if (horse.style === "差し" || horse.style === "追込") {
            potential += 10; // 大幅削減
            tags.push("⚠️ 強風向かい風直線：外差し風の壁リスク割引");
          }
        } else {
          // 通常時または追い風：セオリー通りの末脚優遇
          if (horse.style === "差し" || horse.style === "追込") {
            potential += 30;
            tags.push("🏹 後半芝戦の極上外差し・末脚特注");
          }
          // 推定上がり3F of 補正（前走で速い上がりを繰り出した馬の加点）
          if (horse.pastRaces && horse.pastRaces[0]) {
            const last3fNum = parseFloat(horse.pastRaces[0].last3fTime || "36.0");
            if (last3fNum > 0 && last3fNum <= 34.5) {
              potential += 15;
              tags.push(`⚡ 前走極上の末脚を計測(3F:${last3fNum}秒)`);
            }
          }
        }
      }
    } else if (isDirt) {
      // ダート戦は一貫して先行力を最重視
      if (horse.style === "逃げ" || horse.style === "先行") {
        potential += 30;
        tags.push("🏃 東京ダート：前残り先行アドバンテージ");
      } else if (horse.style === "差し" || horse.style === "追込") {
        potential += 5;
        tags.push("⚠️ 東京ダート：差し届かずリスク割引");
      }
    }

    // 前走「芝レース」からの替わり（芝スタートでのスピードアドバンテージ）
    if (horse.pastRaces && horse.pastRaces[0]) {
      const prevRace = horse.pastRaces[0];
      if (prevRace.surface === "芝") {
        potential += 15;
        tags.push("🚀 東京ダート替わり：芝スタート芝ダッシュ期待馬");
      }
    }

    // 距離短縮ローテによるスタミナ優位性
    if (horse.pastRaces && horse.pastRaces[0]) {
      const prevRace = horse.pastRaces[0];
      if (prevRace.distance > dist) {
        potential += 12;
        tags.push("📈 距離短縮ローテ：タフな流れへのスタミナ適合");
      }
    }

    // 3. 空間物理解析（枠順バイアス）の動的調整
    if (isTurf) {
      if (dist === 2000) {
        // 東京芝2000mの罠（内枠過剰人気と外枠の物理的絶望）
        if (frame >= 4 && frame <= 6) {
          potential += 20;
          tags.push("🎯 東京芝2000m：客観的期待値の中枠エッジ");
        } else if (frame <= 2) {
          potential -= 5;
          tags.push("⚠️ 東京芝2000m：内枠過剰人気・包まれ懸念割引");
        } else if (frame >= 7 && headCount >= 10) {
          potential -= 25;
          tags.push("❌ 東京芝2000m：多頭数外枠の物理的絶望ペナルティ");
        }
      } else {
        if (race.raceNumber <= 6) {
          if (frame <= 3) {
            potential += 15;
            tags.push("📐 前半芝レースの内枠ロスなしバイアス");
          }
        } else {
          if (frame >= 6) {
            potential += 20;
            tags.push("📈 後半芝レースの馬場荒れ外伸びバイアス");
          }
        }
      }
    } else if (isDirt) {
      if (dist === 1600) {
        // 東京ダート1600m（芝スタート外枠有利）
        if (frame >= 6) {
          potential += 25;
          tags.push("⚡ 東ダ1600m：芝スタート外枠ダッシュエッジ");
          // 外枠かつ「逃げ・先行」脚質への超強力シナジー補正
          if (frame >= 7 && (horse.style === "逃げ" || horse.style === "先行")) {
            potential += 20;
            tags.push("⚡ 東ダ1600m：芝スタート外枠×逃げ先行の黄金エッジ");
          }
        } else if (frame <= 2) {
          potential -= 15;
          tags.push("⚠️ 東ダ1600m：内枠芝スタート距離短不利");
        }
      } else {
        // 一般的なダート：キックバック回避の外枠有利
        if (frame >= 6) {
          potential += 15;
          tags.push("📈 ダート戦：砂被り回避の外枠優位");
        } else if (frame <= 2) {
          potential -= 10;
          tags.push("⚠️ ダート戦：砂被り・揉まれ内枠割引");
        }
      }

      // ダート馬場状態（砂の物理特性）に応じた適性補正
      if (condition === "良" || condition === "稍重") {
        // 乾燥馬場：キック力が吸い取られるため、パワーのある大型馬を優遇
        if (weight >= 490) {
          potential += 15;
          tags.push("💪 乾燥東京ダート：大型パワー馬スタミナエッジ");
        }
      } else if (condition === "重" || condition === "不良") {
        // 水分を含んだ高速馬場：スピードタイプの軽量馬・快速馬を優遇
        if (weight > 0 && weight < 460) {
          potential += 12;
          tags.push("⚡ 湿潤東京ダート：脚抜き良高速適性(軽量快速馬)");
        }
      }
    }

    // Bコース替わり週の内伸び回帰バイアス
    const isBCourse = race.raceName?.includes("Bコース") || race.trackName?.includes("Bコース") || race.raceName?.includes("B枠");
    if (isBCourse && isTurf) {
      if (frame <= 3 && (horse.style === "逃げ" || horse.style === "先行" || horse.style === "好位")) {
        potential += 20;
        tags.push("📐 Bコース物理：急激な内伸び回帰バイアス適合");
      }
    }

    // 過去の東京好走実績
    if (horse.pastRaces && horse.pastRaces.length > 0) {
      const tokyoTop3 = horse.pastRaces.filter(pr => pr.venue?.includes("東京") && pr.result <= 3).length;
      if (tokyoTop3 > 0) {
        potential += 15;
        tags.push(`🐎 東京実績馬リピートエッジ(${tokyoTop3}回)`);
      }
    }

    // ==========================================
    // 【新設】東京的中率極限先鋭化ファクター (Tokyo Advanced Edge)
    // ==========================================
    // ① Dコース（仮柵移動）時の「物理的内枠先行優遇」と「大外回し距離ロス」
    const isDStage = race.raceName?.includes("Dコース") || race.trackName?.includes("Dコース") || race.raceName?.includes("D枠");
    if (isDStage) {
      if (frame <= 3 && (horse.style === "逃げ" || horse.style === "先行" || horse.style === "好位")) {
        potential += 30;
        tags.push("📐 東京Dコース物理:極小インラチ沿い最短経路アドバンテージ");
      } else if (frame >= 7 && (horse.style === "差し" || horse.style === "追込")) {
        potential -= 25;
        tags.push("⚠️ 東京Dコース物理:大外回し物理的距離ロス懸念(割引)");
      }
    }

    // ② 前走「小回り競馬場での大外回しロス」からの「広大な東京替わり」一変巻き返し
    if (horse.pastRaces && horse.pastRaces[0]) {
      const prevRace = horse.pastRaces[0];
      const isShortTrack = /(中山|福島|小倉|函館|札幌|金沢|笠松|浦和|川崎)/.test(prevRace.venue || "");
      const isPrevBad = prevRace.result >= 6 && (prevRace.timeDiff !== undefined && prevRace.timeDiff >= 1.0);
      
      if (isShortTrack && isPrevBad) {
        potential += 25;
        tags.push("🚀 コース替わり一変:小回り大外ロス → 広大な東京の直線解放期待");
      }
    }

    // ③ 「東京マイスター」騎手 × 脚質・枠の黄金シナジー
    if (isTurf) {
      if (jockey.includes("ルメー") && (horse.style === "差し" || horse.style === "追込")) {
        potential += 20;
        tags.push("👑 東京マイスター:ルメール極上末脚エッジ(仕掛けタイミング最適)");
      } else if (jockey.match(/(戸崎|菅原明|横山武)/) && (horse.style === "先行" || horse.style === "好位")) {
        potential += 15;
        tags.push("🎯 東京マイスター:好位イン差し抜け出しエッジ");
      }
    } else if (isDirt) {
      if (jockey.match(/(川田|坂井)/) && (horse.style === "逃げ" || horse.style === "先行")) {
        potential += 20;
        tags.push("⚡ 東京ダートマイスター:先行押し切りエッジ(前残り加速)");
      }
    }

    // 4. 馬体重変動の「トレンド」読み取り（勝ち切り安定と紐穴の分離）
    const absWeightChange = Math.abs(weightChange);
    if (weightChange >= 0 && weightChange <= 6) {
      potential += 25;
      tags.push("🏆 東京勝ち切り条件：馬体重安定ゾーン（±0〜+6kg）");
    } else if (absWeightChange <= 8) {
      potential += 15;
      tags.push("📈 東京馬体重安定トレンド（±8kg以内）");
    } else if (absWeightChange >= 10) {
      potential += 10; // 大幅増減は1着率低下のため小加点に抑制（紐穴）
      tags.push("⚠️ 大幅馬体重増減（2・3着激走の紐穴期待値）");
      if (popularity >= 6 || odds >= 12.0) {
        potential += 10;
        tags.push("⚡ 大幅増減・妙味穴馬補正");
      }
    }

    // 5. 券種別チューニングと「オッズ偏差値」の先鋭化
    // ① 東京の超高速芝における限界時計の反動ペナルティの判定
    if (isTurf && prevRace && prevRace.surface === '芝' && prevRace.time && race.date && prevRace.date) {
      const prevDate = new Date(prevRace.date);
      const currDate = new Date(race.date);
      const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 35) { // 中4週以下
        const prevSeconds = parseTimeToSeconds(prevRace.time);
        const prevDist = prevRace.distance;
        let isLimitTime = false;

        // 前走距離別の限界時計（激走）の判定
        if (prevDist === 1000 && prevSeconds <= 54.5) isLimitTime = true;
        else if (prevDist === 1200 && prevSeconds <= 67.5) isLimitTime = true;
        else if (prevDist === 1400 && prevSeconds <= 80.0) isLimitTime = true;
        else if (prevDist === 1600 && prevSeconds <= 91.8) isLimitTime = true;
        else if (prevDist === 1800 && prevSeconds <= 104.5) isLimitTime = true;
        else if (prevDist === 2000 && prevSeconds <= 117.2) isLimitTime = true;
        else if (prevDist === 2400 && prevSeconds <= 143.5) isLimitTime = true;

        // 前走5着以内で激走しており、今回上位人気（3番人気以内）
        if (isLimitTime && prevRace.result <= 5 && popularity <= 3) {
          potential -= 25;
          tags.push("⚠️ 超高速馬場激走の反動ペナルティ(中4週内)");
        }
      }
    }

    // ② 直線だんだら坂の勾配適性判定
    let hasSlopeAptitude = false;

    // A. 急坂競馬場での好走実績判定
    if (horse.pastRaces && horse.pastRaces.length > 0) {
      const steepVenues = ["中山", "阪神", "中京", "小倉", "福島", "函館"];
      const hasSteepGoodRecord = horse.pastRaces.some(pr => {
        const isSteep = steepVenues.some(sv => pr.venue?.includes(sv));
        return isSteep && pr.result <= 3;
      });
      if (hasSteepGoodRecord) {
        hasSlopeAptitude = true;
      }
    }

    // B. 調教加速ラップ・しぶとさ判定
    if (horse.trainingTime) {
      const timeStr = horse.trainingTime;
      const timeNumbers = timeStr
        .replace(/[\[\]\(\)（）]/g, ' ')
        .split(/[\s\- \t]/)
        .map(part => parseFloat(part.trim()))
        .filter(num => !isNaN(num) && num > 0 && num < 100);

      const isSlope = timeStr.includes("坂路") || timeStr.includes("坂");
      const isWood = timeStr.includes("ウッド") || timeStr.includes("南W") || timeStr.includes("Ｗ");

      if (timeNumbers.length >= 3) {
        const last1f = timeNumbers[timeNumbers.length - 1];
        const last2f = timeNumbers[timeNumbers.length - 2];
        if (last1f <= last2f + 0.2) { // 減速幅が0.2秒以内か、加速ラップ
          hasSlopeAptitude = true;
          if (last1f < last2f) {
            tags.push("⛰️ 調教加速ラップ：だんだら坂しぶとさ適合");
          }
        }
      }
    }

    if (hasSlopeAptitude) {
      potential += 20;
      if (!tags.some(t => t.includes("だんだら坂しぶとさ"))) {
        tags.push("⛰️ 急坂実績・だんだら坂勾配適性あり");
      }
    }

    // 1番人気の過剰人気（低期待値）の割り引き
    if (popularity === 1 && odds <= 2.0) {
      potential -= 10;
      tags.push("⚠️ 東京1番人気過剰被り割引(期待値用補正)"); // 衝突を避けるための微細調整
    }

    // 期待値最大の大穴（単勝50倍〜100倍超）あぶり出し（人気に対する逆数・動的期待値ブースト）
    if (potential >= 520 && odds >= 30.0) {
      const dynamicBoost = Math.min(15, Math.floor(odds / 4)); // 大穴過剰評価を防ぐため最大15点に制限
      potential += dynamicBoost;
      tags.push(`⚡ 東京特選:オッズ逆数期待値ブースト(+${dynamicBoost})`);
    }
  }

  // ==========================================
  // 【門別競馬場 超特化型オメガ・プロトコル推論エンジン】
  // ==========================================
  const isMombetsu = race.venue?.includes("門別") || race.trackName?.includes("門別") || race.raceName?.includes("門別");

  if (isMombetsu) {
    tags.push("🌾 門別特化OMEGAエンジン適用中");

    // 1. 空間・展開バイアスの学習（外枠＆先行力重視）
    // 外枠（特に8枠）特注加点
    if (frame >= 5) {
      potential += 25;
      tags.push("🌾 門別外枠アドバンテージ");
      if (frame === 8) {
        potential += 15;
        tags.push("⚡ 門別大外8枠・大爆撃エッジ");
      }
    }

    // 先行力（前走の4角通過順位）の最大重視（上がりタイムより先行力）
    const isFrontRunner = horse.style === "逃げ" || horse.style === "先行";
    if (isFrontRunner) {
      potential += 30;
      tags.push("🏃 門別前残り・極限先行アドバンテージ");
    }
    // 前走4角位置の補正
    if (horse.pastRaces && horse.pastRaces[0]) {
      const pr = horse.pastRaces[0];
      const passing = pr.passingPositions || "";
      const lastPos = parseInt(passing.split("-").pop() || "0");
      if (lastPos > 0 && lastPos <= 4) {
        potential += 20;
        tags.push(`⚡ 門別特選:前走4角4番手以内キープ(4角:${lastPos}番手)`);
      }
    }

    // 2. 人間系シナジー「トップジョッキー × 有力厩舎」コンビフラグ
    const trainerName = horse.trainer || "";
    const eliteJockeysM = ["桑村", "落合", "阿部", "小野", "岩橋", "石川", "服部"];
    const isEliteJockeyM = eliteJockeysM.some(ej => jockey.includes(ej));
    const eliteTrainersM = ["角川", "佐々木", "佐々国", "田中淳", "黒川", "小国", "田中正"];
    const isEliteTrainerM = eliteTrainersM.some(et => trainerName.includes(et));

    if (isEliteJockeyM && isEliteTrainerM) {
      potential += 35;
      tags.push("🌟 門別黄金コンビ:トップジョッキー×有力厩舎");
    }

    // 3. 馬券種マルチタスク学習（仕上がり安定とヒモ大穴激走）
    // 仕上がり安定馬
    if (Math.abs(weightChange) <= 8) {
      potential += 20;
      tags.push("📈 門別仕上がり安定(馬体重増減なし・微小)");
    }
    // 牝馬ボーナス
    if (gender === "牝") {
      potential += 20;
      tags.push("🐎 門別牝馬エッジ");
    }

    // 2着・3着（ヒモ穴）モデルの期待値（大幅体重増減・減量騎手）
    const absWeightChange = Math.abs(weightChange);
    if (absWeightChange >= 10) {
      if (popularity >= 6 || odds >= 12.0) {
        potential += 25;
        tags.push("⚡ 門別特選:大幅馬体重変則仕上げ妙味");
      }
    }
    // 減量騎手フラグ
    const isApprentice = jockey.match(/^[▲△☆◇]/) || jockey.includes("減量") || jockey.includes("▲") || jockey.includes("△");
    if (isApprentice) {
      potential += 30;
      tags.push("🏃 門別若手・減量ジョッキー起爆剤");
    }

    // 4. レース条件（前半・後半）による堅実/波乱モデル切り替え
    if (race.raceNumber <= 6) {
      // 前半レース（1R〜6R）: 若馬・下級戦の堅実モード（1番人気高信頼度）
      if (popularity === 1) {
        potential += 35;
        tags.push("📐 門別前半戦:実力・人気堅実モード");
      }
    } else {
      // 後半レース（7R〜12R）: 古馬混合戦 of 波乱モード
      if (popularity === 1) {
        potential -= 25;
        tags.push("⚠️ 門別後半戦:1番人気過剰被り割引");
      } else if (popularity >= 6 && odds >= 15.0) {
        // 下位人気の激走
        potential += 35;
        tags.push("⚡ 門別後半戦:波乱モード期待値エッジ");
      }
    }
  }

  // ==========================================
  // 【笠松競馬場 超特化型オメガ・プロトコル推論エンジン】
  // ==========================================
  const isKasamatsu = race.venue?.includes("笠松") || race.trackName?.includes("笠松") || race.raceName?.includes("笠松");

  if (isKasamatsu) {
    tags.push("🌾 笠松特化OMEGAエンジン適用中");

    // 1. レース条件・展開特徴量（前半差し・後半先行）
    if (race.raceNumber <= 5) {
      // 前半レース（1R〜5R／下位条件）：差し・追込（末脚）有利
      if (horse.style === "差し" || horse.style === "追込") {
        potential += 25;
        tags.push("📐 前半戦の上がり末脚特化バイアス");
      }
    } else {
      // 後半レース（6R〜10R／上位クラス）：前残り（逃げ・先行）絶対有利
      if (horse.style === "逃げ" || horse.style === "先行") {
        potential += 30;
        tags.push("🏃 後半戦の先行・前残りアドバンテージ");
      }
    }

    // 2. 馬の基本属性・状態特徴量
    // 牝馬および4歳馬の圧倒的勝率
    if (gender === "牝") {
      potential += 20;
      tags.push("🐎 笠松牝馬エッジ");
    }
    if (age === 4) {
      potential += 20;
      tags.push("📈 笠松4歳馬成長エッジ");
    }
    // 馬体重マイナス変動（絞り仕上げ肯定）
    if (weightChange < 0) {
      potential += 15;
      tags.push("🔥 笠松絞り込み勝負仕上げ(マイナス体重差)");
    }

    // 3. 斤量と馬格（斤量比率）の相関特徴量
    const weightVal = weight || 450;
    const loadRatio = (kinryo / weightVal) * 100;
    
    // 1着（本命）候補
    if (kinryo === 55) {
      potential += 25;
      tags.push("🎯 笠松黄金斤量55kg(勝率トップ)");
    }
    if (loadRatio >= 10.0 && loadRatio <= 12.5) {
      potential += 20;
      tags.push(`📐 黄金斤量比率クリア(比率:${loadRatio.toFixed(1)}%)`);
    }
    if (kinryo === 57 && race.raceNumber >= 6) {
      potential += 20;
      tags.push("💪 上級戦57kg実績馬アドバンテージ");
    }
    // 2・3着（ヒモ穴）候補
    if (kinryo <= 54) {
      potential += 20;
      tags.push("⚡ 門前軽量斤量(複勝率バイアス)");
    }
    if (loadRatio >= 13.5 && loadRatio <= 15.5) {
      potential += 25;
      tags.push(`⚡ 軽量小柄馬・2/3着激走フラグ(比率:${loadRatio.toFixed(1)}%)`);
    }

    // 4. 過去実績・能力特徴量
    if (horse.pastRaces && horse.pastRaces[0]) {
      const pr = horse.pastRaces[0];
      
      // アタマ候補の条件
      if (pr.result > 0 && pr.result <= 3) {
        potential += 25;
        tags.push("🏆 前走3着以内・堅実能力値");
      }
      // タイム差1.0秒未満
      if (pr.timeDiff !== undefined && pr.timeDiff < 1.0) {
        potential += 20;
        tags.push("📐 前走僅差仕上げ期待値");
      }

      // 他地区・JRAからの転入馬補正（大敗の無効化と転入ボーナス）
      const hasAwayRace = horse.pastRaces.some(p => p.venue?.match(/(JRA|東京|中山|京都|阪神|新潟|中京|小倉|福島|函館|札幌|大井|川崎|船橋|浦和|門別)/));
      if (hasAwayRace) {
        potential += 30;
        tags.push("🏹 中央・他地区からの転入ボーナス");
      }

      // 近走大敗からの巻き返しヒモ穴候補（過去5走以内に連対実績あり）
      const isRecentBad = pr.result >= 6;
      const hasTop2Past = horse.pastRaces.slice(0, 5).some(p => p.result > 0 && p.result <= 2);
      if (isRecentBad && hasTop2Past) {
        potential += 20;
        tags.push("⚡ 過去5走内好走馬の巻き返し激走期待値");
      }
    }

    // 5. 騎手・枠順のバイアス特徴量（1着と2・3着の分離）
    // 1着勝率バイアス
    if (jockey.includes("渡邊竜") || jockey.includes("渡辺竜") || jockey.includes("渡邊")) {
      potential += 40;
      tags.push("👑 笠松リーディング:渡邊竜也(1着固定特注)");
    } else if (jockey.includes("塚本征")) {
      potential += 25;
      tags.push("🌟 笠松好調騎手:塚本征吾(1着バイアス)");
    }
    if (frame === 5) {
      potential += 20;
      tags.push("📐 笠松勝率No.1の5枠");
    } else if (frame === 6) {
      potential += 15;
      tags.push("📐 万能枠順の6枠");
    }

    // 2・3着複勝率バイアス
    if (jockey.includes("松本一") || jockey.includes("筒井") || jockey.includes("望月")) {
      potential += 20;
      tags.push("⚡ 笠松ヒモ穴特注騎手(2・3着激走)");
    }
    if (frame === 1) {
      potential += 20;
      tags.push("📐 最内枠ロス軽減イン差し枠");
    } else if (frame === 8) {
      potential += 15;
      tags.push("📐 大外8枠・2着確保バイアス");
    }

    // ==========================================
    // 【新設】笠松的中率極限先鋭化ファクター (Kasamatsu Advanced Edge)
    // ==========================================
    // ① 800m戦（電撃スプリント）における全天候外枠絶対優位と内枠自滅リスク
    if (dist === 800) {
      if (frame >= 7) {
        potential += (condition === '重' || condition === '不良') ? 40 : 25;
        tags.push("🚀 笠松800m:外枠スムーズ加速アドバンテージ(砂被りなし)");
      } else if (frame === 1) {
        potential -= (condition === '重' || condition === '不良') ? 45 : 30;
        tags.push("❌ 笠松800m:最内1枠の包まれ砂被り自滅リスク排除");
      }
    }

    // ② 雨・重・不良馬場（泥馬場）時の「砂流出イン高速伸び」バイアス
    if (condition === '重' || condition === '不良') {
      if (frame <= 3 && (horse.style === "逃げ" || horse.style === "先行")) {
        potential += 25;
        tags.push("☔ 笠松道悪物理:内ラチ沿い砂流出による高速イン伸びアドバンテージ");
      }
    }

    // ③ JRA未勝利交流戦における圧倒的レベル差の実力非対称補正
    const isExchange = race.raceName?.match(/(交流|中央|JRA)/);
    if (isExchange) {
      const isJRA = horse.transferFrom === 'JRA' || horse.stableLocation?.match(/(栗東|美浦)/) || horse.trainer?.match(/(栗東|美浦)/);
      if (isJRA) {
        potential += 50;
        tags.push("🚀 笠松交流戦:JRA所属の圧倒的レベル差優位(確勝気配)");
      } else if (horse.belonging?.includes("笠松") || horse.trainer?.includes("笠松")) {
        potential -= 25;
        tags.push("⚠️ 笠松交流戦:地元笠松所属馬の実力レベル差割引");
      }
    }

    // ④ 「笹野博司厩舎 × 渡邊竜也騎手」の連対率60%超黄金勝負ヤリライン
    const trainerName = horse.trainer || '';
    if (trainerName.includes("笹野") && (jockey.includes("渡邊") || jockey.includes("渡辺"))) {
      if (popularity <= 2) {
        potential += 45;
        tags.push("👑 笠松最強黄金タッグ:笹野×渡邊(勝負ヤリ1着固定)");
      } else {
        potential += 25;
        tags.push("👑 笠松最強黄金タッグ:笹野×渡邊(実力信頼)");
      }
    }
  }

  // ==========================================
  // 【金沢競馬場 超特化型オメガ・プロトコル推論エンジン】
  // ==========================================
  const isKanazawa = race.venue?.includes("金沢") || race.trackName?.includes("金沢") || race.raceName?.includes("金沢");

  if (isKanazawa) {
    tags.push("🌾 金沢特化OMEGAエンジン適用中");

    const hStyle = horse.style || '中団';

    // 1. 馬体重・成長バイアス（フィジカルパラメータ）
    if (weightChange <= -10 && weightChange >= -20) {
      potential += 30;
      tags.push('金沢:極限の仕上げ(激走フラグ)');
    } else if (weightChange > 16) {
      potential -= 25;
      tags.push('⚠️金沢:過剰な馬体増(割引)');
    } else if (age <= 3 && weightChange >= 10 && weightChange <= 14) {
      potential += 30;
      tags.push('金沢:若駒成長シナジー(大幅増)');
    }

    if (gender === "牝") {
      potential += 20;
      tags.push("🐎 金沢牝馬エッジ");
    }

    // 2. 空間物理・砂地獄・脚質シナジー（枠順バイアスの一元化）
    const isHeavyMud = condition === '重' || condition === '不良';
    if (!isHeavyMud) {
      // 良馬場・稍重：内ラチ沿いの砂が極端に深く、最内1枠は底なし沼を走らされるため大幅割引
      if (frame === 1) {
        potential -= 30;
        tags.push("⚠️ 金沢名物:イン砂地獄(底なし沼)1枠リスク割引");
      } else if (frame === 2) {
        potential -= 25;
        tags.push("⚠️ 金沢:2枠イン砂深割引");
      } else if (frame === 8) {
        potential += 35;
        tags.push("📈 金沢特有:大外8枠スムーズ外伸びアドバンテージ");
      } else if (frame === 7) {
        potential += 30;
        tags.push("📈 金沢:7枠外伸びエッジ");
      } else if (frame === 5 || frame === 6) {
        potential += 20;
        tags.push("📈 金沢:中外枠アドバンテージ");
      } else if (frame === 4) {
        potential -= 15;
        tags.push("⚠️ 金沢:4枠包まれ懸念");
      }
    } else {
      // 重・不良：逆にインラチ沿いの砂が固まり、一時的に高速イン伸び化
      if (frame <= 2 && (hStyle === "逃げ" || hStyle === "先行")) {
        potential += 25;
        tags.push("☔ 金沢道悪物理:泥馬場イン締まり高速イン逃げエッジ");
      }
    }

    // 脚質×枠順シナジー
    if ((hStyle === '逃げ' || hStyle === '先行') && (frame === 1 || frame === 2)) {
      if (popularity <= 3) {
        potential -= 20;
        tags.push('⚠️危険な人気馬(内枠×先行 of 罠)');
      }
    } else if ((hStyle === '中団' || hStyle === '後方') && (frame >= 5 && frame <= 7)) {
      potential += 25;
      tags.push('🚀金沢シナジー(外枠×差し)');
    }

    // 3. 「金沢の絶対神」吉原寛人騎手 ＆ リーディングトップ勢 of 圧倒的支配力
    if (jockey.includes("吉原")) {
      if (popularity <= 2) {
        potential += 50;
        tags.push("👑 金沢の絶対神:吉原寛人(勝負ヤリ1着固定)");
      } else {
        potential += 30;
        tags.push("👑 金沢の絶対神:吉原寛人(異次元技術バフ)");
      }
    } else if (jockey.match(/(青柳|中島龍|栗原)/)) {
      potential += 20;
      tags.push("🌟 金沢リーディング上位騎手(1着バイアス)");
    }

    // 4. 逃げ・先行圧倒的有利のワンターン超小回りバイアス
    if (hStyle === "逃げ" || hStyle === "先行") {
      potential += 35;
      tags.push("🏃 金沢超小回り:前残り先行絶対有利");
    } else if (hStyle === "追込") {
      potential -= 25;
      tags.push("⚠️ 金沢超小回り:直線極短・差し届かずリスク割引");
    }

    // 5. 他地区・JRAからの転入格上＆超有力厩舎勝負仕上げ
    const trainerName = horse.trainer || '';
    if (trainerName.match(/(中川雅|金田一)/)) {
      potential += 25;
      tags.push("🏰 金沢超エリート厩舎:勝負メイチ仕上げ");
    }

    const hasAwayExp = horse.pastRaces && horse.pastRaces.some(p => p.venue?.match(/(JRA|大井|川崎|船橋|浦和|門別)/));
    if (hasAwayExp && horse.pastRaces && horse.pastRaces[0] && (horse.pastRaces[0].venue?.includes("金沢") === false)) {
      potential += 30;
      tags.push("🚀 転入エッジ:他地区・中央からの格上スピード能力差");
    }
  }



  // ==========================================
  // 【川崎競馬場 超特化型オメガ・プロトコル推論エンジン】
  // ==========================================
  const isKawasaki = race.venue?.includes("川崎") || race.trackName?.includes("川崎") || race.raceName?.includes("川崎");

  if (isKawasaki) {
    tags.push("🐎 川崎特化OMEGAエンジン適用中");

    const hStyle = horse.style || '中団';
    const trainerName = horse.trainer || '';

    // 1. 馬体重・成長バイアス・馬格（フィジカルパラメータ）
    if (weightChange <= -10 && weightChange >= -20) {
      potential += 30;
      tags.push('川崎:極限の仕上げ(激走フラグ)');
    } else if (weightChange <= -25) {
      potential -= 25;
      tags.push('❌川崎:過剰な馬体減(消耗懸念)');
    } else if (age <= 3 && weightChange >= 10 && weightChange <= 14) {
      potential += 30;
      tags.push('川崎:若駒成長シナジー(大幅増)');
    } else if (weightChange > 16) {
      potential -= 25;
      tags.push('⚠️川崎:過剰な馬体増(割引)');
    }

    if (weight >= 500) {
      potential += 25;
      tags.push("💪 川崎タフ良馬場・大型パワー馬アドバンテージ");
    }

    // 2. 基本属性
    if (gender === "牝") {
      potential += 20;
      tags.push("🐎 川崎牝馬アドバンテージ(ダート割引無効化)");
    }
    if (age <= 4) {
      potential += 20;
      tags.push("📈 川崎ヤングジェネレーションエッジ");
    }

    // 血統（種牡馬適性）
    const isSpecialSire = bloodline.includes("ミスターメロディ") || bloodline.includes("エスポワールシチー");
    const isRecommendedSire = bloodline.includes("パイロ") || bloodline.includes("ホッコータルマエ") || bloodline.includes("ダノンレジェンド") || bloodline.includes("ゴールドドリーム");
    if (isSpecialSire) {
      potential += 30;
      tags.push("🧬 川崎特注ダート血統(勝負気配)");
    } else if (isRecommendedSire) {
      potential += 20;
      tags.push("🧬 川崎ダート実績血統補正");
    }

    // 3. 空間物理と脚質シナジー（枠順バイアスの一元化）
    // 枠順バイアス
    if (frame === 8) {
      potential += 35;
      tags.push("⚠️ 川崎8枠:外目スムーズ加速エッジ");
      if (popularity >= 6 || odds >= 12.0) {
        potential += 20;
        tags.push("⚡ 大外8枠・複勝ヒモ穴エッジ");
      }
    } else if (frame === 7) {
      potential += 30;
      tags.push("📐 川崎7枠:好走バイアス");
    } else if (frame === 4 || frame === 5 || frame === 6) {
      potential += 25;
      tags.push("📐 川崎勝率No.1 of 中枠エッジ");
    } else if (frame === 2) {
      potential -= 25;
      tags.push("⚠️ 川崎2枠:窮屈・割引");
    } else if (frame === 1) {
      potential -= 15;
      tags.push("⚠️ 川崎1枠:包まれ砂被りリスク");
    }

    // 脚質×枠順シナジー
    if ((hStyle === '逃げ' || hStyle === '先行') && (frame === 1 || frame === 2)) {
      if (popularity <= 3) {
        potential -= 20;
        tags.push('⚠️危険な人気馬(内枠×先行 of 罠)');
      }
    } else if ((hStyle === '中団' || hStyle === '後方') && (frame >= 5 && frame <= 7)) {
      potential += 25;
      tags.push('🚀川崎シナジー(外枠×差し)');
    }

    // 後半戦（6R〜12R）の内枠（1,2枠）インラチ復活バイアス
    if (race.raceNumber >= 6 && (frame === 1 || frame === 2) && !tags.some(t => t.includes("割引") || t.includes("リスク"))) {
      potential += 20;
      tags.push("📐 川崎後半戦 of イン復活ロスなし補正");
    }

    // 距離別ペース予想
    if (dist <= 900) {
      if (hStyle === "逃げ" || hStyle === "先行") {
        potential += 35;
        tags.push("🏃 川崎900m電撃スプリント補正");
      }
    } else if (dist >= 1400) {
      if (hStyle === "差し" || hStyle === "追込") {
        potential += 20;
        tags.push("💪 川崎1400m以上タフな持久戦補正");
      }
    }

    // 4. 所属エリア・厩舎（勝負仕上げバイアス）
    const isKawasakiHome = horse.stableLocation?.includes("川崎") || trainerName.includes("川崎") || (!horse.stableLocation && horse.belonging?.includes("川崎"));
    if (isKawasakiHome) {
      potential += 40;
      tags.push("🏠 川崎ホーム所属(圧倒的ホームエッジ)");
      if (trainerName.match(/(内田勝義|高月賢一|林隆之|山崎尋美|佐藤博紀|八木正喜)/)) {
        potential += 25;
        tags.push("🏰 川崎エリート厩舎:勝負メイチ仕上げ");
      }
    } else {
      potential -= 15;
      tags.push("⚠️ 川崎アウェイ遠征馬(割引)");
    }

    // 5. 騎手パラメータ（ジョッキーファクター）
    const isEliteKawasakiJ = ["野畑", "笹川", "矢野", "町田", "御神本", "新原"].some(j => jockey.includes(j));
    if (isEliteKawasakiJ && popularity <= 2) {
      potential += 35;
      tags.push("👑 川崎エリートジョッキー×上位人気高信頼度");
    }
    const isDarkJ = ["古岡", "藤江", "藤本"].some(j => jockey.includes(j));
    if (isDarkJ && (popularity >= 6 || odds >= 12.0)) {
      potential += 30;
      tags.push("⚡ 川崎大穴メーカー騎手特注フラグ");
    }
    const isVisitorJ = jockey.match(/(ルメール|川田|武豊|レーン|モレイラ|シャペル|デムーロ)/);
    if (isVisitorJ) {
      potential += 35;
      tags.push("✈️ 川崎スポット・JRA遠征エリート補正");
    }
  }

  // ==========================================
  // 【園田・姫路競馬場 超特化型オメガ・プロトコル推論エンジン】
  // ==========================================
  const isSonoda = race.venue?.includes("園田") || race.trackName?.includes("園田") || race.raceName?.includes("園田") || 
                   race.venue?.includes("姫路") || race.trackName?.includes("姫路") || race.raceName?.includes("姫路");

  if (isSonoda) {
    tags.push("🌾 園田特化OMEGAエンジン適用中");

    // 1. 単勝人気ファクター（本命・対抗超重視モデル）
    if (popularity <= 3) {
      potential += 35;
      tags.push("🎯 園田本命・対抗信頼度エッジ");
      if (popularity === 1) {
        potential += 40;
        tags.push("👑 園田1番人気絶対軸補正");
      }
    } else {
      potential -= 20; // 4番人気以下の1着率の大幅低下に伴う減点
      tags.push("⚠️ 園田4番人気以下アタマ割引");
    }

    // 2. レースクラス別 ＆ 「魔の3〜4コーナー超急カーブ物理」
    if (horse.style === "逃げ" || horse.style === "先行") {
      potential += 35;
      tags.push("🏃 園田超急カーブ物理:前残り先行絶対有利");
    } else if (horse.style === "追込") {
      potential -= 25;
      tags.push("⚠️ 園田超急カーブ物理:大外膨らみロス割引");
    }

    if (race.raceNumber <= 6) {
      // 前半レース（1R〜6R）：先行力（前残り）最重視
      if (horse.style === "逃げ" || horse.style === "先行") {
        potential += 15; // 先行絶対有利をさらに上乗せ
        tags.push("📐 園田前半戦:先行・前残りアドバンテージ");
      }
    } else {
      // 後半レース（7R〜12R）：上がり3ハロン（極上末脚）最重視
      if (horse.style === "差し" || horse.style === "追込") {
        potential += 30;
        tags.push("🏹 園田後半戦:極上末脚特化バイアス");
      }
      // 上がりタイムの実績補正
      if (horse.pastRaces && horse.pastRaces[0]) {
        const last3fNum = parseFloat(horse.pastRaces[0].last3fTime || "40.0");
        if (last3fNum > 0 && last3fNum <= 37.5) {
          potential += 20;
          tags.push(`⚡ 園田後半戦:前走好末脚を計測(3F:${last3fNum}秒)`);
        }
      }
    }

    // 3. 枠順バイアス（有利枠・不利枠 ＆ 泥馬場イン高速伸び）
    const isHeavyMud = condition === '重' || condition === '不良';
    if (isHeavyMud && frame <= 3 && (horse.style === "逃げ" || horse.style === "先行")) {
      potential += 30;
      tags.push("☔ 園田道悪物理:イン砂流出・超高速イン逃げアドバンテージ");
    }

    if (frame === 3 || frame === 4) {
      potential += 25;
      tags.push("📐 園田安定の3・4枠バイアス");
    } else if (frame === 8) {
      potential += 30;
      tags.push("📈 園田勝率・複勝率トップの8枠");
    } else if (frame === 1) {
      potential -= 30; // 最内枠極度不振ペナルティ（買い目排除）
      tags.push("❌ 園田1枠ペナルティ(不振枠割引)");
    }

    // 4. 馬体重変動ファクター
    if (weightChange < 0 && weightChange >= -9) {
      potential += 20;
      tags.push("🔥 園田馬体重絞り勝負仕上げ");
    } else if (weightChange === 0) {
      potential += 15;
      tags.push("📈 園田馬体重維持・安定トレンド");
    } else if (weightChange <= -10) {
      potential -= 40; // 極度の細化・体調不良リスク排除
      tags.push("❌ 園田馬体重二桁急減ペナルティ");
    } else if (weightChange >= 10) {
      if (potential >= 520) {
        potential += 10;
        tags.push("⚡ 園田実績馬の馬体成長・リフレッシュボーナス");
      }
    }

    // 5. ヒューマンファクター（吉村智洋の勝負ヤリ ＆ リーディングトップ連鎖）
    if (jockey.includes("吉村智")) {
      if (popularity <= 2) {
        potential += 50;
        tags.push("👑 園田の絶対王者:吉村智洋(勝負ヤリ1着固定)");
      } else {
        potential += 30;
        tags.push("👑 園田の絶対王者:吉村智洋(無比の進路取り)");
      }
    } else if (jockey.match(/(下原|廣瀬|田中学|大山真)/)) {
      potential += 20;
      tags.push("🌟 園田トップエリート騎手(1着バイアス)");
    } else if (jockey.includes("小牧太") || jockey.includes("川原")) {
      potential += 25;
      tags.push("🌟 園田ベテランジョッキー複勝バイアス");
    }
    
    // 好調厩舎（調教師）
    const isEliteTrainerS = ["山口浩", "永島", "盛本", "長倉"].some(t => horse.trainer?.includes(t));
    if (isEliteTrainerS) {
      potential += 25;
      tags.push("🏰 園田名門・好調厩舎固め打ちバイアス");
    }

    // 6. 「西脇所属馬」の広大トレーニングセンター仕上げエッジ
    const isNishiwaki = horse.stableLocation?.includes("西脇") || horse.trainer?.includes("西脇");
    if (isNishiwaki) {
      const isGradeOrSpecial = race.raceName?.match(/(特別|重賞|選抜|ステークス|カップ)/);
      if (dist >= 1400 || isGradeOrSpecial) {
        potential += 25;
        tags.push("🏰 西脇エッジ:広大トレセン仕上げ(長距離/上級条件強襲)");
      } else {
        potential += 15;
        tags.push("🏰 西脇所属馬(スタミナ十分)");
      }
    }

    // 7. 交流重賞の「所属バイアス」
    const isKyomeiS = race.raceName?.match(/(のじぎく賞|交流|重賞|特別|兵庫)/);
    if (isKyomeiS) {
      const trainerName = horse.trainer || "";
      const stableName = horse.stableLocation || "";
      const isHyogo = stableName.includes("園田") || stableName.includes("西脇") || trainerName.includes("園田") || trainerName.includes("西脇");
      
      if (!isHyogo && (stableName.match(/(大井|川崎|船橋|浦和|門別|北海道|南関)/) || trainerName.match(/(大井|川崎|船橋|浦和|門別|北海道|南関)/))) {
        potential += 50;
        tags.push("✈️ 交流重賞:他地区エリート遠征馬エッジ");
      } else {
        potential -= 25;
        tags.push("⚠️ 交流重賞:地元兵庫所属馬ディスカウント");
      }
    }
  }

  // ==========================================
  // 【盛岡競馬場 超特化型オメガ・プロトコル推論エンジン】
  // ==========================================
  const isMorioka = race.venue?.includes("盛岡") || race.trackName?.includes("盛岡") || race.raceName?.includes("盛岡") ||
                    race.venue?.includes("水沢") || race.trackName?.includes("水沢") || race.raceName?.includes("水沢");

  if (isMorioka) {
    tags.push("🌾 盛岡・水沢特化OMEGAエンジン適用中");

    const hStyle = horse.style || '中団';
    const trainerName = horse.trainer || '';

    // 1. 馬体重・成長バイアス（フィジカルパラメータ）
    if (Math.abs(weightChange) <= 3) {
      potential += 30;
      tags.push('🏹岩手:馬体安定(状態キープ)');
    } else if (weightChange <= -4) {
      potential -= 35;
      tags.push('⚠️岩手:馬体減少リスク(消耗・ストレス懸念)');
    } else if (weightChange >= 7 && popularity <= 3) {
      potential += 25;
      tags.push('🚀岩手:成長・立て直し(実力馬 of 馬体増)');
    }

    // 2. 空間物理と脚質シナジー（枠順バイアスの一元化）
    // 枠順バイアス
    if (frame >= 7) {
      potential += 35;
      tags.push("盛岡:外枠絶対優位(砂被りなし)");
    } else if (frame === 1) {
      potential += 20;
      tags.push("盛岡:最内枠健闘");
    } else if (frame === 2 || frame === 4) {
      potential -= 25;
      tags.push("⚠️盛岡:死滅枠(2/4枠)懸念");
    }

    // 脚質×枠順シナジー
    if ((hStyle === '逃げ' || hStyle === '先行') && (frame === 1 || frame === 2)) {
      if (popularity <= 3) {
        potential -= 20;
        tags.push('⚠️危険な人気馬(内枠×先行 of 罠)');
      }
    } else if ((hStyle === '中団' || hStyle === '後方') && (frame >= 5 && frame <= 7)) {
      potential += 25;
      tags.push('🚀盛岡シナジー(外枠×差し)');
    }

    // 後半戦（6R〜12R）の極端枠バイアス
    if (race.raceNumber >= 6) {
      if (frame === 1 || (frame >= 6 && frame <= 8)) {
        potential += 20;
        tags.push("🌃盛岡後半:内外極端枠有利");
      }
    }

    // 3. 騎手・厩舎（ヒューマンファクター）
    if (jockey.includes('高松') || jockey.includes('高橋悠') || jockey.includes('山本聡')) {
      potential += 30;
      tags.push('盛岡:特効上位騎手(頭候補)');
    } else if (jockey.includes('塚本涼') || jockey.includes('坂井瑛') || /[☆△▲◇]/.test(jockey)) {
      potential += 15;
      tags.push('盛岡:ヒモ穴警戒(減量/若手)');
    }

    if (trainerName.match(/(佐藤雅彦|板垣吉則|菅原右吉)/)) {
      potential += 30;
      tags.push('🔥岩手好調厩舎:勝利量産フェーズ');
    } else if (trainerName.match(/(小林俊彦|及川良春|佐々木由則)/)) {
      potential += 15;
      tags.push('🛡️岩手安定厩舎:馬券圏内（ヒモ）軸');
    }

    if (race.raceNumber >= 11 && trainerName.includes('佐藤浩')) {
      potential += 25;
      tags.push('🎯岩手勝負厩舎:メイン競走特化');
    }
  }

  // ==========================================
  // 【名古屋・弥富競馬場 超特化型オメガ・プロトコル推論エンジン】
  // ==========================================
  const isNagoya = race.venue?.includes("名古屋") || race.trackName?.includes("名古屋") || race.raceName?.includes("名古屋") ||
                   race.venue?.includes("弥富") || race.trackName?.includes("弥富") || race.raceName?.includes("弥富");

  if (isNagoya) {
    tags.push("🌾 名古屋・弥富特化OMEGAエンジン適用中");

    // 1. 鞍上強化（リーディング上位騎手エッジ）
    const topJockeys = ['岡部誠', '今井貴大', '大畑雅章', '加藤聡一', '丸野勝虎'];
    if (topJockeys.some(j => jockey.includes(j))) {
      potential += 25;
      tags.push('名古屋:鞍上強化・リーディングエリート');
    }

    // 2. Yatomi Physics (弥富物理補正) の統合・適用
    const prevRace = horse.pastRaces && horse.pastRaces[0];
    const physicsResult = calculateYatomiPhysics(
      horse,
      prevRace,
      race.windSpeed || 0,
      race.isHeadwind || false,
      race.condition,
      race.isInBiasActive || false
    );

    if (physicsResult === 1) {
      potential += 45; // 物理的アドバンテージを持つ狙い馬として加点
      isTargetYatomi = true;
      tags.push("⚡ 弥富物理エッジ適合馬(風速・外回し・馬格パワー・インバイアス総合判定)");
    }
  }

  // （hm, jm の取得は関数冒頭に移動済み）

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

    // ==========================================
    // 【新設】① 長期間の持ち時計（生涯ベストタイム）エッジ加点
    // ==========================================
    const key = `${race.venue}_${race.distance}`;
    if (hm.bestTime && hm.bestTime[key]) {
      const bestTimeStr = hm.bestTime[key];
      // ※ 今回の出走馬全体との相対比較はコンテキストがないため、絶対的なスピード加点として機能させる
      // クラス基準タイムや直近5走の最速タイムと比べても遜色ない場合は底力として評価
      potential += 25;
      tags.push(`⌚ 生涯ベスト時計保有(${bestTimeStr})`);
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
  // isEliteJockey は冒頭（150行目付近）で定義済みのため、ここでは再宣言しない

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

  // ---------------------------------------------------
  // 【新設】厩舎・所属バイアス解析（固め打ち厩舎 & 遠征馬エッジ）
  // ---------------------------------------------------
  // ① 園田・好調厩舎（実績に基づく固め打ち警戒）
  const sonodaHotStables = /(山口浩幸|永島太郎|盛本信尋|長倉功|高馬元昭|諏訪貴正)/;
  if (trainer.match(sonodaHotStables)) {
    potential += 25;
    tags.push('🔥園田好調厩舎:固め打ち警戒');
  }

  // ② 地方全国交流重賞における「他地区遠征馬」の圧倒的優位
  // （のじぎく賞等の交流重賞では大井・北海道等の他地区勢が上位独占する傾向）
  const isExchangeRace = race.raceName?.match(/(交流|のじぎく賞|全国|選抜|中央|JRA)/);
  const eliteAwayRegions = /(大井|北海道|門別|浦和|船橋|川崎)/;
  
  if (isExchangeRace) {
    if (horse.stableLocation?.match(eliteAwayRegions)) {
      potential += 50; // エリート地区のレベル差を最重視
      tags.push(`🏹交流戦エッジ:他地区遠征馬(${horse.stableLocation})`);
    } else if (horse.stableLocation?.match(/(兵庫|園田|西脇)/)) {
      potential -= 25; // 地元勢の劣勢を反映（Sランク相当の能力差）
      tags.push('⚠️交流戦リスク:地元兵庫勢(レベル差懸念)');
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
  const frontRunnersCount = (race.horses || []).filter(h => h.style === '逃げ' || h.style === '先行' || h.style === '好位').length;
  const isHighPaceSim = frontRunnersCount >= 6; // 先行馬が多い -> 激戦 -> 差し有利
  // const isSlowPaceSim = frontRunnersCount <= 2; // 先行馬が少ない -> 展開利 -> 逃げ有利

  // ==========================================
  // 【全場共通】鞍上（騎手）エリート補正
  // ==========================================
  if (isEliteJockey) {
    potential += 25;
    tags.push('👑エリート鞍上');
  }

  if (jm) {
    // 会場別エリート
    if (jm.venueStats[race.venue]) {
      const vs = jm.venueStats[race.venue];
      if (vs.total >= 3) {
        const winRate = vs.wins / vs.total;
        const top3Rate = vs.top3 / vs.total;
        if (winRate > 0.20) { potential += 25; tags.push('会場勝率エリート'); }
        else if (top3Rate > 0.40) { potential += 20; tags.push('会場安定勢'); }
      }
    }

    // ==========================================
    // 【新設】② 騎手の全国通算勝率エリート加点
    // ==========================================
    if (jm.totalRaces >= 10) {
      const nationwideWinRate = jm.wins / jm.totalRaces;
      if (nationwideWinRate >= 0.15) {
        potential += 15;
        tags.push(`👑 全国トップジョッキー(勝率${(nationwideWinRate*100).toFixed(1)}%)`);
      }
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
  // 【新設】地方競馬・超短距離（スプリント）＆回り（左右）適性解析
  // ==========================================
  if (dist <= 1000) {
    // 1000m以下の超短距離（川崎900m、船橋1000mなど）
    // 逃げ・先行脚質への圧倒的加点
    if (horse.style === '逃げ') {
      potential += 45;
      tags.push('🚀超スプリント逃げ(絶対有利)');
    } else if (horse.style === '先行') {
      potential += 30;
      tags.push('🚀超スプリント先行(展開利)');
    } else if (horse.style === '差し' || horse.style === '追込') {
      potential -= 25;
      tags.push('⚠️超スプリント差し追込(届かず懸念)');
    }

    // 内枠有利（川崎900m等）
    if (frame <= 3) {
      potential += 20;
      tags.push('🎯超スプリント内枠エッジ');
    } else if (frame >= 7) {
      potential -= 10;
      tags.push('⚠️超スプリント外枠ロス懸念');
    }
  }



  // 過去走から「回り（左右）」の適性を算出
  if (horse.pastRaces && horse.pastRaces.length > 0) {
    const leftTurnRaces = horse.pastRaces.filter(pr => pr.direction === '左');
    const rightTurnRaces = horse.pastRaces.filter(pr => pr.direction === '右');

    const leftVenues = ['川崎', '船橋', '浦和', '盛岡', '新潟', '東京', '中京'];
    const isLeftTurnRace = leftVenues.some(v => trackName.includes(v));

    if (isLeftTurnRace) {
      const leftGoodRaces = leftTurnRaces.filter(pr => pr.result <= 3);
      if (leftGoodRaces.length >= 2) {
        potential += 25;
        tags.push(`🔄サウスポー適性(左回り好走${leftGoodRaces.length}回)`);
      }
    } else {
      const rightGoodRaces = rightTurnRaces.filter(pr => pr.result <= 3);
      if (rightGoodRaces.length >= 2) {
        potential += 20;
        tags.push(`🔄右回り好走実績あり(${rightGoodRaces.length}回)`);
      }
    }
  }

  // 地元所属ボーナス（例：川崎開催で川崎所属）
  if (horse.belonging && trackName.includes(horse.belonging)) {
    potential += 20;
    tags.push(`🏠地元自場アドバンテージ(${horse.belonging})`);
  }

  // ==========================================
  // 【新設】JRA/NAR実績データ・出来事・ラップタイムを活用したAI予想
  // ==========================================
  
  // 1. 不利・出来事履歴による補正 (Incident Analysis)
  if (hm && hm.incidents && hm.incidents.length > 0) {
    let hasSeriousDisadvantage = false;
    let hasTimeLimitPenalty = false;

    hm.incidents.forEach(inc => {
      const note = inc.note;
      if (note.includes('不利') || note.includes('斜行被害') || note.includes('審議') || note.includes('挟まれ') || note.includes('出遅れ')) {
        hasSeriousDisadvantage = true;
      }
      if (note.includes('タイムオーバー') || note.includes('出走制限') || note.includes('鼻出血')) {
        hasTimeLimitPenalty = true;
      }
    });

    if (hasSeriousDisadvantage) {
      // 不利による度外視。次走での巻き返し期待値激増
      potential += 40;
      distortionBoost += 0.5;
      tags.push('🔥度外視:前走不利巻き返し期待');
    }
    if (hasTimeLimitPenalty) {
      // 著しい能力減衰・出来事ペナルティ
      potential -= 45;
      tags.push('⚠️リスク:出来事ペナルティ(能力疑問)');
    }
  }

  // 2. ラップタイム (ハロンタイム) 適合度スコアリング (Lap Pattern Fit)
  if (masterData.laps) {
    const lapKey = `${race.venue}_${race.distance}_${race.surface}`;
    const historicalLaps = masterData.laps[lapKey];
    if (historicalLaps && historicalLaps.length > 0) {
      let frontPaceSum = 0;
      let rearPaceSum = 0;
      let calculatedCount = 0;

      historicalLaps.forEach(hl => {
        if (hl.laps.length >= 6) {
          const l1 = parseFloat(hl.laps[0]) || 12;
          const l2 = parseFloat(hl.laps[1]) || 11;
          const l3 = parseFloat(hl.laps[2]) || 12;
          const le = hl.laps[hl.laps.length - 1] ? parseFloat(hl.laps[hl.laps.length - 1]) : 12;
          const le1 = hl.laps[hl.laps.length - 2] ? parseFloat(hl.laps[hl.laps.length - 2]) : 12;
          const le2 = hl.laps[hl.laps.length - 3] ? parseFloat(hl.laps[hl.laps.length - 3]) : 12;
          frontPaceSum += (l1 + l2 + l3);
          rearPaceSum += (le + le1 + le2);
          calculatedCount++;
        }
      });

      if (calculatedCount > 0) {
        const avgFront = frontPaceSum / calculatedCount;
        const avgRear = rearPaceSum / calculatedCount;
        const isHighPace = avgFront < avgRear; // 前半の方が速い = ハイペース前傾

        if (isHighPace) {
          if (horse.style === '差し' || horse.style === '追込') {
            potential += 25;
            tags.push('⚡前傾ハイペース適合(差し追込有利)');
          } else if (horse.style === '逃げ') {
            potential -= 15;
            tags.push('⚠️前傾ハイペースリスク(逃げバテ注意)');
          }
        } else {
          if (horse.style === '逃げ' || horse.style === '先行') {
            potential += 30;
            tags.push('🚀後傾スローペース適合(逃げ先行有利)');
          } else if (horse.style === '追込') {
            potential -= 20;
            tags.push('⚠️後傾スローペースリスク(追込不発懸念)');
          }
        }
      }
    }
  }

  // 3. 血統・牧場（生産牧場）・馬主実績ボーナス (Synergy Bonus)
  const sireName = horse.sire || '';
  const breederName = horse.breeder || '';

  if (race.surface === 'ダート') {
    const dirtEliteSires = /(ドレフォン|シニスターミニスタ|ヘニーヒューズ|マジェスティックウォリアー|パイロ|ミッキーアイル)/;
    if (sireName.match(dirtEliteSires)) {
      potential += 25;
      tags.push(`🧬ダート黄金血統(${sireName})`);
    }

    const eliteDirtBreeders = /(カタオカフアーム|ノーザンファーム|社台|グランド牧場|ヤナガワ牧場)/;
    if (breederName.match(eliteDirtBreeders)) {
      potential += 20;
      tags.push(`🏡ダート優秀牧場(${breederName})`);
    }
  } else if (race.surface === '芝') {
    const turfEliteSires = /(ディープインパクト|ロードカナロア|キタサンブラック|エピファネイア|モーリス|ハーツクライ)/;
    if (sireName.match(turfEliteSires)) {
      potential += 20;
      tags.push(`🧬芝クラシック血統(${sireName})`);
    }
    if (breederName.match(/(ノーザンファーム|社台ファーム|追分ファーム)/)) {
      potential += 25;
      tags.push('🏡芝エリート生産牧場');
    }
  }

  // 【新設】母の父（BMS）によるダート適性・雨天道悪適性判定
  const bmsName = horse.bms || '';
  if (bmsName) {
    // ① ダート適性に優れたBMS血統エッジ
    if (race.surface === 'ダート') {
      const dirtEliteBMS = /(クロフネ|フレンチデピュティ|ゴールドアリュール|ブライアンズタイム|シンボリクリスエス|ワイルドラッシュ|エンドスウィープ)/;
      if (bmsName.match(dirtEliteBMS)) {
        potential += 20;
        tags.push(`💪 砂のスタミナ(母父): ダート適性に優れたBMS血統エッジ(${bmsName})`);
      }
    }

    // ② 雨天・道悪（重・不良馬場）に適したBMS適性
    if (race.condition === '重' || race.condition === '不良') {
      const mudEliteBMS = /(クロフネ|フレンチデピュティ|キングカメハメハ|シンボリクリスエス|メジロマックイーン|スペシャルウィーク|アグネスタキオン)/;
      if (bmsName.match(mudEliteBMS)) {
        potential += 25;
        tags.push(`🌧️ 道悪の鬼(母父): 雨天馬場に適したBMS適性(${bmsName})`);
      }
    }
  }

  // ==========================================
  // 【新設】地方競馬 (NAR) 特有の実績・遠征・小回りバイアス評価
  // ==========================================
  const isNarTrack = /(川崎|船橋|大井|浦和|門別|盛岡|水沢|金沢|笠松|名古屋|園田|姫路|高知|佐賀)/.test(trackName);
  const horseBelonging = horse.belonging || (hm ? (hm as { belonging?: string }).belonging : '') || '';

  if (isNarTrack) {
    // 1. 他地区所属・遠征エッジの判定 (Region Synergy)
    if (horseBelonging) {
      const isAway = !trackName.includes(horseBelonging);
      if (isAway) {
        if (horseBelonging === '大井' && (trackName.includes('川崎') || trackName.includes('浦和'))) {
          potential += 20;
          tags.push(`🏹南関他場遠征エッジ(${horseBelonging}→${trackName})`);
        } else if (horseBelonging === '船橋' && trackName.includes('川崎')) {
          potential += 15;
          tags.push(`🏹遠征シナジー(${horseBelonging}→川崎)`);
        }
      }
    }

    // 2. 地方競馬の「先行脚質」と「内枠」の小回り適合エッジ
    if (horse.style === '逃げ' || horse.style === '先行') {
      if (horse.number >= 1 && horse.number <= 4) {
        potential += 25;
        tags.push('🎯地方内枠逃げ先行アドバンテージ');
      }
    }
  }

  // 3. 超短距離・スプリント（1000m以下、特に川崎900m）の実績評価
  if (dist <= 1000) {
    let hasSprintRecord = false;
    if (hm && hm.results) {
      hasSprintRecord = hm.results.some(r => r.distance <= 1000 && r.rank <= 3);
    }
    if (!hasSprintRecord && horse.pastRaces) {
      hasSprintRecord = horse.pastRaces.some(pr => pr.distance <= 1000 && pr.result <= 3);
    }

    if (hasSprintRecord) {
      potential += 30;
      tags.push('⏱️超短距離スピード実績値あり');
    }
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
  // 馬体重増減エントロピー解析（安定性 vs 激変の期待値）
  // ==========================================
  // ① 1着候補パターン：小幅な変動（±8kg以内）
  // 統計的に勝ち馬の多くがこの範囲に集中（安定した仕上げ）
  if (Math.abs(weightChange) <= 8) {
    potential += 35;
    tags.push('🏹安定馬体(1着候補:±8kg内)');
    
    // 後半レース（8R〜12R）でのマイナス体重は「究極の仕上げ」としてさらに評価
    if (race.raceNumber >= 8 && weightChange < 0) {
      potential += 20;
      tags.push('🔥後半戦マイナス体重(メイチ絞り)');
    }
  } 
  
  // ② 紐穴（2-3着）候補パターン：大幅な変動（±10kg以上）
  // 勝ち切る力は削がれる傾向にあるが、波乱の主役（ヒモ）になりやすい
  else if (Math.abs(weightChange) >= 10) {
    // ポテンシャル（1着確率）は控えめに、歪み（紐穴期待値）を大幅増
    distortionBoost += 0.8;
    tags.push('💎馬体激変:紐穴激走サイン');

    if (weightChange >= 10) {
      // 大幅増（成長分または休養明け）
      if (age <= 3 && weightChange <= 35) {
        potential += 20; // 若駒は成長分として一定の勝機も残す
        tags.push('🚀若駒成長分(3着内期待)');
      } else if (weightChange <= 16) {
        potential += 10;
        tags.push('🚀馬体充実(ヒモ警戒)');
      } else {
        potential -= 20;
        tags.push('⚠️太目残り注意(2-3着まで)');
      }
    } else if (weightChange <= -10) {
      // 大幅減（絞り込みまたは消耗）
      if (weightChange >= -18) {
        potential += 15;
        tags.push('🎯究極の絞り(ヒモ荒れ注意)');
      } else {
        potential -= 30;
        tags.push('⚠️過剰消耗懸念(危険な紐穴)');
      }
    }
  }
  
  // ==========================================
  // 【刷新】レース・フェーズ別 年齢適性バイアス
  // ==========================================
  if (race.raceNumber <= 6) {
    // 前半レース（若駒戦）：2〜3歳の若い馬が主役
    if (age <= 3) {
      potential += 30;
      tags.push('🚀若駒フェーズ適合(2-3歳期待)');
    } else {
      potential -= 15;
    }
  } else if (race.raceNumber >= 7) {
    // 後半レース（古馬戦）：4歳以上の経験豊富なベテランが台頭
    if (age >= 4) {
      potential += 25;
      tags.push('🛡️古馬・ベテランフェーズ適合(実績重視)');
    } else {
      potential -= 10;
    }
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

    // 2. 走場・年齢・人気のシナジー（陣営の「一変」と「確勝」のサイン）
    
    // ① ダート若駒×ブリンカー：砂被り・キックバック克服
    if (race.surface === 'ダート' && age <= 3) {
      blinkerBonus += 30;
      tags.push('🚀若駒ダート×ブリンカー(集中力UP)');
    }
    
    // ② 人気上位×ブリンカー：陣営の「確勝を期した」勝負サイン
    if (popularity <= 2) {
      blinkerBonus += 25;
      tags.push('🔥確勝気配(人気×ブリンカー)');
    }

    // ③ 大穴×ブリンカー：過去大敗をリセットする「一変」の起爆剤
    if (popularity >= 10) {
      blinkerBonus += 35;
      tags.push('⚡大穴一変(ブリンカー爆弾)');
    }

    // ④ 馬体重大幅変動とのシナジー（±10kg以上の変化との掛け合わせ）
    if (Math.abs(weightChange) >= 10) {
      blinkerBonus += 25;
      tags.push('🚀激走トリガー(馬体変動×ブリンカー)');
    }
    
    potential += blinkerBonus;
  }

  // ==========================================
  // 【新設】枠順バイアス解析（金沢競馬・統計的期待値）
  // ==========================================
  // 独自算出の「枠順バイアススコア」に基づく補正
  if (frame === 1) {
    // 1枠：スコア1位(1.08) 複勝率50%の最強軸
    potential += 40;
    tags.push('🏹1枠:黄金期待値(軸信頼度1位)');
  } else if (frame === 7) {
    // 7枠：スコア2位(0.93) 勝率26.7%の勝ち切りバイアス
    potential += 35;
    tags.push('🚀7枠:勝負の突き抜け(勝率1位)');
  } else if (frame === 4) {
    // 4枠：スコア3位(0.75) 複勝率58.3%のヒモ穴バイアス
    potential += 10;
    distortionBoost += 0.6; // 2-3着への食い込みやすさを強化
    tags.push('💎4枠:激走の紐穴(複勝率1位)');
  } else if (frame === 8) {
    // 8枠：スコア4位(0.70) 標準以上の期待値
    potential += 15;
    tags.push('🛡️8枠:外枠の安定感');
  } else if (frame === 2) {
    // 2枠：スコア最下位(0.25) 明確な死角
    potential -= 35;
    tags.push('⚠️2枠:枠順死角(期待値最下位)');
  } else if (frame === 3 || frame === 5 || frame === 6) {
    // 中間・死角枠：スコア0.46〜0.54の低迷帯
    potential -= 15;
    tags.push('🎐中間枠:バイアス劣勢');
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
  // 【刷新】レース・フェーズ別 人気信頼度 & 波乱度解析
  // ==========================================
  if (race.raceNumber <= 6) {
    // 前半レース：1番人気が極めて強力（勝率66%超）な「堅実」フェーズ
    if (popularity === 1) {
      potential += 45; 
      tags.push('👑前半戦:鉄板の1番人気(高信頼度)');
    } else if (popularity >= 2 && popularity <= 3) {
      potential += 15;
      tags.push('🎯前半戦:上位人気順当');
    } else {
      potential -= 20;
    }
  } else if (race.raceNumber >= 7) {
    // 後半レース：1番人気が崩れ、中穴（6-7番人気）が台頭する「波乱」フェーズ
    if (popularity === 1) {
      potential -= 5; // 的中率向上のため-15から-5へ緩和
      tags.push('⚠️後半戦:1番人気過信禁物(波乱含み)');
    } else if (popularity >= 5 && popularity <= 8) {
      potential += 25;
      distortionBoost += 1.2; // 期待値の闇を大幅強化
      tags.push('💎後半戦:激走の伏兵(6-7番人気評価)');
    }

    // 後半の波乱期における「減量騎手」の一発評価
    const isWeightReduced = kinryo <= 53 || horse.prevJockey?.match(/[▲△☆]/);
    if (isWeightReduced) {
      potential += 30;
      distortionBoost += 0.5;
      tags.push('⚡後半戦:減量騎手の爆発力');
    }
  }

  // ==========================================
  // 【新設】厩舎・馬主・所属バイアス解析
  // ==========================================
  const owner = horse.owner || '';
  const isJRAHorse = horse.stableLocation === '栗東' || horse.stableLocation === '美浦';

  // ① JRA所属馬の交流戦バイアス（中央未勝利交流戦など）
  if (isExchangeRace && isJRAHorse) {
    potential += 60; // 圧倒的な実力差を考慮
    tags.push('🚀中央所属馬(交流戦バイアス)');
  }

  // ② 特定厩舎のクラス別優位性（加藤義厩舎のA級戦独占など）
  if (trainer === '加藤義' && (horse.raceClass?.match(/A[123]/) || race.raceNumber >= 11)) {
    potential += 35;
    tags.push('🏰有力厩舎:加藤義(A級戦・メイン勝負)');
  }

  // ③ 特定の「馬主×厩舎」強力タッグ
  // ミルファーム × 金田一
  if (owner.match(/ミルファーム/) && trainer === '金田一') {
    potential += 40;
    tags.push('🤝強力タッグ:ミルファーム×金田一');
  }
  // (株)ファーストビジネス × 加藤和
  if (owner.match(/(ファーストビジネス|First Business)/) && trainer === '加藤和') {
    potential += 40;
    tags.push('🤝強力タッグ:ファーストビジネス×加藤和');
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

    // 【新設】昇級・降級ローテ判定
    const getRaceClassLevel = (classStr: string | undefined): number => {
      if (!classStr) return 0;
      const str = classStr.toString();
      if (str.match(/GⅠ|G1/i)) return 10;
      if (str.match(/GⅡ|G2/i)) return 9;
      if (str.match(/GⅢ|G3/i)) return 8;
      if (str.match(/(オープン|OP|L|リステッド|重賞)/i)) return 7;
      if (str.match(/(3勝クラス|1600万下)/)) return 6;
      if (str.match(/(2勝クラス|1000万下)/)) return 5;
      if (str.match(/(1勝クラス|500万下)/)) return 4;
      if (str.match(/(未勝利|新馬)/)) return 3;
      if (str.match(/A1/)) return 7;
      if (str.match(/A2/)) return 6.5;
      if (str.match(/A3|A/)) return 6;
      if (str.match(/B1/)) return 5.5;
      if (str.match(/B2/)) return 5;
      if (str.match(/B3|B/)) return 4.5;
      if (str.match(/C1/)) return 4;
      if (str.match(/C2/)) return 3.5;
      if (str.match(/C3|C/)) return 3;
      return 0;
    };

    const currentLevel = getRaceClassLevel(horse.raceClass);
    const prevLevel = getRaceClassLevel(lastRace.raceClass);

    if (currentLevel > 0 && prevLevel > 0) {
      if (prevLevel > currentLevel) {
        // 降級ローテ（前走よりクラスが下がった）
        potential += 30;
        tags.push(`📉 降級ローテ: 前走格上クラス(${lastRace.raceClass})から今回(${horse.raceClass})で実力優位`);
        
        // 前走で僅差好走または上位着順であればさらに勝負ヤリ
        if (lastRace.result <= 5 || tDiff <= 1.0) {
          potential += 15;
          tags.push('⚡ 降級メイチ: 前走格上で掲示板内・僅差の巻き返し期待');
        }
      } else if (prevLevel < currentLevel) {
        // 昇級ローテ（前走よりクラスが上がった）
        potential -= 10;
        tags.push(`📈 昇級ローテ: 今回クラス昇級初戦(${lastRace.raceClass}→${horse.raceClass})による壁警戒`);
        
        // 前走勝ち上がり（1着）または前走圧勝なら昇級の壁を突破する余地あり
        if (lastRace.result === 1 || tDiff < 0) {
          potential += 20; // 差し引き +10
          tags.push('⚡ 昇級即通用: 前走勝ち上がりの勢いあり');
        }
      }
    }

    // 【新設】馬体重の推移トレンド分析 (前走馬体重 lastRace.weight と 今回馬体重 weight の比較)
    if (lastRace.weight > 0 && weight > 0) {
      // 1. 実データベースの体重差チェック (入力ミスやデータずれに備えて実測値で補正)
      const actualDiff = weight - lastRace.weight;

      // 2. 継続的消耗（連続馬体減）の検知
      const prev2Race = horse.pastRaces[1];
      if (prev2Race && prev2Race.weight > 0 && lastRace.weight > 0) {
        const prevDiff = lastRace.weight - prev2Race.weight;
        
        // 2走連続で馬体重が減少している場合 (例: 前回 -6kg、今回 -8kg など)
        if (prevDiff < 0 && actualDiff < 0) {
          const totalLoss = Math.abs(prevDiff + actualDiff);
          if (totalLoss >= 12) {
            potential -= 25; // 連続の大幅減少は消耗・細化のリスクが極めて高い
            tags.push(`❌ 連続馬体減: 2走連続で減少(計-${totalLoss}kg)による疲労・細化懸念`);
          } else {
            potential -= 10;
            tags.push(`⚠️ 連続馬体減: 緩やかな消耗トレンド(計-${totalLoss}kg)`);
          }
        }
        
        // 若駒の順調なビルドアップ（成長期トレンド）
        if (age <= 3 && prevDiff >= 2 && actualDiff >= 2 && actualDiff <= 12) {
          potential += 25;
          tags.push('🚀 成長期トレンド: 若駒の順調なビルドアップ・好調キープ');
        }
      }

      // 3. 馬体ふっくら・復調（リバウンド）トレンド
      // 前々走から前走で大幅に減らして大敗したが、今回しっかり戻してきた（復調）パターン
      if (prev2Race && prev2Race.weight > 0) {
        const prevDiff = lastRace.weight - prev2Race.weight;
        // 前走で10kg以上減らしており、今回8kg以上戻した場合
        if (prevDiff <= -10 && actualDiff >= 8) {
          if (actualDiff >= 20) {
            potential -= 15; // 急激な戻しすぎは太目残り（リバウンド失敗）
            tags.push(`⚠️ 急激な馬体増: 短期間での過剰増(+${actualDiff}kg)による太目残り懸念`);
          } else {
            potential += 20; // 適切な回復
            tags.push(`📈 馬体ふっくら: 大幅減からの回復・前走大敗からの復調気配`);
          }
        }
      }

      // 4. 過去の好走体重（ベスト体重）適合判定
      // 過去5走以内で3着以内に入ったレースの馬体重データを抽出
      const goodRaces = horse.pastRaces.slice(0, 5).filter(pr => pr.result <= 3 && pr.weight > 0);
      if (goodRaces.length > 0) {
        const bestWeights = goodRaces.map(pr => pr.weight);
        const avgBestWeight = bestWeights.reduce((a, b) => a + b, 0) / bestWeights.length;
        
        // 今回の馬体重が、過去好走時の平均体重と±6kg以内である場合
        if (Math.abs(weight - avgBestWeight) <= 6) {
          potential += 20;
          tags.push(`🏆 ベスト体重適合: 過去好走時の平均馬体重(${Math.round(avgBestWeight)}kg)に合致`);
        }
      }
    }

    // 【新設】期待値の歪み（前走上位人気裏切りによる過小評価）の判定
    if (lastRace.popularity !== undefined || lastRace.odds !== undefined) {
      const wasFavored = (lastRace.popularity !== undefined && lastRace.popularity <= 2) || 
                         (lastRace.odds !== undefined && lastRace.odds <= 3.5);
      
      const didUnderperform = lastRace.result >= 4;
      
      const isUnderValued = (popularity >= 5) || (odds >= 8.0);

      if (wasFavored && didUnderperform && isUnderValued) {
        potential += 35;
        distortionBoost += 1.5; // 期待値バイアスを大幅に強化
        tags.push("💎 期待値の闇: 前走上位人気裏切りによる過小評価(妙味爆発)");
      }
    }

    // 【新設】揉まれ弱さ（前走少頭数好走 → 今回多頭数内枠）のストレス判定
    if (lastRace.headCount !== undefined && lastRace.headCount <= 10 && lastRace.result <= 3) {
      const isMultiHorseRace = race.headCount !== undefined && race.headCount >= 14;
      const isInnerFrame = frame <= 2; // 1枠〜2枠

      if (isMultiHorseRace && isInnerFrame) {
        potential -= 20; // 揉まれ合いや砂被りによる戦意喪失リスクを考慮して大幅割引
        tags.push("⚠️ 少頭数好走→多頭数内枠: 揉まれ合い・砂被りによる惨敗リスク警戒(割引)");
      }
    }

    // 【新設】相手関係大幅緩和（前走高賞金ハイレベル戦惜敗 → 今回一般平場戦）の判定
    if (lastRace.prize !== undefined && lastRace.prize >= 300) {
      const isGeneralRace = !race.raceName?.match(/(GⅠ|GⅡ|GⅢ|重賞|特別|ステークス|カップ|OP|オープン)/i);
      
      if (isGeneralRace && lastRace.result <= 8) {
        potential += 30;
        tags.push(`👑 相手関係大幅緩和: 前走高賞金特別戦(${lastRace.prize}万)惜敗から今回平場一般戦で格上優位`);
      }
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
    
    // ⑥ 走場別上がりタイム（末脚ボーダーライン）解析
    const bestLast3f = Math.min(...horse.pastRaces.map(pr => parseFloat(pr.last3fTime || '99.9')));
    
    if (race.surface === '芝') {
      if (bestLast3f <= 33.3) {
        potential += 35;
        tags.push(`🚀芝瞬発力エリート(上がり${bestLast3f.toFixed(1)}s)`);
        if (bestLast3f <= 32.8) {
          potential += 15;
          tags.push('⚡芝異次元の末脚(32秒台)');
        }
      }
    } else if (race.surface === 'ダート') {
      // ダート：高速決着なら37-38秒台が必須。クラスが上がるほど要求値がシビアに。
      if (bestLast3f <= 38.2) {
        potential += 35;
        tags.push(`💪ダート高速末脚(上がり${bestLast3f.toFixed(1)}s)`);
        if (isUpperClass && bestLast3f <= 37.8) {
          potential += 20;
          tags.push('⚡上位ダート:必須スピード性能クリア');
        }
      }
      
      // 【重要】ダート・前残りバイアス解析
      // 上がり最速（35-36秒台）を後方から出す馬よりも、
      // ポジションを取って37-38秒台（短距離）で粘り込む馬を上位評価
      if (horse.style === '逃げ' || horse.style === '先行' || horse.style === '好位') {
        if (bestLast3f <= 38.5) {
          potential += 30;
          tags.push('🛡️先行持続脚(前残りバイアス適合)');
        }
      } else if (horse.style === '差し' || horse.style === '追込') {
        if (bestLast3f <= 36.5) {
          potential -= 10; // 上がり最速でも届かないリスクを考慮
          distortionBoost += 0.5; // 2-3着（紐）としての期待値を上げる
          tags.push('⚠️末脚不発リスク(前残り馬場考慮)');
        }
      }
      
      // 【新設】後半レース(8R〜12R)における末脚持続力（39秒台〜40秒台前半）の正当な評価
      if (race.raceNumber >= 8 && bestLast3f <= 40.5) {
        potential += 30;
        tags.push(`🌃後半戦:安定した末脚(上がり${bestLast3f.toFixed(1)}s)`);
        if (bestLast3f <= 39.9) {
          potential += 15;
          tags.push('🔥後半戦:39秒台の決定力');
        }
      }
    }

    // ⑦ 総合スピード能力（走破タイム×上がりの相関評価）
    // 厳しいペース（高速走破）の中で速い上がりを両立できる馬を最高評価
    const hasFastAndLate = horse.pastRaces.find(pr => {
      const timeStr = pr.time || '9:59.9';
      const [min, sec] = timeStr.includes(':') ? timeStr.split(':').map(parseFloat) : [0, parseFloat(timeStr)];
      const timeVal = min * 60 + sec;
      const l3fVal = parseFloat(pr.last3fTime || '99.9');

      // 1000m基準: 1:01.2(上位) / 1:02.5(標準)
      if (pr.distance === 1000 && timeVal <= 62.5 && l3fVal <= 37.5) return true;
      // 1100m基準: 1:09.0以下且つ上がり38.5s以下
      if (pr.distance === 1100 && timeVal <= 69.0 && l3fVal <= 38.5) return true;
      // 1200m基準: 1:15.8以下且つ上がり38.5s以下
      if (pr.distance === 1200 && timeVal <= 75.8 && l3fVal <= 38.5) return true;
      // 1400m基準: 1:31.8(Star Candy級)を評価
      if (pr.distance === 1400 && timeVal <= 92.0 && l3fVal <= 39.5) return true;
      // 1500m基準: クラス別判定（JRA交流1:38.6 / 古馬B級1:39.5 / 3歳1:41.0）
      if (pr.distance === 1500) {
        if (timeVal <= 99.5 && l3fVal <= 40.0) return true;
        if (age <= 3 && timeVal <= 101.5) return true;
      }
      // 1700m基準: 1:51.3(ジャスパードリーム級)を評価
      if (pr.distance === 1700 && timeVal <= 111.5 && l3fVal <= 41.5) return true;
      return false;
    });

    if (hasFastAndLate) {
      potential += 30;
      tags.push('🏆総合スピード能力(タイム×上がり相関)');
    }
    
    // ⑧ 安定した先行力（Positioning Consistency）の解析
    // 過去3走で継続的に前目（1-3番手）のポジションを確保できている馬を、主導権を握れる馬として評価
    const frontPosCount = horse.pastRaces.slice(0, 3).filter(pr => {
      if (!pr.passingPositions) return false;
      const pos = pr.passingPositions.split('-').map(Number);
      return pos[0] > 0 && pos[0] <= 3;
    }).length;

    if (frontPosCount >= 2) {
      potential += 30;
      tags.push('🚀安定した先行力(1-3番手保持実績)');
    } else if (frontPosCount === 1 && (horse.style === '逃げ' || horse.style === '先行')) {
      potential += 15;
      tags.push('🏹先行実績あり');
    }

    // ⑨ 超短距離（1100m以下）における「テンの速さ」特化評価
    if (dist <= 1100 && (horse.style === '逃げ' || horse.style === '先行')) {
      potential += 25;
      tags.push('⚡超短距離エッジ(テンの速さ重視)');
    }

    // 通過順位による展開利（小回り・地方・特定コース）
    if (lastRace.passingPositions) {
      const pos = lastRace.passingPositions.split('-').map(Number);
      const isFront = pos[0] <= 3 || pos[1] <= 3;
      if (isFront && (trackName === '川崎' || trackName === '門別' || trackName === '笠松' || trackName === '園田')) {
        potential += 20;
        tags.push('🏇小回り先行実績(展開利)');
      }
    }
  }

  // ==========================================
  // 【新設】展開・ポジション適性解析（馬場・クラス別交差評価）
  // ==========================================
  const hStyle = horse.style || '中団';
  const isLClass = horse.raceClass?.match(/(未勝利|1勝クラス|新馬)/);
  const isUClass = horse.raceClass?.match(/(2勝クラス|3勝クラス|オープン|重賞|リステッド|G[123])/);

  if (race.surface === 'ダート') {
    // ダート戦：先行・好位抜け出しが王道（4角5番手以内想定）
    if (hStyle === '逃げ' || hStyle === '先行' || hStyle === '好位') {
      potential += 35;
      tags.push('🔥ダート王道展開(先行・好位)');
      tags.push('💪ダート先行利:キックバック回避');
      
      // 下級クラスや後半の古馬戦ならさらに「前残り」を強く評価
      if (isLClass || race.raceNumber >= 8) {
        potential += 15;
        tags.push('🛡️ダート物理的先行有利(1着候補)');
      }
    } else {
      // ダート差し・追込：通常は割引だが、前半の3歳戦(JRA移籍等)は例外
      if (age <= 3 || race.raceNumber <= 7) {
        potential += 15; // 差し切りのポテンシャルを評価
        tags.push('🚀若駒ダート:末脚一閃期待(差し切り)');
      } else {
        potential -= 15;
        tags.push('⚠️ダート差し・追込:展開不備注意');
        
        // 後半の差し馬は「紐穴（2-3着）」として期待値を調整
        if (race.raceNumber >= 8) {
          distortionBoost += 0.5;
          tags.push('💎後半戦差し馬:2-3着強襲期待');
        }
      }
    }
  } else if (race.surface === '芝') {
    if (isLClass || race.raceNumber <= 6) {
      // 芝前半レース（下位クラス）：先行・好位抜け出し有利
      if (hStyle === '逃げ' || hStyle === '先行' || hStyle === '好位') {
        potential += 30;
        tags.push('🏹芝前半:先行・好位展開利');
      }
    } else if (isUClass || race.raceNumber >= 7) {
      // 芝後半レース（上級条件）：差し・追込の爆発有利
      if (hStyle === '中団' || hStyle === '後方') {
        potential += 40;
        tags.push('🚀芝後半:差し・追込展開利');
        if (isHighPaceSim) {
          potential += 15;
          tags.push('🔥ハイペース激戦:末脚ブースト');
        }
      } else if (hStyle === '逃げ' || hStyle === '先行') {
        potential -= 10;
        tags.push('⚠️芝後半:前目目標にされるリスク');
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
  }

  // ==========================================
  // 【新設】未活用データ完全統合オメガ・プロトコル
  // ==========================================
  // 1. 乗り替え補正 (鞍上強化 / 弱化 / 減量恩恵)
  if (horse.prevJockey && horse.jockey) {
    const prevJ = horse.prevJockey.replace(/[▲△☆★◇]/g, '').trim();
    const currJ = horse.jockey.replace(/[▲△☆★◇]/g, '').trim();
    
    if (prevJ !== currJ) {
      // 鞍上強化：前走非エリート → 今回エリート騎手
      const isPrevElite = ELITE_JOCKEYS.some((ej: string) => prevJ.includes(ej));
      const isCurrElite = ELITE_JOCKEYS.some((ej: string) => currJ.includes(ej));
      if (!isPrevElite && isCurrElite) {
        potential += 30;
        tags.push('🔥勝負気配:エリート騎手乗り替え強化');
      } else if (isPrevElite && !isCurrElite) {
        // 鞍上弱化
        potential -= 15;
        tags.push('⚠️鞍上交代:前走エリートからの弱化懸念');
      }
      
      // 減量騎手への乗り替えによる斤量恩恵
      const isApprentice = /[▲△☆★◇]/.test(horse.jockey) || horse.jockey.includes('減量') || horse.jockey.includes('▲') || horse.jockey.includes('△');
      if (isApprentice) {
        potential += 20;
        tags.push('⚡鞍上交代:減量ジョッキー起用(斤量恩恵バフ)');
      }
    }
  }

  // 2. 回り（左右）適性補正（サウスポー / 右回り巧者）
  const isLeftTrack = /(東京|新潟|中京|川崎|船橋|浦和|盛岡)/.test(trackName || race.venue);
  if (horse.pastRaces && horse.pastRaces.length > 0) {
    const leftTurnGood = horse.pastRaces.filter(pr => pr.direction === '左' && pr.result <= 3).length;
    const rightTurnGood = horse.pastRaces.filter(pr => pr.direction === '右' && pr.result <= 3).length;

    if (isLeftTrack) {
      if (horse.leftTurnExperience && horse.leftTurnExperience >= 2) {
        potential += 25;
        tags.push(`🔄サウスポー適性:左回り好走実績あり(実績:${horse.leftTurnExperience}回)`);
      } else if (leftTurnGood >= 2) {
        potential += 20;
        tags.push(`🔄左回り好走実績馬(${leftTurnGood}回)`);
      } else if (rightTurnGood >= 3 && leftTurnGood === 0) {
        // 右回りは得意だが左回りは未知または凡走のみ
        potential -= 15;
        tags.push('⚠️左回り適性疑問(右回り特化型)');
      }
    } else {
      if (rightTurnGood >= 2) {
        potential += 20;
        tags.push(`🔄右回り適性確実(${rightTurnGood}回)`);
      }
    }
  }

  // 3. 前走内負荷×今回外枠補正（砂被り回避ストレス解放）
  if (race.surface === 'ダート' && frame >= 6) {
    const isInnerLoad = horse.prevInnerLoadExp || (horse.pastRaces && horse.pastRaces[0] && horse.pastRaces[0].frameNumber !== undefined && horse.pastRaces[0].frameNumber <= 2);
    if (isInnerLoad && horse.pastRaces && horse.pastRaces[0] && horse.pastRaces[0].result >= 6) {
      potential += 30;
      distortionBoost += 0.5;
      tags.push('🔥砂被り解放:前走内負荷大敗→今回砂被り回避外枠');
    }
  }

  // 4. 馬主・JRA本賞金クラス別補正（クラブ馬＆格上実績馬エッジ）
  if (horse.ownerType === 'club' || horse.ownerType === 'major') {
    const isGradeOrSpecial = race.raceName?.match(/(GⅠ|GⅡ|GⅢ|重賞|特別|ステークス|カップ)/);
    if (isGradeOrSpecial) {
      potential += 25;
      tags.push('🏰大物馬主/一口クラブ馬:上級勝負仕上げ');
    } else {
      potential += 15;
      tags.push('🏰有力クラブ所有馬(素質馬)');
    }
  }
  
  if (horse.jraEarnings && horse.jraEarnings > 0) {
    const isNarTrack = /(川崎|船橋|大井|浦和|門別|盛岡|水沢|金沢|笠松|名古屋|園田|姫路|高知|佐賀)/.test(trackName || race.venue);
    if (isNarTrack) {
      potential += 40;
      tags.push(`🚀JRA実績格付け:圧倒的クラス格差(賞金:${Math.round(horse.jraEarnings)}万)`);
    } else {
      // JRA下級条件での本賞金持ち実績
      const isLowerJRA = race.raceName?.match(/(未勝利|1勝クラス|新馬)/) || race.raceNumber <= 6;
      if (isLowerJRA && horse.jraEarnings >= 500) {
        potential += 20;
        tags.push('🛡️JRAクラス内実績馬(賞金アドバンテージ)');
      }
    }
  }

  // 5. ローテーション・休み明け補正（鉄砲実績 vs 叩き良化 vs 過密疲労）
  if (horse.isAfterRest || horse.rotation?.includes('休')) {
    let hasRestGoodRecord = false;
    if (horse.pastRaces && horse.pastRaces.length > 1) {
      const restWins = horse.pastRaces.filter((pr, idx) => {
        if (idx === horse.pastRaces.length - 1) return false;
        const currDate = new Date(pr.date);
        const prevDate = new Date(horse.pastRaces[idx + 1].date);
        const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24);
        return diffDays >= 90 && pr.result <= 3;
      }).length;
      
      if (restWins > 0) {
        hasRestGoodRecord = true;
      }
    }

    if (hasRestGoodRecord) {
      potential += 20;
      tags.push('🛡️鉄砲実績馬:休み明け初戦から走るタイプ');
    } else {
      potential -= 15;
      tags.push('⚠️休み明け初戦:叩き良化型・状態未知数割引');
    }
  } else if (horse.rotation === '連闘' || horse.rotation === '中1週') {
    potential -= 10;
    tags.push('⚠️過密ローテ:中1週以下連戦による疲労蓄積懸念');
  }

  // 6. 季節・天候適性補正 (サマーウインド / 悪天候巧者)
  if (race.season && horse.pastRaces) {
    const isSummerRace = race.season === 'summer';
    const isWinterRace = race.season === 'winter';
    
    const summerWins = horse.pastRaces.filter(pr => {
      const month = new Date(pr.date).getMonth() + 1;
      return (month >= 7 && month <= 9) && pr.result <= 3;
    }).length;
    
    const winterWins = horse.pastRaces.filter(pr => {
      const month = new Date(pr.date).getMonth() + 1;
      return (month === 12 || month <= 2) && pr.result <= 3;
    }).length;

    if (isSummerRace && summerWins >= 2) {
      potential += 20;
      tags.push('☀️夏馬エッジ:暑い時期にパフォーマンス向上');
    } else if (isWinterRace && winterWins >= 2) {
      potential += 20;
      tags.push('❄️冬馬エッジ:寒い時期にパフォーマンス向上');
    }
  }

  if ((race.weather?.includes('雨') || race.weather?.includes('雪') || race.condition === '重' || race.condition === '不良') && horse.pastRaces) {
    const heavyGood = horse.pastRaces.filter(pr => (pr.condition === '重' || pr.condition === '不良') && pr.result <= 3).length;
    if (heavyGood >= 2) {
      potential += 25;
      tags.push(`☔道悪巧者:荒天・泥馬場実績(${heavyGood}回好走)`);
    }
  }

  // 7. コーナー通過順変動（まくり・押し上げ能力）補正
  if (horse.cornerPositionVariance && horse.cornerPositionVariance >= 3.0) {
    if (horse.style === '差し' || horse.style === '追込' || horse.style === '中団') {
      potential += 20;
      tags.push(`🌀動的まくり脚:道中位置押し上げ能力(分散:${horse.cornerPositionVariance.toFixed(1)})`);
    }
  }

  // ---------------------------------------------------
  // 年齢・クラス・人気・上がりタイム of 共通バイアス（前半/後半）
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
    // 1番人気の信頼度アップ
    if (popularity === 1) {
      potential += 25;
      tags.push('後半:1番人気(信頼度アップ)');
    }
    // 10番人気以下の超大穴の一発警戒
    if (popularity >= 10) {
      potential += 20;
      tags.push('後半:爆穴(ヒモ穴・高配当狙い)');
    }
  }

  // ==========================================
  // 【新設】市場心理：上位人気の圧倒的信頼（園田・地方限定バイアス）
  // ==========================================
  // 24戦23勝が3番人気以内という極端な「堅実決着」パターンを学習
  if (trackName === '園田' || trackName === '西脇' || trackName === '姫路') {
    if (popularity === 1) {
      potential += 60; // 1番人気の鉄板級信頼度(勝率60%超)
      tags.push('👑園田:1番人気(鉄板級信頼度)');
    } else if (popularity <= 3) {
      potential += 35; // 3番人気以内の圧倒的勝率(24戦23勝)を反映
      tags.push('🛡️園田:上位人気(堅実決着ゾーン)');
    } else if (popularity >= 6) {
      // 穴馬の激走確率が極めて低い馬場・展開条件を反映して大幅割引
      potential -= 40; 
      tags.push('⚠️園田:下位人気(激走確率低下・波乱要素薄)');
    }
  }

  // ==========================================
  // 【新設】レースフェーズ（時間軸）バイアス解析
  // ==========================================
  // ① 前半フェーズ（1-6R / 下級条件）：先行力・ポジションが絶対正義
  if (race.raceNumber <= 6) {
    if (horse.style === '逃げ' || horse.style === '先行' || horse.style === '好位') {
      potential += 25;
      tags.push('🌅前半フェーズ:先行・ポジション優位');
    }
  } 
  // ② 後半フェーズ（7-12R / 上位条件・特別）：末脚の質とトップ騎手の勝負強さ
  else {
    // 高速化した馬場に対応できる鋭い上がり性能
    const hasSharpLast3f = horse.pastRaces.some(pr => {
      const l3f = parseFloat(pr.last3fTime || '99.9');
      return race.surface === '芝' ? l3f <= 33.8 : l3f <= 38.5;
    });
    if (hasSharpLast3f) {
      potential += 30;
      tags.push('🌃後半フェーズ:鋭い末脚(上がり重視)');
    }
    
    // 重要な局面（特別・メイン）でのリーディング上位騎手への期待値
    if (isEliteJockey) {
      potential += 25;
      tags.push('🌃後半フェーズ:トップ騎手の勝負強さ');
    }
    
    // 上位クラスでの持ち時計実績（高速決着対応）
    if (isUClass) {
      const hasFastTime = horse.pastRaces.some(pr => pr.distance === race.distance && pr.result <= 3);
      if (hasFastTime) {
        potential += 20;
        tags.push('🌃後半フェーズ:上位クラス時計実績');
      }
    }
  }

  // ---------------------------------------------------
  // 動的学習パッチの適用
  // ---------------------------------------------------
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
  
  // オッズ偏差値による過小評価ブースト
  const currentOddsSS = horse.oddsStandardScore || 50;
  
  // ---------------------------------------------------
  // 市場収束バイアス（園田:低偏差・堅実収束パターン）
  // ---------------------------------------------------
  // 平均1.75番人気で決着する「低偏差馬場」では、高SS（上位人気）ほど正解率が向上する
  if (trackName === '園田' || trackName === '西脇' || trackName === '姫路') {
    if (currentOddsSS >= 65 || popularity <= 2) {
      potential += 30; // 圧倒的人気への実力集中を評価
      tags.push('🛡️市場収束:上位人気への能力集中');
    }
    // 穴馬の歪みブーストをこの馬場では抑制（紛れが少ないため）
    if (popularity >= 6) {
      distortionBoost *= 0.4;
      tags.push('⚠️市場収束:穴馬期待値抑制');
    }
  }

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
  const currentWeightRatio = weight > 0 ? (kinryo / weight) * 100 : 0;
  if (currentWeightRatio >= 14.0) {
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

  // 東京開催特有の「爆穴激走」ブースト
  if (trackName === '東京' && popularity >= 10 && odds >= 50.0) {
    distortionBoost += 0.8;
    tags.push('🌌東京:爆穴ポテンシャル加速');
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

  // ===================================================
  // 【新設】中央競馬10箇所（JRA）特化型オメガ・プロトコル推論エンジン
  // ===================================================
  const isJRA = /(東京|中山|京都|阪神|中京|新潟|小倉|福島|函館|札幌)/.test(race.venue || race.trackName || race.raceName || '');

  if (isJRA) {
    tags.push("JRA特化OMEGAエンジン適用中");

    // ---------------------------------------------------
    // ① 【要素1】今回レース環境（Race）の新要因評価
    // ---------------------------------------------------
    // 季節適性バイオリズム判定
    if (race.season === 'summer') {
      if (gender === '牝') {
        potential += 15;
        tags.push("☀️ 夏の牝馬バイアス適合(暑さ耐性)");
      }
      if (horse.coatColor && /(黒鹿毛|青鹿毛|青毛)/.test(horse.coatColor) && weight >= 500) {
        potential -= 15;
        tags.push("⚠️ 酷暑による大型黒毛馬の夏負けリスク(体熱放出困難)");
      }
    } else if (race.season === 'winter') {
      if (gender === '牝' && weight <= 440 && weight > 0) {
        potential -= 10;
        tags.push("⚠️ 冬期寒冷馬場における小柄牝馬のスタミナ懸念(馬体維持困難)");
      }
    }

    // 天候・馬場急変兆候検知
    if ((race.weather?.includes('雨') || race.weather?.includes('雪')) && (condition === '良' || condition === '稍重')) {
      const softBlood = ['キズナ', 'エピファネイア', 'ルーラーシップ', 'ハービンジャー', 'ゴールドシップ'];
      const hasSoftBlood = softBlood.some(sb => bloodline.includes(sb) || (horse.sire && horse.sire.includes(sb)) || (horse.bms && horse.bms.includes(sb)));
      if (hasSoftBlood) {
        potential += 20;
        tags.push("☔ 天候急変（雨/雪）による道悪血統適性(馬場軟化適性)");
      }
    }

    // 薄暮・ナイター精神ストレス判定
    if (race.isNight || race.isTwilight) {
      const hasPastStumbled = horse.pastRaces && horse.pastRaces.some(pr => pr.isStumbled);
      if (hasPastStumbled) {
        potential -= 10;
        tags.push("⚠️ 薄暮・ナイター時間帯による精神的イレ込みリスク(出遅れ再発警戒)");
      }
    }

    // ---------------------------------------------------
    // ② 【要素2】馬個体（Horse）の新要因評価
    // ---------------------------------------------------
    // 個別血統（sire, bms）のコース物理適性判定
    if (horse.sire) {
      if (race.surface === '芝' && dist >= 2000) {
        const eliteLongSires = ['ディープインパクト', 'ハーツクライ', 'ドゥラメンテ', 'キタサンブラック'];
        const isEliteLong = eliteLongSires.some(es => horse.sire.includes(es));
        if (isEliteLong) {
          potential += 25;
          tags.push(`🧬 芝中長距離エリートサイアー適性(${horse.sire.replace(/ファーム|牧場/g, '')})`);
        }
      }
      if (dist <= 1400 || race.surface === 'ダート') {
        const speedSires = ['ロードカナロア', 'ヘニーヒューズ', 'シニスターミニスター', 'ドレフォン'];
        const isSpeedSire = speedSires.some(ss => horse.sire.includes(ss));
        if (isSpeedSire) {
          potential += 20;
          tags.push(`🧬 スピード・砂サイアー適性(${horse.sire.replace(/ファーム|牧場/g, '')})`);
        }
      }
    }

    // 鉄砲（休み明け初戦）仕上がり判定
    if (horse.isAfterRest) {
      const rating = horse.trainingRating?.toUpperCase();
      if (rating === 'S' || rating === 'A') {
        potential += 20;
        tags.push("🔥 鉄砲抜群：休み明け初戦×好仕上がり(即戦力)");
      } else {
        potential -= 15;
        tags.push("⚠️ 休み明け初戦・仕上がり途上割引(叩き良化型)");
      }
    }

    // 過密ローテーションと疲労消耗判定
    if (horse.rotation === '連闘' || horse.rotation === '中1週') {
      const prevGood = horse.pastRaces && horse.pastRaces[0] && horse.pastRaces[0].result <= 3;
      if (prevGood && weightChange < 0) {
        potential -= 20;
        tags.push("⚠️ 過密ローテ激走反動・馬体重減リスク(疲労蓄積懸念)");
      }
    }

    // 昇降級クラス変動判定
    if (horse.raceClass && horse.pastRaces && horse.pastRaces[0] && horse.pastRaces[0].raceClass) {
      const currentClass = horse.raceClass;
      const prevClass = horse.pastRaces[0].raceClass;

      // 簡易クラス強度マッピング (未勝利 < 1勝 < 2勝 < 3勝 < オープン/G3/G2/G1)
      const getClassScore = (c: string): number => {
        if (c.includes('GⅠ') || c.includes('G1') || c.includes('重賞')) return 6;
        if (c.includes('GⅡ') || c.includes('G2') || c.includes('GⅢ') || c.includes('G3') || c.includes('オープン') || c.includes('OP')) return 5;
        if (c.includes('3勝') || c.includes('1600万')) return 4;
        if (c.includes('2勝') || c.includes('1000万')) return 3;
        if (c.includes('1勝') || c.includes('500万')) return 2;
        if (c.includes('新馬')) return 1.5;
        if (c.includes('未勝利')) return 1;
        return 0;
      };

      const currScore = getClassScore(currentClass);
      const prevScore = getClassScore(prevClass);

      if (currScore > 0 && prevScore > 0) {
        if (currScore < prevScore) {
          potential += 30;
          tags.push(`👑 クラス降級による圧倒的格上位アドバンテージ(${prevClass}→${currentClass})`);
        } else if (currScore > prevScore) {
          potential -= 10;
          tags.push(`⚠️ クラス昇級初戦による実力検証の壁(${prevClass}→${currentClass})`);
        }
      }
    }

    // コーナー通過順位変動（まくり機動力）判定
    const isShortTrack = /(中山|福島|小倉|函館|札幌)/.test(race.venue || race.trackName || '');
    if (isShortTrack && horse.cornerPositionVariance && horse.cornerPositionVariance >= 2.0) {
      potential += 20;
      tags.push("📐 小回り勝負所機動力（まくり適性）適合");
    }

    // 左回りサウスポー判定
    const isLeftTrack = /(東京|中京|新潟)/.test(race.venue || race.trackName || '');
    if (isLeftTrack && horse.leftTurnExperience && horse.leftTurnExperience >= 2) {
      potential += 20;
      tags.push("📐 左回りサウスポー実績適合");
    }

    // 前走イン物理ロスからの外枠激変判定
    if (frame >= 6 && horse.pastRaces && horse.pastRaces[0]) {
      const wasInner = horse.prevInnerLoadExp || (horse.pastRaces[0].frameNumber !== undefined && horse.pastRaces[0].frameNumber <= 2);
      const didLose = horse.pastRaces[0].result >= 6;
      if (wasInner && didLose) {
        potential += 25;
        tags.push("📐 前走内荒れロスからの外枠替わり激変期待値");
      }
    }

    // 初ブリンカー変心判定
    if (horse.useBlinkers) {
      potential += 25;
      tags.push("🎯 初ブリンカー装着による集中力激変期待");
    }

    // オッズ偏差値信頼度判定
    if (horse.oddsStandardScore && horse.oddsStandardScore >= 65 && popularity === 1) {
      potential += 15;
      tags.push("👑 断然人気・オッズ偏差値SSS of 絶対的信頼");
    }

    // ---------------------------------------------------
    // ③ 【要素3】過去走履歴（PastRace）の新要因評価
    // ---------------------------------------------------
    // 過去走勝ち馬のその後の出世度（winnerName）による対戦レベル補正
    if (horse.pastRaces && horse.pastRaces.length > 0) {
      const hasStrongRival = horse.pastRaces.slice(0, 3).some(pr => {
        const eliteRivals = ['サトノフェンサー', 'イクイノックス', 'ドウデュース', 'リバティアイランド', 'ソールオリエンス', 'タスティエーラ', 'ジャスティンパレス', 'プログノーシス', 'ルガル'];
        return pr.winnerName && eliteRivals.some(er => pr.winnerName?.includes(er)) && pr.timeDiff !== undefined && pr.timeDiff <= 0.4;
      });
      if (hasStrongRival) {
        potential += 25;
        tags.push("👑 過去走対戦馬レベル高（勝ち馬のその後の出世）");
      }
    }

    // クラス基準タイム比較による時計的真価判定
    if (horse.pastRaces) {
      const hasExcellentTime = horse.pastRaces.slice(0, 3).some(pr => {
        if (!pr.time || !pr.classBaseTime) return false;
        
        const parseTimeToSec = (tStr: string): number => {
          const clean = tStr.trim();
          if (clean.includes(':')) {
            const parts = clean.split(':');
            return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
          }
          return parseFloat(clean) || 999;
        };

        const seconds = parseTimeToSec(pr.time);
        const baseSeconds = pr.classBaseTime;
        return seconds > 0 && baseSeconds > 0 && seconds <= baseSeconds - 0.8;
      });

      if (hasExcellentTime) {
        potential += 25;
        tags.push("⏱️ クラス基準タイム超えの高速時計実績");
      }
    }

    // タフ場実績の他場適性判定
    if (horse.pastRaces) {
      const hasToughGood = horse.pastRaces.slice(0, 5).some(pr => {
        const isToughVenue = /(中山|阪神|中京)/.test(pr.venue || '');
        return isToughVenue && pr.result <= 3;
      });
      const isEasyVenue = /(京都|新潟|小倉)/.test(race.venue || race.trackName || '');
      if (hasToughGood && isEasyVenue) {
        potential += 15;
        tags.push("⛰️ 急坂・タフ場での好走実績（底力の裏付け）");
      }
    }

    // 直近人気トレンドからの過小評価スクリーニング
    if (horse.pastRaces && horse.pastRaces.length >= 3) {
      const avgPopularity = horse.pastRaces.slice(0, 3).reduce((sum, pr) => sum + (pr.popularity || 5), 0) / 3.0;
      const lastFailed = horse.pastRaces[0].result >= 10;
      const isUnderValued = odds >= 8.0;

      if (avgPopularity <= 3.0 && lastFailed && isUnderValued) {
        potential += 30;
        tags.push("⚡ 過去走人気トレンドからの巻き返し急襲穴馬");
      }
    }

    // ---------------------------------------------------
    // ④ 【新要因1】市場・オッズに基づく期待値補正（回収率重視シフト）
    // ---------------------------------------------------
    // 1. 過剰人気馬への厳しいペナルティ（JRA特有のオッズ歪み補正）
    if (popularity === 1 || odds <= 2.5) {
      potential -= 25; // 期待値が低いため大幅減点
      tags.push("⚠️ JRA過剰人気による期待値減点(オッズ歪み警戒)");
    }
    
    // 2. 前走の展開・馬場バイアス的不利 ＋ 今回人気落ちの黄金パターン（実力隠蔽馬）
    const prevRace = horse.pastRaces && horse.pastRaces[0];
    if (prevRace) {
      const wasOuterRun = prevRace.cornerOuterCount >= 4;
      const didStumble = prevRace.isStumbled;
      const isUnderValuedNow = odds >= 10.0 || popularity >= 4;
      
      if ((wasOuterRun || didStumble) && isUnderValuedNow) {
        potential += 35;
        tags.push("🚀 展開バイアス不利からの巻き返し(期待値特大の穴馬)");
      }
    }
    
    // 3. クラス基準タイム超え実績があるのに人気がない馬の評価引き上げ
    if (horse.pastRaces) {
      const hasExcellentTime = horse.pastRaces.slice(0, 3).some(pr => {
        if (!pr.time || !pr.classBaseTime) return false;
        const parseTimeToSec = (tStr: string): number => {
          const clean = tStr.trim();
          if (clean.includes(':')) {
            const parts = clean.split(':');
            return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
          }
          return parseFloat(clean) || 999;
        };
        const seconds = parseTimeToSec(pr.time);
        const baseSeconds = pr.classBaseTime;
        return seconds > 0 && baseSeconds > 0 && seconds <= baseSeconds - 0.8;
      });

      if (hasExcellentTime && (odds >= 10.0 || popularity >= 4)) {
        potential += 30;
        tags.push("💎 持ち時計優秀の過小評価馬(期待値特大の穴馬)");
      }
    }

    // ---------------------------------------------------
    // ④ 【新要因1】勾配物理とラップ局所ロス（坂の慣性エネルギー）の判定
    // ---------------------------------------------------
    if (horse.pastRaces && horse.pastRaces.length > 0) {
      const hasHillClimber = horse.pastRaces.some(pr => {
        const isHillVenue = /(中山|阪神)/.test(pr.venue || '');
        if (!isHillVenue || pr.result > 3 || !pr.last3fTime) return false;
        
        const last3f = parseFloat(pr.last3fTime);
        if (isNaN(last3f)) return false;
        
        if (pr.surface === '芝') {
          return last3f <= 34.5;
        } else if (pr.surface === 'ダート') {
          return last3f <= 37.0;
        }
        return false;
      });
      if (hasHillClimber) {
        potential += 15;
        tags.push("⛰️ 勾配物理:急坂負荷クリアの坂適性裏付け");
      }
    }

    // ---------------------------------------------------
    // ⑤ 【新要因2】極限クッション値と芝の超高速化スケーリングバイアス
    // ---------------------------------------------------
    if (race.surface === '芝' && race.cushionValue !== undefined && horse.pastRaces) {
      if (race.cushionValue >= 9.5) {
        const hasFastCushion = horse.pastRaces.some(pr => {
          return pr.surface === '芝' && 
                 pr.cushionValue !== undefined && 
                 pr.cushionValue >= 9.5 && 
                 pr.result <= 3 && 
                 pr.timeDiff !== undefined && 
                 pr.timeDiff <= 0.3;
        });
        if (hasFastCushion) {
          potential += 20;
          tags.push("⚡ 超高速物理:極限クッション値スピード適合");
        }
      } else if (race.cushionValue <= 7.5) {
        const hasSoftCushion = horse.pastRaces.some(pr => {
          return pr.surface === '芝' && 
                 pr.cushionValue !== undefined && 
                 pr.cushionValue <= 7.5 && 
                 pr.result <= 3 && 
                 pr.timeDiff !== undefined && 
                 pr.timeDiff <= 0.3;
        });
        if (hasSoftCushion) {
          potential += 20;
          tags.push("⛰️ 重厚物理:低クッション値クッションタフネス適合");
        }
      }
    }

    // ---------------------------------------------------
    // ⑥ 【新要因3】走行軌跡（直線外回し距離ロス・進路カット）の定量的補正
    // ---------------------------------------------------
    if (horse.pastRaces && horse.pastRaces.length > 0) {
      // 進路カット救済
      const prevRace = horse.pastRaces[0];
      if (prevRace.incidents && prevRace.result >= 5) {
        const hasPathBlock = /(直線進路なし|前が壁|追い出せず)/.test(prevRace.incidents);
        if (hasPathBlock) {
          potential += 25;
          tags.push("⚠️ 不利度外視:前走直線進路カットによる不可抗力惨敗");
        }
      }
      
      // 外回し距離ロス補正
      const hasOuterLoss = horse.pastRaces.some(pr => {
        return pr.cornerOuterCount !== undefined && 
               pr.cornerOuterCount >= 3 && 
               pr.result >= 5 && 
               pr.timeDiff !== undefined && 
               pr.timeDiff <= 0.5;
      });
      if (hasOuterLoss) {
        potential += 20;
        tags.push("📐 走行軌跡:過去走大外回し極大距離ロス補正");
      }
    }

    // ---------------------------------------------------
    // ⑦ 【新要因4】芝「仮柵ステージ（A〜Dコース）移動」に伴う馬場バイアス
    // ---------------------------------------------------
    if (race.surface === '芝' && race.temporaryFencePosition) {
      const fencePos = race.temporaryFencePosition.toUpperCase();
      if (/(B|C|D)/.test(fencePos)) {
        if (frame <= 3 && /(逃げ|先行|好位)/.test(hStyle || '')) {
          potential += 20;
          tags.push("📐 仮柵幾何学:内移動グリーンベルト・イン突き適合");
        }
      } else if (fencePos === 'A') {
        if (frame >= 6 && /(差し|中団|後方|追込)/.test(hStyle || '')) {
          potential += 15;
          tags.push("📐 仮柵幾何学:仮柵Aステージ荒れ内馬場回避エッジ");
        }
      }
    }

    // ---------------------------------------------------
    // ⑧ 【新要因5】時計の「馬場ゲタ」剥ぎ取り不全による過剰人気と期待値の歪み（オッズの闇）
    // ---------------------------------------------------
    if (horse.pastRaces && horse.pastRaces.length > 0) {
      const prevRace = horse.pastRaces[0];
      if (prevRace.time && prevRace.classBaseTime !== undefined && prevRace.result === 1) {
        const prTimeSec = parseTimeToSeconds(prevRace.time);
        const prBaseSec = prevRace.classBaseTime;
        if (prTimeSec > 0 && prBaseSec > 0 && prTimeSec <= prBaseSec - 1.2) {
          if (odds <= 2.0) {
            potential -= 25;
            tags.push("⚠️ 時計の罠:前走超高速馬場恩恵による過剰人気割引");
          } else if (odds >= 8.0) {
            potential += 30;
            distortionBoost *= 1.3;
            tags.push("🌀 期待値の闇:高速時計実績に対する過小評価オッズ歪み適合");
          }
        }
      }
    }
  }

  // ===================================================
  // 【新設】地方競馬特化（NAR）共通高度新要因ロジック
  // ===================================================
  const isNAR = /(大井|川崎|船橋|浦和|門別|盛岡|水沢|金沢|笠松|名古屋|園田|姫路|高知|佐賀|帯広)/.test(race.venue || race.trackName || race.raceName || '');

  if (isNAR) {
    tags.push("NAR特化OMEGAエンジン適用中");

    // ---------------------------------------------------
    // ① 【要素1】地方レース環境（Race）の新要因評価
    // ---------------------------------------------------
    // 輸送ストレス判定: 所属（belonging または stableLocation）と開催場（race.venue または trackName）が異なり（長距離遠征）、かつ今回馬体重が減少している（weightChange < 0）場合
    const horseBelonging = horse.belonging || horse.stableLocation || '';
    const raceVenue = race.venue || race.trackName || '';
    if (horseBelonging && raceVenue) {
      const cleanBelonging = horseBelonging.replace(/(競馬場|厩舎|所属)/g, '').trim();
      const cleanVenue = raceVenue.replace(/(競馬場|特別|重賞)/g, '').trim();
      if (cleanBelonging && cleanVenue && !cleanVenue.includes(cleanBelonging) && !cleanBelonging.includes(cleanVenue)) {
        if (weightChange < 0) {
          potential -= 15;
          tags.push("⚠️ 地方遠征輸送ストレス（馬体重減少リスク）");
        }
      }
    }

    // ナイター光・影精神ストレス判定: race.isNight または 発走時刻(startTime)が17時以降の際、出遅れ実績のある馬または3歳以下の若駒
    const isNightTime = race.isNight || (race.startTime && parseInt(race.startTime.split(':')[0], 10) >= 17);
    if (isNightTime) {
      const hasPastStumbled = horse.pastRaces && horse.pastRaces.some(pr => pr.isStumbled);
      if (hasPastStumbled || age <= 3) {
        potential -= 10;
        tags.push("⚠️ ナイター精神ストレス懸念（イレ込み・出遅れ警戒）");
      }
    }

    // 夜間ダート砂物理（粘性・冷え込み）適性: 夜間かつ馬場状態が「良」で、馬体重が450kg以下の小柄な馬はペナルティ。逆に500kg以上の大型馬かつ先行脚質は加点。
    if (isNightTime && condition === '良') {
      if (weight <= 440 && weight > 0) {
        potential -= 10;
        tags.push("⚠️ 夜間冷え込み砂緊縮：小柄馬スタミナ・パワー懸念");
      } else if (weight >= 500 && /(逃げ|先行|好位)/.test(horse.style || '')) {
        potential += 15;
        tags.push("⚡ 夜間冷え込み砂緊縮：大型先行馬パワーアドバンテージ");
      }
    }

    // ---------------------------------------------------
    // ② 【要素2】馬個体（Horse）の新要因評価
    // ---------------------------------------------------
    // 南関ヒエラルキーと遠征アドバンテージ: 川崎・浦和開催において、大井・船橋所属の遠征馬は実力レベルの高さを評価
    if (/(川崎|浦和)/.test(raceVenue)) {
      if (/(大井|船橋)/.test(horseBelonging)) {
        potential += 20;
        tags.push("🌋 南関遠征所属ヒエラルキー適合");
      }
    }

    // 砂理学（馬体重×枠順の砂被りキックバック）シナジー:
    // - 内枠小型馬の砂被り自滅ペナルティ: 馬体重460kg以下の小型馬で、内枠（1〜2枠）かつブリンカー非装着の場合
    if (weight <= 460 && weight > 0 && frame <= 2 && !horse.useBlinkers) {
      potential -= 20;
      tags.push("☔ 砂理学:内枠小型馬の砂被り自滅懸念");
    }
    // - 外枠大型馬の砂被り回避＋推進力エッジ: 馬体重500kg以上の大型馬で、外枠（6枠以上）かつ先行脚質
    if (weight >= 500 && frame >= 6 && /(逃げ|先行|好位)/.test(horse.style || '')) {
      potential += 25;
      tags.push("⚡ 砂理学:外枠大型馬の砂被り回避黄金エッジ");
    }

    // 小回り超スプリント幾何学ボトルネック: 距離が1000m未満（900mや800mなど）の超短距離戦において、内枠（1〜3枠）かつ逃げ・先行脚質は大幅加点。外枠（7枠以上）は減点。
    if (dist > 0 && dist < 1000) {
      if (frame <= 3 && /(逃げ|先行)/.test(horse.style || '')) {
        potential += 35;
        tags.push("📐 スプリント幾何学:極小回り内枠逃げ先行アドバンテージ");
      } else if (frame >= 7) {
        potential -= 25;
        tags.push("⚠️ スプリント幾何学:極小回り外枠距離ロス壊滅");
      }
    }

    // 地方リーディング厩舎×勝負仕上げ
    const isLeadingTrainer = /(小久保|森下|藤田|荒山|打越|角田|川西|笹野|今津|内田|吉村|高木|新子|田中守|宮川)/.test(horse.trainer || '');
    if (isLeadingTrainer) {
      const rating = horse.trainingRating?.toUpperCase();
      if (rating === 'S' || rating === 'A') {
        potential += 25;
        tags.push("🔥 地方リーディング厩舎×勝負仕上げ（メイチ回収）");
      }
    }

    // ---------------------------------------------------
    // ③ 【要素3】過去走履歴（PastRace）の新要因評価
    // ---------------------------------------------------
    // 中央（JRA）移籍初戦の過剰人気割引: 中央転入初戦かつ単勝2.5倍以下の過剰人気馬
    const isJRATransferFirst = horse.transferFrom === 'JRA' || horse.isTransferFirstRace || false;
    if (isJRATransferFirst && odds <= 2.5) {
      potential -= 15;
      tags.push("⚠️ JRA移籍初戦の過剰人気割引（地方砂不確実性）");
    }

    // 中央移籍2戦目の期待値乖離（大化け穴馬）
    if (horse.pastRaces && horse.pastRaces.length >= 2) {
      const isSecondRaceAfterTransfer = !isJRATransferFirst && horse.pastRaces[0] && horse.pastRaces[0].result >= 6;
      const hasJRAHistory = horse.pastRaces.slice(1).some(pr => /(東京|中山|京都|阪神|中京|新潟|小倉|福島|函館|札幌)/.test(pr.venue || ''));
      if (isSecondRaceAfterTransfer && hasJRAHistory && odds >= 6.0) {
        potential += 30;
        tags.push("🌀 移籍2戦目:オッズ急落による大化け激走期待値");
      }
    }

    // ① 【新要因1】競走中の不利・事故（incidents）の度外視（ノーカウント）救済
    if (horse.pastRaces && horse.pastRaces[0]) {
      const prevRace = horse.pastRaces[0];
      if (prevRace.incidents && /(前が壁|他馬の斜行|挟まれ|大きな不利|落鉄)/.test(prevRace.incidents) && prevRace.result >= 6) {
        potential += 25;
        tags.push("⚠️ 不利度外視:前走致命的不利による不可抗力惨敗");
      }
    }

    // ② 【新要因2】道中の位置取り遷移（passingPositions）による脚質物理補正
    if (horse.pastRaces) {
      let hasRonsupamakuri = false;
      let hasPositionKeep = false;
      for (const pr of horse.pastRaces) {
        if (pr.passingPositions) {
          const parts = pr.passingPositions.split('-').map(x => parseInt(x, 10)).filter(x => !isNaN(x));
          if (parts.length >= 2) {
            const maxPos = Math.max(...parts);
            const finalPos = parts[parts.length - 1];
            if (maxPos - finalPos >= 5 && pr.result <= 3) {
              hasRonsupamakuri = true;
            }
            if (parts.every(x => x <= 4) && pr.result <= 3 && /(逃げ|先行|好位)/.test(horse.style || '')) {
              hasPositionKeep = true;
            }
          }
        }
      }
      if (hasRonsupamakuri) {
        potential += 20;
        tags.push("📐 位置取り遷移:ロンスパまくり加速エッジ");
      }
      if (hasPositionKeep) {
        potential += 15;
        tags.push("📐 位置取り遷移:終始好位キープ自在性");
      }
    }

    // ③ 【新要因3】区間ラップタイム（halonPace）の構成バイアス適合
    if (horse.pastRaces) {
      let hasFastPaceTough = false;
      let hasSlowPaceSpeed = false;
      for (const pr of horse.pastRaces) {
        if (pr.halonPace) {
          const paceParts = pr.halonPace.split('-').map(parseFloat);
          if (paceParts.length === 2 && !paceParts.some(isNaN)) {
            const first3F = paceParts[0];
            const last3F = paceParts[1];
            if (last3F - first3F >= 1.5 && pr.result <= 3) {
              hasFastPaceTough = true;
            }
            if (first3F - last3F >= 1.0 && pr.result <= 3) {
              hasSlowPaceSpeed = true;
            }
          }
        }
      }
      if (hasFastPaceTough) {
        potential += 20;
        tags.push("⏱️ ラップ物理:前傾ハイペースダートタフネス適合");
      }
      if (hasSlowPaceSpeed) {
        potential += 15;
        tags.push("⏱️ ラップ物理:後傾スロー瞬発スピード適合");
      }
    }

    // ④ 【新要因4】対戦相手の「その後の勝ち上がり実績（動的対戦レベル）」評価
    if (horse.pastRaces && horse.pastRaces[0]) {
      const prevRace = horse.pastRaces[0];
      if (prevRace.winnerName) {
        const winnerName = prevRace.winnerName.trim();
        const prevRaceDate = prevRace.date;
        let winnerData: any = masterData.horses[winnerName];
        if (!winnerData) {
          winnerData = Object.values(masterData.horses).find(h => h.name === winnerName);
        }
        if (winnerData && winnerData.results) {
          const hasWonLater = winnerData.results.some((r: any) => r.date > prevRaceDate && r.rank === 1);
          if (hasWonLater) {
            potential += 25;
            tags.push("👑 動的対戦レベル高:前走勝ち馬の次走勝ち上がり裏付け");
          }
        }
      }
    }

    // ⑤ 【新要因5】着差（margin / timeDiff）と馬場状態・含水率の物理スケーリング
    if (horse.pastRaces) {
      const hasGoodFirmCloseResult = horse.pastRaces.some(pr => pr.condition === '良' && pr.timeDiff !== undefined && pr.timeDiff <= 0.3 && pr.result <= 3);
      if (hasGoodFirmCloseResult) {
        potential += 15;
        tags.push("⚖️ 砂理学:良馬場タフ戦僅差実績の真価");
      }
      const hasMuddyCloseResult = horse.pastRaces.some(pr => (pr.condition === '重' || pr.condition === '不良') && pr.timeDiff !== undefined && pr.timeDiff <= 0.6 && pr.result <= 3);
      if (hasMuddyCloseResult) {
        potential += 15;
        tags.push("⚖️ 砂理学:道悪高速追走耐久実績");
      }
    }

    // ⑥ 【新要因6】払戻金（refunds）傾向と高波乱トリガーによるオッズの「歪み」適合
    const isKochiFinal = /高知/.test(raceVenue) && (race.raceNumber === 12 || /ファイナル/.test(race.raceName || ''));
    const isOoiSpecial = /大井/.test(raceVenue) && /(重賞|特別)/.test(race.raceName || '');
    const isKawasakiSprint = /川崎/.test(raceVenue) && dist === 900;
    const isKasamatsuC = /笠松/.test(raceVenue) && /(C|ｃ)/.test(horse.raceClass || '');

    if ((isKochiFinal || isOoiSpecial || isKawasakiSprint || isKasamatsuC) && odds >= 8.0) {
      distortionBoost *= 1.25;
      potential += 20;
      tags.push("🌀 期待値の闇:高波乱トリガーによるオッズ歪み適合");
    }
  }

  const darkness = (potential / 100) * Math.pow(odds, 1.1) * distortionBoost;

  return {
    horseId: horse.id, horseName: horse.name, horseNumber: horse.number,
    potential: Math.round(potential * 10) / 10,
    darkness: Math.round(darkness * 100) / 100,
    evIndex: potential,
    aptitudeTags: tags,
    targetTag: isTargetYatomi || undefined,
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

  let col1 = axisNos;
  let col2 = axisNos;
  let col3: number[] | undefined = [...new Set([...axisNos, ...darkNos])].sort((a, b) => a - b);

  let tickets: number[][] = [];
  if (raceType === 'trifecta_exact') {
    // 評価順にソートされた上位6頭を抽出（A, B, C, D, E, F）
    const sorted = [...predictions].sort((a, b) => b.potential - a.potential || b.darkness - a.darkness || a.horseNumber - b.horseNumber);
    const horses6 = sorted.slice(0, 6).map(p => p.horseNumber);
    
    // 2-4-6 フォーメーション
    // 1着: A, B (2頭)
    // 2着: A, B, [C, D] (4頭)
    // 3着: A, B, C, D, [E, F] (6頭)
    const t1 = horses6.slice(0, 2);
    const t2 = horses6.slice(0, 4);
    const t3 = horses6.slice(0, 6);

    col1 = t1;
    col2 = t2;
    col3 = t3;

    for (const first of t1) {
      for (const second of t2) {
        if (first === second) continue;
        for (const third of t3) {
          if (first === third || second === third) continue;
          tickets.push([first, second, third]);
        }
      }
    }
  } else if (raceType === 'quinella') {
    // 評価順にソートされた上位5頭を抽出（A, B, C, D, E）
    const sorted = [...predictions].sort((a, b) => b.potential - a.potential || b.darkness - a.darkness || a.horseNumber - b.horseNumber);
    const horses5 = sorted.slice(0, 5).map(p => p.horseNumber);
    
    // 2頭軸フォーメーション (2 x 3)
    // 1頭目: A, B (2頭)
    // 2頭目: C, D, E (3頭)
    const t1 = horses5.slice(0, 2);
    const t2 = horses5.slice(2, 5);

    col1 = t1;
    col2 = t2;
    col3 = undefined;

    const ticketSet = new Set<string>();
    t1.forEach(a => t2.forEach(b => {
      ticketSet.add([a, b].sort((x, y) => x - y).join('-'));
    }));
    tickets = Array.from(ticketSet).map(t => t.split('-').map(Number));
  } else if (raceType === 'exacta') {
    // 評価順にソートされた上位5頭を抽出（A, B, C, D, E）
    const sorted = [...predictions].sort((a, b) => b.potential - a.potential || b.darkness - a.darkness || a.horseNumber - b.horseNumber);
    const horses5 = sorted.slice(0, 5).map(p => p.horseNumber);
    
    // 2頭軸フォーメーション (2 x 3)
    // 1頭目: A, B (2頭)
    // 2頭目: C, D, E (3頭)
    const t1 = horses5.slice(0, 2);
    const t2 = horses5.slice(2, 5);

    col1 = t1;
    col2 = t2;
    col3 = undefined;

    for (const first of t1) {
      for (const second of t2) {
        if (first === second) continue;
        tickets.push([first, second]);
      }
    }
  } else {
    const ticketSet = new Set<string>();
    combinations(axisNos, 3).forEach(c => ticketSet.add(c.sort((a,b)=>a-b).join('-')));
    combinations(axisNos, 2).forEach(p => darkNos.forEach(d => ticketSet.add([...p, d].sort((a,b)=>a-b).join('-'))));
    tickets = Array.from(ticketSet).map(t => t.split('-').map(Number));
  }

  return { type: raceType, col1, col2, col3: ['quinella', 'exacta'].includes(raceType) ? undefined : col3, tickets, totalPoints: tickets.length, axisHorses: axisNos, darkHorses: darkNos };
}

export function generateWin5Picks(races: Race[], allPredictions: Record<string, Prediction[]>): { raceId: string; picks: number[]; }[] {
  return races.map(race => ({ raceId: race.id, picks: (allPredictions[race.id] || []).sort((a, b) => b.evIndex - a.evIndex).slice(0, 3).map(p => p.horseNumber) }));
}

export function generateLearningPatch(race: Race, predictions: Prediction[], actualResult: { rank: number; horseNumber: number; }[], existingPatches: LearningPatch[]): LearningPatch | null {
  const adjustments: LearningPatch['adjustments'] = [];
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

// AIを利用した非同期ラーニングパッチ生成
export async function generateAILearningPatch(race: Race, predictions: Prediction[], actualResult: { rank: number; horseNumber: number; }[]): Promise<LearningPatch | null> {
  // 【新設】ルールベースのローカル学習パッチ生成（APIキー不要のフォールバック）
  if (predictions.length > 0 && actualResult.length > 0) {
    // AIが1番手評価（本命）にした馬
    const topPrediction = predictions[0];
    // 実際の着順
    const actualRank = actualResult.find(r => r.horseNumber === topPrediction.horseNumber)?.rank || 99;

    // もし本命馬が6着以下に大敗した場合、弱点を学習
    if (actualRank >= 6) {
      const horse = race.horses.find(h => h.number === topPrediction.horseNumber);
      if (horse) {
        const isInner = horse.frame <= 3;
        const isHeavy = race.condition === '重' || race.condition === '不良';
        const isOvervalued = horse.popularity === 1 && (horse.odds || 0) <= 2.5;
        
        let reason = "";
        let rule = "";
        
        if (isInner && isHeavy) {
          reason = "本命馬が重馬場の内枠で大敗しました。内を嫌うトラックバイアスを見落とした可能性があります。";
          rule = `競馬場: ${race.trackName}, 馬場: ${race.condition}, 枠: ${horse.frame}枠 -> 評価を大きく下げる（マイナス30点）`;
        } else if (isOvervalued && horse.weight > 0 && (horse.jockeyWeight || 55) / horse.weight * 100 >= 12.0) {
          reason = "過剰人気の小柄馬が斤量負けしました。斤量体重比のペナルティを強化する必要があります。";
          rule = "過剰人気（オッズ2.5倍以下）かつ斤量体重比12%以上の場合は絶対評価を下げる";
        } else {
          reason = `本命馬（${horse.name}）が${actualRank}着に大敗。展開や未知のバイアスによる敗因分析が必要です。`;
          rule = `血統: ${horse.bloodline?.split('/')[0] || '不明'} の ${race.trackName} ${race.distance}m 適性を再評価する`;
        }

        return {
          id: `patch_local_${Date.now()}`,
          version: '1.0 (Local)',
          date: new Date().toISOString(),
          description: `[${race.trackName} ${race.distance}m] ${reason} (補正: ${rule})`,
          track: race.trackName,
          condition: race.condition,
          adjustments: [], // ローカルフォールバックはテキスト分析のみとする
          active: true
        } as unknown as LearningPatch;
      }
    }
  }

  try {
    const res = await fetch('/api/learning-patch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ race, predictions, actualResult }),
    });

    if (!res.ok) {
      console.warn("AI Learning failed:", await res.text());
      return null;
    }

    const patch: LearningPatch = await res.json();
    return patch;
  } catch (err) {
    console.error("AI Learning exception:", err);
    return null;
  }
}

