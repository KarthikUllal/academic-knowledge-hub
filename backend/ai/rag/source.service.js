
/**
 * Purpose: Fetch original academic resource details from MongoDB
 * and enrich the sources returned by the RAG pipeline.
 */

const Resource = require("../../models/resource.model");

// Enrich retrieved sources with their original resource details
const enrichSources = async (sources) => {
    try {
        if (!sources || sources.length === 0) {
            return [];
        }

        // Get unique resource IDs from the retrieved sources
        const resourceIds = [
            ...new Set(
                sources
                    .map((source) => source.resourceId?.toString())
                    .filter(Boolean)
            ),
        ];

        if (resourceIds.length === 0) {
            return [];
        }

        // Fetch approved resources from MongoDB
        const resources = await Resource.find({
            _id: { $in: resourceIds },
            status: "approved",
        })
            .select("title college fileUrl category subject course semester")
            .lean();

        // Create a lookup map for faster resource matching
        const resourceMap = new Map(
            resources.map((resource) => [
                resource._id.toString(),
                resource,
            ])
        );

        // Attach original resource details to each source
        return sources
            .map((source) => {
                const resource = resourceMap.get(
                    source.resourceId?.toString()
                );

                if (!resource) {
                    return null;
                }

                return {
                    ...source,
                    title: resource.title,
                    college: resource.college,
                    fileUrl: resource.fileUrl,
                    category: resource.category,
                    subject: resource.subject,
                    course: resource.course,
                    semester: resource.semester,
                };
            })
            .filter(Boolean);

    } catch (error) {
        console.error("Source enrichment failed:", error.message);
        throw new Error("Failed to enrich academic sources");
    }
};



//Group enriched sources belonging to the same resource.

const groupSourcesByResource = (sources) => {
    const groupedSources = new Map();

    sources.forEach((source) => {
        const resourceId = source.resourceId.toString();

        // Create a group when this resource appears for the first time
        if (!groupedSources.has(resourceId)) {
            groupedSources.set(resourceId, {
                resourceId: source.resourceId,
                title: source.title,
                college: source.college,
                fileUrl: source.fileUrl,
                category: source.category,
                subject: source.subject,
                course: source.course,
                semester: source.semester,
                pages: [],
                sourceNumbers: [],
            });
        }

        const group = groupedSources.get(resourceId);

        // Add page number only if it is not already present
        if (
            source.pageNumber &&
            !group.pages.includes(source.pageNumber)
        ) {
            group.pages.push(source.pageNumber);
        }

        // Preserve the original source number
        group.sourceNumbers.push(source.sourceNumber);
    });

    return Array.from(groupedSources.values());
};


module.exports = { enrichSources, groupSourcesByResource };
