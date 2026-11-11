
/**
 * Purpose: Handle conversation memory and contextualize
 * student follow-up questions for the RAG pipeline.
 */

const Conversation = require("../../models/conversation.model");
const Message = require("../../models/message.model");

const {
  HumanMessage,
  AIMessage,
} = require("@langchain/core/messages");

const { contextualizePrompt } = require("../prompts/contextualize.prompt");
const { generateAnswer } = require("../llm/llm.service");
const { formatMessages } = require("./context.service");

const MAX_HISTORY_MESSAGES = 10;

// Find an existing conversation or create a new one
const getOrCreateConversation = async (userId, conversationId, question) => {
  if (conversationId) {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      user: userId,
    });

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    return conversation;
  }

  const title = question.trim().slice(0, 60);

  return Conversation.create({
    user: userId,
    title: title || "New Conversation",
  });
};

// Load recent messages in chronological order
const getRecentChatHistory = async (conversationId) => {
  const messages = await Message.find({
    conversation: conversationId,
  })
    .sort({ createdAt: -1 })
    .limit(MAX_HISTORY_MESSAGES)
    .lean();

  return messages.reverse();
};

// Convert MongoDB messages into LangChain message objects
const convertToLangChainMessages = (messages) => {
  return messages.map((message) => {
    if (message.role === "user") {
      return new HumanMessage(message.content);
    }

    return new AIMessage(message.content);
  });
};

// Convert a follow-up question into a standalone question
const contextualizeQuestion = async (question, chatHistory) => {
  if (chatHistory.length === 0) {
    return question;
  }

  const promptValue = await contextualizePrompt.invoke({
    chat_history: convertToLangChainMessages(chatHistory),
    question,
  });

  const messages = formatMessages(promptValue);

  const standaloneQuestion = await generateAnswer(messages);

  return standaloneQuestion.trim();
};

module.exports = {
  getOrCreateConversation,
  getRecentChatHistory,
  convertToLangChainMessages,
  contextualizeQuestion,
};
