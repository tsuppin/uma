// ==========================================
// 土屋競馬予想AIシステム - 型定義
// ==========================================

export interface Horse {
  id: string;
  number: number;  // 馬番
  frame: number;   // 枠番
  name: string;    // 馬名
  belonging?: string; // 所属（地方競馬の「川崎」「浦和」等）
  age: number;     // 年齢
  gender: '牡' | '牝' | 'セン';  // 性別
  coatColor?: string;   // 毛色
  weight: number;  // 馬体重
  weightChange: number;  // 馬体重増減
  jockey: string;  // 騎手
  jockeyWeight: number;  // 騎手体重（斤量）
  trainer: string; // 調教師
  owner: string;   // 馬主
  breeder?: string; // 生産者名
  sire: string;    // 父（種牡馬）
  dam: string;     // 母
  bms: string;     // 母父（BMS）
  bloodline: string; // 血統系統
  style: '逃げ' | '先行' | '好位' | '差し' | '中団' | '後方' | '追込' | '';  // 脚質
  odds?: number;   // オッズ
  popularity?: number; // 人気
  // 前走・過去成績
  pastRaces: PastRace[];
  // 追加情報
  transferFrom?: string; // 転入元
  isTransferFirstRace?: boolean; // 転入初戦
  isAuction?: boolean;  // オークション馬
  isAfterRest?: boolean; // 休み明け
  isHelmetChange?: boolean; // ヘルメット変更
  ownerType?: string;  // 馬主タイプ
  jraEarnings?: number; // JRA本賞金
  raceClass?: string;  // 今回クラス
  cornerPositionVariance?: number; // コーナー通過順変動
  leftTurnExperience?: number; // 左回り実績
  horseType?: string;  // 馬体特性
  prevJockey?: string; // 前走騎手
  prizeCloseFlag?: boolean; // 賞金上限接近フラグ
  rotation?: string;   // ローテ
  prevInnerLoadExp?: boolean; // 前走内負荷経験
  useBlinkers?: boolean;     // 特殊馬具（ブリンカー）
  stableLocation?: '栗東' | '美浦' | '地方' | ''; // 厩舎・所属エリア
  oddsStandardScore?: number; // オッズ偏差値
}

export interface PastRace {
  date: string;     // 日付
  venue: string;    // 開催場
  raceName: string; // レース名
  raceClass: string; // クラス
  distance: number; // 距離
  direction?: '右' | '左' | '直線' | ''; // 回り
  surface: 'ダート' | '芝'; // 馬場
  condition: '良' | '稍重' | '重' | '不良'; // 馬場状態
  result: number;   // 着順
  headCount?: number;       // 出走頭数
  frameNumber?: number;     // 枠番
  popularity?: number;      // 単勝人気
  jockeyWeight?: number;    // 騎手斤量（斤量）
  time: string;     // 走破タイム
  corner4Position: number; // 4角通過順
  cornerOuterCount: number; // コーナー外回し頭数
  weight: number;   // 馬体重
  jockey: string;   // 騎手
  odds: number;     // オッズ
  prize: number;    // 賞金
  classBaseTime?: number; // クラス基準タイム
  otherVenueExp?: boolean; // 他場実績
  timeDiff?: number;       // 勝ち馬とのタイム差
  winnerName?: string;     // 勝ち馬名（1着とのタイム差時の馬名）
  passingPositions?: string; // 通過順位（例：「1-1-2-2」）
  last3fTime?: string;     // 上がり3ハロン
}

export interface Race {
  id: string;
  date: string;      // 開催日
  venue: string;     // 競馬場
  raceNumber: number; // レース番号
  raceName: string;  // レース名
  distance: number;  // 距離
  surface: 'ダート' | '芝'; // 馬場種別
  condition: '良' | '稍重' | '重' | '不良'; // 馬場状態
  headCount: number; // 頭数
  trackName: string; // 競馬場名（エンジン用）
  isWin5?: boolean;  // WIN5対象
  windSpeed?: number; // 風速
  isHeadwind?: boolean; // 向かい風
  isInBiasActive?: boolean; // イン突きバイアス
  season?: 'winter' | 'summer'; // 季節
  isNight?: boolean; // 夜間
  isTwilight?: boolean; // 薄暮
  startTime?: string;  // 発走時刻
  weather?: string;    // 天候
  horses: Horse[];
  predictions?: Prediction[];
  result?: RaceResult;
}

export interface Prediction {
  horseId: string;
  horseName: string;
  horseNumber: number;
  potential: number;       // ポテンシャルスコア
  darkness: number;        // 期待値の闇
  evIndex: number;         // EV指数
  aptitudeScore?: number;  // 適性スコア
  aptitudeTags?: string[]; // 適性タグ
  adjustedTime?: number;   // 補正タイム
  targetTag?: boolean;     // 物理的狙い馬タグ
  rank?: number;           // 予想順位
}

export interface Formation {
  type: 'trifecta' | 'trifecta_exact' | 'exacta' | 'win' | 'place' | 'quinella' | 'win5';
  col1: number[];  // 1列目
  col2?: number[]; // 2列目
  col3?: number[]; // 3列目
  tickets: number[][]; // 買い目リスト
  totalPoints: number; // 点数
  axisHorses: number[];  // 軸馬
  darkHorses: number[];  // 闇のヒモ穴
}

export interface RaceResult {
  raceId: string;
  result: {
    rank: number;
    horseNumber: number;
    horseName: string;
    time: string;
    odds: number;
    prize: number;
    popularity?: number;
    weight?: number;
    weightChange?: number;
    jockey?: string;
    jockeyWeight?: number;
    trainer?: string;
    last3f?: string;
    margin?: string; // 着差
  }[];
  lapTimes?: string[]; // ハロンタイム ["12.1", "11.3", ...]
  last4fTime?: string; // 上がり4F
  last3fTime?: string; // 上がり3F
  cornerPassings?: string[]; // コーナー通過順 ["1角: (11,5)...", ...]
  refunds?: {
    win?: { horse: string; payout: number; popularity: number }[]; // 単勝
    place?: { horse: string; payout: number; popularity: number }[]; // 複勝
    bracketQuinella?: { bracket: string; payout: number; popularity: number }[]; // 枠連
    quinella?: { combination: string; payout: number; popularity: number }[]; // 馬連
    exacta?: { combination: string; payout: number; popularity: number }[]; // 馬単
    wide?: { combination: string; payout: number; popularity: number }[]; // ワイド
    trio?: { combination: string; payout: number; popularity: number }[]; // 3連複
    trifecta?: { combination: string; payout: number; popularity: number }[]; // 3連単
  };
  winnerProfile?: {
    horseName: string;
    birthDate?: string;
    sire?: string;
    dam?: string;
    owner?: string;
    breeder?: string;
  };
  incidents?: string; // 競走中の出来事等
  hitTickets?: number[][];
  profit?: number;
  learningApplied?: boolean;
  learningNotes?: string;
}

export interface LearningPatch {
  id: string;
  version: string;
  date: string;
  description: string;
  track?: string;
  condition?: string;
  adjustments: {
    field: string;
    operator: string;
    value: number | string;
    scoreAdjust: number;
  }[];
  active: boolean;
}

export interface AppState {
  races: Race[];
  win5Races?: Race[];
  learningPatches: LearningPatch[];
  modelVersion: string;
  stats: {
    totalRaces: number;
    hitCount: number;
    hitRate: number;
    totalInvested: number;
    totalReturn: number;
    roi: number;
  };
  masterData: MasterData; // 蓄積されたエンティティデータ
}

export interface MasterData {
  horses: Record<string, HorseMaster>;
  jockeys: Record<string, JockeyMaster>;
  laps?: Record<string, { venue: string; distance: number; surface: string; laps: string[]; date: string }[]>; // 蓄積されたラップ履歴
}

export interface HorseMaster {
  name: string;
  lastWeight?: number;
  lastWeightChange?: number;
  bestTime?: Record<string, string>; // { "venue_dist": "time" }
  results: { date: string; rank: number; venue: string; distance: number }[];
  sire?: string;
  dam?: string;
  owner?: string;
  breeder?: string;
  belonging?: string; // 所属競馬場 (例: "大井", "川崎" 等)
  incidents?: { date: string; venue: string; note: string }[]; // 出来事履歴
}

export interface JockeyMaster {
  name: string;
  totalRaces: number;
  wins: number;
  top3: number;
  venueStats: Record<string, { total: number; wins: number; top3: number }>;
}

export type TrackName = '笠松' | '大井' | '門別' | '阪神' | '中山' | '名古屋' | '弥富' | '東京' | '京都' | '新潟' | '中京' | '小倉' | '福島' | '函館' | '札幌' | '金沢';
