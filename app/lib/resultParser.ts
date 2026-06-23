import { Horse, RaceResult } from "../types";

export function parseRaceResult(rawText: string, raceHorses: Horse[]): Partial<RaceResult> {
  const lines = rawText.split("\n").map(l => l.trim());

  const parsed: Partial<RaceResult> = {
    result: [],
    lapTimes: [],
    cornerPassings: [],
    refunds: {
      win: [], place: [], bracketQuinella: [], quinella: [], exacta: [], wide: [], trio: [], trifecta: []
    }
  };

  // Determine if this is JRA text
  const isJraText = rawText.includes("勝馬投票に的中された方がいない場合") || 
                    (rawText.includes("払戻金") && lines.some(l => /^\d+\s*[\t　]+\s*枠\d/.test(l)));

  const isRakutenFormat = rawText.includes("楽天競馬") || lines.some(l => /^(\d+)[\t\s]+(\d+)[\t\s]+(\d+)[\t\s]+(.+?)[\t\s]+([牡牝セン騙]\d+[\t\s]*\/[\t\s]*[^\t\s]+)[\t\s]+([\d\.]+)[\t\s]+(\d+)$/.test(l));

  if (isJraText) {
    parseJraFormat(lines, parsed, raceHorses);
  } else if (isRakutenFormat) {
    parseRakutenFormat(lines, parsed, raceHorses);
  } else {
    parseNarFormat(lines, parsed, raceHorses);
  }

  // Fallback to old format if no result found
  if (parsed.result && parsed.result.length === 0) {
    parseOldFormatFallback(lines, parsed);
  }

  return parsed;
}

function parseJraFormat(lines: string[], parsed: Partial<RaceResult>, raceHorses: Horse[]) {
  let blockStarts: number[] = [];
  let payoutStartIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^\d+\s*[\t　]+\s*枠\d/.test(l)) {
      blockStarts.push(i);
    }
    if (l === '払戻金') {
      payoutStartIndex = i;
    }
  }

  const resultsList = [];

  for (let bi = 0; bi < blockStarts.length; bi++) {
    const start = blockStarts[bi];
    const end = (bi < blockStarts.length - 1) ? blockStarts[bi+1] : start + 6;
    const blockLines = lines.slice(start, end).filter(l => l !== "");
    
    const combinedStr = blockLines.join("\t");
    const combined = combinedStr.split(/\t+/).map(s => s.trim()).filter(s => s !== "");
    
    if (combined.length >= 7) {
      let rank = parseInt(combined[0]);
      let number = parseInt(combined[2]);
      let name = combined[3].replace("ブリンカー着用", "").trim();
      let kinryo = parseFloat(combined[5]);
      let jockey = combined[6];
      let time = combined[7] || "";
      
      let horseWeight = 0;
      let horseWeightChange = 0;
      let trainer = "";
      let popularity = 0;
      let agari = "";
      let margin = "";

      for (let j = 7; j < combined.length; j++) {
        const field = combined[j];
        const wm = field.match(/^(\d{3})(?:\(([+-]?\d+|初出走)\))?$/);
        if (wm) {
          horseWeight = parseInt(wm[1]);
          if (wm[2]) horseWeightChange = wm[2] === "初出走" ? 0 : parseInt(wm[2]);
          if (j + 1 < combined.length) trainer = combined[j+1];
          if (j + 2 < combined.length) popularity = parseInt(combined[j+2].replace('人気', ''));
          if (j - 1 >= 8) agari = combined[j-1];
          break;
        }
      }

      let passing = "";
      if (combined[8] && combined[8].match(/^[0-9]+( [0-9]+)*$/)) {
         passing = combined[8]; // e.g. "2 2" or "10 10" or "2 2 2 2"
      }

      if (combined[8] && !combined[8].match(/^[0-9]+( [0-9]+)*$/)) {
        if (combined[8] !== agari && !combined[8].match(/^\d+\.\d+$/)) {
           margin = combined[8];
        }
      }

      // 賞金(万円)概算
      let prize = 0;
      if (rank === 1) prize = 2200;
      else if (rank === 2) prize = 880;
      else if (rank === 3) prize = 550;
      else if (rank === 4) prize = 330;
      else if (rank === 5) prize = 220;

      resultsList.push({
        rank, horseNumber: number, horseName: name, time, odds: 0, prize,
        popularity, weight: horseWeight, weightChange: horseWeightChange,
        jockey, jockeyWeight: kinryo, trainer, last3f: agari, margin, passing
      });
    }
  }

  parsed.result = resultsList;

  if (payoutStartIndex !== -1) {
    let currentType = "";
    for (let i = payoutStartIndex + 1; i < lines.length; i++) {
      const l = lines[i];
      if (l.includes("勝馬投票に的中された方がいない場合")) break;
      
      if (["単勝", "複勝", "枠連", "ワイド", "馬連", "馬単", "3連複", "3連単"].includes(l)) {
        currentType = l;
        continue;
      }
      
      const parts = l.split(/\t+/);
      if (parts.length >= 3 && currentType) {
        const combo = parts[0];
        const amount = parseInt(parts[1].replace(/円|,/g, ""));
        const pop = parseInt(parts[2].replace(/番人気/g, ""));

        const payoutObj = { horse: combo, combination: combo, bracket: combo, payout: amount, popularity: pop };

        if (!parsed.refunds) parsed.refunds = {};
        
        switch (currentType) {
          case "単勝":
            if (!parsed.refunds.win) parsed.refunds.win = [];
            parsed.refunds.win.push({ horse: combo, payout: amount, popularity: pop });
            break;
          case "複勝":
            if (!parsed.refunds.place) parsed.refunds.place = [];
            parsed.refunds.place.push({ horse: combo, payout: amount, popularity: pop });
            break;
          case "枠連":
            if (!parsed.refunds.bracketQuinella) parsed.refunds.bracketQuinella = [];
            parsed.refunds.bracketQuinella.push({ bracket: combo, payout: amount, popularity: pop });
            break;
          case "ワイド":
            if (!parsed.refunds.wide) parsed.refunds.wide = [];
            parsed.refunds.wide.push({ combination: combo, payout: amount, popularity: pop });
            break;
          case "馬連":
            if (!parsed.refunds.quinella) parsed.refunds.quinella = [];
            parsed.refunds.quinella.push({ combination: combo, payout: amount, popularity: pop });
            break;
          case "馬単":
            if (!parsed.refunds.exacta) parsed.refunds.exacta = [];
            parsed.refunds.exacta.push({ combination: combo, payout: amount, popularity: pop });
            break;
          case "3連複":
            if (!parsed.refunds.trio) parsed.refunds.trio = [];
            parsed.refunds.trio.push({ combination: combo, payout: amount, popularity: pop });
            break;
          case "3連単":
            if (!parsed.refunds.trifecta) parsed.refunds.trifecta = [];
            parsed.refunds.trifecta.push({ combination: combo, payout: amount, popularity: pop });
            break;
        }
      }
    }
  }

  extractAdditionalData(lines, parsed);
}

function parseNarFormat(lines: string[], parsed: Partial<RaceResult>, raceHorses: Horse[]) {
  const parsedMap = new Map<number, any>();
  let rankCounter = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    const parts1 = line.split("\t");
    const potentialRank = parseInt(parts1[0]);

    if (potentialRank === rankCounter && potentialRank >= 1 && potentialRank <= 20) {
      const rank = potentialRank;

      // i + 1: 馬番
      const line2 = lines[i + 1]?.trim() || "";
      const parts2 = line2.split("\t");
      const num = parseInt(parts2[0]) || 0;

      // i + 2: 馬名(所属)
      const line3 = lines[i + 2]?.trim() || "";
      let name = line3;
      let belonging = "";
      const belongM = line3.match(/^([^\(]+?)[\(（](.+?)[\)）]/);
      if (belongM) {
        name = belongM[1].trim();
        belonging = belongM[2].trim();
      }

      // i + 3: 騎手(負担重量)\t調教師
      const line4 = lines[i + 3]?.trim() || "";
      const parts4 = line4.split("\t");
      let jockey = "";
      let jockeyWeight = 54;
      const trainer = parts4[1] || "";
      
      const jm = parts4[0]?.match(/^([^\(]+?)\((\d+\.?\d*)\)/) || parts4[0]?.match(/^([^\(]+?)[\(（](.+?)[\)）]/);
      if (jm) {
        jockey = jm[1].trim().replace(/^[▲△☆◇]/, "");
        jockeyWeight = parseFloat(jm[2]) || 54;
      } else {
        jockey = parts4[0]?.trim() || "";
      }

      // i + 4: タイム(着差)\t推定上り
      const line5 = lines[i + 4]?.trim() || "";
      const parts5 = line5.split("\t");
      let time = "";
      let margin = "";
      const last3f = parts5[1]?.trim() || "";

      const timeM = parts5[0]?.match(/^([\d:]+)/);
      if (timeM) {
        time = timeM[1].replace(/:(\d)$/, ".$1");
      }
      const marginM = parts5[0]?.match(/[\(（](.+?)[\)）]/);
      if (marginM) {
        margin = marginM[1];
      }

      // i + 5: 単勝人気
      const line6 = lines[i + 5]?.trim() || "";
      const pop = parseInt(line6) || 0;

      const cleanName = name.replace(/^ブリンカー\s*/, "").trim();

      // 馬名あいまいマッチングによる馬番補填
      let finalNum = num;
      const matchedHorse = raceHorses.find(h => {
        const normalize = (s: string) => s.replace(/\s+/g, "").replace(/[\[\(\)\]（）]/g, "").replace(/マルガイ|マルチ|ブリンカー/g, "").replace(/[外地]/g, "");
        const n1 = normalize(h.name);
        const n2 = normalize(cleanName);
        return n1 === n2 || n1.includes(n2) || n2.includes(n1);
      });
      if (matchedHorse) {
        finalNum = matchedHorse.number;
      }

      let prize = 0;
      if (rank === 1) prize = 2200;
      else if (rank === 2) prize = 880;
      else if (rank === 3) prize = 550;
      else if (rank === 4) prize = 330;
      else if (rank === 5) prize = 220;

      // 通過順位の探索 (e.g. 1-1-1-2)
      let passing = "";
      for (let j = 0; j <= 6; j++) {
        const l = lines[i + j]?.trim() || "";
        const parts = l.split(/\s+|\t+/);
        for (const p of parts) {
           if (p.match(/^[0-9]+(-[0-9]+)+$/)) {
             passing = p;
           }
        }
      }

      parsedMap.set(rank, {
        rank, horseNumber: finalNum, horseName: cleanName, time, odds: 0, prize,
        popularity: pop, weight: 0, weightChange: 0, jockey, jockeyWeight, trainer, last3f, margin, belonging, passing
      });

      rankCounter++;
      i += 5; // ブロック分読み進める
    }
  }

  parsed.result = Array.from(parsedMap.values()).sort((a, b) => a.rank - b.rank);

  // Parse payouts for NAR logic if present
  extractNarPayouts(lines, parsed);
  extractAdditionalData(lines, parsed);
}

function parseOldFormatFallback(lines: string[], parsed: Partial<RaceResult>) {
  const parsedMap = new Map<number, any>();
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const parts = line.split(/[\t\s]+/);
    if (parts.length >= 3 && /^\d+$/.test(parts[0]) && /^\d+$/.test(parts[2])) {
      const r = parseInt(parts[0]);
      const num = parseInt(parts[2]);
      const hName = parts[3]?.replace(/\d+番人気$/, "") || "";
      if (r >= 1 && r <= 20) {
        parsedMap.set(r, { rank: r, horseNumber: num, horseName: hName, time: "", odds: 0, prize: 0 });
      }
    }
  }
  parsed.result = Array.from(parsedMap.values()).sort((a, b) => a.rank - b.rank);
}

function extractNarPayouts(lines: string[], parsed: Partial<RaceResult>) {
  let payoutStartIndex = lines.findIndex(l => l.includes("払戻金"));
  if (payoutStartIndex !== -1 && !parsed.refunds?.win?.length) {
     // TODO: NAR specific payout format extraction if needed.
     // The existing code didn't do much for NAR payouts, but we can reuse JRA's payout loop
     // if it follows a similar tab-separated format.
  }
}

function extractAdditionalData(lines: string[], parsed: Partial<RaceResult>) {
  const rawText = lines.join("\n");
  
  const lapMatch = rawText.match(/(?:ハロンタイム|ラップ)\s*[:：]?\s*([0-9.\s\-]+)/);
  if (lapMatch) {
    parsed.lapTimes = lapMatch[1].split("-").map(s => s.trim()).filter(Boolean);
  }

  const up4m = rawText.match(/4F\s*(\d{2}\.\d)/);
  if (up4m) parsed.last4fTime = up4m[1];
  const up3m = rawText.match(/3F\s*(\d{2}\.\d)/);
  if (up3m) parsed.last3fTime = up3m[1];

  const cornerLines: string[] = [];
  let inCornerSection = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("コーナー通過順位")) {
      inCornerSection = true;
      continue;
    }
    if (inCornerSection) {
      if (lines[i].includes("払戻金") || lines[i].startsWith("単勝")) break;
      if (lines[i] && (lines[i].includes("コーナー") || /^[1-4]\s*コーナー/.test(lines[i]) || /^[1-4]コーナー/.test(lines[i]))) {
        const cornerName = lines[i];
        const nextL = lines[i + 1]?.trim() || "";
        if (nextL && !nextL.includes("コーナー")) {
          cornerLines.push(`${cornerName}: ${nextL}`);
          i++;
        }
      }
    }
  }
  if (cornerLines.length > 0) parsed.cornerPassings = cornerLines;

  let incidentText = "";
  let inIncident = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("競走中の出来事等")) {
      inIncident = true;
      continue;
    }
    if (inIncident) {
      if (lines[i].match(/^[0-9]R/) || lines[i] === "1R" || lines[i].includes("開催選択へ") || lines[i].includes("払戻金")) break;
      if (lines[i]) incidentText += lines[i] + "\n";
    }
  }
  if (incidentText) parsed.incidents = incidentText.trim();
}

function parseRakutenFormat(lines: string[], parsed: Partial<RaceResult>, raceHorses: Horse[]) {
  const resultsList = [];
  
  for (let i = 0; i < lines.length; i++) {
    const l1 = lines[i];
    // Line 1 pattern: Rank Bracket HorseNum Name Sex/Age/Color Kinryo Weight
    const match1 = l1.match(/^(\d+)[\t\s]+(\d+)[\t\s]+(\d+)[\t\s]+(.+?)[\t\s]+([牡牝セン騙]\d+[\t\s]*\/[\t\s]*[^\t\s]+)[\t\s]+([\d\.]+)[\t\s]+(\d+)$/);
    if (!match1) continue;

    const l2 = lines[i+1] || "";
    const match2 = l2.match(/^([\+\-±]\d+|±0)[\t\s]+(.+)$/);
    const l3 = lines[i+2] || "";
    // Line 3 pattern: (Belonging) Time Margin Agari Trainer Popularity
    const match3 = l3.match(/^(\([^\)]+\))[\t\s]+([\d\.\:]+)[\t\s]*(.*?)[\t\s]+([\d\.]+)[\t\s]+([^\t\s]+)[\t\s]+(\d+)$/);

    if (match2 && match3) {
      let rank = parseInt(match1[1]);
      let number = parseInt(match1[3]);
      let name = match1[4].trim().replace(/^ブリンカー\s*/, "");
      let kinryo = parseFloat(match1[6]);
      let horseWeight = parseInt(match1[7]);
      
      let horseWeightChange = 0;
      if (match2[1] !== "±0") {
         horseWeightChange = parseInt(match2[1].replace("+", ""));
      }
      
      let jockey = match2[2].replace(/^[▲△☆◇]/, "").trim();
      
      let time = match3[2];
      let margin = match3[3].trim();
      let agari = match3[4];
      let trainer = match3[5];
      let popularity = parseInt(match3[6]) || 0;

      let prize = 0;
      if (rank === 1) prize = 2200;
      else if (rank === 2) prize = 880;
      else if (rank === 3) prize = 550;
      else if (rank === 4) prize = 330;
      else if (rank === 5) prize = 220;

      resultsList.push({
        rank, horseNumber: number, horseName: name, time, odds: 0, prize,
        popularity, weight: horseWeight, weightChange: horseWeightChange,
        jockey, jockeyWeight: kinryo, trainer, last3f: agari, margin, passing: ""
      });
      
      i += 2;
    }
  }
  parsed.result = resultsList;
  extractAdditionalData(lines, parsed);
}
