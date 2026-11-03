
const {
    registerUser,
    loginUser
} = require("../services/auth.service");

// Register a new student
const register = async (req, res) => {
    try {
        // Get registration data
        const userData = req.body;

        // Call registration service
        const user = await registerUser(userData);

        res.status(201).json({
            message: "Registration successful",
            user
        });

    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

// Login a student or admin
const login = async (req, res) => {
    try {
        // Get login details
        const { email, password } = req.body;

        // Call login service
        const result = await loginUser(email, password);

        // Store JWT in an HttpOnly cookie
        res.cookie("token", result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            message: "Login successful",
            user: result.user
        });

    } catch (error) {
        res.status(400).json({
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
    register,
    login,
    logout
};
