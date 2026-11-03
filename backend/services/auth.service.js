
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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

module.exports = {
    registerUser,
    loginUser
};
