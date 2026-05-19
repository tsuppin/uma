import { Horse, Prediction, Race, LearningPatch, Formation, MasterData } from '../types';

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
  const headCount = race.headCount || 10;
  
  let potential = 500;
  let distortionBoost = 1.0;
  const tags: string[] = [];

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

    // 1. 市場評価・オッズパラメータ（オッズの歪みと過小評価の検知）
    const isTurf = race.surface === "芝";
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
        if (kinryo < prevJockeyWeight) {
          potential += 25;
          tags.push("⚡ 千直激変：大幅距離短縮ローテ×斤量減エッジ");
        }
      }
    }

    // 新潟芝外回り（1600m〜2000m）における特注激走条件
    const isOuterTurf = isTurf && [1600, 1800, 2000].includes(dist);
    if (isOuterTurf) {
      // ① 開催最終週（重賞）における内枠イン突き逆張りエッジ
      const isFinalWeekStakes = isGradeOrSpecial && race.raceName?.match(/(新潟記念|新潟２歳)/);
      if (isFinalWeekStakes && frame <= 3) {
        potential += 25;
        tags.push("📐 新潟最終週外回り：イン強襲内枠逆張りバイアス適合");
      }

      // ② 芝外回り（直線658.7m）における「人気薄の逃げ馬」の過小評価補正
      if (horse.style === "逃げ" && (popularity >= 6 || odds >= 12.0)) {
        potential += 20;
        tags.push("🏃 新潟芝外回り：人気薄逃げ馬スロー逃げ粘りエッジ");
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
          potential += 25;
          tags.push("⚡ 新潟ダ1200m牝馬逃げ：超平坦路盤スピード持続エッジ");
        }
      } else if (dist === 1800) {
        // 一般ダート：外枠のキックバック回避優位
        if (frame >= 6) {
          potential += 15;
          tags.push("📈 ダート戦：砂被り回避の外枠優位");
        } else if (frame <= 2) {
          potential -= 10;
          tags.push("⚠️ ダート戦：砂被り・揉まれ内枠割引");
        }

        // 【激走】新潟ダ1800m「距離延長×外枠」（ストレスフリー追走）
        if (prevRace && prevRace.distance < 1800 && frame >= 6) {
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

    // 1. 人間系シナジーと特定の乗り替わり・騎乗適正
    // 岩田康誠騎手 × 内枠（イン突き極大期待値）
    if (jockey.includes("岩田康") && frame <= 4) {
      potential += 25;
      tags.push("👑 岩田康誠×京都内枠：必殺イン突きバイアス適合");
    }

    // 川田将雅騎手 × 芝2200m（外回り先行最適化）
    if (jockey.includes("川田") && isTurf && dist === 2200) {
      potential += 25;
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

    // 馬体重減少（-4kg以上）× 内枠（1〜4枠）の登坂＆小回り複合エッジ
    if (weightChange <= -4 && frame <= 4) {
      potential += 20;
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
    if (sireUpper.includes("キタサンブラック") && isTurf && dist === 1400) {
      potential += 20;
      tags.push("🧬 京都芝1400m適性：キタサンブラック産駒スタミナエッジ");
    } else if ((sireUpper.includes("サンダースノー") || sireUpper.includes("キズナ")) && isDirt && dist === 1800) {
      potential += 25;
      tags.push("🧬 京都ダ1800m適性：改修後タフダート適合血統(サンダースノー/キズナ)");
    }

    // 芝2400mハンデ戦における軽量馬（55kg以下）の優遇、および重ハンデ馬（57kg以上）の割引
    const isHandicap = race.raceName?.includes("ハンデ");
    if (isHandicap && isTurf && dist === 2400) {
      if (kinryo <= 55) {
        potential += 20;
        tags.push("⚖️ 京都芝2400mハンデ戦：軽量馬(55kg以下)絶対優位");
      } else if (kinryo >= 57) {
        potential -= 20;
        tags.push("⚠️ 京都芝2400mハンデ戦：実績不足重斤量(57kg以上)割引");
      }
    }

    // 芝外回りコースにおけるスリングショット効果（好位差し適合）と大外一気（追込届かず）の判定
    const isOuterTrack = isTurf && [1600, 1800, 2200, 2400, 3000, 3200].includes(dist);
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
    const isGradeOrSpecial = race.raceName?.match(/(GⅠ|GⅡ|GⅢ|重賞|特別|ステークス|カップ)/);

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
    // 1番人気の過剰人気（低期待値）の割り引き
    if (popularity === 1 && odds <= 2.0) {
      potential -= 10;
      tags.push("⚠️ 東京1番人気過剰被り割引(期待値補正)");
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
  }

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
  const frontRunnersCount = race.horses.filter(h => h.style === '逃げ' || h.style === '先行' || h.style === '好位').length;
  const isHighPaceSim = frontRunnersCount >= 6; // 先行馬が多い -> 激戦 -> 差し有利
  // const isSlowPaceSim = frontRunnersCount <= 2; // 先行馬が少ない -> 展開利 -> 逃げ有利

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
      const isPrevElite = eliteJockeys.some(ej => prevJ.includes(ej));
      const isCurrElite = eliteJockeys.some(ej => currJ.includes(ej));
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
