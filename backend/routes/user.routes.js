const express = require("express");

const { getProfile, getMyUploads } = require("../controllers/user.controller");
const protect = require("../middleware/auth.middleware");

const router = express.Router();

// Get the logged-in user's profile
router.get("/profile", protect, getProfile);


// Get resources uploaded by logged-in user
router.get("/my-uploads", protect, getMyUploads);

module.exports = router;