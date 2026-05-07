import { LearningPatch } from "../types";

// ==========================================
// 初期学習パッチ (ナレッジベースから抽出した理論 + 実績学習)
// ==========================================
export const INITIAL_PATCHES: LearningPatch[] = [
  // ==========================================
  // 【理論値】初期パッチ
  // ==========================================
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
  // 【実績学習】全場共通：複数競馬場で繰り返し確認された普遍パターン
  // 東京/京都/門別/大井/金沢/水沢で同一傾向 → 全場共通として格上げ
  // ==========================================
  {
    id: "learned_global_heavy_horse_bonus",
    version: "v14.0.consolidated",
    date: "2026-05-02T06:00:00Z",
    description: "【全場共通】480kg以上の重量馬優位（東京・京都・門別・大井・金沢・水沢で繰り返し確認）",
    adjustments: [
      { field: "weight", operator: ">=", value: 480, scoreAdjust: 10 }
    ],
    active: true
  },

  // ==========================================
  // 【実績学習】固有パッチ（全場共通と差別化できるもの）
  // ==========================================
  {
    id: "patch_funabashi_heavy_horse_good",
    version: "v4.1",
    date: "2026-05-07T02:51:29.505Z",
    description: "船橋・良馬場：480kg以上の重量馬優位（ヤギリアイビス優勝実績）",
    track: "船橋",
    condition: "良",
    adjustments: [
      { field: "weight", operator: ">=", value: 480, scoreAdjust: 10 }
    ],
    active: true
  },
  {
    id: "patch_kanazawa_good_weight_change",
    version: "v1.1",
    date: "2026-04-30T04:18:21.131Z",
    description: "金沢・良馬場：10kg以上増加した馬の成長加速（ファイヤーナイフ優勝実績）",
    track: "金沢",
    condition: "良",
    adjustments: [
      { field: "weightChange", operator: ">=", value: 10, scoreAdjust: 15 }
    ],
    active: true
  },
  {
    id: "patch_kanazawa_heavy_good",
    version: "v7.2",
    date: "2026-05-01T22:56:37.642Z",
    description: "金沢・重馬場：480kg以上の重量馬優位（アオイミモザ優勝実績）",
    track: "金沢",
    condition: "重",
    adjustments: [
      { field: "weight", operator: ">=", value: 480, scoreAdjust: 12 }
    ],
    active: true
  },
  {
    id: "patch_ooi_heavy_rain_horse",
    version: "v6.3.consolidated",
    date: "2026-05-01T22:22:59.120Z",
    description: "大井・不良馬場：480kg以上の重量馬優位（クアッズ・ワナハヴファン 2件確認）",
    track: "大井",
    condition: "不良",
    adjustments: [
      { field: "weight", operator: ">=", value: 480, scoreAdjust: 15 }
    ],
    active: true
  },
  {
    id: "patch_mizusawa_yaや_heavy",
    version: "v4.9",
    date: "2026-04-30T10:53:27.357Z",
    description: "水沢・稍重：480kg以上の重量馬優位（マサノビジョン優勝実績）",
    track: "水沢",
    condition: "稍重",
    adjustments: [
      { field: "weight", operator: ">=", value: 480, scoreAdjust: 10 }
    ],
    active: true
  },
];
