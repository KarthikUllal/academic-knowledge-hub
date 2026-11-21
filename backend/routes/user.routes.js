
const express = require("express");

const {
    getProfile,
    getMyUploads,
    updateProfile,
    updateProfilePicture
} = require("../controllers/user.controller");

const protect = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

const router = express.Router();

// Get logged-in user's profile
router.get("/profile", protect, getProfile);

// Update logged-in user's profile
router.patch("/profile", protect, updateProfile);

// Upload or update profile picture
router.patch(
    "/profile-picture",
    protect,
    upload.single("profilePicture"),
    updateProfilePicture
);

// Get resources uploaded by logged-in user
router.get("/my-uploads", protect, getMyUploads);

module.exports = router;
