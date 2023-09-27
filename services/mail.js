const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

const sendMail = async () => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_AUTH_USER,
      pass: process.env.EMAIL_AUTH_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
<<<<<<< HEAD
    to: ["kayser@makoitlab.com","marimuthu.gouthaman@makoitlab.com", "raja@geekfactory.tech"],
=======
    to: [
      "kayser@makoitlab.com",
      "marimuthu.gouthaman@makoitlab.com ",
      "raja@geekfactory.tech",
    ],
>>>>>>> 92ac766476823db06252df0f76c3d642a9e13995
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
      fs.unlink(path.resolve(__dirname, "../output.xlsx"), (error) => {
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
};

module.exports = {
  sendMail,
};
