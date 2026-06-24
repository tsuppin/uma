const fs = require('fs');

function parseResultString(str) {
    if (!str || !str.match(/^\d+$/)) return undefined;
    // The string format is usually like "53334" meaning 5-3-3-34.
    // If it's less than 4 digits, it's padded with zeros?
    // Let's assume the last digit(s) might be more than 1 digit.
    // Wait, "53334" is 5 chars. If it's 5,3,3,34.
    // "00224" -> 0,0,2,24
    // "3108" -> 3,1,0,8. So 4 chars means 1 digit each.
    // Generally, the first 3 are always 1 digit (1着, 2着, 3着 are single digits? What if a horse has >9 wins? e.g. 10 wins, 5 2nd, 2 3rd, 14 out?
    // Wait, Rakuten text is: 10 wins -> "105214"?
    // Let's look at the actual Rakuten Keiba site format. 
    // Usually, they put commas or spaces, but the copy-paste squashes them?
    // Let's see: "10047" -> 10 wins, 0 2nd, 0 3rd, 47 out. Length is 5.
    // If length is 4: "3108" -> 3-1-0-8. 
    // "02257" -> 0-2-2-57. Length 5.
    // "16425" -> 1-6-4-25. Length 5.
    // "14641" -> 1-4-6-41. Length 5.
    // "10047" -> 1-0-0-47. Length 5.
    // "00188" -> 0-0-1-88. Length 5.
    // "15424" -> 1-5-4-24. Length 5.
    // "34741" -> 3-4-7-41. Length 5.
    // "22435" -> 2-2-4-35. Length 5.
    // From this, it seems the first 3 places are ALWAYS 1 digit in this text? No, wait!
    // Horse 4: "10047". If it's 1-0-0-47, that's fine. What if it's 10-0-4-7?
    // Look at Horse 4's other stats: "00023", "00025", "00020", "0005", "0008", "1008".
    // 1008 could be 1-0-0-8.
    // What if a horse has 15 wins? "150012"? Length 6.
    // Basically: 1st, 2nd, 3rd are usually single digits if < 10.
    // Actually, Rakuten Keiba uses `[1着]-[2着]-[3着]-[着外]`. The hyphens might be removed by split/match?
    // Let's look at `test_missing_horses.txt`!
    // Ah, the user's copy-paste text literally has no spaces or hyphens! It's just "53334".
    // If it's "10047", is it 10-0-4-7 or 1-0-0-47?
    // We can assume the last 2 digits are `着外` if length is 5. If length is 4, the last 1 digit is `着外`.
    // Wait, what if length is 6? `100012` -> 10, 0, 0, 12?
    // Usually, the first 3 are single digits? No, a horse can win 10 times.
    // If a horse wins 10 times, 12 times 2nd, 3 times 3rd, 5 times out: "101235"? Length 6.
    // Without separators, parsing it perfectly is ambiguous.
    // BUT we can use a heuristic: 1st, 2nd, 3rd are single digits EXCEPT if length > 5?
    // Actually, we can just split by taking the last N-3 characters as `着外`, and the first 3 as 1st, 2nd, 3rd.
    // Let's assume the string is `${w1}${w2}${w3}${wOut}`.
    // Since `w1`, `w2`, `w3` are usually 0-9, they take 1 char each.
    // If a horse has >9 wins, it takes 2 chars. This is rare for C3 class, but possible.
    // If we just take the last 2 digits as `着外` (if length>=5), and if there are still 3 chars left, they are 1st, 2nd, 3rd.
    // Let's write a safe heuristic.
    
    if (str.length === 4) {
        return [parseInt(str[0]), parseInt(str[1]), parseInt(str[2]), parseInt(str[3])];
    } else if (str.length === 5) {
        return [parseInt(str[0]), parseInt(str[1]), parseInt(str[2]), parseInt(str.slice(3))];
    } else if (str.length > 5) {
        // e.g. 1012345 -> ambiguous. Just fallback to something safe or 1 char each and rest is out
        return [parseInt(str[0]), parseInt(str[1]), parseInt(str[2]), parseInt(str.slice(3))];
    }
    return undefined;
}

function parseRakutenText(filePath) {
    const text = fs.readFileSync(filePath, 'utf-8');
    const lines = text.split('\n').map(l => l.trim());
    
    const horses = [];
    let lineIndex = 0;
    
    while (lineIndex < lines.length) {
        const line = lines[lineIndex];
        const startMatch = line.match(/^(\d+)\s+(\d+)\s+([^\s]+)\s+(.+)$/);
        const startMatchMissingWaku = line.match(/^(\d+)\s+([^\s]+)\s+(.+)$/);
        
        let frame = 0, number = 0, sire = "", matched = false;

        if (startMatch) {
            frame = parseInt(startMatch[1]);
            number = parseInt(startMatch[2]);
            sire = startMatch[4];
            matched = true;
        } else if (startMatchMissingWaku) {
            number = parseInt(startMatchMissingWaku[1]);
            sire = startMatchMissingWaku[3];
            matched = true;
        }
        
        if (matched) {
            const name = lines[lineIndex + 1];
            const birthdayRaw = lines[lineIndex + 5]; 
            const weightRaw1 = lines[lineIndex + 10]; 
            const jockeyWinRateRaw = lines[lineIndex + 13]; 
            const jockeyPlaceRateRaw = lines[lineIndex + 14]; 
            const bestWeightRaw = lines[lineIndex + 16]; 
            
            let birthday = birthdayRaw ? birthdayRaw.replace(/生$/, '') : undefined;
            let jockeyWinRate = jockeyWinRateRaw ? parseFloat(jockeyWinRateRaw.replace(/[^\d.]/g, '')) : undefined;
            let jockeyPlaceRate = jockeyPlaceRateRaw ? parseFloat(jockeyPlaceRateRaw.replace(/[^\d.]/g, '')) : undefined;
            let bestWeight = bestWeightRaw && bestWeightRaw.match(/^\d+$/) ? parseInt(bestWeightRaw) : undefined;
            
            let horseWeight = 480;
            let horseWeightChange = 0;
            for (let j = lineIndex + 16; j < Math.min(lineIndex + 25, lines.length); j++) {
                const hwMatch = lines[j].match(/^(\d{3})\s*(\d{3})$/);
                if (hwMatch) {
                    horseWeight = parseInt(hwMatch[2]); 
                } else if (lines[j].match(/^[+-]\d+|±0$/)) {
                    horseWeightChange = parseInt(lines[j].replace('±0', '0'));
                }
            }

            let rIndex = lineIndex + 16;
            let pastRaces = [];
            while (rIndex < lines.length) {
                if (lines[rIndex] === "過去映像") {
                    const pResultLine = lines[rIndex - 3];
                    let pResult = pResultLine && pResultLine.match(/^\d+$/) ? parseInt(pResultLine) : 0;
                    
                    const pConditionLine = lines[rIndex - 2];
                    let pCondition = "良";
                    if (pConditionLine && pConditionLine.match(/^(良|稍重|重|不良|稍|不)$/)) {
                        if (pConditionLine === "稍") pCondition = "稍重";
                        else if (pConditionLine === "不") pCondition = "不良";
                        else pCondition = pConditionLine;
                    }
                    
                    const pHeadCountLine = lines[rIndex - 1];
                    let pHeadCount = 0;
                    if (pHeadCountLine && pHeadCountLine.match(/^(\d+)頭$/)) {
                        pHeadCount = parseInt(pHeadCountLine.replace('頭', ''));
                    }

                    pastRaces.push({
                        result: pResult,
                        condition: pCondition,
                        headCount: pHeadCount,
                        venueDate: lines[rIndex + 1]
                    });
                    rIndex += 9;
                } else {
                    if (lines[rIndex] && lines[rIndex].match(/^\d+\s+[^\s]+\s+.*$/)) {
                        break;
                    }
                    rIndex++;
                }
            }

            // Extract matrix
            let totalResults, venueResults, distanceResults, courseResults, under1400Results, from1401To1600Results, from1601To1800Results, over1801Results;
            let bestTimes = {};
            
            for (let i = lineIndex + 16; i < rIndex; i++) {
                if (lines[i] === "持ち時計") {
                    if (i >= 8) {
                        totalResults = parseResultString(lines[i - 8]);
                        venueResults = parseResultString(lines[i - 7]);
                        distanceResults = parseResultString(lines[i - 6]);
                        courseResults = parseResultString(lines[i - 5]);
                        under1400Results = parseResultString(lines[i - 4]);
                        from1401To1600Results = parseResultString(lines[i - 3]);
                        from1601To1800Results = parseResultString(lines[i - 2]);
                        over1801Results = parseResultString(lines[i - 1]);
                    }
                    
                    // The best times follow "持ち時計"
                    let j = i + 1;
                    let currentDistance = null;
                    while (j < rIndex) {
                        if (lines[j].match(/^\d+$/)) {
                            currentDistance = lines[j];
                        } else if (lines[j].match(/^[^\d]+\d+$/)) {
                            currentDistance = lines[j]; // e.g. 浦2000
                        } else if (lines[j].match(/^[^\d]{1,2}\d{4}[^\s]+$/)) {
                             // e.g. 浦2107不ダ3 -> meaning Urawa 2:10.7 bad dirt 3
                             if (currentDistance) {
                                 const timeStrMatch = lines[j].match(/(\d)(\d{2})(\d)/); // 2107 -> 2:10.7
                                 if (timeStrMatch) {
                                     bestTimes[currentDistance] = `${timeStrMatch[1]}:${timeStrMatch[2]}.${timeStrMatch[3]}`;
                                 }
                             }
                        }
                        j++;
                    }
                    break;
                }
            }

            horses.push({
                number, name, birthday, jockeyWinRate, jockeyPlaceRate, bestWeight, horseWeight, horseWeightChange,
                totalResults, venueResults, distanceResults, courseResults,
                under1400Results, from1401To1600Results, from1601To1800Results, over1801Results, bestTimes, pastRaces
            });
            lineIndex = rIndex;
        } else {
            lineIndex++;
        }
    }
    return horses;
}

const res = parseRakutenText('scratch/test_missing_horses.txt');
console.log(JSON.stringify(res[0], null, 2));
