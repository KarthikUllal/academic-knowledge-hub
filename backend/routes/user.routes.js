const express = require("express");

const { getProfile } = require("../controllers/user.controller");
const protect = require("../middleware/auth.middleware");

const router = express.Router();

// Get the logged-in user's profile
router.get("/profile", protect, getProfile);

module.exports = router;