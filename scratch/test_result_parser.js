const fs = require('fs');

function parseRakutenKeibaResultText(rawText) {
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l !== '');
  
  const race = {
      date: "",
      venue: "",
      raceNumber: 0,
      distance: 0,
      surface: "ダート",
      condition: "良",
      raceName: ""
  };
  
  const result = {
      raceId: "",
      result: [],
      lapTimes: [],
      last4fTime: "",
      last3fTime: "",
      cornerPassings: []
  };

  for (let i = 0; i < Math.min(lines.length, 60); i++) {
      const line = lines[i];
      // e.g. "浦和競馬場 12R 競走成績"
      const vrMatch = line.match(/^(.+)競馬場\s+(\d+)R/);
      if (vrMatch && !race.venue) {
          race.venue = vrMatch[1];
          race.raceNumber = parseInt(vrMatch[2]);
      }
      
      // e.g. "2026年6月23日 第3回 浦和競馬 第2日"
      const dateMatch = line.match(/^(\d{4}年\d{1,2}月\d{1,2}日)/);
      if (dateMatch) {
          race.date = dateMatch[1].replace(/年|月/g, '-').replace('日', '');
      }
      
      // e.g. "ダ2,000m 天候：曇 ダ：稍重 発走時刻19:30"
      const distMatch = line.match(/^(ダ|芝)(\d{1,3}(?:,\d{3})?)m/);
      if (distMatch) {
          race.surface = distMatch[1] === "ダ" ? "ダート" : "芝";
          race.distance = parseInt(distMatch[2].replace(',', ''));
      }
      const condMatch = line.match(/(ダ|芝)：(良|稍重|重|不良)/);
      if (condMatch) {
          race.condition = condMatch[2];
      }
  }
  
  result.raceId = `${race.date}_${race.venue}_${race.raceNumber}`;
  
  let inResultBlock = false;
  let inTimeBlock = false;
  let inCornerBlock = false;
  
  for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line === "■全着順") {
          inResultBlock = true;
          // Skip header lines
          while (i + 1 < lines.length && !lines[i + 1].match(/^\d+\s+\d+\s+\d+/)) {
              i++;
          }
          continue;
      }
      if (line === "■タイム") {
          inResultBlock = false;
          inTimeBlock = true;
          continue;
      }
      if (line === "■コーナー通過順位") {
          inTimeBlock = false;
          inCornerBlock = true;
          continue;
      }
      if (line === "■払戻金") {
          inCornerBlock = false;
          break; // We don't parse refunds for now
      }
      
      if (inResultBlock) {
          // e.g. "1	7	10	カペラスター	牡7 /鹿毛	56.0	498"
          const rowMatch = line.match(/^(\d+)\s+(\d+)\s+(\d+)\s+(.+?)\s+([牡牝セセン]\d+\s*\/[^	\s]+)\s+([\d.]+)\s+(\d+)/);
          if (rowMatch) {
              const rank = parseInt(rowMatch[1]);
              const frame = parseInt(rowMatch[2]);
              const number = parseInt(rowMatch[3]);
              const name = rowMatch[4];
              const weight = parseInt(rowMatch[7]);
              
              // Next line: "+5	七夕裕"
              i++;
              const line2 = lines[i];
              let weightChange = 0;
              let jockey = "";
              if (line2) {
                  const pMatch = line2.match(/^([-+±]?\d+)\s+(.+)$/);
                  if (pMatch) {
                      weightChange = pMatch[1] === "±0" ? 0 : parseInt(pMatch[1]);
                      jockey = pMatch[2].trim();
                  }
              }
              
              // Next line: "(浦和)	2:14.1		39.9	工藤伸	3"
              // or: "(川崎)	2:14.7	３	40.5	古澤悟	2"
              i++;
              const line3 = lines[i];
              let time = "", margin = "", last3f = "", trainer = "", popularity = 0;
              if (line3) {
                  const parts = line3.split('\t').map(p => p.trim());
                  // [ '(浦和)', '2:14.1', '', '39.9', '工藤伸', '3' ]
                  if (parts.length >= 6) {
                      time = parts[1];
                      margin = parts[2];
                      last3f = parts[3];
                      trainer = parts[4];
                      popularity = parseInt(parts[5]);
                  } else {
                      // Fallback parsing if tabs are messed up
                      const m3 = line3.match(/\)\s+([\d:.]+)\s*(.*?)\s+([\d.]+)\s+(.+?)\s+(\d+)$/);
                      if (m3) {
                          time = m3[1]; margin = m3[2]; last3f = m3[3]; trainer = m3[4]; popularity = parseInt(m3[5]);
                      }
                  }
              }
              
              result.result.push({
                  rank,
                  horseNumber: number,
                  horseName: name,
                  time,
                  margin,
                  last3f,
                  trainer,
                  popularity,
                  weight,
                  weightChange,
                  jockey,
                  odds: 0, // not parsed here
                  prize: 0
              });
          }
      }
      
      if (inTimeBlock) {
          if (line.startsWith("ハロンタイム")) {
              const lapsStr = line.replace("ハロンタイム", "").trim();
              result.lapTimes = lapsStr.split('-').map(s => s.trim());
          }
          if (line.startsWith("上がり")) {
              const agariStr = line.replace("上がり", "").trim();
              const m4f = agariStr.match(/4F\s+([\d.]+)/);
              if (m4f) result.last4fTime = m4f[1];
              const m3f = agariStr.match(/3F\s+([\d.]+)/);
              if (m3f) result.last3fTime = m3f[1];
          }
      }
      
      if (inCornerBlock) {
          if (line.match(/^[１-４]角/)) {
              result.cornerPassings.push(line.trim());
          }
      }
  }
  
  return { race, result };
}

const res = parseRakutenKeibaResultText(fs.readFileSync('scratch/test_rakuten_result.txt', 'utf-8'));
console.log(JSON.stringify(res, null, 2));
