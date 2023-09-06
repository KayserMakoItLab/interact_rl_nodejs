const fs = require("fs");
const path = require("path");
const csv = require("fast-csv");
const ExcelJS = require("exceljs");
const nodemailer = require("nodemailer");


const reportConsolidationService = async (filename) => {
  const data = await parseCsvData(filename);

    const headers = [
      "Date",
      "UserName",
      "RoleName",
      "CustomerName",
      "ProjectName",
      "PhaseName",
      "TaskOrActivityName",
      "Effort",
      "TrackedTime",
      "Billable",
      "CategoryName",
      "Notes",
      "IsDeleted",
      "Approved",
      "SubmissionStatus",
      "ApprovedBy",
      "ApprovedAt",
      "BillRateCurrency",
      "BillRate",
      "LastUpdatedAt",
      "ProjectId",
      "PhaseId",
      "TaskId",
      "UserEmail",
      "UserId",
      "TemplateName",
      "TemplateId",
    ];

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet 1");
    worksheet.addRow(headers);


  const filteredData = data.map((result)=>{
    // let totalTrackedTime = 0;
    if(result.Billable === "TRUE" && (result.ProjectId !== null || "")){
    //     totalTrackedTime = result.TrackedTime;
    //     data.map((checkResult)=>{
    //         if(result.ProjectId === checkResult.checkResult){
    //             totalTrackedTime = totalTrackedTime + result.TrackedTime;
    //         }
    //     })
        const rowData = [];
        for (const key in result) {
          rowData.push(result[key]);
        }
        worksheet.addRow(rowData);
    }
  })

  workbook.xlsx
    .writeFile("output.xlsx")
    .then(async() => {
       await sendMail(filename);
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  return filteredData;
};

async function parseCsvData(fileName) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(path.resolve(__dirname, "../uploads", fileName))
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

async function sendMail(filename) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "kayser@makoitlab.com",
      pass: "nzpvplokcvtnzivu",
    },
  });

  const mailOptions = {
    from: "kayser@makoitlab.com",
    to: "kayser@makoitlab.com",
    subject: "Hello from Node.js",
    text: "This is a test email sent from Node.js.",
    attachments: [
      {
        filename: "output.xlsx",
        path: path.resolve(__dirname, "../output.xlsx"),
      },
    ],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      fs.unlink(
        path.resolve(__dirname, "../uploads", filename),
        (unlinkError) => {
          if (unlinkError) {
            console.error("Error deleting CSV file:", unlinkError);
          } else {
            console.log("CSV file deleted successfully");
          }
        }
      );
      fs.unlink(path.resolve(__dirname, "../output.xlsx"), (error) => {
        if (error) {
          console.error("Error deleting the file:", error);
        } else {
          console.log("File deleted successfully");
        }
      });
      console.log("error", error);
      return {
        success: false,
        message: error.message,
      };
    } else {
      fs.unlink(
        path.resolve(__dirname, "../uploads", filename),
        (unlinkError) => {
          if (unlinkError) {
            console.error("Error deleting CSV file:", unlinkError);
          } else {
            console.log("CSV file deleted successfully");
          }
        }
      );
      fs.unlink(path.resolve(__dirname, "../output.xlsx", ), (error) => {
        if (error) {
          console.error("Error deleting the file:", error);
        } else {
          console.log("File deleted successfully");
        }
      });
      console.log("email=>", info.response);
      return {
        success: true,
        message: info.response,
      };
    }
  });
}

module.exports = {
  reportConsolidationService,
};
