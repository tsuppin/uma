import { Horse, Prediction, Race, LearningPatch, MasterData } from '../types';

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
  
  let potential = 500;
  const tags: string[] = [];

  // ==========================================
  // 【共通】地方ダートの絶対セオリー（パワー血統と地方名手）
  // ==========================================
  
  // 地方特化のパワー血統加点
  const isNarSire = NAR_POWER_SIRES.some(s => (horse.sire || bloodline).includes(s));
  if (isNarSire) {
    potential += 40;
    tags.push("👑 地方ダート特注: 深い砂を力でねじ伏せる圧倒的パワー血統");
  }

  // 地方エリート騎手加点
  if (NAR_ELITE_JOCKEYS.some(j => jockey.includes(j))) {
    potential += 35;
    tags.push("👑 地方ダート特注: コースのクセを熟知した地方トップジョッキー");
  }

  // JRA所属馬のダートグレード競走（Jpn格付け）における基礎能力差
  if (race.raceName && race.raceName.match(/Jpn[1-3]/i)) {
    if (horse.trainer && horse.trainer.includes('JRA')) { // もしくは馬の所属情報があれば判定
      // 便宜上、栗東・美浦などの文字が含まれるかでJRA判定
      potential += 50;
      tags.push("👑 地方特注: ダート交流重賞におけるJRA所属馬の地力の違い");
    }
  }

  // ==========================================
  // 南関東4場（大井・川崎・船橋・浦和）の特化ロジック
  // ==========================================

  if (trackName.includes('浦和')) {
    // マニアック1: 日本一の小回り・逃げ先行絶対主義
    if (frame <= 2 && (horse.style === '逃げ' || horse.style === '先行')) {
      potential += 50;
      tags.push("🔥 浦和マニアック: 日本一の小回りを制する『1〜2枠×逃げ先行』の絶対優位");
    }
    // マニアック2: 大外枠の差し・追込の絶望
    if (frame >= 7 && (horse.style === '差し' || horse.style === '追込')) {
      potential -= 50;
      tags.push("⚠️ 浦和危険: コース形状的に物理的に届かない大外枠の差し・追込（消し）");
    }
  } 
  else if (trackName.includes('大井')) {
    // マニアック1: 外回りの長い直線（差し・追込の台頭）
    if ((dist === 1800 || dist === 2000) && (horse.style === '差し' || horse.style === '追込') && isNarSire) {
      potential += 45;
      tags.push("🔥 大井マニアック: 地方唯一の長い直線で末脚が爆発するパワー型差し馬");
    }
    // マニアック2: シニスターミニスター等の大井巧者（大井D2000特注）
    if (dist === 2000) {
      const isOhiMaster = ['シニスターミニスター', 'パイロ', 'マジェスティックウォリアー'].some(s => (horse.sire || bloodline).includes(s));
      if (isOhiMaster) {
        potential += 40;
        tags.push("🔥 大井マニアック: 大井の中距離を力でねじ伏せる大井巧者血統");
      }
    }
    // マニアック3: オーストラリア産白砂適性（タフな馬場での大型馬）
    if (horse.weight && horse.weight >= 520) {
      potential += 25;
      tags.push("🔥 大井特注: 極端に力のいる白砂をこなす520kg以上の大型馬格");
    }
  } 
  else if (trackName.includes('川崎')) {
    // マニアック1: 超絶タイトコーナーの内枠逃げ（川崎1500特注）
    if (dist === 1500 && frame <= 3 && horse.style === '逃げ') {
      potential += 50;
      tags.push("🔥 川崎マニアック: 日本一タイトなコーナーをロスなく回る川崎1500m内枠逃げ");
    }
    // マニアック2: 向正面からのロンスパ（マクリ実績）
    const hasMakuri = horse.pastRaces?.some(pr => pr.cornerOuterCount >= 3 && pr.result <= 3); 
    if (hasMakuri) {
      potential += 30;
      tags.push("🔥 川崎特注: 向正面からのロンスパ（マクリ）に対応できる地方特有の機動力");
    }
  } 
  else if (trackName.includes('船橋')) {
    // マニアック1: スパイラルカーブ（外枠の差し・マクリ有利）
    if (frame >= 6 && (horse.style === '差し' || horse.style === '先行' || horse.style === 'マクリ')) {
      potential += 45;
      tags.push("🔥 船橋マニアック: スパイラルカーブの遠心力を活かして加速する外枠マクリ・差し");
    }
  }
  else if (trackName.includes('名古屋') || trackName.includes('弥富')) {
    // マニアック: 圧倒的な先行有利（移転後の新名古屋）
    if (horse.style === '逃げ' || horse.style === '先行') {
      potential += 35;
      tags.push("🔥 名古屋マニアック: 移転後の新競馬場特有の止まらない圧倒的先行力");
    }
  }
  else if (trackName.includes('笠松')) {
    // マニアック: 小回り特有の内枠先行
    if (frame <= 4 && (horse.style === '逃げ' || horse.style === '先行')) {
      potential += 35;
      tags.push("🔥 笠松マニアック: タイトなコーナーを最短で回る内枠先行の絶対優位");
    }
  }
  else if (trackName.includes('園田') || trackName.includes('姫路')) {
    // マニアック1: 1400mの1コーナー争い（内枠絶対有利・イン突き）
    if (dist === 1400 && frame <= 3) {
      potential += 45;
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
      potential += 50;
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
      potential += 40;
      tags.push("🔥 佐賀マニアック: 荒れた内側を避けて好位を押し上げる『外枠の先行・差し』");
    }
  }
  else if (trackName.includes('金沢') || trackName.includes('水沢')) {
    // マニアック: 極端な小回りコースによる「イン前絶対有利」
    if (frame <= 3 && (horse.style === '逃げ' || horse.style === '先行')) {
      potential += 45;
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
      potential += 40;
      tags.push(`🔥 ${trackName.replace(/競馬場/g, '')}マニアック: 地方屈指の大箱コースで末脚が爆発するパワー型差し馬`);
    }
  }

  // ==========================================
  // ベースロジック（オッズ歪み等）
  // ==========================================
  const prevRaceData = horse.pastRaces && horse.pastRaces.length > 0 ? horse.pastRaces[0] : undefined;

  if (odds >= 15.0) {
    if (prevRaceData && (prevRaceData.isStumbled || prevRaceData.cornerOuterCount >= 4)) {
      potential += 30;
      tags.push("💰 期待値爆発: 前走物理的不利(度外視) × 大穴オッズ");
    }
  }

  // ===================================================
  // 【追加】結果×出馬表のクロスロジック（期待値ハック）
  // ===================================================
  const frontRunnersCount = race.horses.filter(h => h.style === '逃げ').length;
  
  // 1. 展開（ペース）予測と脚質の逆転ロジック
  if (frontRunnersCount >= 3) {
    if (prevRaceData && prevRaceData.last3fTime) {
      const prevLast3f = parseFloat(prevRaceData.last3fTime);
      if ((horse.style === '差し' || horse.style === '追込') && prevRaceData.result >= 4 && !isNaN(prevLast3f) && prevLast3f <= 38.0) {
        potential += 45;
        tags.push("🔥 期待値クロス: 前走展開泣きの上がり上位馬（ハイペース必至で台頭）");
      }
    }
  } else if (frontRunnersCount === 1) {
    if (horse.style === '逃げ') {
      potential += 40;
      tags.push("🔥 期待値クロス: 競り掛ける馬が不在の単騎逃げ確定（マイペース絶対有利）");
    }
  }

  // 2. 着順ではなく着差（タイム差）評価ロジック
  if (prevRaceData && prevRaceData.result >= 6 && prevRaceData.timeDiff !== undefined) {
    if (prevRaceData.timeDiff <= 0.6) {
      potential += 35;
      tags.push("🔥 期待値クロス: 前走6着以下だが着差0.6秒以内の実力馬（オッズ盲点）");
    }
  }

  // 3. 陣営の勝負気配（トップ騎手への乗り替わり）検知
  if (prevRaceData && prevRaceData.jockey) {
    const prevWasTop = NAR_ELITE_JOCKEYS.some(j => prevRaceData.jockey.includes(j));
    const nowIsTop = NAR_ELITE_JOCKEYS.some(j => horse.jockey.includes(j));
    if (!prevWasTop && nowIsTop) {
      potential += 40;
      tags.push("🔥 期待値クロス: 前走非エリートからの地方トップ騎手手配（陣営の超勝負気配）");
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
      potential += 30;
      tags.push('🚨 巻き返し必至: 前走「前が壁・不利」による不完全燃焼');
    }
  }

  // 3. 特殊馬具（ブリンカー着用）
  if (horse.useBlinkers) {
    potential += 10;
    tags.push('🐴 ブリンカー着用（集中力UP）');
  }
  // ==========================================
  // 【追加】NAR未使用データ（転入・泥・斤量・遠征）完全活用ロジック
  // ==========================================

  // 1. JRA転入初戦（クラスの壁）の無双ロジック
  if (horse.transferFrom === 'JRA') {
    potential += 30;
    tags.push('🚀 中央からの刺客: JRA転入初戦の絶対的能力上位');
  } else if (prevRaceData && prevRaceData.venue && prevRaceData.venue.match(/(東京|中山|京都|阪神|中京|新潟|福島|小倉|札幌|函館)/)) {
    potential += 30;
    tags.push('🚀 中央からの刺客: JRA転入初戦の絶対的能力上位');
  }

  // 2. 雨の日の「高速泥ダート」前残りバイアス
  if (race.condition === '重' || race.condition === '不良' || (race.moistureContent && race.moistureContent >= 10)) {
    if (horse.style === '逃げ') {
      potential += 25;
      tags.push('☔ 高速泥ダート: 前残り超有利（泥被り回避の逃げ馬）');
    }
  }

  // 3. 減量騎手（軽斤量）の逃げ残り物理アドバンテージ
  if (horse.jockeyWeight && horse.jockeyWeight <= 53 && (horse.style === '逃げ' || horse.style === '先行')) {
    potential += 20;
    tags.push(`🪽 裸同然の軽斤量(${horse.jockeyWeight}kg): 減量騎手×先行力によるアドバンテージ`);
  }

  // 4. 南関東（エリート地区）からの遠征馬バイアス
  const isSouthKantoTrack = race.trackName.match(/(大井|川崎|船橋|浦和)/);
  if (!isSouthKantoTrack) {
    const isSouthKantoHorse = horse.belonging?.match(/(大井|川崎|船橋|浦和)/) || horse.stableLocation?.match(/(大井|川崎|船橋|浦和)/);
    if (isSouthKantoHorse) {
      potential += 20;
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
      
      if (hasHugeWin) {
        potential += 20;
        tags.push('👑 怪物記憶: AIが記憶する過去の「大差圧勝」履歴（底なしポテンシャル）');
      }
      if (hasBadLuck) {
        potential += 15;
        tags.push('🧠 不利記憶: AIが記憶する過去のレース不利履歴からの巻き返し');
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

  return {
    horseId: horse.id,
    horseName: horse.name,
    horseNumber: horse.number,
    potential: Math.max(0, potential), // 最低0点
    darkness: 0,
    evIndex: 0,
    aptitudeTags: tags
  };
}
