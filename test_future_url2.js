const cheerio = require('cheerio');

async function testFutureRaceId() {
  const listUrl = `https://nar.netkeiba.com/top/race_list_sub.html?kaisai_date=20260521`;
  const res = await fetch(listUrl);
  const html = await res.text();
  const $ = cheerio.load(html);
  
  $('.RaceList_DataList').each((_, el) => {
    const venueText = $(el).find('.RaceList_DataTitle').text().trim();
    if (venueText.includes("大井")) {
      $(el).find('.RaceList_DataItem a').each((_, a) => {
        const raceNumText = $(a).find('.Race_Num').text().trim();
        console.log("Found Race Num Text:", JSON.stringify(raceNumText));
      });
    }
  });
}
testFutureRaceId();
