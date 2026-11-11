
/**
 * Purpose: Rerank retrieved academic document chunks using NVIDIA Reranker.
 */

const axios = require("axios");
require("dotenv").config();

// Rerank retrieved document chunks based on the student's question
const rerankDocuments = async (query, retrievedResults) => {
  try {
    // Extract the retrieved documents from ChromaDB results
    const documents = retrievedResults.documents[0] || [];
    const ids = retrievedResults.ids[0] || [];
    const metadatas = retrievedResults.metadatas[0] || [];
    const distances = retrievedResults.distances[0] || [];

    if (documents.length === 0) {
      return [];
    }

    // Prepare document chunks for NVIDIA Reranker
    const passages = documents.map((document) => ({
      text: document,
    }));

    // Send the query and passages to NVIDIA
    const response = await axios.post(
      process.env.NVIDIA_RERANK_URL,
      {
        model: process.env.NVIDIA_RERANK_MODEL,
        query: {
          text: query,
        },
        passages,
        truncate: "END",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    // Arrange chunks according to their relevance scores
    const rankings = response.data.rankings;

    return rankings.map((result) => ({
      id: ids[result.index],
      document: documents[result.index],
      metadata: metadatas[result.index],
      distance: distances[result.index],
      relevanceScore: result.logit,
    }));
  } catch (error) {
    console.error(
      "Reranking failed:",
      error.response?.data || error.message
    );

    throw new Error("Failed to rerank documents");
  }
};

module.exports = {
  rerankDocuments,
};
