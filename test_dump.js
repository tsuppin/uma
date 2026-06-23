const fs = require('fs');
const rawText = fs.readFileSync('test_jra_result.txt', 'utf8');
const lines = rawText.split('\n');
console.log('line length:', lines.length);
for(let i=0; i<lines.length; i++) {
  if(lines[i].includes('ダノンプレサージュ')) {
    console.log("Found:", JSON.stringify(lines[i]));
  }
}
