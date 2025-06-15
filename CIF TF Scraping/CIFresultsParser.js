const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const athletichelper = require('athletichelper');

// Path to the CSV file
const csvFilePath = path.join(__dirname, 'state_meet_results.csv');

// Function to read and parse the CSV file
async function readCsvFile() {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('data', (row) => {
                results.push(row);
            })
            .on('end', () => {
                console.log('CSV file successfully processed.');
                resolve(results);
            })
            .on('error', (error) => {
                console.error('Error reading the CSV file:', error);
                reject(error);
            });
    });
}

(async() => {
    const stateMeetFiles = await readCsvFile();
    console.log(`Found ${stateMeetFiles.length} state meet files to process.`);
    // console.log(stateMeetFiles);
    for (const stateMeet of stateMeetFiles) {
        const year = stateMeet["Year"];
        const id = stateMeet["Meet ID"];
        console.log(`Processing results for year: ${year}, ID: ${id}`);
        try {
            const results = await athletichelper.track.meet.GetAllResultsData(id);
            // check if ./CIF/ exists, if not create it
            if (!fs.existsSync('./CIF/' + year)) {
                fs.mkdirSync('./CIF/' + year, { recursive: true });
            }
            // write results to ./CIF/${year}/data.json
            fs.writeFileSync(`./CIF/${year}/data.json`, JSON.stringify(results), null, 2);
            console.log(`Results for ${year} saved.`);
        } catch (error) {
            console.error(`Error fetching results for ${year}:`, error);
        }
    }
})();