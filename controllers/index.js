const { insertValue, getAllReportsData } = require("../db");
const { generateReportByProjectService, generateReportByUserService } = require("../services");
const { getReportDetails } = require("../services/apiService");
const { generateReportByCategoryService } = require("../services/generateReportByCategoryService");
const { uuidv4 } = require("../utils");


let process = "";

const insertReportDataInDB = async(req, res) => {
  const { startDate, endDate, type } = req?.body;
  console.log("req?.body", req?.body, "+>", startDate, endDate, type);
  const random_uuid = uuidv4();
  try{
    if (req?.body){
      await insertValue(
        random_uuid,
        startDate,
        endDate,
        type,
        "",
        "processing"
      );

      console.log("process", process);

      process === "" &&
        reportConsolidationController(random_uuid, startDate, endDate, type);

      res.status(200).json({
        status: 200,
        message: "Process Started!",
      });
    } else {
      res.status(400).json({
        status: 400,
        message: "Body is empty!",
      })
    }
      

    

  }catch(error){
    console.log("error", error);
    res.send({ status: 400, message: error });
  }
}



const reportConsolidationController = async (id, startDate, endDate, type) => {

  try {
    process = 'started'

    console.log("process", process);
    

    const data = await getAllReportsData();

    console.log('data', data);

    let arr = [...data]

    while(arr.length !== 0){
      const response = await getReportDetails(
        arr[0].start_date,
        arr[0].end_date,
        arr[0].type
      );

      console.log("process", process);

      if (response && arr[0].type === "project") {
        await generateReportByProjectService(response.downloadUrl, arr[0].id);
      } else if (response && arr[0].type === "user") {
        await generateReportByUserService(response.downloadUrl, arr[0].id);
      } else if (response && arr[0].type === "category") {
        await generateReportByCategoryService(response.downloadUrl, arr[0].id);
      } else {
        console.log({
          status: 400,
          message: "Invalid type, type can only be project, user or category!",
        });
      }

      arr.splice(0,1)
      console.log('updated ar', arr);
      const updatedData = await getAllReportsData();
      console.log("updatedData", updatedData);
      if(updatedData.length > 0){
        arr.push(...updatedData);
      } else {
        process = ''
      }
      console.log('arrr', arr);
    }
  } catch (error) {
    console.log("error", error);
    res.send({ status: 400, message: error });
  }
};

module.exports = {
  reportConsolidationController,
  insertReportDataInDB,
};