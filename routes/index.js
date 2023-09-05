const express = require("express");
const { reportConsolidationController } = require("../controllers");

const router = express.Router();

router.get("/", reportConsolidationController);

// router.post("/", (req, res) => {
//   res.send("Hello World!");
// });

module.exports = router;