const fs = require('fs');
const path = require('path');
const csvWriter = require('csv-writer').createObjectCsvWriter;

// Directory containing the results_tf files
const resultsDir = path.join(__dirname, 'results_tf');

// Output CSV file
const outputCsvPath = path.join(__dirname, 'state_meet_results.csv');

// Initialize CSV writer
const csv = csvWriter({
    path: outputCsvPath,
    header: [
        { id: 'year', title: 'Year' },
        { id: 'fileName', title: 'File Name' },
        { id: 'name', title: 'Meet Name' },
        { id: 'url', title: 'URL' },
        { id: 'id', title: 'Meet ID' }
    ],
});

// Function to process files
async function processStateMeetFiles() {
  const files = fs.readdirSync(resultsDir);
  const stateMeetFiles = [];

  for (const file of files) {
    const filePath = path.join(resultsDir, file);
    
    // Check if the file is a .json file
    if (path.extname(file) === '.json') {
      try {
        // Read the file content
        const content = fs.readFileSync(filePath, 'utf-8');
        // Parse the JSON content
        const jsonContent = JSON.parse(content);
        
        const potentialStateMeets = jsonContent.responses
            .filter(response => response.name.includes("State"))
            .sort((a, b) => {
            const aHasFinals = a.name.includes("Finals");
            const bHasFinals = b.name.includes("Finals");
            return bHasFinals - aHasFinals; // Puts entries with "Finals" first
            });

        if (potentialStateMeets.length > 1) {
            console.log(`Multiple state meets found in file: ${file}`);
            console.log('Using first one');
            stateMeetFiles.push({
                year: path.basename(file, '.json'),
                fileName: file,
                name: potentialStateMeets[0].name,
                url: potentialStateMeets[0].url,
                id: potentialStateMeets[0].id,
            });
        };
        if( potentialStateMeets.length === 0) {
            console.log(`No state meet found in file: ${file}`);
            continue;
        }
        if(potentialStateMeets.length === 1) {
            console.log(`Found state meet in file: ${file}`);
            stateMeetFiles.push({
                year: path.basename(file, '.json'),
                fileName: file,
                name: potentialStateMeets[0].name,
                url: potentialStateMeets[0].url,
                id: potentialStateMeets[0].id,
            });
        };
      } catch (error) {
        console.error(`Error reading file ${file}:`, error);
      }
    }
  }

  await csv.writeRecords(stateMeetFiles);
  console.log(`State meet results written to ${outputCsvPath}`);
}

// Execute the script
processStateMeetFiles().catch(console.error);