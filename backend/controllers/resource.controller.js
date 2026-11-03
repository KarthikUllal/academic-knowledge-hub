
const {
    createResourceService,
    getApprovedResourcesService,
    getResourceByIdService,
    getResourcePreviewService,
    downloadResourceService,
    updateResourceService,
    deleteResourceService
} = require("../services/resource.service");

// Upload a new academic resource
const createResource = async (req, res) => {
    try {
        const resource = await createResourceService(
            req.body,
            req.file,
            req.user
        );

        res.status(201).json({
            message: "Resource uploaded successfully. Waiting for admin approval.",
            resource
        });

    } catch (error) {
        console.error("Resource upload error:", error);

        res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : "Failed to upload resource"
        });
    }
};

// Get approved resources
const getApprovedResources = async (req, res) => {
    try {
        const result = await getApprovedResourcesService(req.query);

        res.status(200).json({
            message: "Resources fetched successfully",
            ...result
        });

    } catch (error) {
        console.error("Fetch resources error:", error);

        res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : "Failed to fetch resources"
        });
    }
};

// Get details of a single resource
const getResourceById = async (req, res) => {
    try {
        const resource = await getResourceByIdService(req.params.id);

        if (!resource) {
            return res.status(404).json({
                message: "Resource not found"
            });
        }

        res.status(200).json({
            message: "Resource details fetched successfully",
            resource
        });

    } catch (error) {
        console.error("Get resource error:", error);

        res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : "Failed to fetch resource details"
        });
    }
};


// Get preview details of an approved resource
const getResourcePreview = async (req, res) => {
    try {
        const resource = await getResourcePreviewService(req.params.id);

        if (!resource) {
            return res.status(404).json({
                message: "Resource not found"
            });
        }

        // Check whether the file format supports preview
        const supportedTypes = [
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!supportedTypes.includes(resource.fileType)) {
            return res.status(400).json({
                message: "Preview is not supported for this file format"
            });
        }

        res.status(200).json({
            message: "Resource preview fetched successfully",
            preview: {
                fileUrl: resource.fileUrl,
                fileType: resource.fileType
            }
        });

    } catch (error) {
        console.error("Resource preview error:", error);

        res.status(500).json({
            message: "Failed to fetch resource preview"
        });
    }
};


// Download an approved resource
const downloadResource = async (req, res) => {
    try {
        const resource = await downloadResourceService(req.params.id);

        if (!resource) {
            return res.status(404).json({
                message: "Resource not found"
            });
        }

        res.status(200).json({
            message: "Resource download URL fetched successfully",
            download: {
                fileUrl: resource.fileUrl,
                fileType: resource.fileType,
                downloads: resource.downloads
            }
        });

    } catch (error) {
        console.error("Resource download error:", error);

        res.status(500).json({
            message: "Failed to fetch resource download URL"
        });
    }
};

//update resource uploaded by logged-in student
const updateResource = async (req, res) => {
    try {
        const resource = await updateResourceService(
            req.params.id,
            req.user.userId,
            req.body
        );

        res.status(200).json({
            message: "Resource updated successfully. Waiting for admin approval.",
            resource
        });

    } catch (error) {
        console.error("Update resource error:", error);

        res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : "Failed to update resource"
        });
    }
};


//delete resource uploaded by logged-in student

const deleteResource = async (req, res) => {
    try {
        await deleteResourceService(
            req.params.id,
            req.user.userId
        );

        res.status(200).json({
            message: "Resource deleted successfully"
        });

    } catch (error) {
        console.error("Delete resource error:", error);

        res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : "Failed to delete resource"
        });
    }
};







module.exports = {
    createResource,
    getApprovedResources,
    getResourceById,
    getResourcePreview,
    downloadResource,
    updateResource,
    deleteResource
};
