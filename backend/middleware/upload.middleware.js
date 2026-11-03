const multer = require("multer");

// Store uploaded files in memory
const storage = multer.memoryStorage();

// Allowed file formats
const allowedMimeTypes = [
    // PDF
    "application/pdf",

    // Word documents
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    // PowerPoint presentations
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",

    // Excel spreadsheets
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

    // Text files
    "text/plain",
    "text/csv",

    // Images
    "image/jpeg",
    "image/png",
    "image/webp"
];

// Validate uploaded files
const fileFilter = (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Unsupported file format"), false);
    }
};

// Configure Multer
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 9 * 1024 * 1024
    }
});

module.exports = upload;