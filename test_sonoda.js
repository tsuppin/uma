const cheerio = require('cheerio');

async function testSonoda() {
  const listUrl = `https://nar.netkeiba.com/top/race_list_sub.html?kaisai_date=20240508`;
  const res = await fetch(listUrl);
  const html = await res.text();
  const $ = cheerio.load(html);
  
  let raceId = null;
  $('.RaceList_DataList').each((_, el) => {
    const venueText = $(el).find('.RaceList_DataTitle').text().trim();
    console.log("Venue text:", venueText);
    if (venueText.includes("園田")) {
      $(el).find('.RaceList_DataItem a').each((_, a) => {
        const rNumText = $(a).find('.Race_Num').text().trim().replace(/[^0-9]/g, '');
        if (parseInt(rNumText) === 11) {
          const href = $(a).attr('href');
          const match = href.match(/race_id=(\d+)/);
          if (match) raceId = match[1];
        }
      });
    }
  });

  console.log("Extracted raceId for Sonoda:", raceId);
  if(raceId) {
    const sRes = await fetch(`https://nar.netkeiba.com/race/shutuba.html?race_id=${raceId}`);
    console.log("Shutuba fetch status:", sRes.status);
  }
}
testSonoda().catch(console.error);
