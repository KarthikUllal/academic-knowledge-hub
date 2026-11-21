
const Resource = require("../models/resource.model");
const { uploadFile, deleteFile } = require("./cloudinary.service");
const { deleteResourceChunks } = require("../ai/vector-store/chroma.service");
// Create a new resource
const createResourceService = async (data, file, user) => {

    // Check whether a file was uploaded
    if (!file) {
        const error = new Error("Please upload a file");
        error.statusCode = 400;
        throw error;
    }

    // Upload the file to Cloudinary
    const uploadedFile = await uploadFile(file);

    // Save resource details in MongoDB
    const resource = await Resource.create({
        title: data.title,
        description: data.description,
        subject: data.subject,
        course: data.course,
        semester: data.semester,
        college: data.college,
        category: data.category,

        fileUrl: uploadedFile.secure_url,
        filePublicId: uploadedFile.public_id,
        fileResourceType: uploadedFile.resource_type,
        fileType: file.mimetype,
        uploadedBy: user.userId
    });

    return resource;
};

// Get approved resources with search, filters and pagination
const getApprovedResourcesService = async (query) => {

    const {
        search,
        course,
        semester,
        college,
        category,
        page = 1,
        limit = 10
    } = query;

    // Base filter
    let filter = {
        status: "approved"
    };

    // Search by title, subject and description
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { subject: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } }
        ];
    }

    // Filter by course
    if (course) {
        filter.course = {
            $regex: `^${course}$`,
            $options: "i"
        };
    }

    // Filter by semester
    if (semester) {
        filter.semester = Number(semester);
    }

    // Filter by college
    if (college) {
        filter.college = {
            $regex: `^${college}$`,
            $options: "i"
        };
    }

    // Filter by category
    if (category) {
        filter.category = {
            $regex: `^${category}$`,
            $options: "i"
        };
    }

    // Convert pagination values into numbers
    const currentPage = Math.max(1, Number(page));
    const perPage = Math.min(50, Math.max(1, Number(limit)));

    // Calculate how many resources to skip
    const skip = (currentPage - 1) * perPage;

    // Count matching resources
    const totalResources = await Resource.countDocuments(filter);

    // Calculate total pages
    const totalPages = Math.ceil(totalResources / perPage);

    // Fetch resources for the requested page
    const resources = await Resource.find(filter)
        .populate("uploadedBy", "fullName college")
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(perPage);

    return {
        currentPage,
        limit: perPage,
        totalResources,
        totalPages,
        count: resources.length,
        resources
    };
};

// Get details of a single resource
const getResourceByIdService = async (id) => {

    const resource = await Resource.findOne({
        _id: id,
        status: "approved"
    })
        .populate("uploadedBy", "fullName college");

    return resource;
};

//fetches resource for preview 

const getResourcePreviewService = async (id) => {

    const resource = await Resource.findOne({
        _id: id,
        status: "approved"
    });

    return resource;
};


//download resource and increment download count
const downloadResourceService = async (id) => {

    const resource = await Resource.findOneAndUpdate(
        {
            _id: id,
            status: "approved"
        },
        {
            $inc: { downloads: 1 }
        },
        {
            new: true
        }
    );

    return resource;
};


// Update resource
const updateResourceService = async (id, userId, data, file) => {

    // Find the resource uploaded by the logged-in student
    const resource = await Resource.findOne({
        _id: id,
        uploadedBy: userId
    });

    if (!resource) {
        const error = new Error("Resource not found or access denied");
        error.statusCode = 404;
        throw error;
    }

    // Allow editing only rejected resources
    if (resource.status !== "rejected") {
        const error = new Error("Only rejected resources can be edited");
        error.statusCode = 400;
        throw error;
    }

    // Fields that students are allowed to update
    const allowedFields = [
        "title",
        "description",
        "subject",
        "course",
        "semester",
        "college",
        "category"
    ];

    // Update the allowed text fields
    allowedFields.forEach((field) => {
        if (data[field] !== undefined) {
            resource[field] = data[field];
        }
    });

    let uploadedFile = null;

    // Upload a replacement file if the student selected one
    if (file) {
        uploadedFile = await uploadFile(file);

        // Keep the existing file details in case saving fails
        const oldFile = {
            fileUrl: resource.fileUrl,
            filePublicId: resource.filePublicId,
            fileResourceType: resource.fileResourceType,
            fileType: resource.fileType
        };

        // Update the resource with the new file details
        resource.fileUrl = uploadedFile.secure_url;
        resource.filePublicId = uploadedFile.public_id;
        resource.fileResourceType = uploadedFile.resource_type;
        resource.fileType = file.mimetype;

        try {
            // Send the updated resource for admin approval
            resource.status = "pending";
            resource.rejectionReason = "";

            // Reset AI processing information
            resource.aiProcessingStatus = "pending";
            resource.aiProcessingError = "";
            resource.aiProcessedAt = null;
            resource.aiChunkCount = 0;

            await resource.save();

        } catch (error) {
            // If saving fails, remove the newly uploaded file
            try {
                await deleteFile(
                    uploadedFile.public_id,
                    uploadedFile.resource_type
                );
            } catch (cleanupError) {
                console.error("New file cleanup error:", cleanupError);
            }

            throw error;
        }

        // Delete the old file only after the new resource is saved
        try {
            const result = await deleteFile(
                oldFile.filePublicId,
                oldFile.fileResourceType
            );

            if (result.result !== "ok" && result.result !== "not found") {
                console.error("Old Cloudinary file could not be deleted:", result);
            }

        } catch (error) {
            console.error("Old Cloudinary file deletion error:", error);
        }

    } else {
        // No replacement file: keep the existing file
        resource.status = "pending";
        resource.rejectionReason = "";

        // Reset AI processing information
        resource.aiProcessingStatus = "pending";
        resource.aiProcessingError = "";
        resource.aiProcessedAt = null;
        resource.aiChunkCount = 0;

        await resource.save();
    }

    return resource;
};


// Delete resource uploaded by logged-in student
const deleteResourceService = async (id, userId) => {

    // Find the resource uploaded by the logged-in student
    const resource = await Resource.findOne({
        _id: id,
        uploadedBy: userId
    });

    if (!resource) {
        const error = new Error("Resource not found or access denied");
        error.statusCode = 404;
        throw error;
    }

    // Delete all AI chunks associated with this resource
    await deleteResourceChunks(resource._id);

    // Delete the file from Cloudinary
    const result = await deleteFile(
        resource.filePublicId,
        resource.fileResourceType
    );

    if (result.result !== "ok" && result.result !== "not found") {
        throw new Error("Failed to delete file from Cloudinary");
    }

    // Delete resource details from MongoDB
    await Resource.findByIdAndDelete(id);

    return resource;
};


module.exports = {
    createResourceService,
    getApprovedResourcesService,
    getResourceByIdService,
    getResourcePreviewService,
    downloadResourceService,
    updateResourceService,
    deleteResourceService
};
