const { reportConsolidationService } = require("../services");
const { generateConsolidateReport } = require("../services/generateReportService");

const reportConsolidationController = async (req, res) => {
  try {

    // await reportConsolidationService(url);

    await generateConsolidateReport(req?.body);

    res.send({
      status: 200,
      message: "Report is Mailed!",
    });
  } catch (error) {
    console.log("error", error);
    res.send({ status: 400, message: error });
  }
};

module.exports = {
  reportConsolidationController,
};