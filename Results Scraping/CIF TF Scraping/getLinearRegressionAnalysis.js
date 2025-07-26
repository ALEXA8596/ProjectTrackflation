const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const folderPath = path.join(__dirname, "EventFiles_with_conversions");

// Linear regression calculation function (from plotOlympicResults.js)
function calculateLinearRegression(xValues, yValues) {
  const n = xValues.length;
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumXX = 0;

  for (let i = 0; i < n; i++) {
    sumX += xValues[i];
    sumY += yValues[i];
    sumXY += xValues[i] * yValues[i];
    sumXX += xValues[i] * xValues[i];
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return {
    slope,
    intercept,
    predict: (x) => slope * x + intercept,
  };
}

// Calculate R-squared correlation coefficient
function calculateRSquared(xValues, yValues, regression) {
  const meanY = yValues.reduce((sum, y) => sum + y, 0) / yValues.length;
  
  let totalSumSquares = 0;
  let residualSumSquares = 0;
  
  for (let i = 0; i < xValues.length; i++) {
    const predicted = regression.predict(xValues[i]);
    totalSumSquares += Math.pow(yValues[i] - meanY, 2);
    residualSumSquares += Math.pow(yValues[i] - predicted, 2);
  }
  
  return 1 - (residualSumSquares / totalSumSquares);
}

async function calculateLinearRegressionAnalysis() {
  const files = fs
    .readdirSync(folderPath)
    .filter((file) => file.endsWith(".csv"))
    .filter((file) => !file.includes("__")); // Filter out duplicate files with __1_, __2_, etc.

  const results = [];

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const data = await readCSV(filePath);

    if (data.length < 2) {
      console.warn(`Not enough data in ${file} to calculate regression.`);
      continue;
    }

    // Extract years and performance metrics
    const years = [];
    const meanValues = [];
    const bestValues = [];
    const medianValues = [];

    // Determine if this is a field event (higher is better) or track event (lower is better)
    const eventName = path.basename(file, ".csv");
    const isFieldEvent = ["shot", "discus", "lj", "hj", "pv"].includes(
      eventName.split("_")[0].toLowerCase()
    );

    for (const row of data) {
      const year = parseInt(row.Year);
      const mean = parseFloat(row.Mean);
      const min = parseFloat(row.Minimum);
      const max = parseFloat(row.Maximum);
      const median = parseFloat(row.Median);

      if (!isNaN(year) && !isNaN(mean)) {
        years.push(year);
        meanValues.push(mean);
        bestValues.push(isFieldEvent ? max : min); // Best performance: max for field, min for track
        medianValues.push(median);
      }
    }

    if (years.length < 2) {
      console.warn(`Not enough valid data points in ${file} for regression analysis.`);
      continue;
    }

    // Normalize years to prevent numerical issues
    const baseYear = Math.min(...years);
    const normalizedYears = years.map(y => y - baseYear);

    // Calculate regressions for different metrics
    const meanRegression = calculateLinearRegression(normalizedYears, meanValues);
    const bestRegression = calculateLinearRegression(normalizedYears, bestValues);
    const medianRegression = calculateLinearRegression(normalizedYears, medianValues);

    // Calculate R-squared values
    const meanRSquared = calculateRSquared(normalizedYears, meanValues, meanRegression);
    const bestRSquared = calculateRSquared(normalizedYears, bestValues, bestRegression);
    const medianRSquared = calculateRSquared(normalizedYears, medianValues, medianRegression);

    // Calculate annual improvement rates (as percentages)
    const startYear = Math.min(...years);
    const endYear = Math.max(...years);
    const yearSpan = endYear - startYear;

    const meanStart = meanRegression.predict(0);
    const meanEnd = meanRegression.predict(yearSpan);
    const meanAnnualChange = ((meanEnd - meanStart) / meanStart) / yearSpan * 100;

    const bestStart = bestRegression.predict(0);
    const bestEnd = bestRegression.predict(yearSpan);
    const bestAnnualChange = ((bestEnd - bestStart) / bestStart) / yearSpan * 100;

    const medianStart = medianRegression.predict(0);
    const medianEnd = medianRegression.predict(yearSpan);
    const medianAnnualChange = ((medianEnd - medianStart) / medianStart) / yearSpan * 100;

    results.push({
      file: file,
      event: eventName,
      isFieldEvent,
      dataPoints: years.length,
      yearRange: `${startYear}-${endYear}`,
      regressions: {
        mean: {
          slope: meanRegression.slope,
          intercept: meanRegression.intercept,
          rSquared: meanRSquared,
          annualChangePercent: meanAnnualChange
        },
        best: {
          slope: bestRegression.slope,
          intercept: bestRegression.intercept,
          rSquared: bestRSquared,
          annualChangePercent: bestAnnualChange
        },
        median: {
          slope: medianRegression.slope,
          intercept: medianRegression.intercept,
          rSquared: medianRSquared,
          annualChangePercent: medianAnnualChange
        }
      }
    });
  }

  // Output results
  console.log("CIF Track & Field Events Linear Regression Analysis");
  console.log("=" .repeat(60));
  console.log();

  results.forEach(({ file, event, isFieldEvent, dataPoints, yearRange, regressions }) => {
    console.log(`Event: ${event}`);
    console.log(`File: ${file}`);
    console.log(`Type: ${isFieldEvent ? 'Field Event (higher is better)' : 'Track Event (lower is better)'}`);
    console.log(`Data Points: ${dataPoints}`);
    console.log(`Year Range: ${yearRange}`);
    console.log();

    console.log("  Mean Performance:");
    console.log(`    Slope: ${regressions.mean.slope.toFixed(6)}`);
    console.log(`    R²: ${regressions.mean.rSquared.toFixed(4)}`);
    console.log(`    Annual Change: ${regressions.mean.annualChangePercent.toFixed(3)}%`);
    console.log();

    console.log("  Best Performance:");
    console.log(`    Slope: ${regressions.best.slope.toFixed(6)}`);
    console.log(`    R²: ${regressions.best.rSquared.toFixed(4)}`);
    console.log(`    Annual Change: ${regressions.best.annualChangePercent.toFixed(3)}%`);
    console.log();

    console.log("  Median Performance:");
    console.log(`    Slope: ${regressions.median.slope.toFixed(6)}`);
    console.log(`    R²: ${regressions.median.rSquared.toFixed(4)}`);
    console.log(`    Annual Change: ${regressions.median.annualChangePercent.toFixed(3)}%`);
    console.log();
    console.log("-".repeat(60));
    console.log();
  });

  // Summary of annual improvement rates
  console.log("SUMMARY - Annual Performance Change Rates (%):");
  console.log("=" .repeat(60));
  console.log();
  
  console.log("Mean Performance Changes:");
  results.forEach(({ event, regressions }) => {
    console.log(`${event}: ${regressions.mean.annualChangePercent.toFixed(2)}%`);
  });
  console.log();

  console.log("Best Performance Changes:");
  results.forEach(({ event, regressions }) => {
    console.log(`${event}: ${regressions.best.annualChangePercent.toFixed(2)}%`);
  });
  console.log();

  console.log("Median Performance Changes:");
  results.forEach(({ event, regressions }) => {
    console.log(`${event}: ${regressions.median.annualChangePercent.toFixed(2)}%`);
  });

  return results;
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

// Export for potential use in other modules
module.exports = {
  calculateLinearRegression,
  calculateRSquared,
  calculateLinearRegressionAnalysis
};

// Run the analysis if this file is executed directly
if (require.main === module) {
  calculateLinearRegressionAnalysis().catch((error) => {
    console.error("Error calculating linear regression analysis:", error);
  });
}
