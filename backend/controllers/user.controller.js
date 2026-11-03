const User = require("../models/user.model");

// Get the logged-in user's profile
const getProfile = async (req, res) => {
    try {
        // Find the user using the ID from the JWT
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
        res.status(500).json({
            message: error.message
        });
    }
};

// Logout the logged-in user
const logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    });

    res.status(200).json({
        message: "Logout successful"
    });
};

module.exports = {
    getProfile
};