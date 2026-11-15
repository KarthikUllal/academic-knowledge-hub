
const {
    registerUser,
    loginUser,
    forgotPassword: forgotPasswordService,
    resetPassword: resetPasswordService,
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

// Forgot password
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required",
            });
        }

        await forgotPasswordService(email);

        res.status(200).json({
            message:
                "If an account exists with this email, a password reset link will be sent.",
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};


// Reset password
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({
                message: "New password is required",
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters",
            });
        }

        await resetPasswordService(token, newPassword);

        res.status(200).json({
            message: "Password reset successful. Please log in.",
        });
    } catch (error) {
        res.status(400).json({
            message: error.message,
        });
    }
};


module.exports = {
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
};
