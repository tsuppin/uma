const fs = require('fs');
const content = fs.readFileSync('app/lib/engine.ts', 'utf8');
const lines = content.split('\n');
const keywords = ['ヒモ職人', '裸同然', '軽斤量', '状態キープ', '減量起用', '前残り', 'まくり実績', '門別減点', '波乱フェーズ', '波乱フェーズ:1番人気'];
lines.forEach((line, i) => {
  const trimmed = line.trim();
  if (keywords.some(k => trimmed.includes(k))) {
    console.log(`L${i+1}: ${trimmed}`);
  }
});
