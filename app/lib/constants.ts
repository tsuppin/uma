import { LearningPatch } from "../types";

// ==========================================
// 蛻晄悄蟄ｦ鄙偵ヱ繝・メ (繝翫Ξ繝・ず繝吶・繧ｹ縺九ｉ謚ｽ蜃ｺ縺励◆逅・ｫ・+ 螳溽ｸｾ蟄ｦ鄙・
// ==========================================
export const INITIAL_PATCHES: LearningPatch[] = [
  // ==========================================
  // 縲千炊隲門､縲大・譛溘ヱ繝・メ
  // ==========================================
  {
    id: "initial_kasamatsu_power",
    version: "v1.0.base",
    date: "2026-05-01T00:00:00Z",
    description: "隨�譚ｾ・・10kg莉･荳翫・驥埼㍼鬥ｬ縺ｫ繧医ｋ遐ゅ・謚ｵ謚礼ｪ∫�ｴ・育炊隲門､・・,
    track: "隨�譚ｾ",
    adjustments: [
      { field: "weight", operator: ">=", value: 510, scoreAdjust: 25 }
    ],
    active: true
  },
  {
    id: "initial_kasamatsu_lightweight_cutoff",
    version: "v1.0.base",
    date: "2026-05-01T00:00:00Z",
    description: "隨�譚ｾ・・30kg莉･荳九・霆ｽ驥城ｦｬ縺ｫ繧医ｋ迚ｩ逅・噪髯千阜・育炊隲門､・・,
    track: "隨�譚ｾ",
    adjustments: [
      { field: "weight", operator: "<=", value: 430, scoreAdjust: -35 }
    ],
    active: true
  },
  {
    id: "initial_jra_transfer_risk",
    version: "v1.0.base",
    date: "2026-05-01T00:00:00Z",
    description: "JRA霆｢蜈･蛻晄姶縺ｮ遐る←蠢懊Μ繧ｹ繧ｯ・育炊隲門､・・,
    adjustments: [
      { field: "isTransferFirstRace", operator: "==", value: 1, scoreAdjust: -15 }
    ],
    active: true
  },

  // ==========================================
  // 縲仙ｮ溽ｸｾ蟄ｦ鄙偵大・蝣ｴ蜈ｱ騾夲ｼ夊､・焚遶ｶ鬥ｬ蝣ｴ縺ｧ郢ｰ繧願ｿ斐＠遒ｺ隱阪＆繧後◆譎ｮ驕阪ヱ繧ｿ繝ｼ繝ｳ
  // 譚ｱ莠ｬ/莠ｬ驛ｽ/髢蛻･/螟ｧ莠・驥第ｲ｢/豌ｴ豐｢縺ｧ蜷御ｸ蛯ｾ蜷・竊・蜈ｨ蝣ｴ蜈ｱ騾壹→縺励※譬ｼ荳翫￡
  // ==========================================
  {
    id: "learned_global_heavy_horse_bonus",
    version: "v14.0.consolidated",
    date: "2026-05-02T06:00:00Z",
    description: "縲仙・蝣ｴ蜈ｱ騾壹・80kg莉･荳翫・驥埼㍼鬥ｬ蜆ｪ菴搾ｼ域擲莠ｬ繝ｻ莠ｬ驛ｽ繝ｻ髢蛻･繝ｻ螟ｧ莠輔・驥第ｲ｢繝ｻ豌ｴ豐｢縺ｧ郢ｰ繧願ｿ斐＠遒ｺ隱搾ｼ・,
    adjustments: [
      { field: "weight", operator: ">=", value: 480, scoreAdjust: 10 }
    ],
    active: true
  },

  // ==========================================
  // 縲仙ｮ溽ｸｾ蟄ｦ鄙偵大崋譛峨ヱ繝・メ・亥・蝣ｴ蜈ｱ騾壹→蟾ｮ蛻･蛹悶〒縺阪ｋ繧ゅ・・・
  // ==========================================
  {
    id: "patch_funabashi_heavy_horse_good",
    version: "v4.1",
    date: "2026-05-07T02:51:29.505Z",
    description: "闊ｹ讖九・濶ｯ鬥ｬ蝣ｴ・・80kg莉･荳翫・驥埼㍼鬥ｬ蜆ｪ菴搾ｼ医Ζ繧ｮ繝ｪ繧｢繧､繝薙せ蜆ｪ蜍晏ｮ溽ｸｾ・・,
    track: "闊ｹ讖・,
    condition: "濶ｯ",
    adjustments: [
      { field: "weight", operator: ">=", value: 480, scoreAdjust: 10 }
    ],
    active: true
  },
  {
    id: "patch_kanazawa_good_weight_change",
    version: "v1.1",
    date: "2026-04-30T04:18:21.131Z",
    description: "驥第ｲ｢繝ｻ濶ｯ鬥ｬ蝣ｴ・・0kg莉･荳雁｢怜刈縺励◆鬥ｬ縺ｮ謌宣聞蜉�騾滂ｼ医ヵ繧｡繧､繝､繝ｼ繝翫う繝募━蜍晏ｮ溽ｸｾ・・,
    track: "驥第ｲ｢",
    condition: "濶ｯ",
    adjustments: [
      { field: "weightChange", operator: ">=", value: 10, scoreAdjust: 15 }
    ],
    active: true
  },
  {
    id: "patch_kanazawa_heavy_good",
    version: "v7.2",
    date: "2026-05-01T22:56:37.642Z",
    description: "驥第ｲ｢繝ｻ驥埼ｦｬ蝣ｴ・・80kg莉･荳翫・驥埼㍼鬥ｬ蜆ｪ菴搾ｼ医い繧ｪ繧､繝溘Δ繧ｶ蜆ｪ蜍晏ｮ溽ｸｾ・・,
    track: "驥第ｲ｢",
    condition: "驥・,
    adjustments: [
      { field: "weight", operator: ">=", value: 480, scoreAdjust: 12 }
    ],
    active: true
  },
  {
    id: "patch_ooi_heavy_rain_horse",
    version: "v6.3.consolidated",
    date: "2026-05-01T22:22:59.120Z",
    description: "螟ｧ莠輔・荳崎憶鬥ｬ蝣ｴ・・80kg莉･荳翫・驥埼㍼鬥ｬ蜆ｪ菴搾ｼ医け繧｢繝・ぜ繝ｻ繝ｯ繝翫ワ繝ｴ繝輔ぃ繝ｳ 2莉ｶ遒ｺ隱搾ｼ・,
    track: "螟ｧ莠・,
    condition: "荳崎憶",
    adjustments: [
      { field: "weight", operator: ">=", value: 480, scoreAdjust: 15 }
    ],
    active: true
  },
  {
    id: "patch_mizusawa_ya繧Юheavy",
    version: "v4.9",
    date: "2026-04-30T10:53:27.357Z",
    description: "豌ｴ豐｢繝ｻ遞埼㍾・・80kg莉･荳翫・驥埼㍼鬥ｬ蜆ｪ菴搾ｼ医・繧ｵ繝弱ン繧ｸ繝ｧ繝ｳ蜆ｪ蜍晏ｮ溽ｸｾ・・,
    track: "豌ｴ豐｢",
    condition: "遞埼㍾",
    adjustments: [
      { field: "weight", operator: ">=", value: 480, scoreAdjust: 10 }
    ],
    active: true
  },
  {
    id: "patch_1778809055791",
    version: "v12.1",
    date: "2026-05-15T01:37:35.791Z",
    description: "逶帛ｲ｡ - 蜍昴■鬥ｬ(繧ｯ繧､繝ｼ繝ｳ繧ｫ繝ｼ繝・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "逶帛ｲ｡",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      }
    ],
    active: true
  },
  {
    id: "patch_1778822133641",
    version: "v44.1",
    date: "2026-05-15T05:15:33.641Z",
    description: "隨�譚ｾ - 螂ｽ襍ｰ鬥ｬ(繧ｭ繧ｿ繝弱い繝ｳ繧ｷ繧ｧ繝ｫ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "隨�譚ｾ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "鮟帝ｹｿ豈・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｭ繧ｸ繝｣繝ｼ繝舌Ο繝ｼ繧ｺ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譏取弌譎ｴ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝帙・繧ｯ繝薙Ν",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778834476597",
    version: "v45.1",
    date: "2026-05-15T08:41:16.597Z",
    description: "髢蛻･ - 螂ｽ襍ｰ鬥ｬ(繧ｯ繝ｼ繝ｫ繧ｫ繧ｰ繝ｩ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "髢蛻･",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "髱帝ｹｿ豈・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｷ繝｣繝ｳ繝上う繝懊ン繝ｼ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778834517246",
    version: "v46.1",
    date: "2026-05-15T08:41:57.246Z",
    description: "髢蛻･ - 螂ｽ襍ｰ鬥ｬ(繝悶Λ繧､繝医・繧ｦ繧ｷ繝ｧ繧ｦ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "髢蛻･",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "遏ｳ蟾晏ｭ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧｢繧ｸ繧｢繧ｨ繧ｯ繧ｹ繝励Ξ繧ｹ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778834729835",
    version: "v47.1",
    date: "2026-05-15T08:45:29.835Z",
    description: "髢蛻･ - 螂ｽ襍ｰ鬥ｬ(繧｢繝ｼ繧ｹ繧ｹ繧ｫ繝ｼ繝ｬ繝・ヨ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "髢蛻･",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": ">=",
        ""value": 8,
        "scoreAdjust": 20
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蝮ゆｸ狗ｧ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝繧､繝ｯ繝｡繧ｸ繝｣繝ｼ",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "鮟帝ｹｿ豈・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｬ繝ｼ繝ｴ繝溘せ繝医Λ繝ｫ",
        "scoreAdjust": 15
      },
      {
        "field": "weightChange",
        ""operator": ">=",
        ""value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蟆城㍽讌・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｷ繝･繝ｴ繧｡繝ｫ繧ｰ繝ｩ繝ｳ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778834777575",
    version: "v48.1",
    date: "2026-05-15T08:46:17.575Z",
    description: "髢蛻･ - 螂ｽ襍ｰ鬥ｬ(繧ｹ繧､繝ｬ繝ｳ繝√Ε繝ｳ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "髢蛻･",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蟆城㍽讌・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｩ繝悶Μ繝ｼ繝・う",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778841887566",
    version: "v16.1",
    date: "2026-05-15T10:44:47.566Z",
    description: "隨�譚ｾ - 螂ｽ襍ｰ鬥ｬ(繝ｪ繝・け繧ｫ繝ｪ繝ｼ繝顔ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "隨�譚ｾ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "(-)",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｭ繧ｴ繧ｿ繧､繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778841950299",
    version: "v17.1",
    date: "2026-05-15T10:45:50.299Z",
    description: "隨�譚ｾ - 螂ｽ襍ｰ鬥ｬ(繝ｦ繧､繝弱し繧ｷ繧ｬ繝咲ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "隨�譚ｾ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蝪壽悽蠕・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧｢繝ｫ繧｢繧､繝ｳ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778841984685",
    version: "v18.1",
    date: "2026-05-15T10:46:24.685Z",
    description: "隨�譚ｾ - 螂ｽ襍ｰ鬥ｬ(繧ｷ繝｣繝ｫ繝｡繧､繝薙せ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "隨�譚ｾ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weightChange",
        ""operator": ">=",
        ""value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "螟ｧ逡第・",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝上・繝薙Φ繧ｸ繝｣繝ｼ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778842496207",
    version: "v19.1",
    date: "2026-05-15T10:54:56.207Z",
    description: "隨�譚ｾ - 螂ｽ襍ｰ鬥ｬ(繝偵Ο繝弱Λ繝輔ぃ繝ｼ繝ｫ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "隨�譚ｾ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蜉�阯､閨｡",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝｢繧ｺ繧｢繧ｹ繧ｳ繝・ヨ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "鬮俶惠蛛･",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝弱Χ繧ｧ繝ｪ繧ｹ繝・,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蜷大ｱｱ迚ｧ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｳ繝代ヮ繝ｪ繝・く繝ｼ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778842531663",
    version: "v20.1",
    date: "2026-05-15T10:55:31.663Z",
    description: "隨�譚ｾ - 螂ｽ襍ｰ鬥ｬ(繧ｷ繝･繝阪Ν繧ｫ繧ｬ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "隨�譚ｾ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "鮟帝ｹｿ豈・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｷ繧ｲ繝ｫ繧ｫ繧ｬ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧｢繝｡繝ｪ繧ｫ繝ｳ繝壹う繝医Μ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778842568488",
    version: "v21.1",
    date: "2026-05-15T10:56:08.488Z",
    description: "隨�譚ｾ - 螂ｽ襍ｰ鬥ｬ(繧ｸ繝｣繧ｹ繧ｿ繝代・繝・ぅ繝ｼ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "隨�譚ｾ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "鮟帝ｹｿ豈・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝｢繝ｼ繝ｪ繧ｹ",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "莠募哨陬・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝､繝槭き繝・お繝ｼ繧ｹ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778842611274",
    version: "v22.1",
    date: "2026-05-15T10:56:51.274Z",
    description: "隨�譚ｾ - 螂ｽ襍ｰ鬥ｬ(繧ｴ繝ｼ繧ｸ繝｣繧ｹ繝ｬ繝・ぅ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "隨�譚ｾ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "阯､蜴溷ｹｹ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝代う繝ｭ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "鬮俶惠蛛･",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧｢繧ｸ繧｢繧ｨ繧ｯ繧ｹ繝励Ξ繧ｹ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778842643140",
    version: "v23.1",
    date: "2026-05-15T10:57:23.140Z",
    description: "隨�譚ｾ - 螂ｽ襍ｰ鬥ｬ(繧ｨ繧､繧ｷ繝ｳ繧ｽ繝ｭ繝｢繝ｳ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "隨�譚ｾ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譽ｮ蟲ｶ雋ｴ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧｢繝ｫ繧｢繧､繝ｳ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778842680003",
    version: "v24.1",
    date: "2026-05-15T10:58:00.003Z",
    description: "隨�譚ｾ - 螂ｽ襍ｰ鬥ｬ(繝偵Ν繝弱ヶ繝ｪ繧ｹ繝吶Φ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "隨�譚ｾ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譏取弌譎ｴ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝悶Μ繝・け繧ｹ繧｢繝ｳ繝峨Δ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "鬥ｬ貂慕ｹ・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｪ繧｢繝ｫ繧､繝ｳ繝代け繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778846188294",
    version: "v58.1",
    date: "2026-05-15T11:56:28.294Z",
    description: "蟾晏ｴ・- 螂ｽ襍ｰ鬥ｬ(繝上・繝舌・繧ｷ繝ｧ繝ｼ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蟾晏ｴ・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "鮟帝ｹｿ豈・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｫ繝ｴ繧｡繝ｳ繧ｹ繝ｬ繝ｼ繝ｴ",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蜥檎伐隴ｲ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧｢繝｡繝ｪ繧ｫ繝ｳ繝壹う繝医Μ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778846294019",
    version: "v59.1",
    date: "2026-05-15T11:58:14.019Z",
    description: "蟾晏ｴ・- 螂ｽ襍ｰ鬥ｬ(繝ｫ繝ｪ繝ｼ繝ｫ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蟾晏ｴ・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譁ｰ蜴溷捉",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝・ぅ繝ｼ繝励ヶ繝ｪ繝ｩ繝ｳ繝・,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譛ｬ逕ｰ邏",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｨ繝斐き繝ｪ繧ｹ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778847400743",
    version: "v60.1",
    date: "2026-05-15T12:16:40.743Z",
    description: "蟾晏ｴ・- 螂ｽ襍ｰ鬥ｬ(繧ｨ繝ｬ繝輔ぃ繝ｳ繝医Λ繝ｳ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蟾晏ｴ・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蠕｡逾櫁ｨ・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝九Η繝ｼ繧､繝､繝ｼ繧ｺ繝・う",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "鮟帝ｹｿ豈・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝輔Μ繧ｪ繝ｼ繧ｽ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譁ｰ蜴溷捉",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝上・繝薙Φ繧ｸ繝｣繝ｼ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778847444854",
    version: "v61.1",
    date: "2026-05-15T12:17:24.855Z",
    description: "蟾晏ｴ・- 螂ｽ襍ｰ鬥ｬ(繝弱・繝悶Ν繧ｲ繧､繝ｫ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蟾晏ｴ・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蜥檎伐隴ｲ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｭ繝ｼ繧ｸ繧ｺ繧､繝ｳ繝｡繧､",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778847490909",
    version: "v62.1",
    date: "2026-05-15T12:18:10.909Z",
    description: "蟾晏ｴ・- 螂ｽ襍ｰ鬥ｬ(繝斐Φ繧ｯ繧ｿ繧ｪ繝ｫ繝√Ε繝ｳ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蟾晏ｴ・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "隨ｹ蟾晉ｿｼ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝医ン繝ｼ繧ｺ繧ｳ繝ｼ繝翫・",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "鮟帝ｹｿ豈・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝繝弱Φ繝ｬ繧ｸ繧ｧ繝ｳ繝・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｨ繧ｹ繝昴Ρ繝ｼ繝ｫ繧ｷ繝√・",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778848107053",
    version: "v63.1",
    date: "2026-05-15T12:28:27.054Z",
    description: "蝨堤伐 - 螂ｽ襍ｰ鬥ｬ(繧ｹ繝翫・繧ｯ繝ｦ繧ｦ繝樒ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蝨堤伐",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "莠穂ｸ雁ｹｹ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｳ繝代ヮ繝ｪ繝・く繝ｼ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "豌ｸ莠募ｭ・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝阪が繝ｦ繝九Χ繧｡繝ｼ繧ｹ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778848154886",
    version: "v64.1",
    date: "2026-05-15T12:29:14.886Z",
    description: "蝨堤伐 - 螂ｽ襍ｰ鬥ｬ(繧ｨ繧､繧ｷ繝ｳ繝ｪ繝ｼ繝ｫ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蝨堤伐",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "螟ｧ螻ｱ逵・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝舌Φ繝悶・繧ｨ繝ｼ繝ｫ",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "隘ｿ蝠灘､ｪ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝医ぇ繧ｶ繝ｯ繝ｼ繝ｫ繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778887729675",
    version: "v32.1",
    date: "2026-05-15T23:28:49.675Z",
    description: "隨�譚ｾ - 螂ｽ襍ｰ鬥ｬ(繧ｦ繧｣繝ｫ繧ｽ繝ｳ繧ｦ繧ｧ繧､遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "隨�譚ｾ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "貂｡驍顔ｫ・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｿ繝ｪ繧ｹ繝槭ル繝・け",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778887870694",
    version: "v33.1",
    date: "2026-05-15T23:31:10.694Z",
    description: "隨�譚ｾ - 螂ｽ襍ｰ鬥ｬ(繧ｸ繝ｧ繝ｪ繝ｼ繝｡繝｢繝ｪ繝ｼ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "隨�譚ｾ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "鬥ｬ貂慕ｹ・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｪ繧｢繝ｫ繧､繝ｳ繝代け繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778904456322",
    version: "v67.1",
    date: "2026-05-16T04:07:36.322Z",
    description: "蟾晏ｴ・- 螂ｽ襍ｰ鬥ｬ(繧ｨ繝ｬ繝輔ぃ繝ｳ繝医Λ繝ｳ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蟾晏ｴ・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蠕｡逾櫁ｨ・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝九Η繝ｼ繧､繝､繝ｼ繧ｺ繝・う",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "鮟帝ｹｿ豈・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝輔Μ繧ｪ繝ｼ繧ｽ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譁ｰ蜴溷捉",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝上・繝薙Φ繧ｸ繝｣繝ｼ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778907012631",
    version: "v68.1",
    date: "2026-05-16T04:50:12.631Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繧ｪ繝ｼ繧ｷ繝｣繝ｳ繧ｹ繝・Λ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "讓ｪ螻ｱ 豁ｦ蜿ｲ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "菴占陸 鄙秘ｦｬ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝翫ム繝ｫ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蜷臥伐 雎・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778925371312",
    version: "v69.1",
    date: "2026-05-16T09:56:11.312Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繝√ぐ繝ｪ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "荳画ｵｦ 逧・・",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｬ繝・ラ繝輔ぃ繝ｫ繧ｯ繧ｹ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "謌ｸ蟠・蝨ｭ螟ｪ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝峨Ξ繝輔か繝ｳ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "豢･譚・譏守ｧ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778925452959",
    version: "v70.1",
    date: "2026-05-16T09:57:32.959Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繧ｭ繝ｳ繧ｰ繧ｹ繧ｳ繝ｼ繝ｫ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蜷臥伐 雎・,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "菴舌・惠 螟ｧ霈・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝峨Ξ繝輔か繝ｳ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "讓ｪ螻ｱ 豁ｦ蜿ｲ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778925613367",
    version: "v71.1",
    date: "2026-05-16T10:00:13.367Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繝｡繝ｪ繝・ぅ繧｢繝ｳ繧ｹ繧ｿ繝ｼ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "M.繝・ぅ繝ｼ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "讓ｪ螻ｱ 蜥檎函",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "Exceedance",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "謌ｸ蟠・蝨ｭ螟ｪ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778925678181",
    version: "v72.1",
    date: "2026-05-16T10:01:18.181Z",
    description: "莠ｬ驛ｽ - 螂ｽ襍ｰ鬥ｬ(繝ｬ繝・ラ繝ｩ繝ｼ繧ｸ繝｣遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "莠ｬ驛ｽ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蝮ゆｺ・迹�譏・,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "鬮俶揄 蜷城ｺ・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｵ繝ｼ繝医ぇ繝ｫ繝翫・繝ｪ繧｢",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778928219288",
    version: "v73.1",
    date: "2026-05-16T10:43:39.288Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繧ｪ繝ｼ繧ｷ繝｣繝ｳ繧ｹ繝・Λ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "讓ｪ螻ｱ 豁ｦ蜿ｲ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "菴占陸 鄙秘ｦｬ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝翫ム繝ｫ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蜷臥伐 雎・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778928337767",
    version: "v74.1",
    date: "2026-05-16T10:45:37.767Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繧ｿ繝ｼ繝輔け繝ｪ繧ｹ繧ｿ繝ｫ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "豎溽伐 辣ｧ逕ｷ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "謌ｸ蟠・蝨ｭ螟ｪ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778928380020",
    version: "v75.1",
    date: "2026-05-16T10:46:20.020Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繧｢繝ｴ繧｡繝ｩ繝ｳ繝∫ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "荳画ｵｦ 逧・・",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝槭ず繧ｧ繧ｹ繝・ぅ繝・け繧ｦ繧ｩ繝ｪ繧｢繝ｼ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蜴・蜆ｪ莉・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778928421419",
    version: "v76.1",
    date: "2026-05-16T10:47:01.419Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繧ｫ繝ｳ繝・ぅ繝ｼ繝顔ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "螟ｧ驥・諡灘ｼ･",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｷ繝ｫ繝舌・繧ｹ繝・・繝・,
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "D.繝ｬ繝ｼ繝ｳ",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "豢･譚・譏守ｧ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778928480175",
    version: "v77.1",
    date: "2026-05-16T10:48:00.175Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繧ｨ繝ｩ繝ｫ繝・ぅ繝ｼ繧ｯ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "讓ｪ螻ｱ 豁ｦ蜿ｲ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "菴舌・惠 螟ｧ霈・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｵ繝ｳ繧ｰ繝ｬ繝ｼ繧ｶ繝ｼ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778928571565",
    version: "v78.1",
    date: "2026-05-16T10:49:31.565Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繝槭ず繝ｧ繝ｬ繝ｫ繝悶Ν繝ｼ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "謌ｸ蟠・蝨ｭ螟ｪ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蜴・蜆ｪ莉・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778928619655",
    version: "v79.1",
    date: "2026-05-16T10:50:19.655Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繧ｷ繝ｧ繝ｼ繝ｪ繝舌・繧ｹ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "讓ｪ螻ｱ 蜥檎函",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝輔か繝ｼ繧ｦ繧｣繝ｼ繝ｫ繝峨Λ繧､繝・,
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "荳画ｵｦ 逧・・",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778928691626",
    version: "v80.1",
    date: "2026-05-16T10:51:31.626Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繝弱い繝ｴ繧｣繝ｴ繧｡繝ｼ繝√ぉ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譛ｨ蟷｡ 蟾ｧ荵・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝｢繝ｼ繝九Φ",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蛹玲搗 螳丞昇",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝｢繝ｼ繝ｪ繧ｹ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778928750770",
    version: "v81.1",
    date: "2026-05-16T10:52:30.770Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繧ｷ繝｣繝ｳ繧ｽ繝ｳ繝峨・繝ｫ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "D.繝ｬ繝ｼ繝ｳ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譚ｾ蟯｡ 豁｣豬ｷ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｪ繧｢繝ｫ繧､繝ｳ繝代け繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778928800212",
    version: "v82.1",
    date: "2026-05-16T10:53:20.212Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繝｡繝ｪ繝・ぅ繧｢繝ｳ繧ｹ繧ｿ繝ｼ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "M.繝・ぅ繝ｼ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "讓ｪ螻ｱ 蜥檎函",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "Exceedance",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "謌ｸ蟠・蝨ｭ螟ｪ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778929925618",
    version: "v83.1",
    date: "2026-05-16T11:12:05.618Z",
    description: "譁ｰ貎・- 螂ｽ襍ｰ鬥ｬ(繝舌Ξ繧ｨ繝槭せ繧ｿ繝ｼ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譁ｰ貎・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "闖頑ｲ｢ 荳讓ｹ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｹ繝斐Ν繝舌・繧ｰ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "F.繧ｴ繝ｳ繧ｵ繝ｫ繝吶せ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｦ繧､繝ｳ繝悶Λ繧､繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778929972050",
    version: "v84.1",
    date: "2026-05-16T11:12:52.050Z",
    description: "莠ｬ驛ｽ - 螂ｽ襍ｰ鬥ｬ(繝ｫ繝ｼ繧ｸ繝･繝舌Ο繝ｳ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "莠ｬ驛ｽ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weightChange",
        ""operator": "<=",
        ""value": -10,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蝮ゆｺ・迹�譏・,
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "魄ｫ蟲ｶ 濶ｯ螟ｪ",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "遘句ｱｱ 遞疲ｨｹ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝繝弱Φ繝ｬ繧ｸ繧ｧ繝ｳ繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778930019383",
    version: "v85.1",
    date: "2026-05-16T11:13:39.383Z",
    description: "莠ｬ驛ｽ - 螂ｽ襍ｰ鬥ｬ(繧ｴ繝ｼ繝ｫ繝峨さ繝・ヨ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "莠ｬ驛ｽ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "隗堤伐 螟ｧ蜥・,
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "鬮俶揄 蜷城ｺ・,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "螟ｪ螳ｰ 蝠謎ｻ・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝帙ャ繧ｳ繝ｼ繧ｿ繝ｫ繝槭お",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778930075175",
    version: "v86.1",
    date: "2026-05-16T11:14:35.175Z",
    description: "莠ｬ驛ｽ - 螂ｽ襍ｰ鬥ｬ(繧ｭ繧ｷ繝｣繝ｼ繝ｫ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "莠ｬ驛ｽ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weightChange",
        ""operator": ">=",
        ""value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "鬮俶揄 蜷城ｺ・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝繝弱Φ繝励Ξ繝溘い繝�",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蟷ｸ 闍ｱ譏・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧､繧ｹ繝ｩ繝懊ル繝ｼ繧ｿ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778930134232",
    version: "v87.1",
    date: "2026-05-16T11:15:34.232Z",
    description: "莠ｬ驛ｽ - 螂ｽ襍ｰ鬥ｬ(繧ｵ繝医ヮ繝薙ム繝ｼ繝､遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "莠ｬ驛ｽ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "驟剃ｺ・蟄ｦ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｵ繝医ヮ繧ｸ繧ｧ繝阪す繧ｹ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譚ｾ螻ｱ 蠑伜ｹｳ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778930272027",
    version: "v88.1",
    date: "2026-05-16T11:17:52.027Z",
    description: "莠ｬ驛ｽ - 螂ｽ襍ｰ鬥ｬ(繝ｭ繧ｵ繝ｫ繧ｴ繧ｵ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "莠ｬ驛ｽ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "weightChange",
        ""operator": "<=",
        ""value": -10,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蝗｣驥・螟ｧ謌・,
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譽ｮ逕ｰ 隱�荵・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｪ繧ｪ繝ｳ繝・ぅ繝ｼ繧ｺ",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譚ｾ螻ｱ 蠑伜ｹｳ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｳ繝ｳ繝医Ξ繧､繝ｫ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778930328681",
    version: "v89.1",
    date: "2026-05-16T11:18:48.681Z",
    description: "莠ｬ驛ｽ - 螂ｽ襍ｰ鬥ｬ(繝九・繝ｳ繝斐Ο繧ｫ繝ｩ繝・ヨ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "莠ｬ驛ｽ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "逕ｰ蜿｣ 雋ｫ螟ｪ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｵ繝医ヮ繝繧､繝､繝｢繝ｳ繝・,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蟯ｩ逕ｰ 譛帶擂",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778930393398",
    version: "v90.1",
    date: "2026-05-16T11:19:53.398Z",
    description: "莠ｬ驛ｽ - 螂ｽ襍ｰ鬥ｬ(繧ｳ繝ｫ繝峨Φ繝悶Ν繝ｼ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "莠ｬ驛ｽ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蟯ｩ逕ｰ 譛帶擂",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蝮ゆｺ・迹�譏・,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譚ｾ闍･ 鬚ｨ鬥ｬ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝溘ャ繧ｭ繝ｼ繧ｰ繝ｭ繝ｼ繝ｪ繝ｼ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778930463801",
    version: "v91.1",
    date: "2026-05-16T11:21:03.801Z",
    description: "莠ｬ驛ｽ - 螂ｽ襍ｰ鬥ｬ(繧ｷ繝帙ヮ繧ｹ繝壹Λ繝ｳ繝・ぃ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "莠ｬ驛ｽ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "鬮倡伐 貎､",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝悶Λ繝・け繧ｿ繧､繝・,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "螟ｧ豎溷次 蝨ｭ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｴ繝ｼ繝ｫ繝峨す繝・・",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778930511016",
    version: "v92.1",
    date: "2026-05-16T11:21:51.016Z",
    description: "莠ｬ驛ｽ - 螂ｽ襍ｰ鬥ｬ(繝ｬ繝・ラ繝ｩ繝ｼ繧ｸ繝｣遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "莠ｬ驛ｽ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蝮ゆｺ・迹�譏・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778930580723",
    version: "v93.1",
    date: "2026-05-16T11:23:00.723Z",
    description: "莠ｬ驛ｽ - 螂ｽ襍ｰ鬥ｬ(繝偵Ν繝弱ワ繝ｳ繝悶Ν繧ｯ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "莠ｬ驛ｽ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譚ｾ螻ｱ 蠑伜ｹｳ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778930629417",
    version: "v94.1",
    date: "2026-05-16T11:23:49.417Z",
    description: "莠ｬ驛ｽ - 螂ｽ襍ｰ鬥ｬ(繝輔Μ繝・き繝ｼ繧ｸ繝｣繝也ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "莠ｬ驛ｽ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譚ｾ螻ｱ 蠑伜ｹｳ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "魄ｫ蟲ｶ 蜈矩ｧｿ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｿ繝ｪ繧ｹ繝槭ル繝・け",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蝗｣驥・螟ｧ謌・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778930680470",
    version: "v95.1",
    date: "2026-05-16T11:24:40.470Z",
    description: "莠ｬ驛ｽ - 螂ｽ襍ｰ鬥ｬ(繝ｩ繧､繝医ル繝ｳ繧ｰ繧ｼ繧ｦ繧ｹ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "莠ｬ驛ｽ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蟾晉伐 蟆・寉",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝繝ｳ繧ｫ繝ｼ繧ｯ",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "逕ｰ蜿｣ 雋ｫ螟ｪ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝輔か繝ｼ繧ｦ繧｣繝ｼ繝ｫ繝峨Λ繧､繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778930730538",
    version: "v96.1",
    date: "2026-05-16T11:25:30.538Z",
    description: "莠ｬ驛ｽ - 螂ｽ襍ｰ鬥ｬ(繝ｩ繧､繝医ル繝ｳ繧ｰ繧ｼ繧ｦ繧ｹ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "莠ｬ驛ｽ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蟾晉伐 蟆・寉",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝繝ｳ繧ｫ繝ｼ繧ｯ",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "逕ｰ蜿｣ 雋ｫ螟ｪ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝輔か繝ｼ繧ｦ繧｣繝ｼ繝ｫ繝峨Λ繧､繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778930784441",
    version: "v97.1",
    date: "2026-05-16T11:26:24.441Z",
    description: "莠ｬ驛ｽ - 螂ｽ襍ｰ鬥ｬ(繝ｩ繧､繝医ル繝ｳ繧ｰ繧ｼ繧ｦ繧ｹ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "莠ｬ驛ｽ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蟾晉伐 蟆・寉",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝繝ｳ繧ｫ繝ｼ繧ｯ",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "逕ｰ蜿｣ 雋ｫ螟ｪ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝輔か繝ｼ繧ｦ繧｣繝ｼ繝ｫ繝峨Λ繧､繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778930836558",
    version: "v98.1",
    date: "2026-05-16T11:27:16.558Z",
    description: "譁ｰ貎・- 螂ｽ襍ｰ鬥ｬ(繧ｵ繝ｳ繧ｿ繧｢繝九ち遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譁ｰ貎・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譁手陸 譁ｰ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝翫ム繝ｫ",
        "scoreAdjust": 15
      },
      {
        "field": "weightChange",
        ""operator": ">=",
        ""value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "C.繝ｫ繝｡繝ｼ繝ｫ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｵ繝ｼ繝医ぇ繝ｫ繝翫・繝ｪ繧｢",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778930890778",
    version: "v99.1",
    date: "2026-05-16T11:28:10.778Z",
    description: "譁ｰ貎・- 螂ｽ襍ｰ鬥ｬ(繝舌Ξ繧ｨ繝槭せ繧ｿ繝ｼ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譁ｰ貎・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "闖頑ｲ｢ 荳讓ｹ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｹ繝斐Ν繝舌・繧ｰ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "F.繧ｴ繝ｳ繧ｵ繝ｫ繝吶せ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｦ繧､繝ｳ繝悶Λ繧､繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778930936730",
    version: "v100.1",
    date: "2026-05-16T11:28:56.730Z",
    description: "譁ｰ貎・- 螂ｽ襍ｰ鬥ｬ(繧｢繝ｼ繧ｯ繝峨・繝ｫ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譁ｰ貎・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "豁ｦ 雎・,
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蜷臥伐 髫ｼ莠ｺ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778930982727",
    version: "v101.1",
    date: "2026-05-16T11:29:42.727Z",
    description: "譁ｰ貎・- 螂ｽ襍ｰ鬥ｬ(繝ｫ繝ｼ繝ｫ繝ｼ繝ｪ繝樒ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譁ｰ貎・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "C.繝ｫ繝｡繝ｼ繝ｫ",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "闕ｻ驥・讌ｵ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778931034757",
    version: "v102.1",
    date: "2026-05-16T11:30:34.757Z",
    description: "譁ｰ貎・- 螂ｽ襍ｰ鬥ｬ(繝輔ぃ繝ｫ繧ｳ繝ｳ繝溘ヮ繝ｫ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譁ｰ貎・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "C.繝ｫ繝｡繝ｼ繝ｫ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｴ繝ｼ繝ｫ繝峨す繝・・",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譟ｴ逕ｰ 陬穂ｸ驛・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｭ繧ｺ繝・,
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "隘ｿ譚・豺ｳ荵・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778931118745",
    version: "v103.1",
    date: "2026-05-16T11:31:58.745Z",
    description: "蟾晏ｴ・- 螂ｽ襍ｰ鬥ｬ(繧｢繝輔ぃ繝ｼ繝槭ユ繧｣繝ｴ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蟾晏ｴ・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蜉�阯､髮・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｭ繧ｻ繧ｭ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蜿､蟯｡蜍・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧｢繝｡繝ｪ繧ｫ繝ｳ繝壹う繝医Μ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778931177908",
    version: "v104.1",
    date: "2026-05-16T11:32:57.908Z",
    description: "蟾晏ｴ・- 螂ｽ襍ｰ鬥ｬ(繝悶お繝ｳ繝・ぅ繧｢遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蟾晏ｴ・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "(-)",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝｢繝ｼ繝九Φ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝帙ャ繝医Ο繝・ラ繝√Ε繝ｼ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778931229422",
    version: "v105.1",
    date: "2026-05-16T11:33:49.422Z",
    description: "蟾晏ｴ・- 螂ｽ襍ｰ鬥ｬ(繝悶Λ繝輔く繝｣繝・メ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蟾晏ｴ・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "(-)",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝｢繧ｺ繧｢繧ｹ繧ｳ繝・ヨ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｷ繝･繝ｴ繧｡繝ｫ繧ｰ繝ｩ繝ｳ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝代う繝ｭ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778931285325",
    version: "v106.1",
    date: "2026-05-16T11:34:45.325Z",
    description: "隨�譚ｾ - 螂ｽ襍ｰ鬥ｬ(繝偵Ο繝弱Λ繝輔ぃ繝ｼ繝ｫ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "隨�譚ｾ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蜉�阯､閨｡",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝｢繧ｺ繧｢繧ｹ繧ｳ繝・ヨ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "鬮俶惠蛛･",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝弱Χ繧ｧ繝ｪ繧ｹ繝・,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蜷大ｱｱ迚ｧ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｳ繝代ヮ繝ｪ繝・く繝ｼ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778985036461",
    version: "v74.1",
    date: "2026-05-17T02:30:36.461Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繧ｪ繝ｼ繧ｷ繝｣繝ｳ繧ｹ繝・Λ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "讓ｪ螻ｱ 豁ｦ蜿ｲ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "菴占陸 鄙秘ｦｬ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝翫ム繝ｫ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蜷臥伐 雎・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778985101240",
    version: "v75.1",
    date: "2026-05-17T02:31:41.240Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繧ｿ繝ｼ繝輔け繝ｪ繧ｹ繧ｿ繝ｫ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "豎溽伐 辣ｧ逕ｷ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "謌ｸ蟠・蝨ｭ螟ｪ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778985194125",
    version: "v76.1",
    date: "2026-05-17T02:33:14.125Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繧｢繝ｴ繧｡繝ｩ繝ｳ繝∫ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "荳画ｵｦ 逧・・",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝槭ず繧ｧ繧ｹ繝・ぅ繝・け繧ｦ繧ｩ繝ｪ繧｢繝ｼ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蜴・蜆ｪ莉・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778985279835",
    version: "v77.1",
    date: "2026-05-17T02:34:39.835Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繧ｫ繝ｳ繝・ぅ繝ｼ繝顔ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "螟ｧ驥・諡灘ｼ･",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｷ繝ｫ繝舌・繧ｹ繝・・繝・,
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "D.繝ｬ繝ｼ繝ｳ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778985381271",
    version: "v78.1",
    date: "2026-05-17T02:36:21.271Z",
    description: "蟶ｯ蠎・・ - 螂ｽ襍ｰ鬥ｬ(繝・リ繝弱ち繝√Ζ繝樒ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蟶ｯ蠎・・",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蟲ｶ豢･譁ｰ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝偵ヮ繝・ち繧､繧ｬ繝ｼ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "襍､蝪壼▼",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝槭Ν繝九そ繝ｳ繝励・",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778985513313",
    version: "v79.1",
    date: "2026-05-17T02:38:33.313Z",
    description: "蟶ｯ蠎・・ - 螂ｽ襍ｰ鬥ｬ(繧ｯ繝ｪ繧ｹ繧ｿ繝ｫ繧ｽ繧ｦ繝ｫ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蟶ｯ蠎・・",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "(-)",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｳ繧ｦ繧ｷ繝･繝上え繝ｳ繧ｫ繧､",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝帙け繧ｷ繝ｧ繧ｦ繝ｦ繝・Ν",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｬ繝・ヨ繝繧､繝､",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778989672917",
    version: "v80.1",
    date: "2026-05-17T03:47:52.917Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繝溘Λ繧､繝倥ヮ繝・ぅ繧｢繝ｩ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蛹玲搗 螳丞昇",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｵ繝ｼ繝医ぇ繝ｫ繝翫・繝ｪ繧｢",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "M.繝・ぅ繝ｼ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝弱・繝悶Ν繝溘ャ繧ｷ繝ｧ繝ｳ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "F.繧ｴ繝ｳ繧ｵ繝ｫ繝吶せ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝帙・繧ｯ繝薙Ν",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778990568061",
    version: "v114.1",
    date: "2026-05-17T04:02:48.061Z",
    description: "莠ｬ驛ｽ - 螂ｽ襍ｰ鬥ｬ(繝ｫ繝ｼ繧ｸ繝･繝舌Ο繝ｳ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "莠ｬ驛ｽ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weightChange",
        ""operator": "<=",
        ""value": -10,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蝮ゆｺ・迹�譏・,
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "魄ｫ蟲ｶ 濶ｯ螟ｪ",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "遘句ｱｱ 遞疲ｨｹ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝繝弱Φ繝ｬ繧ｸ繧ｧ繝ｳ繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778990630553",
    version: "v115.1",
    date: "2026-05-17T04:03:50.553Z",
    description: "莠ｬ驛ｽ - 螂ｽ襍ｰ鬥ｬ(繧ｴ繝ｼ繝ｫ繝峨さ繝・ヨ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "莠ｬ驛ｽ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "隗堤伐 螟ｧ蜥・,
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "鬮俶揄 蜷城ｺ・,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "螟ｪ螳ｰ 蝠謎ｻ・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝帙ャ繧ｳ繝ｼ繧ｿ繝ｫ繝槭お",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778990689051",
    version: "v116.1",
    date: "2026-05-17T04:04:49.051Z",
    description: "莠ｬ驛ｽ - 螂ｽ襍ｰ鬥ｬ(繧ｿ繝翫ヶ繧､繝上メ繧ｿ繝ｼ繝懃ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "莠ｬ驛ｽ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蟷ｸ 闍ｱ譏・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧､繧ｹ繝ｩ繝懊ル繝ｼ繧ｿ",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蜷画搗 隱�荵句勧",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｭ繧ｿ繧ｵ繝ｳ繝悶Λ繝・け",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778990830392",
    version: "v117.1",
    date: "2026-05-17T04:07:10.392Z",
    description: "菴占ｳ - 螂ｽ襍ｰ鬥ｬ(繧､繝・・繧､繧ｽ繝・ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "菴占ｳ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "螻ｱ蜿｣蜍ｲ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝帙ャ繧ｳ繝ｼ繧ｿ繝ｫ繝槭お",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蟾晏ｳｶ諡・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｪ繧ｪ繝ｳ繝・ぅ繝ｼ繧ｺ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778991018404",
    version: "v118.1",
    date: "2026-05-17T04:10:18.404Z",
    description: "鬮倡衍 - 螂ｽ襍ｰ鬥ｬ(繝ｬ繧｢繝ｫ繧ｷ繝√・遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "鬮倡衍",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蟯｡譚大酷",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧｢繝ｫ繧｢繧､繝ｳ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778991075982",
    version: "v119.1",
    date: "2026-05-17T04:11:15.982Z",
    description: "鬮倡衍 - 螂ｽ襍ｰ鬥ｬ(繝上・繝峨・繧､繝ｫ繝臥ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "鬮倡衍",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "霑題陸鄙・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝・ぅ繝ｼ繝槭ず繧ｧ繧ｹ繝・ぅ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778991118994",
    version: "v120.1",
    date: "2026-05-17T04:11:58.994Z",
    description: "鬮倡衍 - 螂ｽ襍ｰ鬥ｬ(繧ｳ繧ｹ繝｢繝ｫ繝ｼ繝・え繧ｹ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "鬮倡衍",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "螯ｹ蟆ｾ豬ｩ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｭ繝ｼ繧ｸ繧ｺ繧､繝ｳ繝｡繧､",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "鮟帝ｹｿ豈・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｵ繝医ヮ繧ｯ繝ｩ繧ｦ繝ｳ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778991166614",
    version: "v121.1",
    date: "2026-05-17T04:12:46.614Z",
    description: "鬮倡衍 - 螂ｽ襍ｰ鬥ｬ(繧ｸ繝ｧ繧ｦ繧ｷ繝ｧ繝ｼ繝懊ン繝ｼ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "鬮倡衍",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "髱帝ｹｿ豈・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｷ繝｣繝ｳ繝上う繝懊ン繝ｼ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778991213032",
    version: "v122.1",
    date: "2026-05-17T04:13:33.032Z",
    description: "鬮倡衍 - 螂ｽ襍ｰ鬥ｬ(繧ｹ繝斐・繝峨た繝ｫ繧ｸ繝｣繝ｼ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "鬮倡衍",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "螳ｮ蟾晏ｮ・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝峨Ξ繝輔か繝ｳ",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "鮟帝ｹｿ豈・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝舌Φ繝峨Ρ繧ｴ繝ｳ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "螯ｹ蟆ｾ豬ｩ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｪ繧ｪ繝ｳ繝・ぅ繝ｼ繧ｺ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778991273018",
    version: "v123.1",
    date: "2026-05-17T04:14:33.018Z",
    description: "鬮倡衍 - 螂ｽ襍ｰ鬥ｬ(繧ｯ繝ｪ繝弱ラ繝ｩ繧ｴ繝ｳ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "鬮倡衍",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": ">=",
        ""value": 8,
        "scoreAdjust": 20
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蟯｡驕ｼ螟ｪ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧｢繧ｹ繧ｫ繧ｯ繝ｪ繝√Ε繝ｳ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778991315674",
    version: "v124.1",
    date: "2026-05-17T04:15:15.674Z",
    description: "鬮倡衍 - 螂ｽ襍ｰ鬥ｬ(繝ｪ繧ｱ繧｢繝槭く繧｢繝ｼ繝育ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "鬮倡衍",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "霑題陸鄙・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｪ繧｢繝ｫ繧ｹ繝・ぅ繝ｼ繝ｫ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蟯｡驕ｼ螟ｪ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｪ繝ｫ繝輔ぉ繝ｼ繝ｴ繝ｫ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778991385022",
    version: "v125.1",
    date: "2026-05-17T04:16:25.022Z",
    description: "鬮倡衍 - 螂ｽ襍ｰ鬥ｬ(繝医ャ繝励い繝｡繝ｪ繧ｫ繝ｳ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "鬮倡衍",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "鮟帝ｹｿ豈・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧｢繝｡繝ｪ繧ｫ繝ｳ繝壹う繝医Μ",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "荳顔伐蟆・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝繧､繝ｯ繝｡繧ｸ繝｣繝ｼ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778991421565",
    version: "v126.1",
    date: "2026-05-17T04:17:01.565Z",
    description: "鬮倡衍 - 螂ｽ襍ｰ鬥ｬ(繝舌う繝ｦ繝ｼ繝ｩ繝ｳ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "鬮倡衍",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蝓朱㍽諷・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｷ繝｣繝ｳ繝上う繝懊ン繝ｼ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778991478462",
    version: "v127.1",
    date: "2026-05-17T04:17:58.462Z",
    description: "鬮倡衍 - 螂ｽ襍ｰ鬥ｬ(繝薙・繝�遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "鬮倡衍",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "襍､蟯｡菫ｮ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｰ繝ｬ繝ｼ繧ｿ繝ｼ繝ｭ繝ｳ繝峨Φ",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "螻ｱ蟠朱寉",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｵ繝医ヮ繧｢繝ｩ繧ｸ繝ｳ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778991513959",
    version: "v128.1",
    date: "2026-05-17T04:18:33.959Z",
    description: "鬮倡衍 - 螂ｽ襍ｰ鬥ｬ(繝偵ョ繝弱ヶ繝ｫ繝ｼ繧ｹ繧ｫ繧､遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "鬮倡衍",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蟯｡譚大酷",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝翫ム繝ｫ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "鮟帝ｹｿ豈・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝悶Μ繝・け繧ｹ繧｢繝ｳ繝峨Δ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "遏ｳ譛ｬ邏・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｨ繝斐ヵ繧｡繝阪う繧｢",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778991615911",
    version: "v129.1",
    date: "2026-05-17T04:20:15.911Z",
    description: "菴占ｳ - 螂ｽ襍ｰ鬥ｬ(繝舌・繧ｸ繝｣繝ｳ繝輔か繝ｼ繧ｹ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "菴占ｳ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "驥大ｱｱ譏・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｭ繝ｼ繝峨き繝翫Ο繧｢",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778991666084",
    version: "v130.1",
    date: "2026-05-17T04:21:06.084Z",
    description: "菴占ｳ - 螂ｽ襍ｰ鬥ｬ(繧ｿ繧､繧ｷ繝ｧ繧ｦ繝ｭ繝槭Φ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "菴占ｳ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "髱呈ｵｷ螟ｧ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｴ繝ｼ繝ｫ繝峨す繝・・",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778991698928",
    version: "v131.1",
    date: "2026-05-17T04:21:38.928Z",
    description: "菴占ｳ - 螂ｽ襍ｰ鬥ｬ(繧ｯ繝ｩ繧ｦ繝ｳ繝ｩ繧､繧ｸ繝ｳ繧ｰ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "菴占ｳ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "逕ｰ荳ｭ逶ｴ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝医Λ繝ｳ繧ｻ繝ｳ繝・,
        "scoreAdjust": 15
      },
      {
        "field": "weightChange",
        ""operator": ">=",
        ""value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "荳ｭ螻ｱ闢ｮ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧｢繝｡繝ｪ繧ｫ繝ｳ繝壹う繝医Μ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778991732198",
    version: "v132.1",
    date: "2026-05-17T04:22:12.198Z",
    description: "菴占ｳ - 螂ｽ襍ｰ鬥ｬ(繝倥Ν繝育ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "菴占ｳ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "遏ｳ蟾晄・",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝悶Μ繝・け繧ｹ繧｢繝ｳ繝峨Δ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "驥大ｱｱ譏・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｪ繧｢繝ｫ繧ｹ繝・ぅ繝ｼ繝ｫ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778991771862",
    version: "v133.1",
    date: "2026-05-17T04:22:51.862Z",
    description: "菴占ｳ - 螂ｽ襍ｰ鬥ｬ(繧｢繧ｹ繧ｿ繧､繧ｯ繧ｦ繧ｹ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "菴占ｳ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "螻ｱ蜿｣蜍ｲ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｿ繝ｯ繝ｼ繧ｪ繝悶Ο繝ｳ繝峨Φ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778991807384",
    version: "v134.1",
    date: "2026-05-17T04:23:27.384Z",
    description: "菴占ｳ - 螂ｽ襍ｰ鬥ｬ(繝ｭ繝・た遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "菴占ｳ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譫玲あ鄙・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝医・繧ｻ繝ｳ繝ｩ繝ｼ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "荳ｭ螻ｱ闢ｮ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｸ繝ｧ繝ｼ繧ｫ繝励メ繝ｼ繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778991843289",
    version: "v135.1",
    date: "2026-05-17T04:24:03.289Z",
    description: "菴占ｳ - 螂ｽ襍ｰ鬥ｬ(繧ｷ繧ｺ繝ｪ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "菴占ｳ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "遏ｳ蟾晄・",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝槭け繝輔ぅ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "驥大ｱｱ譏・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｹ繧ｯ繝ｯ繝ｼ繝医Ν繧ｹ繧ｯ繝ｯ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1778991899938",
    version: "v136.1",
    date: "2026-05-17T04:24:59.938Z",
    description: "菴占ｳ - 螂ｽ襍ｰ鬥ｬ(繝√Ε繝ｳ繝斐が繝ｳ繝､繝槭ヨ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "菴占ｳ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "鮟帝ｹｿ豈・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｨ繧､繧ｷ繝ｳ繝輔Λ繝・す繝･",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "逕ｰ荳ｭ逶ｴ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝薙ャ繧ｰ繧｢繝ｼ繧ｵ繝ｼ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779066100909",
    version: "v106.1",
    date: "2026-05-18T01:01:40.909Z",
    description: "隨�譚ｾ - 螂ｽ襍ｰ鬥ｬ(繧ｪ繝ｬ繝ｳ繧ｿ繝守ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "隨�譚ｾ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "遲剃ｺ募窮",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｱ繝ｼ繝励ヶ繝ｩ繝ｳ繧ｳ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779066153799",
    version: "v107.1",
    date: "2026-05-18T01:02:33.799Z",
    description: "驥第ｲ｢ - 螂ｽ襍ｰ鬥ｬ(繧ｨ繝�繝・ぅ繝代Ν遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "驥第ｲ｢",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蜷臥伐譎・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝・ぅ繝ｼ繝槭ず繧ｧ繧ｹ繝・ぅ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譚ｾ謌ｸ謾ｿ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｭ繧ｸ繝｣繝ｼ繝舌Ο繝ｼ繧ｺ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779066464884",
    version: "v108.1",
    date: "2026-05-18T01:07:44.884Z",
    description: "莠ｬ驛ｽ - 螂ｽ襍ｰ鬥ｬ(繧ｿ繧ｬ繝弱い繝ｩ繝ｪ繧｢遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "莠ｬ驛ｽ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "魄ｫ蟲ｶ 蜈矩ｧｿ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝溘せ繧ｿ繝ｼ繝｡繝ｭ繝・ぅ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "M.繝・Β繝ｼ繝ｭ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｬ繧､繝・が繝ｭ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779066541755",
    version: "v109.1",
    date: "2026-05-18T01:09:01.755Z",
    description: "莠ｬ驛ｽ - 螂ｽ襍ｰ鬥ｬ(繧ｳ繝ｳ繧ｸ繧ｧ繧ｹ繧ｿ繧ｹ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "莠ｬ驛ｽ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "隘ｿ譚・豺ｳ荵・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｳ繝ｳ繝医Ξ繧､繝ｫ",
        "scoreAdjust": 15
      },
      {
        "field": "weightChange",
        ""operator": "<=",
        ""value": -10,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "豎�豺ｻ 隰吩ｸ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｵ繝医ヮ繧｢繝ｩ繧ｸ繝ｳ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779066638255",
    version: "v110.1",
    date: "2026-05-18T01:10:38.255Z",
    description: "莠ｬ驛ｽ - 螂ｽ襍ｰ鬥ｬ(繧ｳ繝ｳ繧ｸ繧ｧ繧ｹ繧ｿ繧ｹ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "莠ｬ驛ｽ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "隘ｿ譚・豺ｳ荵・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｳ繝ｳ繝医Ξ繧､繝ｫ",
        "scoreAdjust": 15
      },
      {
        "field": "weightChange",
        ""operator": "<=",
        ""value": -10,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "豎�豺ｻ 隰吩ｸ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｵ繝医ヮ繧｢繝ｩ繧ｸ繝ｳ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779067730914",
    version: "v111.1",
    date: "2026-05-18T01:28:50.914Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繝峨Φ繧ｨ繝ｬ繧ｯ繝医せ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "闕ｻ驥・讌ｵ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝繝弱Φ繝ｬ繧ｸ繧ｧ繝ｳ繝・,
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "C.繝ｫ繝｡繝ｼ繝ｫ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｭ繝ｼ繝峨き繝翫Ο繧｢",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779070351703",
    version: "v112.1",
    date: "2026-05-18T02:12:31.703Z",
    description: "莠ｬ驛ｽ - 螂ｽ襍ｰ鬥ｬ(繧ｳ繝ｳ繧ｸ繧ｧ繧ｹ繧ｿ繧ｹ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "莠ｬ驛ｽ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "隘ｿ譚・豺ｳ荵・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｳ繝ｳ繝医Ξ繧､繝ｫ",
        "scoreAdjust": 15
      },
      {
        "field": "weightChange",
        ""operator": "<=",
        ""value": -10,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "豎�豺ｻ 隰吩ｸ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｵ繝医ヮ繧｢繝ｩ繧ｸ繝ｳ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779070415440",
    version: "v113.1",
    date: "2026-05-18T02:13:35.440Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繝峨Φ繧ｨ繝ｬ繧ｯ繝医せ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "闕ｻ驥・讌ｵ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝繝弱Φ繝ｬ繧ｸ繧ｧ繝ｳ繝・,
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "C.繝ｫ繝｡繝ｼ繝ｫ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｭ繝ｼ繝峨き繝翫Ο繧｢",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779074848502",
    version: "v145.1",
    date: "2026-05-18T03:27:28.502Z",
    description: "譁ｰ貎・- 螂ｽ襍ｰ鬥ｬ(繧ｹ繝ｼ繝代・繝舌う繧ｶ繝ｼ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譁ｰ貎・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "闖頑ｲ｢ 荳讓ｹ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｫ繝ｼ繝ｩ繝ｼ繧ｷ繝・・",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "莨願陸 蟾･逵・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝九Η繝ｼ繧､繝､繝ｼ繧ｺ繝・う",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779074904822",
    version: "v146.1",
    date: "2026-05-18T03:28:24.822Z",
    description: "譁ｰ貎・- 螂ｽ襍ｰ鬥ｬ(繧ｨ繧ｹ繝医ぇ繝壹Φ繝遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譁ｰ貎・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "闕ｻ驥・讌ｵ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｵ繝ｼ繝医ぇ繝ｫ繝翫・繝ｪ繧｢",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "讓ｪ螻ｱ 逅我ｺｺ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｵ繝医ヮ繝繧､繝､繝｢繝ｳ繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779074972526",
    version: "v147.1",
    date: "2026-05-18T03:29:32.526Z",
    description: "譁ｰ貎・- 螂ｽ襍ｰ鬥ｬ(繝槭Μ繧｢繧､繝ｪ繝繝ｼ繧ｿ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譁ｰ貎・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "闊溷ｱｱ 迹�豕・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝峨ぇ繝ｩ繝｡繝ｳ繝・,
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "荳ｸ逕ｰ 諱ｭ莉・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｨ繝斐ヵ繧｡繝阪う繧｢",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779075357561",
    version: "v148.1",
    date: "2026-05-18T03:35:57.561Z",
    description: "譁ｰ貎・- 螂ｽ襍ｰ鬥ｬ(繝ｩ繝ｴ繧ｧ繝ｳ繝・Ν遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譁ｰ貎・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譁手陸 譁ｰ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｭ繝ｳ繧ｷ繝｣繧ｵ繝弱く繧ｻ繧ｭ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "髟ｷ豬・魘ｻ邱・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｷ繝ｫ繝舌・繧ｹ繝・・繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779075430858",
    version: "v149.1",
    date: "2026-05-18T03:37:10.858Z",
    description: "譁ｰ貎・- 螂ｽ襍ｰ鬥ｬ(繧ｴ繝ｫ繝・・繝ｫ繧ｹ繧ｫ繝ｼ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譁ｰ貎・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "闊溷ｱｱ 迹�豕・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝｢繝ｼ繝ｪ繧ｹ",
        "scoreAdjust": 15
      },
      {
        "field": "weightChange",
        ""operator": ">=",
        ""value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "隘ｿ蝪・豢ｸ莠・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｴ繝ｼ繝ｫ繝峨ラ繝ｪ繝ｼ繝�",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779075525913",
    version: "v150.1",
    date: "2026-05-18T03:38:45.913Z",
    description: "譁ｰ貎・- 螂ｽ襍ｰ鬥ｬ(繝吶ロ繧ｹ繝斐Λ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譁ｰ貎・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "闕ｻ驥・讌ｵ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｬ繧､繝・が繝ｭ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "遏ｳ蟾・陬慕ｴ莠ｺ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｴ繝ｼ繝ｫ繝峨す繝・・",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "闊溷ｱｱ 迹�豕・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝溘ャ繧ｭ繝ｼ繝ｭ繧ｱ繝・ヨ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779075616237",
    version: "v151.1",
    date: "2026-05-18T03:40:16.237Z",
    description: "譁ｰ貎・- 螂ｽ襍ｰ鬥ｬ(繧ｪ繝ｼ繧ｱ繝ｼ繝ｪ繧｢繝ｳ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譁ｰ貎・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蟇檎伐 證・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝翫ム繝ｫ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "遏ｳ逾・豺ｱ驕・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｫ繝ｪ繝輔か繝ｫ繝九い繧ｯ繝ｭ繝ｼ繝�",
        "scoreAdjust": 15
      },
      {
        "field": "weightChange",
        ""operator": "<=",
        ""value": -10,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "讓ｪ螻ｱ 逅我ｺｺ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｪ繝ｫ繝輔ぉ繝ｼ繝ｴ繝ｫ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779075689684",
    version: "v152.1",
    date: "2026-05-18T03:41:29.684Z",
    description: "譁ｰ貎・- 螂ｽ襍ｰ鬥ｬ(繝ｩ繝・・繝医ャ繝礼ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譁ｰ貎・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "遏ｳ逾・豺ｱ驕・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｪ繧ｪ繝ｳ繝ｪ繧ｪ繝ｳ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779075833712",
    version: "v153.1",
    date: "2026-05-18T03:43:53.712Z",
    description: "譁ｰ貎・- 螂ｽ襍ｰ鬥ｬ(繝槭ず繝ｳ繧ｿ繧ｯ繧ｷ繝ｼ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譁ｰ貎・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蜷臥伐 髫ｼ莠ｺ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝槭ユ繝ｩ繧ｹ繧ｫ繧､",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "闕ｻ驥・讌ｵ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝翫ム繝ｫ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779076034491",
    version: "v154.1",
    date: "2026-05-18T03:47:14.491Z",
    description: "譁ｰ貎・- 螂ｽ襍ｰ鬥ｬ(繧ｨ繧ｿ繝ｳ繧ｻ繝ｫ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譁ｰ貎・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蟆乗棊 鄒朱ｧ・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝悶Μ繝・け繧ｹ繧｢繝ｳ繝峨Δ繝ｫ繧ｿ繝ｫ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779076085418",
    version: "v155.1",
    date: "2026-05-18T03:48:05.418Z",
    description: "蟶ｯ蠎・・ - 螂ｽ襍ｰ鬥ｬ(繧､繝ｯ繧ｭ繝上Ν繝偵Γ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蟶ｯ蠎・・",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "weightChange",
        ""operator": ">=",
        ""value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧｢繧ｵ繝偵Μ繝･繧ｦ繧ｻ繧､",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝輔リ繝弱け繝ｳ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779076130984",
    version: "v156.1",
    date: "2026-05-18T03:48:50.984Z",
    description: "蟶ｯ蠎・・ - 螂ｽ襍ｰ鬥ｬ(繝帙け繧ｻ繧､繝ｭ繧､繝､繝ｫ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蟶ｯ蠎・・",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "weightChange",
        ""operator": ">=",
        ""value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝輔ず繝繧､繝薙け繝医Μ繝ｼ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779076211603",
    version: "v157.1",
    date: "2026-05-18T03:50:11.603Z",
    description: "逶帛ｲ｡ - 螂ｽ襍ｰ鬥ｬ(繧ｸ繝ｼ繝・ぅ繝ｼ繝薙・繝育ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "逶帛ｲ｡",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蟆乗棊蜃・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｵ繝医ヮ繧｢繝ｩ繧ｸ繝ｳ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779076255937",
    version: "v158.1",
    date: "2026-05-18T03:50:55.937Z",
    description: "驥第ｲ｢ - 螂ｽ襍ｰ鬥ｬ(繝悶Ξ繧､繝悶ぞ繧ｦ繧ｹ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "驥第ｲ｢",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "髱呈浹豁｣",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｵ繧ｯ繝ｩ繧ｼ繧ｦ繧ｹ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蜉�阯､鄙・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｨ繧ｹ繧ｱ繝ｳ繝・Ξ繝､",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779076306607",
    version: "v159.1",
    date: "2026-05-18T03:51:46.607Z",
    description: "鬮倡衍 - 螂ｽ襍ｰ鬥ｬ(繧ｿ繝ｫ繝医・繝ｯ繝ｼ繝ｫ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "鬮倡衍",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蟯｡驕ｼ螟ｪ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝｢繝ｼ繝九Φ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蟯｡譚大酷",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝悶Μ繝・け繧ｹ繧｢繝ｳ繝峨Δ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "螻ｱ逕ｰ雋ｴ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧｢繧ｸ繧｢繧ｨ繧ｯ繧ｹ繝励Ξ繧ｹ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779076347458",
    version: "v160.1",
    date: "2026-05-18T03:52:27.458Z",
    description: "菴占ｳ - 螂ｽ襍ｰ鬥ｬ(繧ｭ繝・し繧ｭ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "菴占ｳ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蜃ｺ豌ｴ諡・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝九す繧ｱ繝ｳ繝｢繝弱ヮ繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779076490880",
    version: "v161.1",
    date: "2026-05-18T03:54:50.880Z",
    description: "莠ｬ驛ｽ - 螂ｽ襍ｰ鬥ｬ(繝偵Λ繝懊け繧ｽ繝ｩ繧､繧｢遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "莠ｬ驛ｽ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "隗堤伐 螟ｧ蜥・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝峨Ξ繝輔か繝ｳ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "荳ｭ莠・陬穂ｺ・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｴ繝ｼ繝ｫ繝峨ラ繝ｪ繝ｼ繝�",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779076548625",
    version: "v162.1",
    date: "2026-05-18T03:55:48.625Z",
    description: "莠ｬ驛ｽ - 螂ｽ襍ｰ鬥ｬ(繝舌Ξ繝ｫ繧ｿ繝ｼ繝ｳ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "莠ｬ驛ｽ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蝗ｽ蛻・蜆ｪ菴・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｪ繧ｪ繝ｳ繝・ぅ繝ｼ繧ｺ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "M.繝・Β繝ｼ繝ｭ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｹ繝ｯ繝ｼ繝ｴ繝ｪ繝√Ε繝ｼ繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779087577837",
    version: "v163.1",
    date: "2026-05-18T06:59:37.837Z",
    description: "莠ｬ驛ｽ - 螂ｽ襍ｰ鬥ｬ(繧ｨ繝ｳ繧ｸ繧ｧ繝ｫ繝懊う繧ｹ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "莠ｬ驛ｽ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "菴舌・惠 螟ｧ霈・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｭ繧ｺ繝・,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "逕ｰ蜿｣ 雋ｫ螟ｪ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｪ繧｢繝ｫ繧ｹ繝・ぅ繝ｼ繝ｫ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779088509658",
    version: "v133.1",
    date: "2026-05-18T07:15:09.658Z",
    description: "莠ｬ驛ｽ - 螂ｽ襍ｰ鬥ｬ(繝ｴ繧｣繧ｹ繝槭・繝ｫ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "莠ｬ驛ｽ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "隘ｿ譚・豺ｳ荵・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝悶Μ繝・け繧ｹ繧｢繝ｳ繝峨Δ繝ｫ繧ｿ繝ｫ",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蟯ｩ逕ｰ 譛帶擂",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｵ繝ｼ繝医ぇ繝ｫ繝翫・繝ｪ繧｢",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779101575795",
    version: "v165.1",
    date: "2026-05-18T10:52:55.795Z",
    description: "蟶ｯ蠎・・ - 螂ｽ襍ｰ鬥ｬ(繝槭ヤ繝弱ざ繧ｦ繝ｪ繧ｭ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蟶ｯ蠎・・",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "weightChange",
        ""operator": ">=",
        ""value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "螟ｧ蜿倶ｸ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝槭Ν繝九そ繝ｳ繝励・",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "閾ｼ譚ｵ鮴・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝輔リ繝弱け繝ｳ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779101638178",
    version: "v166.1",
    date: "2026-05-18T10:53:58.178Z",
    description: "蟶ｯ蠎・・ - 螂ｽ襍ｰ鬥ｬ(繧ｯ繝ｪ繧ｹ繧ｿ繝ｫ繧ｽ繝ｪ繝・ラ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蟶ｯ蠎・・",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "weightChange",
        ""operator": ">=",
        ""value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "驥醍伐蛻ｩ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｵ繧ｯ繝ｩ繝繧､繝・,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "莉贋ｺ募鴻",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝帙け繧ｷ繝ｧ繧ｦ繝｡繧ｸ繝｣繝ｼ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779101687550",
    version: "v167.1",
    date: "2026-05-18T10:54:47.550Z",
    description: "蟶ｯ蠎・・ - 螂ｽ襍ｰ鬥ｬ(繝溘せ繧ｭ繝｣繝・・遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蟶ｯ蠎・・",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "weightChange",
        ""operator": ">=",
        ""value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "襍､蝪壼▼",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝輔け繝弱き繝溘き繧ｼ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "莉贋ｺ募鴻",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｳ繧ｦ繧ｷ繝･繝上え繝ｳ繧ｫ繧､",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779101713925",
    version: "v168.1",
    date: "2026-05-18T10:55:13.925Z",
    description: "蟶ｯ蠎・・ - 螂ｽ襍ｰ鬥ｬ(繝帙け繧ｻ繧､繧ｭ繝ｬ繧､繧ｺ繧ｭ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蟶ｯ蠎・・",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "weightChange",
        ""operator": ">=",
        ""value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "驤ｴ譛ｨ諱ｵ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝溘ち繧ｳ繝医リ繧､",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "闖頑ｱ�荳",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｸ繧ｧ繧､繝ｯ繝ｳ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779101739501",
    version: "v169.1",
    date: "2026-05-18T10:55:39.501Z",
    description: "蟶ｯ蠎・・ - 螂ｽ襍ｰ鬥ｬ(繧ｹ繧ｫ繧､繝弱メ繧ｫ繝ｩ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蟶ｯ蠎・・",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "weightChange",
        ""operator": ">=",
        ""value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "襍､蝪壼▼",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝輔ず繝繧､繝薙け繝医Μ繝ｼ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "驤ｴ譛ｨ諱ｵ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｳ繧ｦ繧ｷ繝･繝上え繝ｳ繧ｫ繧､",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "閾ｼ譚ｵ鮴・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｸ繧ｧ繧､繝ｯ繝ｳ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779101762230",
    version: "v170.1",
    date: "2026-05-18T10:56:02.230Z",
    description: "蟶ｯ蠎・・ - 螂ｽ襍ｰ鬥ｬ(繝帙け繧ｻ繧､繝薙ャ繧ｯ繝懊せ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蟶ｯ蠎・・",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "weightChange",
        ""operator": ">=",
        ""value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蟲ｶ豢･譁ｰ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧､繝ｳ繝輔ぅ繝九ユ繧｣繝ｼ",
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": ">=",
        ""value": 8,
        "scoreAdjust": 20
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "闊ｹ螻ｱ阡ｵ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝帙Μ繧ｻ繝ｳ繧ｷ繝ｧ繧ｦ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譚ｾ譛ｬ遘",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｳ繧ｸ繝ｭ繧ｦ繧ｹ繝壹す繝｣繝ｫ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779102319303",
    version: "v171.1",
    date: "2026-05-18T11:05:19.303Z",
    description: "蟶ｯ蠎・・ - 螂ｽ襍ｰ鬥ｬ(繧ｭ繝ｧ繧ｦ繧ｨ繧､繝上Φ繧ｿ繝ｼ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蟶ｯ蠎・・",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "weightChange",
        ""operator": ">=",
        ""value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "莉贋ｺ募鴻",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｫ繝阪し繝・Φ繝ｪ繝･繧ｦ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779102353423",
    version: "v172.1",
    date: "2026-05-18T11:05:53.423Z",
    description: "蟶ｯ蠎・・ - 螂ｽ襍ｰ鬥ｬ(繝帙け繝医ヲ繝ｼ繝ｭ繝ｼ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蟶ｯ蠎・・",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "weightChange",
        ""operator": ">=",
        ""value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": ">=",
        ""value": 8,
        "scoreAdjust": 20
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譚台ｸ顔ｫ�",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝繧､繧ｨ繧､繝偵・繝ｭ繝ｼ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "髟ｷ貔､蟷ｸ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝帙け繧ｷ繝ｧ繧ｦ繝繧､繝､",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779102387505",
    version: "v173.1",
    date: "2026-05-18T11:06:27.505Z",
    description: "蟶ｯ蠎・・ - 螂ｽ襍ｰ鬥ｬ(繝溘Ζ繝薙ワ繝､繝悶し遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蟶ｯ蠎・・",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "weightChange",
        ""operator": ">=",
        ""value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譚台ｸ顔ｫ�",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｴ繝ｼ繝ｫ繝・Φ繝輔ず",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "隘ｿ蟆・､ｪ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｸ繧ｧ繧､繝ｯ繝ｳ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779102496844",
    version: "v174.1",
    date: "2026-05-18T11:08:16.844Z",
    description: "蟶ｯ蠎・・ - 螂ｽ襍ｰ鬥ｬ(繧ｫ繧､繧ｻ繝峨け繧ｿ繝ｼ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蟶ｯ蠎・・",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "weightChange",
        ""operator": ">=",
        ""value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": ">=",
        ""value": 8,
        "scoreAdjust": 20
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "髦ｿ驛ｨ豁ｦ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｫ繝阪し繝・Φ繝ｪ繝･繧ｦ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779102547749",
    version: "v175.1",
    date: "2026-05-18T11:09:07.749Z",
    description: "蟶ｯ蠎・・ - 螂ｽ襍ｰ鬥ｬ(繝帙け繧ｻ繧､繧ｿ繧､繝ｨ繧ｦ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蟶ｯ蠎・・",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "weightChange",
        ""operator": ">=",
        ""value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "驤ｴ譛ｨ諱ｵ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝輔ず繝繧､繝薙け繝医Μ繝ｼ",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "隘ｿ隰吩ｸ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｬ繝・ヨ繝繧､繝､",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779103086277",
    version: "v176.1",
    date: "2026-05-18T11:18:06.277Z",
    description: "逶帛ｲ｡ - 螂ｽ襍ｰ鬥ｬ(繧ｻ繧､繝・う繧ｵ繧ｦ繧ｶ繝ｼ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "逶帛ｲ｡",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "鬮俶ｩ区あ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝槭け繝輔ぅ",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "驤ｴ譛ｨ逾・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝輔か繝ｼ繧ｦ繧｣繝ｼ繝ｫ繝峨Λ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779103129828",
    version: "v177.1",
    date: "2026-05-18T11:18:49.828Z",
    description: "逶帛ｲ｡ - 螂ｽ襍ｰ鬥ｬ(繧ｿ繧ｫ繝槭く繝翫う繝ｳ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "逶帛ｲ｡",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "菴舌・ｿ・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝溘せ繝√Χ繧｣繧｢繧ｹ繧｢繝ｬ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779103176317",
    version: "v178.1",
    date: "2026-05-18T11:19:36.317Z",
    description: "逶帛ｲ｡ - 螂ｽ襍ｰ鬥ｬ(繝､繝槭ル繝ｳ繝ｩ繝ｪ繧｢繝ｳ繧ｹ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "逶帛ｲ｡",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "weightChange",
        ""operator": "<=",
        ""value": -10,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "螻ｱ譛ｬ邏",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｴ繝ｼ繝ｫ繝峨す繝・・",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蟯ｩ譛ｬ諤・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｷ繝･繝ｴ繧｡繝ｫ繧ｰ繝ｩ繝ｳ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779103245712",
    version: "v179.1",
    date: "2026-05-18T11:20:45.712Z",
    description: "逶帛ｲ｡ - 螂ｽ襍ｰ鬥ｬ(繝｢繝ｳ繝ｫ繝咲ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "逶帛ｲ｡",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "驤ｴ譛ｨ逾・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝｢繝ｼ繝九Φ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "螻ｱ譛ｬ邏",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝医・繧ｻ繝ｳ繝ｩ繝ｼ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779103293134",
    version: "v180.1",
    date: "2026-05-18T11:21:33.134Z",
    description: "逶帛ｲ｡ - 螂ｽ襍ｰ鬥ｬ(繧ｳ繧ｦ繝舌う遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "逶帛ｲ｡",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蝮ゆｺ慕騒",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝槭ヤ繝ｪ繝繧ｴ繝・・",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蝪壽悽豸ｼ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｯ繝ｼ繝ｫ繝峨お繝ｼ繧ｹ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779103349279",
    version: "v181.1",
    date: "2026-05-18T11:22:29.279Z",
    description: "逶帛ｲ｡ - 螂ｽ襍ｰ鬥ｬ(繝・い繝輔Μ繝ｳ繧ｬ繝ｼ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "逶帛ｲ｡",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "鬮俶收莠ｮ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝薙・繝√ヱ繝医Ο繝ｼ繝ｫ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "weightChange",
        ""operator": "<=",
        ""value": -10,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "闖・次霎ｰ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｴ繝ｼ繝ｫ繝峨ラ繝ｪ繝ｼ繝�",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779103383563",
    version: "v182.1",
    date: "2026-05-18T11:23:03.563Z",
    description: "逶帛ｲ｡ - 螂ｽ襍ｰ鬥ｬ(繝槭リ繝帙け繝ｩ繝狗ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "逶帛ｲ｡",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "螻ｱ譛ｬ謾ｿ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｨ繧､繧ｷ繝ｳ繝輔Λ繝・す繝･",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": ">=",
        ""value": 8,
        "scoreAdjust": 20
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "髦ｿ驛ｨ闍ｱ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝倥ル繝ｼ繝偵Η繝ｼ繧ｺ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779103410997",
    version: "v183.1",
    date: "2026-05-18T11:23:30.997Z",
    description: "逶帛ｲ｡ - 螂ｽ襍ｰ鬥ｬ(繧ｫ繝ｪ繝ｼ繧ｿ繝輔ぉ繝ｪ繧ｹ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "逶帛ｲ｡",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譚台ｸ雁ｿ・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｴ繝ｼ繝ｫ繝峨す繝・・",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "螻ｱ譛ｬ謾ｿ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｭ繝ｼ繧ｸ繧ｺ繧､繝ｳ繝｡繧､",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779103455197",
    version: "v184.1",
    date: "2026-05-18T11:24:15.197Z",
    description: "逶帛ｲ｡ - 螂ｽ襍ｰ鬥ｬ(繧ｳ繝代ヮ繝槭Ο繝ｳ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "逶帛ｲ｡",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譚台ｸ雁ｿ・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝｢繧ｺ繧｢繧ｹ繧ｳ繝・ヨ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "鬮俶收莠ｮ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｫ繝ｬ繝ｳ繝悶Λ繝・け繝偵Ν",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779103784902",
    version: "v185.1",
    date: "2026-05-18T11:29:44.902Z",
    description: "逶帛ｲ｡ - 螂ｽ襍ｰ鬥ｬ(繧､繧ｿ繧ｺ繝ｩ繝吶ぎ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "逶帛ｲ｡",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蟯ｩ譛ｬ諤・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝溘せ繝√Χ繧｣繧｢繧ｹ繧｢繝ｬ",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "菴舌・ｿ・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｵ繝ｳ繝繝ｼ繧ｹ繝弱・",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779103907303",
    version: "v186.1",
    date: "2026-05-18T11:31:47.303Z",
    description: "驥第ｲ｢ - 螂ｽ襍ｰ鬥ｬ(繝槭Ν繧ｫ繝ｳ繝槭う繝､繝ｼ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "驥第ｲ｢",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "逕ｲ雉蠑・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｬ繝・ラ繧ｹ繝代・繝",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "髱呈浹豁｣",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝医・繝帙え繧ｸ繝｣繝・き繝ｫ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779103956984",
    version: "v187.1",
    date: "2026-05-18T11:32:36.984Z",
    description: "驥第ｲ｢ - 螂ｽ襍ｰ鬥ｬ(繝・Ν繧ｿ繝九Η繝ｼ繝医Λ繝ｫ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "驥第ｲ｢",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "逕ｰ遏･蠑・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝｢繧ｺ繧｢繧ｹ繧ｳ繝・ヨ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蜷臥伐譎・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝輔ぅ繧ｨ繝ｼ繝ｫ繝槭Φ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譟ｴ逕ｰ蜍・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝繝弱Φ繝舌Λ繝ｼ繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779104004690",
    version: "v188.1",
    date: "2026-05-18T11:33:24.690Z",
    description: "驥第ｲ｢ - 螂ｽ襍ｰ鬥ｬ(繧ｫ繝輔ず繧ｦ繝ｴ繧｡遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "驥第ｲ｢",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "髱呈浹豁｣",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "・･・趣ｽ・ｽ鯉ｽ会ｽ難ｽ医・｣",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蜉�阯､鄙・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝吶Ν繧ｷ繝｣繧ｶ繝ｼ繝ｫ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779104082319",
    version: "v189.1",
    date: "2026-05-18T11:34:42.319Z",
    description: "驥第ｲ｢ - 螂ｽ襍ｰ鬥ｬ(繝九Η繝ｼ繝ｬ繝医Ο遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "驥第ｲ｢",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譚ｾ謌ｸ謾ｿ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝吶Ν繧ｷ繝｣繧ｶ繝ｼ繝ｫ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "荳ｭ蟲ｶ鮴・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝上・繝・け繝ｩ繧､",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779104111855",
    version: "v190.1",
    date: "2026-05-18T11:35:11.855Z",
    description: "驥第ｲ｢ - 螂ｽ襍ｰ鬥ｬ(繧ｹ繧ｫ繧､繝ｪ繧ｹ繝育ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "驥第ｲ｢",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蜷牙次蟇・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝弱Χ繧ｧ繝ｪ繧ｹ繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779104155538",
    version: "v191.1",
    date: "2026-05-18T11:35:55.538Z",
    description: "驥第ｲ｢ - 螂ｽ襍ｰ鬥ｬ(繧ｵ繧ｯ繝ｩ繝ｫ繝ｼ繝輔ぉ繝ｳ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "驥第ｲ｢",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": ">=",
        ""value": 8,
        "scoreAdjust": 20
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "豬・㍽逋ｻ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧｢繧､繝ｫ繝上Χ繧｢繝翫じ繝ｼ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譬怜次螟ｧ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｸ繝｣繧ｹ繧ｿ繧ｦ繧ｧ繧､",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779104226494",
    version: "v192.1",
    date: "2026-05-18T11:37:06.494Z",
    description: "驥第ｲ｢ - 螂ｽ襍ｰ鬥ｬ(繧ｳ繝代ヮ繧ｨ繝溘Μ繧｢遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "驥第ｲ｢",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "weightChange",
        ""operator": ">=",
        ""value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "貂｡驍顔ｫ・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｳ繝代ヮ繝ｪ繝・く繝ｼ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "鬲壻ｽ剰ｬ・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｬ繧､繝ｳ繝懊・繝ｩ繧､繝ｳ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779104257035",
    version: "v193.1",
    date: "2026-05-18T11:37:37.035Z",
    description: "驥第ｲ｢ - 螂ｽ襍ｰ鬥ｬ(繝帙Ρ繧､繝医・繝・ラ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "驥第ｲ｢",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "weightChange",
        ""operator": "<=",
        ""value": -10,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": ">=",
        ""value": 8,
        "scoreAdjust": 20
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蜷牙次蟇・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝繝ｳ繧ｫ繝ｼ繧ｯ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譛帶怦豢ｵ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝溘せ繧ｿ繝ｼ繝｡繝ｭ繝・ぅ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779104459889",
    version: "v194.1",
    date: "2026-05-18T11:40:59.889Z",
    description: "鬮倡衍 - 螂ｽ襍ｰ鬥ｬ(繧ｷ繝･繝槭Φ繝峨Ο繝ｯ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "鬮倡衍",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "螻ｱ逕ｰ雋ｴ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝｢繝ｼ繝ｪ繧ｹ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779104490109",
    version: "v195.1",
    date: "2026-05-18T11:41:30.109Z",
    description: "鬮倡衍 - 螂ｽ襍ｰ鬥ｬ(繝弱う繝､繝ｼ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "鬮倡衍",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "荳顔伐蟆・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝九Η繝ｼ繧､繝､繝ｼ繧ｺ繝・う",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蝓朱㍽諷・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｪ繝ｫ繝輔ぉ繝ｼ繝ｴ繝ｫ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779105361209",
    version: "v196.1",
    date: "2026-05-18T11:56:01.209Z",
    description: "鬮倡衍 - 螂ｽ襍ｰ鬥ｬ(繧ｼ繝ｳ繝弱た繝悶Μ繝ｳ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "鬮倡衍",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "螻ｱ蟠朱寉",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｷ繝｣繝ｳ繝上う繝懊ン繝ｼ",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蟯｡譚大酷",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝輔ぃ繧､繝ｳ繝九・繝峨Ν",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779105390417",
    version: "v197.1",
    date: "2026-05-18T11:56:30.417Z",
    description: "鬮倡衍 - 螂ｽ襍ｰ鬥ｬ(繝昴ャ繝峨Ο繧､遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "鬮倡衍",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蟯｡譚大酷",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝悶Μ繝・け繧ｹ繧｢繝ｳ繝峨Δ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "螻ｱ逕ｰ雋ｴ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧｢繧ｸ繧｢繧ｨ繧ｯ繧ｹ繝励Ξ繧ｹ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779106100085",
    version: "v198.1",
    date: "2026-05-18T12:08:20.085Z",
    description: "鬮倡衍 - 螂ｽ襍ｰ鬥ｬ(繧ｫ繧ｲ繝槭Ν遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "鬮倡衍",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "weightChange",
        ""operator": ">=",
        ""value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "襍､蟯｡菫ｮ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝倥ル繝ｼ繝偵Η繝ｼ繧ｺ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "螟ｧ貔､隱�",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｩ繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779106129700",
    version: "v199.1",
    date: "2026-05-18T12:08:49.700Z",
    description: "鬮倡衍 - 螂ｽ襍ｰ鬥ｬ(繧ｳ繝弱Κ繝ｫ繝ｲ繝医Γ繝・Κ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "鬮倡衍",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蟯｡譚大酷",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝舌Φ繝悶・繧ｨ繝ｼ繝ｫ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779106161648",
    version: "v200.1",
    date: "2026-05-18T12:09:21.648Z",
    description: "鬮倡衍 - 螂ｽ襍ｰ鬥ｬ(繧ｰ繝ｩ繝ｳ繝・い繝ｼ繝・Β遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "鬮倡衍",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": ">=",
        ""value": 8,
        "scoreAdjust": 20
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "螟夂伐隱�",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝槭け繝輔ぅ",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "菴仙次遘",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝槭う繝ｳ繝峨Θ繧｢繝薙せ繧ｱ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779106190420",
    version: "v201.1",
    date: "2026-05-18T12:09:50.420Z",
    description: "鬮倡衍 - 螂ｽ襍ｰ鬥ｬ(繝吶せ繝医ョ繧｣繧ｷ繧ｸ繝ｧ繝ｳ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "鬮倡衍",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "豌ｸ譽ｮ螟ｧ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝繧､繝ｯ繝｡繧ｸ繝｣繝ｼ",
        "scoreAdjust": 15
      },
      {
        "field": "weightChange",
        ""operator": ">=",
        ""value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "(螟画峩)",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝帙ャ繧ｳ繝ｼ繧ｿ繝ｫ繝槭お",
        "scoreAdjust": 15
      },
      {
        "field": "weightChange",
        ""operator": "<=",
        ""value": -10,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": ">=",
        ""value": 8,
        "scoreAdjust": 20
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "髦ｿ驛ｨ蝓ｺ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝輔Μ繧ｪ繝ｼ繧ｽ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779106256624",
    version: "v202.1",
    date: "2026-05-18T12:10:56.624Z",
    description: "鬮倡衍 - 螂ｽ襍ｰ鬥ｬ(繧ｷ繝ｳ繝・Ξ繝ｩ繧ｹ繝槭う繝ｫ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "鬮倡衍",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "荳顔伐蟆・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｭ繝ｳ繧ｷ繝｣繧ｵ繝弱く繧ｻ繧ｭ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譛ｨ譚醍峩",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｵ繝医ヮ繧ｯ繝ｩ繧ｦ繝ｳ",
        "scoreAdjust": 15
      },
      {
        "field": "weightChange",
        ""operator": "<=",
        ""value": -10,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "(螟画峩)",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝九す繧ｱ繝ｳ繝｢繝弱ヮ繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779106373827",
    version: "v203.1",
    date: "2026-05-18T12:12:53.827Z",
    description: "莠ｬ驛ｽ - 螂ｽ襍ｰ鬥ｬ(繧ｷ繧ｨ繝ｼ繝翫き繝ｩ繝ｼ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "莠ｬ驛ｽ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "驟剃ｺ・蟄ｦ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝・け繝ｩ繝ｬ繝ｼ繧ｷ繝ｧ繝ｳ繧ｪ繝悶え繧ｩ繝ｼ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "魄ｫ蟲ｶ 蜈矩ｧｿ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｴ繝ｼ繝ｫ繝峨ラ繝ｪ繝ｼ繝�",
        "scoreAdjust": 15
      },
      {
        "field": "weightChange",
        ""operator": ">=",
        ""value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "闖ｱ逕ｰ 陬穂ｺ・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｯ繝ｪ繧ｽ繝吶Μ繝ｫ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779106422010",
    version: "v204.1",
    date: "2026-05-18T12:13:42.010Z",
    description: "莠ｬ驛ｽ - 螂ｽ襍ｰ鬥ｬ(繧ｸ繝｣繧ｫ繝ｫ繧ｿ繝舌が遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "莠ｬ驛ｽ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "豬應ｸｭ 菫・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｷ繝｣繝ｳ繝上う繝懊ン繝ｼ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "闖ｱ逕ｰ 陬穂ｺ・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝｢繧ｺ繧｢繧ｹ繧ｳ繝・ヨ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蟯ｩ逕ｰ 蠎ｷ隱�",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｵ繝ｼ繝医ぇ繝ｫ繝翫・繝ｪ繧｢",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779106466643",
    version: "v205.1",
    date: "2026-05-18T12:14:26.643Z",
    description: "莠ｬ驛ｽ - 螂ｽ襍ｰ鬥ｬ(繝偵Λ繝懊け繧ｽ繝ｩ繧､繧｢遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "莠ｬ驛ｽ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "隗堤伐 螟ｧ蜥・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝峨Ξ繝輔か繝ｳ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "荳ｭ莠・陬穂ｺ・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｴ繝ｼ繝ｫ繝峨ラ繝ｪ繝ｼ繝�",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779106665124",
    version: "v206.1",
    date: "2026-05-18T12:17:45.124Z",
    description: "莠ｬ驛ｽ - 螂ｽ襍ｰ鬥ｬ(繝壹・繝√ラ繝悶ャ繝峨Ξ繧｢遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "莠ｬ驛ｽ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蝗｣驥・螟ｧ謌・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧､繧ｹ繝ｩ繝懊ル繝ｼ繧ｿ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "鬮俶揄 蜷城ｺ・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｳ繝ｳ繝医Ξ繧､繝ｫ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "逕ｰ螻ｱ 譌ｺ菴・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｨ繝斐ヵ繧｡繝阪う繧｢",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779106710602",
    version: "v207.1",
    date: "2026-05-18T12:18:30.602Z",
    description: "莠ｬ驛ｽ - 螂ｽ襍ｰ鬥ｬ(繧ｨ繝ｳ繧ｸ繧ｧ繝ｫ繝懊う繧ｹ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "莠ｬ驛ｽ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "菴舌・惠 螟ｧ霈・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｭ繧ｺ繝・,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "逕ｰ蜿｣ 雋ｫ螟ｪ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｪ繧｢繝ｫ繧ｹ繝・ぅ繝ｼ繝ｫ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779106960860",
    version: "v208.1",
    date: "2026-05-18T12:22:40.860Z",
    description: "譁ｰ貎・- 螂ｽ襍ｰ鬥ｬ(繝槭Μ繧｢繧､繝ｪ繝繝ｼ繧ｿ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譁ｰ貎・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "闊溷ｱｱ 迹�豕・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝峨ぇ繝ｩ繝｡繝ｳ繝・,
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "荳ｸ逕ｰ 諱ｭ莉・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｨ繝斐ヵ繧｡繝阪う繧｢",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779133839288",
    version: "v209.1",
    date: "2026-05-18T19:50:39.288Z",
    description: "螟ｧ莠・- 螂ｽ襍ｰ鬥ｬ(繝ｨ繝ｭ繧ｷ繧ｯ繝ｦ繧ｦ繧ｭ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "螟ｧ莠・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "鬮俶ｩ区亊",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝倥Φ繝ｪ繝ｼ繝舌Ο繝ｼ繧ｺ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779133880018",
    version: "v210.1",
    date: "2026-05-18T19:51:20.018Z",
    description: "螟ｧ莠・- 螂ｽ襍ｰ鬥ｬ(繧ｦ繧｣繝ｫ繧､繝ｫ繝溽ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "螟ｧ莠・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蜷我ｺ慕ｫ�",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｷ繝九せ繧ｿ繝ｼ繝溘ル繧ｹ繧ｿ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "闖・次豸ｼ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｵ繝ｳ繝繝ｼ繧ｹ繝弱・",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779133956414",
    version: "v211.1",
    date: "2026-05-18T19:52:36.414Z",
    description: "螟ｧ莠・- 螂ｽ襍ｰ鬥ｬ(繧ｰ繝ｬ繝ｼ繝後ラ繧ｹ繧ｿ繝ｼ繝ｫ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "螟ｧ莠・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "隘ｿ蝠灘､ｪ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｹ繝・Ν繝ｴ繧｣繧ｪ",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "驕泌沁鮴・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｿ繧､繧ｻ繧､繝ｬ繧ｸ繧ｧ繝ｳ繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779133986329",
    version: "v212.1",
    date: "2026-05-18T19:53:06.329Z",
    description: "螟ｧ莠・- 螂ｽ襍ｰ鬥ｬ(繧ｨ繝�繝・ぅ繧ｭ繝ｳ繧ｰ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "螟ｧ莠・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "隹ｷ蜀・ｲｫ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧｢繝峨・繧､繝､繝槭・繧ｺ",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譚牙ｱｱ豬ｷ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｵ繝ｳ繝繝ｼ繧ｹ繝弱・",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779135062128",
    version: "v213.1",
    date: "2026-05-18T20:11:02.128Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繝ｯ繧､繧ｺ繧ｮ繝｣繝ｳ繧ｰ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "髟ｷ蟯｡ 遖惹ｻ・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝溘せ繝√Χ繧｣繧｢繧ｹ繧｢繝ｬ繝・け繧ｹ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779135101820",
    version: "v214.1",
    date: "2026-05-18T20:11:41.820Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繝医Α繝ｼ繝舌Ο繝ｼ繧ｺ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蝮ゆｺ・迹�譏・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝倥Φ繝ｪ繝ｼ繝舌Ο繝ｼ繧ｺ",
        "scoreAdjust": 15
      },
      {
        "field": "weightChange",
        ""operator": ">=",
        ""value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蛹玲搗 螳丞昇",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｬ繧､繝・が繝ｭ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "謌ｸ蟠・蝨ｭ螟ｪ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｭ繧ｺ繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779135147834",
    version: "v215.1",
    date: "2026-05-18T20:12:27.834Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繝・ぅ繝ｼ繝励く繝ｳ繧ｰ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "age",
        ""operator": ">=",
        ""value": 8,
        "scoreAdjust": 20
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "荳ｹ蜀・逾先ｬ｡",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝・ぅ繝ｼ繝励う繝ｳ繝代け繝・,
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "D.繝ｬ繝ｼ繝ｳ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝輔ぅ繧ｨ繝ｼ繝ｫ繝槭Φ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779135193518",
    version: "v216.1",
    date: "2026-05-18T20:13:13.518Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繧ｨ繝ｫ繝槭・繧ｴ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "F.繧ｴ繝ｳ繧ｵ繝ｫ繝吶せ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｵ繝ｼ繝医ぇ繝ｫ繝翫・繝ｪ繧｢",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "闖・次 譏手憶",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｭ繧ｸ繝｣繝ｼ繝舌Ο繝ｼ繧ｺ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "荳ｹ蜀・逾先ｬ｡",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｨ繝斐ヵ繧｡繝阪う繧｢",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779135240158",
    version: "v217.1",
    date: "2026-05-18T20:14:00.158Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繝医Ν繧ｷ繝ｧ繝ｼ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蟯ｩ逕ｰ 譛帶擂",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｷ繝九せ繧ｿ繝ｼ繝溘ル繧ｹ繧ｿ繝ｼ",
        "scoreAdjust": 15
      },
      {
        "field": "weightChange",
        ""operator": "<=",
        ""value": -10,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "F.繧ｴ繝ｳ繧ｵ繝ｫ繝吶せ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譚ｾ闍･ 鬚ｨ鬥ｬ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝｢繝ｼ繝九Φ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779135248578",
    version: "v218.1",
    date: "2026-05-18T20:14:08.578Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繝医Ν繧ｷ繝ｧ繝ｼ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蟯ｩ逕ｰ 譛帶擂",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｷ繝九せ繧ｿ繝ｼ繝溘ル繧ｹ繧ｿ繝ｼ",
        "scoreAdjust": 15
      },
      {
        "field": "weightChange",
        ""operator": "<=",
        ""value": -10,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "F.繧ｴ繝ｳ繧ｵ繝ｫ繝吶せ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譚ｾ闍･ 鬚ｨ鬥ｬ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝｢繝ｼ繝九Φ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779148526333",
    version: "v219.1",
    date: "2026-05-18T23:55:26.333Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繧ｨ繝ｳ繝悶Ο繧､繝繝ｪ繝ｼ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "C.繝ｫ繝｡繝ｼ繝ｫ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧｢繝峨・繧､繝､繝槭・繧ｺ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蟾晉伐 蟆・寉",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝悶Λ繝・け繧ｿ繧､繝・,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "隘ｿ譚・豺ｳ荵・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｭ繧ｺ繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779148684014",
    version: "v220.1",
    date: "2026-05-18T23:58:04.014Z",
    description: "蟶ｯ蠎・・ - 螂ｽ襍ｰ鬥ｬ(繧ｫ繝阪ヮ繝槭ャ繧ｯ繧､繝ｼ繝ｳ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蟶ｯ蠎・・",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "weightChange",
        ""operator": ">=",
        ""value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "髦ｿ驛ｨ蜆ｪ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｫ繝阪だ繧ｦ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779148720050",
    version: "v221.1",
    date: "2026-05-18T23:58:40.050Z",
    description: "蟶ｯ蠎・・ - 螂ｽ襍ｰ鬥ｬ(繧ｫ繝阪ヮ繝槭ャ繧ｯ繧､繝ｼ繝ｳ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蟶ｯ蠎・・",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "weightChange",
        ""operator": ">=",
        ""value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "髦ｿ驛ｨ蜆ｪ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｫ繝阪だ繧ｦ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779160676713",
    version: "v222.1",
    date: "2026-05-19T03:17:56.713Z",
    description: "逶帛ｲ｡ - 螂ｽ襍ｰ鬥ｬ(繧ｰ繝ｬ繧ｳ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "逶帛ｲ｡",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "髢｢譛ｬ邇ｲ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｵ繝ｳ繧ｰ繝ｬ繝ｼ繧ｶ繝ｼ",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "螻ｱ譛ｬ邏",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝｢繝ｼ繝ｪ繧ｹ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779160747551",
    version: "v222.1",
    date: "2026-05-19T03:19:07.551Z",
    description: "逶帛ｲ｡ - 螂ｽ襍ｰ鬥ｬ(繝ｩ繝溘い繝ｴ繧｣繝ｼ繧ｿ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "逶帛ｲ｡",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蟆乗棊蜃・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝槭ヤ繝ｪ繝繧ｴ繝・・",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779160874929",
    version: "v223.1",
    date: "2026-05-19T03:21:14.929Z",
    description: "逶帛ｲ｡ - 螂ｽ襍ｰ鬥ｬ(繝輔か繝ｼ繝ｬ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "逶帛ｲ｡",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "驤ｴ譛ｨ逾・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｴ繧｡繝ｳ繧ｻ繝ｳ繝・,
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蝮ゆｺ慕騒",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｫ繝ｬ繝ｳ繝悶Λ繝・け繝偵Ν",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779160905526",
    version: "v224.1",
    date: "2026-05-19T03:21:45.526Z",
    description: "逶帛ｲ｡ - 螂ｽ襍ｰ鬥ｬ(繝舌・繝峨ワ繧ｺ繝輔Ο繧ｦ繝ｳ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "逶帛ｲ｡",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": ">=",
        ""value": 8,
        "scoreAdjust": 20
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "菴舌・ｿ・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝吶・繧ｫ繝舌ラ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "驤ｴ譛ｨ逾・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝医ぇ繧ｶ繝ｯ繝ｼ繝ｫ繝・,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "鬮俶ｩ区あ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｬ繧ｬ繝ｼ繝ｭ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779160938526",
    version: "v225.1",
    date: "2026-05-19T03:22:18.526Z",
    description: "逶帛ｲ｡ - 螂ｽ襍ｰ鬥ｬ(繝｡繝繝・Ζ繝・ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "逶帛ｲ｡",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蜊鈴・螳ｶ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｯ繝ｪ繧ｨ繧､繧ｿ繝ｼ・・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779161032779",
    version: "v226.1",
    date: "2026-05-19T03:23:52.779Z",
    description: "逶帛ｲ｡ - 螂ｽ襍ｰ鬥ｬ(繝ｬ繝弱Χ繧｡繝・ぅ繧ｪ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "逶帛ｲ｡",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "weightChange",
        ""operator": ">=",
        ""value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譚台ｸ雁ｿ・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｯ繝ｪ繧ｽ繝吶Μ繝ｫ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "闖・次霎ｰ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝悶Ν繝峨ャ繧ｰ繝懊せ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779161078334",
    version: "v227.1",
    date: "2026-05-19T03:24:38.334Z",
    description: "逶帛ｲ｡ - 螂ｽ襍ｰ鬥ｬ(繧ｵ繧ｹ繧ｱ繝吶Λ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "逶帛ｲ｡",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "闖・次霎ｰ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧､繧ｹ繝ｩ繝懊ル繝ｼ繧ｿ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "螻ｱ譛ｬ謾ｿ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝輔Μ繧ｪ繝ｼ繧ｽ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779161107447",
    version: "v228.1",
    date: "2026-05-19T03:25:07.447Z",
    description: "逶帛ｲ｡ - 螂ｽ襍ｰ鬥ｬ(繧ｹ繧ｿ繝ｼ繧ｭ繝ｼ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "逶帛ｲ｡",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "螻ｱ譛ｬ閨｡",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝｡繧､繧ｷ繝ｧ繧ｦ繝懊・繝ｩ繝ｼ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蟆乗棊蜃・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝輔ぃ繧､繝ｳ繝九・繝峨Ν",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779161135286",
    version: "v229.1",
    date: "2026-05-19T03:25:35.286Z",
    description: "逶帛ｲ｡ - 螂ｽ襍ｰ鬥ｬ(繧､繧ｭ繧ｶ繝樒ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "逶帛ｲ｡",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": ">=",
        ""value": 8,
        "scoreAdjust": 20
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "螻ｱ譛ｬ邏",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｵ繧ｦ繧ｹ繝ｴ繧｣繧ｰ繝ｩ繧ｹ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "螻ｱ譛ｬ謾ｿ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧｢繝峨・繧､繝､繝�繝ｼ繝ｳ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譚台ｸ雁ｿ・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｫ繝ｴ繧｡繝ｳ繧ｹ繝ｬ繝ｼ繝ｴ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779161164756",
    version: "v230.1",
    date: "2026-05-19T03:26:04.756Z",
    description: "逶帛ｲ｡ - 螂ｽ襍ｰ鬥ｬ(繝・Ν繝・ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "逶帛ｲ｡",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "髢｢譛ｬ邇ｲ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝上・繝・け繝ｩ繧､",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779161196910",
    version: "v231.1",
    date: "2026-05-19T03:26:36.910Z",
    description: "逶帛ｲ｡ - 螂ｽ襍ｰ鬥ｬ(繝翫Β繝ｩ繝懊せ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "逶帛ｲ｡",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": ">=",
        ""value": 8,
        "scoreAdjust": 20
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "驤ｴ譛ｨ逾・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝医ぇ繧ｶ繧ｰ繝ｭ繝ｼ繝ｪ繝ｼ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779161347881",
    version: "v232.1",
    date: "2026-05-19T03:29:07.881Z",
    description: "螟ｧ莠・- 螂ｽ襍ｰ鬥ｬ(繝ｨ繝ｭ繧ｷ繧ｯ繝ｦ繧ｦ繧ｭ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "螟ｧ莠・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "鬮俶ｩ区亊",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝倥Φ繝ｪ繝ｼ繝舌Ο繝ｼ繧ｺ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779161384182",
    version: "v233.1",
    date: "2026-05-19T03:29:44.182Z",
    description: "螟ｧ莠・- 螂ｽ襍ｰ鬥ｬ(繝翫リ繧ｻ繧ｷ繝ｧ繝ｼ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "螟ｧ莠・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "闖・次豸ｼ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｵ繝ｳ繝繝ｼ繧ｹ繝弱・",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779161445862",
    version: "v234.1",
    date: "2026-05-19T03:30:45.862Z",
    description: "螟ｧ莠・- 螂ｽ襍ｰ鬥ｬ(繧ｰ繝ｬ繝ｼ繝後ラ繧ｹ繧ｿ繝ｼ繝ｫ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "螟ｧ莠・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "隘ｿ蝠灘､ｪ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｹ繝・Ν繝ｴ繧｣繧ｪ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779161529060",
    version: "v235.1",
    date: "2026-05-19T03:32:09.060Z",
    description: "螟ｧ莠・- 螂ｽ襍ｰ鬥ｬ(繝九す繝弱さ繝後き繧｢繝｡遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "螟ｧ莠・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譚牙ｱｱ豬ｷ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｵ繝ｳ繝繝ｼ繧ｹ繝弱・",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779161646736",
    version: "v236.1",
    date: "2026-05-19T03:34:06.736Z",
    description: "螟ｧ莠・- 螂ｽ襍ｰ鬥ｬ(繝｡繧､繧ｷ繝ｧ繧ｦ繝医く繧､繝ｭ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "螟ｧ莠・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "阯､譛ｬ迴ｾ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝・け繝ｩ繝ｬ繝ｼ繧ｷ繝ｧ繝ｳ繧ｪ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779161719807",
    version: "v237.1",
    date: "2026-05-19T03:35:19.807Z",
    description: "螟ｧ莠・- 螂ｽ襍ｰ鬥ｬ(繝輔ぅ繝ｩ繧､繝ｳ繧ｰ繝ｬ繝ｼ繧ｹ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "螟ｧ莠・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "鮃ｹ隕矩匣",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝繝ｳ繧ｫ繝ｼ繧ｯ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779161760979",
    version: "v238.1",
    date: "2026-05-19T03:36:00.979Z",
    description: "螟ｧ莠・- 螂ｽ襍ｰ鬥ｬ(繧ｯ繧｢繝・ぜ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "螟ｧ莠・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "遏ｳ蟾晞ｧｿ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｹ繝弱・繝峨Λ繧ｴ繝ｳ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蜥檎伐隴ｲ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｪ繧｢繝ｫ繧､繝ｳ繝代け繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779161789258",
    version: "v239.1",
    date: "2026-05-19T03:36:29.258Z",
    description: "螟ｧ莠・- 螂ｽ襍ｰ鬥ｬ(繝ｭ繝ｼ繝峨Ν繝ｼ繝√ぉ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "螟ｧ莠・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "阯､譛ｬ迴ｾ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝輔か繝ｼ繧ｦ繧｣繝ｼ繝ｫ繝峨Λ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "遏｢驥手ｲｴ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝｢繝ｼ繝九Φ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779161819403",
    version: "v240.1",
    date: "2026-05-19T03:36:59.403Z",
    description: "螟ｧ莠・- 螂ｽ襍ｰ鬥ｬ(繧｢繧ｪ繧､繧ｳ繧ｦ繧ｭ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "螟ｧ莠・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "鬮俶ｩ区亊",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｭ繝ｼ繝峨き繝翫Ο繧｢",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "螳芽陸豢・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｭ繧ｿ繧ｵ繝ｳ繝悶Λ繝・け",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779161846928",
    version: "v241.1",
    date: "2026-05-19T03:37:26.928Z",
    description: "螟ｧ莠・- 螂ｽ襍ｰ鬥ｬ(繧ｻ繧ｭ繝医ヰ繧ｷ繝･繝ｼ繧ｺ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "螟ｧ莠・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "阯､逕ｰ蜃・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｭ繧ｿ繧ｵ繝ｳ繝悶Λ繝・け",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779161876173",
    version: "v242.1",
    date: "2026-05-19T03:37:56.173Z",
    description: "螟ｧ莠・- 螂ｽ襍ｰ鬥ｬ(繧ｸ繝｣繧ｹ繝溘Φ繝・・遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "螟ｧ莠・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譛ｬ讖句ｭ・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝繝弱Φ繝ｬ繧ｸ繧ｧ繝ｳ繝・,
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譚牙ｱｱ豬ｷ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｴ繝ｼ繝ｫ繝峨ラ繝ｪ繝ｼ繝�",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779161922367",
    version: "v243.1",
    date: "2026-05-19T03:38:42.368Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繧ｫ繝ｼ繝懊ヵ繝ｪ繧ｪ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "菴占陸 鄙秘ｦｬ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝翫ム繝ｫ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779161969225",
    version: "v244.1",
    date: "2026-05-19T03:39:29.225Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繧ｿ繝ｼ繝輔け繝ｪ繧ｹ繧ｿ繝ｫ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "豎溽伐 辣ｧ逕ｷ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧､繝ｳ繧ｫ繝ｳ繝・・繧ｷ繝ｧ繝ｳ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "謌ｸ蟠・蝨ｭ螟ｪ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝薙・繝√ヱ繝医Ο繝ｼ繝ｫ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779162007283",
    version: "v245.1",
    date: "2026-05-19T03:40:07.283Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繧｢繝ｴ繧｡繝ｩ繝ｳ繝∫ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "荳画ｵｦ 逧・・",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝槭ず繧ｧ繧ｹ繝・ぅ繝・け繧ｦ繧ｩ繝ｪ繧｢繝ｼ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蜴・蜆ｪ莉・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｹ繝ｯ繝ｼ繝ｴ繝ｪ繝√Ε繝ｼ繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779162050961",
    version: "v246.1",
    date: "2026-05-19T03:40:50.961Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繧ｫ繝ｳ繝・ぅ繝ｼ繝顔ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "螟ｧ驥・諡灘ｼ･",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｷ繝ｫ繝舌・繧ｹ繝・・繝・,
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "D.繝ｬ繝ｼ繝ｳ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｳ繝ｳ繝医Ξ繧､繝ｫ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779162100053",
    version: "v247.1",
    date: "2026-05-19T03:41:40.053Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繝ｬ繝ｴ繧ｧ繝ｩ繝ｳ繧ｸ繧ｧ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "菴舌・惠 螟ｧ霈・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｵ繝ｳ繧ｰ繝ｬ繝ｼ繧ｶ繝ｼ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779162150021",
    version: "v248.1",
    date: "2026-05-19T03:42:30.021Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繝槭ず繝ｧ繝ｬ繝ｫ繝悶Ν繝ｼ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "謌ｸ蟠・蝨ｭ螟ｪ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｳ繝ｳ繝医Ξ繧､繝ｫ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蜴・蜆ｪ莉・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｬ繧､繝・が繝ｭ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779162191222",
    version: "v249.1",
    date: "2026-05-19T03:43:11.222Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繧ｷ繝ｧ繝ｼ繝ｪ繝舌・繧ｹ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "讓ｪ螻ｱ 蜥檎函",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝輔か繝ｼ繧ｦ繧｣繝ｼ繝ｫ繝峨Λ繧､繝・,
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "荳画ｵｦ 逧・・",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝峨Ξ繝輔か繝ｳ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779162239782",
    version: "v250.1",
    date: "2026-05-19T03:43:59.782Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繧ｳ繝・Ξ繝ｴ繧ｧ繝・く繧ｪ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蛹玲搗 螳丞昇",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝｢繝ｼ繝ｪ繧ｹ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779162274327",
    version: "v251.1",
    date: "2026-05-19T03:44:34.327Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繧ｷ繝｣繝ｳ繧ｽ繝ｳ繝峨・繝ｫ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "D.繝ｬ繝ｼ繝ｳ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｬ繧､繝・が繝ｭ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譚ｾ蟯｡ 豁｣豬ｷ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｪ繧｢繝ｫ繧､繝ｳ繝代け繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779162326550",
    version: "v252.1",
    date: "2026-05-19T03:45:26.550Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繝｡繝ｪ繝・ぅ繧｢繝ｳ繧ｹ繧ｿ繝ｼ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "M.繝・ぅ繝ｼ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝｢繧ｺ繧｢繧ｹ繧ｳ繝・ヨ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "讓ｪ螻ｱ 蜥檎函",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "Exceedance",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "謌ｸ蟠・蝨ｭ螟ｪ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "American Pharoah",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779162574974",
    version: "v254.1",
    date: "2026-05-19T03:49:34.974Z",
    description: "莠ｬ驛ｽ - 螂ｽ襍ｰ鬥ｬ(繝ｫ繝ｼ繧ｸ繝･繝舌Ο繝ｳ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "莠ｬ驛ｽ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weightChange",
        ""operator": "<=",
        ""value": -10,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蝮ゆｺ・迹�譏・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｳ繝ｳ繝医Ξ繧､繝ｫ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "魄ｫ蟲ｶ 濶ｯ螟ｪ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝峨Ξ繝輔か繝ｳ",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "遘句ｱｱ 遞疲ｨｹ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝繝弱Φ繝ｬ繧ｸ繧ｧ繝ｳ繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779162611300",
    version: "v255.1",
    date: "2026-05-19T03:50:11.300Z",
    description: "莠ｬ驛ｽ - 螂ｽ襍ｰ鬥ｬ(繝ｬ繝・ラ繝輔Ο繧､繝・ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "莠ｬ驛ｽ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "鬮俶揄 蜷城ｺ・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝｢繝ｼ繝ｪ繧ｹ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "螟ｪ螳ｰ 蝠謎ｻ・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝帙ャ繧ｳ繝ｼ繧ｿ繝ｫ繝槭お",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779178984701",
    version: "v256.1",
    date: "2026-05-19T08:23:04.701Z",
    description: "蜷榊商螻・- 螂ｽ襍ｰ鬥ｬ(繝�繧ｮ繧ｬ繧ｯ繝繝ｳ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蜷榊商螻・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "荳ｸ驥主享",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝輔ぅ繧ｨ繝ｼ繝ｫ繝槭Φ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779179017109",
    version: "v257.1",
    date: "2026-05-19T08:23:37.109Z",
    description: "蜷榊商螻・- 螂ｽ襍ｰ鬥ｬ(繧ｳ繧ｳ繧､繝ｳ繧ｷ繝・Φ繧ｹ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蜷榊商螻・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譛ｨ荵玖揃",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｷ繝･繝ｴ繧｡繝ｫ繧ｰ繝ｩ繝ｳ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "螻ｱ逕ｰ逾･",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝薙・繝√ヱ繝医Ο繝ｼ繝ｫ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779179049115",
    version: "v258.1",
    date: "2026-05-19T08:24:09.115Z",
    description: "蜷榊商螻・- 螂ｽ襍ｰ鬥ｬ(繝励Λ繧ｦ繝峨ヶ繝ｫ繝ｼ繝吶Ν遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蜷榊商螻・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "霑題陸鬚ｯ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｯ繝ｼ繝ｫ繝峨・繝ｬ繝溘い",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譚台ｸ雁ｼ・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝繝弱Φ繧ｹ繝槭ャ繧ｷ繝･",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "邏ｰ蟾晄匱",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝溘ャ繧ｭ繝ｼ繧｢繧､繝ｫ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779184649826",
    version: "v259.1",
    date: "2026-05-19T09:57:29.827Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繧ｫ繝ｼ繝懊ヵ繝ｪ繧ｪ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "菴占陸 鄙秘ｦｬ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝翫ム繝ｫ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779184689180",
    version: "v260.1",
    date: "2026-05-19T09:58:09.180Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繧ｬ繝ｼ繝・Φ繝舌う繧ｶ繝吶う遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "闖・次 譏手憶",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｫ繝ｼ繝ｩ繝ｼ繧ｷ繝・・",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779187025500",
    version: "v261.1",
    date: "2026-05-19T10:37:05.500Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繧ｫ繝ｼ繝懊ヵ繝ｪ繧ｪ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "菴占陸 鄙秘ｦｬ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝翫ム繝ｫ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779187068397",
    version: "v262.1",
    date: "2026-05-19T10:37:48.397Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繧ｿ繝ｼ繝輔け繝ｪ繧ｹ繧ｿ繝ｫ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "豎溽伐 辣ｧ逕ｷ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧､繝ｳ繧ｫ繝ｳ繝・・繧ｷ繝ｧ繝ｳ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "謌ｸ蟠・蝨ｭ螟ｪ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝薙・繝√ヱ繝医Ο繝ｼ繝ｫ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779187102862",
    version: "v263.1",
    date: "2026-05-19T10:38:22.862Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繧｢繝ｴ繧｡繝ｩ繝ｳ繝∫ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "荳画ｵｦ 逧・・",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝槭ず繧ｧ繧ｹ繝・ぅ繝・け繧ｦ繧ｩ繝ｪ繧｢繝ｼ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蜴・蜆ｪ莉・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｹ繝ｯ繝ｼ繝ｴ繝ｪ繝√Ε繝ｼ繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779187134149",
    version: "v264.1",
    date: "2026-05-19T10:38:54.150Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繧ｫ繝ｳ繝・ぅ繝ｼ繝顔ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "螟ｧ驥・諡灘ｼ･",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｷ繝ｫ繝舌・繧ｹ繝・・繝・,
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "D.繝ｬ繝ｼ繝ｳ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｳ繝ｳ繝医Ξ繧､繝ｫ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779187174959",
    version: "v265.1",
    date: "2026-05-19T10:39:34.959Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繝槭Ν繧ｬ繧､繧ｨ繝ｩ繝ｫ繝・ぅ繝ｼ繧ｯ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "讓ｪ螻ｱ 豁ｦ蜿ｲ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "Sottsass",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "菴舌・惠 螟ｧ霈・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｵ繝ｳ繧ｰ繝ｬ繝ｼ繧ｶ繝ｼ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779187204153",
    version: "v266.1",
    date: "2026-05-19T10:40:04.153Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繝槭ず繝ｧ繝ｬ繝ｫ繝悶Ν繝ｼ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "謌ｸ蟠・蝨ｭ螟ｪ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｳ繝ｳ繝医Ξ繧､繝ｫ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蜴・蜆ｪ莉・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｬ繧､繝・が繝ｭ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779187245921",
    version: "v267.1",
    date: "2026-05-19T10:40:45.921Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繧ｷ繝ｧ繝ｼ繝ｪ繝舌・繧ｹ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "讓ｪ螻ｱ 蜥檎函",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝輔か繝ｼ繧ｦ繧｣繝ｼ繝ｫ繝峨Λ繧､繝・,
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "荳画ｵｦ 逧・・",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝峨Ξ繝輔か繝ｳ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779187285180",
    version: "v268.1",
    date: "2026-05-19T10:41:25.180Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繧ｳ繝・Ξ繝ｴ繧ｧ繝・く繧ｪ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蛹玲搗 螳丞昇",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝｢繝ｼ繝ｪ繧ｹ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779187358644",
    version: "v234.1",
    date: "2026-05-19T10:42:38.644Z",
    description: "逶帛ｲ｡ - 螂ｽ襍ｰ鬥ｬ(繝九Η繝ｼ繧､繝､繝ｼ繧ｺ繝・う遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "逶帛ｲ｡",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779187481829",
    version: "v269.1",
    date: "2026-05-19T10:44:41.829Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繧ｷ繝｣繝ｳ繧ｽ繝ｳ繝峨・繝ｫ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "D.繝ｬ繝ｼ繝ｳ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｬ繧､繝・が繝ｭ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譚ｾ蟯｡ 豁｣豬ｷ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｪ繧｢繝ｫ繧､繝ｳ繝代け繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779187682303",
    version: "v271.1",
    date: "2026-05-19T10:48:02.303Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繧ｷ繝｣繝ｳ繧ｽ繝ｳ繝峨・繝ｫ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "D.繝ｬ繝ｼ繝ｳ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｬ繧､繝・が繝ｭ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譚ｾ蟯｡ 豁｣豬ｷ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｪ繧｢繝ｫ繧､繝ｳ繝代け繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779191977890",
    version: "v272.1",
    date: "2026-05-19T11:59:37.890Z",
    description: "螟ｧ莠・- 螂ｽ襍ｰ鬥ｬ(繧ｵ繝ｨ繝弱げ繝・ラ繝・う遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "螟ｧ莠・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "遏｢驥手ｲｴ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｨ繧ｹ繝昴Ρ繝ｼ繝ｫ繧ｷ繝√・",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779192008424",
    version: "v273.1",
    date: "2026-05-19T12:00:08.424Z",
    description: "螟ｧ莠・- 螂ｽ襍ｰ鬥ｬ(繧ｦ繧｣繝ｫ繧､繝ｫ繝溽ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "螟ｧ莠・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蜷我ｺ慕ｫ�",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｷ繝九せ繧ｿ繝ｼ繝溘ル繧ｹ繧ｿ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "闖・次豸ｼ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｵ繝ｳ繝繝ｼ繧ｹ繝弱・",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779192064353",
    version: "v274.1",
    date: "2026-05-19T12:01:04.353Z",
    description: "螟ｧ莠・- 螂ｽ襍ｰ鬥ｬ(繧ｰ繝ｬ繝ｼ繝後ラ繧ｹ繧ｿ繝ｼ繝ｫ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "螟ｧ莠・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "隘ｿ蝠灘､ｪ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｹ繝・Ν繝ｴ繧｣繧ｪ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779192951431",
    version: "v275.1",
    date: "2026-05-19T12:15:51.431Z",
    description: "莠ｬ驛ｽ - 螂ｽ襍ｰ鬥ｬ(繝ｫ繝ｼ繧ｸ繝･繝舌Ο繝ｳ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "莠ｬ驛ｽ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weightChange",
        ""operator": "<=",
        ""value": -10,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蝮ゆｺ・迹�譏・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｳ繝ｳ繝医Ξ繧､繝ｫ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "魄ｫ蟲ｶ 濶ｯ螟ｪ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝峨Ξ繝輔か繝ｳ",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "遘句ｱｱ 遞疲ｨｹ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝繝弱Φ繝ｬ繧ｸ繧ｧ繝ｳ繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779192989314",
    version: "v276.1",
    date: "2026-05-19T12:16:29.314Z",
    description: "莠ｬ驛ｽ - 螂ｽ襍ｰ鬥ｬ(繝ｬ繝・ラ繝輔Ο繧､繝・ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "莠ｬ驛ｽ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "鬮俶揄 蜷城ｺ・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝｢繝ｼ繝ｪ繧ｹ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "螟ｪ螳ｰ 蝠謎ｻ・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝帙ャ繧ｳ繝ｼ繧ｿ繝ｫ繝槭お",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779193135806",
    version: "v277.1",
    date: "2026-05-19T12:18:55.806Z",
    description: "莠ｬ驛ｽ - 螂ｽ襍ｰ鬥ｬ(繧ｭ繧ｷ繝｣繝ｼ繝ｫ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "莠ｬ驛ｽ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weightChange",
        ""operator": ">=",
        ""value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "鬮俶揄 蜷城ｺ・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝繝弱Φ繝励Ξ繝溘い繝�",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蜷画搗 隱�荵句勧",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｭ繧ｿ繧ｵ繝ｳ繝悶Λ繝・け",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779193173437",
    version: "v278.1",
    date: "2026-05-19T12:19:33.437Z",
    description: "莠ｬ驛ｽ - 螂ｽ襍ｰ鬥ｬ(繧ｵ繝医ヮ繝薙ム繝ｼ繝､遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "莠ｬ驛ｽ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "驟剃ｺ・蟄ｦ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｵ繝医ヮ繧ｸ繧ｧ繝阪す繧ｹ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779193388846",
    version: "v279.1",
    date: "2026-05-19T12:23:08.846Z",
    description: "莠ｬ驛ｽ - 螂ｽ襍ｰ鬥ｬ(繝ｭ繧ｵ繝ｫ繧ｴ繧ｵ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "莠ｬ驛ｽ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "weightChange",
        ""operator": "<=",
        ""value": -10,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蝗｣驥・螟ｧ謌・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝輔ぅ繧ｨ繝ｼ繝ｫ繝槭Φ",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譽ｮ逕ｰ 隱�荵・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｪ繧ｪ繝ｳ繝・ぅ繝ｼ繧ｺ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779193454610",
    version: "v280.1",
    date: "2026-05-19T12:24:14.610Z",
    description: "莠ｬ驛ｽ - 螂ｽ襍ｰ鬥ｬ(繝九・繝ｳ繝斐Ο繧ｫ繝ｩ繝・ヨ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "莠ｬ驛ｽ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "逕ｰ蜿｣ 雋ｫ螟ｪ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｵ繝医ヮ繝繧､繝､繝｢繝ｳ繝・,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蟯ｩ逕ｰ 譛帶擂",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝峨ぇ繝ｩ繝｡繝ｳ繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779193596835",
    version: "v281.1",
    date: "2026-05-19T12:26:36.835Z",
    description: "蜷榊商螻・- 螂ｽ襍ｰ鬥ｬ(繝�繧ｮ繧ｬ繧ｯ繝繝ｳ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蜷榊商螻・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "荳ｸ驥主享",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝輔ぅ繧ｨ繝ｼ繝ｫ繝槭Φ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779193627664",
    version: "v282.1",
    date: "2026-05-19T12:27:07.664Z",
    description: "蜷榊商螻・- 螂ｽ襍ｰ鬥ｬ(繧ｳ繧ｳ繧､繝ｳ繧ｷ繝・Φ繧ｹ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蜷榊商螻・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譛ｨ荵玖揃",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｷ繝･繝ｴ繧｡繝ｫ繧ｰ繝ｩ繝ｳ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "螻ｱ逕ｰ逾･",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝薙・繝√ヱ繝医Ο繝ｼ繝ｫ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779222498213",
    version: "v282.1",
    date: "2026-05-19T20:28:18.213Z",
    description: "蜷榊商螻・- 螂ｽ襍ｰ鬥ｬ(繝�繧ｮ繧ｬ繧ｯ繝繝ｳ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蜷榊商螻・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "荳ｸ驥主享",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝輔ぅ繧ｨ繝ｼ繝ｫ繝槭Φ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779222525832",
    version: "v283.1",
    date: "2026-05-19T20:28:45.832Z",
    description: "蜷榊商螻・- 螂ｽ襍ｰ鬥ｬ(繧ｳ繧ｳ繧､繝ｳ繧ｷ繝・Φ繧ｹ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蜷榊商螻・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譛ｨ荵玖揃",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｷ繝･繝ｴ繧｡繝ｫ繧ｰ繝ｩ繝ｳ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "螻ｱ逕ｰ逾･",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝薙・繝√ヱ繝医Ο繝ｼ繝ｫ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779222576812",
    version: "v284.1",
    date: "2026-05-19T20:29:36.812Z",
    description: "蜷榊商螻・- 螂ｽ襍ｰ鬥ｬ(繝励Λ繧ｦ繝峨ヶ繝ｫ繝ｼ繝吶Ν遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蜷榊商螻・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "霑題陸鬚ｯ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｯ繝ｼ繝ｫ繝峨・繝ｬ繝溘い",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譚台ｸ雁ｼ・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝繝弱Φ繧ｹ繝槭ャ繧ｷ繝･",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779222613422",
    version: "v285.1",
    date: "2026-05-19T20:30:13.422Z",
    description: "蜷榊商螻・- 螂ｽ襍ｰ鬥ｬ(繝弱・繝悶Ν繝医Ξ繧ｸ繝｣繝ｼ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蜷榊商螻・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蝪壽悽蠕・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝繝弱Φ繧ｹ繝槭ャ繧ｷ繝･",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "weightChange",
        ""operator": ">=",
        ""value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "荳ｹ鄒ｽ蜈・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝吶Φ繝舌ヨ繝ｫ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779222640094",
    version: "v286.1",
    date: "2026-05-19T20:30:40.094Z",
    description: "蜷榊商螻・- 螂ｽ襍ｰ鬥ｬ(繝ｫ繝溘ヮ繝ｼ繧ｾ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蜷榊商螻・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "邏ｰ蟾晄匱",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｨ繧､繧ｷ繝ｳ繝偵き繝ｪ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "霑題陸鬚ｯ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｦ繧､繝ｳ繝悶Λ繧､繝・,
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "荳ｹ鄒ｽ蜈・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｴ繝ｼ繝ｫ繝峨い繧ｯ繧ｿ繝ｼ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779222680945",
    version: "v287.1",
    date: "2026-05-19T20:31:20.945Z",
    description: "蜷榊商螻・- 螂ｽ襍ｰ鬥ｬ(繝溘せ繝・Φ繧ｶ繝ｳ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蜷榊商螻・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "weightChange",
        ""operator": ">=",
        ""value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "霑題陸鬚ｯ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｪ繝ｫ繝輔ぉ繝ｼ繝ｴ繝ｫ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "荳ｸ驥主享",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｹ繝医Ο繝ｳ繧ｰ繝ｪ繧ｿ繝ｼ繝ｳ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779222712995",
    version: "v288.1",
    date: "2026-05-19T20:31:52.995Z",
    description: "蜷榊商螻・- 螂ｽ襍ｰ鬥ｬ(繧｢繝ｳ繧ｸ繧ｧ繝ｩ繝ｩ繝ｴ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蜷榊商螻・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譚ｾ譛ｬ荳",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝繝ｳ繧ｫ繝ｼ繧ｯ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779222842850",
    version: "v289.1",
    date: "2026-05-19T20:34:02.850Z",
    description: "蜷榊商螻・- 螂ｽ襍ｰ鬥ｬ(繧｢繧ｪ繝ｬ繝ｬ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蜷榊商螻・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譟ｿ蜴溽ｿ・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｩ繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779222878030",
    version: "v290.1",
    date: "2026-05-19T20:34:38.030Z",
    description: "蜷榊商螻・- 螂ｽ襍ｰ鬥ｬ(繧ｨ繝ｼ繧ｪ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蜷榊商螻・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蜉�阯､閨｡",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝・け繝ｩ繝ｬ繝ｼ繧ｷ繝ｧ繝ｳ繧ｪ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779222911845",
    version: "v291.1",
    date: "2026-05-19T20:35:11.845Z",
    description: "蜷榊商螻・- 螂ｽ襍ｰ鬥ｬ(繧｢繧ｹ繧ｭ繧ｹ繝・た繝ｼ繝ｭ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蜷榊商螻・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "莉贋ｺ戊ｲｴ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝峨ぇ繝ｩ繝｡繝ｳ繝・,
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "螟ｧ逡第・",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝帙ャ繧ｳ繝ｼ繧ｿ繝ｫ繝槭お",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779222941789",
    version: "v292.1",
    date: "2026-05-19T20:35:41.789Z",
    description: "蜷榊商螻・- 螂ｽ襍ｰ鬥ｬ(繝ｯ繧､繝ｫ繝峨ワ繝ｳ繧ｿ繝ｼ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蜷榊商螻・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "莉贋ｺ戊ｲｴ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝槭け繝輔ぅ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779223308466",
    version: "v293.1",
    date: "2026-05-19T20:41:48.466Z",
    description: "螟ｧ莠・- 螂ｽ襍ｰ鬥ｬ(繝輔ぃ繧､繧ｹ繝医せ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "螟ｧ莠・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weightChange",
        ""operator": "<=",
        ""value": -10,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "隘ｿ蜆ｪ蜩・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝舌ざ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "荳ｭ螻ｱ驕･",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｹ繝斐Ν繝舌・繧ｰ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779223339510",
    version: "v294.1",
    date: "2026-05-19T20:42:19.510Z",
    description: "螟ｧ莠・- 螂ｽ襍ｰ鬥ｬ(繝輔ぉ繧｢繝ｪ繝ｼ繝槭う繧｢遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "螟ｧ莠・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "鬮俶ｩ句━",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｬ繧､繝ｳ繝懊・繝ｩ繧､繝ｳ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779223370871",
    version: "v295.1",
    date: "2026-05-19T20:42:50.871Z",
    description: "螟ｧ莠・- 螂ｽ襍ｰ鬥ｬ(繧ｳ繝医ヶ繧ｭ繧ｨ繝ｼ繧ｹ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "螟ｧ莠・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "隘ｿ蜆ｪ蜩・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝｡繧､繧ｷ繝ｧ繧ｦ繝懊・繝ｩ繝ｼ",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": ">=",
        ""value": 8,
        "scoreAdjust": 20
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "鬮俶ｩ句━",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｴ繧｡繝ｳ繧ｻ繝ｳ繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779223399396",
    version: "v296.1",
    date: "2026-05-19T20:43:19.396Z",
    description: "螟ｧ莠・- 螂ｽ襍ｰ鬥ｬ(繝ｨ繝ｪ繝翫せ繧ｦ繧｣繝ｼ繝育ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "螟ｧ莠・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "weightChange",
        ""operator": "<=",
        ""value": -10,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "阯､逕ｰ蜃・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｷ繝九せ繧ｿ繝ｼ繝溘ル繧ｹ繧ｿ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譚ｱ蜴滓あ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝・け繝ｩ繝ｬ繝ｼ繧ｷ繝ｧ繝ｳ繧ｪ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779223550370",
    version: "v297.1",
    date: "2026-05-19T20:45:50.370Z",
    description: "螟ｧ莠・- 螂ｽ襍ｰ鬥ｬ(繧｢繝舌Φ繧ｮ繝｣繝ｫ繝臥ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "螟ｧ莠・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "遏｢驥手ｲｴ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝｢繝ｼ繝九Φ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779223579730",
    version: "v298.1",
    date: "2026-05-19T20:46:19.730Z",
    description: "螟ｧ莠・- 螂ｽ襍ｰ鬥ｬ(繝上け繧｢繧､繧ｽ繝ｬ繧､繝ｦ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "螟ｧ莠・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "驥守舞蜃・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｪ繝ｫ繝輔ぉ繝ｼ繝ｴ繝ｫ",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "鮃ｹ隕矩匣",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｫ繝ｬ繝ｳ繝悶Λ繝・け繝偵Ν",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779223614581",
    version: "v299.1",
    date: "2026-05-19T20:46:54.581Z",
    description: "螟ｧ莠・- 螂ｽ襍ｰ鬥ｬ(繝・ぅ繝ｼ繧ｺ繝ｪ繝ｳ繧ｯ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "螟ｧ莠・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "菴宣㍽驕･",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝上ち繝弱Χ繧｡繝ｳ繧ｯ繝ｼ繝ｫ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "荳ｭ螻ｱ驕･",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｯ繝ｳ繝繝ｼ繧｢繧ｭ繝･繝ｼ繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779223644873",
    version: "v300.1",
    date: "2026-05-19T20:47:24.873Z",
    description: "螟ｧ莠・- 螂ｽ襍ｰ鬥ｬ(繧｢繧ｷ繝｣繝九Φ繧ｫ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "螟ｧ莠・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "隨ｹ蟾晉ｿｼ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝繝弱Φ繝ｬ繧ｸ繧ｧ繝ｳ繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779223672737",
    version: "v301.1",
    date: "2026-05-19T20:47:52.737Z",
    description: "螟ｧ莠・- 螂ｽ襍ｰ鬥ｬ(繝斐・繧ｹ繝輔ぅ繝ｼ繝ｫ繝臥ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "螟ｧ莠・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "驕泌沁鮴・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧､繝ｳ繧ｫ繝ｳ繝・・繧ｷ繝ｧ繝ｳ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譛ｬ逕ｰ驥・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｰ繝ｬ繝ｼ繧ｿ繝ｼ繝ｭ繝ｳ繝峨Φ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蜊・伐豢・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｱ繝ｼ繝励ヶ繝ｩ繝ｳ繧ｳ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779223707969",
    version: "v302.1",
    date: "2026-05-19T20:48:27.969Z",
    description: "螟ｧ莠・- 螂ｽ襍ｰ鬥ｬ(繝峨く繝峨く遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "螟ｧ莠・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蜥檎伐隴ｲ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝｢繝ｼ繝九Φ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779231443777",
    version: "v304.1",
    date: "2026-05-19T22:57:23.777Z",
    description: "逶帛ｲ｡ - 螂ｽ襍ｰ鬥ｬ(繝槭リ繝帙け繝ｬ繧｢遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "逶帛ｲ｡",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "闖・次霎ｰ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧｢繝｡繝ｪ繧ｫ繝ｳ繝壹う繝医Μ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "菴舌・ｿ・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝九Η繝ｼ繧､繝､繝ｼ繧ｺ繝・う",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779231475689",
    version: "v305.1",
    date: "2026-05-19T22:57:55.689Z",
    description: "逶帛ｲ｡ - 螂ｽ襍ｰ鬥ｬ(繧ｫ繝ｼ繝ｫ繝ｫ繧､繧ｳ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "逶帛ｲ｡",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "鬮俶ｩ区あ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｭ繧ｸ繝｣繝ｼ繝舌Ο繝ｼ繧ｺ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蟯ｩ譛ｬ諤・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｷ繝･繝ｴ繧｡繝ｫ繧ｰ繝ｩ繝ｳ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779231518049",
    version: "v306.1",
    date: "2026-05-19T22:58:38.049Z",
    description: "逶帛ｲ｡ - 螂ｽ襍ｰ鬥ｬ(繧ｵ繧ｯ繝ｩ繧ｫ繧ｼ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "逶帛ｲ｡",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "螻ｱ譛ｬ閨｡",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｷ繝ｫ繝舌・繧ｹ繝・・繝・,
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": ">=",
        ""value": 8,
        "scoreAdjust": 20
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "鬮俶ｩ区あ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｨ繝斐ヵ繧｡繝阪う繧｢",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779239353861",
    version: "v307.1",
    date: "2026-05-20T01:09:13.861Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繧ｨ繝ｳ繝悶Ο繧､繝繝ｪ繝ｼ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "C.繝ｫ繝｡繝ｼ繝ｫ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧｢繝峨・繧､繝､繝槭・繧ｺ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蟾晉伐 蟆・寉",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝悶Λ繝・け繧ｿ繧､繝・,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "隘ｿ譚・豺ｳ荵・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｭ繧ｺ繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779247589800",
    version: "v308.1",
    date: "2026-05-20T03:26:29.800Z",
    description: "譁ｰ貎・- 螂ｽ襍ｰ鬥ｬ(繝上う繝ｭ繝ｼ繝臥ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譁ｰ貎・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weightChange",
        ""operator": "<=",
        ""value": -10,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譁手陸 譁ｰ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｷ繝九せ繧ｿ繝ｼ繝溘ル繧ｹ繧ｿ繝ｼ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "F.繧ｴ繝ｳ繧ｵ繝ｫ繝吶せ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｯ繝ｪ繧ｽ繝吶Μ繝ｫ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "隘ｿ蝪・豢ｸ莠・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧｢繧ｹ繧ｯ繝斐・繧ｿ繝ｼ繝代Φ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779247631214",
    version: "v309.1",
    date: "2026-05-20T03:27:11.214Z",
    description: "譁ｰ貎・- 螂ｽ襍ｰ鬥ｬ(繧ｷ繝･繝ｴ繧｡繝ｫ繝・す繝ｫ繝育ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譁ｰ貎・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蟆乗棊 鄒朱ｧ・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝溘せ繝√Χ繧｣繧｢繧ｹ繧｢繝ｬ繝・け繧ｹ",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "闕ｻ驥・讌ｵ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｵ繝医ヮ繧ｯ繝ｩ繧ｦ繝ｳ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779247671887",
    version: "v310.1",
    date: "2026-05-20T03:27:51.887Z",
    description: "譁ｰ貎・- 螂ｽ襍ｰ鬥ｬ(繝舌Φ繧ｪ繝ｳ繧ｿ繧､繝�遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譁ｰ貎・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "闊溷ｱｱ 迹�豕・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｭ繝ｼ繝峨き繝翫Ο繧｢",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "豁ｦ阯､ 髮・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｳ繝代ヮ繝ｪ繝・く繝ｼ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779247705127",
    version: "v311.1",
    date: "2026-05-20T03:28:25.127Z",
    description: "譁ｰ貎・- 螂ｽ襍ｰ鬥ｬ(繝ｯ繝ｳ繝繝ｼ繝悶Μ繝・ヤ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譁ｰ貎・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "隘ｿ譚・豺ｳ荵・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｯ繝ｪ繧ｽ繝吶Μ繝ｫ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779247764183",
    version: "v312.1",
    date: "2026-05-20T03:29:24.183Z",
    description: "譁ｰ貎・- 螂ｽ襍ｰ鬥ｬ(繝医Μ繝九ち繝ｪ繧ｪ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譁ｰ貎・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譁手陸 譁ｰ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｦ繧､繝ｳ繝悶Λ繧､繝・,
        "scoreAdjust": 15
      },
      {
        "field": "weightChange",
        ""operator": "<=",
        ""value": -10,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "遏ｳ逾・豺ｱ驕・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝繝弱Φ繝舌Λ繝ｼ繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779247807506",
    version: "v313.1",
    date: "2026-05-20T03:30:07.506Z",
    description: "譁ｰ貎・- 螂ｽ襍ｰ鬥ｬ(繝溘Ν繝医Γ繝ｭ繝・ぅ繝ｼ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譁ｰ貎・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "笘・ｲｳ蜴溽伐 闖懊・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧､繝ｳ繝・ぅ繝√Ε繝ｳ繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779247843375",
    version: "v314.1",
    date: "2026-05-20T03:30:43.375Z",
    description: "譁ｰ貎・- 螂ｽ襍ｰ鬥ｬ(繧ｷ繝｣繝ｳ繝上う繝翫う繝育ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譁ｰ貎・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "笘・ｲｳ蜴溽伐 闖懊・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｷ繝｣繝ｳ繝上う繝懊ン繝ｼ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779247878464",
    version: "v315.1",
    date: "2026-05-20T03:31:18.464Z",
    description: "譁ｰ貎・- 螂ｽ襍ｰ鬥ｬ(繝輔ぃ繝ｫ繧ｳ繝ｳ繝溘ヮ繝ｫ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譁ｰ貎・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "C.繝ｫ繝｡繝ｼ繝ｫ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｴ繝ｼ繝ｫ繝峨す繝・・",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "隘ｿ譚・豺ｳ荵・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "American Pharoah",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779247917558",
    version: "v316.1",
    date: "2026-05-20T03:31:57.558Z",
    description: "譁ｰ貎・- 螂ｽ襍ｰ鬥ｬ(繝ｫ繝ｼ繝ｫ繝ｼ繝ｪ繝樒ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譁ｰ貎・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "C.繝ｫ繝｡繝ｼ繝ｫ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｭ繧ｺ繝・,
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譚牙次 隱�莠ｺ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝悶Μ繝・け繧ｹ繧｢繝ｳ繝峨Δ繝ｫ繧ｿ繝ｫ",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "闕ｻ驥・讌ｵ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝峨ぇ繝ｩ繝｡繝ｳ繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779247959365",
    version: "v317.1",
    date: "2026-05-20T03:32:39.365Z",
    description: "譁ｰ貎・- 螂ｽ襍ｰ鬥ｬ(繝槭Ν繧ｬ繧､繧｢繝ｼ繧ｯ繝峨・繝ｫ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譁ｰ貎・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "豁ｦ 雎・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "Golden Horn",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "荳ｹ蜀・逾先ｬ｡",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝槭ず繧ｧ繧ｹ繝・ぅ繝・け繧ｦ繧ｩ繝ｪ繧｢繝ｼ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779248025202",
    version: "v318.1",
    date: "2026-05-20T03:33:45.202Z",
    description: "譁ｰ貎・- 螂ｽ襍ｰ鬥ｬ(繝舌Ξ繧ｨ繝槭せ繧ｿ繝ｼ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譁ｰ貎・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "闖頑ｲ｢ 荳讓ｹ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｹ繝斐Ν繝舌・繧ｰ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "F.繧ｴ繝ｳ繧ｵ繝ｫ繝吶せ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｦ繧､繝ｳ繝悶Λ繧､繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779248071285",
    version: "v319.1",
    date: "2026-05-20T03:34:31.285Z",
    description: "譁ｰ貎・- 螂ｽ襍ｰ鬥ｬ(繧ｵ繝ｳ繧ｿ繧｢繝九ち遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譁ｰ貎・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譁手陸 譁ｰ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝翫ム繝ｫ",
        "scoreAdjust": 15
      },
      {
        "field": "weightChange",
        ""operator": ">=",
        ""value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "C.繝ｫ繝｡繝ｼ繝ｫ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｵ繝ｼ繝医ぇ繝ｫ繝翫・繝ｪ繧｢",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779360784167",
    version: "v320.1",
    date: "2026-05-21T10:53:04.167Z",
    description: "蜷榊商螻・- 螂ｽ襍ｰ鬥ｬ(繧ｫ繝溘・繝√ぉ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蜷榊商螻・,
    condition: "驥・,
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "笘・ｰ冗ｬ�鄒・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝槭け繝輔ぅ",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "貂｡驍顔ｫ・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝・ぅ繧ｹ繧ｯ繝ｪ繝ｼ繝医く繝｣",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779360810171",
    version: "v321.1",
    date: "2026-05-21T10:53:30.171Z",
    description: "蜷榊商螻・- 螂ｽ襍ｰ鬥ｬ(繧ｵ繧ｯ繝ｪ繝輔ぃ繧､繧ｹ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蜷榊商螻・,
    condition: "驥・,
    adjustments: [
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "螟ｧ逡第・",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧｢繝｡繝ｪ繧ｫ繝ｳ繝壹う繝医Μ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "笘・ｰ冗ｬ�鄒・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｪ繧ｪ繝ｳ繝・ぅ繝ｼ繧ｺ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779360853917",
    version: "v322.1",
    date: "2026-05-21T10:54:13.917Z",
    description: "蜷榊商螻・- 螂ｽ襍ｰ鬥ｬ(繧ｪ繧､繝√ヮ繧ｫ繧ｿ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蜷榊商螻・,
    condition: "驥・,
    adjustments: [
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "笘・ｰ冗ｬ�鄒・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧､繝ｳ繧ｫ繝ｳ繝・・繧ｷ繝ｧ繝ｳ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蜉�阯､閨｡",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝｢繝ｼ繝ｪ繧ｹ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779360877375",
    version: "v323.1",
    date: "2026-05-21T10:54:37.375Z",
    description: "蜷榊商螻・- 螂ｽ襍ｰ鬥ｬ(繧ｹ繧ｿ繝ｼ繧､繝ｳ繝代け繝育ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蜷榊商螻・,
    condition: "驥・,
    adjustments: [
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": ">=",
        ""value": 8,
        "scoreAdjust": 20
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蜉�阯､閨｡",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｪ繧｢繝ｫ繧､繝ｳ繝代け繝・,
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蝪壽悽蠕・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝吶せ繝医え繧ｩ繝ｼ繝ｪ繧｢",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779360937207",
    version: "v324.1",
    date: "2026-05-21T10:55:37.207Z",
    description: "蜷榊商螻・- 螂ｽ襍ｰ鬥ｬ(繝溘ル繝槭Ν繝・じ繧､繝ｳ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蜷榊商螻・,
    condition: "荳崎憶",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "weightChange",
        ""operator": ">=",
        ""value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蜉�阯､閨｡",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｹ繝医Ο繝ｳ繧ｰ繝ｪ繧ｿ繝ｼ繝ｳ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "莉贋ｺ戊ｲｴ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝倥ル繝ｼ繝偵Η繝ｼ繧ｺ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779360967609",
    version: "v325.1",
    date: "2026-05-21T10:56:07.609Z",
    description: "蜷榊商螻・- 螂ｽ襍ｰ鬥ｬ(繝・・繧ｪ繝ｼ繧ｨ繝｡繝ｩ繝ｫ繝臥ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蜷榊商螻・,
    condition: "荳崎憶",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "笘・ｰ冗ｬ�鄒・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｳ繝代ヮ繝ｪ繝・く繝ｼ",
        "scoreAdjust": 15
      },
      {
        "field": "weightChange",
        ""operator": ">=",
        ""value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "荳ｹ鄒ｽ蜈・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｬ繧､繝・が繝ｭ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779360993009",
    version: "v326.1",
    date: "2026-05-21T10:56:33.009Z",
    description: "蜷榊商螻・- 螂ｽ襍ｰ鬥ｬ(繧ｴ繝ｼ繝ｫ繝峨Ξ繝ｼ繝ｳ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "蜷榊商螻・,
    condition: "荳崎憶",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蜿区｣ｮ鄙・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝溘せ繝√Χ繧｣繧｢繧ｹ繧｢繝ｬ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蜉�阯､閨｡",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝繝弱Φ繧ｹ繝槭ャ繧ｷ繝･",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "荳ｸ驥主享",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝・け繝ｩ繝ｬ繝ｼ繧ｷ繝ｧ繝ｳ繧ｪ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779411183344",
    version: "v296.1",
    date: "2026-05-22T00:53:03.344Z",
    description: "莠ｬ驛ｽ - 螂ｽ襍ｰ鬥ｬ(繝・せ繝・ぅ繝｢繝ｼ繝咲ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "莠ｬ驛ｽ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蟷ｸ 闍ｱ譏・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝峨Ξ繝輔か繝ｳ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "貂｡霎ｺ 遶應ｹ・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝帙ャ繧ｳ繝ｼ繧ｿ繝ｫ繝槭お",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779609020992",
    version: "v328.1",
    date: "2026-05-24T07:50:20.992Z",
    description: "鬮倡衍 - 螂ｽ襍ｰ鬥ｬ(繧ｷ繝・Φ繧､繝・そ繝ｳ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "鬮倡衍",
    condition: "荳崎憶",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "菴仙次遘",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｨ繧､繧ｷ繝ｳ繝輔Λ繝・す繝･",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779609061568",
    version: "v329.1",
    date: "2026-05-24T07:51:01.568Z",
    description: "鬮倡衍 - 螂ｽ襍ｰ鬥ｬ(繧ｨ繝ｼ繝医ぇ繝ｼ繧ｸ繝ｼ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "鬮倡衍",
    condition: "荳崎憶",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "荳顔伐蟆・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧､繝ｳ繝・ぅ繝√Ε繝ｳ繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779609086274",
    version: "v330.1",
    date: "2026-05-24T07:51:26.275Z",
    description: "鬮倡衍 - 螂ｽ襍ｰ鬥ｬ(繝ｪ繝･繧ｦ繝弱Λ繝悶ご繝ｼ繝�遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "鬮倡衍",
    condition: "荳崎憶",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "荳顔伐蟆・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝繝弱Φ繝ｬ繧ｸ繧ｧ繝ｳ繝・,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "髦ｿ驛ｨ蝓ｺ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝槭け繝輔ぅ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": ">=",
        ""value": 8,
        "scoreAdjust": 20
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "菴仙次遘",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝悶Λ繝・け繧ｿ繧､繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779609141251",
    version: "v331.1",
    date: "2026-05-24T07:52:21.251Z",
    description: "鬮倡衍 - 螂ｽ襍ｰ鬥ｬ(繧ｹ繝槭う繝ｫ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "鬮倡衍",
    condition: "荳崎憶",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": ">=",
        ""value": 8,
        "scoreAdjust": 20
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "螟ｧ貔､隱�",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝繧､繝ｯ繝｡繧ｸ繝｣繝ｼ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "髦ｿ驛ｨ蝓ｺ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝槭け繝輔ぅ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779615489938",
    version: "v332.1",
    date: "2026-05-24T09:38:09.938Z",
    description: "莠ｬ驛ｽ - 螂ｽ襍ｰ鬥ｬ(繧ｬ繧､繧｢繝｡繝ｳ繝・ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "莠ｬ驛ｽ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蝗｣驥・螟ｧ謌・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝峨ぇ繝ｩ繝｡繝ｳ繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779615617045",
    version: "v333.1",
    date: "2026-05-24T09:40:17.045Z",
    description: "莠ｬ驛ｽ - 螂ｽ襍ｰ鬥ｬ(繝ｫ繧ｯ繧ｹ繝・う繧ｸ繝ｼ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "莠ｬ驛ｽ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蝗｣驥・螟ｧ謌・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｫ繝ｪ繝輔か繝ｫ繝九い繧ｯ繝ｭ繝ｼ繝�",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779615676734",
    version: "v334.1",
    date: "2026-05-24T09:41:16.734Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繝√Β繧ｰ繧ｯ繝ｫ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "C.繝ｫ繝｡繝ｼ繝ｫ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｩ繝悶Μ繝ｼ繝・う",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "讓ｪ螻ｱ 豁ｦ蜿ｲ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "Frankel",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779615724737",
    version: "v335.1",
    date: "2026-05-24T09:42:04.737Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繧ｵ繝ｼ繝ｭ繝ｼ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "菴舌・惠 螟ｧ霈・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝倥Φ繝ｪ繝ｼ繝舌Ο繝ｼ繧ｺ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "讓ｪ螻ｱ 蜈ｸ蠑・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779615768691",
    version: "v336.1",
    date: "2026-05-24T09:42:48.691Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繝後け繝ｬ繧ｪ繝√ラ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "讓ｪ螻ｱ 蜈ｸ蠑・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝｢繧ｺ繧｢繧ｹ繧ｳ繝・ヨ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779615806508",
    version: "v337.1",
    date: "2026-05-24T09:43:26.508Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繧ｯ繧｢繝・ラ繝輔か繝ｫ繝・ぃ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "M.繝・ぅ繝ｼ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｴ繝ｼ繝ｫ繝峨ラ繝ｪ繝ｼ繝�",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蜷臥伐 雎・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝峨Ξ繝輔か繝ｳ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "菴舌・惠 螟ｧ霈・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧｢繝峨・繧､繝､繝槭・繧ｺ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779615849223",
    version: "v338.1",
    date: "2026-05-24T09:44:09.223Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繝輔Μ繝ｼ繝､遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "讓ｪ螻ｱ 豁ｦ蜿ｲ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝吶Φ繝舌ヨ繝ｫ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "M.繝・ぅ繝ｼ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｭ繝ｼ繝峨き繝翫Ο繧｢",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譚ｾ蟯｡ 豁｣豬ｷ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝溘ャ繧ｭ繝ｼ繧｢繧､繝ｫ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779615924163",
    version: "v339.1",
    date: "2026-05-24T09:45:24.163Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繝懊ル繝ｼ繝励Μ繝ｳ繧ｹ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "D.繝ｬ繝ｼ繝ｳ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｬ繧､繝・が繝ｭ",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "逕ｰ霎ｺ 陬穂ｿ｡",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｳ繝ｳ繝医Ξ繧､繝ｫ",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譟ｴ逕ｰ 螟ｧ遏･",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｴ繝ｼ繝ｫ繝峨す繝・・",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779615965579",
    version: "v340.1",
    date: "2026-05-24T09:46:05.579Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繧ｴ繝ｼ繝ｫ繝峨ヰ繝ｭ繝ｼ繧ｺ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "闕ｻ驥・讌ｵ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｴ繝ｼ繝ｫ繝峨ラ繝ｪ繝ｼ繝�",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1779616015119",
    version: "v341.1",
    date: "2026-05-24T09:46:55.119Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繝ｫ繝翫Ν繝ｼ繝√ぉ繝・ヨ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "逕ｰ霎ｺ 陬穂ｿ｡",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝悶Μ繝・け繧ｹ繧｢繝ｳ繝峨Δ繝ｫ繧ｿ繝ｫ",
        "scoreAdjust": 15
      },
      {
        "field": "weightChange",
        ""operator": ">=",
        ""value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "遏ｳ蟾・陬慕ｴ莠ｺ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝峨ぇ繝ｩ繝｡繝ｳ繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1780104630767",
    version: "v342.1",
    date: "2026-05-30T01:30:30.767Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繧ｳ繧ｦ繝ｦ繝ｼ繝九・繝昴ル繧ｳ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "遏ｳ逕ｰ 諡馴ヮ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｿ繝ｪ繧ｹ繝槭ル繝・け",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1780104693607",
    version: "v343.1",
    date: "2026-05-30T01:31:33.607Z",
    description: "豬ｦ蜥・- 螂ｽ襍ｰ鬥ｬ(繝ｩ繝悶す繝ｪ繧ｫ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "豬ｦ蜥・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "weightChange",
        ""operator": "<=",
        ""value": -10,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "驥守舞蜃・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝繝弱Φ繧ｹ繝槭ャ繧ｷ繝･",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "遖丞次譚・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｫ繝ｴ繧｡繝ｳ繧ｹ繝ｬ繝ｼ繝ｴ",
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "荳ｭ螻ｱ驕･",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｵ繝医ヮ繧｢繝ｬ繧ｹ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1780104721315",
    version: "v344.1",
    date: "2026-05-30T01:32:01.315Z",
    description: "豬ｦ蜥・- 螂ｽ襍ｰ鬥ｬ(繧ｪ繝ｼ繝・Φ繝ｪ繝・く繝ｼ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "豬ｦ蜥・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "遘句・閠・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｳ繝代ヮ繝ｪ繝・く繝ｼ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蜉�阯､髮・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝弱・繧ｸ繝｣繝・け",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1780104753894",
    version: "v345.1",
    date: "2026-05-30T01:32:33.894Z",
    description: "豬ｦ蜥・- 螂ｽ襍ｰ鬥ｬ(繧ｻ繝ｳ繝√Η繝ｪ繝ｼ繝ｩ繝ｴ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "豬ｦ蜥・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "weightChange",
        ""operator": ">=",
        ""value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "荳ｭ蟲ｶ濶ｯ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝倥Φ繝ｪ繝ｼ繝舌Ο繝ｼ繧ｺ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蟯｡譚題｣・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｪ繧ｪ繝ｳ繝・ぅ繝ｼ繧ｺ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1780104784883",
    version: "v346.1",
    date: "2026-05-30T01:33:04.883Z",
    description: "豬ｦ蜥・- 螂ｽ襍ｰ鬥ｬ(繝｢繝ｼ繝九Φ繧ｸ繧ｧ繝ｼ繝斐・遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "豬ｦ蜥・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "(螟画峩)",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝｢繝ｼ繝九Φ",
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "荳ｭ雜顔翠",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｫ繝ｬ繝ｳ繝悶Λ繝・け繝偵Ν",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1780104815136",
    version: "v347.1",
    date: "2026-05-30T01:33:35.136Z",
    description: "豬ｦ蜥・- 螂ｽ襍ｰ鬥ｬ(繝ｴ繧｡繝ｫ繝ｴ繧｡繝ｩ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "豬ｦ蜥・,
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "蟯｡譚大▼",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｫ繝ｪ繝輔か繝ｫ繝九い繧ｯ繝ｭ",
        "scoreAdjust": 15
      },
      {
        "field": "weightChange",
        ""operator": ">=",
        ""value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "逕ｺ逕ｰ逶ｴ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝医ぇ繧ｶ繝ｯ繝ｼ繝ｫ繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1780137256515",
    version: "v315.1",
    date: "2026-05-30T10:34:16.515Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繧ｳ繧ｦ繝ｦ繝ｼ繝九・繝昴ル繧ｳ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "遏ｳ逕ｰ 諡馴ヮ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｿ繝ｪ繧ｹ繝槭ル繝・け",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1780137308123",
    version: "v316.1",
    date: "2026-05-30T10:35:08.123Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繧ｴ繝ｳ繝輔ぃ繝ｭ繝九お繝ｼ繝ｬ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "謌ｸ蟠・蝨ｭ螟ｪ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｨ繝斐ヵ繧｡繝阪う繧｢",
        "scoreAdjust": 15
      },
      {
        "field": "weightChange",
        ""operator": ">=",
        ""value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譛ｨ蟷｡ 蛻昜ｹ・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝舌ざ",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "豎溽伐 辣ｧ逕ｷ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｸ繝｣繧ｹ繧ｿ繧ｦ繧ｧ繧､",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1780137354738",
    version: "v317.1",
    date: "2026-05-30T10:35:54.738Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繝ｯ繝・ぅ繧｢繝ｫ繝ｪ繝､繝冗ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "frame",
        ""operator": "<=",
        ""value": 2,
        "scoreAdjust": 15
      },
      {
        "field": "age",
        ""operator": "==",
        ""value": 3,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "D.繝ｬ繝ｼ繝ｳ",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "St Mark's Basilica",
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "weightChange",
        ""operator": ">=",
        ""value": 10,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "闊溷ｱｱ 迹�豕・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繧ｷ繝ｫ繝舌・繧ｹ繝・・繝・,
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1780628624856",
    version: "v318.1",
    date: "2026-06-05T03:03:44.856Z",
    description: "髢蛻･ - 螂ｽ襍ｰ鬥ｬ(繧ｹ繝医・繝ｪ繝ｼ繧ｿ繧､繝�遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "髢蛻･",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": ">=",
        ""value": 480,
        "scoreAdjust": 10
      },
      {
        "field": "weightChange",
        ""operator": "<=",
        ""value": -10,
        "scoreAdjust": 10
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "譛埼Κ闌・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝・ぅ繝ｼ繝励ヶ繝ｪ繝ｩ繝ｳ繝・,
        "scoreAdjust": 15
      },
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "age",
        ""operator": ">=",
        ""value": 8,
        "scoreAdjust": 20
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "闍･譚画悃",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｭ繝ｼ繧ｨ繝ｳ繧ｰ繝ｪ繝ｳ",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1780629925341",
    version: "v1.1",
    date: "2026-06-05T03:25:25.341Z",
    description: "髢蛻･ - 螂ｽ襍ｰ鬥ｬ(繝｢繧ｦ繝輔ヶ繧ｭ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "髢蛻･",
    condition: "濶ｯ",
    adjustments: [
      {
        "field": "weight",
        ""operator": "<=",
        ""value": 440,
        "scoreAdjust": 10
      },
      {
        "field": "frame",
        ""operator": ">=",
        ""value": 7,
        "scoreAdjust": 15
      },
      {
        "field": "jockey",
        ""operator": "includes",
        ""value": "貂｡驍頑ｺ・,
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        ""operator": "includes",
        ""value": "繝ｩ繝悶Μ繝ｼ繝・う",
        "scoreAdjust": 15
      }
    ],
    active: true
  },
  {
    id: "patch_1780888010796",
    version: "v1.1",
    date: "2026-06-08T03:06:50.796Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繧ｿ繧ｬ繝弱ヰ繝ｫ繧ｳ繧ｹ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
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
        ""value": 7,
        scoreAdjust: 15
      },
      {
        field: "jockey",
        operator: "includes",
        value: "鬮倡伐 貎､",
        scoreAdjust: 15
      },
      {
        field: "sire",
        operator: "includes",
        value: "繧ｭ繧ｿ繧ｵ繝ｳ繝悶Λ繝・け",
        scoreAdjust: 15
      }
    ],
    active: true
  },
  {
    id: "patch_1780888192247",
    version: "v2.1",
    date: "2026-06-08T03:09:52.247Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繧｢繧､繧｢繝ｳ繝代う繧ｯ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
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
        "value": "讓ｪ螻ｱ 蜈ｸ蠑・,
        scoreAdjust: 15
      },
      {
        field: "sire",
        operator: "includes",
        "value": "繝倥Φ繝ｪ繝ｼ繝舌Ο繝ｼ繧ｺ",
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
        "operator": "includes",
        "value": "讓ｪ螻ｱ 豁ｦ蜿ｲ",
        scoreAdjust: 15
      },
      {
        field": "sire",
        "operator": "includes",
        "value": "繝繝弱Φ繧ｭ繝ｳ繧ｰ繝ｪ繝ｼ",
        scoreAdjust: 15
      }
    ],
    active: true
  },
  {
    id: "patch_1780888233271",
    version: "v3.1",
    date: "2026-06-08T03:10:33.271Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繝ｬ繧､繧ｺ繝・Φ繝壹せ繝育ｭ・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
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
        "value": 10,
        scoreAdjust: 15
      },
      {
        field: "frame",
        operator: ">=",
        "value": 7,
        scoreAdjust: 15
      },
      {
        field: "age",
        operator: "==",
        "value": 3,
        scoreAdjust: 15
      },
      {
        field: "jockey",
        operator: "includes",
        "value": "讓ｪ螻ｱ 蜥檎函",
        scoreAdjust: 15
      },
      {
        field: "sire",
        "operator": "includes",
        "value": "繧ｫ繝ｪ繝輔か繝ｫ繝九い繧ｯ繝ｭ繝ｼ繝�",
        scoreAdjust: 15
      },
      {
        field: "jockey",
        operator: "includes",
        "value": "菴舌・惠 螟ｧ霈・,
        scoreAdjust: 15
      },
      {
        field: "sire",
        "operator": "includes",
        "value": "繝ｭ繧ｸ繝｣繝ｼ繝舌Ο繝ｼ繧ｺ",
        scoreAdjust: 15
      },
      {
        field: "jockey",
        operator: "includes",
        "value": "謌ｸ蟠・蝨ｭ螟ｪ",
        scoreAdjust: 15
      },
      {
        field: "sire",
        "operator": "includes",
        "value": "繝ｭ繝ｼ繝峨き繝翫Ο繧｢",
        scoreAdjust: 15
      }
    ],
    active: true
  },
  {
    id: "patch_1780888426794",
    version: "v4.1",
    date: "2026-06-08T03:13:46.794Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繝ｪ繝ｪ繧ｫ繝ｫ繝輔Ξ繧｢遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
    adjustments: [
      {
        field: "weight",
        operator: "<=",
        value: 440,
        scoreAdjust: 10
      },
      {
        field: "jockey",
        "operator": "includes",
        "value": "豢･譚・譏守ｧ",
        scoreAdjust: 15
      },
      {
        field: "sire",
        "operator": "includes",
        "value": "繝昴お繝・ぅ繝・け繝輔Ξ繧｢",
        scoreAdjust: 15
      },
      {
        field": "jockey",
        "operator": "includes",
        "value": "讓ｪ螻ｱ 豁ｦ蜿ｲ",
        scoreAdjust: 15
      },
      {
        field: "sire",
        "operator": "includes",
        "value": "繧ｵ繝ｼ繝医ぇ繝ｫ繝翫・繝ｪ繧｢",
        scoreAdjust: 15
      }
    ],
    active: true
  },
  {
    id: "patch_1780888467784",
    version: "v5.1",
    date: "2026-06-08T03:14:27.784Z",
    description: "譚ｱ莠ｬ - 螂ｽ襍ｰ鬥ｬ(繝輔ぅ繝ｪ繧ｪ繧ｽ繝ｩ繝ｼ繝ｬ遲・縺ｮ迚ｹ諤ｧ蟄ｦ鄙・,
    track: "譚ｱ莠ｬ",
    condition: "濶ｯ",
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
        "value": 2,
        scoreAdjust: 15
      },
      {
        field: "jockey",
        operator: "includes",
        "value": "C.繝ｫ繝｡繝ｼ繝ｫ",
        scoreAdjust: 15
      },
      {
        field: "sire",
        operator: "includes",
        "value": "繧ｨ繝斐ヵ繧｡繝阪う繧｢",
        scoreAdjust: 15
      },
      {
        field: "jockey",
        "operator": "includes",
        "value": "讓ｪ螻ｱ 豁ｦ蜿ｲ",
        scoreAdjust: 15
      },
      {
        field: "sire",
        "operator": "includes",
        "value": "繧ｨ繝輔ヵ繧ｩ繝ｼ繝ｪ繧｢",
        scoreAdjust: 15
      }
    ],
    active: true
  },
  {
    "id": "patch_1780889150978",
    "version": "v1.1",
    "date": "2026-06-08T03:25:50.978Z",
    "description": "高知 - 好走馬(ダディダ等)の特性学習",
    "track": "高知",
    "condition": "不良",
    "adjustments": [
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
        "value": "大澤誠",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "モーニン",
        "scoreAdjust": 15
      }
    ],
    "active": true
  },
  {
    "id": "patch_1780889290128",
    "version": "v2.1",
    "date": "2026-06-08T03:28:10.128Z",
    "description": "高知 - 好走馬(ペイシャニット等)の特性学習",
    "track": "高知",
    "condition": "不良",
    "adjustments": [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
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
        "value": "カレンブラックヒル",
        "scoreAdjust": 15
      }
    ],
    "active": true
  },
  {
    "id": "patch_1780889323979",
    "version": "v3.1",
    "date": "2026-06-08T03:28:43.979Z",
    "description": "高知 - 好走馬(ペイシャニット等)の特性学習",
    "track": "高知",
    "condition": "不良",
    "adjustments": [
      {
        "field": "weight",
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
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
        "value": "カレンブラックヒル",
        "scoreAdjust": 15
      }
    ],
    "active": true
  },
  {
    "id": "patch_1780889452713",
    "version": "v4.1",
    "date": "2026-06-08T03:30:52.714Z",
    "description": "高知 - 好走馬(レンジシ等)の特性学習",
    "track": "高知",
    "condition": "不良",
    "adjustments": [
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
        "value": "山田貴",
        "scoreAdjust": 15
      },
      {
        "field": "sire",
        "operator": "includes",
        "value": "ニシケンモノノフ",
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
        "operator": "<=",
        "value": -10,
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
        "value": "サートゥルナーリア",
        "scoreAdjust": 15
      }
    ],
    "active": true
  },
  {
    "id": "patch_1780889511871",
    "version": "v5.1",
    "date": "2026-06-08T03:31:51.871Z",
    "description": "高知 - 好走馬(シティプロスパー等)の特性学習",
    "track": "高知",
    "condition": "不良",
    "adjustments": [
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
        "value": "井上瑛",
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
        "operator": ">=",
        "value": 480,
        "scoreAdjust": 10
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
        "value": "リオンディーズ",
        "scoreAdjust": 15
      }
    ],
    "active": true
  }
];
