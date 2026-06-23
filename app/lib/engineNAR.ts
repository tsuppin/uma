import { Horse, Prediction, Race, LearningPatch, MasterData } from '../types';
import { calculateUnifiedWaveLevel } from './waveLevelCalculator';
import { analyzeJockeyChange, analyzeWeight, analyzePassingPositions, getBestSpeedIndex } from './evaluationUtils';

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
  // 各地方競馬場の特化ロジック
  // ==========================================

  if (trackName.includes('水沢')) {
    // 水沢マニアック: 重馬場の内枠（1〜2枠）は深い砂と泥を被るため圧倒的不利
    if (race.condition === '重' || race.condition === '不良') {
      if (frame <= 2) {
        potential -= 30;
        tags.push("⚠️ 水沢バイアス: 重・不良馬場の内枠は砂が深く、泥を被るため致命的な不利（大幅減点）");
      }
    }
    // 水沢マニアック: 1300mなどの短距離戦における小型馬（440kg未満）のパワー不足
    if (dist <= 1300 && (horse.weight || 0) > 0 && (horse.weight || 0) < 440) {
      potential -= 20;
      tags.push("⚠️ 水沢バイアス: 短距離戦における小型馬のパワー不足（減点）");
    }
  }
  else if (trackName.includes('浦和')) {
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
    // ==========================================
    // 【特化ロジック】川崎競馬場・減点方式ルール（2026/06/15分析）
    // ==========================================
    const popularity = horse.popularity || 99;
    const prevRaceData = horse.pastRaces && horse.pastRaces.length > 0 ? horse.pastRaces[0] : undefined;
    
    // ※川崎特化：基本スコアを100点からスタートし、減点方式で評価する
    potential = 100;
    
    const isHeavyTrack = race.condition === '重' || race.condition === '不良' || race.condition === '稍重';
    const jName = horse.jockey || '';

    // --- [減点ルール] -------------------------------------
    
    // 減点1. 枠順による減点（Frame Deduction）
    if (frame === 4 || frame === 6) {
      potential -= 20;
      tags.push("⚠️ 川崎減点: 極端な不振傾向の「4枠」「6枠」(連対候補から除外推奨)");
    }

    // 減点2. 騎手・斤量による減点（Jockey & Weight Deduction）
    if (jName.includes('☆') || jName.includes('△') || jName.includes('▲') || jName.includes('◇') || jName.includes('★')) {
      potential -= 25;
      tags.push("⚠️ 川崎減点: 重馬場で難易度アップ。若手・減量騎手の経験不足を軽視");
    }

    // 減点3. 馬体重による減点（Weight Change Deduction）
    if (typeof horse.weightChange === 'number' && horse.weightChange >= 1 && horse.weightChange <= 9) {
      potential -= 10;
      tags.push("⚠️ 川崎減点: 中途半端なプラス体重(+1〜+9kg)。仕上がり不安");
    }

    // 減点4. 脚質・上がりタイムによる減点（Running Style Deduction）
    if (isHeavyTrack && dist !== 900) {
      if (horse.style === '差し' || horse.style === '追込' || horse.style === '後方') {
        let hasFastest3f = false;
        if (horse.pastRaces) {
          for (const r of horse.pastRaces) {
             if (r.last3fTime) {
               const last3f = parseFloat(r.last3fTime);
               if (!isNaN(last3f) && last3f < 39.0) { // 上がり最速の目安
                 hasFastest3f = true;
                 break;
               }
             }
          }
        }
        if (!hasFastest3f) {
          potential -= 30; // 激高の減点
          tags.push("🚫 川崎致命的減点: 圧倒的末脚を持たない差し・追込馬(重馬場では届かない)");
        }
      }
    }

    // 減点5. 前走成績と実績による減点（Past Performance Deduction）
    if (prevRaceData && prevRaceData.result >= 6) {
      let isExempt = false;
      
      // 免除条件1: 近5走以内に「川崎コース」での好走歴（3着以内）
      if (horse.pastRaces) {
        for (let i = 0; i < Math.min(horse.pastRaces.length, 5); i++) {
          const r = horse.pastRaces[i];
          if (r.venue && r.venue.includes('川崎') && r.result <= 3) isExempt = true;
        }
      }
      // 免除条件2: JRAからの転入初戦、または他場での重賞実績
      const isFromJRA = horse.transferFrom === 'JRA' || horse.belonging === 'JRA';
      let hasGradedStakes = false;
      if (horse.pastRaces) {
        for (const r of horse.pastRaces) {
          if (r.raceName && (r.raceName.includes('重賞') || r.raceName.includes('スプリント') || r.raceName.includes('G') || r.raceName.includes('Jpn'))) {
            hasGradedStakes = true;
          }
        }
      }
      if (isFromJRA || hasGradedStakes) isExempt = true;
      // 免除条件3: 鞍上がリーディング上位騎手または他場主戦スポット騎乗
      let isJockeyChangedK = false;
      if (prevRaceData.jockey && (!jName.includes(prevRaceData.jockey) && !prevRaceData.jockey.includes(jName))) {
        isJockeyChangedK = true;
      }
      if (isJockeyChangedK && ['町田', '矢野', '澤田', '西啓太'].some(j => jName.includes(j))) {
        isExempt = true;
      }

      if (!isExempt) {
        potential -= 25;
        tags.push("⚠️ 川崎減点: 前走大敗かつ一変のサイン(コース実績/底力/勝負鞍上)が皆無");
      }
    }

    // 減点6. 中穴狙い（6〜8番人気）の減点フィルタ（Longshot Filter）
    if (popularity >= 6 && popularity <= 8) {
      if (prevRaceData && prevRaceData.result >= 6) {
        potential -= 20;
        tags.push("⚠️ 川崎減点: 中穴狙いフィルタ除外。前走大敗の中途半端な穴馬");
      }
    }

    // --- [加点ルール (減点方式ベースの特注加点)] --------------------------
    // --- [既存のマニアックルール] --------------------------
    if (dist === 1500 && frame <= 3 && horse.style === '逃げ') {
      potential += 20;
      tags.push("🔥 川崎マニアック: 日本一タイトなコーナーをロスなく回る川崎1500m内枠逃げ");
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
    // ==========================================
    // 【特化ロジック】名古屋競馬場・完全分析ルール（2026/06抽出）
    // ==========================================
    const popularity = horse.popularity || 99;
    const prevRace = horse.pastRaces && horse.pastRaces.length > 0 ? horse.pastRaces[0] : null;

    // 基本ルール1: 上位人気（1〜3番人気）を軸に据える
    if (popularity <= 3) {
      potential += 20;
      tags.push("👑 名古屋特注: 信頼度の高い上位人気(1〜3番人気軸指定)");
    }

    // 基本ルール2: 外枠（5〜8枠）の馬を高く評価する
    if (frame >= 5) {
      potential += 15;
      tags.push("🔥 名古屋特注: 馬群に揉まれにくい有利な外枠(5〜8枠)");
    }

    // 基本ルール3: JRA（中央競馬）転入馬の無条件警戒
    const isFromJRA = horse.transferFrom === 'JRA' || horse.belonging === 'JRA';
    const wasJRA = prevRace && prevRace.venue && prevRace.venue.match(/(東京|中山|京都|阪神|新潟|福島|中京|小倉|札幌|函館)/);
    if (isFromJRA || wasJRA) {
      potential += 30;
      tags.push("🚀 名古屋特注: JRA転入馬の地力の違い(大敗歴不問で無条件警戒)");
    }

    // 基本ルール4: 地方生え抜き馬の近走好成績
    const isLocalHorse = !isFromJRA && !wasJRA;
    if (isLocalHorse && prevRace && prevRace.result <= 3) {
      potential += 15;
      tags.push("🔥 名古屋特注: 地方生え抜き馬の順当な好走傾向(近走3着以内)");
    }

    // 基本ルール4-2: 上がり最速クラスの末脚
    if (isLocalHorse && prevRace && prevRace.last3fTimeRank && prevRace.last3fTimeRank <= 3) {
      potential += 15;
      tags.push("🔥 名古屋特注: 上位入線のカギを握る上がり最速クラスの末脚");
    }

    // 詳細ルール1-A: トップジョッキー（1着軸候補）
    const isTopJockey = horse.jockey && ['大畑雅', '塚本征', '渡邊竜', '加藤聡', '今井貴'].some(j => horse.jockey.includes(j));
    if (isTopJockey) {
      potential += 20;
      tags.push("👑 名古屋特注: 圧倒的信頼度を誇るトップジョッキー(1着軸推奨)");
    }

    // 詳細ルール1-B: 減量騎手（ヒモ穴必須）
    const isApprentice = horse.jockey && horse.jockey.match(/[◇▲]/);
    if (isApprentice) {
      potential += 15;
      tags.push("🌟 名古屋特注: 軽斤量を活かして食い込む減量騎手(ヒモ必須)");
    }

    // 詳細ルール1-C: 中穴・波乱狙いの中堅ジョッキー
    const isLongshotJockey = horse.jockey && ['望月洵', '東川慎', '友森翔'].some(j => horse.jockey.includes(j));
    if (isLongshotJockey) {
      potential += 10;
      tags.push("💥 名古屋特注: 波乱をもたらす中堅・若手騎手(オッズ妙味)");
    }

    // 詳細ルール1-D: JRA交流戦におけるJRA減量騎手
    const isJraExchange = race.raceName && race.raceName.includes('交流');
    // JRA所属騎手であることを簡易的に名前等で判定できなければisFromJRAと併用するなどで代替
    if (isJraExchange && isApprentice) {
      potential += 25;
      tags.push("🚀 名古屋特注: JRA交流戦における減量騎手の斤量＆能力恩恵警戒");
    }

    // 詳細ルール3: 連勝中・圧勝劇を見せた「昇級馬」
    if (prevRace && prevRace.result === 1) {
      potential += 20;
      tags.push("🔥 名古屋特注: クラスの壁を突破する前走1着の勢い(昇級馬)");
    }

    // 詳細ルール4: JRA関連馬のダート適性血統と条件替わり
    if (isFromJRA || wasJRA) {
      if (horse.sire && ['ヘニーヒューズ', 'マインドユアビスケッツ'].some(s => horse.sire.includes(s))) {
        potential += 25;
        tags.push("🚀 名古屋特注: JRA関連馬×圧倒的ダート適性血統(即通用)");
      }
      if (prevRace && prevRace.surface === '芝' && race.surface === 'ダート') {
        potential += 25;
        tags.push("🚀 名古屋特注: JRA時代芝からのダート替わり(一変警戒)");
      }
    }

    // 既存マニアック: 圧倒的な先行有利
    if (horse.style === '逃げ' || horse.style === '先行') {
      potential += 15;
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
    // 【特化ロジック】園田競馬場・完全減点方式（2026/06分析）
    // ==========================================
    // 初期スコアを「100点」にリセット
    potential = 100;
    
    const popularity = horse.popularity || 99;
    const prevRaceData = horse.pastRaces && horse.pastRaces.length > 0 ? horse.pastRaces[0] : undefined;
    
    // -----------------------------------------------------
    // 【1. 基本能力・適性による減点】
    // -----------------------------------------------------
    // 人気減点【-10点】：当日「4番人気以下」
    if (popularity >= 4) {
      potential -= 10;
      tags.push("⚠️ 園田減点: 1着候補としては信頼度減(4番人気以下)");
    }
    
    // 馬体重減点【-20点】：前走比で±10kg以上
    if (typeof horse.weightChange === 'number' && Math.abs(horse.weightChange) >= 10) {
      potential -= 20;
      tags.push("⚠️ 園田消去法: 極端な馬体重変動(±10kg以上)によるアタマ除外");
    }
    
    // 距離ローテ減点【-10点】：前走の距離が異なる
    if (prevRaceData && prevRaceData.distance !== undefined && prevRaceData.distance !== dist) {
      potential -= 10;
      tags.push("⚠️ 園田減点: ペースに戸惑う距離変更ローテーション");
    }

    // -----------------------------------------------------
    // 【2. 過去実績・脚質による減点】
    // -----------------------------------------------------
    let top3Count = 0;
    let allWorseThan6 = true;
    let olderGoodRun = false;
    let recentSlump = false;
    
    if (horse.pastRaces && horse.pastRaces.length > 0) {
      const recentRaces = horse.pastRaces.slice(0, 5);
      recentRaces.forEach((pr, index) => {
        if (pr.result && pr.result <= 3) {
          top3Count++;
          allWorseThan6 = false;
          if (index >= 2) { olderGoodRun = true; } // 3走前〜5走前に好走
        } else if (pr.result && pr.result <= 5) {
          allWorseThan6 = false;
        }
        if (index < 2 && pr.result && pr.result >= 6) {
          recentSlump = true; // 前走・前々走が6着以下
        }
      });
      
      // スランプ減点【-20点】：過去5走すべて6着以下
      if (allWorseThan6 && recentRaces.length >= 3) {
        potential -= 20;
        tags.push("⚠️ 園田消去法: 過去すべて6着以下の完全スランプ");
      }
    }
    
    // 前走着順減点【-10点】：前走4着以下（ただし過去5走中3回以上1-3着の馬は免除）
    if (prevRaceData && prevRaceData.result >= 4) {
      if (top3Count < 3) {
        potential -= 10;
        tags.push("⚠️ 園田減点: 前走4着以下の凡走");
      }
    }

    // 脚質（通過順）減点【-10点】：前走4角9番手以下（※追い込み馬はヒモ穴フラグBで救済される場合あり）
    if (horse.style === '追込' || horse.style === '後方') {
      potential -= 10;
      tags.push("⚠️ 園田減点: 前走後方待機(展開待ちリスク)");
    }
    
    // -----------------------------------------------------
    // 【3. 騎手・陣営による減点】
    // -----------------------------------------------------
    const jName = horse.jockey || '';
    const tName = horse.trainer || '';
    const isTopJockey = ['田野', '小牧太'].some(j => jName.includes(j));
    
    // 騎手力減点【-15点】：田野豊・小牧太以外
    if (!isTopJockey) {
      potential -= 15;
      tags.push("⚠️ 園田減点: トップ騎手(田野/小牧太)以外の騎乗");
    }
    
    // 継続騎乗不信減点【-10点】：上位人気かつ乗り替わり（トップ騎手へは免除）
    const isJockeyChanged = prevRaceData && prevRaceData.jockey && jName !== prevRaceData.jockey;
    if (popularity <= 3 && isJockeyChanged && !isTopJockey) {
      potential -= 10;
      tags.push("⚠️ 園田減点: 上位人気馬の不穏な乗り替わり");
    }
    
    // 単騎出し減点【-5点】
    if (tName) {
      const sameTrainerCount = race.horses.filter(h => h.trainer && h.trainer.includes(tName)).length;
      if (sameTrainerCount === 1) {
        potential -= 5;
        tags.push("⚠️ 園田減点: 同厩舎の多頭出しがない単騎参戦");
      }
    }

    // -----------------------------------------------------
    // 【4. 枠順による減点】
    // -----------------------------------------------------
    // 枠・馬番不一致減点【-15点】
    if (frame !== horse.number) {
      potential -= 15;
      tags.push("⚠️ 園田減点: 枠番と馬番の不一致(マイナスバイアス)");
    }
    
    // 馬場傾向減点（前半1〜4R）【-5点】：外枠（5〜8枠）
    const raceNumMatch = race.raceName ? race.raceName.match(/(\d+)R/) : null;
    const raceNum = raceNumMatch ? parseInt(raceNumMatch[1], 10) : (race.raceNumber || 0);
    if (raceNum >= 1 && raceNum <= 4 && frame >= 5) {
      potential -= 5;
      tags.push("⚠️ 園田減点: 前半レースの外枠不利");
    }
    
    // 馬場傾向減点（後半5〜12R）【-5点】：内枠（1〜4枠）
    if (raceNum >= 5 && raceNum <= 12 && frame <= 4) {
      potential -= 5;
      tags.push("⚠️ 園田減点: 後半レースの内枠不利");
    }

    // -----------------------------------------------------
    // 【ヒモ穴推奨フラグ（別枠加点）】
    // -----------------------------------------------------
    if (popularity >= 5) {
      let isHimoHole = false;
      let himoReason = "";
      
      // フラグA：前走凡走 × 3〜5走前に好走
      if (recentSlump && olderGoodRun) {
        isHimoHole = true; himoReason = "隠れた実力(過去好走歴)";
      }
      // フラグB：前走後方待機、または距離短縮
      if (horse.style === '追込' || horse.style === '後方') {
        isHimoHole = true; himoReason = "追い込み一変";
      }
      if (prevRaceData && prevRaceData.distance !== undefined && prevRaceData.distance > dist) {
        isHimoHole = true; himoReason = "大幅な距離短縮恩恵";
      }
      // フラグC：陣営の波乱使者（小谷哲 / 尾林二 / 碇清次）
      if (jName.includes('小谷') || ['尾林二', '碇清次'].some(t => tName.includes(t))) {
        isHimoHole = true; himoReason = "波乱メーカー陣営";
      }
      // フラグD：恩恵乗り替わり（斤量1.0kg以上減）
      if (isJockeyChanged && prevRaceData && prevRaceData.jockeyWeight !== undefined && horse.jockeyWeight !== undefined) {
        const prevW = prevRaceData.jockeyWeight;
        const currW = horse.jockeyWeight;
        if (!isNaN(prevW) && !isNaN(currW) && (prevW - currW) >= 1.0) {
          isHimoHole = true; himoReason = "乗り替わり軽量化";
        }
      }
      // フラグE：本命馬と同枠・隣枠
      const favHorse = race.horses.find(h => h.popularity === 1);
      if (favHorse && favHorse.frame && Math.abs(frame - favHorse.frame) <= 1) {
        isHimoHole = true; himoReason = "本命馬の同枠/隣枠";
      }
      
      if (isHimoHole) {
        // ヒモ穴として拾いやすくするため救済加点
        potential += 30;
        tags.push(`💥 園田特注: 絶好のヒモ穴推奨フラグ成立！(${himoReason})`);
      }
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
        else if (adj.operator === 'regex' && new RegExp(adj.value).test(val)) applies = true;
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
  // 【NAR-A0】全場共通：新規評価ロジック（乗り替わり・馬体重・レース展開・スピード指数）
  // ─────────────────────────────────────────
  const jockeyAnalysis = analyzeJockeyChange(horse);
  if (jockeyAnalysis.isEliteSwitch) {
    potential += 15;
    tags.push("🔥 勝負気配: トップジョッキーへの勝負の乗り替わり");
  } else if (jockeyAnalysis.isPrimaryReturn) {
    potential += 10;
    tags.push("🔥 主戦戻り: 過去に好走実績のある勝負騎手への手戻り");
  }

  const weightAnalysis = analyzeWeight(horse);
  if (weightAnalysis.hasWeightData) {
    if (weightAnalysis.isIdeal) {
      potential += 5;
      tags.push("✨ 状態キープ: 好走時のベスト体重を維持");
    }
    if (weightAnalysis.isGrowth) {
      potential += 5;
      tags.push("💪 成長分: 休養を挟んでの馬体増（成長分）");
    } else if (weightAnalysis.isFat) {
      potential -= 10;
      tags.push("⚠️ 太め残り: 余裕残しの馬体増・調整不足の懸念");
    }
  }

  const passAnalysis = analyzePassingPositions(horse);
  if (passAnalysis.isMakuri) {
    potential += 10;
    tags.push("🌪️ 展開: 前走長く良い脚を使った『まくり』実績あり");
  } else if (passAnalysis.isTare) {
    const narPrevRace = horse.pastRaces && horse.pastRaces.length > 0 ? horse.pastRaces[0] : null;
    if (narPrevRace && narPrevRace.distance > dist) {
      potential += 5;
      tags.push("💡 展開: 前走失速も今回は距離短縮で粘り込み期待");
    } else {
      potential -= 10;
      tags.push("⚠️ 展開: 前走前半飛ばして失速（スタミナ不足懸念）");
    }
  } else if (passAnalysis.isKouhou) {
    potential -= 5;
    tags.push("⚠️ 展開: テンのスピード不足・後方追走のままの懸念");
  }

  const speedIndex = getBestSpeedIndex(horse);
  if (speedIndex > 0) {
    if (speedIndex > 100) {
      potential += 15;
      tags.push(`⏱️ スピード: 持ち時計優秀 (指数: ${speedIndex})`);
    } else if (speedIndex > 80) {
      potential += 5;
    }
  }


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
