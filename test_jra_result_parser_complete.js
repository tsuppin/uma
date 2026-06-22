const fs = require('fs');

const rawText = fs.readFileSync('test_jra_result.txt', 'utf8');
const lines = rawText.split("\n").map(l => l.trim());

const results = {
  horses: [],
  payouts: []
};

let blockStarts = [];
let payoutStartIndex = -1;

for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  if (/^\d+\s*[\t　]+\s*枠\d/.test(l)) {
    blockStarts.push(i);
  }
  if (l === '払戻金') {
    payoutStartIndex = i;
  }
}

// 1. 馬情報（着順など）の解析
for (let bi = 0; bi < blockStarts.length; bi++) {
  const start = blockStarts[bi];
  const end = (bi < blockStarts.length - 1) ? blockStarts[bi+1] : start + 6;
  const blockLines = lines.slice(start, end).filter(l => l !== "");
  
  const combinedStr = blockLines.join("\t");
  const combined = combinedStr.split(/\t+/).map(s => s.trim()).filter(s => s !== "");
  
  let rank = 0, frame = 0, number = 0, name = "", gender = "牡", age = 3, kinryo = 55, jockey = "";
  let time = "", margin = "", agari = "";
  let horseWeight = 0, horseWeightChange = 0, trainer = "", popularity = 0;
  
  if (combined.length >= 7) {
    rank = parseInt(combined[0]);
    const frameMatch = combined[1].match(/枠(\d)/);
    if (frameMatch) frame = parseInt(frameMatch[1]);
    number = parseInt(combined[2]);
    name = combined[3].replace("ブリンカー着用", "").trim();
    
    const gaMatch = combined[4].match(/^([牡牝セ]|せん)(\d+)/);
    if (gaMatch) {
      gender = gaMatch[1] === "セ" || gaMatch[1] === "せん" ? "セン" : gaMatch[1];
      age = parseInt(gaMatch[2]);
    }
    kinryo = parseFloat(combined[5]);
    jockey = combined[6];
    
    time = combined[7];
    
    // 重量など後ろから探す
    for (let j = 7; j < combined.length; j++) {
      const field = combined[j];
      const wm = field.match(/^(\d{3})(?:\(([+-]?\d+|初出走)\))?$/);
      if (wm) {
        horseWeight = parseInt(wm[1]);
        if (wm[2]) horseWeightChange = wm[2] === "初出走" ? 0 : parseInt(wm[2]);
        
        // trainer / popularity
        if (j + 1 < combined.length) trainer = combined[j+1];
        if (j + 2 < combined.length) popularity = parseInt(combined[j+2].replace('人気', ''));
        
        // アガリはその1つ前か、2つ前
        if (j - 1 >= 8) {
          agari = combined[j-1];
        }
        break;
      }
    }

    // 着差を探す (タイムの後、かつコーナー通過などの前)
    // 「５」「１ 1/4」「ハナ」「アタマ」「クビ」など
    if (combined[8] && !combined[8].match(/^[0-9]+ [0-9]+$/)) { // コーナー通過じゃない場合
      // タイムとコーナーの間にあるのが着差
      if (combined[8] !== agari && !combined[8].match(/^\d+\.\d+$/)) {
         margin = combined[8];
      }
    }
    
    results.horses.push({ rank, number, frame, name, gender, age, kinryo, jockey, time, margin, agari, horseWeight, horseWeightChange, trainer, popularity });
  }
}

// 2. 払戻金の解析
if (payoutStartIndex !== -1) {
  let currentType = "";
  for (let i = payoutStartIndex + 1; i < lines.length; i++) {
    const l = lines[i];
    if (l.includes("勝馬投票に的中された方がいない場合")) break; // 払戻金セクション終了
    
    if (["単勝", "複勝", "枠連", "ワイド", "馬連", "馬単", "3連複", "3連単"].includes(l)) {
      currentType = l;
      continue;
    }
    
    // 例: "14	150円	1番人気"
    // 例: "5-10-14	15,950円	42番人気"
    const parts = l.split(/\t+/);
    if (parts.length >= 3 && currentType) {
      const combo = parts[0];
      const amount = parseInt(parts[1].replace(/円|,/g, ""));
      const pop = parseInt(parts[2].replace(/番人気/g, ""));
      results.payouts.push({ type: currentType, combo, amount, popularity: pop });
    }
  }
}

console.log(JSON.stringify(results, null, 2));
