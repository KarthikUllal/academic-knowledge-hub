
/**
 * Purpose: Define a LangChain prompt template that rewrites
 * follow-up questions into standalone questions for retrieval.
 */

const {
    ChatPromptTemplate,
    MessagesPlaceholder,
} = require("@langchain/core/prompts");

// Define instructions for rewriting follow-up questions
const contextualizePrompt = ChatPromptTemplate.fromMessages([
    [
        "system",
        `You are a question rewriting component in an academic RAG system.

Your ONLY task is to rewrite the student's latest question into
a standalone search query using the conversation history.

STRICT RULES:
- NEVER answer the student's question.
- NEVER explain any concept.
- NEVER provide advantages, disadvantages, examples or summaries.
- NEVER generate bullet points or numbered lists.
- Use conversation history only to resolve missing references.
- Preserve the original meaning of the student's question.
- Keep the rewritten question concise.
- If the question is already standalone, return it unchanged.
- Return ONLY one rewritten question.
- Do not include introductions, explanations or additional text.

Remember: Return a question, NEVER an answer.`
    ],
    new MessagesPlaceholder("chat_history"),
    [
        "human",
        `Rewrite this question for academic document retrieval:

{question}`
    ],
]);

module.exports = { contextualizePrompt };
