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

console.log("=== JRA特化OMEGAエンジンテスト開始 ===");
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

// ===================================================
// 【新設】地方競馬（NAR）共通高度要因テストデータ定義
// ===================================================

// レース定義
const narKawasakiNightRace = {
  id: "nar-kawa-01",
  date: "2026-05-20",
  venue: "川崎競馬場",
  raceNumber: 11,
  raceName: "スパーキングサマーカップ",
  distance: 1600,
  surface: "ダート" as const,
  condition: "良" as const,
  headCount: 12,
  trackName: "川崎",
  isNight: true,
  startTime: "20:10",
  horses: []
};

const narOoiNightRace = {
  id: "nar-ooi-01",
  date: "2026-05-21",
  venue: "大井競馬場",
  raceNumber: 11,
  raceName: "東京ダービー",
  distance: 2000,
  surface: "ダート" as const,
  condition: "良" as const,
  headCount: 14,
  trackName: "大井",
  isNight: true,
  startTime: "20:00",
  horses: []
};

const narKawasakiSprintRace = {
  id: "nar-kawa-sprint",
  date: "2026-05-22",
  venue: "川崎競馬場",
  raceNumber: 10,
  raceName: "スプリント特別",
  distance: 900,
  surface: "ダート" as const,
  condition: "良" as const,
  headCount: 12,
  trackName: "川崎",
  isNight: false,
  startTime: "16:30",
  horses: []
};

const narUrawaDayRace = {
  id: "nar-urawa-01",
  date: "2026-05-23",
  venue: "浦和競馬場",
  raceNumber: 11,
  raceName: "さきたま杯",
  distance: 1400,
  surface: "ダート" as const,
  condition: "良" as const,
  headCount: 12,
  trackName: "浦和",
  isNight: false,
  startTime: "16:00",
  horses: []
};

// 馬定義
// 1. 地方遠征・輸送ストレス馬（門別から川崎へ遠征、馬体重減、3歳若駒でナイターストレス、リーディング打越厩舎で調教A）
const horseNarBelongingStress = {
  id: "nar-h1",
  number: 5,
  frame: 4,
  name: "ホッカイドウオウジャ",
  belonging: "門別競馬場",
  age: 3,
  gender: "牡" as const,
  weight: 430,
  weightChange: -10,
  jockey: "落合玄太",
  jockeyWeight: 56,
  trainer: "打越勇児",
  owner: "地方馬主連合",
  sire: "ゴールドシップ",
  dam: "マザーレイク",
  bms: "キングカメハメハ",
  bloodline: "サンデーサイレンス系",
  style: "好位" as const,
  odds: 4.5,
  popularity: 2,
  trainingRating: "A",
  pastRaces: [
    {
      date: "2026-04-15",
      venue: "門別",
      raceName: "北斗盃",
      raceClass: "重賞",
      distance: 1600,
      surface: "ダート" as const,
      condition: "良" as const,
      result: 1,
      time: "1:42.5",
      corner4Position: 2,
      cornerOuterCount: 1,
      weight: 440,
      jockey: "落合玄太",
      odds: 1.8,
      prize: 500
    }
  ]
};

// 2. 砂理学・内枠小型馬（大井1枠1番、440kg、ブリンカー無、砂被り懸念、他地区所属なしで輸送ストレスはなし）
const horseNarSandSmallInner = {
  id: "nar-h2",
  number: 1,
  frame: 1,
  name: "スナカブリプティ",
  belonging: "大井競馬場",
  age: 4,
  gender: "牝" as const,
  weight: 435,
  weightChange: 2,
  jockey: "矢野貴之",
  jockeyWeight: 54,
  trainer: "荒山沙",
  owner: "砂理学オーナー",
  sire: "ヘニーヒューズ",
  dam: "サンドクィーン",
  bms: "アグネスタキオン",
  bloodline: "ストームキャット系",
  style: "好位" as const,
  odds: 12.0,
  popularity: 5,
  pastRaces: [
    {
      date: "2026-04-20",
      venue: "大井",
      raceName: "一般戦",
      raceClass: "B2",
      distance: 1600,
      surface: "ダート" as const,
      condition: "良" as const,
      result: 4,
      time: "1:41.8",
      corner4Position: 4,
      cornerOuterCount: 1,
      weight: 433,
      jockey: "矢野貴之",
      odds: 5.5,
      prize: 80
    }
  ]
};

// 3. 砂理学・外枠大型馬（大井8枠12番、520kg、先行脚質、砂被り回避エッジ、ナイター大型先行馬加点）
const horseNarSandBigOuter = {
  id: "nar-h3",
  number: 12,
  frame: 8,
  name: "キングオブダート",
  belonging: "大井競馬場",
  age: 5,
  gender: "牡" as const,
  weight: 525,
  weightChange: 0,
  jockey: "森泰斗",
  jockeyWeight: 57,
  trainer: "藤田輝",
  owner: "ゴールドダート",
  sire: "シニスターミニスター",
  dam: "マッシヴパワー",
  bms: "クロフネ",
  bloodline: "ボールドルーラー系",
  style: "先行" as const,
  odds: 3.2,
  popularity: 1,
  pastRaces: [
    {
      date: "2026-04-21",
      venue: "大井",
      raceName: "大井記念",
      raceClass: "重賞",
      distance: 2000,
      surface: "ダート" as const,
      condition: "良" as const,
      result: 2,
      time: "2:06.5",
      corner4Position: 2,
      cornerOuterCount: 2,
      weight: 525,
      jockey: "森泰斗",
      odds: 2.5,
      prize: 400
    }
  ]
};

// 4. 南関ヒエラルキー遠征馬（川崎開催で大井所属の遠征馬）
const horseNarHierarchyNankan = {
  id: "nar-h4",
  number: 8,
  frame: 6,
  name: "オオイノハシャ",
  belonging: "大井競馬場",
  age: 4,
  gender: "牡" as const,
  weight: 480,
  weightChange: 2,
  jockey: "笹川翼",
  jockeyWeight: 56,
  trainer: "小久保智",
  owner: "南関エリート",
  sire: "ロードカナロア",
  dam: "サザンクロス",
  bms: "スペシャルウィーク",
  bloodline: "キングマンボ系",
  style: "先行" as const,
  odds: 2.1,
  popularity: 1,
  trainingRating: "S",
  pastRaces: [
    {
      date: "2026-04-22",
      venue: "大井",
      raceName: "羽田盃",
      raceClass: "重賞",
      distance: 1800,
      surface: "ダート" as const,
      condition: "良" as const,
      result: 1,
      time: "1:53.2",
      corner4Position: 3,
      cornerOuterCount: 1,
      weight: 478,
      jockey: "笹川翼",
      odds: 1.9,
      prize: 1000
    }
  ]
};

// 5. 小回り超スプリント幾何学・内枠逃げ馬 (川崎900m、1枠1番、逃げ脚質)
const horseNarSprintInnerEscape = {
  id: "nar-h5",
  number: 1,
  frame: 1,
  name: "スプリントエクスプレス",
  belonging: "川崎競馬場",
  age: 4,
  gender: "牡" as const,
  weight: 470,
  weightChange: -2,
  jockey: "山崎誠士",
  jockeyWeight: 56,
  trainer: "内田勝",
  owner: "スピード狂",
  sire: "サウスヴィグラス",
  dam: "クイックショット",
  bms: "タイキシャトル",
  bloodline: "フォーティナイナー系",
  style: "逃げ" as const,
  odds: 3.5,
  popularity: 2,
  pastRaces: [
    {
      date: "2026-04-10",
      venue: "川崎",
      raceName: "スプリント一般",
      raceClass: "A2",
      distance: 900,
      surface: "ダート" as const,
      condition: "良" as const,
      result: 1,
      time: "0:53.5",
      corner4Position: 1,
      cornerOuterCount: 1,
      weight: 472,
      jockey: "山崎誠士",
      odds: 2.4,
      prize: 300
    }
  ]
};

// 6. 小回り超スプリント幾何学・外枠差し馬 (川崎900m、8枠12番、差し脚質)
const horseNarSprintOuterInsert = {
  id: "nar-h6",
  number: 12,
  frame: 8,
  name: "スプリントチャレンジャー",
  belonging: "川崎競馬場",
  age: 4,
  gender: "牡" as const,
  weight: 475,
  weightChange: 4,
  jockey: "町田直希",
  jockeyWeight: 56,
  trainer: "今津博",
  owner: "大外一気",
  sire: "サウスヴィグラス",
  dam: "チェイシングドリーム",
  bms: "ディープインパクト",
  bloodline: "フォーティナイナー系",
  style: "差し" as const,
  odds: 15.0,
  popularity: 7,
  pastRaces: [
    {
      date: "2026-04-10",
      venue: "川崎",
      raceName: "スプリント一般",
      raceClass: "A2",
      distance: 900,
      surface: "ダート" as const,
      condition: "良" as const,
      result: 4,
      time: "0:54.2",
      corner4Position: 8,
      cornerOuterCount: 3,
      weight: 471,
      jockey: "町田直希",
      odds: 12.0,
      prize: 40
    }
  ]
};

// 7. JRA移籍初戦過剰人気割引馬 (転入初戦、単勝1.8倍)
const horseNarJraTransferFirst = {
  id: "nar-h7",
  number: 3,
  frame: 2,
  name: "ジェイアールエース",
  transferFrom: "JRA",
  isTransferFirstRace: true,
  age: 3,
  gender: "牡" as const,
  weight: 490,
  weightChange: 0,
  jockey: "御神本訓",
  jockeyWeight: 56,
  trainer: "吉村寛",
  owner: "転入クラブ",
  sire: "ロードカナロア",
  dam: "エリートレディ",
  bms: "ハーツクライ",
  bloodline: "キングマンボ系",
  style: "先行" as const,
  odds: 1.8,
  popularity: 1,
  pastRaces: [
    {
      date: "2026-03-20",
      venue: "中山",
      raceName: "3歳未勝利",
      raceClass: "未勝利",
      distance: 1800,
      surface: "芝" as const,
      condition: "良" as const,
      result: 2,
      time: "1:52.5",
      corner4Position: 3,
      cornerOuterCount: 1,
      weight: 490,
      jockey: "ルメール",
      odds: 2.1,
      prize: 200
    }
  ]
};

// 8. JRA移籍2戦目大化け期待値馬 (前走移籍初戦で8着大敗、前々走以前JRA、今回単勝オッズ8.5倍に下落)
const horseNarJraTransferSecond = {
  id: "nar-h8",
  number: 6,
  frame: 4,
  name: "オオバケロマン",
  age: 4,
  gender: "セ" as any, // セン
  weight: 470,
  weightChange: 4,
  jockey: "吉原寛人",
  jockeyWeight: 56,
  trainer: "打越勇児",
  owner: "大化けロマン",
  sire: "ディープインパクト",
  dam: "ロマンシーカー",
  bms: "フレンチデピュティ",
  bloodline: "サンデーサイレンス系",
  style: "差し" as const,
  odds: 8.5,
  popularity: 4,
  pastRaces: [
    {
      date: "2026-04-20",
      venue: "川崎",
      raceName: "一般戦",
      raceClass: "B3",
      distance: 1500,
      surface: "ダート" as const,
      condition: "良" as const,
      result: 8, // 移籍初戦は大敗
      time: "1:38.5",
      corner4Position: 9,
      cornerOuterCount: 2,
      weight: 466,
      jockey: "山崎誠士",
      odds: 2.8,
      prize: 0
    },
    {
      date: "2026-02-15",
      venue: "東京",
      raceName: "4歳上1勝クラス",
      raceClass: "1勝",
      distance: 1600,
      surface: "ダート" as const,
      condition: "良" as const,
      result: 10,
      time: "1:38.2",
      corner4Position: 12,
      cornerOuterCount: 3,
      weight: 472,
      jockey: "戸崎圭太",
      odds: 12.5,
      prize: 0
    }
  ]
};

const narTestCases = [
  { horse: horseNarBelongingStress, race: narKawasakiNightRace, desc: "① 地方遠征輸送ストレス(-15) & 若駒ナイターストレス(-10) & リーディング厩舎勝負仕上げ(+25)" },
  { horse: horseNarSandSmallInner, race: narOoiNightRace, desc: "② 砂理学:内枠小型馬の砂被り自滅懸念(-20) & 夜間小柄馬パワー懸念(-10)" },
  { horse: horseNarSandBigOuter, race: narOoiNightRace, desc: "③ 砂理学:外枠大型馬の砂被り回避黄金エッジ(+25) & 夜間大型先行馬パワー加点(+15)" },
  { horse: horseNarHierarchyNankan, race: narKawasakiNightRace, desc: "④ 南関遠征所属ヒエラルキー適合(+20) & リーディング厩舎勝負仕上げ(+25)" },
  { horse: horseNarSprintInnerEscape, race: narKawasakiSprintRace, desc: "⑤ スプリント幾何学:極小回り内枠逃げ先行アドバンテージ(+35)" },
  { horse: horseNarSprintOuterInsert, race: narKawasakiSprintRace, desc: "⑥ スプリント幾何学:極小回り外枠距離ロス壊滅(-25)" },
  { horse: horseNarJraTransferFirst, race: narUrawaDayRace, desc: "⑦ JRA移籍初戦の過剰人気割引(-15)" },
  { horse: horseNarJraTransferSecond, race: narUrawaDayRace, desc: "⑧ JRA移籍2戦目:オッズ急落による大化け激走期待値(+30) & リーディング厩舎勝負仕上げ(+25)" }
];

console.log("\n============================================");
console.log("=== NAR特化OMEGAエンジンテスト開始 ===");
console.log("============================================");

narTestCases.forEach(({ horse, race, desc }) => {
  console.log(`\n--------------------------------------------`);
  console.log(`テストケース: ${desc}`);
  console.log(`馬名: ${horse.name} (所属: ${horse.belonging || '不明'}, 性別: ${horse.gender}, 馬体重: ${horse.weight}kg, 枠: ${horse.frame}, 単勝オッズ: ${horse.odds})`);
  if (horse.pastRaces && horse.pastRaces[0]) {
    console.log(`前走着順: ${horse.pastRaces[0].result} (開催場: ${horse.pastRaces[0].venue})`);
  }
  const prediction = calculateTsuchiyaScore(horse as any, race as any, [], { horses: {}, jockeys: {} });
  console.log(`ポテンシャルスコア: ${prediction.potential}`);
  console.log(`付与された適性タグ (aptitudeTags):`);
  prediction.aptitudeTags?.forEach(tag => console.log(`  - ${tag}`));
});

// ============================================
// === 地方競馬結果情報 6大未活用新要因テスト ===
// ============================================
console.log("\n============================================");
console.log("=== 地方結果情報 6大新要因検証テスト開始 ===");
console.log("============================================");

const raceOoiNormal: Race = {
  id: "ooi-normal-race",
  date: "2026-05-20",
  venue: "大井",
  raceNumber: 10,
  raceName: "一般特別",
  distance: 1600,
  surface: "ダート",
  condition: "良",
  headCount: 10,
  trackName: "大井",
  horses: []
};

// ① 不利事故度外視テスト馬
const horseNarIncidentRescue: Horse = {
  id: "nar-h9",
  number: 9,
  frame: 5,
  name: "アクシデントレスキュー",
  age: 4,
  gender: "牡",
  weight: 480,
  weightChange: 0,
  jockey: "御神本訓",
  jockeyWeight: 56,
  trainer: "小久保智",
  owner: "不利度外視オーナー",
  sire: "ロードカナロア",
  dam: "レスキューレディ",
  bms: "サンデーサイレンス",
  bloodline: "キングマンボ系",
  style: "先行",
  odds: 5.5,
  popularity: 3,
  pastRaces: [
    {
      date: "2026-04-20",
      venue: "浦和",
      raceName: "一般戦",
      raceClass: "B3",
      distance: 1400,
      surface: "ダート",
      condition: "良",
      result: 8, // 6着以下惨敗
      time: "1:30.5",
      corner4Position: 8,
      cornerOuterCount: 1,
      weight: 480,
      jockey: "御神本訓",
      odds: 2.5,
      prize: 0,
      incidents: "前が壁になり大きな不利" // 不利事故あり
    }
  ]
};

// ② 道中位置取り遷移テスト馬
const horseNarPassingTransition: Horse = {
  id: "nar-h10",
  number: 10,
  frame: 6,
  name: "ロンスパマクラー",
  age: 4,
  gender: "牡",
  weight: 490,
  weightChange: 0,
  jockey: "吉原寛人",
  jockeyWeight: 56,
  trainer: "打越勇児",
  owner: "まくりオーナー",
  sire: "ゴールドシップ",
  dam: "マクラーレディ",
  bms: "サンデーサイレンス",
  bloodline: "サンデーサイレンス系",
  style: "差し",
  odds: 4.5,
  popularity: 2,
  pastRaces: [
    {
      date: "2026-04-15",
      venue: "高知",
      raceName: "一般戦",
      raceClass: "C1",
      distance: 1400,
      surface: "ダート",
      condition: "良",
      result: 2,
      time: "1:31.0",
      corner4Position: 2,
      cornerOuterCount: 2,
      weight: 490,
      jockey: "吉原寛人",
      odds: 3.0,
      prize: 50,
      passingPositions: "12-10-5-2"
    }
  ]
};

// ③ 区間ラップ構成テスト馬
const horseNarPaceBias: Horse = {
  id: "nar-h11",
  number: 11,
  frame: 7,
  name: "ハイペーストタフネス",
  age: 5,
  gender: "牡",
  weight: 500,
  weightChange: 0,
  jockey: "森泰斗",
  jockeyWeight: 56,
  trainer: "藤田輝",
  owner: "ラップオーナー",
  sire: "シニスターミニスター",
  dam: "タフネスレディ",
  bms: "ブライアンズタイム",
  bloodline: "エーピーインディ系",
  style: "先行",
  odds: 3.5,
  popularity: 2,
  pastRaces: [
    {
      date: "2026-04-10",
      venue: "大井",
      raceName: "一般戦",
      raceClass: "B2",
      distance: 1600,
      surface: "ダート",
      condition: "良",
      result: 3,
      time: "1:42.0",
      corner4Position: 3,
      cornerOuterCount: 1,
      weight: 500,
      jockey: "森泰斗",
      odds: 4.0,
      prize: 100,
      halonPace: "34.2-36.0"
    }
  ]
};

// ④ 動的対戦レベルテスト馬
const horseNarDynamicOpponent: Horse = {
  id: "nar-h12",
  number: 12,
  frame: 8,
  name: "レベルウォッチャー",
  age: 4,
  gender: "牡",
  weight: 480,
  weightChange: 0,
  jockey: "赤岡修次",
  jockeyWeight: 56,
  trainer: "打越勇児",
  owner: "対戦レベルオーナー",
  sire: "キズナ",
  dam: "ウォッチャーレディ",
  bms: "キングカメハメハ",
  bloodline: "サンデーサイレンス系",
  style: "先行",
  odds: 4.0,
  popularity: 2,
  pastRaces: [
    {
      date: "2026-04-05",
      venue: "高知",
      raceName: "一般戦",
      raceClass: "C1",
      distance: 1400,
      surface: "ダート",
      condition: "良",
      result: 2,
      time: "1:30.8",
      corner4Position: 2,
      cornerOuterCount: 1,
      weight: 480,
      jockey: "赤岡修次",
      odds: 2.5,
      prize: 60,
      winnerName: "ゴールドオウジャ"
    }
  ]
};

const masterDataWithDynamicOpponent: MasterData = {
  horses: {
    "ゴールドオウジャ": {
      name: "ゴールドオウジャ",
      results: [
        { date: "2026-04-05", rank: 1, venue: "高知", distance: 1400 },
        { date: "2026-05-01", rank: 1, venue: "高知", distance: 1400 }
      ]
    }
  },
  jockeys: {}
};

// ⑤ 馬場別着差スケーリングテスト馬
const horseNarMarginScaling: Horse = {
  id: "nar-h13",
  number: 13,
  frame: 2,
  name: "マージンスケーラー",
  age: 4,
  gender: "牡",
  weight: 470,
  weightChange: 0,
  jockey: "矢野貴之",
  jockeyWeight: 56,
  trainer: "森下淳",
  owner: "スケーリングオーナー",
  sire: "ヘニーヒューズ",
  dam: "スケーラーレディ",
  bms: "サンデーサイレンス",
  bloodline: "ストームキャット系",
  style: "先行",
  odds: 5.0,
  popularity: 3,
  pastRaces: [
    {
      date: "2026-04-18",
      venue: "大井",
      raceName: "一般戦",
      raceClass: "B3",
      distance: 1200,
      surface: "ダート",
      condition: "良",
      result: 2,
      time: "1:13.5",
      corner4Position: 2,
      cornerOuterCount: 1,
      weight: 470,
      jockey: "矢野貴之",
      odds: 3.5,
      prize: 80,
      timeDiff: 0.2
    }
  ]
};

// ⑥ 期待値オッズ歪みテスト馬＆レース
const kochiFinal12R: Race = {
  id: "kochi-12r-final",
  date: "2026-05-20",
  venue: "高知",
  raceNumber: 12,
  raceName: "一発逆転ファイナルレース",
  distance: 1300,
  surface: "ダート",
  condition: "良",
  headCount: 12,
  trackName: "高知",
  horses: []
};

const horseNarDistortionOdds: Horse = {
  id: "nar-h14",
  number: 12,
  frame: 8,
  name: "オッズディストーション",
  age: 5,
  gender: "牡",
  weight: 480,
  weightChange: 0,
  jockey: "永森大智",
  jockeyWeight: 56,
  trainer: "雑賀正光",
  owner: "歪みオーナー",
  sire: "ドゥラメンテ",
  dam: "ディストーションレディ",
  bms: "サンデーサイレンス",
  bloodline: "キングカメハメハ系",
  style: "差し",
  odds: 12.5,
  popularity: 6,
  pastRaces: []
};

const extraNarTestCases = [
  { horse: horseNarIncidentRescue, race: raceOoiNormal, mData: { horses: {}, jockeys: {} }, desc: "① 不利事故度外視テスト（+25加点）" },
  { horse: horseNarPassingTransition, race: raceOoiNormal, mData: { horses: {}, jockeys: {} }, desc: "② 道中位置取り遷移（ロンスパまくり+20加点）" },
  { horse: horseNarPaceBias, race: raceOoiNormal, mData: { horses: {}, jockeys: {} }, desc: "③ 区間ラップ構成（前傾ハイペースダートタフネス+20加点）" },
  { horse: horseNarDynamicOpponent, race: raceOoiNormal, mData: masterDataWithDynamicOpponent, desc: "④ 動的対戦相手レベル（勝ち馬の次走勝ち上がり+25加点）" },
  { horse: horseNarMarginScaling, race: raceOoiNormal, mData: { horses: {}, jockeys: {} }, desc: "⑤ 馬場状態別着差スケーリング（良馬場僅差+15加点）" },
  { horse: horseNarDistortionOdds, race: kochiFinal12R, mData: { horses: {}, jockeys: {} }, desc: "⑥ 高波乱期待値オッズの歪み適合（+20加点 & distortionBoost*1.25）" }
];

extraNarTestCases.forEach(({ horse, race, mData, desc }) => {
  console.log(`\n--------------------------------------------`);
  console.log(`テストケース: ${desc}`);
  console.log(`馬名: ${horse.name} (オッズ: ${horse.odds})`);
  const prediction = calculateTsuchiyaScore(horse, race, [], mData);
  console.log(`ポテンシャルスコア: ${prediction.potential}`);
  console.log(`期待値の闇 (darkness): ${prediction.darkness}`);
  console.log(`付与された適性タグ (aptitudeTags):`);
  prediction.aptitudeTags?.forEach(tag => console.log(`  - ${tag}`));
});

// ============================================
// === 中央競馬結果情報 5大未活用新要因テスト ===
// ============================================
console.log("\n============================================");
console.log("=== 中央結果情報 5大新要因検証テスト開始 ===");
console.log("============================================");

// テスト用ベースレース定義
const jraTurfNormal: Race = {
  id: "jra-turf-normal",
  date: "2026-05-20",
  venue: "東京",
  raceNumber: 11,
  raceName: "オークス",
  distance: 2400,
  surface: "芝",
  condition: "良",
  headCount: 18,
  trackName: "東京",
  temporaryFencePosition: "B",
  cushionValue: 10.0,
  horses: []
};

// 1. 勾配物理テスト馬
const horseJraHillClimber: Horse = {
  id: "jra-h1",
  number: 1,
  frame: 1,
  name: "コウバイフィジクス",
  age: 4,
  gender: "牡",
  weight: 480,
  weightChange: 0,
  jockey: "ルメール",
  jockeyWeight: 57,
  trainer: "手塚貴久（美浦）",
  owner: "勾配オーナー",
  sire: "ディープインパクト",
  dam: "コウバイレディ",
  bms: "Bering",
  bloodline: "サンデーサイレンス系",
  style: "差し",
  odds: 3.5,
  popularity: 2,
  pastRaces: [
    {
      date: "2026-04-12",
      venue: "中山",
      raceName: "皐月賞",
      raceClass: "G1",
      distance: 2000,
      surface: "芝",
      condition: "良",
      result: 2,
      time: "1:58.5",
      corner4Position: 5,
      cornerOuterCount: 1,
      weight: 480,
      jockey: "ルメール",
      odds: 3.0,
      prize: 3000,
      last3fTime: "34.2" // 優秀な上がり3F (芝 <= 34.5)
    }
  ]
};

// 2. 極限クッション値（スピード・タフネス）テスト馬
const horseJraFastCushion: Horse = {
  id: "jra-h2",
  number: 2,
  frame: 1,
  name: "マックスクッション",
  age: 4,
  gender: "牡",
  weight: 490,
  weightChange: 0,
  jockey: "川田将雅",
  jockeyWeight: 57,
  trainer: "中内田充（栗東）",
  owner: "クッションオーナー",
  sire: "ロードカナロア",
  dam: "スピードレディ",
  bms: "Bering",
  bloodline: "キングマンボ系",
  style: "先行",
  odds: 4.0,
  popularity: 2,
  pastRaces: [
    {
      date: "2026-04-20",
      venue: "東京",
      raceName: "一般戦",
      raceClass: "OP",
      distance: 1600,
      surface: "芝",
      condition: "良",
      result: 2,
      time: "1:32.0",
      corner4Position: 2,
      cornerOuterCount: 1,
      weight: 490,
      jockey: "川田将雅",
      odds: 2.5,
      prize: 1000,
      cushionValue: 9.8, // 過去走クッション値 >= 9.5
      timeDiff: 0.1 // 僅差 <= 0.3
    }
  ]
};

const horseJraSoftCushion: Horse = {
  id: "jra-h3",
  number: 3,
  frame: 2,
  name: "タフクッション",
  age: 4,
  gender: "牡",
  weight: 500,
  weightChange: 0,
  jockey: "戸崎圭太",
  jockeyWeight: 57,
  trainer: "手塚貴久（美浦）",
  owner: "タフネスオーナー",
  sire: "キズナ",
  dam: "タフネスレディ",
  bms: "Bering",
  bloodline: "サンデーサイレンス系",
  style: "先行",
  odds: 5.5,
  popularity: 3,
  pastRaces: [
    {
      date: "2026-04-25",
      venue: "京都",
      raceName: "一般戦",
      raceClass: "OP",
      distance: 2000,
      surface: "芝",
      condition: "重",
      result: 3,
      time: "2:02.5",
      corner4Position: 3,
      cornerOuterCount: 1,
      weight: 500,
      jockey: "戸崎圭太",
      odds: 4.5,
      prize: 500,
      cushionValue: 7.0, // 過去走クッション値 <= 7.5
      timeDiff: 0.2 // 僅差 <= 0.3
    }
  ]
};

// 3. 走行軌跡大外回し＆直線進路カット度外視テスト馬
const horseJraIncidentRescue: Horse = {
  id: "jra-h4",
  number: 4,
  frame: 2,
  name: "カットレスキュー",
  age: 4,
  gender: "牡",
  weight: 480,
  weightChange: 0,
  jockey: "武豊",
  jockeyWeight: 57,
  trainer: "国枝栄（美浦）",
  owner: "不利オーナー",
  sire: "ドゥラメンテ",
  dam: "不利レディ",
  bms: "サンデーサイレンス",
  bloodline: "キングカメハメハ系",
  style: "差し",
  odds: 6.0,
  popularity: 4,
  pastRaces: [
    {
      date: "2026-05-01",
      venue: "東京",
      raceName: "一般戦",
      raceClass: "3勝",
      distance: 1800,
      surface: "芝",
      condition: "良",
      result: 7, // 5着以下惨敗
      time: "1:46.5",
      corner4Position: 8,
      cornerOuterCount: 1,
      weight: 480,
      jockey: "武豊",
      odds: 3.5,
      prize: 0,
      incidents: "直線前が壁になり追えず" // 不利事故あり
    }
  ]
};

const horseJraOuterLoss: Horse = {
  id: "jra-h5",
  number: 5,
  frame: 3,
  name: "オオソトディスタンス",
  age: 4,
  gender: "牡",
  weight: 470,
  weightChange: 0,
  jockey: "横山武史",
  jockeyWeight: 57,
  trainer: "鹿戸雄一（美浦）",
  owner: "外回しオーナー",
  sire: "ハーツクライ",
  dam: "外回しレディ",
  bms: "サンデーサイレンス",
  bloodline: "サンデーサイレンス系",
  style: "差し",
  odds: 8.5,
  popularity: 5,
  pastRaces: [
    {
      date: "2026-04-20",
      venue: "中山",
      raceName: "一般戦",
      raceClass: "3勝",
      distance: 2000,
      surface: "芝",
      condition: "良",
      result: 6, // 5着以下惨敗
      time: "2:00.5",
      corner4Position: 6,
      cornerOuterCount: 4, // 4角外回し4頭
      weight: 470,
      jockey: "横山武史",
      odds: 6.5,
      prize: 0,
      timeDiff: 0.3 // 僅差 <= 0.5
    }
  ]
};

// 4. 仮柵ステージバイアステスト馬
const horseJraInnerFence: Horse = {
  id: "jra-h6",
  number: 2,
  frame: 1, // 内枠 (<= 3)
  name: "インゲキグリーン",
  age: 4,
  gender: "牡",
  weight: 485,
  weightChange: 0,
  jockey: "坂井瑠星",
  jockeyWeight: 57,
  trainer: "矢作芳人（栗東）",
  owner: "仮柵オーナー",
  sire: "ロードカナロア",
  dam: "インゲキレディ",
  bms: "サンデーサイレンス",
  bloodline: "キングマンボ系",
  style: "先行", // 先行
  odds: 3.0,
  popularity: 1,
  pastRaces: []
};

const horseJraOuterFence: Horse = {
  id: "jra-h7",
  number: 15,
  frame: 7, // 外枠 (>= 6)
  name: "ソトサシアラシ",
  age: 4,
  gender: "牡",
  weight: 490,
  weightChange: 0,
  jockey: "デムーロ",
  jockeyWeight: 57,
  trainer: "堀宣行（美浦）",
  owner: "外差しオーナー",
  sire: "ハーツクライ",
  dam: "外差しレディ",
  bms: "サンデーサイレンス",
  bloodline: "サンデーサイレンス系",
  style: "差し", // 差し
  odds: 4.5,
  popularity: 3,
  pastRaces: []
};

// 5. 時計の罠・期待値の歪みテスト馬
const horseJraTimeTrap: Horse = {
  id: "jra-h8",
  number: 3,
  frame: 2,
  name: "タイムトラップ",
  age: 4,
  gender: "牡",
  weight: 480,
  weightChange: 0,
  jockey: "ルメール",
  jockeyWeight: 57,
  trainer: "木村哲也（美浦）",
  owner: "時計罠オーナー",
  sire: "キタサンブラック",
  dam: "トラップレディ",
  bms: "Bering",
  bloodline: "サンデーサイレンス系",
  style: "先行",
  odds: 1.5, // 過剰人気 (<= 2.0)
  popularity: 1,
  pastRaces: [
    {
      date: "2026-04-20",
      venue: "東京",
      raceName: "一般戦",
      raceClass: "OP",
      distance: 1600,
      surface: "芝",
      condition: "良",
      result: 1, // 前走1着（大勝）
      time: "1:31.0", // 91.0秒
      classBaseTime: 92.5, // 基準タイム 92.5秒 (91.0 <= 92.5 - 1.2、つまり1.5秒速い)
      corner4Position: 2,
      cornerOuterCount: 1,
      weight: 480,
      jockey: "ルメール",
      odds: 1.8,
      prize: 2000
    }
  ]
};

const horseJraOddsDistortion: Horse = {
  id: "jra-h9",
  number: 12,
  frame: 6,
  name: "オッズディストーションヤミ",
  age: 4,
  gender: "牡",
  weight: 475,
  weightChange: 0,
  jockey: "岩田康誠",
  jockeyWeight: 57,
  trainer: "友道康夫（栗東）",
  owner: "歪みオーナー",
  sire: "ドゥラメンテ",
  dam: "ディストーションレディ",
  bms: "サンデーサイレンス",
  bloodline: "キングカメハメハ系",
  style: "差し",
  odds: 10.5, // 人気薄 (>= 8.0)
  popularity: 5,
  pastRaces: [
    {
      date: "2026-04-20",
      venue: "東京",
      raceName: "一般戦",
      raceClass: "OP",
      distance: 1600,
      surface: "芝",
      condition: "良",
      result: 1, // 前走1着（大勝）
      time: "1:31.0", // 91.0秒
      classBaseTime: 92.5, // 基準タイム 92.5秒 (91.0 <= 92.5 - 1.2、つまり1.5秒速い)
      corner4Position: 5,
      cornerOuterCount: 1,
      weight: 475,
      jockey: "デムーロ",
      odds: 5.5,
      prize: 2000
    }
  ]
};

const extraJraTestCases = [
  { horse: horseJraHillClimber, race: jraTurfNormal, desc: "① 勾配物理テスト（中山好走坂の鬼+15加点）" },
  { horse: horseJraFastCushion, race: jraTurfNormal, desc: "②-A 極限クッション値（超高速スピード適合+20加点）" },
  { horse: horseJraSoftCushion, race: { ...jraTurfNormal, cushionValue: 7.2 }, desc: "②-B 極限クッション値（重厚タフネス適合+20加点）" },
  { horse: horseJraIncidentRescue, race: jraTurfNormal, desc: "③-A 直線進路カット（不利度外視救済+25加点）" },
  { horse: horseJraOuterLoss, race: jraTurfNormal, desc: "③-B 走行軌跡（大外回し極大距離ロス補正+20加点）" },
  { horse: horseJraInnerFence, race: jraTurfNormal, desc: "④-A 仮柵ステージ（内移動Bコース・イン突き適合+20加点）" },
  { horse: horseJraOuterFence, race: { ...jraTurfNormal, temporaryFencePosition: "A" }, desc: "④-B 仮柵ステージ（仮柵Aステージ荒れ内馬場回避エッジ+15加点）" },
  { horse: horseJraTimeTrap, race: jraTurfNormal, desc: "⑤-A 時計の罠（前走超高速馬場恩恵による過剰人気割引-25減点）" },
  { horse: horseJraOddsDistortion, race: jraTurfNormal, desc: "⑤-B 期待値の歪み（高速時計実績に対する過小評価オッズ歪み適合+30加点 & distortionBoost*1.3）" }
];

extraJraTestCases.forEach(({ horse, race, desc }) => {
  console.log(`\n--------------------------------------------`);
  console.log(`テストケース: ${desc}`);
  console.log(`馬名: ${horse.name} (オッズ: ${horse.odds}, 枠: ${horse.frame})`);
  const prediction = calculateTsuchiyaScore(horse, race, [], { horses: {}, jockeys: {} });
  console.log(`ポテンシャルスコア: ${prediction.potential}`);
  console.log(`期待値の闇 (darkness): ${prediction.darkness}`);
  console.log(`付与された適性タグ (aptitudeTags):`);
  prediction.aptitudeTags?.forEach(tag => console.log(`  - ${tag}`));
});

console.log("\n=== 全テスト完了 ===");

