const text = `
1	7	12	サトノフェンサー2番人気
牡3 / 538kg(+2)
三浦皇成(57.0)  高柳瑞樹(美浦)
1:39.5 / 36.9
2	4	6	エターナルホープ7番人気
牡3 / 504kg(-12)
原優介(57.0)  鈴木慎太郎(美浦)
1:39.6 (３／４) / 36.7
`;

function parse(pasteText) {
    const lines = pasteText.split("\n").map(l => l.trim()).filter(Boolean);
    const parsed = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // JRA公式(スマホ・PC等)のコピー
        // 1行目: "1  7  12  サトノフェンサー2番人気" (タブ区切り)
        const jraMultiMatch = line.split(/\t|\s{2,}/);
        if (jraMultiMatch.length >= 4 && /^\d+$/.test(jraMultiMatch[0]) && /^\d+$/.test(jraMultiMatch[1]) && /^\d+$/.test(jraMultiMatch[2])) {
            const rank = parseInt(jraMultiMatch[0]);
            const horseNumber = parseInt(jraMultiMatch[2]);
            let horseName = jraMultiMatch[3] || "";
            
            // "サトノフェンサー2番人気" から "2番人気" を削除
            horseName = horseName.replace(/\d+番人気$/, "").trim();
            
            let time = "";
            
            // 3行先にタイムがあるか探す (4行構成)
            for (let j = i + 1; j < i + 5 && j < lines.length; j++) {
                const timeMatch = lines[j].match(/(\d+[:.]\d+[:.]\d+|\d+[:.]\d+)/);
                if (timeMatch && (lines[j].includes("/") || timeMatch[1].includes(":"))) {
                    time = timeMatch[1].replace(/:(\d+)$/, '.$1');
                    break;
                }
            }
            
            if (horseNumber > 0) {
                parsed.push({ rank, horseNumber, horseName, time, odds: 0, prize: 0 });
                // We should technically skip to the next horse but let's let the loop handle it
                // if we confidently matched 4 lines, we can i += 3
            }
        }
    }
    
    console.log(parsed);
}

parse(text);
