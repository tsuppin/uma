const fs = require('fs');

const rawText = fs.readFileSync('test_input2.txt', 'utf8');
const lines = rawText.split("\n").map(l => l.trim());

const blockStarts = [];
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  if (/^[\s\t　]*枠[\s\t　]*\d/.test(l)) {
    blockStarts.push(i);
  }
}
console.log("blockStarts length:", blockStarts.length);
if (blockStarts.length > 0) {
  const b0 = blockStarts[0];
  console.log("Block 0 lines:");
  for (let j = 0; j < 20; j++) {
    console.log(lines[b0 + j]);
  }
}
