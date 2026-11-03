const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        college: {
            type: String,
            required: function () {
                return this.role === "student";
            },
            trim: true
        },

        department: {
            type: String,
            required: function () {
                return this.role === "student";
            },
            trim: true
        },

        course: {
            type: String,
            required: function () {
                return this.role === "student";
            },
            trim: true
        },

        semester: {
            type: Number,
            required: function () {
                return this.role === "student";
            },
            min: 1
        },

        profilePicture: {
            type: String,
            default: ""
        },

        studentId: {
            type: String,
            default: ""
        },

        graduationYear: {
            type: Number
        },

        bio: {
            type: String,
            default: "",
            trim: true
        },

        role: {
            type: String,
            enum: ["student", "admin"],
            default: "student"
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);

module.exports = User;