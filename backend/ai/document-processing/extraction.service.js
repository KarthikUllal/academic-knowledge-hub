
// Purpose: Extract structured text from PDF, DOCX, PPTX and TXT documents.

const { OfficeParser } = require("officeparser");


// Extract text from a PDF, Word or PowerPoint document
const extractOfficeDocument = async (fileBuffer, fileType) => {
  // Parse the document into a structured syntax tree
  const document = await OfficeParser.parseOffice(fileBuffer, {
    fileType,
  });

  // Extract PDF text page by page
  if (fileType === "pdf") {
    return document.content
      .filter((item) => item.type === "page")
      .map((item, index) => ({
        sourceType: "pdf",
        pageNumber: index + 1,
        text: item.text || "",
      }));
  }

  // Extract Word document text paragraph by paragraph
  if (fileType === "docx") {
    return document.content
      .filter((item) => item.type === "paragraph")
      .map((item, index) => ({
        sourceType: "docx",
        paragraphNumber: index + 1,
        text: item.text || "",
      }));
  }

  // Extract PowerPoint text slide by slide
  if (fileType === "pptx") {
    return document.content
      .filter((item) => item.type === "slide")
      .map((slide, index) => ({
        sourceType: "pptx",
        slideNumber: slide.metadata?.slideNumber || index + 1,
        text: (slide.children || [])
          .filter((item) => item.type === "paragraph")
          .map((item) => item.text || "")
          .filter((text) => text.trim().length > 0)
          .join("\n"),
      }));
  }

  return [];
};

// Extract plain text from a TXT file
const extractTextFile = (fileBuffer) => {
  const text = fileBuffer.toString("utf8");

  return [
    {
      sourceType: "txt",
      sectionNumber: 1,
      text,
    },
  ];
};

// Select the appropriate extraction process based on MIME type
const extractDocument = async (fileBuffer, mimeType) => {
  try {
    switch (mimeType) {
      case "application/pdf":
        return await extractOfficeDocument(fileBuffer, "pdf");

      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return await extractOfficeDocument(fileBuffer, "docx");

      case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        return await extractOfficeDocument(fileBuffer, "pptx");

      case "text/plain":
        return extractTextFile(fileBuffer);

      default:
        throw new Error(`Unsupported file type: ${mimeType}`);
    }
  } catch (error) {
    console.error("Document extraction failed:", error.message);
    throw new Error(`Failed to extract document: ${error.message}`);
  }
};

module.exports = { extractDocument };
