const fetch = require("node-fetch");
const fs = require("fs");
const { JSDOM } = require("jsdom");

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  const files = fs.readdirSync("./RAW_DATA/events-api/");
  console.log(files);

  const rawDataDir = "./RAW_DATA";

  if (!fs.existsSync(rawDataDir)) {
    fs.mkdirSync(rawDataDir, { recursive: true });
  }

  for (const file of files) {
    const olympicName = file.split(".")[0];
    const data = await JSON.parse(
      await fs.readFileSync("./RAW_DATA/events-api/" + file)
    );
    // console.log(data);
    // data.forEach(obj => console.log(obj))
    await sleep(500);
    data.forEach(async (obj) => {
      await obj;
      console.log(obj.slug)
      try {
        console.log("Fetching " + obj.title);

        const resp = await fetch(
          `https://www.olympics.com/en/olympic-games/${olympicName}/results/athletics/${obj.slug}`,
          {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
          }
        ).then((res) => res.text());

        if (!fs.existsSync(`${rawDataDir}/results-raw/${obj.slug}`)) {
          fs.mkdirSync(`${rawDataDir}/results-raw/${obj.slug}`, {
            recursive: true,
          });
        }

        // console.log({
        //   slug: obj.slug,
        //   id: obj.id,
        // });

        fs.writeFileSync(
          `${rawDataDir}/results-raw/${olympicName}/${obj.slug}.html`,
          resp
        );

        // console.log(resp);

        const dom = new JSDOM(resp);
        const allRows = dom.window.document.querySelectorAll(
          '[data-cy="table-content"]'
        )[0].children;
        const resultRow = Array.from(allRows).filter(
          (row) => !row.classList.contains("line")
        );

        const results = [];

        let index = 0;
        for (const row of resultRow) {
          // get place using index + 1
          // get country: if slug includes relay, get the textContent of the div that contains data-cy=country-name-row
          const country = obj.slug.includes("relay")
            ? row.querySelector('[data-cy="country-name-row"]')?.textContent
            : row.querySelector(`[data-cy="flag-with-label"]`).lastChild
                .textContent;

          // get time / measurement:
          const allNodes = row.querySelectorAll("*");
          const resultMark = Array.from(allNodes)
            .filter((el) => el.className?.toString().includes("sc-b22d5ad5-0 hPOQLP"))[0]
            ?.querySelector('[data-cy="result-info-content"]')?.textContent;

          if (!resultMark) continue;

          const athleteOrTeam =
            row.querySelector('[data-cy="athlete-name"]')?.textContent ||
            row.querySelector('[data-cy="country-name-row-*"]')?.textContent ||
            null;

          results.push({
            place: index + 1,
            country,
            mark: resultMark,
            name: athleteOrTeam,
          });
          index++;
        }

        const eventsDir = rawDataDir + "/results";
        if (!fs.existsSync(`${eventsDir}/${olympicName}/`)) {
          fs.mkdirSync(`${eventsDir}/${olympicName}/`, { recursive: true });
        }
        fs.writeFileSync(
          `${eventsDir}/${olympicName}/${obj.slug}.json`,
          JSON.stringify(results, null, 2)
        );
      } catch (e) {
        console.log("There was an Error");
        console.log(e);
      }
    });
  }
})();
