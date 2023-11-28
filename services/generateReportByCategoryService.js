const path = require("path");
const ExcelJS = require("exceljs");
const fs = require("fs");
const csv = require("fast-csv");
const { downloadFile } = require("./downloadS3File");
const { headers, subHeaders } = require("../constants");
const { getProjectDetailsById, getTaskDetailsById } = require("./apiService");
const { sendMail } = require("./mail");
const moment = require("moment");
const { deleteReportDetails } = require("../db");

const generateReportByCategoryService = async (url, id, email) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet 1");
    console.log("url", url);
    await downloadFile(
      url,
      path.resolve(__dirname, "../uploads", "myfile.csv")
    );

    const generatedReport = await new Promise((resolve, reject) => {
      const results = [];
      return fs
        .createReadStream(path.resolve(__dirname, "../uploads", "myfile.csv"))
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

    const data = await Promise.all(
      generatedReport.map(async (result) => {
        if (
          (((result.ProjectId !== "") ||
          result.ProjectId !== null) && (result.Billable === "true"))
         ) {
          const projectInfo = await getProjectDetailsById(result.ProjectId);
          const categoryValue = await (projectInfo?.fields || []).find(
            (value) => value?.fieldLabel === "Category"
          )?.fieldValue;
          return { catergoryFieldName: categoryValue === undefined ? 'No Category' : categoryValue, ...result }; // Return the categoryValue
        }
        return { catergoryFieldName:'Non Projects', ...result };
      })
    );

    // const filteredData = data.filter((item) => item !== null);

    data.reverse();

     const result = data.reduce((agg, each) => {
        if (!agg[each.catergoryFieldName]) {
          agg[each.catergoryFieldName] = {
            users: {},
          };
        }
       if (!agg[each.catergoryFieldName].users[each.UserName]) {
         agg[each.catergoryFieldName].users[each.UserName] = {
           trackedTimes: 0,
         };
       }
       agg[each.catergoryFieldName].users[each.UserName].trackedTimes =
         agg[each.catergoryFieldName].users[each.UserName].trackedTimes +
         +each.TrackedTime;

       return agg;
     }, {});

     const moveKeysToEnd = (obj, keys) => {
       keys.forEach((key) => {
         if (obj[key]) {
           const value = obj[key];
           delete obj[key];
           obj[key] = value;
         }
       });
     };

     const keysToMoveToEnd = ["No Category", "Non Projects"];

     moveKeysToEnd(result, keysToMoveToEnd);

     console.log("result", result);

     let headerNames = []
     for (const [value, item] of Object.entries(result)) {
        for (const [user, time] of Object.entries(item.users)) {
          !headerNames.includes(user) && headerNames.push(user);
        } 
    }

    headerNames.unshift('Group By');
    worksheet.addRow(headerNames);

    let i = 2
    for (const [value, item] of Object.entries(result)) {
        for (const [user, time] of Object.entries(item.users)) {
          worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
              row.eachCell((cell, colNumber) => {
                const cellName = getCellName(rowNumber, colNumber);
                if (cell.value === user) {
                  cellName;
                  const insertValue = cellName.replace(1, i);
                  const getPrevValue = worksheet.getCell(insertValue);
                  getPrevValue.value = time.trackedTimes;
                } else if(cell.value === 'Group By'){
                  const insertValue = cellName.replace(1, i);
                  const getPrevValue = worksheet.getCell(insertValue);
                  getPrevValue.value = value;
                }
              });
          });
      }
      i++;
    }

    const columnCount = worksheet.actualColumnCount;

    let lastColumn;
    for (let col = columnCount; col >= 1; col--) {
      const column = worksheet.getColumn(col);
      const columnValues = column.values;

      if (columnValues.some(value => value !== undefined && value !== null)) {
        lastColumn = col;
        break;
      }
    }

    if (lastColumn) {
      const lastColumnLetter = convertToLetter(lastColumn);
    } else {
      console.log('No data found in the sheet.');
    }

    const columnSums = ['Total'];

    worksheet.columns.forEach((column, columnIndex) => {
      let sum = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        if (!isNaN(cell.value)) {
          sum += typeof cell.value === 'number' ? parseFloat(cell.value) : 0;
        }
      });
      columnSums.push(sum);
    });

    columnSums.splice(1, 1);
    
    worksheet.addRow(columnSums);

    const lastRow = worksheet.lastRow;

    lastRow.eachCell({ includeEmpty: false }, (cell) => {
      cell.font = { bold: true };
    });


    await deleteReportDetails(id);
    worksheet.getRow(1).alignment = { horizontal: "center" };
    workbook.xlsx
      .writeFile("output.xlsx")
      .then(async () => {
        await sendMail(email);
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    return data;
  } catch (error) {
    console.error("Error downloading file:", error);
    return error;
  }
};

function getCellName(rowNumber, colNumber) {
  const columnName = String.fromCharCode(64 + colNumber);
  return columnName + rowNumber;
}

function convertToLetter(columnNumber) {
  let temp,
    letter = "";
  while (columnNumber > 0) {
    temp = (columnNumber - 1) % 26;
    letter = String.fromCharCode(65 + temp) + letter;
    columnNumber = (columnNumber - temp - 1) / 26;
  }
  return letter;
}

module.exports = {
  generateReportByCategoryService,
};
