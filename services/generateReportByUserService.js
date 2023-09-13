const path = require("path");
const ExcelJS = require("exceljs");
const fs = require("fs");
const csv = require("fast-csv");
const { downloadFile } = require("./downloadS3File");
const { headers, subHeaders } = require("../constants");
const { getProjectDetailsById, getTaskDetailsById } = require("./apiService");

const generateReportByUserService = async ({
  url,
  startDate,
  endDate,
}) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet 1");
    worksheet.addRow(headers);
    worksheet.addRow(subHeaders);
    worksheet.mergeCells("B1:L1");
    worksheet.mergeCells("M1:V1");
    worksheet.mergeCells("W1:Z1");

    // await downloadFile(
    //   url,
    //   path.resolve(__dirname, "../uploads", "myfile.csv")
    // );

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

    console.log("report", report);

    const result = report.reduce((agg, each) => {
        if(!agg[each.UserName]){
            const { UserName } = each;
            agg[each.UserName] = {
              userTrackedTime: 0,
              totalTracked: 0,
              entries: 0,
            };
        }
      if (!agg[each.ProjectId]) {
        const { ProjectName, CustomerName, ...others } = each;
        agg[each.ProjectId] = {
          ProjectName,
          CustomerName,
          
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
          if (i % 100 == 0) {
            await new Promise((res, rej) => setTimeout(() => res(), 1000));
          }
          let newProjectId = "";

          const reportRow = {
            groupBy: newProjectId === projectId ? "" : projectId,
            number: projectId,
            title: projectInfo?.projectName,
            category: "",
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
            completed:
              taskInfo?.status?.label === "Completed" ? "TRUE" : "FALSE",
            timeAllocated: entry.Effort,
            taskTotalTimeSpent: taskInfo?.effort / 6,
            taskFilteredTimeSpent: entries.total,
            timeRecords: entry.Notes,
            timer: entry.Date,
            staff: entry.UserName,
            timeSpent: entry.TrackedTime,
          };

          console.log("reportRow", reportRow);
          worksheet.addRow(Object.values(reportRow));

          newProjectId = projectId;
        }
      }
    }

    worksheet.getRow(1).alignment = { horizontal: "center" };
    workbook.xlsx
      .writeFile("output.xlsx")
      .then(async () => {
        // await sendMail();
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
  generateReportByUserService,
};
