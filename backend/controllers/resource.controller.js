
const {
    createResourceService,
    getApprovedResourcesService,
    getResourceByIdService,
    getResourcePreviewService,
    downloadResourceService,
    updateResourceService,
    deleteResourceService
} = require("../services/resource.service");

const axios = require("axios")
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
        // Fetch the resource and increment download count
        const resource = await downloadResourceService(req.params.id);

        if (!resource) {
            return res.status(404).json({
                message: "Resource not found"
            });
        }

        // Fetch the actual file from Cloudinary
        const fileResponse = await axios.get(resource.fileUrl, {
            responseType: "stream"
        });

        // Map MIME types to file extensions
        const extensions = {
            "application/pdf": "pdf",
            "application/msword": "doc",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
            "application/vnd.ms-powerpoint": "ppt",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
            "application/vnd.ms-excel": "xls",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
            "text/plain": "txt",
            "text/csv": "csv",
            "image/jpeg": "jpg",
            "image/png": "png",
            "image/webp": "webp"
        };

        const extension = extensions[resource.fileType] || "file";

        // Generate a safe filename
        const safeTitle = (resource.title || "resource").replace(
            /[<>:"/\\|?*\x00-\x1F]/g,
            "_"
        );

        const fileName = `${safeTitle}.${extension}`;

        // Provide a safe fallback filename
        const fallbackName = fileName
            .replace(/[^\x20-\x7E]/g, "_")
            .replace(/["\\]/g, "_");

        // Set download response headers
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${fallbackName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`
        );

        res.setHeader(
            "Content-Type",
            resource.fileType || "application/octet-stream"
        );

        res.setHeader("Cache-Control", "no-store");

        // Set file size if available
        if (fileResponse.headers["content-length"]) {
            res.setHeader(
                "Content-Length",
                fileResponse.headers["content-length"]
            );
        }

        // Stream the file to the browser
        fileResponse.data.on("error", (error) => {
            console.error("File stream error:", error);
            res.destroy(error);
        });

        fileResponse.data.pipe(res);

    } catch (error) {
        console.error("Resource download error:", error);

        if (res.headersSent) {
            return res.destroy(error);
        }

        res.status(500).json({
            message: "Failed to download resource"
        });
    }
};


//update resource uploaded by logged-in student

const updateResource = async (req, res) => {
    try {
        const resource = await updateResourceService(
            req.params.id,
            req.user.userId,
            req.body,
            req.file
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
