const fs = require("fs");
const Axios = require("axios");
const { finished } = require("stream");

const downloadFile = async (fileUrl, outputLocationPath) => {
  console.log("downloading file :", fileUrl);
  const writer = fs.createWriteStream(outputLocationPath);
  const response = await Axios({
    method: "get",
    url: fileUrl,
    responseType: "stream",
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    finished(writer, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log("Download completed.");
        resolve();
      }
    });
  });
};

module.exports = {
  downloadFile,
};
