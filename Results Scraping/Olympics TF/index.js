const fetch = require("node-fetch");
const fs = require("fs");

// Sleep function to avoid rate limiting
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  const file = JSON.parse(fs.readFileSync("olympics.json"));
  console.log(file);

  const rawDataDir = "./RAW_DATA/events-api/";

  if (!fs.existsSync(rawDataDir)) {
    fs.mkdirSync(rawDataDir, { recursive: true });
  }

  for (const obj of file) {
    try {
        console.log("fetching " + obj.name)
    const response = await fetch(
      "https://www.olympics.com/_sed/api/olympic-games/olympic-results/" +
        obj.id +
        "/athletics",
      {
        headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        "apollographql-client-name": "oe-api-production",
        "content-type": "text/plain;charset=UTF-8",
        priority: "u=1, i",
        "sec-ch-ua":
          '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
        "x-country-code": "US",
        "x-language": "en",
        Referer: "https://www.olympics.com/en/olympic-games/olympic-results",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        },
        body: '{"slug":"' + obj.id + '","discipline":"athletics"}',
        method: "POST",
        timeout: 10000
      }
    );

      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
        continue; // Skip to the next object in case of an error
      }

      const res = await response.json();
      console.log("Saving " + obj.id);
      fs.writeFileSync(
        `${rawDataDir}${obj.id}.json`,
        JSON.stringify(res, null, 2)
      );

      // Sleep for 1 second to avoid rate limiting
      await sleep(1000);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }

  console.log("Finished processing all files.");
})();