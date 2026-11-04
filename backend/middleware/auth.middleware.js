const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const protect = async (req, res, next) => {
    console.log("Authentication middleware executed");

    try {
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({
                message: "Token not found"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Find the user in MongoDB
        const user = await User.findById(decoded.userId)
            .select("role isActive");

        if (!user) {
            return res.status(401).json({
                message: "User not found"
            });
        }

        // Check whether the account is active
        if (!user.isActive) {
            return res.status(403).json({
                message: "Your account has been deactivated"
            });
        }

        // Store current user details in the request
        req.user = {
            userId: user._id,
            role: user.role
        };

        next();

    } catch (error) {
        console.log("Authentication error:", error.message);

        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

module.exports = protect;