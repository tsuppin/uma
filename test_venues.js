const cheerio = require('cheerio');

async function getVenues(dateStr) {
  const formattedDate = dateStr.replace(/-/g, "");
  
  const jraUrl = `https://race.netkeiba.com/top/race_list_sub.html?kaisai_date=${formattedDate}`;
  const narUrl = `https://nar.netkeiba.com/top/race_list_sub.html?kaisai_date=${formattedDate}`;

  const venues = [];
  const fetchAndParse = async (url) => {
    try {
      const res = await fetch(url);
      if (!res.ok) return;
      const html = await res.text();
      const $ = cheerio.load(html);
      $('.RaceList_DataTitle').each((_, el) => {
        let text = $(el).text().trim();
        // Remove numbers and spaces (e.g. "1回 東京 2日目" -> "東京")
        // Just extract the known venue names from the text if needed.
        const venueMatch = text.match(/(札幌|函館|福島|新潟|東京|中山|中京|京都|阪神|小倉|帯広|門別|盛岡|水沢|浦和|船橋|大井|川崎|金沢|笠松|名古屋|園田|姫路|高知|佐賀)/);
        if (venueMatch) {
          venues.push(venueMatch[1]);
        }
      });
    } catch(e) { console.error(e); }
  };

  await Promise.all([fetchAndParse(jraUrl), fetchAndParse(narUrl)]);
  
  console.log(`Venues for ${dateStr}:`, [...new Set(venues)]);
}

getVenues("2024-05-05").then(() => getVenues("2024-05-08")).catch(console.error);
