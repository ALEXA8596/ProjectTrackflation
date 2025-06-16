const fetch = require("node-fetch");
const fs = require("fs");
const { JSDOM } = require('jsdom');

async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

(async() => {
  const file = JSON.parse(fs.readFileSync("olympics.json"));
  console.log(file);

  const rawDataDir = "./RAW_DATA/";

  if (!fs.existsSync(rawDataDir)) {
    fs.mkdirSync(rawDataDir, { recursive: true });
  }

  for(const obj of file) {
    await sleep(500)
    try {
        console.log("Fetching " + obj.name);

        const resp = await fetch(`https://www.olympics.com/en/olympic-games/${obj.id}/results/athletics`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        }).then(res => res.text());

        fs.writeFileSync(`${rawDataDir}${obj.id}.html`, resp);

        console.log(resp)

        const dom = new JSDOM(resp);
        const eventRows = dom.window.document.getElementsByClassName('event-row');

        const results = []
        
        for (const row of eventRows) {
            const eventName = row.querySelector('h2').textContent.trim();
            const eventUrl = row.querySelector('a').getAttribute('href');

            results.push({
                eventName,
                eventUrl
            });
        }

        const eventsDir = rawDataDir + "events/";
        if (!fs.existsSync(eventsDir)) {
            fs.mkdirSync(eventsDir, { recursive: true });
        }
        fs.writeFileSync(`${eventsDir}${obj.id}.json`, JSON.stringify(results, null, 2));
    } catch (e) {
        console.log("There was an Error");
        console.log(e);
    }
  }
})();