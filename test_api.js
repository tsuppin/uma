const cheerio = require('cheerio');
const iconv = require('iconv-lite');

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml",
  "Accept-Language": "ja,en-US;q=0.9",
};

async function autoFetchRaceId(dateStr, venue, raceNumber) {
  const formattedDate = dateStr.replace(/-/g, "").slice(0, 8);

  const isJra = ["札幌", "函館", "福島", "新潟", "東京", "中山", "中京", "京都", "阪神", "小倉"].includes(venue);
  const domain = isJra ? "race.netkeiba.com" : "nar.netkeiba.com";
  
  const listUrl = `https://${domain}/top/race_list_sub.html?kaisai_date=${formattedDate}`;
  const res = await fetch(listUrl, { headers: HEADERS });
  if (!res.ok) return null;

  const html = await res.text();
  const $ = cheerio.load(html);

  let raceId = null;
  
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

async function testApi() {
    let sourceUrl = await autoFetchRaceId("2024-05-08", "川崎", 11);
    console.log("autoFetchRaceId URL:", sourceUrl);

    if (sourceUrl) {
        const res = await fetch(sourceUrl, { headers: HEADERS });
        if (!res.ok) {
            console.log("Fetch failed", res.status);
            return;
        }

        const buffer = await res.arrayBuffer();
        let html = iconv.decode(Buffer.from(buffer), "euc-jp");

        const $ = cheerio.load(html);
        const horses = [];

        $("table.ShutubaTable tr.HorseList").each((_, row) => {
            const cells = $(row).find("td");
            if (cells.length < 5) return;
        
            const frameNum = parseInt($(cells[0]).text().trim()) || 0;
            const horseNum = parseInt($(cells[1]).text().trim()) || 0;
            if (!horseNum) return;
        
            const horseName = $(cells[3]).find(".HorseName a, a").first().text().trim() ||
              $(cells[3]).text().trim();
        
            horses.push({ number: horseNum, name: horseName });
        });
        console.log("Horses extracted:", horses.length);
        console.log("First horse:", horses[0]);
    }
}
testApi();
