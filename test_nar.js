const cheerio = require('cheerio');
const iconv = require('iconv-lite');

async function checkNar() {
  const listUrl = `https://nar.netkeiba.com/top/race_list_sub.html?kaisai_date=20240508`;
  const res = await fetch(listUrl);
  const buffer = Buffer.from(await res.arrayBuffer());

  console.log("=== UTF-8 ===");
  const htmlUtf8 = buffer.toString('utf-8');
  const $1 = cheerio.load(htmlUtf8);
  $1('.RaceList_DataTitle').each((_, el) => console.log($1(el).text().trim()));

  console.log("=== EUC-JP ===");
  const htmlEuc = iconv.decode(buffer, 'EUC-JP');
  const $2 = cheerio.load(htmlEuc);
  $2('.RaceList_DataTitle').each((_, el) => console.log($2(el).text().trim()));
}
checkNar();
