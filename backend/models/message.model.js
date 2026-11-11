
/**
 * Purpose: Define the Message model for storing student
 * questions, AI responses and academic sources.
 */

const mongoose = require("mongoose");

// Define the message schema
const messageSchema = new mongoose.Schema(
    {
        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
        },

        role: {
            type: String,
            enum: ["user", "assistant"],
            required: true,
        },

        content: {
            type: String,
            required: true,
            trim: true,
        },

        sources: [
            {
                resourceId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Resource",
                },
                title: String,
                college: String,
                fileUrl: String,
                category: String,
                subject: String,
                course: String,
                semester: Number,
                pages: [Number],
                paragraphNumber: Number,
                slideNumber: Number,
                chunkIndex: Number,
                sourceNumbers: [Number],
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Index messages by conversation and creation time
messageSchema.index({ conversation: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);
