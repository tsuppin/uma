const iconv = require('iconv-lite');
const cheerio = require('cheerio');

async function testFetch() {
  const url = `https://race.netkeiba.com/race/shutuba.html?race_id=202405020611`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  
  const buffer = await res.arrayBuffer();
  const html = iconv.decode(Buffer.from(buffer), 'EUC-JP');
  
  const $ = cheerio.load(html);
  
  console.log("Title:", $('title').text());
  console.log("RaceData02:", $('.RaceData02').text().trim());
  console.log("Date regex search:", html.match(/\d{4}年\d{1,2}月\d{1,2}日/));
}

testFetch().catch(console.error);
