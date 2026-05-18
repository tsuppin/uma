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
  {
    id: "patch_1778809055791",
    version: "v12.1",
    date: "2026-05-15T01:37:35.791Z",
    description: "盛岡 - 勝ち馬(クイーンカード)の特性学習",
    track: "盛岡",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      }
    ],
    active: true
  },
  {
    id: "patch_1778822133641",
    version: "v44.1",
    date: "2026-05-15T05:15:33.641Z",
    description: "笠松 - 好走馬(キタノアンシェル等)の特性学習",
    track: "笠松",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "黒鹿毛",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ロジャーバローズ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        "operator": "<=",
        "value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "明星晴",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ホークビル",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778834476597",
    version: "v45.1",
    date: "2026-05-15T08:41:16.597Z",
    description: "門別 - 好走馬(クールカグラ等)の特性学習",
    track: "門別",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "青鹿毛",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "シャンハイボビー",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778834517246",
    version: "v46.1",
    date: "2026-05-15T08:41:57.246Z",
    description: "門別 - 好走馬(ブライトホウショウ等)の特性学習",
    track: "門別",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": "<=",
        "value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "石川倭",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "アジアエクスプレス",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778834729835",
    version: "v47.1",
    date: "2026-05-15T08:45:29.835Z",
    description: "門別 - 好走馬(アーススカーレット等)の特性学習",
    track: "門別",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        "operator": ">=",
        "value": 8,
        "scoreAdjust": 20
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "坂下秀",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ダイワメジャー",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "黒鹿毛",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "レーヴミストラル",
        "scoreAdjust": 15
      },
      {
        "field": "weightChange",
        "operator": ">=",
        "value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "小野楓",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "シュヴァルグラン",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778834777575",
    version: "v48.1",
    date: "2026-05-15T08:46:17.575Z",
    description: "門別 - 好走馬(スイレンチャン等)の特性学習",
    track: "門別",
    condition: "良",
    adjustments: [
      {
        "field": "jockey",
        "operator": "includes",
        "value": "小野楓",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ラブリーデイ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778841887566",
    version: "v16.1",
    date: "2026-05-15T10:44:47.566Z",
    description: "笠松 - 好走馬(リックカリーナ等)の特性学習",
    track: "笠松",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": "<=",
        "value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "(-)",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ロゴタイプ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778841950299",
    version: "v17.1",
    date: "2026-05-15T10:45:50.299Z",
    description: "笠松 - 好走馬(ユイノサシガネ等)の特性学習",
    track: "笠松",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "塚本征",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "アルアイン",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778841984685",
    version: "v18.1",
    date: "2026-05-15T10:46:24.685Z",
    description: "笠松 - 好走馬(シャルメイビス等)の特性学習",
    track: "笠松",
    condition: "良",
    adjustments: [
      {
        "field": "weightChange",
        "operator": ">=",
        "value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "大畑慧",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ハービンジャー",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778842496207",
    version: "v19.1",
    date: "2026-05-15T10:54:56.207Z",
    description: "笠松 - 好走馬(ヒロノラファール等)の特性学習",
    track: "笠松",
    condition: "良",
    adjustments: [
      {
        "field": "jockey",
        "operator": "includes",
        "value": "加藤聡",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "モズアスコット",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "高木健",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ノヴェリスト",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "向山牧",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "コパノリッキー",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778842531663",
    version: "v20.1",
    date: "2026-05-15T10:55:31.663Z",
    description: "笠松 - 好走馬(シュネルカガ等)の特性学習",
    track: "笠松",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "黒鹿毛",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "シゲルカガ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "アメリカンペイトリ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778842568488",
    version: "v21.1",
    date: "2026-05-15T10:56:08.488Z",
    description: "笠松 - 好走馬(ジャスタパーティー等)の特性学習",
    track: "笠松",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "黒鹿毛",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "モーリス",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "井口裕",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ヤマカツエース",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778842611274",
    version: "v22.1",
    date: "2026-05-15T10:56:51.274Z",
    description: "笠松 - 好走馬(ゴージャスレディ等)の特性学習",
    track: "笠松",
    condition: "良",
    adjustments: [
      {
        "field": "jockey",
        "operator": "includes",
        "value": "藤原幹",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "パイロ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        "operator": "<=",
        "value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "高木健",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "アジアエクスプレス",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778842643140",
    version: "v23.1",
    date: "2026-05-15T10:57:23.140Z",
    description: "笠松 - 好走馬(エイシンソロモン等)の特性学習",
    track: "笠松",
    condition: "良",
    adjustments: [
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "森島貴",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "アルアイン",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778842680003",
    version: "v24.1",
    date: "2026-05-15T10:58:00.003Z",
    description: "笠松 - 好走馬(ヒルノブリスベン等)の特性学習",
    track: "笠松",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": "<=",
        "value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "明星晴",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ブリックスアンドモ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "馬渕繁",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "リアルインパクト",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778846188294",
    version: "v58.1",
    date: "2026-05-15T11:56:28.294Z",
    description: "川崎 - 好走馬(ハーバーショー等)の特性学習",
    track: "川崎",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "黒鹿毛",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ルヴァンスレーヴ",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "和田譲",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "アメリカンペイトリ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778846294019",
    version: "v59.1",
    date: "2026-05-15T11:58:14.019Z",
    description: "川崎 - 好走馬(ルリール等)の特性学習",
    track: "川崎",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": "<=",
        "value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "新原周",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ディープブリランテ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "本田紀",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "エピカリス",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778847400743",
    version: "v60.1",
    date: "2026-05-15T12:16:40.743Z",
    description: "川崎 - 好走馬(エレファントラン等)の特性学習",
    track: "川崎",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "御神訓",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ニューイヤーズデイ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "黒鹿毛",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "フリオーソ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "新原周",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ハービンジャー",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778847444854",
    version: "v61.1",
    date: "2026-05-15T12:17:24.855Z",
    description: "川崎 - 好走馬(ノーブルゲイル等)の特性学習",
    track: "川崎",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "和田譲",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ロージズインメイ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778847490909",
    version: "v62.1",
    date: "2026-05-15T12:18:10.909Z",
    description: "川崎 - 好走馬(ピンクタオルチャン等)の特性学習",
    track: "川崎",
    condition: "良",
    adjustments: [
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "笹川翼",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "トビーズコーナー",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "黒鹿毛",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ダノンレジェンド",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "エスポワールシチー",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778848107053",
    version: "v63.1",
    date: "2026-05-15T12:28:27.054Z",
    description: "園田 - 好走馬(スナークユウマ等)の特性学習",
    track: "園田",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "井上幹",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "コパノリッキー",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        "operator": "<=",
        "value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "永井孝",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ネオユニヴァース",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778848154886",
    version: "v64.1",
    date: "2026-05-15T12:29:14.886Z",
    description: "園田 - 好走馬(エイシンリール等)の特性学習",
    track: "園田",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": "<=",
        "value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "大山真",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "バンブーエール",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "西啓太",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "トゥザワールド",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778887729675",
    version: "v32.1",
    date: "2026-05-15T23:28:49.675Z",
    description: "笠松 - 好走馬(ウィルソンウェイ等)の特性学習",
    track: "笠松",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "渡邊竜",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "タリスマニック",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778887870694",
    version: "v33.1",
    date: "2026-05-15T23:31:10.694Z",
    description: "笠松 - 好走馬(ジョリーメモリー等)の特性学習",
    track: "笠松",
    condition: "良",
    adjustments: [
      {
        "field": "jockey",
        "operator": "includes",
        "value": "馬渕繁",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "リアルインパクト",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778904456322",
    version: "v67.1",
    date: "2026-05-16T04:07:36.322Z",
    description: "川崎 - 好走馬(エレファントラン等)の特性学習",
    track: "川崎",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "御神訓",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ニューイヤーズデイ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "黒鹿毛",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "フリオーソ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "新原周",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ハービンジャー",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778907012631",
    version: "v68.1",
    date: "2026-05-16T04:50:12.631Z",
    description: "東京 - 好走馬(オーシャンステラ等)の特性学習",
    track: "東京",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": "<=",
        "value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "横山 武史",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "佐藤 翔馬",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ナダル",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "吉田 豊",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778925371312",
    version: "v69.1",
    date: "2026-05-16T09:56:11.312Z",
    description: "東京 - 好走馬(チギリ等)の特性学習",
    track: "東京",
    condition: "良",
    adjustments: [
      {
        "field": "jockey",
        "operator": "includes",
        "value": "三浦 皇成",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "レッドファルクス",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "戸崎 圭太",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ドレフォン",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "津村 明秀",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778925452959",
    version: "v70.1",
    date: "2026-05-16T09:57:32.959Z",
    description: "東京 - 好走馬(キングスコール等)の特性学習",
    track: "東京",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "吉田 豊",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "佐々木 大輔",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ドレフォン",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "横山 武史",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778925613367",
    version: "v71.1",
    date: "2026-05-16T10:00:13.367Z",
    description: "東京 - 好走馬(メリディアンスター等)の特性学習",
    track: "東京",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "M.ディー",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "横山 和生",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "Exceedance",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "戸崎 圭太",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778925678181",
    version: "v72.1",
    date: "2026-05-16T10:01:18.181Z",
    description: "京都 - 好走馬(レッドラージャ等)の特性学習",
    track: "京都",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "坂井 瑠星",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "高杉 吏麒",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "サートゥルナーリア",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778928219288",
    version: "v73.1",
    date: "2026-05-16T10:43:39.288Z",
    description: "東京 - 好走馬(オーシャンステラ等)の特性学習",
    track: "東京",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": "<=",
        "value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "横山 武史",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "佐藤 翔馬",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ナダル",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "吉田 豊",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778928337767",
    version: "v74.1",
    date: "2026-05-16T10:45:37.767Z",
    description: "東京 - 好走馬(ターフクリスタル等)の特性学習",
    track: "東京",
    condition: "良",
    adjustments: [
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "江田 照男",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "戸崎 圭太",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778928380020",
    version: "v75.1",
    date: "2026-05-16T10:46:20.020Z",
    description: "東京 - 好走馬(アヴァランチ等)の特性学習",
    track: "東京",
    condition: "良",
    adjustments: [
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "三浦 皇成",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "マジェスティックウォリアー",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "原 優介",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778928421419",
    version: "v76.1",
    date: "2026-05-16T10:47:01.419Z",
    description: "東京 - 好走馬(カンティーナ等)の特性学習",
    track: "東京",
    condition: "良",
    adjustments: [
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "大野 拓弥",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "シルバーステート",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        "operator": "<=",
        "value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "D.レーン",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "津村 明秀",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778928480175",
    version: "v77.1",
    date: "2026-05-16T10:48:00.175Z",
    description: "東京 - 好走馬(エラルディーク等)の特性学習",
    track: "東京",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "横山 武史",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "佐々木 大輔",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "サングレーザー",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778928571565",
    version: "v78.1",
    date: "2026-05-16T10:49:31.565Z",
    description: "東京 - 好走馬(マジョレルブルー等)の特性学習",
    track: "東京",
    condition: "良",
    adjustments: [
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "戸崎 圭太",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "原 優介",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778928619655",
    version: "v79.1",
    date: "2026-05-16T10:50:19.655Z",
    description: "東京 - 好走馬(ショーリバース等)の特性学習",
    track: "東京",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "横山 和生",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "フォーウィールドライブ",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "三浦 皇成",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778928691626",
    version: "v80.1",
    date: "2026-05-16T10:51:31.626Z",
    description: "東京 - 好走馬(ノアヴィヴァーチェ等)の特性学習",
    track: "東京",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "木幡 巧也",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "モーニン",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "北村 宏司",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "モーリス",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778928750770",
    version: "v81.1",
    date: "2026-05-16T10:52:30.770Z",
    description: "東京 - 好走馬(シャンソンドール等)の特性学習",
    track: "東京",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "D.レーン",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        "operator": "<=",
        "value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "松岡 正海",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "リアルインパクト",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778928800212",
    version: "v82.1",
    date: "2026-05-16T10:53:20.212Z",
    description: "東京 - 好走馬(メリディアンスター等)の特性学習",
    track: "東京",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "M.ディー",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "横山 和生",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "Exceedance",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "戸崎 圭太",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778929925618",
    version: "v83.1",
    date: "2026-05-16T11:12:05.618Z",
    description: "新潟 - 好走馬(バレエマスター等)の特性学習",
    track: "新潟",
    condition: "良",
    adjustments: [
      {
        "field": "jockey",
        "operator": "includes",
        "value": "菊沢 一樹",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "スピルバーグ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "F.ゴンサルベス",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ウインブライト",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778929972050",
    version: "v84.1",
    date: "2026-05-16T11:12:52.050Z",
    description: "京都 - 好走馬(ルージュバロン等)の特性学習",
    track: "京都",
    condition: "良",
    adjustments: [
      {
        "field": "weightChange",
        "operator": "<=",
        "value": -10,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "坂井 瑠星",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        "operator": "<=",
        "value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "鮫島 良太",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "秋山 稔樹",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ダノンレジェンド",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778930019383",
    version: "v85.1",
    date: "2026-05-16T11:13:39.383Z",
    description: "京都 - 好走馬(ゴールドコット等)の特性学習",
    track: "京都",
    condition: "良",
    adjustments: [
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "角田 大和",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "高杉 吏麒",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "太宰 啓介",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ホッコータルマエ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778930075175",
    version: "v86.1",
    date: "2026-05-16T11:14:35.175Z",
    description: "京都 - 好走馬(キシャール等)の特性学習",
    track: "京都",
    condition: "良",
    adjustments: [
      {
        "field": "weightChange",
        "operator": ">=",
        "value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "高杉 吏麒",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ダノンプレミアム",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "幸 英明",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "イスラボニータ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778930134232",
    version: "v87.1",
    date: "2026-05-16T11:15:34.232Z",
    description: "京都 - 好走馬(サトノビダーヤ等)の特性学習",
    track: "京都",
    condition: "良",
    adjustments: [
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "酒井 学",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "サトノジェネシス",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "松山 弘平",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778930272027",
    version: "v88.1",
    date: "2026-05-16T11:17:52.027Z",
    description: "京都 - 好走馬(ロサルゴサ等)の特性学習",
    track: "京都",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "weightChange",
        "operator": "<=",
        "value": -10,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "団野 大成",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "森田 誠也",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "リオンディーズ",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "松山 弘平",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "コントレイル",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778930328681",
    version: "v89.1",
    date: "2026-05-16T11:18:48.681Z",
    description: "京都 - 好走馬(ニホンピロカラット等)の特性学習",
    track: "京都",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "田口 貫太",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "サトノダイヤモンド",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "岩田 望来",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778930393398",
    version: "v90.1",
    date: "2026-05-16T11:19:53.398Z",
    description: "京都 - 好走馬(コルドンブルー等)の特性学習",
    track: "京都",
    condition: "良",
    adjustments: [
      {
        "field": "jockey",
        "operator": "includes",
        "value": "岩田 望来",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "坂井 瑠星",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "松若 風馬",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ミッキーグローリー",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778930463801",
    version: "v91.1",
    date: "2026-05-16T11:21:03.801Z",
    description: "京都 - 好走馬(シホノスペランツァ等)の特性学習",
    track: "京都",
    condition: "良",
    adjustments: [
      {
        "field": "jockey",
        "operator": "includes",
        "value": "高田 潤",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ブラックタイド",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "大江原 圭",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ゴールドシップ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778930511016",
    version: "v92.1",
    date: "2026-05-16T11:21:51.016Z",
    description: "京都 - 好走馬(レッドラージャ等)の特性学習",
    track: "京都",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "坂井 瑠星",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778930580723",
    version: "v93.1",
    date: "2026-05-16T11:23:00.723Z",
    description: "京都 - 好走馬(ヒルノハンブルク等)の特性学習",
    track: "京都",
    condition: "良",
    adjustments: [
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "松山 弘平",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778930629417",
    version: "v94.1",
    date: "2026-05-16T11:23:49.417Z",
    description: "京都 - 好走馬(フリッカージャブ等)の特性学習",
    track: "京都",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "松山 弘平",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "鮫島 克駿",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "タリスマニック",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "団野 大成",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778930680470",
    version: "v95.1",
    date: "2026-05-16T11:24:40.470Z",
    description: "京都 - 好走馬(ライトニングゼウス等)の特性学習",
    track: "京都",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "川田 将雅",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ダンカーク",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "田口 貫太",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "フォーウィールドライブ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778930730538",
    version: "v96.1",
    date: "2026-05-16T11:25:30.538Z",
    description: "京都 - 好走馬(ライトニングゼウス等)の特性学習",
    track: "京都",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "川田 将雅",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ダンカーク",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "田口 貫太",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "フォーウィールドライブ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778930784441",
    version: "v97.1",
    date: "2026-05-16T11:26:24.441Z",
    description: "京都 - 好走馬(ライトニングゼウス等)の特性学習",
    track: "京都",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "川田 将雅",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ダンカーク",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "田口 貫太",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "フォーウィールドライブ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778930836558",
    version: "v98.1",
    date: "2026-05-16T11:27:16.558Z",
    description: "新潟 - 好走馬(サンタアニタ等)の特性学習",
    track: "新潟",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "斎藤 新",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ナダル",
        "scoreAdjust": 15
      },
      {
        "field": "weightChange",
        "operator": ">=",
        "value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "C.ルメール",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "サートゥルナーリア",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778930890778",
    version: "v99.1",
    date: "2026-05-16T11:28:10.778Z",
    description: "新潟 - 好走馬(バレエマスター等)の特性学習",
    track: "新潟",
    condition: "良",
    adjustments: [
      {
        "field": "jockey",
        "operator": "includes",
        "value": "菊沢 一樹",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "スピルバーグ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "F.ゴンサルベス",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ウインブライト",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778930936730",
    version: "v100.1",
    date: "2026-05-16T11:28:56.730Z",
    description: "新潟 - 好走馬(アークドール等)の特性学習",
    track: "新潟",
    condition: "良",
    adjustments: [
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "武 豊",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "吉田 隼人",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778930982727",
    version: "v101.1",
    date: "2026-05-16T11:29:42.727Z",
    description: "新潟 - 好走馬(ルールーリマ等)の特性学習",
    track: "新潟",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": "<=",
        "value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "C.ルメール",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "荻野 極",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778931034757",
    version: "v102.1",
    date: "2026-05-16T11:30:34.757Z",
    description: "新潟 - 好走馬(ファルコンミノル等)の特性学習",
    track: "新潟",
    condition: "良",
    adjustments: [
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "C.ルメール",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ゴールドシップ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        "operator": "<=",
        "value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "柴田 裕一郎",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "キズナ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "西村 淳也",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778931118745",
    version: "v103.1",
    date: "2026-05-16T11:31:58.745Z",
    description: "川崎 - 好走馬(アファーマティヴ等)の特性学習",
    track: "川崎",
    condition: "良",
    adjustments: [
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "加藤雄",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "キセキ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "古岡勇",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "アメリカンペイトリ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778931177908",
    version: "v104.1",
    date: "2026-05-16T11:32:57.908Z",
    description: "川崎 - 好走馬(ブエンディア等)の特性学習",
    track: "川崎",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": "<=",
        "value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "(-)",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "モーニン",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ホットロッドチャー",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778931229422",
    version: "v105.1",
    date: "2026-05-16T11:33:49.422Z",
    description: "川崎 - 好走馬(ブラフキャッチ等)の特性学習",
    track: "川崎",
    condition: "良",
    adjustments: [
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "(-)",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "モズアスコット",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "シュヴァルグラン",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        "operator": "<=",
        "value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "パイロ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778931285325",
    version: "v106.1",
    date: "2026-05-16T11:34:45.325Z",
    description: "笠松 - 好走馬(ヒロノラファール等)の特性学習",
    track: "笠松",
    condition: "良",
    adjustments: [
      {
        "field": "jockey",
        "operator": "includes",
        "value": "加藤聡",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "モズアスコット",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "高木健",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ノヴェリスト",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "向山牧",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "コパノリッキー",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778985036461",
    version: "v74.1",
    date: "2026-05-17T02:30:36.461Z",
    description: "東京 - 好走馬(オーシャンステラ等)の特性学習",
    track: "東京",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": "<=",
        "value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "横山 武史",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "佐藤 翔馬",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ナダル",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "吉田 豊",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778985101240",
    version: "v75.1",
    date: "2026-05-17T02:31:41.240Z",
    description: "東京 - 好走馬(ターフクリスタル等)の特性学習",
    track: "東京",
    condition: "良",
    adjustments: [
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "江田 照男",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "戸崎 圭太",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778985194125",
    version: "v76.1",
    date: "2026-05-17T02:33:14.125Z",
    description: "東京 - 好走馬(アヴァランチ等)の特性学習",
    track: "東京",
    condition: "良",
    adjustments: [
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "三浦 皇成",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "マジェスティックウォリアー",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "原 優介",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778985279835",
    version: "v77.1",
    date: "2026-05-17T02:34:39.835Z",
    description: "東京 - 好走馬(カンティーナ等)の特性学習",
    track: "東京",
    condition: "良",
    adjustments: [
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "大野 拓弥",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "シルバーステート",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        "operator": "<=",
        "value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "D.レーン",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778985381271",
    version: "v78.1",
    date: "2026-05-17T02:36:21.271Z",
    description: "帯広ば - 好走馬(ツナノタチヤマ等)の特性学習",
    track: "帯広ば",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "島津新",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ヒノデタイガー",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "赤塚健",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "マルニセンプー",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778985513313",
    version: "v79.1",
    date: "2026-05-17T02:38:33.313Z",
    description: "帯広ば - 好走馬(クリスタルソウル等)の特性学習",
    track: "帯広ば",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "(-)",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "コウシュハウンカイ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ホクショウユヅル",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "レットダイヤ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778989672917",
    version: "v80.1",
    date: "2026-05-17T03:47:52.917Z",
    description: "東京 - 好走馬(ミライヘノティアラ等)の特性学習",
    track: "東京",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "北村 宏司",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "サートゥルナーリア",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "M.ディー",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ノーブルミッション",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "F.ゴンサルベス",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ホークビル",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778990568061",
    version: "v114.1",
    date: "2026-05-17T04:02:48.061Z",
    description: "京都 - 好走馬(ルージュバロン等)の特性学習",
    track: "京都",
    condition: "良",
    adjustments: [
      {
        "field": "weightChange",
        "operator": "<=",
        "value": -10,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "坂井 瑠星",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        "operator": "<=",
        "value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "鮫島 良太",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "秋山 稔樹",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ダノンレジェンド",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778990630553",
    version: "v115.1",
    date: "2026-05-17T04:03:50.553Z",
    description: "京都 - 好走馬(ゴールドコット等)の特性学習",
    track: "京都",
    condition: "良",
    adjustments: [
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "角田 大和",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "高杉 吏麒",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "太宰 啓介",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ホッコータルマエ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778990689051",
    version: "v116.1",
    date: "2026-05-17T04:04:49.051Z",
    description: "京都 - 好走馬(タナブイハチターボ等)の特性学習",
    track: "京都",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "幸 英明",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "イスラボニータ",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "吉村 誠之助",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "キタサンブラック",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778990830392",
    version: "v117.1",
    date: "2026-05-17T04:07:10.392Z",
    description: "佐賀 - 好走馬(イッペイソツ等)の特性学習",
    track: "佐賀",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "山口勲",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ホッコータルマエ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "川島拓",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "リオンディーズ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778991018404",
    version: "v118.1",
    date: "2026-05-17T04:10:18.404Z",
    description: "高知 - 好走馬(レアルシチー等)の特性学習",
    track: "高知",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "岡村卓",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "アルアイン",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778991075982",
    version: "v119.1",
    date: "2026-05-17T04:11:15.982Z",
    description: "高知 - 好走馬(ハードボイルド等)の特性学習",
    track: "高知",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "近藤翔",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ディーマジェスティ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778991118994",
    version: "v120.1",
    date: "2026-05-17T04:11:58.994Z",
    description: "高知 - 好走馬(コスモルーテウス等)の特性学習",
    track: "高知",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "妹尾浩",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ロージズインメイ",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "黒鹿毛",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "サトノクラウン",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778991166614",
    version: "v121.1",
    date: "2026-05-17T04:12:46.614Z",
    description: "高知 - 好走馬(ジョウショーボビー等)の特性学習",
    track: "高知",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "青鹿毛",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "シャンハイボビー",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778991213032",
    version: "v122.1",
    date: "2026-05-17T04:13:33.032Z",
    description: "高知 - 好走馬(スピードソルジャー等)の特性学習",
    track: "高知",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "宮川実",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ドレフォン",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "黒鹿毛",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "バンドワゴン",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "妹尾浩",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "リオンディーズ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778991273018",
    version: "v123.1",
    date: "2026-05-17T04:14:33.018Z",
    description: "高知 - 好走馬(クリノドラゴン等)の特性学習",
    track: "高知",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        "operator": ">=",
        "value": 8,
        "scoreAdjust": 20
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "岡遼太",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "アスカクリチャン",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778991315674",
    version: "v124.1",
    date: "2026-05-17T04:15:15.674Z",
    description: "高知 - 好走馬(リケアマキアート等)の特性学習",
    track: "高知",
    condition: "良",
    adjustments: [
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "近藤翔",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "リアルスティール",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "岡遼太",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "オルフェーヴル",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778991385022",
    version: "v125.1",
    date: "2026-05-17T04:16:25.022Z",
    description: "高知 - 好走馬(トップアメリカン等)の特性学習",
    track: "高知",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "黒鹿毛",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "アメリカンペイトリ",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "上田将",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ダイワメジャー",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778991421565",
    version: "v126.1",
    date: "2026-05-17T04:17:01.565Z",
    description: "高知 - 好走馬(バイユーラン等)の特性学習",
    track: "高知",
    condition: "良",
    adjustments: [
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "城野慈",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "シャンハイボビー",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778991478462",
    version: "v127.1",
    date: "2026-05-17T04:17:58.462Z",
    description: "高知 - 好走馬(ビーム等)の特性学習",
    track: "高知",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "赤岡修",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "グレーターロンドン",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "山崎雅",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "サトノアラジン",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778991513959",
    version: "v128.1",
    date: "2026-05-17T04:18:33.959Z",
    description: "高知 - 好走馬(ヒデノブルースカイ等)の特性学習",
    track: "高知",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": "<=",
        "value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "岡村卓",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ナダル",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "黒鹿毛",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ブリックスアンドモ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "石本純",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "エピファネイア",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778991615911",
    version: "v129.1",
    date: "2026-05-17T04:20:15.911Z",
    description: "佐賀 - 好走馬(バージャンフォース等)の特性学習",
    track: "佐賀",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "金山昇",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ロードカナロア",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778991666084",
    version: "v130.1",
    date: "2026-05-17T04:21:06.084Z",
    description: "佐賀 - 好走馬(タイショウロマン等)の特性学習",
    track: "佐賀",
    condition: "良",
    adjustments: [
      {
        "field": "jockey",
        "operator": "includes",
        "value": "青海大",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ゴールドシップ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778991698928",
    version: "v131.1",
    date: "2026-05-17T04:21:38.928Z",
    description: "佐賀 - 好走馬(クラウンライジング等)の特性学習",
    track: "佐賀",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "田中直",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "トランセンド",
        "scoreAdjust": 15
      },
      {
        "field": "weightChange",
        "operator": ">=",
        "value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "中山蓮",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "アメリカンペイトリ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778991732198",
    version: "v132.1",
    date: "2026-05-17T04:22:12.198Z",
    description: "佐賀 - 好走馬(ヘルト等)の特性学習",
    track: "佐賀",
    condition: "良",
    adjustments: [
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "石川慎",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ブリックスアンドモ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        "operator": "<=",
        "value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "金山昇",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "リアルスティール",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778991771862",
    version: "v133.1",
    date: "2026-05-17T04:22:51.862Z",
    description: "佐賀 - 好走馬(アスタイクウス等)の特性学習",
    track: "佐賀",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "山口勲",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "タワーオブロンドン",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778991807384",
    version: "v134.1",
    date: "2026-05-17T04:23:27.384Z",
    description: "佐賀 - 好走馬(ロッソ等)の特性学習",
    track: "佐賀",
    condition: "良",
    adjustments: [
      {
        "field": "jockey",
        "operator": "includes",
        "value": "林悠翔",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "トーセンラー",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "中山蓮",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ジョーカプチーノ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778991843289",
    version: "v135.1",
    date: "2026-05-17T04:24:03.289Z",
    description: "佐賀 - 好走馬(シズリ等)の特性学習",
    track: "佐賀",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": "<=",
        "value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "石川慎",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "マクフィ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "金山昇",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "スクワートルスクワ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778991899938",
    version: "v136.1",
    date: "2026-05-17T04:24:59.938Z",
    description: "佐賀 - 好走馬(チャンピオンヤマト等)の特性学習",
    track: "佐賀",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "黒鹿毛",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "エイシンフラッシュ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "田中直",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ビッグアーサー",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779066100909",
    version: "v106.1",
    date: "2026-05-18T01:01:40.909Z",
    description: "笠松 - 好走馬(オレンタノ等)の特性学習",
    track: "笠松",
    condition: "良",
    adjustments: [
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "筒井勇",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ケープブランコ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779066153799",
    version: "v107.1",
    date: "2026-05-18T01:02:33.799Z",
    description: "金沢 - 好走馬(エムティパル等)の特性学習",
    track: "金沢",
    condition: "良",
    adjustments: [
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "吉田晃",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ディーマジェスティ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "松戸政",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ロジャーバローズ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779066464884",
    version: "v108.1",
    date: "2026-05-18T01:07:44.884Z",
    description: "京都 - 好走馬(タガノアラリア等)の特性学習",
    track: "京都",
    condition: "良",
    adjustments: [
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "鮫島 克駿",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ミスターメロディ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "M.デムーロ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "レイデオロ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779066541755",
    version: "v109.1",
    date: "2026-05-18T01:09:01.755Z",
    description: "京都 - 好走馬(コンジェスタス等)の特性学習",
    track: "京都",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "西村 淳也",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "コントレイル",
        "scoreAdjust": 15
      },
      {
        "field": "weightChange",
        "operator": "<=",
        "value": -10,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "池添 謙一",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "サトノアラジン",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779066638255",
    version: "v110.1",
    date: "2026-05-18T01:10:38.255Z",
    description: "京都 - 好走馬(コンジェスタス等)の特性学習",
    track: "京都",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "西村 淳也",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "コントレイル",
        "scoreAdjust": 15
      },
      {
        "field": "weightChange",
        "operator": "<=",
        "value": -10,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "池添 謙一",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "サトノアラジン",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779067730914",
    version: "v111.1",
    date: "2026-05-18T01:28:50.914Z",
    description: "東京 - 好走馬(ドンエレクトス等)の特性学習",
    track: "東京",
    condition: "良",
    adjustments: [
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "荻野 極",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ダノンレジェンド",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "C.ルメール",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ロードカナロア",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779070351703",
    version: "v112.1",
    date: "2026-05-18T02:12:31.703Z",
    description: "京都 - 好走馬(コンジェスタス等)の特性学習",
    track: "京都",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "西村 淳也",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "コントレイル",
        "scoreAdjust": 15
      },
      {
        "field": "weightChange",
        "operator": "<=",
        "value": -10,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "池添 謙一",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "サトノアラジン",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779070415440",
    version: "v113.1",
    date: "2026-05-18T02:13:35.440Z",
    description: "東京 - 好走馬(ドンエレクトス等)の特性学習",
    track: "東京",
    condition: "良",
    adjustments: [
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "荻野 極",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ダノンレジェンド",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "C.ルメール",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ロードカナロア",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779074848502",
    version: "v145.1",
    date: "2026-05-18T03:27:28.502Z",
    description: "新潟 - 好走馬(スーパーバイザー等)の特性学習",
    track: "新潟",
    condition: "良",
    adjustments: [
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "菊沢 一樹",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ルーラーシップ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        "operator": "<=",
        "value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "伊藤 工真",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ニューイヤーズデイ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779074904822",
    version: "v146.1",
    date: "2026-05-18T03:28:24.822Z",
    description: "新潟 - 好走馬(エストゥペンダ等)の特性学習",
    track: "新潟",
    condition: "良",
    adjustments: [
      {
        "field": "jockey",
        "operator": "includes",
        "value": "荻野 極",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "サートゥルナーリア",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "横山 琉人",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "サトノダイヤモンド",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779074972526",
    version: "v147.1",
    date: "2026-05-18T03:29:32.526Z",
    description: "新潟 - 好走馬(マリアイリダータ等)の特性学習",
    track: "新潟",
    condition: "良",
    adjustments: [
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "舟山 瑠泉",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ドゥラメンテ",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "丸田 恭介",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "エピファネイア",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779075357561",
    version: "v148.1",
    date: "2026-05-18T03:35:57.561Z",
    description: "新潟 - 好走馬(ラヴェンデル等)の特性学習",
    track: "新潟",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": "<=",
        "value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "斎藤 新",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "キンシャサノキセキ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "長浜 鴻緒",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "シルバーステート",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779075430858",
    version: "v149.1",
    date: "2026-05-18T03:37:10.858Z",
    description: "新潟 - 好走馬(ゴルデールスカー等)の特性学習",
    track: "新潟",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "舟山 瑠泉",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "モーリス",
        "scoreAdjust": 15
      },
      {
        "field": "weightChange",
        "operator": ">=",
        "value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "西塚 洸二",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ゴールドドリーム",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779075525913",
    version: "v150.1",
    date: "2026-05-18T03:38:45.913Z",
    description: "新潟 - 好走馬(ベネスピラ等)の特性学習",
    track: "新潟",
    condition: "良",
    adjustments: [
      {
        "field": "jockey",
        "operator": "includes",
        "value": "荻野 極",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "レイデオロ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "石川 裕紀人",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ゴールドシップ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        "operator": "<=",
        "value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "舟山 瑠泉",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ミッキーロケット",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779075616237",
    version: "v151.1",
    date: "2026-05-18T03:40:16.237Z",
    description: "新潟 - 好走馬(オーケーリアン等)の特性学習",
    track: "新潟",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": "<=",
        "value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "富田 暁",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ナダル",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "石神 深道",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "カリフォルニアクローム",
        "scoreAdjust": 15
      },
      {
        "field": "weightChange",
        "operator": "<=",
        "value": -10,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "横山 琉人",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "オルフェーヴル",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779075689684",
    version: "v152.1",
    date: "2026-05-18T03:41:29.684Z",
    description: "新潟 - 好走馬(ラップトップ等)の特性学習",
    track: "新潟",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": "<=",
        "value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "石神 深道",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "リオンリオン",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779075833712",
    version: "v153.1",
    date: "2026-05-18T03:43:53.712Z",
    description: "新潟 - 好走馬(マジンタクシー等)の特性学習",
    track: "新潟",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "吉田 隼人",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "マテラスカイ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "荻野 極",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ナダル",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779076034491",
    version: "v154.1",
    date: "2026-05-18T03:47:14.491Z",
    description: "新潟 - 好走馬(エタンセル等)の特性学習",
    track: "新潟",
    condition: "良",
    adjustments: [
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "小林 美駒",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ブリックスアンドモルタル",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779076085418",
    version: "v155.1",
    date: "2026-05-18T03:48:05.418Z",
    description: "帯広ば - 好走馬(イワキハルヒメ等)の特性学習",
    track: "帯広ば",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "weightChange",
        "operator": ">=",
        "value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "アサヒリュウセイ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "フナノクン",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779076130984",
    version: "v156.1",
    date: "2026-05-18T03:48:50.984Z",
    description: "帯広ば - 好走馬(ホクセイロイヤル等)の特性学習",
    track: "帯広ば",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "weightChange",
        "operator": ">=",
        "value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "フジダイビクトリー",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779076211603",
    version: "v157.1",
    date: "2026-05-18T03:50:11.603Z",
    description: "盛岡 - 好走馬(ジーティービート等)の特性学習",
    track: "盛岡",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "小林凌",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "サトノアラジン",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779076255937",
    version: "v158.1",
    date: "2026-05-18T03:50:55.937Z",
    description: "金沢 - 好走馬(ブレイブゼウス等)の特性学習",
    track: "金沢",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "青柳正",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "サクラゼウス",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "加藤翔",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "エスケンデレヤ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779076306607",
    version: "v159.1",
    date: "2026-05-18T03:51:46.607Z",
    description: "高知 - 好走馬(タルトポワール等)の特性学習",
    track: "高知",
    condition: "良",
    adjustments: [
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "岡遼太",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "モーニン",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "岡村卓",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ブリックスアンドモ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "山田貴",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "アジアエクスプレス",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779076347458",
    version: "v160.1",
    date: "2026-05-18T03:52:27.458Z",
    description: "佐賀 - 好走馬(キッサキ等)の特性学習",
    track: "佐賀",
    condition: "良",
    adjustments: [
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "出水拓",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ニシケンモノノフ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779076490880",
    version: "v161.1",
    date: "2026-05-18T03:54:50.880Z",
    description: "京都 - 好走馬(ヒラボクソライア等)の特性学習",
    track: "京都",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "角田 大和",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ドレフォン",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "中井 裕二",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ゴールドドリーム",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779076548625",
    version: "v162.1",
    date: "2026-05-18T03:55:48.625Z",
    description: "京都 - 好走馬(バレルターン等)の特性学習",
    track: "京都",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "国分 優作",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "リオンディーズ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "M.デムーロ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "スワーヴリチャード",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779087577837",
    version: "v163.1",
    date: "2026-05-18T06:59:37.837Z",
    description: "京都 - 好走馬(エンジェルボイス等)の特性学習",
    track: "京都",
    condition: "良",
    adjustments: [
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "佐々木 大輔",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "キズナ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "田口 貫太",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "リアルスティール",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779088509658",
    version: "v133.1",
    date: "2026-05-18T07:15:09.658Z",
    description: "京都 - 好走馬(ヴィスマール等)の特性学習",
    track: "京都",
    condition: "良",
    adjustments: [
      {
        "field": "jockey",
        "operator": "includes",
        "value": "西村 淳也",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ブリックスアンドモルタル",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        "operator": "<=",
        "value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "岩田 望来",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "サートゥルナーリア",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779101575795",
    version: "v165.1",
    date: "2026-05-18T10:52:55.795Z",
    description: "帯広ば - 好走馬(マツノゴウリキ等)の特性学習",
    track: "帯広ば",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "weightChange",
        "operator": ">=",
        "value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "大友一",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "マルニセンプー",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "臼杵龍",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "フナノクン",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779101638178",
    version: "v166.1",
    date: "2026-05-18T10:53:58.178Z",
    description: "帯広ば - 好走馬(クリスタルソリッド等)の特性学習",
    track: "帯広ば",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "weightChange",
        "operator": ">=",
        "value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "金田利",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "サクラダイチ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "今井千",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ホクショウメジャー",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779101687550",
    version: "v167.1",
    date: "2026-05-18T10:54:47.550Z",
    description: "帯広ば - 好走馬(ミスキャップ等)の特性学習",
    track: "帯広ば",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "weightChange",
        "operator": ">=",
        "value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "赤塚健",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "フクノカミカゼ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "今井千",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "コウシュハウンカイ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779101713925",
    version: "v168.1",
    date: "2026-05-18T10:55:13.925Z",
    description: "帯広ば - 好走馬(ホクセイキレイズキ等)の特性学習",
    track: "帯広ば",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "weightChange",
        "operator": ">=",
        "value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "鈴木恵",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ミタコトナイ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "菊池一",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ジェイワン",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779101739501",
    version: "v169.1",
    date: "2026-05-18T10:55:39.501Z",
    description: "帯広ば - 好走馬(スカイノチカラ等)の特性学習",
    track: "帯広ば",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "weightChange",
        "operator": ">=",
        "value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "赤塚健",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "フジダイビクトリー",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "鈴木恵",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "コウシュハウンカイ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "臼杵龍",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ジェイワン",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779101762230",
    version: "v170.1",
    date: "2026-05-18T10:56:02.230Z",
    description: "帯広ば - 好走馬(ホクセイビックボス等)の特性学習",
    track: "帯広ば",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "weightChange",
        "operator": ">=",
        "value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "島津新",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "インフィニティー",
        "scoreAdjust": 15
      },
      {
        "field": "age",
        "operator": ">=",
        "value": 8,
        "scoreAdjust": 20
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "船山蔵",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ホリセンショウ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "松本秀",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "コジロウスペシャル",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779102319303",
    version: "v171.1",
    date: "2026-05-18T11:05:19.303Z",
    description: "帯広ば - 好走馬(キョウエイハンター等)の特性学習",
    track: "帯広ば",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "weightChange",
        "operator": ">=",
        "value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "今井千",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "カネサテンリュウ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779102353423",
    version: "v172.1",
    date: "2026-05-18T11:05:53.423Z",
    description: "帯広ば - 好走馬(ホクトヒーロー等)の特性学習",
    track: "帯広ば",
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "weightChange",
        "operator": ">=",
        "value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        "operator": ">=",
        "value": 8,
        "scoreAdjust": 20
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "村上章",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ダイエイヒーロー",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "長澤幸",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ホクショウダイヤ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
];
