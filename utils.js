const fs = require("fs");
const path = require("path");
const csv = require("fast-csv");

const parseCsvData = async () => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(path.resolve(__dirname, "./uploads", "myfile.csv"))
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
};

const uuidv4 = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

module.exports = {
  parseCsvData,
  uuidv4,
};
