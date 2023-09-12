const { generateReportByProjectService, generateReportByUserService } = require("../services");
const { getReportDetails } = require("../services/apiService");


const reportConsolidationController = async (req, res) => {
  const {startDate, endDate, type} = req?.body;
  try {
    let data;

    const response = await getReportDetails(startDate, endDate, type);

    if (response && type === "project") {
      data = await generateReportByProjectService(response.downloadUrl);
    } else if (response && type === "user") {
      data = await generateReportByUserService(response.downloadUrl);
    } else {
      res.send({ status: 400, message: 'something went wrong' });
    }

    res.send({
      status: 200,
      message: "Report is Mailed!",
      data: data
    });
  } catch (error) {
    console.log("error", error);
    res.send({ status: 400, message: error });
  }
};

module.exports = {
  reportConsolidationController,
};