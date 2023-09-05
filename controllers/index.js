const reportConsolidationController = async(req, res) => {
    try{
        res.send({
          status: 200,
          message: "Report is Here!"
        });
    }catch(error){
        res.send({ status: 400, message: error });
    }
}

module.exports = {
  reportConsolidationController
};