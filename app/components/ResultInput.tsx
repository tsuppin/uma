"use client";
import { useState } from "react";
import { Race, RaceResult } from "../types";
import { generateFormation } from "../lib/engine";

type ResultRow = { rank: number; horseNumber: number; horseName: string; time: string; odds: number; prize: number; belonging?: string; };

export default function ResultInput({ race, onSubmit, onCancel }: {
  race: Race;
  onSubmit: (result: RaceResult) => void;
  onCancel: () => void;
}) {
  const existing = race.result;
  const [pasteText, setPasteText] = useState("");
  const [parseError, setParseError] = useState("");
  const [results, setResults] = useState<ResultRow[]>(
    existing?.result || Array.from({ length: Math.min(3, race.horses.length) }, (_, i) => ({
      rank: i + 1, horseNumber: 0, horseName: "", time: "", odds: 0, prize: 0,
    }))
  );
  const [profit, setProfit] = useState(existing?.profit || 0);
  const [betAmount, setBetAmount] = useState(100);

  // 詳細な追加データ状態
  const [lapTimes, setLapTimes] = useState<string[]>(existing?.lapTimes || []);
  const [last4fTime, setLast4fTime] = useState(existing?.last4fTime || "");
  const [last3fTime, setLast3fTime] = useState(existing?.last3fTime || "");
  const [cornerPassings, setCornerPassings] = useState<string[]>(existing?.cornerPassings || []);
  const [incidents, setIncidents] = useState(existing?.incidents || "");
  const [winnerProfile, setWinnerProfile] = useState<RaceResult["winnerProfile"] | undefined>(existing?.winnerProfile);
  const [refunds, setRefunds] = useState<RaceResult["refunds"] | undefined>(existing?.refunds);

  // ==========================================
  // テキスト貼り付けパーサー
  // ==========================================
  const parsePasteText = () => {
    setParseError("");
    const lines = pasteText.split("\n").map(l => l.trim());
    const parsedMap = new Map<number, ResultRow & {
      popularity?: number;
      weight?: number;
      weightChange?: number;
      jockey?: string;
      jockeyWeight?: number;
      trainer?: string;
      last3f?: string;
      margin?: string;
    }>();

    // 1. レース推移・分析・基本データの抽出
    // ハロンタイム
    const lapMatch = pasteText.match(/(?:ハロンタイム|ラップ)\s*[:：]?\s*([0-9.\s\-]+)/);
    if (lapMatch) {
      const laps = lapMatch[1].split("-").map(s => s.trim()).filter(Boolean);
      setLapTimes(laps);
    }

    // 上がりタイム
    const up4m = pasteText.match(/4F\s*(\d{2}\.\d)/);
    if (up4m) setLast4fTime(up4m[1]);
    const up3m = pasteText.match(/3F\s*(\d{2}\.\d)/);
    if (up3m) setLast3fTime(up3m[1]);

    // コーナー通過順位
    const cornerLines: string[] = [];
    let inCornerSection = false;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("コーナー通過順位")) {
        inCornerSection = true;
        continue;
      }
      if (inCornerSection) {
        if (lines[i].includes("払戻金") || lines[i].includes("払戻金") || lines[i].startsWith("単勝")) {
          break;
        }
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
    if (cornerLines.length > 0) setCornerPassings(cornerLines);

    // 競走中の出来事等
    let incidentText = "";
    let inIncident = false;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("競走中の出来事等")) {
        inIncident = true;
        continue;
      }
      if (inIncident) {
        if (lines[i].match(/^[0-9]R/) || lines[i] === "1R" || lines[i].includes("開催選択へ") || lines[i].includes("払戻金")) {
          break;
        }
        if (lines[i]) {
          incidentText += (incidentText ? " " : "") + lines[i];
        }
      }
    }
    if (incidentText) setIncidents(incidentText);

    // 勝馬紹介
    let winnerName = "";
    let birthDate = "";
    let sire = "";
    let dam = "";
    let owner = "";
    let breeder = "";
    let inWinner = false;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("勝馬の紹介")) {
        inWinner = true;
        continue;
      }
      if (inWinner) {
        if (lines[i].includes("出来事") || lines[i].includes("1R") || lines[i].includes("R")) {
          // 他のセクションへ
        }
        const l = lines[i];
        // テスティモーネ 2022年3月1日生牡4
        const infoM = l.match(/^([^\s]+?)\s*(\d{4}年\d{1,2}月\d{1,2}日生)/);
        if (infoM) {
          winnerName = infoM[1];
          birthDate = infoM[2];
        }
        if (l === "父：" || l === "父:") { sire = lines[i + 1] || ""; }
        if (l === "母：" || l === "母:") { dam = lines[i + 1] || ""; }
        if (l === "馬主：" || l === "馬主:") { owner = lines[i + 1] || ""; }
        if (l === "生産牧場：" || l === "生産牧場:") { breeder = lines[i + 1] || ""; }
      }
    }
    if (winnerName) {
      setWinnerProfile({ horseName: winnerName, birthDate, sire, dam, owner, breeder });
    }

    // 払戻金
    const parsedRefunds: RaceResult["refunds"] = {};
    let inRefunds = false;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i] === "払戻金" || lines[i] === "払戻金データ") {
        inRefunds = true;
        continue;
      }
      if (inRefunds) {
        if (lines[i].includes("出来事") || lines[i].includes("紹介")) {
          // セクション終了
        }
        const l = lines[i];
        const rp = l.split(/[\t\s]+/);
        if (rp.length >= 4) {
          const type = rp[0];
          const comb = rp[1];
          const val = parseInt(rp[2].replace(/,/g, "").replace("円", "")) || 0;
          const pop = parseInt(rp[3].replace("番人気", "")) || 0;

          if (type.includes("単勝")) {
            parsedRefunds.win = [{ horse: comb, payout: val, popularity: pop }];
          } else if (type.includes("複勝")) {
            if (!parsedRefunds.place) parsedRefunds.place = [];
            parsedRefunds.place.push({ horse: comb, payout: val, popularity: pop });
          } else if (type.includes("枠連")) {
            parsedRefunds.bracketQuinella = [{ bracket: comb, payout: val, popularity: pop }];
          } else if (type.includes("馬連")) {
            parsedRefunds.quinella = [{ combination: comb, payout: val, popularity: pop }];
          } else if (type.includes("馬単")) {
            parsedRefunds.exacta = [{ combination: comb, payout: val, popularity: pop }];
          } else if (type.includes("ワイド")) {
            if (!parsedRefunds.wide) parsedRefunds.wide = [];
            parsedRefunds.wide.push({ combination: comb, payout: val, popularity: pop });
          } else if (type.includes("3連複") || type.includes("三連複")) {
            parsedRefunds.trio = [{ combination: comb, payout: val, popularity: pop }];
          } else if (type.includes("3連単") || type.includes("三連単")) {
            parsedRefunds.trifecta = [{ combination: comb, payout: val, popularity: pop }];
          }
        }
      }
    }
    if (Object.keys(parsedRefunds).length > 0) setRefunds(parsedRefunds);

    // 2. 入線結果データの複数行ステートパース
    const isNarResult = pasteText.includes("NAR") || pasteText.includes("馬名(所属)") || pasteText.includes("Copyright");

    if (isNarResult) {
      // --- 地方競馬 (NAR) 専用パーサー ---
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
          const matchedHorse = race.horses.find(h => {
            const normalize = (s: string) => s
              .replace(/\s+/g, "")
              .replace(/[\[\(\)\]（）]/g, "")
              .replace(/マルガイ|マルチ|ブリンカー/g, "")
              .replace(/[外地]/g, "");
            
            const n1 = normalize(h.name);
            const n2 = normalize(cleanName);
            return n1 === n2 || n1.includes(n2) || n2.includes(n1);
          });
          if (matchedHorse) {
            finalNum = matchedHorse.number;
          }

          parsedMap.set(rank, {
            rank,
            horseNumber: finalNum,
            horseName: cleanName,
            time,
            odds: 0,
            prize: 0,
            popularity: pop,
            weight: 0,
            weightChange: 0,
            jockey,
            jockeyWeight,
            trainer,
            last3f,
            margin,
            belonging
          } as RaceResult["result"][number]);

          rankCounter++;
          i += 5; // ブロック分読み進める
        }
      }
    } else {
      // --- 中央競馬 (JRA) 専用パーサー ---
      let i = 0;
      while (i < lines.length) {
        const line = lines[i]?.trim();
        if (!line) { i++; continue; }

        if ((line === "払戻金" || line === "コーナー通過順位" || line.startsWith("タイム") || line.startsWith("勝馬の紹介")) && parsedMap.size > 3) break;

        let isMatch = false;
        let rank = 0, num = 0, name = "", pop = 0;
        let linesConsumed = 1;

        // 1. 完全行のキャプチャ (例: "1\t3\t5\tコンジェスタス6番人気" や "1着 2枠 3番 馬名")
        const fullMatch = line.match(/^(\d+)[^\d\s\t]*[\t\s]+(\d+)[^\d\s\t]*[\t\s]+(\d+)[^\d\s\t]*[\t\s]+(.+)/);
        // 2. 改行分割行のキャプチャ (例: "1\t8\t16") - trailing space/tab is allowed
        const splitMatch = line.match(/^(\d+)[^\d\s\t]*[\t\s]+(\d+)[^\d\s\t]*[\t\s]+(\d+)[^\d\s\t]*[\t\s]*$/);
        // 3. 縦並びのキャプチャ (例: "1\n8\n16\n馬名")
        const multilineMatch = i < lines.length - 3 && /^\d+[^\d\s\t]*$/.test(line) && /^\d+[^\d\s\t]*$/.test(lines[i+1].trim()) && /^\d+[^\d\s\t]*$/.test(lines[i+2].trim());

        if (fullMatch) {
          rank = parseInt(fullMatch[1]);
          num = parseInt(fullMatch[3]);
          const namePart = fullMatch[4].trim();
          const popM = namePart.match(/(.+?)(\d+)番人気/);
          name = popM ? popM[1].trim() : namePart;
          pop = popM ? parseInt(popM[2]) : 0;
          isMatch = true;
        } else if (splitMatch) {
          rank = parseInt(splitMatch[1]);
          num = parseInt(splitMatch[3]);

          let nextIdx = i + 1;
          while (nextIdx < lines.length && !lines[nextIdx]?.trim()) {
            nextIdx++;
          }
          const nextLine = lines[nextIdx]?.trim() || "";
          
          const cleanNext = nextLine.replace(/^(ブリンカー)[\t\s]*/, "").trim();
          const popM = cleanNext.match(/(.+?)(\d+)番人気/);
          name = popM ? popM[1].trim() : cleanNext;
          pop = popM ? parseInt(popM[2]) : 0;

          isMatch = true;
          linesConsumed = (nextIdx - i) + 1; // 馬名行まで消費
        } else if (multilineMatch) {
          rank = parseInt(line.match(/^(\d+)/)?.[1] || "0");
          num = parseInt(lines[i+2].match(/^(\d+)/)?.[1] || "0");

          let nextIdx = i + 3;
          while (nextIdx < lines.length && !lines[nextIdx]?.trim()) {
            nextIdx++;
          }
          const nextLine = lines[nextIdx]?.trim() || "";
          
          const cleanNext = nextLine.replace(/^(ブリンカー)[\t\s]*/, "").trim();
          const popM = cleanNext.match(/(.+?)(\d+)番人気/);
          name = popM ? popM[1].trim() : cleanNext;
          pop = popM ? parseInt(popM[2]) : 0;

          isMatch = true;
          linesConsumed = (nextIdx - i) + 1;
        }

        if (isMatch && rank >= 1 && rank <= 20) {
          let baseIdx = i + linesConsumed;

          while (baseIdx < lines.length && !lines[baseIdx]?.trim()) baseIdx++;
          // line2: 性齢 / 馬体重 (例: "牝4 / 444kg(+2)")
          const line2 = lines[baseIdx]?.trim() || "";
          let weight = 480, weightChange = 0;
          if (line2.includes("/")) {
            const lp = line2.split("/");
            const wPart = lp[1]?.trim() || "";
            const wm = wPart.match(/(\d+)kg/);
            if (wm) weight = parseInt(wm[1]);
            const wcm = wPart.match(/\(([+-]?\d+)\)/) || wPart.match(/\((初出走)\)/) || wPart.match(/\(±?(\d+)\)/);
            if (wcm) {
              weightChange = wcm[1] === "初出走" ? 0 : parseInt(wcm[1]) || 0;
            }
            baseIdx++;
            while (baseIdx < lines.length && !lines[baseIdx]?.trim()) baseIdx++;
          }

          // line3: 騎手(負担重量)  調教師 (例: "嶋田純次(56.0)  佐藤吉勝(美浦)")
          const line3 = lines[baseIdx]?.trim() || "";
          let jockey = "", jockeyWeight = 54, trainer = "";
          if (line3.includes("(")) {
            const jm = line3.match(/^([^\(]+?)\((\d+\.?\d*)\)/);
            if (jm) {
              jockey = jm[1].trim().replace(/^[▲△☆◇]/, "");
              jockeyWeight = parseFloat(jm[2]);
            }
            const trM = line3.match(/\)\s+([^\s\(]+?[\(（][栗美][東浦][\)）])/);
            if (trM) trainer = trM[1].trim();
            else {
              const parts = line3.split(/\s+/);
              trainer = parts[parts.length - 1] || "";
            }
            baseIdx++;
            while (baseIdx < lines.length && !lines[baseIdx]?.trim()) baseIdx++;
          }

          // line4: タイム(着差) / 推定上り (例: "0:56.7 / 33.3" または "0:56.7 (クビ) / 33.8")
          const line4 = lines[baseIdx]?.trim() || "";
          let time = "", margin = "", last3f = "";
          if (line4.includes("/")) {
            const lp4 = line4.split("/");
            const timePart = lp4[0].trim();
            const lastPart = lp4[1]?.trim() || "";

            const tm = timePart.match(/(\d+:\d+\.\d+|\d+\.\d+)/);
            if (tm) time = tm[1];
            const mm = timePart.match(/\((.+?)\)/);
            if (mm) margin = mm[1];

            const lm = lastPart.match(/(\d{2}\.\d)/);
            if (lm) last3f = lm[1];
            baseIdx++;
            while (baseIdx < lines.length && !lines[baseIdx]?.trim()) baseIdx++;
          }

          const cleanName = name.replace(/^ブリンカー\s*/, "").trim();

          // 馬名あいまいマッチングによる馬番補填
          let finalNum = num;
          const matchedHorse = race.horses.find(h => {
            const normalize = (s: string) => s
              .replace(/\s+/g, "")
              .replace(/[\[\(\)\]（）]/g, "")
              .replace(/マルガイ|マルチ|ブリンカー/g, "")
              .replace(/[外地]/g, "");
            
            const n1 = normalize(h.name);
            const n2 = normalize(cleanName);
            return n1 === n2 || n1.includes(n2) || n2.includes(n1);
          });
          if (matchedHorse) {
            finalNum = matchedHorse.number;
          }

          parsedMap.set(rank, {
            rank,
            horseNumber: finalNum,
            horseName: cleanName,
            time,
            odds: 0,
            prize: 0,
            popularity: pop,
            weight,
            weightChange,
            jockey,
            jockeyWeight,
            trainer,
            last3f,
            margin
          });

          // 消費した情報行のインデックス分進める
          i = baseIdx - 1;
        }

        i++;
      }
    }

    // 古いフォールバックパーサーも、もし上記で1頭も取れなかった場合に発動
    if (parsedMap.size === 0) {
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
    }

    const parsed = Array.from(parsedMap.values()).sort((a, b) => a.rank - b.rank);

    if (parsed.length === 0) {
      setParseError("着順を解析できませんでした。テキストデータのフォーマットを確認してください。");
      return;
    }

    // 賞金設定ロジック
    const calculated = parsed.map(p => {
      // 本賞金(万円):2200、880、550、330、220 を自動マッピング
      let pr = 0;
      if (p.rank === 1) pr = 2200;
      else if (p.rank === 2) pr = 880;
      else if (p.rank === 3) pr = 550;
      else if (p.rank === 4) pr = 330;
      else if (p.rank === 5) pr = 220;
      return { ...p, prize: pr };
    });

    // 的中払戻金の自動計算（初期betAmount = 100円ベース）
    if (race.predictions && calculated.length >= 2) {
      const r1 = calculated[0]?.horseNumber || 0;
      const r2 = calculated[1]?.horseNumber || 0;
      const r3 = calculated[2]?.horseNumber || 0;

      const predictions = race.predictions;
      const formWin = generateFormation(predictions, 'win', race);
      const formWide = generateFormation(predictions, 'wide', race);
      const formTrio = generateFormation(predictions, 'trifecta', race);
      const formTrifecta = generateFormation(predictions, 'trifecta_exact', race);
      const formQuinella = generateFormation(predictions, 'quinella', race);
      const formExacta = generateFormation(predictions, 'exacta', race);

      const resWin = [r1].filter(Boolean);
      const hitWin = formWin && r1 ? formWin.tickets.filter(t => t[0] === r1) : [];

      const resWideMatches: number[][] = [];
      if (r1 && r2) resWideMatches.push([r1, r2].sort((a,b)=>a-b));
      if (r1 && r3) resWideMatches.push([r1, r3].sort((a,b)=>a-b));
      if (r2 && r3) resWideMatches.push([r2, r3].sort((a,b)=>a-b));
      const hitWide = formWide ? formWide.tickets.filter(t => {
        const sortedT = [...t].sort((a,b)=>a-b);
        return resWideMatches.some(match => match[0] === sortedT[0] && match[1] === sortedT[1]);
      }) : [];

      const resTrio = [r1, r2, r3].filter(Boolean).sort((a,b)=>a-b);
      const hitTrio = resTrio.length === 3 ? formTrio.tickets.filter(t => [...t].sort((a,b)=>a-b).every((n,i)=>n===resTrio[i])) : [];

      const resTrifecta = [r1, r2, r3].filter(Boolean);
      const hitTrifecta = resTrifecta.length === 3 ? formTrifecta.tickets.filter(t => t.every((n,i)=>n===resTrifecta[i])) : [];

      const resQuinella = [r1, r2].filter(Boolean).sort((a,b)=>a-b);
      const hitQuinella = resQuinella.length === 2 ? formQuinella.tickets.filter(t => [...t].sort((a,b)=>a-b).every((n,i)=>n===resQuinella[i])) : [];

      const resExacta = [r1, r2].filter(Boolean);
      const hitExacta = resExacta.length === 2 ? formExacta.tickets.filter(t => t.every((n,i)=>n===resExacta[i])) : [];

      let totalProfit = 0;
      const betMultiplier = betAmount / 100;

      if (hitWin.length > 0) {
        const payout = parsedRefunds.win?.[0]?.payout || 0;
        totalProfit += hitWin.length * payout * betMultiplier;
      }
      if (hitWide.length > 0) {
        // ワイドは複数の的中の可能性があるため、すべての的中チケットに対して払い戻しを加算
        hitWide.forEach(t => {
          // 実際の払戻データから、このチケット(2頭の組み合わせ)に一致する払戻を探す
          const sortedT = [...t].sort((a,b)=>a-b);
          const refund = parsedRefunds.wide?.find(rw => {
            const matchNums = rw.combination?.split(/[\-\s]+/).map(n => parseInt(n)).sort((a,b)=>a-b) || [];
            return matchNums[0] === sortedT[0] && matchNums[1] === sortedT[1];
          });
          const payout = refund?.payout || (parsedRefunds.wide?.[0]?.payout || 0); // マッチしない場合は1つ目の払戻を使用
          totalProfit += payout * betMultiplier;
        });
      }
      if (hitTrio.length > 0) {
        const payout = parsedRefunds.trio?.[0]?.payout || 0;
        totalProfit += hitTrio.length * payout * betMultiplier;
      }
      if (hitTrifecta.length > 0) {
        const payout = parsedRefunds.trifecta?.[0]?.payout || 0;
        totalProfit += hitTrifecta.length * payout * betMultiplier;
      }
      if (hitQuinella.length > 0) {
        const payout = parsedRefunds.quinella?.[0]?.payout || 0;
        totalProfit += hitQuinella.length * payout * betMultiplier;
      }
      if (hitExacta.length > 0) {
        const payout = parsedRefunds.exacta?.[0]?.payout || 0;
        totalProfit += hitExacta.length * payout * betMultiplier;
      }

      setProfit(totalProfit);
    }

    setResults(calculated);
  };

  const updateResult = (idx: number, field: string, value: unknown) => {
    setResults(prev => prev.map((r, i) => {
      if (i !== idx) return r;
      const updated = { ...r, [field]: value };
      if (field === "horseNumber") {
        const h = race.horses.find(h => h.number === value);
        if (h) updated.horseName = h.name;
      }
      return updated;
    }));
  };

  const addRow = () => {
    setResults(prev => [...prev, { rank: prev.length + 1, horseNumber: 0, horseName: "", time: "", odds: 0, prize: 0 }]);
  };

  const removeRow = (idx: number) => {
    setResults(prev => prev.filter((_, i) => i !== idx).map((r, i) => ({ ...r, rank: i + 1 })));
  };

  // 各券種の的中判定
  const predictions = race.predictions || [];
  const formWin = predictions.length > 0 ? generateFormation(predictions, 'win', race) : null;
  const formWide = predictions.length > 0 ? generateFormation(predictions, 'wide', race) : null;
  const formTrio = predictions.length > 0 ? generateFormation(predictions, 'trifecta', race) : null;
  const formTrifecta = predictions.length > 0 ? generateFormation(predictions, 'trifecta_exact', race) : null;
  const formQuinella = predictions.length > 0 ? generateFormation(predictions, 'quinella', race) : null;
  const formExacta = predictions.length > 0 ? generateFormation(predictions, 'exacta', race) : null;

  const r1 = results[0]?.horseNumber || 0;
  const r2 = results[1]?.horseNumber || 0;
  const r3 = results[2]?.horseNumber || 0;

  const resWin = [r1].filter(Boolean);
  const hitWin = formWin && r1 ? formWin.tickets.filter(t => t[0] === r1) : [];

  const resWideMatches: number[][] = [];
  if (r1 && r2) resWideMatches.push([r1, r2].sort((a,b)=>a-b));
  if (r1 && r3) resWideMatches.push([r1, r3].sort((a,b)=>a-b));
  if (r2 && r3) resWideMatches.push([r2, r3].sort((a,b)=>a-b));
  
  const hitWide = formWide ? formWide.tickets.filter(t => {
    const sortedT = [...t].sort((a,b)=>a-b);
    return resWideMatches.some(match => match[0] === sortedT[0] && match[1] === sortedT[1]);
  }) : [];

  const resTrio = [r1, r2, r3].filter(Boolean).sort((a,b)=>a-b);
  const hitTrio = formTrio && resTrio.length === 3 ? formTrio.tickets.filter(t => [...t].sort((a,b)=>a-b).every((n,i)=>n===resTrio[i])) : [];

  const resTrifecta = [r1, r2, r3].filter(Boolean);
  const hitTrifecta = formTrifecta && resTrifecta.length === 3 ? formTrifecta.tickets.filter(t => t.every((n,i)=>n===resTrifecta[i])) : [];

  const resQuinella = [r1, r2].filter(Boolean).sort((a,b)=>a-b);
  const hitQuinella = formQuinella && resQuinella.length === 2 ? formQuinella.tickets.filter(t => [...t].sort((a,b)=>a-b).every((n,i)=>n===resQuinella[i])) : [];

  const resExacta = [r1, r2].filter(Boolean);
  const hitExacta = formExacta && resExacta.length === 2 ? formExacta.tickets.filter(t => t.every((n,i)=>n===resExacta[i])) : [];

  const hits = {
    win: hitWin.length > 0,
    wide: hitWide.length > 0,
    trio: hitTrio.length > 0,
    trifecta: hitTrifecta.length > 0,
    quinella: hitQuinella.length > 0,
    exacta: hitExacta.length > 0,
  };

  const hitTicketsMap = {
    win: hitWin,
    wide: hitWide,
    trio: hitTrio,
    trifecta: hitTrifecta,
    quinella: hitQuinella,
    exacta: hitExacta,
  };

  const hitTickets = hitTrio; // 後方互換用

  const handleSubmit = () => {
    if (results[0]?.horseNumber === 0) { alert("1着馬番を入力してください"); return; }
    onSubmit({
      raceId: race.id,
      result: results.filter(r => r.horseNumber > 0),
      lapTimes: lapTimes.length > 0 ? lapTimes : undefined,
      last4fTime: last4fTime || undefined,
      last3fTime: last3fTime || undefined,
      cornerPassings: cornerPassings.length > 0 ? cornerPassings : undefined,
      refunds: refunds || undefined,
      winnerProfile: winnerProfile || undefined,
      incidents: incidents || undefined,
      hitTickets,
      hits,
      hitTicketsMap,
      profit,
      learningApplied: false,
    });
  };

  return (
    <div className="fade-in">
      <div className="section-header">
        <h2 className="section-title">✅ 結果入力</h2>
        <div className="flex gap-8">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>キャンセル</button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit}>💾 確定・自学習開始</button>
        </div>
      </div>

      <div className="fs-sm text-muted mb-12">
        {race.venue} {race.raceNumber}R {race.raceName} / {race.surface} {race.distance}m
      </div>

      {/* 📋 テキスト貼り付け・解析エリア */}
      <div className="card fade-in">
        <div className="card-header">
          <div className="card-title">📋 レース結果テキスト貼り付け</div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="result-paste">結果テキスト</label>
          <textarea
            id="result-paste"
            className="form-textarea min-h-180 mono fs-sm"
            value={pasteText}
            onChange={e => { setPasteText(e.target.value); setParseError(""); }}
            placeholder={`例:\n1着 3番 クラウンヴィラン 1:14.2\n2着 8番 バイアーナ 1:14.5\n3着 12番 シナモンデイジー 1:14.8\n\n（JRA・地方競馬の結果テキストをそのまま貼付けもOK）`}
            maxLength={5000}
          />
          <div className="fs-xs text-muted mt-4 text-right">
            {pasteText.length} / 5000文字
          </div>
        </div>

        {parseError && (
          <div className="alert alert-warning">
            ⚠️ {parseError}
          </div>
        )}

        <div className="flex gap-8">
          <button
            type="button"
            className="btn btn-primary"
            onClick={parsePasteText}
            disabled={!pasteText.trim()}
            style={{ opacity: pasteText.trim() ? 1 : 0.5 }}
          >
            🔍 テキストを解析
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => setPasteText("")}>
            クリア
          </button>
        </div>

      </div>

      {/* ✏️ 手動入力・詳細エリア */}
      <div className="card fade-in mt-16">
        <div className="card-header">
          <div className="card-title">✏️ 着順・詳細入力</div>
        </div>
        <table className="horse-table">
            <thead>
              <tr>
                <th>着順</th><th>馬番</th><th>馬名</th>
                <th>走破タイム</th><th>単勝オッズ</th><th>賞金(万円)</th><th></th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i}>
                  <td>
                    <span className={`rank-badge rank-${i < 3 ? i + 1 : "other"}`}>{r.rank}着</span>
                  </td>
                  <td>
                    <select
                      className="form-select w-90"
                      value={r.horseNumber}
                      aria-label={`${r.rank}着 馬番選択`}
                      onChange={e => updateResult(i, "horseNumber", +e.target.value)}
                    >
                      <option value={0}>—</option>
                      {race.horses.map(h => (
                        <option key={h.id} value={h.number}>{h.number}番</option>
                      ))}
                      {r.horseNumber > 0 && !race.horses.some(h => h.number === r.horseNumber) && (
                        <option value={r.horseNumber}>{r.horseNumber}番 (未登録)</option>
                      )}
                    </select>
                  </td>
                  <td className={r.horseName ? "fw-600" : ""}>
                    {r.horseName || (r.horseNumber ? race.horses.find(h => h.number === r.horseNumber)?.name || "—" : "—")}
                    {r.belonging && (
                      <span className="fs-xs text-muted block">({r.belonging})</span>
                    )}
                  </td>
                  <td>
                    <input className="form-input w-100" value={r.time}
                      onChange={e => updateResult(i, "time", e.target.value)} placeholder="1:14.2" aria-label={`${r.rank}着 タイム`} />
                  </td>
                  <td>
                    <input type="number" className="form-input w-80" step={0.1}
                      value={r.odds || ""} onChange={e => updateResult(i, "odds", +e.target.value)} placeholder="倍" aria-label={`${r.rank}着 オッズ`} />
                  </td>
                  <td>
                    <input type="number" className="form-input w-100"
                      value={r.prize || ""} onChange={e => updateResult(i, "prize", +e.target.value)} placeholder="万円" aria-label={`${r.rank}着 賞金`} />
                  </td>
                  <td>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => removeRow(i)} aria-label={`${r.rank}着 削除`}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" className="btn btn-secondary btn-sm mt-8" onClick={addRow}>
            ＋ 着順追加
          </button>
        </div>

      {/* 📊 レース分析・詳細情報プレビュー */}
      {(lapTimes.length > 0 || last3fTime || cornerPassings.length > 0 || incidents || winnerProfile) && (
        <div className="card fade-in mt-16">
          <div className="card-header">
            <div className="card-title">📊 解析されたレース分析・詳細情報</div>
          </div>
          <div className="p-16 flex flex-col gap-16">
            
            {/* ラップタイム & 上がり */}
            {lapTimes.length > 0 && (
              <div className="border-b pb-12">
                <div className="fw-600 fs-sm mb-6 text-gold">⏱️ ハロンタイム（ラップ）</div>
                <div className="flex gap-6 items-center flex-wrap">
                  {lapTimes.map((lap, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      {idx > 0 && <span className="text-muted">→</span>}
                      <span className="bg-surface border p-4-8 rounded-4 fs-xs mono fw-600">
                        {lap}
                      </span>
                    </div>
                  ))}
                </div>
                {(last4fTime || last3fTime) && (
                  <div className="flex gap-12 mt-8 fs-xs text-muted">
                    {last4fTime && <span>上がり4F: <strong className="text-secondary">{last4fTime}秒</strong></span>}
                    {last3fTime && <span>上がり3F: <strong className="text-green">{last3fTime}秒</strong></span>}
                  </div>
                )}
              </div>
            )}

            {/* コーナー通過順位 */}
            {cornerPassings.length > 0 && (
              <div className="border-b pb-12">
                <div className="fw-600 fs-sm mb-6 text-gold">🔄 コーナー通過順位</div>
                <div className="flex flex-col gap-4 text-sm mono">
                  {cornerPassings.map((cp, idx) => (
                    <div key={idx} className="bg-surface p-6-10 rounded-4 border-l-4 border-gold">
                      {cp}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 勝馬紹介 */}
            {winnerProfile && (
              <div className="border-b pb-12">
                <div className="fw-600 fs-sm mb-6 text-gold">🏆 勝ち馬プロフィール</div>
                <div className="bg-surface p-12 rounded-8 border grid-2 gap-12 text-sm">
                  <div><strong>馬名:</strong> {winnerProfile.horseName} ({winnerProfile.birthDate})</div>
                  <div><strong>父:</strong> {winnerProfile.sire || "—"}</div>
                  <div><strong>母:</strong> {winnerProfile.dam || "—"}</div>
                  <div><strong>馬主:</strong> {winnerProfile.owner || "—"}</div>
                  <div><strong>生産者:</strong> {winnerProfile.breeder || "—"}</div>
                </div>
              </div>
            )}

            {/* 競走中の出来事等 */}
            {incidents && (
              <div className="bg-purple-muted p-12 rounded-8 border border-purple-40 text-sm">
                <div className="fw-600 fs-sm mb-6 text-purple-light flex items-center gap-4">
                  ⚠️ 競走中の出来事（審議・タイムオーバー等）
                </div>
                <div className="text-secondary mono fs-xs leading-relaxed">
                  {incidents}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 的中確認 */}
      {predictions.length > 0 && r1 > 0 && r2 > 0 && (
        <div className="card mt-16">
          <div className="card-header">
            <div className="card-title">🎯 券種別的中判定 & 払戻金自動計算</div>
          </div>
          <div className="p-16 flex flex-col gap-12">
            <div className="grid-2 gap-12" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              {[
                { label: "単勝", isHit: hits.win, comb: resWin.join("-"), tickets: hitWin },
                { label: "ワイド", isHit: hits.wide, comb: resWideMatches.map(m => m.join("-")).join(" / "), tickets: hitWide },
                { label: "三連複", isHit: hits.trio, comb: resTrio.join("-"), tickets: hitTrio },
                { label: "三連単", isHit: hits.trifecta, comb: resTrifecta.join("→"), tickets: hitTrifecta },
                { label: "馬連", isHit: hits.quinella, comb: resQuinella.join("-"), tickets: hitQuinella },
                { label: "馬単", isHit: hits.exacta, comb: resExacta.join("→"), tickets: hitExacta },
              ].map(item => (
                <div key={item.label} className={`p-12 rounded-8 border ${item.isHit ? 'bg-green-muted border-green-40' : 'bg-elevated border-muted'}`}>
                  <div className="flex justify-between items-center mb-6">
                    <strong className="fs-sm">{item.label}</strong>
                    <span className={`tag ${item.isHit ? 'tag-green' : 'tag-gray'}`}>
                      {item.isHit ? '🎉 的中' : '不的中'}
                    </span>
                  </div>
                  <div className="fs-xs text-muted mb-4">結果: {item.comb || "—"}</div>
                  {item.isHit && (
                    <div className="fs-xs text-green fw-600">
                      的中目: {item.tickets.map(t => t.join(['三連単', '馬単'].includes(item.label) ? '→' : '-')).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* シミュレータ部分 */}
            {Object.values(hits).some(Boolean) && refunds && (
              <div className="bg-gold-muted p-12 rounded-8 border border-gold-40 text-sm mt-12 flex flex-col gap-8">
                <div className="fw-600 text-gold flex items-center gap-4">💴 払戻金自動シミュレーター</div>
                <div className="flex gap-8 items-center flex-wrap">
                  <span className="text-muted">1点につき:</span>
                  <input
                    type="number"
                    className="form-input w-90"
                    step={100}
                    min={100}
                    value={betAmount}
                    aria-label="1点あたりの賭け金"
                    onChange={e => {
                      const amt = Math.max(0, +e.target.value);
                      setBetAmount(amt);
                      
                      let totalP = 0;
                      const mult = amt / 100;
                      if (hitTrio.length > 0) totalP += hitTrio.length * (refunds.trio?.[0]?.payout || 0) * mult;
                      if (hitTrifecta.length > 0) totalP += hitTrifecta.length * (refunds.trifecta?.[0]?.payout || 0) * mult;
                      if (hitQuinella.length > 0) totalP += hitQuinella.length * (refunds.quinella?.[0]?.payout || 0) * mult;
                      if (hitExacta.length > 0) totalP += hitExacta.length * (refunds.exacta?.[0]?.payout || 0) * mult;
                      
                      setProfit(totalP);
                    }}
                  />
                  <span className="fs-sm">円</span>
                  <span className="text-muted ml-8">検出配当総額:</span>
                  <strong className="text-gold">
                    {((hitTrio.length > 0 ? (refunds.trio?.[0]?.payout || 0) : 0) +
                      (hitTrifecta.length > 0 ? (refunds.trifecta?.[0]?.payout || 0) : 0) +
                      (hitQuinella.length > 0 ? (refunds.quinella?.[0]?.payout || 0) : 0) +
                      (hitExacta.length > 0 ? (refunds.exacta?.[0]?.payout || 0) : 0)).toLocaleString()}円
                  </strong>
                </div>
                <div className="fs-xs text-muted">
                  ※ 1点あたり購入額を変更すると、下の「払戻金額」に自動で掛け算して反映されます。
                </div>
              </div>
            )}
          </div>


        </div>
      )}

      {/* 予想との比較 */}
      {race.predictions && race.predictions.length > 0 && results.some(r => r.horseNumber > 0) && (
        <div className="card">
          <div className="card-header"><div className="card-title">📊 予想との比較</div></div>
          <div className="flex gap-8 flex-wrap">
            {race.predictions.slice(0, 7).map((p, i) => {
              const hitResult = results.find(r => r.horseNumber === p.horseNumber);
              const actualRank = hitResult ? hitResult.rank : null;
              const isRankHit = actualRank === (i + 1);
              
              const textColor = isRankHit ? "text-green" : "text-red";
              const statusText = isRankHit ? "的中 ✓" : "不的中 ✗";
              const cardBg = isRankHit ? "bg-green-muted" : "bg-surface";
              const cardBorder = isRankHit ? "border-green-40" : "border";
              
              return (
                <div key={p.horseId} className={`p-10-14 text-center rounded-8 ${cardBg} ${cardBorder}`} style={{ flex: '1 1 calc(50% - 8px)', minWidth: '120px' }}>
                  <div className="fs-xs text-muted mb-4">予想{i + 1}位</div>
                  <div className={`fs-lg fw-700 ${textColor} mb-4`}>
                    {p.horseNumber}番
                  </div>
                  <div className="fs-sm mb-4">{p.horseName}</div>
                  <div className={`fs-lg fw-700 ${textColor}`}>
                    {actualRank ? `${actualRank}着` : "—"} ({statusText})
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
