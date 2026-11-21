
const Resource = require("../models/resource.model");
const User = require("../models/user.model");
const { uploadFile, deleteFile } = require("./cloudinary.service");

// Get resources uploaded by a particular student
const getMyUploadsService = async (userId) => {
    const resources = await Resource.find({
        uploadedBy: userId
    }).sort({ createdAt: -1 });

    return resources;
};

// Get logged-in user's profile
const getProfileService = async (userId) => {
    const user = await User.findById(userId).select("-password");

    return user;
};

// Update logged-in user's profile
const updateProfileService = async (userId, profileData) => {
    const allowedFields = [
        "fullName",
        "college",
        "department",
        "course",
        "semester",
        "studentId",
        "graduationYear",
        "bio"
    ];

    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    allowedFields.forEach((field) => {
        if (profileData[field] !== undefined) {
            user[field] = profileData[field];
        }
    });

    await user.save();

    return User.findById(userId).select("-password");
};

// Upload or update profile picture
const updateProfilePictureService = async (userId, file) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    // Upload new profile picture to Cloudinary
    const result = await uploadFile(file);

    const oldPublicId = user.profilePicturePublicId;

    // Save new image details
    user.profilePicture = result.secure_url;
    user.profilePicturePublicId = result.public_id;

    try {
        await user.save();
    } catch (error) {
        // Remove newly uploaded image if database update fails
        await deleteFile(result.public_id, "image").catch((deleteError) => {
            console.error("Failed to remove new profile image:", deleteError);
        });

        throw error;
    }

    // Delete previous profile picture after successful update
    if (oldPublicId) {
        await deleteFile(oldPublicId, "image").catch((error) => {
            console.error("Failed to delete old profile picture:", error);
        });
    }

    return User.findById(userId).select("-password");
};

module.exports = {
    getMyUploadsService,
    getProfileService,
    updateProfileService,
    updateProfilePictureService
};
