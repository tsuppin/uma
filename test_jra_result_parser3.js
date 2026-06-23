const fs = require('fs');

const rawText = fs.readFileSync('test_jra_result.txt', 'utf8');
const lines = rawText.split("\n").map(l => l.trim());

const horses = [];
let blockStarts = [];

for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  if (/^\d+\s*[\t　]+\s*枠\d/.test(l)) {
    blockStarts.push(i);
  }
}

console.log("Blocks found:", blockStarts.length);

for (let bi = 0; bi < blockStarts.length; bi++) {
  const start = blockStarts[bi];
  const end = (bi < blockStarts.length - 1) ? blockStarts[bi+1] : start + 6;
  const blockLines = lines.slice(start, end).filter(l => l !== "");
  
  // blockLines をすべてタブでつなげる
  // 例: "1	枠7橙	14	ダノンプレサージュ	牝3	55.0	横山 典弘	1:36.5		"
  // "2 2"
  // "36.4	488(+2)	大竹 正博	1"
  const combinedStr = blockLines.join("\t");
  const combined = combinedStr.split(/\t+/).map(s => s.trim()).filter(s => s !== "");
  
  let frame = 0, number = 0, name = "", gender = "牡", age = 3, kinryo = 55, jockey = "";
  let horseWeight = 0, horseWeightChange = 0, trainer = "", popularity = 0;
  
  if (combined.length >= 7) {
    const frameMatch = combined[1].match(/枠(\d)/);
    if (frameMatch) frame = parseInt(frameMatch[1]);
    number = parseInt(combined[2]);
    name = combined[3].replace("ブリンカー着用", "");
    
    const gaMatch = combined[4].match(/^([牡牝セ]|せん)(\d+)/);
    if (gaMatch) {
      gender = gaMatch[1] === "セ" || gaMatch[1] === "せん" ? "セン" : gaMatch[1];
      age = parseInt(gaMatch[2]);
    }
    kinryo = parseFloat(combined[5]);
    jockey = combined[6];
    
    for (let j = 7; j < combined.length; j++) {
      const field = combined[j];
      const wm = field.match(/^(\d{3})(?:\(([+-]?\d+|初出走)\))?$/);
      if (wm) {
        horseWeight = parseInt(wm[1]);
        if (wm[2]) horseWeightChange = wm[2] === "初出走" ? 0 : parseInt(wm[2]);
        if (j + 1 < combined.length) trainer = combined[j+1];
        if (j + 2 < combined.length) popularity = parseInt(combined[j+2]);
        break;
      }
    }
    horses.push({ number, frame, name, gender, age, kinryo, jockey, horseWeight, horseWeightChange, trainer, popularity });
  }
}

console.log(horses);
