const fs = require("fs");
const path = require("path");

const parentFolder = path.join(__dirname, "CIF");

const newFolder = path.join(__dirname, "CIF_with_conversions");

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

        delete result.IDDiv;
        delete result.Exhibition;
        delete result.JD;
        delete result.pr;
        delete result.sr;
        delete result.EventID;
        delete result.PersonalEvent;
        delete result.EventTypeID;
        delete result.Official;
        delete result.AgeGrade;
        delete result.EditorID;
        delete result.hasSplitsSeries;
        delete result.MediaCount;


        result.ShortCode = metricEvent;
      }
      return result;
    });
    results = results.filter((result) => result !== null);
    const jsonPath = path.join(newFolder, year, `${resultFile}`);

    if (!fs.existsSync(path.join(newFolder, year))) {
      fs.mkdirSync(path.join(newFolder, year), { recursive: true });
    }

    fs.writeFileSync(jsonPath, JSON.stringify({ results }, null, 2));
    console.log(`Converted results saved to ${jsonPath}`);
  }
}
