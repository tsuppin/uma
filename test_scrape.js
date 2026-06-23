const cheerio = require('cheerio');
const iconv = require('iconv-lite');

async function testScrape() {
  const url = 'https://race.netkeiba.com/race/shutuba_past.html?race_id=202405020111'; // Example JRA race
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }});
  console.log('Status:', res.status);
  
  const arrayBuffer = await res.arrayBuffer();
  const html = iconv.decode(Buffer.from(arrayBuffer), 'euc-jp');
  const $ = cheerio.load(html);
  
  const raceName = $('.RaceName').text().trim();
  console.log('Race Name:', raceName);
  
  const horses = [];
  $('.HorseList').each((i, el) => {
    const horseName = $(el).find('.HorseName a').text().trim();
    if (horseName) horses.push(horseName);
  });
  console.log('Horses found:', horses.length, horses.slice(0, 3));
}

testScrape().catch(console.error);
