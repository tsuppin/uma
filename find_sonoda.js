const fs = require('fs');
['app/lib/engine.ts', 'app/lib/engineNAR.ts'].forEach(filepath => {
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    const lines = content.split('\n');
    let inSonoda = false;
    let sonodaStart = -1;
    lines.forEach((line, i) => {
      if (line.includes("園田") && (line.includes('if') || line.includes('else') || line.includes('includes'))) {
        if (!inSonoda) { sonodaStart = i; inSonoda = true; }
      }
      if (inSonoda && i > sonodaStart && i < sonodaStart + 80) {
        console.log(`${filepath} L${i+1}: ${line}`);
      }
      if (inSonoda && i >= sonodaStart + 80) { inSonoda = false; }
    });
  } catch(e) { console.log(filepath, 'read error'); }
});
