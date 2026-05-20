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

console.log("\n=== テスト完了 ===");
