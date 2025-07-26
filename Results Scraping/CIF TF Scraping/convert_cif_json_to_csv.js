const fs = require("fs");
const path = require("path");
const csvWriter = require("csv-writer").createObjectCsvWriter;

const parentFolder = path.join(__dirname, "CIF_no_conversions");

const csvFolder = path.join(__dirname, "CIF_CSV");

const mapping = {
  "100y": {
    metric: "100m",
    addition: 0.9,
  },
  "220y": {
    metric: "200m",
    addition: -0.1,
  },
  "440y": {
    metric: "400m",
    addition: -0.3,
  },
  "1mile": {
    metric: "1600m",
    addition: -1.6,
  },
};

for (const year of fs.readdirSync(parentFolder)) {
  console.log(year);
  for (var resultFile of fs.readdirSync(path.join(parentFolder, year))) {
    const filePath = path.join(parentFolder, year, resultFile);
    if (fs.statSync(filePath).isDirectory()) {
      continue; // Skip directories
    }
    if (resultFile.includes("data.json")) {
      continue;
    }

    var results = (JSON.parse(fs.readFileSync(filePath, "utf-8"))).results;
    const eventShort = resultFile.split("_")[0];
    if (Object.keys(mapping).includes(eventShort)) {
        resultFile = resultFile.replace(eventShort, mapping[eventShort].metric);
        console.log(`Renaming ${resultFile} to ${mapping[eventShort].metric}`);
    }
    results = results.map((result) => {
      if (result.SortInt === 20000001) {
        // remove from array
        return null;
      }

      result.originalImperialSortInt = null;

      if (Object.keys(mapping).includes(eventShort)) {
        const metricEvent = mapping[eventShort].metric;
        const addition = mapping[eventShort].addition;
        result.originalImperialSortInt = result.SortInt;
        result.SortInt = result.SortInt + addition * 1000;
        result.SortIntRaw = result.SortIntRaw + addition * 1000;
        result.SortIntTemp = result.SortIntTemp + addition * 1000;


        result.ShortCode = metricEvent;
      }
      return result;
    });
    results = results.filter((result) => result !== null);
    const csvPath = path.join(csvFolder, year, `${resultFile}.csv`);

    if (!fs.existsSync(path.join(csvFolder, year))) {
      fs.mkdirSync(path.join(csvFolder, year), { recursive: true });
    }

    const writer = csvWriter({
      path: csvPath,
      header: [
        { id: "Place", title: "Place" },
        { id: "Round", title: "Round" },
        { id: "SortIntRaw", title: "SortIntRaw" },
        { id: "SortIntTemp", title: "SortIntTemp" },
        { id: "ShortCode", title: "ShortCode" },
        { id: "FirstName", title: "FirstName" },
        { id: "LastName", title: "LastName" },
        { id: "SchoolName", title: "SchoolName" },
        { id: "Grade", title: "Grade" },
        { id: "AthleteID", title: "AthleteID" },
        { id: "SortInt", title: "SortInt" },
        { id: "originalImperialSortInt", title: "originalImperialSortInt" },
      ],
    });

    writer
      .writeRecords(results)
      .then(() => {
        console.log(`CSV file created at: ${csvPath}`);
      })
      .catch((err) => {
        console.error(`Error writing CSV file: ${err}`);
      });
  }
}
