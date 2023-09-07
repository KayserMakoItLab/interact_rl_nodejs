const fs = require("fs");
const path = require("path");
const csv = require("fast-csv");
const { downloadFile } = require("./downloadS3File");
const { parseCsvData } = require("../utils");

const generateConsolidateReportService = async ({ url }) => {
  try {
    // await downloadFile(
    //   url,
    //   path.resolve(__dirname, "../uploads", "myfile.csv")
    // );

    const results = await parseCsvData();

    results.map((result) => {
        if(result.Billable === "TRUE" && (result.ProjectId !== null || "")){
            
        }
    });

    return results;

  } catch (error) {
      console.error("Error downloading file:", error);
      return error
  }
};





module.exports = {
  generateConsolidateReportService,
};
