
/**
 * Purpose: Handle conversation management operations,
 * including creation, retrieval and deletion.
 */

const Conversation = require("../models/conversation.model");
const Message = require("../models/message.model");

// Create a new conversation for a student
const createConversation = async (userId, title = "New Conversation") => {
  try {
    const conversation = await Conversation.create({
      user: userId,
      title,
    });

    return conversation;
  } catch (error) {
    throw new Error(`Failed to create conversation: ${error.message}`);
  }
};

// Retrieve all conversations belonging to a student
const getUserConversations = async (userId) => {
  try {
    const conversations = await Conversation.find({ user: userId })
      .sort({ updatedAt: -1 });

    return conversations;
  } catch (error) {
    throw new Error(`Failed to retrieve conversations: ${error.message}`);
  }
};

// Retrieve messages from a conversation owned by the student
const getConversationMessages = async (conversationId, userId) => {
  try {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      user: userId,
    });

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const messages = await Message.find({
      conversation: conversationId,
    }).sort({ createdAt: 1 });

    return messages;
  } catch (error) {
    throw new Error(`Failed to retrieve messages: ${error.message}`);
  }
};

// Delete a conversation and all its associated messages
const deleteConversation = async (conversationId, userId) => {
  try {
    const conversation = await Conversation.findOneAndDelete({
      _id: conversationId,
      user: userId,
    });

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    await Message.deleteMany({
      conversation: conversationId,
    });

    return { message: "Conversation deleted successfully" };
  } catch (error) {
    throw new Error(`Failed to delete conversation: ${error.message}`);
  }
};

module.exports = {
  createConversation,
  getUserConversations,
  getConversationMessages,
  deleteConversation,
};
