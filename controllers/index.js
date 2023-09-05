const { reportConsolidationService } = require("../services");

const reportConsolidationController = async (req, res) => {
  const { filename } = req?.file;
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const data = await reportConsolidationService(filename);
    

    res.send({
      status: 200,
      message: "Report is Here!",
      length: data.length,
      data: data
    });
  } catch (error) {
    res.send({ status: 400, message: error });
  }
};



module.exports = {
  reportConsolidationController,
};
