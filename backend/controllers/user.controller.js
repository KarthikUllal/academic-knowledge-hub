
const {
    getMyUploadsService
} = require("../services/user.service");

// Get logged-in user's profile
const getProfile = async (req, res) => {
    try {
        const User = require("../models/user.model");

        const user = await User.findById(req.user.userId)
            .select("-password");

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
    getMyUploads
};
