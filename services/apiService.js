const cache = require("../memCache")();
const axios = require("axios");

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

module.exports = {
  getProjectDetailsById,
  getTaskDetailsById,
};
