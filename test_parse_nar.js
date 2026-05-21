const cheerio = require('cheerio');
const iconv = require('iconv-lite');

function parseNetkeibaHtml(html, url, fallbackDate) {
  const $ = cheerio.load(html);

  // レース基本情報
  const raceTitle = $(".RaceName, .race_name, h1.RaceName").first().text().trim();
  const raceDataTitle = $(".RaceData01, .RaceData").first().text().trim();

  // 距離・馬場・方向
  let distance = 0;
  let surface = "ダート";
  const distMatch = raceDataTitle.match(/(\d+)m/);
  if (distMatch) distance = parseInt(distMatch[1]);
  if (raceDataTitle.includes("芝")) surface = "芝";

  // 馬場状態
  let condition = "良";
  const condMatch = raceDataTitle.match(/(良|稍重|重|不良)/);
  if (condMatch) condition = condMatch[1];

  // 日付・開催場
  const raceSubTitle = $(".RaceData02").first().text().trim();
  let date = fallbackDate;
  
  const dateMatchHTML = html.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  if (dateMatchHTML) {
    const y = dateMatchHTML[1];
    const m = dateMatchHTML[2].padStart(2, "0");
    const d = dateMatchHTML[3].padStart(2, "0");
    date = `${y}-${m}-${d}`;
  }

  let venue = "";
  let raceNumber = 1;

  const dateMatch = url.match(/race_id=(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/);
  if (dateMatch) {
    // getVenueFromCode
    const map = {
      "01": "札幌", "02": "函館", "03": "福島", "04": "新潟",
      "05": "東京", "06": "中山", "07": "中京", "08": "京都",
      "09": "阪神", "10": "小倉",
    };
    venue = map[dateMatch[2]] || "";
    raceNumber = parseInt(dateMatch[5]);
  }

  // venue から別の方法で取得
  if (!venue) {
    const venueMatch = raceSubTitle.match(/(東京|中山|京都|阪神|中京|新潟|福島|小倉|函館|札幌|大井|川崎|船橋|浦和|門別|笠松|名古屋|金沢|園田|姫路|高知|佐賀|帯広|水沢|盛岡)/);
    if (venueMatch) venue = venueMatch[1];
  }
  const rnMatch = raceSubTitle.match(/(\d+)R/);
  if (rnMatch) raceNumber = parseInt(rnMatch[1]);

  // 出走馬テーブル
  const horses = [];
  $("table.ShutubaTable tr.HorseList, .shutuba-table tr").each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length < 5) return;

    // ...
    // Let's just count horses
    horses.push({});
  });

  return {
    raceInfo: {
      date,
      venue,
      raceNumber,
      raceName: raceTitle || `${raceNumber}R`,
      distance,
      surface,
      condition,
      headCount: horses.length,
    },
    horsesLength: horses.length
  };
}

async function run() {
  const sRes = await fetch('https://nar.netkeiba.com/race/shutuba.html?race_id=202445050811');
  const html = iconv.decode(Buffer.from(await sRes.arrayBuffer()), 'EUC-JP');
  console.log(parseNetkeibaHtml(html, 'https://nar.netkeiba.com/race/shutuba.html?race_id=202445050811', '2024-05-08'));
}
run().catch(console.error);
