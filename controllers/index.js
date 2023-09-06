const { reportConsolidationService } = require("../services");

const reportConsolidationController = async (req, res) => {
  // const { filename } = req?.file;
  const { url } = req.body;
  try {
    // if (!req.file) {
    //   return res.status(400).json({ error: "No file uploaded" });
    // }

    await reportConsolidationService(url);

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