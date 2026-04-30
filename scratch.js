const text = `
2026/4/29
園田 5R
かつみ　さゆり☆来場記念２ｎｄＣ３一 Ｃ３一 ４歳以上
1400m    10頭    発走12:45
天候：曇 馬場状態：稍重
出馬表成績払戻金映像
着
順	枠	馬
番	
馬名(所属)
騎手(負担重量)	調教師
タイム(着差)	推定上り
単勝
人気
1	8
10	
エポエポサン(兵庫)
吉村智(57.0)	吉見真
1:33:3 -	39.8
1
2	8
9	
リーデレ(兵庫)
山本咲(55.0)	藤川純
1:34:1 (５)	40.4
3
3	4
4	
コンジャンクション(兵庫)
杉浦健(57.0)	森澤友
1:34:6 (３)	40.7
5
`;

function parse(pasteText) {
    const lines = pasteText.split("\n").map(l => l.trim()).filter(Boolean);
    const parsed = [];
    
    // Check for NAR multi-line format
    // A block starts with "1 8" (rank frame), then "10" (number), then "name", etc.
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const matchRankFrame = line.match(/^(\d+)\s+(\d+)$/);
        
        if (matchRankFrame && i + 1 < lines.length && /^\d+$/.test(lines[i+1])) {
            const rank = parseInt(matchRankFrame[1]);
            const frame = parseInt(matchRankFrame[2]);
            const horseNumber = parseInt(lines[i+1]);
            const horseName = lines[i+2];
            
            // The time is usually 2 lines down from name
            // "吉村智(57.0)  吉見真"
            // "1:33:3 -      39.8"
            let time = "";
            let popularity = 0;
            for(let j = i + 3; j < i + 7 && j < lines.length; j++) {
                const timeMatch = lines[j].match(/(\d+[:.]\d+[:.]\d+|\d+[:.]\d+)/);
                if (timeMatch && timeMatch[1].includes(":")) {
                    time = timeMatch[1].replace(/:(\d+)$/, '.$1'); // "1:33:3" -> "1:33.3"
                }
                
                if (j === i + 5 && /^\d+$/.test(lines[j])) {
                    popularity = parseInt(lines[j]);
                }
            }
            
            parsed.push({ rank, horseNumber, horseName, time, odds: 0, prize: 0 });
            i += 5; // skip the block
        }
    }
    
    console.log(parsed);
}

parse(text);
