const fs = require('fs');

const rawText = fs.readFileSync('test_jra_result.txt', 'utf8');
const lines = rawText.split("\n").map(l => l.trim());

const horses = [];

let isResultSection = false;
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  if (l.includes("着順") && l.includes("馬名") && l.includes("タイム")) {
    isResultSection = true;
    continue;
  }
  if (isResultSection) {
    if (l === "タイム" || l.includes("ハロンタイム") || l === "払戻金") {
      break; // end of result section
    }

    // "1	枠7橙	14	ダノンプレサージュ	牝3	55.0	横山 典弘	1:36.5		2 2	36.4	488(+2)	大竹 正博	1"
    const parts = l.split(/\t+/);
    if (parts.length >= 8 && /^\d+$/.test(parts[0])) {
      const result = parseInt(parts[0]);
      let frameStr = parts[1];
      const frameMatch = frameStr.match(/枠(\d)/);
      const frame = frameMatch ? parseInt(frameMatch[1]) : 0;
      const number = parseInt(parts[2]);
      let name = parts[3];
      // ブリンカー着用が別行にある場合（13着マッドヘッドラブなど）の対応
      let genderAgeStr = parts[4];
      let kinryoStr = parts[5];
      let jockey = parts[6];
      let time = parts[7];
      let weightTrainerPop = parts.slice(8).join("\t");

      // もし name が空で、次の行に馬名があるパターンの場合
      if (!name) {
         // "13	枠8桃	15	"
         // "マッドヘッドラブブリンカー着用"
         // "牝3	55.0	武藤 雅	1:39.7	クビ	"
         name = lines[i+1].replace("ブリンカー着用", "").trim();
         const nextParts = lines[i+2].split(/\t+/);
         genderAgeStr = nextParts[0];
         kinryoStr = nextParts[1];
         jockey = nextParts[2];
         time = nextParts[3];
         // i += 2; or just let it continue but we need to handle weight
         // this multi-line logic needs to be more robust
      }
    }
  }
}
