
const Resource = require("../models/resource.model");
const User = require("../models/user.model");
const { deleteFile } = require("./cloudinary.service");
const { processApprovedResource } = require("../ai/document-processing/document-processing.service");
const { deleteResourceChunks } = require("../ai/vector-store/chroma.service");

// Get all pending resources
const getPendingResourcesService = async () => {

    const resources = await Resource.find({
        status: "pending"
    })
        .populate("uploadedBy", "fullName email college course")
        .sort({ createdAt: -1 });

    return resources;
};



// Approve resources and start AI processing
const approveResourceService = async (id) => {

    // Find a pending resource
    const resource = await Resource.findOne({
        _id: id,
        status: "pending"
    });

    if (!resource) {
        const error = new Error("Pending resource not found");
        error.statusCode = 404;
        throw error;
    }

    // Approve the resource
    resource.status = "approved";
    resource.rejectionReason = "";

    await resource.save();

    // Start AI document processing without making the admin wait
    processApprovedResource(resource._id).catch((error) => {
        console.error(
            `Failed to start AI processing for resource ${resource._id}:`,
            error.message
        );
    });

    return resource;
};


// Reject a resource
const rejectResourceService = async (id, rejectionReason) => {

    // Find a pending resource
    const resource = await Resource.findOne({
        _id: id,
        status: "pending"
    });

    if (!resource) {
        const error = new Error("Pending resource not found");
        error.statusCode = 404;
        throw error;
    }

    // Update resource status and rejection reason
    resource.status = "rejected";
    resource.rejectionReason = rejectionReason;

    await resource.save();

    return resource;
};


// Get all resources
const getAllResourcesService = async () => {

    const resources = await Resource.find()
        .populate("uploadedBy", "fullName email college course")
        .sort({ createdAt: -1 });

    return resources;
};

// Delete any resource by admin
const deleteResourceByAdminService = async (id) => {

    // Find the resource
    const resource = await Resource.findById(id);

    if (!resource) {
        const error = new Error("Resource not found");
        error.statusCode = 404;
        throw error;
    }

    // Delete all AI chunks associated with this resource
    await deleteResourceChunks(resource._id);

    // Delete file from Cloudinary
    const result = await deleteFile(
        resource.filePublicId,
        resource.fileResourceType
    );

    if (result.result !== "ok" && result.result !== "not found") {
        throw new Error("Failed to delete file from Cloudinary");
    }

    // Delete resource from MongoDB
    await Resource.findByIdAndDelete(id);

    return resource;
};


// User Management Services //

// Get all users
const getAllUsersService = async () => {

    const users = await User.find({
        role: "student"
    })
        .select("-password")
        .sort({ createdAt: -1 });

    return users;
};

// Get a student by ID
const getUserByIdService = async (id) => {

    const user = await User.findOne({
        _id: id,
        role: "student"
    }).select("-password");

    return user;
};


// Update student account status
const updateStudentStatusService = async (id, isActive) => {

    // Find the student
    const user = await User.findOne({
        _id: id,
        role: "student"
    });

    if (!user) {
        const error = new Error("Student not found");
        error.statusCode = 404;
        throw error;
    }

    // Update account status
    user.isActive = isActive;

    await user.save();

    const userData = user.toObject(); // convert Mongoose document to plain JavaScript object

    delete userData.password; // Remove password before returning user details : so that it is not exposed in the response
    return userData;
};



//delete student account and all associated resources
const deleteStudentService = async (id) => {

    // Find the student
    const student = await User.findOne({
        _id: id,
        role: "student"
    });

    if (!student) {
        const error = new Error("Student not found");
        error.statusCode = 404;
        throw error;
    }

    // Find all resources uploaded by the student
    const resources = await Resource.find({
        uploadedBy: id
    });

    // Delete resource files and AI chunks
    for (const resource of resources) {

        // Delete AI chunks from ChromaDB
        await deleteResourceChunks(resource._id);

        // Delete resource file from Cloudinary
        const result = await deleteFile(
            resource.filePublicId,
            resource.fileResourceType
        );

        if (result.result !== "ok" && result.result !== "not found") {
            throw new Error("Failed to delete resource files from Cloudinary");
        }
    }

    // Delete all resource records from MongoDB
    await Resource.deleteMany({
        uploadedBy: id
    });

    // Delete the student account
    await User.findByIdAndDelete(id);

    return {
        message: "Student and associated resources deleted successfully",
        deletedResources: resources.length
    };
};


// Get admin dashboard statistics
const getDashboardStatsService = async () => {

    const totalStudents = await User.countDocuments({
        role: "student"
    });

    const totalResources = await Resource.countDocuments();

    const approvedResources = await Resource.countDocuments({
        status: "approved"
    });

    const pendingResources = await Resource.countDocuments({
        status: "pending"
    });

    const rejectedResources = await Resource.countDocuments({
        status: "rejected"
    });

    const downloadResult = await Resource.aggregate([
        {
            $group: {
                _id: null,
                totalDownloads: { $sum: "$downloads" }
            }
        }
    ]);

    const totalDownloads = downloadResult.length > 0
        ? downloadResult[0].totalDownloads
        : 0;

    const recentStudents = await User.find({
        role: "student"
    })
        .select("-password")
        .sort({ createdAt: -1 })
        .limit(5);

    const recentResources = await Resource.find()
        .populate("uploadedBy", "fullName email")
        .sort({ createdAt: -1 })
        .limit(5);

    return {
        totalStudents,
        totalResources,
        approvedResources,
        pendingResources,
        rejectedResources,
        totalDownloads,
        recentStudents,
        recentResources
    };
};


//preview document before approval
const getAdminResourcePreviewService = async (resourceId) => {
    const resource = await Resource.findById(resourceId);

    if (!resource) {
        throw new Error("Resource not found");
    }

    return {
        fileUrl: resource.fileUrl,
        fileType: resource.fileType,
        title: resource.title
    };
};


const getAdminResourceForDownloadService = async (resourceId) => {
    const resource = await Resource.findById(resourceId);

    if (!resource) {
        throw new Error("Resource not found");
    }

    return resource;
};


// Retry AI processing for a failed resource
const retryAIProcessingService = async (id) => {

     console.log("Received ID:", id);
    console.log("Is ID a string:", typeof id === "string");
    // Find an approved resource whose AI processing failed
    const resource = await Resource.findOne({
        _id: id,
        status: "approved",
        aiProcessingStatus: "failed",
    });

    if (!resource) {
        const error = new Error(
            "Approved resource with failed AI processing not found"
        );
        error.statusCode = 404;
        throw error;
    }

    // Start AI processing again without blocking the API response
    processApprovedResource(resource._id).catch((error) => {
        console.error(
            `Failed to retry AI processing for resource ${resource._id}:`,
            error.message
        );
    });

    return {
        message: "AI processing retry started",
        resourceId: resource._id,
    };
};


module.exports = {
    approveResourceService,
    getPendingResourcesService,
    rejectResourceService,
    getAllResourcesService,
    deleteResourceByAdminService,
    getAllUsersService,
    getUserByIdService,
    updateStudentStatusService,
    deleteStudentService,
    getDashboardStatsService,
    getAdminResourcePreviewService,
    getAdminResourceForDownloadService,
    retryAIProcessingService
};
