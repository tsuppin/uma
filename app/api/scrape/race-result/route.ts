import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

// ==========================================
// レース結果スクレイピング API Route
// POST /api/scrape/race-result
// body: { url?: string, html?: string }
// ==========================================

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml",
  "Accept-Language": "ja,en-US;q=0.9",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, html: rawHtml } = body as { url?: string; html?: string };

    let html = rawHtml || "";
    let sourceUrl = url || "";

    if (url && !rawHtml) {
      try {
        const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(10000) });
        if (!res.ok) {
          return NextResponse.json({ error: `HTTP ${res.status}: ${res.statusText}` }, { status: 400 });
        }
        html = await res.text();
        sourceUrl = url;
      } catch (e) {
        return NextResponse.json(
          { error: `取得失敗: ${e instanceof Error ? e.message : String(e)}` },
          { status: 400 }
        );
      }
    }

    if (!html) {
      return NextResponse.json({ error: "urlまたはhtmlを指定してください" }, { status: 400 });
    }

    const isOddsPark = sourceUrl.includes("oddspark.com") || html.includes("oddspark");
    const isNARKeibaGo = sourceUrl.includes("keiba.go.jp") || html.includes("keiba.go.jp");

    let result;
    if (isOddsPark) {
      result = parseOddsParkResultHtml(html);
    } else if (isNARKeibaGo) {
      result = parseNARKeibaGoResultHtml(html);
    } else {
      result = parseNetkeibaResultHtml(html, sourceUrl);
    }

    return NextResponse.json({ success: true, ...result });
  } catch (e) {
    console.error("[scrape/race-result]", e);
    return NextResponse.json(
      { error: `解析エラー: ${e instanceof Error ? e.message : String(e)}` },
      { status: 500 }
    );
  }
}

// ==========================================
// netkeiba.com 結果パーサー
// ==========================================
function parseNetkeibaResultHtml(html: string, _url: string) {
  const $ = cheerio.load(html);

  const results: ResultEntry[] = [];

  // 結果テーブル
  $("table.RaceTable01 tr, table.race_table_01 tr").each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length < 5) return;

    const rank = parseInt($(cells[0]).text().trim());
    if (!rank || rank > 20) return;

    const frameNum = parseInt($(cells[1]).text().trim()) || 0;
    const horseNum = parseInt($(cells[2]).text().trim()) || 0;
    if (!horseNum) return;

    const horseName = $(cells[3]).find("a").text().trim() || $(cells[3]).text().trim();
    const timeText = $(cells[7]).text().trim() || $(cells[8]).text().trim();
    const oddsText = $(cells[10]).text().trim() || $(cells[11]).text().trim() || "0";
    const odds = parseFloat(oddsText.replace(/[^\d.]/g, "")) || 0;
    const popularityText = $(cells[11]).text().trim() || $(cells[12]).text().trim();
    const popularity = parseInt(popularityText) || 0;
    const weightText = $(cells[14]).text().trim() || "";
    const weightMatch = weightText.match(/(\d+)(?:\(([+-]?\d+)\))?/);
    const weight = weightMatch ? parseInt(weightMatch[1]) : 480;
    const weightChange = weightMatch?.[2] ? parseInt(weightMatch[2]) : 0;
    const last3fText = $(cells[9]).text().trim() || "";
    const jockey = $(cells[6]).text().trim().replace(/^[▲△☆◇]/, "") || "";
    const jockeyWeightText = $(cells[5]).text().trim();
    const jockeyWeight = parseFloat(jockeyWeightText) || 55;
    const marginText = $(cells[8]).text().trim() || "";

    results.push({
      rank,
      frameNumber: frameNum,
      horseNumber: horseNum,
      horseName,
      time: timeText,
      odds,
      popularity,
      weight,
      weightChange,
      last3f: last3fText,
      jockey,
      jockeyWeight,
      margin: marginText,
      prize: 0,
    });
  });

  // 払い戻し情報
  const refunds = parseNetkeibaRefunds($);

  // ラップタイム
  const lapTimes: string[] = [];
  $(".RaceHalon li, .lap_time li").each((_, el) => {
    const t = $(el).text().trim();
    if (/^\d+\.\d$/.test(t)) lapTimes.push(t);
  });

  return { results, refunds, lapTimes };
}

function parseNetkeibaRefunds($: ReturnType<typeof cheerio.load>) {
  type RefundItem = { horse?: string; combination?: string; bracket?: string; payout: number; popularity: number };
  const refunds: {
    win?: RefundItem[];
    place?: RefundItem[];
    quinella?: RefundItem[];
    exacta?: RefundItem[];
    wide?: RefundItem[];
    trio?: RefundItem[];
    trifecta?: RefundItem[];
    bracketQuinella?: RefundItem[];
  } = {};

  $("table.Payout_Detail_Table tr, .pay_block tr").each((_, row) => {
    const label = $(row).find("th, .pay_type").text().trim();
    const rows = $(row).find("td");
    if (!rows.length) return;

    const combo = $(rows[0]).text().trim().replace(/\s+/g, "");
    const payoutText = $(rows[1]).text().trim().replace(/[,円]/g, "");
    const popularityText = $(rows[2]).text().trim().replace(/番人気/g, "");
    const payout = parseInt(payoutText) || 0;
    const popularity = parseInt(popularityText) || 0;

    if (!payout) return;

    if (label.includes("単勝")) {
      refunds.win = [...(refunds.win || []), { horse: combo, payout, popularity }];
    } else if (label.includes("複勝")) {
      refunds.place = [...(refunds.place || []), { horse: combo, payout, popularity }];
    } else if (label.includes("枠連")) {
      refunds.bracketQuinella = [...(refunds.bracketQuinella || []), { bracket: combo, payout, popularity }];
    } else if (label.includes("馬連")) {
      refunds.quinella = [...(refunds.quinella || []), { combination: combo, payout, popularity }];
    } else if (label.includes("馬単")) {
      refunds.exacta = [...(refunds.exacta || []), { combination: combo, payout, popularity }];
    } else if (label.includes("ワイド")) {
      refunds.wide = [...(refunds.wide || []), { combination: combo, payout, popularity }];
    } else if (label.includes("3連複") || label.includes("三連複")) {
      refunds.trio = [...(refunds.trio || []), { combination: combo, payout, popularity }];
    } else if (label.includes("3連単") || label.includes("三連単")) {
      refunds.trifecta = [...(refunds.trifecta || []), { combination: combo, payout, popularity }];
    }
  });

  return refunds;
}

// ==========================================
// ODDS PARK 結果パーサー
// ==========================================
function parseOddsParkResultHtml(html: string) {
  const $ = cheerio.load(html);
  const results: ResultEntry[] = [];

  $("table tr").each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length < 4) return;

    const rank = parseInt($(cells[0]).text().trim());
    if (!rank || rank > 20) return;

    const horseNum = parseInt($(cells[1]).text().trim());
    if (!horseNum) return;

    results.push({
      rank,
      horseNumber: horseNum,
      horseName: $(cells[2]).text().trim(),
      time: $(cells[4]).text().trim(),
      odds: parseFloat($(cells[5]).text().replace(/[^\d.]/g, "")) || 0,
      popularity: parseInt($(cells[6]).text()) || 0,
      weight: 480,
      weightChange: 0,
      prize: 0,
    });
  });

  return { results, refunds: {}, lapTimes: [] };
}

// ==========================================
// KEIBA.GO.JP 結果パーサー
// ==========================================
function parseNARKeibaGoResultHtml(html: string) {
  const $ = cheerio.load(html);
  const results: ResultEntry[] = [];

  $("table tr").each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length < 5) return;

    const rank = parseInt($(cells[0]).text().trim());
    if (!rank || rank > 20) return;

    const horseNum = parseInt($(cells[1]).text().trim());
    if (!horseNum) return;

    const horseName = $(cells[2]).text().trim();
    if (!horseName) return;

    const timeText = $(cells[4]).text().trim() || $(cells[5]).text().trim();

    results.push({
      rank,
      frameNumber: 0,
      horseNumber: horseNum,
      horseName,
      time: timeText,
      odds: 0,
      popularity: 0,
      weight: parseInt($(cells[6]).text()) || 480,
      weightChange: 0,
      prize: 0,
    });
  });

  // 払い戻し
  const refunds = parseNARRefunds($);

  return { results, refunds, lapTimes: [] };
}

function parseNARRefunds($: ReturnType<typeof cheerio.load>) {
  type RefundItem = { horse?: string; combination?: string; bracket?: string; payout: number; popularity: number };
  const refunds: {
    win?: RefundItem[];
    place?: RefundItem[];
    quinella?: RefundItem[];
    exacta?: RefundItem[];
    wide?: RefundItem[];
    trio?: RefundItem[];
    trifecta?: RefundItem[];
    bracketQuinella?: RefundItem[];
  } = {};

  $("table tr").each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length < 3) return;

    const label = $(cells[0]).text().trim();
    const combo = $(cells[1]).text().trim().replace(/\s+/g, "");
    const payoutText = $(cells[2]).text().trim().replace(/[,円]/g, "");
    const payout = parseInt(payoutText) || 0;
    if (!payout) return;

    const popularity = parseInt($(cells[3]).text().trim()) || 0;

    if (label.includes("単勝")) {
      refunds.win = [...(refunds.win || []), { horse: combo, payout, popularity }];
    } else if (label.includes("複勝")) {
      refunds.place = [...(refunds.place || []), { horse: combo, payout, popularity }];
    } else if (label.includes("枠連")) {
      refunds.bracketQuinella = [...(refunds.bracketQuinella || []), { bracket: combo, payout, popularity }];
    } else if (label.includes("馬連")) {
      refunds.quinella = [...(refunds.quinella || []), { combination: combo, payout, popularity }];
    } else if (label.includes("馬単")) {
      refunds.exacta = [...(refunds.exacta || []), { combination: combo, payout, popularity }];
    } else if (label.includes("ワイド")) {
      refunds.wide = [...(refunds.wide || []), { combination: combo, payout, popularity }];
    } else if (label.includes("3連複") || label.includes("三連複")) {
      refunds.trio = [...(refunds.trio || []), { combination: combo, payout, popularity }];
    } else if (label.includes("3連単") || label.includes("三連単")) {
      refunds.trifecta = [...(refunds.trifecta || []), { combination: combo, payout, popularity }];
    }
  });

  return refunds;
}

interface ResultEntry {
  rank: number;
  frameNumber?: number;
  horseNumber: number;
  horseName: string;
  time: string;
  odds: number;
  popularity: number;
  weight: number;
  weightChange: number;
  last3f?: string;
  jockey?: string;
  jockeyWeight?: number;
  margin?: string;
  prize: number;
}
