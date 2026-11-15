const getFileName = (title, fileType) => {
  const extensions = {
    "application/pdf": "pdf",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "text/plain": "txt",
  };

  const extension = extensions[fileType] || "file";

  return `${title}.${extension}`;
};

export default getFileName;