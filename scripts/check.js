const fs = require('fs');

try {
  let buf = fs.readFileSync('parsed.json');
  let text = buf.toString('utf16le');
  
  // Find "tagStats"
  const start = text.indexOf('"tagStats":[');
  if (start === -1) {
    console.log("No tagStats found");
    process.exit(0);
  }
  
  const end = text.indexOf(']', start);
  const arrStr = text.substring(start + '"tagStats":'.length, end + 1);
  
  // Clean it up
  const cleanStr = arrStr.replace(/[\u0000-\u001F]/g, '');
  const tags = JSON.parse(cleanStr);
  
  const review = tags.filter(t => t.fired >= 5 && (t.top3 / t.fired) < 0.25);
  console.log(JSON.stringify(review, null, 2));
} catch(e) {
  console.error("Error:", e);
}
