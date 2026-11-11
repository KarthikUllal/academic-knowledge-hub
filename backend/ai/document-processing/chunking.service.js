
/**
 * Purpose: Split cleaned document sections into overlapping chunks
 * using LangChain while preserving their source metadata.
 */

const { Document } = require("@langchain/core/documents");
const {
    RecursiveCharacterTextSplitter,
} = require("@langchain/textsplitters");

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 150;

// Create the LangChain recursive text splitter
const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
    separators: ["\n\n", "\n", " ", ""],
});

// Convert cleaned sections into LangChain Documents
const createDocuments = (sections, resourceId) => {
    return sections
        .filter((section) => section.text?.trim())
        .map((section) => {
            const { text, ...metadata } = section;

            return new Document({
                pageContent: text,
                metadata: {
                    resourceId: String(resourceId),
                    ...metadata,
                },
            });
        });
};

// Split documents and generate unique chunk IDs
const chunkDocument = async (sections, resourceId) => {
    if (!Array.isArray(sections)) {
        throw new Error("Document sections must be an array");
    }

    if (!resourceId) {
        throw new Error("Resource ID is required for chunking");
    }

    try {
        const documents = createDocuments(sections, resourceId);

        const splitDocuments = await textSplitter.splitDocuments(documents);

        return splitDocuments.map((document, index) => {
            const { loc, ...metadata } = document.metadata;

            return {
                id: `${resourceId}_chunk_${index}`,
                text: document.pageContent,
                metadata: {
                    ...metadata,
                    chunkIndex: index,
                },
            };
        });
    } catch (error) {
        console.error("Document chunking failed:", error.message);
        throw new Error(`Failed to chunk document: ${error.message}`);
    }
};

module.exports = {
    chunkDocument,
};
