const fs = require('fs');

function parseJRAOfficialText(rawText) {
    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l !== '');
    
    let date = "";
    let venue = "";
    let raceNumber = 0;
    let distance = 0;
    let surface = "ダート";
    let condition = "良";
    
    for (let i = 0; i < Math.min(lines.length, 50); i++) {
        const line = lines[i];
        const dateMatch = line.match(/^(\d{4}年\d{1,2}月\d{1,2}日)（[^）]+）\s*\d+回([^0-9]+)\d+日\s*(\d+)レース/);
        if (dateMatch) {
             date = dateMatch[1].replace(/年|月/g, '-').replace('日', '');
             venue = dateMatch[2].trim();
             raceNumber = parseInt(dateMatch[3]);
        }
        
        const distMatch = line.match(/コース：([\d,]+)メートル（(ダート|芝|障害)・/);
        if (distMatch) {
            distance = parseInt(distMatch[1].replace(',', ''));
            surface = distMatch[2] === "ダート" ? "ダート" : (distMatch[2] === "芝" ? "芝" : "障害");
        }
    }
    
    const horses = [];
    let blockStarts = [];
    
    for (let i = 0; i < lines.length; i++) {
        // Find lines like "枠1白	1"
        if (lines[i].match(/^枠[1-8][白黒赤青黄緑橙桃]\s*(\d+)/)) {
            blockStarts.push(i);
        }
    }
    
    for (let i = 0; i < blockStarts.length; i++) {
        const start = blockStarts[i];
        const end = i < blockStarts.length - 1 ? blockStarts[i+1] : lines.length;
        const horseBlock = lines.slice(start, end);
        
        // horseBlock[0] = 枠1白	1
        const line1Match = horseBlock[0].match(/^枠([1-8])[白黒赤青黄緑橙桃]\s*(\d+)/);
        let frame = line1Match ? parseInt(line1Match[1]) : 0;
        let number = line1Match ? parseInt(line1Match[2]) : 0;
        
        let offset = 1;
        if (horseBlock[offset] === 'ブリンカー着用') offset++;
        let name = horseBlock[offset]; offset++;
        let odds = parseFloat(horseBlock[offset]); offset++;
        let pop = 0;
        if (horseBlock[offset].match(/\((\d+)番人気\)/)) {
            pop = parseInt(horseBlock[offset].match(/\((\d+)番人気\)/)[1]);
            offset++;
        }
        
        let horseWeight = 0;
        let horseWeightChange = 0;
        if (horseBlock[offset].match(/^(\d{3})kg\(([-+]?\d+|初出走)\)/)) {
            const hwMatch = horseBlock[offset].match(/^(\d{3})kg\(([-+]?\d+|初出走)\)/);
            horseWeight = parseInt(hwMatch[1]);
            if (hwMatch[2] !== '初出走') horseWeightChange = parseInt(hwMatch[2]);
            offset++;
        }
        
        let owner = horseBlock[offset]; offset++;
        let breeder = horseBlock[offset]; offset++;
        let trainer = horseBlock[offset].replace(/\([^\)]+\)/, '').trim(); offset++;
        
        let sire = horseBlock[offset].replace('父：', ''); offset++;
        let dam = horseBlock[offset].replace('母：', ''); offset++;
        let bms = horseBlock[offset].replace('(母の父：', '').replace(')', ''); offset++;
        
        if (horseBlock[offset] === '勝負服の画像') offset++;
        
        let sex = "", age = 0, coat = "";
        const sexAgeMatch = horseBlock[offset].match(/^([牡牝セセン])(\d+)\/(.+)$/);
        if (sexAgeMatch) {
             sex = sexAgeMatch[1];
             age = parseInt(sexAgeMatch[2]);
             coat = sexAgeMatch[3];
             offset++;
        }
        
        let weight = parseFloat(horseBlock[offset]); offset++;
        let jockey = horseBlock[offset]; offset++;
        
        const pastRaces = [];
        
        for (let j = offset; j < horseBlock.length; j++) {
            const dateVenueMatch = horseBlock[j].match(/^(\d{4}年\d{1,2}月\d{1,2}日)\s+(.+)$/);
            if (dateVenueMatch) {
                let prDate = dateVenueMatch[1].replace(/年|月/g, '-').replace('日', '');
                let prVenue = dateVenueMatch[2]; j++;
                let prRaceName = horseBlock[j]; j++;
                
                // e.g. "5着	15頭6番"
                let result = 0, headCount = 0;
                let resMatch = horseBlock[j].match(/(\d+)着\s*(\d+)頭/);
                if (resMatch) {
                    result = parseInt(resMatch[1]);
                    headCount = parseInt(resMatch[2]);
                } j++;
                
                let prPop = 0;
                if (horseBlock[j].match(/(\d+)番人気/)) {
                    prPop = parseInt(horseBlock[j].match(/(\d+)番人気/)[1]);
                } j++;
                
                let prJockey = "", prJWeight = 55;
                let jwMatch = horseBlock[j].match(/^([^\s]+)\s+([\d.]+)kg/);
                if (jwMatch) {
                    prJockey = jwMatch[1];
                    prJWeight = parseFloat(jwMatch[2]);
                } j++;
                
                let prDist = 0, prSurf = "ダート";
                let dsMatch = horseBlock[j].match(/(\d+)(ダ|芝|障)/);
                if (dsMatch) {
                    prDist = parseInt(dsMatch[1]);
                    prSurf = dsMatch[2] === "ダ" ? "ダート" : (dsMatch[2] === "芝" ? "芝" : "障害");
                } j++;
                
                let prTime = horseBlock[j]; j++;
                let prCond = horseBlock[j]; j++; // 良, 稍重...
                
                let prHWeight = 0;
                if (horseBlock[j] && horseBlock[j].match(/(\d{3})kg/)) {
                    prHWeight = parseInt(horseBlock[j].match(/(\d{3})kg/)[1]);
                } j++;
                
                let prPassing = horseBlock[j] ? horseBlock[j].replace(/\s+/g, '-') : ""; j++;
                
                let pr3f = "";
                if (horseBlock[j] && horseBlock[j].startsWith("3F")) {
                     pr3f = horseBlock[j].replace("3F", "").trim(); j++;
                }
                
                let prWinner = horseBlock[j] || "";
                let timeDiff = 0;
                if (prWinner.includes("(")) {
                    const diffM = prWinner.match(/\(([-+]?[\d.]+)\)$/);
                    if (diffM) timeDiff = parseFloat(diffM[1]);
                    prWinner = prWinner.replace(/\([-+]?[\d.]+\)$/, '');
                }
                
                pastRaces.push({
                     date: prDate,
                     venue: prVenue,
                     raceName: prRaceName,
                     distance: prDist,
                     surface: prSurf,
                     condition: prCond,
                     result: result,
                     headCount: headCount,
                     popularity: prPop,
                     jockey: prJockey,
                     jockeyWeight: prJWeight,
                     time: prTime,
                     weight: prHWeight,
                     passingPositions: prPassing,
                     last3fTime: pr3f,
                     winnerName: prWinner,
                     timeDiff: timeDiff
                });
            }
        }
        
        horses.push({
            number, frame, name, horseWeight, horseWeightChange,
            owner, breeder, trainer, sire, dam, bms, sex, age, coat,
            weight, jockey, odds, pop, pastRaces
        });
    }
    
    return { date, venue, raceNumber, distance, surface, horses };
}

const res = parseJRAOfficialText(fs.readFileSync('scratch/test_jra.txt', 'utf-8'));
console.log(JSON.stringify(res.horses[0], null, 2));
console.log(`Parsed ${res.horses.length} horses.`);
