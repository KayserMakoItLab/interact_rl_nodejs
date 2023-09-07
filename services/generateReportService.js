const fs = require("fs");
const path = require("path");
const { downloadFile } = require("./downloadS3File");

const generateConsolidateReport = async ({ url }) => {
  try {
    // await downloadFile(
    //   url,
    //   path.resolve(__dirname, "../uploads", "myfile.csv")
    // );
  } catch (error) {
      console.error("Error downloading file:", error);
      return error
  }
};



module.exports = {
  generateConsolidateReport,
};
