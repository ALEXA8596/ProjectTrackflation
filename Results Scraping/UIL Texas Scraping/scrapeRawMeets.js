const fs = require('fs');
const {fetch} = require("undici");

async function fetchRawResults() {
    const links = JSON.parse(await fs.readFileSync("meets.json"));

    links.forEach(link => {
        const res = fetch(link + "/")
    })
}

fetchRawResults()