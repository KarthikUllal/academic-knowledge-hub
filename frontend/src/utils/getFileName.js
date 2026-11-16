
const getFileName = (title, fileType) => {
  const extensions = {
    "application/pdf": "pdf",

    // Word
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",

    // PowerPoint
    "application/vnd.ms-powerpoint": "ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",

    // Excel
    "application/vnd.ms-excel": "xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",

    // Text
    "text/plain": "txt",
    "text/csv": "csv",

    // Images
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };

  const extension = extensions[fileType] || "file";

  return `${title}.${extension}`;
};

export default getFileName;
