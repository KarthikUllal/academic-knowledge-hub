
import api from "./api";

// Ask an AI question
export const askAIQuestion = (data) => {
  return api.post("/ai/ask", data);
};

// Create a conversation
export const createConversation = (data) => {
  return api.post("/ai/conversations", data);
};

// Get all conversations
export const getConversations = () => {
  return api.get("/ai/conversations");
};

// Get conversation messages
export const getConversationMessages = (id) => {
  return api.get(`/ai/conversations/${id}/messages`);
};

// Delete a conversation
export const deleteConversation = (id) => {
  return api.delete(`/ai/conversations/${id}`);
};
