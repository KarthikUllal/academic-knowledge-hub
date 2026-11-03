const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");

// Upload a file to Cloudinary
const uploadFile = (file) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "academic-knowledge-hub/resources",
                resource_type: "auto"
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            }
        );

        // Convert the file buffer into a readable stream
        Readable.from(file.buffer).pipe(uploadStream);
    });
};


 // Delete a file from Cloudinary
const deleteFile = async (publicId, resourceType = "raw") => {
    const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType
    });

    return result;
};


module.exports = {
    uploadFile,
deleteFile
};