
/**
 * Purpose: Define API routes for AI question answering
 * and conversation management.
 */

const express = require("express");

const {
    askAIQuestion,
    createConversation,
    getUserConversations,
    getConversationMessages,
    deleteConversation,
} = require("../controllers/ai.controller");

const protect = require("../middleware/auth.middleware");

const router = express.Router();

// Ask a question to the AI assistant
router.post("/ask", protect, askAIQuestion);

// Create a new conversation
router.post("/conversations", protect, createConversation);

// Get all conversations of the logged-in user
router.get("/conversations", protect, getUserConversations);

// Get messages from a specific conversation
router.get(
    "/conversations/:id/messages",
    protect,
    getConversationMessages
);

// Delete a conversation
router.delete(
    "/conversations/:id",
    protect,
    deleteConversation
);

module.exports = router;
