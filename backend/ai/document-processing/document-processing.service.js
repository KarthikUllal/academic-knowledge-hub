
/**
 * Purpose: Orchestrate the complete academic document processing pipeline.
 */

const { downloadDocument } = require("./download.service");
const { extractDocument } = require("./extraction.service");
const { cleanDocument } = require("./cleaning.service");
const { chunkDocument } = require("./chunking.service");

const { generateEmbedding } = require("../embeddings/embedding.service");
const { storeDocumentChunk, deleteResourceChunks } = require("../vector-store/chroma.service");
const Resource = require("../../models/resource.model");

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


// Process an approved academic resource and store its chunks in ChromaDB
const processApprovedResource = async (resourceId) => {
    // Only process approved resources that haven't completed processing
    const resource = await Resource.findOneAndUpdate(
        {
            _id: resourceId,
            status: "approved",
            aiProcessingStatus: { $in: ["pending", "failed"] },
        },
        {
            $set: {
                aiProcessingStatus: "processing",
                aiProcessingError: "",
                aiProcessedAt: null,
                aiChunkCount: 0,
            },
        },
        { new: true }
    );

    // Prevent duplicate processing or processing unapproved resources
    if (!resource) {
        return;
    }

    // Supported document formats
    const supportedFileTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "text/plain",
    ];

    // Skip unsupported file formats
    if (!supportedFileTypes.includes(resource.fileType)) {
        await Resource.updateOne(
            { _id: resourceId, status: "approved" },
            {
                $set: {
                    aiProcessingStatus: "skipped",
                    aiProcessingError: "Unsupported file format for AI processing",
                    aiChunkCount: 0,
                },
            }
        );

        return;
    }

    try {
        // Remove any existing chunks before processing
        await deleteResourceChunks(resourceId);

        // Run the existing document processing pipeline
        const result = await processDocument(resource);

        // Mark processing as successful
        await Resource.updateOne(
            {
                _id: resourceId,
                status: "approved",
                aiProcessingStatus: "processing",
            },
            {
                $set: {
                    aiProcessingStatus: "ready",
                    aiProcessingError: "",
                    aiProcessedAt: new Date(),
                    aiChunkCount: result.storedChunks,
                },
            }
        );

        console.log(`AI processing completed for resource: ${resourceId}`);

    } catch (error) {
        // Remove partially stored chunks if processing fails
        try {
            await deleteResourceChunks(resourceId);
        } catch (cleanupError) {
            console.error("Failed to clean up ChromaDB chunks:", cleanupError.message);
        }

        // Record processing failure
        await Resource.updateOne(
            { _id: resourceId },
            {
                $set: {
                    aiProcessingStatus: "failed",
                    aiProcessingError: error.message,
                    aiProcessedAt: null,
                    aiChunkCount: 0,
                },
            }
        );

        console.error(
            `AI processing failed for resource ${resourceId}:`,
            error.message
        );
    }
};


module.exports = {
    processDocument,
    processApprovedResource,
};
