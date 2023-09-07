const fs = require("fs");
const path = require("path");
const csv = require("fast-csv");
const ExcelJS = require("exceljs");
const AWS = require("aws-sdk");
const { headers, subHeaders, customData } = require("../constants");
const { sendMail } = require("./mail");

AWS.config.update({
  region: "ap-south-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

// Create an S3 instance
const S3 = new AWS.S3();

const bucketName = "rocketlane-interact-1234";

const reportConsolidationService = async (url) => {

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sheet 1");
  worksheet.addRow(headers);
  worksheet.addRow(subHeaders);

  await downloadCsvFromS3(url);

  const data = await parseCsvData();

  console.log('data', data, url);

  

  const filteredData = data.map((result) => {
    if (result.Billable === "TRUE" && (result.ProjectId !== null || "")) {
      const rowData = [];
      console.log("rowData", rowData);
      for (const key in customData) {
        console.log("customData[key]", customData[key]);
        rowData.push(customData[key]);
      }
      worksheet.addRow(rowData);
    }
  });

  workbook.xlsx
    .writeFile("output.xlsx")
    .then(async () => {
      await sendMail();
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  return filteredData;
};

async function downloadCsvFromS3(url) {
  const params = {
    Bucket: bucketName,
    Key: url,
  };

  const localFilePath = path.resolve(__dirname, "../uploads", "myfile.csv");

  const fileStream = fs.createWriteStream(localFilePath);

  S3.getObject(params)
    .createReadStream()
    .pipe(fileStream)
    .on("error", (err) => {
      console.error("Error downloading from S3:", err);
    })
    .on("close", () => {
      console.log("CSV file downloaded and saved locally:", localFilePath);
    });
}


async function parseCsvData() {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(path.resolve(__dirname, "../uploads", "myfile.csv"))
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
