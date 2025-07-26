const fs = require("fs");
const path = require("path");
const csvWriter = require("csv-writer").createObjectCsvWriter;

const outputFile = "CIFresults_with_conversions.csv";

(async () => {
  const dir = "CIF_with_conversions";
  const folders = fs.readdirSync(dir);
  const allData = [];

  for (const folder of folders) {
    // folder is the year

    console.log(`Checking year: ${folder}`);
    // console.log(`Looking for file: ${filePath}`);

    const folderPath = path.join(dir, folder);
    var files = fs.readdirSync(folderPath);
    files = files.filter(
      (file) => file.endsWith(".json") && file !== "data.json"
    );
    for (const file of files) {
      try {
        // file name format: "EventShortName"_"GenderAbbreviation"_"Iteration".json

        const data = JSON.parse(
          fs.readFileSync(path.join(folderPath, file), "utf8")
        );
        const eventShortName = file.split("_")[0];
        const genderAbbreviation = file.split("_")[1];

        // DQ terms: DQ, NH, DNS, NM, DNF, or SortIntRaw or SortIntTemp = 20000001

        if (!["shot", "discus", "lj", "hj", "pv"].includes(data.EventShort)) {
          const maxResults = ["1600m", "3200m", "1mile"].includes(
            data.EventShort
          )
            ? 12
            : 9;
          const dataToAnalyze = data.results
            .filter(
              (result) =>
                !["DQ", "NH", "DNS", "NM", "DNF"].includes(result.Result) &&
                result.SortInt !== 20000001
            )
            .slice(0, maxResults);

          const n = dataToAnalyze.length;
         

          if (n === 0) continue;

          // calculate min, max, mean, median, and stddev
          const values = dataToAnalyze.map((result) => {
            // console.log(result.SortIntRaw);
            return parseFloat(result.SortInt) / 1000;
          });
          // console.log(values);
          const min = Math.min(...values);
          const max = Math.max(...values);
          const mean = values.reduce((a, b) => a + b, 0) / n;
          const median = values.sort((a, b) => a - b)[Math.floor(n / 2)];
          const stddev = Math.sqrt(
            values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n
          );

          let name = `${eventShortName} ${genderAbbreviation}`;

          if (
            files.filter((f) =>
              f.startsWith(eventShortName + "_" + genderAbbreviation + "_")
            ).length > 1
          ) {
            name += ` (${file.split("_")[2].replace(".json", "")})`;
          }
          allData.push({
            Year: folder,
            Name: name,
            EventShortName: eventShortName,
            GenderAbbreviation: genderAbbreviation,
            Min: Number(min.toFixed(4)),
            Max: Number(max.toFixed(4)),
            Mean: Number(mean.toFixed(4)),
            Median: Number(median.toFixed(4)),
            StdDev: Number(stddev.toFixed(4)),
            N: n,
          });
        } else if (
          ["shot", "discus", "lj", "hj", "pv"].includes(data.EventShort)
        ) {
          const dataToAnalyze = data.results
            .filter(
              (result) =>
                !["DQ", "NH", "DNS", "NM", "DNF"].includes(result.Result) &&
                result.SortInt !== 20000001
            )
            .slice(0, 12);

          const n = dataToAnalyze.length;

          if (n === 0) continue;

          // calculate min, max, mean, median, and stddev

          for (const result of dataToAnalyze) {
            // Convert SortIntRaw to inches
            // subtract from 2 * 10^7 to get inches
            result.SortInt = 20000000 - result.SortInt;
          }

          const values = dataToAnalyze.map(
            (result) => parseFloat(result.SortInt) / 1000
          );

          const min = Math.min(...values);
          const max = Math.max(...values);
          const mean = values.reduce((a, b) => a + b, 0) / n;
          const median = values.sort((a, b) => a - b)[Math.floor(n / 2)];
          const stddev = Math.sqrt(
            values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n
          );

          let name = `${eventShortName} ${genderAbbreviation}`;
          if (
            files.filter((f) =>
              f.startsWith(eventShortName + "_" + genderAbbreviation + "_")
            ).length > 1
          ) {
            name += ` (${file.split("_")[2].replace(".json", "")})`;
          }
          allData.push({
            Year: folder,
            Name: name,
            EventShortName: eventShortName,
            GenderAbbreviation: genderAbbreviation,
            Min: Number(min.toFixed(4)),
            Max: Number(max.toFixed(4)),
            Mean: Number(mean.toFixed(4)),
            Median: Number(median.toFixed(4)),
            StdDev: Number(stddev.toFixed(4)),
            N: n,
          });
        }
      } catch (error) {
        console.error(
          `Error processing file ${file} in folder ${folder}:`,
          error
        );
      }
    }

    // make a csv file with allData
    const csvPath = path.join(__dirname, outputFile);
    const csvWriterInstance = csvWriter({
      path: csvPath,
      header: [
        { id: "Year", title: "Year" },
        { id: "Name", title: "Event Name" },
        { id: "EventShortName", title: "Event Short Name" },
        { id: "GenderAbbreviation", title: "Gender" },
        { id: "Min", title: "Minimum" },
        { id: "Max", title: "Maximum" },
        { id: "Mean", title: "Mean" },
        { id: "Median", title: "Median" },
        { id: "StdDev", title: "Standard Deviation" },
        { id: "N", title: "Sample Size" },
      ],
    });

    await csvWriterInstance.writeRecords(allData);
  }
})();
