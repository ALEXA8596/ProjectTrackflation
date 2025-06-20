const fs = require("fs");
const path = require("path");
const csvWriter = require("csv-writer").createObjectCsvWriter;

(async () => {
  const path = "./RAW_DATA/results/";

  const folders = await fs.readdirSync(path);

  // Sort folders by year (extracted from folder names)
  folders.sort((a, b) => {
    const yearA = Number(a.split(".")[0].split("-").pop());
    const yearB = Number(b.split(".")[0].split("-").pop());
    return yearA - yearB;
  });

  // console.log(folders);

  for (const index in folders) {
    console.log(folders[index]);
    var folder = fs.readdirSync(path + folders[index]);
    folder = folder.filter(
      (file) =>
        !file.toLowerCase().includes("x") &&
        !file.toLowerCase().includes("relay")
    );
    // console.log(folder);
    // folder has all the json files

    const hasAllReqsCheck = true;

    const gender = ["men", "women"];

    const necessaryEvents = [
      "100m",
      "200m",
      "400m",
      "1500m",
      "5000m",
      "discus-throw",
      "shot-put",
      "long-jump",
      "triple-jump",
      "high-jump",
    ];

    // the file name might either be "GENDER-EVENT" or "EVENT-GENDER", so check both

    // Create a map to track which events exist
    const eventExists = {};

    const eventsDirectory = {};

    // Initialize the map for all gender/event combinations
    gender.forEach((g) => {
      eventExists[g] = {};
      eventsDirectory[g] = {}; // Initialize eventsDirectory
      necessaryEvents.forEach((e) => {
        eventExists[g][e] = false;
      });
    });

    // Check each file in the folder
    folder.forEach((file) => {
      const fileName = file.toLowerCase();
      gender.forEach((g) => {
        necessaryEvents.forEach((e) => {
          const eventPattern = new RegExp(`(^|-)${e}`);
          if (
            fileName.includes(g) &&
            eventPattern.test(fileName) &&
            !(g === "men" && fileName.includes("women"))
          ) {
            eventExists[g][e] = true;
            eventsDirectory[g][e] = path + folders[index] + "/" + file; // Store the full file path
          }
        });
      });
    });

    // Log which events are missing
    gender.forEach((g) => {
      necessaryEvents.forEach((e) => {
        if (!eventExists[g][e]) {
          console.log(`Missing: ${g} ${e}`);
          // hasAllReqsCheck = false;
        }
      });
    });

    const csvPath = "./tables/";

    for (const g of gender) {
      for (const e of necessaryEvents) {
        if (eventExists[g][e]) {
          const filePath = eventsDirectory[g][e];
          const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

          const olympicsFolder = `${csvPath}${folders[index]}/`;
          if (!fs.existsSync(olympicsFolder)) {
            fs.mkdirSync(olympicsFolder);
          }

          const writer = csvWriter({
            path: `${olympicsFolder}${e}-${g}.csv`,
            header: [
              { id: "year", title: "Year" },
              { id: "place", title: "Place" },
              { id: "name", title: "Name" },
              { id: "country", title: "Country" },
              { id: "mark", title: "Mark" },
            ],
          });

          const isFieldEvent = e.toLowerCase().includes("shot") ||
          e.toLowerCase().includes("discus") ||
          e.toLowerCase().includes("jump");

          data.sort((a, b) => {
            const yearA = parseInt(a.year, 10);
            const yearB = parseInt(b.year, 10);
            return yearA - yearB;
          });

          const csvData = data.map((row) => ({
            year: folders[index].split("-").pop(),
            place: row.place,
            name: row.name,
            country: row.country,
            mark: row.mark
              .split(/[^0-9:.]/, 1)[0]
              .trim()
              .replaceAll("00:", ""),
          }));

          await writer.writeRecords(csvData);
        }
      }
    }
  }
})();
