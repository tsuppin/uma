const cheerio = require('cheerio');
const iconv = require('iconv-lite');

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml",
  "Accept-Language": "ja,en-US;q=0.9",
};

async function autoFetchRaceId(dateStr, venue, raceNumber) {
  const formattedDate = dateStr.replace(/-/g, "").slice(0, 8);
  const isJra = ["札幌", "函館", "福島", "新潟", "東京", "中山", "中京", "京都", "阪神", "小倉"].includes(venue);
  const domain = isJra ? "race.netkeiba.com" : "nar.netkeiba.com";
  
  const listUrl = `https://${domain}/top/race_list_sub.html?kaisai_date=${formattedDate}`;
  const res = await fetch(listUrl, { headers: HEADERS });
  if (!res.ok) return null;
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

  if (!raceId) return null;
  return `https://${domain}/race/shutuba.html?race_id=${raceId}`;
}

function parseNetkeibaHtml(html, url, fallbackDate) {
  const $ = cheerio.load(html);
  const pageTitle = $("title").text();
  const raceTitle = $(".RaceName").text().trim() || pageTitle.split("|")[0].trim();
  const dateMatch = pageTitle.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  const date = dateMatch ? `${dateMatch[1]}-${dateMatch[2].padStart(2, "0")}-${dateMatch[3].padStart(2, "0")}` : fallbackDate;

  const courseText = $(".RaceData01").text().replace(/\s+/g, " ");
  let surface = "ダート";
  if (courseText.includes("芝")) surface = "芝";
  const distanceMatch = courseText.match(/(\d{3,4})m/);
  const distance = distanceMatch ? parseInt(distanceMatch[1]) : 0;
  
  let condition = "良";
  if (courseText.includes("不良")) condition = "不良";
  else if (courseText.includes("重")) condition = "重";
  else if (courseText.includes("稍重")) condition = "稍重";

  const horses = [];

  $("table.ShutubaTable tr.HorseList").each((_, row) => {
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

    const sire = $(cells[4]).find(".Horse_Info a").first().text().trim() ||
      ($(cells[4]).find(".Horse_Info").length ? $(cells[4]).text().split("\n")[0].trim().replace(/^[牡牝セ]\d+/, '').trim() : "");

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

  const venueMatch = pageTitle.match(/(大井|川崎|船橋|浦和|門別|盛岡|水沢|金沢|笠松|名古屋|園田|姫路|高知|佐賀|帯広)/);

  return {
    raceInfo: {
      date,
      venue: venueMatch?.[1] || "",
      raceNumber: 1,
      raceName: raceTitle,
      distance,
      surface,
      condition,
      headCount: horses.length,
    },
    horses,
  };
}

async function POST(body) {
    const { url, html: rawHtml, auto } = body;
    let html = rawHtml || "";
    let sourceUrl = url || "";

    if (auto && !html && !url) {
        const autoUrl = await autoFetchRaceId(auto.date, auto.venue, auto.raceNumber);
        if (!autoUrl) return { error: "指定されたレースが見つかりませんでした" };
        sourceUrl = autoUrl;
    }

    if (sourceUrl && !html) {
        const res = await fetch(sourceUrl, { headers: HEADERS });
        if (!res.ok) return { error: `HTTP ${res.status}` };
        
        const isNetkeiba = sourceUrl.includes("netkeiba.com");
        if (isNetkeiba) {
            const buffer = await res.arrayBuffer();
            html = iconv.decode(Buffer.from(buffer), "euc-jp");
        } else {
            html = await res.text();
        }
    }

    let scrapedData = null;
    if (sourceUrl.includes("netkeiba.com")) {
        scrapedData = parseNetkeibaHtml(html, sourceUrl, auto?.date || "");
    }
    return { success: true, ...scrapedData };
}

POST({ auto: { date: "2026-05-21", venue: "大井", raceNumber: 11 } }).then(res => console.log(JSON.stringify(res, null, 2)));
