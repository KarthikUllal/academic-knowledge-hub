const chromaClient = require("../../config/chroma");

const COLLECTION_NAME = "academic_resources";

// Get or create the academic resources collection in ChromaDB
const getAcademicCollection = async () => {
  try {
    const collection = await chromaClient.getOrCreateCollection({
      name: COLLECTION_NAME,
      embeddingFunction: null,
      metadata: {
        description: "Academic resources document chunks and embeddings",
      },
    });

    return collection;
  } catch (error) {
    throw new Error(`Failed to get academic collection: ${error.message}`);
  }
};

//store document embeddings, text , id, metadata in the academic resources collection in ChromaDB
const storeDocumentChunk = async ({ id, text, embedding, metadata = {} }) => {
  try {
    // Get the academic resources collection
    const collection = await getAcademicCollection();

    // Store the text, embedding, and metadata in ChromaDB
    await collection.upsert({
      ids: [id],
      documents: [text],
      embeddings: [embedding],
      metadatas: [metadata],
    });

    return true;
  } catch (error) {
    throw new Error(`Failed to store document chunk: ${error.message}`);
  }
};


//delete document chunk from the academic resources collection in ChromaDB (this is to delete test data)
const deleteDocumentChunk = async (id) => {
  try {
    const collection = await getAcademicCollection();

    // Delete the chunk using its ID
    await collection.delete({
      ids: [id],
    });

    return true;
  } catch (error) {
    throw new Error(`Failed to delete document chunk: ${error.message}`);
  }
};

//search for document chunks in the academic resources collection in ChromaDB based on a query embedding
const searchDocumentChunks = async (
  queryEmbedding,
  limit = 5,
  filter = null
) => {
  try {
    const collection = await getAcademicCollection();

    const queryOptions = {
      queryEmbeddings: [queryEmbedding],
      nResults: limit,
      include: ["documents", "metadatas", "distances"],
    };

    if (filter) {
      queryOptions.where = filter;
    }

    const results = await collection.query(queryOptions);

    return results;
  } catch (error) {
    throw new Error(`Failed to search document chunks: ${error.message}`);
  }
};


module.exports = {
  getAcademicCollection,
  storeDocumentChunk,
  deleteDocumentChunk,
  searchDocumentChunks,

};
