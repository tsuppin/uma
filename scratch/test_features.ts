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

console.log("\n=== 全テスト完了 ===");
