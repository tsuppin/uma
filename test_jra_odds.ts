import * as fs from 'fs';

const rawText = `
1	1	1	スナッピードレッサ
牡3	55.0	ルメール	木村(美浦)	480(+2)	2.5	1
2	2	2	アサカ
牝4	54.0	武豊	友道(栗東)	450(+2)	12.5	4
`;

const lines = rawText.split("\n").map(l => l.trim()).filter(l => l !== "");

function parseJRAHorse(lines) {
  let frame = 1;
  let number = 0;
  let name = "";
  let idx = 1;
  let odds = 0, popularity = 0;
  
  const multiMatch = lines[0].match(/^(\d+)[\s\t　]+(\d+)[\s\t　]+([^\s\t　]+)/);
  if (multiMatch) {
    frame = parseInt(multiMatch[1]);
    number = parseInt(multiMatch[2]);
    name = multiMatch[3];
  } else {
    const parts = lines[0].split(/\t|\s+/);
    if (parts.length >= 4) {
      frame = parseInt(parts[1]);
      number = parseInt(parts[2]);
      name = parts[3];
    }
  }

  while (idx < lines.length) {
    const l = (lines[idx] || "").trim();
    if (l === "") { idx++; continue; }

    // Kinryo (55.0)
    if (l.match(/^\d+\.\dkg$/) || l.match(/^\d+\.\d$/)) {
      idx++; 
      // Usually Jockey comes right after Kinryo in table format
      if (idx < lines.length && !lines[idx].match(/\d/)) {
        idx++; // Jockey
        if (idx < lines.length && !lines[idx].match(/\d/)) {
          idx++; // Trainer
        }
      }
      continue;
    }

    // Odds
    if (l.match(/^[\d\.]+$/) && !l.match(/^\d+\.\d$/)) {
      odds = parseFloat(l); idx++; continue;
    }

    // Popularity
    const pm = l.match(/^(\d+)番人気$/) || l.match(/^(\d+)$/);
    if (pm && odds > 0) { popularity = parseInt(pm[1]); idx++; continue; }

    idx++;
  }

  return { number, name, odds, popularity };
}

console.log(parseJRAHorse([lines[0], lines[1]]));
console.log(parseJRAHorse([lines[2], lines[3]]));
