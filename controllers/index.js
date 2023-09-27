const { generateReportByProjectService, generateReportByUserService } = require("../services");
const { getReportDetails } = require("../services/apiService");
const { generateReportByCategoryService } = require("../services/generateReportByCategoryService");


const reportConsolidationController = async (req, res) => {
  const {startDate, endDate, type} = req?.body;
  try {
    let data;

    const response = await getReportDetails(startDate, endDate, type);

    // res.send({
    //   status: 200,
    //   message: "Process Started!",
    // });
    
    res.status(200).json({
      status: 200,
      message: "Process Started!",
    });

    console.log({response});

    if (response && type === "project") {
      data = await generateReportByProjectService(response.downloadUrl);
    } else if (response && type === "user") {
      data = await generateReportByUserService(response.downloadUrl);
    } else if (response && type === "category") {
      data = await generateReportByCategoryService(response.downloadUrl);
    } else {
      // res.send({ status: 400, message: "something went wrong" });
      console.log({ status: 400, message: "something went wrong" });
    }
  } catch (error) {
    console.log("error", error);
    res.send({ status: 400, message: error });
  }
};

module.exports = {
  reportConsolidationController,
};