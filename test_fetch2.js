const cheerio = require('cheerio');
const iconv = require('iconv-lite');

async function testFetch() {
  const url = `https://nar.netkeiba.com/race/shutuba.html?race_id=202644052111`;
  const res = await fetch(url);
  const buffer = Buffer.from(await res.arrayBuffer());
  const html = iconv.decode(buffer, 'EUC-JP');
  const $ = cheerio.load(html);
  
  $("table.ShutubaTable tr.HorseList").each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length < 5) return;
    
    console.log("Horse:", $(cells[3]).text().trim().split('\n')[0]);
    console.log("Cell 4 HTML:", $(cells[4]).html());
    console.log("Cell 4 Text:", $(cells[4]).text().trim());
  });
}
testFetch();
