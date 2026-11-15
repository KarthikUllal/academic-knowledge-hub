
/**
 * Purpose: Handle AI question-answering requests
 * and conversation management API operations.
 */

const {
    askQuestion,
} = require("../ai/rag/rag.service");

const {
    createConversation: createConversationService,
    getUserConversations,
    getConversationMessages,
    deleteConversation: deleteConversationService,
} = require("../services/conversation.service");

// Ask a question to the AI assistant
const askAIQuestion = async (req, res) => {
    try {
        const { question, conversationId, filters = {} } = req.body;

        const result = await askQuestion({
            question,
            userId: req.user.userId,
            conversationId,
            filters,
        });

        res.status(200).json({
            message: "AI response generated successfully",
            ...result,
        });

    } catch (error) {
        console.error("AI question error:", error);

        res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : "Failed to generate AI response",
        });
    }
};

// Create a new conversation
const createConversation = async (req, res) => {
    try {
        const { title } = req.body;

        const conversation = await createConversationService(
            req.user.userId,
            title
        );

        res.status(201).json({
            message: "Conversation created successfully",
            conversation,
        });

    } catch (error) {
        console.error("Create conversation error:", error);

        res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : "Failed to create conversation",
        });
    }
};

// Get all conversations of the logged-in user
const getUserConversationsController = async (req, res) => {
    try {
        const conversations = await getUserConversations(
            req.user.userId
        );

        res.status(200).json({
            message: "Conversations fetched successfully",
            conversations,
        });

    } catch (error) {
        console.error("Fetch conversations error:", error);

        res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : "Failed to fetch conversations",
        });
    }
};

// Get messages from a specific conversation
const getConversationMessagesController = async (req, res) => {
    try {
        const messages = await getConversationMessages(
            req.params.id,
            req.user.userId
        );

        res.status(200).json({
            message: "Conversation messages fetched successfully",
            messages,
        });

    } catch (error) {
        console.error("Fetch conversation messages error:", error);

        res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : "Failed to fetch conversation messages",
        });
    }
};

// Delete a conversation
const deleteConversation = async (req, res) => {
    try {
        await deleteConversationService(
            req.params.id,
            req.user.userId
        );

        res.status(200).json({
            message: "Conversation deleted successfully",
        });

    } catch (error) {
        console.error("Delete conversation error:", error);

        res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : "Failed to delete conversation",
        });
    }
};

module.exports = {
    askAIQuestion,
    createConversation,
    getUserConversations: getUserConversationsController,
    getConversationMessages: getConversationMessagesController,
    deleteConversation,
};
