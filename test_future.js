const cheerio = require('cheerio');
const iconv = require('iconv-lite');

async function testFutureDate() {
  const listUrl = `https://nar.netkeiba.com/top/race_list_sub.html?kaisai_date=20260521`;
  const res = await fetch(listUrl);
  console.log("Status:", res.status);
  const html = await res.text();
  const $ = cheerio.load(html);
  
  const titles = [];
  $('.RaceList_DataTitle').each((_, el) => titles.push($(el).text().trim()));
  console.log("Titles:", titles);
}
testFutureDate();
