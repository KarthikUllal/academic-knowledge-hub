require("dotenv").config();

const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const connectDB = require("../config/db");

const createAdmin = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Check whether the admin already exists
        const existingAdmin = await User.findOne({
            email: process.env.ADMIN_EMAIL
        });

        if (existingAdmin) {
            console.log("Admin account already exists");
            return;
        }

        // Hash the admin password
        const hashedPassword = await bcrypt.hash(
            process.env.ADMIN_PASSWORD,
            10
        );

        // Create the admin account
        await User.create({
            fullName: process.env.ADMIN_NAME,
            email: process.env.ADMIN_EMAIL,
            password: hashedPassword,
            role: "admin"
        });

        console.log("Admin account created successfully");

    } catch (error) {
        console.error("Error creating admin:", error.message);

    } finally {
        // Close the database connection
        const mongoose = require("mongoose");
        await mongoose.connection.close();
    }
};

createAdmin();