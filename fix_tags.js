const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engine.ts');
let content = fs.readFileSync(filePath, 'utf8');

// The tags to replace
const replacements = [
  {
    regex: /tags\.push\(`💎期待値乖離\(\+\$\{\(oddsDeviation \* 100\)\.toFixed\(1\)\}%?\)`\);/g,
    replace: "tags.push(`💎期待値乖離(大化け期待)`);"
  },
  {
    regex: /tags\.push\(`⌚ 生涯ベスト時計保有\(\$\{bestTimeStr\}\)`\);/g,
    replace: "tags.push(`⌚ 生涯ベスト時計保有(スピード上位)`);"
  },
  {
    regex: /tags\.push\(`❌ 斤量急増ペナルティ: 前走比\+\$\{kinryoDiff\}kg\(パフォーマンス低下リスク\)`\);/g,
    replace: "tags.push(`❌ 斤量急増ペナルティ(パフォーマンス低下リスク)`);"
  },
  {
    regex: /tags\.push\(`🧬ダート黄金血統\(\$\{sireName\}\)`\);/g,
    replace: "tags.push(`🧬ダート黄金血統(適性抜群)`);"
  },
  {
    regex: /tags\.push\(`🐎 有名実力牧場生産\(\$\{breederName\.replace\(\/牧場\|ファーム\/g, ''\)\}\)`\);/g,
    replace: "tags.push(`🐎 有名実力牧場生産(ブランド力)`);"
  },
  {
    regex: /tags\.push\(`👑 全国トップジョッキー\(勝率\$\{\(nationwideWinRate\*100\)\.toFixed\(1\)\}%\)`\);/g,
    replace: "tags.push(`👑 全国トップジョッキー(高勝率)`);"
  },
  {
    regex: /tags\.push\(`🏡ダート優秀牧場\(\$\{breederName\}\)`\);/g,
    replace: "tags.push(`🏡ダート優秀牧場`);"
  },
  {
    regex: /tags\.push\(`💪 砂のスタミナ\(母父\): ダート適性に優れたBMS血統エッジ\(\$\{bmsName\}\)`\);/g,
    replace: "tags.push(`💪 砂のスタミナ(母父): ダート適性に優れたBMS血統エッジ`);"
  },
  {
    regex: /tags\.push\(`💪ダート高速末脚\(上がり\$\{bestLast3f\.toFixed\(1\)\}s\)`\);/g,
    replace: "tags.push(`💪ダート高速末脚(上がり最速級)`);"
  },
  {
    regex: /tags\.push\(`🌃後半戦:安定した末脚\(上がり\$\{bestLast3f\.toFixed\(1\)\}s\)`\);/g,
    replace: "tags.push(`🌃後半戦:安定した末脚`);"
  },
  {
    regex: /tags\.push\(`🧬 スピード・砂サイアー適性\(\$\{horse\.sire\.replace\(\/ファーム\|牧場\/g, ''\)\}\)`\);/g,
    replace: "tags.push(`🧬 スピード・砂サイアー適性`);"
  }
];

let modified = content;
for (const r of replacements) {
  const count = (modified.match(r.regex) || []).length;
  console.log(`Replacing ${r.regex} -> count: ${count}`);
  modified = modified.replace(r.regex, r.replace);
}

fs.writeFileSync(filePath, modified, 'utf8');
console.log("Done");
