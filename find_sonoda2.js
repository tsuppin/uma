const fs = require('fs');
const content = fs.readFileSync('app/lib/engineNAR.ts', 'utf8');
const lines = content.split('\n');
let printing = false;
let count = 0;
lines.forEach((line, i) => {
  if (line.includes("園田") && line.includes('includes')) {
    printing = true; count = 0;
  }
  if (printing) {
    console.log(`L${i+1}: ${line}`);
    count++;
    if (count > 100) { printing = false; }
  }
});
