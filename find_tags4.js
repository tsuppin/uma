const fs = require('fs');
// engineNAR.ts も検索
['app/lib/engine.ts', 'app/lib/engineNAR.ts'].forEach(filepath => {
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    const lines = content.split('\n');
    const keywords = ['ヒモ職人', '裸同然', '軽斤量(52', '門別減点'];
    lines.forEach((line, i) => {
      if (keywords.some(k => line.includes(k))) {
        const start = Math.max(0, i - 15);
        const end = Math.min(lines.length - 1, i + 3);
        console.log(`\n=== ${filepath} @ L${i+1}: ${line.trim()} ===`);
        for (let j = start; j <= end; j++) {
          console.log(`  L${j+1}: ${lines[j]}`);
        }
      }
    });
  } catch(e) { console.log(filepath, 'not found'); }
});
