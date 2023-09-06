const fs = require("fs");
const path = require("path");
const csv = require("fast-csv");
const ExcelJS = require("exceljs");
const nodemailer = require("nodemailer");
const AWS = require("aws-sdk");

AWS.config.update({
  region: "ap-south-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

// Create an S3 instance
const S3 = new AWS.S3();

const bucketName = "rl-interact-test";
const fileName = "Interact_understanding_material - Sheet2.csv";




const reportConsolidationService = async (url) => {

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

  await downloadCsvFromS3();

  const data = await parseCsvData();

  console.log('data', data);

  const filteredData = data.map((result) => {
    // let totalTrackedTime = 0;
    if (result.Billable === "TRUE" && (result.ProjectId !== null || "")) {
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

async function downloadCsvFromS3() {
  const params = {
    Bucket: bucketName,
    Key: fileName,
  };

  const localFilePath = "../uploads/myfile.csv"; // Specify the local file path

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

async function sendMail() {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_AUTH_USER,
      pass: process.env.EMAIL_AUTH_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: "kayser@makoitlab.com",
    subject: "Consolidated Report",
    text: "Hi, Download your consolidated report below",
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
        path.resolve(__dirname, "../uploads/myfile.csv"),
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
        path.resolve(__dirname, "../uploads/myfile.csv"),
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
