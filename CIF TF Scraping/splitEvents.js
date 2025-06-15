const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Path to the input CSV file
const inputCsvPath = path.join(__dirname, 'CIFresults.csv');

// Directory to save individual event files
const outputDir = path.join(__dirname, 'EventFiles');

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// Function to split the CSV into individual event files
function splitEventsCsv() {
    const eventData = {};

    fs.createReadStream(inputCsvPath)
        .pipe(csv())
        .on('data', (row) => {
            const eventName = row['Event Name'];

            // Group rows by event name
            if (!eventData[eventName]) {
                eventData[eventName] = [];
            }
            eventData[eventName].push(row);
        })
        .on('end', () => {
            console.log('CSV file successfully processed.');

            // Write individual files for each event
            for (const [eventName, rows] of Object.entries(eventData)) {
                const eventFilePath = path.join(outputDir, `${eventName.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
                const csvContent = [
                    'Year,Event Name,Event Short Name,Gender,Minimum,Maximum,Mean,Median,Standard Deviation,Sample Size',
                    ...rows.map(row => 
                        `${row.Year},${row['Event Name']},${row['Event Short Name']},${row.Gender},${row.Minimum},${row.Maximum},${row.Mean},${row.Median},${row['Standard Deviation']},${row['Sample Size']}`
                    )
                ].join('\n');

                fs.writeFileSync(eventFilePath, csvContent, 'utf8');
                console.log(`File created: ${eventFilePath}`);
            }
        })
        .on('error', (error) => {
            console.error('Error reading the CSV file:', error);
        });
}

// Execute the function
splitEventsCsv();