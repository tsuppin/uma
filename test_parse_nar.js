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

    const frameNum = parseInt($(cells[0]).text().trim()) || 0;
    const horseNum = parseInt($(cells[1]).text().trim()) || 0;
    if (!horseNum) return;

    const horseName = $(cells[3]).find(".HorseName a, a").first().text().trim() ||
      $(cells[3]).text().trim();

    const jockeyText = $(cells[6]).text().trim() || $(cells[7]).text().trim();
    const weightText = $(cells[8]).text().trim() || "";
    const weightMatch = weightText.match(/(\d+)(?:\(([+-]?\d+)\))?/);
    const horseWeight = weightMatch ? parseInt(weightMatch[1]) : 480;
    const weightChange = weightMatch?.[2] ? parseInt(weightMatch[2]) : 0;

    const kinryoText = $(cells[5]).text().trim();
    const kinryo = parseFloat(kinryoText) || 55;

    const oddsText = $(cells[9])?.text().trim() || $(cells[10])?.text().trim() || "0";
    const odds = parseFloat(oddsText.replace(/[^\d.]/g, "")) || 0;

    const popularityText = $(cells[10])?.text().trim() || "";
    const popularity = parseInt(popularityText) || 0;

    let age = 4;
    let gender = "牡";
    const ageText = $(cells[4]).text().trim();
    const ageMatch = ageText.match(/([牡牝セ])(\d+)/);
    if (ageMatch) {
      gender = ageMatch[1];
      age = parseInt(ageMatch[2]);
    }

    const sire = $(cells[4]).find(".Horse_Info a").first().text().trim() || "";

    horses.push({
      frame: frameNum,
      number: horseNum,
      name: horseName,
      jockey: jockeyText,
      jockeyWeight: kinryo,
      weight: horseWeight,
      weightChange,
      odds,
      popularity,
      sire,
      age,
      gender,
    });
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
    horsesLength: horses.length,
    horses
  };
}

async function run() {
  const sRes = await fetch('https://nar.netkeiba.com/race/shutuba.html?race_id=202445050811');
  const html = iconv.decode(Buffer.from(await sRes.arrayBuffer()), 'EUC-JP');
  console.log(parseNetkeibaHtml(html, 'https://nar.netkeiba.com/race/shutuba.html?race_id=202445050811', '2024-05-08'));
}
run().catch(console.error);
