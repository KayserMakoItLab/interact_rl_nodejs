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
          console.log("projectInfo?.fields", result.Billable);
          const categoryValue = await (projectInfo?.fields || []).find(
            (value) => value?.fieldLabel === "Category"
          )?.fieldValue;
          return { catergoryFieldName: categoryValue, ...result }; // Return the categoryValue
        }
        return null; // Return null for cases where the condition isn't met
      })
    );

    const filteredData = data.filter((item) => item !== null);


     const result = filteredData.reduce((agg, each) => {
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

     let headerNames = []
     for (const [value, item] of Object.entries(result)) {
      if (value !== "undefined") {
        for (const [user, time] of Object.entries(item.users)) {
          !headerNames.includes(user) && headerNames.push(user);
        }
      } 
    }

    headerNames.unshift('Group By');
    worksheet.addRow(headerNames);

    let i = 1
    for (const [value, item] of Object.entries(result)) {
      if (value !== "undefined") {
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
      }
      i++;
    }


    // const result = data.reduce((agg, each) => {
    //   if (!agg[each.catergoryFieldName]) {
    //     const { CategoryName } = each;
    //     agg[each.catergoryFieldName] = {
    //       userTrackedTime: 0,
    //       totalTracked: 0,
    //       project: {},
    //     };
    //   }
    //   agg[each.catergoryFieldName].userTrackedTime =
    //     agg[each.catergoryFieldName].userTrackedTime + +each.TrackedTime;
    //   agg[each.catergoryFieldName].totalTracked =
    //     agg[each.catergoryFieldName].totalTracked + 1;

    //   if (!agg[each.catergoryFieldName].project[each.ProjectId]) {
    //     agg[each.catergoryFieldName].project[each.ProjectId] = {
    //       total: 0,
    //       entries: 0,
    //       task: {},
    //     };
    //   }

    //   agg[each.catergoryFieldName].project[each.ProjectId].total =
    //     agg[each.catergoryFieldName].project[each.ProjectId].total +
    //     +each.TrackedTime;

    //   if (
    //     !agg[each.catergoryFieldName].project[each.ProjectId].task[each.TaskId]
    //   ) {
    //     agg[each.catergoryFieldName].project[each.ProjectId].task[each.TaskId] =
    //       {
    //         total: 0,
    //         data: [],
    //       };
    //   }

    //   agg[each.catergoryFieldName].project[each.ProjectId].task[
    //     each.TaskId
    //   ].total =
    //     agg[each.catergoryFieldName].project[each.ProjectId].task[each.TaskId]
    //       .total + +each.TrackedTime;

    //   agg[each.catergoryFieldName].project[each.ProjectId].task[
    //     each.TaskId
    //   ].data.push(each);

    //   return agg;
    // }, {});

    // const i = 0;
    // for (const [category, item] of Object.entries(result)) {
    //   for (const [projectId, value] of Object.entries(item.project)) {
    //     const projectInfo = await getProjectDetailsById(projectId);
    //     for (const [taskId, entries] of Object.entries(value.task)) {
    //       const taskInfo = await getTaskDetailsById(taskId);
    //       for (const entry of entries.data) {
    //         if (
    //           entry?.ProjectId !== "" &&
    //           entry?.Billable === "true" &&
    //           entry?.catergoryFieldName
    //           ) {
    //           console.log("entry?.catergoryFieldName", entry?.catergoryFieldName);
    //           if (i % 100 == 0) {
    //             await new Promise((res, rej) => setTimeout(() => res(), 1000));
    //           }

    //           const completedDate = moment(
    //             new Date(taskInfo?.completedAt)
    //           ).format("YYYY-MM-DD");

    //           const managerName = projectInfo?.createdBy?.firstName
    //             ? projectInfo?.createdBy?.firstName +
    //               " " +
    //               projectInfo?.createdBy?.lastName
    //             : "";

    //           const categoryValue = (projectInfo?.fields || []).find(
    //             (value) => value?.fieldLabel === "Category"
    //           )?.fieldValue;

              // const reportRow = {
              //   groupBy: category,
              //   number: projectId,
              //   title: projectInfo?.projectName,
              //   category: categoryValue,
              //   projectClient: projectInfo?.customer?.companyName,
              //   customStatus: projectInfo?.status,
              //   manager: managerName,
              //   projectStart: projectInfo?.startDate,
              //   projectDue: projectInfo?.dueDate,
              //   taskTimeAllocated: projectInfo?.metrics?.totalAllocatedHours,
              //   projectTotalTimeSpent: projectInfo?.metrics?.trackedHours,
              //   projectFilteredTimeSpent: value?.totalTracked,
              //   order: taskInfo?.taskId,
              //   taskName: taskInfo?.taskName,
              //   contacts: taskInfo?.assignee?.users[0]?.userName,
              //   status: taskInfo?.status,
              //   taskStart: taskInfo?.startDate,
              //   taskDue: taskInfo?.dueDate,
              //   completed:
              //     completedDate === "Invalid date" ? "" : completedDate,
              //   timeAllocated: entry.Effort,
              //   taskTotalTimeSpent:
              //     taskInfo?.effort && taskInfo?.effort > 0
              //       ? taskInfo?.effort / 60
              //       : 0,
              //   taskFilteredTimeSpent: entries.total,
              //   timeRecords: entry.Notes,
              //   timer: entry.Date,
              //   staff: entry.UserName,
              //   timeSpent: entry.TrackedTime,
              // };

              // console.log("reportRow", reportRow);
              // worksheet.addRow(Object.values(reportRow));
    //         }
    //       }
    //     }
    //   }
    // }

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

module.exports = {
  generateReportByCategoryService,
};
