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

function parseJRAHorse(blockLines) {
  let frame = 1;
  let number = 0;
  let name = "";
  let idx = 1;
  let owner = "", breeder = "", trainer = "", stableLocation = "";
  
  // extract frame and number
  const tabParts = blockLines[0].split(/\t/);
  if (tabParts.length > 1 && /^\d+$/.test(tabParts[1].trim())) {
    const frameMatch = tabParts[0].match(/枠[\s\t　]*(\d)/);
    if (frameMatch) frame = parseInt(frameMatch[1]);
    number = parseInt(tabParts[1].trim());
  }

  // Skip any pre-name elements like "勝負服", "ブリンカー", or icons
  while (idx < blockLines.length) {
    const cleanLine = (blockLines[idx] || "").trim();
    if (cleanLine === "" || cleanLine.includes("勝負服") || cleanLine === "ブリンカー" || /^\[[外地抽]\]$/.test(cleanLine)) {
      idx++;
    } else {
      break;
    }
  }

  name = (blockLines[idx] || "").trim(); idx++;

  const tempLines = [];
  let tempIdx = idx;
  while(tempIdx < blockLines.length && tempLines.length < 4) {
      const cl = blockLines[tempIdx].trim();
      if(cl !== "" && !/^\d+$/.test(cl) && !cl.includes("勝負服")) {
        tempLines.push({text: cl, idx: tempIdx});
      }
      tempIdx++;
  }
  
  // This logic is looking for: owner, breeder, trainer, sire
  // But here we have: odds (150.6), popularity, weight, owner, breeder, trainer...
  return { frame, number, name, tempLines };
}

const horseLines = lines.slice(blockStarts[0], blockStarts[1]);
console.log(parseJRAHorse(horseLines));
