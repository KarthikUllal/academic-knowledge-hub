
const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
    {
        // Student who submitted the report
        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // Reported post
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            default: null
        },

        // Reported comment
        comment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            default: null
        },

        // Reason for reporting
        reason: {
            type: String,
            enum: [
                "spam",
                "harassment",
                "inappropriate",
                "misinformation",
                "irrelevant",
                "other"
            ],
            required: true
        },

        // Additional explanation
        description: {
            type: String,
            trim: true,
            maxlength: 500,
            default: ""
        },

        // Report status
        status: {
            type: String,
            enum: ["pending", "resolved", "dismissed"],
            default: "pending"
        },

        // Admin who reviewed the report
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        // Date when the report was reviewed
        reviewedAt: {
            type: Date,
            default: null
        },

        // Admin's review note
        adminNote: {
            type: String,
            trim: true,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

// Ensure a report targets either a post or a comment
reportSchema.pre("validate", function () {
    const hasPost = this.post != null;
    const hasComment = this.comment != null;

    if (hasPost === hasComment) {
        this.invalidate(
            "post",
            "A report must target either a post or a comment, not both."
        );
    }
});

// Prevent a student from reporting the same post more than once
reportSchema.index(
    { reportedBy: 1, post: 1 },
    {
        unique: true,
        partialFilterExpression: {
            post: { $type: "objectId" }
        }
    }
);

// Prevent a student from reporting the same comment more than once
reportSchema.index(
    { reportedBy: 1, comment: 1 },
    {
        unique: true,
        partialFilterExpression: {
            comment: { $type: "objectId" }
        }
    }
);

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;
