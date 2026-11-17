const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");
const path = require("path");
const crypto = require("crypto");

// Upload a file to Cloudinary
// const uploadFile = (file) => {
//     return new Promise((resolve, reject) => {
//         const uploadStream = cloudinary.uploader.upload_stream(
//             {
//                 folder: "academic-knowledge-hub/resources",
//                 resource_type: "auto"
//             },
//             (error, result) => {
//                 if (error) {
//                     return reject(error);
//                 }

//                 resolve(result);
//             }
//         );

//         // Convert the file buffer into a readable stream
//         Readable.from(file.buffer).pipe(uploadStream);
//     });
// };


// Upload a file to Cloudinary
const uploadFile = (file) => {
    return new Promise((resolve, reject) => {

        // Get the original file extension
        const extension = path.extname(file.originalname).toLowerCase();

        // Keep images and PDFs as image resources
        const isImageOrPdf =
            file.mimetype.startsWith("image/") ||
            file.mimetype === "application/pdf";

        // Select Cloudinary resource type
        const resourceType = isImageOrPdf ? "image" : "raw";

        // Generate a unique file ID
        const uniqueId = crypto.randomUUID();

        // Include the extension in public_id for raw files
        const publicId = resourceType === "raw"
            ? `${uniqueId}${extension}`
            : uniqueId;

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "academic-knowledge-hub/resources",
                resource_type: resourceType,
                public_id: publicId
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