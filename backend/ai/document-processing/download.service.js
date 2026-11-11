// Purpose: Download academic resource files from Cloudinary for AI processing.

const axios = require("axios");

// Download a document from its Cloudinary URL
const downloadDocument = async (fileUrl) => {
  try {
    // Download the file as binary data
    const response = await axios.get(fileUrl, {
      responseType: "arraybuffer",
      timeout: 30000,
    });

    // Convert the downloaded data into a Node.js Buffer
    const fileBuffer = Buffer.from(response.data);

    return fileBuffer;
  } catch (error) {
     // Display the HTTP status and Cloudinary error details
    console.error("Download error:", error.message);
    console.error("HTTP status:", error.response?.status);
    console.error(
      "Cloudinary error:",
      error.response?.headers?.["x-cld-error"]
    );

    if (error.response?.data) {
      console.error(
        "Response details:",
        Buffer.from(error.response.data).toString("utf8")
      );
    }

    throw new Error("Failed to download document");
};
}

module.exports = {
  downloadDocument,
};