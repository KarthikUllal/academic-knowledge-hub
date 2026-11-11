
/**
 * Purpose: Handle academic document retrieval, metadata filtering
 * and reranking for the RAG pipeline.
 */

const { generateEmbedding } = require("../embeddings/embedding.service");
const {
    searchDocumentChunks,
} = require("../vector-store/chroma.service");
const {
    rerankDocuments,
} = require("../reranking/reranking.service");

// Build optional metadata filters for ChromaDB search
const buildSearchFilter = ({ college, resourceId } = {}) => {
    const conditions = [];

    if (college) {
        conditions.push({ college: { $eq: college } });
    }

    if (resourceId) {
        conditions.push({ resourceId: { $eq: String(resourceId) } });
    }

    if (conditions.length === 0) return null;
    if (conditions.length === 1) return conditions[0];

    return { $and: conditions };
};

// Retrieve and rerank the most relevant academic chunks
const retrieveRelevantChunks = async (
    question,
    filters = {},
    retrievalLimit = 10,
    resultLimit = 5
) => {
    const queryEmbedding = await generateEmbedding(question, "query");

    const searchFilter = buildSearchFilter(filters);

    const retrievedResults = await searchDocumentChunks(
        queryEmbedding,
        retrievalLimit,
        searchFilter
    );

    if (!retrievedResults.ids?.[0]?.length) {
        return [];
    }

    const rerankedResults = await rerankDocuments(question, retrievedResults);

    return rerankedResults.slice(0, resultLimit);
};

module.exports = {
    buildSearchFilter,
    retrieveRelevantChunks,
};
