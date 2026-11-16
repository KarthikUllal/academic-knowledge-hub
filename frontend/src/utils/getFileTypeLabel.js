
const getFileTypeLabel = (fileType) => {
  const fileTypes = {
    "application/pdf": "PDF Document",
    "application/msword": "Word Document (.doc)",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "Word Document (.docx)",
    "application/vnd.ms-powerpoint": "PowerPoint Presentation (.ppt)",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      "PowerPoint Presentation (.pptx)",
    "application/vnd.ms-excel": "Excel Spreadsheet (.xls)",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      "Excel Spreadsheet (.xlsx)",
    "text/plain": "Text File (.txt)",
    "text/csv": "CSV File",
    "image/jpeg": "JPEG Image",
    "image/png": "PNG Image",
    "image/webp": "WebP Image",
  };

  return fileTypes[fileType] || "Unknown File Type";
};

export default getFileTypeLabel;
