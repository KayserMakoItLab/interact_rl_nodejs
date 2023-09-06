const express = require("express");
const multer = require("multer");
const { reportConsolidationController } = require("../controllers");


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


router.post( "/upload", upload.single('csvFile'), reportConsolidationController);

module.exports = router;