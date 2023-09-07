const path = require("path");
const ExcelJS = require("exceljs");
const { downloadFile } = require("./downloadS3File");
const { parseCsvData } = require("../utils");
const { headers, subHeaders } = require("../constants");

const generateConsolidateReportService = async ({ url }) => {
  try {

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet 1");
    worksheet.addRow(headers);
    worksheet.addRow(subHeaders);
    worksheet.mergeCells("B1:L1");
    worksheet.mergeCells("M1:V1");
    worksheet.mergeCells("W1:AB1"); 

    // await downloadFile(
    //   url,
    //   path.resolve(__dirname, "../uploads", "myfile.csv")
    // );

    const results = await parseCsvData();

    results.map((result) => {
        if(result.Billable === "TRUE" && (result.ProjectId !== null || "")){
            const rowData = [];
            console.log("rowData", rowData);
            for (const key in result) {
              console.log("customData[key]", result[key]);
              rowData.push(result[key]);
            }
            worksheet.addRow(rowData);
        }
    });


    worksheet.getRow(1).alignment = { horizontal: "center" };
    workbook.xlsx
      .writeFile("output.xlsx")
      .then(async () => {
        await sendMail();
      })
      .catch((error) => {
        console.error("Error:", error);
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
