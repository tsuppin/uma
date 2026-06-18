"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateYatomiPhysics = calculateYatomiPhysics;
exports.calculateTsuchiyaScore = calculateTsuchiyaScore;
exports.generateFormation = generateFormation;
exports.generateWin5Picks = generateWin5Picks;
exports.generateLearningPatch = generateLearningPatch;
exports.sortPredictions = sortPredictions;
exports.generateAILearningPatch = generateAILearningPatch;
var engineNAR_1 = require("./engineNAR");
var waveLevelCalculator_1 = require("./waveLevelCalculator");
// モジュール共通のエリート騎手リスト
var ELITE_JOCKEYS = ["ルメール", "川田将雅", "武豊", "坂井瑠星", "戸崎圭太", "モレイラ", "レーン", "横山武史", "デムーロ", "松山弘平", "川田", "坂井", "戸崎", "笹川翼", "御神本訓", "吉村智洋", "渡邊竜也", "岡部誠"];
// ==========================================
// タイム文字列（コロン・ドット形式 "1:28.4" 等）を秒数（88.4）に安全変換するヘルパー
// ==========================================
function parseTimeToSeconds(timeStr) {
    if (!timeStr)
        return 0;
    var str = timeStr.toString().trim();
    var parts = str.split(':');
    if (parts.length === 2) {
        var mins = parseFloat(parts[0]) || 0;
        var secs = parseFloat(parts[1]) || 0;
        return mins * 60 + secs;
    }
    return parseFloat(str) || 0;
}
// ==========================================
// Yatomi Physics Logic (弥富・名古屋競馬)
// ==========================================
function calculateYatomiPhysics(horse, pastRace, windSpeed, isHeadwind, trackCondition, isInBiasActive) {
    var _a;
    if (!pastRace)
        return 0;
    // 文字列置換によるスケール誤差を解消し、物理計算を秒数ベースで正しく行う
    var adjTime = parseTimeToSeconds(pastRace.time);
    if (adjTime === 0)
        return 0;
    // 1. WIND_VECTOR 補正（秒数ベースで0.3秒、0.2秒の風速補正が本来のスケールで機能）
    if (isHeadwind && windSpeed >= 4.0) {
        if (pastRace.corner4Position <= 4) {
            adjTime += 0.3; // 先行馬：空気抵抗増大（0.3秒遅延）
        }
        else {
            adjTime -= 0.2; // スリップストリーム効果（0.2秒短縮）
        }
    }
    // 2. TRACK_WIDTH_LOSS 補正
    var nPosition = pastRace.cornerOuterCount || 1;
    if (nPosition > 1) {
        adjTime -= (nPosition - 1) * 0.15; // 外を回った頭数に応じた距離ロス補正
    }
    // 3. POWER_STRIDE_DYNAMICS 補正
    var weight = horse.weight;
    if (trackCondition === '良') {
        if (weight < 480) {
            adjTime += 0.2; // パワー負け
        }
        else if (weight >= 500 && pastRace.otherVenueExp) {
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
    var baseTimeStr = ((_a = pastRace.classBaseTime) === null || _a === void 0 ? void 0 : _a.toString()) || '';
    var classBaseTime = baseTimeStr ? parseTimeToSeconds(baseTimeStr) : adjTime + 0.5;
    return adjTime <= classBaseTime ? 1 : 0; // 物理的狙い馬タグ
}
// ==========================================
// Tsuchiya Protocol - スコア計算
// ==========================================
function calculateTsuchiyaScore(horse, race, learningPatches, masterData) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32, _33, _34, _35, _36, _37, _38, _39, _40, _41, _42, _43, _44, _45, _46, _47, _48, _49, _50, _51, _52, _53, _54, _55, _56, _57, _58, _59, _60, _61, _62, _63, _64, _65, _66, _67, _68, _69, _70, _71, _72, _73, _74, _75, _76, _77, _78, _79, _80, _81, _82, _83, _84, _85, _86, _87, _88, _89, _90, _91, _92, _93, _94, _95, _96, _97, _98, _99, _100, _101, _102, _103, _104, _105, _106, _107, _108, _109, _110, _111, _112, _113, _114, _115, _116, _117, _118, _119, _120, _121, _122, _123, _124, _125, _126, _127, _128, _129, _130, _131, _132, _133, _134, _135, _136, _137, _138, _139, _140, _141, _142, _143, _144, _145, _146, _147, _148, _149, _150, _151, _152, _153, _154, _155, _156, _157, _158, _159, _160, _161, _162, _163, _164, _165, _166, _167, _168, _169, _170, _171, _172, _173;
    // 地方競馬（NAR）の判定（変数名の衝突を避けるため直接判定）
    if (race.trackName && ['大井', '川崎', '船橋', '浦和', '盛岡', '水沢', '門別', '名古屋', '弥富', '笠松', '園田', '姫路', '高知', '佐賀', '金沢'].some(function (t) { return race.trackName.includes(t); })) {
        return (0, engineNAR_1.calculateNARScore)(horse, race, learningPatches, masterData);
    }
    var hm = (_a = masterData.horses) === null || _a === void 0 ? void 0 : _a[horse.name];
    var jm = (_b = masterData.jockeys) === null || _b === void 0 ? void 0 : _b[horse.jockey];
    // ==========================================
    // 【新設】④ プロフィール（血統・生産者）の自動補完ロジック
    // ==========================================
    var bloodline = horse.bloodline || '';
    var horseBreeder = horse.breeder || '';
    if (hm) {
        if (!bloodline && hm.sire) {
            bloodline = "".concat(hm.sire, " / ").concat(hm.dam || 'Unknown');
        }
        if (!horseBreeder && hm.breeder) {
            horseBreeder = hm.breeder;
        }
    }
    var trackName = race.trackName || race.venue || '';
    var dist = race.distance;
    var condition = race.condition;
    var weight = horse.weight;
    var weightChange = horse.weightChange;
    var frame = horse.frame;
    var gender = horse.gender;
    var age = horse.age;
    var odds = horse.odds || 10;
    var kinryo = horse.jockeyWeight || 55;
    var popularity = horse.popularity || 99;
    var jockey = horse.jockey || '';
    var headCount = race.headCount || 10;
    var potential = 1000; // [減点方式] 初期値を1000に変更
    var distortionBoost = 1.0;
    var isTargetYatomi = false;
    var tags = [];
    // ==========================================
    // 【新設】◎ データ・ドリブン・コア（最適化ロジック）
    // 機械学習の結果から導き出された最も重要な「物理・人間」要素を最優先評価
    // ==========================================
    // 【追加】オッズの歪み（期待値）ロジック＆PCI（ペースチェンジインデックス）分析
    var prevRaceData = horse.pastRaces && horse.pastRaces.length > 0 ? horse.pastRaces[0] : undefined;
    if (odds >= 15.0) {
        if (prevRaceData) {
            if (prevRaceData.isStumbled || prevRaceData.cornerOuterCount >= 4) {
                // [減点方式] potential += 35;
                tags.push("💰 期待値爆発: 前走物理的不利(度外視) × 大穴オッズ");
            }
            if (prevRaceData.halonPace) {
                var paceParts = prevRaceData.halonPace.split('-');
                if (paceParts.length === 2) {
                    var front3f = parseFloat(paceParts[0]);
                    var back3f = parseFloat(paceParts[1]);
                    if (front3f < back3f - 1.5 && (horse.style === '差し' || horse.style === '追込')) {
                        // [減点方式] potential += 30;
                        tags.push("💰 期待値爆発: 前走ハイペース被害の差し馬 × 大穴");
                    }
                }
            }
        }
    }
    else if (odds <= 2.5 && popularity === 1) {
        if (weight > 0) {
            var kinryoWeightRatio = (kinryo / weight) * 100;
            if (kinryoWeightRatio >= 12.0) {
                potential -= 40;
                tags.push("⚠️ 過剰人気トラップ: 1番人気 × 物理的過負荷(斤量比12%超)");
            }
        }
        if (race.surface === 'ダート' && (prevRaceData === null || prevRaceData === void 0 ? void 0 : prevRaceData.surface) === '芝') {
            potential -= 30;
            tags.push("⚠️ 過剰人気トラップ: 1番人気 × 初ダートの不確実性");
        }
    }
    // ==========================================
    // 【追加】最強の複合ファクター（黄金コンボ）判定
    // ==========================================
    // コンボ1: 物理的絶対優位（小回り × 内枠 × 先行）
    var isTightCourse = ['浦和', '函館', '福島', '小倉', '高知'].some(function (t) { return trackName.includes(t); });
    if (isTightCourse && frame <= 3 && (horse.style === '逃げ' || horse.style === '先行')) {
        // [減点方式] potential += 45;
        tags.push("🔥 黄金コンボ: 小回り × 内枠 × 逃げ先行 (絶対物理優位)");
    }
    // コンボ2: 期待値の爆発（前走の不利 × 枠順の好転）
    if (prevRaceData && prevRaceData.cornerOuterCount >= 4 && frame <= 4) {
        // [減点方式] potential += 40;
        tags.push("🔥 黄金コンボ: 前走大外ロス度外視 × 今回好枠替わり");
    }
    // コンボ3: 危険なトラップ（物理的過負荷 × タフな馬場）
    if (weight > 0 && ['重', '不良'].includes(condition)) {
        var kinryoWeightRatio = (kinryo / weight) * 100;
        if (kinryoWeightRatio >= 12.0) {
            potential -= 50;
            tags.push("❄️ 危険コンボ: 物理的過負荷(斤量比12%超) × タフな重馬場");
        }
    }
    // コンボ4: 陣営の勝負気配（エリート騎手への乗り替わり）
    var eliteJockeys = ['ルメール', '川田', '武豊', 'モレイラ', 'レーン', '御神本', '吉村', '赤岡'];
    if (prevRaceData && prevRaceData.jockey !== jockey && eliteJockeys.some(function (j) { return jockey.includes(j); })) {
        // [減点方式] potential += 35;
        tags.push("🔥 黄金コンボ: エリート騎手への勝負の乗り替わり");
    }
    // ==========================================
    // 【新設】堅いレース向け的中率アップ・プロトコル
    // ==========================================
    // 鉄板条件: トップ騎手 × 先行脚質
    var topJockeys = ['ルメール', 'レーン', 'ゴンサルベス', 'ディー', '川田', '武豊', 'モレイラ'];
    if (topJockeys.some(function (j) { return jockey.includes(j); }) && (horse.style === '先行' || horse.style === '逃げ')) {
        // [減点方式] potential += 40;
        tags.push("🎯 鉄板軸: トップ騎手 × 前残り有利脚質 (的中率重視)");
    }
    // 危険な人気馬排除
    if (popularity <= 3) {
        if (weightChange <= -10) {
            potential -= 50;
            tags.push("⚠️ 危険な人気馬: 当日の大幅マイナス体重(-10kg以下)");
        }
        if (race.surface === '芝' && dist === 2000 && frame >= 7) {
            potential -= 40;
            tags.push("⚠️ 危険な人気馬: 芝2000mの不利な大外枠");
        }
    }
    // ==========================================
    // 【新設】東京最新トレンドプロトコル (2026/06抽出データ)
    // ==========================================
    if (trackName.includes('東京')) {
        // ==========================================
        // 【減点方式】東京競馬場・消去法評価ロジック（2026/06分析）
        // ==========================================
        // 1. 【所属による減点】「栗東（関西）」所属馬の1着固定
        if (horse.stableLocation && horse.stableLocation.includes('栗東')) {
            potential -= 30; // 1着候補から完全除外するため大幅減点
            tags.push("⚠️ 東京消去法: アタマ(1着)は絶望的。ヒモまでの評価となる栗東(関西)所属馬");
        }
        // 2. 【人気と騎手による減点】過信禁物の1番人気
        var isMaiden = race.raceName && (race.raceName.includes('未勝利') || race.raceName.includes('新馬'));
        if (!isMaiden && popularity === 1) {
            var isLemaireLanePenalty = horse.jockey && ['ルメール', 'レーン'].some(function (j) { return horse.jockey.includes(j); });
            if (!isLemaireLanePenalty) {
                potential -= 25; // 軸馬として中〜大幅減点
                tags.push("⚠️ 東京消去法: 危険な1番人気(ルメール/レーン以外の過信禁物)");
            }
        }
        // 3. 【馬体重と年齢による減点】古馬の仕上がり不足
        if (age >= 4 && typeof horse.weightChange === 'number' && Math.abs(horse.weightChange) >= 10) {
            potential -= 20; // 中減点
            tags.push("⚠️ 東京消去法: 古馬の馬体重±10kg以上変動(仕上がり不足・太め残り)");
        }
        // 4. 【コースと脚質による減点】展開不利による致命傷
        if (race.surface === 'ダート' && dist === 1600) {
            if (['後方', '追込'].includes(horse.style)) {
                potential -= 30; // 大幅減点
                tags.push("⚠️ 東京消去法: D1600mで絶対に届かない極端な後方待機(追込)");
            }
        }
        else if (race.surface === 'ダート' && (dist === 1300 || dist === 1400)) {
            if (frame <= 2 && ['中団', '差し'].includes(horse.style)) {
                potential -= 20; // 中減点
                tags.push("⚠️ 東京消去法: D短距離の砂を被って揉まれる内枠(1・2枠)×差し馬");
            }
        }
        // 5. 【前走実績による減点】起爆剤のない大敗馬
        if (prevRaceData && prevRaceData.result >= 10) {
            var hasBlinkers = horse.useBlinkers;
            var isTannaiOrApprentice = horse.jockey && (horse.jockey.includes('丹内') || horse.jockey.match(/[☆▲△◇★]/));
            var isDirtTurfChange = prevRaceData.surface && race.surface && prevRaceData.surface !== race.surface;
            if (!hasBlinkers && !isTannaiOrApprentice && !isDirtTurfChange) {
                potential -= 40; // 完全消し(除外)
                tags.push("⚠️ 東京消去法: 起爆剤(変化)が一つもない前走大敗馬(完全消し)");
            }
        }
        // ==========================================
        // 【特化ロジック】東京競馬場・絶対的5ルール（2026/06分析）
        // ==========================================
        // ルール1：「C.ルメール騎手・D.レーン騎手」×「上位人気」
        var isLemaireLaneStrict = horse.jockey && ['ルメール', 'レーン'].some(function (j) { return horse.jockey.includes(j); });
        if (isLemaireLaneStrict && popularity >= 1 && popularity <= 3) {
            potential += 25;
            tags.push("👑 東京特注: ルメール/レーン×上位人気の圧倒的信頼度(確勝級)");
        }
        // ルール2：「2枠・5枠」×「先行脚質」の優位性
        if ((frame === 2 || frame === 5) && horse.style === '先行') {
            potential += 20;
            tags.push("🔥 東京特注: 絶好枠(2・5枠)からの先行抜け出し(展開超有利)");
        }
        // ルール3：3歳馬の大幅プラス、古馬の馬体維持
        if (typeof horse.weightChange === 'number') {
            if (age === 3 && horse.weightChange >= 10) {
                potential += 15;
                tags.push("🔥 東京特注: 3歳馬の大幅馬体重プラス(成長分でパフォーマンス向上)");
            }
            else if (age >= 4 && horse.weightChange >= -4 && horse.weightChange <= 4) {
                potential += 10;
                tags.push("👑 東京特注: 古馬の馬体重維持(±4kg以内)による安定感");
            }
        }
        // ルール4：血統適性「キズナ産駒」「モズアスコット産駒」
        if (horse.sire && ['キズナ', 'モズアスコット'].some(function (s) { return horse.sire.includes(s); })) {
            potential += 15;
            tags.push("🎯 東京特注: 馬場を問わない絶好の血統適性(キズナ/モズアスコット)");
        }
        // ルール5：相手候補・ヒモ穴には「丹内祐次騎手」×「中位人気」
        var isTannaiStrict = horse.jockey && horse.jockey.includes('丹内');
        if (isTannaiStrict && popularity >= 3 && popularity <= 6) {
            potential += 20; // ヒモとして拾いやすくするためスコアを底上げ
            tags.push("💥 東京特注: ヒモ荒れ誘発！丹内騎手の中位人気馬(高配当の使者)");
        }
        // ルール6：「荻野極騎手・F.ゴンサルベス騎手」×「中位人気」の伏兵
        var isOginoGoncalves = horse.jockey && ['荻野極', 'ゴンサルベス'].some(function (j) { return horse.jockey.includes(j); });
        if (isOginoGoncalves && popularity >= 2 && popularity <= 6) {
            potential += 15;
            tags.push("🔥 東京特注: 伏兵を上位に持ってくる名手(荻野極/ゴンサルベス)");
        }
        // ルール7：大穴狙いなら中堅・若手騎手(木幡巧/木幡初/丸山)の二桁人気馬
        var isKowataMaruyama = horse.jockey && ['木幡巧', '木幡初', '丸山'].some(function (j) { return horse.jockey.includes(j); });
        if (isKowataMaruyama && popularity >= 10) {
            potential += 15; // 大穴でもスコア底上げでヒモに残す
            tags.push("💥 東京特注: 超大穴の激走警戒！中堅騎手の爆穴枠(木幡/丸山)");
        }
        // ルール8：1着は絶対に関東馬(美浦)！関西馬(栗東)のアタマ狙いは危険
        if (horse.stableLocation && horse.stableLocation.includes('美浦')) {
            potential += 15;
            tags.push("👑 東京特注: 1着固定の絶対条件！地元・美浦(関東)所属馬");
        }
        else if (horse.stableLocation && horse.stableLocation.includes('栗東')) {
            potential -= 20; // アタマとしては大きく割引き、ヒモとしての評価に留める
            tags.push("⚠️ 東京減点: アタマ(1着)は危険。2・3着の相手までの栗東(関西)所属馬");
        }
        // ルール9：集中力アップで激走を呼ぶ「ブリンカー着用馬」
        if (horse.useBlinkers) {
            potential += 15;
            tags.push("💥 東京特注: 集中力UP！一変の可能性を秘めるブリンカー着用馬");
            // ブリンカー激走の黄金パターン（先行or内枠 × 前走大敗）
            var isInnerFrame = frame <= 3;
            var isFrontRunner = horse.style === '逃げ' || horse.style === '先行';
            var isPrevBigLoss = prevRaceData && prevRaceData.result >= 7;
            if ((isInnerFrame || isFrontRunner) && isPrevBigLoss && popularity >= 6) {
                potential += 30; // 特大万馬券の使者として劇的にスコアを上げる
                tags.push("🚨 東京爆穴: 【特大万馬券の使者】ブリンカー×(内枠or先行)×前走大敗の黄金激走パターン！");
            }
        }
        // ==========================================
        // 【特化ロジック】東京競馬場・近走実績4パターン（2026/06分析）
        // ==========================================
        var recentRacesTokyo = horse.pastRaces ? horse.pastRaces.slice(0, 3) : [];
        // ルール10：【最も堅実な軸候補】「近走（3〜5着）連続惜敗馬」の勝ち切り
        if (recentRacesTokyo.length >= 2) {
            var isConsecutiveCloseMiss = recentRacesTokyo.every(function (pr, i) { return i > 1 || (pr.result >= 3 && pr.result <= 5); });
            if (isConsecutiveCloseMiss && recentRacesTokyo[0].result >= 3 && recentRacesTokyo[0].result <= 5 && recentRacesTokyo[1].result >= 3 && recentRacesTokyo[1].result <= 5) {
                potential += 20;
                tags.push("👑 東京特注: 近走惜敗続き(3〜5着)からの勝ち上がり濃厚(堅実な軸)");
            }
        }
        // ルール11：【連勝の勢い】「昇級戦（前走1着）」の壁を突破する馬
        if (prevRaceData && prevRaceData.result === 1) {
            potential += 15;
            tags.push("🔥 東京特注: 昇級戦の壁なし！前走1着の勢いそのまま連勝へ");
        }
        // ルール12：【格上での経験値】「重賞・オープン敗退」からの自己条件巻き返し
        var hasHigherClassDefeat = recentRacesTokyo.some(function (pr) {
            return pr.raceName && (pr.raceName.match(/G[1-3I-III]/i) || pr.raceName.includes('OP') || pr.raceName.includes('オープン')) && pr.result >= 6;
        });
        var isCurrentRaceLowerClass = !(race.raceName && (race.raceName.match(/G[1-3I-III]/i) || race.raceName.includes('OP') || race.raceName.includes('オープン')));
        if (hasHigherClassDefeat && isCurrentRaceLowerClass && popularity >= 1 && popularity <= 5) {
            potential += 20;
            tags.push("👑 東京特注: 重賞・OP揉まれ経験馬の格下がり(自己条件で地力発揮)");
        }
        // ルール13：【波乱の使者】「前走大敗（二桁着順）」からの豹変
        if (prevRaceData && prevRaceData.result >= 10) {
            // ヒモとして残すために加点
            potential += 15;
            tags.push("💥 東京特注: 前走大敗(二桁着順)からの豹変警戒(高配当の使者)");
        }
        // ==========================================
        // 【特化ロジック】東京競馬場・乗り替わり3パターン（2026/06分析）
        // ==========================================
        var isJockeyChanged = prevRaceData && horse.jockey && prevRaceData.jockey && horse.jockey !== prevRaceData.jockey;
        var isTopJockeyStrict = horse.jockey && ['ルメール', 'レーン', '川田', '松山', '横山武', 'モレイラ'].some(function (j) { return horse.jockey.includes(j); });
        if (isJockeyChanged) {
            // ルール14：【最も頻出する勝ちパターン】「前走惜敗馬（3〜5着）」 × 「有力・中堅騎手への乗り替わり」
            if (prevRaceData.result >= 3 && prevRaceData.result <= 5) {
                potential += 20;
                tags.push("👑 東京特注: 陣営の勝負気配！前走惜敗からの鞍上強化(乗り替わり)で勝ち切る");
            }
            // ルール15：【確勝を期す陣営のサイン】「重賞・OP敗退」 × 「トップジョッキーへの乗り替わり」
            if (isCurrentRaceLowerClass && isTopJockeyStrict && prevRaceData.raceName && (prevRaceData.raceName.match(/G[1-3I-III]/i) || prevRaceData.raceName.includes('OP') || prevRaceData.raceName.includes('オープン')) && prevRaceData.result >= 6) {
                potential += 25;
                tags.push("👑 東京特注: 絶対勝つ陣営のサイン！重賞敗退からの自己条件×トップジョッキーへの乗り替わり");
            }
            // ルール16：【大穴・波乱の使者】「前走大敗」 × 「勢いのある若手騎手への乗り替わり」
            if (prevRaceData.result >= 10 && popularity >= 6) {
                potential += 20; // ヒモ穴としての価値をさらに上げる
                tags.push("💥 東京特注: 大波乱の立役者！前走大敗からの乗り替わり一変警戒");
            }
        }
        // 1. 芝マイル以下（1400m・1600m）：「先行〜中団差し」×「圧倒的な内枠（2〜3枠）」
        if (race.surface === '芝' && dist <= 1600) {
            if ((frame === 2 || frame === 3) && ['逃げ', '先行', '差し'].includes(horse.style)) {
                // [減点方式] potential += 50;
                tags.push("👑 東京TB特注: 芝マイル以下の圧倒的内枠(2・3枠)×先行〜差し");
            }
            else if (frame >= 7) {
                potential -= 20; // 外枠は割引
                tags.push("⚠️ 東京TB危険: 芝マイル以下の不利な外枠");
            }
        }
        // 2. 芝中長距離（1800m以上）：「逃げ・先行押し切り」×「中枠（5〜6枠）＆内枠」
        if (race.surface === '芝' && dist >= 1800) {
            if (['逃げ', '先行'].includes(horse.style) && frame <= 6) {
                // [減点方式] potential += 45;
                tags.push("🔥 東京TB特注: 芝中長距離の逃げ・先行×内〜中枠押し切り");
            }
        }
        // 3. ダート1600m：「圧倒的な前残り」×「内〜中枠」
        if (race.surface === 'ダート' && dist === 1600) {
            if (['逃げ', '先行'].includes(horse.style)) {
                if (frame <= 5) {
                    // [減点方式] potential += 50;
                    tags.push("👑 東京TB特注: D1600mの前残り絶対有利×ロスなし内〜中枠");
                }
                else {
                    /* [減点方式] potential += 20; */ // 外枠でも前に行ければプラスだが内枠ほどではない
                }
            }
        }
        // 4. ダート短距離（1300m・1400m）：「好位〜差し」×「揉まれない中〜外枠（5・6・8枠）」
        if (race.surface === 'ダート' && dist <= 1400) {
            if (['先行', '差し'].includes(horse.style) && (frame === 5 || frame === 6 || frame === 8)) {
                // [減点方式] potential += 45;
                tags.push("🔥 東京TB特注: D短距離の揉まれない中外枠×差し・好位");
            }
            else if (frame <= 2 && horse.style === '差し') {
                potential -= 25; // 揉まれる内枠の差しは割引
                tags.push("⚠️ 東京TB危険: D短距離の内枠×差し(揉まれるリスク大)");
            }
        }
        // ==========================================
        // 【新設】東京開催・血統×馬場状態プロトコル
        // ==========================================
        var sireName_1 = horse.sire || '';
        if (race.surface === 'ダート') {
            if (condition === '良') {
                if (['キズナ', 'モズアスコット'].some(function (s) { return sireName_1.includes(s); })) {
                    // [減点方式] potential += 40;
                    tags.push("👑 東京血統: ダート良馬場で無類の強さ(キズナ/モズパワー)");
                }
            }
            else if (['稍重', '重', '不良'].includes(condition)) {
                if (['ロードカナロア', 'ダノンスマッシュ'].some(function (s) { return sireName_1.includes(s); })) {
                    // [減点方式] potential += 45;
                    tags.push("🔥 東京血統: 渋ったダートでスピード活きるカナロア系(穴馬サイン)");
                }
            }
        }
        else if (race.surface === '芝') {
            if (condition === '良') {
                if (['キズナ', 'エピファネイア', 'エフフォーリア'].some(function (s) { return sireName_1.includes(s); })) {
                    // [減点方式] potential += 35;
                    tags.push("🎯 東京血統: 芝良馬場の王道適性(キズナ/ロベルト系)");
                }
            }
        }
        // ==========================================
        // 【新設】東京開催・年齢別馬体重（成長と完成）プロトコル
        // ==========================================
        if (age <= 3) {
            if (weightChange >= 10) {
                // [減点方式] potential += 40;
                tags.push("🔥 東京馬体重: 3歳馬の大幅プラス(成長・筋肉量UP)");
            }
        }
        else if (age >= 4) {
            if (weightChange >= -4 && weightChange <= 4) {
                // [減点方式] potential += 35;
                tags.push("👑 東京馬体重: 古馬の微増減(ベスト体重での仕上がり鉄板)");
            }
            else if (weightChange >= 10) {
                potential -= 30;
                tags.push("⚠️ 東京馬体重: 古馬の大幅プラス(太め残りの危険大)");
            }
            else if (weightChange <= -10) {
                potential -= 30;
                tags.push("⚠️ 東京馬体重: 古馬の大幅マイナス(調子落ち・細化の危険)");
            }
        }
        // ==========================================
        // 【新設】東京開催・騎手×人気×前走成績の必勝パターン
        // ==========================================
        var isLemaireLane = ['ルメール', 'レーン'].some(function (j) { return jockey.includes(j); });
        var isTokyoTopJockey = ['ゴンサルベス', '岩田望', '松山', '荻野極', '横山武', 'モレイラ', '川田', '武豊', 'ディー'].some(function (j) { return jockey.includes(j); }) || isLemaireLane;
        var isTannai = jockey.includes('丹内');
        // 1. ルメール・レーン × 1番人気 × (新馬 または 前走2着)
        var isNewHorse = !prevRaceData || ((_c = horse.pastRaces) === null || _c === void 0 ? void 0 : _c.length) === 0;
        var prevResult = prevRaceData ? prevRaceData.result : 99;
        var isPrev2nd = prevResult === 2;
        if (isLemaireLane && popularity === 1 && (isNewHorse || isPrev2nd)) {
            // [減点方式] potential += 30;
            tags.push("🎯 東京鉄板: ルメール/レーン×1番人気×新馬・前走2着(確勝級)");
        }
        if (prevRaceData) {
            var isPrev3to5 = prevResult >= 3 && prevResult <= 5;
            var isPrev1st = prevResult === 1;
            // 2. 【最も頻出する勝ちパターン】上位騎手 × 1〜5番人気 × 前走3〜5着
            if (isTokyoTopJockey && popularity >= 1 && popularity <= 5 && isPrev3to5) {
                // [減点方式] potential += 40;
                tags.push("👑 東京必勝: 上位騎手×上位人気×前走惜敗(勝ち上がり濃厚)");
            }
            // 3. 【中穴・波乱の使者】丹内祐次 × 3〜6番人気 × 前走大敗も含む
            if (isTannai && popularity >= 3 && popularity <= 6) {
                // [減点方式] potential += 45;
                tags.push("🔥 東京妙味: 丹内騎手の中位人気は前走着順不問で買い");
            }
            // 4. 【昇級の壁を突破】上位騎手 × 2〜3番人気 × 前走1着
            if (isTokyoTopJockey && (popularity === 2 || popularity === 3) && isPrev1st) {
                // [減点方式] potential += 35;
                tags.push("🔥 東京上昇: 上位騎手×2〜3番人気×前走1着の連勝期待");
            }
        }
        else {
            // 1. ルメール・レーン × 1番人気 × 新馬
            if (isLemaireLane && popularity === 1) {
                // [減点方式] potential += 30;
                tags.push("🎯 東京鉄板: ルメール/レーン×1番人気×新馬戦の確勝級");
            }
            // 3. 丹内騎手の新馬
            if (isTannai && popularity >= 3 && popularity <= 6) {
                // [減点方式] potential += 45;
                tags.push("🔥 東京妙味: 丹内騎手の中位人気は買い");
            }
        }
    }
    // ==========================================
    // 【新設】最新開催の絶対的軸馬抽出プロトコル（4条件複合）
    // ==========================================
    // 条件: ① 前走先行 ② 馬体重増減少ない ③ 血統適性 ④ 前走上位
    if (prevRaceData) {
        var prevPositionFront = horse.style === '先行' || horse.style === '逃げ';
        var stableWeight = weightChange >= -8 && weightChange <= 2;
        var prevTopFinish = prevRaceData.result === 2 || prevRaceData.result === 3;
        // 血統適性 (芝は王道、ダートは米国型)
        var goodSire = false;
        if (race.surface === '芝') {
            goodSire = ['キズナ', 'コントレイル', 'キタサンブラック'].some(function (s) { return (horse.sire || '').includes(s); });
        }
        else if (race.surface === 'ダート') {
            goodSire = ['ドレフォン', 'パイロ', 'マインドユアビスケッツ'].some(function (s) { return (horse.sire || '').includes(s); });
        }
        // 複合チェック
        if (prevPositionFront && stableWeight && prevTopFinish) {
            // [減点方式] potential += 40;
            tags.push("🎯 最新開催トレンド: 前走先行×安定体重×前走上位の鉄板ローテ");
            if (goodSire) {
                /* [減点方式] potential += 30; */ // さらに血統適性も合致で大幅加点
                tags.push("🔥 最新開催トレンド: コース適性ドンピシャ血統");
            }
        }
        else if (goodSire && stableWeight) {
            // [減点方式] potential += 25;
            tags.push("🔥 最新開催トレンド: 適性血統×安定体重");
        }
    }
    // ==========================================
    // 【追加】JRA専用・最強の複合ファクター判定
    // ==========================================
    var isJraCourse = ['東京', '中山', '京都', '阪神', '中京', '新潟', '福島', '小倉', '函館', '札幌'].some(function (t) { return trackName.includes(t); });
    if (isJraCourse) {
        // JRAコンボ1: 外厩帰り × トップ騎手 × 休み明け初戦
        if (horse.isAfterRest && eliteJockeys.some(function (j) { return jockey.includes(j); })) {
            // [減点方式] potential += 45;
            tags.push("🔥 JRA極秘: トップ外厩仕上げ × エリート騎手の勝負気配");
        }
        // JRAコンボ2: 馬場改修（仮柵移動） × 内枠 × 先行馬
        if (race.temporaryFencePosition && race.temporaryFencePosition !== 'A' && frame <= 3 && (horse.style === '逃げ' || horse.style === '先行')) {
            // [減点方式] potential += 40;
            tags.push("🔥 JRA極秘: 仮柵移動(新品のイン) × 内枠先行絶対優位");
        }
        // JRAコンボ3: 上がり3F最速実績 × 直線の長いコース
        var isLongStraight = ['東京', '新潟', '阪神'].some(function (t) { return trackName.includes(t); });
        if (isLongStraight && prevRaceData && prevRaceData.last3fTime) {
            var last3f = parseFloat(prevRaceData.last3fTime);
            if (!isNaN(last3f) && last3f <= 34.0) {
                // [減点方式] potential += 35;
                tags.push("🔥 JRA極秘: 長い直線 × 鬼脚(上がり33秒台実績)");
            }
        }
        // JRAコンボ4: 前走ハイペース被害馬 × 今回の「逃げ馬不在」
        var frontRunnersCount_1 = race.horses.filter(function (h) { return h.style === '逃げ'; }).length;
        if (horse.style === '逃げ' && frontRunnersCount_1 <= 1 && prevRaceData && prevRaceData.halonPace) {
            var paceParts = prevRaceData.halonPace.split('-');
            if (paceParts.length === 2) {
                var front3f = parseFloat(paceParts[0]);
                var back3f = parseFloat(paceParts[1]);
                if (front3f < back3f - 1.5) {
                    // [減点方式] potential += 35;
                    tags.push("🔥 JRA極秘: 前走ハイペース被害馬の「単騎逃げ」濃厚");
                }
            }
        }
        // ==========================================
        // 【追加】JRAアドバンスド・プロトコル（極秘条件）
        // ==========================================
        // JRAアドバンスコンボ1: 中山マイスター（急坂適性血統×リピーター）
        if (trackName.includes('中山')) {
            var isPowerSire = ['ルーラーシップ', 'ドレフォン', 'ヘニーヒューズ', 'ステイゴールド', 'オルフェーヴル', 'キズナ'].some(function (s) { return (horse.sire || '').includes(s); });
            var isRepeater = (_d = horse.pastRaces) === null || _d === void 0 ? void 0 : _d.some(function (pr) { return pr.venue.includes('中山') && pr.result <= 3; });
            if (isPowerSire && isRepeater) {
                // [減点方式] potential += 40;
                tags.push("🔥 JRA極秘: 中山マイスター(リピーター×急坂適性血統)");
            }
        }
        // JRAアドバンスコンボ2: 夏の牝馬・滞在競馬
        var isLocalStayTrack = ['札幌', '函館', '小倉'].some(function (t) { return trackName.includes(t); });
        var raceMonth = new Date(race.date).getMonth() + 1;
        if (isLocalStayTrack && (raceMonth >= 7 && raceMonth <= 9) && gender === '牝') {
            // [減点方式] potential += 35;
            tags.push("🔥 JRA極秘: 夏の滞在競馬における牝馬の激走");
        }
        // JRAアドバンスコンボ3: 距離短縮ショック
        if (prevRaceData && prevRaceData.distance > dist && (horse.style === '差し' || horse.style === '追込')) {
            // [減点方式] potential += 30;
            tags.push("🔥 JRA極秘: 距離短縮ショック(豊富なスタミナ×末脚爆発)");
        }
        // JRAアドバンスコンボ4: 初ダートの米国型血統覚醒
        if (race.surface === 'ダート' && (prevRaceData === null || prevRaceData === void 0 ? void 0 : prevRaceData.surface) === '芝') {
            var isUsDirtSire = ['シニスターミニスター', 'マジェスティックウォリアー', 'ヘニーヒューズ', 'パイロ', 'マクフィ', 'ダノンレジェンド', 'キンシャサノキセキ', 'エスポワールシチー'].some(function (s) { return (horse.sire || '').includes(s); });
            if (isUsDirtSire) {
                /* [減点方式] potential += 50; */ // オッズが落ちやすいため期待値が跳ね上がる
                tags.push("🔥 JRA極秘: 初ダート×ダート特化血統(覚醒の可能性大)");
            }
        }
        // ==========================================
        // 【追加】東京マニアック特化プロトコル（ニッチな高回収率ロジック）
        // ==========================================
        if (trackName.includes('東京')) {
            // マニアック1: 東京ダート1600m専用「芝スタート×大外枠×米国血統」
            if (race.surface === 'ダート' && dist === 1600 && frame >= 6 && (horse.style === '逃げ' || horse.style === '先行')) {
                var isUsDirtSpeed = ['ヘニーヒューズ', 'ドレフォン', 'シニスターミニスター', 'マクフィ', 'アジアエクスプレス'].some(function (s) { return (horse.sire || '').includes(s); });
                if (isUsDirtSpeed) {
                    // [減点方式] potential += 40;
                    tags.push("🔥 東京D1600特注: 芝スタートを活かす外枠×米国スピード血統");
                }
            }
            // マニアック2: 雨の東京芝専用「不良馬場×内枠逃げ×重戦車血統」
            if (race.surface === '芝' && ['重', '不良'].includes(condition) && frame <= 2 && horse.style === '逃げ') {
                var isHeavyTank = ['バゴ', 'ハービンジャー', 'フランケル', 'ステイゴールド', 'オルフェーヴル', 'キズナ'].some(function (s) { return (horse.sire || '').includes(s); });
                if (isHeavyTank) {
                    // [減点方式] potential += 45;
                    tags.push("🔥 雨の東京特注: キレ味無効化の泥んこ馬場を逃げ粘る重戦車");
                }
            }
            // マニアック3: 左回りの天才（サウスポーの逆襲）
            // 前走が右回りで敗北（4着以下）し、今回左回りの東京に変わる馬を狙う
            if (prevRaceData && (prevRaceData.direction === '右' || ['中山', '阪神', '京都', '福島', '小倉', '函館', '札幌'].some(function (t) { var _a; return (_a = prevRaceData.venue) === null || _a === void 0 ? void 0 : _a.includes(t); }))) {
                if (prevRaceData.result >= 4) {
                    // [減点方式] potential += 35;
                    tags.push("🔥 東京特注: 右回り惨敗からの左回り替わり(サウスポーの逆襲)");
                }
            }
            // マニアック4: ダービー＆JC専用「東京2400m×トニービン内包血統」
            if (dist === 2400 && race.surface === '芝') {
                var isTonyBinBlood = ['ハーツクライ', 'ルーラーシップ', 'ドゥラメンテ', 'ジャスタウェイ', 'スワーヴリチャード'].some(function (s) { return (horse.sire || '').includes(s) || (horse.bms || '').includes(s); });
                if (isTonyBinBlood) {
                    // [減点方式] potential += 30;
                    tags.push("🔥 東京2400特注: 過酷な直線を登り切る底力(トニービン内包)");
                }
            }
        }
        // ==========================================
        // 【追加】東京重賞特化プロトコル（絶対能力と適性の極み）
        // ==========================================
        var isTokyoStakes = trackName.includes('東京') && race.raceName && race.raceName.match(/G[1-3I-III]/i);
        if (isTokyoStakes) {
            // 東京重賞1: 東京の帝王（ルメール×ノーザン系馬主・有力血統）
            var isNorthernOwner = ['サンデー', 'キャロット', 'シルク', '社台', 'ダノン', 'サトノ', '金子'].some(function (o) { return (horse.owner || '').includes(o); });
            if (jockey.includes('ルメール') && isNorthernOwner) {
                // [減点方式] potential += 50;
                tags.push("👑 東京特注: 東京の帝王ルメール×ノーザン系勝負馬");
            }
            // 東京重賞2: 究極の瞬発力証明（上がり最速実績×距離延長）
            if (prevRaceData && prevRaceData.last3fTime) {
                var last3f = parseFloat(prevRaceData.last3fTime);
                if (!isNaN(last3f) && last3f <= 33.9 && dist > prevRaceData.distance) {
                    // [減点方式] potential += 40;
                    tags.push("👑 東京特注: 距離延長でさらに活きる究極の瞬発力");
                }
            }
            // 東京重賞3: 格の違い（G1大敗からのG2/G3格下がり×差し馬）
            var isG2orG3 = race.raceName.match(/G[23]/i) || race.raceName.match(/G(II|III)/i);
            var isPrevG1 = ((_e = prevRaceData === null || prevRaceData === void 0 ? void 0 : prevRaceData.raceClass) === null || _e === void 0 ? void 0 : _e.match(/G[1I]/i)) || ((_f = prevRaceData === null || prevRaceData === void 0 ? void 0 : prevRaceData.raceName) === null || _f === void 0 ? void 0 : _f.match(/G[1I]/i));
            if (isG2orG3 && isPrevG1 && (horse.style === '差し' || horse.style === '追込')) {
                // [減点方式] potential += 45;
                tags.push("👑 東京特注: G1揉まれ経験馬の格下がり(展開不問の差し)");
            }
            // 東京重賞4: 外枠のクリーンラン（多頭数×外枠×王道血統）
            if (headCount >= 14 && frame >= 6) {
                var isRoyalSire = ['キタサンブラック', 'エピファネイア', 'ロードカナロア', 'ディープインパクト', 'スワーヴリチャード', 'ドゥラメンテ', 'モーリス'].some(function (s) { return (horse.sire || '').includes(s); });
                if (isRoyalSire) {
                    // [減点方式] potential += 35;
                    tags.push("👑 東京特注: 多頭数外枠のクリーンラン(王道血統)");
                }
            }
        }
        // ==========================================
        // 【追加】阪神マニアック特化プロトコル（ニッチな高回収率ロジック）
        // ==========================================
        if (trackName.includes('阪神')) {
            // ==========================================
            // 【完全減点方式】阪神特化ペナルティロジック（2026/06抽出）
            // ==========================================
            // 1. 人気・オッズファクター（減点最大：-20点）
            if (popularity >= 10) {
                potential -= 20;
                tags.push("⚠️ 阪神減点: 10番人気以下の大穴(1着絶望的)");
            }
            else if (popularity >= 6 && popularity <= 9) {
                potential -= 10;
                tags.push("⚠️ 阪神減点: 中穴(6〜9番人気)は1着候補として割引");
            }
            // 2. 枠順ファクター（減点最大：-20点）
            if (frame === 8) {
                potential -= 20;
                tags.push("⚠️ 阪神減点: 勝利実績ゼロの大外8枠(致命的ロス)");
            }
            else if (frame === 6 || frame === 7) {
                potential -= 5;
                tags.push("⚠️ 阪神減点: 外枠(6・7枠)の距離ロス");
            }
            // 3. 馬体重変動ファクター（減点最大：-15点）
            if (prevRaceData && typeof horse.weightChange === 'number') {
                var absChange = Math.abs(horse.weightChange);
                if (absChange >= 10) {
                    potential -= 15;
                    tags.push("⚠️ 阪神減点: ±10kg以上の大幅な馬体重変動(状態不安)");
                }
            }
            // 4. 近走成績ファクター（減点最大：-15点）
            var hasTop3InPast3 = false;
            var recentRaces = horse.pastRaces ? horse.pastRaces.slice(0, 3) : [];
            for (var _i = 0, recentRaces_1 = recentRaces; _i < recentRaces_1.length; _i++) {
                var pr = recentRaces_1[_i];
                if (pr.result <= 3) {
                    hasTop3InPast3 = true;
                    break;
                }
            }
            if (!hasTop3InPast3 && recentRaces.length > 0) {
                potential -= 15;
                tags.push("⚠️ 阪神減点: 近3走で3着以内の実績なし(巻き返し困難)");
            }
            else if (prevRaceData && prevRaceData.result >= 10) {
                potential -= 10;
                tags.push("⚠️ 阪神減点: 前走2桁着順の大敗(一変は少ない)");
            }
            // 5. 脚質・位置取りファクター（減点最大：-20点）
            if (horse.style === '追込' || horse.style === '後方') {
                potential -= 20;
                tags.push("⚠️ 阪神減点: 届かない極端な後方待機(追込不利)");
            }
            else if (horse.style === '差し' || horse.style === '中団') {
                potential -= 10;
                tags.push("⚠️ 阪神減点: 展開待ちの中団・差し(先行有利馬場)");
            }
            // 6. 上がり3ハロン（末脚）ファクター（減点最大：-10点）
            // ※ここでは簡易的に前走上がり34.5秒以下を速い上がりと定義し、それがない場合に減点
            var hasFastLast3f = false;
            for (var _174 = 0, recentRaces_2 = recentRaces; _174 < recentRaces_2.length; _174++) {
                var pr = recentRaces_2[_174];
                if (pr.last3fTime) {
                    var last3f = parseFloat(pr.last3fTime);
                    if (!isNaN(last3f) && last3f <= 34.5) {
                        hasFastLast3f = true;
                        break;
                    }
                }
            }
            if (!hasFastLast3f && recentRaces.length > 0) {
                potential -= 10;
                tags.push("⚠️ 阪神減点: 近走で鋭い末脚(上がり速いタイム)の実績なし");
            }
            // 7. 騎手ファクター（減点最大：-10点）
            var hotJockeysHanshin = ['坂井瑠星', '川田将雅', '岩田望来', '幸英明', '西塚洸二', '田口貫太', '北村友一'];
            var isHotJockey = horse.jockey && hotJockeysHanshin.some(function (j) { return horse.jockey.includes(j); });
            var isApprenticeHanshin = horse.jockey && horse.jockey.match(/[☆▲△◇★]/);
            if (isApprenticeHanshin && !isHotJockey) {
                potential -= 10;
                tags.push("⚠️ 阪神減点: 減量特典のみの若手騎手(トップジョッキー優勢)");
            }
            // 【特例救済ロジック】ヒモ荒れ狙い（2・3着候補）
            // トータルスコアが低くても、「上がり最速クラス」または「絶好調トップジョッキー」ならヒモとして残す
            if (hasFastLast3f || isHotJockey) {
                if (popularity >= 6) {
                    // 減点されすぎないようにスコアを底上げし、フォーメーションのヒモ（2,3列目）に引っかかるようにする
                    potential += 20;
                    tags.push("💥 阪神特注: 減点対象でも一発があるヒモ荒れ大穴候補");
                }
            }
            // マニアック1: 阪神ダート1400m専用「芝スタート×外枠×芝用スピード血統」
            if (race.surface === 'ダート' && dist === 1400 && frame >= 6) {
                var isTurfSpeed = ['ロードカナロア', 'キンシャサノキセキ', 'ダイワメジャー', 'ミッキーアイル', 'イスラボニータ'].some(function (s) { return (horse.sire || '').includes(s); });
                if (isTurfSpeed) {
                    // [減点方式] potential += 40;
                    tags.push("🔥 阪神D1400特注: 芝スタートを活かす外枠×芝用スピード血統");
                }
            }
            // マニアック2: 京都との真逆適性「平坦負けからの急坂替わり（パワーの逆襲）」
            if (prevRaceData && ((_g = prevRaceData.venue) === null || _g === void 0 ? void 0 : _g.includes('京都')) && prevRaceData.result >= 4) {
                if (weight >= 500 || ['キズナ', 'エピファネイア', 'ルーラーシップ', 'ハービンジャー', 'オルフェーヴル'].some(function (s) { return (horse.sire || '').includes(s); })) {
                    // [減点方式] potential += 45;
                    tags.push("🔥 阪神特注: 前走京都(平坦)スピード負けからの急坂パワー替わり");
                }
            }
            // マニアック3: 阪神内回り専用「ロンスパ特化型血統（マクリの美学）」
            if (race.surface === '芝' && (dist === 2000 || dist === 2200)) {
                if (horse.style === '差し' || horse.style === '後方' || horse.style === '中団') {
                    var isLongSpurt = ['ステイゴールド', 'オルフェーヴル', 'ゴールドシップ', 'エピファネイア', 'スクリーンヒーロー'].some(function (s) { return (horse.sire || '').includes(s); });
                    if (isLongSpurt) {
                        // [減点方式] potential += 35;
                        tags.push("🔥 阪神内回り特注: 3コーナーからマクり上げるロンスパ血統");
                    }
                }
            }
            // マニアック4: 阪神外回り1600m専用「距離短縮組（タフペース経験）の優位性」
            if (race.surface === '芝' && dist === 1600) {
                if (prevRaceData && prevRaceData.distance <= 1400 && prevRaceData.last3fTime) {
                    var prevLast3f = parseFloat(prevRaceData.last3fTime);
                    if (!isNaN(prevLast3f) && prevLast3f <= 34.5) {
                        // [減点方式] potential += 35;
                        tags.push("🔥 阪神外回り特注: ハイペース経験(距離短縮)のタフネスと末脚");
                    }
                }
            }
            // ==========================================
            // 【新設】阪神開催・最新トラックバイアス特化プロトコル
            // ==========================================
            // 1. 芝・マイル〜中長距離 (1600m〜2200m)：「内枠」 × 「逃げ・先行」が鉄板
            if (race.surface === '芝' && dist >= 1600 && dist <= 2200) {
                if (frame <= 3 && (horse.style === '逃げ' || horse.style === '先行')) {
                    /* [減点方式] potential += 60; */ // 極端に高くする
                    tags.push("👑 阪神TB特注: 芝中長距離のイン前残り(絶対的有利)");
                }
                else if (frame >= 6 && (horse.style === '差し' || horse.style === '追込')) {
                    potential -= 30; // 展開待ちになる外枠差しは減点
                    tags.push("⚠️ 阪神TB危険: 芝中長距離の外枠差し(展開不利)");
                }
            }
            // 2. ダート中距離 (1800m)：「先行」できれば「枠順は不問」
            if (race.surface === 'ダート' && dist === 1800) {
                if (horse.style === '逃げ' || horse.style === '先行') {
                    /* [減点方式] potential += 50; */ // 先行力の比重を極端に上げる
                    tags.push("👑 阪神TB特注: ダート1800mは枠不問で先行力絶対優位");
                    // 外枠のマイナス評価を緩める（もし他に外枠減点があれば相殺するか、ここでさらに加点）
                    if (frame >= 6) {
                        /* [減点方式] potential += 15; */ // 砂を被らない外枠先行はさらにプラス
                        tags.push("🔥 阪神TB特注: 砂を被らない外枠先行(被せられずスムーズ)");
                    }
                }
            }
            // 3. ダート短距離 (1200m・1400m)：「内〜中枠(1-4枠)」 × 「先行」が安定
            if (race.surface === 'ダート' && dist <= 1400) {
                if (frame <= 4 && (horse.style === '逃げ' || horse.style === '先行')) {
                    // [減点方式] potential += 45;
                    tags.push("👑 阪神TB特注: ダ短距離の内〜中枠の先行(ロスなく好位)");
                }
                else if (frame >= 7) {
                    potential -= 25; // 外枠はロスが生じやすい
                    // [要見直し2] tags.push("⚠️ 阪神TB危険: ダ短距離の大外枠ロス");
                }
            }
            // 4. 芝・短距離 (1200m・1400m)：「内枠先行」or「外枠差し」
            if (race.surface === '芝' && dist <= 1400) {
                if (frame <= 3 && (horse.style === '逃げ' || horse.style === '先行')) {
                    // [減点方式] potential += 35;
                    tags.push("🔥 阪神TB特注: 芝短距離の内枠先行(基本セオリー)");
                }
                else if (frame >= 6 && (horse.style === '差し' || horse.style === '追込')) {
                    /* [減点方式] potential += 30; */ // 展開次第で台頭
                    tags.push("🔥 阪神TB特注: 芝短距離のハイペースを突く外枠差し");
                }
            }
            // ==========================================
            // 【新設】阪神開催・オッズ×騎手×前走成績の歪み狙いプロトコル
            // ==========================================
            var isHanshinTopJockey = ['川田', '坂井', '武豊', 'ルメール'].some(function (j) { return jockey.includes(j); });
            var isHanshinYoungJockey = ['吉村', '西塚', '田口', '永島', '古川奈', '今村'].some(function (j) { return jockey.includes(j); });
            var isHanshinGeneralJockey = !isHanshinTopJockey && !isHanshinYoungJockey;
            var isTopPop = popularity >= 1 && popularity <= 3;
            var isMidPop = popularity >= 4 && popularity <= 7;
            if (prevRaceData) {
                var isPrevGood = prevRaceData.result >= 1 && prevRaceData.result <= 3;
                var isPrevBad = prevRaceData.result >= 4;
                var isPrevTerrible = prevRaceData.result >= 10;
                // 1. 【鉄板軸馬】「トップ騎手」×「上位人気」×「前走好走」
                if (isHanshinTopJockey && isTopPop && isPrevGood) {
                    // [減点方式] potential += 20;
                    tags.push("🎯 阪神鉄板: トップ騎手×上位人気×前走好走の勝負気配");
                }
                // 4. 【過信禁物】「トップ騎手」×「中位人気」×「前走好走」
                if (isHanshinTopJockey && isMidPop && isPrevGood) {
                    potential -= 30; // 何らかの不安要素あり
                    tags.push("⚠️ 阪神危険: トップ騎手で前走好走なのにオッズが甘い(過信禁物)");
                }
                // 2. 【オッズ妙味・勝ち切り】「減量・若手騎手」×「上位〜中位人気」×「前走好走」
                if (isHanshinYoungJockey && (isTopPop || isMidPop) && isPrevGood) {
                    /* [減点方式] potential += 45; */ // 期待値が高いため強めに加点
                    tags.push("🔥 阪神妙味: 若手・減量騎手×前走好走の期待値大(勝ち切り注意)");
                }
                // 3. 【隠れ勝負気配】「一般・中堅騎手」×「上位人気」×「前走大敗・中位」
                if (isHanshinGeneralJockey && isTopPop && isPrevBad) {
                    /* [減点方式] potential += 50; */ // オッズの歪み（インサイダー情報等）を突く
                    tags.push("🔥 阪神勝負: 前走大敗なのに今回上位人気の隠れ勝負気配");
                    if (isPrevTerrible) {
                        /* [減点方式] potential += 10; */ // 二桁着順からの巻き返しは更に妙味
                        tags.push("🌟 阪神激アツ: 前走二桁着順からの不可解な上位人気");
                    }
                }
            }
            // ==========================================
            // 【新設】阪神開催・年齢別馬体重（成長度・仕上がり）プロトコル
            // ==========================================
            if (age === 3) {
                if (weightChange >= 8) {
                    // [減点方式] potential += 35;
                    tags.push("🔥 阪神馬体重: 3歳馬の大幅プラス(成長分として高く評価)");
                }
                else if (weightChange <= 0 && weightChange >= -4) {
                    // [減点方式] potential += 15;
                    tags.push("👍 阪神馬体重: 3歳馬の維持・マイナス(仕上がり良し)");
                }
            }
            else if (age >= 4) {
                if (weightChange >= -4 && weightChange <= 4) {
                    // [減点方式] potential += 30;
                    tags.push("👑 阪神馬体重: 古馬の微増減(ベスト体重での仕上がり鉄板)");
                }
                else if (weightChange >= 8) {
                    potential -= 30;
                    tags.push("⚠️ 阪神馬体重: 古馬の大幅プラス(太め残り・調整不足の懸念)");
                }
            }
            // ==========================================
            // 【新設】阪神開催・馬場状態×血統（血統の逆転現象）プロトコル
            // ==========================================
            // 血統タイプのカテゴライズ
            var isMainstreamTurf = ['キズナ', 'キタサンブラック', 'ジャスタウェイ', 'リオンディーズ', 'コントレイル'].some(function (s) { return (horse.sire || '').includes(s); });
            var isUSDirt = ['パイロ', 'ドレフォン', 'シニスターミニスター', 'ナダル'].some(function (s) { return (horse.sire || '').includes(s); });
            var isDualPower = ['マインドユアビスケッツ', 'ブリックスアンドモルタル'].some(function (s) { return (horse.sire || '').includes(s); });
            var isGoodTrack = race.trackCondition === '良';
            var isYieldingOrSoft = race.trackCondition === '稍重' || race.trackCondition === '重' || race.trackCondition === '不良';
            if (race.surface === 'ダート') {
                if (isGoodTrack && isUSDirt) {
                    // [減点方式] potential += 25;
                    tags.push("👑 阪神血統: ダート良馬場は米国型パワー血統の独壇場");
                }
                else if (isYieldingOrSoft && isMainstreamTurf) {
                    /* [減点方式] potential += 45; */ // 穴馬サインとして高く評価
                    tags.push("🌟 阪神激アツ: ダート渋り馬場での芝主流血統(ダートの芝化・穴馬サイン)");
                }
            }
            else if (race.surface === '芝') {
                if (isGoodTrack && isMainstreamTurf) {
                    // [減点方式] potential += 20;
                    tags.push("🎯 阪神血統: 芝良馬場は順当に王道スピード血統");
                }
                else if (isYieldingOrSoft && isDualPower) {
                    /* [減点方式] potential += 40; */ // 穴馬サインとして高く評価
                    tags.push("🔥 阪神激アツ: 芝渋り馬場でのダート兼用パワー血統(タフ馬場適性)");
                }
            }
            // ==========================================
            // 【新設】阪神特化・究極ナレッジデータ 統合フラグ判定
            // ==========================================
            // 【統合】的中率特化フラグ（※1）
            // 条件: 内〜中枠(1〜5枠) × 前走好走(3着以内) × 上位人気(1〜3番人気) × トップ騎手or減量若手
            if (frame <= 5 && prevRaceData && prevRaceData.result <= 3 && popularity <= 3) {
                var isTopOrYoungJockey = ['ルメール', '川田', '武豊', '松山', 'モレイラ', '岩田望'].some(function (j) { return jockey.includes(j); }) ||
                    jockey.includes('▲') || jockey.includes('☆') || jockey.includes('△') || jockey.includes('★');
                if (isTopOrYoungJockey) {
                    // [減点方式] potential += 50;
                    tags.push("🎯 【統合】的中率特化: 鉄板条件コンプリート(勝率極大)");
                }
            }
            // 【統合】回収率特化フラグ（※2）
            // 条件: 前走中位・大敗(4着以下) × 今回上位人気(1〜3番人気)
            if (prevRaceData && prevRaceData.result >= 4 && popularity <= 3) {
                // [減点方式] potential += 50;
                tags.push("💰 【統合】回収率特化: 前走凡走からの不自然な上位人気(陣営の隠れ勝負気配)");
            }
        }
        // ==========================================
        // 【追加】函館マニアック特化プロトコル（ニッチな高回収率ロジック）
        // ==========================================
        if (trackName.includes('函館')) {
            // マニアック1: 100%洋芝専用機「欧州型重戦車ブラッドの覚醒」
            if (race.surface === '芝') {
                var isEuroPower = ['ハービンジャー', 'バゴ', 'フランケル', 'キングカメハメハ', 'ルーラーシップ', 'ワークフォース', 'ノヴェリスト'].some(function (s) { return (horse.sire || '').includes(s); });
                if (isEuroPower) {
                    // [減点方式] potential += 40;
                    tags.push("🔥 函館芝特注: 時計のかかる重厚な洋芝で覚醒する欧州型パワー血統");
                }
            }
            // マニアック2: 函館ダート1000m専用「最内枠のロケットスタート」
            if (race.surface === 'ダート' && dist === 1000 && frame <= 2 && (horse.style === '逃げ' || horse.style === '先行')) {
                // [減点方式] potential += 45;
                tags.push("🔥 函館D1000特注: 最初のコーナーまでの短さを活かす最内枠ロケットスタート");
            }
            // マニアック3: 滞在競馬の恩恵「夏は牝馬（ストレスフリー理論）」
            if (gender === '牝') {
                // [減点方式] potential += 20;
                // [要見直し2] tags.push("🔥 函館特注: 長距離輸送のストレスがない滞在競馬で躍動する牝馬");
            }
            // マニアック4: 洋芝リンク理論「本州惨敗からの札幌・函館リンク」
            if (prevRaceData && !((_h = prevRaceData.venue) === null || _h === void 0 ? void 0 : _h.match(/(函館|札幌)/)) && prevRaceData.result >= 4) {
                var hasHokkaidoRecord = (_j = horse.pastRaces) === null || _j === void 0 ? void 0 : _j.some(function (pr) { var _a; return ((_a = pr.venue) === null || _a === void 0 ? void 0 : _a.match(/(函館|札幌)/)) && pr.result <= 3; });
                if (hasHokkaidoRecord) {
                    // [減点方式] potential += 45;
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
                    // [減点方式] potential += 50;
                    tags.push("🔥 新潟千直特注: 荒れていない外ラチ沿いを走れる大外枠の絶対神");
                }
                else if (frame <= 2) {
                    potential -= 30; // 内枠は圧倒的不利
                }
            }
            // マニアック2: 日本最長659mの直線「究極の上がり最速・大外一気」
            if (race.surface === '芝' && dist > 1400) {
                if (horse.style === '差し' || horse.style === '追込') {
                    if (prevRaceData && prevRaceData.last3fTime) {
                        var prevLast3f = parseFloat(prevRaceData.last3fTime);
                        if (!isNaN(prevLast3f) && prevLast3f <= 33.5) {
                            // [減点方式] potential += 40;
                            tags.push("🔥 新潟外回り特注: 日本最長の直線を大外一気で突き抜ける鬼脚");
                        }
                    }
                }
            }
            // マニアック3: 平坦サウスポー「急坂右回りからの平坦左回り替わり」
            if (prevRaceData && ((_k = prevRaceData.venue) === null || _k === void 0 ? void 0 : _k.match(/(中山|阪神)/)) && prevRaceData.result >= 4) {
                var hasFlatSouthpawRecord = (_l = horse.pastRaces) === null || _l === void 0 ? void 0 : _l.some(function (pr) { var _a; return ((_a = pr.venue) === null || _a === void 0 ? void 0 : _a.match(/(新潟|中京|東京)/)) && pr.result <= 3; });
                if (hasFlatSouthpawRecord) {
                    // [減点方式] potential += 35;
                    tags.push("🔥 新潟特注: 急坂右回り惨敗からの平坦左回り替わり(サウスポー)");
                }
            }
            // マニアック4: 新潟ダート1200m専用「テンの速さ至上主義（内枠逃げ）」
            if (race.surface === 'ダート' && dist === 1200) {
                if (frame <= 3 && horse.style === '逃げ') {
                    // [減点方式] potential += 40;
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
                var isStayGold = ['ステイゴールド', 'オルフェーヴル', 'ゴールドシップ', 'ナカヤマフェスタ', 'ドリームジャーニー'].some(function (s) { return (horse.sire || '').includes(s); });
                if (isStayGold) {
                    // [減点方式] potential += 45;
                    tags.push("🔥 福島芝特注: 小回りで長く良い脚を持続させるステイゴールド系(マクリ)");
                }
            }
            // マニアック2: 荒れ馬場の洋芝リンク「北海道実績馬の降臨」
            if (race.surface === '芝' && ['稍重', '重', '不良'].includes(condition)) {
                var hasHokkaidoRecord = (_m = horse.pastRaces) === null || _m === void 0 ? void 0 : _m.some(function (pr) { var _a; return ((_a = pr.venue) === null || _a === void 0 ? void 0 : _a.match(/(函館|札幌)/)) && pr.result <= 3; });
                if (hasHokkaidoRecord) {
                    // [減点方式] potential += 35;
                    tags.push("🔥 福島特注: 荒れて時計のかかる馬場で覚醒する洋芝(北海道)適性馬");
                }
            }
            // マニアック3: 福島ダート1150m専用「芝スタート×スピード絶対主義」
            if (race.surface === 'ダート' && dist === 1150) {
                if (frame >= 6 && horse.style === '逃げ') {
                    // [減点方式] potential += 40;
                    tags.push("🔥 福島D1150特注: 芝スタートを活かしてハナを奪いきる外枠の逃げ馬");
                }
            }
            // マニアック4: 小回りの先行力「内枠・逃げ先行のインベタ」
            if (frame <= 3 && (horse.style === '逃げ' || horse.style === '先行')) {
                // [減点方式] potential += 30;
                tags.push("🔥 福島特注: コーナーのキツい小回りをロスなく立ち回る内枠先行馬");
            }
        }
        // ==========================================
        // 【追加】中山マニアック特化プロトコル（ニッチな高回収率ロジック）
        // ==========================================
        if (trackName.includes('中山')) {
            // マニアック1: 東京からの大逆転「スピード負けからの急坂パワー替わり」
            if (prevRaceData && ((_o = prevRaceData.venue) === null || _o === void 0 ? void 0 : _o.includes('東京')) && prevRaceData.result >= 4) {
                var isPowerSire = ['キズナ', 'エピファネイア', 'ルーラーシップ', 'ハービンジャー', 'モーリス', 'スクリーンヒーロー'].some(function (s) { return (horse.sire || '').includes(s); });
                if (isPowerSire) {
                    // [減点方式] potential += 45;
                    tags.push("🔥 中山特注: 東京(直線キレ負け)からの急坂パワー替わり大逆転");
                }
            }
            // マニアック2: 中山ダート1200m専用「芝スタート・急坂下り×大外枠の暴力」
            if (race.surface === 'ダート' && dist === 1200) {
                if (frame >= 7 && (horse.style === '逃げ' || horse.style === '先行')) {
                    // [減点方式] potential += 45;
                    tags.push("🔥 中山D1200特注: 芝スタートの急坂下りを活かして制圧する大外枠");
                }
            }
            // マニアック3: 冬の中山・荒れ馬場専用「ロベルト系の無双」
            if (race.surface === '芝' && ['稍重', '重', '不良'].includes(condition)) {
                var isRoberto = ['エピファネイア', 'スクリーンヒーロー', 'モーリス', 'シンボリクリスエス', 'ストロングリターン'].some(function (s) { return (horse.sire || '').includes(s) || (horse.bms || '').includes(s); });
                if (isRoberto) {
                    // [減点方式] potential += 40;
                    tags.push("🔥 中山荒れ馬場特注: 時計のかかるタフな馬場で他を圧倒するロベルト系");
                }
            }
            // マニアック4: 中山芝2500m（有馬記念）専用「内枠絶対主義×非根幹適性」
            if (race.surface === '芝' && dist === 2500) {
                if (frame <= 3) {
                    var isNonRootStamina = ['ステイゴールド', 'オルフェーヴル', 'ゴールドシップ', 'エピファネイア', 'スクリーンヒーロー'].some(function (s) { return (horse.sire || '').includes(s); });
                    if (isNonRootStamina) {
                        // [減点方式] potential += 45;
                        tags.push("🔥 中山2500特注: コーナー6回をロスなく回る内枠と非根幹スタミナ");
                    }
                }
            }
        }
        // ==========================================
        // 【追加】残り4競馬場マニアック特化プロトコル（京都・中京・札幌・小倉）
        // ==========================================
        // 【京都】平坦と淀の坂の魔術師
        if (trackName.includes('京都')) {
            // マニアック1: 下り坂の魔術師（ディープ系・スピード）
            if (race.surface === '芝') {
                var isKyotoMaster = ['ディープインパクト', 'キタサンブラック', 'ロードカナロア', 'ダイワメジャー'].some(function (s) { return (horse.sire || '').includes(s); });
                if (isKyotoMaster && (horse.style === '先行' || horse.style === '差し')) {
                    // [減点方式] potential += 40;
                    tags.push("🔥 京都芝特注: 淀の下り坂を利用して末脚を伸ばす京都巧者");
                }
            }
            // マニアック2: 急坂負けからの平坦スピード替わり
            if (prevRaceData && ((_p = prevRaceData.venue) === null || _p === void 0 ? void 0 : _p.match(/(中山|阪神)/)) && prevRaceData.result >= 4) {
                if (weight <= 480) { // 比較的軽い馬（スピード型）
                    // [減点方式] potential += 40;
                    tags.push("🔥 京都特注: 急坂パワー負けからの平坦スピード勝負替わり");
                }
            }
            // マニアック3: 京都ダート1800m特注（内枠逃げ先行）
            if (race.surface === 'ダート' && dist === 1800 && frame <= 3 && (horse.style === '逃げ' || horse.style === '先行')) {
                // [減点方式] potential += 35;
                tags.push("🔥 京都D1800特注: 平坦ダートをロスなく立ち回る内枠先行馬");
            }
        }
        // 【中京】左回り×急坂の特殊サウスポー
        if (trackName.includes('中京')) {
            // マニアック1: サウスポーのパワー型
            var hasSouthpawRecord = (_q = horse.pastRaces) === null || _q === void 0 ? void 0 : _q.some(function (pr) { var _a; return ((_a = pr.venue) === null || _a === void 0 ? void 0 : _a.match(/(東京|新潟)/)) && pr.result <= 3; });
            if (hasSouthpawRecord) {
                var isPower = ['キングカメハメハ', 'ルーラーシップ', 'エピファネイア', 'ハービンジャー'].some(function (s) { return (horse.sire || '').includes(s); }) || weight >= 500;
                if (isPower) {
                    // [減点方式] potential += 45;
                    tags.push("🔥 中京特注: 左回りが得意なパワー型(急坂対応サウスポー)");
                }
            }
            // マニアック2: 中京ダート1400m（芝スタート・外枠優位）
            if (race.surface === 'ダート' && dist === 1400 && frame >= 6 && horse.style === '逃げ') {
                // [減点方式] potential += 40;
                tags.push("🔥 中京D1400特注: 芝スタートの恩恵をフルに受ける外枠逃げ馬");
            }
        }
        // 【札幌】コーナー加速の洋芝マクリ
        if (trackName.includes('札幌')) {
            // マニアック1: 洋芝マクリ（コーナー加速）
            if (race.surface === '芝' && horse.style === 'マクリ') {
                // [減点方式] potential += 45;
                tags.push("🔥 札幌芝特注: 直線がほぼ無い丸いコースを制圧するコーナーマクリ");
            }
            // マニアック2: 函館からの洋芝完全リンク
            if (prevRaceData && ((_r = prevRaceData.venue) === null || _r === void 0 ? void 0 : _r.includes('函館')) && prevRaceData.result <= 3) {
                // [減点方式] potential += 35;
                tags.push("🔥 札幌特注: 函館好走からの洋芝完全リンク(北海道滞在)");
            }
            // マニアック3: 滞在競馬の牝馬
            if (gender === '牝') {
                // [減点方式] potential += 20;
                tags.push("🔥 札幌特注: 長距離輸送のストレスがない滞在競馬で躍動する牝馬");
            }
        }
        // 【小倉】超高速馬場のスピード至上主義
        if (trackName.includes('小倉')) {
            // マニアック1: 小倉芝1200mの絶対的テンの速さ
            if (race.surface === '芝' && dist === 1200 && frame <= 3 && horse.style === '逃げ') {
                // [減点方式] potential += 45;
                tags.push("🔥 小倉芝1200特注: 超高速馬場を最短距離で逃げ切る内枠スプリンター");
            }
            // マニアック2: 夏の滞在牝馬
            if (gender === '牝') {
                // [減点方式] potential += 20;
                tags.push("🔥 小倉特注: 小倉滞在競馬でストレスなく走れる牝馬");
            }
            // マニアック3: 急坂負けからの平坦スピード替わり
            if (prevRaceData && ((_s = prevRaceData.venue) === null || _s === void 0 ? void 0 : _s.match(/(中山|阪神)/)) && prevRaceData.result >= 4) {
                // [減点方式] potential += 40;
                tags.push("🔥 小倉特注: 急坂パワー負けからの平坦超高速馬場替わり");
            }
        }
        // ==========================================
        // 【追加】宝塚記念（阪神2200m・グランプリ）特化プロトコル
        // ==========================================
        var isTakarazukaKinen = trackName.includes('阪神') && race.raceName && race.raceName.includes('宝塚記念');
        if (isTakarazukaKinen) {
            // 宝塚特注1: 梅雨の非根幹タフネス（ステイゴールド系・ロベルト系・欧州系 × 牝馬）
            var isToughSire = ['ステイゴールド', 'オルフェーヴル', 'ゴールドシップ', 'ナカヤマフェスタ', 'バゴ', 'ルーラーシップ', 'エピファネイア', 'スクリーンヒーロー', 'モーリス', 'ハービンジャー'].some(function (s) { return (horse.sire || '').includes(s); });
            if (isToughSire) {
                // [減点方式] potential += 40;
                tags.push("👑 宝塚特注: 梅雨の荒れ馬場に強いタフネス血統");
                if (gender === '牝') {
                    // [減点方式] potential += 20;
                    tags.push("👑 宝塚特注: 荒れ馬場・非根幹距離で覚醒する牝馬 (+20)");
                }
            }
            // 宝塚特注2: グランプリ適性（阪神内回り・中山の好走実績）
            var hasGrandPrixExp = (_t = horse.pastRaces) === null || _t === void 0 ? void 0 : _t.some(function (pr) {
                var _a, _b;
                return (pr.venue.includes('阪神') || pr.venue.includes('中山')) &&
                    pr.distance >= 2000 && pr.result <= 3 && (((_a = pr.raceClass) === null || _a === void 0 ? void 0 : _a.match(/G[12]/i)) || ((_b = pr.raceName) === null || _b === void 0 ? void 0 : _b.match(/G[12]/i)));
            });
            if (hasGrandPrixExp) {
                // [減点方式] potential += 35;
                tags.push("👑 宝塚特注: 阪神・中山で証明済みの小回りグランプリ適性");
            }
            // 宝塚特注3: スタミナ証明（前走・天皇賞春組からの距離短縮）
            if (((_u = prevRaceData === null || prevRaceData === void 0 ? void 0 : prevRaceData.raceName) === null || _u === void 0 ? void 0 : _u.includes('天皇賞')) && (prevRaceData === null || prevRaceData === void 0 ? void 0 : prevRaceData.distance) >= 3000) {
                // [減点方式] potential += 30;
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
        var isHanshinStakes = trackName.includes('阪神') && race.raceName && race.raceName.match(/G[1-3I-III]/i);
        if (isHanshinStakes) {
            // 阪神重賞1: 川田将雅の庭（阪神重賞×川田×上位人気）
            if (jockey.includes('川田') && popularity <= 3) {
                // [減点方式] potential += 40;
                tags.push("👑 阪神特注: 阪神重賞における川田将雅の鉄板騎乗");
            }
            // 阪神重賞2: 外回り（1600m・2400m）の鬼脚と王道血統（桜花賞・阪神JF等）
            if (dist === 1600 || dist === 2400) {
                var isHanshinOuterSire = ['ディープインパクト', 'キズナ', 'エピファネイア', 'ロードカナロア', 'ドゥラメンテ'].some(function (s) { return (horse.sire || '').includes(s); });
                if (isHanshinOuterSire && prevRaceData && parseFloat(prevRaceData.last3fTime || '99') <= 34.0) {
                    // [減点方式] potential += 45;
                    tags.push("👑 阪神特注: 外回りコース特有の究極の瞬発力と王道血統");
                }
            }
            // 阪神重賞3: 内回り（2000m・2200m）の先行力（大阪杯など）
            if (dist === 2000 || dist === 2200) {
                if ((horse.style === '逃げ' || horse.style === '先行') && frame <= 5) {
                    // [減点方式] potential += 35;
                    tags.push("👑 阪神特注: ごまかしの利かない内回り重賞での内枠先行力");
                }
            }
            // 阪神重賞4: 急坂マイスター（阪神・中山での重賞実績）
            var hasHillExp = (_v = horse.pastRaces) === null || _v === void 0 ? void 0 : _v.some(function (pr) {
                var _a, _b;
                return (pr.venue.includes('阪神') || pr.venue.includes('中山')) &&
                    pr.result <= 3 && (((_a = pr.raceClass) === null || _a === void 0 ? void 0 : _a.match(/G[1-3]/i)) || ((_b = pr.raceName) === null || _b === void 0 ? void 0 : _b.match(/G[1-3I-III]/i)));
            });
            if (hasHillExp) {
                // [減点方式] potential += 30;
                tags.push("👑 阪神特注: ゴール前の急坂を苦にしないパワーと実績");
            }
        }
        // ==========================================
        // 【追加】中山重賞特化プロトコル（機動力と急坂パワーの極み）
        // ==========================================
        var isNakayamaStakes = trackName.includes('中山') && race.raceName && race.raceName.match(/G[1-3I-III]/i);
        if (isNakayamaStakes) {
            // 中山重賞1: 究極の小回りアドバンテージ（内枠×逃げ先行）
            if (frame <= 4 && (horse.style === '逃げ' || horse.style === '先行')) {
                // [減点方式] potential += 35;
                tags.push("👑 中山特注: 短い直線と急坂を味方につける内枠先行絶対有利");
            }
            // 中山重賞2: ステイ・ロベルトの庭（急坂・小回り特化血統）
            var isNakayamaSire = ['ステイゴールド', 'オルフェーヴル', 'ゴールドシップ', 'スクリーンヒーロー', 'エピファネイア', 'モーリス', 'バゴ', 'ルーラーシップ'].some(function (s) { return (horse.sire || '').includes(s); });
            if (isNakayamaSire) {
                // [減点方式] potential += 40;
                tags.push("👑 中山特注: 中山重賞で無類の強さを誇るパワー＆タフネス血統");
            }
            // 中山重賞3: ローカル・小回り巧者の下剋上（ローカル競馬場での好走実績）
            // 福島・小倉などの小回りコースで勝てる馬は、コーナーを加速しながら回る「機動力（まくり）」がある
            var hasLocalExp = (_w = horse.pastRaces) === null || _w === void 0 ? void 0 : _w.some(function (pr) {
                return ['福島', '小倉', '函館', '札幌'].some(function (t) { return pr.venue.includes(t); }) && pr.result <= 2;
            });
            if (hasLocalExp && (horse.style === '先行' || horse.style === '差し')) {
                // [減点方式] potential += 30;
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
        var isHakodateStakes = trackName.includes('函館') && race.raceName && race.raceName.match(/G[1-3I-III]/i);
        if (isHakodateStakes) {
            // 函館重賞1: 100%洋芝適性（欧州・パワー型血統）
            var isYoshibaSire = ['ハービンジャー', 'バゴ', 'ルーラーシップ', 'キングカメハメハ', 'クロフネ', 'ヘニーヒューズ', 'ステイゴールド', 'フランケル', 'Frankel', 'ロベルト'].some(function (s) { return (horse.sire || '').includes(s); });
            if (isYoshibaSire) {
                // [減点方式] potential += 40;
                tags.push("👑 函館特注: 重い洋芝をパワーでねじ伏せる欧州・タフネス血統");
            }
            // 函館重賞2: 日本一短い直線の絶対法則（逃げ・先行）
            if (horse.style === '逃げ' || horse.style === '先行') {
                // [減点方式] potential += 35;
                tags.push("👑 函館特注: JRA最短の直線(262m)を活かす絶対的な前残り");
            }
            // 函館重賞3: 北海道マイスター（函館・札幌での好走実績）
            var hasHokkaidoExp = (_x = horse.pastRaces) === null || _x === void 0 ? void 0 : _x.some(function (pr) {
                return (pr.venue.includes('函館') || pr.venue.includes('札幌')) && pr.result <= 3;
            });
            if (hasHokkaidoExp) {
                // [減点方式] potential += 30;
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
        var isKokuraStakes = trackName.includes('小倉') && race.raceName && race.raceName.match(/G[1-3I-III]/i);
        if (isKokuraStakes) {
            // 小倉重賞1: 超高速野芝の絶対スピード（スプリント・スピード血統）
            var isKokuraSpeedSire = ['ロードカナロア', 'ビッグアーサー', 'ミッキーアイル', 'ダイワメジャー', 'キンシャサノキセキ', 'ディープインパクト', 'サクラバクシンオー', 'ファインニードル', 'マクフィ'].some(function (s) { return (horse.sire || '').includes(s); });
            if (isKokuraSpeedSire) {
                // [減点方式] potential += 40;
                tags.push("👑 小倉特注: 超高速馬場に適合する絶対的なスピード血統");
            }
            // 小倉重賞2: 平坦・小回りの逃げ切り（テンの速さと内枠先行）
            if (frame <= 5 && (horse.style === '逃げ' || horse.style === '先行')) {
                // [減点方式] potential += 35;
                tags.push("👑 小倉特注: 小回り＆平坦コースでの止まらない逃げ・先行");
            }
            // 小倉重賞3: 軽量馬の平坦コース無双（軽斤量の恩恵）
            // 小倉記念や北九州記念などハンデ戦が多い。平坦なため軽い馬がスイスイ走る
            if (kinryo <= 53 && horse.gender === '牝') {
                // [減点方式] potential += 30;
                tags.push("👑 小倉特注: 坂のない平坦コースで躍動する軽斤量の牝馬");
            }
            else if (kinryo <= 54) {
                // [減点方式] potential += 20;
                tags.push("👑 小倉特注: 平坦コースの軽斤量アドバンテージ");
            }
            // 小倉重賞4: 小倉巧者のリピーター（過去の小倉実績）
            var hasKokuraExp = (_y = horse.pastRaces) === null || _y === void 0 ? void 0 : _y.some(function (pr) {
                return pr.venue.includes('小倉') && pr.result <= 3;
            });
            if (hasKokuraExp) {
                // [減点方式] potential += 30;
                tags.push("👑 小倉特注: 独特の高速小回りコースに対する完全なコース適性");
            }
        }
        // ==========================================
        // 【追加】京都重賞特化プロトコル（淀の坂越えと超高速馬場の適性）
        // ==========================================
        var isKyotoStakes = trackName.includes('京都') && race.raceName && race.raceName.match(/G[1-3I-III]/i);
        if (isKyotoStakes) {
            // 京都重賞1: 淀の申し子（超高速馬場と下り坂に適合する王道血統）
            // ディープ系やハーツクライ系など、下り坂から惰性でキレる血統
            var isKyotoSire = ['ディープインパクト', 'キズナ', 'コントレイル', 'ハーツクライ', 'スワーヴリチャード', 'ダイワメジャー', 'エピファネイア', 'ジャスタウェイ'].some(function (s) { return (horse.sire || '').includes(s); });
            if (isKyotoSire) {
                // [減点方式] potential += 40;
                tags.push("👑 京都特注: 淀の軽い芝に完璧に適合する究極のスピード・キレ血統");
            }
            // 京都重賞2: 坂の下り適性（京都好走実績 ＋ 優れた上がりタイム）
            var hasKyotoAgility = (_z = horse.pastRaces) === null || _z === void 0 ? void 0 : _z.some(function (pr) {
                return pr.venue.includes('京都') && pr.result <= 3 && parseFloat(pr.last3fTime || '99') <= 34.5;
            });
            if (hasKyotoAgility) {
                // [減点方式] potential += 35;
                tags.push("👑 京都特注: 3コーナーの「淀の坂」を器用に下るバランスとコース実績");
            }
            // 京都重賞3: 長距離G1の絶対セオリー（天皇賞春・菊花賞の内枠ロスなし）
            if (dist >= 3000 && frame <= 4) {
                // [減点方式] potential += 45;
                tags.push("👑 京都特注: 3000m超えの長距離戦における『内枠』の絶対的スタミナ温存有利");
            }
            // 京都重賞4: 外回りの究極の斬れ味（外回りコースの差し・追込）
            // 京都外回り（1600, 1800, 2200, 2400, 3000, 3200）は平坦な直線を長く使える
            var isOuterCourseDist = [1600, 1800, 2200, 2400, 3000, 3200].includes(dist);
            if (isOuterCourseDist && (horse.style === '差し' || horse.style === '追込') && isKyotoSire) {
                // [減点方式] potential += 30;
                tags.push("👑 京都特注: 平坦な長い直線で爆発する『外回り特化の末脚』");
            }
        }
        // ==========================================
        // 【追加】新潟重賞特化プロトコル（日本一長い直線と千直の攻略）
        // ==========================================
        var isNiigataStakes = trackName.includes('新潟') && race.raceName && race.raceName.match(/G[1-3I-III]/i);
        if (isNiigataStakes) {
            // 新潟重賞1: 千直の絶対法則（1000m直線の大外枠）
            // アイビスサマーダッシュなど、千直はラチ沿いを走れる大外枠が圧倒的有利
            if (dist === 1000 && frame >= 7) {
                // [減点方式] potential += 50;
                tags.push("👑 新潟特注: 千直(1000m)における大外枠(7〜8枠)の絶対的アドバンテージ");
            }
            // 新潟重賞2: 日本一長い直線の鬼脚（上がり33秒台前半の実績）
            // 外回り（1600m・2000m）は直線が659mあり、究極の瞬発力と持続力が問われる
            if ((dist === 1600 || dist === 2000) && prevRaceData && parseFloat(prevRaceData.last3fTime || '99') <= 33.5) {
                // [減点方式] potential += 45;
                tags.push("👑 新潟特注: 日本一長い直線(659m)で爆発する究極の瞬発力(上がり33秒台前半)");
            }
            // 新潟重賞3: 平坦・長直線のスピード血統
            var isNiigataSire = ['ディープインパクト', 'キズナ', 'ハーツクライ', 'スワーヴリチャード', 'エピファネイア', 'ロードカナロア', 'リアルスティール', 'サトノダイヤモンド'].some(function (s) { return (horse.sire || '').includes(s); });
            if (isNiigataSire && dist > 1000) {
                // [減点方式] potential += 35;
                tags.push("👑 新潟特注: 長い直線と平坦コースに完璧に適合するスピード血統");
            }
            // 新潟重賞4: 新潟巧者（過去の新潟好走実績）
            var hasNiigataExp = (_0 = horse.pastRaces) === null || _0 === void 0 ? void 0 : _0.some(function (pr) {
                return pr.venue.includes('新潟') && pr.result <= 3;
            });
            if (hasNiigataExp) {
                // [減点方式] potential += 30;
                tags.push("👑 新潟特注: 独特の左回り超ロング直線に対するコース適性の証明");
            }
        }
        // ==========================================
        // 【追加】札幌重賞特化プロトコル（大回り・平坦の100%洋芝）
        // ==========================================
        var isSapporoStakes = trackName.includes('札幌') && race.raceName && race.raceName.match(/G[1-3I-III]/i);
        if (isSapporoStakes) {
            // 札幌重賞1: 100%洋芝適性（欧州・タフネス血統）
            var isYoshibaSire = ['ハービンジャー', 'バゴ', 'ルーラーシップ', 'キングカメハメハ', 'クロフネ', 'スクリーンヒーロー', 'ステイゴールド', 'ゴールドシップ', 'オルフェーヴル'].some(function (s) { return (horse.sire || '').includes(s); });
            if (isYoshibaSire) {
                // [減点方式] potential += 40;
                tags.push("👑 札幌特注: 力のいる洋芝をねじ伏せる欧州・タフネス血統");
            }
            // 札幌重賞2: 大回り・平坦コースの持続力（コーナーでの機動力）
            // 札幌は函館と違い、コーナーが大きくて緩やかなため、外から長く良い脚を使う「マクリ」や「差し」が決まりやすい
            if (horse.style === '差し' && isYoshibaSire) {
                // [減点方式] potential += 35;
                tags.push("👑 札幌特注: 大きなコーナーで失速しない洋芝適性馬の長く良い脚（マクリ・差し）");
            }
            else if (horse.style === '先行') {
                // [減点方式] potential += 20;
                tags.push("👑 札幌特注: 大回り平坦コースでしぶとく粘り込む先行力");
            }
            // 札幌重賞3: 北海道マイスター（函館・札幌での好走実績）
            var hasHokkaidoExp = (_1 = horse.pastRaces) === null || _1 === void 0 ? void 0 : _1.some(function (pr) {
                return (pr.venue.includes('函館') || pr.venue.includes('札幌')) && pr.result <= 3;
            });
            if (hasHokkaidoExp) {
                // [減点方式] potential += 30;
                tags.push("👑 札幌特注: 特殊な100%洋芝環境（北海道）に対する完全な適性証明");
            }
            // 札幌重賞4: スーパーG2の格の違い（札幌記念のG1実績馬）
            // 札幌記念(G2)は秋のG1を見据えた超一級馬が集まるため、過去にG1で5着以内の実績がある馬が地力の違いを見せる
            var isSapporoKinen = race.raceName.includes('札幌記念');
            var hasG1Class = (_2 = horse.pastRaces) === null || _2 === void 0 ? void 0 : _2.some(function (pr) { var _a, _b; return (((_a = pr.raceClass) === null || _a === void 0 ? void 0 : _a.match(/G[1I]/i)) || ((_b = pr.raceName) === null || _b === void 0 ? void 0 : _b.match(/G[1I]/i))) && pr.result <= 5; });
            if (isSapporoKinen && hasG1Class) {
                // [減点方式] potential += 45;
                tags.push("👑 札幌特注: スーパーG2(札幌記念)における『G1級』の絶対的な地力の違い");
            }
        }
        // ==========================================
        // 【追加】中京重賞特化プロトコル（左回りのタフな直線と内枠先行）
        // ==========================================
        var isChukyoStakes = trackName.includes('中京') && race.raceName && race.raceName.match(/G[1-3I-III]/i);
        if (isChukyoStakes) {
            // 中京重賞1: 魔の左回り・タフネス血統（坂と長い直線に耐えるパワー）
            var isChukyoSire = ['キングカメハメハ', 'ロードカナロア', 'エピファネイア', 'モーリス', 'ルーラーシップ', 'ハーツクライ', 'ドゥラメンテ'].some(function (s) { return (horse.sire || '').includes(s); });
            if (isChukyoSire) {
                // [減点方式] potential += 35;
                tags.push("👑 中京特注: 長い直線と急坂を耐え抜くタフなパワー系血統");
            }
            // 中京重賞2: 中京の絶対セオリー（内枠・先行有利）
            // 直線は長いが、馬場が渋ったりコーナーの形状上、内枠の逃げ先行が非常に残る
            if (frame <= 4 && (horse.style === '逃げ' || horse.style === '先行')) {
                // [減点方式] potential += 40;
                tags.push("👑 中京特注: コース形状がもたらす『内枠×先行』の絶対的有利");
            }
            // 中京重賞3: 左回りマイスター（東京・中京・新潟の実績）
            var hasLeftTurnExp = (_3 = horse.pastRaces) === null || _3 === void 0 ? void 0 : _3.some(function (pr) {
                return (pr.venue.includes('東京') || pr.venue.includes('中京') || pr.venue.includes('新潟')) && pr.result <= 3;
            });
            if (hasLeftTurnExp) {
                // [減点方式] potential += 30;
                tags.push("👑 中京特注: ごまかしの利かない左回りコースの好走実績");
            }
        }
        // ==========================================
        // 【追加】福島重賞特化プロトコル（極限の小回りと機動力）
        // ==========================================
        var isFukushimaStakes = trackName.includes('福島') && race.raceName && race.raceName.match(/G[1-3I-III]/i);
        if (isFukushimaStakes) {
            // 福島重賞1: ローカル小回りの鬼（ステイゴールド・ロベルト系）
            var isFukushimaSire = ['ステイゴールド', 'オルフェーヴル', 'ゴールドシップ', 'スクリーンヒーロー', 'エピファネイア', 'ナカヤマフェスタ'].some(function (s) { return (horse.sire || '').includes(s); });
            if (isFukushimaSire) {
                // [減点方式] potential += 40;
                tags.push("👑 福島特注: 荒れた小回りを捲り切るローカル特化のタフネス血統");
            }
            // 福島重賞2: 直線292mの機動力（マクリ・先行）
            // 直線が極端に短いため、4コーナーで前列にいないと物理的に届かない
            if (horse.style === '逃げ' || horse.style === '先行') {
                // [減点方式] potential += 35;
                tags.push("👑 福島特注: 直線292mの絶望を回避する先行力");
            }
            // 福島重賞3: 荒れるハンデ戦のセオリー（軽斤量）
            // 七夕賞や福島記念など、斤量が軽い逃げ馬が波乱を起こす
            if (kinryo <= 54) {
                // [減点方式] potential += 30;
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
        var hanshinScore = 0;
        var isHanshinSire = ['キズナ', 'ホッコータルマエ', 'ハーツクライ', 'マジェスティックウォリアー', 'シュヴァルグラン', 'モズアスコット', 'Essential Quality'].some(function (s) { return (horse.sire || '').includes(s); });
        var isHanshinJockey = ['西村 淳也', '鮫島 克駿', '小牧 加矢太', '森 一馬', '上野 翔', '西塚 洸二', '太宰 啓介', '角田 大和', '高倉 稜', '菱田 裕二'].some(function (j) { return jockey.includes(j); });
        if (weight >= 480)
            hanshinScore += 10;
        if (frame <= 2)
            hanshinScore += 15;
        if (isHanshinSire)
            hanshinScore += 15;
        if (isHanshinJockey)
            hanshinScore += 15;
        if (horse.age === 3)
            hanshinScore += 15;
        if (hanshinScore >= 25) {
            /* [要見直し2] */ potential += hanshinScore;
            // [要見直し2] tags.push(`🔥 阪神特注馬: AI学習済み特化バイアス合致 (+${hanshinScore})`);
        }
    }
    // 1. 斤量体重比（kinryo_weight_ratio）の最適化
    if (weight > 0) {
        var kinryoWeightRatio = (kinryo / weight) * 100;
        if (kinryoWeightRatio < 11.5) {
            // [減点方式] potential += 30;
            // [要見直し] tags.push("👑 物理黄金比:負担極小・圧倒的パワーアドバンテージ");
        }
        else if (kinryoWeightRatio >= 12.5) {
            potential -= 30;
            tags.push("⚠️ 物理的過負荷:小柄馬の斤量負担ペナルティ");
        }
    }
    // 2. 馬格（馬体重ベース）の絶対評価
    if (weight >= 500) {
        // [減点方式] potential += 15;
        // [要見直し] tags.push("💪 大型馬パワーボーナス(500kg以上)");
    }
    else if (weight > 0 && weight <= 440) {
        potential -= 15;
        tags.push("⚠️ 小型馬パワー不足ペナルティ(440kg以下)");
    }
    // 3. エリート騎手への極大ブースト（騎手ファクター最大化）
    var cleanJockey = jockey.replace(/[▲△☆◇]/g, '').trim();
    var isEliteJockey = ELITE_JOCKEYS.some(function (ej) { return cleanJockey.includes(ej); });
    if (isEliteJockey) {
        // [減点方式] potential += 40;
        tags.push("👑 トップジョッキー絶対値ブースト(最重要人間ファクター)");
    }
    // ==========================================
    // 【新設】③ 馬体重の長期的トレンド（成長・本格化・激ヤセ）判定
    // ==========================================
    if (hm && hm.results && hm.results.length >= 3 && weight > 0) {
        // 過去3戦で馬体重データがあるものを抽出
        var recentWeights = hm.results
            .filter(function (r) { return r.weight && r.weight > 0; })
            .slice(0, 3)
            .map(function (r) { return r.weight; });
        if (recentWeights.length >= 2) {
            var avgRecentWeight = recentWeights.reduce(function (a, b) { return a + b; }, 0) / recentWeights.length;
            var longTermDiff = weight - avgRecentWeight;
            if (age <= 4 && longTermDiff >= 10 && longTermDiff <= 25) {
                // [減点方式] potential += 20;
                tags.push("\uD83D\uDCAA \u6210\u9577\u671F\u30FB\u672C\u683C\u5316(\u9577\u671F\u99AC\u4F53\u5897 +".concat(Math.round(longTermDiff), "kg)"));
            }
            else if (longTermDiff <= -15) {
                potential -= 25;
                tags.push("\u26A0\uFE0F \u5927\u5E45\u99AC\u4F53\u6E1B\u30EA\u30B9\u30AF(\u9577\u671F\u99AC\u4F53\u6E1B ".concat(Math.round(longTermDiff), "kg)"));
            }
        }
    }
    // ==========================================
    // 【新設】① 調教タイムの数値化スコアリング
    // ==========================================
    if (horse.trainingTime) {
        var timeStr = horse.trainingTime;
        var timeNumbers = timeStr
            .replace(/[\[\]\(\)（）]/g, ' ')
            .split(/[\s\- \t]/)
            .map(function (part) { return parseFloat(part.trim()); })
            .filter(function (num) { return !isNaN(num) && num > 0 && num < 100; });
        var isSlope = timeStr.includes("坂路") || timeStr.includes("坂");
        var isWood = timeStr.includes("ウッド") || timeStr.includes("南W") || timeStr.includes("Ｗ");
        if (isSlope && timeNumbers.length >= 2) {
            var overall = timeNumbers[0];
            var last1f = timeNumbers[timeNumbers.length - 1];
            if (overall <= 50.5 && last1f <= 11.8) {
                // [減点方式] potential += 35;
                tags.push("🔥 坂路超抜時計(極上の仕上がり)");
            }
            else if (overall <= 52.5 && last1f <= 12.2) {
                // [減点方式] potential += 20;
                tags.push("⚡ 坂路好時計(スピード十分)");
            }
            else if (overall <= 54.0 && last1f <= 12.5) {
                // [減点方式] potential += 10;
                tags.push("📈 坂路順調(及第点の動き)");
            }
        }
        else if (isWood && timeNumbers.length >= 2) {
            var overall = timeNumbers[0];
            var last1f = timeNumbers[timeNumbers.length - 1];
            if (overall <= 64.5 && last1f <= 11.0) {
                // [減点方式] potential += 35;
                tags.push("🔥 ウッド超抜時計(極限のキレ)");
            }
            else if (overall <= 66.5 && last1f <= 11.5) {
                // [減点方式] potential += 20;
                tags.push("⚡ ウッド好調教(推進力十分)");
            }
            else if (overall <= 69.0 && last1f <= 12.0) {
                // [減点方式] potential += 10;
                tags.push("📈 ウッド順調(推進力十分)");
            }
        }
    }
    // 調教評価印による補正
    if (horse.trainingRating) {
        var rating = horse.trainingRating.toUpperCase();
        if (rating === "S") {
            // [減点方式] potential += 30;
            tags.push("🌟 調教S評価(超絶状態)");
        }
        else if (rating === "A") {
            // [減点方式] potential += 20;
            tags.push("⭐ 調教A評価(好仕上がり)");
        }
        else if (rating === "B+") {
            // [減点方式] potential += 10;
            tags.push("👍 調教B+評価(状態良好)");
        }
    }
    // ==========================================
    // 【新設】② 生産者（ブリーダー）のブランド評価
    // ==========================================
    if (horseBreeder) {
        var breederName_1 = horseBreeder;
        var isGradeOrSpecial = (_4 = race.raceName) === null || _4 === void 0 ? void 0 : _4.match(/(GⅠ|GⅡ|GⅢ|重賞|特別|ステークス|カップ)/);
        if (breederName_1.includes("ノーザンファーム")) {
            if (isGradeOrSpecial) {
                // [減点方式] potential += 30;
                tags.push("👑 ノーザンファーム生産(大舞台エリート)");
            }
            else {
                // [減点方式] potential += 15;
                tags.push("👑 ノーザンファーム生産(育成力抜群)");
            }
        }
        else if (breederName_1.includes("社台ファーム") ||
            breederName_1.includes("白老ファーム") ||
            breederName_1.includes("追分ファーム")) {
            if (isGradeOrSpecial) {
                // [減点方式] potential += 15;
                tags.push("🏰 社台グループ生産(高水準ブランド)");
            }
            else {
                // [減点方式] potential += 8;
                tags.push("🏰 社台グループ生産(好気配)");
            }
        }
        else if (breederName_1.includes("ダーレー") ||
            breederName_1.includes("ヤナガワ牧場") ||
            breederName_1.includes("三嶋牧場") ||
            breederName_1.includes("グランド牧場") ||
            breederName_1.includes("ノースヒルズ") ||
            breederName_1.includes("下河辺牧場") ||
            breederName_1.includes("千代田牧場") ||
            breederName_1.includes("ケイアイファーム")) {
            // [減点方式] potential += 8;
            tags.push("\uD83D\uDC0E \u6709\u540D\u5B9F\u529B\u7267\u5834\u751F\u7523(\u30D6\u30E9\u30F3\u30C9\u529B)");
        }
    }
    // ==========================================
    // 【新設】③ 同騎手・乗り替わりの精査
    // ==========================================
    var cleanCurrentJockey = jockey.replace(/[▲△☆◇]/g, '').trim();
    var prevRace = horse.pastRaces && horse.pastRaces[0];
    var prevJockey = (prevRace === null || prevRace === void 0 ? void 0 : prevRace.jockey) || horse.prevJockey || '';
    var cleanPrevJockey = prevJockey.replace(/[▲△☆◇]/g, '').trim();
    if (cleanCurrentJockey && cleanPrevJockey) {
        if (cleanCurrentJockey === cleanPrevJockey) {
            // [減点方式] potential += 15;
            tags.push("🤝 継続騎乗(人馬一体の絆)");
        }
        else {
            var isCurrentElite = ELITE_JOCKEYS.some(function (ej) { return cleanCurrentJockey.includes(ej); });
            var isPrevElite = ELITE_JOCKEYS.some(function (ej) { return cleanPrevJockey.includes(ej); });
            if (isCurrentElite && !isPrevElite) {
                // [減点方式] potential += 25;
                tags.push("⚡ 鞍上強化：リーディングへの勝負乗り替え");
            }
            else if (!isCurrentElite && isPrevElite) {
                potential -= 10;
                tags.push("⚠️ 鞍上交代(リーディングから乗り替わり)");
            }
            else {
                // [要見直し2] tags.push("🏇 鞍上交代(新コンビ)");
            }
        }
    }
    // ==========================================
    // 【新設】J-① トラックバイアス物理判定（クッション値・含水率・仮柵位置）
    // ==========================================
    var temporaryFence = race.temporaryFencePosition || '';
    var cushion = race.cushionValue;
    var moisture = race.moistureContent;
    if (temporaryFence === 'C' || temporaryFence === 'D') {
        if (frame <= 3 && (horse.style === '逃げ' || horse.style === '先行' || horse.style === '好位')) {
            // [減点方式] potential += 25;
            tags.push("🧬 仮柵移動バイアス適合(内有利)");
        }
    }
    if (race.surface === '芝') {
        if (cushion !== undefined && cushion < 8.0) {
            var softBlood = ['キズナ', 'エピファネイア', 'ハービンジャー', 'オルフェーヴル', 'ゴールドシップ', 'モーリス'];
            var hasSoftBlood = softBlood.some(function (sb) { return bloodline.includes(sb); });
            if (hasSoftBlood) {
                // [減点方式] potential += 15;
                tags.push("\u2614 \u30AF\u30C3\u30B7\u30E7\u30F3\u5024\u4F4E\u99AC\u5834\u9069\u5408(".concat(bloodline.split(' / ')[0], ")"));
            }
        }
    }
    else if (race.surface === 'ダート') {
        if (moisture !== undefined && moisture >= 12.0) {
            if (horse.style === '逃げ' || horse.style === '先行') {
                // [減点方式] potential += 20;
                tags.push("☔ 高含水率ダート: 前残りスピードバイアス適合");
            }
        }
    }
    // ==========================================
    // 【新設】J-② 前走物理的ロス（外回し・出遅れ）克服判定
    // ==========================================
    if (prevRace) {
        var wasOuterRun = prevRace.cornerOuterCount >= 4;
        var isCloseMatch = prevRace.timeDiff !== undefined && prevRace.timeDiff <= 0.5;
        if (wasOuterRun && isCloseMatch) {
            if (frame <= 4) {
                // [減点方式] potential += 25;
                tags.push("📐 前走外回しロス克服(好枠替わり)");
            }
        }
        var didStumble = prevRace.isStumbled;
        var isFastest3f = prevRace.last3fTime !== undefined && parseFloat(prevRace.last3fTime) <= 34.0;
        var isReasonableDiff = prevRace.timeDiff !== undefined && prevRace.timeDiff <= 0.6;
        if (didStumble && isFastest3f && isReasonableDiff) {
            // [減点方式] potential += 20;
            tags.push("🚀 前走出遅れ度外視(末脚極上)");
        }
    }
    // ==========================================
    // 【新設】J-③ クラス基準タイム精度向上（前走ペース・馬場補正）
    // ==========================================
    if (prevRace && prevRace.halonPace) {
        var paceParts = prevRace.halonPace.split('-');
        if (paceParts.length === 2) {
            var front3f = parseFloat(paceParts[0]);
            var back3f = parseFloat(paceParts[1]);
            if (!isNaN(front3f) && !isNaN(back3f)) {
                var isHighPace = front3f < back3f - 1.0;
                var isSlowPace = front3f > back3f + 1.0;
                if (isHighPace && (horse.style === '逃げ' || horse.style === '先行')) {
                    // [減点方式] potential += 15;
                    tags.push("⏱️ 緩ペース替わりで持続力発揮");
                }
                else if (isSlowPace && dist < prevRace.distance) {
                    // [減点方式] potential += 15;
                    tags.push("⏱️ 持続力勝負への条件好転");
                }
            }
        }
    }
    // ==========================================
    // 【新設】J-④ 厩舎別「勝負調教パターン」解析
    // ==========================================
    if (horse.trainer && horse.trainingTime) {
        var trainerName = horse.trainer;
        var timeStr = horse.trainingTime;
        var timeNumbers = timeStr
            .replace(/[\[\]\(\)（）]/g, ' ')
            .split(/[\s\- \t]/)
            .map(function (part) { return parseFloat(part.trim()); })
            .filter(function (num) { return !isNaN(num) && num > 0 && num < 100; });
        var isSlope = timeStr.includes("坂路") || timeStr.includes("坂");
        var isWood = timeStr.includes("ウッド") || timeStr.includes("南W") || timeStr.includes("Ｗ");
        if (timeNumbers.length >= 2) {
            var overall = timeNumbers[0];
            var last1f = timeNumbers[timeNumbers.length - 1];
            if (trainerName.includes("中内田")) {
                if (isSlope && last1f <= 11.8) {
                    // [減点方式] potential += 30;
                    tags.push("🎯 中内田×勝負坂路仕上げ");
                }
            }
            else if (trainerName.includes("矢作")) {
                if (isWood && overall <= 64.5 && last1f <= 11.2) {
                    // [減点方式] potential += 30;
                    tags.push("🎯 矢作×極限ウッド仕上げ");
                }
            }
            else if (trainerName.includes("友道")) {
                if (isWood && overall <= 65.5 && last1f <= 11.5) {
                    // [減点方式] potential += 25;
                    tags.push("🎯 友道×本気ウッド仕上げ");
                }
            }
            else if (trainerName.includes("木村") || trainerName.includes("国枝")) {
                if (isWood && overall <= 65.0 && last1f <= 11.3) {
                    // [減点方式] potential += 25;
                    tags.push("🎯 関東エリート×本気ウッド仕上げ");
                }
            }
        }
    }
    // ==========================================
    // 【新設】J-⑤ 初芝・初ダート路線変更変心予測
    // ==========================================
    if (horse.pastRaces && horse.pastRaces.length > 0) {
        var hasOnlyRunGrass = horse.pastRaces.every(function (pr) { return pr.surface === '芝'; });
        var hasOnlyRunDirt = horse.pastRaces.every(function (pr) { return pr.surface === 'ダート'; });
        if (race.surface === 'ダート' && hasOnlyRunGrass) {
            var dirtSires_1 = ['ヘニーヒューズ', 'シニスターミニスター', 'ホッコータルマエ', 'パイロ', 'ドレフォン', 'マジェスティックウォリアー', 'キズナ', 'ルーラーシップ', 'ロードカナロア'];
            var isDirtSire = dirtSires_1.some(function (ds) { return bloodline.includes(ds); });
            if (isDirtSire) {
                // [減点方式] potential += 35;
                tags.push("🌀 砂替わり変心警戒(ダート強力血統)");
            }
        }
        else if (race.surface === '芝' && hasOnlyRunDirt) {
            var grassSires = ['ディープインパクト', 'ハーツクライ', 'ロードカナロア', 'エピファネイア', 'モーリス', 'キタサンブラック', 'ドゥラメンテ', 'ハービンジャー'];
            var isGrassSire = grassSires.some(function (gs) { return bloodline.includes(gs); });
            if (isGrassSire) {
                // [減点方式] potential += 20;
                tags.push("🌱 芝替わり変心警戒(芝エリート血統)");
            }
        }
    }
    // ==========================================
    // 【高知競馬場 超特化型オメガ・プロトコル推論エンジン】
    // ==========================================
    var isKochi = ((_5 = race.venue) === null || _5 === void 0 ? void 0 : _5.includes("高知")) || ((_6 = race.trackName) === null || _6 === void 0 ? void 0 : _6.includes("高知")) || ((_7 = race.raceName) === null || _7 === void 0 ? void 0 : _7.includes("高知"));
    if (isKochi) {
        tags.push("🌴 高知特化OMEGAエンジン適用中");
        // 1. 枠順バイアス（イン荒れ・外枠外伸び）
        if (frame >= 7) {
            // [減点方式] potential += 30;
            tags.push("📈 高知外枠アドバンテージ(砂厚・イン避け)");
        }
        else if (frame <= 2) {
            potential -= 25;
            tags.push("⚠️ 高知内枠ペナルティ(内砂深くロス懸念)");
        }
        // 2. 一発逆転ファイナルレース（最終レース）の波乱・穴馬補正
        var isFinalRace = race.raceNumber >= 11;
        if (isFinalRace) {
            tags.push("🔥 一発逆転ファイナルレース・波乱モード");
            if (popularity >= 6 || odds >= 15.0) {
                // [減点方式] potential += 35;
                tags.push("⚡ ファイナル激走穴馬エッジ");
            }
            else if (popularity === 1) {
                potential -= 20; // 最終レースの1番人気信頼度低下
                tags.push("⚠️ ファイナル1番人気被り割引");
            }
        }
        // 3. 高知リーディングジョッキーバイアス（赤岡、宮川、多田羅）
        var isKochiEliteJ = ["赤岡", "宮川", "多田羅"].some(function (j) { return jockey.includes(j); });
        if (isKochiEliteJ) {
            // [減点方式] potential += 35;
            tags.push("👑 高知トップジョッキー補正");
        }
    }
    // ==========================================
    // 【大井競馬場 超特化型オメガ・プロトコル推論エンジン】
    // ==========================================
    var isOhi = ((_8 = race.venue) === null || _8 === void 0 ? void 0 : _8.includes("大井")) || ((_9 = race.trackName) === null || _9 === void 0 ? void 0 : _9.includes("大井")) || ((_10 = race.raceName) === null || _10 === void 0 ? void 0 : _10.includes("大井"));
    if (isOhi) {
        tags.push("🗼 大井特化OMEGAエンジン適用中");
        // 1. 大型パワー馬加点（タフなオーストラリア産白砂対応）
        if (weight >= 500) {
            // [減点方式] potential += 20;
            tags.push("💪 大井白砂パワー適合(500kg以上)");
        }
        // 2. 環境変化と血統の逆転（白砂の含水率バイナリ構造）
        var sireUpper = ((_11 = horse.sire) === null || _11 === void 0 ? void 0 : _11.toUpperCase()) || "";
        var isDry = race.condition === "良" || race.condition === "稍重";
        var isWet = race.condition === "重" || race.condition === "不良";
        if (isDry) {
            if (sireUpper.includes("イスラボニータ") || sireUpper.includes("スクリーンヒーロー")) {
                // [減点方式] potential += 25;
                tags.push("🧬 大井良馬場特注：乾燥白砂の表面滑走(芝適性血統)");
            }
        }
        else if (isWet) {
            if (sireUpper.includes("ゴールドアリュール") || sireUpper.includes("ドレフォン") || sireUpper.includes("クロフネ")) {
                // [減点方式] potential += 30;
                tags.push("🌧️ 大井道悪特注：締まった砂を切り裂くパワー駆動血統");
            }
        }
        // 環境不問の万能血統
        if (sireUpper.includes("ダノンレジェンド") || sireUpper.includes("ヘニーヒューズ")) {
            // [減点方式] potential += 15;
            tags.push("🧬 大井万能血統：環境不問のスピード＆パワー");
        }
        // 3. 海風のエアロダイナミクスと距離別脚質
        var raceMonth = race.date ? parseInt(race.date.split("-")[1] || "0") : 0;
        var isSummer = raceMonth >= 6 && raceMonth <= 8;
        var isWinter = raceMonth === 12 || raceMonth <= 2;
        if (dist >= 1600) {
            if (horse.style === "差し" || horse.style === "追込" || horse.style === "マクリ") {
                // [減点方式] potential += 20;
                tags.push("🏹 外回り長距離・末脚特注");
                if (isWinter) {
                    // [減点方式] potential += 15;
                    tags.push("🌪️ 大井冬期特注：北風(向かい風)による先行崩れと外差しエッジ");
                }
            }
        }
        else {
            if (horse.style === "逃げ" || horse.style === "先行") {
                // [減点方式] potential += 20;
                tags.push("🏃 短距離・前残り優位");
                if (isSummer) {
                    // [減点方式] potential += 15;
                    tags.push("🌊 大井夏期特注：南風(追い風)による逃げ・先行アシスト");
                }
            }
        }
        // ==========================================
        // ==========================================
        // 【アップデート】大井特化・究極ナレッジ「最強の買い方」統合プロトコル
        // ==========================================
        var prevRaceData_1 = horse.pastRaces && horse.pastRaces.length > 0 ? horse.pastRaces[0] : null;
        var prevResult = prevRaceData_1 ? prevRaceData_1.result : 99;
        var prevPassing = (prevRaceData_1 === null || prevRaceData_1 === void 0 ? void 0 : prevRaceData_1.passingPositions) || "";
        var prevLast4 = parseInt(prevPassing.split("-").pop() || "0");
        // 1. 【1着固定の絶対軸】上位騎手 × 1〜2番人気 × 前走3着以内
        var isTopJockey = ["矢野", "藤田", "笹川", "吉井", "戸崎"].some(function (j) { return jockey.includes(j); });
        if (isTopJockey && popularity <= 2 && prevResult <= 3) {
            // [減点方式] potential += 50;
            tags.push("👑 大井鉄板軸: 上位騎手×1〜2番人気×前走好走(1着固定)");
        }
        // 2. 【2着・相手筆頭】前走1〜3番手先行 × 距離適性枠順
        var isPrevFront = prevLast4 > 0 && prevLast4 <= 3;
        if (isPrevFront) {
            // 1200m: 内〜中枠(1〜6枠)
            if (dist === 1200 && frame <= 6) {
                // [減点方式] potential += 35;
                tags.push("🎯 大井好走バイアス: 1200m×内中枠×前走先行力");
                // 1600m〜2000m: 中〜外枠(5〜8枠)
            }
            else if (dist >= 1600 && frame >= 5) {
                // [減点方式] potential += 35;
                tags.push("🎯 大井好走バイアス: 1600m以上×外枠×前走先行力");
            }
        }
        // 3. 【ヒモ穴の使者（3着候補）】実力派騎手 × 6番人気以下 × 前走大敗（6着以下）
        var isBombJockey = ["吉井", "和田", "菅原", "高橋"].some(function (j) { return jockey.includes(j); });
        if (isBombJockey && popularity >= 6 && prevResult >= 6 && prevResult !== 99) {
            // [減点方式] potential += 45;
            tags.push("💣 大井ヒモ穴爆弾: 実力派騎手×前走大敗馬の一変");
        }
        // ==========================================
        // 【新設】大井最新トレンド：重馬場特化の前残り＆距離別枠順バイアス
        // ==========================================
        var isHeavyOrYielding = race.condition === "重" || race.condition === "不良" || race.condition === "稍重";
        // 1. 重馬場の絶対的前残り（逃げ・先行）
        if (isHeavyOrYielding) {
            if (horse.style === "逃げ" || horse.style === "先行") {
                // [減点方式] potential += 30;
                tags.push("👑 大井重馬場TB: 圧倒的前残り(逃げ・先行絶対有利)");
            }
        }
        // 2. 距離別の枠順×脚質の極端なバイアス
        if (dist === 1200) {
            // 1200m: 内〜中枠(1〜4枠) × 逃げ・先行
            if (frame <= 4 && (horse.style === "逃げ" || horse.style === "先行")) {
                // [減点方式] potential += 35;
                tags.push("🔥 大井1200m特注: 内〜中枠のロスなし先行抜け出し");
            }
        }
        else if (dist === 1400) {
            // 1400m: 内枠(1〜3枠)先行 or 中枠(4〜6枠)差し・好位
            if (frame <= 3 && (horse.style === "逃げ" || horse.style === "先行")) {
                // [減点方式] potential += 30;
                tags.push("🔥 大井1400m特注: 内枠の先行好位抜け出し");
            }
            else if (frame >= 4 && frame <= 6 && (horse.style === "差し" || horse.style === "先行")) {
                // [減点方式] potential += 30;
                tags.push("🔥 大井1400m特注: 中枠からの差し・好位撃ち");
            }
        }
        else if (dist === 1600) {
            // 1600m(内回り): 中〜外枠(4〜8枠) × 逃げ・先行
            if (frame >= 4 && (horse.style === "逃げ" || horse.style === "先行")) {
                // [減点方式] potential += 35;
                tags.push("🔥 大井1600m特注: 中〜外枠から揉まれず先行押し切り");
            }
        }
        else if (dist >= 2000) {
            // 2000m: 外枠(6〜8枠) × 逃げ・先行・マクリ
            if (frame >= 6 && (horse.style === "逃げ" || horse.style === "先行" || horse.style === "マクリ")) {
                // [減点方式] potential += 35;
                tags.push("🔥 大井2000m特注: 外枠からの先行・マクリ(前残り馬場)");
            }
        }
        // ==========================================
        // 【アップデート】大井特化・究極ナレッジ：年齢別馬体重フィルター
        // ==========================================
        if (age <= 3) {
            // 3歳馬はプラス体重を狙う（成長分として好走に直結）
            if (weightChange >= 10) {
                // [減点方式] potential += 40;
                tags.push("📈 大井仕上がり特注: 3歳馬大幅プラス体重(成長・筋力アップ)");
            }
            else if (weightChange > 0) {
                // [減点方式] potential += 20;
                tags.push("📈 大井仕上がり特注: 3歳馬プラス体重(順調な成長)");
            }
            else if (weightChange < 0) {
                potential -= 10;
                tags.push("⚠️ 大井3歳馬マイナス体重(成長曲線に逆行・要注意)");
            }
        }
        else if (age >= 4) {
            // 古馬は絞れている馬（マイナス〜0kg）を狙う（究極仕上げ）
            if (weightChange >= -5 && weightChange <= 0) {
                // [減点方式] potential += 40;
                tags.push("👑 大井仕上がり特注: 古馬マイナス体重(究極仕上げ)");
            }
            else if (weightChange > 0 && weightChange <= 5) {
                // [減点方式] potential += 20;
                tags.push("📈 大井仕上がり特注: 古馬微増(許容範囲内の維持)");
            }
            else if (weightChange >= 10) {
                potential -= 30;
                tags.push("⚠️ 大井古馬大幅プラス体重(太め残りの危険大)");
            }
            else if (weightChange <= -10) {
                potential -= 20;
                tags.push("⚠️ 大井古馬大幅マイナス体重(細化・調子落ち警戒)");
            }
        }
    }
    // ==========================================
    // 【浦和競馬場 超特化型オメガ・プロトコル推論エンジン】
    // ==========================================
    var isUrawa = ((_12 = race.venue) === null || _12 === void 0 ? void 0 : _12.includes("浦和")) || ((_13 = race.trackName) === null || _13 === void 0 ? void 0 : _13.includes("浦和")) || ((_14 = race.raceName) === null || _14 === void 0 ? void 0 : _14.includes("浦和"));
    if (isUrawa) {
        tags.push("📐 浦和特化OMEGAエンジン適用中");
        // 1. 空間物理と含水率の相乗効果（極小回り×馬場状態）
        var isUrawaWet = race.condition === "重" || race.condition === "不良";
        if (frame <= 3 && (horse.style === "逃げ" || horse.style === "先行")) {
            var boost = 40;
            var msg = "🚀 浦和極小回り: 内枠先行絶対有利";
            if (isUrawaWet) {
                boost += 25; // 超高速馬場化による前残り鉄板化
                msg = "🚀☔ 浦和道悪: 止まらない内枠先行の超高速エッジ(鉄板)";
            }
            potential += boost;
            tags.push(msg);
        }
        else if (horse.style === "追込") {
            potential -= 30;
            tags.push("❌ 浦和小回り: 物理的に絶望的な追込困難割引");
        }
        // 2. 南関東ヒエラルキー（大井・船橋からの遠征馬優位）
        if (horse.pastRaces && horse.pastRaces.length > 0) {
            var cameFromBigTrack = horse.pastRaces.some(function (pr) { var _a; return (_a = pr.venue) === null || _a === void 0 ? void 0 : _a.match(/(大井|船橋)/); });
            if (cameFromBigTrack) {
                // [減点方式] potential += 20;
                tags.push("👑 南関ヒエラルキー: 大井・船橋からの格上参戦エッジ");
            }
        }
        // 3. 浦和の特殊巧者・地元エリート騎手
        var urawaEliteJ = ["森泰", "笹川", "繁田", "保園", "秋元", "福原"].some(function (j) { return jockey.includes(j); });
        if (urawaEliteJ) {
            // [減点方式] potential += 25;
            tags.push("👑 浦和マイスター・トップジョッキー補正");
        }
    }
    // ==========================================
    // 【帯広ばんえい競馬 超特化型オメガ・プロトコル推論エンジン】
    // ==========================================
    var isObihiro = ((_15 = race.venue) === null || _15 === void 0 ? void 0 : _15.includes("帯広")) || ((_16 = race.trackName) === null || _16 === void 0 ? void 0 : _16.includes("帯広")) || ((_17 = race.raceName) === null || _17 === void 0 ? void 0 : _17.includes("帯広"));
    if (isObihiro) {
        tags.push("🏇 帯広ばんえい特化OMEGAエンジン適用中");
        // 1. 大型馬絶対優位（ソリを引く圧倒的パワー）
        if (weight >= 900) {
            // [減点方式] potential += 35;
            tags.push("💪 ばんえい規格外パワー馬(900kg以上)");
        }
        else if (weight < 850) {
            potential -= 20;
            tags.push("⚠️ ばんえい小柄馬パワー不足割引");
        }
        // 2. ばんえいリーディング騎手（西将太、鈴木恵、阿部など）
        var isBaneiEliteJ = ["西将", "鈴木恵", "阿部"].some(function (j) { return jockey.includes(j); });
        if (isBaneiEliteJ) {
            // [減点方式] potential += 30;
            tags.push("👑 ばんえいエリートジョッキー補正");
        }
    }
    // ==========================================
    // 【新潟競馬場 超特化型オメガ・プロトコル推論エンジン】
    // ==========================================
    var isNiigata = ((_18 = race.venue) === null || _18 === void 0 ? void 0 : _18.includes("新潟")) || ((_19 = race.trackName) === null || _19 === void 0 ? void 0 : _19.includes("新潟")) || ((_20 = race.raceName) === null || _20 === void 0 ? void 0 : _20.includes("新潟"));
    if (isNiigata) {
        tags.push("🌾 新潟特化OMEGAエンジン適用中");
        // 【新設】新潟コース実績＆千直マイスター判定
        if (horse.pastRaces && horse.pastRaces.length > 0) {
            var isTurf_1 = race.surface === "芝";
            // ① 新潟直線1000m（千直）専用実績
            if (dist === 1000 && isTurf_1) {
                var hasChokuGood = horse.pastRaces.some(function (pr) {
                    var _a;
                    return (((_a = pr.venue) === null || _a === void 0 ? void 0 : _a.includes("新潟")) || pr.direction === "直線") &&
                        pr.distance === 1000 &&
                        pr.result <= 3;
                });
                if (hasChokuGood) {
                    // [減点方式] potential += 35;
                    tags.push("👑 千直マイスター: 新潟直線1000mでの好走実績あり(適性抜群)");
                }
                // 【新設】新潟千直におけるテンの「ダッシュ力」判定
                // 過去3走以内で最初のコーナー通過順位が3番手以内（1番手〜3番手）の先行実績があるか判定
                var hasFastDash = horse.pastRaces.slice(0, 3).some(function (pr) {
                    if (!pr.passingPositions)
                        return false;
                    var firstPos = parseInt(pr.passingPositions.split('-')[0] || '99', 10);
                    return firstPos > 0 && firstPos <= 3;
                });
                if (hasFastDash) {
                    // [減点方式] potential += 25;
                    tags.push("⚡ 千直ダッシュ力: 過去走でテン3番手以内の先行力あり(スピード優位)");
                }
            }
            // ② 新潟コース一般リピーター実績（千直以外）
            else {
                var niigataTop3Count = horse.pastRaces.filter(function (pr) {
                    var _a;
                    return ((_a = pr.venue) === null || _a === void 0 ? void 0 : _a.includes("新潟")) &&
                        pr.result <= 3;
                }).length;
                if (niigataTop3Count > 0) {
                    // [減点方式] potential += 20;
                    tags.push("\uD83D\uDC0E \u65B0\u6F5F\u30EA\u30D4\u30FC\u30BF\u30FC\u30A8\u30C3\u30B8: \u904E\u53BB\u306B\u65B0\u6F5F\u3067\u306E\u597D\u8D70\u5B9F\u7E3E\u3042\u308A(".concat(niigataTop3Count, "\u56DE)"));
                }
            }
        }
        var isTurf = race.surface === "芝";
        // 【新設】新潟芝における「超高速馬場への高速時計適性」の判定
        if (isTurf && (race.condition === "良" || race.condition === "稍重") && horse.pastRaces && horse.pastRaces.length > 0) {
            var parseTimeToSeconds_1 = function (timeStr) {
                if (!timeStr)
                    return 999;
                var cleanStr = timeStr.toString().trim();
                if (cleanStr.includes(":")) {
                    var parts = cleanStr.split(":");
                    var minutes = parseFloat(parts[0] || "0");
                    var seconds = parseFloat(parts[1] || "0");
                    return minutes * 60 + seconds;
                }
                return parseFloat(cleanStr) || 999;
            };
            var hasFastTimeRecord = horse.pastRaces.some(function (pr) {
                if (pr.distance !== dist || !pr.time || pr.result > 5)
                    return false;
                var seconds = parseTimeToSeconds_1(pr.time);
                if (dist === 1000 && seconds <= 55.5)
                    return true;
                if (dist === 1200 && seconds <= 68.2)
                    return true;
                if (dist === 1400 && seconds <= 80.8)
                    return true;
                if (dist === 1600 && seconds <= 93.2)
                    return true;
                if (dist === 1800 && seconds <= 105.8)
                    return true;
                if (dist === 2000 && seconds <= 118.8)
                    return true;
                if (dist === 2400 && seconds <= 144.5)
                    return true;
                return false;
            });
            if (hasFastTimeRecord) {
                // [減点方式] potential += 30;
                tags.push("⚡ 高速時計エッジ: 新潟高速芝に適した持ち時計実績あり(スピード証明)");
            }
        }
        // 1. 市場評価・オッズパラメータ（オッズの歪みと過小評価の検知）
        var isDirt = race.surface === "ダート";
        var isGradeOrSpecial = (_21 = race.raceName) === null || _21 === void 0 ? void 0 : _21.match(/(GⅠ|GⅡ|GⅢ|重賞|特別|ステークス|カップ)/);
        var isStrongHeadwind = race.isHeadwind && (race.windSpeed !== undefined && race.windSpeed >= 3.0);
        var prevRace_1 = horse.pastRaces && horse.pastRaces[0];
        if (isTurf) {
            // 芝レースにおける1番人気の過大評価（被りすぎ）減点
            if (popularity === 1 || odds <= 2.5) {
                potential -= 8; // 中京・中山芝での的中率向上のため-25から-8へ緩和
                tags.push("⚠️ 芝1番人気被り警戒(オッズ歪み補正)");
            }
            // 芝の牡牝混合戦における牝馬への加点（過剰な二重加算を適正化、短距離ボーナスと統合）
            var isMixed = !((_22 = race.raceName) === null || _22 === void 0 ? void 0 : _22.includes("牝"));
            if (isMixed && gender === "牝") {
                if (dist <= 1400) {
                    /* [減点方式] potential += 12; */ // 二重加算を廃止し、短距離混合戦では+12の適正値に統合
                    tags.push("🎯 短距離混合戦 of 牝馬エッジ");
                }
                else {
                    // [減点方式] potential += 8;
                    tags.push("🎯 混合戦 of 牝馬(期待値エッジ)");
                }
            }
        }
        // 重賞における高齢馬（7歳以上）の復活期待値加点（的中率重視で抑制）
        if (isGradeOrSpecial && age >= 7) {
            // [減点方式] potential += 8;
            tags.push("🔥 高齢実績馬の補正");
        }
        // 新潟直線1000m（千直）における圧倒的有利な「外枠（6枠〜8枠）」の物理エッジと激走条件
        if (dist === 1000 && isTurf) {
            if (frame >= 6) {
                // [減点方式] potential += 25;
                tags.push("⚡ 千直外枠の圧倒的物理アドバンテージ");
                // 【激走】「前走ダート」×「7・8枠」の芝スタートスピード恩恵
                if (prevRace_1 && prevRace_1.surface === "ダート" && frame >= 7) {
                    // [減点方式] potential += 20;
                    tags.push("⚡ 千直適性：前走ダートダッシュ力×外枠黄金シナジー");
                }
            }
            else if (frame <= 2) {
                // 【激走】「1〜2枠」×「追込馬」: 意図的に下げてから外へ出す戦術トレンド
                if (horse.style === "追込") {
                    // [減点方式] potential += 15;
                    tags.push("🎯 千直内枠追込：大外ラチ沿いトラバース急襲エッジ");
                }
                else {
                    potential -= 20;
                    tags.push("⚠️ 千直内枠の物理的絶望バイアス(馬場荒れ)");
                }
            }
            // 【激走】芝・大幅距離短縮ローテ×斤量減
            if (prevRace_1 && prevRace_1.distance >= 1500) {
                var prevJockeyWeight = prevRace_1.jockeyWeight || 55;
                if (prevJockeyWeight - kinryo >= 1) {
                    // [減点方式] potential += 35;
                    tags.push("⚡ 新潟千直：大幅距離短縮ローテ×斤量減エッジ");
                }
                else if (kinryo < prevJockeyWeight) {
                    // [減点方式] potential += 25;
                    tags.push("⚡ 千直激変：大幅距離短縮ローテ×斤量減エッジ");
                }
            }
        }
        // 【新設】新潟芝における「内回り」と「外回り」の厳密な区別と脚質適合
        var isInnerTrack = ((_23 = race.trackName) === null || _23 === void 0 ? void 0 : _23.includes("内")) || ((_24 = race.raceName) === null || _24 === void 0 ? void 0 : _24.includes("内回り")) || ((_25 = race.trackName) === null || _25 === void 0 ? void 0 : _25.includes("内回り"));
        // 内回り：1200m、1400m、および明示的な2000m内回りなど
        var isNiigataInnerTurf = isTurf && ([1200, 1400].includes(dist) ||
            (dist === 2000 && isInnerTrack));
        // 外回り：1600m、1800m、および明示的・暗黙の2000m外回り、それ以上の外回りなど
        var isNiigataOuterTurf = isTurf && ([1600, 1800].includes(dist) ||
            (dist === 2000 && !isInnerTrack) ||
            (dist > 2000 && !isInnerTrack));
        // ① 新潟芝・内回り（直線353m）の小回り先行バイアス
        if (isNiigataInnerTurf) {
            if (horse.style === "逃げ" || horse.style === "先行") {
                // [減点方式] potential += 25;
                tags.push("📐 新潟内回りエッジ: 小回り先行の展開アドバンテージ");
            }
        }
        // ② 新潟芝・外回り（直線658.7m）の末脚・キレ味バイアスと特注激走条件
        if (isNiigataOuterTurf) {
            // 芝外回り直線658.7mにおける「差し・追込・中団」の極限瞬発力ブースト
            if (horse.style === "差し" || horse.style === "追込" || horse.style === "中団") {
                // [減点方式] potential += 20;
                tags.push("🚀 新潟外回りエッジ: 直線658mの極限瞬発力ブースト");
            }
            // 開催最終週（重賞）における内枠イン突き逆張りエッジ
            var isFinalWeekStakes = ((_26 = race.raceName) === null || _26 === void 0 ? void 0 : _26.match(/(新潟記念|新潟２歳|新潟2歳)/)) !== null;
            if (isFinalWeekStakes && frame <= 3) {
                // [減点方式] potential += 35;
                tags.push("📐 新潟最終週外回り：全車外出しの逆張りイン突きエッジ");
            }
            // 芝外回りにおける「人気薄の逃げ馬」の過小評価補正
            if (horse.style === "逃げ" && (popularity >= 6 || odds >= 12.0)) {
                // [減点方式] potential += 30;
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
                        // [減点方式] potential += 15;
                        tags.push("📐 前半芝レースの内枠優位");
                    }
                }
                else {
                    // 後半レース：外枠有利
                    if (frame >= 6) {
                        // [減点方式] potential += 25;
                        tags.push("📈 後半荒れ馬場の外枠バイアス");
                    }
                }
            }
        }
        else if (isDirt) {
            if (dist === 1200) {
                // 新潟ダート1200m：芝スタートにより長く芝を走れる外枠が圧倒的有利
                if (frame >= 6) {
                    // [減点方式] potential += 25;
                    tags.push("⚡ 新潟ダ1200m：芝スタート外枠ダッシュエッジ");
                }
                else if (frame <= 2) {
                    potential -= 15;
                    tags.push("⚠️ 新潟ダ1200m：内枠芝スタート距離短不利");
                }
                // 【激走】新潟ダ1200m「牝馬の逃げ」（超平坦直線恩恵）
                if (gender === "牝" && horse.style === "逃げ") {
                    if (frame >= 6) {
                        // [減点方式] potential += 40;
                        tags.push("⚡ 新潟ダ1200m：芝スタート外枠×快速牝馬逃げの最強スピードシナジー");
                    }
                    else {
                        // [減点方式] potential += 25;
                        tags.push("⚡ 新潟ダ1200m牝馬逃げ：超平坦路盤スピード持続エッジ");
                    }
                }
            }
            else if (dist === 1800) {
                // 新潟ダ1800m 砂の物理特性（砂理学）補正
                var raceDate = race.date ? new Date(race.date) : null;
                var raceMonth = raceDate ? raceDate.getMonth() + 1 : 0;
                var isSummer = raceMonth === 7 || raceMonth === 8;
                if (isSummer && condition === "良") {
                    // 夏の良馬場：さらさら砂で高いスタミナ・キックバック回避が求められる
                    if (prevRace_1 && prevRace_1.distance < 1800 && frame >= 6) {
                        // [減点方式] potential += 30;
                        tags.push("🌾 新潟ダ1800m夏良馬場：スタミナ要求さらさら砂×距離延長・外枠エッジ");
                    }
                    else if (frame >= 6) {
                        // [減点方式] potential += 15;
                        // [要見直し2] tags.push("📈 ダート戦：砂被り回避の外枠優位");
                    }
                    else if (frame <= 2) {
                        potential -= 10;
                        tags.push("⚠️ ダート戦：砂被り・揉まれ内枠割引");
                    }
                }
                else if (condition !== "良" || raceMonth === 10 || raceMonth === 11) {
                    // 雨での含水率上昇時、または秋開催の砂細粒化（粘性泥濘馬場）：スピード減少のためパワー先行優位
                    if (horse.style === "逃げ" || horse.style === "先行") {
                        // [減点方式] potential += 30;
                        tags.push("🌾 新潟ダ1800m粘性泥濘馬場：パワー型前残り先行エッジ");
                    }
                    if (frame >= 6) {
                        // [減点方式] potential += 15;
                        // [要見直し2] tags.push("📈 ダート戦：砂被り回避の外枠優位");
                    }
                    else if (frame <= 2) {
                        potential -= 10;
                        tags.push("⚠️ ダート戦：砂被り・揉まれ内枠割引");
                    }
                }
                else {
                    // 一般ダート：外枠のキックバック回避優位
                    if (frame >= 6) {
                        // [減点方式] potential += 15;
                        // [要見直し2] tags.push("📈 ダート戦：砂被り回避の外枠優位");
                    }
                    else if (frame <= 2) {
                        potential -= 10;
                        tags.push("⚠️ ダート戦：砂被り・揉まれ内枠割引");
                    }
                }
                // 【激走】新潟ダ1800m「距離延長×外枠」（ストレスフリー追走）
                if (prevRace_1 && prevRace_1.distance < 1800 && frame >= 6 && !(isSummer && condition === "良")) {
                    // [減点方式] potential += 20;
                    tags.push("📈 新潟ダ1800m：砂被り回避外枠×距離延長エッジ");
                }
            }
            else {
                // その他のダート
                if (frame >= 6) {
                    // [減点方式] potential += 15;
                    // [要見直し2] tags.push("📈 ダート戦：砂被り回避の外枠優位");
                }
                else if (frame <= 2) {
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
                    // [減点方式] potential += 25;
                    tags.push("🏃 前半戦 of 先行・前残りアドバンテージ");
                }
            }
            else {
                // 後半レース（6R〜12R、特に特別戦・重賞）: 差し・追込馬有利加点（ただし強風時は先行優遇）
                if (isStrongHeadwind) {
                    // 直線向かい風強風：差し馬は風の壁で届かず、スリップストリームを利用できる先行・好位馬が有利
                    if (horse.style === "先行" || horse.style === "好位") {
                        // [減点方式] potential += 30;
                        tags.push("🌬️ 強風向かい風直線：風よけ先行・好位エッジ");
                    }
                    else if (horse.style === "差し" || horse.style === "追込") {
                        /* [減点方式] potential += 10; */ // 大幅に加点を減退
                        tags.push("⚠️ 強風向かい風直線：差し馬風の壁リスク割引");
                    }
                }
                else {
                    // 通常時または追い風：長い直線を活かしたキレ味優遇
                    if (horse.style === "差し" || horse.style === "追込") {
                        // [減点方式] potential += 30;
                        tags.push("🏹 後半戦 of 外差し・末脚特注");
                    }
                }
            }
        }
        else if (isDirt) {
            // 新潟ダート：含水率（馬場状態）に応じた脚質の動的調整
            if (condition === "稍重" || condition === "重") {
                // 湿潤時（脚抜きの良い高速馬場）：スピードを活かした差し馬の成績向上
                if (horse.style === "逃げ" || horse.style === "先行") {
                    // [減点方式] potential += 20;
                    tags.push("🏃 新潟ダート：前残り先行アドバンテージ");
                }
                else if (horse.style === "差し" || horse.style === "追込") {
                    // [減点方式] potential += 15;
                    tags.push("⚡ 湿潤新潟ダート：脚抜き良高速適性(差し追込バフ)");
                }
            }
            else {
                // 乾燥時（良）または泥濘時（不良）：粘り気や摩擦が激しく「パワー型前残り」が極端化
                if (horse.style === "逃げ" || horse.style === "先行") {
                    // [減点方式] potential += 35;
                    tags.push("💪 新潟ダート粘性馬場：パワー型前残り先行エッジ強化");
                }
                else if (horse.style === "差し" || horse.style === "追込") {
                    potential -= 10;
                    tags.push("❌ 新潟ダート粘性馬場：過酷なキックバック差し割引");
                }
            }
        }
        // 4. 馬体重変動の「トレンド」読み取り（勝ち切り安定と紐穴の分離による的中率強化）
        var absWeightChange = Math.abs(weightChange);
        if (weightChange >= 0 && weightChange <= 6) {
            // [減点方式] potential += 25;
            tags.push("🏆 新潟勝ち切り条件：馬体重安定ゾーン（±0〜+6kg）");
        }
        else if (absWeightChange <= 8) {
            // [減点方式] potential += 15;
            tags.push("📈 新潟馬体重安定トレンド（±8kg以内）");
        }
        else if (absWeightChange >= 10) {
            /* [減点方式] potential += 10; */ // 大幅増減は1着率低下のため小加点に抑制（紐穴）
            tags.push("⚠️ 大幅馬体重増減（2・3着激走の紐穴期待値）");
            if (popularity >= 6 || odds >= 12.0) {
                // [減点方式] potential += 10;
                tags.push("⚡ 大幅増減・妙味穴馬補正");
            }
        }
        // 5. 人間系シナジー・陣営パラメータ（特注騎手と勝負所の陣営評価）
        // 減量特注騎手「舟山瑠泉」騎手への適正な斤量恩恵補正
        if (jockey.includes("舟山") || jockey.includes("瑠泉")) {
            // [減点方式] potential += 15;
            tags.push("🌟 新潟減量ジョッキー:舟山瑠泉");
        }
        // 格が上がる後半戦（9R〜12R of 特別戦・重賞）におけるトップジョッキー＆関西馬（栗東）優位の補正
        if (race.raceNumber >= 9) {
            // 栗東（関西馬）所属
            var isRitto = ((_27 = horse.stableLocation) === null || _27 === void 0 ? void 0 : _27.includes("栗東")) || ((_28 = horse.trainer) === null || _28 === void 0 ? void 0 : _28.includes("栗東")) || ((_29 = horse.trainer) === null || _29 === void 0 ? void 0 : _29.includes("美浦")) === false;
            if (isRitto) {
                // [減点方式] potential += 25;
                tags.push("✈️ メイン戦遠征関西馬(栗東)エッジ");
            }
            // エリート騎手
            var eliteJockeys_1 = ["ルメール", "川田将雅", "武豊", "坂井瑠星", "戸崎圭太", "モレイラ", "レーン", "横山武史", "デムーロ"];
            var isElite = eliteJockeys_1.some(function (ej) { return jockey.includes(ej); });
            if (isElite) {
                // [減点方式] potential += 30;
                tags.push("👑 メイン戦トップジョッキーバイアス");
            }
        }
    }
    // ==========================================
    // 【函館競馬場 超特化型オメガ・プロトコル推論エンジン】
    // ==========================================
    var isHakodate = ((_30 = race.venue) === null || _30 === void 0 ? void 0 : _30.includes("函館")) || ((_31 = race.trackName) === null || _31 === void 0 ? void 0 : _31.includes("函館")) || ((_32 = race.raceName) === null || _32 === void 0 ? void 0 : _32.includes("函館"));
    if (isHakodate) {
        // 函館競馬場 完全減点方式（持ち点100点からのマイナス評価）
        potential = 100;
        tags.push("🦑 函館特化減点方式OMEGAエンジン適用中(100点スタート)");
        var isTurf = race.surface === "芝";
        var isDirt = race.surface === "ダート";
        var prevJockeyName = (prevRaceData === null || prevRaceData === void 0 ? void 0 : prevRaceData.jockey) || horse.prevJockey || '';
        var cleanPrevJockey_1 = prevJockeyName.replace(/[☆▲△◇★]/g, '').trim();
        var cleanCurrentJockey_1 = jockey.replace(/[☆▲△◇★]/g, '').trim();
        var isJockeyChanged = cleanPrevJockey_1 && cleanPrevJockey_1 !== cleanCurrentJockey_1;
        var isApprentice = jockey.match(/[☆▲△◇★]/);
        var isSpecialJockey = isApprentice || jockey.includes("横山和生") || jockey.includes("小沢大仁");
        // 【1. 脚質・位置取りに関する例外（救済）】
        var isRule1Exempt = false;
        if (prevRaceData && prevRaceData.result >= 10 && prevRaceData.corner4Position !== undefined && prevRaceData.corner4Position <= 3) {
            isRule1Exempt = true; // 例外（救済）
        }
        if (!isRule1Exempt) {
            // 1-A (6番手以降)の減点はJSONルールエンジンで処理
            if (prevRaceData && prevRaceData.corner1Position !== undefined && prevRaceData.corner2Position !== undefined) {
                if (prevRaceData.corner1Position >= 4 && prevRaceData.corner2Position >= 4) {
                    potential -= 10;
                    tags.push("⚠️ 函館減点1-B: 前走1〜2コーナーが中団〜後方でテンのスピード不足");
                }
            }
        }
        else {
            tags.push("🌟 函館救済: 前走大敗でも4角3番手以内の先行力があるため脚質減点免除");
        }
        // 【2. 馬体重・コンディションに関する減点】(-10kg以上の大幅減はJSONで処理)
        if (typeof horse.weightChange === 'number') {
            if (horse.weightChange >= -8 && horse.weightChange <= -4) {
                potential -= 5;
                tags.push("⚠️ 函館減点2-B: 滞在競馬での小幅な馬体減(-4〜-8kg)による割引");
            }
        }
        // 【3. 性別・年齢に関する減点】 -> JSONルールエンジンで処理
        // 【4. 枠順・人気に関する減点】 -> JSONルールエンジンで処理
        // 【5. 前走実績・騎手（乗り替わり）の減点】
        if (!isJockeyChanged && prevRaceData && prevRaceData.result !== undefined && prevRaceData.result >= 6) {
            potential -= 15;
            tags.push("⚠️ 函館減点5-A: 前走6着以下からの「継続騎乗」は巻き返し困難");
        }
        if (prevRaceData && prevRaceData.result !== undefined && (prevRaceData.result < 1 || prevRaceData.result > 5)) {
            if (!isJockeyChanged || !isSpecialJockey) {
                potential -= 10;
                tags.push("⚠️ 函館減点5-B: 前走掲示板外で、有効な乗り替わり(減量・横山和・小沢)がないため割引");
            }
        }
        // 【6. ブリンカー着用馬の特殊減点フィルター】
        if (horse.useBlinkers) {
            var blinkerPenalty = false;
            // 6-A (7枠以外大幅割引)はJSONルールエンジンで処理
            if (frame !== 7) {
                blinkerPenalty = true;
            }
            if (prevRaceData && prevRaceData.distance !== undefined && prevRaceData.distance <= dist) {
                potential -= 10;
                tags.push("⚠️ 函館減点6-B: ブリンカー着用馬の同距離・距離延長は割引(距離短縮のみ狙い)");
                blinkerPenalty = true;
            }
            if (prevRaceData && prevRaceData.result !== undefined && (prevRaceData.result <= 3 || prevRaceData.result >= 9)) {
                potential -= 10;
                tags.push("⚠️ 函館減点6-C: ブリンカー着用馬で前走4〜8着以外(中途半端な着順以外)は割引");
                blinkerPenalty = true;
            }
            if (!blinkerPenalty && frame === 7 && prevRaceData && prevRaceData.distance > dist && prevRaceData.result >= 4 && prevRaceData.result <= 8) {
                tags.push("👑 函館ブリンカー特注: 減点ゼロ！黄金条件クリアの超特注穴馬");
            }
        }
        // ==========================================
        // JSONルールエンジン（完全減点方式）の適用
        // ==========================================
        var evalContext = {
            prev_4corner_pos: prevRaceData === null || prevRaceData === void 0 ? void 0 : prevRaceData.corner4Position,
            jockey: jockey,
            jockey_mark: jockey.match(/[☆▲△◇★]/) ? jockey.match(/[☆▲△◇★]/)[0] : '',
            frame: frame,
            weight_change: horse.weightChange,
            sex: horse.gender,
            age: horse.age,
            blinker: horse.useBlinkers,
            popularity: popularity
        };
        // JSON側の前走4角6番手以降減点について、救済対象の場合はコンテキストを上書きして減点回避
        if (isRule1Exempt) {
            evalContext.prev_4corner_pos = 1; // 救済措置としてダミーの良位置をセット
        }
        var evaluation = evaluateKnowledgeBase(evalContext, hakodatePenaltyModel);
        potential += evaluation.scoreModifier;
        tags.push.apply(tags, evaluation.tags);
        // 季節ごとの馬場傾向
        var month = 0;
        if (race.date) {
            var parts = race.date.split('-');
            if (parts.length >= 2) {
                month = parseInt(parts[1], 10);
            }
        }
        var distance = parseInt(race.distance || dist || "0", 10);
        var style = horse.style || "";
        var surface = race.surface || "";
        // 秋開催 (9月, 10月) - 開幕直後で内枠有利
        if (month === 9 || month === 10) {
            if (frame >= 1 && frame <= 4) {
                potential += 15;
                tags.push("🍂 中山秋開催特注: 開幕直後の良好な馬場で内枠(1〜4枠)が圧倒的有利");
            }
            else if (frame >= 7 && frame <= 8) {
                potential -= 15;
                tags.push("🔻 中山秋開催減点: 良好な馬場で外枠から前に行くのは困難");
            }
        }
        // 冬・春開催 (12月, 1月, 2月, 3月, 4月) - タフな馬場、スタミナ必須
        if ([12, 1, 2, 3, 4].includes(month)) {
            if (surface === "芝") {
                tags.push("❄️ 中山冬春特注: 時計・上がりがかかるタフな馬場でスタミナが必須");
            }
            else if (surface === "ダート") {
                tags.push("❄️ 中山冬春ダート特注: 乾燥したタフな砂でバテバテの消耗戦(スタミナ必須)");
            }
        }
        // 距離別特化ロジック
        if (surface === "芝") {
            if (distance === 1200) {
                if (frame >= 1 && frame <= 4) {
                    var hasHill1200Success = horse.pastRaces && horse.pastRaces.some(function (pr) { var _a, _b, _c; return (((_a = pr.venue) === null || _a === void 0 ? void 0 : _a.includes("中山")) || ((_b = pr.venue) === null || _b === void 0 ? void 0 : _b.includes("阪神")) || ((_c = pr.venue) === null || _c === void 0 ? void 0 : _c.includes("中京"))) && parseInt(pr.distance || "0", 10) === 1200 && pr.result <= 3; });
                    if (hasHill1200Success) {
                        potential += 25;
                        tags.push("🎯 中山芝1200m超鉄板: 急坂コースの1200m好走実績を持つ内枠！下り坂ハイペースでも止まらない最強の狙い目");
                    }
                    else {
                        potential += 15;
                        tags.push("👑 中山芝1200m鉄板: 下り坂でハイペース。ロスなく回れる内枠が圧倒的有利！");
                    }
                }
                else if (frame >= 7 && frame <= 8) {
                    potential -= 20;
                    tags.push("🔻 中山芝1200m減点: 下り坂でスピードに乗る中、大外枠は大きな距離ロスとなり不利");
                }
            }
            else if (distance === 1600) {
                if (frame >= 1 && frame <= 4) {
                    var hasNakayama1600Success = horse.pastRaces && horse.pastRaces.some(function (pr) { var _a; return ((_a = pr.venue) === null || _a === void 0 ? void 0 : _a.includes("中山")) && parseInt(pr.distance || "0", 10) === 1600 && pr.result <= 3; });
                    if (hasNakayama1600Success) {
                        potential += 30;
                        tags.push("🎯 中山芝1600m超鉄板: 特殊条件の中山マイルで好走実績を持つ内枠馬！他場マイル実績馬を出し抜く絶好の狙い目");
                    }
                    else {
                        potential += 20;
                        tags.push("👑 中山芝1600m鉄板: 特殊ポケット発走。最初のコーナーまで短く内枠が圧倒的有利！");
                    }
                }
            }
            else if (distance === 1800) {
                if ((style === "逃げ" || style === "先行") && frame >= 1 && frame <= 4) {
                    potential += 25;
                    tags.push("👑 中山芝1800m超鉄板: スタート直後の急坂でペースが落ち着くため、遠心力ロスを防げる内枠の逃げ・先行馬が圧倒的有利！");
                }
            }
            else if (distance === 2000) {
                if (style === "差し" || style === "追込") {
                    var failedAt1800 = horse.pastRaces && horse.pastRaces.some(function (pr) { var _a; return ((_a = pr.venue) === null || _a === void 0 ? void 0 : _a.includes("中山")) && parseInt(pr.distance || "0", 10) === 1800 && (pr.style === "差し" || pr.style === "追込") && pr.result >= 4; });
                    if (failedAt1800) {
                        potential += 30;
                        tags.push("🎯 中山芝2000m超鉄板: 1800mで展開が向かず届かなかった差し・追い込み馬！ポジション争いが激化するここは絶好の『出し入れ』の舞台");
                    }
                    else {
                        potential += 20;
                        tags.push("🌟 中山芝2000m特注: 1角までが長くポジション争いが激化。前半で脚を使う前残りが厳しくなり、差し・追い込み馬が浮上！");
                    }
                }
                else if (style === "逃げ" || style === "先行") {
                    potential -= 15;
                    tags.push("🔻 中山芝2000m減点: ペースが激しくなりやすく、逃げ・先行馬には厳しい展開");
                }
            }
            else if (distance === 2200) {
                if (style === "差し") {
                    var hasFastPace = horse.pastRaces && horse.pastRaces.some(function (pr) { return pr.last3F && pr.last3F <= 34.5; });
                    if (hasFastPace) {
                        potential += 25;
                        tags.push("👑 中山芝2200m鉄板: なぜかスローペースになりやすい条件。中団から速い上がり3ハロンを繰り出せる馬が優秀な成績を残す特注舞台");
                    }
                }
            }
            else if (distance === 2500) {
                var firstTime2500 = !(horse.pastRaces && horse.pastRaces.some(function (pr) { var _a; return ((_a = pr.venue) === null || _a === void 0 ? void 0 : _a.includes("中山")) && parseInt(pr.distance || "0", 10) === 2500; }));
                if (firstTime2500 && !(race.raceName && race.raceName.includes("有馬記念"))) { // 下級条件想定
                    potential += 20;
                    tags.push("🎯 中山芝2500m特注: 他距離で通用しなかった馬が集まる下級条件。未知の適性を秘めた「中山2500m初出走馬」が狙い目！");
                }
                else {
                    potential += 15;
                    tags.push("🌟 中山芝2500m特注: 有馬記念の舞台。アップダウンが多く非常にタフなコース。高い総合力とスタミナが問われる");
                }
            }
        }
        else if (surface === "ダート") {
            if (distance === 1200) {
                if ((style === "逃げ" || style === "先行") && frame >= 5 && frame <= 8) {
                    potential += 25;
                    tags.push("👑 中山ダート1200m鉄板: 芝スタート。芝部分を長く走れてスピードに乗りやすい外枠の逃げ・先行馬が圧倒的有利！");
                }
            }
            else if (distance === 1800) {
                var trainer_1 = horse.trainerName || "";
                if (trainer_1.includes("西") || trainer_1.includes("栗") || trainer_1.includes("関西")) {
                    potential += 20;
                    tags.push("🎯 中山ダート1800m特注: わざわざ輸送費をかけて関東のタフな舞台に挑んでくる「勝負気配の高い関西馬」！");
                }
            }
            else if (distance === 2400) {
                var prevMiddleDistance = horse.pastRaces && horse.pastRaces.length > 0 && parseInt(horse.pastRaces[0].distance || "0", 10) >= 1800 && parseInt(horse.pastRaces[0].distance || "0", 10) <= 2100;
                var firstTime2400 = !(horse.pastRaces && horse.pastRaces.some(function (pr) { var _a; return ((_a = pr.venue) === null || _a === void 0 ? void 0 : _a.includes("中山")) && parseInt(pr.distance || "0", 10) === 2400; }));
                if (prevMiddleDistance && firstTime2400) {
                    potential += 25;
                    tags.push("🎯 中山ダート2400m超鉄板: メンバーレベルが下がる長距離戦。中距離(1800〜2100m)で高いレベルの相手と戦ってきた馬の初出走は絶好の狙い目！");
                }
            }
        }
    }
    // ==========================================
    // 【阪神競馬場 超特化型オメガ・プロトコル推論エンジン】
    // ==========================================
    var isHanshin = ((_33 = race.venue) === null || _33 === void 0 ? void 0 : _33.includes("阪神")) || ((_34 = race.trackName) === null || _34 === void 0 ? void 0 : _34.includes("阪神")) || ((_35 = race.raceName) === null || _35 === void 0 ? void 0 : _35.includes("阪神"));
    if (isHanshin) {
        // [要見直し] tags.push("🐅 阪神特化OMEGAエンジン適用中");
        var isTurf = race.surface === "芝";
        var isDirt = race.surface === "ダート";
        var isOuterTrack = isTurf && [1600, 1800, 2400].includes(dist);
        var isInnerTrack = isTurf && !isOuterTrack;
        var isGradeOrSpecial = (_36 = race.raceName) === null || _36 === void 0 ? void 0 : _36.match(/(GⅠ|GⅡ|GⅢ|G1|G2|G3|GI|GII|GIII|重賞|特別|ステークス|カップ)/i);
        // 1. ダート1400mの「芝スタート×外枠」特注
        if (isDirt && dist === 1400) {
            if (frame >= 7) {
                // [減点方式] potential += 30;
                // [要見直し2] tags.push("⚡ 阪神ダ1400m黄金条件：芝スタート外枠の圧倒的エッジ");
            }
            // 距離短縮ローテの優遇（追走が楽になり急坂で粘る）
            if (horse.pastRaces && horse.pastRaces[0] && horse.pastRaces[0].distance >= 1800) {
                // [減点方式] potential += 20;
                tags.push("📈 阪神ダ1400m：中距離からの距離短縮によるスタミナ優位性");
            }
        }
        // 2. 小回り・平坦コース負けからの「急坂・パワー勝負」逆襲
        if (horse.pastRaces && horse.pastRaces[0]) {
            var prevRace_2 = horse.pastRaces[0];
            var isFlatTrack = /(京都|小倉|新潟)/.test(prevRace_2.venue || "");
            if (isFlatTrack && prevRace_2.result >= 6) {
                // 特にダート2000mなどのスタミナ戦での逆襲
                if (isDirt && dist === 2000) {
                    // [減点方式] potential += 25;
                    tags.push("🚀 阪神ダ2000m特注：平坦大敗からの急坂スタミナ勝負一変");
                }
                else {
                    // [減点方式] potential += 15;
                    tags.push("🚀 阪神替わり一変：平坦スピード負けからの急坂パワー逆襲期待");
                }
            }
        }
        // 3. クラスに応じた「脚質」のパラダイムシフト
        if (race.raceNumber <= 5 || (!isGradeOrSpecial && race.raceNumber <= 8)) {
            // 下級条件：前残り（逃げ・先行）有利
            if (horse.style === "逃げ" || horse.style === "先行") {
                // [減点方式] potential += 20;
                tags.push("🏃 下級条件の鉄則：急坂でも止まらない先行前残りアドバンテージ");
            }
        }
        else {
            // 上級条件（OP・重賞）：差し・マクリ有利
            if (horse.style === "差し" || horse.style === "追込" || horse.style === "マクリ") {
                // [減点方式] potential += 25;
                tags.push("🏹 上級条件の鉄則：過酷な消耗戦を斬り裂く底力の差し・マクリ");
            }
        }
        // 4. 川田将雅・田口貫太騎手の特注バイアス
        if (jockey.includes("川田")) {
            if (isDirt && (horse.style === "逃げ" || horse.style === "先行")) {
                // [減点方式] potential += 30;
                tags.push("👑 川田将雅×阪神ダート先行：最強の鉄板バイアス");
            }
            else {
                // [減点方式] potential += 15;
                tags.push("👑 川田将雅×阪神：絶対的コース相性");
            }
        }
        if (jockey.includes("田口") && isDirt && dist === 1400) {
            // [減点方式] potential += 25;
            tags.push("🌟 田口貫太×阪神ダ1400m：減量特典を活かした穴の使者エッジ");
        }
        // 5. パワーと持続力に特化した血統バイアス
        var sireUpper = ((_37 = horse.sire) === null || _37 === void 0 ? void 0 : _37.toUpperCase()) || "";
        if (isDirt) {
            if (sireUpper.includes("ヘニーヒューズ") && dist === 1400) {
                // [減点方式] potential += 20;
                tags.push("🧬 阪神ダ1400m特注血統：ヘニーヒューズ産駒の極限適性");
            }
            if ((sireUpper.includes("シニスターミニスター") || sireUpper.includes("ドレフォン")) && frame >= 6) {
                // [減点方式] potential += 25;
                // [要見直し2] tags.push("🧬 阪神ダ外枠特注血統：パワーとスピードの融合(シニミニ/ドレフォン)");
            }
            if (sireUpper.includes("キングカメハメハ") || sireUpper.includes("ルーラーシップ")) {
                // [減点方式] potential += 15;
                tags.push("🧬 阪神急坂特注血統：急坂を苦にしないキンカメ系パワー");
            }
        }
        else if (isInnerTrack) {
            if (sireUpper.includes("ロードカナロア") || sireUpper.includes("エピファネイア") || sireUpper.includes("キズナ")) {
                // [減点方式] potential += 15;
                tags.push("🧬 阪神内回り特注血統：機動力とパワーを兼ね備えた持続力");
            }
        }
    }
    // ==========================================
    // 【京都競馬場 超特化型オメガ・プロトコル推論エンジン】
    // ==========================================
    var isKyoto = ((_38 = race.venue) === null || _38 === void 0 ? void 0 : _38.includes("京都")) || ((_39 = race.trackName) === null || _39 === void 0 ? void 0 : _39.includes("京都")) || ((_40 = race.raceName) === null || _40 === void 0 ? void 0 : _40.includes("京都"));
    if (isKyoto) {
        tags.push("⛩️ 京都特化OMEGAエンジン適用中");
        var isTurf = race.surface === "芝";
        var isDirt = race.surface === "ダート";
        var isOuterTrack = isTurf && [1600, 1800, 2200, 2400, 3000, 3200].includes(dist);
        var isInnerTrack = isTurf && !isOuterTrack;
        var isGradeOrSpecial = (_41 = race.raceName) === null || _41 === void 0 ? void 0 : _41.match(/(GⅠ|GⅡ|GⅢ|G1|G2|G3|GI|GII|GIII|重賞|特別|ステークス|カップ)/i);
        // 1. 人間系シナジーと特定の乗り替わり・騎乗適正
        // ② 岩田康誠騎手の「イン突き」エッジ (特別・重賞×1〜4枠)
        if (jockey.includes("岩田康") && frame <= 4 && isGradeOrSpecial) {
            // [減点方式] potential += 35;
            tags.push("👑 岩田康×京都イン突きエッジ");
        }
        else if (jockey.includes("岩田康") && frame <= 4) {
            // [減点方式] potential += 15;
            tags.push("👑 岩田康誠×京都内枠：必殺イン突きバイアス適合");
        }
        // ③ 川田将雅騎手の「剛腕先行押し切り」エッジ (芝2200m外回り)
        if (jockey.includes("川田") && isTurf && dist === 2200 &&
            (horse.style === "逃げ" || horse.style === "先行" || horse.style === "好位" || horse.style === "差し")) {
            // [減点方式] potential += 35;
            tags.push("👑 川田将雅×京都芝2200m先行押し切りエッジ");
        }
        else if (jockey.includes("川田") && isTurf && dist === 2200) {
            // [減点方式] potential += 20;
            tags.push("👑 川田将雅×京都芝2200m：先行持続・淀の坂下り最適化");
        }
        // 2. 馬体重のマイナス変動（究極の勝負気配と夏負け・輸送減りリスクのバランス）
        if (weightChange < 0 && weightChange >= -8) {
            /* [減点方式] potential += 8; */ // 的中率向上のため過剰加点を+15から+8へ抑制
            tags.push("🔥 京都絞り込み仕上げ");
            // オッズ偏差値が高い（人気薄の穴馬）場合、さらなる期待値ブースト
            if (popularity >= 6 || odds >= 10.0) {
                /* [減点方式] potential += 10; */ // +25から+10へ適正化
                tags.push("⚡ 京都仕上げ穴馬補正");
            }
        }
        // ① 馬体重減少（-4kg以上）× 内枠（1〜4枠）の「淀の坂越え」機動力補正 (芝内回り)
        if (isInnerTrack && weightChange <= -4 && frame <= 4) {
            // [減点方式] potential += 25;
            tags.push("⛰️ 淀の坂越え：馬体絞りイン立ち回り");
        }
        else if (weightChange <= -4 && frame <= 4) {
            // [減点方式] potential += 15;
            tags.push("📈 京都登坂物理:馬体絞り(-4kg以上)×内枠アドバンテージ");
        }
        // 3. 枠順バイアスの自動更新（トラックバイアスの激変適応）
        // 前半戦（1R〜6R）：内枠復活バイアス
        if (race.raceNumber <= 6) {
            if (frame <= 3) {
                // [減点方式] potential += 20;
                tags.push("📐 京都前半戦の内枠復活バイアス");
            }
        }
        else {
            // 後半戦（7R〜12R）：荒れ馬場外差し外枠バイアス
            if (frame >= 6) {
                // [減点方式] potential += 20;
                tags.push("📈 京都後半戦の外枠・イン避けバイアス");
            }
        }
        // 過去の京都好走実績によるコース相性補正
        if (horse.pastRaces && horse.pastRaces.length > 0) {
            var kyotoTop3 = horse.pastRaces.filter(function (pr) { var _a; return ((_a = pr.venue) === null || _a === void 0 ? void 0 : _a.includes("京都")) && pr.result <= 3; }).length;
            if (kyotoTop3 > 0) {
                // [減点方式] potential += 15;
                tags.push("\uD83D\uDC0E \u4EAC\u90FD\u5B9F\u7E3E\u99AC\u30EA\u30D4\u30FC\u30C8\u30A8\u30C3\u30B8(".concat(kyotoTop3, "\u56DE)"));
            }
        }
        // 京都適合血統（種牡馬）ブースト
        var sireUpper = ((_42 = horse.sire) === null || _42 === void 0 ? void 0 : _42.toUpperCase()) || "";
        var bloodlineUpper = ((_43 = horse.bloodline) === null || _43 === void 0 ? void 0 : _43.toUpperCase()) || "";
        if (sireUpper.includes("キタサンブラック") && isTurf && dist === 1400) {
            // [減点方式] potential += 20;
            tags.push("🧬 京都芝1400m適性：キタサンブラック産駒スタミナエッジ");
        }
        // ④ 改修後ダート（1800m）のスタミナ血統補正
        if (isDirt && dist === 1800 &&
            (sireUpper.includes("キズナ") || sireUpper.includes("サンダースノー") || sireUpper.includes("シニスターミニスター") || sireUpper.includes("ドレフォン") ||
                bloodlineUpper.includes("キズナ") || bloodlineUpper.includes("サンダースノー") || bloodlineUpper.includes("シニスターミニスター") || bloodlineUpper.includes("ドレフォン")) &&
            (horse.style === "逃げ" || horse.style === "先行" || horse.style === "好位")) {
            // [減点方式] potential += 30;
            tags.push("🧬 改修後タフダート：スタミナ・パワー血統エッジ");
        }
        else if ((sireUpper.includes("サンダースノー") || sireUpper.includes("キズナ")) && isDirt && dist === 1800) {
            // [減点方式] potential += 20;
            tags.push("🧬 京都ダ1800m適性：改修後タフダート適合血統(サンダースノー/キズナ)");
        }
        // ⑤ ハンデ戦（芝2400m）の「軽量馬優遇」と「実績不足の重斤量馬ペナルティ」
        var isHandicap = (_44 = race.raceName) === null || _44 === void 0 ? void 0 : _44.includes("ハンデ");
        var hasG1Record = (_45 = horse.pastRaces) === null || _45 === void 0 ? void 0 : _45.some(function (pr) {
            var _a, _b, _c, _d;
            return (((_a = pr.raceClass) === null || _a === void 0 ? void 0 : _a.toUpperCase()) === "G1" || ((_b = pr.raceClass) === null || _b === void 0 ? void 0 : _b.toUpperCase()) === "GⅠ" || ((_c = pr.raceName) === null || _c === void 0 ? void 0 : _c.includes("GⅠ")) || ((_d = pr.raceName) === null || _d === void 0 ? void 0 : _d.includes("G1"))) &&
                pr.result <= 2;
        });
        if (isHandicap && isTurf && dist === 2400) {
            if (kinryo <= 55 && (age === 4 || age === 5)) {
                // [減点方式] potential += 30;
                tags.push("⚖️ 軽量若駒ハンデ優遇(55kg以下)");
            }
            else if (kinryo <= 55) {
                // [減点方式] potential += 15;
                tags.push("⚖️ 京都芝2400mハンデ戦：軽量馬(55kg以下)絶対優位");
            }
            else if (kinryo >= 57 && !hasG1Record) {
                potential -= 35;
                tags.push("⚠️ 実績不足重ハンデペナルティ(57kg以上×GI実績なし)");
            }
            else if (kinryo >= 57) {
                potential -= 15;
                tags.push("⚠️ 京都芝2400mハンデ戦：実績不足重斤量(57kg以上)割引");
            }
        }
        // 芝外回りコースにおけるスリングショット効果（好位差し適合）と大外一気（追込届かず）の判定
        if (isOuterTrack) {
            if (horse.style === "逃げ" || horse.style === "先行" || horse.style === "好位" || horse.style === "差し") {
                // [減点方式] potential += 15;
                tags.push("📐 京都外回り物理:スリングショット効果好位差し適合");
            }
            else if (horse.style === "追込") {
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
            // [減点方式] potential += 40;
            tags.push("⚡ 京都特選:超大穴妙味期待値");
        }
        // 5. ベースライン補正（特殊馬具・ブリンカー＆栗東所属ホームアドバンテージと「関東(美浦)エリート遠征馬」の再評価）
        // 特殊馬具（ブリンカー着用）激変期待値
        if (horse.useBlinkers) {
            /* [減点方式] potential += 10; */ // 的中率向上のため+30から+10へ適正化（自滅リスク考慮）
            tags.push("🎯 京都ブリンカー着用適正化");
        }
        // 所属バイアス（栗東馬の圧倒的優位）と美浦エリート遠征馬のエッジ
        var isRittoKyoto = ((_46 = horse.stableLocation) === null || _46 === void 0 ? void 0 : _46.includes("栗東")) || ((_47 = horse.trainer) === null || _47 === void 0 ? void 0 : _47.includes("栗東")) || ((_48 = horse.trainer) === null || _48 === void 0 ? void 0 : _48.includes("美浦")) === false;
        if (isRittoKyoto) {
            /* [減点方式] potential += 20; */ // +35から+20へバランス調整
            tags.push("🏰 京都本家:栗東所属馬ホームエッジ");
        }
        else {
            if (isGradeOrSpecial) {
                /* [減点方式] potential += 15; */ // 特別・重賞に遠征してくる美浦の有力馬は逆にプラス評価（ルメール等の勝負遠征）
                tags.push("✈️ 京都遠征美浦精鋭馬エッジ");
            }
            else {
                potential -= 5; // 的中率低下防止のためアウェイ減点を-15から-5へ大幅緩和
                tags.push("⚠️ 美浦所属馬(京都アウェイ割引)");
            }
        }
    }
    // ==========================================
    // 【福島競馬場 超特化型オメガ・プロトコル推論エンジン】
    // ==========================================
    var isFukushimaSpecial = ((_49 = race.venue) === null || _49 === void 0 ? void 0 : _49.includes("福島")) || ((_50 = race.trackName) === null || _50 === void 0 ? void 0 : _50.includes("福島")) || ((_51 = race.raceName) === null || _51 === void 0 ? void 0 : _51.includes("福島"));
    if (isFukushimaSpecial) {
        tags.push("🐎 福島特化OMEGAエンジン適用中");
        // 福島芝2600m × ゴールドシップ産駒
        if (race.surface === "芝" && parseInt(dist || race.distance || "0", 10) === 2600) {
            if (horse.sire && horse.sire.includes("ゴールドシップ")) {
                potential += 30;
                tags.push("👑 福島芝2600m超鉄板: 3回走れば1回は馬券に絡む！タフな長丁場で無類のスタミナを誇るゴールドシップ産駒は無条件で買い");
            }
        }
    }
    // ==========================================
    // 【東京競馬場 超特化型オメガ・プロトコル推論エンジン】
    // ==========================================
    var isTokyo = ((_52 = race.venue) === null || _52 === void 0 ? void 0 : _52.includes("東京")) || ((_53 = race.trackName) === null || _53 === void 0 ? void 0 : _53.includes("東京")) || ((_54 = race.raceName) === null || _54 === void 0 ? void 0 : _54.includes("東京"));
    if (isTokyo) {
        // [要見直し2] tags.push("🗼 東京特化OMEGAエンジン適用中");
        var isTurf = race.surface === "芝";
        var isDirt = race.surface === "ダート";
        var isGradeOrSpecial = (_55 = race.raceName) === null || _55 === void 0 ? void 0 : _55.match(/(GⅠ|GⅡ|GⅢ|重賞|特別|ステークス|カップ)/);
        var isStrongHeadwind = race.isHeadwind && (race.windSpeed !== undefined && race.windSpeed >= 3.0);
        // 1. 人間系シナジーと陣営の意図
        // 馬具ブースト（ブリンカー着用）の評価適正化（芝・ダートと脚質の考慮）
        if (horse.useBlinkers) {
            if (isDirt && dist <= 1400) {
                // [減点方式] potential += 25;
                // [要見直し2] tags.push("🎯 東京ダート短距離：ブリンカー集中力バフ");
            }
            else if (isTurf && (horse.style === "逃げ" || horse.style === "先行")) {
                // [減点方式] potential += 15;
                tags.push("🔥 東京芝先行：ブリンカー勝負仕上げ");
            }
            else {
                /* [減点方式] potential += 5; */ // 差し・追込や芝長距離は自滅リスクを考慮して微加点
                tags.push("🎯 ブリンカー着用（自滅リスク考慮の微加点）");
            }
        }
        // C.ルメール騎手 × 8枠（大外）または距離短縮の黄金エッジ
        var isDistanceShortened = horse.pastRaces && horse.pastRaces[0] && horse.pastRaces[0].distance > dist;
        if (jockey.includes("ルメー")) {
            if (frame === 8) {
                // [減点方式] potential += 20;
                tags.push("👑 東京ルメール×8枠大外：抜群のコース取りエッジ");
            }
            if (isDistanceShortened) {
                // [減点方式] potential += 15;
                tags.push("👑 東京ルメール×距離短縮：スタミナを活かす絶妙なペース配分");
            }
        }
        // 「西高東低」の適正化（アウェイ栗東馬の過少評価排除と特別・重賞でのエッジ評価）
        var isMiho = ((_56 = horse.stableLocation) === null || _56 === void 0 ? void 0 : _56.includes("美浦")) || ((_57 = horse.trainer) === null || _57 === void 0 ? void 0 : _57.includes("美浦"));
        var isRitto = ((_58 = horse.stableLocation) === null || _58 === void 0 ? void 0 : _58.includes("栗東")) || ((_59 = horse.trainer) === null || _59 === void 0 ? void 0 : _59.includes("栗東")) || (!isMiho && horse.stableLocation === "栗東");
        if (isMiho && race.raceNumber <= 8 && !isGradeOrSpecial) {
            // [減点方式] potential += 10;
            tags.push("🏠 東京下級条件：美浦ホームアドバンテージ");
        }
        else if (isRitto && (race.raceNumber >= 9 || isGradeOrSpecial)) {
            // [減点方式] potential += 25;
            tags.push("✈️ メイン戦遠征関西馬(栗東)エッジ");
        }
        // 東京適合血統（種牡馬）ブースト
        var sireUpper = ((_60 = horse.sire) === null || _60 === void 0 ? void 0 : _60.toUpperCase()) || "";
        if (sireUpper.includes("キタサンブラック")) {
            if (isDirt) {
                /* [減点方式] potential += 30; */ // ダートで極めて強い
                tags.push("🧬 東京ダート適性：キタサンブラック産駒の圧倒的パフォーマンス");
            }
            else {
                // [減点方式] potential += 15;
                tags.push("🧬 東京適性：キタサンブラック産駒エッジ");
            }
        }
        else if (sireUpper.includes("パイロ") || sireUpper.includes("ジャスタウェイ")) {
            // [減点方式] potential += 10;
            tags.push("\uD83E\uDDEC \u6771\u4EAC\u9069\u6027\uFF1A".concat(horse.sire, "\u7523\u99D2\u7A74\u671F\u5F85(\u30BF\u30D5\u306A\u5C55\u958B\u306B\u5F37\u3044)"));
        }
        // 2. レースフェーズ（条件）と戦績データ・物理環境の連動評価
        if (isTurf) {
            if (race.raceNumber <= 5) {
                // 前半レース（下級条件）：前残り（逃げ・先行）有利
                if (horse.style === "逃げ" || horse.style === "先行") {
                    // [減点方式] potential += 20;
                    tags.push("📐 前半芝戦の先行・前残りアドバンテージ");
                }
            }
            else {
                // 後半レース（上級条件）：差し・追込（極上末脚）有利（向かい風によるバイアス変動）
                if (isStrongHeadwind) {
                    // 強風の直線向かい風：差し馬は風の壁で失速するリスクあり、先行・好位を優遇
                    if (horse.style === "先行" || horse.style === "好位") {
                        // [減点方式] potential += 30;
                        tags.push("🌬️ 強風向かい風直線：風よけ先行・好位エッジ");
                    }
                    else if (horse.style === "差し" || horse.style === "追込") {
                        /* [減点方式] potential += 10; */ // 大幅削減
                        tags.push("⚠️ 強風向かい風直線：外差し風の壁リスク割引");
                    }
                }
                else {
                    // 通常時または追い風：セオリー通りの末脚優遇
                    if (horse.style === "差し" || horse.style === "追込") {
                        // [減点方式] potential += 30;
                        tags.push("🏹 後半芝戦の極上外差し・末脚特注");
                    }
                    // 推定上がり3F of 補正（前走で速い上がりを繰り出した馬の加点）
                    if (horse.pastRaces && horse.pastRaces[0]) {
                        var last3fNum = parseFloat(horse.pastRaces[0].last3fTime || "36.0");
                        if (last3fNum > 0 && last3fNum <= 34.5) {
                            // [減点方式] potential += 15;
                            tags.push("\u26A1 \u524D\u8D70\u6975\u4E0A\u306E\u672B\u811A\u3092\u8A08\u6E2C(3F:".concat(last3fNum, "\u79D2)"));
                        }
                    }
                }
            }
        }
        else if (isDirt) {
            // ダート戦は一貫して先行力を最重視
            if (horse.style === "逃げ" || horse.style === "先行") {
                // [減点方式] potential += 30;
                tags.push("🏃 東京ダート：前残り先行アドバンテージ");
            }
            else if (horse.style === "差し" || horse.style === "追込") {
                // [減点方式] potential += 5;
                tags.push("⚠️ 東京ダート：差し届かずリスク割引");
            }
        }
        // 前走「芝レース」からの替わり（芝スタートでのスピードアドバンテージ）
        if (horse.pastRaces && horse.pastRaces[0]) {
            var prevRace_3 = horse.pastRaces[0];
            if (prevRace_3.surface === "芝") {
                // [減点方式] potential += 15;
                tags.push("🚀 東京ダート替わり：芝スタート芝ダッシュ期待馬");
            }
        }
        // 距離短縮ローテによるスタミナ優位性
        if (horse.pastRaces && horse.pastRaces[0]) {
            var prevRace_4 = horse.pastRaces[0];
            if (prevRace_4.distance > dist) {
                // [減点方式] potential += 12;
                tags.push("📈 距離短縮ローテ：タフな流れへのスタミナ適合");
            }
        }
        // 3. 空間物理解析（枠順バイアス）の動的調整
        if (isTurf) {
            if (dist === 2000) {
                // 東京芝2000mの罠（内枠過剰人気と外枠の物理的絶望）
                if (frame >= 4 && frame <= 6) {
                    // [減点方式] potential += 20;
                    tags.push("🎯 東京芝2000m：客観的期待値の中枠エッジ");
                }
                else if (frame <= 2) {
                    potential -= 5;
                    tags.push("⚠️ 東京芝2000m：内枠過剰人気・包まれ懸念割引");
                }
                else if (frame >= 7 && headCount >= 10) {
                    potential -= 25;
                    tags.push("❌ 東京芝2000m：多頭数外枠の物理的絶望ペナルティ");
                }
            }
            else {
                if (race.raceNumber <= 6) {
                    if (frame <= 3) {
                        // [減点方式] potential += 15;
                        tags.push("📐 前半芝レースの内枠ロスなしバイアス");
                    }
                }
                else {
                    if (frame >= 6) {
                        // [減点方式] potential += 20;
                        tags.push("📈 後半芝レースの馬場荒れ外伸びバイアス");
                    }
                }
            }
        }
        else if (isDirt) {
            if (dist === 1600) {
                // 東京ダート1600m（芝スタート外枠有利）
                if (frame >= 6) {
                    // [減点方式] potential += 25;
                    tags.push("⚡ 東ダ1600m：芝スタート外枠ダッシュエッジ");
                    // 外枠かつ「逃げ・先行」脚質への超強力シナジー補正
                    if (frame >= 7 && (horse.style === "逃げ" || horse.style === "先行")) {
                        // [減点方式] potential += 20;
                        tags.push("⚡ 東ダ1600m：芝スタート外枠×逃げ先行の黄金エッジ");
                    }
                }
                else if (frame <= 2) {
                    potential -= 15;
                    tags.push("⚠️ 東ダ1600m：内枠芝スタート距離短不利");
                }
            }
            else {
                // 一般的なダート：キックバック回避の外枠有利
                if (frame >= 6) {
                    // [減点方式] potential += 15;
                    // [要見直し2] tags.push("📈 ダート戦：砂被り回避の外枠優位");
                }
                else if (frame <= 2) {
                    potential -= 10;
                    tags.push("⚠️ ダート戦：砂被り・揉まれ内枠割引");
                }
            }
            // ダート馬場状態（砂の物理特性）に応じた適性補正
            if (condition === "良" || condition === "稍重") {
                // 乾燥馬場：キック力が吸い取られるため、パワーのある大型馬を優遇
                if (weight >= 490) {
                    // [減点方式] potential += 15;
                    // [要見直し2] tags.push("💪 乾燥東京ダート：大型パワー馬スタミナエッジ");
                }
            }
            else if (condition === "重" || condition === "不良") {
                // 水分を含んだ高速馬場：スピードタイプの軽量馬・快速馬を優遇
                if (weight > 0 && weight < 460) {
                    // [減点方式] potential += 12;
                    tags.push("⚡ 湿潤東京ダート：脚抜き良高速適性(軽量快速馬)");
                }
            }
        }
        // Bコース替わり週の内伸び回帰バイアス
        var isBCourse = ((_61 = race.raceName) === null || _61 === void 0 ? void 0 : _61.includes("Bコース")) || ((_62 = race.trackName) === null || _62 === void 0 ? void 0 : _62.includes("Bコース")) || ((_63 = race.raceName) === null || _63 === void 0 ? void 0 : _63.includes("B枠"));
        if (isBCourse && isTurf) {
            if (frame <= 3 && (horse.style === "逃げ" || horse.style === "先行" || horse.style === "好位")) {
                // [減点方式] potential += 20;
                tags.push("📐 Bコース物理：急激な内伸び回帰バイアス適合");
            }
        }
        // 過去の東京好走実績
        if (horse.pastRaces && horse.pastRaces.length > 0) {
            var tokyoTop3 = horse.pastRaces.filter(function (pr) { var _a; return ((_a = pr.venue) === null || _a === void 0 ? void 0 : _a.includes("東京")) && pr.result <= 3; }).length;
            if (tokyoTop3 > 0) {
                // [減点方式] potential += 15;
                tags.push("\uD83D\uDC0E \u6771\u4EAC\u5B9F\u7E3E\u99AC\u30EA\u30D4\u30FC\u30C8\u30A8\u30C3\u30B8(".concat(tokyoTop3, "\u56DE)"));
            }
        }
        // ==========================================
        // 【新設】東京的中率極限先鋭化ファクター (Tokyo Advanced Edge)
        // ==========================================
        // ① Dコース（仮柵移動）時の「物理的内枠先行優遇」と「大外回し距離ロス」
        var isDStage = ((_64 = race.raceName) === null || _64 === void 0 ? void 0 : _64.includes("Dコース")) || ((_65 = race.trackName) === null || _65 === void 0 ? void 0 : _65.includes("Dコース")) || ((_66 = race.raceName) === null || _66 === void 0 ? void 0 : _66.includes("D枠"));
        if (isDStage) {
            if (frame <= 3 && (horse.style === "逃げ" || horse.style === "先行" || horse.style === "好位")) {
                // [減点方式] potential += 30;
                tags.push("📐 東京Dコース物理:極小インラチ沿い最短経路アドバンテージ");
            }
            else if (frame >= 7 && (horse.style === "差し" || horse.style === "追込")) {
                potential -= 25;
                tags.push("⚠️ 東京Dコース物理:大外回し物理的距離ロス懸念(割引)");
            }
        }
        // ② 前走「小回り競馬場での大外回しロス」からの「広大な東京替わり」一変巻き返し
        if (horse.pastRaces && horse.pastRaces[0]) {
            var prevRace_5 = horse.pastRaces[0];
            var isShortTrack = /(中山|福島|小倉|函館|札幌|金沢|笠松|浦和|川崎)/.test(prevRace_5.venue || "");
            var isPrevBad = prevRace_5.result >= 6 && (prevRace_5.timeDiff !== undefined && prevRace_5.timeDiff >= 1.0);
            if (isShortTrack && isPrevBad) {
                // [減点方式] potential += 25;
                tags.push("🚀 コース替わり一変:小回り大外ロス → 広大な東京の直線解放期待");
                // 今走外枠の場合はさらなる解放ブースト
                if (frame >= 7) {
                    // [減点方式] potential += 15;
                    tags.push("🚀 外枠解放ブースト:揉まれず直線大外一気の期待");
                }
            }
        }
        // ③ 「東京マイスター」騎手 × 脚質・枠の黄金シナジー
        if (isTurf) {
            if (jockey.includes("ルメー") && (horse.style === "差し" || horse.style === "追込")) {
                // [減点方式] potential += 20;
                tags.push("👑 東京マイスター:ルメール極上末脚エッジ(仕掛けタイミング最適)");
            }
            else if (jockey.match(/(戸崎|菅原明|横山武)/) && (horse.style === "先行" || horse.style === "好位")) {
                // [減点方式] potential += 15;
                tags.push("🎯 東京マイスター:好位イン差し抜け出しエッジ");
            }
        }
        else if (isDirt) {
            if (jockey.match(/(川田|坂井)/) && (horse.style === "逃げ" || horse.style === "先行")) {
                // [減点方式] potential += 20;
                tags.push("⚡ 東京ダートマイスター:先行押し切りエッジ(前残り加速)");
            }
        }
        // 4. 馬体重変動の「トレンド」読み取り（勝ち切り安定と紐穴の分離）
        var absWeightChange = Math.abs(weightChange);
        if (weightChange >= 0 && weightChange <= 6) {
            // [減点方式] potential += 25;
            tags.push("🏆 東京勝ち切り条件：馬体重安定ゾーン（±0〜+6kg）");
        }
        else if (absWeightChange <= 8) {
            // [減点方式] potential += 15;
            tags.push("📈 東京馬体重安定トレンド（±8kg以内）");
        }
        else if (absWeightChange >= 10) {
            /* [減点方式] potential += 10; */ // 大幅増減は1着率低下のため小加点に抑制（紐穴）
            tags.push("⚠️ 大幅馬体重増減（2・3着激走の紐穴期待値）");
            if (popularity >= 6 || odds >= 12.0) {
                // [減点方式] potential += 10;
                tags.push("⚡ 大幅増減・妙味穴馬補正");
            }
        }
        // 5. 券種別チューニングと「オッズ偏差値」の先鋭化
        // ① 東京の超高速芝における限界時計の反動ペナルティの判定
        if (isTurf && prevRace && prevRace.surface === '芝' && prevRace.time && race.date && prevRace.date) {
            var prevDate = new Date(prevRace.date);
            var currDate = new Date(race.date);
            var diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
            var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays <= 35) { // 中4週以下
                var prevSeconds = parseTimeToSeconds(prevRace.time);
                var prevDist = prevRace.distance;
                var isLimitTime = false;
                // 前走距離別の限界時計（激走）の判定
                if (prevDist === 1000 && prevSeconds <= 54.5)
                    isLimitTime = true;
                else if (prevDist === 1200 && prevSeconds <= 67.5)
                    isLimitTime = true;
                else if (prevDist === 1400 && prevSeconds <= 80.0)
                    isLimitTime = true;
                else if (prevDist === 1600 && prevSeconds <= 91.8)
                    isLimitTime = true;
                else if (prevDist === 1800 && prevSeconds <= 104.5)
                    isLimitTime = true;
                else if (prevDist === 2000 && prevSeconds <= 117.2)
                    isLimitTime = true;
                else if (prevDist === 2400 && prevSeconds <= 143.5)
                    isLimitTime = true;
                // 前走5着以内で激走しており、今回上位人気（3番人気以内）
                if (isLimitTime && prevRace.result <= 5 && popularity <= 3) {
                    potential -= 25;
                    tags.push("⚠️ 超高速馬場激走の反動ペナルティ(中4週内)");
                }
            }
        }
        // ② 直線だんだら坂の勾配適性判定
        var hasSlopeAptitude = false;
        // A. 急坂競馬場での好走実績判定
        if (horse.pastRaces && horse.pastRaces.length > 0) {
            var steepVenues_1 = ["中山", "阪神", "中京", "小倉", "福島", "函館"];
            var hasSteepGoodRecord = horse.pastRaces.some(function (pr) {
                var isSteep = steepVenues_1.some(function (sv) { var _a; return (_a = pr.venue) === null || _a === void 0 ? void 0 : _a.includes(sv); });
                return isSteep && pr.result <= 3;
            });
            if (hasSteepGoodRecord) {
                hasSlopeAptitude = true;
            }
        }
        // B. 調教加速ラップ・しぶとさ判定
        if (horse.trainingTime) {
            var timeStr = horse.trainingTime;
            var timeNumbers = timeStr
                .replace(/[\[\]\(\)（）]/g, ' ')
                .split(/[\s\- \t]/)
                .map(function (part) { return parseFloat(part.trim()); })
                .filter(function (num) { return !isNaN(num) && num > 0 && num < 100; });
            var isSlope = timeStr.includes("坂路") || timeStr.includes("坂");
            var isWood = timeStr.includes("ウッド") || timeStr.includes("南W") || timeStr.includes("Ｗ");
            if (timeNumbers.length >= 3) {
                var last1f = timeNumbers[timeNumbers.length - 1];
                var last2f = timeNumbers[timeNumbers.length - 2];
                if (last1f <= last2f + 0.2) { // 減速幅が0.2秒以内か、加速ラップ
                    hasSlopeAptitude = true;
                    if (last1f < last2f) {
                        tags.push("⛰️ 調教加速ラップ：だんだら坂しぶとさ適合");
                    }
                }
            }
        }
        if (hasSlopeAptitude) {
            // [減点方式] potential += 20;
            if (!tags.some(function (t) { return t.includes("だんだら坂しぶとさ"); })) {
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
            var dynamicBoost = Math.min(15, Math.floor(odds / 4)); // 大穴過剰評価を防ぐため最大15点に制限
            /* [要見直し2] */ potential += dynamicBoost;
            // [要見直し2] tags.push(`⚡ 東京特選:オッズ逆数期待値ブースト(+${dynamicBoost})`);
        }
    }
    // ==========================================
    // 【門別競馬場 超特化型オメガ・プロトコル推論エンジン】
    // ==========================================
    var isMombetsu = ((_67 = race.venue) === null || _67 === void 0 ? void 0 : _67.includes("門別")) || ((_68 = race.trackName) === null || _68 === void 0 ? void 0 : _68.includes("門別")) || ((_69 = race.raceName) === null || _69 === void 0 ? void 0 : _69.includes("門別"));
    if (isMombetsu) {
        tags.push("🌾 門別特化OMEGAエンジン適用中");
        // 1. 空間・展開バイアスの学習（外枠＆先行力重視）
        // 外枠（特に8枠）特注加点
        if (frame >= 5) {
            // [減点方式] potential += 25;
            tags.push("🌾 門別外枠アドバンテージ");
            if (frame === 8) {
                // [減点方式] potential += 15;
                tags.push("⚡ 門別大外8枠・大爆撃エッジ");
            }
        }
        // 先行力（前走の4角通過順位）の最大重視（上がりタイムより先行力）
        var isFrontRunner = horse.style === "逃げ" || horse.style === "先行";
        if (isFrontRunner) {
            // [減点方式] potential += 30;
            tags.push("🏃 門別前残り・極限先行アドバンテージ");
        }
        // 前走4角位置の補正
        if (horse.pastRaces && horse.pastRaces[0]) {
            var pr = horse.pastRaces[0];
            var passing = pr.passingPositions || "";
            var lastPos = parseInt(passing.split("-").pop() || "0");
            if (lastPos > 0 && lastPos <= 4) {
                // [減点方式] potential += 20;
                tags.push("\u26A1 \u9580\u5225\u7279\u9078:\u524D\u8D704\u89D24\u756A\u624B\u4EE5\u5185\u30AD\u30FC\u30D7(4\u89D2:".concat(lastPos, "\u756A\u624B)"));
            }
        }
        // 2. 人間系シナジー「トップジョッキー × 有力厩舎」コンビフラグ
        var trainerName_1 = horse.trainer || "";
        var eliteJockeysM = ["桑村", "落合", "阿部", "小野", "岩橋", "石川", "服部"];
        var isEliteJockeyM = eliteJockeysM.some(function (ej) { return jockey.includes(ej); });
        var eliteTrainersM = ["角川", "佐々木", "佐々国", "田中淳", "黒川", "小国", "田中正"];
        var isEliteTrainerM = eliteTrainersM.some(function (et) { return trainerName_1.includes(et); });
        if (isEliteJockeyM) {
            /* [減点方式] potential += 25; */ // 騎手単体でも強力に加点
            tags.push("👑 門別トップジョッキー信頼度");
            if (isEliteTrainerM) {
                /* [減点方式] potential += 20; */ // コンビで合計+45
                tags.push("🌟 門別黄金コンビ:トップジョッキー×有力厩舎");
            }
        }
        else {
            potential -= 10; // トップ騎手でない場合は的中率向上のため割引
        }
        // 門別実績（近走実績）の追加
        if (horse.pastRaces && horse.pastRaces[0]) {
            var pr = horse.pastRaces[0];
            if (pr.result <= 3) {
                // [減点方式] potential += 20;
                tags.push("📈 門別実績: 前走好走の堅実性");
            }
            if (((_70 = pr.venue) === null || _70 === void 0 ? void 0 : _70.includes("門別")) && pr.result <= 2) {
                // [減点方式] potential += 15;
                tags.push("🥇 門別適性: 同コース連続好走の鉄板度");
            }
        }
        // 3. 馬券種マルチタスク学習（仕上がり安定とヒモ大穴激走）
        // 仕上がり安定馬
        if (Math.abs(weightChange) <= 8) {
            // [減点方式] potential += 20;
            tags.push("📈 門別仕上がり安定(馬体重増減なし・微小)");
        }
        // 牝馬ボーナス（適正化）
        if (gender === "牝") {
            /* [減点方式] potential += 5; */ // 20から5に減らして過剰評価を防ぐ
            tags.push("🐎 門別牝馬エッジ(微加点)");
        }
        // 2着・3着（ヒモ穴）モデルの期待値（大幅体重増減・減量騎手）
        var absWeightChange = Math.abs(weightChange);
        if (absWeightChange >= 10) {
            if (popularity >= 6 || odds >= 12.0) {
                /* [減点方式] potential += 15; */ // 25から15へ
                tags.push("⚡ 門別特選:大幅馬体重変則仕上げ妙味");
            }
        }
        // 減量騎手フラグ（適正化）
        var isApprentice = jockey.match(/^[▲△☆◇]/) || jockey.includes("減量") || jockey.includes("▲") || jockey.includes("△");
        if (isApprentice) {
            if (isFrontRunner) {
                /* [減点方式] potential += 10; */ // 30から10へ
                tags.push("🏃 門別減量騎手×先行力");
            }
            else {
                potential -= 15; // 差し追込の減量騎手は割引
                tags.push("⚠️ 門別減量騎手×控える競馬(割引)");
            }
        }
        // ==========================================
        // 【アップデート】門別特化・究極ナレッジデータ 統合フラグ判定
        // ==========================================
        // 1. 【1着固定の絶対軸】落合玄騎手 × 上位人気（1〜2番人気）
        if (jockey.includes("落合玄") && popularity <= 2) {
            // [減点方式] potential += 50;
            tags.push("👑 門別絶対軸: 落合玄×上位人気(連対率100%コンボ)");
        }
        // 2. 【ベースの安定感】単勝1番人気馬
        if (popularity === 1) {
            // [減点方式] potential += 30;
            tags.push("🎯 門別ベース安定: 単勝1番人気(連対率83%)");
        }
        // 3. 【ヒモ（相手）の最適解】3番人気〜5番人気馬
        if (popularity >= 3 && popularity <= 5) {
            // [減点方式] potential += 25;
            tags.push("🥈 門別相手最適解: 3〜5番人気のヒモ妙味");
        }
    }
    // ==========================================
    // 【笠松競馬場 超特化型オメガ・プロトコル推論エンジン】
    // ==========================================
    var isKasamatsu = ((_71 = race.venue) === null || _71 === void 0 ? void 0 : _71.includes("笠松")) || ((_72 = race.trackName) === null || _72 === void 0 ? void 0 : _72.includes("笠松")) || ((_73 = race.raceName) === null || _73 === void 0 ? void 0 : _73.includes("笠松"));
    if (isKasamatsu) {
        tags.push("🌾 笠松特化OMEGAエンジン適用中");
        // 1. レース条件・展開特徴量（前半差し・後半先行）
        if (race.raceNumber <= 5) {
            // 前半レース（1R〜5R／下位条件）：差し・追込（末脚）有利
            if (horse.style === "差し" || horse.style === "追込") {
                // [減点方式] potential += 25;
                tags.push("📐 前半戦の上がり末脚特化バイアス");
            }
        }
        else {
            // 後半レース（6R〜10R／上位クラス）：前残り（逃げ・先行）絶対有利
            if (horse.style === "逃げ" || horse.style === "先行") {
                // [減点方式] potential += 30;
                tags.push("🏃 後半戦の先行・前残りアドバンテージ");
            }
        }
        // 2. 馬の基本属性・状態特徴量
        // 牝馬および4歳馬の圧倒的勝率
        if (gender === "牝") {
            // [減点方式] potential += 20;
            tags.push("🐎 笠松牝馬エッジ");
        }
        if (age === 4) {
            // [減点方式] potential += 20;
            tags.push("📈 笠松4歳馬成長エッジ");
        }
        // 馬体重マイナス変動（絞り仕上げ肯定）
        if (weightChange < 0) {
            // [減点方式] potential += 15;
            tags.push("🔥 笠松絞り込み勝負仕上げ(マイナス体重差)");
        }
        // 3. 斤量と馬格（斤量比率）の相関特徴量
        var weightVal = weight || 450;
        var loadRatio = (kinryo / weightVal) * 100;
        // 1着（本命）候補
        if (kinryo === 55) {
            // [減点方式] potential += 25;
            tags.push("🎯 笠松黄金斤量55kg(勝率トップ)");
        }
        if (loadRatio >= 10.0 && loadRatio <= 12.5) {
            // [減点方式] potential += 20;
            tags.push("\uD83D\uDCD0 \u9EC4\u91D1\u65A4\u91CF\u6BD4\u7387\u30AF\u30EA\u30A2(\u6BD4\u7387:".concat(loadRatio.toFixed(1), "%)"));
        }
        if (kinryo === 57 && race.raceNumber >= 6) {
            // [減点方式] potential += 20;
            tags.push("💪 上級戦57kg実績馬アドバンテージ");
        }
        // 2・3着（ヒモ穴）候補
        if (kinryo <= 54) {
            // [減点方式] potential += 20;
            tags.push("⚡ 門前軽量斤量(複勝率バイアス)");
        }
        if (loadRatio >= 13.5 && loadRatio <= 15.5) {
            // [減点方式] potential += 25;
            tags.push("\u26A1 \u8EFD\u91CF\u5C0F\u67C4\u99AC\u30FB2/3\u7740\u6FC0\u8D70\u30D5\u30E9\u30B0(\u6BD4\u7387:".concat(loadRatio.toFixed(1), "%)"));
        }
        // 4. 過去実績・能力特徴量
        if (horse.pastRaces && horse.pastRaces[0]) {
            var pr = horse.pastRaces[0];
            // アタマ候補の条件
            if (pr.result > 0 && pr.result <= 3) {
                // [減点方式] potential += 25;
                tags.push("🏆 前走3着以内・堅実能力値");
            }
            // タイム差1.0秒未満
            if (pr.timeDiff !== undefined && pr.timeDiff < 1.0) {
                // [減点方式] potential += 20;
                tags.push("📐 前走僅差仕上げ期待値");
            }
            // 他地区・JRAからの転入馬補正（大敗の無効化と転入ボーナス）
            var hasAwayRace = horse.pastRaces.some(function (p) { var _a; return (_a = p.venue) === null || _a === void 0 ? void 0 : _a.match(/(JRA|東京|中山|京都|阪神|新潟|中京|小倉|福島|函館|札幌|大井|川崎|船橋|浦和|門別)/); });
            if (hasAwayRace) {
                // [減点方式] potential += 30;
                tags.push("🏹 中央・他地区からの転入ボーナス");
            }
            // 近走大敗からの巻き返しヒモ穴候補（過去5走以内に連対実績あり）
            var isRecentBad = pr.result >= 6;
            var hasTop2Past = horse.pastRaces.slice(0, 5).some(function (p) { return p.result > 0 && p.result <= 2; });
            if (isRecentBad && hasTop2Past) {
                // [減点方式] potential += 20;
                tags.push("⚡ 過去5走内好走馬の巻き返し激走期待値");
            }
        }
        // 5. 騎手・枠順のバイアス特徴量（1着と2・3着の分離）
        // 【アップデート】笠松特化・騎手×人気階層プロトコル
        if (popularity === 1) {
            // [減点方式] potential += 20;
            tags.push("🎯 笠松ベース安定: 単勝1番人気(複勝率75%)");
        }
        if ((jockey.includes("渡邊竜") || jockey.includes("渡辺竜") || jockey.includes("渡邊")) && popularity <= 2) {
            // [減点方式] potential += 45;
            tags.push("👑 笠松鉄板軸: 渡邊竜也×上位人気(1着固定特注)");
        }
        else if (jockey.includes("筒井") && popularity <= 3) {
            // [減点方式] potential += 35;
            tags.push("🥈 笠松連対特注: 筒井勇×上位人気(高確率で2着確保)");
        }
        else if (jockey.includes("松本一") && (popularity === 5 || popularity === 6)) {
            // [減点方式] potential += 40;
            tags.push("💣 笠松波乱の使者: ☆松本一×中穴(ヒモ荒れ特注)");
        }
        else if (jockey.includes("塚本征")) {
            // [減点方式] potential += 25;
            tags.push("🌟 笠松好調騎手:塚本征吾(1着バイアス)");
        }
        else if (jockey.includes("望月")) {
            // [減点方式] potential += 20;
            tags.push("⚡ 笠松ヒモ穴特注騎手(2・3着激走)");
        }
        // 枠順バイアス
        if (frame === 5) {
            // [減点方式] potential += 20;
            tags.push("📐 笠松勝率No.1の5枠");
        }
        else if (frame === 6) {
            // [減点方式] potential += 15;
            tags.push("📐 万能枠順の6枠");
        }
        else if (frame === 1) {
            // [減点方式] potential += 20;
            tags.push("📐 最内枠ロス軽減イン差し枠");
        }
        else if (frame === 8) {
            // [減点方式] potential += 15;
            tags.push("📐 大外8枠・2着確保バイアス");
        }
        // ==========================================
        // 【新設】笠松的中率極限先鋭化ファクター (Kasamatsu Advanced Edge)
        // ==========================================
        // ① 800m戦（電撃スプリント）における全天候外枠絶対優位と内枠自滅リスク
        if (dist === 800) {
            if (frame >= 7) {
                // [減点方式] potential += (condition === '重' || condition === '不良') ? 40 : 25;
                tags.push("🚀 笠松800m:外枠スムーズ加速アドバンテージ(砂被りなし)");
            }
            else if (frame === 1) {
                potential -= (condition === '重' || condition === '不良') ? 45 : 30;
                tags.push("❌ 笠松800m:最内1枠の包まれ砂被り自滅リスク排除");
            }
        }
        // ② 雨・重・不良馬場（泥馬場）時の「砂流出イン高速伸び」バイアス
        if (condition === '重' || condition === '不良') {
            if (frame <= 3 && (horse.style === "逃げ" || horse.style === "先行")) {
                // [減点方式] potential += 25;
                tags.push("☔ 笠松道悪物理:内ラチ沿い砂流出による高速イン伸びアドバンテージ");
            }
        }
        // ③ JRA未勝利交流戦における圧倒的レベル差の実力非対称補正
        var isExchange = (_74 = race.raceName) === null || _74 === void 0 ? void 0 : _74.match(/(交流|中央|JRA)/);
        if (isExchange) {
            var isJRA_1 = horse.transferFrom === 'JRA' || ((_75 = horse.stableLocation) === null || _75 === void 0 ? void 0 : _75.match(/(栗東|美浦)/)) || ((_76 = horse.trainer) === null || _76 === void 0 ? void 0 : _76.match(/(栗東|美浦)/));
            if (isJRA_1) {
                // [減点方式] potential += 50;
                tags.push("🚀 笠松交流戦:JRA所属の圧倒的レベル差優位(確勝気配)");
            }
            else if (((_77 = horse.belonging) === null || _77 === void 0 ? void 0 : _77.includes("笠松")) || ((_78 = horse.trainer) === null || _78 === void 0 ? void 0 : _78.includes("笠松"))) {
                potential -= 25;
                tags.push("⚠️ 笠松交流戦:地元笠松所属馬の実力レベル差割引");
            }
        }
        // ④ 「笹野博司厩舎 × 渡邊竜也騎手」の連対率60%超黄金勝負ヤリライン
        var trainerName = horse.trainer || '';
        if (trainerName.includes("笹野") && (jockey.includes("渡邊") || jockey.includes("渡辺"))) {
            if (popularity <= 2) {
                // [減点方式] potential += 45;
                tags.push("👑 笠松最強黄金タッグ:笹野×渡邊(勝負ヤリ1着固定)");
            }
            else {
                // [減点方式] potential += 25;
                tags.push("👑 笠松最強黄金タッグ:笹野×渡邊(実力信頼)");
            }
        }
    }
    // ==========================================
    // 【金沢競馬場 超特化型オメガ・プロトコル推論エンジン】
    // ==========================================
    var isKanazawa = ((_79 = race.venue) === null || _79 === void 0 ? void 0 : _79.includes("金沢")) || ((_80 = race.trackName) === null || _80 === void 0 ? void 0 : _80.includes("金沢")) || ((_81 = race.raceName) === null || _81 === void 0 ? void 0 : _81.includes("金沢"));
    if (isKanazawa) {
        tags.push("🌾 金沢特化OMEGAエンジン適用中");
        var hStyle_1 = horse.style || '中団';
        // 1. 馬体重・成長バイアス（フィジカルパラメータ）
        if (weightChange <= -10 && weightChange >= -20) {
            // [減点方式] potential += 30;
            tags.push('金沢:極限の仕上げ(激走フラグ)');
        }
        else if (weightChange > 16) {
            potential -= 25;
            tags.push('⚠️金沢:過剰な馬体増(割引)');
        }
        else if (age <= 3 && weightChange >= 10 && weightChange <= 14) {
            // [減点方式] potential += 30;
            tags.push('金沢:若駒成長シナジー(大幅増)');
        }
        if (gender === "牝") {
            // [減点方式] potential += 20;
            tags.push("🐎 金沢牝馬エッジ");
        }
        // 2. 空間物理・砂地獄・脚質シナジー（枠順バイアスの一元化）
        var isHeavyMud = condition === '重' || condition === '不良';
        if (!isHeavyMud) {
            // 良馬場・稍重：内ラチ沿いの砂が極端に深く、最内1枠は底なし沼を走らされるため大幅割引
            if (frame === 1) {
                potential -= 30;
                tags.push("⚠️ 金沢名物:イン砂地獄(底なし沼)1枠リスク割引");
            }
            else if (frame === 2) {
                potential -= 25;
                tags.push("⚠️ 金沢:2枠イン砂深割引");
            }
            else if (frame === 8) {
                // [減点方式] potential += 35;
                tags.push("📈 金沢特有:大外8枠スムーズ外伸びアドバンテージ");
            }
            else if (frame === 7) {
                // [減点方式] potential += 30;
                tags.push("📈 金沢:7枠外伸びエッジ");
            }
            else if (frame === 5 || frame === 6) {
                // [減点方式] potential += 20;
                tags.push("📈 金沢:中外枠アドバンテージ");
            }
            else if (frame === 4) {
                potential -= 15;
                tags.push("⚠️ 金沢:4枠包まれ懸念");
            }
        }
        else {
            // 重・不良：逆にインラチ沿いの砂が固まり、一時的に高速イン伸び化
            if (frame <= 2 && (hStyle_1 === "逃げ" || hStyle_1 === "先行")) {
                // [減点方式] potential += 25;
                tags.push("☔ 金沢道悪物理:泥馬場イン締まり高速イン逃げエッジ");
            }
        }
        // 脚質×枠順シナジー
        if ((hStyle_1 === '逃げ' || hStyle_1 === '先行') && (frame === 1 || frame === 2)) {
            if (popularity <= 3) {
                potential -= 20;
                tags.push('⚠️危険な人気馬(内枠×先行 of 罠)');
            }
        }
        else if ((hStyle_1 === '中団' || hStyle_1 === '後方') && (frame >= 5 && frame <= 7)) {
            // [減点方式] potential += 25;
            tags.push('🚀金沢シナジー(外枠×差し)');
        }
        // 3. 「金沢の絶対神」吉原寛人騎手 ＆ リーディングトップ勢 of 圧倒的支配力
        if (jockey.includes("吉原")) {
            if (popularity <= 2) {
                // [減点方式] potential += 50;
                tags.push("👑 金沢の絶対神:吉原寛人(勝負ヤリ1着固定)");
            }
            else {
                // [減点方式] potential += 30;
                tags.push("👑 金沢の絶対神:吉原寛人(異次元技術バフ)");
            }
        }
        else if (jockey.match(/(青柳|中島龍|栗原)/)) {
            // [減点方式] potential += 20;
            tags.push("🌟 金沢リーディング上位騎手(1着バイアス)");
        }
        // 4. 逃げ・先行圧倒的有利のワンターン超小回りバイアス
        if (hStyle_1 === "逃げ" || hStyle_1 === "先行") {
            // [減点方式] potential += 35;
            tags.push("🏃 金沢超小回り:前残り先行絶対有利");
        }
        else if (hStyle_1 === "追込") {
            potential -= 25;
            tags.push("⚠️ 金沢超小回り:直線極短・差し届かずリスク割引");
        }
        // 5. 他地区・JRAからの転入格上＆超有力厩舎勝負仕上げ
        var trainerName = horse.trainer || '';
        if (trainerName.match(/(中川雅|金田一)/)) {
            // [減点方式] potential += 25;
            tags.push("🏰 金沢超エリート厩舎:勝負メイチ仕上げ");
        }
        var hasAwayExp = horse.pastRaces && horse.pastRaces.some(function (p) { var _a; return (_a = p.venue) === null || _a === void 0 ? void 0 : _a.match(/(JRA|大井|川崎|船橋|浦和|門別)/); });
        if (hasAwayExp && horse.pastRaces && horse.pastRaces[0] && (((_82 = horse.pastRaces[0].venue) === null || _82 === void 0 ? void 0 : _82.includes("金沢")) === false)) {
            // [減点方式] potential += 30;
            tags.push("🚀 転入エッジ:他地区・中央からの格上スピード能力差");
        }
    }
    // ==========================================
    // 【船橋競馬場 超特化型オメガ・プロトコル推論エンジン】
    // ==========================================
    var isFunabashi = ((_83 = race.venue) === null || _83 === void 0 ? void 0 : _83.includes("船橋")) || ((_84 = race.trackName) === null || _84 === void 0 ? void 0 : _84.includes("船橋")) || ((_85 = race.raceName) === null || _85 === void 0 ? void 0 : _85.includes("船橋"));
    if (isFunabashi) {
        tags.push("🚢 船橋特化OMEGAエンジン適用中");
        // 1. スパイラルカーブ物理（地方最大級の差し有利バイアス）
        // 船橋はコーナー出口がキツく、遠心力で前が外に膨らむため、差し・追込が極めて決まりやすい
        if (horse.style === "差し" || horse.style === "追込" || horse.style === "マクリ") {
            // [減点方式] potential += 25;
            tags.push("🎯 船橋スパイラルカーブ: 外差し・追込の強襲エッジ");
        }
        // 2. オーストラリア産白砂のパワーと含水率変化
        if (weight >= 500) {
            // [減点方式] potential += 20;
            tags.push("💪 船橋白砂適合: 500kg以上の大型パワー馬");
        }
        var isWetF = race.condition === "重" || race.condition === "不良";
        if (isWetF && (horse.style === "逃げ" || horse.style === "先行")) {
            // [減点方式] potential += 20;
            tags.push("☔ 船橋道悪特注: 砂が締まった際の超高速前残り");
        }
        // 3. 左回り巧者の判別（過去走の左回り実績）
        if (horse.pastRaces && horse.pastRaces.length > 0) {
            var hasLeftHandAptitude = horse.pastRaces.some(function (pr) { var _a; return ((_a = pr.venue) === null || _a === void 0 ? void 0 : _a.match(/(東京|中京|新潟|川崎|船橋|浦和|盛岡)/)) && pr.result <= 3; });
            if (hasLeftHandAptitude) {
                // [減点方式] potential += 15;
                tags.push("🔄 左回り巧者: 左回りコース好走実績");
            }
        }
        // 4. 船橋名門「地元エリート」シナジー
        var trainerNameF_1 = horse.trainer || "";
        var eliteJockeysF = ["森泰", "本田正", "張田", "笹川", "御神本", "吉原"];
        var isEliteJockeyF = eliteJockeysF.some(function (j) { return jockey.includes(j); });
        var eliteTrainersF = ["川島正", "新井清", "張田京", "矢野義", "林正人"];
        var isEliteTrainerF = eliteTrainersF.some(function (t) { return trainerNameF_1.includes(t); });
        if (isEliteJockeyF) {
            // [減点方式] potential += 20;
            tags.push("👑 船橋トップジョッキー信頼度");
            if (isEliteTrainerF) {
                // [減点方式] potential += 20;
                tags.push("🌟 船橋地元名門シナジー: トップ騎手×地元名門厩舎");
            }
        }
    }
    // ==========================================
    // 【川崎競馬場 超特化型オメガ・プロトコル推論エンジン】
    // ==========================================
    var isKawasaki = ((_86 = race.venue) === null || _86 === void 0 ? void 0 : _86.includes("川崎")) || ((_87 = race.trackName) === null || _87 === void 0 ? void 0 : _87.includes("川崎")) || ((_88 = race.raceName) === null || _88 === void 0 ? void 0 : _88.includes("川崎"));
    if (isKawasaki) {
        tags.push("🐎 川崎特化OMEGAエンジン適用中");
        var hStyle_2 = horse.style || '中団';
        var trainerName = horse.trainer || '';
        // 1. 馬体重・成長バイアス・馬格（フィジカルパラメータ）
        if (weightChange <= -10 && weightChange >= -20) {
            // [減点方式] potential += 30;
            tags.push('川崎:極限の仕上げ(激走フラグ)');
        }
        else if (weightChange <= -25) {
            potential -= 25;
            tags.push('❌川崎:過剰な馬体減(消耗懸念)');
        }
        else if (age <= 3 && weightChange >= 10 && weightChange <= 14) {
            // [減点方式] potential += 30;
            tags.push('川崎:若駒成長シナジー(大幅増)');
        }
        else if (weightChange > 16) {
            potential -= 25;
            tags.push('⚠️川崎:過剰な馬体増(割引)');
        }
        if (weight >= 500) {
            // [減点方式] potential += 25;
            tags.push("💪 川崎タフ良馬場・大型パワー馬アドバンテージ");
        }
        // 2. 基本属性
        if (gender === "牝") {
            // [減点方式] potential += 20;
            tags.push("🐎 川崎牝馬アドバンテージ(ダート割引無効化)");
        }
        if (age <= 4) {
            // [減点方式] potential += 20;
            tags.push("📈 川崎ヤングジェネレーションエッジ");
        }
        // 血統（種牡馬適性）
        var isSpecialSire = bloodline.includes("ミスターメロディ") || bloodline.includes("エスポワールシチー");
        var isRecommendedSire = bloodline.includes("パイロ") || bloodline.includes("ホッコータルマエ") || bloodline.includes("ダノンレジェンド") || bloodline.includes("ゴールドドリーム");
        if (isSpecialSire) {
            // [減点方式] potential += 30;
            tags.push("🧬 川崎特注ダート血統(勝負気配)");
        }
        else if (isRecommendedSire) {
            // [減点方式] potential += 20;
            tags.push("🧬 川崎ダート実績血統補正");
        }
        // 3. 空間物理と脚質シナジー（枠順バイアスの一元化）
        // 枠順バイアス
        if (frame === 8) {
            // [減点方式] potential += 35;
            tags.push("⚠️ 川崎8枠:外目スムーズ加速エッジ");
            if (popularity >= 6 || odds >= 12.0) {
                // [減点方式] potential += 20;
                tags.push("⚡ 大外8枠・複勝ヒモ穴エッジ");
            }
        }
        else if (frame === 7) {
            // [減点方式] potential += 30;
            tags.push("📐 川崎7枠:好走バイアス");
        }
        else if (frame === 4 || frame === 5 || frame === 6) {
            // [減点方式] potential += 25;
            tags.push("📐 川崎勝率No.1 of 中枠エッジ");
        }
        else if (frame === 2) {
            potential -= 25;
            tags.push("⚠️ 川崎2枠:窮屈・割引");
        }
        else if (frame === 1) {
            potential -= 15;
            tags.push("⚠️ 川崎1枠:包まれ砂被りリスク");
        }
        // 脚質×枠順シナジー
        if ((hStyle_2 === '逃げ' || hStyle_2 === '先行') && (frame === 1 || frame === 2)) {
            if (popularity <= 3) {
                potential -= 20;
                tags.push('⚠️危険な人気馬(内枠×先行 of 罠)');
            }
        }
        else if ((hStyle_2 === '中団' || hStyle_2 === '後方') && (frame >= 5 && frame <= 7)) {
            // [減点方式] potential += 25;
            tags.push('🚀川崎シナジー(外枠×差し)');
        }
        // 後半戦（6R〜12R）の内枠（1,2枠）インラチ復活バイアス
        if (race.raceNumber >= 6 && (frame === 1 || frame === 2) && !tags.some(function (t) { return t.includes("割引") || t.includes("リスク"); })) {
            // [減点方式] potential += 20;
            tags.push("📐 川崎後半戦 of イン復活ロスなし補正");
        }
        // 距離別ペース予想
        if (dist <= 900) {
            if (hStyle_2 === "逃げ" || hStyle_2 === "先行") {
                // [減点方式] potential += 35;
                tags.push("🏃 川崎900m電撃スプリント補正");
            }
        }
        else if (dist >= 1400) {
            if (hStyle_2 === "差し" || hStyle_2 === "追込") {
                // [減点方式] potential += 20;
                tags.push("💪 川崎1400m以上タフな持久戦補正");
            }
        }
        // 4. 南関東エリア・厩舎（ヒエラルキーと勝負仕上げバイアス）
        var isKawasakiHome = ((_89 = horse.stableLocation) === null || _89 === void 0 ? void 0 : _89.includes("川崎")) || trainerName.includes("川崎") || (!horse.stableLocation && ((_90 = horse.belonging) === null || _90 === void 0 ? void 0 : _90.includes("川崎")));
        if (isKawasakiHome) {
            if (trainerName.match(/(内田勝義|高月賢一|林隆之|山崎尋美|佐藤博紀|八木正喜)/)) {
                // [減点方式] potential += 35;
                tags.push("🏰 川崎エリート厩舎: 地元での勝負メイチ仕上げ");
            }
            else {
                // [減点方式] potential += 10;
                tags.push("🏠 川崎ホーム所属(コース慣れアドバンテージ)");
            }
        }
        else {
            // 遠征馬の精査（大井・船橋からの遠征は格上）
            var isOhiFunabashi = ((_91 = horse.stableLocation) === null || _91 === void 0 ? void 0 : _91.includes("大井")) || trainerName.includes("大井") || (!horse.stableLocation && ((_92 = horse.belonging) === null || _92 === void 0 ? void 0 : _92.includes("大井"))) ||
                ((_93 = horse.stableLocation) === null || _93 === void 0 ? void 0 : _93.includes("船橋")) || trainerName.includes("船橋") || (!horse.stableLocation && ((_94 = horse.belonging) === null || _94 === void 0 ? void 0 : _94.includes("船橋")));
            if (isOhiFunabashi) {
                // [減点方式] potential += 35;
                tags.push("👑 南関ヒエラルキー: 大井・船橋からの格上参戦エッジ");
            }
            else {
                potential -= 15;
                tags.push("⚠️ 川崎への遠征馬(浦和・他地区等からの挑戦で割引)");
            }
        }
        // 4.5. 環境物理：川崎ナイターと馬場含水率シナジー
        var isKawasakiWet = race.condition === "重" || race.condition === "不良";
        if (isKawasakiWet && (hStyle_2 === "逃げ" || hStyle_2 === "先行")) {
            if (frame <= 3) {
                // [減点方式] potential += 25;
                tags.push("☔ 川崎道悪ナイター: 超特急イン前残りの物理法則");
            }
        }
        // 5. 騎手パラメータ（ジョッキーファクター）
        var isEliteKawasakiJ = ["野畑", "笹川", "矢野", "町田", "御神本", "新原"].some(function (j) { return jockey.includes(j); });
        if (isEliteKawasakiJ && popularity <= 2) {
            // [減点方式] potential += 35;
            tags.push("👑 川崎エリートジョッキー×上位人気高信頼度");
        }
        var isDarkJ = ["古岡", "藤江", "藤本"].some(function (j) { return jockey.includes(j); });
        if (isDarkJ && (popularity >= 6 || odds >= 12.0)) {
            // [減点方式] potential += 30;
            tags.push("⚡ 川崎大穴メーカー騎手特注フラグ");
        }
        var isVisitorJ = jockey.match(/(ルメール|川田|武豊|レーン|モレイラ|シャペル|デムーロ)/);
        if (isVisitorJ) {
            // [減点方式] potential += 35;
            tags.push("✈️ 川崎スポット・JRA遠征エリート補正");
        }
    }
    // ==========================================
    // 【佐賀競馬場 超特化型オメガ・プロトコル推論エンジン】
    // ==========================================
    var isSaga = ((_95 = race.venue) === null || _95 === void 0 ? void 0 : _95.includes("佐賀")) || ((_96 = race.trackName) === null || _96 === void 0 ? void 0 : _96.includes("佐賀")) || ((_97 = race.raceName) === null || _97 === void 0 ? void 0 : _97.includes("佐賀"));
    if (isSaga) {
        tags.push("🐎 佐賀特化OMEGAエンジン適用中");
        // 1. 「佐賀のラチ沿い避け」トラックバイアス
        // 内側の砂が極端に深いため、全馬が内を大きく開けて走る特殊馬場。外枠が圧倒的有利。
        if (frame >= 6) {
            // [減点方式] potential += 25;
            tags.push("📈 佐賀外枠エッジ: ラチ避け馬場の好位確保");
        }
        else if (frame <= 2) {
            potential -= 20;
            tags.push("⚠️ 佐賀内枠ペナルティ: 深い砂によるスタミナロス");
        }
        // 2. 脚質バイアス（逃げ・先行の圧倒的優位）
        // ラチ沿いを開けるため馬群が横に広がりやすく、後方からの差し・追込は物理的に届かない
        if (horse.style === "逃げ" || horse.style === "先行") {
            // [減点方式] potential += 30;
            tags.push("🏃 佐賀前残り: 砂の軽いポジションを先取する先行力");
        }
        else if (horse.style === "追込") {
            potential -= 25;
            tags.push("❌ 佐賀追込困難: 横広がり馬群による大外ブン回しロス");
        }
        // 3. 佐賀の絶対的エリートジョッキー（山口勲・飛田愛斗・石川慎）
        var isSagaEliteJ = ["山口勲", "飛田", "石川慎", "金山"].some(function (j) { return jockey.includes(j); });
        if (isSagaEliteJ) {
            // [減点方式] potential += 35;
            tags.push("👑 佐賀トップジョッキー無双エッジ");
            // トップ騎手×人気馬は「鉄板」
            if (popularity <= 2) {
                // [減点方式] potential += 25;
                tags.push("🎯 佐賀鉄板: トップ騎手×上位人気");
            }
        }
        // 4. 地元名門厩舎（真島元、九日、鮫島、東眞）
        var trainerNameS_1 = horse.trainer || "";
        var isSagaEliteT = ["真島", "九日", "鮫島", "東眞"].some(function (t) { return trainerNameS_1.includes(t); });
        if (isSagaEliteT) {
            // [減点方式] potential += 20;
            tags.push("🌟 佐賀名門厩舎: 完璧な仕上げと勝負気配");
        }
    }
    // ==========================================
    // 【園田・姫路競馬場 超特化型オメガ・プロトコル推論エンジン】
    // ==========================================
    var isSonoda = ((_98 = race.venue) === null || _98 === void 0 ? void 0 : _98.includes("園田")) || ((_99 = race.trackName) === null || _99 === void 0 ? void 0 : _99.includes("園田")) || ((_100 = race.raceName) === null || _100 === void 0 ? void 0 : _100.includes("園田")) ||
        ((_101 = race.venue) === null || _101 === void 0 ? void 0 : _101.includes("姫路")) || ((_102 = race.trackName) === null || _102 === void 0 ? void 0 : _102.includes("姫路")) || ((_103 = race.raceName) === null || _103 === void 0 ? void 0 : _103.includes("姫路"));
    if (isSonoda) {
        tags.push("🌾 園田特化OMEGAエンジン適用中");
        // 1. 単勝人気ファクター（本命・対抗超重視モデル）
        if (popularity <= 3) {
            // [減点方式] potential += 35;
            tags.push("🎯 園田本命・対抗信頼度エッジ");
            if (popularity === 1) {
                // [減点方式] potential += 40;
                tags.push("👑 園田1番人気絶対軸補正");
            }
        }
        else {
            potential -= 20; // 4番人気以下の1着率の大幅低下に伴う減点
            tags.push("⚠️ 園田4番人気以下アタマ割引");
        }
        // 2. レースクラス別 ＆ 「魔の3〜4コーナー超急カーブ物理」
        if (horse.style === "逃げ" || horse.style === "先行") {
            // [減点方式] potential += 35;
            tags.push("🏃 園田超急カーブ物理:前残り先行絶対有利");
        }
        else if (horse.style === "追込") {
            potential -= 25;
            tags.push("⚠️ 園田超急カーブ物理:大外膨らみロス割引");
        }
        if (race.raceNumber <= 6) {
            // 前半レース（1R〜6R）：先行力（前残り）最重視
            if (horse.style === "逃げ" || horse.style === "先行") {
                /* [減点方式] potential += 15; */ // 先行絶対有利をさらに上乗せ
                tags.push("📐 園田前半戦:先行・前残りアドバンテージ");
            }
        }
        else {
            // 後半レース（7R〜12R）：上がり3ハロン（極上末脚）最重視
            if (horse.style === "差し" || horse.style === "追込") {
                // [減点方式] potential += 30;
                tags.push("🏹 園田後半戦:極上末脚特化バイアス");
            }
            // 上がりタイムの実績補正
            if (horse.pastRaces && horse.pastRaces[0]) {
                var last3fNum = parseFloat(horse.pastRaces[0].last3fTime || "40.0");
                if (last3fNum > 0 && last3fNum <= 37.5) {
                    // [減点方式] potential += 20;
                    tags.push("\u26A1 \u5712\u7530\u5F8C\u534A\u6226:\u524D\u8D70\u597D\u672B\u811A\u3092\u8A08\u6E2C(3F:".concat(last3fNum, "\u79D2)"));
                }
            }
        }
        // 3. 枠順バイアス（有利枠・不利枠 ＆ 泥馬場イン高速伸び）
        var isHeavyMud = condition === '重' || condition === '不良';
        if (isHeavyMud && frame <= 3 && (horse.style === "逃げ" || horse.style === "先行")) {
            // [減点方式] potential += 30;
            tags.push("☔ 園田道悪物理:イン砂流出・超高速イン逃げアドバンテージ");
        }
        if (frame === 3 || frame === 4) {
            // [減点方式] potential += 25;
            tags.push("📐 園田安定の3・4枠バイアス");
        }
        else if (frame === 8) {
            // [減点方式] potential += 30;
            tags.push("📈 園田勝率・複勝率トップの8枠");
        }
        else if (frame === 1) {
            potential -= 30; // 最内枠極度不振ペナルティ（買い目排除）
            tags.push("❌ 園田1枠ペナルティ(不振枠割引)");
        }
        // 4. 馬体重変動ファクター
        if (weightChange < 0 && weightChange >= -9) {
            // [減点方式] potential += 20;
            tags.push("🔥 園田馬体重絞り勝負仕上げ");
        }
        else if (weightChange === 0) {
            // [減点方式] potential += 15;
            tags.push("📈 園田馬体重維持・安定トレンド");
        }
        else if (weightChange <= -10) {
            potential -= 40; // 極度の細化・体調不良リスク排除
            tags.push("❌ 園田馬体重二桁急減ペナルティ");
        }
        else if (weightChange >= 10) {
            if (potential >= 520) {
                // [減点方式] potential += 10;
                tags.push("⚡ 園田実績馬の馬体成長・リフレッシュボーナス");
            }
        }
        // 5. ヒューマンファクター（吉村智洋の勝負ヤリ ＆ リーディングトップ連鎖）
        if (jockey.includes("吉村智")) {
            if (popularity <= 2) {
                // [減点方式] potential += 50;
                tags.push("👑 園田の絶対王者:吉村智洋(勝負ヤリ1着固定)");
            }
            else {
                // [減点方式] potential += 30;
                tags.push("👑 園田の絶対王者:吉村智洋(無比の進路取り)");
            }
        }
        else if (jockey.match(/(下原|廣瀬|田中学|大山真)/)) {
            // [減点方式] potential += 20;
            tags.push("🌟 園田トップエリート騎手(1着バイアス)");
        }
        else if (jockey.includes("小牧太") || jockey.includes("川原")) {
            // [減点方式] potential += 25;
            tags.push("🌟 園田ベテランジョッキー複勝バイアス");
        }
        // 好調厩舎（調教師）
        var isEliteTrainerS = ["山口浩", "永島", "盛本", "長倉"].some(function (t) { var _a; return (_a = horse.trainer) === null || _a === void 0 ? void 0 : _a.includes(t); });
        if (isEliteTrainerS) {
            // [減点方式] potential += 25;
            tags.push("🏰 園田名門・好調厩舎固め打ちバイアス");
        }
        // 6. 「西脇所属馬」の広大トレーニングセンター仕上げエッジ
        var isNishiwaki = ((_104 = horse.stableLocation) === null || _104 === void 0 ? void 0 : _104.includes("西脇")) || ((_105 = horse.trainer) === null || _105 === void 0 ? void 0 : _105.includes("西脇"));
        if (isNishiwaki) {
            var isGradeOrSpecial = (_106 = race.raceName) === null || _106 === void 0 ? void 0 : _106.match(/(特別|重賞|選抜|ステークス|カップ)/);
            if (dist >= 1400 || isGradeOrSpecial) {
                // [減点方式] potential += 25;
                tags.push("🏰 西脇エッジ:広大トレセン仕上げ(長距離/上級条件強襲)");
            }
            else {
                // [減点方式] potential += 15;
                tags.push("🏰 西脇所属馬(スタミナ十分)");
            }
        }
        // 7. 交流重賞の「所属バイアス」
        var isKyomeiS = (_107 = race.raceName) === null || _107 === void 0 ? void 0 : _107.match(/(のじぎく賞|交流|重賞|特別|兵庫)/);
        if (isKyomeiS) {
            var trainerName = horse.trainer || "";
            var stableName = horse.stableLocation || "";
            var isHyogo = stableName.includes("園田") || stableName.includes("西脇") || trainerName.includes("園田") || trainerName.includes("西脇");
            if (!isHyogo && (stableName.match(/(大井|川崎|船橋|浦和|門別|北海道|南関)/) || trainerName.match(/(大井|川崎|船橋|浦和|門別|北海道|南関)/))) {
                // [減点方式] potential += 50;
                tags.push("✈️ 交流重賞:他地区エリート遠征馬エッジ");
            }
            else {
                potential -= 25;
                tags.push("⚠️ 交流重賞:地元兵庫所属馬ディスカウント");
            }
        }
        // ==========================================
        // 【新設】園田特化・究極ナレッジデータ 統合フラグ判定
        // ==========================================
        // 【統合】園田絶対軸コンボ
        // 条件: 馬体重(-6kg〜+4kg) × 枠順(4枠or6枠) × 騎手(田野豊or小牧太or下原理) × 人気(1番人気or3番人気)
        var isWeightStable = weightChange >= -6 && weightChange <= 4;
        var isGoodFrame = frame === 4 || frame === 6;
        var isTargetJockey = ['田野豊', '小牧太', '下原理', '下原'].some(function (j) { return jockey.includes(j); });
        var isTargetPopularity = popularity === 1 || popularity === 3;
        if (isWeightStable && isGoodFrame && isTargetJockey && isTargetPopularity) {
            // [減点方式] potential += 60;
            tags.push("🎯 【統合】園田絶対軸: 体重・枠・騎手・人気の黄金条件コンプリート");
        }
    }
    // ==========================================
    // 【盛岡競馬場 超特化型オメガ・プロトコル推論エンジン】
    // ==========================================
    var isMorioka = ((_108 = race.venue) === null || _108 === void 0 ? void 0 : _108.includes("盛岡")) || ((_109 = race.trackName) === null || _109 === void 0 ? void 0 : _109.includes("盛岡")) || ((_110 = race.raceName) === null || _110 === void 0 ? void 0 : _110.includes("盛岡"));
    if (isMorioka) {
        tags.push("🌾 盛岡特化OMEGAエンジン適用中");
        var hStyle_3 = horse.style || '中団';
        var trainerName = horse.trainer || '';
        // 1. 馬体重・成長バイアス（フィジカルパラメータ）
        if (Math.abs(weightChange) <= 3) {
            // [減点方式] potential += 30;
            tags.push('🏹岩手:馬体安定(状態キープ)');
        }
        else if (weightChange <= -4) {
            potential -= 35;
            tags.push('⚠️岩手:馬体減少リスク(消耗・ストレス懸念)');
        }
        else if (weightChange >= 7 && popularity <= 3) {
            // [減点方式] potential += 25;
            tags.push('🚀岩手:成長・立て直し(実力馬 of 馬体増)');
        }
        // 2. 空間物理と脚質シナジー（枠順バイアスの一元化）
        // 枠順バイアス
        if (frame >= 7) {
            // [減点方式] potential += 35;
            tags.push("盛岡:外枠絶対優位(砂被りなし)");
        }
        else if (frame === 1) {
            // [減点方式] potential += 20;
            tags.push("盛岡:最内枠健闘");
        }
        else if (frame === 2 || frame === 4) {
            potential -= 25;
            tags.push("⚠️盛岡:死滅枠(2/4枠)懸念");
        }
        // 脚質×枠順シナジー
        if ((hStyle_3 === '逃げ' || hStyle_3 === '先行') && (frame === 1 || frame === 2)) {
            if (popularity <= 3) {
                potential -= 20;
                tags.push('⚠️危険な人気馬(内枠×先行 of 罠)');
            }
        }
        else if ((hStyle_3 === '中団' || hStyle_3 === '後方') && (frame >= 5 && frame <= 7)) {
            // [減点方式] potential += 25;
            tags.push('🚀盛岡シナジー(外枠×差し)');
        }
        // 後半戦（6R〜12R）の極端枠バイアス
        if (race.raceNumber >= 6) {
            if (frame === 1 || (frame >= 6 && frame <= 8)) {
                // [減点方式] potential += 20;
                tags.push("🌃盛岡後半:内外極端枠有利");
            }
        }
        // 3. 騎手・厩舎（ヒューマンファクター）
        if (jockey.includes('高松') || jockey.includes('高橋悠') || jockey.includes('山本聡')) {
            // [減点方式] potential += 30;
            tags.push('盛岡:特効上位騎手(頭候補)');
        }
        else if (jockey.includes('塚本涼') || jockey.includes('坂井瑛') || /[☆△▲◇]/.test(jockey)) {
            // [減点方式] potential += 15;
            tags.push('盛岡:ヒモ穴警戒(減量/若手)');
        }
        if (trainerName.match(/(佐藤雅彦|板垣吉則|菅原右吉)/)) {
            // [減点方式] potential += 30;
            tags.push('🔥岩手好調厩舎:勝利量産フェーズ');
        }
        else if (trainerName.match(/(小林俊彦|及川良春|佐々木由則)/)) {
            // [減点方式] potential += 15;
            tags.push('🛡️岩手安定厩舎:馬券圏内（ヒモ）軸');
        }
        if (race.raceNumber >= 11 && trainerName.includes('佐藤浩')) {
            // [減点方式] potential += 25;
            tags.push('🎯岩手勝負厩舎:メイン競走特化');
        }
    }
    // ==========================================
    // 【ダート戦全般 血統特化ロジック (砂被り嫌悪)】
    // ==========================================
    if (race.surface === "ダート") {
        if (horse.sire && horse.sire.includes("アメリカンファラオ")) {
            // 砂被りを極端に嫌うため「逃げ」または「外枠(7〜8枠)」で大激走
            if (horse.style === "逃げ" || frame >= 7) {
                potential += 25;
                tags.push("👑 ダート特注(アメリカンファラオ): 砂を被らない条件(逃げ or 外枠)が揃った時、極端にパフォーマンスを上げるピンパーの単勝狙い目！");
            }
            else {
                potential -= 10;
                tags.push("🔻 ダート減点(アメリカンファラオ): 砂を被る内枠・中団からの競馬では脆い");
            }
        }
    }
    // ==========================================
    // ==========================================
    // 【中山競馬場 超特化型オメガ・プロトコル推論エンジン】
    // ==========================================
    var isNakayamaSpecial = ((_111 = race.venue) === null || _111 === void 0 ? void 0 : _111.includes("中山")) || ((_112 = race.trackName) === null || _112 === void 0 ? void 0 : _112.includes("中山")) || ((_113 = race.raceName) === null || _113 === void 0 ? void 0 : _113.includes("中山"));
    if (isNakayamaSpecial) {
        tags.push("🐎 中山特化OMEGAエンジン適用中");
        // 中山の立ち回り（内枠有利）
        if (frame >= 1 && frame <= 4) {
            potential += 15;
            tags.push("👑 中山特注: タイトなコーナーをロスなく回る機動力と立ち回りが活きる内枠");
        }
        // 中山実績と東京実績の相反チェック ＋ 急坂適性チェック
        var hasHillSuccess = false;
        var hasFlatSuccess = false;
        var hasTokyoSuccess = false;
        if (horse.pastRaces && horse.pastRaces.length > 0) {
            hasHillSuccess = horse.pastRaces.some(function (pr) {
                var v = pr.venue || pr.trackName || pr.raceName || '';
                return (v.includes("中山") || v.includes("阪神") || v.includes("中京")) && pr.result !== undefined && pr.result <= 3;
            });
            hasFlatSuccess = horse.pastRaces.some(function (pr) {
                var v = pr.venue || pr.trackName || pr.raceName || '';
                return (v.includes("新潟") || v.includes("小倉")) && pr.result !== undefined && pr.result <= 3;
            });
            hasTokyoSuccess = horse.pastRaces.some(function (pr) {
                var v = pr.venue || pr.trackName || pr.raceName || '';
                return v.includes("東京") && pr.result !== undefined && pr.result <= 3;
            });
        }
        if (hasHillSuccess) {
            potential += 25;
            tags.push("🎯 急坂鉄板(中山): 他の急坂コース(中山・阪神・中京)での好走実績あり！直線の急坂をこなすパワーの証明");
        }
        if (!hasHillSuccess) {
            if (hasTokyoSuccess) {
                potential -= 20;
                tags.push("🔻 中山危険: 東京での好走実績のみ。直線の長い瞬発力勝負に偏っており、中山特有の急坂・小回り(機動力)適性に欠ける危険な人気馬の可能性");
            }
            if (hasFlatSuccess) {
                potential -= 25;
                tags.push("🔻 急坂危険(中山): 急坂での好走実績がなく、新潟や小倉などの平坦コースでの好走実績に偏る。急坂で一気に失速する危険な平坦専用機");
            }
        }
    }
    // ==========================================
    // 【阪神競馬場 超特化型オメガ・プロトコル推論エンジン】
    // ==========================================
    var isHanshinSpecial = ((_114 = race.venue) === null || _114 === void 0 ? void 0 : _114.includes("阪神")) || ((_115 = race.trackName) === null || _115 === void 0 ? void 0 : _115.includes("阪神")) || ((_116 = race.raceName) === null || _116 === void 0 ? void 0 : _116.includes("阪神"));
    if (isHanshinSpecial) {
        tags.push("🐎 阪神特化OMEGAエンジン適用中");
        var hasHillSuccess = false;
        var hasFlatSuccess = false;
        if (horse.pastRaces && horse.pastRaces.length > 0) {
            hasHillSuccess = horse.pastRaces.some(function (pr) {
                var v = pr.venue || pr.trackName || pr.raceName || '';
                return (v.includes("中山") || v.includes("阪神") || v.includes("中京")) && pr.result !== undefined && pr.result <= 3;
            });
            hasFlatSuccess = horse.pastRaces.some(function (pr) {
                var v = pr.venue || pr.trackName || pr.raceName || '';
                return (v.includes("新潟") || v.includes("小倉")) && pr.result !== undefined && pr.result <= 3;
            });
        }
        if (hasHillSuccess) {
            potential += 25;
            tags.push("🎯 急坂鉄板(阪神): 他の急坂コース(中山・阪神・中京)での好走実績あり！直線の急坂をこなすタフなパワーの証明");
        }
        else if (hasFlatSuccess && !hasHillSuccess) {
            potential -= 25;
            tags.push("🔻 急坂危険(阪神): 急坂での好走実績がなく、新潟や小倉などの平坦コースでの好走実績に偏る。急坂で一気に失速する危険な平坦専用機");
        }
    }
    // ==========================================
    // 【東京競馬場 超特化型オメガ・プロトコル推論エンジン】
    // ==========================================
    var isTokyoSpecial = ((_117 = race.venue) === null || _117 === void 0 ? void 0 : _117.includes("東京")) || ((_118 = race.trackName) === null || _118 === void 0 ? void 0 : _118.includes("東京")) || ((_119 = race.raceName) === null || _119 === void 0 ? void 0 : _119.includes("東京"));
    if (isTokyoSpecial) {
        tags.push("🐎 東京特化OMEGAエンジン適用中");
        // 東京の瞬発力（上がり3ハロン重視）
        var hasFastLatePace = false;
        if (horse.pastRaces && horse.pastRaces.length > 0) {
            hasFastLatePace = horse.pastRaces.some(function (pr) { return pr.last3F !== undefined && pr.last3F <= 33.9; });
        }
        if (hasFastLatePace) {
            potential += 25;
            tags.push("👑 東京鉄板: 日本一長い直線を突き抜ける破壊力抜群の末脚！上がり33秒台の瞬発力実績あり");
        }
        if (horse.style === "差し" || horse.style === "追込") {
            potential += 15;
            tags.push("🌟 東京特注: 長い直線で存分に末脚を発揮できる後方待機馬(差し・追い込み)");
        }
        // 東京実績と中山実績の相反チェック
        var hasNakayamaSuccess = false;
        var hasTokyoSuccess = false;
        if (horse.pastRaces && horse.pastRaces.length > 0) {
            hasNakayamaSuccess = horse.pastRaces.some(function (pr) { var _a; return ((_a = pr.venue) === null || _a === void 0 ? void 0 : _a.includes("中山")) && pr.result !== undefined && pr.result <= 3; });
            hasTokyoSuccess = horse.pastRaces.some(function (pr) { var _a; return ((_a = pr.venue) === null || _a === void 0 ? void 0 : _a.includes("東京")) && pr.result !== undefined && pr.result <= 3; });
        }
        if (!hasTokyoSuccess && hasNakayamaSuccess) {
            potential -= 20;
            tags.push("🔻 東京危険: 中山での好走実績のみ。小回りの立ち回りやスタミナに偏っており、東京で最も重要な「スピードと極限の瞬発力」に欠ける危険な馬");
        }
    }
    // 東京ダート2100m × ホッコータルマエ産駒
    if (race.surface === "ダート" && parseInt(dist || race.distance || "0", 10) === 2100) {
        if (horse.sire && horse.sire.includes("ホッコータルマエ")) {
            potential += 20;
            tags.push("🌟 東京ダート2100m特注: キンカメ系スタミナの血統！勝率12%・単回値103%を誇るホッコータルマエ産駒");
            if (horse.style === "逃げ" || horse.style === "先行") {
                potential += 15; // 追加ボーナス
                tags.push("🎯 東京ダート2100m鉄板: 前で競馬ができるホッコータルマエ産駒は絶好の狙い目！");
            }
        }
    }
    // ==========================================
    // 【中京競馬場 超特化型オメガ・プロトコル推論エンジン】
    // ==========================================
    var isChukyoSpecial = ((_120 = race.venue) === null || _120 === void 0 ? void 0 : _120.includes("中京")) || ((_121 = race.trackName) === null || _121 === void 0 ? void 0 : _121.includes("中京")) || ((_122 = race.raceName) === null || _122 === void 0 ? void 0 : _122.includes("中京"));
    if (isChukyoSpecial) {
        tags.push("🐎 中京特化OMEGAエンジン適用中");
        // ルール1: 枠順（立ち回りの重要性と内枠有利・外枠不利）
        if (frame >= 1 && frame <= 4) {
            potential += 20;
            if (race.surface === "ダート") {
                tags.push("👑 中京ダート特注: 砂を被るデメリットより、遠心力を抑えて最短距離を回れる内枠(1〜4枠)のメリットが圧倒的に勝る");
                // 過去に内枠から好走した実績があるか(砂被り耐性の証明)
                var hasInnerFrameSuccess = false;
                if (horse.pastRaces && horse.pastRaces.length > 0) {
                    hasInnerFrameSuccess = horse.pastRaces.some(function (pr) { return pr.frame !== undefined && pr.frame <= 4 && pr.result !== undefined && pr.result <= 3; });
                }
                if (hasInnerFrameSuccess) {
                    potential += 25; // 強烈な上乗せ加点
                    tags.push("🎯 中京ダート鉄板: 過去に内枠での好走実績あり！砂を被る展開でも怯まず内を突ける最強の狙い目");
                }
            }
            else {
                tags.push("👑 中京特注: 遠心力を抑えてロスなく回れる内枠(1〜4枠)は絶対的有利");
            }
        }
        else if (frame >= 7 && frame <= 8) {
            if (race.surface === "ダート") {
                potential -= 25; // 砂を被らないメリットよりロスが大きいため大幅減点
                tags.push("🔻 中京ダート減点: 砂回避のメリットより、3・4角の下り坂＋タイトなコーナーで外を回される遠心力スタミナロスが甚大");
            }
            else {
                potential -= 15;
                tags.push("🔻 中京減点: 3・4角の下り坂＋タイトなコーナーで外を回される外枠(7〜8枠)はスタミナロス");
            }
        }
        // ルール2: 急坂適性（阪神・中山での好走歴）
        var hasHillTrackSuccess = false;
        if (horse.pastRaces && horse.pastRaces.length > 0) {
            hasHillTrackSuccess = horse.pastRaces.some(function (pr) {
                var venue = pr.venue || pr.trackName || pr.raceName || '';
                return (venue.includes("阪神") || venue.includes("中山")) && pr.result !== undefined && pr.result <= 3;
            });
        }
        if (hasHillTrackSuccess) {
            potential += 25;
            tags.push("🎯 中京鉄板: 直線の急坂をこなすパワーの証明！同じ急坂コース(阪神・中山)での好走実績あり");
        }
        // ルール3: 芝コースの距離別特化ロジック
        if (race.surface === "芝") {
            var distance = parseInt(race.distance || "0", 10);
            var style = horse.style || "";
            if (distance === 1200) {
                // 芝1200m: ペース落ち着くがタフ。内枠で1400m以上実績馬が有利
                if (frame >= 1 && frame <= 4) {
                    var hasLongerDistanceSuccess = false;
                    if (horse.pastRaces && horse.pastRaces.length > 0) {
                        hasLongerDistanceSuccess = horse.pastRaces.some(function (pr) {
                            var prDist = parseInt(pr.distance || "0", 10);
                            return prDist >= 1400 && pr.result !== undefined && pr.result <= 3;
                        });
                    }
                    if (hasLongerDistanceSuccess) {
                        potential += 25;
                        tags.push("👑 中京芝1200m鉄板: スタミナが問われる急坂コース！ロスなく回れる内枠＋1400m以上での好走実績(スタミナ証明)を持つ最強の狙い目");
                    }
                    else {
                        potential += 10;
                        tags.push("🌟 中京芝1200m特注: 緩やかな上り坂発走でペースが落ち着くため、タイトなコーナーをロスなく回れる内枠が有利");
                    }
                }
            }
            else if (distance === 1400) {
                // 芝1400m: ペース激化で内枠の差し・追い込み有利
                if (style === "差し" || style === "追込") {
                    if (frame >= 1 && frame <= 4) {
                        potential += 25;
                        tags.push("👑 中京芝1400m鉄板: 1200mよりもペースが上がる逆転現象！前が潰れる展開を内からロスなく強襲する内枠の差し・追い込み馬");
                    }
                    else {
                        potential += 10;
                        tags.push("🌟 中京芝1400m特注: 激しいペースにより差し・追い込みが決まりやすい");
                    }
                }
            }
            else if (distance === 1600) {
                // 芝1600m: 内枠の先行＋瞬発力勝負
                if (frame >= 1 && frame <= 4) {
                    if (style === "逃げ" || style === "先行") {
                        var hasFastLatePace = false;
                        if (horse.pastRaces && horse.pastRaces.length > 0) {
                            hasFastLatePace = horse.pastRaces.some(function (pr) { return pr.last3F !== undefined && pr.last3F <= 33.9; });
                        }
                        if (hasFastLatePace) {
                            potential += 25;
                            tags.push("👑 中京芝1600m鉄板: 特殊ポケット発走で圧倒的内枠有利！スローからの瞬発力勝負に対応できる「鋭い上がり(33秒台以下)実績を持つ内枠先行馬」");
                        }
                        else {
                            potential += 15;
                            tags.push("🌟 中京芝1600m特注: 最初のコーナーまでの距離が短いため圧倒的内枠有利の先行馬");
                        }
                    }
                }
            }
            else if (distance === 2000) {
                // 芝2000m: ペースが遅くなり逃げ・先行が圧倒的有利 + リピーター
                if (style === "逃げ" || style === "先行") {
                    potential += 20;
                    tags.push("👑 中京芝2000m特注: 上り坂スタートでペースが落ち着くため、ロスなく運べる逃げ・先行馬が圧倒的有利");
                    var isRepeater = false;
                    var failedAt2200 = false;
                    if (horse.pastRaces && horse.pastRaces.length > 0) {
                        isRepeater = horse.pastRaces.some(function (pr) {
                            var venue = pr.venue || pr.trackName || pr.raceName || '';
                            return venue.includes("中京") && pr.result !== undefined && pr.result <= 3;
                        });
                        failedAt2200 = horse.pastRaces.some(function (pr) {
                            var venue = pr.venue || pr.trackName || pr.raceName || '';
                            var prDist = parseInt(pr.distance || "0", 10);
                            return venue.includes("中京") && prDist === 2200 && (pr.style === "逃げ" || pr.style === "先行") && pr.result !== undefined && pr.result >= 4;
                        });
                    }
                    if (isRepeater) {
                        potential += 15;
                        tags.push("🎯 中京芝2000m鉄板: 中京好走実績あり！特殊コースを得意とするリピーターの逃げ・先行馬");
                    }
                    if (failedAt2200) {
                        potential += 25;
                        tags.push("🎯 中京芝2000m超鉄板: タフな2200mで先行して粘れなかった馬の距離短縮！ペースが落ち着くここは絶好の狙い目");
                    }
                }
                else if (style === "差し" || style === "追込") {
                    potential -= 15;
                    tags.push("🔻 中京芝2000m減点: ペースが遅く、タイトなコーナーで外を回らされる後方待機馬(差し・追い込み)は不利");
                }
            }
            else if (distance === 2200) {
                // 芝2200m: ペースが激しくなり差し・追い込みが有利
                if (style === "差し" || style === "追込") {
                    potential += 20;
                    tags.push("👑 中京芝2200m特注: 序盤から激しいポジション争いが発生。急坂を2回登るタフな展開で脚を溜められる差し・追い込み馬が有利");
                    var failedAt2000 = false;
                    if (horse.pastRaces && horse.pastRaces.length > 0) {
                        failedAt2000 = horse.pastRaces.some(function (pr) {
                            var venue = pr.venue || pr.trackName || pr.raceName || '';
                            var prDist = parseInt(pr.distance || "0", 10);
                            return venue.includes("中京") && prDist === 2000 && (pr.style === "差し" || pr.style === "追込") && pr.result !== undefined && pr.result >= 4;
                        });
                    }
                    if (failedAt2000) {
                        potential += 25;
                        tags.push("🎯 中京芝2200m鉄板: スローペースの2000mで差し届かなかった馬の距離延長！展開が向くここは絶好の狙い目");
                    }
                }
                else if (style === "逃げ" || style === "先行") {
                    potential -= 15;
                    tags.push("🔻 中京芝2200m減点: 序盤の激しい争い＋急坂2回のタフな展開で、逃げ・先行馬は後半に失速しやすい");
                }
            }
        }
        // ルール4: 血統適性（キズナ産駒の圧倒的パワー）
        if (horse.sire && horse.sire.includes("キズナ")) {
            potential += 15;
            tags.push("🌟 中京特注: タフな急坂コースをこなすパワーの血統！キズナ産駒");
            if (race.surface === "ダート") {
                var distance = parseInt(race.distance || "0", 10);
                if (distance === 1800) {
                    potential += 30; // 圧倒的な回収率211%への特大ボーナス
                    tags.push("👑 中京ダート1800m超鉄板: 勝率14.2%・単回値211%の最強血統！中京ダート1800mのキズナ産駒は無条件で買い");
                }
            }
        }
        // ルール5: ダートコースの距離別特化ロジック (1800m vs 1900m)
        if (race.surface === "ダート") {
            var distance = parseInt(race.distance || "0", 10);
            var style = horse.style || "";
            if (distance === 1800) {
                // 1800mは逃げ・先行有利
                if (style === "逃げ" || style === "先行") {
                    potential += 15;
                    tags.push("🌟 中京ダート1800m特注: 前で立ち回れる逃げ・先行馬が有利");
                }
                else if (style === "差し" || style === "追込") {
                    potential -= 10;
                    tags.push("🔻 中京ダート1800m減点: 前が止まりにくく、後方待機の差し・追い込み馬は届きにくい");
                }
            }
            else if (distance === 1900) {
                // 1900mは差し・追い込み有利 ＋ 1800m敗退からの出し入れ
                if (style === "逃げ" || style === "先行") {
                    potential -= 15;
                    tags.push("🔻 中京ダート1900m減点: スタート直後の急坂でスタミナを激しく消耗するため、逃げ・先行馬には過酷な条件");
                }
                else if (style === "差し" || style === "追込") {
                    potential += 20;
                    tags.push("👑 中京ダート1900m特注: 前がバテる展開で脚を溜められる差し・追い込み馬が圧倒的に有利");
                    // 出し入れ判定: 前走(または過去)中京ダート1800mで4着以下
                    var missedAt1800 = false;
                    if (horse.pastRaces && horse.pastRaces.length > 0) {
                        missedAt1800 = horse.pastRaces.some(function (pr) {
                            var venue = pr.venue || pr.trackName || pr.raceName || '';
                            var prDist = parseInt(pr.distance || "0", 10);
                            return venue.includes("中京") && prDist === 1800 && (pr.style === "差し" || pr.style === "追込") && pr.result !== undefined && pr.result >= 4;
                        });
                    }
                    if (missedAt1800) {
                        potential += 25; // 絶好の狙い目
                        tags.push("🎯 中京ダート1900m超鉄板: 1800mで展開が向かず届かなかった差し・追い込み馬！前が崩れるここは絶好の狙い目");
                    }
                }
            }
        }
    }
    // ==========================================
    // 【水沢競馬場 超特化型オメガ・プロトコル推論エンジン】
    // ==========================================
    var isMizusawa = ((_123 = race.venue) === null || _123 === void 0 ? void 0 : _123.includes("水沢")) || ((_124 = race.trackName) === null || _124 === void 0 ? void 0 : _124.includes("水沢")) || ((_125 = race.raceName) === null || _125 === void 0 ? void 0 : _125.includes("水沢"));
    if (isMizusawa) {
        tags.push("🐎 水沢特化OMEGAエンジン適用中");
        // --- 水沢特化 減点方式ロジックデータ (AIナレッジ完全準拠) ---
        // 初期スコアはベース100点からスタート
        // ==========================================
        // 免除・例外・無視ルールの事前判定
        // ==========================================
        // 無視ルール: 以下のペナルティは水沢では発動させないよう相殺する
        // 1. 馬体重の2桁増減 (±10kg以上)
        if (typeof horse.weightChange === 'number' && Math.abs(horse.weightChange) >= 10) {
            potential += 10; // 一般的な大幅増減ペナルティを相殺
            tags.push("🌟 水沢救済: 馬体重の2桁増減(±10kg以上)でも好走多数。水沢では変動の大きさによるマイナス評価は不要");
        }
        // 2. 近走の二桁着順 (10〜12着などの大敗歴があっても減点しない)
        if (horse.pastRaces && horse.pastRaces.length > 0) {
            var hasBigLossInPast5 = horse.pastRaces.slice(0, 5).some(function (pr) { return pr.result !== undefined && pr.result >= 10; });
            if (hasBigLossInPast5) {
                potential += 10; // 他でかかっているかもしれないペナルティを相殺
                tags.push("🌟 水沢救済: 近走に二桁大敗があっても巻き返し可能(大敗無視ルール)");
            }
        }
        // (性別・年齢の割引は元の共通ロジックに依存するため、ここでボーナスを与えて相殺)
        if (horse.sex === "牝") {
            potential += 5;
            tags.push("🌟 水沢馬特注: ダート戦でも牡馬相手に勝ち切る牝馬の台頭(パワー不足判定無効化)");
        }
        if (age >= 7) {
            potential += 5;
            tags.push("🌟 水沢馬特注: 馬場を知り尽くした7歳以上のベテラン馬(衰え判定無効化)");
        }
        // 過去実績データ準備
        var hasTop3InPast5_1 = false;
        var recent2RacesPoor = false;
        var hasWinOrSecondIn3to5_1 = false;
        var corner1Max3 = false;
        var isReturnAndGood = false;
        if (horse.pastRaces && horse.pastRaces.length > 0) {
            var past5 = horse.pastRaces.slice(0, 5);
            past5.forEach(function (pr, index) {
                if (pr.result !== undefined && pr.result <= 3)
                    hasTop3InPast5_1 = true;
                if (index >= 2 && index <= 4 && pr.result !== undefined && pr.result <= 2) {
                    hasWinOrSecondIn3to5_1 = true;
                }
            });
            var poorCount = 0;
            for (var i = 0; i < 2 && i < horse.pastRaces.length; i++) {
                if (horse.pastRaces[i].result !== undefined && horse.pastRaces[i].result >= 4)
                    poorCount++;
            }
            if (poorCount === 2 || (horse.pastRaces.length === 1 && poorCount === 1))
                recent2RacesPoor = true;
            corner1Max3 = past5.some(function (pr) { return pr.corner1Position !== undefined && pr.corner1Position <= 3; });
            var cleanCurrentJockeyMiz_1 = jockey.replace(/[☆▲△◇★]/g, '').trim();
            for (var i = 1; i < horse.pastRaces.length && i < 5; i++) {
                var pr = horse.pastRaces[i];
                if (pr.jockey && pr.jockey.replace(/[☆▲△◇★]/g, '').trim() === cleanCurrentJockeyMiz_1 && pr.result !== undefined && pr.result <= 3) {
                    isReturnAndGood = true;
                    break;
                }
            }
        }
        var prevJockeyNameMiz = (prevRaceData === null || prevRaceData === void 0 ? void 0 : prevRaceData.jockey) || horse.prevJockey || '';
        var cleanPrevJockeyMiz = prevJockeyNameMiz.replace(/[☆▲△◇★]/g, '').trim();
        var cleanCurrentJockeyMiz = jockey.replace(/[☆▲△◇★]/g, '').trim();
        var isJockeyChangedMiz = cleanPrevJockeyMiz ? cleanPrevJockeyMiz !== cleanCurrentJockeyMiz : false;
        // 穴馬特例免除 (6〜8番人気)
        var isDarkHorse = popularity >= 6 && popularity <= 8;
        var isSakaiOrKobayashi = jockey.includes("坂井瑛") || jockey.includes("小林凌");
        var isDarkHorseExempt = isDarkHorse && isSakaiOrKobayashi && cleanPrevJockeyMiz === cleanCurrentJockeyMiz;
        if (isDarkHorseExempt) {
            tags.push("💥 水沢超大穴免除: 穴メーカー(坂井瑛・小林凌)の継続騎乗により、乗り替わり・内枠のペナルティを無効化");
        }
        // ==========================================
        // 減点ルールの適用 (Deduction Rules)
        // ==========================================
        // ルール1: 過去5走好走実績なし
        if (!hasTop3InPast5_1 && horse.pastRaces && horse.pastRaces.length >= 3) {
            potential -= 50;
            tags.push("🔻 水沢大幅減点: 過去5走好走実績なし(-50点)");
        }
        // ルール2: 近走不振かつ巻き返し要素なし
        if (recent2RacesPoor && !hasWinOrSecondIn3to5_1) {
            potential -= 30;
            tags.push("🔻 水沢減点: 近走不振かつ巻き返し要素なし(-30点)");
        }
        // ルール3: 非継続騎乗（乗り替わり）
        if (isJockeyChangedMiz) {
            if (isReturnAndGood) {
                tags.push("🌟 水沢特例: 手戻りのため非継続騎乗の減点を免除(0点)");
            }
            else if (isDarkHorseExempt) {
                // 免除
            }
            else {
                potential -= 30;
                tags.push("🔻 水沢減点: 非継続騎乗(乗り替わり)(-30点)");
            }
        }
        else if (cleanPrevJockeyMiz && cleanPrevJockeyMiz === cleanCurrentJockeyMiz) {
            potential += 10; // 連対率79%のバフとして多少は残す
            tags.push("👑 水沢特注: コンビ確立済みの「継続騎乗」は連対率激高の鉄板条件");
        }
        // ルール4: 内〜中枠の割引
        if (frame >= 1 && frame <= 5) {
            if (isDarkHorseExempt) {
                tags.push("🌟 水沢特例: 穴メーカー継続騎乗のため内〜中枠の減点を免除");
            }
            else {
                potential -= 20;
                tags.push("🔻 水沢減点: 内〜中枠の割引(-20点)");
            }
        }
        else {
            potential += 10;
            tags.push("👑 水沢特注: 圧倒的有利な外枠(6〜8枠)");
            if (frame === 8) {
                potential += 10;
                tags.push("🎯 水沢鉄板: 迷ったら8枠！大特注の連軸候補");
            }
        }
        // ルール5: 後方脚質（差し・追込）
        if (horse.style === "差し" || horse.style === "追込" || (!corner1Max3 && horse.style !== "逃げ" && horse.style !== "先行")) {
            potential -= 20;
            tags.push("🔻 水沢減点: 後方脚質(差し・追込)のアタマ候補割引(-20点)");
        }
        // ルール6: 上がり最速の過信
        if (prevRaceData === null || prevRaceData === void 0 ? void 0 : prevRaceData.last3F) {
            if (popularity <= 3) {
                potential -= 10;
                tags.push("🔻 水沢減点: 稍重馬場での上がり最速馬は過信禁物(-10点)");
            }
        }
        else if (popularity <= 3 && horse.style === "追込") {
            potential -= 10;
            tags.push("🔻 水沢減点: 上位人気でも差し遅れリスク高(-10点)");
        }
        // ルール7: 1番人気の単勝リスク
        if (popularity === 1) {
            potential -= 15;
            tags.push("🔻 水沢減点: 1番人気の単勝リスク(-15点)");
        }
        // 岩手特有のトップ騎手補正
        if (jockey.includes("村上忍") || jockey.includes("坂井瑛") || jockey.includes("佐々志") || jockey.includes("山本政") || jockey.includes("小林凌")) {
            tags.push("🎯 水沢特注: 当日好調騎手");
        }
        // 岩手リーディング全般のフォロー(残りのトップ騎手)
        var isIwateEliteJ = ["山本聡", "高松亮", "菅原辰"].some(function (j) { return jockey.includes(j); });
        if (isIwateEliteJ) {
            potential += 10;
            tags.push("🌟 岩手トップジョッキー絶対信頼度");
        }
    }
    // ==========================================
    // 【名古屋・弥富競馬場 超特化型オメガ・プロトコル推論エンジン】
    // ==========================================
    var isNagoya = ((_126 = race.venue) === null || _126 === void 0 ? void 0 : _126.includes("名古屋")) || ((_127 = race.trackName) === null || _127 === void 0 ? void 0 : _127.includes("名古屋")) || ((_128 = race.raceName) === null || _128 === void 0 ? void 0 : _128.includes("名古屋")) ||
        ((_129 = race.venue) === null || _129 === void 0 ? void 0 : _129.includes("弥富")) || ((_130 = race.trackName) === null || _130 === void 0 ? void 0 : _130.includes("弥富")) || ((_131 = race.raceName) === null || _131 === void 0 ? void 0 : _131.includes("弥富"));
    if (isNagoya) {
        tags.push("🌾 名古屋・弥富特化OMEGAエンジン適用中");
        // 1. 鞍上強化（リーディング上位騎手エッジ）
        var topJockeys_1 = ['岡部誠', '今井貴大', '大畑雅章', '加藤聡一', '丸野勝虎'];
        if (topJockeys_1.some(function (j) { return jockey.includes(j); })) {
            // [減点方式] potential += 25;
            tags.push('名古屋:鞍上強化・リーディングエリート');
        }
        // 2. Yatomi Physics (弥富物理補正) の統合・適用
        var prevRace_6 = horse.pastRaces && horse.pastRaces[0];
        var physicsResult = calculateYatomiPhysics(horse, prevRace_6, race.windSpeed || 0, race.isHeadwind || false, race.condition, race.isInBiasActive || false);
        if (physicsResult === 1) {
            /* [減点方式] potential += 45; */ // 物理的アドバンテージを持つ狙い馬として加点
            isTargetYatomi = true;
            tags.push("⚡ 弥富物理エッジ適合馬(風速・外回し・馬格パワー・インバイアス総合判定)");
        }
    }
    // （hm, jm の取得は関数冒頭に移動済み）
    if (hm) {
        // コース実績加点
        var courseWins = hm.results.filter(function (r) { return r.venue === race.venue && r.rank === 1; }).length;
        if (courseWins > 0) {
            // [減点方式] potential += 20;
            tags.push("\u30B3\u30FC\u30B9\u5B9F\u7E3E\u99AC(".concat(courseWins, "\u52DD)"));
        }
        // 距離実績
        var distTop3 = hm.results.filter(function (r) { return Math.abs(r.distance - race.distance) <= 100 && r.rank <= 3; }).length;
        if (distTop3 > 0) {
            // [減点方式] potential += 15;
            tags.push("\u8DDD\u96E2\u30FB\u8FD1\u63A5\u9069\u6027(".concat(distTop3, "\u56DE)"));
        }
        // ==========================================
        // 【新設】① 長期間の持ち時計（生涯ベストタイム）エッジ加点
        // ==========================================
        var key = "".concat(race.venue, "_").concat(race.distance);
        if (hm.bestTime && hm.bestTime[key]) {
            var bestTimeStr = hm.bestTime[key];
            // ※ 今回の出走馬全体との相対比較はコンテキストがないため、絶対的なスピード加点として機能させる
            // クラス基準タイムや直近5走の最速タイムと比べても遜色ない場合は底力として評価
            // [減点方式] potential += 25;
            tags.push("\u231A \u751F\u6DAF\u30D9\u30B9\u30C8\u6642\u8A08\u4FDD\u6709(\u30B9\u30D4\u30FC\u30C9\u4E0A\u4F4D)");
        }
    }
    // 1. 馬と騎手の相性（主戦騎手ボーナス）
    if (horse.pastRaces && horse.pastRaces.length > 0) {
        // 過去の騎乗履歴をチェック
        var pastRides = horse.pastRaces.filter(function (pr) { return pr.jockey && jockey && pr.jockey.includes(jockey.split(' ')[0] || jockey); });
        var pastWins = pastRides.filter(function (pr) { return pr.result === 1; }).length;
        var pastTop3 = pastRides.filter(function (pr) { return pr.result <= 3; }).length;
        if (pastWins > 0) {
            // [減点方式] potential += 20;
            tags.push('🤝主戦騎手(勝利実績)');
        }
        else if (pastTop3 > 0) {
            // [減点方式] potential += 10;
            tags.push('🤝主戦騎手(好走実績)');
        }
        else if (pastRides.length === 0) {
            // 初騎乗（乗り替わり）
            // 陣営の思惑：前走負けていて、今回エリート騎手に乗り替わりなら「勝負気配（ヤリ）」
            if (horse.pastRaces[0].result > 3 && isEliteJockey) {
                // [減点方式] potential += 35;
                tags.push('🔥勝負気配(エリート乗り替わり)');
            }
        }
    }
    // 2. 騎手と調教師の黄金ライン（相性）
    var trainer = horse.trainer || '';
    if (trainer && jockey) {
        if (trainer.includes('笹野') && jockey.includes('渡邊')) {
            // [減点方式] potential += 30; tags.push('🌟黄金ライン(笹野×渡邊)');
        }
        else if (trainer.includes('友道') && (jockey.includes('川田') || jockey.includes('ルメール') || jockey.includes('武豊'))) {
            // [減点方式] potential += 25; tags.push('🌟勝負ライン(友道×エリート)');
        }
        else if (trainer.includes('矢作') && jockey.includes('坂井')) {
            // [減点方式] potential += 30; tags.push('🌟黄金ライン(矢作×坂井)');
        }
        else if (trainer.includes('木村') && jockey.includes('ルメール')) {
            // [減点方式] potential += 30; tags.push('🌟黄金ライン(木村×ルメール)');
        }
        else if (trainer.includes('中内田') && jockey.includes('川田')) {
            // [減点方式] potential += 30; tags.push('🌟黄金ライン(中内田×川田)');
        }
        else if (trainer.includes('打越') && jockey.includes('吉村')) {
            // [減点方式] potential += 25; tags.push('🌟黄金ライン(打越×吉村)');
        }
    }
    // ---------------------------------------------------
    // 【新設】厩舎・所属バイアス解析（固め打ち厩舎 & 遠征馬エッジ）
    // ---------------------------------------------------
    // ① 園田・好調厩舎（実績に基づく固め打ち警戒）
    var sonodaHotStables = /(山口浩幸|永島太郎|盛本信尋|長倉功|高馬元昭|諏訪貴正)/;
    if (trainer.match(sonodaHotStables)) {
        // [減点方式] potential += 25;
        tags.push('🔥園田好調厩舎:固め打ち警戒');
    }
    // ② 地方全国交流重賞における「他地区遠征馬」の圧倒的優位
    // （のじぎく賞等の交流重賞では大井・北海道等の他地区勢が上位独占する傾向）
    var isExchangeRace = (_132 = race.raceName) === null || _132 === void 0 ? void 0 : _132.match(/(交流|のじぎく賞|全国|選抜|中央|JRA)/);
    var eliteAwayRegions = /(大井|北海道|門別|浦和|船橋|川崎)/;
    if (isExchangeRace) {
        if ((_133 = horse.stableLocation) === null || _133 === void 0 ? void 0 : _133.match(eliteAwayRegions)) {
            /* [減点方式] potential += 50; */ // エリート地区のレベル差を最重視
            tags.push("\uD83C\uDFF9\u4EA4\u6D41\u6226\u30A8\u30C3\u30B8:\u4ED6\u5730\u533A\u9060\u5F81\u99AC(".concat(horse.stableLocation, ")"));
        }
        else if ((_134 = horse.stableLocation) === null || _134 === void 0 ? void 0 : _134.match(/(兵庫|園田|西脇)/)) {
            potential -= 25; // 地元勢の劣勢を反映（Sランク相当の能力差）
            tags.push('⚠️交流戦リスク:地元兵庫勢(レベル差懸念)');
        }
    }
    // 3. 陣営の思惑（仕上げ・叩き）
    // 前走大敗からしっかり絞ってきた場合
    if (weightChange < 0 && weightChange >= -10 && horse.pastRaces && horse.pastRaces.length > 0 && horse.pastRaces[0].result > 5) {
        // [減点方式] potential += 15;
        // [要見直し2] tags.push('🔥メイチ仕上げ推測(馬体重絞り)');
    }
    // ==========================================
    // 【新設】レース展開シミュレーション（先行争いの激しさ予測）
    // ==========================================
    var frontRunnersCount = (race.horses || []).filter(function (h) { return h.style === '逃げ' || h.style === '先行' || h.style === '好位'; }).length;
    var isHighPaceSim = frontRunnersCount >= 6; // 先行馬が多い -> 激戦 -> 差し有利
    // const isSlowPaceSim = frontRunnersCount <= 2; // 先行馬が少ない -> 展開利 -> 逃げ有利
    // ==========================================
    // 【全場共通】鞍上（騎手）エリート補正
    // ==========================================
    if (isEliteJockey) {
        // [減点方式] potential += 25;
        tags.push('👑エリート鞍上');
    }
    if (jm) {
        // 会場別エリート
        if (jm.venueStats[race.venue]) {
            var vs = jm.venueStats[race.venue];
            if (vs.total >= 3) {
                var winRate = vs.wins / vs.total;
                var top3Rate = vs.top3 / vs.total;
                if (winRate > 0.20) { /* [減点方式] potential += 25; */
                    tags.push('会場勝率エリート');
                }
                else if (top3Rate > 0.40) { /* [減点方式] potential += 20; */
                    tags.push('会場安定勢');
                }
            }
        }
        // ==========================================
        // 【新設】② 騎手の全国通算勝率エリート加点
        // ==========================================
        if (jm.totalRaces >= 10) {
            var nationwideWinRate = jm.wins / jm.totalRaces;
            if (nationwideWinRate >= 0.15) {
                // [減点方式] potential += 15;
                tags.push("\uD83D\uDC51 \u5168\u56FD\u30C8\u30C3\u30D7\u30B8\u30E7\u30C3\u30AD\u30FC(\u9AD8\u52DD\u7387)");
            }
        }
    }
    // ==========================================
    // 【全場共通】斤量体重比 - 物理的限界デッドライン
    // ==========================================
    var weightRatio = (kinryo / weight) * 100;
    if (gender === '牝' && weightRatio > 12.5) {
        potential -= 50;
        tags.push('斤量限界超過');
    }
    else if ((gender === '牡' || gender === 'セン') && weightRatio > 12.6) {
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
            // [減点方式] potential += 45;
            tags.push('🚀超スプリント逃げ(絶対有利)');
        }
        else if (horse.style === '先行') {
            // [減点方式] potential += 30;
            tags.push('🚀超スプリント先行(展開利)');
        }
        else if (horse.style === '差し' || horse.style === '追込') {
            potential -= 25;
            tags.push('⚠️超スプリント差し追込(届かず懸念)');
        }
        // 内枠有利（川崎900m等）
        if (frame <= 3) {
            // [減点方式] potential += 20;
            tags.push('🎯超スプリント内枠エッジ');
        }
        else if (frame >= 7) {
            potential -= 10;
            tags.push('⚠️超スプリント外枠ロス懸念');
        }
    }
    // 過去走から「回り（左右）」の適性を算出
    if (horse.pastRaces && horse.pastRaces.length > 0) {
        var leftTurnRaces = horse.pastRaces.filter(function (pr) { return pr.direction === '左'; });
        var rightTurnRaces = horse.pastRaces.filter(function (pr) { return pr.direction === '右'; });
        var leftVenues = ['川崎', '船橋', '浦和', '盛岡', '新潟', '東京', '中京'];
        var isLeftTurnRace = leftVenues.some(function (v) { return trackName.includes(v); });
        if (isLeftTurnRace) {
            var leftGoodRaces = leftTurnRaces.filter(function (pr) { return pr.result <= 3; });
            if (leftGoodRaces.length >= 2) {
                // [減点方式] potential += 25;
                tags.push("\uD83D\uDD04\u30B5\u30A6\u30B9\u30DD\u30FC\u9069\u6027(\u5DE6\u56DE\u308A\u597D\u8D70".concat(leftGoodRaces.length, "\u56DE)"));
            }
        }
        else {
            var rightGoodRaces = rightTurnRaces.filter(function (pr) { return pr.result <= 3; });
            if (rightGoodRaces.length >= 2) {
                // [減点方式] potential += 20;
                tags.push("\uD83D\uDD04\u53F3\u56DE\u308A\u597D\u8D70\u5B9F\u7E3E\u3042\u308A(".concat(rightGoodRaces.length, "\u56DE)"));
            }
        }
    }
    // 地元所属ボーナス（例：川崎開催で川崎所属）
    if (horse.belonging && trackName.includes(horse.belonging)) {
        // [減点方式] potential += 20;
        tags.push("\uD83C\uDFE0\u5730\u5143\u81EA\u5834\u30A2\u30C9\u30D0\u30F3\u30C6\u30FC\u30B8(".concat(horse.belonging, ")"));
    }
    // ==========================================
    // 【新設】JRA/NAR実績データ・出来事・ラップタイムを活用したAI予想
    // ==========================================
    // 1. 不利・出来事履歴による補正 (Incident Analysis)
    if (hm && hm.incidents && hm.incidents.length > 0) {
        var hasSeriousDisadvantage_1 = false;
        var hasTimeLimitPenalty_1 = false;
        hm.incidents.forEach(function (inc) {
            var note = inc.note;
            if (note.includes('不利') || note.includes('斜行被害') || note.includes('審議') || note.includes('挟まれ') || note.includes('出遅れ')) {
                hasSeriousDisadvantage_1 = true;
            }
            if (note.includes('タイムオーバー') || note.includes('出走制限') || note.includes('鼻出血')) {
                hasTimeLimitPenalty_1 = true;
            }
        });
        if (hasSeriousDisadvantage_1) {
            // 不利による度外視。次走での巻き返し期待値激増
            // [減点方式] potential += 40;
            distortionBoost += 0.5;
            tags.push('🔥度外視:前走不利巻き返し期待');
        }
        if (hasTimeLimitPenalty_1) {
            // 著しい能力減衰・出来事ペナルティ
            potential -= 45;
            tags.push('⚠️リスク:出来事ペナルティ(能力疑問)');
        }
    }
    // 2. ラップタイム (ハロンタイム) 適合度スコアリング (Lap Pattern Fit)
    if (masterData.laps) {
        var lapKey = "".concat(race.venue, "_").concat(race.distance, "_").concat(race.surface);
        var historicalLaps = masterData.laps[lapKey];
        if (historicalLaps && historicalLaps.length > 0) {
            var frontPaceSum_1 = 0;
            var rearPaceSum_1 = 0;
            var calculatedCount_1 = 0;
            historicalLaps.forEach(function (hl) {
                if (hl.laps.length >= 6) {
                    var l1 = parseFloat(hl.laps[0]) || 12;
                    var l2 = parseFloat(hl.laps[1]) || 11;
                    var l3 = parseFloat(hl.laps[2]) || 12;
                    var le = hl.laps[hl.laps.length - 1] ? parseFloat(hl.laps[hl.laps.length - 1]) : 12;
                    var le1 = hl.laps[hl.laps.length - 2] ? parseFloat(hl.laps[hl.laps.length - 2]) : 12;
                    var le2 = hl.laps[hl.laps.length - 3] ? parseFloat(hl.laps[hl.laps.length - 3]) : 12;
                    frontPaceSum_1 += (l1 + l2 + l3);
                    rearPaceSum_1 += (le + le1 + le2);
                    calculatedCount_1++;
                }
            });
            if (calculatedCount_1 > 0) {
                var avgFront = frontPaceSum_1 / calculatedCount_1;
                var avgRear = rearPaceSum_1 / calculatedCount_1;
                var isHighPace = avgFront < avgRear; // 前半の方が速い = ハイペース前傾
                if (isHighPace) {
                    if (horse.style === '差し' || horse.style === '追込') {
                        // [減点方式] potential += 25;
                        tags.push('⚡前傾ハイペース適合(差し追込有利)');
                    }
                    else if (horse.style === '逃げ') {
                        potential -= 15;
                        tags.push('⚠️前傾ハイペースリスク(逃げバテ注意)');
                    }
                }
                else {
                    if (horse.style === '逃げ' || horse.style === '先行') {
                        // [減点方式] potential += 30;
                        tags.push('🚀後傾スローペース適合(逃げ先行有利)');
                    }
                    else if (horse.style === '追込') {
                        potential -= 20;
                        tags.push('⚠️後傾スローペースリスク(追込不発懸念)');
                    }
                }
            }
        }
    }
    // 3. 血統・牧場（生産牧場）・馬主実績ボーナス (Synergy Bonus)
    var sireName = horse.sire || '';
    var breederName = horse.breeder || '';
    if (race.surface === 'ダート') {
        var dirtEliteSires = /(ドレフォン|シニスターミニスタ|ヘニーヒューズ|マジェスティックウォリアー|パイロ|ミッキーアイル)/;
        if (sireName.match(dirtEliteSires)) {
            // [減点方式] potential += 25;
            tags.push("\uD83E\uDDEC\u30C0\u30FC\u30C8\u9EC4\u91D1\u8840\u7D71(\u9069\u6027\u629C\u7FA4)");
        }
        var eliteDirtBreeders = /(カタオカフアーム|ノーザンファーム|社台|グランド牧場|ヤナガワ牧場)/;
        if (breederName.match(eliteDirtBreeders)) {
            // [減点方式] potential += 20;
            tags.push("\uD83C\uDFE1\u30C0\u30FC\u30C8\u512A\u79C0\u7267\u5834");
        }
    }
    else if (race.surface === '芝') {
        var turfEliteSires = /(ディープインパクト|ロードカナロア|キタサンブラック|エピファネイア|モーリス|ハーツクライ)/;
        if (sireName.match(turfEliteSires)) {
            // [減点方式] potential += 20;
            tags.push("\uD83E\uDDEC\u829D\u30AF\u30E9\u30B7\u30C3\u30AF\u8840\u7D71(".concat(sireName, ")"));
        }
        if (breederName.match(/(ノーザンファーム|社台ファーム|追分ファーム)/)) {
            // [減点方式] potential += 25;
            tags.push('🏡芝エリート生産牧場');
        }
    }
    // 【新設】母の父（BMS）によるダート適性・雨天道悪適性判定
    var bmsName = horse.bms || '';
    if (bmsName) {
        // ① ダート適性に優れたBMS血統エッジ
        if (race.surface === 'ダート') {
            var dirtEliteBMS = /(クロフネ|フレンチデピュティ|ゴールドアリュール|ブライアンズタイム|シンボリクリスエス|ワイルドラッシュ|エンドスウィープ)/;
            if (bmsName.match(dirtEliteBMS)) {
                // [減点方式] potential += 20;
                tags.push("\uD83D\uDCAA \u7802\u306E\u30B9\u30BF\u30DF\u30CA(\u6BCD\u7236): \u30C0\u30FC\u30C8\u9069\u6027\u306B\u512A\u308C\u305FBMS\u8840\u7D71\u30A8\u30C3\u30B8");
            }
        }
        // ② 雨天・道悪（重・不良馬場）に適したBMS適性
        if (race.condition === '重' || race.condition === '不良') {
            var mudEliteBMS = /(クロフネ|フレンチデピュティ|キングカメハメハ|シンボリクリスエス|メジロマックイーン|スペシャルウィーク|アグネスタキオン)/;
            if (bmsName.match(mudEliteBMS)) {
                // [減点方式] potential += 25;
                tags.push("\uD83C\uDF27\uFE0F \u9053\u60AA\u306E\u9B3C(\u6BCD\u7236): \u96E8\u5929\u99AC\u5834\u306B\u9069\u3057\u305FBMS\u9069\u6027(".concat(bmsName, ")"));
            }
        }
    }
    // ==========================================
    // 【新設】地方競馬 (NAR) 特有の実績・遠征・小回りバイアス評価
    // ==========================================
    var isNarTrack = /(川崎|船橋|大井|浦和|門別|盛岡|水沢|金沢|笠松|名古屋|園田|姫路|高知|佐賀)/.test(trackName);
    var horseBelonging = horse.belonging || (hm ? hm.belonging : '') || '';
    if (isNarTrack) {
        // 1. 他地区所属・遠征エッジの判定 (Region Synergy)
        if (horseBelonging) {
            var isAway = !trackName.includes(horseBelonging);
            if (isAway) {
                if (horseBelonging === '大井' && (trackName.includes('川崎') || trackName.includes('浦和'))) {
                    // [減点方式] potential += 20;
                    tags.push("\uD83C\uDFF9\u5357\u95A2\u4ED6\u5834\u9060\u5F81\u30A8\u30C3\u30B8(".concat(horseBelonging, "\u2192").concat(trackName, ")"));
                }
                else if (horseBelonging === '船橋' && trackName.includes('川崎')) {
                    // [減点方式] potential += 15;
                    tags.push("\uD83C\uDFF9\u9060\u5F81\u30B7\u30CA\u30B8\u30FC(".concat(horseBelonging, "\u2192\u5DDD\u5D0E)"));
                }
            }
        }
        // 2. 地方競馬の「先行脚質」と「内枠」の小回り適合エッジ
        if (horse.style === '逃げ' || horse.style === '先行') {
            if (horse.number >= 1 && horse.number <= 4) {
                // [減点方式] potential += 25;
                tags.push('🎯地方内枠逃げ先行アドバンテージ');
            }
        }
    }
    // 3. 超短距離・スプリント（1000m以下、特に川崎900m）の実績評価
    if (dist <= 1000) {
        var hasSprintRecord = false;
        if (hm && hm.results) {
            hasSprintRecord = hm.results.some(function (r) { return r.distance <= 1000 && r.rank <= 3; });
        }
        if (!hasSprintRecord && horse.pastRaces) {
            hasSprintRecord = horse.pastRaces.some(function (pr) { return pr.distance <= 1000 && pr.result <= 3; });
        }
        if (hasSprintRecord) {
            // [減点方式] potential += 30;
            tags.push('⏱️超短距離スピード実績値あり');
        }
    }
    // ==========================================
    // PMR (Physical Mass Ratio) 解析
    // ==========================================
    if (dist <= 1400) {
        if (460 <= weight && weight <= 490) { /* [減点方式] potential += 15; */ /* [要見直し] // [要見直し2] tags.push('PMR最適（短距離）'); */ }
        else if (weight > 510) {
            potential -= 10;
        }
        else if (weight < 440) {
            potential -= 15;
        }
    }
    else if (dist <= 2000) {
        if (480 <= weight && weight <= 520) { /* [減点方式] potential += 20; */
            tags.push('PMR黄金帯域');
        }
        else if (weight > 520) { /* [減点方式] potential += 15; */
            tags.push('大型馬パワー');
        }
        else if (weight < 450) { /* [減点方式] potential += 5; */ }
    }
    else {
        if (460 <= weight && weight <= 480) { /* [減点方式] potential += 15; */
            tags.push('PMR最適（長距離）');
        }
        else if (weight >= 530) { /* [減点方式] potential += 15; */
            tags.push('スタミナ型質量');
        }
    }
    // ==========================================
    // 馬体重増減エントロピー解析（安定性 vs 激変の期待値）
    // ==========================================
    // ① 1着候補パターン：小幅な変動（±8kg以内）
    // 統計的に勝ち馬の多くがこの範囲に集中（安定した仕上げ）
    if (Math.abs(weightChange) <= 8) {
        // [減点方式] potential += 35;
        // [要見直し] tags.push('🏹安定馬体(1着候補:±8kg内)');
        // 後半レース（8R〜12R）でのマイナス体重は「究極の仕上げ」としてさらに評価
        if (race.raceNumber >= 8 && weightChange < 0) {
            // [減点方式] potential += 20;
            // [要見直し2] tags.push('🔥後半戦マイナス体重(メイチ絞り)');
        }
    }
    // ② 紐穴（2-3着）候補パターン：大幅な変動（±10kg以上）
    // 勝ち切る力は削がれる傾向にあるが、波乱の主役（ヒモ）になりやすい
    else if (Math.abs(weightChange) >= 10) {
        // ポテンシャル（1着確率）は控えめに、歪み（紐穴期待値）を大幅増
        distortionBoost += 0.8;
        // [要見直し2] tags.push('💎馬体激変:紐穴激走サイン');
        if (weightChange >= 10) {
            // 大幅増（成長分または休養明け）
            if (age <= 3 && weightChange <= 35) {
                /* [減点方式] potential += 20; */ // 若駒は成長分として一定の勝機も残す
                tags.push('🚀若駒成長分(3着内期待)');
            }
            else if (weightChange <= 16) {
                // [減点方式] potential += 10;
                tags.push('🚀馬体充実(ヒモ警戒)');
            }
            else {
                potential -= 20;
                tags.push('⚠️太目残り注意(2-3着まで)');
            }
        }
        else if (weightChange <= -10) {
            // 大幅減（絞り込みまたは消耗）
            if (weightChange >= -18) {
                // [減点方式] potential += 15;
                tags.push('🎯究極の絞り(ヒモ荒れ注意)');
            }
            else {
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
            // [減点方式] potential += 30;
            // [要見直し] tags.push('🚀若駒フェーズ適合(2-3歳期待)');
        }
        else {
            potential -= 15;
        }
    }
    else if (race.raceNumber >= 7) {
        // 後半レース（古馬戦）：4歳以上の経験豊富なベテランが台頭
        if (age >= 4) {
            // [減点方式] potential += 25;
            // [要見直し2] tags.push('🛡️古馬・ベテランフェーズ適合(実績重視)');
        }
        else {
            potential -= 10;
        }
    }
    // ==========================================
    // 【新設】特殊馬具・厩舎所属・マーケット偏差値
    // ==========================================
    // 1. 特殊馬具（ブリンカー）解析
    if (horse.useBlinkers) {
        var blinkerHorses = race.horses.filter(function (h) { return h.useBlinkers; }).length;
        var blinkerBonus = 20;
        // 希少性によるブースト（着用馬が少ないほど一変の期待値が高い）
        if (blinkerHorses <= 2) {
            blinkerBonus += 15;
            // [要見直し2] tags.push('🎯特殊馬具(希少一変期待)');
        }
        else if (blinkerHorses >= 5) {
            blinkerBonus -= 10;
            // [要見直し2] tags.push('📢ブリンカー多用(効果分散)');
        }
        else {
            // [要見直し2] tags.push('🎯特殊馬具(集中力向上)');
        }
        // 2. 走場・年齢・人気のシナジー（陣営の「一変」と「確勝」のサイン）
        // ① ダート若駒×ブリンカー：砂被り・キックバック克服
        if (race.surface === 'ダート' && age <= 3) {
            blinkerBonus += 30;
            // [要見直し] tags.push('🚀若駒ダート×ブリンカー(集中力UP)');
        }
        // ② 人気上位×ブリンカー：陣営の「確勝を期した」勝負サイン
        if (popularity <= 2) {
            blinkerBonus += 25;
            tags.push('🔥確勝気配(人気×ブリンカー)');
        }
        // ③ 大穴×ブリンカー：過去大敗をリセットする「一変」の起爆剤
        if (popularity >= 10) {
            blinkerBonus += 35;
            // [要見直し2] tags.push('⚡大穴一変(ブリンカー爆弾)');
        }
        // ④ 馬体重大幅変動とのシナジー（±10kg以上の変化との掛け合わせ）
        if (Math.abs(weightChange) >= 10) {
            blinkerBonus += 25;
            // [要見直し2] tags.push('🚀激走トリガー(馬体変動×ブリンカー)');
        }
        potential += blinkerBonus;
    }
    // ==========================================
    // 【新設】枠順バイアス解析（金沢競馬・統計的期待値）
    // ==========================================
    // 独自算出の「枠順バイアススコア」に基づく補正
    if (frame === 1) {
        // 1枠：スコア1位(1.08) 複勝率50%の最強軸
        // [減点方式] potential += 40;
        // [要見直し2] tags.push('🏹1枠:黄金期待値(軸信頼度1位)');
    }
    else if (frame === 7) {
        // 7枠：スコア2位(0.93) 勝率26.7%の勝ち切りバイアス
        // [減点方式] potential += 35;
        // [要見直し2] tags.push('🚀7枠:勝負の突き抜け(勝率1位)');
    }
    else if (frame === 4) {
        // 4枠：スコア3位(0.75) 複勝率58.3%のヒモ穴バイアス
        // [減点方式] potential += 10;
        distortionBoost += 0.6; // 2-3着への食い込みやすさを強化
        tags.push('💎4枠:激走の紐穴(複勝率1位)');
    }
    else if (frame === 8) {
        // 8枠：スコア4位(0.70) 標準以上の期待値
        // [減点方式] potential += 15;
        // [要見直し2] tags.push('🛡️8枠:外枠の安定感');
    }
    else if (frame === 2) {
        // 2枠：スコア最下位(0.25) 明確な死角
        potential -= 35;
        tags.push('⚠️2枠:枠順死角(期待値最下位)');
    }
    else if (frame === 3 || frame === 5 || frame === 6) {
        // 中間・死角枠：スコア0.46〜0.54の低迷帯
        potential -= 15;
        // [要見直し2] tags.push('🎐中間枠:バイアス劣勢');
    }
    // 2. 厩舎所属エリア（栗東/美浦）
    if (trackName !== '東京' && race.venue !== '東京') {
        if (horse.stableLocation === '栗東') {
            // [減点方式] potential += 15;
            // [要見直し] tags.push('🏰西高東低(栗東所属)');
        }
        else if (horse.stableLocation === '美浦') {
            // [減点方式] potential += 5;
        }
    }
    // 3. オッズ偏差値解析（歪みの標準化）
    if (horse.oddsStandardScore) {
        if (horse.oddsStandardScore >= 65) {
            // [減点方式] potential += 25;
            tags.push('💎不当過小評価(歪み特大)');
        }
        else if (horse.oddsStandardScore <= 35) {
            potential -= 15;
            tags.push('⚠️不当過剰評価');
        }
    }
    // ==========================================
    // 【刷新】レース・フェーズ別 人気信頼度 & 波乱度解析（統一波乱度対応）
    // ==========================================
    var wave = race.waveLevel || (0, waveLevelCalculator_1.calculateUnifiedWaveLevel)(race);
    if (wave.level <= 2) {
        // 波乱度低（鉄板・堅実）フェーズ：上位人気が強力
        if (popularity === 1) {
            // [減点方式] potential += 45;
            tags.push("\uD83D\uDC51\u5805\u5B9F\u30D5\u30A7\u30FC\u30BA:1\u756A\u4EBA\u6C17\u4FE1\u983C (".concat(wave.category, ")"));
        }
        else if (popularity >= 2 && popularity <= 3) {
            // [減点方式] potential += 15;
            tags.push("\uD83C\uDFAF\u5805\u5B9F\u30D5\u30A7\u30FC\u30BA:\u4E0A\u4F4D\u4EBA\u6C17\u9806\u5F53 (".concat(wave.category, ")"));
        }
        else {
            potential -= 20;
        }
    }
    else if (wave.level >= 4) {
        // 波乱度高（波乱・大波乱）フェーズ：1番人気が崩れ、中穴が台頭
        if (popularity === 1) {
            potential -= 5;
            tags.push("\u26A0\uFE0F\u6CE2\u4E71\u30D5\u30A7\u30FC\u30BA:1\u756A\u4EBA\u6C17\u904E\u4FE1\u7981\u7269 (".concat(wave.category, ")"));
        }
        else if (popularity >= 5 && popularity <= 8) {
            // [減点方式] potential += 25;
            distortionBoost += 1.2;
            // [要見直し2] tags.push(`💎波乱の使者:激走の伏兵 (${wave.category})`);
        }
        // 波乱期における「減量騎手」の一発評価
        var isWeightReduced = kinryo <= 53 || ((_135 = horse.prevJockey) === null || _135 === void 0 ? void 0 : _135.match(/[▲△☆]/));
        if (isWeightReduced) {
            // [減点方式] potential += 30;
            distortionBoost += 0.5;
            tags.push("\u26A1\u6CE2\u4E71\u8B66\u6212:\u6E1B\u91CF\u9A0E\u624B\u306E\u7206\u767A\u529B (".concat(wave.category, ")"));
        }
    }
    // ==========================================
    // 【新設】厩舎・馬主・所属バイアス解析
    // ==========================================
    var owner = horse.owner || '';
    var isJRAHorse = horse.stableLocation === '栗東' || horse.stableLocation === '美浦';
    // ① JRA所属馬の交流戦バイアス（中央未勝利交流戦など）
    if (isExchangeRace && isJRAHorse) {
        /* [減点方式] potential += 60; */ // 圧倒的な実力差を考慮
        tags.push('🚀中央所属馬(交流戦バイアス)');
    }
    // ② 特定厩舎のクラス別優位性（加藤義厩舎のA級戦独占など）
    if (trainer === '加藤義' && (((_136 = horse.raceClass) === null || _136 === void 0 ? void 0 : _136.match(/A[123]/)) || race.raceNumber >= 11)) {
        // [減点方式] potential += 35;
        tags.push('🏰有力厩舎:加藤義(A級戦・メイン勝負)');
    }
    // ③ 特定の「馬主×厩舎」強力タッグ
    // ミルファーム × 金田一
    if (owner.match(/ミルファーム/) && trainer === '金田一') {
        // [減点方式] potential += 40;
        tags.push('🤝強力タッグ:ミルファーム×金田一');
    }
    // (株)ファーストビジネス × 加藤和
    if (owner.match(/(ファーストビジネス|First Business)/) && trainer === '加藤和') {
        // [減点方式] potential += 40;
        tags.push('🤝強力タッグ:ファーストビジネス×加藤和');
    }
    // ==========================================
    // 【新設】過去走パフォーマンス（着順・タイム差）解析
    // ==========================================
    if (horse.pastRaces && horse.pastRaces.length > 0) {
        var lastRace = horse.pastRaces[0];
        var tDiff = (_137 = lastRace.timeDiff) !== null && _137 !== void 0 ? _137 : 9.9;
        // ① アタマ(1着)候補の王道：前走僅差または上位着順
        if (tDiff < 0) {
            /* [減点方式] potential += 35; */ // 前走圧勝
            tags.push("\uD83D\uDD25\u524D\u8D70\u5727\u52DD\u5B9F\u7E3E(\u7740\u5DEE".concat(tDiff, "\u79D2)"));
        }
        else if (tDiff <= 1.0 || lastRace.result <= 3) {
            // [減点方式] potential += 25;
            tags.push('🔥王道パターン(前走好走/僅差)');
        }
        // ② JRA転入馬の「格上」評価（大敗無視）
        var isJRATransfer = horse.pastRaces.some(function (pr) { return pr.venue.match(/(東京|中山|阪神|京都|新潟|中京|小倉|福島|函館|札幌)/); });
        if (isJRATransfer && tDiff >= 2.0) {
            // [減点方式] potential += 40;
            tags.push('🚀JRA転入馬(格上/前走大敗無視)');
        }
        // ③ ヒモ穴(2-3着)：近走大敗だが5走以内に好走歴あり
        if (tDiff >= 3.0 && horse.pastRaces.slice(1, 5).some(function (pr) { return pr.result <= 3; })) {
            potential -= 15; // 1着確率は下がる
            tags.push('💎隠れた実力馬(過去5走以内好走)');
        }
        // 【新設】昇級・降級ローテ判定
        var getRaceClassLevel = function (classStr) {
            if (!classStr)
                return 0;
            var str = classStr.toString();
            if (str.match(/GⅠ|G1/i))
                return 10;
            if (str.match(/GⅡ|G2/i))
                return 9;
            if (str.match(/GⅢ|G3/i))
                return 8;
            if (str.match(/(オープン|OP|L|リステッド|重賞)/i))
                return 7;
            if (str.match(/(3勝クラス|1600万下)/))
                return 6;
            if (str.match(/(2勝クラス|1000万下)/))
                return 5;
            if (str.match(/(1勝クラス|500万下)/))
                return 4;
            if (str.match(/(未勝利|新馬)/))
                return 3;
            if (str.match(/A1/))
                return 7;
            if (str.match(/A2/))
                return 6.5;
            if (str.match(/A3|A/))
                return 6;
            if (str.match(/B1/))
                return 5.5;
            if (str.match(/B2/))
                return 5;
            if (str.match(/B3|B/))
                return 4.5;
            if (str.match(/C1/))
                return 4;
            if (str.match(/C2/))
                return 3.5;
            if (str.match(/C3|C/))
                return 3;
            return 0;
        };
        var currentLevel = getRaceClassLevel(horse.raceClass);
        var prevLevel = getRaceClassLevel(lastRace.raceClass);
        if (currentLevel > 0 && prevLevel > 0) {
            if (prevLevel > currentLevel) {
                // 降級ローテ（前走よりクラスが下がった）
                // [減点方式] potential += 30;
                tags.push("\uD83D\uDCC9 \u964D\u7D1A\u30ED\u30FC\u30C6: \u524D\u8D70\u683C\u4E0A\u30AF\u30E9\u30B9(".concat(lastRace.raceClass, ")\u304B\u3089\u4ECA\u56DE(").concat(horse.raceClass, ")\u3067\u5B9F\u529B\u512A\u4F4D"));
                // 前走で僅差好走または上位着順であればさらに勝負ヤリ
                if (lastRace.result <= 5 || tDiff <= 1.0) {
                    // [減点方式] potential += 15;
                    tags.push('⚡ 降級メイチ: 前走格上で掲示板内・僅差の巻き返し期待');
                }
            }
            else if (prevLevel < currentLevel) {
                // 昇級ローテ（前走よりクラスが上がった）
                potential -= 10;
                tags.push("\uD83D\uDCC8 \u6607\u7D1A\u30ED\u30FC\u30C6: \u4ECA\u56DE\u30AF\u30E9\u30B9\u6607\u7D1A\u521D\u6226(".concat(lastRace.raceClass, "\u2192").concat(horse.raceClass, ")\u306B\u3088\u308B\u58C1\u8B66\u6212"));
                // 前走勝ち上がり（1着）または前走圧勝なら昇級の壁を突破する余地あり
                if (lastRace.result === 1 || tDiff < 0) {
                    /* [減点方式] potential += 20; */ // 差し引き +10
                    tags.push('⚡ 昇級即通用: 前走勝ち上がりの勢いあり');
                }
            }
        }
        // 【新設】馬体重の推移トレンド分析 (前走馬体重 lastRace.weight と 今回馬体重 weight の比較)
        if (lastRace.weight > 0 && weight > 0) {
            // 1. 実データベースの体重差チェック (入力ミスやデータずれに備えて実測値で補正)
            var actualDiff = weight - lastRace.weight;
            // 2. 継続的消耗（連続馬体減）の検知
            var prev2Race = horse.pastRaces[1];
            if (prev2Race && prev2Race.weight > 0 && lastRace.weight > 0) {
                var prevDiff = lastRace.weight - prev2Race.weight;
                // 2走連続で馬体重が減少している場合 (例: 前回 -6kg、今回 -8kg など)
                if (prevDiff < 0 && actualDiff < 0) {
                    var totalLoss = Math.abs(prevDiff + actualDiff);
                    if (totalLoss >= 12) {
                        potential -= 25; // 連続の大幅減少は消耗・細化のリスクが極めて高い
                        tags.push("\u274C \u9023\u7D9A\u99AC\u4F53\u6E1B: 2\u8D70\u9023\u7D9A\u3067\u6E1B\u5C11(\u8A08-".concat(totalLoss, "kg)\u306B\u3088\u308B\u75B2\u52B4\u30FB\u7D30\u5316\u61F8\u5FF5"));
                    }
                    else {
                        potential -= 10;
                        tags.push("\u26A0\uFE0F \u9023\u7D9A\u99AC\u4F53\u6E1B: \u7DE9\u3084\u304B\u306A\u6D88\u8017\u30C8\u30EC\u30F3\u30C9(\u8A08-".concat(totalLoss, "kg)"));
                    }
                }
                // 若駒の順調なビルドアップ（成長期トレンド）
                if (age <= 3 && prevDiff >= 2 && actualDiff >= 2 && actualDiff <= 12) {
                    // [減点方式] potential += 25;
                    tags.push('🚀 成長期トレンド: 若駒の順調なビルドアップ・好調キープ');
                }
            }
            // 3. 馬体ふっくら・復調（リバウンド）トレンド
            // 前々走から前走で大幅に減らして大敗したが、今回しっかり戻してきた（復調）パターン
            if (prev2Race && prev2Race.weight > 0) {
                var prevDiff = lastRace.weight - prev2Race.weight;
                // 前走で10kg以上減らしており、今回8kg以上戻した場合
                if (prevDiff <= -10 && actualDiff >= 8) {
                    if (actualDiff >= 20) {
                        potential -= 15; // 急激な戻しすぎは太目残り（リバウンド失敗）
                        tags.push("\u26A0\uFE0F \u6025\u6FC0\u306A\u99AC\u4F53\u5897: \u77ED\u671F\u9593\u3067\u306E\u904E\u5270\u5897(+".concat(actualDiff, "kg)\u306B\u3088\u308B\u592A\u76EE\u6B8B\u308A\u61F8\u5FF5"));
                    }
                    else {
                        /* [減点方式] potential += 20; */ // 適切な回復
                        tags.push("\uD83D\uDCC8 \u99AC\u4F53\u3075\u3063\u304F\u3089: \u5927\u5E45\u6E1B\u304B\u3089\u306E\u56DE\u5FA9\u30FB\u524D\u8D70\u5927\u6557\u304B\u3089\u306E\u5FA9\u8ABF\u6C17\u914D");
                    }
                }
            }
            // 4. 過去の好走体重（ベスト体重）適合判定
            // 過去5走以内で3着以内に入ったレースの馬体重データを抽出
            var goodRaces = horse.pastRaces.slice(0, 5).filter(function (pr) { return pr.result <= 3 && pr.weight > 0; });
            if (goodRaces.length > 0) {
                var bestWeights = goodRaces.map(function (pr) { return pr.weight; });
                var avgBestWeight = bestWeights.reduce(function (a, b) { return a + b; }, 0) / bestWeights.length;
                // 今回の馬体重が、過去好走時の平均体重と±6kg以内である場合
                if (Math.abs(weight - avgBestWeight) <= 6) {
                    // [減点方式] potential += 20;
                    tags.push("\uD83C\uDFC6 \u30D9\u30B9\u30C8\u4F53\u91CD\u9069\u5408: \u904E\u53BB\u597D\u8D70\u6642\u306E\u5E73\u5747\u99AC\u4F53\u91CD(".concat(Math.round(avgBestWeight), "kg)\u306B\u5408\u81F4"));
                }
            }
        }
        // 【新設】期待値の歪み（前走上位人気裏切りによる過小評価）の判定
        if (lastRace.popularity !== undefined || lastRace.odds !== undefined) {
            var wasFavored = (lastRace.popularity !== undefined && lastRace.popularity <= 2) ||
                (lastRace.odds !== undefined && lastRace.odds <= 3.5);
            var didUnderperform = lastRace.result >= 4;
            var isUnderValued = (popularity >= 5) || (odds >= 8.0);
            if (wasFavored && didUnderperform && isUnderValued) {
                // [減点方式] potential += 35;
                distortionBoost += 1.5; // 期待値バイアスを大幅に強化
                // [要見直し2] tags.push("💎 期待値の闇: 前走上位人気裏切りによる過小評価(妙味爆発)");
            }
        }
        // 【新設】揉まれ弱さ（前走少頭数好走 → 今回多頭数内枠）のストレス判定
        if (lastRace.headCount !== undefined && lastRace.headCount <= 10 && lastRace.result <= 3) {
            var isMultiHorseRace = race.headCount !== undefined && race.headCount >= 14;
            var isInnerFrame = frame <= 2; // 1枠〜2枠
            if (isMultiHorseRace && isInnerFrame) {
                potential -= 20; // 揉まれ合いや砂被りによる戦意喪失リスクを考慮して大幅割引
                tags.push("⚠️ 少頭数好走→多頭数内枠: 揉まれ合い・砂被りによる惨敗リスク警戒(割引)");
            }
        }
        // 【新設】相手関係大幅緩和（前走高賞金ハイレベル戦惜敗 → 今回一般平場戦）の判定
        if (lastRace.prize !== undefined && lastRace.prize >= 300) {
            var isGeneralRace = !((_138 = race.raceName) === null || _138 === void 0 ? void 0 : _138.match(/(GⅠ|GⅡ|GⅢ|重賞|特別|ステークス|カップ|OP|オープン)/i));
            if (isGeneralRace && lastRace.result <= 8) {
                // [減点方式] potential += 30;
                tags.push("\uD83D\uDC51 \u76F8\u624B\u95A2\u4FC2\u5927\u5E45\u7DE9\u548C: \u524D\u8D70\u9AD8\u8CDE\u91D1\u7279\u5225\u6226(".concat(lastRace.prize, "\u4E07)\u60DC\u6557\u304B\u3089\u4ECA\u56DE\u5E73\u5834\u4E00\u822C\u6226\u3067\u683C\u4E0A\u512A\u4F4D"));
            }
        }
        // ④ タイム・上がり性能解析（クラス別スイートスポット）
        var isLowerClass = (_139 = horse.raceClass) === null || _139 === void 0 ? void 0 : _139.match(/(未勝利|1勝クラス|新馬)/);
        var isUpperClass = (_140 = horse.raceClass) === null || _140 === void 0 ? void 0 : _140.match(/(2勝クラス|3勝クラス|オープン|重賞|リステッド|G[123])/);
        // 下位クラス：上がり性能重視（末脚上位実績）
        var last3fTimes = horse.pastRaces.map(function (pr) { return parseFloat(pr.last3fTime || '99.9'); });
        var best3f = Math.min.apply(Math, last3fTimes);
        if (isLowerClass && best3f <= 34.2) {
            // [減点方式] potential += 30;
            tags.push('🚀下位クラス末脚エッジ');
        }
        // 上位クラス：走破タイム（持ち時計）重視
        if (isUpperClass) {
            var sameDistRaces = horse.pastRaces.filter(function (pr) { return pr.distance === race.distance; });
            var bestTime = sameDistRaces.length > 0 ? Math.min.apply(Math, sameDistRaces.map(function (pr) { return parseFloat(pr.time || '999'); })) : 999;
            if (bestTime < 999) {
                // [減点方式] potential += 25;
                tags.push('🛡️上位クラス持ち時計エッジ');
            }
        }
        // ⑤ 隠れた「タイム異常値」検知：着順は大敗でもタイム差が極少な馬
        var hiddenGem = horse.pastRaces.find(function (pr) { return pr.result >= 8 && pr.timeDiff !== undefined && pr.timeDiff <= 0.5; });
        if (hiddenGem) {
            // [減点方式] potential += 35;
            tags.push('💎タイム異常値(着順不問・実力不一致)');
        }
        // ⑥ 走場別上がりタイム（末脚ボーダーライン）解析
        var bestLast3f = Math.min.apply(Math, horse.pastRaces.map(function (pr) { return parseFloat(pr.last3fTime || '99.9'); }));
        if (race.surface === '芝') {
            if (bestLast3f <= 33.3) {
                // [減点方式] potential += 35;
                tags.push("\uD83D\uDE80\u829D\u77AC\u767A\u529B\u30A8\u30EA\u30FC\u30C8(\u4E0A\u304C\u308A".concat(bestLast3f.toFixed(1), "s)"));
                if (bestLast3f <= 32.8) {
                    // [減点方式] potential += 15;
                    tags.push('⚡芝異次元の末脚(32秒台)');
                }
            }
        }
        else if (race.surface === 'ダート') {
            // ダート：高速決着なら37-38秒台が必須。クラスが上がるほど要求値がシビアに。
            if (bestLast3f <= 38.2) {
                // [減点方式] potential += 35;
                tags.push("\uD83D\uDCAA\u30C0\u30FC\u30C8\u9AD8\u901F\u672B\u811A(\u4E0A\u304C\u308A\u6700\u901F\u7D1A)");
                if (isUpperClass && bestLast3f <= 37.8) {
                    // [減点方式] potential += 20;
                    tags.push('⚡上位ダート:必須スピード性能クリア');
                }
            }
            // 【重要】ダート・前残りバイアス解析
            // 上がり最速（35-36秒台）を後方から出す馬よりも、
            // ポジションを取って37-38秒台（短距離）で粘り込む馬を上位評価
            if (horse.style === '逃げ' || horse.style === '先行' || horse.style === '好位') {
                if (bestLast3f <= 38.5) {
                    // [減点方式] potential += 30;
                    tags.push('🛡️先行持続脚(前残りバイアス適合)');
                }
            }
            else if (horse.style === '差し' || horse.style === '追込') {
                if (bestLast3f <= 36.5) {
                    potential -= 10; // 上がり最速でも届かないリスクを考慮
                    distortionBoost += 0.5; // 2-3着（紐）としての期待値を上げる
                    tags.push('⚠️末脚不発リスク(前残り馬場考慮)');
                }
            }
            // 【新設】後半レース(8R〜12R)における末脚持続力（39秒台〜40秒台前半）の正当な評価
            if (race.raceNumber >= 8 && bestLast3f <= 40.5) {
                // [減点方式] potential += 30;
                tags.push("\uD83C\uDF03\u5F8C\u534A\u6226:\u5B89\u5B9A\u3057\u305F\u672B\u811A");
                if (bestLast3f <= 39.9) {
                    // [減点方式] potential += 15;
                    tags.push('🔥後半戦:39秒台の決定力');
                }
            }
        }
        // ⑦ 総合スピード能力（走破タイム×上がりの相関評価）
        // 厳しいペース（高速走破）の中で速い上がりを両立できる馬を最高評価
        var hasFastAndLate = horse.pastRaces.find(function (pr) {
            var timeStr = pr.time || '9:59.9';
            var _a = timeStr.includes(':') ? timeStr.split(':').map(parseFloat) : [0, parseFloat(timeStr)], min = _a[0], sec = _a[1];
            var timeVal = min * 60 + sec;
            var l3fVal = parseFloat(pr.last3fTime || '99.9');
            // 1000m基準: 1:01.2(上位) / 1:02.5(標準)
            if (pr.distance === 1000 && timeVal <= 62.5 && l3fVal <= 37.5)
                return true;
            // 1100m基準: 1:09.0以下且つ上がり38.5s以下
            if (pr.distance === 1100 && timeVal <= 69.0 && l3fVal <= 38.5)
                return true;
            // 1200m基準: 1:15.8以下且つ上がり38.5s以下
            if (pr.distance === 1200 && timeVal <= 75.8 && l3fVal <= 38.5)
                return true;
            // 1400m基準: 1:31.8(Star Candy級)を評価
            if (pr.distance === 1400 && timeVal <= 92.0 && l3fVal <= 39.5)
                return true;
            // 1500m基準: クラス別判定（JRA交流1:38.6 / 古馬B級1:39.5 / 3歳1:41.0）
            if (pr.distance === 1500) {
                if (timeVal <= 99.5 && l3fVal <= 40.0)
                    return true;
                if (age <= 3 && timeVal <= 101.5)
                    return true;
            }
            // 1700m基準: 1:51.3(ジャスパードリーム級)を評価
            if (pr.distance === 1700 && timeVal <= 111.5 && l3fVal <= 41.5)
                return true;
            return false;
        });
        if (hasFastAndLate) {
            // [減点方式] potential += 30;
            tags.push('🏆総合スピード能力(タイム×上がり相関)');
        }
        // ⑧ 安定した先行力（Positioning Consistency）の解析
        // 過去3走で継続的に前目（1-3番手）のポジションを確保できている馬を、主導権を握れる馬として評価
        var frontPosCount = horse.pastRaces.slice(0, 3).filter(function (pr) {
            if (!pr.passingPositions)
                return false;
            var pos = pr.passingPositions.split('-').map(Number);
            return pos[0] > 0 && pos[0] <= 3;
        }).length;
        if (frontPosCount >= 2) {
            // [減点方式] potential += 30;
            tags.push('🚀安定した先行力(1-3番手保持実績)');
        }
        else if (frontPosCount === 1 && (horse.style === '逃げ' || horse.style === '先行')) {
            // [減点方式] potential += 15;
            tags.push('🏹先行実績あり');
        }
        // ⑨ 超短距離（1100m以下）における「テンの速さ」特化評価
        if (dist <= 1100 && (horse.style === '逃げ' || horse.style === '先行')) {
            // [減点方式] potential += 25;
            tags.push('⚡超短距離エッジ(テンの速さ重視)');
        }
        // 通過順位による展開利（小回り・地方・特定コース）
        if (lastRace.passingPositions) {
            var pos = lastRace.passingPositions.split('-').map(Number);
            var isFront = pos[0] <= 3 || pos[1] <= 3;
            if (isFront && (trackName === '川崎' || trackName === '門別' || trackName === '笠松' || trackName === '園田')) {
                // [減点方式] potential += 20;
                tags.push('🏇小回り先行実績(展開利)');
            }
        }
    }
    // ==========================================
    // 【新設】展開・ポジション適性解析（馬場・クラス別交差評価）
    // ==========================================
    var hStyle = horse.style || '中団';
    var isLClass = (_141 = horse.raceClass) === null || _141 === void 0 ? void 0 : _141.match(/(未勝利|1勝クラス|新馬)/);
    var isUClass = (_142 = horse.raceClass) === null || _142 === void 0 ? void 0 : _142.match(/(2勝クラス|3勝クラス|オープン|重賞|リステッド|G[123])/);
    if (race.surface === 'ダート') {
        // ダート戦：先行・好位抜け出しが王道（4角5番手以内想定）
        if (hStyle === '逃げ' || hStyle === '先行' || hStyle === '好位') {
            // [減点方式] potential += 35;
            tags.push('🔥ダート王道展開(先行・好位)');
            tags.push('💪ダート先行利:キックバック回避');
            // 下級クラスや後半の古馬戦ならさらに「前残り」を強く評価
            if (isLClass || race.raceNumber >= 8) {
                // [減点方式] potential += 15;
                tags.push('🛡️ダート物理的先行有利(1着候補)');
            }
        }
        else {
            // ダート差し・追込：通常は割引だが、前半の3歳戦(JRA移籍等)は例外
            if (age <= 3 || race.raceNumber <= 7) {
                /* [減点方式] potential += 15; */ // 差し切りのポテンシャルを評価
                // [要見直し] tags.push('🚀若駒ダート:末脚一閃期待(差し切り)');
            }
            else {
                potential -= 15;
                // [要見直し2] tags.push('⚠️ダート差し・追込:展開不備注意');
                // 後半の差し馬は「紐穴（2-3着）」として期待値を調整
                if (race.raceNumber >= 8) {
                    distortionBoost += 0.5;
                    // [要見直し2] tags.push('💎後半戦差し馬:2-3着強襲期待');
                }
            }
        }
    }
    else if (race.surface === '芝') {
        if (isLClass || race.raceNumber <= 6) {
            // 芝前半レース（下位クラス）：先行・好位抜け出し有利
            if (hStyle === '逃げ' || hStyle === '先行' || hStyle === '好位') {
                // [減点方式] potential += 30;
                tags.push('🏹芝前半:先行・好位展開利');
            }
        }
        else if (isUClass || race.raceNumber >= 7) {
            // 芝後半レース（上級条件）：差し・追込の爆発有利
            if (hStyle === '中団' || hStyle === '後方') {
                // [減点方式] potential += 40;
                tags.push('🚀芝後半:差し・追込展開利');
                if (isHighPaceSim) {
                    // [減点方式] potential += 15;
                    tags.push('🔥ハイペース激戦:末脚ブースト');
                }
            }
            else if (hStyle === '逃げ' || hStyle === '先行') {
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
    var jockWeightRatio = (kinryo / weight) * 100;
    if (jockWeightRatio < 11.0) {
        /* [減点方式] potential += 35; */ // 500kg超大型馬の圧倒的パワー
        // [要見直し2] tags.push('💪斤量比率10%台(パワー無双)');
    }
    else if (jockWeightRatio <= 12.5) {
        /* [減点方式] potential += 20; */ // 450-490kg前後の適正サイズ
        // [要見直し] tags.push('💪斤量比率適正(勝ちきり期待)');
    }
    else if (jockWeightRatio >= 14.0) {
        potential -= 20; // 小柄な馬の1着は厳しい
        tags.push('⚠️斤量高負荷(2-3着ヒモ穴特化)');
    }
    // ==========================================
    // 【新設】絶対斤量（負担重量）解析
    // ==========================================
    // 55kgが最多勝利。54kg以下はヒモ、57kg以上は後半のみ信頼。
    if (kinryo === 55) {
        // [減点方式] potential += 25;
        // [要見直し2] tags.push('🎯黄金斤量(55kg)');
    }
    else if (kinryo <= 54) {
        potential -= 15;
        // [要見直し2] tags.push('🎐軽量馬(2-3着ヒモ穴特化)');
    }
    else if (kinryo >= 57) {
        if (race.raceNumber >= 7) {
            // [減点方式] potential += 20;
            tags.push('🏰重量実力馬(後半勝負)');
        }
        else {
            potential -= 15;
            // [要見直し2] tags.push('⚠️重量負担(前半戦回避)');
        }
    }
    // 馬格(500kg+) と 成長(+10kg+) のシナジー評価
    if (weight >= 500 && weightChange >= 10) {
        // [減点方式] potential += 25;
        tags.push('🚀大型馬×大幅増(成長パワーアップ)');
    }
    // ==========================================
    // 【新設】盛岡競馬場 時間帯・枠順・クラス別バイアス解析
    // ==========================================
    if (trackName === '盛岡' || race.venue === '盛岡') {
        // 枠順バイアス（全時間帯共通の強力な傾向）
        if (frame >= 7) {
            // [減点方式] potential += 30; tags.push('盛岡:外枠絶対優位');
        }
        else if (frame === 1) {
            // [減点方式] potential += 20; tags.push('盛岡:最内枠健闘');
        }
        else if (frame === 2 || frame === 4) {
            potential -= 25;
            tags.push('盛岡:死滅枠(2/4枠)懸念');
        }
        if (race.raceNumber >= 7) {
            if (popularity >= 6 && popularity <= 10) {
                // [減点方式] potential += 25; tags.push('盛岡後半:波乱警戒(大穴)');
            }
            // 1200m戦の上級クラス（後半戦）における上がりタイム要求
            if (dist === 1200 && horse.pastRaces && horse.pastRaces.length > 0) {
                // 近走1200mで好走（末脚上位相当）しているか
                var pastFast = horse.pastRaces.some(function (pr) { return pr.distance <= 1400 && pr.result <= 3; });
                if (pastFast) {
                    // [減点方式] potential += 20; tags.push('盛岡後半1200m:末脚要求適合');
                }
            }
        }
        // 盛岡特有の馬特性ボーナス
        // 1. 前走1着馬の連勝（勢い）ボーナス
        if (horse.pastRaces && horse.pastRaces.length > 0 && horse.pastRaces[0].result === 1) {
            // [減点方式] potential += 25; tags.push('盛岡:前走1着(連勝期待)');
        }
        // 2. ベテラン高齢馬（9歳以上）の激走警戒
        if (horse.age >= 9) {
            // [減点方式] potential += 20; tags.push('盛岡:ベテラン激走警戒');
        }
        // 3. 特効上位騎手とヒモ穴（若手・減量）の傾向
        if (jockey.includes('高松') || jockey.includes('高橋悠') || jockey.includes('山本聡')) {
            // [減点方式] potential += 25; tags.push('盛岡:特効上位騎手(頭候補)');
        }
        else if (jockey.includes('塚本涼') || jockey.includes('坂井瑛') || /[☆△▲◇]/.test(jockey)) {
            // [減点方式] potential += 15; tags.push('盛岡:ヒモ穴警戒(減量/若手)');
        }
    }
    // ==========================================
    // GIS幾何学適性 - 枠順バイアス (盛岡・東京以外)
    // ==========================================
    if (trackName !== '盛岡' && trackName !== '東京' && race.venue !== '盛岡' && race.venue !== '東京') {
        if (frame <= 3) { /* [減点方式] potential += 15; */ /* [要見直し2] tags.push('内枠最短経路'); */ }
        else if (frame >= (headCount - 1)) { /* [減点方式] potential += 10; */
            tags.push('外枠被せなし');
        }
    }
    // ==========================================
    // 血統・適性解析
    // ==========================================
    var dirtSires = ['ヘニーヒューズ', 'シニスターミニスター', 'ホッコータルマエ', 'パイロ', 'ドレフォン', 'マジェスティックウォリアー', 'ダノンレジェンド', 'コパノリッキー', 'フリオーソ'];
    var turfSires = ['ディープインパクト', 'ハーツクライ', 'キズナ', 'エピファネイア', 'モーリス', 'ロードカナロア', 'ドゥラメンテ'];
    if (race.surface === 'ダート') {
        if (dirtSires.some(function (s) { return bloodline.includes(s); })) { /* [減点方式] potential += 25; */ /* [要見直し2] tags.push('ダートエリート血統'); */ }
    }
    else {
        if (turfSires.some(function (s) { return bloodline.includes(s); })) { /* [減点方式] potential += 25; */
            tags.push('芝エリート血統');
        }
    }
    // ==========================================
    // 競馬場別ロジック
    // ==========================================
    if (trackName === '笠松') {
        if (horse.transferFrom === 'JRA' && (horse.jraEarnings || 0) === 0) {
            potential -= 25;
            tags.push('JRA未収得賞金の罠');
        }
        if (weight >= 510) { /* [減点方式] potential += 25; */
            tags.push('絶対パワー');
        }
        else if (weight <= 430) {
            potential -= 35;
            tags.push('足切り');
        }
        if (dist === 800 && (condition === '重' || condition === '不良')) {
            if (frame >= 7) { /* [減点方式] potential += 30; */
                tags.push('外枠絶対優位');
            }
            if (frame === 1) {
                potential -= 40;
                tags.push('1枠死滅');
            }
        }
        if (bloodline.includes('Roberto')) { /* [減点方式] potential += 15; */
            tags.push('Roberto血統');
        }
        if (jockey === '渡邊竜也') {
            if (popularity === 1 && headCount >= 10) {
                potential -= 30;
            }
            else if (5 <= frame && frame <= 8) { /* [減点方式] potential += 25; */
                tags.push('渡邊中外枠エッジ');
            }
        }
    }
    else if (trackName === '大井') {
        if (bloodline.includes('キングマンボ')) { /* [減点方式] potential += 20; */
            tags.push('ベアリング効果抗力');
        }
        if (condition === '良' && (bloodline.includes('イスラボニータ') || bloodline.includes('スクリーンヒーロー'))) {
            // [減点方式] potential += 25; tags.push('良馬場芝適性');
        }
        else if ((condition === '重' || condition === '不良') && (bloodline.includes('ゴールドアリュール') || bloodline.includes('ドレフォン') || bloodline.includes('クロフネ'))) {
            // [減点方式] potential += 30; tags.push('重馬場パワー型');
        }
        if (dist === 1600 && bloodline.includes('ヘニーヒューズ')) { /* [減点方式] potential += 45; */
            tags.push('大井1600特注ヘニーヒューズ');
        }
        var goldenCombos = { '佐々木洋一 × 矢野貴之': 40, '林正人 × 町田直希': 40, '荒山勝徳 × 笹川翼': 30 };
        if (goldenCombos["".concat(horse.trainer, " \u00D7 ").concat(jockey)]) { /* [減点方式] potential += goldenCombos[...]; */
            tags.push('黄金コンビ');
        }
    }
    // ==========================================
    // 【新設】未活用データ完全統合オメガ・プロトコル
    // ==========================================
    // 1. 乗り替え補正 (鞍上強化 / 弱化 / 減量恩恵)
    if (horse.prevJockey && horse.jockey) {
        var prevJ_1 = horse.prevJockey.replace(/[▲△☆★◇]/g, '').trim();
        var currJ_1 = horse.jockey.replace(/[▲△☆★◇]/g, '').trim();
        if (prevJ_1 !== currJ_1) {
            // 鞍上強化：前走非エリート → 今回エリート騎手
            var isPrevElite = ELITE_JOCKEYS.some(function (ej) { return prevJ_1.includes(ej); });
            var isCurrElite = ELITE_JOCKEYS.some(function (ej) { return currJ_1.includes(ej); });
            if (!isPrevElite && isCurrElite) {
                // [減点方式] potential += 30;
                tags.push('🔥勝負気配:エリート騎手乗り替え強化');
            }
            else if (isPrevElite && !isCurrElite) {
                // 鞍上弱化
                potential -= 15;
                tags.push('⚠️鞍上交代:前走エリートからの弱化懸念');
            }
            // 減量騎手への乗り替えによる斤量恩恵
            var isApprentice = /[▲△☆★◇]/.test(horse.jockey) || horse.jockey.includes('減量') || horse.jockey.includes('▲') || horse.jockey.includes('△');
            if (isApprentice) {
                // [減点方式] potential += 20;
                tags.push('⚡鞍上交代:減量ジョッキー起用(斤量恩恵バフ)');
            }
        }
    }
    // 2. 回り（左右）適性補正（サウスポー / 右回り巧者）
    var isLeftTrack = /(東京|新潟|中京|川崎|船橋|浦和|盛岡)/.test(trackName || race.venue);
    if (horse.pastRaces && horse.pastRaces.length > 0) {
        var leftTurnGood = horse.pastRaces.filter(function (pr) { return pr.direction === '左' && pr.result <= 3; }).length;
        var rightTurnGood = horse.pastRaces.filter(function (pr) { return pr.direction === '右' && pr.result <= 3; }).length;
        if (isLeftTrack) {
            if (horse.leftTurnExperience && horse.leftTurnExperience >= 2) {
                // [減点方式] potential += 25;
                tags.push("\uD83D\uDD04\u30B5\u30A6\u30B9\u30DD\u30FC\u9069\u6027:\u5DE6\u56DE\u308A\u597D\u8D70\u5B9F\u7E3E\u3042\u308A(\u5B9F\u7E3E:".concat(horse.leftTurnExperience, "\u56DE)"));
            }
            else if (leftTurnGood >= 2) {
                // [減点方式] potential += 20;
                tags.push("\uD83D\uDD04\u5DE6\u56DE\u308A\u597D\u8D70\u5B9F\u7E3E\u99AC(".concat(leftTurnGood, "\u56DE)"));
            }
            else if (rightTurnGood >= 3 && leftTurnGood === 0) {
                // 右回りは得意だが左回りは未知または凡走のみ
                potential -= 15;
                tags.push('⚠️左回り適性疑問(右回り特化型)');
            }
        }
        else {
            if (rightTurnGood >= 2) {
                // [減点方式] potential += 20;
                tags.push("\uD83D\uDD04\u53F3\u56DE\u308A\u9069\u6027\u78BA\u5B9F(".concat(rightTurnGood, "\u56DE)"));
            }
        }
    }
    // 3. 前走内負荷×今回外枠補正（砂被り回避ストレス解放）
    if (race.surface === 'ダート' && frame >= 6) {
        var isInnerLoad = horse.prevInnerLoadExp || (horse.pastRaces && horse.pastRaces[0] && horse.pastRaces[0].frameNumber !== undefined && horse.pastRaces[0].frameNumber <= 2);
        if (isInnerLoad && horse.pastRaces && horse.pastRaces[0] && horse.pastRaces[0].result >= 6) {
            // [減点方式] potential += 30;
            distortionBoost += 0.5;
            tags.push('🔥砂被り解放:前走内負荷大敗→今回砂被り回避外枠');
        }
    }
    // 4. 馬主・JRA本賞金クラス別補正（クラブ馬＆格上実績馬エッジ）
    if (horse.ownerType === 'club' || horse.ownerType === 'major') {
        var isGradeOrSpecial = (_143 = race.raceName) === null || _143 === void 0 ? void 0 : _143.match(/(GⅠ|GⅡ|GⅢ|重賞|特別|ステークス|カップ)/);
        if (isGradeOrSpecial) {
            // [減点方式] potential += 25;
            tags.push('🏰大物馬主/一口クラブ馬:上級勝負仕上げ');
        }
        else {
            // [減点方式] potential += 15;
            tags.push('🏰有力クラブ所有馬(素質馬)');
        }
    }
    if (horse.jraEarnings && horse.jraEarnings > 0) {
        var isNarTrack_1 = /(川崎|船橋|大井|浦和|門別|盛岡|水沢|金沢|笠松|名古屋|園田|姫路|高知|佐賀)/.test(trackName || race.venue);
        if (isNarTrack_1) {
            // [減点方式] potential += 40;
            tags.push("\uD83D\uDE80JRA\u5B9F\u7E3E\u683C\u4ED8\u3051:\u5727\u5012\u7684\u30AF\u30E9\u30B9\u683C\u5DEE(\u8CDE\u91D1:".concat(Math.round(horse.jraEarnings), "\u4E07)"));
        }
        else {
            // JRA下級条件での本賞金持ち実績
            var isLowerJRA = ((_144 = race.raceName) === null || _144 === void 0 ? void 0 : _144.match(/(未勝利|1勝クラス|新馬)/)) || race.raceNumber <= 6;
            if (isLowerJRA && horse.jraEarnings >= 500) {
                // [減点方式] potential += 20;
                tags.push('🛡️JRAクラス内実績馬(賞金アドバンテージ)');
            }
        }
    }
    // 5. ローテーション・休み明け補正（鉄砲実績 vs 叩き良化 vs 過密疲労）
    if (horse.isAfterRest || ((_145 = horse.rotation) === null || _145 === void 0 ? void 0 : _145.includes('休'))) {
        var hasRestGoodRecord = false;
        if (horse.pastRaces && horse.pastRaces.length > 1) {
            var restWins = horse.pastRaces.filter(function (pr, idx) {
                if (idx === horse.pastRaces.length - 1)
                    return false;
                var currDate = new Date(pr.date);
                var prevDate = new Date(horse.pastRaces[idx + 1].date);
                var diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24);
                return diffDays >= 90 && pr.result <= 3;
            }).length;
            if (restWins > 0) {
                hasRestGoodRecord = true;
            }
        }
        if (hasRestGoodRecord) {
            // [減点方式] potential += 20;
            tags.push('🛡️鉄砲実績馬:休み明け初戦から走るタイプ');
        }
        else {
            potential -= 15;
            tags.push('⚠️休み明け初戦:叩き良化型・状態未知数割引');
        }
    }
    else if (horse.rotation === '連闘' || horse.rotation === '中1週') {
        potential -= 10;
        tags.push('⚠️過密ローテ:中1週以下連戦による疲労蓄積懸念');
    }
    // 6. 季節・天候適性補正 (サマーウインド / 悪天候巧者)
    if (race.season && horse.pastRaces) {
        var isSummerRace = race.season === 'summer';
        var isWinterRace = race.season === 'winter';
        var summerWins = horse.pastRaces.filter(function (pr) {
            var month = new Date(pr.date).getMonth() + 1;
            return (month >= 7 && month <= 9) && pr.result <= 3;
        }).length;
        var winterWins = horse.pastRaces.filter(function (pr) {
            var month = new Date(pr.date).getMonth() + 1;
            return (month === 12 || month <= 2) && pr.result <= 3;
        }).length;
        // 夏競馬における「小型馬」バイアス（ベルクマンの法則）と「牝馬」バイアス
        if (isSummerRace) {
            if (horse.gender === '牝' && horse.weight > 0 && horse.weight <= 450) {
                potential += 40;
                isTargetYatomi = true; // 強力な狙い目としてフラグを立てる
                tags.push("👑 夏競馬最優先: 450kg以下小型牝馬(ベルクマンの法則×ホルモン安定)");
            }
            else if (horse.gender !== '牝' && horse.weight > 0 && horse.weight <= 470) {
                potential += 20;
                tags.push("☀️ 夏競馬次点: 470kg以下小型牡馬(ベルクマンの法則適合)");
            }
            else if (horse.gender === '牝') {
                potential += 10;
                tags.push("☀️ 夏の牝馬バイアス適合(暑さ耐性)");
            }
            if (horse.coatColor && /(黒鹿毛|青鹿毛|青毛)/.test(horse.coatColor) && horse.weight >= 500) {
                potential -= 15;
                tags.push("⚠️ 酷暑による大型黒毛馬の夏負けリスク(体熱放出困難)");
            }
        }
        if (isSummerRace && summerWins >= 2) {
            // [減点方式] potential += 20;
            tags.push('☀️夏馬エッジ:暑い時期にパフォーマンス向上');
        }
        else if (isWinterRace && winterWins >= 2) {
            // [減点方式] potential += 20;
            tags.push('❄️冬馬エッジ:寒い時期にパフォーマンス向上');
        }
    }
    if ((((_146 = race.weather) === null || _146 === void 0 ? void 0 : _146.includes('雨')) || ((_147 = race.weather) === null || _147 === void 0 ? void 0 : _147.includes('雪')) || race.condition === '重' || race.condition === '不良') && horse.pastRaces) {
        var heavyGood = horse.pastRaces.filter(function (pr) { return (pr.condition === '重' || pr.condition === '不良') && pr.result <= 3; }).length;
        if (heavyGood >= 2) {
            // [減点方式] potential += 25;
            tags.push("\u2614\u9053\u60AA\u5DE7\u8005:\u8352\u5929\u30FB\u6CE5\u99AC\u5834\u5B9F\u7E3E(".concat(heavyGood, "\u56DE\u597D\u8D70)"));
        }
    }
    // 7. コーナー通過順変動（まくり・押し上げ能力）補正
    if (horse.cornerPositionVariance && horse.cornerPositionVariance >= 3.0) {
        if (horse.style === '差し' || horse.style === '追込' || horse.style === '中団') {
            // [減点方式] potential += 20;
            tags.push("\uD83C\uDF00\u52D5\u7684\u307E\u304F\u308A\u811A:\u9053\u4E2D\u4F4D\u7F6E\u62BC\u3057\u4E0A\u3052\u80FD\u529B(\u5206\u6563:".concat(horse.cornerPositionVariance.toFixed(1), ")"));
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
            // [減点方式] potential += 20;
            // [要見直し] tags.push('前半:差し・追い込み波乱警戒');
        }
        if (popularity >= 6 && popularity <= 8) {
            // [減点方式] potential += 25;
            // [要見直し2] tags.push('前半:中穴激走ゾーン');
        }
        // 1番人気の取りこぼし注意
        // 1番人気の信頼度アップ
        if (popularity === 1) {
            // [減点方式] potential += 25;
            tags.push('後半:1番人気(信頼度アップ)');
        }
        // 10番人気以下の超大穴の一発警戒
        if (popularity >= 10) {
            // [減点方式] potential += 20;
            // [要見直し2] tags.push('後半:爆穴(ヒモ穴・高配当狙い)');
        }
    }
    // ==========================================
    // 【新設】市場心理：上位人気の圧倒的信頼（園田・地方限定バイアス）
    // ==========================================
    // 24戦23勝が3番人気以内という極端な「堅実決着」パターンを学習
    if (trackName === '園田' || trackName === '西脇' || trackName === '姫路') {
        if (popularity === 1) {
            /* [減点方式] potential += 60; */ // 1番人気の鉄板級信頼度(勝率60%超)
            tags.push('👑園田:1番人気(鉄板級信頼度)');
        }
        else if (popularity <= 3) {
            /* [減点方式] potential += 35; */ // 3番人気以内の圧倒的勝率(24戦23勝)を反映
            tags.push('🛡️園田:上位人気(堅実決着ゾーン)');
        }
        else if (popularity >= 6) {
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
            // [減点方式] potential += 25;
            tags.push('🌅前半フェーズ:先行・ポジション優位');
        }
    }
    // ② 後半フェーズ（7-12R / 上位条件・特別）：末脚の質とトップ騎手の勝負強さ
    else {
        // 高速化した馬場に対応できる鋭い上がり性能
        var hasSharpLast3f = horse.pastRaces.some(function (pr) {
            var l3f = parseFloat(pr.last3fTime || '99.9');
            return race.surface === '芝' ? l3f <= 33.8 : l3f <= 38.5;
        });
        if (hasSharpLast3f) {
            // [減点方式] potential += 30;
            // [要見直し] tags.push('🌃後半フェーズ:鋭い末脚(上がり重視)');
        }
        // 重要な局面（特別・メイン）でのリーディング上位騎手への期待値
        if (isEliteJockey) {
            // [減点方式] potential += 25;
            tags.push('🌃後半フェーズ:トップ騎手の勝負強さ');
        }
        // 上位クラスでの持ち時計実績（高速決着対応）
        if (isUClass) {
            var hasFastTime = horse.pastRaces.some(function (pr) { return pr.distance === race.distance && pr.result <= 3; });
            if (hasFastTime) {
                // [減点方式] potential += 20;
                tags.push('🌃後半フェーズ:上位クラス時計実績');
            }
        }
    }
    // ===================================================
    // 【追加】結果×出馬表のクロスロジック（期待値ハック）
    // ===================================================
    var escapeHorsesCount = race.horses.filter(function (h) { return h.style === '逃げ'; }).length;
    // 1. 展開（ペース）予測と脚質の逆転ロジック
    if (escapeHorsesCount >= 3) {
        // ハイペース必至
        if (prevRaceData && prevRaceData.last3fTime) {
            var prevLast3f = parseFloat(prevRaceData.last3fTime);
            if ((horse.style === '差し' || horse.style === '追込') && prevRaceData.result >= 4 && !isNaN(prevLast3f) && prevLast3f <= 34.5) {
                // [減点方式] potential += 45;
                tags.push("🔥 期待値クロス: 前走展開泣きの上がり最速馬（ハイペース必至で台頭）");
            }
        }
    }
    else if (escapeHorsesCount === 1) {
        // 単騎逃げ確定
        if (horse.style === '逃げ') {
            // [減点方式] potential += 40;
            // [要見直し2] tags.push("🔥 期待値クロス: 競り掛ける馬が不在の単騎逃げ確定（マイペース絶対有利）");
        }
    }
    // 2. 着順ではなく着差（タイム差）評価ロジック
    if (prevRaceData && prevRaceData.result >= 6 && prevRaceData.timeDiff !== undefined) {
        if (prevRaceData.timeDiff <= 0.5) {
            // [減点方式] potential += 35;
            tags.push("🔥 期待値クロス: 前走6着以下だが着差0.5秒以内の実力馬（オッズ盲点）");
        }
    }
    // 3. 陣営の勝負気配（トップ騎手への乗り替わり）検知
    var jraTopJockeys = ['ルメール', '川田', '武豊', '戸崎', '横山武', '松山', 'モレイラ', 'レーン'];
    if (prevRaceData && prevRaceData.jockey) {
        var prevWasTop = jraTopJockeys.some(function (j) { return prevRaceData.jockey.includes(j); });
        var nowIsTop = jraTopJockeys.some(function (j) { return horse.jockey.includes(j); });
        if (!prevWasTop && nowIsTop) {
            // [減点方式] potential += 40;
            tags.push("🔥 期待値クロス: 前走非トップ騎手からのトップ騎手手配（陣営の超勝負気配）");
        }
    }
    // ===================================================
    // 【追加】未使用データ（調教・馬体重・ブランド・特殊状態）ロジック
    // ===================================================
    // 1. 調教評価ロジック
    if (horse.trainingRating === 'S') {
        // [減点方式] potential += 35;
        tags.push('🚀 究極仕上げ: 調教評価Sランク（一変のサイン）');
    }
    else if (horse.trainingRating === 'A') {
        // [減点方式] potential += 15;
        tags.push('💨 メイチ仕上げ: 調教評価A');
    }
    // 2. 馬体重の異常増減ロジック
    if (horse.gender === '牝' && horse.weightChange <= -10) {
        potential -= 30;
        tags.push('⚠️ 危険信号: 牝馬の大幅馬体減（細化懸念）');
    }
    if (horse.isAfterRest && horse.weightChange >= 15) {
        var penalty = horse.age <= 3 ? 10 : 20; // 3歳以下は成長分の可能性を考慮
        potential -= penalty;
        tags.push('⚠️ 危険信号: 休み明けの大幅馬体増（太め残り懸念）');
    }
    // 3. エリートブランド × トップ騎手
    if (horse.breeder && horse.breeder.includes('ノーザンファーム')) {
        var topEliteJockeys = ['ルメール', '川田', 'モレイラ'];
        if (topEliteJockeys.some(function (j) { return horse.jockey.includes(j); })) {
            // [減点方式] potential += 25;
            tags.push('💎 エリート包囲網: ノーザンF × トップ騎手（勝負気配MAX）');
        }
    }
    // 4. 前走の明確な不利からの巻き返し
    if (prevRaceData && prevRaceData.incidents) {
        if (prevRaceData.incidents.includes('前が壁') || prevRaceData.incidents.includes('詰まる') || prevRaceData.incidents.includes('不利')) {
            // [減点方式] potential += 30;
            tags.push('🚨 巻き返し必至: 前走「前が壁・不利」による不完全燃焼');
        }
    }
    // 5. 特殊馬具（ブリンカー着用）
    if (horse.useBlinkers) {
        // [減点方式] potential += 10;
        // [要見直し] tags.push('🐴 ブリンカー着用（集中力UP）');
    }
    // ===================================================
    // 【追加】JRA未使用データ（馬場・風・調教ラップ・ローテ・仮柵）完全活用ロジック
    // ===================================================
    // 1. クッション値の完全一致リンク（馬場ピタリ）
    if (race.cushionValue && race.cushionValue > 0 && horse.pastRaces) {
        var hasPerfectMatch = horse.pastRaces.some(function (pr) {
            return pr.result <= 3 && pr.cushionValue !== undefined && Math.abs(pr.cushionValue - race.cushionValue) <= 0.3;
        });
        if (hasPerfectMatch) {
            // [減点方式] potential += 20;
            tags.push('🎯 馬場ピタリ: 好走時のクッション値と完全一致');
        }
    }
    // 2. 強風・向かい風によるバイアス（逃げ馬ペナルティ）
    if (race.windSpeed && race.windSpeed >= 5 && race.isHeadwind) {
        if (horse.style === '逃げ') {
            potential -= 25;
            tags.push('⚠️ 危険信号: 強烈な向かい風による逃げ馬の失速懸念');
        }
        else if (horse.style === '差し' || horse.style === '追込') {
            // [減点方式] potential += 15;
            tags.push('🌪️ 強風展開利: 向かい風で前が潰れる差し展開');
        }
    }
    // 3. 調教タイムの加速ラップ検知（隠れS評価）
    if (horse.trainingTime) {
        // 例: "南W 67.5-51.2-37.1-11.4" から "-11.X" の部分を抽出
        var match = horse.trainingTime.match(/-11\.[0-6]$/);
        if (match) {
            // [減点方式] potential += 20;
            tags.push('⚡ 鬼脚仕上: 調教ラスト1F 11秒台の超加速ラップ');
        }
    }
    // 4. ローテーションの妙味（叩き2走目）と疲労検知（連闘減体重）
    if (horse.rotation === '休み明け2戦目' || horse.rotation === '叩き2走目') {
        // [減点方式] potential += 20;
        tags.push('🔥 状態ピーク: 叩き2走目の大幅な上積み');
    }
    else if ((horse.rotation === '連闘' || horse.rotation === '中1週') && horse.weightChange <= -4) {
        potential -= 15;
        tags.push('⚠️ 疲労蓄積: 間隔詰まりでの馬体減');
    }
    // 5. 仮柵（A→B/Cコース）替わりのイン突きバイアス
    if (race.temporaryFencePosition === 'B' || race.temporaryFencePosition === 'C') {
        if (horse.frame <= 3 && (horse.style === '逃げ' || horse.style === '先行')) {
            // [減点方式] potential += 25;
            tags.push("\uD83D\uDEE3\uFE0F \u30C8\u30E9\u30C3\u30AF\u30D0\u30A4\u30A2\u30B9\u7D76\u5BFE\u795E: ".concat(race.temporaryFencePosition, "\u30B3\u30FC\u30B9\u66FF\u308F\u308A\u306E\u5185\u67A0\u5148\u884C"));
        }
    }
    // ===================================================
    // 【追加】MasterDataの記憶（自己学習履歴）の活用
    // ===================================================
    if (masterData && masterData.horses && masterData.horses[horse.name]) {
        var historicalIncidents = masterData.horses[horse.name].incidents;
        if (historicalIncidents && historicalIncidents.length > 0) {
            var hasHugeWin = historicalIncidents.some(function (inc) { return inc.note === "大差圧勝"; });
            var hasBadLuck = historicalIncidents.some(function (inc) { return inc.note === "レース中不利"; });
            if (hasHugeWin) {
                // [減点方式] potential += 20;
                tags.push('👑 怪物記憶: AIが記憶する過去の「大差圧勝」履歴（底なしポテンシャル）');
            }
            if (hasBadLuck) {
                // [減点方式] potential += 15;
                tags.push('🧠 不利記憶: AIが記憶する過去のレース不利履歴からの巻き返し');
            }
        }
    }
    // ---------------------------------------------------
    // 動的学習パッチの適用
    // ---------------------------------------------------
    for (var _175 = 0, learningPatches_1 = learningPatches; _175 < learningPatches_1.length; _175++) {
        var patch = learningPatches_1[_175];
        if (!patch.active)
            continue;
        if (patch.track && patch.track !== trackName)
            continue;
        if (patch.condition && patch.condition !== condition)
            continue;
        for (var _176 = 0, _177 = patch.adjustments; _176 < _177.length; _176++) {
            var adj = _177[_176];
            var field = adj.field;
            var val = horse[field];
            var applies = false;
            if (typeof val === 'number') {
                if (adj.operator === '>=' && val >= Number(adj.value))
                    applies = true;
                else if (adj.operator === '<=' && val <= Number(adj.value))
                    applies = true;
                else if (adj.operator === '==' && val === Number(adj.value))
                    applies = true;
            }
            else if (typeof val === 'string' && typeof adj.value === 'string') {
                if (adj.operator === 'includes' && val.includes(adj.value))
                    applies = true;
                else if (adj.operator === '==' && val === adj.value)
                    applies = true;
            }
            if (applies) { /* [減点方式] potential += adj.scoreAdjust; */
                tags.push("\u5B66\u7FD2\u30D1\u30C3\u30C1(".concat(patch.version, ")"));
            }
        }
    }
    // ==========================================
    // 【新設】オッズ偏差値 (Odds Deviation) システム
    // ==========================================
    var impliedProb = 1.0 / (odds || 999.9);
    // AI算出勝率（減点方式：初期値1000から減点、1000点=満点として比率計算）
    var aiWinProb = Math.min(potential / 1000.0, 1.0);
    var oddsDeviation = aiWinProb - impliedProb;
    // ① 過小評価（不当穴馬）の検知と爆発的ブースト
    if (oddsDeviation >= 0.05) { // 期待値が5%以上プラス乖離
        var deviationBonus = Math.floor(oddsDeviation * 250); // 乖離幅に応じた加点
        potential += deviationBonus;
        tags.push("\uD83D\uDC8E\u671F\u5F85\u5024\u4E56\u96E2(\u5927\u5316\u3051\u671F\u5F85)");
        // 強力なトリガー（ブリンカー・激絞り）とのシナジー
        var hasSynergyTrigger = tags.some(function (t) { return t.match(/(ブリンカー|極限の仕上げ|一変トリガー|激走フラグ)/); });
        if (hasSynergyTrigger) {
            // [減点方式] potential += 45;
            // [要見直し] tags.push('🚀期待値シナジー(歪み×一変トリガー)');
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
    var currentOddsSS = horse.oddsStandardScore || 50;
    // ---------------------------------------------------
    // 市場収束バイアス（園田:低偏差・堅実収束パターン）
    // ---------------------------------------------------
    // 平均1.75番人気で決着する「低偏差馬場」では、高SS（上位人気）ほど正解率が向上する
    if (trackName === '園田' || trackName === '西脇' || trackName === '姫路') {
        if (currentOddsSS >= 65 || popularity <= 2) {
            /* [減点方式] potential += 30; */ // 圧倒的人気への実力集中を評価
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
        // [要見直し2] tags.push('🌌人気逆数加速(爆穴補正)');
    }
    // 斤量比率（14%超）によるヒモ穴ブースト
    var currentWeightRatio = weight > 0 ? (kinryo / weight) * 100 : 0;
    if (currentWeightRatio >= 14.0) {
        distortionBoost += 0.6;
        tags.push('💎3連系:高負荷激走ブースト');
    }
    // 軽量馬（54kg以下）によるヒモ穴ブースト
    if (kinryo <= 54) {
        distortionBoost += 0.4;
        // [要見直し2] tags.push('💎3連系:軽量激走ブースト');
    }
    // 隠れた実力馬（近走大敗だが5走以内実績あり）ブースト
    var lastTDiff = (horse.pastRaces && horse.pastRaces[0]) ? ((_148 = horse.pastRaces[0].timeDiff) !== null && _148 !== void 0 ? _148 : 0) : 0;
    if (lastTDiff >= 3.0 && horse.pastRaces && horse.pastRaces.slice(1, 5).some(function (pr) { return pr.result <= 3; })) {
        distortionBoost += 0.5;
        tags.push('💎3連系:隠れた実力激走ブースト');
    }
    // 東京開催特有の「爆穴激走」ブースト
    if (trackName === '東京' && popularity >= 10 && odds >= 50.0) {
        distortionBoost += 0.8;
        // [要見直し2] tags.push('🌌東京:爆穴ポテンシャル加速');
    }
    // タイム異常値（着順大敗・タイム僅差）ブースト
    if (horse.pastRaces && horse.pastRaces.find(function (pr) { return pr.result >= 8 && pr.timeDiff !== undefined && pr.timeDiff <= 0.5; })) {
        distortionBoost += 0.6;
        tags.push('💎3連系:タイム異常値ブースト');
    }
    // 京都芝×エピファネイア（ヒモ穴特化）
    if (trackName === '京都' && race.surface === '芝' && ((_149 = horse.sire) === null || _149 === void 0 ? void 0 : _149.includes('エピファネイア'))) {
        distortionBoost += 0.4;
        tags.push('💎3連系:エピファネイア適性ブースト');
    }
    // ==========================================
    // 【中山競馬場 超特化型オメガ・プロトコル推論エンジン】
    // ==========================================
    var isNakayama = ((_150 = race.venue) === null || _150 === void 0 ? void 0 : _150.includes("中山")) || ((_151 = race.trackName) === null || _151 === void 0 ? void 0 : _151.includes("中山")) || ((_152 = race.raceName) === null || _152 === void 0 ? void 0 : _152.includes("中山"));
    if (isNakayama) {
        tags.push("⛰️ 中山特化OMEGAエンジン適用中");
        // 1. 急坂パワー物理（巨大なすり鉢とJRA最大の急坂）
        if (weight >= 500 && race.surface === 'ダート') {
            // [減点方式] potential += 25;
            tags.push("💪 中山急坂物理: 500kg超の絶対的パワー優位");
        }
        else if (weight > 0 && weight <= 430) {
            potential -= 15;
            tags.push("⚠️ 中山急坂物理: 軽量馬のパワー不足懸念");
        }
        // 2. コーナーリング力学と脚質バイアス
        if (horse.style === "先行") {
            // [減点方式] potential += 20;
            tags.push("🏃 中山力学: 4角先行・持続力押し切りエッジ");
        }
        else if (horse.style === "追込") {
            potential -= 25;
            tags.push("❌ 中山追込困難: 短直線による物理的絶望");
        }
        // 3. 遠心力ロスと枠順
        if (frame >= 7) {
            potential -= 15;
            tags.push("⚠️ 中山外枠: スパイラルカーブでの遠心力ロス(物理的負債)");
        }
    }
    // ==========================================
    // 【中京競馬場 超特化型オメガ・プロトコル推論エンジン】
    // ==========================================
    var isChukyo = ((_153 = race.venue) === null || _153 === void 0 ? void 0 : _153.includes("中京")) || ((_154 = race.trackName) === null || _154 === void 0 ? void 0 : _154.includes("中京")) || ((_155 = race.raceName) === null || _155 === void 0 ? void 0 : _155.includes("中京"));
    if (isChukyo) {
        tags.push("🎢 中京特化OMEGAエンジン適用中");
        // 1. スパイラルカーブの遠心力回避（インベタ絶対優位）
        if (frame <= 3 && (horse.style === "逃げ" || horse.style === "先行")) {
            // [減点方式] potential += 25;
            tags.push("🎯 中京スパイラル力学: 内枠先行のロスなしインベタエッジ");
        }
        // 2. 芝1200mの道悪バイアス反転
        var isWetChukyo = race.condition === "重" || race.condition === "不良";
        if (race.surface === '芝' && dist === 1200 && isWetChukyo && frame >= 6) {
            // [減点方式] potential += 25;
            tags.push("☔ 中京芝道悪: バイアス反転による外枠優位");
        }
        // 3. ダートの白い砂（珪砂）適性とマクリ
        if (race.surface === 'ダート' && horse.style === "マクリ") {
            // [減点方式] potential += 20;
            tags.push("🚀 中京ダート: 珪砂適性とマクリ強襲エッジ");
        }
    }
    // ==========================================
    // 【小倉競馬場 超特化型オメガ・プロトコル推論エンジン】
    // ==========================================
    var isKokura = ((_156 = race.venue) === null || _156 === void 0 ? void 0 : _156.includes("小倉")) || ((_157 = race.trackName) === null || _157 === void 0 ? void 0 : _157.includes("小倉")) || ((_158 = race.raceName) === null || _158 === void 0 ? void 0 : _158.includes("小倉"));
    if (isKokura) {
        tags.push("🏎️ 小倉特化OMEGAエンジン適用中");
        // 1. スピード絶対主義（下り坂の慣性利用）
        if (horse.style === "逃げ") {
            // [減点方式] potential += 30;
            tags.push("🚀 小倉スピード主義: 下り坂慣性を活かす逃げ馬絶対優位");
        }
        // 2. 中距離マクリ物理
        if (dist >= 1700 && horse.style === "マクリ") {
            // [減点方式] potential += 25;
            tags.push("🌪️ 小倉中距離: 丘からの下り坂を利用したマクリ物理エッジ");
        }
        // 3. 芝スプリントの大型馬パワー
        if (race.surface === '芝' && dist === 1200 && weight >= 500) {
            // [減点方式] potential += 20;
            tags.push("💪 小倉スプリント: 激流を制する大型馬パワーエッジ");
        }
    }
    // ==========================================
    // 【札幌競馬場 超特化型オメガ・プロトコル推論エンジン】
    // ==========================================
    var isSapporo = ((_159 = race.venue) === null || _159 === void 0 ? void 0 : _159.includes("札幌")) || ((_160 = race.trackName) === null || _160 === void 0 ? void 0 : _160.includes("札幌")) || ((_161 = race.raceName) === null || _161 === void 0 ? void 0 : _161.includes("札幌"));
    if (isSapporo) {
        tags.push("❄️ 札幌特化OMEGAエンジン適用中");
        // 1. 大回りの幾何学（減速不要のコーナーリング）
        if (horse.style === "逃げ" || horse.style === "先行") {
            // [減点方式] potential += 20;
            tags.push("🏃 札幌大回り幾何学: 緩いコーナーでの先行押し切りエッジ");
        }
        // 2. 減速不要のマクリ
        if (dist >= 1700 && horse.style === "マクリ") {
            // [減点方式] potential += 30;
            tags.push("🌪️ 札幌大回り幾何学: 減速不要の高速マクリエッジ(特注)");
        }
        // 3. ダート外枠の砂被り回避
        if (race.surface === 'ダート' && frame >= 6) {
            // [減点方式] potential += 15;
            tags.push("🛡️ 札幌ダート: 砂被り回避の外枠スムーズエッジ");
        }
    }
    // ==========================================
    // 【福島競馬場 超特化型オメガ・プロトコル推論エンジン】
    // ==========================================
    var isFukushima = ((_162 = race.venue) === null || _162 === void 0 ? void 0 : _162.includes("福島")) || ((_163 = race.trackName) === null || _163 === void 0 ? void 0 : _163.includes("福島")) || ((_164 = race.raceName) === null || _164 === void 0 ? void 0 : _164.includes("福島"));
    if (isFukushima) {
        tags.push("🎢 福島特化OMEGAエンジン適用中");
        // 1. コンパクト設計の距離ロス計算
        if (frame >= 6 && horse.style !== "逃げ") {
            potential -= 15;
            tags.push("⚠️ 福島遠心力ロス: 外回しによる3.9馬身の物理的負債");
        }
        // 2. マクリ優勢の起伏
        if (race.surface === '芝' && horse.style === "マクリ") {
            // [減点方式] potential += 25;
            tags.push("🌪️ 福島起伏力学: 早め仕掛けのマクリ絶対優位");
        }
        // 3. ダート1150mの異常バイアス（道悪の1枠）
        var isWetFuku = race.condition === "重" || race.condition === "不良";
        if (race.surface === 'ダート' && dist === 1150 && isWetFuku && frame === 1) {
            // [減点方式] potential += 40;
            tags.push("🎯 福島ダ1150特注: 道悪1枠の異常バイアス鉄板フラグ");
        }
    }
    // ===================================================
    // 【新設】中央競馬10箇所（JRA）特化型オメガ・プロトコル推論エンジン
    // ===================================================
    var isJRA = /(東京|中山|京都|阪神|中京|新潟|小倉|福島|函館|札幌)/.test(race.venue || race.trackName || race.raceName || '');
    if (isJRA) {
        // [要見直し] tags.push("JRA特化OMEGAエンジン適用中");
        // ---------------------------------------------------
        // ① 【要素1】今回レース環境（Race）の新要因評価
        // ---------------------------------------------------
        // 季節適性バイオリズム判定
        if (race.season === 'summer') {
            // 夏競馬における「小型馬」バイアス（ベルクマンの法則）と「牝馬」バイアス
            if (gender === '牝' && weight > 0 && weight <= 450) {
                // 【最優先】450kg以下の小型牝馬
                potential += 40;
                isTargetYatomi = true; // 強力な狙い目としてフラグを立てる
                tags.push("👑 夏競馬最優先: 450kg以下小型牝馬(ベルクマンの法則×ホルモン安定)");
            }
            else if (gender !== '牝' && weight > 0 && weight <= 470) {
                // 【次点】470kg以下の小型牡馬/セン馬
                potential += 20;
                tags.push("☀️ 夏競馬次点: 470kg以下小型牡馬(ベルクマンの法則適合)");
            }
            else if (gender === '牝') {
                // 通常サイズの牝馬でも夏は有利
                potential += 10;
                tags.push("☀️ 夏の牝馬バイアス適合(暑さ耐性)");
            }
            if (horse.coatColor && /(黒鹿毛|青鹿毛|青毛)/.test(horse.coatColor) && weight >= 500) {
                potential -= 15;
                tags.push("⚠️ 酷暑による大型黒毛馬の夏負けリスク(体熱放出困難)");
            }
        }
        else if (race.season === 'winter') {
            if (gender === '牝' && weight <= 440 && weight > 0) {
                potential -= 10;
                tags.push("⚠️ 冬期寒冷馬場における小柄牝馬のスタミナ懸念(馬体維持困難)");
            }
        }
        // 天候・馬場急変兆候検知
        if ((((_165 = race.weather) === null || _165 === void 0 ? void 0 : _165.includes('雨')) || ((_166 = race.weather) === null || _166 === void 0 ? void 0 : _166.includes('雪'))) && (condition === '良' || condition === '稍重')) {
            var softBlood = ['キズナ', 'エピファネイア', 'ルーラーシップ', 'ハービンジャー', 'ゴールドシップ'];
            var hasSoftBlood = softBlood.some(function (sb) { return bloodline.includes(sb) || (horse.sire && horse.sire.includes(sb)) || (horse.bms && horse.bms.includes(sb)); });
            if (hasSoftBlood) {
                // [減点方式] potential += 20;
                tags.push("☔ 天候急変（雨/雪）による道悪血統適性(馬場軟化適性)");
            }
        }
        // 薄暮・ナイター精神ストレス判定
        if (race.isNight || race.isTwilight) {
            var hasPastStumbled = horse.pastRaces && horse.pastRaces.some(function (pr) { return pr.isStumbled; });
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
                var eliteLongSires = ['ディープインパクト', 'ハーツクライ', 'ドゥラメンテ', 'キタサンブラック'];
                var isEliteLong = eliteLongSires.some(function (es) { return horse.sire.includes(es); });
                if (isEliteLong) {
                    // [減点方式] potential += 25;
                    tags.push("\uD83E\uDDEC \u829D\u4E2D\u9577\u8DDD\u96E2\u30A8\u30EA\u30FC\u30C8\u30B5\u30A4\u30A2\u30FC\u9069\u6027(".concat(horse.sire.replace(/ファーム|牧場/g, ''), ")"));
                }
            }
            if (dist <= 1400 || race.surface === 'ダート') {
                var speedSires = ['ロードカナロア', 'ヘニーヒューズ', 'シニスターミニスター', 'ドレフォン'];
                var isSpeedSire = speedSires.some(function (ss) { return horse.sire.includes(ss); });
                if (isSpeedSire) {
                    // [減点方式] potential += 20;
                    tags.push("\uD83E\uDDEC \u30B9\u30D4\u30FC\u30C9\u30FB\u7802\u30B5\u30A4\u30A2\u30FC\u9069\u6027");
                }
            }
        }
        // 鉄砲（休み明け初戦）仕上がり判定
        if (horse.isAfterRest) {
            var rating = (_167 = horse.trainingRating) === null || _167 === void 0 ? void 0 : _167.toUpperCase();
            if (rating === 'S' || rating === 'A') {
                // [減点方式] potential += 20;
                tags.push("🔥 鉄砲抜群：休み明け初戦×好仕上がり(即戦力)");
            }
            else {
                potential -= 15;
                tags.push("⚠️ 休み明け初戦・仕上がり途上割引(叩き良化型)");
            }
        }
        // 過密ローテーションと疲労消耗判定
        if (horse.rotation === '連闘' || horse.rotation === '中1週') {
            var prevGood = horse.pastRaces && horse.pastRaces[0] && horse.pastRaces[0].result <= 3;
            if (prevGood && weightChange < 0) {
                potential -= 20;
                tags.push("⚠️ 過密ローテ激走反動・馬体重減リスク(疲労蓄積懸念)");
            }
        }
        // 昇降級クラス変動判定
        if (horse.raceClass && horse.pastRaces && horse.pastRaces[0] && horse.pastRaces[0].raceClass) {
            var currentClass = horse.raceClass;
            var prevClass = horse.pastRaces[0].raceClass;
            // 簡易クラス強度マッピング (未勝利 < 1勝 < 2勝 < 3勝 < オープン/G3/G2/G1)
            var getClassScore = function (c) {
                if (c.includes('GⅠ') || c.includes('G1') || c.includes('重賞'))
                    return 6;
                if (c.includes('GⅡ') || c.includes('G2') || c.includes('GⅢ') || c.includes('G3') || c.includes('オープン') || c.includes('OP'))
                    return 5;
                if (c.includes('3勝') || c.includes('1600万'))
                    return 4;
                if (c.includes('2勝') || c.includes('1000万'))
                    return 3;
                if (c.includes('1勝') || c.includes('500万'))
                    return 2;
                if (c.includes('新馬'))
                    return 1.5;
                if (c.includes('未勝利'))
                    return 1;
                return 0;
            };
            var currScore = getClassScore(currentClass);
            var prevScore = getClassScore(prevClass);
            if (currScore > 0 && prevScore > 0) {
                if (currScore < prevScore) {
                    // [減点方式] potential += 30;
                    tags.push("\uD83D\uDC51 \u30AF\u30E9\u30B9\u964D\u7D1A\u306B\u3088\u308B\u5727\u5012\u7684\u683C\u4E0A\u4F4D\u30A2\u30C9\u30D0\u30F3\u30C6\u30FC\u30B8(".concat(prevClass, "\u2192").concat(currentClass, ")"));
                }
                else if (currScore > prevScore) {
                    potential -= 10;
                    tags.push("\u26A0\uFE0F \u30AF\u30E9\u30B9\u6607\u7D1A\u521D\u6226\u306B\u3088\u308B\u5B9F\u529B\u691C\u8A3C\u306E\u58C1(".concat(prevClass, "\u2192").concat(currentClass, ")"));
                }
            }
        }
        // コーナー通過順位変動（まくり機動力）判定
        var isShortTrack = /(中山|福島|小倉|函館|札幌)/.test(race.venue || race.trackName || '');
        if (isShortTrack && horse.cornerPositionVariance && horse.cornerPositionVariance >= 2.0) {
            // [減点方式] potential += 20;
            tags.push("📐 小回り勝負所機動力（まくり適性）適合");
        }
        // 左回りサウスポー判定
        var isLeftTrack_1 = /(東京|中京|新潟)/.test(race.venue || race.trackName || '');
        if (isLeftTrack_1 && horse.leftTurnExperience && horse.leftTurnExperience >= 2) {
            // [減点方式] potential += 20;
            tags.push("📐 左回りサウスポー実績適合");
        }
        // 前走イン物理ロスからの外枠激変判定
        if (frame >= 6 && horse.pastRaces && horse.pastRaces[0]) {
            var wasInner = horse.prevInnerLoadExp || (horse.pastRaces[0].frameNumber !== undefined && horse.pastRaces[0].frameNumber <= 2);
            var didLose = horse.pastRaces[0].result >= 6;
            if (wasInner && didLose) {
                // [減点方式] potential += 25;
                tags.push("📐 前走内荒れロスからの外枠替わり激変期待値");
            }
        }
        // 初ブリンカー変心判定
        if (horse.useBlinkers) {
            // [減点方式] potential += 25;
            // [要見直し] tags.push("🎯 初ブリンカー装着による集中力激変期待");
        }
        // オッズ偏差値信頼度判定
        if (horse.oddsStandardScore && horse.oddsStandardScore >= 65 && popularity === 1) {
            // [減点方式] potential += 15;
            tags.push("👑 断然人気・オッズ偏差値SSS of 絶対的信頼");
        }
        // ---------------------------------------------------
        // ③ 【要素3】過去走履歴（PastRace）の新要因評価
        // ---------------------------------------------------
        // 過去走勝ち馬のその後の出世度（winnerName）による対戦レベル補正
        if (horse.pastRaces && horse.pastRaces.length > 0) {
            var hasStrongRival = horse.pastRaces.slice(0, 3).some(function (pr) {
                var eliteRivals = ['サトノフェンサー', 'イクイノックス', 'ドウデュース', 'リバティアイランド', 'ソールオリエンス', 'タスティエーラ', 'ジャスティンパレス', 'プログノーシス', 'ルガル'];
                return pr.winnerName && eliteRivals.some(function (er) { var _a; return (_a = pr.winnerName) === null || _a === void 0 ? void 0 : _a.includes(er); }) && pr.timeDiff !== undefined && pr.timeDiff <= 0.4;
            });
            if (hasStrongRival) {
                // [減点方式] potential += 25;
                tags.push("👑 過去走対戦馬レベル高（勝ち馬のその後の出世）");
            }
        }
        // クラス基準タイム比較による時計的真価判定
        if (horse.pastRaces) {
            var hasExcellentTime = horse.pastRaces.slice(0, 3).some(function (pr) {
                if (!pr.time || !pr.classBaseTime)
                    return false;
                var parseTimeToSec = function (tStr) {
                    var clean = tStr.trim();
                    if (clean.includes(':')) {
                        var parts = clean.split(':');
                        return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
                    }
                    return parseFloat(clean) || 999;
                };
                var seconds = parseTimeToSec(pr.time);
                var baseSeconds = pr.classBaseTime;
                return seconds > 0 && baseSeconds > 0 && seconds <= baseSeconds - 0.8;
            });
            if (hasExcellentTime) {
                // [減点方式] potential += 25;
                tags.push("⏱️ クラス基準タイム超えの高速時計実績");
            }
        }
        // タフ場実績の他場適性判定
        if (horse.pastRaces) {
            var hasToughGood = horse.pastRaces.slice(0, 5).some(function (pr) {
                var isToughVenue = /(中山|阪神|中京)/.test(pr.venue || '');
                return isToughVenue && pr.result <= 3;
            });
            var isEasyVenue = /(京都|新潟|小倉)/.test(race.venue || race.trackName || '');
            if (hasToughGood && isEasyVenue) {
                // [減点方式] potential += 15;
                tags.push("⛰️ 急坂・タフ場での好走実績（底力の裏付け）");
            }
        }
        // 直近人気トレンドからの過小評価スクリーニング
        if (horse.pastRaces && horse.pastRaces.length >= 3) {
            var avgPopularity = horse.pastRaces.slice(0, 3).reduce(function (sum, pr) { return sum + (pr.popularity || 5); }, 0) / 3.0;
            var lastFailed = horse.pastRaces[0].result >= 10;
            var isUnderValued = odds >= 8.0;
            if (avgPopularity <= 3.0 && lastFailed && isUnderValued) {
                // [減点方式] potential += 30;
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
        var prevRace_7 = horse.pastRaces && horse.pastRaces[0];
        if (prevRace_7) {
            var wasOuterRun = prevRace_7.cornerOuterCount >= 4;
            var didStumble = prevRace_7.isStumbled;
            var isUnderValuedNow = odds >= 10.0 || popularity >= 4;
            if ((wasOuterRun || didStumble) && isUnderValuedNow) {
                // [減点方式] potential += 35;
                tags.push("🚀 展開バイアス不利からの巻き返し(期待値特大の穴馬)");
            }
        }
        // 3. クラス基準タイム超え実績があるのに人気がない馬の評価引き上げ
        if (horse.pastRaces) {
            var hasExcellentTime = horse.pastRaces.slice(0, 3).some(function (pr) {
                if (!pr.time || !pr.classBaseTime)
                    return false;
                var parseTimeToSec = function (tStr) {
                    var clean = tStr.trim();
                    if (clean.includes(':')) {
                        var parts = clean.split(':');
                        return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
                    }
                    return parseFloat(clean) || 999;
                };
                var seconds = parseTimeToSec(pr.time);
                var baseSeconds = pr.classBaseTime;
                return seconds > 0 && baseSeconds > 0 && seconds <= baseSeconds - 0.8;
            });
            if (hasExcellentTime && (odds >= 10.0 || popularity >= 4)) {
                // [減点方式] potential += 30;
                tags.push("💎 持ち時計優秀の過小評価馬(期待値特大の穴馬)");
            }
        }
        // ---------------------------------------------------
        // ④ 【新要因1】勾配物理とラップ局所ロス（坂の慣性エネルギー）の判定
        // ---------------------------------------------------
        if (horse.pastRaces && horse.pastRaces.length > 0) {
            var hasHillClimber = horse.pastRaces.some(function (pr) {
                var isHillVenue = /(中山|阪神)/.test(pr.venue || '');
                if (!isHillVenue || pr.result > 3 || !pr.last3fTime)
                    return false;
                var last3f = parseFloat(pr.last3fTime);
                if (isNaN(last3f))
                    return false;
                if (pr.surface === '芝') {
                    return last3f <= 34.5;
                }
                else if (pr.surface === 'ダート') {
                    return last3f <= 37.0;
                }
                return false;
            });
            if (hasHillClimber) {
                // [減点方式] potential += 15;
                tags.push("⛰️ 勾配物理:急坂負荷クリアの坂適性裏付け");
            }
        }
        // ---------------------------------------------------
        // ⑤ 【新要因2】極限クッション値と芝の超高速化スケーリングバイアス
        // ---------------------------------------------------
        if (race.surface === '芝' && race.cushionValue !== undefined && horse.pastRaces) {
            if (race.cushionValue >= 9.5) {
                var hasFastCushion = horse.pastRaces.some(function (pr) {
                    return pr.surface === '芝' &&
                        pr.cushionValue !== undefined &&
                        pr.cushionValue >= 9.5 &&
                        pr.result <= 3 &&
                        pr.timeDiff !== undefined &&
                        pr.timeDiff <= 0.3;
                });
                if (hasFastCushion) {
                    // [減点方式] potential += 20;
                    tags.push("⚡ 超高速物理:極限クッション値スピード適合");
                }
            }
            else if (race.cushionValue <= 7.5) {
                var hasSoftCushion = horse.pastRaces.some(function (pr) {
                    return pr.surface === '芝' &&
                        pr.cushionValue !== undefined &&
                        pr.cushionValue <= 7.5 &&
                        pr.result <= 3 &&
                        pr.timeDiff !== undefined &&
                        pr.timeDiff <= 0.3;
                });
                if (hasSoftCushion) {
                    // [減点方式] potential += 20;
                    tags.push("⛰️ 重厚物理:低クッション値クッションタフネス適合");
                }
            }
        }
        // ---------------------------------------------------
        // ⑥ 【新要因3】走行軌跡（直線外回し距離ロス・進路カット）の定量的補正
        // ---------------------------------------------------
        if (horse.pastRaces && horse.pastRaces.length > 0) {
            // 進路カット救済
            var prevRace_8 = horse.pastRaces[0];
            if (prevRace_8.incidents && prevRace_8.result >= 5) {
                var hasPathBlock = /(直線進路なし|前が壁|追い出せず)/.test(prevRace_8.incidents);
                if (hasPathBlock) {
                    // [減点方式] potential += 25;
                    tags.push("⚠️ 不利度外視:前走直線進路カットによる不可抗力惨敗");
                }
            }
            // 外回し距離ロス補正
            var hasOuterLoss = horse.pastRaces.some(function (pr) {
                return pr.cornerOuterCount !== undefined &&
                    pr.cornerOuterCount >= 3 &&
                    pr.result >= 5 &&
                    pr.timeDiff !== undefined &&
                    pr.timeDiff <= 0.5;
            });
            if (hasOuterLoss) {
                // [減点方式] potential += 20;
                tags.push("📐 走行軌跡:過去走大外回し極大距離ロス補正");
            }
        }
        // ---------------------------------------------------
        // ⑦ 【新要因4】芝「仮柵ステージ（A〜Dコース）移動」に伴う馬場バイアス
        // ---------------------------------------------------
        if (race.surface === '芝' && race.temporaryFencePosition) {
            var fencePos = race.temporaryFencePosition.toUpperCase();
            if (/(B|C|D)/.test(fencePos)) {
                if (frame <= 3 && /(逃げ|先行|好位)/.test(hStyle || '')) {
                    // [減点方式] potential += 20;
                    tags.push("📐 仮柵幾何学:内移動グリーンベルト・イン突き適合");
                }
            }
            else if (fencePos === 'A') {
                if (frame >= 6 && /(差し|中団|後方|追込)/.test(hStyle || '')) {
                    // [減点方式] potential += 15;
                    tags.push("📐 仮柵幾何学:仮柵Aステージ荒れ内馬場回避エッジ");
                }
            }
        }
        // ---------------------------------------------------
        // ⑧ 【新要因5】時計の「馬場ゲタ」剥ぎ取り不全による過剰人気と期待値の歪み（オッズの闇）
        // ---------------------------------------------------
        if (horse.pastRaces && horse.pastRaces.length > 0) {
            var prevRace_9 = horse.pastRaces[0];
            if (prevRace_9.time && prevRace_9.classBaseTime !== undefined && prevRace_9.result === 1) {
                var prTimeSec = parseTimeToSeconds(prevRace_9.time);
                var prBaseSec = prevRace_9.classBaseTime;
                if (prTimeSec > 0 && prBaseSec > 0 && prTimeSec <= prBaseSec - 1.2) {
                    if (odds <= 2.0) {
                        potential -= 25;
                        tags.push("⚠️ 時計の罠:前走超高速馬場恩恵による過剰人気割引");
                    }
                    else if (odds >= 8.0) {
                        // [減点方式] potential += 30;
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
    var isNAR = /(大井|川崎|船橋|浦和|門別|盛岡|水沢|金沢|笠松|名古屋|園田|姫路|高知|佐賀|帯広)/.test(race.venue || race.trackName || race.raceName || '');
    if (isNAR) {
        tags.push("NAR特化OMEGAエンジン適用中");
        // ---------------------------------------------------
        // ① 【要素1】地方レース環境（Race）の新要因評価
        // ---------------------------------------------------
        // 輸送ストレス判定: 所属（belonging または stableLocation）と開催場（race.venue または trackName）が異なり（長距離遠征）、かつ今回馬体重が減少している（weightChange < 0）場合
        var horseBelonging_1 = horse.belonging || horse.stableLocation || '';
        var raceVenue = race.venue || race.trackName || '';
        if (horseBelonging_1 && raceVenue) {
            var cleanBelonging = horseBelonging_1.replace(/(競馬場|厩舎|所属)/g, '').trim();
            var cleanVenue = raceVenue.replace(/(競馬場|特別|重賞)/g, '').trim();
            if (cleanBelonging && cleanVenue && !cleanVenue.includes(cleanBelonging) && !cleanBelonging.includes(cleanVenue)) {
                if (weightChange < 0) {
                    potential -= 15;
                    tags.push("⚠️ 地方遠征輸送ストレス（馬体重減少リスク）");
                }
            }
        }
        // ナイター光・影精神ストレス判定: race.isNight または 発走時刻(startTime)が17時以降の際、出遅れ実績のある馬または3歳以下の若駒
        var isNightTime = race.isNight || (race.startTime && parseInt(race.startTime.split(':')[0], 10) >= 17);
        if (isNightTime) {
            var hasPastStumbled = horse.pastRaces && horse.pastRaces.some(function (pr) { return pr.isStumbled; });
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
            }
            else if (weight >= 500 && /(逃げ|先行|好位)/.test(horse.style || '')) {
                // [減点方式] potential += 15;
                tags.push("⚡ 夜間冷え込み砂緊縮：大型先行馬パワーアドバンテージ");
            }
        }
        // ---------------------------------------------------
        // ② 【要素2】馬個体（Horse）の新要因評価
        // ---------------------------------------------------
        // 南関ヒエラルキーと遠征アドバンテージ: 川崎・浦和開催において、大井・船橋所属の遠征馬は実力レベルの高さを評価
        if (/(川崎|浦和)/.test(raceVenue)) {
            if (/(大井|船橋)/.test(horseBelonging_1)) {
                // [減点方式] potential += 20;
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
            // [減点方式] potential += 25;
            tags.push("⚡ 砂理学:外枠大型馬の砂被り回避黄金エッジ");
        }
        // 小回り超スプリント幾何学ボトルネック: 距離が1000m未満（900mや800mなど）の超短距離戦において、内枠（1〜3枠）かつ逃げ・先行脚質は大幅加点。外枠（7枠以上）は減点。
        if (dist > 0 && dist < 1000) {
            if (frame <= 3 && /(逃げ|先行)/.test(horse.style || '')) {
                // [減点方式] potential += 35;
                tags.push("📐 スプリント幾何学:極小回り内枠逃げ先行アドバンテージ");
            }
            else if (frame >= 7) {
                potential -= 25;
                tags.push("⚠️ スプリント幾何学:極小回り外枠距離ロス壊滅");
            }
        }
        // 地方リーディング厩舎×勝負仕上げ
        var isLeadingTrainer = /(小久保|森下|藤田|荒山|打越|角田|川西|笹野|今津|内田|吉村|高木|新子|田中守|宮川)/.test(horse.trainer || '');
        if (isLeadingTrainer) {
            var rating = (_168 = horse.trainingRating) === null || _168 === void 0 ? void 0 : _168.toUpperCase();
            if (rating === 'S' || rating === 'A') {
                // [減点方式] potential += 25;
                tags.push("🔥 地方リーディング厩舎×勝負仕上げ（メイチ回収）");
            }
        }
        // ---------------------------------------------------
        // ③ 【要素3】過去走履歴（PastRace）の新要因評価
        // ---------------------------------------------------
        // 中央（JRA）移籍初戦の過剰人気割引: 中央転入初戦かつ単勝2.5倍以下の過剰人気馬
        var isJRATransferFirst = horse.transferFrom === 'JRA' || horse.isTransferFirstRace || false;
        if (isJRATransferFirst && odds <= 2.5) {
            potential -= 15;
            tags.push("⚠️ JRA移籍初戦の過剰人気割引（地方砂不確実性）");
        }
        // 中央移籍2戦目の期待値乖離（大化け穴馬）
        if (horse.pastRaces && horse.pastRaces.length >= 2) {
            var isSecondRaceAfterTransfer = !isJRATransferFirst && horse.pastRaces[0] && horse.pastRaces[0].result >= 6;
            var hasJRAHistory = horse.pastRaces.slice(1).some(function (pr) { return /(東京|中山|京都|阪神|中京|新潟|小倉|福島|函館|札幌)/.test(pr.venue || ''); });
            if (isSecondRaceAfterTransfer && hasJRAHistory && odds >= 6.0) {
                // [減点方式] potential += 30;
                tags.push("🌀 移籍2戦目:オッズ急落による大化け激走期待値");
            }
        }
        // ① 【新要因1】競走中の不利・事故（incidents）の度外視（ノーカウント）救済
        if (horse.pastRaces && horse.pastRaces[0]) {
            var prevRace_10 = horse.pastRaces[0];
            if (prevRace_10.incidents && /(前が壁|他馬の斜行|挟まれ|大きな不利|落鉄)/.test(prevRace_10.incidents) && prevRace_10.result >= 6) {
                // [減点方式] potential += 25;
                tags.push("⚠️ 不利度外視:前走致命的不利による不可抗力惨敗");
            }
        }
        // ② 【新要因2】道中の位置取り遷移（passingPositions）による脚質物理補正
        if (horse.pastRaces) {
            var hasRonsupamakuri = false;
            var hasPositionKeep = false;
            for (var _178 = 0, _179 = horse.pastRaces; _178 < _179.length; _178++) {
                var pr = _179[_178];
                if (pr.passingPositions) {
                    var parts = pr.passingPositions.split('-').map(function (x) { return parseInt(x, 10); }).filter(function (x) { return !isNaN(x); });
                    if (parts.length >= 2) {
                        var maxPos = Math.max.apply(Math, parts);
                        var finalPos = parts[parts.length - 1];
                        if (maxPos - finalPos >= 5 && pr.result <= 3) {
                            hasRonsupamakuri = true;
                        }
                        if (parts.every(function (x) { return x <= 4; }) && pr.result <= 3 && /(逃げ|先行|好位)/.test(horse.style || '')) {
                            hasPositionKeep = true;
                        }
                    }
                }
            }
            if (hasRonsupamakuri) {
                // [減点方式] potential += 20;
                tags.push("📐 位置取り遷移:ロンスパまくり加速エッジ");
            }
            if (hasPositionKeep) {
                // [減点方式] potential += 15;
                tags.push("📐 位置取り遷移:終始好位キープ自在性");
            }
        }
        // ③ 【新要因3】区間ラップタイム（halonPace）の構成バイアス適合
        if (horse.pastRaces) {
            var hasFastPaceTough = false;
            var hasSlowPaceSpeed = false;
            for (var _180 = 0, _181 = horse.pastRaces; _180 < _181.length; _180++) {
                var pr = _181[_180];
                if (pr.halonPace) {
                    var paceParts = pr.halonPace.split('-').map(parseFloat);
                    if (paceParts.length === 2 && !paceParts.some(isNaN)) {
                        var first3F = paceParts[0];
                        var last3F = paceParts[1];
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
                // [減点方式] potential += 20;
                tags.push("⏱️ ラップ物理:前傾ハイペースダートタフネス適合");
            }
            if (hasSlowPaceSpeed) {
                // [減点方式] potential += 15;
                tags.push("⏱️ ラップ物理:後傾スロー瞬発スピード適合");
            }
        }
        // ④ 【新要因4】対戦相手の「その後の勝ち上がり実績（動的対戦レベル）」評価
        if (horse.pastRaces && horse.pastRaces[0]) {
            var prevRace_11 = horse.pastRaces[0];
            if (prevRace_11.winnerName) {
                var winnerName_1 = prevRace_11.winnerName.trim();
                var prevRaceDate_1 = prevRace_11.date;
                var winnerData = masterData.horses[winnerName_1];
                if (!winnerData) {
                    winnerData = Object.values(masterData.horses).find(function (h) { return h.name === winnerName_1; });
                }
                if (winnerData && winnerData.results) {
                    var hasWonLater = winnerData.results.some(function (r) { return r.date > prevRaceDate_1 && r.rank === 1; });
                    if (hasWonLater) {
                        // [減点方式] potential += 25;
                        tags.push("👑 動的対戦レベル高:前走勝ち馬の次走勝ち上がり裏付け");
                    }
                }
            }
        }
        // ⑤ 【新要因5】着差（margin / timeDiff）と馬場状態・含水率の物理スケーリング
        if (horse.pastRaces) {
            var hasGoodFirmCloseResult = horse.pastRaces.some(function (pr) { return pr.condition === '良' && pr.timeDiff !== undefined && pr.timeDiff <= 0.3 && pr.result <= 3; });
            if (hasGoodFirmCloseResult) {
                // [減点方式] potential += 15;
                tags.push("⚖️ 砂理学:良馬場タフ戦僅差実績の真価");
            }
            var hasMuddyCloseResult = horse.pastRaces.some(function (pr) { return (pr.condition === '重' || pr.condition === '不良') && pr.timeDiff !== undefined && pr.timeDiff <= 0.6 && pr.result <= 3; });
            if (hasMuddyCloseResult) {
                // [減点方式] potential += 15;
                tags.push("⚖️ 砂理学:道悪高速追走耐久実績");
            }
        }
        // ⑥ 【新要因6】払戻金（refunds）傾向と高波乱トリガーによるオッズの「歪み」適合
        var isKochiFinal = /高知/.test(raceVenue) && (race.raceNumber === 12 || /ファイナル/.test(race.raceName || ''));
        var isOoiSpecial = /大井/.test(raceVenue) && /(重賞|特別)/.test(race.raceName || '');
        var isKawasakiSprint = /川崎/.test(raceVenue) && dist === 900;
        var isKasamatsuC = /笠松/.test(raceVenue) && /(C|ｃ)/.test(horse.raceClass || '');
        if ((isKochiFinal || isOoiSpecial || isKawasakiSprint || isKasamatsuC) && odds >= 8.0) {
            distortionBoost *= 1.25;
            // [減点方式] potential += 20;
            tags.push("🌀 期待値の闇:高波乱トリガーによるオッズ歪み適合");
        }
    }
    // ==========================================
    // ✅【完全減点方式】明示的ペナルティブロック（potential -= N;）
    // 不利条件が揃った場合に積極的に減点を行う
    // ==========================================
    // ─────────────────────────────────────────
    // 【A-1】全場共通：連続凡走ペナルティ
    // ─────────────────────────────────────────
    if (horse.pastRaces && horse.pastRaces.length >= 2) {
        var recentTwoRaces = horse.pastRaces.slice(0, 2);
        var bothBad = recentTwoRaces.every(function (pr) { return pr.result >= 8; });
        if (bothBad && popularity > 4) {
            potential -= 25;
            tags.push("❌ 連続凡走ペナルティ: 直近2走連続8着以下×上位人気外");
        }
    }
    // ─────────────────────────────────────────
    // 【A-2】全場共通：前走大敗×低人気 二重ペナルティ
    // ─────────────────────────────────────────
    if (prevRaceData && prevRaceData.result >= 10 && popularity >= 5) {
        potential -= 15;
        tags.push("❌ 前走10着以下×4番人気以下ペナルティ");
    }
    // ─────────────────────────────────────────
    // 【A-3】全場共通：調教評価 C 以下ペナルティ
    // ─────────────────────────────────────────
    if (horse.trainingRating) {
        var rating = horse.trainingRating.toUpperCase();
        if (rating === "C" || rating === "D" || rating === "E") {
            potential -= 20;
            tags.push("❌ 調教評価C以下ペナルティ(明らかな仕上がり不足)");
        }
    }
    // ─────────────────────────────────────────
    // 【A-4】全場共通：逃げ・先行馬 × 多頭数（16頭以上）ペナルティ
    // ─────────────────────────────────────────
    if ((horse.style === '逃げ') && headCount >= 16) {
        potential -= 20;
        tags.push("❌ 逃げ馬×多頭数ペナルティ: 16頭以上では包まれるリスク大");
    }
    // ─────────────────────────────────────────
    // 【A-5】全場共通：長距離 × 追込馬 × 距離延長ペナルティ
    // ─────────────────────────────────────────
    if (dist >= 2400 && horse.style === '追込' && prevRaceData && prevRaceData.distance < dist) {
        potential -= 20;
        tags.push("❌ 距離延長×追込馬×長距離ペナルティ(末脚届かないリスク)");
    }
    // ─────────────────────────────────────────
    // 【A-6】全場共通：連闘（5日以内出走）×重斤量ペナルティ
    // ─────────────────────────────────────────
    if (horse.isAfterRest === false && prevRaceData && kinryo >= 58) {
        // 前走日付が5日以内かを確認（prevRaceData.dateがある場合）
        if (prevRaceData.date) {
            var prevDate = new Date(prevRaceData.date);
            var raceDate = new Date(race.date || Date.now());
            var diffDays = (raceDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
            if (diffDays <= 7) {
                potential -= 25;
                tags.push("❌ 連闘×重斤量ペナルティ(短期ローテ×58kg以上の過負荷)");
            }
        }
    }
    // ─────────────────────────────────────────
    // 【B-1】東京専用ペナルティ
    // ─────────────────────────────────────────
    if (trackName && trackName.includes('東京')) {
        // 東京ダート1600m：差し・追込 × 内枠(1〜3枠) → 前の砂をかぶる
        if (race.surface === 'ダート' && dist === 1600 && frame <= 3 &&
            (horse.style === '差し' || horse.style === '追込')) {
            potential -= 25;
            tags.push("❌ 東京D1600ペナルティ: 内枠差し追込は砂かぶりで前半消耗大");
        }
        // 東京芝短距離：追込 × 外枠(7枠以上) → 捌けない
        if (race.surface === '芝' && dist <= 1400 && frame >= 7 && horse.style === '追込') {
            potential -= 20;
            tags.push("❌ 東京芝短距離ペナルティ: 外枠追込は直線が詰まりやすい");
        }
        // 東京芝中長距離：逃げ馬 × 多頭数 × 外枠 → ハナを切れないリスク
        if (race.surface === '芝' && dist >= 1800 && horse.style === '逃げ' && frame >= 7 && headCount >= 12) {
            potential -= 20;
            tags.push("❌ 東京芝ペナルティ: 多頭数外枠の逃げ馬(ハナ争い激化リスク)");
        }
    }
    // ─────────────────────────────────────────
    // 【B-2】中山専用ペナルティ
    // ─────────────────────────────────────────
    if (trackName && trackName.includes('中山')) {
        // 外枠(7枠以上) × 芝短距離・マイル → コーナーロスが大きい
        if (race.surface === '芝' && dist <= 1600 && frame >= 7) {
            potential -= 25;
            tags.push("❌ 中山芝ペナルティ: 外枠はスパイラルカーブで大きなロス");
        }
        // 差し・追込 × 芝2000m以下 → 直線310mでは届かない
        if (race.surface === '芝' && dist <= 2000 &&
            (horse.style === '差し' || horse.style === '追込') && frame >= 6) {
            potential -= 20;
            tags.push("❌ 中山芝外枠差しペナルティ: 短い直線×外枠差しは物理的に不利");
        }
    }
    // ─────────────────────────────────────────
    // 【B-3】函館・小倉・福島（小回りコース）専用ペナルティ
    // ─────────────────────────────────────────
    var isSmallCourse = trackName && ['函館', '小倉', '福島'].some(function (t) { return trackName.includes(t); });
    if (isSmallCourse) {
        // 差し × 外枠(6枠以上) × 小回りコース → 直線で詰まりやすい
        if (frame >= 6 && horse.style === '差し') {
            potential -= 20;
            tags.push("❌ 小回りコースペナルティ: 外枠差しは直線が短く届きにくい");
        }
        // 追込 × 脚質（函館・小倉・福島ではほぼ無効）→ さらに追加減点
        if (horse.style === '追込') {
            potential -= 25;
            tags.push("❌ 小回りコース追込ペナルティ: 直線が短すぎて物理的に届かない");
        }
    }
    // ─────────────────────────────────────────
    // 【B-4】新潟千直（芝1000m）専用ペナルティ
    // ─────────────────────────────────────────
    if (trackName && trackName.includes('新潟') && race.surface === '芝' && dist === 1000) {
        // 内枠(1〜2枠) → ラチ際が荒れやすく圧倒的不利
        if (frame <= 2) {
            potential -= 30;
            tags.push("❌ 新潟千直ペナルティ: 内枠は内ラチ沿いが荒れており致命的不利");
        }
        // 差し・追込 × 内〜中枠 → 直線一本勝負で砂かぶりリスク
        if ((horse.style === '差し' || horse.style === '追込') && frame <= 4) {
            potential -= 20;
            tags.push("❌ 新潟千直ペナルティ: 差し追込の内枠は前が壁になりやすい");
        }
    }
    // ─────────────────────────────────────────
    // 【B-5】阪神専用ペナルティ
    // ─────────────────────────────────────────
    if (trackName && trackName.includes('阪神')) {
        // 阪神芝中長距離(1600m〜2200m) × 外枠(6枠以上) × 差し・追込
        if (race.surface === '芝' && dist >= 1600 && dist <= 2200 &&
            frame >= 6 && (horse.style === '差し' || horse.style === '追込')) {
            potential -= 25;
            tags.push("❌ 阪神芝ペナルティ: 内回り専門コースで外枠差しは展開に左右されすぎる");
        }
        // 阪神ダート短距離(1400m以下) × 外枠(8枠) → 砂かぶりロス大
        if (race.surface === 'ダート' && dist <= 1400 && frame === 8) {
            potential -= 20;
            tags.push("❌ 阪神ダート短距離ペナルティ: 最外枠は序盤の砂かぶりが致命的");
        }
    }
    // ─────────────────────────────────────────
    // 【C-1】血統不適性ペナルティ
    // ─────────────────────────────────────────
    var penaltySireName = horse.sire || '';
    // 芝特化血統 × ダート重賞
    var isTurfOnlySire = ['ディープインパクト', 'ハーツクライ', 'コントレイル', 'エフフォーリア'].some(function (s) { return penaltySireName.includes(s); });
    var isDirtStakes = race.surface === 'ダート' && race.raceName && race.raceName.match(/G[1-3I-III]|重賞|特別ステークス/);
    if (isTurfOnlySire && isDirtStakes) {
        potential -= 20;
        tags.push("❌ 血統不適性ペナルティ: 芝特化血統×ダート重賞(適性外の勝負)");
    }
    // ダート特化血統 × 芝重賞
    var isDirtOnlySire = ['シニスターミニスター', 'ヘニーヒューズ', 'パイロ', 'ゴールドアリュール'].some(function (s) { return penaltySireName.includes(s); });
    var isTurfStakes = race.surface === '芝' && race.raceName && race.raceName.match(/G[1-3I-III]|重賞|特別ステークス/);
    if (isDirtOnlySire && isTurfStakes) {
        potential -= 20;
        tags.push("❌ 血統不適性ペナルティ: ダート特化血統×芝重賞(コース適性に疑問)");
    }
    // 洋芝不向き軽量スピード血統 × 函館・札幌の芝
    var isSpeedOnlySire = ['ロードカナロア', 'ダイワメジャー', 'キンシャサノキセキ', 'ミッキーアイル'].some(function (s) { return penaltySireName.includes(s); });
    var isYoshibaCourse = trackName && (trackName.includes('函館') || trackName.includes('札幌')) && race.surface === '芝';
    if (isSpeedOnlySire && isYoshibaCourse) {
        potential -= 20;
        tags.push("❌ 洋芝血統不適ペナルティ: スピード系血統は重い洋芝で能力を発揮しにくい");
    }
    // ─────────────────────────────────────────
    // 【D-1】ローテーション不利ペナルティ
    // ─────────────────────────────────────────
    // 長期休み明け × 非エリート騎手 × 重賞
    if (horse.isAfterRest && race.raceName && race.raceName.match(/G[1-3I-III]|重賞/)) {
        var isEliteJockeyRider = ELITE_JOCKEYS.some(function (ej) { return jockey.includes(ej); });
        if (!isEliteJockeyRider) {
            potential -= 20;
            tags.push("❌ 長期休み明け×非エリート騎手×重賞ペナルティ(仕上がり不安)");
        }
    }
    // ─────────────────────────────────────────
    // 【D-2】レース適性ミスマッチペナルティ
    // ─────────────────────────────────────────
    // 初ダート × ダート重賞（実績なし）
    if (race.surface === 'ダート' && horse.pastRaces && horse.pastRaces.length > 0) {
        var hasAllTurf = horse.pastRaces.every(function (pr) { return pr.surface === '芝'; });
        if (hasAllTurf && race.raceName && race.raceName.match(/G[1-3I-III]|重賞/)) {
            potential -= 25;
            tags.push("❌ 初ダート×ダート重賞ペナルティ: 実績ゼロの未知数すぎる条件");
        }
    }
    // ─────────────────────────────────────────
    // 【D-3】斤量急増ペナルティ（前走より3kg以上増）
    // ─────────────────────────────────────────
    if (prevRaceData && prevRaceData.jockeyWeight) {
        var prevKinryo = prevRaceData.jockeyWeight;
        var kinryoDiff = kinryo - prevKinryo;
        if (kinryoDiff >= 3) {
            potential -= 15;
            tags.push("\u274C \u65A4\u91CF\u6025\u5897\u30DA\u30CA\u30EB\u30C6\u30A3(\u30D1\u30D5\u30A9\u30FC\u30DE\u30F3\u30B9\u4F4E\u4E0B\u30EA\u30B9\u30AF)");
        }
    }
    // ==========================================
    // 【新設】プロ馬券師理論：危険な人気馬（減点方式チェックリスト）
    // ==========================================
    // 適用対象：1〜3番人気、またはオッズ10.0未満の上位人気馬
    if (popularity <= 3 || odds < 10.0) {
        var dangerScore = 0;
        var dangerReasons = [];
        // 【-5点】致命的な不安要素
        if (prevRaceData && prevRaceData.passingPositions && prevRaceData.passingPositions.startsWith('1-1') && prevRaceData.result <= 3) {
            dangerScore -= 5;
            dangerReasons.push('前走逃げ好走');
        }
        if (prevRaceData && horse.pastRaces) {
            var allPastTurf = horse.pastRaces.every(function (pr) { return pr.surface === '芝'; });
            var allPastDirt = horse.pastRaces.every(function (pr) { return pr.surface === 'ダート'; });
            if (race.surface === 'ダート' && allPastTurf && horse.pastRaces.length > 0) {
                dangerScore -= 5;
                dangerReasons.push('初ダート');
            }
            if (race.surface === '芝' && allPastDirt && horse.pastRaces.length > 0) {
                dangerScore -= 5;
                dangerReasons.push('初芝');
            }
        }
        if (prevRaceData && prevRaceData.distance && prevRaceData.distance < dist) {
            dangerScore -= 5;
            dangerReasons.push('距離延長');
        }
        if (race.surface === 'ダート' && prevRaceData && ((_169 = prevRaceData.raceName) === null || _169 === void 0 ? void 0 : _169.includes('牝')) && gender === '牝' && !((_170 = race.raceName) === null || _170 === void 0 ? void 0 : _170.includes('牝'))) {
            dangerScore -= 5;
            dangerReasons.push('牝馬限定ダート→牡馬混合');
        }
        // 【-4点】能力や再現性に疑いがある要素
        if (prevRaceData && prevRaceData.result === 1) {
            if (race.raceName && prevRaceData.raceName && !race.raceName.includes(prevRaceData.raceName.substring(0, 2))) {
                dangerScore -= 4;
                dangerReasons.push('昇級初戦の疑い');
            }
        }
        if (prevRaceData && (prevRaceData.condition === '重' || prevRaceData.condition === '不良') && prevRaceData.result <= 3 && condition === '良') {
            dangerScore -= 4;
            dangerReasons.push('前走道悪好走→今回良');
        }
        var majorTracks = ['東京', '中山', '京都', '阪神'];
        var isCurrentMajor = trackName && majorTracks.some(function (t) { return trackName.includes(t); });
        var isPrevLocal = prevRaceData && prevRaceData.trackName && !majorTracks.some(function (t) { return prevRaceData.trackName.includes(t); });
        if (isCurrentMajor && isPrevLocal) {
            dangerScore -= 4;
            dangerReasons.push('ローカル実績→中央主要場');
        }
        // 【-3点】明確な割り引き要素
        if (horse.isAfterRest) {
            dangerScore -= 3;
            dangerReasons.push('長期休養明け');
        }
        else if (prevRaceData && race.date && prevRaceData.date) {
            var pDate = new Date(prevRaceData.date);
            var rDate = new Date(race.date);
            if ((rDate.getTime() - pDate.getTime()) / (1000 * 3600 * 24) >= 180) {
                dangerScore -= 3;
                dangerReasons.push('半年以上休み明け');
            }
        }
        var prevFrameEquivalent = prevRaceData ? (prevRaceData.frame || (prevRaceData.horseNumber ? Math.ceil(prevRaceData.horseNumber / 2) : 4)) : 4;
        if (race.surface === '芝' && headCount >= 16 && frame >= 7 && prevRaceData && prevFrameEquivalent <= 3 && prevRaceData.result <= 3) {
            dangerScore -= 3;
            dangerReasons.push('芝の外枠替わり');
        }
        if (race.surface === 'ダート' && frame <= 3 && prevRaceData && prevFrameEquivalent >= 7 && prevRaceData.result <= 3) {
            dangerScore -= 3;
            dangerReasons.push('ダートの内枠替わり');
        }
        if (((_171 = race.raceName) === null || _171 === void 0 ? void 0 : _171.includes('ハンデ')) && kinryo >= 57) {
            dangerScore -= 3;
            dangerReasons.push('ハンデ重斤量');
        }
        // 【-2点】適性や状態の不安要素
        var steepTracks = ['中山', '阪神', '中京'];
        var isCurrentSteep = trackName && steepTracks.some(function (t) { return trackName.includes(t); });
        var isPrevSteep = prevRaceData && prevRaceData.trackName && steepTracks.some(function (t) { return prevRaceData.trackName.includes(t); });
        if (isCurrentSteep && !isPrevSteep && prevRaceData && prevRaceData.result <= 3) {
            dangerScore -= 2;
            dangerReasons.push('急坂実績不安');
        }
        if (weightChange >= 15 || weightChange <= -15) {
            dangerScore -= 2;
            dangerReasons.push("\u99AC\u4F53\u91CD\u5909\u8ABF(".concat(weightChange > 0 ? '+' : '').concat(weightChange, "kg)"));
        }
        // 【-1点】わずかな不安要素
        var leftTurnTracks_1 = ['東京', '中京', '新潟', '川崎', '船橋', '浦和', '盛岡'];
        var rightTurnTracks_1 = ['中山', '京都', '阪神', '小倉', '福島', '函館', '札幌', '大井', '門別', '水沢', '金沢', '笠松', '名古屋', '園田', '姫路', '高知', '佐賀'];
        var isCurrentLeft = trackName && leftTurnTracks_1.some(function (t) { return trackName.includes(t); });
        var isCurrentRight = trackName && rightTurnTracks_1.some(function (t) { return trackName.includes(t); });
        if ((isCurrentLeft || isCurrentRight) && horse.pastRaces && horse.pastRaces.length > 0) {
            var pastTurns = horse.pastRaces.map(function (pr) {
                if (!pr.trackName)
                    return 'unknown';
                if (leftTurnTracks_1.some(function (t) { return pr.trackName.includes(t); }))
                    return 'left';
                if (rightTurnTracks_1.some(function (t) { return pr.trackName.includes(t); }))
                    return 'right';
                return 'unknown';
            }).filter(function (t) { return t !== 'unknown'; });
            if (pastTurns.length > 0) {
                var leftCount = pastTurns.filter(function (t) { return t === 'left'; }).length;
                var rightCount = pastTurns.filter(function (t) { return t === 'right'; }).length;
                if (isCurrentLeft && leftCount === 0 && rightCount >= 2) {
                    dangerScore -= 1;
                    dangerReasons.push('左回り実績なし(初左回り・右回り特化)');
                }
                else if (isCurrentRight && rightCount === 0 && leftCount >= 2) {
                    dangerScore -= 1;
                    dangerReasons.push('右回り実績なし(初右回り・左回り特化)');
                }
            }
        }
        if (race.season === 'summer' && weight >= 500) {
            dangerScore -= 1;
            dangerReasons.push('夏場の大型馬');
        }
        if (race.season === 'winter' && gender === '牝' && weight <= 450 && weight > 0) {
            dangerScore -= 1;
            dangerReasons.push('冬場の小型牝馬');
        }
        // スコア反映（1点 = 30 Potential）
        if (dangerScore < 0) {
            var penalty = dangerScore * 30;
            potential += penalty;
            tags.push("\uD83D\uDEA8 \u5371\u967A\u306A\u4EBA\u6C17\u99AC: ".concat(dangerScore, "\u70B9 (").concat(dangerReasons.join(', '), ")"));
        }
    }
    // ==========================================
    // 【新設】プロ馬券師理論：美味しい穴馬（危険条件の逆転パターン）
    // ==========================================
    // 適用対象：4番人気以降、またはオッズ10.0以上の穴馬（前走6着以下の大敗馬）
    if ((popularity >= 4 || odds >= 10.0) && prevRaceData && prevRaceData.result >= 6) {
        var holeBonus = 0;
        var holeReasons = [];
        var prevFrameEquivalent = prevRaceData.frame || (prevRaceData.horseNumber ? Math.ceil(prevRaceData.horseNumber / 2) : 4);
        // 【逆転パターン①】ダートの砂被りストレス解放（前走内枠大敗 → 今回外枠）
        if (race.surface === 'ダート' && frame >= 6 && prevFrameEquivalent <= 3) {
            holeBonus += 40;
            holeReasons.push('ダート外枠替わり(砂被り解放)');
        }
        // 【逆転パターン②】牡馬混合戦からの解放（前走牡馬混合大敗 → 今回牝馬限定）
        if (gender === '牝' && ((_172 = race.raceName) === null || _172 === void 0 ? void 0 : _172.includes('牝')) && prevRaceData.raceName && !prevRaceData.raceName.includes('牝')) {
            holeBonus += 40;
            holeReasons.push('牝馬限定戦戻り(フィジカル差解放)');
        }
        // 【逆転パターン③】芝のコースロス解放（前走外枠大敗 → 今回内枠）
        if (race.surface === '芝' && frame <= 3 && prevFrameEquivalent >= 7) {
            holeBonus += 40;
            holeReasons.push('芝内枠替わり(コースロス解放)');
        }
        // 【逆転パターン④】馬場状態の好転（前走特殊馬場大敗 → 今回良馬場）
        if (condition === '良' && (prevRaceData.condition === '重' || prevRaceData.condition === '不良')) {
            holeBonus += 30;
            holeReasons.push('良馬場戻り(特殊馬場からの解放)');
        }
        // ==========================================
        // 【新設】プロ馬券師理論：5つの激走パターン（期待値の高い穴馬）
        // ==========================================
        // ①「初ブリンカー」着用の馬（データ上着用フラグがある場合を一変の可能性として評価）
        if (horse.useBlinkers) {
            holeBonus += 30;
            holeReasons.push('ブリンカー着用一変');
        }
        // ②「大幅な距離短縮」ローテの馬
        if (prevRaceData && prevRaceData.distance >= 1600 && race.distance <= 1400) {
            holeBonus += 50;
            holeReasons.push('大幅距離短縮ローテ');
        }
        // ③「得意コース」に戻ってきた馬
        if (horseMaster && prevRaceData) {
            var hasSuccessHere = horseMaster.results.some(function (r) { return r.venue === race.venue && r.rank <= 3; });
            if (hasSuccessHere && prevRaceData.venue !== race.venue && prevRaceData.result >= 6) {
                holeBonus += 40;
                holeReasons.push('得意コース戻り');
            }
        }
        // ④「季節適性」が合致する馬
        if (race.season === 'summer' && gender === '牝') {
            holeBonus += (weight && weight <= 450) ? 40 : 20;
            holeReasons.push(weight && weight <= 450 ? '夏特効:小型牝馬' : '夏特効:牝馬');
        }
        else if (race.season === 'winter' && gender === '牡') {
            holeBonus += 20;
            holeReasons.push('冬特効:牡馬');
        }
        // ⑤「初ダート」の条件クリア馬
        if (race.surface === 'ダート' && prevRaceData && prevRaceData.surface === '芝') {
            var dirtConditionsMet = 0;
            if (frame >= 6)
                dirtConditionsMet++; // 外枠
            if (weight && weight >= 460)
                dirtConditionsMet++; // 馬体重460kg以上
            if ((_173 = race.raceName) === null || _173 === void 0 ? void 0 : _173.includes('牝'))
                dirtConditionsMet++; // 牝馬限定戦
            var dirtSires_2 = ['シニスターミニスター', 'ヘニーヒューズ', 'ドレフォン', 'マインドユアビスケッツ', 'パイロ', 'キズナ', 'マクフィ', 'サウスヴィグラス', 'クロフネ', 'ゴールドアリュール', 'ホッコータルマエ'];
            if ((horseMaster === null || horseMaster === void 0 ? void 0 : horseMaster.sire) && dirtSires_2.some(function (s) { return horseMaster.sire.includes(s); })) {
                dirtConditionsMet++; // ダート適性種牡馬
            }
            if (dirtConditionsMet >= 3) {
                holeBonus += 50;
                holeReasons.push("\u521D\u30C0\u30FC\u30C8\u6FC0\u8D70\u6761\u4EF6\u30AF\u30EA\u30A2(".concat(dirtConditionsMet, "/4)"));
            }
        }
        // ボーナス反映
        if (holeBonus > 0) {
            potential += holeBonus;
            distortionBoost += (holeBonus / 50); // Darknessスコアも押し上げる (1.0 -> 1.8等)
            tags.push("\uD83D\uDC8E \u6FC0\u8D70\u30D5\u30E9\u30B0: ".concat(holeReasons.join(', ')));
            isTargetYatomi = true; // 強力な狙い目としてフラグを立てる
        }
    }
    // ==========================================
    // 【新設】プロ馬券師理論：阪神特化予想ロジック（堅実な本命選び）
    // ==========================================
    if (race.venue === '阪神') {
        var hanshinBonus = 0;
        var hanshinReasons = [];
        // ① 1〜3番人気の上位人気馬ボーナス（堅実さ評価）
        if (popularity >= 1 && popularity <= 3) {
            hanshinBonus += 15;
            hanshinReasons.push('上位人気堅実');
        }
        // ② 馬体重の変動が少ない馬（コンディション安定）
        if (horse.weightChange !== undefined && Math.abs(horse.weightChange) <= 4) {
            hanshinBonus += 10;
            hanshinReasons.push('馬体重安定(±4kg内)');
        }
        // ⑥ 馬格のある馬（460kg以上の中〜大型馬）
        if (weight && weight >= 460) {
            hanshinBonus += 15;
            hanshinReasons.push('馬格あり(460kg+)');
        }
        // ⑦ ブリンカー着用馬（阪神での激走特効）
        if (horse.useBlinkers) {
            hanshinBonus += 20;
            hanshinReasons.push('ブリンカー着用(阪神特効)');
            // 穴馬のブリンカーは強烈なフラグ
            if (popularity >= 4 || odds >= 10.0) {
                distortionBoost += 0.5; // Darknessを跳ね上げる
                isTargetYatomi = true;
            }
        }
        // ③ 外枠（6〜8枠）に入った馬（スムーズな競馬）
        if (frame >= 6) {
            hanshinBonus += 15;
            hanshinReasons.push('外枠有利(6〜8枠)');
        }
        // ④ 阪神特化：騎手ルール
        if (horse.jockey) {
            // ルール1: 軸最適（川田将雅、岩田望来）
            if (['川田将雅', '岩田望来'].some(function (j) { return horse.jockey.includes(j); })) {
                hanshinBonus += 20;
                reliability += 15;
                hanshinReasons.push("\u8EF8\u6700\u9069(".concat(horse.jockey, ")"));
            }
            // ルール2: 単勝特注（武豊、西村淳也）
            else if (['武豊', '西村淳也'].some(function (j) { return horse.jockey.includes(j); })) {
                hanshinBonus += 25;
                hanshinReasons.push("\u5358\u52DD\u671F\u5F85(".concat(horse.jockey, ")"));
            }
            // ルール3: 若手期待（高杉吏麒、田口貫太）
            else if (['高杉吏麒', '田口貫太'].some(function (j) { return horse.jockey.includes(j); })) {
                hanshinBonus += 15;
                distortionBoost += 0.3; // 穴やヒモとして高配当をもたらす
                hanshinReasons.push("\u82E5\u624B\u7279\u6CE8(".concat(horse.jockey, ")"));
            }
            // ルール4: 堅実評価（松山弘平、C.ルメール）
            else if (['松山弘平', 'ルメール'].some(function (j) { return horse.jockey.includes(j); })) {
                hanshinBonus += 15;
                reliability += 10;
                hanshinReasons.push("\u5805\u5B9F\u8A55\u4FA1(".concat(horse.jockey, ")"));
            }
        }
        // ⑤ 前走で好走している馬（5着以内）
        if (prevRaceData && prevRaceData.result <= 5) {
            hanshinBonus += 10;
            hanshinReasons.push('前走好走(掲示板)');
        }
        if (hanshinBonus > 0) {
            potential += hanshinBonus;
            tags.push("\uD83D\uDC05 \u962A\u795E\u7279\u52B9: ".concat(hanshinReasons.join(', ')));
            // 阪神でこのボーナスが多く入った人気馬は信頼度MAXとして扱う
            if (popularity <= 3 && hanshinBonus >= 35) {
                isTargetYatomi = true;
            }
        }
    }
    var darkness = (potential / 100) * Math.pow(odds, 1.1) * distortionBoost;
    return {
        horseId: horse.id, horseName: horse.name, horseNumber: horse.number,
        potential: Math.round(potential * 10) / 10,
        darkness: Math.round(darkness * 100) / 100,
        evIndex: potential,
        aptitudeTags: tags,
        tags: tags,
        targetTag: isTargetYatomi || undefined,
        rank: 0,
    };
}
// ==========================================
// ==========================================
// フォーメーション生成（プロ馬券師理論対応・5券種）
// ==========================================
function generateFormation(predictions, raceType, race) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
    if (raceType === void 0) { raceType = 'trifecta'; }
    var sorted = __spreadArray([], predictions, true).sort(function (a, b) { return b.potential - a.potential || b.darkness - a.darkness || a.horseNumber - b.horseNumber; });
    var horseNums = sorted.map(function (p) { return p.horseNumber; });
    var oddsMap = {};
    if (race && race.horses) {
        race.horses.forEach(function (h) { oddsMap[h.number] = h.odds || 10; });
    }
    else {
        sorted.forEach(function (p, i) {
            oddsMap[p.horseNumber] = i <= 1 ? 3 : i <= 3 ? 6 : i <= 5 ? 12 : 25;
        });
    }
    var horsesByOdds = ((race === null || race === void 0 ? void 0 : race.horses) || [])
        .map(function (h) { return ({ num: h.number, odds: h.odds || 100, horse: h }); })
        .sort(function (a, b) { return a.odds - b.odds; });
    var getPopRank = function (num) {
        if (horsesByOdds.length === 0) {
            return sorted.findIndex(function (p) { return p.horseNumber === num; }) + 1;
        }
        var idx = horsesByOdds.findIndex(function (h) { return h.num === num; });
        return idx === -1 ? 99 : idx + 1;
    };
    function calcSyntheticOdds(tix) {
        if (tix.length === 0)
            return 0;
        var sum = 0;
        for (var _i = 0, tix_1 = tix; _i < tix_1.length; _i++) {
            var ticket = tix_1[_i];
            var est = 1;
            for (var _a = 0, ticket_1 = ticket; _a < ticket_1.length; _a++) {
                var n = ticket_1[_a];
                est *= (oddsMap[n] || 10);
            }
            if (ticket.length === 3)
                est = est / 4;
            else if (ticket.length === 2)
                est = est / 2;
            sum += 1 / Math.max(est, 1.1);
        }
        return Math.round((1 / sum) * 10) / 10;
    }
    var axisNos = horseNums.slice(0, 3);
    var darkNos = horseNums.slice(3, 7);
    var col1 = __spreadArray([], axisNos, true);
    var col2 = __spreadArray([], axisNos, true);
    var col3 = undefined;
    var tickets = [];
    var strategy = '';
    var riskLevel = 'normal';
    var stakeGuide = '';
    var warningMessage = undefined;
    var limitPoints = 20;
    if (raceType === 'win') {
        var preferred = sorted.find(function (p) {
            var o = oddsMap[p.horseNumber] || 0;
            return o >= 4.0 && o <= 9.9;
        });
        var pick = preferred !== null && preferred !== void 0 ? preferred : sorted[0];
        col1 = [pick.horseNumber];
        col2 = undefined;
        col3 = undefined;
        tickets = [[pick.horseNumber]];
        limitPoints = 1;
        riskLevel = 'safe';
        strategy = '単勝は払い戻し率80%で最も資金効率が高い券種。1点集中で資金を最大化。単勝4〜9.9倍のゾーンが長期回収率の最良帯。過剰人気しにくい「前走4〜6着馬」が狙い目。';
        stakeGuide = '推奨購入額: 総資金の1〜3%\n（例: 資金10万円 → 1,000〜3,000円）';
        var winOdds = oddsMap[pick.horseNumber] || 0;
        if (winOdds > 0 && winOdds < 2.0) {
            warningMessage = '推奨馬のオッズが低すぎます。単勝4〜9.9倍の馬を狙ってください。';
            riskLevel = 'risk';
        }
        else if (winOdds > 15) {
            warningMessage = '高配当は魅力ですが的中率が低下します。慎重に検討してください。';
            riskLevel = 'risk';
        }
    }
    else if (raceType === 'wide') {
        var selectedPattern = 2;
        var wideTickets_1 = new Set();
        var wideStrategy = '';
        var wideStakeGuide = '推奨購入額: 1点あたり総資金の0.5〜1%\n（例: 資金10万円 → 500〜1,000円/点）\n\n【重要】ワイド購入時は必ず同じ買い目で「馬連」も少額併走し、ダブル的中を狙うこと。';
        var longShotTriggers = ((race === null || race === void 0 ? void 0 : race.horses) || []).filter(function (h) {
            var _a;
            var pop = getPopRank(h.number);
            if (pop < 10)
                return false;
            var isGelding = h.gender === 'セン';
            var isJockeyChange = h.prevJockey && h.jockey !== h.prevJockey;
            var useBlinkers = h.useBlinkers;
            var isTarget = (_a = predictions.find(function (p) { return p.horseNumber === h.number; })) === null || _a === void 0 ? void 0 : _a.targetTag;
            return isGelding || isJockeyChange || useBlinkers || isTarget;
        });
        var isHeavy = (race === null || race === void 0 ? void 0 : race.condition) === '重' || (race === null || race === void 0 ? void 0 : race.condition) === '不良';
        var firstPopHorse = horsesByOdds[0];
        var isFirstPopStrong = firstPopHorse && firstPopHorse.odds < 2.0;
        if (longShotTriggers.length > 0) {
            selectedPattern = 4;
            var triggerAxis_1 = longShotTriggers.map(function (h) {
                var p = predictions.find(function (pr) { return pr.horseNumber === h.number; });
                return { num: h.number, dark: p ? p.darkness : 0 };
            }).sort(function (a, b) { return b.dark - a.dark; })[0].num;
            var top3Pop = horsesByOdds.slice(0, 3).map(function (h) { return h.num; });
            col1 = [triggerAxis_1];
            col2 = top3Pop;
            limitPoints = 3;
            top3Pop.forEach(function (t) {
                if (triggerAxis_1 !== t)
                    wideTickets_1.add([triggerAxis_1, t].sort(function (x, y) { return x - y; }).join('-'));
            });
            wideStrategy = '【ワイド パターン④】大穴から上位人気への流し（秘密兵器）\n乗り替わりやブリンカーなど「一発で激走する条件」が揃った大穴から上位人気へ流す3点買い。高配当が狙える。';
        }
        else if (isHeavy) {
            var longShots = ((race === null || race === void 0 ? void 0 : race.horses) || []).filter(function (h) { return getPopRank(h.number) >= 5; });
            var frontRunners = longShots.filter(function (h) { return ['逃げ', '先行', '好位'].includes(h.style); });
            var closers = longShots.filter(function (h) { return ['差し', '中団', '後方', '追込', 'マクリ'].includes(h.style); });
            var getGroupPot = function (group) { return group.reduce(function (sum, h) {
                var p = predictions.find(function (pr) { return pr.horseNumber === h.number; });
                return sum + (p ? p.potential : 0);
            }, 0); };
            var targetGroup = getGroupPot(frontRunners) >= getGroupPot(closers) ? frontRunners : closers;
            var boxHorses = targetGroup.map(function (h) {
                var p = predictions.find(function (pr) { return pr.horseNumber === h.number; });
                return { num: h.number, pot: p ? p.potential : 0 };
            }).sort(function (a, b) { return b.pot - a.pot; }).slice(0, 4).map(function (x) { return x.num; });
            if (boxHorses.length >= 2) {
                selectedPattern = 3;
                col1 = boxHorses;
                col2 = undefined;
                limitPoints = 6;
                for (var i = 0; i < boxHorses.length; i++) {
                    for (var j = i + 1; j < boxHorses.length; j++) {
                        wideTickets_1.add([boxHorses[i], boxHorses[j]].sort(function (x, y) { return x - y; }).join('-'));
                    }
                }
                wideStrategy = '【ワイド パターン③】穴馬同士の4頭ボックス\n波乱が予想される重馬場。展開の助けが必要なため、同じ脚質（逃げ・先行、または差し・追込）の穴馬を組み合わせてボックスで購入。';
            }
        }
        if (selectedPattern === 2 && isFirstPopStrong && horsesByOdds.length >= 4) {
            var axisCandidates = [(_a = horsesByOdds[1]) === null || _a === void 0 ? void 0 : _a.num, (_b = horsesByOdds[2]) === null || _b === void 0 ? void 0 : _b.num].filter(Boolean);
            var partnerCandidates = [(_c = horsesByOdds[0]) === null || _c === void 0 ? void 0 : _c.num, (_d = horsesByOdds[1]) === null || _d === void 0 ? void 0 : _d.num, (_e = horsesByOdds[2]) === null || _e === void 0 ? void 0 : _e.num, (_f = horsesByOdds[3]) === null || _f === void 0 ? void 0 : _f.num].filter(Boolean);
            var bestCombo = null;
            var maxOdds = 0;
            for (var _i = 0, axisCandidates_1 = axisCandidates; _i < axisCandidates_1.length; _i++) {
                var a = axisCandidates_1[_i];
                for (var _r = 0, partnerCandidates_1 = partnerCandidates; _r < partnerCandidates_1.length; _r++) {
                    var p = partnerCandidates_1[_r];
                    if (a === p)
                        continue;
                    var estOdds = ((oddsMap[a] || 3) * (oddsMap[p] || 3)) / 2;
                    if (estOdds >= 5.0 && estOdds > maxOdds) {
                        maxOdds = estOdds;
                        bestCombo = [a, p];
                    }
                }
            }
            if (bestCombo) {
                selectedPattern = 1;
                col1 = [bestCombo[0]];
                col2 = [bestCombo[1]];
                limitPoints = 1;
                wideTickets_1.add(bestCombo.sort(function (x, y) { return x - y; }).join('-'));
                wideStrategy = '【ワイド パターン①】人気馬同士の1点勝負\n1番人気が圧倒的（1倍台）なレースで、あえて1番人気を外すか、オッズ5倍以上がつく人気馬同士の組み合わせを1点勝負。';
            }
        }
        if (selectedPattern === 2) {
            var axisNum_1 = ((_g = horsesByOdds[1]) === null || _g === void 0 ? void 0 : _g.num) || horseNums[0];
            var darkCandidates = ((race === null || race === void 0 ? void 0 : race.horses) || []).filter(function (h) {
                var pop = getPopRank(h.number);
                return pop >= 5 && pop <= 9;
            }).map(function (h) {
                var p = predictions.find(function (pr) { return pr.horseNumber === h.number; });
                return { num: h.number, dark: p ? p.darkness : 0 };
            }).sort(function (a, b) { return b.dark - a.dark; }).slice(0, 3).map(function (x) { return x.num; });
            var finalDark = darkCandidates.length > 0 ? darkCandidates : __spreadArray([], sorted, true).sort(function (a, b) { return b.darkness - a.darkness; }).filter(function (p) { return p.horseNumber !== axisNum_1; }).slice(0, 3).map(function (p) { return p.horseNumber; });
            col1 = [axisNum_1];
            col2 = finalDark;
            limitPoints = 3;
            finalDark.forEach(function (d) {
                if (axisNum_1 !== d)
                    wideTickets_1.add([axisNum_1, d].sort(function (x, y) { return x - y; }).join('-'));
            });
            wideStrategy = '【ワイド パターン②】人気馬から穴馬への流し\n信頼できる2番・3番人気を軸に、5番〜9番人気の穴馬2〜3頭へ流す。軸馬以外に気になる穴馬が複数いる場合に威力を発揮。';
        }
        tickets = Array.from(wideTickets_1).map(function (t) { return t.split('-').map(Number); }).slice(0, limitPoints);
        riskLevel = selectedPattern === 3 || selectedPattern === 4 ? 'normal' : 'safe';
        strategy = wideStrategy;
        stakeGuide = wideStakeGuide;
        if (tickets.length > limitPoints) {
            warningMessage = "\u30EF\u30A4\u30C9\u306F".concat(limitPoints, "\u70B9\u4EE5\u5185\u304C\u539F\u5247\u3002\u5E83\u3052\u3059\u304E\u308B\u3068\u8CB7\u3063\u305F\u6642\u70B9\u3067\u5916\u308C\u308B\u99AC\u5238\u304C\u5897\u3048\u307E\u3059\u3002");
            riskLevel = 'risk';
        }
    }
    else if (raceType === 'quinella') {
        var ax1_1 = horseNums[0];
        var darkByDark = __spreadArray([], sorted, true).sort(function (a, b) { return b.darkness - a.darkness; }).slice(0, 3).map(function (p) { return p.horseNumber; });
        var partners = __spreadArray([], new Set(__spreadArray([horseNums[1], horseNums[2], horseNums[3]], darkByDark, true)), true).filter(function (n) { return n !== undefined && n !== ax1_1; })
            .slice(0, 5);
        col1 = [ax1_1];
        col2 = partners;
        col3 = undefined;
        limitPoints = 5;
        var ticketSet = new Set();
        for (var _s = 0, partners_1 = partners; _s < partners_1.length; _s++) {
            var p = partners_1[_s];
            if (ax1_1 !== p)
                ticketSet.add([ax1_1, p].sort(function (x, y) { return x - y; }).join('-'));
        }
        var ax2 = horseNums[1];
        if (ax2 && sorted[1] && sorted[0] && sorted[1].potential >= sorted[0].potential * 0.8) {
            for (var _t = 0, partners_2 = partners; _t < partners_2.length; _t++) {
                var p = partners_2[_t];
                if (ax2 !== p)
                    ticketSet.add([ax2, p].sort(function (x, y) { return x - y; }).join('-'));
            }
        }
        tickets = Array.from(ticketSet).map(function (t) { return t.split('-').map(Number); }).slice(0, limitPoints);
        riskLevel = 'normal';
        strategy = '馬連は最大5点以内が鉄則。点数が増えると合成オッズが崩壊。単勝1倍台の圧倒的人気馬からの馬連は配当が低いため非推奨。予想の自信度に応じた資金配分を行う。';
        stakeGuide = '推奨購入額: 自信度高=200円/点、普通=100円/点\n購入前に「当たったら何円?」を必ず計算すること。';
        var top1Odds = oddsMap[ax1_1] || 10;
        if (top1Odds < 2.0) {
            warningMessage = '軸馬のオッズが低すぎます。馬連配当が低くなりすぎます。見(ケン)を検討してください。';
            riskLevel = 'risk';
        }
        else if (tickets.length > 5) {
            warningMessage = '馬連は5点以内が鉄則です。点数を絞ってください。';
            riskLevel = 'risk';
            tickets = tickets.slice(0, 5);
        }
    }
    else if (raceType === 'trifecta') {
        var popularHorses = horsesByOdds.slice(0, 4).map(function (h) {
            var p = predictions.find(function (pr) { return pr.horseNumber === h.num; });
            return { num: h.num, pot: p ? p.potential : 0, dark: p ? p.darkness : 0 };
        });
        var darkHorsesList = horsesByOdds.slice(4).map(function (h) {
            var p = predictions.find(function (pr) { return pr.horseNumber === h.num; });
            return { num: h.num, pot: p ? p.potential : 0, dark: p ? p.darkness : 0 };
        }).sort(function (a, b) { return b.dark - a.dark; });
        var sortedPops = __spreadArray([], popularHorses, true).sort(function (a, b) { return b.pot - a.pot; });
        var mainAxis_1 = ((_h = sortedPops[0]) === null || _h === void 0 ? void 0 : _h.num) || ((_j = popularHorses[0]) === null || _j === void 0 ? void 0 : _j.num) || horseNums[0];
        var subAxis = ((_k = sortedPops[1]) === null || _k === void 0 ? void 0 : _k.num) || ((_l = popularHorses[1]) === null || _l === void 0 ? void 0 : _l.num);
        var isSolidRace = sortedPops[0] && sortedPops[0].pot > 950 && (!darkHorsesList[0] || darkHorsesList[0].dark < 100) && !((race === null || race === void 0 ? void 0 : race.condition) === '重' || (race === null || race === void 0 ? void 0 : race.condition) === '不良');
        var selectedPattern = 1;
        if (((_m = sortedPops[0]) === null || _m === void 0 ? void 0 : _m.pot) > 900 && ((_o = sortedPops[1]) === null || _o === void 0 ? void 0 : _o.pot) > 900 && subAxis) {
            selectedPattern = 2;
        }
        else if (darkHorsesList.length >= 6 && ((_p = darkHorsesList[0]) === null || _p === void 0 ? void 0 : _p.dark) > 150 && ((_q = darkHorsesList[1]) === null || _q === void 0 ? void 0 : _q.dark) > 100) {
            selectedPattern = 3;
        }
        var ticketSet = new Set();
        if (selectedPattern === 2 && subAxis) {
            col1 = [mainAxis_1];
            col2 = [subAxis];
            col3 = darkHorsesList.slice(0, 8).map(function (h) { return h.num; });
            limitPoints = 8;
            for (var _u = 0, col3_1 = col3; _u < col3_1.length; _u++) {
                var c = col3_1[_u];
                if (c !== mainAxis_1 && c !== subAxis) {
                    ticketSet.add([mainAxis_1, subAxis, c].sort(function (x, y) { return x - y; }).join('-'));
                }
            }
            strategy = '【3連複 パターン②】確実な2頭から広く流す（8点）\n馬券内に確実に来そうな人気馬2頭を固定し、3着目に波乱が起きることを想定して穴馬へ手広く流す。';
        }
        else if (selectedPattern === 3 && darkHorsesList.length >= 6) {
            var row2Dark = darkHorsesList.slice(0, 3).map(function (h) { return h.num; });
            var row3Dark = darkHorsesList.slice(0, 6).map(function (h) { return h.num; });
            col1 = [mainAxis_1];
            col2 = row2Dark;
            col3 = row3Dark;
            limitPoints = 12;
            for (var _v = 0, col2_1 = col2; _v < col2_1.length; _v++) {
                var b = col2_1[_v];
                for (var _w = 0, col3_2 = col3; _w < col3_2.length; _w++) {
                    var c = col3_2[_w];
                    if (mainAxis_1 !== b && mainAxis_1 !== c && b !== c) {
                        ticketSet.add([mainAxis_1, b, c].sort(function (x, y) { return x - y; }).join('-'));
                    }
                }
            }
            strategy = '【3連複 パターン③】穴馬2頭の突っ込みを狙う（12点）\n人気馬1頭を軸に、馬券内に穴馬が2頭入る波乱決着のみを狙い撃ちする超高配当狙いのフォーメーション。';
        }
        else {
            var row2Pops = popularHorses.filter(function (h) { return h.num !== mainAxis_1; }).slice(0, 2).map(function (h) { return h.num; });
            var row3Dark = darkHorsesList.slice(0, 5).map(function (h) { return h.num; });
            col1 = [mainAxis_1];
            col2 = row2Pops;
            col3 = row3Dark;
            limitPoints = 10;
            for (var _x = 0, col2_2 = col2; _x < col2_2.length; _x++) {
                var b = col2_2[_x];
                for (var _y = 0, col3_3 = col3; _y < col3_3.length; _y++) {
                    var c = col3_3[_y];
                    if (mainAxis_1 !== b && mainAxis_1 !== c && b !== c) {
                        ticketSet.add([mainAxis_1, b, c].sort(function (x, y) { return x - y; }).join('-'));
                    }
                }
            }
            strategy = '【3連複 パターン①】王道のフォーメーション（10点）\n信頼できる人気馬で守りを固めつつ、相手に穴馬を絡めることで高配当を狙う、最も使いやすく安定感のある形。';
        }
        tickets = Array.from(ticketSet).map(function (t) { return t.split('-').map(Number); }).slice(0, limitPoints);
        riskLevel = 'normal';
        stakeGuide = '推奨購入額: 100円×点数\n（例: 10点 → 合計1,000円）\n※点数を増やすと合成オッズが崩壊し、トリガミの危険性が高まります。';
        if (isSolidRace) {
            warningMessage = '【警告】このレースは人気馬が強力で堅く決着する可能性が高いです。手広く買うとトリガミになります。「見（ケン）」または単勝・馬連への切り替えを強く推奨します。';
            riskLevel = 'risk';
        }
    }
    else if (raceType === 'trifecta_exact') {
        var popularHorsesExact = horsesByOdds.slice(0, 4).map(function (h) {
            var p = predictions.find(function (pr) { return pr.horseNumber === h.num; });
            return { num: h.num, pot: p ? p.potential : 0 };
        });
        var sortedPopsExact = __spreadArray([], popularHorsesExact, true).sort(function (a, b) { return b.pot - a.pot; });
        var darkHorsesListExact = horsesByOdds.slice(4).map(function (h) {
            var p = predictions.find(function (pr) { return pr.horseNumber === h.num; });
            return { num: h.num, dark: p ? p.darkness : 0 };
        }).sort(function (a, b) { return b.dark - a.dark; });
        var horseA = sortedPopsExact[0];
        var horseB = sortedPopsExact[1];
        var horseC = darkHorsesListExact[0];
        var horseD = darkHorsesListExact[1];
        limitPoints = 4;
        if (horseA && horseB && horseC && horseD) {
            col1 = [horseA.num];
            col2 = [horseB.num, horseC.num, horseD.num];
            col3 = [horseB.num, horseC.num, horseD.num];
            tickets.push([horseA.num, horseB.num, horseC.num]);
            tickets.push([horseA.num, horseC.num, horseB.num]);
            tickets.push([horseA.num, horseB.num, horseD.num]);
            tickets.push([horseA.num, horseD.num, horseB.num]);
        }
        else {
            // Fallback
            col1 = [];
            col2 = [];
            col3 = [];
        }
        riskLevel = 'normal';
        strategy = '【3連単】予想を整理するための設計図（4点）\n着順イメージが明確に固まった時のみ買うボーナス馬券。1着は確実なA(1番手)固定、2/3着に手堅いB(2番手)を固定し、残り1枠に荒れるC/D(穴馬)の突っ込みを狙う。';
        stakeGuide = '推奨購入額: 100〜500円/点\n資金効率が悪いため、メインの勝負はワイドや馬連で行い、3連単はボーナス感覚で差し込むのが鉄則。';
        if (!horseA || horseA.pot < 900) {
            warningMessage = '【警告】絶対的な1着候補（Aの馬）が不在のため、着順イメージが固まりません。3連単の多点買いは避け、「見（ケン）」または馬連・ワイドでの勝負を強く推奨します。';
            riskLevel = 'risk';
        }
    }
    var syntheticOdds = calcSyntheticOdds(tickets);
    if (syntheticOdds > 0 && syntheticOdds < 13.0 && !warningMessage) {
        warningMessage = "\u5408\u6210\u30AA\u30C3\u30BA".concat(syntheticOdds, "\u500D\u306F\u63A8\u5968\u57FA\u6E96\uFF0813.0\u500D\uFF09\u3092\u4E0B\u56DE\u3063\u3066\u3044\u307E\u3059\u3002\u300C\u898B\uFF08\u30B1\u30F3\uFF09\u300D\u3092\u63A8\u5968\u3057\u307E\u3059\u3002");
        if (riskLevel !== 'risk')
            riskLevel = 'risk';
    }
    return {
        type: raceType,
        col1: col1,
        col2: col2 && col2.length > 0 ? col2 : undefined,
        col3: col3,
        tickets: tickets,
        totalPoints: tickets.length,
        axisHorses: axisNos,
        darkHorses: darkNos,
        syntheticOdds: syntheticOdds,
        strategy: strategy,
        riskLevel: riskLevel,
        stakeGuide: stakeGuide,
        warningMessage: warningMessage,
        limitPoints: limitPoints,
    };
}
function generateWin5Picks(races, allPredictions) {
    return races.map(function (race) { return ({ raceId: race.id, picks: (allPredictions[race.id] || []).sort(function (a, b) { return b.evIndex - a.evIndex; }).slice(0, 3).map(function (p) { return p.horseNumber; }) }); });
}
function generateLearningPatch(race, predictions, actualResult, existingPatches) {
    var adjustments = [];
    var learningTargetName = "";
    // 1〜3着馬をすべてチェックし、AIが低く評価していた馬から複合的に学習する
    var top3Results = actualResult.filter(function (r) { return r.rank <= 3; });
    var _loop_1 = function (result) {
        var horse = race.horses.find(function (h) { return h.number === result.horseNumber; });
        if (!horse)
            return "continue";
        var aiRank = predictions.findIndex(function (p) { return p.horseNumber === result.horseNumber; }) + 1;
        // AIが軽視していた（4位以下）のに好走した場合、その馬から反省点を見つける
        if (aiRank > 3) {
            if (!learningTargetName)
                learningTargetName = horse.name;
            // 馬体重バイアス
            if (horse.weight >= 480)
                adjustments.push({ field: 'weight', operator: '>=', value: 480, scoreAdjust: 10 });
            else if (horse.weight <= 440)
                adjustments.push({ field: 'weight', operator: '<=', value: 440, scoreAdjust: 10 });
            // 馬体重増減バイアス
            if (horse.weightChange >= 10)
                adjustments.push({ field: 'weightChange', operator: '>=', value: 10, scoreAdjust: 15 });
            else if (horse.weightChange <= -10)
                adjustments.push({ field: 'weightChange', operator: '<=', value: -10, scoreAdjust: 10 });
            // 枠順バイアス
            if (horse.frame <= 2)
                adjustments.push({ field: 'frame', operator: '<=', value: 2, scoreAdjust: 15 });
            else if (horse.frame >= 7)
                adjustments.push({ field: 'frame', operator: '>=', value: 7, scoreAdjust: 15 });
            // 年齢バイアス（ベテラン・若駒激走）
            if (horse.age >= 8)
                adjustments.push({ field: 'age', operator: '>=', value: 8, scoreAdjust: 20 });
            else if (horse.age === 3)
                adjustments.push({ field: 'age', operator: '==', value: 3, scoreAdjust: 15 });
            // 騎手・血統バイアス
            if (horse.jockey)
                adjustments.push({ field: 'jockey', operator: 'includes', value: horse.jockey.replace(/[☆△▲◇]/g, ''), scoreAdjust: 15 });
            if (horse.sire)
                adjustments.push({ field: 'sire', operator: 'includes', value: horse.sire, scoreAdjust: 15 });
        }
    };
    for (var _i = 0, top3Results_1 = top3Results; _i < top3Results_1.length; _i++) {
        var result = top3Results_1[_i];
        _loop_1(result);
    }
    // 重複ルールの排除
    var uniqueAdjustments = adjustments.filter(function (adj, index, self) {
        return index === self.findIndex(function (t) { return t.field === adj.field && t.value === adj.value; });
    });
    if (uniqueAdjustments.length === 0)
        return null;
    return {
        id: "patch_".concat(Date.now()),
        version: "v".concat(existingPatches.length + 1, ".1"),
        date: new Date().toISOString(),
        description: "".concat(race.venue, " - \u597D\u8D70\u99AC(").concat(learningTargetName, "\u7B49)\u306E\u7279\u6027\u5B66\u7FD2"),
        track: race.trackName,
        condition: race.condition,
        adjustments: uniqueAdjustments,
        active: true
    };
}
function combinations(arr, size) {
    if (size === 0)
        return [[]];
    if (arr.length < size)
        return [];
    var first = arr[0], rest = arr.slice(1);
    return __spreadArray(__spreadArray([], combinations(rest, size - 1).map(function (combo) { return __spreadArray([first], combo, true); }), true), combinations(rest, size), true);
}
function sortPredictions(predictions) {
    return __spreadArray([], predictions, true).sort(function (a, b) { return b.potential - a.potential || b.darkness - a.darkness || a.horseNumber - b.horseNumber; }).map(function (p, i) { return (__assign(__assign({}, p), { rank: i + 1 })); });
}
// AIを利用した非同期ラーニングパッチ生成
function generateAILearningPatch(race, predictions, actualResult) {
    return __awaiter(this, void 0, void 0, function () {
        var topPrediction_1, actualRank, horse, isInner, isHeavy, isOvervalued, reason, rule, res, _a, _b, _c, patch, err_1;
        var _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    // 【新設】ルールベースのローカル学習パッチ生成（APIキー不要のフォールバック）
                    if (predictions.length > 0 && actualResult.length > 0) {
                        topPrediction_1 = predictions[0];
                        actualRank = ((_d = actualResult.find(function (r) { return r.horseNumber === topPrediction_1.horseNumber; })) === null || _d === void 0 ? void 0 : _d.rank) || 99;
                        // もし本命馬が6着以下に大敗した場合、弱点を学習
                        if (actualRank >= 6) {
                            horse = race.horses.find(function (h) { return h.number === topPrediction_1.horseNumber; });
                            if (horse) {
                                isInner = horse.frame <= 3;
                                isHeavy = race.condition === '重' || race.condition === '不良';
                                isOvervalued = horse.popularity === 1 && (horse.odds || 0) <= 2.5;
                                reason = "";
                                rule = "";
                                if (isInner && isHeavy) {
                                    reason = "本命馬が重馬場の内枠で大敗しました。内を嫌うトラックバイアスを見落とした可能性があります。";
                                    rule = "\u7AF6\u99AC\u5834: ".concat(race.trackName, ", \u99AC\u5834: ").concat(race.condition, ", \u67A0: ").concat(horse.frame, "\u67A0 -> \u8A55\u4FA1\u3092\u5927\u304D\u304F\u4E0B\u3052\u308B\uFF08\u30DE\u30A4\u30CA\u30B930\u70B9\uFF09");
                                }
                                else if (isOvervalued && horse.weight > 0 && (horse.jockeyWeight || 55) / horse.weight * 100 >= 12.0) {
                                    reason = "過剰人気の小柄馬が斤量負けしました。斤量体重比のペナルティを強化する必要があります。";
                                    rule = "過剰人気（オッズ2.5倍以下）かつ斤量体重比12%以上の場合は絶対評価を下げる";
                                }
                                else {
                                    reason = "\u672C\u547D\u99AC\uFF08".concat(horse.name, "\uFF09\u304C").concat(actualRank, "\u7740\u306B\u5927\u6557\u3002\u5C55\u958B\u3084\u672A\u77E5\u306E\u30D0\u30A4\u30A2\u30B9\u306B\u3088\u308B\u6557\u56E0\u5206\u6790\u304C\u5FC5\u8981\u3067\u3059\u3002");
                                    rule = "\u8840\u7D71: ".concat(((_e = horse.bloodline) === null || _e === void 0 ? void 0 : _e.split('/')[0]) || '不明', " \u306E ").concat(race.trackName, " ").concat(race.distance, "m \u9069\u6027\u3092\u518D\u8A55\u4FA1\u3059\u308B");
                                }
                                return [2 /*return*/, {
                                        id: "patch_local_".concat(Date.now()),
                                        version: '1.0 (Local)',
                                        date: new Date().toISOString(),
                                        description: "[".concat(race.trackName, " ").concat(race.distance, "m] ").concat(reason, " (\u88DC\u6B63: ").concat(rule, ")"),
                                        track: race.trackName,
                                        condition: race.condition,
                                        adjustments: [], // ローカルフォールバックはテキスト分析のみとする
                                        active: true
                                    }];
                            }
                        }
                    }
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, fetch('/api/learning-patch', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ race: race, predictions: predictions, actualResult: actualResult }),
                        })];
                case 2:
                    res = _f.sent();
                    if (!!res.ok) return [3 /*break*/, 4];
                    _b = (_a = console).warn;
                    _c = ["AI Learning failed:"];
                    return [4 /*yield*/, res.text()];
                case 3:
                    _b.apply(_a, _c.concat([_f.sent()]));
                    return [2 /*return*/, null];
                case 4: return [4 /*yield*/, res.json()];
                case 5:
                    patch = _f.sent();
                    return [2 /*return*/, patch];
                case 6:
                    err_1 = _f.sent();
                    console.error("AI Learning exception:", err_1);
                    return [2 /*return*/, null];
                case 7: return [2 /*return*/];
            }
        });
    });
}
