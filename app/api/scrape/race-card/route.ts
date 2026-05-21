import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import iconv from "iconv-lite";
import { parseNetkeibaResultHtml } from "../race-result/route";

// ==========================================
// 出馬表スクレイピング API Route
// POST /api/scrape/race-card
// body: { url?: string, html?: string, auto?: { date: string, venue: string, raceNumber: number } }
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
    const { url, html: rawHtml, auto } = body as { url?: string; html?: string; auto?: { date: string; venue: string; raceNumber: number } };

    let html = rawHtml || "";
    let sourceUrl = url || "";

    // 自動取得モード (date, venue, raceNumber) が指定された場合
    if (auto && !html && !url) {
      try {
        const autoUrl = await autoFetchRaceId(auto.date, auto.venue, auto.raceNumber);
        if (!autoUrl) {
          return NextResponse.json({ error: "指定されたレースが見つかりませんでした" }, { status: 404 });
        }
        sourceUrl = autoUrl;
      } catch (e) {
        return NextResponse.json(
          { error: `自動検索失敗: ${e instanceof Error ? e.message : String(e)}` },
          { status: 400 }
        );
      }
    }

    // URLが指定された、または自動検索でURLが取得できた場合はフェッチ
    if (sourceUrl && !html) {
      try {
        const res = await fetch(sourceUrl, { headers: HEADERS, signal: AbortSignal.timeout(10000) });
        if (!res.ok) {
          return NextResponse.json({ error: `HTTP ${res.status}: ${res.statusText}` }, { status: 400 });
        }

        const isNetkeiba = sourceUrl.includes("netkeiba.com");
        if (isNetkeiba) {
          const buffer = await res.arrayBuffer();
          html = iconv.decode(Buffer.from(buffer), "euc-jp");
        } else {
          html = await res.text();
        }
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

    // サイト判定
    const isNetkeiba = sourceUrl.includes("netkeiba.com") || html.includes("netkeiba");
    const isOddsPark = sourceUrl.includes("oddspark.com") || html.includes("oddspark");
    const isNARKeibaGo = sourceUrl.includes("keiba.go.jp") || html.includes("keiba.go.jp");

    const fallbackDate = auto?.date || new Date().toISOString().slice(0, 10);

    let result;
    if (isOddsPark) {
      result = parseOddsParkHtml(html, sourceUrl, fallbackDate);
    } else if (isNARKeibaGo) {
      result = parseNARKeibaGoHtml(html, sourceUrl, fallbackDate);
    } else {
      // デフォルトはnetkeiba形式
      result = parseNetkeibaHtml(html, sourceUrl, fallbackDate);
    }

    if (result && result.raceInfo) {
      result.raceInfo.sourceUrl = sourceUrl;
    }

    // レース結果が既に存在するかどうかのチェックと取得
    let raceResult = null;
    if (sourceUrl && sourceUrl.includes("netkeiba.com")) {
      const resultUrl = sourceUrl.replace("shutuba.html", "result.html");
      try {
        const resResult = await fetch(resultUrl, { headers: HEADERS, signal: AbortSignal.timeout(5000) });
        if (resResult.ok) {
          const buffer = await resResult.arrayBuffer();
          const resultHtml = iconv.decode(Buffer.from(buffer), "euc-jp");
          
          if (resultHtml.includes("RaceTable01") || resultHtml.includes("race_table_01")) {
            const parsedResult = parseNetkeibaResultHtml(resultHtml, resultUrl);
            if (parsedResult && parsedResult.results && parsedResult.results.length > 0) {
              raceResult = {
                raceId: "",
                result: parsedResult.results.map((r) => ({
                  rank: r.rank,
                  horseNumber: r.horseNumber,
                  horseName: r.horseName,
                  time: r.time || "",
                  odds: r.odds || 0,
                  prize: r.prize || 0,
                  popularity: r.popularity,
                  weight: r.weight,
                  weightChange: r.weightChange,
                  jockey: r.jockey,
                  jockeyWeight: r.jockeyWeight,
                  last3f: r.last3f,
                  margin: r.margin,
                })),
                refunds: parsedResult.refunds || {},
                lapTimes: parsedResult.lapTimes || [],
              };
            }
          }
        }
      } catch (e) {
        console.warn("[scrape/race-card] 結果の自動取得に失敗（スキップします）:", e);
      }
    }

    return NextResponse.json({ success: true, ...result, raceResult });
  } catch (e) {
    console.error("[scrape/race-card]", e);
    return NextResponse.json(
      { error: `解析エラー: ${e instanceof Error ? e.message : String(e)}` },
      { status: 500 }
    );
  }
}

// ==========================================
// netkeiba.com 出馬表パーサー
// ==========================================
function parseNetkeibaHtml(html: string, url: string, fallbackDate: string) {
  const $ = cheerio.load(html);

  // レース基本情報
  const raceTitle = $(".RaceName, .race_name, h1.RaceName").first().text().trim();
  const raceDataTitle = $(".RaceData01, .RaceData").first().text().trim();

  // 距離・馬場・方向
  let distance = 0;
  let surface: "ダート" | "芝" = "ダート";
  const distMatch = raceDataTitle.match(/(\d+)m/);
  if (distMatch) distance = parseInt(distMatch[1]);
  if (raceDataTitle.includes("芝")) surface = "芝";

  // 馬場状態
  let condition: "良" | "稍重" | "重" | "不良" = "良";
  const condMatch = raceDataTitle.match(/(良|稍重|重|不良)/);
  if (condMatch) condition = condMatch[1] as typeof condition;

  // 日付・開催場
  const raceSubTitle = $(".RaceData02").first().text().trim();
  let date = fallbackDate;
  
  // HTMLから正確な日付を抽出 (例: "2024年5月5日")
  const dateMatchHTML = html.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  if (dateMatchHTML) {
    const y = dateMatchHTML[1];
    const m = dateMatchHTML[2].padStart(2, "0");
    const d = dateMatchHTML[3].padStart(2, "0");
    date = `${y}-${m}-${d}`;
  }

  let venue = "";
  let raceNumber = 1;

  const dateMatch = url.match(/race_id=(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/);
  if (dateMatch) {
    venue = getVenueFromCode(dateMatch[2]);
    raceNumber = parseInt(dateMatch[5]);
  }

  // venue から別の方法で取得
  if (!venue) {
    const venueMatch = raceSubTitle.match(/(札幌|函館|福島|新潟|東京|中山|中京|京都|阪神|小倉|帯広|門別|盛岡|水沢|浦和|船橋|大井|川崎|金沢|笠松|名古屋|園田|姫路|高知|佐賀)/);
    if (venueMatch) venue = venueMatch[1];
  }
  const rnMatch = raceSubTitle.match(/(\d+)R/);
  if (rnMatch) raceNumber = parseInt(rnMatch[1]);

  // 出走馬テーブル
  const horses: ScrapedHorse[] = [];
  $("table.ShutubaTable tr.HorseList, .shutuba-table tr").each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length < 5) return;

    const frameNum = parseInt($(cells[0]).text().trim()) || 0;
    const horseNum = parseInt($(cells[1]).text().trim()) || 0;
    if (!horseNum) return;

    const horseName = $(cells[3]).find(".HorseName a, a").first().text().trim() ||
      $(cells[3]).text().trim();

    const jockeyText = $(cells[6]).text().trim() || $(cells[7]).text().trim();
    const weightText = $(cells[8]).text().trim() || "";
    const weightMatch = weightText.match(/(\d+)(?:\(([+-]?\d+)\))?/);
    const horseWeight = weightMatch ? parseInt(weightMatch[1]) : 480;
    const weightChange = weightMatch?.[2] ? parseInt(weightMatch[2]) : 0;

    const kinryoText = $(cells[5]).text().trim();
    const kinryo = parseFloat(kinryoText) || 55;

    const oddsText = $(cells[9])?.text().trim() || $(cells[10])?.text().trim() || "0";
    const odds = parseFloat(oddsText.replace(/[^\d.]/g, "")) || 0;

    const popularityText = $(cells[10])?.text().trim() || "";
    const popularity = parseInt(popularityText) || 0;

    let age = 4;
    let gender = "牡";
    const ageText = $(cells[4]).text().trim();
    const ageMatch = ageText.match(/([牡牝セ])(\d+)/);
    if (ageMatch) {
      gender = ageMatch[1];
      age = parseInt(ageMatch[2]);
    }

    // 血統 (JRA用には .Horse_Info がある)
    const sire = $(cells[4]).find(".Horse_Info a").first().text().trim() ||
      ($(cells[4]).find(".Horse_Info").length ? $(cells[4]).text().split("\n")[0].trim().replace(/^[牡牝セ]\d+/, '').trim() : "");

    horses.push({
      frame: frameNum,
      number: horseNum,
      name: horseName,
      jockey: jockeyText,
      jockeyWeight: kinryo,
      weight: horseWeight,
      weightChange,
      odds,
      popularity,
      sire,
      age,
      gender,
    });
  });

  return {
    raceInfo: {
      date,
      venue,
      raceNumber,
      raceName: raceTitle || `${raceNumber}R`,
      distance,
      surface,
      condition,
      headCount: horses.length,
    },
    horses,
    rawText: extractText($),
  };
}

// ==========================================
// ODDS PARK パーサー
// ==========================================
function parseOddsParkHtml(html: string, _url: string, fallbackDate: string) {
  const $ = cheerio.load(html);

  const raceName = $("h1, .raceName, .race-name").first().text().trim();
  const horses: ScrapedHorse[] = [];

  $("table tr, .horse-row").each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length < 4) return;

    const numText = $(cells[0]).text().trim();
    const horseNum = parseInt(numText);
    if (!horseNum || horseNum > 20) return;

    const horseName = $(cells[1]).text().trim() || $(cells[2]).text().trim();
    if (!horseName) return;

    horses.push({
      frame: Math.ceil(horseNum / 2),
      number: horseNum,
      name: horseName,
      jockey: $(cells[3]).text().trim() || $(cells[4]).text().trim(),
      jockeyWeight: 55,
      weight: 480,
      weightChange: 0,
      age: 4,
      gender: "牡",
    });
  });

  return {
    raceInfo: {
      date: fallbackDate,
      venue: "",
      raceNumber: 1,
      raceName,
      distance: 0,
      surface: "ダート" as const,
      condition: "良" as const,
      headCount: horses.length,
    },
    horses,
    rawText: extractText($),
  };
}

// ==========================================
// KEIBA.GO.JP (地方競馬) パーサー
// ==========================================
function parseNARKeibaGoHtml(html: string, url: string, fallbackDate: string) {
  const $ = cheerio.load(html);

  const pageTitle = $("title").text().trim();
  const horses: ScrapedHorse[] = [];

  // 開催情報
  const dateStr = url.match(/hd=(\d{8})/)?.[1] || "";
  const date = dateStr
    ? `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`
    : fallbackDate;

  // 出走馬テーブル
  $("table tr").each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length < 4) return;

    const frameNum = parseInt($(cells[0]).text().trim()) || 0;
    const horseNum = parseInt($(cells[1]).text().trim()) || 0;
    if (!horseNum || horseNum > 20) return;

    const horseName = $(cells[2]).text().trim();
    if (!horseName) return;

    horses.push({
      frame: frameNum || Math.ceil(horseNum / 2),
      number: horseNum,
      name: horseName,
      jockey: $(cells[4]).text().trim() || "",
      jockeyWeight: parseFloat($(cells[5]).text().trim()) || 55,
      weight: parseInt($(cells[6]).text().trim()) || 480,
      weightChange: 0,
      age: 4,
      gender: "牡",
    });
  });

  const venueMatch = pageTitle.match(/(大井|川崎|船橋|浦和|門別|盛岡|水沢|金沢|笠松|名古屋|園田|姫路|高知|佐賀|帯広)/);

  return {
    raceInfo: {
      date,
      venue: venueMatch?.[1] || "",
      raceNumber: 1,
      raceName: pageTitle,
      distance: 0,
      surface: "ダート" as const,
      condition: "良" as const,
      headCount: horses.length,
    },
    horses,
    rawText: extractText($),
  };
}

// ==========================================
// ユーティリティ
// ==========================================
function extractText($: ReturnType<typeof cheerio.load>): string {
  return $("body").text().replace(/\s+/g, " ").slice(0, 5000);
}

function getVenueFromCode(code: string): string {
  const map: Record<string, string> = {
    "01": "札幌", "02": "函館", "03": "福島", "04": "新潟",
    "05": "東京", "06": "中山", "07": "中京", "08": "京都",
    "09": "阪神", "10": "小倉",
  };
  return map[code] || "";
}

// ==========================================
// 自動検索用ユーティリティ
// ==========================================
async function autoFetchRaceId(dateStr: string, venue: string, raceNumber: number): Promise<string | null> {
  const formattedDate = dateStr.replace(/-/g, "").slice(0, 8);

  // JRAかNARか判定
  const isJra = ["札幌", "函館", "福島", "新潟", "東京", "中山", "中京", "京都", "阪神", "小倉"].includes(venue);
  const domain = isJra ? "race.netkeiba.com" : "nar.netkeiba.com";
  
  const listUrl = `https://${domain}/top/race_list_sub.html?kaisai_date=${formattedDate}`;
  const res = await fetch(listUrl, { headers: HEADERS });
  if (!res.ok) return null;

  const html = await res.text();
  const $ = cheerio.load(html);

  let raceId: string | null = null;
  
  $('.RaceList_DataList').each((_, el) => {
    const venueText = $(el).find('.RaceList_DataTitle').text().trim();
    if (venueText.includes(venue)) {
      $(el).find('.RaceList_DataItem a').each((_, a) => {
        const rNumText = $(a).find('.Race_Num').text().trim().replace(/[^0-9]/g, '');
        if (parseInt(rNumText) === raceNumber) {
          const href = $(a).attr('href');
          if (href) {
            const match = href.match(/race_id=(\d+)/);
            if (match) raceId = match[1];
          }
        }
      });
    }
  });

  if (!raceId) return null;
  return `https://${domain}/race/shutuba.html?race_id=${raceId}`;
}

interface ScrapedHorse {
  frame: number;
  number: number;
  name: string;
  jockey: string;
  jockeyWeight: number;
  weight: number;
  weightChange: number;
  age: number;
  gender: string;
  sire?: string;
  odds?: number;
  popularity?: number;
}
