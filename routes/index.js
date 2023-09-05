const express = require("express");
const multer = require("multer");
const { reportConsolidationController } = require("../controllers");


const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads"); // Save files to the "uploads" folder
  },
  filename: (req, file, cb) => {
    // Generate a unique filename for the uploaded CSV file
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.originalname}`;
    cb(null, filename);
  },
});
const upload = multer({ storage });

// router.get("/", reportConsolidationController);

router.post( "/upload", upload.single('csvFile'), reportConsolidationController);

module.exports = router;