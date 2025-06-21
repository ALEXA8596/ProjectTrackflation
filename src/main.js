import Chart, { LinearScale, CategoryScale } from "chart.js/auto";
import {
  BoxPlotController,
  BoxAndWiskers,
} from "@sgratzl/chartjs-chart-boxplot";

[
  "100m",
  "200m",
  "400m",
  "1600m",
  "3200m",
  "hj",
  "tj",
  "lj",
  "shotput",
  "discus",
].forEach(event => {
    const canvas = document.getElementById(event);
})
