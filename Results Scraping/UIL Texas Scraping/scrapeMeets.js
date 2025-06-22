const athleticHelper = require("athletichelper");
const fs = require("fs");
const { fetch, ProxyAgent } = require("undici");
const _ = require("lodash");

// async function findWorkingProxy(proxies) {
//   for (let i = 0; i < 5; i++) {
//     const randomIndex = Math.floor(Math.random() * proxies.length);
//     const proxy = proxies[randomIndex];
//     // const agent = new ProxyAgent(`http://${proxy.ip}:${proxy.port}`);
//     const agent = new ProxyAgent("http://152.70.154.69:8080");
//     try {
//       const res = await fetch("https://www.milesplit.com", {
//         dispatcher: agent,
//         timeout: 5000,
//       });
//       if (res.ok) {
//         console.log("Found Working Proxy");
//         return agent;
//       }
//     } catch (err) {
//       // Ignore and try next proxy
//     }
//   }
//   throw new Error("No working proxy found after 5 attempts.");
// }

(async () => {
  // const proxies = await fetch("https://cdn.jsdelivr.net/gh/proxifly/free-proxy-list@main/proxies/protocols/http/data.json").then(res => res.json());

  const raw = fs.readFileSync("meets.json");
  const data = await JSON.parse(raw);
  // Sleep function to wait for a given number of milliseconds
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  for (const el of data) {
    try {
      const meetYear = el.split("-").pop();
      const resultData = await athleticHelper.milesplit.meets.getAllResultsData(
        el.split("/").pop().split("-").shift(),
        {
          // dispatcher: await findWorkingProxy(proxies)
        }
      );

      // console.log(resultData);

      if (!fs.existsSync("./UIL_Data/" + meetYear + "/")) {
        fs.mkdirSync("./UIL_Data/" + meetYear + "/", {
          recursive: true,
        });
      }

    Object.keys(resultData).forEach((key) => {
      // Clean the keys in resultData[key] before saving
      const cleaned = {};
      Object.keys(resultData[key]).forEach((k) => {
        cleaned[_.trim(k)] = resultData[key][k];
      });
      const filePath = `./UIL_Data/${meetYear}/${key}.json`;
      fs.writeFileSync(filePath, JSON.stringify(cleaned, null, 2));
    });

      console.log("Successfully Scraped " + meetYear);
    } catch (err) {
      const meetYear = el.split("-").pop();
      console.error(`Error processing year ${meetYear}:`, err);
    }

    // Wait 10 seconds before next iteration
    // await sleep(10000);
  }
})();
