const cheerio = require('cheerio');
const iconv = require('iconv-lite');

async function testFetch() {
  const url = `https://nar.netkeiba.com/race/shutuba.html?race_id=202644052111`;
  const res = await fetch(url);
  const buffer = Buffer.from(await res.arrayBuffer());
  const html = iconv.decode(buffer, 'EUC-JP');
  const $ = cheerio.load(html);
  
  console.log("Title:", $("title").text());
}
testFetch();
