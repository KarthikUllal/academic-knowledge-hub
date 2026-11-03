
const Resource = require("../models/resource.model");
const { uploadFile, deleteFile } = require("./cloudinary.service");

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

//update resource

const updateResourceService = async (id, userId, data) => {

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

    // Update only the allowed fields
    allowedFields.forEach((field) => {
        if (data[field] !== undefined) {
            resource[field] = data[field];
        }
    });

    // Send the updated resource for admin approval
    resource.status = "pending";
    resource.rejectionReason = "";

    // Save updated resource in MongoDB
    await resource.save();

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
