const fs = require('fs');
const path = require('path');

const resultsDir = './results_xc';

function convertExtensions() {
    try {
        // Check if the results directory exists
        if (!fs.existsSync(resultsDir)) {
            console.error(`Directory "${resultsDir}" does not exist.`);
            return;
        }

        // Read all files in the results directory
        const files = fs.readdirSync(resultsDir);

        files.forEach(file => {
            const filePath = path.join(resultsDir, file);

            // Check if the file has a .html extension
            if (path.extname(file) === '.html') {
                const newFilePath = path.join(resultsDir, path.basename(file, '.html') + '.json');

                // Rename the file to change its extension
                fs.renameSync(filePath, newFilePath);
                console.log(`Renamed: ${file} -> ${path.basename(newFilePath)}`);
            }
        });

        console.log('All .html files have been converted to .json.');
    } catch (error) {
        console.error('Error converting file extensions:', error);
    }
}

// Run the function
convertExtensions();