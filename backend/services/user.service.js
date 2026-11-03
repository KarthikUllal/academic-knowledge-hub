
const Resource = require("../models/resource.model");

// Get resources uploaded by a particular student
const getMyUploadsService = async (userId) => {

    const resources = await Resource.find({
        uploadedBy: userId
    })
        .sort({ createdAt: -1 });

    return resources;
};

module.exports = {
    getMyUploadsService
};
