const fs = require('fs');

const rawText = fs.readFileSync('test_input2.txt', 'utf8');
const lines = rawText.split("\n").map(l => l.trim());

const blockStarts = [];
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  if (/^[\s\t　]*枠[\s\t　]*\d/.test(l)) blockStarts.push(i);
}

function parseJRAHorse(lines) {
  let frame = 1; let number = 0; let name = ""; let idx = 1;
  let hasBlinker = false; let trainer = "", stableLocation = "";
  let sire = "", dam = "", bms = "", odds = 0, popularity = 0;
  let horseWeight = 480, horseWeightChange = 0, gender = "牡", age = 4;
  let coatColor = "", kinryo = 55, jockey = "", owner = "", breeder = "";

  const frameMatch = lines[0].match(/枠[\s\t　]*(\d)/);
  if (frameMatch) frame = parseInt(frameMatch[1]);

  const tabParts = lines[0].split(/\t/);
  if (tabParts.length > 1 && /^\d+$/.test(tabParts[1].trim())) {
    number = parseInt(tabParts[1].trim());
  }

  while (idx < lines.length) {
    const cleanLine = (lines[idx] || "").trim();
    if (cleanLine === "" || cleanLine.includes("勝負服") || cleanLine === "ブリンカー" || /^\[[外地抽]\]$/.test(cleanLine)) {
      if (cleanLine.includes("ブリンカー")) hasBlinker = true;
      idx++;
    } else {
      break;
    }
  }

  name = (lines[idx] || "").trim(); idx++;

  while (idx < lines.length) {
    const l = (lines[idx] || "").trim();
    if (l === "" || l.includes("勝負服") || l === "B" || l === "☆" || l === "ブリンカー") { idx++; continue; }
    if (l.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/)) break;

    const gm = l.match(/^([牡牝セ]|せん)(\d+)(?:\/(.*))?$/);
    if (gm) { gender = gm[1]; age = parseInt(gm[2]); if (gm[3]) coatColor = gm[3].trim(); idx++; continue; }

    const wm = l.match(/^(\d{3})(?:kg)?(?:\(([+-]?\d+|初出走)\))?$/);
    if (wm) { 
      horseWeight = parseInt(wm[1]); 
      if (wm[2]) horseWeightChange = wm[2] === "初出走" ? 0 : parseInt(wm[2]);
      idx++; continue; 
    }

    const kinryoJockeyMatch = l.match(/^(\d{2}(?:\.\d)?)(?:kg)?\s*[☆△▲◇☆★]?\s*([^\d\.\s\(（]+)/);
    if (kinryoJockeyMatch && kinryoJockeyMatch[2].trim() !== "kg" && parseFloat(kinryoJockeyMatch[1]) >= 48) {
      kinryo = parseFloat(kinryoJockeyMatch[1]); jockey = kinryoJockeyMatch[2].trim(); idx++; continue;
    } else if (l.match(/^\d{2}\.\dkg$/) || (l.match(/^\d{2}\.\d$/) && parseFloat(l) >= 48)) {
      kinryo = parseFloat(l.replace("kg", "")); idx++; continue;
    }

    if (l.match(/^[\d\.]+$/)) { odds = parseFloat(l); idx++; continue; }
    
    const pm = l.match(/^\(?(\d+)番人気\)?$/);
    if (pm) { popularity = parseInt(pm[1]); idx++; continue; }

    const tm = l.match(/^(.+?)\s*[\(（]([栗美][東浦])[\)）]$/);
    if (tm && !trainer) { trainer = tm[1].trim(); stableLocation = tm[2]; idx++; continue; }

    if (l.startsWith("父：") || l.startsWith("父:")) { sire = l.replace(/^父[：:]/, "").trim(); idx++; continue; }
    if (l.startsWith("母：") || l.startsWith("母:")) { dam = l.replace(/^母[：:]/, "").trim(); idx++; continue; }
    if (l.includes("母の父")) { bms = l.replace(/^.*?母の父[：:]?/, "").replace(/[\(\)（）]/g, "").trim(); idx++; continue; }

    if (!l.match(/\d/)) {
      const isOwner = l.includes("(有)") || l.includes("(株)") || l.includes("レーシング") || l.includes("ファーム") || l.includes("ホールディングス") || l.includes("牧場") || l.includes("クラブ") || l.includes("組合");
      if (isOwner) { 
        if (!owner) owner = l; 
        else if (!breeder) breeder = l; 
        idx++; continue; 
      }
      if (!jockey && !isOwner) { jockey = l; idx++; continue; }
      if (!trainer && !l.match(/^[栗美][東浦]$/) && !isOwner) { trainer = l; idx++; continue; }
    }
    idx++;
  }
  return { number, name, odds, popularity, horseWeight, horseWeightChange, owner, breeder, trainer, sire, dam, bms, coatColor, gender, age, kinryo, jockey, hasBlinker };
}

const horseLines = lines.slice(blockStarts[0], blockStarts[1]);
console.log("Horse 1:", parseJRAHorse(horseLines));
const horseLines2 = lines.slice(blockStarts[1], blockStarts[2]);
console.log("Horse 2:", parseJRAHorse(horseLines2));
const horseLines6 = lines.slice(blockStarts[5], blockStarts[6]);
console.log("Horse 6 (has blinker):", parseJRAHorse(horseLines6));
