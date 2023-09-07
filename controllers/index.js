const { reportConsolidationService } = require("../services");
const {
  generateConsolidateReportService,
} = require("../services/generateReportService");

const reportConsolidationController = async (req, res) => {
  try {

    // await reportConsolidationService(url);

    const data = await generateConsolidateReportService(req?.body);

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