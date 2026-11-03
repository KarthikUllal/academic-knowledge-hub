const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        subject: {
            type: String,
            required: true,
            trim: true
        },

        course: {
            type: String,
            required: true,
            trim: true
        },

        semester: {
            type: Number,
            required: true,
            min: 1
        },

        college: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,
            enum: [
                "Notes",
                "Question Papers",
                "Assignments",
                "Books",
                "Presentations",
                "Research Papers",
                "Other"
            ]
        },

        fileUrl: {
            type: String,
            required: true
        },

        filePublicId: {
            type: String,
            required: true
        },
        fileResourceType: {
    type: String,
    required: true
},

        fileType: {
            type: String,
            required: true,
            lowercase: true
        },

        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        },

        rejectionReason: {
            type: String,
            default: ""
        },

        downloads: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

const Resource = mongoose.model("Resource", resourceSchema);

module.exports = Resource;