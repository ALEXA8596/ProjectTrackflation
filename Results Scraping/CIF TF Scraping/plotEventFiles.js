const fs = require("fs");
const path = require("path");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const csv = require("csv-parser");
const { LinearScale, CategoryScale } = require("chart.js");
const {
  BoxPlotController,
  BoxAndWiskers,
} = require("@sgratzl/chartjs-chart-boxplot");

const eventFilesDir = path.join(__dirname, "EventFiles_with_conversions");
const outputDir = path.join(__dirname, "plots_with_conversions");

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}
// Configure chart dimensions
const width = 1200;
const height = 800;
const chartCallback = (ChartJS) => {
  ChartJS.register(
    BoxPlotController,
    BoxAndWiskers,
    LinearScale,
    CategoryScale
  );
};

const chartJSNodeCanvas = new ChartJSNodeCanvas({
  width,
  height,
  chartCallback,
});

async function processCSVFile(filePath) {
  const data = [];
  let minYear = Infinity;
  let maxYear = -Infinity;

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        const year = parseInt(row.Year);
        const min = parseFloat(row.Minimum);
        const max = parseFloat(row.Maximum);
        const median = parseFloat(row.Median);
        const mean = parseFloat(row.Mean);
        const stdDev = parseFloat(row["Standard Deviation"]);

        data.push({
          year,
          min,
          max,
          median,
          mean,
          stdDev,
        });

        minYear = Math.min(minYear, year);
        maxYear = Math.max(maxYear, year);
      })
      .on("end", () => {
        const allYearsData = [];
        for (let year = minYear; year <= maxYear; year++) {
          const existingData = data.find((d) => d.year === year);
          if (existingData) {
            allYearsData.push(existingData);
          } else {
            allYearsData.push({
              year,
              min: null,
              max: null,
              median: null,
              mean: null,
              stdDev: null,
            });
          }
        }
        resolve(allYearsData.sort((a, b) => a.year - b.year));
      })
      .on("error", reject);
  });
}

async function createBoxPlot(data, eventName) {
  var configuration = {
    type: "boxplot",
    data: {
      labels: data.map((d) => d.year.toString()),
      datasets: [
        {
          label: eventName,
          data: data.map((d) => ({
            min: d.min,
            q1: d.mean - d.stdDev,
            median: d.median,
            q3: d.mean + d.stdDev,
            max: d.max,
          })),
          backgroundColor: "rgba(75, 192, 192, 0.5)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: `${eventName} Performance Over Time`,
          font: {
            size: 16,
          },
        },
        legend: {
          display: true,
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: "Time/Distance",
          },
        },
        x: {
          title: {
            display: true,
            text: "Year",
          },
        },
      },
    },
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
}

// Execute the script
generateAllPlots().catch(console.error);

async function createBestMarksPlot(data, eventName) {

  const isFieldEvent = ["shot", "discus", "lj", "hj", "pv"].includes(
    eventName.split("_")[0].toLowerCase()
  );

  var configuration = {
    type: "line",
    data: {
      labels: data.map((d) => d.year.toString()),
      datasets: [
        {
          label: "Best Marks",
          data: data.map((d) => d.min), // Use min for track (fastest time), max for field (longest/highest)
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          tension: 0.1,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: `${eventName} Best Marks Over Time`,
          font: { size: 16 },
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: "Performance",
          },
        },
        x: {
          title: {
            display: true,
            text: "Year",
          },
        },
      },
    },
  };

  const years = data.map((d) => d.year);
  const values = isFieldEvent ? data.map((d) => d.max) : data.map((d) => d.min);
  configuration = addRegressionLines(
    configuration,
    years,
    values,
    "Best Marks"
  );

  return await chartJSNodeCanvas.renderToBuffer(configuration);
}

async function createMeanPlot(data, eventName) {
  var configuration = {
    type: "line",
    data: {
      labels: data.map((d) => d.year.toString()),
      datasets: [
        {
          label: "Mean Performance",
          data: data.map((d) => d.mean),
          borderColor: "rgba(54, 162, 235, 1)",
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          tension: 0.1,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: `${eventName} Mean Performance Over Time`,
          font: { size: 16 },
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: "Performance",
          },
        },
        x: {
          title: {
            display: true,
            text: "Year",
          },
        },
      },
    },
  };

  const years = data.map((d) => d.year);
  const values = data.map((d) => d.mean);
  configuration = addRegressionLines(configuration, years, values, "Mean");

  return await chartJSNodeCanvas.renderToBuffer(configuration);
}

async function createMedianPlot(data, eventName) {
  var configuration = {
    type: "line",
    data: {
      labels: data.map((d) => d.year.toString()),
      datasets: [
        {
          label: "Median Performance",
          data: data.map((d) => d.median),
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.1,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: `${eventName} Median Performance Over Time`,
          font: { size: 16 },
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: "Performance",
          },
        },
        x: {
          title: {
            display: true,
            text: "Year",
          },
        },
      },
    },
  };

  const years = data.map((d) => d.year);
  const values = data.map((d) => d.median);
  configuration = addRegressionLines(configuration, years, values, "Median");

  return await chartJSNodeCanvas.renderToBuffer(configuration);
}

async function generateAllPlots() {
  const files = fs
    .readdirSync(eventFilesDir)
    .filter((file) => file.endsWith(".csv"));

  for (const file of files) {
    try {
      console.log(`Processing ${file}...`);
      const filePath = path.join(eventFilesDir, file);
      const data = await processCSVFile(filePath);
      const eventName = path.basename(file, ".csv");

      // Generate all plot types
      const boxPlotBuffer = await createBoxPlot(data, eventName);
      const bestMarksBuffer = await createBestMarksPlot(data, eventName);
      const meanBuffer = await createMeanPlot(data, eventName);
      const medianBuffer = await createMedianPlot(data, eventName);

      // Save all plots
      // Create subdirectories if they don't exist
      const plotTypes = ["boxplots", "best_marks", "means", "medians"];
      plotTypes.forEach((type) => {
        const dir = path.join(outputDir, type);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }
      });

      // Save plots in their respective directories
      fs.writeFileSync(
        path.join(outputDir, "boxplots", `${eventName}.png`),
        boxPlotBuffer
      );
      fs.writeFileSync(
        path.join(outputDir, "best_marks", `${eventName}.png`),
        bestMarksBuffer
      );
      fs.writeFileSync(
        path.join(outputDir, "means", `${eventName}.png`),
        meanBuffer
      );
      fs.writeFileSync(
        path.join(outputDir, "medians", `${eventName}.png`),
        medianBuffer
      );

      console.log(`Created plots for ${eventName}`);
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  }
}

// Add these helper functions after the imports
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

// function calculateExponentialRegression(xValues, yValues) {
//   // Check if all yValues are positive
//   if (yValues.some(y => y <= 0)) {
//     console.warn("Cannot calculate exponential regression: yValues must be positive.");
//     return null;
//   }

//   // Convert to natural log for exponential regression
//   const lnY = yValues.map(y => Math.log(y));

//   // Calculate linear regression on log-transformed data
//   const linearReg = calculateLinearRegression(xValues, lnY);

//   // Convert back to exponential form
//   const a = Math.exp(linearReg.intercept);
//   const b = linearReg.slope;

//   return {
//     a,
//     b,
//     predict: x => a * Math.exp(b * x),
//   };
// }

function addRegressionLines(configuration, years, values, metric) {
  // Filter out null values
  const validData = years
    .map((year, index) => ({ year, value: values[index] }))
    .filter(({ value }) => value !== null);

  const validYears = validData.map(({ year }) => year);
  const validValues = validData.map(({ value }) => value);

  // Normalize years to prevent numerical issues
  const baseYear = Math.min(...validYears); // Use valid years for base year
  const normalizedYears = validYears.map((y) => y - baseYear);

  // Calculate regressions
  const linearReg = calculateLinearRegression(normalizedYears, validValues);

  // Add regression lines to the plot
  configuration.data.datasets.push({
    label: `${metric} Linear Trend`,
    data: years.map((y) =>
      validYears.includes(y) ? linearReg.predict(y - baseYear) : null
    ), // Predict only for valid years
    borderColor: "rgba(255, 0, 0, 0.5)",
    borderDash: [5, 5],
    fill: false,
    tension: 0,
  });

  return configuration;
}