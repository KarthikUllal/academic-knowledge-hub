
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UploadCloud,
  FileText,
  X,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import Select from "../../components/common/Select";

import { uploadResource } from "../../services/resource.service";

// Available resource categories
const categories = [
  "Notes",
  "Question Papers",
  "Assignments",
  "Books",
  "Presentations",
  "Research Papers",
  "Other",
];

// Allowed file MIME types
const allowedMimeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
  "image/jpeg",
  "image/png",
  "image/webp",
];

// Maximum file size: 9 MB
const MAX_FILE_SIZE = 9 * 1024 * 1024;

// Initial form values
const initialFormData = {
  title: "",
  description: "",
  subject: "",
  course: "",
  semester: "",
  college: "",
  category: "",
};

const UploadResource = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState(initialFormData);
  const [selectedFile, setSelectedFile] = useState(null);

  const [errors, setErrors] = useState({});
  const [fileError, setFileError] = useState("");

  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Handle changes in form fields
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    // Clear the error for the edited field
    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  // Validate and select a file
  const handleFileChange = (file) => {
    if (!file) return;

    setFileError("");

    // Check file format
    if (!allowedMimeTypes.includes(file.type)) {
      setSelectedFile(null);
      setFileError("Unsupported file format.");

      toast.error("Please select a supported file format.");
      return;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      setFileError("File size must not exceed 9 MB.");

      toast.error("File size must not exceed 9 MB.");
      return;
    }

    setSelectedFile(file);
  };

  // Handle file selection through the browse button
  const handleInputChange = (e) => {
    const file = e.target.files?.[0];

    handleFileChange(file);

    // Reset input so the same file can be selected again
    e.target.value = "";
  };

  // Remove the selected file
  const removeFile = () => {
    setSelectedFile(null);
    setFileError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle drag over the upload area
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // Handle leaving the upload area
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Handle dropping a file
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];

    handleFileChange(file);
  };

  // Validate all form fields
  const validateForm = () => {
    const newErrors = {};

    Object.entries(formData).forEach(([field, value]) => {
      if (!String(value).trim()) {
        newErrors[field] = "This field is required.";
      }
    });

    // Semester must be a valid positive integer
    if (
      formData.semester &&
      (!Number.isInteger(Number(formData.semester)) ||
        Number(formData.semester) < 1)
    ) {
      newErrors.semester = "Enter a valid semester number.";
    }

    // Check whether a file is selected
    if (!selectedFile) {
      setFileError("Please select a file to upload.");
    } else {
      setFileError("");
    }

    setErrors(newErrors);

    const hasFieldErrors = Object.keys(newErrors).length > 0;
    const hasFileError = !selectedFile;

    if (hasFieldErrors || hasFileError) {
      toast.error("Please complete all required fields.");
      return false;
    }

    return true;
  };

  // Submit the resource
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setUploading(true);

      // Create FormData for sending text fields and the file
      const data = new FormData();

      data.append("title", formData.title.trim());
      data.append("description", formData.description.trim());
      data.append("subject", formData.subject.trim());
      data.append("course", formData.course.trim());
      data.append("semester", Number(formData.semester));
      data.append("college", formData.college.trim());
      data.append("category", formData.category);
      data.append("file", selectedFile);

      // Call the existing backend upload API
      const response = await uploadResource(data);

      // Show success notification
      toast.success(
        response.data.message || "Resource uploaded successfully."
      );

      // Reset the form after successful upload
      setFormData(initialFormData);
      setSelectedFile(null);
      setErrors({});
      setFileError("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Resource upload error:", error);

      // Show backend error message
      toast.error(
        error.response?.data?.message ||
          "Failed to upload resource. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  // Format file size for display
  const formatFileSize = (size) => {
    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-10">

      {/* Page heading */}
      <div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
        >
          <ArrowLeft size={17} />
          Go back
        </button>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Upload Resource
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Share your academic materials and help other students learn.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Basic information */}
        <Card padding="lg">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Basic Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Provide the basic details about your resource.
            </p>
          </div>

          <div className="space-y-5">
            <Input
              label="Resource Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter resource title"
              error={errors.title}
            />

            <Textarea
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what this resource contains..."
              rows={4}
              error={errors.description}
            />
          </div>
        </Card>

        {/* Academic information */}
        <Card padding="lg">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Academic Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add academic details to help students find your resource.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

            <Input
              label="Course"
              name="course"
              value={formData.course}
              onChange={handleChange}
              placeholder="e.g. B.Tech Computer Science"
              error={errors.course}
            />

            <Input
              label="Semester"
              name="semester"
              inputType="number"
              value={formData.semester}
              onChange={handleChange}
              placeholder="e.g. 4"
              error={errors.semester}
            />

            <Input
              label="Subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="e.g. Data Structures"
              error={errors.subject}
            />

            <Select
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              options={categories.map((category) => ({
                label: category,
                value: category,
              }))}
              placeholder="Select category"
              error={errors.category}
            />

            <div className="sm:col-span-2">
              <Input
                label="College"
                name="college"
                value={formData.college}
                onChange={handleChange}
                placeholder="Enter your college name"
                error={errors.college}
              />
            </div>

          </div>
        </Card>

        {/* File upload */}
        <Card padding="lg">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Upload File
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Attach the academic resource you want to share.
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.jpg,.jpeg,.png,.webp"
            onChange={handleInputChange}
            className="hidden"
          />

          {!selectedFile ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-5 py-10 text-center transition ${
                isDragging
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/50"
              }`}
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
                <UploadCloud size={28} className="text-indigo-600" />
              </div>

              <p className="font-semibold text-slate-800">
                Drag and drop your file here
              </p>

              <p className="mt-2 text-sm text-slate-500">
                or{" "}
                <span className="font-semibold text-indigo-600">
                  browse files
                </span>{" "}
                from your device
              </p>

              <p className="mt-4 text-xs text-slate-500">
                PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, CSV, JPG, PNG, WEBP
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Maximum file size: 9 MB
              </p>
            </button>
          ) : (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white">
                  <FileText size={23} className="text-indigo-600" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {selectedFile.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={removeFile}
                className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                aria-label="Remove selected file"
              >
                <X size={19} />
              </button>
            </div>
          )}

          {fileError && (
            <p className="mt-3 flex items-center gap-2 text-sm text-red-600">
              <AlertCircle size={16} />
              {fileError}
            </p>
          )}
        </Card>

        {/* Admin approval information */}
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertCircle
            size={21}
            className="mt-0.5 shrink-0 text-amber-600"
          />

          <div>
            <p className="font-semibold text-amber-800">
              Admin Approval Required
            </p>

            <p className="mt-1 text-sm leading-relaxed text-amber-700">
              Your uploaded resource will initially have pending status.
              It will become visible to other students only after an admin
              reviews and approves it.
            </p>
          </div>
        </div>

        {/* Form actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Submit Resource"}
          </Button>
        </div>

      </form>
    </div>
  );
};

export default UploadResource;
