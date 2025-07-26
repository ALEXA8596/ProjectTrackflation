# How to Run

1. Index.js
- Scrapes each of the results from the Olympics Website and saves it in the RawData folder
- Rate Limits are inevitable, try to start and stop or use proxies to avoid the rate limits.
2. scrapeEachOlympicsEvent.js
- Scrapes each olympics year and saves them
- Rate Limits are inevitable, try to start and stop or use proxies to avoid the rate limits.
3. scrapeIndividualEvent.js
- Scrapes each individualEvent in each of the years
- Rate Limits are inevitable, try to start and stop or use proxies to avoid the rate limits.
4. makeCSVFromRawData.js
- Makes CSV files from the raw data prased in step 1.
5. plotOlympicResults.js
- Plots all the CSV files into plots folder. You're finished!





## Extra Analysis
getLinearRegressionAnalysis
- Gets the Linear Regression Analysis for each of the generated CSV files in olympic_csv

getYearToYearImprovements.js
- Gets the year to year percent improvement