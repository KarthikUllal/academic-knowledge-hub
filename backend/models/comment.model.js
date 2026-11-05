
const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
    {
        // Post to which this comment belongs
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            required: true
        },

        // Student who created the comment
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // Comment text
        content: {
            type: String,
            required: true,
            trim: true
        },

        // Parent comment ID (null for normal comments)
        parentComment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            default: null
        },

        // Comment status
        status: {
            type: String,
            enum: ["active", "removed"],
            default: "active"
        }
    },
    {
        timestamps: true
    }
);

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
