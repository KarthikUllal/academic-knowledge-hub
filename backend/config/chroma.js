const { ChromaClient } = require("chromadb");

const chromaClient = new ChromaClient({
  host: process.env.CHROMA_HOST || "localhost",
  port: Number(process.env.CHROMA_PORT) || 8000,
  ssl: process.env.CHROMA_SSL === "true",
});

module.exports = chromaClient;