const text = `
レース結果 2レース
着順	枠	馬番	馬名 / 単勝人気
性齢 / 馬体重
騎手(負担重量) / 調教師
タイム(着差) / 推定上り
1	7	12	サトノフェンサー2番人気
牡3 / 538kg(+2)
三浦皇成(57.0)  高柳瑞樹(美浦)
1:39.5 / 36.9
2	4	6	エターナルホープ7番人気
牡3 / 504kg(-12)
原優介(57.0)  鈴木慎太郎(美浦)
1:39.6 (３／４) / 36.7
3	5	8	ピョイットハレルヤ8番人気
牝3 / 458kg(+2)
松若風馬(55.0)  浜田多実雄(栗東)
1:39.7 (クビ) / 37.4
`;

function parsePasteText() {
    const pasteText = text;
    const lines = pasteText.split("\n").map(l => l.trim()).filter(Boolean);
    const parsed = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes("着順") || line.includes("単勝") || line.startsWith("着") || line.includes("馬名(所属)")) continue;

      // 0. NAR公式の複数行コピー形式
      const narMultiMatch = line.match(/^(\d+)\s+(\d+)$/);
      if (narMultiMatch && i + 2 < lines.length && /^\d+$/.test(lines[i + 1])) {
        const rank = parseInt(narMultiMatch[1]);
        const horseNumber = parseInt(lines[i + 1]);
        const horseName = lines[i + 2] || "";
        let time = "";
        
        for (let j = i + 3; j < i + 8 && j < lines.length; j++) {
          const timeMatch = lines[j].match(/(\d+[:.]\d+[:.]\d+|\d+[:.]\d+)/);
          if (timeMatch && timeMatch[1].includes(":")) {
             time = timeMatch[1].replace(/:(\d+)$/, '.$1');
             break;
          }
        }
        
        parsed.push({ rank, horseNumber, horseName, time, odds: 0, prize: 0 });
        i += 4; // 処理した行をスキップ
        continue;
      }

      // 0.1 JRA公式・ネット競馬等の複数行コピー形式
      const jraMultiMatch = line.split(/\t|\s{2,}/);
      if (jraMultiMatch.length >= 4 && /^\d+$/.test(jraMultiMatch[0]) && /^\d+$/.test(jraMultiMatch[1]) && /^\d+$/.test(jraMultiMatch[2])) {
        const rank = parseInt(jraMultiMatch[0]);
        const horseNumber = parseInt(jraMultiMatch[2]);
        let horseName = jraMultiMatch[3] || "";
        horseName = horseName.replace(/\d+番人気$/, "").trim(); // "2番人気"等を削除
        
        let time = "";
        for (let j = i + 1; j < i + 5 && j < lines.length; j++) {
          const timeMatch = lines[j].match(/(\d+[:.]\d+[:.]\d+|\d+[:.]\d+)/);
          if (timeMatch && (lines[j].includes("/") || timeMatch[1].includes(":"))) {
             time = timeMatch[1].replace(/:(\d+)$/, '.$1');
             break;
          }
        }
        
        parsed.push({ rank, horseNumber, horseName, time, odds: 0, prize: 0 });
        i += 3; // 4行1セットとみなしてスキップ
        continue;
      }

      let rank = parsed.length + 1;
      let horseNumber = 0;
      let horseName = "";
      let searchStr = line;

      // 1. "1着 3番..." または "1着 枠3 3番..."
      const explicitMatch = line.match(/^(\d+)\s*[着位]\s*(?:枠\d+)?\s*(\d+)\s*番?\s+(.+)/);
      if (explicitMatch) {
        rank = parseInt(explicitMatch[1]);
        horseNumber = parseInt(explicitMatch[2]);
        searchStr = explicitMatch[3];
      } else {
        // 2. "1 2 4 エルムラント" (着順 枠番 馬番 馬名)
        const jraMatch = line.match(/^(\d+)\s+(\d+)\s+(\d+)\s+([^\s\d]+)/);
        if (jraMatch && parseInt(jraMatch[1]) < 20 && parseInt(jraMatch[2]) <= 8 && parseInt(jraMatch[3]) <= 18) {
          rank = parseInt(jraMatch[1]);
          horseNumber = parseInt(jraMatch[3]);
          searchStr = line.slice(jraMatch[0].length);
          horseName = jraMatch[4];
        } else {
          // 3. "1 4 エルムラント" (着順 馬番 馬名)
          const simpleMatch = line.match(/^(\d+)\s+(\d+)\s+([^\s\d]+)/);
          if (simpleMatch && parseInt(simpleMatch[1]) < 20 && parseInt(simpleMatch[2]) <= 18) {
            rank = parseInt(simpleMatch[1]);
            horseNumber = parseInt(simpleMatch[2]);
            searchStr = line.slice(simpleMatch[0].length);
            horseName = simpleMatch[3];
          } else {
            // 4. フォールバック: 馬番だけ抽出、着順は行順
            const numPattern = /(?:^|\s)(\d{1,2})\s*番?(?:\s|$)/g;
            const nums = [];
            let m;
            while ((m = numPattern.exec(line)) !== null) {
              const n = parseInt(m[1]);
              if (n >= 1 && n <= 18) nums.push(n);
            }
            if (nums && nums.length > 0) {
              if (nums.length >= 2 && nums[0] === rank) {
                horseNumber = nums[1];
              } else {
                horseNumber = nums[0];
              }
            }
          }
        }
      }

      if (!horseName) {
        const nameMatch = searchStr.match(/[\u3040-\u9FFF\u30A0-\u30FF\uFF00-\uFFEF]{2,}/);
        horseName = nameMatch ? nameMatch[0] : "";
      }

      // タイムを抽出 (1:33.3 や 1:33:3 に対応)
      const timeMatch = line.match(/(\d+[:.]\d+[:.]\d+|\d+[:.]\d+)/);
      const time = timeMatch ? timeMatch[1].replace(/:(\d+)$/, '.$1') : "";

      // オッズを抽出（数字.数字 + 倍）
      const oddsMatch = line.match(/(\d+\.?\d*)\s*倍/);
      const odds = oddsMatch ? parseFloat(oddsMatch[1]) : 0;

      // 賞金（万円）を抽出
      const prizeMatch = line.match(/(\d+[\d,]*)\s*万?円/);
      const prize = prizeMatch ? parseInt(prizeMatch[1].replace(",", "")) : 0;

      if (horseNumber > 0 || horseName) {
        parsed.push({ rank, horseNumber, horseName, time, odds, prize });
      }
    }
    
    console.log(parsed);
}
parsePasteText();
