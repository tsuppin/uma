import { Horse, Prediction, Race, LearningPatch, MasterData } from '../types';
import { calculateUnifiedWaveLevel } from './waveLevelCalculator';

// 地方特化のエリート騎手リスト（南関東を中心とした地方トップジョッキー）
const NAR_ELITE_JOCKEYS = ["森泰斗", "御神本訓史", "矢野貴之", "笹川翼", "吉原寛人", "和田譲治", "山崎誠士", "吉村智洋", "赤岡修次", "山口勲"];

// 地方ダート無双血統
const NAR_POWER_SIRES = ['シニスターミニスター', 'パイロ', 'サウスヴィグラス', 'ヘニーヒューズ', 'マジェスティックウォリアー', 'エスポワールシチー', 'ホッコータルマエ', 'コパノリッキー', 'スマートファルコン', 'カネヒキリ'];

export function calculateNARScore(
  horse: Horse, 
  race: Race, 
  learningPatches: LearningPatch[],
  masterData: MasterData
): Prediction {
  const hm = masterData.horses?.[horse.name];
  
  let bloodline = horse.bloodline || '';
  if (hm && !bloodline && hm.sire) {
    bloodline = `${hm.sire} / ${hm.dam || 'Unknown'}`;
  }

  const trackName = race.trackName || '';
  const dist = race.distance;
  const frame = horse.frame;
  const odds = horse.odds || 10;
  const kinryo = horse.jockeyWeight || 55;
  const jockey = horse.jockey || '';
  
  let potential = 1000;  // [減点方式] 初期値を1000に変更
  const tags: string[] = [];

  // ==========================================
  // 【共通】地方ダートの絶対セオリー（パワー血統と地方名手）
  // ==========================================
  
  // 地方特化のパワー血統加点
  const isNarSire = NAR_POWER_SIRES.some(s => (horse.sire || bloodline).includes(s));
  if (isNarSire) {
    // [減点方式] potential += 40;
    // [要見直し] tags.push("👑 地方ダート特注: 深い砂を力でねじ伏せる圧倒的パワー血統");
  }

  // 地方エリート騎手加点
  if (NAR_ELITE_JOCKEYS.some(j => jockey.includes(j))) {
    // [減点方式] potential += 35;
    // [要見直し2] tags.push("👑 地方ダート特注: コースのクセを熟知した地方トップジョッキー");
  }

  // JRA所属馬のダートグレード競走（Jpn格付け）における基礎能力差
  if (race.raceName && race.raceName.match(/Jpn[1-3]/i)) {
    if (horse.trainer && horse.trainer.includes('JRA')) { // もしくは馬の所属情報があれば判定
      // 便宜上、栗東・美浦などの文字が含まれるかでJRA判定
      // [減点方式] potential += 50;
      tags.push("👑 地方特注: ダート交流重賞におけるJRA所属馬の地力の違い");
    }
  }

  // ==========================================
  // 南関東4場（大井・川崎・船橋・浦和）の特化ロジック
  // ==========================================

  if (trackName.includes('浦和')) {
    // マニアック1: 日本一の小回り・逃げ先行絶対主義
    if (frame <= 2 && (horse.style === '逃げ' || horse.style === '先行')) {
      // [減点方式] potential += 50;
      tags.push("🔥 浦和マニアック: 日本一の小回りを制する『1〜2枠×逃げ先行』の絶対優位");
    }
    // マニアック2: 大外枠の差し・追込の絶望
    if (frame >= 7 && (horse.style === '差し' || horse.style === '追込')) {
      potential -= 50;
      tags.push("⚠️ 浦和危険: コース形状的に物理的に届かない大外枠の差し・追込（消し）");
    }
  } 
  else if (trackName.includes('大井')) {
    // ==========================================
    // 【新設】大井特化・最新トレンドプロトコル（2026/06抽出）
    // ==========================================
    const popularity = horse.popularity || 99;
    
    // ルール1: 1番人気・2番人気の勝率が極めて高い（頭固定推奨）
    if (popularity === 1 || popularity === 2) {
      potential += 40; // 勝率75%の鉄板データとして加点
      tags.push("🎯 大井特注: 1・2番人気の頭固定推奨(勝率75%データ)");
    }
    
    // ルール2: 圧倒的な「外枠（5〜8枠）」有利の傾向
    if (frame >= 5) {
      potential += 30; // 1着の67%、連対の17/24が5〜8枠
      tags.push("🔥 大井特注: 圧倒的有利な外枠(5〜8枠)からの好走");
    } else if (race.condition === '重') {
      potential -= 20; // 重馬場の内枠は不利
      tags.push("⚠️ 大井危険: 重馬場の不利な内枠(1〜4枠)");
    }
    
    // ルール1(改): 馬体重の増減が「-4kg〜+5kg」の馬が圧倒的有利
    const weightChange = horse.weightChange || 0;
    if (weightChange >= -4 && weightChange <= 5) {
      potential += 25;
      tags.push("👑 大井特注: 馬体重安定(-4kg〜+5kg)の圧倒的勝負気配");
    } else if (weightChange >= 10 || weightChange <= -10) {
      potential -= 20;
      tags.push("⚠️ 大井危険: 大幅な馬体重増減は割引(状態不安定)");
    }
    
    // ルール4(改): 3着に穴馬が飛び込む「ヒモ荒れ」に注意
    if (popularity >= 10) {
      tags.push("🌟 大井特注: ヒモ荒れ候補の二桁人気伏兵");
    }

    // ==========================================
    // 【追加】大井特化・馬の属性プロトコル（2026/06抽出）
    // ==========================================
    
    // 新ルール2: ダートグレード競走（交流重賞）は「JRA所属馬」が上位を独占
    const isJpnGrade = race.raceName && race.raceName.match(/Jpn[1-3I-III]/i);
    if (isJpnGrade) {
      const isJRAHorse = horse.belonging?.includes('JRA') || horse.stableLocation?.match(/(美浦|栗東)/) || (horse.jockey && ['ルメール', '川田', '武豊', '戸崎', '松山', '坂井', '横山武'].some(j => horse.jockey.includes(j)));
      if (isJRAHorse) {
        potential += 40;
        tags.push("👑 大井Jpn特注: 交流重賞におけるJRA所属馬の圧倒的実力");
      } else {
        potential -= 30;
        tags.push("⚠️ 大井Jpn危険: 交流重賞における地方所属馬の能力差");
      }
    }

    // 新ルール3: 古馬戦は「4歳馬」、若駒戦(3歳戦)は「牝馬」が活躍
    const is3yoRace = race.raceName && race.raceName.includes('3歳');
    const isKobaRace = !is3yoRace && !isJpnGrade && race.raceClass && race.raceClass.match(/[ABC]級/i);
    
    if (isKobaRace && horse.age === 4) {
      potential += 20;
      tags.push("🔥 大井特注: 古馬戦(C・B級)で勢いのある4歳馬");
    } else if (is3yoRace && !isJpnGrade && horse.gender === '牝') {
      potential += 25;
      tags.push("🔥 大井特注: 3歳戦における仕上がりの早い牝馬");
    }

    // 新ルール4: 毛色は「鹿毛」と「黒鹿毛」が優勢(勝率67%)
    const isGoodColor = horse.coatColor && (horse.coatColor === '鹿毛' || horse.coatColor === '黒鹿毛');
    if (isGoodColor) {
      potential += 10;
      tags.push(`💎 大井特注: 大井で優勢な毛色(${horse.coatColor})`);
    }

    // ==========================================
    // 【追加】大井特化・騎手＆負担重量プロトコル（2026/06抽出）
    // ==========================================
    
    // 第3弾ルール1: 前走から「継続騎乗」しているコンビを積極的に狙う(勝率67%)
    const prevRaceJockey = horse.pastRaces && horse.pastRaces.length > 0 ? horse.pastRaces[0].jockey : horse.prevJockey;
    if (prevRaceJockey && horse.jockey && horse.jockey.includes(prevRaceJockey.replace(/[☆▲△◇]/g, ''))) {
      potential += 25;
      tags.push("🏇 大井特注: 呼吸の合う継続騎乗コンビ(勝率67%)");
    }

    // 第3弾ルール2: 「トップジョッキー」と序盤の「減量騎手」の活躍
    const isOhiTopJockey = horse.jockey && ['矢野', '笹川', '森泰斗', '御神本', '和田譲', '西啓太'].some(j => horse.jockey.includes(j));
    const isApprentice = horse.jockey && horse.jockey.match(/[☆▲△◇]/);
    const isEarlyRace = race.raceNumber && race.raceNumber <= 4;
    
    if (isOhiTopJockey) {
      potential += 15;
      tags.push("👑 大井特注: 信頼のトップジョッキー");
    } else if (isApprentice && isEarlyRace) {
      potential += 20;
      tags.push("🔥 大井特注: 序盤レース(1〜4R)での減量騎手の積極策");
    }

    // 第3弾ルール3: 交流重賞（メインレース）は「JRA所属騎手」が上位を独占
    if (isJpnGrade) {
      const isJraTopJockey = horse.jockey && ['戸崎', '岩田望', '坂井', '西村淳', 'ルメール', '川田', '武豊', '松山'].some(j => horse.jockey.includes(j));
      if (isJraTopJockey) {
        potential += 20; // 以前のJRA所属馬加点と併せてさらにプラス
        tags.push("👑 大井Jpn特注: 交流重賞におけるJRAトップジョッキーの技術");
      }
    }

    // 第3弾ルール4: 重い「負担重量（56.0kg以上）」を苦にしない
    const currentWeight = horse.jockeyWeight || 55;
    if (currentWeight >= 56.0) {
      potential += 10;
      tags.push("💪 大井特注: 56kg以上の重斤量を苦にしない馬力");
    }

    // マニアック1: 外回りの長い直線（差し・追込の台頭）
    if ((dist === 1800 || dist === 2000) && (horse.style === '差し' || horse.style === '追込') && isNarSire) {
      // [減点方式] potential += 45;
      tags.push("🔥 大井マニアック: 地方唯一の長い直線で末脚が爆発するパワー型差し馬");
    }
    // マニアック2: シニスターミニスター等の大井巧者（大井D2000特注）
    if (dist === 2000) {
      const isOhiMaster = ['シニスターミニスター', 'パイロ', 'マジェスティックウォリアー'].some(s => (horse.sire || bloodline).includes(s));
      if (isOhiMaster) {
        // [減点方式] potential += 40;
        tags.push("🔥 大井マニアック: 大井の中距離を力でねじ伏せる大井巧者血統");
      }
    }
    // マニアック3: オーストラリア産白砂適性（タフな馬場での大型馬）
    if (horse.weight && horse.weight >= 520) {
      // [減点方式] potential += 25;
      tags.push("🔥 大井特注: 極端に力のいる白砂をこなす520kg以上の大型馬格");
    }
  } 
  else if (trackName.includes('川崎')) {
    // マニアック1: 超絶タイトコーナーの内枠逃げ（川崎1500特注）
    if (dist === 1500 && frame <= 3 && horse.style === '逃げ') {
      // [減点方式] potential += 50;
      tags.push("🔥 川崎マニアック: 日本一タイトなコーナーをロスなく回る川崎1500m内枠逃げ");
    }
    // マニアック2: 向正面からのロンスパ（マクリ実績）
    const hasMakuri = horse.pastRaces?.some(pr => pr.cornerOuterCount >= 3 && pr.result <= 3); 
    if (hasMakuri) {
      // [減点方式] potential += 30;
      tags.push("🔥 川崎特注: 向正面からのロンスパ（マクリ）に対応できる地方特有の機動力");
    }
  } 
  else if (trackName.includes('船橋')) {
    // マニアック1: スパイラルカーブ（外枠の差し・マクリ有利）
    if (frame >= 6 && (horse.style === '差し' || horse.style === '先行' || horse.style === 'マクリ')) {
      // [減点方式] potential += 45;
      tags.push("🔥 船橋マニアック: スパイラルカーブの遠心力を活かして加速する外枠マクリ・差し");
    }
  }
  else if (trackName.includes('名古屋') || trackName.includes('弥富')) {
    // マニアック: 圧倒的な先行有利（移転後の新名古屋）
    if (horse.style === '逃げ' || horse.style === '先行') {
      // [減点方式] potential += 35;
      tags.push("🔥 名古屋マニアック: 移転後の新競馬場特有の止まらない圧倒的先行力");
    }
  }
  else if (trackName.includes('笠松')) {
    // マニアック: 小回り特有の内枠先行
    if (frame <= 4 && (horse.style === '逃げ' || horse.style === '先行')) {
      // [減点方式] potential += 35;
      tags.push("🔥 笠松マニアック: タイトなコーナーを最短で回る内枠先行の絶対優位");
    }
  }
  else if (trackName.includes('園田') || trackName.includes('姫路')) {
    // マニアック1: 1400mの1コーナー争い（内枠絶対有利・イン突き）
    if (dist === 1400 && frame <= 3) {
      // [減点方式] potential += 45;
      tags.push("🔥 園田マニアック: 最初のコーナー争いを制し、イン突きを狙える『内枠』の絶対的有利");
    }
    // マニアック2: 大外枠の絶望
    if (frame >= 7 && dist === 1400) {
      potential -= 30;
      tags.push("⚠️ 園田危険: 1400mの1コーナーで外を回される致命的な距離ロス（外枠減点）");
    }
  }
  else if (trackName.includes('高知')) {
    // マニアック1: 内ラチ沿いの深い砂（1枠のペナルティ）
    if (frame === 1 || frame === 2) {
      potential -= 45;
      tags.push("⚠️ 高知マニアック危険: 馬場保護用の深い砂に足を取られる内枠（大幅減点）");
    }
    // マニアック2: 深い砂を避ける外回しの差し（外枠・差し有利）
    if (frame >= 6 && (horse.style === '差し' || horse.style === '追込' || horse.style === '先行')) {
      // [減点方式] potential += 50;
      tags.push("🔥 高知マニアック: 内の深い砂を避け、馬場の良い外側をスムーズに押し上げる『外枠』");
    }
  }
  else if (trackName.includes('佐賀')) {
    // マニアック: 佐賀特有の内ラチ開け（深い砂）
    if (frame === 1 || frame === 2) {
      potential -= 35;
      tags.push("⚠️ 佐賀マニアック危険: 砂が非常に深くスタミナを削られる内枠（大幅減点）");
    }
    if (frame >= 5 && (horse.style === '先行' || horse.style === '差し')) {
      // [減点方式] potential += 40;
      tags.push("🔥 佐賀マニアック: 荒れた内側を避けて好位を押し上げる『外枠の先行・差し』");
    }
  }
  else if (trackName.includes('金沢') || trackName.includes('水沢')) {
    // マニアック: 極端な小回りコースによる「イン前絶対有利」
    if (frame <= 3 && (horse.style === '逃げ' || horse.style === '先行')) {
      // [減点方式] potential += 45;
      tags.push(`🔥 ${trackName.replace(/競馬場/g, '')}マニアック: 超小回りコースで物理的に止まらない『内枠の逃げ先行』`);
    }
    if (horse.style === '追込') {
      potential -= 40;
      tags.push(`⚠️ ${trackName.replace(/競馬場/g, '')}危険: コーナーがタイトすぎて物理的に届かない追込馬`);
    }
  }
  else if (trackName.includes('門別') || trackName.includes('盛岡')) {
    // マニアック: 地方屈指の大箱コース（直線が長く差しが届く）
    if ((horse.style === '差し' || horse.style === '追込') && isNarSire) {
      // [減点方式] potential += 40;
      tags.push(`🔥 ${trackName.replace(/競馬場/g, '')}マニアック: 地方屈指の大箱コースで末脚が爆発するパワー型差し馬`);
    }
  }

  // ==========================================
  // ベースロジック（オッズ歪み等）
  // ==========================================
  const prevRaceData = horse.pastRaces && horse.pastRaces.length > 0 ? horse.pastRaces[0] : undefined;

  if (odds >= 15.0) {
    if (prevRaceData && (prevRaceData.isStumbled || prevRaceData.cornerOuterCount >= 4)) {
      // [減点方式] potential += 30;
      tags.push("💰 期待値爆発: 前走物理的不利(度外視) × 大穴オッズ");
    }
  }

  // ===================================================
  // 【追加】結果×出馬表のクロスロジック（期待値ハック）
  // ===================================================
  const frontRunnersCount = race.horses.filter(h => h.style === '逃げ').length;
  const isFrontBias = race.condition === '重' || race.condition === '不良' || 
    learningPatches.some(p => p.description.includes('前残り'));
  
  // 1. 展開（ペース）予測と脚質の逆転（相殺）ロジック
  if (frontRunnersCount >= 3) {
    if (isFrontBias) {
      // ハイペースでも前が止まらない馬場状態の場合の特殊相殺
      if (horse.style === '逃げ' || horse.style === '先行') {
        // [減点方式] potential += 30;
        tags.push("⚔️ 前止まらず: ハイペースでも潰れない前残り特殊馬場");
      }
    } else if (prevRaceData && prevRaceData.last3fTime) {
      const prevLast3f = parseFloat(prevRaceData.last3fTime);
      if ((horse.style === '差し' || horse.style === '追込') && prevRaceData.result >= 4 && !isNaN(prevLast3f) && prevLast3f <= 38.0) {
        // [減点方式] potential += 45;
        // [要見直し2] tags.push("🔥 期待値クロス: 前走展開泣きの上がり上位馬（ハイペース必至で台頭）");
      }
    }
  } else if (frontRunnersCount === 1) {
    if (horse.style === '逃げ') {
      // [減点方式] potential += 40;
      // [要見直し2] tags.push("🔥 期待値クロス: 競り掛ける馬が不在の単騎逃げ確定（マイペース絶対有利）");
    }
  }

  // 1-B. 「逃げ馬の隣の枠」スリップストリーム恩恵
  if (horse.style === '先行' || horse.style === '好位') {
    const insideHorse = race.horses.find(h => h.number === horse.number - 1);
    if (insideHorse && insideHorse.style === '逃げ') {
      // [減点方式] potential += 15;
      tags.push("🛡️ 砂被り回避: 内側の逃げ馬を利用する絶好の特等席（スリップストリーム）");
    }
  }

  // 2. 着順ではなく着差（タイム差）評価ロジック
  if (prevRaceData && prevRaceData.result >= 6 && prevRaceData.timeDiff !== undefined) {
    if (prevRaceData.timeDiff <= 0.6) {
      // [減点方式] potential += 35;
      tags.push("🔥 期待値クロス: 前走6着以下だが着差0.6秒以内の実力馬（オッズ盲点）");
    }
  }

  // 3. 陣営の勝負気配（トップ騎手への乗り替わり・ヤリ）検知
  if (prevRaceData && prevRaceData.jockey) {
    const prevWasTop = NAR_ELITE_JOCKEYS.some(j => prevRaceData.jockey.includes(j));
    const nowIsTop = NAR_ELITE_JOCKEYS.some(j => horse.jockey.includes(j));
    if (!prevWasTop && nowIsTop) {
      // [減点方式] potential += 40;
      tags.push("🔀 勝負のヤリ: 前走非エリートからの地方エース手配（陣営の超勝負気配）");
    }
  }

  // 4. 同開催（連闘）のリベンジ追跡
  if (horse.rotation === '連闘' && prevRaceData) {
    if (prevRaceData.condition && race.condition && prevRaceData.condition !== race.condition) {
      // [減点方式] potential += 15;
      tags.push("🔄 執念の連闘: 馬場条件の好転を狙った陣営のリベンジ出走");
    } else if (masterData?.horses[horse.name]?.incidents?.some(i => i.note === "上がり最速で敗退")) {
      // [減点方式] potential += 15;
      tags.push("🔄 執念の連闘: 前走展開泣きからの即反撃（陣営の勝算あり）");
    }
  }

  // ===================================================
  // 【追加】未使用データ（馬体重・特殊状態）ロジック（地方用）
  // ===================================================

  // 1. 馬体重の異常増減ロジック
  if (horse.gender === '牝' && horse.weightChange <= -10) {
    potential -= 30;
    tags.push('⚠️ 危険信号: 牝馬の大幅馬体減（細化懸念）');
  }
  if (horse.isAfterRest && horse.weightChange >= 15) {
    const penalty = horse.age <= 3 ? 10 : 20;
    potential -= penalty;
    tags.push('⚠️ 危険信号: 休み明けの大幅馬体増（太め残り懸念）');
  }

  // 2. 前走の明確な不利からの巻き返し
  if (prevRaceData && prevRaceData.incidents) {
    if (prevRaceData.incidents.includes('前が壁') || prevRaceData.incidents.includes('詰まる') || prevRaceData.incidents.includes('不利')) {
      // [減点方式] potential += 30;
      tags.push('🚨 巻き返し必至: 前走「前が壁・不利」による不完全燃焼');
    }
  }

  // 3. 特殊馬具（ブリンカー着用）
  if (horse.useBlinkers) {
    // [減点方式] potential += 10;
    // [要見直し] tags.push('🐴 ブリンカー着用（集中力UP）');
  }
  // ==========================================
  // 【追加】NAR未使用データ（転入・泥・斤量・遠征）完全活用ロジック
  // ==========================================

  // 1. JRA転入初戦（クラスの壁）の無双ロジック
  if (horse.transferFrom === 'JRA') {
    // [減点方式] potential += 30;
    // [要見直し] tags.push('🚀 中央からの刺客: JRA転入初戦の絶対的能力上位');
  } else if (prevRaceData && prevRaceData.venue && prevRaceData.venue.match(/(東京|中山|京都|阪神|中京|新潟|福島|小倉|札幌|函館)/)) {
    // [減点方式] potential += 30;
    // [要見直し] tags.push('🚀 中央からの刺客: JRA転入初戦の絶対的能力上位');
  }

  // 2. 雨の日の「高速泥ダート」前残りバイアス
  if (race.condition === '重' || race.condition === '不良' || (race.moistureContent && race.moistureContent >= 10)) {
    if (horse.style === '逃げ') {
      // [減点方式] potential += 25;
      tags.push('☔ 高速泥ダート: 前残り超有利（泥被り回避の逃げ馬）');
    }
  }

  // 3. 減量騎手（軽斤量）の逃げ残り物理アドバンテージ
  if (horse.jockeyWeight && horse.jockeyWeight <= 53 && (horse.style === '逃げ' || horse.style === '先行')) {
    // [減点方式] potential += 20;
    tags.push(`🪽 裸同然の軽斤量(${horse.jockeyWeight}kg): 減量騎手×先行力によるアドバンテージ`);
  }

  // 4. 南関東（エリート地区）からの遠征馬バイアス
  const isSouthKantoTrack = race.trackName.match(/(大井|川崎|船橋|浦和)/);
  if (!isSouthKantoTrack) {
    const isSouthKantoHorse = horse.belonging?.match(/(大井|川崎|船橋|浦和)/) || horse.stableLocation?.match(/(大井|川崎|船橋|浦和)/);
    if (isSouthKantoHorse) {
      // [減点方式] potential += 20;
      tags.push('💎 エリート遠征: 南関（トップ地区）からの格上挑戦');
    }
  }
  // ==========================================
  // 【追加】MasterDataの記憶（自己学習履歴）の活用
  // ==========================================
  if (masterData && masterData.horses && masterData.horses[horse.name]) {
    const historicalIncidents = masterData.horses[horse.name].incidents;
    if (historicalIncidents && historicalIncidents.length > 0) {
      const hasHugeWin = historicalIncidents.some((inc: any) => inc.note === "大差圧勝");
      const hasBadLuck = historicalIncidents.some((inc: any) => inc.note === "レース中不利");
      const hasFastest3fLoss = historicalIncidents.some((inc: any) => inc.note === "上がり最速で敗退");
      
      if (hasHugeWin) {
        // [減点方式] potential += 20;
        tags.push('👑 怪物記憶: AIが記憶する過去の「大差圧勝」履歴（底なしポテンシャル）');
      }
      if (hasBadLuck) {
        // [減点方式] potential += 15;
        tags.push('🧠 不利記憶: AIが記憶する過去のレース不利履歴からの巻き返し');
      }
      if (hasFastest3fLoss) {
        // [減点方式] potential += 20;
        tags.push('🕵️ 隠れ穴馬記憶: 前走「上がり最速で敗退（展開不向き）」からの巻き返し激走');
      }
    }
  }

  // ==========================================
  // 動的学習パッチの適用
  // ==========================================
  for (const patch of learningPatches) {
    if (patch.active === false) continue;
    if (patch.track && patch.track !== trackName) continue;
    
    // NARはコンディション（馬場状態）を一旦無視しても良いが、一応判定
    // if (patch.condition && patch.condition !== condition) continue;
    
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
      if (applies) { 
        potential += adj.scoreAdjust; 
        tags.push(`学習パッチ(${patch.version})`); 
      }
    }
  }

  // ==========================================
  // 【刷新】レース・フェーズ別 人気信頼度 & 波乱度解析（統一波乱度対応）
  // ==========================================
  const wave = race.waveLevel || calculateUnifiedWaveLevel(race);
  const popularity = horse.popularity || 99;
  
  if (wave.level <= 2) {
    // 地方ダートの堅いレースは上位人気がより信頼できる
    if (popularity === 1) {
      // [減点方式] potential += 40;
      tags.push(`👑堅実フェーズ:1番人気信頼 (${wave.category})`);
    } else if (popularity >= 2 && popularity <= 3) {
      // [減点方式] potential += 15;
      tags.push(`🎯堅実フェーズ:上位人気順当 (${wave.category})`);
    } else {
      potential -= 20;
    }
  } else if (wave.level >= 4) {
    // 地方特有のヒモ荒れ・前残り波乱
    if (popularity === 1) {
      potential -= 10;
      tags.push(`⚠️波乱フェーズ:1番人気過信禁物 (${wave.category})`);
    } else if (popularity >= 4 && popularity <= 8) {
      // [減点方式] potential += 25;
      // [要見直し2] tags.push(`💎波乱の使者:激走の伏兵 (${wave.category})`);
    }
  }


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

  const finalPotential = Math.round(Math.max(0, potential) * 10) / 10;
  const darkness = (finalPotential / 100) * Math.pow(odds, 1.1);

  return {
    horseId: horse.id,
    horseName: horse.name,
    horseNumber: horse.number,
    potential: finalPotential,
    darkness: Math.round(darkness * 100) / 100,
    evIndex: finalPotential,
    aptitudeTags: tags,
    tags: tags
  };
}
