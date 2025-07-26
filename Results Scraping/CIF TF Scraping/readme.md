# CIF Processing

This is a bit more complicated compared to the Olympic Scraping!

1. index.js
- Searches Athletic.net for each yearly championship meet result since ~1920
1b. convertExtensions
- I accidentally set the file extension as html when it should've been .json. This file was created in order to change the extension names back.
2. csv.js
- This reads each of the search results from step 1 and converts them into one CSV file.
3. CIFresultsParser.js
- This actually fetches all the results from the CSV file created.
4. prioEventsExtractor
- This extracts the events we are looking for from the results parsed in CIFresultsParser.

5. TimeSeriesBloxPlotCSVMaker
- This makes CSV file from the event data extracted in step 4. The Max, Min, Average, Median, and Quartiles are found so that they can later be used to create candlestick charts.

6. splitEvents
- This splits the CSV file made in part 5 into their own separate files.

7. plotEventFiles.js
- This actually makes the plots described in the CSV files name in part 5 and 6.


## Extra Analysis
getLinearRegressionAnalysis
- Gets the Linear Regression Analysis for each of the generated CSV files in FinalEventFiles

getYearToYearImprovements.js
- Gets the year to year percent improvement from FinalEventFiles


# Discrepancies

## Data

1990 girls 100m change the largest to 12.23


## Final CSVs

1988 boys and girls mile - remove it



