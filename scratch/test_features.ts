import { parseJRAText } from "../app/lib/parser";
import { calculateTsuchiyaScore } from "../app/lib/engine";
import { Horse, Race, LearningPatch, MasterData } from "../app/types";

// ==========================================
// テスト用データ準備
// ==========================================

const jraTextSample = `
3回京都6日 11R
芝1600m
良

枠 1
1
サトノフェンサー
サトノレーシング
ノーザンファーム
国枝栄（美東）
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

南W 良 65.5-50.2-36.5-11.2
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
手塚貴久（美東）
父：ハーツクライ
母：サクラプレジデント
(母の父：プレジデント)
12.5
5番人気
504kg
(-12)
牡3/黒鹿毛
57.0kg
ルメール

坂路 良 52.1-12.0
【A】

2026年5月10日 京都
都大路ステークス
1勝クラス
3着 12頭 6番
5番人気
戸崎圭太 57.0kg
芝1600
1:33.7
良
504kg
3-3
3F 34.0
サトノフェンサー(0.2)

枠 3
3
ピョイットハレルヤ
ハレルヤクラブ
ヤナガワ牧場
矢作芳人（栗東）
父：キタサンブラック
母：ピョイット
(母の父：キングカメハメハ)
35.4
8番人気
458kg
(+2)
牝3/栗毛
55.0kg
戸崎圭太

坂路 良 56.1-13.0
【B】

2026年5月10日 京都
都大路ステークス
1勝クラス
5着 12頭 8番
8番人気
ルメール 57.0kg
芝1600
1:34.0
良
458kg
5-5
3F 34.3
サトノフェンサー(0.5)
`;

console.log("=== JRAテキスト解析テスト開始 ===");
const parsedRace = parseJRAText(jraTextSample);
console.log(`解析された競馬場: ${parsedRace.venue}`);
console.log(`解析されたレース番号: ${parsedRace.raceNumber}`);
console.log(`解析された馬の頭数: ${parsedRace.horses.length}`);

// レース情報を組み立てる
const race: Race = {
  id: "test-race-id",
  date: "2026-05-20",
  venue: parsedRace.venue || "京都",
  raceNumber: parsedRace.raceNumber || 11,
  raceName: parsedRace.raceName || "都大路ステークス(重賞)", // 重賞/特別フラグを検証するため
  distance: parsedRace.distance || 1600,
  surface: parsedRace.surface || "芝",
  condition: parsedRace.condition || "良",
  headCount: parsedRace.horses.length,
  trackName: parsedRace.venue as any || "京都",
  horses: parsedRace.horses as Horse[]
};

const learningPatches: LearningPatch[] = [];
const masterData: MasterData = {
  horses: {},
  jockeys: {}
};

console.log("\n=== 予測エンジン（スコアリング）テスト開始 ===");
race.horses.forEach(horse => {
  console.log(`\n--------------------------------------------`);
  console.log(`馬名: ${horse.name}`);
  console.log(`調教タイム: ${horse.trainingTime}`);
  console.log(`調教評価: ${horse.trainingRating}`);
  console.log(`生産者: ${horse.breeder}`);
  console.log(`騎手: ${horse.jockey}`);
  console.log(`前走騎手: ${horse.pastRaces[0]?.jockey}`);

  const prediction = calculateTsuchiyaScore(horse, race, learningPatches, masterData);
  console.log(`ポテンシャルスコア: ${prediction.potential}`);
  console.log(`付与された適性タグ (aptitudeTags):`);
  prediction.aptitudeTags?.forEach(tag => console.log(`  - ${tag}`));
});

console.log("\n=== テスト完了 ===");
