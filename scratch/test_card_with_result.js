const cheerio = require('cheerio');
const iconv = require('iconv-lite');

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml",
  "Accept-Language": "ja,en-US;q=0.9",
};

// APIロジックからパース関数を抜き出して模擬テスト
function parseNetkeibaHtml(html, url, fallbackDate) {
  const $ = cheerio.load(html);
  const pageTitle = $("title").text().trim();
  const raceTitle = $(".RaceName, .race_name, h1.RaceName").first().text().trim() || pageTitle.split("|")[0].trim();
  
  const horses = [];
  $("table.ShutubaTable tr.HorseList, .shutuba-table tr").each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length < 5) return;
    const horseName = $(cells[3]).find(".HorseName a, a").first().text().trim() || $(cells[3]).text().trim();
    if (horseName) horses.push({ name: horseName });
  });

  return {
    raceInfo: {
      raceName: raceTitle,
      headCount: horses.length,
      sourceUrl: url,
    },
    horses,
  };
}

function parseNetkeibaResultHtml(html, url) {
  const $ = cheerio.load(html);
  const results = [];
  $("table.RaceTable01 tr, table.race_table_01 tr").each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length < 5) return;
    const rank = parseInt($(cells[0]).text().trim());
    if (!rank || rank > 20) return;
    const horseName = $(cells[3]).find("a").text().trim() || $(cells[3]).text().trim();
    results.push({ rank, horseName });
  });
  return { results };
}

async function testFetchCardAndResult(sourceUrl) {
  console.log(`[TEST] Fetching race card from URL: ${sourceUrl}`);
  try {
    const res = await fetch(sourceUrl, { headers: HEADERS });
    if (!res.ok) {
      console.error(`[TEST] HTTP Error: ${res.status}`);
      return;
    }

    const buffer = await res.arrayBuffer();
    const html = iconv.decode(Buffer.from(buffer), "euc-jp");
    const result = parseNetkeibaHtml(html, sourceUrl, "2024-05-08");
    
    console.log(`[TEST] Extracted ${result.horses.length} horses from race card.`);
    console.log(`[TEST] Race Name: ${result.raceInfo.raceName}`);

    // レース結果が既に存在するかどうかのチェックと取得 (API実装と同様のロジック)
    let raceResult = null;
    if (sourceUrl && sourceUrl.includes("netkeiba.com")) {
      const resultUrl = sourceUrl.replace("shutuba.html", "result.html");
      console.log(`[TEST] Checking for race result at URL: ${resultUrl}`);
      
      const resResult = await fetch(resultUrl, { headers: HEADERS });
      if (resResult.ok) {
        const resBuffer = await resResult.arrayBuffer();
        const resultHtml = iconv.decode(Buffer.from(resBuffer), "euc-jp");
        
        if (resultHtml.includes("RaceTable01") || resultHtml.includes("race_table_01")) {
          console.log("[TEST] Result table found! Parsing result...");
          const parsedResult = parseNetkeibaResultHtml(resultHtml, resultUrl);
          if (parsedResult && parsedResult.results && parsedResult.results.length > 0) {
            raceResult = {
              result: parsedResult.results
            };
          }
        } else {
          console.log("[TEST] No result table found. Race might not have finished yet.");
        }
      } else {
        console.log(`[TEST] Failed to fetch result page: ${resResult.status}`);
      }
    }

    console.log("=== API OUTPUT MOCK ===");
    console.log({
      success: true,
      raceInfo: result.raceInfo,
      horsesCount: result.horses.length,
      hasRaceResult: !!raceResult,
      firstWinner: raceResult ? raceResult.result[0] : null
    });

  } catch (error) {
    console.error(`[TEST] Error occurred: ${error.stack}`);
  }
}

// 過去の川崎11R出馬表URL (結果がすでに存在するはずのもの)
const targetShutubaUrl = "https://nar.netkeiba.com/race/shutuba.html?race_id=202445050811";
testFetchCardAndResult(targetShutubaUrl);
