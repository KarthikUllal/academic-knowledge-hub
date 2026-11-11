
/**
 * Purpose: Prepare academic context and format LangChain
 * messages for the NVIDIA LLM.
 */

// Build source-labeled academic context for the answer prompt
const buildContext = (documents) => {
    return documents
        .map((item, index) => {
            const metadata = item.metadata || {};

            const sourceDetails = [
                metadata.title && `Title: ${metadata.title}`,
                metadata.college && `College: ${metadata.college}`,
                metadata.pageNumber != null && `Page: ${metadata.pageNumber}`,
                metadata.paragraphNumber != null &&
                `Paragraph: ${metadata.paragraphNumber}`,
                metadata.slideNumber != null && `Slide: ${metadata.slideNumber}`,
            ]
                .filter(Boolean)
                .join(", ");

            return `[Source ${index + 1}]
${sourceDetails}
Content:
${item.document}`;
        })
        .join("\n\n");
};

// Convert LangChain messages into NVIDIA-compatible messages
const formatMessages = (promptValue) => {
    return promptValue.toChatMessages().map((message) => {
        const messageType = message._getType();

        const role =
            messageType === "system"
                ? "system"
                : messageType === "ai"
                    ? "assistant"
                    : "user";

        return {
            role,
            content: message.content,
        };
    });
};

module.exports = {
    buildContext,
    formatMessages,
};
