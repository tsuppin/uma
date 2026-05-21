import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml",
  "Accept-Language": "ja,en-US;q=0.9",
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date");

    if (!dateStr) {
      return NextResponse.json({ error: "dateパラメータが必要です" }, { status: 400 });
    }

    const formattedDate = dateStr.replace(/-/g, "");
    
    const jraUrl = `https://race.netkeiba.com/top/race_list_sub.html?kaisai_date=${formattedDate}`;
    const narUrl = `https://nar.netkeiba.com/top/race_list_sub.html?kaisai_date=${formattedDate}`;

    const venues: string[] = [];
    const fetchAndParse = async (url: string) => {
      try {
        const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(5000) });
        if (!res.ok) return;
        const html = await res.text();
        const $ = cheerio.load(html);
        $('.RaceList_DataTitle').each((_, el) => {
          let text = $(el).text().trim();
          const venueMatch = text.match(/(札幌|函館|福島|新潟|東京|中山|中京|京都|阪神|小倉|帯広|門別|盛岡|水沢|浦和|船橋|大井|川崎|金沢|笠松|名古屋|園田|姫路|高知|佐賀)/);
          if (venueMatch) {
            venues.push(venueMatch[1]);
          }
        });
      } catch(e) {
        console.error(`Fetch failed for ${url}:`, e);
      }
    };

    await Promise.all([fetchAndParse(jraUrl), fetchAndParse(narUrl)]);
    
    // 重複を削除して返す
    const uniqueVenues = [...new Set(venues)];
    return NextResponse.json({ success: true, venues: uniqueVenues });
  } catch (error) {
    return NextResponse.json(
      { error: `開催場取得エラー: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}
