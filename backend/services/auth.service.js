
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("./email.service");
const crypto = require("crypto");

// Register a new student
const registerUser = async (userData) => {

    // Check if the email already exists
    const existingUser = await User.findOne({
        email: userData.email.toLowerCase().trim()
    });

    if (existingUser) {
        throw new Error("Email is already registered");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create the student account
    const user = await User.create({
        fullName: userData.fullName,
        email: userData.email,
        password: hashedPassword,
        college: userData.college,
        department: userData.department,
        course: userData.course,
        semester: userData.semester,
        role: "student"
    });

    // Remove password before returning user details
    const { password, ...userDetails } = user.toObject();

    return userDetails;
};


// Login a student or admin
const loginUser = async (email, password) => {

    // Find user by email
    const user = await User.findOne({
        email: email.toLowerCase().trim()
    });

    if (!user) {
        throw new Error("Invalid email or password");
    }

    // Check whether the account is active
    if (!user.isActive) {
        throw new Error("Your account has been deactivated");
    }

    // Compare entered password with stored password hash
    const isPasswordValid = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }

    // Generate JWT token
    const token = jwt.sign(
        {
            userId: user._id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "1d"
        }
    );

    // Remove password before returning user details
    const { password: hashedPassword, ...userDetails } = user.toObject();

    return {
        user: userDetails,
        token
    };
};


//Forgot password
const forgotPassword = async (email) => {
    // Find the user using their email
    const user = await User.findOne({
        email: email.toLowerCase().trim(),
    });

    // Return a generic response if the account doesn't exist
    if (!user) {
        return;
    }

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash the token before storing it in MongoDB
    const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    // Set token expiration to 15 minutes
    const resetTokenExpires = Date.now() + 15 * 60 * 1000;

    // Save the hashed token and expiration time
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = resetTokenExpires;

    await user.save();

    // Create the password-reset link
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Create the email content
    const emailContent = `
    <h2>Reset Your Password</h2>

    <p>Hello ${user.fullName},</p>

    <p>We received a request to reset your password.</p>

    <p>Click the button below to create a new password.</p>

    <a href="${resetUrl}"
       style="
         display: inline-block;
         padding: 12px 20px;
         background-color: #4F46E5;
         color: white;
         text-decoration: none;
         border-radius: 6px;
       ">
       Reset Password
    </a>

    <p>This link expires in 15 minutes.</p>

    <p>If you did not request this, you can ignore this email.</p>
  `;

    // Send the reset email
    try {
        await sendEmail(
            user.email,
            "Reset Your Password - Academic Hub",
            emailContent
        );
    } catch (error) {
        // Clear the token if email sending fails
        user.passwordResetToken = null;
        user.passwordResetExpires = null;

        await user.save();

        throw new Error("Unable to send password reset email.");
    }
};


//Reset password

const resetPassword = async (token, newPassword) => {
    // Hash the token received from the reset link
    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    // Find the user with a matching, non-expired token
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    // Reject invalid or expired tokens
    if (!user) {
        throw new Error("Invalid or expired password reset link.");
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password
    user.password = hashedPassword;

    // Clear the reset token so it cannot be reused
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await user.save();
};



module.exports = {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword
};
