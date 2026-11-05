const express = require("express");

const {
  createReport,
  getMyReports,
  getAllReports,
} = require("../controllers/report.controller");

const protect = require("../middleware/auth.middleware");


const router = express.Router();

// Create a report
router.post("/", protect, createReport);
router.get("/my-reports", protect, getMyReports);


module.exports = router;
