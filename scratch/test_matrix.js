const fs = require('fs');

function parseNARHorseExperiment(lines) {
  let jockeyWinRate = 0;
  let jockeyPlaceRate = 0;

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    if (l.match(/^【(\d+\.\d+)%】$/)) {
      if (jockeyWinRate === 0) {
        jockeyWinRate = parseFloat(l.match(/^【(\d+\.\d+)%】$/)[1]);
      } else if (jockeyPlaceRate === 0) {
        jockeyPlaceRate = parseFloat(l.match(/^【(\d+\.\d+)%】$/)[1]);
      }
    }
  }

  // Find where past races end.
  // Actually, we can just look from the end of the array backwards for "持ち時計"
  let clockIdx = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].includes("持ち時計")) {
      clockIdx = i;
      break;
    }
  }

  const matrix = [];
  if (clockIdx !== -1) {
    // Collect digit strings right above 持ち時計
    for (let i = clockIdx - 1; i >= 0; i--) {
      const l = lines[i].trim();
      if (/^\d{4,6}$/.test(l)) {
        matrix.unshift(l);
      } else {
        break; // stop when we hit something not a matrix row
      }
    }
  } else {
    // If "持ち時計" is missing, we might still find the matrix at the very end.
    for (let i = lines.length - 1; i >= 0; i--) {
       const l = lines[i].trim();
       if (!l) continue;
       if (/^\d{4,6}$/.test(l)) {
          let j = i;
          while (j >= 0 && /^\d{4,6}$/.test(lines[j].trim())) {
             matrix.unshift(lines[j].trim());
             j--;
          }
          break;
       }
    }
  }

  // Extract totalResults, etc. from matrix
  const parseMatrixRow = (str) => {
    if (!str || str.length < 4) return undefined;
    const l = str.length;
    // 53334 -> 1st: 5, 2nd: 3, 3rd: 3, Out: 34
    // Last 2 chars are usually "着外", or if it's 4 chars, last 1 char is "着外" maybe?
    // Usually it's up to 99 races out, so it can be 2 chars. Let's just assume last (length-3) chars are out.
    const first = parseInt(str.charAt(0));
    const second = parseInt(str.charAt(1));
    const third = parseInt(str.charAt(2));
    const out = parseInt(str.substring(3));
    return [first, second, third, out];
  };

  const results = {
    jockeyWinRate, jockeyPlaceRate,
    matrixStr: matrix,
    totalResults: parseMatrixRow(matrix[0]),
    venueResults: parseMatrixRow(matrix[1]), // Could be dirt or venue
    // ... we can just map the 8 items
  };

  return results;
}

const lines = fs.readFileSync('scratch/test_missing_horses.txt', 'utf-8').split('\n').slice(0, 100);
console.log(parseNARHorseExperiment(lines));
