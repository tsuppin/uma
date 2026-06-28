const fs = require('fs');
const content = fs.readFileSync('app/lib/engine.ts', 'utf8');
const lines = content.split('\n');

const targets = [
  { keyword: 'ヒモ職人', desc: 'ヒモ職人' },
  { keyword: '裸同然の軽斤量', desc: '裸同然軽斤量' },
  { keyword: '門別減点: 前残り', desc: '門別減点' },
];

targets.forEach(t => {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(t.keyword)) {
      console.log(`\n=== ${t.desc} @ L${i+1} ===`);
      const start = Math.max(0, i - 20);
      const end = Math.min(lines.length - 1, i + 5);
      for (let j = start; j <= end; j++) {
        console.log(`L${j+1}: ${lines[j]}`);
      }
    }
  }
});
