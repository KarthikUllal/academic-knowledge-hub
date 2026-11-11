
// Purpose: Clean extracted document text while preserving source information.

// Normalize whitespace and remove unwanted characters
const cleanText = (text) => {
  if (typeof text !== "string") {
    return "";
  }

  return text
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\u00A0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/[ \t]*\n[ \t]*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

// Clean each extracted section while preserving its metadata
const cleanDocument = (sections) => {
  if (!Array.isArray(sections)) {
    throw new Error("Document sections must be an array");
  }

  return sections
    .map((section) => ({
      ...section,
      text: cleanText(section.text),
    }))
    .filter((section) => section.text.length > 0);
};

module.exports = { cleanText, cleanDocument };
