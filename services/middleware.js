const validateApiKey = (req, res, next) => {
  const apiKey = req.headers["api-key"];

  if (isValidApiKey(apiKey)) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized user" });
  }
}

const isValidApiKey = (apiKey) => {
  return apiKey === process.env.API_KEY;
}

module.exports = {
  validateApiKey,
};
