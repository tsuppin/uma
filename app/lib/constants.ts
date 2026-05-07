import { LearningPatch } from "../types";

// ==========================================
// 初期学習パッチ (ナレッジベースから抽出した理論 + 実績学習)
// ==========================================
export const INITIAL_PATCHES: LearningPatch[] = [
  {
    id: "initial_kasamatsu_power",
    version: "v1.0.base",
    date: "2026-05-01T00:00:00Z",
    description: "笠松：510kg以上の重量馬による砂の抵抗突破（理論値）",
    track: "笠松",
    adjustments: [
      { field: "weight", operator: ">=", value: 510, scoreAdjust: 25 }
    ],
    active: true
  },
  {
    id: "initial_kasamatsu_lightweight_cutoff",
    version: "v1.0.base",
    date: "2026-05-01T00:00:00Z",
    description: "笠松：430kg以下の軽量馬による物理的限界（理論値）",
    track: "笠松",
    adjustments: [
      { field: "weight", operator: "<=", value: 430, scoreAdjust: -35 }
    ],
    active: true
  },
  {
    id: "initial_jra_transfer_risk",
    version: "v1.0.base",
    date: "2026-05-01T00:00:00Z",
    description: "JRA転入初戦の砂適応リスク（理論値）",
    adjustments: [
      { field: "isTransferFirstRace", operator: "==", value: 1, scoreAdjust: -15 }
    ],
    active: true
  },
  // ==========================================
  // 実績学習パッチ（実際のレース結果から自動生成・永続化）
  // ==========================================
  {
    id: "patch_funabashi_heavy_horse_good",
    version: "v4.1",
    date: "2026-05-07T02:51:29.505Z",
    description: "船橋・良馬場：480kg以上の重量馬優位（ヤギリアイビス優勝実績より学習）",
    track: "船橋",
    condition: "良",
    adjustments: [
      { field: "weight", operator: ">=", value: 480, scoreAdjust: 10 }
    ],
    active: true
  },
];
