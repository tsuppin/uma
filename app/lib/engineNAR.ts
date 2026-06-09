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
    // 浦和特化1: 日本一の小回り・逃げ先行絶対有利
    if (frame <= 4 && (horse.style === '逃げ' || horse.style === '先行')) {
      potential += 45;
      tags.push("👑 浦和特注: 日本一の小回りを制する『内枠×逃げ・先行』");
    }
    // 浦和特化2: 大外枠の差し・追込の絶望
    if (frame >= 7 && (horse.style === '差し' || horse.style === '追込')) {
      potential -= 50;
      tags.push("⚠️ 浦和危険: コース形状的に物理的に届かない大外枠の差し・追込（消し）");
    }
  } 
  else if (trackName.includes('大井')) {
    // 大井特化1: 外回りの長い直線（差し・追込の台頭）
    // 大井の外回りは右回りで直線が長いため、地方では珍しく差しが決まる
    if ((dist === 1800 || dist === 2000) && (horse.style === '差し' || horse.style === '追込') && isNarSire) {
      potential += 35;
      tags.push("👑 大井特注: 外回りの長い直線で爆発するパワー型の差し・追込");
    }
    // 大井特化2: オーストラリア産白砂適性（タフな馬場での大型馬）
    if (horse.weight && horse.weight >= 500) {
      potential += 25;
      tags.push("👑 大井特注: 極端に力のいる白砂をこなす大型馬の馬格");
    }
  } 
  else if (trackName.includes('川崎')) {
    // 川崎特化1: 非常にキツいコーナー（内枠有利・立ち回りの上手さ）
    if (frame <= 3) {
      potential += 35;
      tags.push("👑 川崎特注: タイトなコーナーで圧倒的ロスを防げる『内枠』の絶対優位");
    }
    // 川崎の向正面スパート（マクリ実績）
    const hasMakuri = horse.pastRaces?.some(pr => pr.cornerOuterCount >= 3 && pr.result <= 3); // 簡易的に外回し実績をマクリとみなす
    if (hasMakuri) {
      potential += 20;
      tags.push("👑 川崎特注: 向正面からのロンスパ（マクリ）に対応できる機動力");
    }
  } 
  else if (trackName.includes('船橋')) {
    // 船橋特化1: スパイラルカーブ（外枠の差し・マクリ有利）
    // 船橋はコーナーの出口が緩く、外から勢いをつけた馬が直線で伸びやすい
    if (frame >= 6 && (horse.style === '差し' || horse.style === '先行')) {
      potential += 40;
      tags.push("👑 船橋特注: スパイラルカーブの遠心力を活かして加速する外枠");
    }
  }
  else if (trackName.includes('名古屋') || trackName.includes('弥富')) {
    // 名古屋（弥富）特化: 圧倒的な先行有利
    // 移転後の新競馬場は圧倒的に前が止まらない
    if (horse.style === '逃げ' || horse.style === '先行') {
      potential += 30;
      tags.push("👑 名古屋特注: 新競馬場特有の止まらない圧倒的先行力");
    }
  }
  else if (trackName.includes('笠松')) {
    // 笠松特化: 小回り特有の内枠先行
    if (frame <= 4 && (horse.style === '逃げ' || horse.style === '先行')) {
      potential += 35;
      tags.push("👑 笠松特注: タイトなコーナーを最短で回る内枠先行の絶対優位");
    }
  }
  else if (trackName.includes('園田') || trackName.includes('姫路')) {
    // 園田特化: 1400mの1コーナー争い（内枠絶対有利）
    // 園田のメイン距離はスタート直後にコーナーがあるため、外枠は致命的なロスになる
    if (frame <= 3) {
      potential += 40;
      tags.push("👑 園田特注: スタート直後のポジション争いを制する『内枠』の絶対的有利");
    }
    if (frame >= 7) {
      potential -= 30;
      tags.push("⚠️ 園田危険: 1コーナーで外を回される致命的な距離ロス（外枠減点）");
    }
  }
  else if (trackName.includes('高知')) {
    // 高知特化1: 内ラチ沿いの深い砂（1枠のペナルティ）
    // 高知競馬は馬場保護のため内側の砂が非常に深く、1枠で包まれると抜け出せない
    if (frame === 1) {
      potential -= 40;
      tags.push("⚠️ 高知危険: 砂が最も深くスタミナを奪われる魔の『1枠』（大減点）");
    }
    // 高知特化2: 外回しの差し（外枠・差し有利）
    // 全馬が馬場の良い外側に出そうとするため、最初から外を走れる外枠や差し馬が有利
    if (frame >= 6 && (horse.style === '差し' || horse.style === '追込')) {
      potential += 45;
      tags.push("👑 高知特注: 馬場の良い外側をスムーズに押し上げる『外枠の差し』");
    }
  }
  else if (trackName.includes('佐賀')) {
    // 佐賀特化: 高知同様に内側の砂が非常に深く、内ラチを空けて走る特殊馬場
    if (frame === 1 || frame === 2) {
      potential -= 35;
      tags.push("⚠️ 佐賀危険: 砂が非常に深くスタミナを削られる内枠（大幅減点）");
    }
    if (frame >= 5 && (horse.style === '先行' || horse.style === '差し')) {
      potential += 40;
      tags.push("👑 佐賀特注: 荒れた内側を避けて好位を押し上げる『外枠の先行・差し』");
    }
  }
  else if (trackName.includes('金沢') || trackName.includes('水沢')) {
    // 金沢・水沢特化: 極端な小回りコースによる「イン前絶対有利」
    if (frame <= 3 && (horse.style === '逃げ' || horse.style === '先行')) {
      potential += 40;
      tags.push(`👑 ${trackName.replace(/競馬場/g, '')}特注: 超小回りコースで物理的に止まらない『内枠の逃げ先行』`);
    }
    if (horse.style === '追込') {
      potential -= 35;
      tags.push(`⚠️ ${trackName.replace(/競馬場/g, '')}危険: コーナーがタイトすぎて物理的に届かない追込馬`);
    }
  }
  else if (trackName.includes('門別') || trackName.includes('盛岡')) {
    // 門別・盛岡特化: 地方屈指の大箱コース（直線が長く差しが届く）
    // 地方競馬としては珍しく、スピードと長い直線での持続力が問われる
    if ((horse.style === '差し' || horse.style === '追込') && isNarSire) {
      potential += 35;
      tags.push(`👑 ${trackName.replace(/競馬場/g, '')}特注: 地方屈指の大箱コースで末脚が爆発するパワー型差し馬`);
    }
  }

  // ==========================================
  // ベースロジック（オッズ歪み等）
  // ==========================================
  if (odds >= 15.0) {
    const prevRaceData = horse.pastRaces && horse.pastRaces.length > 0 ? horse.pastRaces[0] : undefined;
    if (prevRaceData && (prevRaceData.isStumbled || prevRaceData.cornerOuterCount >= 4)) {
      potential += 30;
      tags.push("💰 期待値爆発: 前走物理的不利(度外視) × 大穴オッズ");
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
