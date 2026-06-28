const fs = require('fs');
const content = fs.readFileSync('app/lib/engine.ts', 'utf8');
const lines = content.split('\n');

// 各タグの前後10行を表示
const targets = [
  { keyword: 'ヒモ職人', desc: 'ヒモ職人' },
  { keyword: '裸同然の軽斤量', desc: '裸同然' },
  { keyword: '状態キープ: 好走時のベスト体重', desc: '状態キープ' },
  { keyword: '減量起用: 過去の好走時より斤量', desc: '減量起用' },
  { keyword: '波乱フェーズ:1番人気過信禁物', desc: '波乱フェーズ' },
  { keyword: '門別減点: 前残り', desc: '門別減点' },
  { keyword: '前走長く良い脚を使った', desc: 'まくり実績' },
  { keyword: '馬体安定(状態キープ)', desc: '岩手:状態キープ' },
];

targets.forEach(t => {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(t.keyword)) {
      console.log(`\n=== ${t.desc} @ L${i+1} ===`);
      const start = Math.max(0, i - 15);
      const end = Math.min(lines.length - 1, i + 5);
      for (let j = start; j <= end; j++) {
        console.log(`L${j+1}: ${lines[j]}`);
      }
    }
  }
});
