const { generateReportByProjectService, generateReportByUserService } = require("../services");


const reportConsolidationController = async (req, res) => {
  const {url, type} = req?.body;
  try {
    let data;

    if(type === 'project'){
      data = await generateReportByProjectService(url);
    } else if(type === 'user'){
      data = await generateReportByUserService(url);
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