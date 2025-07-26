const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const folderPath = path.join(
  __dirname,
  "olympic_csv"
); // Adjust folder name if necessary

async function calculateImprovementRates() {
  const files = fs
    .readdirSync(folderPath)
    .filter((file) => file.endsWith(".csv"));

  const results = [];

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const data = await readCSV(filePath);

    if (data.length < 2) {
      console.warn(`Not enough data in ${file} to calculate improvement rates.`);
      continue;
    }

    const improvements = [];
    for (let i = 1; i < data.length; i++) {
      const prevMean = parseFloat(data[i - 1].Mean);
      const currMean = parseFloat(data[i].Mean);

      if (!isNaN(prevMean) && !isNaN(currMean)) {
        const improvement = ((prevMean - currMean) / prevMean) * 100; // Percentage improvement
        improvements.push(improvement);
      }
    }

    const averageImprovement =
      improvements.reduce((sum, value) => sum + value, 0) / improvements.length;

    results.push({ file, averageImprovement });
  }

  // Output results
  console.log("Average Yearly Improvement Rates:");
  results.forEach(({ file, averageImprovement }) => {
    console.log(`${file}: ${averageImprovement.toFixed(2)}%`);
  });
}

function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => rows.push(row))
      .on("end", () => resolve(rows))
      .on("error", (error) => reject(error));
  });
}

calculateImprovementRates().catch((error) => {
  console.error("Error calculating improvement rates:", error);
});