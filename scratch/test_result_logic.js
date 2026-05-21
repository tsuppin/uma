const cheerio = require('cheerio');
const iconv = require('iconv-lite');

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml",
  "Accept-Language": "ja,en-US;q=0.9",
};

function parseNetkeibaResultHtml(html, url) {
  const $ = cheerio.load(html);
  const results = [];

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

  return { results };
}

async function testResultScraping(url) {
  console.log(`[TEST] Fetching result from URL: ${url}`);
  try {
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) {
      console.error(`[TEST] HTTP Error: ${res.status}`);
      return;
    }

    const isNetkeiba = url.includes("netkeiba.com");
    let html = "";
    if (isNetkeiba) {
      const buffer = await res.arrayBuffer();
      html = iconv.decode(Buffer.from(buffer), "euc-jp");
    } else {
      html = await res.text();
    }

    console.log(`[TEST] HTML length: ${html.length}`);
    console.log(`[TEST] HTML snippet:\n${html.slice(0, 500)}`);
    
    // 文字化けチェック（タイトルに日本語が含まれていて文字化けしていないか）
    const $ = cheerio.load(html);
    const title = $("title").text();
    console.log(`[TEST] Page Title: ${title}`);
    
    if (title.includes("")) {
      console.error("[TEST] FAILED: Character corruption detected (found )!");
    } else {
      console.log("[TEST] SUCCESS: Character encoding decoded correctly without corruption.");
    }

    const data = parseNetkeibaResultHtml(html, url);
    console.log(`[TEST] Extracted ${data.results.length} horse results.`);
    if (data.results.length > 0) {
      console.log("[TEST] First 3 horse results:");
      console.log(data.results.slice(0, 3));
    } else {
      console.error("[TEST] FAILED: No horse results extracted.");
    }
  } catch (error) {
    console.error(`[TEST] Error occurred: ${error.message}`);
  }
}

// 地方競馬 (NAR) の結果URLで検証 (例: 2024-05-08 川崎11R)
const targetUrl = "https://nar.netkeiba.com/race/result.html?race_id=202445050811";
testResultScraping(targetUrl);
