const cheerio = require('cheerio');
const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36', Accept: 'text/html,application/xhtml+xml', 'Accept-Language': 'ja,en-US;q=0.9' };
async function test() {
  const dateStr = '2024-05-05';
  const venue = '東京';
  const raceNumber = 11;
  const formattedDate = dateStr.replace(/-/g, '').slice(0, 8);
  const domain = 'race.netkeiba.com';
  const listUrl = 'https://' + domain + '/top/race_list_sub.html?kaisai_date=' + formattedDate;
  console.log('Fetching list:', listUrl);
  const res = await fetch(listUrl, { headers });
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
  console.log('Race ID:', raceId);
  if (raceId) {
    const shutubaUrl = 'https://' + domain + '/race/shutuba.html?race_id=' + raceId;
    console.log('Fetching shutuba:', shutubaUrl);
    const sRes = await fetch(shutubaUrl, { headers });
    const buffer = await sRes.arrayBuffer();
    const iconv = require('iconv-lite');
    const sHtml = iconv.decode(Buffer.from(buffer), "euc-jp");
    console.log('Shutuba fetched, length:', sHtml.length);
    // test parseNetkeibaHtml
    const $s = cheerio.load(sHtml);
    const raceTitle = $s('.RaceName, .race_name, h1.RaceName').first().text().trim();
    console.log('Title:', raceTitle);
    let hCount = 0;
    $s('table.ShutubaTable tr.HorseList, .shutuba-table tr').each((_, row) => {
      const cells = $s(row).find('td');
      if (cells.length < 5) return;
      hCount++;
    });
    console.log('Horses count:', hCount);
  } else {
    console.log('Could not find raceId in html:');
    console.log(html.slice(0, 500));
  }
}
test();
