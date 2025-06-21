const path = require("path");

module.exports = {
  entry: "./src/main.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.csv$/i,
        use: ["csv-loader"],
        options: {
          dynamicTyping: true,
          header: true,
          skipEmptyLines: true,
        },
      },
      // JSON is supported natively by webpack, no loader needed
    ],
  },
};
