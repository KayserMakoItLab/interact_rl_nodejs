const path = require("path");
const ExcelJS = require("exceljs");
const fs = require("fs");
const csv = require("fast-csv");
const { downloadFile } = require("./downloadS3File");
const { headers, subHeaders } = require("../constants");
const { getProjectDetailsById, getTaskDetailsById } = require("./apiService");
const { parseCsvData } = require("../utils");
const { sendMail } = require("./mail");
const moment = require("moment");
const { deleteReportDetails } = require("../db");

const generateReportByProjectService = async (url, id, email) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet 1");
    worksheet.addRow(headers);
    worksheet.addRow(subHeaders);
    worksheet.mergeCells("B1:D1");
    worksheet.mergeCells("F1:K1");

    await downloadFile(
      url,
      path.resolve(__dirname, "../uploads", "myfile.csv")
    );

    const report = await parseCsvData();

    const result = report.reduce((agg, each) => {
      if (!agg[each.ProjectId]) {
        const { ProjectName, CustomerName, ...others } = each;
        agg[each.ProjectId] = {
          ProjectName,
          CustomerName,
          totalTracked: 0,
          entries: 0,
          task: {},
        };
      }
      agg[each.ProjectId].totalTracked =
        agg[each.ProjectId].totalTracked + +each.TrackedTime;
      agg[each.ProjectId].entries = agg[each.ProjectId].entries + 1;

      if (!agg[each.ProjectId].task[each.TaskId]) {
        agg[each.ProjectId].task[each.TaskId] = {
          total: 0,
          data: [],
        };
      }
      agg[each.ProjectId].task[each.TaskId].total =
        agg[each.ProjectId].task[each.TaskId].total + +each.TrackedTime;

      agg[each.ProjectId].task[each.TaskId].data.push(each);

      return agg;
    }, {});

    const i = 0;
    for (const [projectId, value] of Object.entries(result)) {
      const projectInfo = await getProjectDetailsById(projectId);
      for (const [taskId, entries] of Object.entries(value.task)) {
        const taskInfo = await getTaskDetailsById(taskId);
        for (const entry of entries.data) {
          if (entry?.ProjectId !== "" && entry?.Billable === "true") {
            if (i % 100 == 0) {
              await new Promise((res, rej) => setTimeout(() => res(), 1000));
            }

            // const completedDate = moment(
            //   new Date(taskInfo?.completedAt)
            // ).format("YYYY-MM-DD");

            // const managerName = projectInfo?.createdBy?.firstName
            //   ? projectInfo?.createdBy?.firstName +
            //     " " +
            //     projectInfo?.createdBy?.lastName
            //   : "";

            // const categoryValue = (projectInfo?.fields || []).find(
            //   (value) => value?.fieldLabel === "Category"
            // )?.fieldValue;

            const reportRow = {
              groupBy: projectInfo?.projectName,
              number: projectId,
              title: projectInfo?.projectName,
              // category: categoryValue,
              projectClient: projectInfo?.customer?.companyName,
              // customStatus: projectInfo?.status,
              // manager: managerName,
              // projectStart: projectInfo?.startDate,
              // projectDue: projectInfo?.dueDate,
              // taskTimeAllocated: projectInfo?.metrics?.totalAllocatedHours,
              // projectTotalTimeSpent: projectInfo?.metrics?.trackedHours,
              // projectFilteredTimeSpent: value?.totalTracked,
              // order: taskInfo?.taskId,
              taskName: taskInfo?.taskName,
              // contacts: taskInfo?.assignee?.users[0]?.userName,
              // status: taskInfo?.status,
              // taskStart: taskInfo?.startDate,
              // taskDue: taskInfo?.dueDate,
              // completed: completedDate === "Invalid date" ? "" : completedDate,
              // timeAllocated: entry.Effort,
              // taskTotalTimeSpent:
              //   taskInfo?.effort && taskInfo?.effort > 0
              //     ? taskInfo?.effort / 60
              //     : 0,
              // taskFilteredTimeSpent: entries.total,
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

    return report;
  } catch (error) {
    console.error("Error downloading file:", error);
    return error;
  }
};

module.exports = {
  generateReportByProjectService,
};
