const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/lib/engine.ts');
let content = fs.readFileSync(filePath, 'utf8');

const newContent = `export function generateFormation(predictions: Prediction[], raceType: Formation['type'] = 'trifecta'): Formation {
  const sorted = [...predictions].sort((a, b) => b.potential - a.potential || b.darkness - a.darkness || a.horseNumber - b.horseNumber);
  const horses = sorted.map(p => p.horseNumber);

  const axisNos = horses.slice(0, 3);
  const darkNos = horses.slice(3, 7);
  const allNos = [...new Set([...axisNos, ...darkNos])].sort((a, b) => a - b);

  let col1 = axisNos;
  let col2 = axisNos;
  let col3: number[] | undefined = allNos;

  let tickets: number[][] = [];
  
  if (raceType === 'trifecta_exact') {
    col1 = axisNos;
    col2 = axisNos;
    col3 = allNos;

    for (const first of col1) {
      for (const second of col2) {
        if (first === second) continue;
        for (const third of col3) {
          if (first === third || second === third) continue;
          tickets.push([first, second, third]);
        }
      }
    }
  } else if (raceType === 'quinella') {
    col1 = axisNos;
    col2 = allNos;
    col3 = undefined;

    const ticketSet = new Set<string>();
    col1.forEach(a => col2.forEach(b => {
      if (a !== b) {
        ticketSet.add([a, b].sort((x, y) => x - y).join('-'));
      }
    }));
    tickets = Array.from(ticketSet).map(t => t.split('-').map(Number));
  } else if (raceType === 'exacta') {
    col1 = axisNos;
    col2 = allNos;
    col3 = undefined;

    for (const first of col1) {
      for (const second of col2) {
        if (first === second) continue;
        tickets.push([first, second]);
      }
    }
  } else {
    // trifecta
    col1 = axisNos;
    col2 = axisNos;
    col3 = allNos;

    const ticketSet = new Set<string>();
    for (let i = 0; i < col1.length; i++) {
      for (let j = 0; j < col2.length; j++) {
        for (let k = 0; k < col3.length; k++) {
          const a = col1[i];
          const b = col2[j];
          const c = col3[k];
          if (a !== b && b !== c && a !== c) {
            ticketSet.add([a, b, c].sort((x, y) => x - y).join('-'));
          }
        }
      }
    }
    tickets = Array.from(ticketSet).map(t => t.split('-').map(Number));
  }

  return { type: raceType, col1, col2, col3, tickets, totalPoints: tickets.length, axisHorses: axisNos, darkHorses: darkNos };
}`;

const startIndex = content.indexOf("export function generateFormation(");
const endIndex = content.indexOf("export function generateWin5Picks(");

if (startIndex !== -1 && endIndex !== -1) {
    content = content.substring(0, startIndex) + newContent + "\n\n" + content.substring(endIndex);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Successfully replaced generateFormation logic");
} else {
    console.log("Could not find the function boundaries.");
}
