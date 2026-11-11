
/**
 * Purpose: Orchestrate the complete RAG question-answering
 * workflow, including conversation memory and source handling.
 */

const Message = require("../../models/message.model");
const Conversation = require("../../models/conversation.model");

const { answerPrompt } = require("../prompts/answer.prompt");
const { generateAnswer } = require("../llm/llm.service");

const {
    retrieveRelevantChunks,
} = require("./retrieval.service");

const {
    buildContext,
    formatMessages,
} = require("./context.service");

const {
    getOrCreateConversation,
    getRecentChatHistory,
    convertToLangChainMessages,
    contextualizeQuestion,
} = require("./history.service");

const { enrichSources,
    groupSourcesByResource,
} = require("./source.service");

// Configure the number of academic chunks used to generate an answer
const MAX_CONTEXT_CHUNKS = 5;

// Execute the complete RAG question-answering pipeline
const askQuestion = async ({
    question,
    userId,
    conversationId,
    filters = {},
}) => {
    try {
        // Validate the question
        if (typeof question !== "string" || !question.trim()) {
            throw new Error("A valid question is required");
        }

        if (!userId) {
            throw new Error("User ID is required");
        }

        const trimmedQuestion = question.trim();

        // Find an existing conversation or create a new one
        const conversation = await getOrCreateConversation(
            userId,
            conversationId,
            trimmedQuestion
        );

        const currentConversationId = conversation._id;

        // Load previous conversation messages
        const chatHistory = await getRecentChatHistory(
            currentConversationId
        );

        // Debug conversation history
        console.log("\nChat History:");
        console.log(JSON.stringify(chatHistory, null, 2));

        // Save the student's current question
        await Message.create({
            conversation: currentConversationId,
            role: "user",
            content: trimmedQuestion,
        });

        // Convert the follow-up question into a standalone question
        const standaloneQuestion = await contextualizeQuestion(
            trimmedQuestion,
            chatHistory
        );

        // Debug contextualized question
        console.log("\nStandalone Question:", standaloneQuestion);

        // Retrieve and rerank relevant academic chunks
        const selectedChunks = await retrieveRelevantChunks(
            standaloneQuestion,
            filters
        );

        // Select the most relevant chunks for answer generation
        const contextChunks = selectedChunks.slice(
            0,
            MAX_CONTEXT_CHUNKS
        );

        // Debug retrieved academic chunks
        console.log("\nRetrieved Chunks:");

        contextChunks.forEach((item, index) => {
            console.log(`\nSource ${index + 1}:`);
            console.log("Title:", item.metadata?.title);
            console.log("Content:", item.document);
        });

        let answer;
        let sources = [];

        // Handle cases where no relevant academic chunks are found
        if (contextChunks.length === 0) {
            answer =
                "I could not find enough relevant information in the available academic documents to answer your question.";
        } else {
            // Prepare academic context from retrieved chunks
            const context = buildContext(contextChunks);

            // Generate the answer using conversation history and academic context
            const promptValue = await answerPrompt.invoke({
                chat_history: convertToLangChainMessages(chatHistory),
                context,
                question: trimmedQuestion,
            });

            const messages = formatMessages(promptValue);

            answer = await generateAnswer(messages);

            // Prepare source details for the response and message history
            sources = contextChunks.map((item, index) => {
                const metadata = item.metadata || {};

                return {
                    resourceId: metadata.resourceId,
                    title: metadata.title,
                    college: metadata.college,
                    pageNumber: metadata.pageNumber,
                    paragraphNumber: metadata.paragraphNumber,
                    slideNumber: metadata.slideNumber,
                    chunkIndex: metadata.chunkIndex,
                    sourceNumber: index + 1,
                };
            });

            // Fetch original resource details from MongoDB
            sources = await enrichSources(sources);

            // Group chunks belonging to the same resource
            sources = groupSourcesByResource(sources);
        }

        // Save the assistant's answer and its academic sources
        await Message.create({
            conversation: currentConversationId,
            role: "assistant",
            content: answer,
            sources,
        });

        // Update conversation activity time
        await Conversation.findByIdAndUpdate(
            currentConversationId,
            { updatedAt: new Date() }
        );

        return {
            conversationId: currentConversationId,
            answer,
            sources,
        };
    } catch (error) {
        console.error("RAG question-answering failed:", error.message);
        throw error;
    }
};

module.exports = {
    askQuestion,
};
