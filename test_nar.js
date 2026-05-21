const cheerio = require('cheerio');

async function testNarShutuba() {
  const shutubaUrl = `https://nar.netkeiba.com/race/shutuba.html?race_id=202445050811`;
  const sRes = await fetch(shutubaUrl);
  
  // NAR is probably EUC-JP too?
  const iconv = require('iconv-lite');
  const buffer = await sRes.arrayBuffer();
  const html = iconv.decode(Buffer.from(buffer), 'EUC-JP');
  
  const $ = cheerio.load(html);
  
  console.log("Title:", $('title').text());
  console.log("RaceData01:", $('.RaceData01').text().trim());
  console.log("RaceData02:", $('.RaceData02').text().trim());
  console.log("Date regex:", html.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/));
  console.log("Horse count:", $('table.ShutubaTable tr.HorseList, .shutuba-table tr').length);
}

testNarShutuba().catch(console.error);
