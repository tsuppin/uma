import { parseJRAText } from "../app/lib/parser";
import { calculateTsuchiyaScore } from "../app/lib/engine";
import { Horse, Race, LearningPatch, MasterData } from "../app/types";

// ==========================================
// 5大ファクター検証用のテストデータ
// ==========================================

const jraTextSample = `
3回京都6日 11R
芝1600m
稍重 Cコース
クッション値：7.5
含水率：14.0%

枠 1
1
サトノフェンサー
サトノレーシング
ノーザンファーム
中内田充正（栗東）
父：ディープインパクト
母：サトノアマゾネス
(母の父：Bering)
1.8
1番人気
518kg
(+2)
牡3/鹿毛
57.0kg
ルメール

坂路 良 51.5-11.7
【S】

2026年5月10日 京都
都大路ステークス
1勝クラス
1着 12頭 3番
1番人気
ルメール 57.0kg
芝1600
1:33.5
良
480kg
1-1
3F 33.8
サトノフェンサー(0.0)

枠 2
2
エターナルホープ
サクラコマース
社台ファーム
矢作芳人（栗東）
父：キズナ
母：サクラプレジデント
(母の父：プレジデント)
12.5
5番人気
504kg
(-12)
牡3/黒鹿毛
57.0kg
川田将雅

南W 良 63.2-50.0-35.1-11.0
【A】

2026年5月10日 京都
都大路ステークス
1勝クラス
3着 12頭 6番
5番人気
戸崎圭太 57.0kg
芝1600
1:33.8
良
504kg
12-12
3F 33.5
出遅れ
サトノフェンサー(0.3)

枠 3
3
ピョイットハレルヤ
ハレルヤクラブ
ヤナガワ牧場
友道康夫（栗東）
父：ロードカナロア
母：ピョイット
(母の父：キングカメハメハ)
35.4
8番人気
458kg
(+2)
牝3/栗毛
55.0kg
戸崎圭太

坂路 良 54.1-12.2
【B】

2026年5月10日 京都
都大路ステークス
1勝クラス
5着 12頭 8番
8番人気
ルメール 57.0kg
芝1600
1:33.7
良
458kg
3-3-4
3F 34.3
ペース:33.5-35.0
4角4頭外
サトノフェンサー(0.2)

枠 4
4
スナガワリボーイ
ダートクラブ
グランド牧場
国枝栄（美東）
父：ヘニーヒューズ
母：スナガワ
(母の父：サンデーサイレンス)
50.2
10番人気
490kg
(0)
牡3/鹿毛
57.0kg
横山武史

南W 良 67.2-12.0
【B】

2026年5月10日 東京
3歳未勝利
未勝利
4着 16頭 12番
3番人気
横山武史 57.0kg
芝1400
1:21.8
良
490kg
5-5
3F 34.5
サトノフェンサー(0.5)
`;

console.log("=== JRAテキスト解析テスト開始 ===");
const parsedRace = parseJRAText(jraTextSample);
console.log(`解析された競馬場: ${parsedRace.venue}`);
console.log(`解析されたレース番号: ${parsedRace.raceNumber}`);
console.log(`解析された仮柵位置: ${parsedRace.temporaryFencePosition}`);
console.log(`解析されたクッション値: ${parsedRace.cushionValue}`);
console.log(`解析された含水率: ${parsedRace.moistureContent}`);
console.log(`解析された馬の頭数: ${parsedRace.horses.length}`);

// レース情報を組み立てる (今回はダート替わりの検証を含めるため、全体の馬場をダートに変更して馬4の砂替わりを別途チェックします)
console.log("\n=== 予測エンジン（スコアリング）テスト開始 ===");

const createRaceInfo = (surface: '芝' | 'ダート'): Race => ({
  id: "test-race-id",
  date: "2026-05-20",
  venue: parsedRace.venue || "京都",
  raceNumber: parsedRace.raceNumber || 11,
  raceName: parsedRace.raceName || "都大路ステークス",
  distance: parsedRace.distance || 1600,
  surface: surface,
  condition: parsedRace.condition || "稍重",
  headCount: parsedRace.horses.length,
  trackName: parsedRace.venue as any || "京都",
  temporaryFencePosition: parsedRace.temporaryFencePosition,
  cushionValue: parsedRace.cushionValue,
  moistureContent: parsedRace.moistureContent,
  horses: parsedRace.horses as Horse[]
});

const learningPatches: LearningPatch[] = [];
const masterData: MasterData = {
  horses: {},
  jockeys: {}
};

parsedRace.horses.forEach(horse => {
  console.log(`\n--------------------------------------------`);
  console.log(`馬名: ${horse.name}`);
  console.log(`調教タイム: ${horse.trainingTime}`);
  console.log(`調教師: ${horse.trainer}`);
  console.log(`枠番: ${horse.frame}`);
  console.log(`前走のペース: ${horse.pastRaces[0]?.halonPace}`);
  console.log(`前走の出遅れ: ${horse.pastRaces[0]?.isStumbled}`);
  console.log(`前走の外回し頭数: ${horse.pastRaces[0]?.cornerOuterCount}`);

  // スナガワリボーイは「初ダート」を検証するため、ダートレースとしてスコアリング
  const isDirtRace = horse.name === "スナガワリボーイ";
  const race = createRaceInfo(isDirtRace ? "ダート" : "芝");

  const prediction = calculateTsuchiyaScore(horse, race, learningPatches, masterData);
  console.log(`ポテンシャルスコア: ${prediction.potential}`);
  console.log(`付与された適性タグ (aptitudeTags):`);
  prediction.aptitudeTags?.forEach(tag => console.log(`  - ${tag}`));
});

console.log("\n=== 東京競馬場 的中精度極限先鋭化テスト開始 ===");

const tokyoRaceInfo: Race = {
  id: "tokyo-test-race",
  date: "2026-05-20",
  venue: "東京",
  raceNumber: 11,
  raceName: "安田記念",
  distance: 1600,
  surface: "芝",
  condition: "良",
  headCount: 2,
  trackName: "東京",
  horses: []
};

// 馬1: トウキョウゲキソウ（前走高速芝激走からの短間隔ローテ＆今回1番人気）
const horseGekiso: Horse = {
  id: "gekiso",
  number: 1,
  frame: 1,
  name: "トウキョウゲキソウ",
  age: 4,
  gender: "牡",
  weight: 480,
  weightChange: 0,
  jockey: "ルメール",
  jockeyWeight: 57,
  trainer: "手塚貴久",
  owner: "社台レース",
  sire: "ハーツクライ",
  dam: "ハーツアマゾネス",
  bms: "Bering",
  bloodline: "サンデーサイレンス系",
  style: "差し",
  odds: 1.8,
  popularity: 1, // 1番人気
  pastRaces: [
    {
      date: "2026-04-25", // 今回2026-05-20まで25日（中4週内）
      venue: "東京",
      raceName: "マイラーズC",
      raceClass: "G2",
      distance: 1600,
      surface: "芝",
      condition: "良",
      result: 2, // 2着好走
      time: "1:31.2", // 91.2秒（1600m限界タイム91.8秒以下）
      corner4Position: 5,
      cornerOuterCount: 2,
      weight: 480,
      jockey: "ルメール",
      odds: 2.3,
      prize: 2000
    }
  ]
};

// 馬2: トウキョウサカノボル（急坂実績＆調教加速ラップによるだんだら坂適性）
const horseSakanoboru: Horse = {
  id: "sakanoboru",
  number: 2,
  frame: 2,
  name: "トウキョウサカノボル",
  age: 4,
  gender: "牡",
  weight: 500,
  weightChange: 2,
  jockey: "戸崎圭太",
  jockeyWeight: 57,
  trainer: "国枝栄",
  owner: "サンデーレーシング",
  sire: "ドゥラメンテ",
  dam: "ドゥラアマゾネス",
  bms: "Bering",
  bloodline: "キングカメハメハ系",
  style: "先行",
  odds: 5.6,
  popularity: 3,
  trainingTime: "南W 良 64.5-50.2-36.1-11.2", // 加速ラップ
  pastRaces: [
    {
      date: "2026-03-20",
      venue: "中山", // 急坂実績
      raceName: "スプリングS",
      raceClass: "G2",
      distance: 1800,
      surface: "芝",
      condition: "良",
      result: 1, // 3着以内好走
      time: "1:48.2",
      corner4Position: 3,
      cornerOuterCount: 1,
      weight: 498,
      jockey: "戸崎圭太",
      odds: 3.5,
      prize: 4000
    }
  ]
};

const tokyoTestHorses = [horseGekiso, horseSakanoboru];
tokyoTestHorses.forEach(horse => {
  console.log(`\n--------------------------------------------`);
  console.log(`馬名: ${horse.name}`);
  console.log(`前走走破タイム: ${horse.pastRaces[0]?.time} (日付: ${horse.pastRaces[0]?.date})`);
  console.log(`調教タイム: ${horse.trainingTime}`);
  const prediction = calculateTsuchiyaScore(horse, tokyoRaceInfo, [], { horses: {}, jockeys: {} });
  console.log(`ポテンシャルスコア: ${prediction.potential}`);
  console.log(`付与された適性タグ (aptitudeTags):`);
  prediction.aptitudeTags?.forEach(tag => console.log(`  - ${tag}`));
});

console.log("\n=== 京都競馬場 的中精度極限先鋭化テスト開始 ===");

// 1. レースデータ
const kyotoInnerTurfRace: Race = {
  id: "kyoto-test-inner-turf",
  date: "2026-05-20",
  venue: "京都",
  raceNumber: 10,
  raceName: "山科ステークス",
  distance: 1400, // 内回り
  surface: "芝",
  condition: "良",
  headCount: 16,
  trackName: "京都",
  horses: []
};

const kyotoG2Race: Race = {
  id: "kyoto-test-g2",
  date: "2026-05-20",
  venue: "京都",
  raceNumber: 11,
  raceName: "京都新聞杯(G2)",
  distance: 2200,
  surface: "芝",
  condition: "良",
  headCount: 12,
  trackName: "京都",
  horses: []
};

const kyotoDirtRace: Race = {
  id: "kyoto-test-dirt",
  date: "2026-05-20",
  venue: "京都",
  raceNumber: 9,
  raceName: "端午ステークス",
  distance: 1800,
  surface: "ダート",
  condition: "良",
  headCount: 15,
  trackName: "京都",
  horses: []
};

const kyotoHandicapRace: Race = {
  id: "kyoto-test-handicap",
  date: "2026-05-20",
  venue: "京都",
  raceNumber: 11,
  raceName: "万葉ステークス(ハンデ)",
  distance: 2400,
  surface: "芝",
  condition: "良",
  headCount: 14,
  trackName: "京都",
  horses: []
};

// 2. 馬データ
// ① 淀の坂越え (芝内回り、馬体絞り-4kg以上、内枠1〜4枠)
const horseSaka: Horse = {
  id: "kyoto-saka",
  number: 1,
  frame: 2,
  name: "ヨドノサカゴエ",
  age: 4,
  gender: "牡",
  weight: 460,
  weightChange: -6, // 馬体絞り
  jockey: "坂井瑠星",
  jockeyWeight: 57,
  sire: "ハーツクライ",
  bloodline: "サンデーサイレンス系",
  style: "先行",
  odds: 4.5,
  popularity: 2,
  pastRaces: []
};

// ② 岩田康イン突き (特別・重賞、岩田康、内枠1〜4枠)
const horseIwata: Horse = {
  id: "kyoto-iwata",
  number: 2,
  frame: 3,
  name: "イワタインツキ",
  age: 5,
  gender: "牡",
  weight: 490,
  weightChange: 0,
  jockey: "岩田康誠",
  jockeyWeight: 57,
  sire: "キングカメハメハ",
  bloodline: "キングマンボ系",
  style: "差し",
  odds: 12.0,
  popularity: 6,
  pastRaces: []
};

// ③ 川田2200m (川田、芝2200m、逃げ/先行/好位/差し)
const horseKawada: Horse = {
  id: "kyoto-kawada",
  number: 3,
  frame: 5,
  name: "カワダゴウワン",
  age: 4,
  gender: "牡",
  weight: 480,
  weightChange: -2,
  jockey: "川田将雅",
  jockeyWeight: 57,
  sire: "ロードカナロア",
  bloodline: "キングカメハメハ系",
  style: "先行",
  odds: 2.1,
  popularity: 1,
  pastRaces: []
};

// ④ 改修後ダート1800mスタミナ血統先行 (ダ1800m、シニスターミニスター、先行)
const horseDirtSire: Horse = {
  id: "kyoto-dirtsire",
  number: 4,
  frame: 6,
  name: "タフダートキング",
  age: 4,
  gender: "牡",
  weight: 510,
  weightChange: 0,
  jockey: "松山弘平",
  jockeyWeight: 57,
  sire: "シニスターミニスター",
  bloodline: "エーピーインディ系",
  style: "先行",
  odds: 5.5,
  popularity: 3,
  pastRaces: []
};

// ⑤ ハンデ戦軽量馬 (ハンデ芝2400m、斤量55kg以下、4〜5歳)
const horseLightWeight: Horse = {
  id: "kyoto-light",
  number: 5,
  frame: 4,
  name: "カルイハンデ",
  age: 4, // 4歳
  gender: "牡",
  weight: 450,
  weightChange: -2,
  jockey: "武豊",
  jockeyWeight: 53, // 53kg
  sire: "ディープインパクト",
  bloodline: "サンデーサイレンス系",
  style: "差し",
  odds: 6.0,
  popularity: 4,
  pastRaces: []
};

// ⑥ ハンデ戦実績不足重斤量 (ハンデ芝2400m、斤量57kg以上、GI実績なし)
const horseHeavyNoRecord: Horse = {
  id: "kyoto-heavy",
  number: 6,
  frame: 8,
  name: "オモイハンデ",
  age: 6,
  gender: "牡",
  weight: 520,
  weightChange: 4,
  jockey: "デムーロ",
  jockeyWeight: 57, // 57kg
  sire: "ハーツクライ",
  bloodline: "サンデーサイレンス系",
  style: "差し",
  odds: 3.5,
  popularity: 2,
  pastRaces: [
    {
      date: "2026-04-10",
      venue: "中山",
      raceName: "日経賞",
      raceClass: "G2",
      distance: 2500,
      surface: "芝",
      condition: "良",
      result: 4, // GI実績なし
      time: "2:32.1",
      corner4Position: 4,
      cornerOuterCount: 2,
      weight: 516,
      jockey: "デムーロ",
      odds: 4.0
    }
  ]
};

const kyotoTestHorses = [
  { horse: horseSaka, race: kyotoInnerTurfRace, desc: "① 淀の坂越え機動力補正 (芝内回り・馬体絞り・内枠)" },
  { horse: horseIwata, race: kyotoG2Race, desc: "② 岩田康誠「イン突き」 (重賞・G2・内枠)" },
  { horse: horseKawada, race: kyotoG2Race, desc: "③ 川田将雅芝2200m (芝2200m外回り・先行)" },
  { horse: horseDirtSire, race: kyotoDirtRace, desc: "④ 改修後ダート1800mスタミナ血統先行" },
  { horse: horseLightWeight, race: kyotoHandicapRace, desc: "⑤ ハンデ戦軽量若駒優遇 (53kg・4歳)" },
  { horse: horseHeavyNoRecord, race: kyotoHandicapRace, desc: "⑥ ハンデ戦実績不足重ハンデペナルティ (57kg・GI実績なし)" }
];

kyotoTestHorses.forEach(({ horse, race, desc }) => {
  console.log(`\n--------------------------------------------`);
  console.log(`テストケース: ${desc}`);
  console.log(`馬名: ${horse.name} (斤量: ${horse.jockeyWeight}kg, 馬体重増減: ${horse.weightChange}kg, 枠: ${horse.frame})`);
  console.log(`騎手: ${horse.jockey}, 脚質: ${horse.style}, 血統: ${horse.sire}`);
  const prediction = calculateTsuchiyaScore(horse, race, [], { horses: {}, jockeys: {} });
  console.log(`ポテンシャルスコア: ${prediction.potential}`);
  console.log(`付与された適性タグ (aptitudeTags):`);
  prediction.aptitudeTags?.forEach(tag => console.log(`  - ${tag}`));
});

console.log("\n=== 新潟競馬場 的中精度極限先鋭化テスト開始 ===");

// 1. 新潟レースデータ
const niigataChokuRace: Race = {
  id: "niigata-test-choku",
  date: "2026-05-20",
  venue: "新潟",
  raceNumber: 11,
  raceName: "駿風ステークス",
  distance: 1000,
  surface: "芝",
  condition: "良",
  headCount: 16,
  trackName: "新潟",
  horses: []
};

const niigataOuterTurfRace: Race = {
  id: "niigata-test-outer-turf",
  date: "2026-05-20",
  venue: "新潟",
  raceNumber: 10,
  raceName: "佐渡ステークス",
  distance: 1800, // 外回り
  surface: "芝",
  condition: "良",
  headCount: 14,
  trackName: "新潟",
  horses: []
};

const niigataFinalWeekRace: Race = {
  id: "niigata-test-final-week",
  date: "2026-09-06", // 新潟記念
  venue: "新潟",
  raceNumber: 11,
  raceName: "新潟記念",
  distance: 2000,
  surface: "芝",
  condition: "良",
  headCount: 18,
  trackName: "新潟",
  horses: []
};

const niigataDirt1200Race: Race = {
  id: "niigata-test-dirt-1200",
  date: "2026-05-20",
  venue: "新潟",
  raceNumber: 8,
  raceName: "4歳以上1勝クラス",
  distance: 1200,
  surface: "ダート",
  condition: "良",
  headCount: 15,
  trackName: "新潟",
  horses: []
};

const niigataDirt1800SummerRace: Race = {
  id: "niigata-test-dirt-1800-summer",
  date: "2026-08-15", // 夏開催
  venue: "新潟",
  raceNumber: 9,
  raceName: "麒麟山特別",
  distance: 1800,
  surface: "ダート",
  condition: "良",
  headCount: 15,
  trackName: "新潟",
  horses: []
};

const niigataDirt1800AutumnRace: Race = {
  id: "niigata-test-dirt-1800-autumn",
  date: "2026-10-15", // 秋開催
  venue: "新潟",
  raceNumber: 9,
  raceName: "北陸ステークス",
  distance: 1800,
  surface: "ダート",
  condition: "稍重",
  headCount: 15,
  trackName: "新潟",
  horses: []
};

// 2. 馬データ
// ① 新潟千直：大幅距離短縮ローテ×斤量減
const horseNiigataChoku: Horse = {
  id: "niigata-choku",
  number: 1,
  frame: 8,
  name: "センチョクキング",
  age: 4,
  gender: "牡",
  weight: 480,
  weightChange: 0,
  jockey: "戸崎圭太",
  jockeyWeight: 54, // 今回54kg
  sire: "ロードカナロア",
  bloodline: "キングカメハメハ系",
  style: "先行",
  odds: 3.5,
  popularity: 2,
  pastRaces: [
    {
      date: "2026-04-20",
      venue: "東京",
      raceName: "府中S",
      raceClass: "3勝クラス",
      distance: 1600, // 前走1600m (1500m以上)
      surface: "芝",
      condition: "良",
      result: 4,
      time: "1:33.2",
      corner4Position: 3,
      cornerOuterCount: 1,
      weight: 480,
      jockeyWeight: 56, // 前走56kg
      jockey: "戸崎圭太",
      odds: 5.0
    }
  ]
};

// ② 新潟芝外回り：人気薄逃げ馬スロー逃げ残り
const horseNiigataOuterTurf: Horse = {
  id: "niigata-outer-turf",
  number: 2,
  frame: 6,
  name: "オオマワリニゲ",
  age: 5,
  gender: "牡",
  weight: 470,
  weightChange: 2,
  jockey: "坂井瑠星",
  jockeyWeight: 57,
  sire: "キズナ",
  bloodline: "サンデーサイレンス系",
  style: "逃げ",
  odds: 15.0, // 人気薄
  popularity: 7, // 7番人気
  pastRaces: []
};

// ③ 新潟最終週外回り：全車外出しの逆張りイン突き
const horseNiigataFinalWeek: Horse = {
  id: "niigata-final-week",
  number: 3,
  frame: 2, // 内枠
  name: "サイシュウインツキ",
  age: 5,
  gender: "牡",
  weight: 490,
  weightChange: 0,
  jockey: "岩田康誠",
  jockeyWeight: 57,
  sire: "ハーツクライ",
  bloodline: "サンデーサイレンス系",
  style: "差し",
  odds: 8.5,
  popularity: 4,
  pastRaces: []
};

// ④ 新潟ダ1200m：芝スタート外枠×快速牝馬逃げの最強スピードシナジー
const horseNiigataDirt1200: Horse = {
  id: "niigata-dirt-1200",
  number: 4,
  frame: 7, // 外枠
  name: "ダートクイーン",
  age: 4,
  gender: "牝", // 牝馬
  weight: 460,
  weightChange: 2,
  jockey: "武豊",
  jockeyWeight: 55,
  sire: "ヘニーヒューズ",
  bloodline: "ストームキャット系",
  style: "逃げ", // 逃げ
  odds: 4.2,
  popularity: 2,
  pastRaces: []
};

// ⑤ 新潟ダ1800m夏良馬場：スタミナ要求さらさら砂×距離延長・外枠エッジ
const horseNiigataDirt1800Summer: Horse = {
  id: "niigata-dirt-1800-summer",
  number: 5,
  frame: 8, // 外枠
  name: "サマーデザート",
  age: 4,
  gender: "牡",
  weight: 500,
  weightChange: 4,
  jockey: "ルメール",
  jockeyWeight: 57,
  sire: "シニスターミニスター",
  bloodline: "エーピーインディ系",
  style: "先行",
  odds: 3.2,
  popularity: 1,
  pastRaces: [
    {
      date: "2026-07-10",
      venue: "中京",
      raceName: "3歳以上1勝クラス",
      raceClass: "1勝",
      distance: 1400, // 距離延長 (1400 -> 1800)
      surface: "ダート",
      condition: "良",
      result: 3,
      time: "1:25.5",
      corner4Position: 2,
      cornerOuterCount: 1,
      weight: 496,
      jockeyWeight: 57,
      jockey: "ルメール",
      odds: 2.5
    }
  ]
};

// ⑥ 新潟ダ1800m粘性泥濘馬場：パワー型前残り先行
const horseNiigataDirt1800Autumn: Horse = {
  id: "niigata-dirt-1800-autumn",
  number: 6,
  frame: 3,
  name: "ネンセイドレイコウ",
  age: 5,
  gender: "牡",
  weight: 510,
  weightChange: -2,
  jockey: "松山弘平",
  jockeyWeight: 57,
  sire: "ドレフォン",
  bloodline: "ストームキャット系",
  style: "先行", // 先行
  odds: 5.8,
  popularity: 3,
  pastRaces: []
};

const niigataTestHorses = [
  { horse: horseNiigataChoku, race: niigataChokuRace, desc: "① 新潟千直：大幅距離短縮ローテ×斤量減エッジ (芝1000m・距離短縮・斤量減)" },
  { horse: horseNiigataOuterTurf, race: niigataOuterTurfRace, desc: "② 新潟外回り芝：スローペースの逃げ残りエッジ (芝1800m・人気薄・逃げ)" },
  { horse: horseNiigataFinalWeek, race: niigataFinalWeekRace, desc: "③ 新潟最終週外回り：全車外出しの逆張りイン突きエッジ (芝2000m新潟記念・内枠)" },
  { horse: horseNiigataDirt1200, race: niigataDirt1200Race, desc: "④ 新潟ダ1200m：芝スタート外枠×快速牝馬逃げの最強スピードシナジー (ダ1200m・外枠・牝馬・逃げ)" },
  { horse: horseNiigataDirt1800Summer, race: niigataDirt1800SummerRace, desc: "⑤ 新潟ダ1800m夏良馬場：スタミナ要求さらさら砂×距離延長・外枠エッジ (ダ1800m・夏開催・良馬場・外枠・距離延長)" },
  { horse: horseNiigataDirt1800Autumn, race: niigataDirt1800AutumnRace, desc: "⑥ 新潟ダ1800m粘性泥濘馬場：パワー型前残り先行エッジ (ダ1800m・秋開催・稍重・先行)" }
];

niigataTestHorses.forEach(({ horse, race, desc }) => {
  console.log(`\n--------------------------------------------`);
  console.log(`テストケース: ${desc}`);
  console.log(`馬名: ${horse.name} (斤量: ${horse.jockeyWeight}kg, 馬体重増減: ${horse.weightChange}kg, 枠: ${horse.frame})`);
  console.log(`脚質: ${horse.style}, 人気: ${horse.popularity}, オッズ: ${horse.odds}`);
  const prediction = calculateTsuchiyaScore(horse, race, [], { horses: {}, jockeys: {} });
  console.log(`ポテンシャルスコア: ${prediction.potential}`);
  console.log(`付与された適性タグ (aptitudeTags):`);
  prediction.aptitudeTags?.forEach(tag => console.log(`  - ${tag}`));
});

console.log("\n=== JRA 10箇所 高度新要因（要素1・2・3）テスト開始 ===");

// 1. レースデータ
const jraSummerRace: Race = {
  id: "jra-summer-race",
  date: "2026-08-10",
  venue: "小倉",
  raceNumber: 11,
  raceName: "小倉記念(G3)",
  distance: 2000,
  surface: "芝",
  condition: "良",
  headCount: 12,
  trackName: "小倉",
  season: "summer",
  horses: []
};

const jraRainyRace: Race = {
  id: "jra-rainy-race",
  date: "2026-05-20",
  venue: "中山",
  raceNumber: 11,
  raceName: "皐月賞(G1)",
  distance: 2000,
  surface: "芝",
  condition: "稍重",
  weather: "雨",
  headCount: 18,
  trackName: "中山",
  horses: []
};

// 2. 馬データ
// ① 夏の牝馬バイアス適合 vs 酷暑大型黒毛馬
const horseSummerMeba: Horse = {
  id: "summer-meba",
  number: 1,
  frame: 2,
  name: "ナツノメバ",
  age: 4,
  gender: "牝", // 牝馬
  weight: 450,
  weightChange: 0,
  jockey: "ルメール",
  jockeyWeight: 55,
  sire: "ディープインパクト",
  bloodline: "サンデーサイレンス系",
  style: "差し",
  odds: 3.5,
  popularity: 2,
  pastRaces: []
};

const horseSummerBlackHeavy: Horse = {
  id: "summer-black-heavy",
  number: 2,
  frame: 4,
  name: "オモクロウマ",
  age: 5,
  gender: "牡",
  weight: 520, // 大型馬
  weightChange: 0,
  coatColor: "青毛", // 黒毛
  jockey: "坂井瑠星",
  jockeyWeight: 57,
  sire: "ハーツクライ",
  bloodline: "サンデーサイレンス系",
  style: "先行",
  odds: 5.2,
  popularity: 3,
  pastRaces: []
};

// ② 天候急変（雨/雪）による道悪血統適性
const horseRainyBlood: Horse = {
  id: "rainy-blood",
  number: 3,
  frame: 5,
  name: "キズナスピリッツ",
  age: 4,
  gender: "牡",
  weight: 480,
  weightChange: 0,
  jockey: "武豊",
  jockeyWeight: 57,
  sire: "キズナ", // キズナ産駒
  bloodline: "サンデーサイレンス系",
  style: "先行",
  odds: 4.8,
  popularity: 3,
  pastRaces: []
};

// ③ 休み明け初戦×好仕上がり vs クラス降級戦
const horseRestBest: Horse = {
  id: "rest-best",
  number: 4,
  frame: 1,
  name: "テッポウバクハツ",
  age: 4,
  gender: "牡",
  weight: 490,
  weightChange: 0,
  jockey: "川田将雅",
  jockeyWeight: 57,
  sire: "ロードカナロア",
  bloodline: "キングカメハメハ系",
  style: "先行",
  odds: 2.5,
  popularity: 1,
  isAfterRest: true, // 休み明け
  trainingRating: "S", // 調教S
  pastRaces: []
};

const horseClassDown: Horse = {
  id: "class-down",
  number: 5,
  frame: 3,
  name: "カクシタアリガトウ",
  age: 5,
  gender: "牡",
  weight: 500,
  weightChange: 0,
  jockey: "戸崎圭太",
  jockeyWeight: 57,
  sire: "ドゥラメンテ",
  bloodline: "キングカメハメハ系",
  style: "差し",
  odds: 3.0,
  popularity: 2,
  raceClass: "3勝クラス", // 今回3勝クラス
  pastRaces: [
    {
      date: "2026-04-10",
      venue: "東京",
      raceName: "OP特別",
      raceClass: "OP", // 前走オープン（降級戦）
      distance: 2000,
      surface: "芝",
      condition: "良",
      result: 5,
      time: "1:59.2",
      corner4Position: 6,
      cornerOuterCount: 2,
      weight: 500,
      jockeyWeight: 57,
      jockey: "戸崎圭太",
      odds: 6.5
    }
  ]
};

// ④ 過去走対戦馬レベル高 vs クラス基準タイム超え vs 直近人気トレンド巻き返し穴馬
const horseTrendAnama: Horse = {
  id: "trend-anama",
  number: 6,
  frame: 6,
  name: "フドウトレンド",
  age: 4,
  gender: "牡",
  weight: 470,
  weightChange: -2,
  jockey: "松山弘平",
  jockeyWeight: 57,
  sire: "ディープインパクト",
  bloodline: "サンデーサイレンス系",
  style: "差し",
  odds: 9.5, // 今回9.5倍（人気薄）
  popularity: 5,
  pastRaces: [
    {
      date: "2026-05-01",
      venue: "東京",
      raceName: "プリンシパルS",
      raceClass: "OP",
      distance: 2000,
      surface: "芝",
      condition: "良",
      result: 11, // 前走2桁大敗
      time: "2:01.5",
      classBaseTime: 120.0, // 2:00.0 ( pr.time "2:01.5" => 121.5秒 > 120.0秒 )
      corner4Position: 12,
      cornerOuterCount: 3,
      weight: 472,
      jockeyWeight: 57,
      jockey: "デムーロ",
      odds: 3.2,
      popularity: 2 // 前走2番人気
    },
    {
      date: "2026-04-05",
      venue: "中山",
      raceName: "弥生賞",
      raceClass: "G2",
      distance: 2000,
      surface: "芝",
      condition: "良",
      result: 2, // 僅差2着
      time: "1:59.0", // 119.0秒 (基準タイム120.0秒 => 基準より-1.0秒で超優秀)
      classBaseTime: 120.0, 
      corner4Position: 5,
      cornerOuterCount: 1,
      weight: 470,
      jockeyWeight: 56,
      jockey: "松山弘平",
      odds: 2.8,
      popularity: 1, // 前々走1番人気
      winnerName: "サトノフェンサー" // 強い勝ち馬と対戦
    },
    {
      date: "2026-03-01",
      venue: "東京",
      raceName: "共同通信杯",
      raceClass: "G3",
      distance: 1800,
      surface: "芝",
      condition: "良",
      result: 3,
      time: "1:46.8",
      corner4Position: 4,
      cornerOuterCount: 2,
      weight: 474,
      jockeyWeight: 56,
      jockey: "松山弘平",
      odds: 3.5,
      popularity: 2 // 3走前2番人気
    }
  ]
};

const jraTestCases = [
  { horse: horseSummerMeba, race: jraSummerRace, desc: "① 夏の牝馬バイアス適合 (+15)" },
  { horse: horseSummerBlackHeavy, race: jraSummerRace, desc: "② 酷暑の大型黒毛馬ペナルティ (-15)" },
  { horse: horseRainyBlood, race: jraRainyRace, desc: "③ 雨天急変による道悪血統適合 (+20)" },
  { horse: horseRestBest, race: jraSummerRace, desc: "④ 鉄砲抜群：休み明け初戦×好仕上がり (+20)" },
  { horse: horseClassDown, race: jraSummerRace, desc: "⑤ クラス降級による圧倒的格上位アドバンテージ (+30)" },
  { horse: horseTrendAnama, race: jraSummerRace, desc: "⑥ 過去走対戦馬レベル高(+25)＆基準タイム超え(+25)＆直近人気トレンド巻き返し穴馬(+30)" }
];

jraTestCases.forEach(({ horse, race, desc }) => {
  console.log(`\n--------------------------------------------`);
  console.log(`テストケース: ${desc}`);
  console.log(`馬名: ${horse.name} (性別: ${horse.gender}, 毛色: ${horse.coatColor}, 馬体重: ${horse.weight}kg, 枠: ${horse.frame})`);
  if (horse.pastRaces && horse.pastRaces[0]) {
    console.log(`前走着順: ${horse.pastRaces[0].result}`);
  }
  const prediction = calculateTsuchiyaScore(horse, race, [], { horses: {}, jockeys: {} });
  console.log(`ポテンシャルスコア: ${prediction.potential}`);
  console.log(`付与された適性タグ (aptitudeTags):`);
  prediction.aptitudeTags?.forEach(tag => console.log(`  - ${tag}`));
});

console.log("\n=== 全テスト完了 ===");
