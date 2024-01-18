const express = require("express");
const multer = require("multer");
const {  insertReportDataInDB } = require("../controllers");
const { validateApiKey } = require("../services/middleware");


const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.originalname}`;
    cb(null, filename);
  },
});
const upload = multer({ storage });

router.get("/", (req, res) => res.sendStatus(200));

router.get("/upload", (req, res) => res.sendStatus(200));

router.post("/upload", validateApiKey, upload.single("csvFile"), insertReportDataInDB);

module.exports = router;