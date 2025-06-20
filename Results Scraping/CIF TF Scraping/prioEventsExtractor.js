const fs = require("fs");
const path = require("path");

/**
Filter "Round" = "F" (Final)

Filter out events whose Division key contains "Unified", "Exhibition", "Ambulatory Para", "Wheelchair Para", or "Para"

Split "flatEvents" into Gender = "M" and Gender = "F"

Get 100m, 400m, 1600, 3200

Shotput, Discus, Long Jump, High Jump, Polevault
 */

(async () => {
  const folders = fs.readdirSync("./CIF/");

  for (const file in folders) {
    const year = folders[file];
    const filePath = path.join("./CIF/", year, "data.json");

    console.log(`Checking year: ${year}`);
    console.log(`Looking for file: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      continue;
    }

    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    // Filter events
    const flatEvents = data.flatEvents.filter(
      (event) =>
        event.Round === "F" &&
        !event.Division.includes("Unified") &&
        !event.Division.includes("Exhibition") &&
        !event.Division.includes("Ambulatory Para") &&
        !event.Division.includes("Wheelchair Para") &&
        !event.Division.includes("Para") &&
        // Jump Off
        !event.Division.includes("Jumpoff") &&
        // Run Off
        !event.Division.includes("Runoff") &&
        // Ambulatory and Wheelchair
        !event.Division.includes("Ambulatory") &&
        !event.Division.includes("Wheelchair")
    );

    // Split into genders

    const maleEvents = flatEvents.filter((event) => event["Gender"] === "M");
    const femaleEvents = flatEvents.filter((event) => event["Gender"] === "F");

    // Get specific events
    const specificMaleEvents = maleEvents.filter(
      (event) =>
        [
          "100m",
          "400m",
          "1600m",
          "3200m",
          "100y",
          "220y",
          "440y",
          "1mile",
        ].includes(event["EventShort"]) ||
        ["shot", "discus", "lj", "hj", "pv"].includes(event["EventShort"])
    );

    const specificFemaleEvents = femaleEvents.filter(
      (event) =>
        [
          "100m",
          "400m",
          "1600m",
          "3200m",
          "100y",
          "220y",
          "440y",
          "1mile",
        ].includes(event["EventShort"]) ||
        ["shot", "discus", "lj", "hj", "pv"].includes(event["EventShort"])
    );

    // Save results as individual JSON files for each event and gender

    // if there are multiple duplicate events, add an increment to the filename

    ["100m", "400m", "1600m", "3200m", "100y", "220y", "440y", "1mile"].forEach(
      (eventShort) => {
        const maleEvent = specificMaleEvents.filter(
          (event) => event["EventShort"] === eventShort
        );
        const femaleEvent = specificFemaleEvents.filter(
          (event) => event["EventShort"] === eventShort
        );
        if (maleEvent) {
          if (maleEvent.length > 1) {
            console.log(`Multiple events found for ${eventShort} M in ${year}`);
            //   print each of the Division values
            for (let i = 0; i < maleEvent.length; i++) {
              console.log(`Division: ${maleEvent[i].Division}`);
            }
          }
          for (i = 0; i < maleEvent.length; i++) {
            const event = maleEvent[i];
            const filename = `./CIF/${year}/${eventShort}_M_${i + 1}.json`;
            // make a copy of the event object to avoid overwriting
            const eventCopy = JSON.parse(JSON.stringify(event));

            // delete isPersonal, isField, DivId, and hasSplitsSeries from the copy
            delete eventCopy.isPersonal;
            delete eventCopy.isField;
            delete eventCopy.DivId;
            delete eventCopy.hasSplitsSeries;

            // from each result in eventCopy.results, delete the following keys: "Exhibition", "JD", "pr", "sr", "PersonalEvent", "disGrade", "SortIntRaw", "SortIntTemp", "Official", "IDResult", "EditorID", "MediaCount", "AgeGrade", "hasSplitsSeries",

            eventCopy.results.forEach((result) => {
              delete result.Exhibition;
              delete result.JD;
              delete result.pr;
              delete result.sr;
              delete result.PersonalEvent;
              delete result.disGrade;
              delete result.SortIntRaw;
              delete result.SortIntTemp;
              delete result.Official;
              delete result.IDResult;
              delete result.EditorID;
              delete result.MediaCount;
              delete result.AgeGrade;
              delete result.hasSplitsSeries;
            });

            fs.writeFileSync(filename, JSON.stringify(event, null, 2));

            console.log(`Saved: ${filename}`);
          }
        }

        if (femaleEvent) {
          if (femaleEvent.length > 1) {
            console.log(`Multiple events found for ${eventShort} F in ${year}`);
            //   print each of the Division values
            for (let i = 0; i < femaleEvent.length; i++) {
              console.log(`Division: ${femaleEvent[i].Division}`);
            }
          }
          for (i = 0; i < femaleEvent.length; i++) {
            const event = femaleEvent[i];
            const filename = `./CIF/${year}/${eventShort}_F_${i + 1}.json`;
            // make a copy of the event object to avoid overwriting
            const eventCopy = JSON.parse(JSON.stringify(event));
            // delete isPersonal, isField, DivId, and hasSplitsSeries from the copy
            delete eventCopy.isPersonal;
            delete eventCopy.isField;
            delete eventCopy.DivId;
            delete eventCopy.hasSplitsSeries;

            // from each result in eventCopy.results, delete the following keys: "Exhibition", "JD", "pr", "sr", "PersonalEvent", "disGrade", "SortIntRaw", "SortIntTemp", "Official", "IDResult", "EditorID", "MediaCount", "AgeGrade", "hasSplitsSeries",
            eventCopy.results.forEach((result) => {
              delete result.Exhibition;
              delete result.JD;
              delete result.pr;
              delete result.sr;
              delete result.PersonalEvent;
              delete result.disGrade;
              delete result.SortIntRaw;
              delete result.SortIntTemp;
              delete result.Official;
              delete result.IDResult;
              delete result.EditorID;
              delete result.MediaCount;
              delete result.AgeGrade;
              delete result.hasSplitsSeries;
            });
            fs.writeFileSync(filename, JSON.stringify(event, null, 2));
            console.log(`Saved: ${filename}`);
          }
        }
      }
    );

    // Field events

    ["shot", "discus", "lj", "hj", "pv"].forEach((eventShort) => {
      const maleEvent = specificMaleEvents.filter(
        (event) => event["EventShort"] === eventShort
      );
      const femaleEvent = specificFemaleEvents.filter(
        (event) => event["EventShort"] === eventShort
      );
      if (maleEvent) {
        if (maleEvent.length > 1) {
          console.log(`Multiple events found for ${eventShort} M in ${year}`);
          //   print each of the Division values
          for (let i = 0; i < maleEvent.length; i++) {
            console.log(`Division: ${maleEvent[i].Division}`);
          }
        }
        for (i = 0; i < maleEvent.length; i++) {
          const event = maleEvent[i];
          const filename = `./CIF/${year}/${eventShort}_M_${i + 1}.json`;
          // make a copy of the event object to avoid overwriting
          const eventCopy = JSON.parse(JSON.stringify(event));

          // delete isPersonal, isField, DivId, and hasSplitsSeries from the copy
          delete eventCopy.isPersonal;
          delete eventCopy.isField;
          delete eventCopy.DivId;
          delete eventCopy.hasSplitsSeries;

          // from each result in eventCopy.results, delete the following keys: "Exhibition", "JD", "pr", "sr", "PersonalEvent", "disGrade", "SortIntRaw", "SortIntTemp", "Official", "IDResult", "EditorID", "MediaCount", "AgeGrade", "hasSplitsSeries",

          eventCopy.results.forEach((result) => {
            delete result.Exhibition;
            delete result.JD;
            delete result.pr;
            delete result.sr;
            delete result.PersonalEvent;
            delete result.disGrade;
            delete result.SortIntRaw;
            delete result.SortIntTemp;
            delete result.Official;
            delete result.IDResult;
            delete result.EditorID;
            delete result.MediaCount;
            delete result.AgeGrade;
            delete result.hasSplitsSeries;
          });

          fs.writeFileSync(filename, JSON.stringify(eventCopy, null, 2));

          console.log(`Saved: ${filename}`);
        }
      }

      if (femaleEvent) {
        if (femaleEvent.length > 1) {
          console.log(`Multiple events found for ${eventShort} F in ${year}`);
          //   print each of the Division values
          for (let i = 0; i < femaleEvent.length; i++) {
            console.log(`Division: ${femaleEvent[i].Division}`);
          }
        }
        for (i = 0; i < femaleEvent.length; i++) {
          const event = femaleEvent[i];
          const filename = `./CIF/${year}/${eventShort}_F_${i + 1}.json`;
          // make a copy of the event object to avoid overwriting
          const eventCopy = JSON.parse(JSON.stringify(event));
          // delete isPersonal, isField, DivId, and hasSplitsSeries from the copy
          delete eventCopy.isPersonal;
          delete eventCopy.isField;
          delete eventCopy.DivId;
          delete eventCopy.hasSplitsSeries;

          // from each result in eventCopy.results, delete the following keys: "Exhibition", "JD", "pr", "sr", "PersonalEvent", "disGrade", "SortIntRaw", "SortIntTemp", "Official", "IDResult", "EditorID", "MediaCount", "AgeGrade", "hasSplitsSeries",
          eventCopy.results.forEach((result) => {
            delete result.Exhibition;
            delete result.JD;
            delete result.pr;
            delete result.sr;
            delete result.PersonalEvent;
            delete result.disGrade;
            delete result.SortIntRaw;
            delete result.SortIntTemp;
            delete result.Official;
            delete result.IDResult;
            delete result.EditorID;
            delete result.MediaCount;
            delete result.AgeGrade;
            delete result.hasSplitsSeries;
          });
          fs.writeFileSync(filename, JSON.stringify(eventCopy, null, 2));
          console.log(`Saved: ${filename}`);
        }
      }
    });
  }
})();
