const fs = require("fs");
const path = require("path");
const csv = require("fast-csv");

const reportConsolidationService = async (filename) => {
  const data = await parseCsvData(filename);
  return data;
};

async function parseCsvData(fileName) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(path.resolve(__dirname, "../uploads", fileName))
      .pipe(csv.parse({ headers: true }))
      .on("error", (error) => {
        reject(error);
      })
      .on("data", (row) => {
        results.push(row);
      })
      .on("end", () => {
        resolve(results);
      });
  });
}

module.exports = {
  reportConsolidationService,
};
