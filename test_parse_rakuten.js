const fs = require('fs');

function parseRakutenText(filePath) {
    const text = fs.readFileSync(filePath, 'utf-8');
    const lines = text.split('\n').map(l => l.trim());
    
    const horses = [];
    let currentHorse = null;
    let lineIndex = 0;
    
    while (lineIndex < lines.length) {
        const line = lines[lineIndex];
        
        // 1	1	-	ジャングルポケット
        const startMatch = line.match(/^(\d+)\s+(\d+)\s+([^\s]+)\s+(.+)$/);
        
        if (startMatch) {
            currentHorse = {
                wakuban: startMatch[1],
                umaban: startMatch[2],
                mark: startMatch[3],
                sire: startMatch[4],
            };
            
            // 次の行から情報を取得
            if (lineIndex + 15 < lines.length) {
                currentHorse.horseName = lines[lineIndex + 1];
                currentHorse.dam = lines[lineIndex + 2];
                currentHorse.damSire = lines[lineIndex + 3].replace(/^\(|\)$/g, ''); // (サウスヴィグラス)
                currentHorse.oddsInfo = lines[lineIndex + 4]; // 8.6 （2人気）
                currentHorse.birthday = lines[lineIndex + 5]; // 2018/4/8生
                currentHorse.owner = lines[lineIndex + 6]; // 増澤一明
                currentHorse.breeder = lines[lineIndex + 7]; // 田中春美生産
                currentHorse.sexAge = lines[lineIndex + 8]; // 牝8
                currentHorse.color = lines[lineIndex + 9]; // 鹿毛
                currentHorse.weight = lines[lineIndex + 10]; // 54.0
                currentHorse.jockey = lines[lineIndex + 11]; // 岡村健
                currentHorse.affiliation = lines[lineIndex + 12]; // （船　橋）
                currentHorse.winRate = lines[lineIndex + 13]; // 【7.4%】
                currentHorse.placeRate = lines[lineIndex + 14]; // 【30.9%】
                currentHorse.trainer = lines[lineIndex + 15]; // 平山真
                
                horses.push(currentHorse);
            }
            lineIndex += 15;
        } else {
            lineIndex++;
        }
    }
    
    return horses;
}

const data = parseRakutenText('test_input.txt');
console.log(JSON.stringify(data, null, 2));
