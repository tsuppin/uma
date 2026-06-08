import { LearningPatch } from "../types";

// ==========================================
// 初期学習パチE�� (ナレチE��ベ�Eスから抽出した琁E��E+ 実績学翁E
// ==========================================
export const INITIAL_PATCHES: LearningPatch[] = [
  // ==========================================
  // 【理論値】�E期パチE��
  // ==========================================
  {
    id: "initial_kasamatsu_power",
    version: "v1.0.base",
    date: "2026-05-01T00:00:00Z",
    description: "笠松�E�E10kg以上�E重量馬による砂�E抵抗突破�E�理論値�E�E,
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
    description: "笠松�E�E30kg以下�E軽量馬による物琁E��限界�E�理論値�E�E,
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
    description: "JRA転入初戦の砂適応リスク�E�理論値�E�E,
    adjustments: [
      { field: "isTransferFirstRace", operator: "==", value: 1, scoreAdjust: -15 }
    ],
    active: true
  },

  // ==========================================
  // 【実績学習】�E場共通：褁E��競馬場で繰り返し確認された普遍パターン
  // 東京/京都/門別/大亁E金沢/水沢で同一傾吁EↁE全場共通として格上げ
  // ==========================================
  {
    id: "learned_global_heavy_horse_bonus",
    version: "v14.0.consolidated",
    date: "2026-05-02T06:00:00Z",
    description: "【�E場共通、E80kg以上�E重量馬優位（東京・京都・門別・大井�E金沢・水沢で繰り返し確認！E,
    adjustments: [
      { field: "weight", operator: ">=", value: 480, scoreAdjust: 10 }
    ],
    active: true
  },

  // ==========================================
  // 【実績学習】固有パチE���E��E場共通と差別化できるも�E�E�E
  // ==========================================
  {
    id: "patch_funabashi_heavy_horse_good",
    version: "v4.1",
    date: "2026-05-07T02:51:29.505Z",
    description: "船橋�E良馬場�E�E80kg以上�E重量馬優位（ヤギリアイビス優勝実績�E�E,
    track: "船橁E,
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
    description: "金沢・良馬場�E�E0kg以上増加した馬の成長加速（ファイヤーナイフ優勝実績�E�E,
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
    description: "金沢・重馬場�E�E80kg以上�E重量馬優位（アオイミモザ優勝実績�E�E,
    track: "金沢",
    condition: "釁E,
    adjustments: [
      { field: "weight", operator: ">=", value: 480, scoreAdjust: 12 }
    ],
    active: true
  },
  {
    id: "patch_ooi_heavy_rain_horse",
    version: "v6.3.consolidated",
    date: "2026-05-01T22:22:59.120Z",
    description: "大井�E不良馬場�E�E80kg以上�E重量馬優位（クアチE��・ワナハヴファン 2件確認！E,
    track: "大亁E,
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
    description: "水沢・稍重�E�E80kg以上�E重量馬優位（�Eサノビジョン優勝実績�E�E,
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
    description: "盛岡 - 勝ち馬(クイーンカーチEの特性学翁E,
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
    description: "笠松 - 好走馬(キタノアンシェル筁Eの特性学翁E,
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
        "value": "黒鹿毁E,
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
        "value": "ホ�Eクビル",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778834476597",
    version: "v45.1",
    date: "2026-05-15T08:41:16.597Z",
    description: "門別 - 好走馬(クールカグラ筁Eの特性学翁E,
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
        "value": "青鹿毁E,
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
    description: "門別 - 好走馬(ブライト�Eウショウ筁Eの特性学翁E,
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
    description: "門別 - 好走馬(アーススカーレチE��筁Eの特性学翁E,
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
        "value": "黒鹿毁E,
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
        "value": "小野楁E,
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
    description: "門別 - 好走馬(スイレンチャン筁Eの特性学翁E,
    track: "門別",
    condition: "良",
    adjustments: [
      {
        "field": "jockey",
        "operator": "includes",
        "value": "小野楁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ラブリーチE��",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778841887566",
    version: "v16.1",
    date: "2026-05-15T10:44:47.566Z",
    description: "笠松 - 好走馬(リチE��カリーナ筁Eの特性学翁E,
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
        "value": "ロゴタイチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778841950299",
    version: "v17.1",
    date: "2026-05-15T10:45:50.299Z",
    description: "笠松 - 好走馬(ユイノサシガネ筁Eの特性学翁E,
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
        "value": "塚本征E,
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
    description: "笠松 - 好走馬(シャルメイビス筁Eの特性学翁E,
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
        "value": "大畑�E",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ハ�Eビンジャー",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778842496207",
    version: "v19.1",
    date: "2026-05-15T10:54:56.207Z",
    description: "笠松 - 好走馬(ヒロノラファール筁Eの特性学翁E,
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
        "value": "モズアスコチE��",
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
        "value": "ノヴェリスチE,
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
        "value": "コパノリチE��ー",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778842531663",
    version: "v20.1",
    date: "2026-05-15T10:55:31.663Z",
    description: "笠松 - 好走馬(シュネルカガ筁Eの特性学翁E,
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
        "value": "黒鹿毁E,
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
    description: "笠松 - 好走馬(ジャスタパ�EチE��ー筁Eの特性学翁E,
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
        "value": "黒鹿毁E,
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
        "value": "井口裁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ヤマカチE��ース",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778842611274",
    version: "v22.1",
    date: "2026-05-15T10:56:51.274Z",
    description: "笠松 - 好走馬(ゴージャスレチE��筁Eの特性学翁E,
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
    description: "笠松 - 好走馬(エイシンソロモン筁Eの特性学翁E,
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
    description: "笠松 - 好走馬(ヒルノブリスベン筁Eの特性学翁E,
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
        "value": "ブリチE��スアンドモ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "馬渕繁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "リアルインパクチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778846188294",
    version: "v58.1",
    date: "2026-05-15T11:56:28.294Z",
    description: "川崁E- 好走馬(ハ�Eバ�Eショー筁Eの特性学翁E,
    track: "川崁E,
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
        "value": "黒鹿毁E,
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
    description: "川崁E- 好走馬(ルリール筁Eの特性学翁E,
    track: "川崁E,
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
        "value": "チE��ープブリランチE,
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
    description: "川崁E- 好走馬(エレファントラン筁Eの特性学翁E,
    track: "川崁E,
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
        "value": "御神訁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ニューイヤーズチE��",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "黒鹿毁E,
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
        "value": "ハ�Eビンジャー",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778847444854",
    version: "v61.1",
    date: "2026-05-15T12:17:24.855Z",
    description: "川崁E- 好走馬(ノ�Eブルゲイル筁Eの特性学翁E,
    track: "川崁E,
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
    description: "川崁E- 好走馬(ピンクタオルチャン筁Eの特性学翁E,
    track: "川崁E,
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
        "value": "トビーズコーナ�E",
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
        "value": "黒鹿毁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ダノンレジェンチE,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "エスポワールシチ�E",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778848107053",
    version: "v63.1",
    date: "2026-05-15T12:28:27.054Z",
    description: "園田 - 好走馬(スナ�Eクユウマ筁Eの特性学翁E,
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
        "value": "コパノリチE��ー",
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
        "value": "永井孁E,
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
    description: "園田 - 好走馬(エイシンリール筁Eの特性学翁E,
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
        "value": "大山省E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "バンブ�Eエール",
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
        "value": "トゥザワールチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778887729675",
    version: "v32.1",
    date: "2026-05-15T23:28:49.675Z",
    description: "笠松 - 好走馬(ウィルソンウェイ筁Eの特性学翁E,
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
        "value": "渡邊竁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "タリスマニチE��",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778887870694",
    version: "v33.1",
    date: "2026-05-15T23:31:10.694Z",
    description: "笠松 - 好走馬(ジョリーメモリー筁Eの特性学翁E,
    track: "笠松",
    condition: "良",
    adjustments: [
      {
        "field": "jockey",
        "operator": "includes",
        "value": "馬渕繁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "リアルインパクチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778904456322",
    version: "v67.1",
    date: "2026-05-16T04:07:36.322Z",
    description: "川崁E- 好走馬(エレファントラン筁Eの特性学翁E,
    track: "川崁E,
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
        "value": "御神訁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ニューイヤーズチE��",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "黒鹿毁E,
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
        "value": "ハ�Eビンジャー",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778907012631",
    version: "v68.1",
    date: "2026-05-16T04:50:12.631Z",
    description: "東京 - 好走馬(オーシャンスチE��筁Eの特性学翁E,
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
        "value": "吉田 豁E,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778925371312",
    version: "v69.1",
    date: "2026-05-16T09:56:11.312Z",
    description: "東京 - 好走馬(チギリ筁Eの特性学翁E,
    track: "東京",
    condition: "良",
    adjustments: [
      {
        "field": "jockey",
        "operator": "includes",
        "value": "三浦 皁E�E",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "レチE��ファルクス",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "戸崁E圭太",
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
        "value": "津杁E明秀",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778925452959",
    version: "v70.1",
    date: "2026-05-16T09:57:32.959Z",
    description: "東京 - 好走馬(キングスコール筁Eの特性学翁E,
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
        "value": "吉田 豁E,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "佐、E�� 大輁E,
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
    description: "東京 - 好走馬(メリチE��アンスター筁Eの特性学翁E,
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
        "value": "M.チE��ー",
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
        "value": "戸崁E圭太",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778925678181",
    version: "v72.1",
    date: "2026-05-16T10:01:18.181Z",
    description: "京都 - 好走馬(レチE��ラージャ筁Eの特性学翁E,
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
        "value": "坂亁E瑠昁E,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "高杉 吏麁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "サートゥルナ�Eリア",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778928219288",
    version: "v73.1",
    date: "2026-05-16T10:43:39.288Z",
    description: "東京 - 好走馬(オーシャンスチE��筁Eの特性学翁E,
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
        "value": "吉田 豁E,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778928337767",
    version: "v74.1",
    date: "2026-05-16T10:45:37.767Z",
    description: "東京 - 好走馬(ターフクリスタル筁Eの特性学翁E,
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
        "value": "戸崁E圭太",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778928380020",
    version: "v75.1",
    date: "2026-05-16T10:46:20.020Z",
    description: "東京 - 好走馬(アヴァランチ筁Eの特性学翁E,
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
        "value": "三浦 皁E�E",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "マジェスチE��チE��ウォリアー",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "厁E優仁E,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778928421419",
    version: "v76.1",
    date: "2026-05-16T10:47:01.419Z",
    description: "東京 - 好走馬(カンチE��ーナ筁Eの特性学翁E,
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
        "value": "大釁E拓弥",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "シルバ�EスチE�EチE,
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
        "value": "津杁E明秀",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778928480175",
    version: "v77.1",
    date: "2026-05-16T10:48:00.175Z",
    description: "東京 - 好走馬(エラルチE��ーク筁Eの特性学翁E,
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
        "value": "佐、E�� 大輁E,
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
    description: "東京 - 好走馬(マジョレルブルー筁Eの特性学翁E,
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
        "value": "戸崁E圭太",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "厁E優仁E,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778928619655",
    version: "v79.1",
    date: "2026-05-16T10:50:19.655Z",
    description: "東京 - 好走馬(ショーリバ�Eス筁Eの特性学翁E,
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
        "value": "フォーウィールドライチE,
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
        "value": "三浦 皁E�E",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778928691626",
    version: "v80.1",
    date: "2026-05-16T10:51:31.626Z",
    description: "東京 - 好走馬(ノアヴィヴァーチェ筁Eの特性学翁E,
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
        "value": "木幡 巧乁E,
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
    description: "東京 - 好走馬(シャンソンド�Eル筁Eの特性学翁E,
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
        "value": "リアルインパクチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778928800212",
    version: "v82.1",
    date: "2026-05-16T10:53:20.212Z",
    description: "東京 - 好走馬(メリチE��アンスター筁Eの特性学翁E,
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
        "value": "M.チE��ー",
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
        "value": "戸崁E圭太",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778929925618",
    version: "v83.1",
    date: "2026-05-16T11:12:05.618Z",
    description: "新潁E- 好走馬(バレエマスター筁Eの特性学翁E,
    track: "新潁E,
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
        "value": "スピルバ�Eグ",
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
        "value": "ウインブライチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778929972050",
    version: "v84.1",
    date: "2026-05-16T11:12:52.050Z",
    description: "京都 - 好走馬(ルージュバロン筁Eの特性学翁E,
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
        "value": "坂亁E瑠昁E,
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
        "value": "ダノンレジェンチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778930019383",
    version: "v85.1",
    date: "2026-05-16T11:13:39.383Z",
    description: "京都 - 好走馬(ゴールドコチE��筁Eの特性学翁E,
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
        "value": "角田 大咁E,
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
        "value": "高杉 吏麁E,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "太宰 啓仁E,
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
    description: "京都 - 好走馬(キシャール筁Eの特性学翁E,
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
        "value": "高杉 吏麁E,
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
        "value": "幸 英昁E,
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
    description: "京都 - 好走馬(サトノビダーヤ筁Eの特性学翁E,
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
        "value": "酒亁E学",
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
    description: "京都 - 好走馬(ロサルゴサ筁Eの特性学翁E,
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
        "value": "団釁E大戁E,
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
        "value": "森田 誠乁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "リオンチE��ーズ",
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
    description: "京都 - 好走馬(ニ�EンピロカラチE��筁Eの特性学翁E,
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
        "value": "サトノダイヤモンチE,
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
    description: "京都 - 好走馬(コルドンブルー筁Eの特性学翁E,
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
        "value": "坂亁E瑠昁E,
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
    description: "京都 - 好走馬(シホノスペランチE��筁Eの特性学翁E,
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
        "value": "ブラチE��タイチE,
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
        "value": "ゴールドシチE�E",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778930511016",
    version: "v92.1",
    date: "2026-05-16T11:21:51.016Z",
    description: "京都 - 好走馬(レチE��ラージャ筁Eの特性学翁E,
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
        "value": "坂亁E瑠昁E,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778930580723",
    version: "v93.1",
    date: "2026-05-16T11:23:00.723Z",
    description: "京都 - 好走馬(ヒルノハンブルク筁Eの特性学翁E,
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
    description: "京都 - 好走馬(フリチE��ージャブ筁Eの特性学翁E,
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
        "value": "タリスマニチE��",
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
        "value": "団釁E大戁E,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778930680470",
    version: "v95.1",
    date: "2026-05-16T11:24:40.470Z",
    description: "京都 - 好走馬(ライトニングゼウス筁Eの特性学翁E,
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
        "value": "川田 封E��",
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
        "value": "フォーウィールドライチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778930730538",
    version: "v96.1",
    date: "2026-05-16T11:25:30.538Z",
    description: "京都 - 好走馬(ライトニングゼウス筁Eの特性学翁E,
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
        "value": "川田 封E��",
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
        "value": "フォーウィールドライチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778930784441",
    version: "v97.1",
    date: "2026-05-16T11:26:24.441Z",
    description: "京都 - 好走馬(ライトニングゼウス筁Eの特性学翁E,
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
        "value": "川田 封E��",
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
        "value": "フォーウィールドライチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778930836558",
    version: "v98.1",
    date: "2026-05-16T11:27:16.558Z",
    description: "新潁E- 好走馬(サンタアニタ筁Eの特性学翁E,
    track: "新潁E,
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
        "value": "サートゥルナ�Eリア",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778930890778",
    version: "v99.1",
    date: "2026-05-16T11:28:10.778Z",
    description: "新潁E- 好走馬(バレエマスター筁Eの特性学翁E,
    track: "新潁E,
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
        "value": "スピルバ�Eグ",
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
        "value": "ウインブライチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778930936730",
    version: "v100.1",
    date: "2026-05-16T11:28:56.730Z",
    description: "新潁E- 好走馬(アークド�Eル筁Eの特性学翁E,
    track: "新潁E,
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
        "value": "武 豁E,
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
    description: "新潁E- 好走馬(ルールーリマ筁Eの特性学翁E,
    track: "新潁E,
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
        "value": "荻釁E極",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778931034757",
    version: "v102.1",
    date: "2026-05-16T11:30:34.757Z",
    description: "新潁E- 好走馬(ファルコンミノル筁Eの特性学翁E,
    track: "新潁E,
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
        "value": "ゴールドシチE�E",
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
        "value": "柴田 裕一郁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "キズチE,
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
        "value": "西杁E淳乁E,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778931118745",
    version: "v103.1",
    date: "2026-05-16T11:31:58.745Z",
    description: "川崁E- 好走馬(アファーマティヴ筁Eの特性学翁E,
    track: "川崁E,
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
        "value": "加藤雁E,
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
        "value": "古岡勁E,
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
    description: "川崁E- 好走馬(ブエンチE��ア筁Eの特性学翁E,
    track: "川崁E,
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
        "value": "ホットロチE��チャー",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778931229422",
    version: "v105.1",
    date: "2026-05-16T11:33:49.422Z",
    description: "川崁E- 好走馬(ブラフキャチE��筁Eの特性学翁E,
    track: "川崁E,
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
        "value": "モズアスコチE��",
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
    description: "笠松 - 好走馬(ヒロノラファール筁Eの特性学翁E,
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
        "value": "モズアスコチE��",
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
        "value": "ノヴェリスチE,
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
        "value": "コパノリチE��ー",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778985036461",
    version: "v74.1",
    date: "2026-05-17T02:30:36.461Z",
    description: "東京 - 好走馬(オーシャンスチE��筁Eの特性学翁E,
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
        "value": "吉田 豁E,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778985101240",
    version: "v75.1",
    date: "2026-05-17T02:31:41.240Z",
    description: "東京 - 好走馬(ターフクリスタル筁Eの特性学翁E,
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
        "value": "戸崁E圭太",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778985194125",
    version: "v76.1",
    date: "2026-05-17T02:33:14.125Z",
    description: "東京 - 好走馬(アヴァランチ筁Eの特性学翁E,
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
        "value": "三浦 皁E�E",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "マジェスチE��チE��ウォリアー",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "厁E優仁E,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778985279835",
    version: "v77.1",
    date: "2026-05-17T02:34:39.835Z",
    description: "東京 - 好走馬(カンチE��ーナ筁Eの特性学翁E,
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
        "value": "大釁E拓弥",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "シルバ�EスチE�EチE,
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
    description: "帯庁E�E - 好走馬(チE��ノタチヤマ筁Eの特性学翁E,
    track: "帯庁E�E",
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
        "value": "ヒノチE��イガー",
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
        "value": "マルニセンプ�E",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778985513313",
    version: "v79.1",
    date: "2026-05-17T02:38:33.313Z",
    description: "帯庁E�E - 好走馬(クリスタルソウル筁Eの特性学翁E,
    track: "帯庁E�E",
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
        "value": "ホクショウユチE��",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "レチE��ダイヤ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778989672917",
    version: "v80.1",
    date: "2026-05-17T03:47:52.917Z",
    description: "東京 - 好走馬(ミライヘノチE��アラ筁Eの特性学翁E,
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
        "value": "サートゥルナ�Eリア",
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
        "value": "M.チE��ー",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ノ�Eブルミッション",
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
        "value": "ホ�Eクビル",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778990568061",
    version: "v114.1",
    date: "2026-05-17T04:02:48.061Z",
    description: "京都 - 好走馬(ルージュバロン筁Eの特性学翁E,
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
        "value": "坂亁E瑠昁E,
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
        "value": "ダノンレジェンチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778990630553",
    version: "v115.1",
    date: "2026-05-17T04:03:50.553Z",
    description: "京都 - 好走馬(ゴールドコチE��筁Eの特性学翁E,
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
        "value": "角田 大咁E,
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
        "value": "高杉 吏麁E,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "太宰 啓仁E,
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
    description: "京都 - 好走馬(タナブイハチターボ筁Eの特性学翁E,
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
        "value": "幸 英昁E,
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
        "value": "キタサンブラチE��",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778990830392",
    version: "v117.1",
    date: "2026-05-17T04:07:10.392Z",
    description: "佐賀 - 好走馬(イチE�EイソチE��Eの特性学翁E,
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
        "value": "川島拁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "リオンチE��ーズ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778991018404",
    version: "v118.1",
    date: "2026-05-17T04:10:18.404Z",
    description: "高知 - 好走馬(レアルシチ�E筁Eの特性学翁E,
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
    description: "高知 - 好走馬(ハ�Eド�Eイルド筁Eの特性学翁E,
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
        "value": "近藤翁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "チE��ーマジェスチE��",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778991118994",
    version: "v120.1",
    date: "2026-05-17T04:11:58.994Z",
    description: "高知 - 好走馬(コスモルーチE��ス筁Eの特性学翁E,
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
        "value": "黒鹿毁E,
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
    description: "高知 - 好走馬(ジョウショーボビー筁Eの特性学翁E,
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
        "value": "青鹿毁E,
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
    description: "高知 - 好走馬(スピ�Eドソルジャー筁Eの特性学翁E,
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
        "value": "宮川宁E,
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
        "value": "黒鹿毁E,
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
        "value": "リオンチE��ーズ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778991273018",
    version: "v123.1",
    date: "2026-05-17T04:14:33.018Z",
    description: "高知 - 好走馬(クリノドラゴン筁Eの特性学翁E,
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
    description: "高知 - 好走馬(リケアマキアート筁Eの特性学翁E,
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
        "value": "近藤翁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "リアルスチE��ール",
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
    description: "高知 - 好走馬(トップアメリカン筁Eの特性学翁E,
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
        "value": "黒鹿毁E,
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
        "value": "上田封E,
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
    description: "高知 - 好走馬(バイユーラン筁Eの特性学翁E,
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
        "value": "城野慁E,
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
    description: "高知 - 好走馬(ビ�Eム筁Eの特性学翁E,
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
    description: "高知 - 好走馬(ヒデノブルースカイ筁Eの特性学翁E,
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
        "value": "黒鹿毁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ブリチE��スアンドモ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "石本紁E,
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
    description: "佐賀 - 好走馬(バ�Eジャンフォース筁Eの特性学翁E,
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
        "value": "金山昁E,
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
    description: "佐賀 - 好走馬(タイショウロマン筁Eの特性学翁E,
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
        "value": "ゴールドシチE�E",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778991698928",
    version: "v131.1",
    date: "2026-05-17T04:21:38.928Z",
    description: "佐賀 - 好走馬(クラウンライジング筁Eの特性学翁E,
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
        "value": "トランセンチE,
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
    description: "佐賀 - 好走馬(ヘルト筁Eの特性学翁E,
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
        "value": "石川�E",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ブリチE��スアンドモ",
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
        "value": "金山昁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "リアルスチE��ール",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778991771862",
    version: "v133.1",
    date: "2026-05-17T04:22:51.862Z",
    description: "佐賀 - 好走馬(アスタイクウス筁Eの特性学翁E,
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
    description: "佐賀 - 好走馬(ロチE��筁Eの特性学翁E,
    track: "佐賀",
    condition: "良",
    adjustments: [
      {
        "field": "jockey",
        "operator": "includes",
        "value": "林悠翁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ト�Eセンラー",
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
        "value": "ジョーカプチーチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778991843289",
    version: "v135.1",
    date: "2026-05-17T04:24:03.289Z",
    description: "佐賀 - 好走馬(シズリ筁Eの特性学翁E,
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
        "value": "石川�E",
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
        "value": "金山昁E,
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
    description: "佐賀 - 好走馬(チャンピオンヤマト筁Eの特性学翁E,
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
        "value": "黒鹿毁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "エイシンフラチE��ュ",
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
    description: "笠松 - 好走馬(オレンタノ筁Eの特性学翁E,
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
    description: "金沢 - 好走馬(エムチE��パル筁Eの特性学翁E,
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
        "value": "吉田晁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "チE��ーマジェスチE��",
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
    description: "京都 - 好走馬(タガノアラリア筁Eの特性学翁E,
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
        "value": "ミスターメロチE��",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "M.チE��ーロ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "レイチE��ロ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779066541755",
    version: "v109.1",
    date: "2026-05-18T01:09:01.755Z",
    description: "京都 - 好走馬(コンジェスタス筁Eの特性学翁E,
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
        "value": "西杁E淳乁E,
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
    description: "京都 - 好走馬(コンジェスタス筁Eの特性学翁E,
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
        "value": "西杁E淳乁E,
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
    description: "東京 - 好走馬(ドンエレクトス筁Eの特性学翁E,
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
        "value": "荻釁E極",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ダノンレジェンチE,
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
    description: "京都 - 好走馬(コンジェスタス筁Eの特性学翁E,
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
        "value": "西杁E淳乁E,
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
    description: "東京 - 好走馬(ドンエレクトス筁Eの特性学翁E,
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
        "value": "荻釁E極",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ダノンレジェンチE,
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
    description: "新潁E- 好走馬(スーパ�Eバイザー筁Eの特性学翁E,
    track: "新潁E,
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
        "value": "ルーラーシチE�E",
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
        "value": "伊藤 工省E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ニューイヤーズチE��",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779074904822",
    version: "v146.1",
    date: "2026-05-18T03:28:24.822Z",
    description: "新潁E- 好走馬(エストゥペンダ筁Eの特性学翁E,
    track: "新潁E,
    condition: "良",
    adjustments: [
      {
        "field": "jockey",
        "operator": "includes",
        "value": "荻釁E極",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "サートゥルナ�Eリア",
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
        "value": "サトノダイヤモンチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779074972526",
    version: "v147.1",
    date: "2026-05-18T03:29:32.526Z",
    description: "新潁E- 好走馬(マリアイリダータ筁Eの特性学翁E,
    track: "新潁E,
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
        "value": "舟山 瑠況E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ドゥラメンチE,
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
        "value": "丸田 恭仁E,
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
    description: "新潁E- 好走馬(ラヴェンチE��筁Eの特性学翁E,
    track: "新潁E,
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
        "value": "長流E鴻緁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "シルバ�EスチE�EチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779075430858",
    version: "v149.1",
    date: "2026-05-18T03:37:10.858Z",
    description: "新潁E- 好走馬(ゴルチE�Eルスカー筁Eの特性学翁E,
    track: "新潁E,
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
        "value": "舟山 瑠況E,
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
        "value": "西塁E洸亁E,
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
    description: "新潁E- 好走馬(ベネスピラ筁Eの特性学翁E,
    track: "新潁E,
    condition: "良",
    adjustments: [
      {
        "field": "jockey",
        "operator": "includes",
        "value": "荻釁E極",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "レイチE��ロ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "石巁E裕紀人",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ゴールドシチE�E",
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
        "value": "舟山 瑠況E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ミッキーロケチE��",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779075616237",
    version: "v151.1",
    date: "2026-05-18T03:40:16.237Z",
    description: "新潁E- 好走馬(オーケーリアン筁Eの特性学翁E,
    track: "新潁E,
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
        "value": "富田 暁E,
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
        "value": "石祁E深遁E,
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
    description: "新潁E- 好走馬(ラチE�Eトップ筁Eの特性学翁E,
    track: "新潁E,
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
        "value": "石祁E深遁E,
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
    description: "新潁E- 好走馬(マジンタクシー筁Eの特性学翁E,
    track: "新潁E,
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
        "value": "荻釁E極",
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
    description: "新潁E- 好走馬(エタンセル筁Eの特性学翁E,
    track: "新潁E,
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
        "value": "小林 美駁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ブリチE��スアンドモルタル",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779076085418",
    version: "v155.1",
    date: "2026-05-18T03:48:05.418Z",
    description: "帯庁E�E - 好走馬(イワキハルヒメ筁Eの特性学翁E,
    track: "帯庁E�E",
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
    description: "帯庁E�E - 好走馬(ホクセイロイヤル筁Eの特性学翁E,
    track: "帯庁E�E",
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
    description: "盛岡 - 好走馬(ジーチE��ービ�Eト筁Eの特性学翁E,
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
        "value": "小林凁E,
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
    description: "金沢 - 好走馬(ブレイブゼウス筁Eの特性学翁E,
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
        "value": "加藤翁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "エスケンチE��ヤ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779076306607",
    version: "v159.1",
    date: "2026-05-18T03:51:46.607Z",
    description: "高知 - 好走馬(タルト�Eワール筁Eの特性学翁E,
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
        "value": "ブリチE��スアンドモ",
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
    description: "佐賀 - 好走馬(キチE��キ筁Eの特性学翁E,
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
        "value": "出水拁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ニシケンモノノチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779076490880",
    version: "v161.1",
    date: "2026-05-18T03:54:50.880Z",
    description: "京都 - 好走馬(ヒラボクソライア筁Eの特性学翁E,
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
        "value": "角田 大咁E,
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
        "value": "中亁E裕亁E,
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
    description: "京都 - 好走馬(バレルターン筁Eの特性学翁E,
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
        "value": "国刁E優佁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "リオンチE��ーズ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "M.チE��ーロ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "スワーヴリチャーチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779087577837",
    version: "v163.1",
    date: "2026-05-18T06:59:37.837Z",
    description: "京都 - 好走馬(エンジェルボイス筁Eの特性学翁E,
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
        "value": "佐、E�� 大輁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "キズチE,
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
        "value": "リアルスチE��ール",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779088509658",
    version: "v133.1",
    date: "2026-05-18T07:15:09.658Z",
    description: "京都 - 好走馬(ヴィスマ�Eル筁Eの特性学翁E,
    track: "京都",
    condition: "良",
    adjustments: [
      {
        "field": "jockey",
        "operator": "includes",
        "value": "西杁E淳乁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ブリチE��スアンドモルタル",
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
        "value": "サートゥルナ�Eリア",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779101575795",
    version: "v165.1",
    date: "2026-05-18T10:52:55.795Z",
    description: "帯庁E�E - 好走馬(マツノゴウリキ筁Eの特性学翁E,
    track: "帯庁E�E",
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
        "value": "マルニセンプ�E",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "臼杵龁E,
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
    description: "帯庁E�E - 好走馬(クリスタルソリチE��筁Eの特性学翁E,
    track: "帯庁E�E",
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
        "value": "サクラダイチE,
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
    description: "帯庁E�E - 好走馬(ミスキャチE�E筁Eの特性学翁E,
    track: "帯庁E�E",
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
    description: "帯庁E�E - 好走馬(ホクセイキレイズキ筁Eの特性学翁E,
    track: "帯庁E�E",
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
    description: "帯庁E�E - 好走馬(スカイノチカラ筁Eの特性学翁E,
    track: "帯庁E�E",
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
        "value": "臼杵龁E,
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
    description: "帯庁E�E - 好走馬(ホクセイビックボス筁Eの特性学翁E,
    track: "帯庁E�E",
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
    description: "帯庁E�E - 好走馬(キョウエイハンター筁Eの特性学翁E,
    track: "帯庁E�E",
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
        "value": "カネサチE��リュウ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779102353423",
    version: "v172.1",
    date: "2026-05-18T11:05:53.423Z",
    description: "帯庁E�E - 好走馬(ホクトヒーロー筁Eの特性学翁E,
    track: "帯庁E�E",
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
        "value": "ダイエイヒ�Eロー",
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
  {
    id: "patch_1779102387505",
    version: "v173.1",
    date: "2026-05-18T11:06:27.505Z",
    description: "帯庁E�E - 好走馬(ミヤビハヤブサ筁Eの特性学翁E,
    track: "帯庁E�E",
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
        "value": "村上章",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ゴールチE��フジ",
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
        "value": "西封E��",
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
    id: "patch_1779102496844",
    version: "v174.1",
    date: "2026-05-18T11:08:16.844Z",
    description: "帯庁E�E - 好走馬(カイセドクター筁Eの特性学翁E,
    track: "帯庁E�E",
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
        "value": "阿部武",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "カネサチE��リュウ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779102547749",
    version: "v175.1",
    date: "2026-05-18T11:09:07.749Z",
    description: "帯庁E�E - 好走馬(ホクセイタイヨウ筁Eの特性学翁E,
    track: "帯庁E�E",
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
        "value": "鈴木恵",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "フジダイビクトリー",
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
        "value": "西謙一",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "レチE��ダイヤ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779103086277",
    version: "v176.1",
    date: "2026-05-18T11:18:06.277Z",
    description: "盛岡 - 好走馬(セイチE��サウザー筁Eの特性学翁E,
    track: "盛岡",
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
        "value": "高橋悠",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "マクフィ",
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
        "value": "鈴木祁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "フォーウィールドラ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779103129828",
    version: "v177.1",
    date: "2026-05-18T11:18:49.828Z",
    description: "盛岡 - 好走馬(タカマキナイン筁Eの特性学翁E,
    track: "盛岡",
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
        "value": "佐、E��E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ミスチヴィアスアレ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779103176317",
    version: "v178.1",
    date: "2026-05-18T11:19:36.317Z",
    description: "盛岡 - 好走馬(ヤマニンラリアンス筁Eの特性学翁E,
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
        "field": "weightChange",
        "operator": "<=",
        "value": -10,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "山本紀",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ゴールドシチE�E",
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
        "value": "岩本态E,
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
    id: "patch_1779103245712",
    version: "v179.1",
    date: "2026-05-18T11:20:45.712Z",
    description: "盛岡 - 好走馬(モンルネ筁Eの特性学翁E,
    track: "盛岡",
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
        "value": "鈴木祁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "モーニン",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "山本紀",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ト�Eセンラー",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779103293134",
    version: "v180.1",
    date: "2026-05-18T11:21:33.134Z",
    description: "盛岡 - 好走馬(コウバイ筁Eの特性学翁E,
    track: "盛岡",
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
        "value": "坂井瑛",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "マツリダゴチE�E",
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
        "value": "塚本涼",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ワールドエース",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779103349279",
    version: "v181.1",
    date: "2026-05-18T11:22:29.279Z",
    description: "盛岡 - 好走馬(チE��フリンガー筁Eの特性学翁E,
    track: "盛岡",
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
        "value": "高松亮",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ビ�Eチパトロール",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        "operator": "<=",
        "value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "weightChange",
        "operator": "<=",
        "value": -10,
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
        "value": "菁E��辰",
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
    id: "patch_1779103383563",
    version: "v182.1",
    date: "2026-05-18T11:23:03.563Z",
    description: "盛岡 - 好走馬(マナホクラニ筁Eの特性学翁E,
    track: "盛岡",
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
        "value": "山本政",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "エイシンフラチE��ュ",
        "scoreAdjust": 15
      },
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
        "value": "阿部英",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ヘニーヒューズ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779103410997",
    version: "v183.1",
    date: "2026-05-18T11:23:30.997Z",
    description: "盛岡 - 好走馬(カリータフェリス筁Eの特性学翁E,
    track: "盛岡",
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
        "value": "村上忁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ゴールドシチE�E",
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
        "value": "山本政",
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
    id: "patch_1779103455197",
    version: "v184.1",
    date: "2026-05-18T11:24:15.197Z",
    description: "盛岡 - 好走馬(コパノマロン筁Eの特性学翁E,
    track: "盛岡",
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
        "value": "村上忁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "モズアスコチE��",
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
        "value": "高松亮",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "カレンブラチE��ヒル",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779103784902",
    version: "v185.1",
    date: "2026-05-18T11:29:44.902Z",
    description: "盛岡 - 好走馬(イタズラベガ筁Eの特性学翁E,
    track: "盛岡",
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
        "value": "岩本态E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ミスチヴィアスアレ",
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
        "value": "佐、E��E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "サンダースノ�E",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779103907303",
    version: "v186.1",
    date: "2026-05-18T11:31:47.303Z",
    description: "金沢 - 好走馬(マルカンマイヤー筁Eの特性学翁E,
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
        "value": "甲賀弁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "レチE��スパ�Eダ",
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
        "value": "青柳正",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ト�EホウジャチE��ル",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779103956984",
    version: "v187.1",
    date: "2026-05-18T11:32:36.984Z",
    description: "金沢 - 好走馬(チE��タニュートラル筁Eの特性学翁E,
    track: "金沢",
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
        "value": "田知弁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "モズアスコチE��",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "吉田晁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "フィエールマン",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "柴田勁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ダノンバラーチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779104004690",
    version: "v188.1",
    date: "2026-05-18T11:33:24.690Z",
    description: "金沢 - 好走馬(カフジウヴァ筁Eの特性学翁E,
    track: "金沢",
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
        "value": "青柳正",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "�E��E�ａE��ｉｓｈ　�E�",
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
        "value": "加藤翁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ベルシャザール",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779104082319",
    version: "v189.1",
    date: "2026-05-18T11:34:42.319Z",
    description: "金沢 - 好走馬(ニューレトロ筁Eの特性学翁E,
    track: "金沢",
    condition: "良",
    adjustments: [
      {
        "field": "jockey",
        "operator": "includes",
        "value": "松戸政",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ベルシャザール",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "中島龁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ハ�EチE��ライ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779104111855",
    version: "v190.1",
    date: "2026-05-18T11:35:11.855Z",
    description: "金沢 - 好走馬(スカイリスト筁Eの特性学翁E,
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
        "field": "frame",
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "吉原寁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ノヴェリスチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779104155538",
    version: "v191.1",
    date: "2026-05-18T11:35:55.538Z",
    description: "金沢 - 好走馬(サクラルーフェン筁Eの特性学翁E,
    track: "金沢",
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
        "operator": ">=",
        "value": 8,
        "scoreAdjust": 20
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "流E��登",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "アイルハヴアナザー",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "栗原大",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ジャスタウェイ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779104226494",
    version: "v192.1",
    date: "2026-05-18T11:37:06.494Z",
    description: "金沢 - 好走馬(コパノエミリア筁Eの特性学翁E,
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
        "value": "渡邊竁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "コパノリチE��ー",
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
        "value": "魚住謁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "レインボ�Eライン",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779104257035",
    version: "v193.1",
    date: "2026-05-18T11:37:37.035Z",
    description: "金沢 - 好走馬(ホワイト�EチE��筁Eの特性学翁E,
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
        "field": "weightChange",
        "operator": "<=",
        "value": -10,
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
        "value": "吉原寁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ダンカーク",
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
        "value": "望月洵",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ミスターメロチE��",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779104459889",
    version: "v194.1",
    date: "2026-05-18T11:40:59.889Z",
    description: "高知 - 好走馬(シュマンドロワ筁Eの特性学翁E,
    track: "高知",
    condition: "良",
    adjustments: [
      {
        "field": "jockey",
        "operator": "includes",
        "value": "山田貴",
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
    id: "patch_1779104490109",
    version: "v195.1",
    date: "2026-05-18T11:41:30.109Z",
    description: "高知 - 好走馬(ノイヤー筁Eの特性学翁E,
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
        "value": "上田封E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ニューイヤーズチE��",
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
        "value": "城野慁E,
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
    id: "patch_1779105361209",
    version: "v196.1",
    date: "2026-05-18T11:56:01.209Z",
    description: "高知 - 好走馬(ゼンノソブリン筁Eの特性学翁E,
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
        "value": "山崎雅",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "シャンハイボビー",
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
        "value": "岡村卓",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ファインニ�Eドル",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779105390417",
    version: "v197.1",
    date: "2026-05-18T11:56:30.417Z",
    description: "高知 - 好走馬(ポッドロイ筁Eの特性学翁E,
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
        "field": "jockey",
        "operator": "includes",
        "value": "岡村卓",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ブリチE��スアンドモ",
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
    id: "patch_1779106100085",
    version: "v198.1",
    date: "2026-05-18T12:08:20.085Z",
    description: "高知 - 好走馬(カゲマル筁Eの特性学翁E,
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
        "field": "weightChange",
        "operator": ">=",
        "value": 10,
        "scoreAdjust": 15
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
        "value": "ヘニーヒューズ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "大澤誠",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ラチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779106129700",
    version: "v199.1",
    date: "2026-05-18T12:08:49.700Z",
    description: "高知 - 好走馬(コノヨルヲトメチE��筁Eの特性学翁E,
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
        "field": "jockey",
        "operator": "includes",
        "value": "岡村卓",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "バンブ�Eエール",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779106161648",
    version: "v200.1",
    date: "2026-05-18T12:09:21.648Z",
    description: "高知 - 好走馬(グランチE��ーチE��筁Eの特性学翁E,
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
        "operator": ">=",
        "value": 8,
        "scoreAdjust": 20
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "多田誠",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "マクフィ",
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
        "value": "佐原秀",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "マインドユアビスケ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779106190420",
    version: "v201.1",
    date: "2026-05-18T12:09:50.420Z",
    description: "高知 - 好走馬(ベストディシジョン筁Eの特性学翁E,
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
        "value": "永森大",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ダイワメジャー",
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
        "value": "(変更)",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ホッコータルマエ",
        "scoreAdjust": 15
      },
      {
        "field": "weightChange",
        "operator": "<=",
        "value": -10,
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
        "value": "阿部基",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "フリオーソ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779106256624",
    version: "v202.1",
    date: "2026-05-18T12:10:56.624Z",
    description: "高知 - 好走馬(シンチE��ラスマイル筁Eの特性学翁E,
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
        "value": "上田封E,
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
        "value": "木村直",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "サトノクラウン",
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
        "value": "(変更)",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ニシケンモノノチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779106373827",
    version: "v203.1",
    date: "2026-05-18T12:12:53.827Z",
    description: "京都 - 好走馬(シエーナカラー筁Eの特性学翁E,
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
        "value": "酒亁E学",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "チE��ラレーションオブウォー",
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
        "value": "鮫島 克駿",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ゴールドドリーム",
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
        "value": "菱田 裕亁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "クリソベリル",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779106422010",
    version: "v204.1",
    date: "2026-05-18T12:13:42.010Z",
    description: "京都 - 好走馬(ジャカルタバオ筁Eの特性学翁E,
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
        "value": "浜中 俁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "シャンハイボビー",
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
        "value": "菱田 裕亁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "モズアスコチE��",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "岩田 康誠",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "サートゥルナ�Eリア",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779106466643",
    version: "v205.1",
    date: "2026-05-18T12:14:26.643Z",
    description: "京都 - 好走馬(ヒラボクソライア筁Eの特性学翁E,
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
        "value": "角田 大咁E,
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
        "value": "中亁E裕亁E,
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
    id: "patch_1779106665124",
    version: "v206.1",
    date: "2026-05-18T12:17:45.124Z",
    description: "京都 - 好走馬(ペ�Eチドブッドレア筁Eの特性学翁E,
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
        "value": "団釁E大戁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "イスラボニータ",
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
        "value": "高杉 吏麁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "コントレイル",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "田山 旺佁E,
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
    id: "patch_1779106710602",
    version: "v207.1",
    date: "2026-05-18T12:18:30.602Z",
    description: "京都 - 好走馬(エンジェルボイス筁Eの特性学翁E,
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
        "value": "佐、E�� 大輁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "キズチE,
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
        "value": "リアルスチE��ール",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779106960860",
    version: "v208.1",
    date: "2026-05-18T12:22:40.860Z",
    description: "新潁E- 好走馬(マリアイリダータ筁Eの特性学翁E,
    track: "新潁E,
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
        "value": "舟山 瑠況E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ドゥラメンチE,
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
        "value": "丸田 恭仁E,
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
    id: "patch_1779133839288",
    version: "v209.1",
    date: "2026-05-18T19:50:39.288Z",
    description: "大亁E- 好走馬(ヨロシクユウキ筁Eの特性学翁E,
    track: "大亁E,
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
        "value": "高橋昭",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ヘンリーバローズ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779133880018",
    version: "v210.1",
    date: "2026-05-18T19:51:20.018Z",
    description: "大亁E- 好走馬(ウィルイルミ筁Eの特性学翁E,
    track: "大亁E,
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
        "value": "吉井章",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "シニスターミニスタ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "菁E��涼",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "サンダースノ�E",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779133956414",
    version: "v211.1",
    date: "2026-05-18T19:52:36.414Z",
    description: "大亁E- 好走馬(グレーヌドスタール筁Eの特性学翁E,
    track: "大亁E,
    condition: "良",
    adjustments: [
      {
        "field": "jockey",
        "operator": "includes",
        "value": "西啓太",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "スチE��ヴィオ",
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
        "value": "達城龁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "タイセイレジェンチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779133986329",
    version: "v212.1",
    date: "2026-05-18T19:53:06.329Z",
    description: "大亁E- 好走馬(エムチE��キング筁Eの特性学翁E,
    track: "大亁E,
    condition: "良",
    adjustments: [
      {
        "field": "jockey",
        "operator": "includes",
        "value": "谷冁E��",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "アド�Eイヤマ�Eズ",
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
        "value": "杉山海",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "サンダースノ�E",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779135062128",
    version: "v213.1",
    date: "2026-05-18T20:11:02.128Z",
    description: "東京 - 好走馬(ワイズギャング筁Eの特性学翁E,
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
        "value": "長岡 禎仁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ミスチヴィアスアレチE��ス",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779135101820",
    version: "v214.1",
    date: "2026-05-18T20:11:41.820Z",
    description: "東京 - 好走馬(トミーバローズ筁Eの特性学翁E,
    track: "東京",
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
        "value": "坂亁E瑠昁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ヘンリーバローズ",
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
        "value": "北村 宏司",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "レイチE��ロ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "戸崁E圭太",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "キズチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779135147834",
    version: "v215.1",
    date: "2026-05-18T20:12:27.834Z",
    description: "東京 - 好走馬(チE��ープキング筁Eの特性学翁E,
    track: "東京",
    condition: "良",
    adjustments: [
      {
        "field": "age",
        "operator": ">=",
        "value": 8,
        "scoreAdjust": 20
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "丹冁E祐次",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "チE��ープインパクチE,
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
        "value": "D.レーン",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "フィエールマン",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779135193518",
    version: "v216.1",
    date: "2026-05-18T20:13:13.518Z",
    description: "東京 - 好走馬(エルマ�Eゴ筁Eの特性学翁E,
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
        "operator": ">=",
        "value": 7,
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
        "value": "サートゥルナ�Eリア",
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
        "value": "菁E�� 明良",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ロジャーバローズ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "丹冁E祐次",
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
    id: "patch_1779135240158",
    version: "v217.1",
    date: "2026-05-18T20:14:00.158Z",
    description: "東京 - 好走馬(トルショー筁Eの特性学翁E,
    track: "東京",
    condition: "良",
    adjustments: [
      {
        "field": "jockey",
        "operator": "includes",
        "value": "岩田 望来",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "シニスターミニスター",
        "scoreAdjust": 15
      },
      {
        "field": "weightChange",
        "operator": "<=",
        "value": -10,
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
        "value": "F.ゴンサルベス",
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
        "value": "モーニン",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779135248578",
    version: "v218.1",
    date: "2026-05-18T20:14:08.578Z",
    description: "東京 - 好走馬(トルショー筁Eの特性学翁E,
    track: "東京",
    condition: "良",
    adjustments: [
      {
        "field": "jockey",
        "operator": "includes",
        "value": "岩田 望来",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "シニスターミニスター",
        "scoreAdjust": 15
      },
      {
        "field": "weightChange",
        "operator": "<=",
        "value": -10,
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
        "value": "F.ゴンサルベス",
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
        "value": "モーニン",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779148526333",
    version: "v219.1",
    date: "2026-05-18T23:55:26.333Z",
    description: "東京 - 好走馬(エンブロイダリー筁Eの特性学翁E,
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
        "value": "C.ルメール",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "アド�Eイヤマ�Eズ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "川田 封E��",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ブラチE��タイチE,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "西杁E淳乁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "キズチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779148684014",
    version: "v220.1",
    date: "2026-05-18T23:58:04.014Z",
    description: "帯庁E�E - 好走馬(カネノマックイーン筁Eの特性学翁E,
    track: "帯庁E�E",
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
        "value": "阿部優",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "カネゾウ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779148720050",
    version: "v221.1",
    date: "2026-05-18T23:58:40.050Z",
    description: "帯庁E�E - 好走馬(カネノマックイーン筁Eの特性学翁E,
    track: "帯庁E�E",
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
        "value": "阿部優",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "カネゾウ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779160676713",
    version: "v222.1",
    date: "2026-05-19T03:17:56.713Z",
    description: "盛岡 - 好走馬(グレコ筁Eの特性学翁E,
    track: "盛岡",
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
        "value": "関本玲",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "サングレーザー",
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
        "value": "山本紀",
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
    id: "patch_1779160747551",
    version: "v222.1",
    date: "2026-05-19T03:19:07.551Z",
    description: "盛岡 - 好走馬(ラミアヴィータ筁Eの特性学翁E,
    track: "盛岡",
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
        "value": "小林凁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "マツリダゴチE�E",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779160874929",
    version: "v223.1",
    date: "2026-05-19T03:21:14.929Z",
    description: "盛岡 - 好走馬(フォーレ筁Eの特性学翁E,
    track: "盛岡",
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
        "value": "鈴木祁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ヴァンセンチE,
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
        "value": "坂井瑛",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "カレンブラチE��ヒル",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779160905526",
    version: "v224.1",
    date: "2026-05-19T03:21:45.526Z",
    description: "盛岡 - 好走馬(バ�Eドハズフロウン筁Eの特性学翁E,
    track: "盛岡",
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
        "operator": ">=",
        "value": 8,
        "scoreAdjust": 20
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "佐、E��E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ベ�Eカバド",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "鈴木祁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "トゥザワールチE,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "高橋悠",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "レガーロ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779160938526",
    version: "v225.1",
    date: "2026-05-19T03:22:18.526Z",
    description: "盛岡 - 好走馬(メダチE��チE��Eの特性学翁E,
    track: "盛岡",
    condition: "良",
    adjustments: [
      {
        "field": "jockey",
        "operator": "includes",
        "value": "南�E家",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "クリエイター�E�E,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779161032779",
    version: "v226.1",
    date: "2026-05-19T03:23:52.779Z",
    description: "盛岡 - 好走馬(レノヴァチE��オ筁Eの特性学翁E,
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
        "value": "村上忁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "クリソベリル",
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
        "value": "菁E��辰",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ブルドッグボス",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779161078334",
    version: "v227.1",
    date: "2026-05-19T03:24:38.334Z",
    description: "盛岡 - 好走馬(サスケベラ筁Eの特性学翁E,
    track: "盛岡",
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
        "value": "菁E��辰",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "イスラボニータ",
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
        "value": "山本政",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "フリオーソ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779161107447",
    version: "v228.1",
    date: "2026-05-19T03:25:07.447Z",
    description: "盛岡 - 好走馬(スターキー筁Eの特性学翁E,
    track: "盛岡",
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
        "value": "山本聡",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "メイショウボ�Eラー",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "小林凁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ファインニ�Eドル",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779161135286",
    version: "v229.1",
    date: "2026-05-19T03:25:35.286Z",
    description: "盛岡 - 好走馬(イキザマ筁Eの特性学翁E,
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
        "field": "age",
        "operator": ">=",
        "value": 8,
        "scoreAdjust": 20
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "山本紀",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "サウスヴィグラス",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "山本政",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "アド�Eイヤムーン",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "村上忁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ルヴァンスレーヴ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779161164756",
    version: "v230.1",
    date: "2026-05-19T03:26:04.756Z",
    description: "盛岡 - 好走馬(チE��チE��Eの特性学翁E,
    track: "盛岡",
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
        "value": "関本玲",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ハ�EチE��ライ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779161196910",
    version: "v231.1",
    date: "2026-05-19T03:26:36.910Z",
    description: "盛岡 - 好走馬(ナムラボス筁Eの特性学翁E,
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
        "field": "age",
        "operator": ">=",
        "value": 8,
        "scoreAdjust": 20
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "鈴木祁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "トゥザグローリー",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779161347881",
    version: "v232.1",
    date: "2026-05-19T03:29:07.881Z",
    description: "大亁E- 好走馬(ヨロシクユウキ筁Eの特性学翁E,
    track: "大亁E,
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
        "value": "高橋昭",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ヘンリーバローズ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779161384182",
    version: "v233.1",
    date: "2026-05-19T03:29:44.182Z",
    description: "大亁E- 好走馬(ナナセショー筁Eの特性学翁E,
    track: "大亁E,
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
        "value": "菁E��涼",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "サンダースノ�E",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779161445862",
    version: "v234.1",
    date: "2026-05-19T03:30:45.862Z",
    description: "大亁E- 好走馬(グレーヌドスタール筁Eの特性学翁E,
    track: "大亁E,
    condition: "良",
    adjustments: [
      {
        "field": "jockey",
        "operator": "includes",
        "value": "西啓太",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "スチE��ヴィオ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779161529060",
    version: "v235.1",
    date: "2026-05-19T03:32:09.060Z",
    description: "大亁E- 好走馬(ニシノコヌカアメ筁Eの特性学翁E,
    track: "大亁E,
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
        "value": "杉山海",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "サンダースノ�E",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779161646736",
    version: "v236.1",
    date: "2026-05-19T03:34:06.736Z",
    description: "大亁E- 好走馬(メイショウトキイロ筁Eの特性学翁E,
    track: "大亁E,
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
        "value": "藤本現",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "チE��ラレーションオ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779161719807",
    version: "v237.1",
    date: "2026-05-19T03:35:19.807Z",
    description: "大亁E- 好走馬(フィライングレース筁Eの特性学翁E,
    track: "大亁E,
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
        "value": "鷹見陸",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ダンカーク",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779161760979",
    version: "v238.1",
    date: "2026-05-19T03:36:00.979Z",
    description: "大亁E- 好走馬(クアチE��筁Eの特性学翁E,
    track: "大亁E,
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
        "value": "石川駿",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "スノ�Eドラゴン",
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
        "value": "リアルインパクチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779161789258",
    version: "v239.1",
    date: "2026-05-19T03:36:29.258Z",
    description: "大亁E- 好走馬(ロードルーチェ筁Eの特性学翁E,
    track: "大亁E,
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
        "value": "藤本現",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "フォーウィールドラ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "矢野貴",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "モーニン",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779161819403",
    version: "v240.1",
    date: "2026-05-19T03:36:59.403Z",
    description: "大亁E- 好走馬(アオイコウキ筁Eの特性学翁E,
    track: "大亁E,
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
        "value": "高橋昭",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ロードカナロア",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "安藤洁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "キタサンブラチE��",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779161846928",
    version: "v241.1",
    date: "2026-05-19T03:37:26.928Z",
    description: "大亁E- 好走馬(セキトバシューズ筁Eの特性学翁E,
    track: "大亁E,
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
        "value": "藤田凁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "キタサンブラチE��",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779161876173",
    version: "v242.1",
    date: "2026-05-19T03:37:56.173Z",
    description: "大亁E- 好走馬(ジャスミンチE�E筁Eの特性学翁E,
    track: "大亁E,
    condition: "良",
    adjustments: [
      {
        "field": "jockey",
        "operator": "includes",
        "value": "本橋孁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ダノンレジェンチE,
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
        "value": "杉山海",
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
    id: "patch_1779161922367",
    version: "v243.1",
    date: "2026-05-19T03:38:42.368Z",
    description: "東京 - 好走馬(カーボフリオ筁Eの特性学翁E,
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
        "value": "佐藤 翔馬",
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
    id: "patch_1779161969225",
    version: "v244.1",
    date: "2026-05-19T03:39:29.225Z",
    description: "東京 - 好走馬(ターフクリスタル筁Eの特性学翁E,
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
        "field": "sire",
        "operator": "includes",
        "value": "インカンチE�Eション",
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
        "value": "戸崁E圭太",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ビ�Eチパトロール",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779162007283",
    version: "v245.1",
    date: "2026-05-19T03:40:07.283Z",
    description: "東京 - 好走馬(アヴァランチ筁Eの特性学翁E,
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
        "value": "三浦 皁E�E",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "マジェスチE��チE��ウォリアー",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "厁E優仁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "スワーヴリチャーチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779162050961",
    version: "v246.1",
    date: "2026-05-19T03:40:50.961Z",
    description: "東京 - 好走馬(カンチE��ーナ筁Eの特性学翁E,
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
        "value": "大釁E拓弥",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "シルバ�EスチE�EチE,
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
        "field": "sire",
        "operator": "includes",
        "value": "コントレイル",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779162100053",
    version: "v247.1",
    date: "2026-05-19T03:41:40.053Z",
    description: "東京 - 好走馬(レヴェランジェ筁Eの特性学翁E,
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
        "value": "佐、E�� 大輁E,
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
    id: "patch_1779162150021",
    version: "v248.1",
    date: "2026-05-19T03:42:30.021Z",
    description: "東京 - 好走馬(マジョレルブルー筁Eの特性学翁E,
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
        "value": "戸崁E圭太",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "コントレイル",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "厁E優仁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "レイチE��ロ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779162191222",
    version: "v249.1",
    date: "2026-05-19T03:43:11.222Z",
    description: "東京 - 好走馬(ショーリバ�Eス筁Eの特性学翁E,
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
        "value": "フォーウィールドライチE,
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
        "value": "三浦 皁E�E",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ドレフォン",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779162239782",
    version: "v250.1",
    date: "2026-05-19T03:43:59.782Z",
    description: "東京 - 好走馬(コチE��ヴェチE��オ筁Eの特性学翁E,
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
    id: "patch_1779162274327",
    version: "v251.1",
    date: "2026-05-19T03:44:34.327Z",
    description: "東京 - 好走馬(シャンソンド�Eル筁Eの特性学翁E,
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
        "field": "sire",
        "operator": "includes",
        "value": "レイチE��ロ",
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
        "value": "リアルインパクチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779162326550",
    version: "v252.1",
    date: "2026-05-19T03:45:26.550Z",
    description: "東京 - 好走馬(メリチE��アンスター筁Eの特性学翁E,
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
        "value": "M.チE��ー",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "モズアスコチE��",
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
        "value": "戸崁E圭太",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "American Pharoah",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779162574974",
    version: "v254.1",
    date: "2026-05-19T03:49:34.974Z",
    description: "京都 - 好走馬(ルージュバロン筁Eの特性学翁E,
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
        "value": "坂亁E瑠昁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "コントレイル",
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
        "field": "sire",
        "operator": "includes",
        "value": "ドレフォン",
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
        "value": "ダノンレジェンチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779162611300",
    version: "v255.1",
    date: "2026-05-19T03:50:11.300Z",
    description: "京都 - 好走馬(レチE��フロイチE��Eの特性学翁E,
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
        "value": "高杉 吏麁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "モーリス",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "太宰 啓仁E,
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
    id: "patch_1779178984701",
    version: "v256.1",
    date: "2026-05-19T08:23:04.701Z",
    description: "名古屁E- 好走馬(ムギガクダン筁Eの特性学翁E,
    track: "名古屁E,
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
        "value": "丸野勝",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "フィエールマン",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779179017109",
    version: "v257.1",
    date: "2026-05-19T08:23:37.109Z",
    description: "名古屁E- 好走馬(ココインシチE��ス筁Eの特性学翁E,
    track: "名古屁E,
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
        "value": "木之葵",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "シュヴァルグラン",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "山田祥",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ビ�Eチパトロール",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779179049115",
    version: "v258.1",
    date: "2026-05-19T08:24:09.115Z",
    description: "名古屁E- 好走馬(プラウドブルーベル筁Eの特性学翁E,
    track: "名古屁E,
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
        "value": "近藤颯",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ワールド�Eレミア",
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
        "value": "村上弁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ダノンスマッシュ",
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
        "value": "細川智",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ミッキーアイル",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779184649826",
    version: "v259.1",
    date: "2026-05-19T09:57:29.827Z",
    description: "東京 - 好走馬(カーボフリオ筁Eの特性学翁E,
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
        "value": "佐藤 翔馬",
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
    id: "patch_1779184689180",
    version: "v260.1",
    date: "2026-05-19T09:58:09.180Z",
    description: "東京 - 好走馬(ガーチE��バイザベイ筁Eの特性学翁E,
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
        "value": "菁E�� 明良",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ルーラーシチE�E",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779187025500",
    version: "v261.1",
    date: "2026-05-19T10:37:05.500Z",
    description: "東京 - 好走馬(カーボフリオ筁Eの特性学翁E,
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
        "value": "佐藤 翔馬",
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
    id: "patch_1779187068397",
    version: "v262.1",
    date: "2026-05-19T10:37:48.397Z",
    description: "東京 - 好走馬(ターフクリスタル筁Eの特性学翁E,
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
        "field": "sire",
        "operator": "includes",
        "value": "インカンチE�Eション",
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
        "value": "戸崁E圭太",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ビ�Eチパトロール",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779187102862",
    version: "v263.1",
    date: "2026-05-19T10:38:22.862Z",
    description: "東京 - 好走馬(アヴァランチ筁Eの特性学翁E,
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
        "value": "三浦 皁E�E",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "マジェスチE��チE��ウォリアー",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "厁E優仁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "スワーヴリチャーチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779187134149",
    version: "v264.1",
    date: "2026-05-19T10:38:54.150Z",
    description: "東京 - 好走馬(カンチE��ーナ筁Eの特性学翁E,
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
        "value": "大釁E拓弥",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "シルバ�EスチE�EチE,
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
        "field": "sire",
        "operator": "includes",
        "value": "コントレイル",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779187174959",
    version: "v265.1",
    date: "2026-05-19T10:39:34.959Z",
    description: "東京 - 好走馬(マルガイエラルチE��ーク筁Eの特性学翁E,
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
        "field": "sire",
        "operator": "includes",
        "value": "Sottsass",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "佐、E�� 大輁E,
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
    id: "patch_1779187204153",
    version: "v266.1",
    date: "2026-05-19T10:40:04.153Z",
    description: "東京 - 好走馬(マジョレルブルー筁Eの特性学翁E,
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
        "value": "戸崁E圭太",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "コントレイル",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "厁E優仁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "レイチE��ロ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779187245921",
    version: "v267.1",
    date: "2026-05-19T10:40:45.921Z",
    description: "東京 - 好走馬(ショーリバ�Eス筁Eの特性学翁E,
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
        "value": "フォーウィールドライチE,
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
        "value": "三浦 皁E�E",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ドレフォン",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779187285180",
    version: "v268.1",
    date: "2026-05-19T10:41:25.180Z",
    description: "東京 - 好走馬(コチE��ヴェチE��オ筁Eの特性学翁E,
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
    id: "patch_1779187358644",
    version: "v234.1",
    date: "2026-05-19T10:42:38.644Z",
    description: "盛岡 - 好走馬(ニューイヤーズチE��筁Eの特性学翁E,
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
        "field": "age",
        "operator": "==",
        "value": 3,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779187481829",
    version: "v269.1",
    date: "2026-05-19T10:44:41.829Z",
    description: "東京 - 好走馬(シャンソンド�Eル筁Eの特性学翁E,
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
        "field": "sire",
        "operator": "includes",
        "value": "レイチE��ロ",
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
        "value": "リアルインパクチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779187682303",
    version: "v271.1",
    date: "2026-05-19T10:48:02.303Z",
    description: "東京 - 好走馬(シャンソンド�Eル筁Eの特性学翁E,
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
        "field": "sire",
        "operator": "includes",
        "value": "レイチE��ロ",
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
        "value": "リアルインパクチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779191977890",
    version: "v272.1",
    date: "2026-05-19T11:59:37.890Z",
    description: "大亁E- 好走馬(サヨノグチE��チE��筁Eの特性学翁E,
    track: "大亁E,
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
        "value": "矢野貴",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "エスポワールシチ�E",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779192008424",
    version: "v273.1",
    date: "2026-05-19T12:00:08.424Z",
    description: "大亁E- 好走馬(ウィルイルミ筁Eの特性学翁E,
    track: "大亁E,
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
        "value": "吉井章",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "シニスターミニスタ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "菁E��涼",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "サンダースノ�E",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779192064353",
    version: "v274.1",
    date: "2026-05-19T12:01:04.353Z",
    description: "大亁E- 好走馬(グレーヌドスタール筁Eの特性学翁E,
    track: "大亁E,
    condition: "良",
    adjustments: [
      {
        "field": "jockey",
        "operator": "includes",
        "value": "西啓太",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "スチE��ヴィオ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779192951431",
    version: "v275.1",
    date: "2026-05-19T12:15:51.431Z",
    description: "京都 - 好走馬(ルージュバロン筁Eの特性学翁E,
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
        "value": "坂亁E瑠昁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "コントレイル",
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
        "field": "sire",
        "operator": "includes",
        "value": "ドレフォン",
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
        "value": "ダノンレジェンチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779192989314",
    version: "v276.1",
    date: "2026-05-19T12:16:29.314Z",
    description: "京都 - 好走馬(レチE��フロイチE��Eの特性学翁E,
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
        "value": "高杉 吏麁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "モーリス",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "太宰 啓仁E,
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
    id: "patch_1779193135806",
    version: "v277.1",
    date: "2026-05-19T12:18:55.806Z",
    description: "京都 - 好走馬(キシャール筁Eの特性学翁E,
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
        "value": "高杉 吏麁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ダノンプレミアム",
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
        "value": "キタサンブラチE��",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779193173437",
    version: "v278.1",
    date: "2026-05-19T12:19:33.437Z",
    description: "京都 - 好走馬(サトノビダーヤ筁Eの特性学翁E,
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
        "value": "酒亁E学",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "サトノジェネシス",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779193388846",
    version: "v279.1",
    date: "2026-05-19T12:23:08.846Z",
    description: "京都 - 好走馬(ロサルゴサ筁Eの特性学翁E,
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
        "value": "団釁E大戁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "フィエールマン",
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
        "value": "森田 誠乁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "リオンチE��ーズ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779193454610",
    version: "v280.1",
    date: "2026-05-19T12:24:14.610Z",
    description: "京都 - 好走馬(ニ�EンピロカラチE��筁Eの特性学翁E,
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
        "value": "サトノダイヤモンチE,
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
        "value": "ドゥラメンチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779193596835",
    version: "v281.1",
    date: "2026-05-19T12:26:36.835Z",
    description: "名古屁E- 好走馬(ムギガクダン筁Eの特性学翁E,
    track: "名古屁E,
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
        "value": "丸野勝",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "フィエールマン",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779193627664",
    version: "v282.1",
    date: "2026-05-19T12:27:07.664Z",
    description: "名古屁E- 好走馬(ココインシチE��ス筁Eの特性学翁E,
    track: "名古屁E,
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
        "value": "木之葵",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "シュヴァルグラン",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "山田祥",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ビ�Eチパトロール",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779222498213",
    version: "v282.1",
    date: "2026-05-19T20:28:18.213Z",
    description: "名古屁E- 好走馬(ムギガクダン筁Eの特性学翁E,
    track: "名古屁E,
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
        "value": "丸野勝",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "フィエールマン",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779222525832",
    version: "v283.1",
    date: "2026-05-19T20:28:45.832Z",
    description: "名古屁E- 好走馬(ココインシチE��ス筁Eの特性学翁E,
    track: "名古屁E,
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
        "value": "木之葵",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "シュヴァルグラン",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "山田祥",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ビ�Eチパトロール",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779222576812",
    version: "v284.1",
    date: "2026-05-19T20:29:36.812Z",
    description: "名古屁E- 好走馬(プラウドブルーベル筁Eの特性学翁E,
    track: "名古屁E,
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
        "value": "近藤颯",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ワールド�Eレミア",
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
        "value": "村上弁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ダノンスマッシュ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779222613422",
    version: "v285.1",
    date: "2026-05-19T20:30:13.422Z",
    description: "名古屁E- 好走馬(ノ�Eブルトレジャー筁Eの特性学翁E,
    track: "名古屁E,
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
        "value": "塚本征E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ダノンスマッシュ",
        "scoreAdjust": 15
      },
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
        "value": "丹羽允E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ベンバトル",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779222640094",
    version: "v286.1",
    date: "2026-05-19T20:30:40.094Z",
    description: "名古屁E- 好走馬(ルミノーゾ筁Eの特性学翁E,
    track: "名古屁E,
    condition: "良",
    adjustments: [
      {
        "field": "jockey",
        "operator": "includes",
        "value": "細川智",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "エイシンヒカリ",
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
        "value": "近藤颯",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ウインブライチE,
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
        "value": "丹羽允E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ゴールドアクター",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779222680945",
    version: "v287.1",
    date: "2026-05-19T20:31:20.945Z",
    description: "名古屁E- 好走馬(ミスチE��ザン筁Eの特性学翁E,
    track: "名古屁E,
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
        "value": "近藤颯",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "オルフェーヴル",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "丸野勝",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ストロングリターン",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779222712995",
    version: "v288.1",
    date: "2026-05-19T20:31:52.995Z",
    description: "名古屁E- 好走馬(アンジェララヴ筁Eの特性学翁E,
    track: "名古屁E,
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
        "value": "松本一",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ダンカーク",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779222842850",
    version: "v289.1",
    date: "2026-05-19T20:34:02.850Z",
    description: "名古屁E- 好走馬(アオレレ筁Eの特性学翁E,
    track: "名古屁E,
    condition: "良",
    adjustments: [
      {
        "field": "jockey",
        "operator": "includes",
        "value": "柿原翁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ラチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779222878030",
    version: "v290.1",
    date: "2026-05-19T20:34:38.030Z",
    description: "名古屁E- 好走馬(エーオ筁Eの特性学翁E,
    track: "名古屁E,
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
        "value": "加藤聡",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "チE��ラレーションオ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779222911845",
    version: "v291.1",
    date: "2026-05-19T20:35:11.845Z",
    description: "名古屁E- 好走馬(アスキスチE��ーロ筁Eの特性学翁E,
    track: "名古屁E,
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
        "value": "今井貴",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ドゥラメンチE,
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
        "value": "大畑�E",
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
    id: "patch_1779222941789",
    version: "v292.1",
    date: "2026-05-19T20:35:41.789Z",
    description: "名古屁E- 好走馬(ワイルドハンター筁Eの特性学翁E,
    track: "名古屁E,
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
        "value": "今井貴",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "マクフィ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779223308466",
    version: "v293.1",
    date: "2026-05-19T20:41:48.466Z",
    description: "大亁E- 好走馬(ファイストス筁Eの特性学翁E,
    track: "大亁E,
    condition: "良",
    adjustments: [
      {
        "field": "weightChange",
        "operator": "<=",
        "value": -10,
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
        "value": "西優品E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "バゴ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "中山遥",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "スピルバ�Eグ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779223339510",
    version: "v294.1",
    date: "2026-05-19T20:42:19.510Z",
    description: "大亁E- 好走馬(フェアリーマイア筁Eの特性学翁E,
    track: "大亁E,
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
        "value": "高橋優",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "レインボ�Eライン",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779223370871",
    version: "v295.1",
    date: "2026-05-19T20:42:50.871Z",
    description: "大亁E- 好走馬(コトブキエース筁Eの特性学翁E,
    track: "大亁E,
    condition: "良",
    adjustments: [
      {
        "field": "jockey",
        "operator": "includes",
        "value": "西優品E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "メイショウボ�Eラー",
        "scoreAdjust": 15
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
        "value": "高橋優",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ヴァンセンチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779223399396",
    version: "v296.1",
    date: "2026-05-19T20:43:19.396Z",
    description: "大亁E- 好走馬(ヨリナスウィート筁Eの特性学翁E,
    track: "大亁E,
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
        "field": "jockey",
        "operator": "includes",
        "value": "藤田凁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "シニスターミニスタ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "東原悠",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "チE��ラレーションオ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779223550370",
    version: "v297.1",
    date: "2026-05-19T20:45:50.370Z",
    description: "大亁E- 好走馬(アバンギャルド筁Eの特性学翁E,
    track: "大亁E,
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
        "value": "矢野貴",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "モーニン",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779223579730",
    version: "v298.1",
    date: "2026-05-19T20:46:19.730Z",
    description: "大亁E- 好走馬(ハクアイソレイユ筁Eの特性学翁E,
    track: "大亁E,
    condition: "良",
    adjustments: [
      {
        "field": "jockey",
        "operator": "includes",
        "value": "野畑凁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "オルフェーヴル",
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
        "value": "鷹見陸",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "カレンブラチE��ヒル",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779223614581",
    version: "v299.1",
    date: "2026-05-19T20:46:54.581Z",
    description: "大亁E- 好走馬(チE��ーズリンク筁Eの特性学翁E,
    track: "大亁E,
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
        "value": "佐野遥",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ハタノヴァンクール",
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
        "value": "中山遥",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ワンダーアキューチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779223644873",
    version: "v300.1",
    date: "2026-05-19T20:47:24.873Z",
    description: "大亁E- 好走馬(アシャニンカ筁Eの特性学翁E,
    track: "大亁E,
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
        "value": "笹川翼",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ダノンレジェンチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779223672737",
    version: "v301.1",
    date: "2026-05-19T20:47:52.737Z",
    description: "大亁E- 好走馬(ピ�Eスフィールド筁Eの特性学翁E,
    track: "大亁E,
    condition: "良",
    adjustments: [
      {
        "field": "jockey",
        "operator": "includes",
        "value": "達城龁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "インカンチE�Eション",
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
        "value": "本田釁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "グレーターロンドン",
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
        "value": "十E��洁E,
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
    id: "patch_1779223707969",
    version: "v302.1",
    date: "2026-05-19T20:48:27.969Z",
    description: "大亁E- 好走馬(ドキドキ筁Eの特性学翁E,
    track: "大亁E,
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
        "value": "和田譲",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "モーニン",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779231443777",
    version: "v304.1",
    date: "2026-05-19T22:57:23.777Z",
    description: "盛岡 - 好走馬(マナホクレア筁Eの特性学翁E,
    track: "盛岡",
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
        "value": "菁E��辰",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "アメリカンペイトリ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "佐、E��E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ニューイヤーズチE��",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779231475689",
    version: "v305.1",
    date: "2026-05-19T22:57:55.689Z",
    description: "盛岡 - 好走馬(カールルイコ筁Eの特性学翁E,
    track: "盛岡",
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
        "value": "高橋悠",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ロジャーバローズ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "岩本态E,
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
    id: "patch_1779231518049",
    version: "v306.1",
    date: "2026-05-19T22:58:38.049Z",
    description: "盛岡 - 好走馬(サクラカゼ筁Eの特性学翁E,
    track: "盛岡",
    condition: "良",
    adjustments: [
      {
        "field": "jockey",
        "operator": "includes",
        "value": "山本聡",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "シルバ�EスチE�EチE,
        "scoreAdjust": 15
      },
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
        "value": "高橋悠",
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
    id: "patch_1779239353861",
    version: "v307.1",
    date: "2026-05-20T01:09:13.861Z",
    description: "東京 - 好走馬(エンブロイダリー筁Eの特性学翁E,
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
        "value": "C.ルメール",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "アド�Eイヤマ�Eズ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "川田 封E��",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ブラチE��タイチE,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "西杁E淳乁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "キズチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779247589800",
    version: "v308.1",
    date: "2026-05-20T03:26:29.800Z",
    description: "新潁E- 好走馬(ハイロード筁Eの特性学翁E,
    track: "新潁E,
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
        "value": "斎藤 新",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "シニスターミニスター",
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
        "value": "クリソベリル",
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
        "value": "西塁E洸亁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "アスクピ�Eターパン",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779247631214",
    version: "v309.1",
    date: "2026-05-20T03:27:11.214Z",
    description: "新潁E- 好走馬(シュヴァルチE��ルト筁Eの特性学翁E,
    track: "新潁E,
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
        "value": "小林 美駁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ミスチヴィアスアレチE��ス",
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
        "value": "荻釁E極",
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
    id: "patch_1779247671887",
    version: "v310.1",
    date: "2026-05-20T03:27:51.887Z",
    description: "新潁E- 好走馬(バンオンタイム筁Eの特性学翁E,
    track: "新潁E,
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
        "value": "舟山 瑠況E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ロードカナロア",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "武藤 雁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "コパノリチE��ー",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779247705127",
    version: "v311.1",
    date: "2026-05-20T03:28:25.127Z",
    description: "新潁E- 好走馬(ワンダーブリチE��筁Eの特性学翁E,
    track: "新潁E,
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
        "value": "西杁E淳乁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "クリソベリル",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779247764183",
    version: "v312.1",
    date: "2026-05-20T03:29:24.183Z",
    description: "新潁E- 好走馬(トリニタリオ筁Eの特性学翁E,
    track: "新潁E,
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
        "value": "斎藤 新",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ウインブライチE,
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
        "value": "石祁E深遁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ダノンバラーチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779247807506",
    version: "v313.1",
    date: "2026-05-20T03:30:07.506Z",
    description: "新潁E- 好走馬(ミルトメロチE��ー筁Eの特性学翁E,
    track: "新潁E,
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
        "value": "☁E��原田 菜、E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "インチE��チャンチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779247843375",
    version: "v314.1",
    date: "2026-05-20T03:30:43.375Z",
    description: "新潁E- 好走馬(シャンハイナイト筁Eの特性学翁E,
    track: "新潁E,
    condition: "良",
    adjustments: [
      {
        "field": "jockey",
        "operator": "includes",
        "value": "☁E��原田 菜、E,
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
    id: "patch_1779247878464",
    version: "v315.1",
    date: "2026-05-20T03:31:18.464Z",
    description: "新潁E- 好走馬(ファルコンミノル筁Eの特性学翁E,
    track: "新潁E,
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
        "value": "ゴールドシチE�E",
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
        "value": "西杁E淳乁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "American Pharoah",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779247917558",
    version: "v316.1",
    date: "2026-05-20T03:31:57.558Z",
    description: "新潁E- 好走馬(ルールーリマ筁Eの特性学翁E,
    track: "新潁E,
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
        "field": "sire",
        "operator": "includes",
        "value": "キズチE,
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
        "value": "杉原 誠人",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ブリチE��スアンドモルタル",
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
        "value": "荻釁E極",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ドゥラメンチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779247959365",
    version: "v317.1",
    date: "2026-05-20T03:32:39.365Z",
    description: "新潁E- 好走馬(マルガイアークド�Eル筁Eの特性学翁E,
    track: "新潁E,
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
        "value": "武 豁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "Golden Horn",
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
        "value": "丹冁E祐次",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "マジェスチE��チE��ウォリアー",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779248025202",
    version: "v318.1",
    date: "2026-05-20T03:33:45.202Z",
    description: "新潁E- 好走馬(バレエマスター筁Eの特性学翁E,
    track: "新潁E,
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
        "value": "スピルバ�Eグ",
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
        "value": "ウインブライチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779248071285",
    version: "v319.1",
    date: "2026-05-20T03:34:31.285Z",
    description: "新潁E- 好走馬(サンタアニタ筁Eの特性学翁E,
    track: "新潁E,
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
        "value": "サートゥルナ�Eリア",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779360784167",
    version: "v320.1",
    date: "2026-05-21T10:53:04.167Z",
    description: "名古屁E- 好走馬(カミ�Eチェ筁Eの特性学翁E,
    track: "名古屁E,
    condition: "釁E,
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
        "value": "☁E��笠羁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "マクフィ",
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
        "value": "渡邊竁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "チE��スクリートキャ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779360810171",
    version: "v321.1",
    date: "2026-05-21T10:53:30.171Z",
    description: "名古屁E- 好走馬(サクリファイス筁Eの特性学翁E,
    track: "名古屁E,
    condition: "釁E,
    adjustments: [
      {
        "field": "jockey",
        "operator": "includes",
        "value": "大畑�E",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "アメリカンペイトリ",
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
        "value": "☁E��笠羁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "リオンチE��ーズ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779360853917",
    version: "v322.1",
    date: "2026-05-21T10:54:13.917Z",
    description: "名古屁E- 好走馬(オイチノカタ筁Eの特性学翁E,
    track: "名古屁E,
    condition: "釁E,
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
        "value": "☁E��笠羁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "インカンチE�Eション",
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
        "value": "加藤聡",
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
    id: "patch_1779360877375",
    version: "v323.1",
    date: "2026-05-21T10:54:37.375Z",
    description: "名古屁E- 好走馬(スターインパクト筁Eの特性学翁E,
    track: "名古屁E,
    condition: "釁E,
    adjustments: [
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
        "value": "加藤聡",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "リアルインパクチE,
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
        "value": "塚本征E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ベストウォーリア",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779360937207",
    version: "v324.1",
    date: "2026-05-21T10:55:37.207Z",
    description: "名古屁E- 好走馬(ミニマルチE��イン筁Eの特性学翁E,
    track: "名古屁E,
    condition: "不良",
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
        "value": "加藤聡",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ストロングリターン",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "今井貴",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ヘニーヒューズ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779360967609",
    version: "v325.1",
    date: "2026-05-21T10:56:07.609Z",
    description: "名古屁E- 好走馬(チE�Eオーエメラルド筁Eの特性学翁E,
    track: "名古屁E,
    condition: "不良",
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
        "value": "☁E��笠羁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "コパノリチE��ー",
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
        "value": "丹羽允E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "レイチE��ロ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779360993009",
    version: "v326.1",
    date: "2026-05-21T10:56:33.009Z",
    description: "名古屁E- 好走馬(ゴールドレーン筁Eの特性学翁E,
    track: "名古屁E,
    condition: "不良",
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
        "value": "友森翁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ミスチヴィアスアレ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "加藤聡",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ダノンスマッシュ",
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
        "value": "丸野勝",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "チE��ラレーションオ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779411183344",
    version: "v296.1",
    date: "2026-05-22T00:53:03.344Z",
    description: "京都 - 好走馬(チE��チE��モーネ筁Eの特性学翁E,
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
        "field": "jockey",
        "operator": "includes",
        "value": "幸 英昁E,
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
        "value": "渡辺 竜乁E,
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
    id: "patch_1779609020992",
    version: "v328.1",
    date: "2026-05-24T07:50:20.992Z",
    description: "高知 - 好走馬(シチE��イチE��ン筁Eの特性学翁E,
    track: "高知",
    condition: "不良",
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
        "value": "佐原秀",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "エイシンフラチE��ュ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779609061568",
    version: "v329.1",
    date: "2026-05-24T07:51:01.568Z",
    description: "高知 - 好走馬(エートゥージー筁Eの特性学翁E,
    track: "高知",
    condition: "不良",
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
        "value": "上田封E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "インチE��チャンチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779609086274",
    version: "v330.1",
    date: "2026-05-24T07:51:26.275Z",
    description: "高知 - 好走馬(リュウノラブゲーム筁Eの特性学翁E,
    track: "高知",
    condition: "不良",
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
        "value": "上田封E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ダノンレジェンチE,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "阿部基",
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
        "field": "age",
        "operator": ">=",
        "value": 8,
        "scoreAdjust": 20
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "佐原秀",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ブラチE��タイチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779609141251",
    version: "v331.1",
    date: "2026-05-24T07:52:21.251Z",
    description: "高知 - 好走馬(スマイル筁Eの特性学翁E,
    track: "高知",
    condition: "不良",
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
        "value": "大澤誠",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ダイワメジャー",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "阿部基",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "マクフィ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779615489938",
    version: "v332.1",
    date: "2026-05-24T09:38:09.938Z",
    description: "京都 - 好走馬(ガイアメンチE��Eの特性学翁E,
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
        "field": "jockey",
        "operator": "includes",
        "value": "団釁E大戁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ドゥラメンチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779615617045",
    version: "v333.1",
    date: "2026-05-24T09:40:17.045Z",
    description: "京都 - 好走馬(ルクスチE��ジー筁Eの特性学翁E,
    track: "京都",
    condition: "良",
    adjustments: [
      {
        "field": "jockey",
        "operator": "includes",
        "value": "団釁E大戁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "カリフォルニアクローム",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779615676734",
    version: "v334.1",
    date: "2026-05-24T09:41:16.734Z",
    description: "東京 - 好走馬(チムグクル筁Eの特性学翁E,
    track: "東京",
    condition: "良",
    adjustments: [
      {
        "field": "jockey",
        "operator": "includes",
        "value": "C.ルメール",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ラブリーチE��",
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
        "value": "横山 武史",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "Frankel",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779615724737",
    version: "v335.1",
    date: "2026-05-24T09:42:04.737Z",
    description: "東京 - 好走馬(サーロー筁Eの特性学翁E,
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
        "value": "佐、E�� 大輁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ヘンリーバローズ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "横山 典弁E,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779615768691",
    version: "v336.1",
    date: "2026-05-24T09:42:48.691Z",
    description: "東京 - 好走馬(ヌクレオチド筁Eの特性学翁E,
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
        "value": "横山 典弁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "モズアスコチE��",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779615806508",
    version: "v337.1",
    date: "2026-05-24T09:43:26.508Z",
    description: "東京 - 好走馬(クアチE��フォルチE��筁Eの特性学翁E,
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
        "value": "M.チE��ー",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ゴールドドリーム",
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
        "value": "吉田 豁E,
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
        "value": "佐、E�� 大輁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "アド�Eイヤマ�Eズ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779615849223",
    version: "v338.1",
    date: "2026-05-24T09:44:09.223Z",
    description: "東京 - 好走馬(フリーヤ筁Eの特性学翁E,
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
        "value": "横山 武史",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ベンバトル",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "M.チE��ー",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ロードカナロア",
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
        "value": "松岡 正海",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ミッキーアイル",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779615924163",
    version: "v339.1",
    date: "2026-05-24T09:45:24.163Z",
    description: "東京 - 好走馬(ボニープリンス筁Eの特性学翁E,
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
        "value": "D.レーン",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "レイチE��ロ",
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
        "value": "田辺 裕信",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "コントレイル",
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
        "value": "柴田 大知",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ゴールドシチE�E",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779615965579",
    version: "v340.1",
    date: "2026-05-24T09:46:05.579Z",
    description: "東京 - 好走馬(ゴールドバローズ筁Eの特性学翁E,
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
        "value": "荻釁E極",
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
    id: "patch_1779616015119",
    version: "v341.1",
    date: "2026-05-24T09:46:55.119Z",
    description: "東京 - 好走馬(ルナルーチェチE��筁Eの特性学翁E,
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
        "field": "jockey",
        "operator": "includes",
        "value": "田辺 裕信",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ブリチE��スアンドモルタル",
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
        "value": "石巁E裕紀人",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ドゥラメンチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1780104630767",
    version: "v342.1",
    date: "2026-05-30T01:30:30.767Z",
    description: "東京 - 好走馬(コウユーニ�Eポニコ筁Eの特性学翁E,
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
        "value": "石田 拓郎",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "タリスマニチE��",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1780104693607",
    version: "v343.1",
    date: "2026-05-30T01:31:33.607Z",
    description: "浦咁E- 好走馬(ラブシリカ筁Eの特性学翁E,
    track: "浦咁E,
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
        "value": "野畑凁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ダノンスマッシュ",
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
        "value": "福原杁E,
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
        "value": "中山遥",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "サトノアレス",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1780104721315",
    version: "v344.1",
    date: "2026-05-30T01:32:01.315Z",
    description: "浦咁E- 好走馬(オーチE��リチE��ー筁Eの特性学翁E,
    track: "浦咁E,
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
        "value": "秋�E老E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "コパノリチE��ー",
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
        "value": "加藤雁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ノ�EジャチE��",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1780104753894",
    version: "v345.1",
    date: "2026-05-30T01:32:33.894Z",
    description: "浦咁E- 好走馬(センチュリーラヴ筁Eの特性学翁E,
    track: "浦咁E,
    condition: "良",
    adjustments: [
      {
        "field": "weight",
        "operator": "<=",
        "value": 440,
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
        "value": "中島良",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ヘンリーバローズ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "岡村裁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "リオンチE��ーズ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1780104784883",
    version: "v346.1",
    date: "2026-05-30T01:33:04.883Z",
    description: "浦咁E- 好走馬(モーニンジェーピ�E筁Eの特性学翁E,
    track: "浦咁E,
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
        "value": "(変更)",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "モーニン",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "中越琉",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "カレンブラチE��ヒル",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1780104815136",
    version: "v347.1",
    date: "2026-05-30T01:33:35.136Z",
    description: "浦咁E- 好走馬(ヴァルヴァラ筁Eの特性学翁E,
    track: "浦咁E,
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
        "value": "岡村健",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "カリフォルニアクロ",
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
        "value": "町田直",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "トゥザワールチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1780137256515",
    version: "v315.1",
    date: "2026-05-30T10:34:16.515Z",
    description: "東京 - 好走馬(コウユーニ�Eポニコ筁Eの特性学翁E,
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
        "value": "石田 拓郎",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "タリスマニチE��",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1780137308123",
    version: "v316.1",
    date: "2026-05-30T10:35:08.123Z",
    description: "東京 - 好走馬(ゴンファロニエーレ筁Eの特性学翁E,
    track: "東京",
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
        "value": "戸崁E圭太",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "エピファネイア",
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
        "value": "木幡 初乁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "バゴ",
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
        "value": "江田 照男",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ジャスタウェイ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1780137354738",
    version: "v317.1",
    date: "2026-05-30T10:35:54.738Z",
    description: "東京 - 好走馬(ワチE��アルリヤハ筁Eの特性学翁E,
    track: "東京",
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
        "value": "D.レーン",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "St Mark's Basilica",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        "operator": "<=",
        "value": 440,
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
        "value": "舟山 瑠況E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "シルバ�EスチE�EチE,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1780628624856",
    version: "v318.1",
    date: "2026-06-05T03:03:44.856Z",
    description: "門別 - 好走馬(スト�Eリータイム筁Eの特性学翁E,
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
        "field": "weightChange",
        "operator": "<=",
        "value": -10,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "服部茁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "チE��ープブリランチE,
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        "operator": "<=",
        "value": 440,
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
        "value": "若杉朝",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ローエングリン",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1780629925341",
    version: "v1.1",
    date: "2026-06-05T03:25:25.341Z",
    description: "門別 - 好走馬(モウフブキ筁Eの特性学翁E,
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
        "operator": ">=",
        "value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        "operator": "includes",
        "value": "渡邊溁E,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ラブリーチE��",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1780888010796",
    version: "v1.1",
    date: "2026-06-08T03:06:50.796Z",
    description: "東京 - 好走馬(タガノバルコス筁Eの特性学翁E,
    track: "東京",
    condition: "良",
    adjustments: [
      {
        field: "weight",
        operator: ">=",
        value: 480,
        scoreAdjust: 10
      },
      {
        field: "frame",
        operator: ">=",
        "value": 7,
        scoreAdjust: 15
      },
      {
        field: "jockey",
        operator: "includes",
        value: "高田 潤",
        scoreAdjust: 15
      },
      {
        field: "sire",
        operator: "includes",
        value: "キタサンブラチE��",
        scoreAdjust: 15
      }
    ],
    active: true
  },
  {
    id: "patch_1780888192247",
    version: "v2.1",
    date: "2026-06-08T03:09:52.247Z",
    description: "東京 - 好走馬(アイアンパイク筁Eの特性学翁E,
    track: "東京",
    condition: "良",
    adjustments: [
      {
        field: "age",
        operator: "==",
        value: 3,
        scoreAdjust: 15
      },
      {
        field: "jockey",
        operator: "includes",
        value": "横山 典弁E,
        scoreAdjust: 15
      },
      {
        field: "sire",
        operator: "includes",
        value": "ヘンリーバローズ",
        scoreAdjust: 15
      },
      {
        field: "frame",
        operator: "<=",
        value: 2,
        scoreAdjust: 15
      },
      {
        field: "jockey",
        operator": "includes",
        value": "横山 武史",
        scoreAdjust: 15
      },
      {
        field": "sire",
        operator": "includes",
        value": "ダノンキングリー",
        scoreAdjust: 15
      }
    ],
    active: true
  },
  {
    id: "patch_1780888233271",
    version: "v3.1",
    date: "2026-06-08T03:10:33.271Z",
    description: "東京 - 好走馬(レイズチE��ペスト筁Eの特性学翁E,
    track: "東京",
    condition: "良",
    adjustments: [
      {
        field: "weight",
        operator: ">=",
        value: 480,
        scoreAdjust: 10
      },
      {
        field: "weightChange",
        operator: ">=",
        value": 10,
        scoreAdjust: 15
      },
      {
        field: "frame",
        operator: ">=",
        value": 7,
        scoreAdjust: 15
      },
      {
        field: "age",
        operator: "==",
        value": 3,
        scoreAdjust: 15
      },
      {
        field: "jockey",
        operator: "includes",
        value": "横山 和生",
        scoreAdjust: 15
      },
      {
        field: "sire",
        operator": "includes",
        value": "カリフォルニアクローム",
        scoreAdjust: 15
      },
      {
        field: "jockey",
        operator: "includes",
        value": "佐、E�� 大輁E,
        scoreAdjust: 15
      },
      {
        field: "sire",
        operator": "includes",
        value": "ロジャーバローズ",
        scoreAdjust: 15
      },
      {
        field: "jockey",
        operator: "includes",
        value": "戸崁E圭太",
        scoreAdjust: 15
      },
      {
        field: "sire",
        operator": "includes",
        value": "ロードカナロア",
        scoreAdjust: 15
      }
    ],
    active: true
  },
  {
    id: "patch_1780888426794",
    version: "v4.1",
    date: "2026-06-08T03:13:46.794Z",
    description: "東京 - 好走馬(リリカルフレア筁Eの特性学翁E,
    track: "東京",
    condition: "良",
    adjustments: [
      {
        field: "weight",
        operator: "<=",
        value: 440,
        scoreAdjust: 10
      },
      {
        field: "jockey",
        operator": "includes",
        value": "津杁E明秀",
        scoreAdjust: 15
      },
      {
        field: "sire",
        operator": "includes",
        value": "ポエチE��チE��フレア",
        scoreAdjust: 15
      },
      {
        field": "jockey",
        operator": "includes",
        value": "横山 武史",
        scoreAdjust: 15
      },
      {
        field: "sire",
        operator": "includes",
        value": "サートゥルナ�Eリア",
        scoreAdjust: 15
      }
    ],
    active: true
  },
  {
    id: "patch_1780888467784",
    version: "v5.1",
    date: "2026-06-08T03:14:27.784Z",
    description: "東京 - 好走馬(フィリオソラーレ筁Eの特性学翁E,
    track: "東京",
    condition: "良",
    adjustments: [
      {
        field: "weight",
        operator: ">=",
        value: 480,
        scoreAdjust: 10
      },
      {
        field: "frame",
        operator: "<=",
        value": 2,
        scoreAdjust: 15
      },
      {
        field: "jockey",
        operator: "includes",
        value": "C.ルメール",
        scoreAdjust: 15
      },
      {
        field: "sire",
        operator: "includes",
        value": "エピファネイア",
        scoreAdjust: 15
      },
      {
        field: "jockey",
        operator": "includes",
        value": "横山 武史",
        scoreAdjust: 15
      },
      {
        field: "sire",
        operator": "includes",
        value": "エフフォーリア",
        scoreAdjust: 15
      }
    ],
    active: true
  }
];
