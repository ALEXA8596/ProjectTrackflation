const athletichelper = require('athletichelper');
const fs = require('fs');
const search = athletichelper.search.runSearch;

// const year = 1917;

async function processYear(year) {
    try {
        const results = await search("CIF " + year, `t:m a:tf`);
        // check if ./results/ exists, if not create it
        if (!fs.existsSync('./results_tf/')) {
            fs.mkdirSync('./results_tf/');
        }
        // write results to ./results/${year}.json
        console.log(results)
        fs.writeFileSync(`./results_tf/${year}.json`, JSON.stringify(results), null, 2);
        console.log(`Results for ${year} saved.`);
    } catch (error) {
        console.error(`Error fetching results for ${year}:`, error);
    }
}

(async () => {
    for(let i = 1915; i < 2026; i++) {
        await processYear(i);
    }
})();