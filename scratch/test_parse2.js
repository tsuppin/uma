const fs = require('fs');

const pasteText = `レース結果
5月9日(土曜)
東京
京都
新潟
5月10日(日曜)
東京
京都
新潟
開催選択へ レース選択へ
1R
2R
3R
4R
5R
6R
7R
8R
9R
10R
11R
12R
2026年5月9日(土曜) 3回京都5日
ウインファイブ4レース目 11R 京都新聞杯 GⅡ
3歳 オープン (国際)(指定) 馬齢
コース 2200m 芝・右 外 発走15:30
天候:晴 芝:良
本賞金(万円):5400、2200、1400、810、540
付加賞(万円):113.4、32.4、16.2
出馬表	オッズ
騎手インタビュー
全周パトロール
レース映像
レース結果 11レース
着順	枠	馬番	馬名 / 単勝人気
性齢 / 馬体重
騎手(負担重量) / 調教師
タイム(着差) / 推定上り
1	3	5	コンジェスタス6番人気
牡3 / 518kg(-6)
西村淳也(57.0)  高野友和(栗東)
2:09.9 / 35.3
2	8	15	ベレシート1番人気
牡3 / 480kg(-2)
北村友一(57.0)  斉藤崇史(栗東)
2:09.9 (クビ) / 35.5
3	3	6	ラディアントスター9番人気
牡3 / 514kg(-10)
池添謙一(57.0)  林徹(美浦)
2:10.2 (１ 3/4) / 35.7
4	5	10	サヴォアフェール4番人気
牡3 / 498kg(-4)
松山弘平(57.0)  杉山晴紀(栗東)
2:10.4 (１) / 35.6
5	2	3	メイショウテンク12番人気
牡3 / 450kg(-2)
団野大成(57.0)  荒川義之(栗東)
2:10.4 (クビ) / 35.4
6	4	7	カムアップローゼス10番人気
牡3 / 466kg(+6)
鮫島克駿(57.0)  浜田多実雄(栗東)
2:10.4 (アタマ) / 35.8
7	1	2	エムズビギン2番人気
牡3 / 508kg(0)
川田将雅(57.0)  友道康夫(栗東)
2:10.6 (１ 1/4) / 35.8
8	7	13	ニホンピロロジャー13番人気
牡3 / 438kg(+6)
国分恭介(57.0)  緒方努(栗東)
2:10.7 (１／２) / 35.6
9	5	9	カフジエメンタール11番人気
牡3 / 526kg(-2)
吉村誠之助(57.0)  矢作芳人(栗東)
2:10.8 (３／４) / 35.9
10	8	16	アクセス5番人気
牡3 / 476kg(-10)
岩田望来(57.0)  上村洋行(栗東)
2:10.9 (クビ) / 36.6
11	4	8	バドリナート7番人気
牡3 / 492kg(0)
坂井瑠星(57.0)  松永幹夫(栗東)
2:10.9 (ハナ) / 36.5
12	2	4	ティラーノ15番人気
牡3 / 464kg(+2)
田山旺佑(57.0)  小手川準(美浦)
2:11.0 (３／４) / 36.1
13	6	12	キンググローリー8番人気
牡3 / 466kg(+4)
幸英明(57.0)  古賀慎明(美浦)
2:11.1 (１／２) / 37.0
14	1	1	アーレムアレス3番人気
牡3 / 484kg(-10)
菱田裕二(57.0)  橋口慎介(栗東)
2:11.2 (１／２) / 36.6
15	6	11	ブリガンティン16番人気
牡3 / 468kg(+8)
原優介(57.0)  松山将樹(美浦)
2:11.3 (クビ) / 36.2
16	7	14	ステラスペース14番人気
牡3 / 466kg(-12)
武藤雅(57.0)  武藤善則(美浦)
2:11.6 (２) / 37.5
タイム
ハロンタイム	12.5 - 11.0 - 11.8 - 11.7 - 11.7 - 11.7 - 12.0 - 11.7 - 12.1 - 11.9 - 11.8
上り	4F 47.5 - 3F 35.8
コーナー通過順位
1コーナー
14(8,12)(1,15)(7,5,16)(4,2)(9,6)-(3,10)13,11
2コーナー
14,12,8,15(1,16)(7,5)6(4,2,9)(3,10)13-11
3コーナー
(*14,12)(15,16)8(1,7,6)5(4,2,9)-(3,10)13,11
4コーナー
(*14,12)(8,15,16)6(1,7,5)10(4,2,9)(13,3,11)
払戻金
単勝	5	1,370円	6番人気
複勝	5	390円	7番人気
15	120円	1番人気
6	550円	9番人気
枠連	3-8	960円	3番人気
馬連	5-15	1,540円	4番人気
馬単	5-15	4,310円	13番人気
ワイド	5-15	820円	7番人気
5-6	4,610円	44番人気
6-15	1,410円	15番人気
3連複	5-6-15	13,940円	49番人気
3連単	5-15-6	74,860円	234番人気
・勝馬投票に的中された方がいない場合、その投票法に投票された方全員に「特払い」をいたします。
・特定の馬番・組番に人気が著しく集中した場合、JRAプラス10の対象にならないことがあります。
・レースや騎手等につく記号
勝馬の紹介
コンジェスタス 2023年1月27日生牡3
父：
コントレイル
母：
キラモサ
馬主：
(有)シルクレーシング
生産牧場：
ノーザンファーム
競走中の出来事等
カムアップローゼス号の騎手鮫島克駿は、１周目正面の直線コースで内側に斜行したことについて戒告。（被害馬：２番）
ステラスペース号の騎手武藤雅は、１コーナー手前で内側に斜行したことについて戒告。（被害馬：７番・１番）
ゴール前写真

1R
2R
3R
4R
5R
6R
7R
8R
9R
10R
11R
12R`;

const lines = pasteText.split("\n").map(l => l.trim());
const parsedMap = new Map();

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (!line) continue;

  if ((line === "払戻金" || line === "コーナー通過順位" || line.startsWith("タイム")) && parsedMap.size > 0) break;
  if (line.startsWith("単勝") && line.includes("円") && parsedMap.size > 0) break;

  if (line.includes("着順") || line.includes("馬名(所属)") || line.includes("タイム(着差)")) continue;

  let rank = 0, horseNumber = 0, horseName = "", time = "";

  if (line.includes("\t")) {
    const parts = line.split("\t");
    const r = parseInt(parts[0]);
    const n = parts.length >= 3 ? parseInt(parts[2]) : parseInt(parts[1]);
    if (r >= 1 && r <= 20 && n >= 1 && n <= 28) {
      rank = r;
      horseNumber = n;
      const rawName = parts.length >= 4 ? parts[3] : (parts[2] || "");
      horseName = rawName
        .replace(/\d+番人気$/, "")
        .replace(/ブリンカー|マルチ|着用/g, "")
        .trim();
    }
  }

  if (rank === 0) {
    const parts = line.split(/\s+/);
    if (parts.length >= 3 && /^\d+$/.test(parts[0]) && /^\d+$/.test(parts[1]) && /^\d+$/.test(parts[2])) {
      const r = parseInt(parts[0]);
      const ku = parseInt(parts[1]);
      const n = parseInt(parts[2]);
      if (r >= 1 && r <= 20 && ku >= 1 && ku <= 8 && n >= 1 && n <= 28) {
        rank = r;
        horseNumber = n;
        horseName = parts.slice(3).find(p => /[\u3040-\u9FFF\u30A0-\u30FF]/.test(p) || (p.length > 1 && !/^\d+$/.test(p))) || "";
        horseName = horseName.replace(/\d+番人気$/, "").replace(/ブリンカー|マルチ|着用/g, "").trim();
      }
    }
    else if (parts.length >= 2 && /^\d+$/.test(parts[0]) && /^\d+$/.test(parts[1])) {
      const r = parseInt(parts[0]);
      const n = parseInt(parts[1]);
      if (r >= 1 && r <= 20 && n >= 1 && n <= 28) {
        rank = r;
        horseNumber = n;
        horseName = parts.slice(2).find(p => p.length > 1 && !/^\d+$/.test(p)) || "";
        horseName = horseName.replace(/\d+番人気$/, "").replace(/ブリンカー|マルチ|着用/g, "").trim();
      }
    }
  }

  if (rank === 0 && /^\d+$/.test(line)) {
    const r = parseInt(line);
    if (r >= 1 && r <= 20 && i + 3 < lines.length) {
      const l1 = lines[i + 1], l2 = lines[i + 2], l3 = lines[i + 3];
      if (/^\d+$/.test(l1) && /^\d+$/.test(l2) && !/^\d/.test(l3) && l3.length > 1) {
        rank = r;
        horseNumber = parseInt(l2);
        horseName = l3.replace(/\(.+?\)$/, "").trim();
      } else if (/^\d+$/.test(l1) && !/^\d/.test(l2) && l2.length > 1) {
        rank = r;
        horseNumber = parseInt(l1);
        horseName = l2.replace(/\(.+?\)$/, "").trim();
      }
    }
  }

  if (rank === 0) {
    const m = line.match(/^(\d+)[着位]\s*(?:枠\d+)?\s*(\d+)番?\s+([^\s\d][^\s]*)/);
    if (m) {
      rank = parseInt(m[1]);
      horseNumber = parseInt(m[2]);
      horseName = m[3].replace(/\d+番人気$/, "").trim();
    }
  }

  if (rank > 0 && !horseName) {
    for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
      const nl = lines[j].trim();
      if (!nl || /^\d/.test(nl) || nl.includes("/") || nl.length <= 1) continue;
      if (nl === "払戻金" || nl === "コーナー通過順位") break;
      if (/[\u3040-\u9FFF\u30A0-\u30FF]/.test(nl)) {
        horseName = nl.replace(/\d+番人気$/, "").replace(/ブリンカー|マルチ|着用/g, "").trim();
        break;
      }
    }
  }

  for (let j = i; j < Math.min(i + 6, lines.length); j++) {
    const tm = lines[j].match(/(\d+:\d+\.\d+|\d+:\d+:\d+)/);
    if (tm) {
      time = tm[1].replace(/(\d+:\d+):(\d+)$/, "$1.$2");
      break;
    }
  }

  if (rank >= 1 && rank <= 20 && (horseNumber > 0 || horseName) && !parsedMap.has(rank)) {
    parsedMap.set(rank, { rank, horseNumber, horseName, time });
  }
}

const parsed = Array.from(parsedMap.values()).sort((a, b) => a.rank - b.rank);
console.log(parsed);
