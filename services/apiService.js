const cache = require("../memCache")();
const axios = require("axios");
const moment = require("moment");

const getProjectDetailsById = async (projectId) => {
  if (cache.get("PROJECTS", projectId)) {
    return cache.get("PROJECTS", projectId);
  }
  const data = await axios
    .get(`${process.env.ROCKLANE_API}projects/${projectId}`, {
      headers: {
        "api-key": process.env.ROCKLANE_API_KEY,
        Cookie: process.env.ROCKLANE_COOKIE,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error:", error);
      return error;
    });
  cache.set("PROJECTS", projectId, data);
  return data;
};

const getTaskDetailsById = async (taskId) => {
  if (cache.get("TASKS", taskId)) {
    return cache.get("TASKS", taskId);
  }
  const data = await axios
    .get(`${process.env.ROCKLANE_API}tasks/${taskId}`, {
      headers: {
        "api-key": process.env.ROCKLANE_API_KEY,
        Cookie: process.env.ROCKLANE_COOKIE,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error:", error);
      return error;
    });
  cache.set("TASKS", taskId, data);
  return data;
};

const getReportDetails = async(startDate, endDate, type) => {
    console.log(
      "==>",
      `${process.env.ROCKLANE_API_V1}time-entries/export?&endDate=${moment(
        endDate
      ).format("YYYY-MM-DD")}&match&startDate=${moment(startDate).format(
        "YYYY-MM-DD"
      )}`
    );
    const data = await axios
      .get(
        `${process.env.ROCKLANE_API_V1}time-entries/export?&endDate=${moment(
          endDate
        ).format("YYYY-MM-DD")}&match&startDate=${moment(startDate).format(
          "YYYY-MM-DD"
        )}`,
        {
          headers: {
            "api-key": process.env.ROCKLANE_API_KEY
          },
        }
      )
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.error("Error:", error);
        return error;
      });
    return data
}

module.exports = {
  getProjectDetailsById,
  getTaskDetailsById,
  getReportDetails,
};
