
const {
    getMyUploadsService,
    getProfileService,
    updateProfileService,
    updateProfilePictureService
} = require("../services/user.service");

// Get logged-in user's profile
const getProfile = async (req, res) => {
    try {
        const user = await getProfileService(req.user.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "Profile fetched successfully",
            user
        });

    } catch (error) {
        console.error("Get profile error:", error);

        res.status(500).json({
            message: "Failed to fetch profile"
        });
    }
};

// Update logged-in user's profile
const updateProfile = async (req, res) => {
    try {
        const user = await updateProfileService(
            req.user.userId,
            req.body
        );

        res.status(200).json({
            message: "Profile updated successfully",
            user
        });

    } catch (error) {
        console.error("Update profile error:", error);

        if (error.message === "User not found") {
            return res.status(404).json({
                message: error.message
            });
        }

        if (error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json({
                message: error.message
            });
        }

        res.status(500).json({
            message: "Failed to update profile"
        });
    }
};

// Upload or update profile picture
const updateProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Please select a profile picture"
            });
        }

        // Only allow image files
        if (!req.file.mimetype.startsWith("image/")) {
            return res.status(400).json({
                message: "Only image files are allowed"
            });
        }

        const user = await updateProfilePictureService(
            req.user.userId,
            req.file
        );

        res.status(200).json({
            message: "Profile picture updated successfully",
            user
        });

    } catch (error) {
        console.error("Update profile picture error:", error);

        if (error.message === "User not found") {
            return res.status(404).json({
                message: error.message
            });
        }

        res.status(500).json({
            message: "Failed to update profile picture"
        });
    }
};

// Get resources uploaded by logged-in user
const getMyUploads = async (req, res) => {
    try {
        const resources = await getMyUploadsService(req.user.userId);

        res.status(200).json({
            message: "Your uploaded resources fetched successfully",
            count: resources.length,
            resources
        });

    } catch (error) {
        console.error("Get my uploads error:", error);

        res.status(500).json({
            message: "Failed to fetch your uploaded resources"
        });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    updateProfilePicture,
    getMyUploads
};
