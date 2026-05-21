import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

// ==========================================
// 出馬表スクレイピング API Route
// POST /api/scrape/race-card
// body: { url?, html?, date?, venue?, raceNumber? }
// ==========================================

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
  "Accept-Encoding": "gzip, deflate, br",
  Connection: "keep-alive",
  "Upgrade-Insecure-Requests": "1",
};

// JRA 競馬場コード (netkeiba race_id の 7-8桁目)
const JRA_VENUE_CODES: Record<string, string> = {
  "札幌": "01", "函館": "02", "福島": "03", "新潟": "04",
  "東京": "05", "中山": "06", "中京": "07", "京都": "08",
  "阪神": "09", "小倉": "10",
};

// NAR 競馬場コード (keiba.go.jp k_babaCode)
const NAR_VENUE_CODES: Record<string, string> = {
  "帯広": "01", "門別": "03", "盛岡": "06", "水沢": "07",
  "大井": "09", "川崎": "10", "浦和": "11", "船橋": "12",
  "金沢": "13", "笠松": "14", "名古屋": "15", "園田": "17",
  "姫路": "18", "高知": "19", "佐賀": "20",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      url?: string;
      html?: string;
      date?: string;
      venue?: string;
      raceNumber?: number;
    };

    const { url, html: rawHtml, date, venue, raceNumber } = body;

    let html = rawHtml || "";
    let sourceUrl = url || "";

    // ============================================
    // 日付・競馬場・レース番号から自動URL解決
    // ============================================
    if (!sourceUrl && !html && date && venue && raceNumber) {
      if (JRA_VENUE_CODES[venue]) {
        // JRA: netkeiba のレースリストから race_id を解決
        const resolved = await resolveJRARaceUrl(date, venue, raceNumber);
        if (resolved.url) {
          sourceUrl = resolved.url;
        } else {
          return NextResponse.json(
            { error: resolved.error, resolvedUrl: resolved.fallbackUrl },
            { status: 404 }
          );
        }
      } else if (NAR_VENUE_CODES[venue]) {
        // NAR: keiba.go.jp の URL を直接構築
        sourceUrl = buildNARRaceUrl(date, venue, raceNumber);
      } else {
        return NextResponse.json(
          { error: `未対応の競馬場: ${venue}` },
          { status: 400 }
        );
      }
    }

    // ============================================
    // URL フェッチ
    // ============================================
    if (sourceUrl && !html) {
      try {
        const res = await fetch(sourceUrl, {
          headers: { ...HEADERS, Referer: "https://www.netkeiba.com/" },
          signal: AbortSignal.timeout(12000),
        });
        if (!res.ok) {
          return NextResponse.json(
            { error: `HTTP ${res.status}: ${res.statusText}`, resolvedUrl: sourceUrl },
            { status: 400 }
          );
        }
        html = await res.text();
      } catch (e) {
        return NextResponse.json(
          {
            error: `取得失敗: ${e instanceof Error ? e.message : String(e)}`,
            resolvedUrl: sourceUrl,
          },
          { status: 400 }
        );
      }
    }

    if (!html) {
      return NextResponse.json(
        { error: "url・html・または日付/競馬場/レース番号を指定してください" },
        { status: 400 }
      );
    }

    // ============================================
    // サイト判定 → パース
    // ============================================
    const isOddsPark = sourceUrl.includes("oddspark.com") || html.includes("oddspark");
    const isNARKeibaGo =
      sourceUrl.includes("keiba.go.jp") ||
      html.includes("keiba.go.jp") ||
      (venue && NAR_VENUE_CODES[venue] != null && !JRA_VENUE_CODES[venue]);

    let result;
    if (isOddsPark) {
      result = parseOddsParkHtml(html, sourceUrl);
    } else if (isNARKeibaGo) {
      result = parseNARKeibaGoHtml(html, sourceUrl, { date, venue, raceNumber });
    } else {
      result = parseNetkeibaHtml(html, sourceUrl);
    }

    return NextResponse.json({ success: true, resolvedUrl: sourceUrl, ...result });
  } catch (e) {
    console.error("[scrape/race-card]", e);
    return NextResponse.json(
      { error: `解析エラー: ${e instanceof Error ? e.message : String(e)}` },
      { status: 500 }
    );
  }
}

// ==========================================
// JRA: netkeiba レースリストから race_id を解決
// ==========================================
async function resolveJRARaceUrl(
  date: string,
  venue: string,
  raceNumber: number
): Promise<{ url?: string; error?: string; fallbackUrl?: string }> {
  const dateStr = date.replace(/-/g, "");
  const venueCode = JRA_VENUE_CODES[venue];
  const raceNumStr = String(raceNumber).padStart(2, "0");

  const listUrl = `https://race.netkeiba.com/top/race_list_sub.html?kaisai_date=${dateStr}`;
  const fallbackUrl = `https://race.netkeiba.com/top/race_list.html?kaisai_date=${dateStr}`;

  try {
    const res = await fetch(listUrl, {
      headers: {
        ...HEADERS,
        Referer: "https://race.netkeiba.com/",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return {
        error: `レースリスト取得失敗 HTTP ${res.status}`,
        fallbackUrl,
      };
    }

    const html = await res.text();

    // race_id を全て抽出 (12桁: YYYYMMVVKKDDRR)
    const raceIds = [...html.matchAll(/race_id=(\d{12})/g)].map((m) => m[1]);

    // venue code = positions 6-7 (0-indexed), race number = positions 10-11
    const matched = raceIds.find(
      (id) => id.slice(6, 8) === venueCode && id.slice(10, 12) === raceNumStr
    );

    if (!matched) {
      return {
        error: `${date} ${venue} ${raceNumber}R の出馬表が見つかりませんでした。開催なし、またはまだ公開されていない可能性があります。`,
        fallbackUrl,
      };
    }

    return { url: `https://race.netkeiba.com/race/shutuba.html?race_id=${matched}` };
  } catch (e) {
    return {
      error: `ネットワークエラー: ${e instanceof Error ? e.message : String(e)}`,
      fallbackUrl,
    };
  }
}

// ==========================================
// NAR: keiba.go.jp の URL を直接構築
// ==========================================
function buildNARRaceUrl(date: string, venue: string, raceNumber: number): string {
  const venueCode = NAR_VENUE_CODES[venue];
  const dateSlash = date.replace(/-/g, "/"); // 2026/05/21
  return `https://www.keiba.go.jp/KeibaWeb/TodayRaceInfo/DetalInfo?k_raceDate=${encodeURIComponent(dateSlash)}&k_raceNo=${raceNumber}&k_babaCode=${venueCode}`;
}

// ==========================================
// netkeiba.com 出馬表パーサー
// ==========================================
function parseNetkeibaHtml(html: string, url: string) {
  const $ = cheerio.load(html);

  const raceTitle = $(".RaceName, .race_name, h1.RaceName").first().text().trim();
  const raceDataTitle = $(".RaceData01, .RaceData").first().text().trim();

  let distance = 0;
  let surface: "ダート" | "芝" = "ダート";
  const distMatch = raceDataTitle.match(/(\d+)m/);
  if (distMatch) distance = parseInt(distMatch[1]);
  if (raceDataTitle.includes("芝")) surface = "芝";

  let condition: "良" | "稍重" | "重" | "不良" = "良";
  const condMatch = raceDataTitle.match(/(良|稍重|重|不良)/);
  if (condMatch) condition = condMatch[1] as typeof condition;

  const raceSubTitle = $(".RaceData02").first().text().trim();
  let date = new Date().toISOString().slice(0, 10);
  let venue = "";
  let raceNumber = 1;

  // race_id から日付・会場・レース番号を抽出 (12桁)
  const raceIdMatch = url.match(/race_id=(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
  if (raceIdMatch) {
    date = `${raceIdMatch[1]}-${raceIdMatch[2]}-${raceIdMatch[3]}`;
    venue = getJRAVenueFromCode(raceIdMatch[3]);
    raceNumber = parseInt(raceIdMatch[6]);
  }

  if (!venue) {
    const venueMatch = raceSubTitle.match(
      /(東京|中山|京都|阪神|中京|新潟|福島|小倉|函館|札幌|大井|川崎|船橋|浦和|門別|笠松|名古屋|金沢)/
    );
    if (venueMatch) venue = venueMatch[1];
  }
  const rnMatch = raceSubTitle.match(/(\d+)R/);
  if (rnMatch) raceNumber = parseInt(rnMatch[1]);

  const horses: ScrapedHorse[] = [];
  $("table.ShutubaTable tr.HorseList, .shutuba-table tr").each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length < 5) return;

    const frameNum = parseInt($(cells[0]).text().trim()) || 0;
    const horseNum = parseInt($(cells[1]).text().trim()) || 0;
    if (!horseNum) return;

    const horseName =
      $(cells[3]).find(".HorseName a, a").first().text().trim() ||
      $(cells[3]).text().trim();

    const jockeyText = $(cells[6]).text().trim() || $(cells[7]).text().trim();
    const weightText = $(cells[8]).text().trim() || "";
    const weightMatch = weightText.match(/(\d+)(?:\(([+-]?\d+)\))?/);
    const horseWeight = weightMatch ? parseInt(weightMatch[1]) : 480;
    const weightChange = weightMatch?.[2] ? parseInt(weightMatch[2]) : 0;
    const kinryo = parseFloat($(cells[5]).text().trim()) || 55;
    const odds =
      parseFloat(($(cells[9])?.text().trim() || "0").replace(/[^\d.]/g, "")) || 0;
    const popularity = parseInt($(cells[10])?.text().trim() || "0") || 0;
    const sire =
      $(cells[4]).find(".Horse_Info a").first().text().trim() ||
      $(cells[4]).text().split("\n")[0].trim();

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
      age: 4,
      gender: "牡",
    });
  });

  return {
    raceInfo: { date, venue, raceNumber, raceName: raceTitle || `${raceNumber}R`, distance, surface, condition, headCount: horses.length },
    horses,
    rawText: extractText($),
  };
}

// ==========================================
// ODDS PARK パーサー
// ==========================================
function parseOddsParkHtml(html: string, _url: string) {
  const $ = cheerio.load(html);
  const raceName = $("h1, .raceName, .race-name").first().text().trim();
  const horses: ScrapedHorse[] = [];

  $("table tr, .horse-row").each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length < 4) return;
    const horseNum = parseInt($(cells[0]).text().trim());
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
    raceInfo: { date: new Date().toISOString().slice(0, 10), venue: "", raceNumber: 1, raceName, distance: 0, surface: "ダート" as const, condition: "良" as const, headCount: horses.length },
    horses,
    rawText: extractText($),
  };
}

// ==========================================
// KEIBA.GO.JP (地方競馬) パーサー
// ==========================================
function parseNARKeibaGoHtml(
  html: string,
  url: string,
  hint?: { date?: string; venue?: string; raceNumber?: number }
) {
  const $ = cheerio.load(html);
  const pageTitle = $("title").text().trim();
  const horses: ScrapedHorse[] = [];

  // 日付: URL の k_raceDate パラメータ or hint
  let date = hint?.date || new Date().toISOString().slice(0, 10);
  const dateMatch = url.match(/k_raceDate=([^&]+)/);
  if (dateMatch) {
    const d = decodeURIComponent(dateMatch[1]).replace(/\//g, "-");
    if (d.match(/\d{4}-\d{2}-\d{2}/)) date = d;
  }

  // レース番号
  let raceNumber = hint?.raceNumber || 1;
  const rnMatch = url.match(/k_raceNo=(\d+)/);
  if (rnMatch) raceNumber = parseInt(rnMatch[1]);

  // 会場
  const venueMatch = pageTitle.match(
    /(大井|川崎|船橋|浦和|門別|盛岡|水沢|金沢|笠松|名古屋|園田|姫路|高知|佐賀|帯広)/
  );
  const venue = hint?.venue || venueMatch?.[1] || "";

  // 距離
  let distance = 0;
  let surface: "ダート" | "芝" = "ダート";
  const distMatch = html.match(/(\d{3,4})m/);
  if (distMatch) distance = parseInt(distMatch[1]);
  if (html.includes("芝")) surface = "芝";

  // 馬場状態
  let condition: "良" | "稍重" | "重" | "不良" = "良";
  const condMatch = html.match(/(稍重|重|不良|良)/);
  if (condMatch) condition = condMatch[1] as typeof condition;

  // テーブルパース - keiba.go.jp の構造に対応
  $("table").each((_, tbl) => {
    if (horses.length > 0) return; // 最初のヒットのみ
    $(tbl).find("tr").each((_, row) => {
      const cells = $(row).find("td");
      if (cells.length < 3) return;

      // 馬番判定: 1列目か2列目が1〜20の整数
      let horseNum = 0;
      let frameNum = 0;
      let nameIdx = -1;
      const c0 = parseInt($(cells[0]).text().trim());
      const c1 = parseInt($(cells[1]).text().trim());
      if (c0 >= 1 && c0 <= 20 && c1 >= 1 && c1 <= 20) {
        frameNum = c0; horseNum = c1; nameIdx = 2;
      } else if (c0 >= 1 && c0 <= 20) {
        horseNum = c0; nameIdx = 1; frameNum = Math.ceil(c0 / 2);
      } else {
        return;
      }

      const horseName = $(cells[nameIdx]).text().trim().replace(/\(.*?\)/, "").trim();
      if (!horseName || horseName.length < 2) return;

      const jockey = $(cells[nameIdx + 2] ?? cells[cells.length - 2]).text().trim();
      const kinryoText = $(cells[nameIdx + 1] ?? cells[cells.length - 3]).text().trim();
      const kinryo = parseFloat(kinryoText) || 55;

      horses.push({
        frame: frameNum,
        number: horseNum,
        name: horseName,
        jockey,
        jockeyWeight: kinryo,
        weight: 480,
        weightChange: 0,
        age: 4,
        gender: "牡",
      });
    });
  });

  return {
    raceInfo: { date, venue, raceNumber, raceName: `${venue} ${raceNumber}R`, distance, surface, condition, headCount: horses.length },
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

function getJRAVenueFromCode(code: string): string {
  const map: Record<string, string> = {
    "01": "札幌", "02": "函館", "03": "福島", "04": "新潟",
    "05": "東京", "06": "中山", "07": "中京", "08": "京都",
    "09": "阪神", "10": "小倉",
  };
  return map[code] || "";
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
