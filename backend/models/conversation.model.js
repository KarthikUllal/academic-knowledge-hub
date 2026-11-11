
/**
 * Purpose: Define the Conversation model for storing
 * student AI chat conversations.
 */

const mongoose = require("mongoose");

// Define the conversation schema
const conversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      default: "New Conversation",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index conversations by owner and recent activity
conversationSchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.model("Conversation", conversationSchema);
