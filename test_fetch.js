const cheerio = require('cheerio');

async function testFetch() {
  const date = '20240505';
  const url = `https://nar.netkeiba.com/top/race_list_sub.html?kaisai_date=${date}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  
  const html = await res.text();
  const $ = cheerio.load(html);

  let raceId = null;
  const venue = '盛岡';
  const raceNumber = 11;

  $('.RaceList_DataList').each((_, el) => {
    const venueText = $(el).find('.RaceList_DataTitle').text().trim();
    if (venueText.includes(venue)) {
      $(el).find('.RaceList_DataItem a').each((_, a) => {
        const href = $(a).attr('href');
        const rNumText = $(a).find('.Race_Num').text().trim().replace(/[^0-9]/g, '');
        if (parseInt(rNumText) === raceNumber) {
          if (href) {
            const match = href.match(/race_id=(\d+)/);
            if (match) raceId = match[1];
          }
        }
      });
    }
  });

  console.log("Found NAR Race ID:", raceId);
}

testFetch().catch(console.error);
