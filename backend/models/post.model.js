const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150
        },

        content: {
            type: String,
            required: true,
            trim: true
        },

        type: {
            type: String,
            enum: ["question", "discussion"],
            required: true
        },

        category: {
            type: String,
            required: true,
            trim: true
        },

        tags: {
            type: [String],
            default: []
        },

        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        upvotes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],

        commentsCount: {
            type: Number,
            default: 0
        },

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

const Post = mongoose.model("Post", postSchema);

module.exports = Post;