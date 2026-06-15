const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join('c:', 'Users', 'tsuyoshi_tsuchiya', '.gemini', 'antigravity', 'scratch', 'keiba_app', 'app', 'lib');
const filesToProcess = ['engine.ts', 'engineNAR.ts'];

const targetTags = [
  "馬が不在の単騎逃げ確定（マイペース絶対有利）",
  "門別マニアック: 地方屈指の大箱コースで末脚が爆発するパワー型差し馬",
  "地方ダート特注: コースのクセを熟知した地方トップジョッキー",
  "東京特選:オッズ逆数期待値ブースト(+15)",
  "大穴一変(ブリンカー爆弾)",
  "後半:爆穴(ヒモ穴・高配当狙い)",
  "人気逆数加速(爆穴補正)",
  "東京:爆穴ポテンシャル加速",
  "1枠:黄金期待値(軸信頼度1位)",
  "波乱の使者:激走の伏兵",
  "阪神ダ外枠特注血統：パワーとスピードの融合(シニミニ/ドレフォン)",
  "ダート黄金血統(ドレフォン)",
  "スピード・砂サイアー適性(ドレフォン)",
  "阪神特注馬: AI学習済み特化バイアス合致 (+40)",
  "8枠:外枠の安定感",
  "馬体激変:紐穴激走サイン",
  "激走トリガー(馬体変動×ブリンカー)",
  "函館特注: 長距離輸送のストレスがない滞在競馬で躍動する牝馬",
  "ブリンカー多用(効果分散)",
  "金沢マニアック: 超小回りコースで物理的に止まらない『内枠の逃げ先行』",
  "若駒ダート×ブリンカー(集中力UP)",
  "函館特化OMEGAエンジン適用中",
  "特殊馬具(集中力向上)",
  "ブリンカー着用（集中力UP）",
  "期待値シナジー(歪み×一変トリガー)",
  "初ブリンカー装着による集中力激変期待",
  "若駒フェーズ適合(2-3歳期待)",
  "期待値クロス: 前走展開泣きの上がり上位馬（ハイペース必至で台頭）",
  "ダートエリート血統",
  "物理黄金比:負担極小・圧倒的パワーアドバンテージ",
  "特殊馬具(希少一変期待)",
  "大型馬パワーボーナス(500kg以上)",
  "前半:差し・追い込み波乱警戒",
  "重量負担(前半戦回避)",
  "斤量比率10%台(パワー無双)",
  "軽量馬(2-3着ヒモ穴特化)",
  "3連系:軽量激走ブースト",
  "若駒ダート:末脚一閃期待(差し切り)",
  "黄金斤量(55kg)",
  "7枠:勝負の突き抜け(勝率1位)",
  "前半:中穴激走ゾーン",
  "阪神TB危険: ダ短距離の大外枠ロス",
  "阪神ダ1400m黄金条件：芝スタート外枠の圧倒的エッジ",
  "内枠最短経路",
  "後半戦マイナス体重(メイチ絞り)",
  "JRA特化OMEGAエンジン適用中",
  "近走好走実績あり",
  "斤量比率適正(勝ちきり期待)",
  "西高東低(栗東所属)",
  "安定馬体(1着候補:±8kg内)",
  "地方ダート特注: 深い砂を力でねじ伏せる圧倒的パワー血統",
  "期待値の闇: 前走上位人気裏切りによる過小評価(妙味爆発)",
  "PMR最適（短距離）",
  "東京ダート短距離：ブリンカー集中力バフ",
  "ダート戦：砂被り回避の外枠優位",
  "乾燥東京ダート：大型パワー馬スタミナエッジ",
  "鞍上交代(新コンビ)",
  "中間枠:バイアス劣勢",
  "阪神特注馬: AI学習済み特化バイアス合致 (+25)",
  "阪神特化OMEGAエンジン適用中",
  "古馬・ベテランフェーズ適合(実績重視)",
  "メイチ仕上げ推測(馬体重絞り)",
  "ダート差し・追込:展開不備注意",
  "後半戦差し馬:2-3着強襲期待",
  "東京特化OMEGAエンジン適用中",
  "後半フェーズ:鋭い末脚(上がり重視)"
];

for (const file of filesToProcess) {
  const filePath = path.join(BASE_DIR, file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');
  let lines = content.split('\n');
  let modified = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('tags.push(')) {
      for (const tag of targetTags) {
        if (line.includes(tag) && !line.trim().startsWith('//')) {
          // tags.push の行をコメントアウト
          lines[i] = line.replace('tags.push(', '// [要見直し2] tags.push(');
          modified = true;
          console.log(`[${file}] コメントアウト: ${tag}`);
          
          // 直前の行が /* [減点方式] potential += ... */ のようになっている場合、
          // 既にコメントアウトされているが、もし生きていればコメントアウトする
          // また、ブロック波カッコが一緒にコメントアウトされないように /* */ で囲む
          if (i > 0) {
            const prevLine = lines[i - 1];
            if (prevLine.includes('potential +=') && !prevLine.trim().startsWith('//') && !prevLine.trim().startsWith('/*')) {
               lines[i - 1] = '/* [要見直し2] */ ' + prevLine.trimStart();
            }
          }
        }
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log(`${file} を更新しました。`);
  } else {
    console.log(`${file} に変更はありませんでした。`);
  }
}
