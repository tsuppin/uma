const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engineNAR.ts');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `    // ==========================================
    // 【特化ロジック】園田競馬場・乗り替わりの勝負気配（2026/06分析）
    // ==========================================`;

const replaceStr = `    // ヒモ穴絞り込み条件2：前走が後方待機の追い込み馬（展開待ち）
    if (popularity >= 6 && ['後方', '追込'].includes(horse.style)) {
      potential += 15;
      tags.push("💥 園田特注: 展開待ちから強襲！前がやり合う展開で浮上する追い込み穴馬");
    }

    // ヒモ穴絞り込み条件3：波乱メーカーの調教師（尾林二 / 碇清次）
    if (horse.trainer && ['尾林二', '碇清次'].some(t => horse.trainer.includes(t))) {
      potential += 15; // 波乱を起こす陣営としてスコア底上げ
      tags.push("💥 園田特注: 波乱の使者！高配当を演出する穴メーカー陣営(尾林二/碇清次厩舎)");
    }

    // ==========================================
    // 【特化ロジック】園田競馬場・乗り替わりの勝負気配（2026/06分析）
    // ==========================================`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Successfully updated Sonoda himo rules.");
} else {
  console.log("Error: Target string not found.");
}
