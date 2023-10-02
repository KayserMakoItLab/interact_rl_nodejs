const path = require("path");
const ExcelJS = require("exceljs");
const fs = require("fs");
const csv = require("fast-csv");
const { downloadFile } = require("./downloadS3File");
const { headers, subHeaders } = require("../constants");
const { getProjectDetailsById, getTaskDetailsById } = require("./apiService");
const { sendMail } = require("./mail");
const moment = require("moment");

const generateReportByCategoryService = async (url) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet 1");
    worksheet.addRow(headers);
    worksheet.addRow(subHeaders);
    worksheet.mergeCells("B1:L1");
    worksheet.mergeCells("M1:V1");
    worksheet.mergeCells("W1:Z1");
    console.log("url", url);
    await downloadFile(
      url,
      path.resolve(__dirname, "../uploads", "myfile.csv")
    );

    const report = await new Promise((resolve, reject) => {
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

    const result = report.reduce((agg, each) => {
      if (!agg[each.CategoryName]) {
        const { CategoryName } = each;
        agg[each.CategoryName] = {
          userTrackedTime: 0,
          totalTracked: 0,
          project: {},
        };
      }
      agg[each.CategoryName].userTrackedTime =
        agg[each.CategoryName].userTrackedTime + +each.TrackedTime;
      agg[each.CategoryName].totalTracked =
        agg[each.CategoryName].totalTracked + 1;

      if (!agg[each.CategoryName].project[each.ProjectId]) {
        agg[each.CategoryName].project[each.ProjectId] = {
          total: 0,
          entries: 0,
          task: {},
        };
      }

      agg[each.CategoryName].project[each.ProjectId].total =
        agg[each.CategoryName].project[each.ProjectId].total +
        +each.TrackedTime;

      if (!agg[each.CategoryName].project[each.ProjectId].task[each.TaskId]) {
        agg[each.CategoryName].project[each.ProjectId].task[each.TaskId] = {
          total: 0,
          data: [],
        };
      }

      agg[each.CategoryName].project[each.ProjectId].task[each.TaskId].total =
        agg[each.CategoryName].project[each.ProjectId].task[each.TaskId].total +
        +each.TrackedTime;

      agg[each.CategoryName].project[each.ProjectId].task[
        each.TaskId
      ].data.push(each);

      return agg;
    }, {});

    const i = 0;
    for (const [category, item] of Object.entries(result)) {
      for (const [projectId, value] of Object.entries(item.project)) {
        const projectInfo = await getProjectDetailsById(projectId);
        for (const [taskId, entries] of Object.entries(value.task)) {
          const taskInfo = await getTaskDetailsById(taskId);
          for (const entry of entries.data) {
            if (i % 100 == 0) {
              await new Promise((res, rej) => setTimeout(() => res(), 1000));
            }

            const completedDate = moment(
              new Date(taskInfo?.completedAt)
            ).format("YYYY-MM-DD");

            const reportRow = {
              groupBy: category,
              number: projectId,
              title: projectInfo?.projectName,
              category: entry.CategoryName,
              projectClient: projectInfo?.createdBy?.firstName,
              customStatus: projectInfo?.status,
              manager: projectInfo?.createdBy?.firstName,
              projectStart: projectInfo?.startDate,
              projectDue: projectInfo?.dueDate,
              taskTimeAllocated: projectInfo?.metrics?.totalAllocatedHours,
              projectTotalTimeSpent: projectInfo?.metrics?.trackedHours,
              projectFilteredTimeSpent: value?.totalTracked,
              order: taskInfo?.taskId,
              taskName: taskInfo?.taskName,
              contacts: taskInfo?.assignee?.users[0]?.userName,
              status: taskInfo?.status?.label,
              taskStart: taskInfo?.startDate,
              taskDue: taskInfo?.dueDate,
              completed: completedDate === "Invalid date" ? "" : completedDate,
              timeAllocated: entry.Effort,
              taskTotalTimeSpent:
                taskInfo?.effort && taskInfo?.effort > 0
                  ? taskInfo?.effort / 60
                  : 0,
              taskFilteredTimeSpent: entries.total,
              timeRecords: entry.Notes,
              timer: entry.Date,
              staff: entry.UserName,
              timeSpent: entry.TrackedTime,
            };

            console.log("reportRow", reportRow);
            worksheet.addRow(Object.values(reportRow));
          }
        }
      }
    }

    worksheet.getRow(1).alignment = { horizontal: "center" };
    workbook.xlsx
      .writeFile("output.xlsx")
      .then(async () => {
        await sendMail();
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    return report;
  } catch (error) {
    console.error("Error downloading file:", error);
    return error;
  }
};

module.exports = {
  generateReportByCategoryService,
};
