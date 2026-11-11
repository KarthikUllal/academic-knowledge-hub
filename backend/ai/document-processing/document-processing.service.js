
/**
 * Purpose: Orchestrate the complete academic document processing pipeline.
 */

const { downloadDocument } = require("./download.service");
const { extractDocument } = require("./extraction.service");
const { cleanDocument } = require("./cleaning.service");
const { chunkDocument } = require("./chunking.service");

const { generateEmbedding } = require("../embeddings/embedding.service");
const { storeDocumentChunk } = require("../vector-store/chroma.service");

// Process an uploaded academic resource and store its chunks in ChromaDB
const processDocument = async (resource) => {
    try {
        // Validate the resource information
        if (!resource || !resource._id || !resource.fileUrl || !resource.fileType) {
            throw new Error("Invalid resource information");
        }

        const resourceId = resource._id.toString();

        // Download the document from Cloudinary
        const fileBuffer = await downloadDocument(resource.fileUrl);

        // Extract text based on the document MIME type
        const extractedSections = await extractDocument(
            fileBuffer,
            resource.fileType
        );

        // Clean the extracted text
        const cleanedSections = cleanDocument(extractedSections);

        if (cleanedSections.length === 0) {
            throw new Error("No readable text found in the document");
        }

        // Split the cleaned text into chunks
        const chunks = await chunkDocument(cleanedSections, resourceId);

        if (chunks.length === 0) {
            throw new Error("No chunks generated from the document");
        }

        // Prepare resource metadata for ChromaDB
        const resourceMetadata = {
            title: resource.title,
            subject: resource.subject,
            course: resource.course,
            semester: resource.semester,
            college: resource.college,
            category: resource.category,
            fileType: resource.fileType,
        };

        // Remove undefined and null metadata values
        const filteredMetadata = Object.fromEntries(
            Object.entries(resourceMetadata).filter(
                ([, value]) => value !== undefined && value !== null
            )
        );

        // Generate embeddings and store each chunk in ChromaDB
        let storedChunks = 0;

        for (const [index, chunk] of chunks.entries()) {
            console.log(`Processing chunk ${index + 1}/${chunks.length}`);

            // Generate an embedding for the current chunk
            const embedding = await generateEmbedding(chunk.text, "passage");

            // Store the chunk, embedding and metadata
            await storeDocumentChunk({
                id: chunk.id,
                text: chunk.text,
                embedding,
                metadata: {
                    ...chunk.metadata,
                    ...filteredMetadata,
                },
            });

            storedChunks++;
            console.log(`Chunk ${index + 1} stored successfully`);
        }

        return {
            resourceId,
            totalChunks: chunks.length,
            storedChunks,
        };
    } catch (error) {
        console.error("Document processing failed:", error.message);
        throw new Error(`Failed to process document: ${error.message}`);
    }
};

module.exports = {
    processDocument,
};
