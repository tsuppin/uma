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
    // ==========================================
    // 【特化ロジック】川崎競馬場・6つの必勝ルール ＋ 4つの馬ルール（2026/06分析）
    // ==========================================
    const popularity = horse.popularity || 99;
    const prevRaceData = horse.pastRaces && horse.pastRaces.length > 0 ? horse.pastRaces[0] : undefined;

    // --- [基本ルール] -------------------------------------
    // ルール1: 軸馬は「1〜3番人気」から選ぶ（勝率75%）
    if (popularity >= 1 && popularity <= 3) {
      potential += 15;
      tags.push("👑 川崎特注: 信頼の軸候補(1〜3番人気)");
    } else {
      potential -= 10;
      tags.push("⚠️ 川崎減点: 1着候補としては勝率低下(4番人気以下)");
    }

    // --- [枠順のルール (追加5箇条)] --------------------------
    // ルール1＆3: アタマ（1着）を狙うなら「2枠」、そして土台となる「1〜3枠」
    if (frame === 2) {
      potential += 25;
      tags.push("👑 川崎特注: アタマ最有力！圧倒的勝率を誇る「2枠」");
    } else if (frame === 1 || frame === 3) {
      potential += 15;
      tags.push("👑 川崎特注: 馬券の土台として極めて優秀な内枠(1・3枠)");
    }

    // ルール2: 2着付け（ヒモ）には「7枠」を絶対に入れる
    // ルール4: 「内枠×外枠」の組み合わせを狙うための外枠評価
    if (frame === 7) {
      potential += 20; // 2着に頻発するためヒモとして強力加点
      tags.push("💥 川崎特注: 2着(ヒモ)に絶対不可欠！強烈な連対率を誇る「7枠」");
    } else if (frame === 8) {
      potential += 10;
      tags.push("💥 川崎特注: 内枠×外枠のヒモ候補となる「8枠」");
    }

    // ルール5: 「4枠」と「6枠」は思い切って軽視する
    if (frame === 4 || frame === 6) {
      potential -= 15;
      tags.push("⚠️ 川崎減点: 極めて不振な「4枠」「6枠」(思い切って軽視)");
    }

    // --- [脚質のルール (追加3箇条)] --------------------------
    const isHeavyTrack = race.condition === '重' || race.condition === '不良' || race.condition === '稍重';
    
    // 脚質ルール1: 馬券の基本軸は「前走1〜4番手の先行馬」を信用する
    if (prevRaceData && prevRaceData.corner4Position !== undefined && prevRaceData.corner4Position <= 4) {
      potential += 15;
      tags.push("👑 川崎特注: 馬券の基本軸となる前走1〜4番手の先行馬(前残り)");
    }

    // 脚質ルール2: 差し・追込馬は「上がり最速」を出せる馬に限定する
    if (isHeavyTrack && (horse.style === '追込' || horse.style === '差し' || horse.style === '後方')) {
      if (prevRaceData && prevRaceData.last3fTime) {
        const last3f = parseFloat(prevRaceData.last3fTime);
        if (!isNaN(last3f) && last3f < 39.0) {
          potential += 30; // 上がり最速級なら強力加点
          tags.push("💥 川崎特注: 渋った馬場で強引に前を飲み込む圧倒的な上がり最速馬");
        } else {
          potential -= 10; // 中途半端な差し馬は届かないため減点
          tags.push("⚠️ 川崎減点: 渋った馬場では届かない中途半端な末脚の差し馬");
        }
      } else {
        potential -= 10;
        tags.push("⚠️ 川崎減点: 渋った馬場では届かない中途半端な末脚の差し馬");
      }
    }

    // 脚質ルール3: 超短距離「900m戦」は、あえて「差し馬」の一発を狙う
    if (dist === 900 && (horse.style === '差し' || horse.style === '追込' || horse.style === '後方')) {
      potential += 20; // 900mのハイペースで前が潰れる展開を想定
      tags.push("💥 川崎特注: 前が潰れるハイペース必至！900m戦で波乱を呼ぶ差し馬の一発");
    }

    // ルール4: 「3歳の下級条件」は穴狙いで手広く買う
    const is3yo = race.raceName && race.raceName.includes('3歳');
    if (is3yo && popularity >= 5) {
      potential += 15;
      tags.push("💥 川崎特注: 波乱続出の3歳戦！能力比較が難しいため穴馬の一変に警戒");
    }

    // ルール5: 前走が「他場」や「JRA」の馬を安易に切らない
    if (prevRaceData && prevRaceData.result >= 6) {
      const isOtherTrack = prevRaceData.venue && !prevRaceData.venue.includes('川崎');
      const isFromJRA = horse.transferFrom === 'JRA' || horse.belonging === 'JRA';
      if (isOtherTrack || isFromJRA) {
        potential += 30; // ペナルティ相殺
        tags.push("💥 川崎特注: 前走大敗は罠！コース替わり(他場/JRAからの転戦)で巻き返し濃厚");
      }
    }

    // --- [騎手のルール (追加4箇条)] --------------------------
    const jName = horse.jockey || '';

    // 騎手ルール1: 軸馬に迷ったら「町田直」と「矢野貴之」を信頼する
    if (['町田', '矢野'].some(j => jName.includes(j))) {
      potential += 15;
      tags.push("👑 川崎特注: 信頼度抜群の軸候補ジョッキー(町田直/矢野貴之)");
    }

    // 騎手ルール2: 「野畑凌」は3連系の「3着付け」で狙う
    if (jName.includes('野畑')) {
      potential += 10; // アタマというよりはヒモとしての評価底上げ
      tags.push("💥 川崎特注: 3着(ヒモ)候補として必ず押さえたい野畑凌騎手");
    }

    // 騎手ルール3: 波乱の使者「山林信」をヒモ穴（2着）に警戒する
    if (jName.includes('山林') && popularity >= 4) {
      potential += 20; // 穴馬に乗った時に激走するためヒモ穴として強力加点
      tags.push("💥 川崎特注: 荒れるレースの使者！ヒモ穴に必須の山林信騎手");
    }

    // 騎手ルール4: 遠征してくる「他場を主戦とする騎手」の一発に注意する
    if (['澤田', '西啓太', '笠野', '達城'].some(j => jName.includes(j))) {
      potential += 15;
      tags.push("💥 川崎特注: 遠征・スポット参戦で勝負気配の高い他場主戦騎手");
    }

    // --- [馬のルール (追加4箇条)] --------------------------
    
    // 馬ルール1: 馬体重は絞れた「マイナス体重」か、成長の「大幅プラス(+15kg以上)」
    if (typeof horse.weightChange === 'number') {
      if (horse.weightChange < 0) {
        potential += 15;
        tags.push("👑 川崎特注: 確実に仕上がっているマイナス馬体重");
      } else if (horse.weightChange >= 15) {
        potential += 15;
        tags.push("💥 川崎特注: 成長・馬体回復を示す二桁の大幅プラス体重");
      }
    }

    // 馬ルール2: 血統は「ダート定番」に加え、スピードの活きる「芝血統」を重視
    const sire = horse.sire || '';
    if (/(パイロ|モーニン|クリソベリル|ゴールドドリーム)/.test(sire)) {
      potential += 10;
      tags.push("👑 川崎特注: 川崎で勝ち切るダート定番血統");
    }
    if (isHeavyTrack && /(ワールドエース|ヘンリーバローズ|スクリーンヒーロー|カレンブラックヒル)/.test(sire)) {
      potential += 20;
      tags.push("💥 川崎特注: 重馬場でスピードが活きる芝血統の台頭");
    }

    // 馬ルール3: 前走成績は「前走1着」か「前走大敗」の両極端を狙う
    if (prevRaceData) {
      if (prevRaceData.result === 1) {
        potential += 15;
        tags.push("👑 川崎特注: 前走1着の好調維持・連勝狙い");
      } else if (prevRaceData.result >= 9) {
        potential += 15;
        tags.push("💥 川崎特注: 着順だけで人気を落とす前走大敗からの鮮やかな巻き返し");
      }
    }

    // 馬ルール4: ダート戦でも「牝馬」を軽視しない（特に重馬場）
    if (horse.gender === '牝' && isHeavyTrack) {
      potential += 15;
      tags.push("💥 川崎特注: 牝馬特有のスピードや切れ味が活きる重馬場");
    }

    // --- [前走以前の実績ルール (追加4箇条)] --------------------------
    
    // 実績ルール1: 「前走2着・3着」の惜敗馬を素直に「1着」で狙う
    if (prevRaceData && (prevRaceData.result === 2 || prevRaceData.result === 3)) {
      potential += 15;
      tags.push("👑 川崎特注: 勝ち切るチャンス！好調を維持する前走惜敗馬");
    }

    // 実績ルール2: 前走大敗馬は「川崎での好走歴」または「前々走の勝利」を確認する
    if (prevRaceData && prevRaceData.result >= 6 && horse.pastRaces && horse.pastRaces.length > 1) {
      let hasGoodKawasaki = false;
      let hasRecentWin = false;
      for (let i = 1; i < horse.pastRaces.length; i++) {
        const r = horse.pastRaces[i];
        if (r.venue && r.venue.includes('川崎') && r.result <= 3) hasGoodKawasaki = true;
        if (r.result === 1) hasRecentWin = true;
      }
      if (hasGoodKawasaki || hasRecentWin) {
        potential += 20;
        tags.push("💥 川崎特注: 前走大敗は罠！近5走に隠れた川崎適性・地力の高さに警戒");
      }
    }

    // 実績ルール3: 「JRAからの転入馬」や「他地区の重賞実績馬」の底力を重視する
    const isFromJRA = horse.transferFrom === 'JRA' || horse.belonging === 'JRA';
    let hasGradedStakes = false;
    if (horse.pastRaces) {
      for (const r of horse.pastRaces) {
        // 重賞や特別戦のざっくりとした判定
        if (r.raceName && (r.raceName.includes('重賞') || r.raceName.includes('スプリント') || r.raceName.includes('G') || r.raceName.includes('Jpn'))) {
          hasGradedStakes = true;
        }
      }
    }
    if (isFromJRA || hasGradedStakes) {
      potential += 15;
      tags.push("💥 川崎特注: 重馬場でモノを言うJRA転入馬・他地区重賞実績馬の「底力」");
    }

    // 実績ルール4: 「超短距離（900m〜1200m）」を使われてきたスピード馬を評価する
    let usedInShortDist = false;
    if (horse.pastRaces) {
      for (let i = 0; i < Math.min(horse.pastRaces.length, 5); i++) {
        if (horse.pastRaces[i].dist <= 1200) {
          usedInShortDist = true;
          break;
        }
      }
    }
    if (usedInShortDist) {
      potential += 10;
      tags.push("💥 川崎特注: 時計の速い馬場でスピード負けしない超短距離(900〜1200m)経験馬");
    }

    // --- [乗り替わりのルール (追加4箇条)] --------------------------
    let isJockeyChangedK = false;
    if (prevRaceData && prevRaceData.jockey) {
      // 騎手名が部分一致しない場合を乗り替わりと判定
      if (!jName.includes(prevRaceData.jockey) && !prevRaceData.jockey.includes(jName)) {
        isJockeyChangedK = true;
      }
    }

    // 乗り替わりルール1: 「前走好走（1着・2着）＋継続騎乗」のコンビは素直に信頼する
    if (prevRaceData && prevRaceData.result <= 2 && !isJockeyChangedK) {
      potential += 15;
      tags.push("👑 川崎特注: 勝ち負け必至！前走連対＋継続騎乗の堅軸コンビ");
    }

    // 乗り替わりルール2: 「トップジョッキーへの乗り替わり」は勝負気配
    if (isJockeyChangedK && ['矢野', '町田', '御神本', '森泰', '笹川'].some(j => jName.includes(j))) {
      potential += 20;
      tags.push("👑 川崎特注: 陣営の勝負気配！トップジョッキーへの鞍上強化");
    }

    // 乗り替わりルール3: 前走大敗馬の「乗り替わり」を一変（激走）のサインとして穴で狙う
    if (prevRaceData && prevRaceData.result >= 6 && isJockeyChangedK) {
      potential += 15;
      tags.push("💥 川崎特注: 前走大敗からのカンフル剤！乗り替わりによる一変警戒");
    }

    // 乗り替わりルール4: 「他場を主戦とする騎手」への乗り替わりは特注
    if (isJockeyChangedK && ['澤田', '西啓太', '笠野', '達城'].some(j => jName.includes(j))) {
      potential += 15;
      tags.push("💥 川崎特注: 勝算あり？他場主戦ジョッキーへの意欲的な乗り替わり");
    }

    // --- [6〜8番人気の穴馬（ヒモ穴）を狙う4つの条件] --------------------------
    if (popularity >= 6 && popularity <= 8) {
      let himoPoints = 0;
      let reasons = [];

      // 条件1: 「前走3着〜5着」の善戦馬
      if (prevRaceData && prevRaceData.result >= 3 && prevRaceData.result <= 5) {
        himoPoints += 10;
        reasons.push("前走善戦");
      }

      // 条件2: 「1〜2枠（内枠）」または「7〜8枠（外枠）」
      if (frame <= 2 || frame >= 7) {
        himoPoints += 5;
        reasons.push("極端枠");
      }

      // 条件3: 近走で「4番手以内」の先行策をとれた経験がある馬
      let hasEarlySpeed = false;
      if (horse.pastRaces) {
        for (let i = 0; i < Math.min(horse.pastRaces.length, 3); i++) {
          if (horse.pastRaces[i].corner4Position !== undefined && horse.pastRaces[i].corner4Position <= 4) {
            hasEarlySpeed = true;
            break;
          }
        }
      }
      if (hasEarlySpeed) {
        himoPoints += 10;
        reasons.push("先行力");
      }

      // 条件4: 「継続騎乗」または「好調騎手への乗り替わり」
      const isGoodJockeyRide = isJockeyChangedK && ['町田', '新原', '矢野', '御神本', '森泰'].some(j => jName.includes(j));
      if (!isJockeyChangedK || isGoodJockeyRide) {
        himoPoints += 10;
        reasons.push(!isJockeyChangedK ? "継続騎乗" : "勝負乗替");
      }

      // 複数条件クリアで強力なヒモ穴として評価
      if (himoPoints >= 20) {
        potential += 20;
        tags.push(`💥 川崎特注: 高配当の使者！6〜8番人気の好走条件合致(${reasons.join(', ')})`);
      }
    }

    // --- [その他の特注ルール (年齢・距離・斤量・厩舎)] --------------------------
    
    // 特注ルール1: 古馬戦では「7歳以上の高齢馬（特に牝馬）」の激走に警戒する
    if (!is3yo && !(race.raceName && race.raceName.includes('2歳'))) {
      if (horse.age >= 7) {
        if (horse.gender === '牝') {
          potential += 20;
          tags.push("💥 川崎特注: 重馬場で経験値が活きるベテラン高齢牝馬(7歳以上)");
        } else {
          potential += 10;
          tags.push("💥 川崎特注: 重馬場をこなす経験豊富な7歳以上の高齢馬");
        }
      }
    }

    // 特注ルール2: 「距離変更（短縮・延長）」のローテーションを苦にしない
    if (prevRaceData && prevRaceData.dist && prevRaceData.dist !== dist) {
      potential += 5; // ペナルティを与えず、むしろ適性変化をプラスに評価
      tags.push("📈 川崎特注: ペースが変わる距離変更ローテでの変わり身に期待");
    }

    // 特注ルール3: 「減量騎手（若手）」は思い切って軽視し、正規斤量の騎手を信頼する
    if (jName.includes('☆') || jName.includes('△') || jName.includes('▲') || jName.includes('◇') || jName.includes('★')) {
      potential -= 15;
      tags.push("⚠️ 川崎減点: ペース判断の難しい重馬場での減量騎手(経験不足)は軽視");
    }

    // 特注ルール4: 当日の「絶好調厩舎（調教師）」の固め打ちに乗る
    const trainer = horse.trainer || '';
    if (['田邊', '佐々仁', '高月'].some(t => trainer.includes(t))) {
      potential += 15;
      tags.push("👑 川崎特注: 当日の馬場に合っている絶好調厩舎(田邊/佐々仁/高月)の勝負馬");
    }

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
