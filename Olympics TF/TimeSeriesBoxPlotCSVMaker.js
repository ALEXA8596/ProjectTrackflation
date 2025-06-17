const fs = require("fs");
const path = require("path");
const csvWriter = require("csv-writer").createObjectCsvWriter;
const csv = require("csv-parser");
var TimeFormat = require("hh-mm-ss");

const tablesDir = path.join(__dirname, "tables");
const outputDir = path.join(__dirname, "olympic_csv");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

(async () => {
  const allEventData = {}; // Store data for each event

  const olympicGames = fs.readdirSync(tablesDir);

  for (const game of olympicGames) {
    const eventFilesDir = path.join(tablesDir, game);
    const files = fs
      .readdirSync(eventFilesDir)
      .filter((file) => file.endsWith(".csv"));

    for (const file of files) {
      try {
        const filePath = path.join(eventFilesDir, file);
        const eventName = path.basename(file, ".csv");
        const isFieldEvent =
          eventName.toLowerCase().includes("shot") ||
          eventName.toLowerCase().includes("discus") ||
          eventName.toLowerCase().includes("jump");
        const marks = [];

        await new Promise((resolve, reject) => {
          fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (row) => {
              const mark = row.Mark;
              console.log(mark)
              if (mark && mark.trim() !== "") {
                marks.push(mark);
              }
            })
            .on("end", () => {
              const parsedMarks = marks.map((mark) => {
                if (isFieldEvent) {
                  return parseFloat(mark);
                } else {
                  try {
                    if (!mark.includes(":")) return Number(mark);
                    const duration = TimeFormat.toS(mark, "mm:ss.sss");
                    if (isNaN(duration)) throw Error("NaN " + duration);
                    return duration;
                  } catch (e) {
                    console.log(e)
                    console.log(mark)
                    if (mark.includes(":")) {
                        const parts = mark.split(":");
                        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                            return Number(parts[0]) * 60 + Number(parts[1]);
                        } else {
                            throw Error("Invalid format: " + mark);
                        }
                    }
                  }
                }
              });

              const n = parsedMarks.length;

              if (n === 0) {
                resolve();
                return;
              }

              const min = Math.min(...parsedMarks);
              const max = Math.max(...parsedMarks);
              const mean = parsedMarks.reduce((a, b) => a + b, 0) / n;
              const median = parsedMarks.sort((a, b) => a - b)[
                Math.floor(n / 2)
              ];
              const stddev = Math.sqrt(
                parsedMarks.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n
              );

              const eventData = {
                Year: game.split(".")[0].split("-").pop(),
                EventName: eventName,
                Min: Number(min.toFixed(4)),
                Max: Number(max.toFixed(4)),
                Mean: Number(mean.toFixed(4)),
                Median: Number(median.toFixed(4)),
                StdDev: Number(stddev.toFixed(4)),
                N: n,
              };

              // Store event data
              if (!allEventData[eventName]) {
                allEventData[eventName] = [];
              }
              allEventData[eventName].push(eventData);

              resolve();
            })
            .on("error", reject);
        });
      } catch (error) {
        console.error(
          `Error processing file ${file} in folder ${game}:`,
          error
        );
      }
    }
  }

  // Write CSV files for each event
  for (const eventName in allEventData) {
    if (allEventData.hasOwnProperty(eventName)) {
      const eventData = allEventData[eventName];

      const csvPath = path.join(outputDir, `${eventName}.csv`);
      const csvWriterInstance = csvWriter({
        path: csvPath,
        header: [
          { id: "Year", title: "Year" },
          { id: "EventName", title: "Event Name" },
          { id: "Min", title: "Minimum" },
          { id: "Max", title: "Maximum" },
          { id: "Mean", title: "Mean" },
          { id: "Median", title: "Median" },
          { id: "StdDev", title: "Standard Deviation" },
          { id: "N", title: "Sample Size" },
        ],
      });

    eventData.sort((a, b) => parseInt(a.Year) - parseInt(b.Year));

      await csvWriterInstance.writeRecords(eventData);
      console.log(`CSV file created at ${csvPath}`);
    }
  }
})();
