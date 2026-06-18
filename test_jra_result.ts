import * as fs from 'fs';

const pasteText = `
1	2	4	テスティモーネ 4番人気
牡4 / 454kg(+6)
松山弘平(58.0)  杉山晴紀(栗東)
2:01.3 / 36.1
2	3	5	ラケマーダ 2番人気
牡4 / 522kg(+6)
川田将雅(58.0)  大久保龍(栗東)
2:01.4 (クビ) / 36.1
3	5	10	ルクスビッグスター 1番人気
牡4 / 510kg(+4)
武豊(58.0)  清水久詞(栗東)
2:01.5 (クビ) / 35.8
`;

const lines = pasteText.split("\n").map(l => l.trim());
const parsedMap = new Map();

// Mock race
const race = { horses: [] };

let i = 0;
while (i < lines.length) {
  const line = lines[i]?.trim();
  if (!line) { i++; continue; }

  let isMatch = false;
  let rank = 0, num = 0, name = "", pop = 0;
  let linesConsumed = 1;

  // 1. 完全行のキャプチャ (例: "1\t3\t5\tコンジェスタス6番人気" またはスペース混在)
  const fullMatch = line.match(/^(\d+)[\t\s]+(\d+)[\t\s]+(\d+)[\t\s]+(.+)/);
  // 2. 改行分割行のキャプチャ (例: "1\t8\t16")
  const splitMatch = line.match(/^(\d+)[\t\s]+(\d+)[\t\s]+(\d+)$/);

  if (fullMatch) {
    rank = parseInt(fullMatch[1]);
    num = parseInt(fullMatch[3]);
    const namePart = fullMatch[4].trim();
    const popM = namePart.match(/(.+?)(\d+)番人気/);
    name = popM ? popM[1].trim() : namePart;
    pop = popM ? parseInt(popM[2]) : 0;
    isMatch = true;
  } else if (splitMatch) {
    rank = parseInt(splitMatch[1]);
    num = parseInt(splitMatch[3]);

    const nextIdx = i + 1;
    const nextLine = lines[nextIdx]?.trim() || "";
    
    const cleanNext = nextLine.replace(/^(ブリンカー)[\t\s]*/, "").trim();
    const popM = cleanNext.match(/(.+?)(\d+)番人気/);
    name = popM ? popM[1].trim() : cleanNext;
    pop = popM ? parseInt(popM[2]) : 0;

    isMatch = true;
    linesConsumed = 2;
  }

  if (isMatch && rank >= 1 && rank <= 20) {
    let baseIdx = i + linesConsumed;

    const line2 = lines[baseIdx]?.trim() || "";
    let weight = 480, weightChange = 0;
    if (line2.includes("/")) {
      const lp = line2.split("/");
      const wPart = lp[1]?.trim() || "";
      const wm = wPart.match(/(\d+)kg/);
      if (wm) weight = parseInt(wm[1]);
      const wcm = wPart.match(/\(([+-]?\d+)\)/) || wPart.match(/\((初出走)\)/) || wPart.match(/\(±?(\d+)\)/);
      if (wcm) {
        weightChange = wcm[1] === "初出走" ? 0 : parseInt(wcm[1]) || 0;
      }
      baseIdx++;
    }

    const line3 = lines[baseIdx]?.trim() || "";
    let jockey = "", jockeyWeight = 54, trainer = "";
    if (line3.includes("(")) {
      const jm = line3.match(/^([^\(]+?)\((\d+\.?\d*)\)/);
      if (jm) {
        jockey = jm[1].trim().replace(/^[▲△☆◇]/, "");
        jockeyWeight = parseFloat(jm[2]);
      }
      const trM = line3.match(/\)\s+([^\s\(]+?[\(（][栗美][東浦][\)）])/);
      if (trM) trainer = trM[1].trim();
      else {
        const parts = line3.split(/\s+/);
        trainer = parts[parts.length - 1] || "";
      }
      baseIdx++;
    }

    const line4 = lines[baseIdx]?.trim() || "";
    let time = "", margin = "", last3f = "";
    if (line4.includes("/")) {
      const lp4 = line4.split("/");
      const timePart = lp4[0].trim();
      const lastPart = lp4[1]?.trim() || "";

      const tm = timePart.match(/(\d+:\d+\.\d+|\d+\.\d+)/);
      if (tm) time = tm[1];
      const mm = timePart.match(/\((.+?)\)/);
      if (mm) margin = mm[1];

      const lm = lastPart.match(/(\d{2}\.\d)/);
      if (lm) last3f = lm[1];
      baseIdx++;
    }

    const cleanName = name.replace(/^ブリンカー\s*/, "").trim();

    parsedMap.set(rank, {
      rank,
      horseNumber: num,
      horseName: cleanName,
      time,
      popularity: pop,
      weight,
      weightChange,
      jockey,
      jockeyWeight,
      trainer,
      last3f,
      margin
    });

    i = baseIdx - 1;
  }

  i++;
}

console.log(Array.from(parsedMap.values()));
