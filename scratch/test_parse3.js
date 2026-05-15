const fs = require('fs');

const pasteText = `レース結果 11レース
着順 枠 馬番 馬名 / 単勝人気
性齢 / 馬体重
騎手(負担重量) / 調教師
タイム(着差) / 推定上り
1 3 5 コンジェスタス6番人気
牡3 / 518kg(-6)
西村淳也(57.0)  高野友和(栗東)
2:09.9 / 35.3
2 8 15 ベレシート1番人気
牡3 / 480kg(-2)
北村友一(57.0)  斉藤崇史(栗東)
2:09.9 (クビ) / 35.5`;

const lines = pasteText.split("\n").map(l => l.trim());
const parsedMap = new Map();

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (!line) continue;

  let rank = 0, horseNumber = 0, horseName = "", time = "";

  if (line.includes("\t")) {
    const parts = line.split("\t");
    const r = parseInt(parts[0]);
    const n = parts.length >= 3 ? parseInt(parts[2]) : parseInt(parts[1]);
    if (r >= 1 && r <= 20 && n >= 1 && n <= 28) {
      rank = r;
      horseNumber = n;
      const rawName = parts.length >= 4 ? parts[3] : (parts[2] || "");
      horseName = rawName
        .replace(/\d+番人気$/, "")
        .replace(/ブリンカー|マルチ|着用/g, "")
        .trim();
    }
  }

  if (rank === 0) {
    const parts = line.split(/\s+/);
    if (parts.length >= 3 && /^\d+$/.test(parts[0]) && /^\d+$/.test(parts[1]) && /^\d+$/.test(parts[2])) {
      const r = parseInt(parts[0]);
      const ku = parseInt(parts[1]);
      const n = parseInt(parts[2]);
      if (r >= 1 && r <= 20 && ku >= 1 && ku <= 8 && n >= 1 && n <= 28) {
        rank = r;
        horseNumber = n;
        horseName = parts.slice(3).find(p => /[\u3040-\u9FFF\u30A0-\u30FF]/.test(p) || (p.length > 1 && !/^\d+$/.test(p))) || "";
        horseName = horseName.replace(/\d+番人気$/, "").replace(/ブリンカー|マルチ|着用/g, "").trim();
      }
    }
  }

  for (let j = i; j < Math.min(i + 6, lines.length); j++) {
    const tm = lines[j].match(/(\d+:\d+\.\d+|\d+:\d+:\d+)/);
    if (tm) {
      time = tm[1].replace(/(\d+:\d+):(\d+)$/, "$1.$2");
      break;
    }
  }

  if (rank >= 1 && rank <= 20 && (horseNumber > 0 || horseName) && !parsedMap.has(rank)) {
    parsedMap.set(rank, { rank, horseNumber, horseName, time });
  }
}

const parsed = Array.from(parsedMap.values()).sort((a, b) => a.rank - b.rank);
console.log(parsed);
