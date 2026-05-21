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
        const rNumText = $(a).find('.Race_Num').text().trim().replace(/[^0-9]/g, '');
        if (parseInt(rNumText) === 11) {
          console.log("Found Race 11 URL:", $(a).attr('href'));
        }
      });
    }
  });
}
testFutureRaceId();
