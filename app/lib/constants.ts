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
];
