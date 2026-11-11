const axios = require("axios");
require("dotenv").config();
const generateEmbedding = async (text, inputType = "passage") => {
  try {
    const response = await axios.post(
      `${process.env.NVIDIA_BASE_URL}/embeddings`,
      {
        model: process.env.NVIDIA_EMBEDDING_MODEL,
        input: [text],
        input_type: inputType,
        encoding_format: "float",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.data[0].embedding;
  } catch (error) {
    console.error(
      "Embedding generation failed:",
      error.response?.data || error.message
    );

    throw new Error("Failed to generate embedding");
  }
};

module.exports = {
  generateEmbedding,
};