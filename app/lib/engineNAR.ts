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
      tags.push(`❌ 大井減点: 優勢毛色以外の毛色(${horse.coatColor})ペナルティ`);
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
    // ==========================================
    // 【特化ロジック】笠松特化・完全減点方式ハイブリッド（2026/06抽出）
    // ==========================================
    const popularity = horse.popularity || 99;
    const prevRace = horse.pastRaces && horse.pastRaces.length > 0 ? horse.pastRaces[0] : null;

    let kasamatsuPenalty = 0;
    const weightChange = horse.weightChange || 0;
    const absWeightChange = Math.abs(weightChange);

    // --- 減点スクリーニング（不安要素の排除） ---

    // 減点ルール1：内枠（1枠〜3枠）に入った馬 (-20pt)
    if (frame >= 1 && frame <= 3) {
      kasamatsuPenalty += 20;
      tags.push("❌ 笠松減点: 圧倒的に不利な内枠(1〜3枠)");
    } else if (frame >= 4 && frame <= 5) {
      kasamatsuPenalty += 10;
      tags.push("⚠️ 笠松減点: 不利な中枠(4〜5枠)ペナルティ");
    }

    // 減点ルール2：年齢が「5歳以上（特に7歳以上の高齢馬）」
    if (horse.age >= 7) {
      kasamatsuPenalty += 20;
      tags.push("❌ 笠松減点: スピード負けしやすい7歳以上の高齢馬");
    } else if (horse.age === 5 || horse.age === 6) {
      kasamatsuPenalty += 10;
      tags.push("⚠️ 笠松減点: 4歳馬に劣る5〜6歳馬");
    }

    // 減点ルール3：馬体重の増減が「±6kg以上（特に±10kg以上の2桁増減）」
    if (absWeightChange >= 10) {
      kasamatsuPenalty += 20;
      tags.push("❌ 笠松減点: 状態のブレが疑われる馬体重±10kg以上の大幅増減");
    } else if (absWeightChange >= 6) {
      kasamatsuPenalty += 10;
      tags.push("⚠️ 笠松減点: 状態不安定な馬体重±6〜9kgの変動");
    }

    // 減点ルール4：前走が「6着以下」の大敗馬
    if (prevRace && prevRace.result >= 6) {
      kasamatsuPenalty += 20;
      tags.push("❌ 笠松減点: 巻き返しが難しい前走6着以下の大敗馬");
    }

    // 減点ルール5：前走の通過順位が「5番手以降」の差し・追い込み馬
    if (horse.style === '差し' || horse.style === '追込') {
      kasamatsuPenalty += 15;
      tags.push("❌ 笠松減点: 前残り馬場で届かない後方脚質(差し・追い込み)");
    }

    // --- プラス評価（加点・特例オーバーライド） ---

    // 外枠（特に7枠・8枠）を重視
    if (frame >= 6) {
      potential += 20;
      if (frame >= 7) potential += 10;
      tags.push("🔥 笠松特注: 勝率の高い有利な外枠(6〜8枠)");
    }

    // 圧倒的な勝率を誇る「4歳馬」
    if (horse.age === 4) {
      potential += 25;
      tags.push("🔥 笠松特注: 勝率が極めて高い圧倒的有利な4歳馬");
    }

    // 前走1〜3着の好走馬の勢い
    if (prevRace && prevRace.result >= 1 && prevRace.result <= 3) {
      potential += 25;
      tags.push("🔥 笠松特注: 勢いを素直に評価すべき前走1〜3着の好走馬");
      if (prevRace.result === 1 || prevRace.result === 2) {
        potential += 15;
        tags.push("🔥 笠松特注: 勢いそのままに連勝・好走が見込める前走1〜2着馬");
      }
    }

    // 馬体重安定
    if (absWeightChange <= 5) {
      potential += 15;
      tags.push("👑 笠松特注: 馬体重安定(±5kg以内)の勝負気配(1着候補)");
    }

    // 軸馬は「1・2番人気」、相手には「中穴」
    if (popularity === 1 || popularity === 2) {
      potential += 30;
      tags.push("👑 笠松鉄板: 信頼度の高い上位人気(1・2番人気軸)");
    } else if (popularity >= 4 && popularity <= 7) {
      potential += 15;
      tags.push("🌟 笠松特注: ヒモ荒れを演出する中穴候補(4〜7番人気必須)");
    } else if (popularity >= 8) {
      kasamatsuPenalty += 15; // 8番人気以下は来にくい
    }

    // 1番人気は連対候補
    if (popularity === 1) {
      potential -= 10;
      tags.push("⚠️ 笠松特注: 1番人気は1着を取りこぼしやすいため2着(連対)候補推奨");
    }

    // 騎手の評価（渡邊竜也、筒井勇、東川・松本、減量騎手）
    if (horse.jockey) {
      if (horse.jockey.includes('渡邊竜')) {
        potential += 30;
        tags.push("👑 笠松特注: 勝ち切る力を見せる渡邊竜也騎手(1着候補)");
      } else if (horse.jockey.includes('筒井勇')) {
        potential += 10;
        tags.push("🌟 笠松特注: 馬券圏内への安定感抜群の筒井勇騎手(2〜3着付け推奨)");
      } else if (horse.jockey.includes('東川慎') || horse.jockey.includes('松本')) {
        potential += 20;
        tags.push("🔥 笠松特注: 複数勝利を挙げる好調騎手(東川・松本)");
      }
      
      const isApprenticeKasamatsu = horse.jockey.match(/[☆▲△◇]/);
      if (isApprenticeKasamatsu) {
        potential += 15;
        tags.push("🌟 笠松特注: 軽斤量を活かして馬券圏内に飛び込む減量騎手(ヒモ穴必須)");
      }
    }

    // 特別戦の「笹野博厩舎 × 渡邊竜也騎手」
    const isSpecialRace = race.raceName && race.raceName.includes('特別');
    if (isSpecialRace && horse.trainer && horse.trainer.includes('笹野') && horse.jockey && horse.jockey.includes('渡邊竜')) {
      potential += 40;
      tags.push("👑 笠松鉄板: 特別戦における笹野博厩舎×渡邊竜也騎手の黄金タッグ");
    }

    // 先行力（逃げ・先行）
    if (horse.style === '逃げ' || horse.style === '先行') {
      potential += 20;
      tags.push("🔥 笠松特注: 小回りコースで圧倒的有利な先行力");
    }

    // 牝馬の強さ
    if (horse.gender === '牝') {
      potential += 15;
      tags.push("🔥 笠松特注: 牡馬相手でも勝ち切る勝負強い牝馬");
    }

    // 最終ペナルティの適用
    potential -= Math.max(0, kasamatsuPenalty);
  }
  else if (trackName.includes('園田') || trackName.includes('姫路')) {
    // ==========================================
    // 【特化ロジック】園田競馬場・減点方式ハイブリッド（2026/06分析）
    // ==========================================

    // ルール1：1着（アタマ）は「1〜3番人気」から手堅く選ぶ
    if (popularity >= 1 && popularity <= 3) {
      potential += 10;
      tags.push("👑 園田特注: 1着候補の手堅い本命(1〜3番人気)");
    } else if (popularity >= 4) {
      potential -= 10; // 1着候補としては減点
      tags.push("⚠️ 園田減点: アタマ(1着)としては信頼度減(4番人気以下)");
    }

    // ルール2：馬体重の変動が「±6kg以内」の馬を狙う（大幅な増減は減点）
    if (typeof horse.weightChange === 'number') {
      if (Math.abs(horse.weightChange) >= 10) {
        potential -= 20; // 1着候補から外すための大幅減点
        tags.push("⚠️ 園田消去法: 極端な馬体重変動(±10kg以上)によるアタマ除外");
      }
    }

    // ルール3：前走で「3着以内」に好走している馬は高く評価する
    if (prevRaceData && prevRaceData.result >= 1 && prevRaceData.result <= 3) {
      potential += 10;
      tags.push("🔥 園田特注: 前走3着以内の好調馬(今の馬場に直結)");
    }

    // ルール4：2・3着のヒモには「6〜8番人気」の穴馬を必ず入れる
    if (popularity >= 6 && popularity <= 8) {
      const hasCloseRace = horse.pastRaces && horse.pastRaces.some(pr => pr.timeMargin !== undefined && pr.timeMargin <= 0.5);
      if (hasCloseRace) {
        potential += 20; // ヒモとして拾いやすくするためスコア底上げ
        tags.push("💥 園田特注: ヒモ荒れ必須！僅差健闘歴のある伏兵(6〜8番人気)");
      }
    }

    // ==========================================
    // 【特化ロジック】園田競馬場・騎手特化ルール（2026/06分析）
    // ==========================================
    const jName = horse.jockey;
    if (jName) {
      // 騎手ルール1：アタマ候補の強力加点（田野豊 / 小牧太 × 1〜3番人気）
      if (['田野', '小牧太'].some(j => jName.includes(j)) && popularity >= 1 && popularity <= 3) {
        potential += 20;
        tags.push("👑 園田特注: アタマ最有力！絶好調ジョッキー(田野/小牧太)×上位人気");
      }

      // 騎手ルール2：ヒモ穴のピックアップ指示（☆小谷哲 × 5番人気以下）
      if (jName.includes('小谷') && popularity >= 5) {
        potential += 15; // 波乱を起こす可能性が高いためヒモとしてスコア底上げ
        tags.push("💥 園田特注: 波乱メーカー襲来！ヒモ穴に必須の小谷騎手(5番人気以下)");
      }

      // 騎手ルール3：安定感の加点（山本咲 / 下原）
      if (['山本咲', '下原'].some(j => jName.includes(j))) {
        potential += 5;
        tags.push("🎯 園田特注: 抜群の馬券内安定感(山本咲/下原理)");
      }
    }

    // ==========================================
    // 【特化ロジック】園田競馬場・枠順オカルト＆セオリー（2026/06分析）
    // ==========================================

    // 枠順ルール1：「枠番」と「馬番」が一致している馬（アタマ候補として強力加点）
    if (frame === horse.horseNumber) {
      potential += 15;
      tags.push("👑 園田特注: アタマの強烈サイン！枠番と馬番が一致(勝率異常のオカルト)");
    }

    // 枠順ルール2：レース後半（5R以降）は外枠有利、前半は内枠有利
    if (race.raceNumber) {
      if (race.raceNumber >= 5 && frame >= 5) {
        potential += 5;
        tags.push("📈 園田特注: 後半レース(5R以降)の外枠有利バイアス");
      } else if (race.raceNumber <= 4 && frame <= 4) {
        potential += 5;
        tags.push("📈 園田特注: 前半レース(1〜4R)の内枠有利バイアス");
      }
    }

    // 枠順ルール3：本命馬(1番人気)と同枠・隣枠のヒモ穴推奨
    const favHorse = race.horses.find(h => h.popularity === 1);
    if (favHorse && favHorse.frame && popularity >= 4) {
      if (Math.abs(frame - favHorse.frame) <= 1) {
        potential += 10; // ヒモ穴としてスコア底上げ
        tags.push("💥 園田特注: 本命と同枠・隣接枠のヒモ穴(ゾロ目・連番決着パターン)");
      }
    }

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
  else if (trackName.includes('門別')) {
    // ==========================================
    // 【完全減点方式】門別特化・最新トレンドプロトコル（2026/06抽出）
    // ==========================================
    const popularity = horse.popularity || 99;
    const prevRace = horse.pastRaces && horse.pastRaces.length > 0 ? horse.pastRaces[0] : null;

    let mombetsuPenalty = 0;

    // Rule 1: 枠順ペナルティ（内枠）
    if (frame >= 1 && frame <= 4) {
      mombetsuPenalty += 15;
      tags.push("❌ 門別減点: 不利な内枠(1〜4枠)ペナルティ");
    }

    // Rule 2: 前走成績ペナルティ（大敗）
    if (prevRace && prevRace.result >= 6) {
      mombetsuPenalty += 20;
      tags.push("❌ 門別減点: 前走6着以下(大敗)ペナルティ");
    }

    // Rule 3: 脚質・上がりペナルティ（差し・追込）
    if (horse.style === '差し' || horse.style === '追込') {
      mombetsuPenalty += 10;
      tags.push("❌ 門別減点: 前残り馬場における差し・追込ペナルティ(ヒモ推奨)");
    }

    // Rule 4: ローテーションペナルティ（距離変更）
    if (prevRace && prevRace.distance !== race.distance) {
      mombetsuPenalty += 10;
      tags.push("❌ 門別減点: 距離変更(ローテーション)ペナルティ");
    }

    // 特例3: 相手候補限定の騎手特例（減量騎手、服部茂、岩橋勇）
    const isApprentice = horse.jockey && horse.jockey.match(/[☆▲△◇]/);
    const isHimoJockey = horse.jockey && (horse.jockey.includes('服部茂') || horse.jockey.includes('岩橋勇'));
    
    if (isApprentice || isHimoJockey) {
      // 2〜3着候補（ヒモ）としての評価を保つため、枠と脚質の減点を免除する
      if (frame >= 1 && frame <= 4) mombetsuPenalty -= 15;
      if (horse.style === '差し' || horse.style === '追込') mombetsuPenalty -= 10;
      
      // 頭（1着）候補からは外すため、ベースポテンシャルをわずかに削る
      potential -= 5;
      tags.push("🌟 門別特例: ヒモ職人(服部/岩橋/減量騎手)による枠・脚質ペナルティ免除");
    }

    // 特例1 & 2: 落合玄騎手・小国博計厩舎の特例オーバーライド
    if (popularity === 1 || popularity === 2) {
      if (horse.jockey && horse.jockey.includes('落合')) {
        mombetsuPenalty = 0; // すべての減点を免除
        potential += 30; // 確定軸としての絶対的ボーナス加点
        tags.push("👑 門別特例: 落合玄騎手×上位人気の絶対的信頼(全減点免除)");
      } else if (horse.trainer && horse.trainer.includes('小国')) {
        mombetsuPenalty = Math.floor(mombetsuPenalty / 2); // 減点を半減
        potential += 15; // 信頼軸としてのボーナス加点
        tags.push("👑 門別特例: 小国博計厩舎×上位人気の安定感(減点半減)");
      }
    }

    // 最終的なペナルティをポテンシャルから減算
    potential -= Math.max(0, mombetsuPenalty);
  }
  else if (trackName.includes('盛岡')) {
    // マニアック: 地方屈指の大箱コース（直線が長く差しが届く）
    if ((horse.style === '差し' || horse.style === '追込') && isNarSire) {
      potential += 15;
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
  if (!trackName.includes('大井') && horse.jockeyWeight && horse.jockeyWeight <= 53 && (horse.style === '逃げ' || horse.style === '先行')) {
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
