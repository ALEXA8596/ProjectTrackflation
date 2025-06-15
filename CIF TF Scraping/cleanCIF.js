const fs = require('fs');
const path = require('path');



// for each folder in CIF, delete all files that aren't "data.json"

const folders = fs.readdirSync("./CIF/");
for (const folder of folders) {
    const folderPath = path.join("./CIF/", folder);
    const files = fs.readdirSync(folderPath);

    for (const file of files) {
        if (file !== "data.json") {
            const filePath = path.join(folderPath, file);
            fs.unlinkSync(filePath);
            console.log(`Deleted: ${filePath}`);
        }
    }
}
