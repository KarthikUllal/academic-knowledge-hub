
import { useEffect, useMemo, useState } from "react";
import {
    Search,
    FileText,
    Check,
    X,
    Trash2,
    Loader2,
    Eye,
    Download,
    ExternalLink,
    XCircle
} from "lucide-react";
import { toast } from "sonner";

import {
    getAllResources,
    approveResource,
    rejectResource,
    deleteResourceByAdmin,
    getAdminResourcePreview,
    downloadAdminResource
} from "../../services/admin.service";

import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import formatDate from "../../utils/formatDate";

const ManageResources = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);

    const [activeFilter, setActiveFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    // Track the resource currently being processed
    const [actionLoading, setActionLoading] = useState(null);

    // Rejection dialog state
    const [selectedResource, setSelectedResource] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");

    // Preview dialog state
    const [previewResource, setPreviewResource] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);

    const filters = [
        { label: "All", value: "all" },
        { label: "Pending", value: "pending" },
        { label: "Approved", value: "approved" },
        { label: "Rejected", value: "rejected" }
    ];

    // Fetch all resources
    const fetchResources = async () => {
        try {
            setLoading(true);

            const response = await getAllResources();

            setResources(response.data.resources || []);
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to load resources"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResources();
    }, []);

    // Filter resources by status and search term
    const filteredResources = useMemo(() => {
        return resources.filter((resource) => {
            const matchesStatus =
                activeFilter === "all" ||
                resource.status === activeFilter;

            const searchText = searchTerm.toLowerCase();

            const matchesSearch = [
                resource.title,
                resource.subject,
                resource.uploadedBy?.fullName,
                resource.uploadedBy?.email
            ].some((value) =>
                value?.toLowerCase().includes(searchText)
            );

            return matchesStatus && matchesSearch;
        });
    }, [resources, activeFilter, searchTerm]);

    // Get badge color based on status
    const getStatusVariant = (status) => {
        switch (status) {
            case "approved":
                return "success";

            case "rejected":
                return "danger";

            default:
                return "warning";
        }
    };

    // Determine the file format
    const getFileFormat = (fileType, fileUrl = "") => {
        const type = (fileType || "").toLowerCase();
        const url = (fileUrl || "").toLowerCase();

        if (
            type === "application/pdf" ||
            /\.pdf(\?|$)/.test(url)
        ) {
            return "pdf";
        }

        if (
            type.startsWith("image/") ||
            /\.(jpg|jpeg|png|webp)(\?|$)/.test(url)
        ) {
            return "image";
        }

        if (
            type === "application/vnd.ms-powerpoint" ||
            type === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
            /\.pptx?(\?|$)/.test(url)
        ) {
            return "powerpoint";
        }

        return "other";
    };

    // Open resource preview
    const handlePreview = async (resource) => {
        try {
            setPreviewResource({
                resource,
                preview: null
            });

            setPreviewLoading(true);

            const response = await getAdminResourcePreview(resource._id);

            setPreviewResource({
                resource,
                preview: response.data.preview
            });
        } catch (error) {
            console.error("Preview error:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to load resource preview"
            );

            setPreviewResource(null);
        } finally {
            setPreviewLoading(false);
        }
    };

    // Close preview dialog
    const closePreview = () => {
        setPreviewResource(null);
        setPreviewLoading(false);
    };

    // Download resource using backend streaming API
    const handleDownload = async (resource) => {
        try {
            setActionLoading(resource._id);

            const response = await downloadAdminResource(resource._id);

            const blob = new Blob([response.data], {
                type: response.headers["content-type"] ||
                    "application/octet-stream"
            });

            // Get original filename from backend response headers
            const disposition =
                response.headers["content-disposition"] || "";

            const filenameMatch = disposition.match(
                /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i
            );

            let filename = resource.title || "resource";

            if (filenameMatch) {
                const encodedFilename =
                    filenameMatch[1] || filenameMatch[2];

                try {
                    filename = decodeURIComponent(encodedFilename);
                } catch {
                    filename = encodedFilename;
                }
            }

            // Create temporary download link
            const downloadUrl = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = filename;

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(downloadUrl);

        } catch (error) {
            console.error("Download error:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to download resource"
            );
        } finally {
            setActionLoading(null);
        }
    };

    // Approve a resource
    const handleApprove = async (resourceId) => {
        try {
            setActionLoading(resourceId);

            await approveResource(resourceId);

            toast.success("Resource approved successfully");

            await fetchResources();
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to approve resource"
            );
        } finally {
            setActionLoading(null);
        }
    };

    // Open rejection dialog
    const openRejectDialog = (resource) => {
        setSelectedResource(resource);
        setRejectionReason("");
    };

    // Close rejection dialog
    const closeRejectDialog = () => {
        setSelectedResource(null);
        setRejectionReason("");
    };

    // Reject a resource
    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            toast.error("Please enter a rejection reason");
            return;
        }

        try {
            setActionLoading(selectedResource._id);

            await rejectResource(
                selectedResource._id,
                rejectionReason.trim()
            );

            toast.success("Resource rejected successfully");

            closeRejectDialog();

            await fetchResources();
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to reject resource"
            );
        } finally {
            setActionLoading(null);
        }
    };

    // Delete a resource
    const handleDelete = async (resource) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${resource.title}"? This action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            setActionLoading(resource._id);

            await deleteResourceByAdmin(resource._id);

            toast.success("Resource deleted successfully");

            // Close preview if the deleted resource is open
            if (previewResource?.resource?._id === resource._id) {
                closePreview();
            }

            await fetchResources();
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to delete resource"
            );
        } finally {
            setActionLoading(null);
        }
    };

    // Current preview data
    const currentPreview = previewResource?.preview;
    const currentResource = previewResource?.resource;

    const previewFormat = currentPreview
        ? getFileFormat(
            currentPreview.fileType,
            currentPreview.fileUrl
        )
        : "other";

    // Microsoft Office Online Viewer URL
    const officeViewerUrl = currentPreview?.fileUrl
        ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
            currentPreview.fileUrl
        )}`
        : "";

    // URL used by the Open File button
    const openFileUrl = currentPreview?.fileUrl
        ? previewFormat === "powerpoint"
            ? `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(
                currentPreview.fileUrl
            )}`
            : currentPreview.fileUrl
        : "";

    return (
        <div className="space-y-6">

            {/* Page heading */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">
                    Manage Resources
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    View and manage resources uploaded by students.
                </p>
            </div>

            {/* Filters and search */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                {/* Status filters */}
                <div className="flex flex-wrap gap-2">
                    {filters.map((filter) => (
                        <button
                            key={filter.value}
                            type="button"
                            onClick={() => setActiveFilter(filter.value)}
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                                activeFilter === filter.value
                                    ? "bg-indigo-600 text-white"
                                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-full sm:max-w-xs">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(event.target.value)
                        }
                        placeholder="Search resources..."
                        className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                </div>
            </div>

            {/* Resources table */}
            <Card
                padding="none"
                className="overflow-hidden border border-slate-200"
            >

                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2
                            size={26}
                            className="animate-spin text-indigo-600"
                        />
                    </div>
                ) : filteredResources.length === 0 ? (
                    <div className="py-16 text-center">
                        <FileText
                            size={36}
                            className="mx-auto mb-3 text-slate-300"
                        />

                        <h3 className="font-medium text-slate-800">
                            No resources found
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Try changing your search or status filter.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1150px] text-left">

                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Resource
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Uploaded By
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Category
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Date
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Status
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {filteredResources.map((resource) => {
                                    const isProcessing =
                                        actionLoading === resource._id;

                                    return (
                                        <tr
                                            key={resource._id}
                                            className="hover:bg-slate-50"
                                        >
                                            {/* Resource information */}
                                            <td className="px-5 py-4">
                                                <p className="max-w-xs truncate text-sm font-medium text-slate-800">
                                                    {resource.title}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-500">
                                                    {resource.subject || "No subject"}
                                                </p>
                                            </td>

                                            {/* Uploader */}
                                            <td className="px-5 py-4">
                                                <p className="text-sm text-slate-700">
                                                    {resource.uploadedBy?.fullName || "Unknown"}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-500">
                                                    {resource.uploadedBy?.email || ""}
                                                </p>
                                            </td>

                                            {/* Category */}
                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {resource.category}
                                            </td>

                                            {/* Upload date */}
                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {formatDate(resource.createdAt)}
                                            </td>

                                            {/* Status */}
                                            <td className="px-5 py-4">
                                                <Badge
                                                    variant={getStatusVariant(resource.status)}
                                                >
                                                    {resource.status}
                                                </Badge>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">

                                                    {/* Preview */}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={isProcessing}
                                                        onClick={() => handlePreview(resource)}
                                                    >
                                                        <Eye size={15} />
                                                        View
                                                    </Button>

                                                    {/* Approve and reject */}
                                                    {resource.status === "pending" && (
                                                        <>
                                                            <Button
                                                                variant="primary"
                                                                size="sm"
                                                                disabled={isProcessing}
                                                                onClick={() => handleApprove(resource._id)}
                                                            >
                                                                {isProcessing ? (
                                                                    <Loader2
                                                                        size={15}
                                                                        className="animate-spin"
                                                                    />
                                                                ) : (
                                                                    <Check size={15} />
                                                                )}
                                                                Approve
                                                            </Button>

                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                disabled={isProcessing}
                                                                onClick={() => openRejectDialog(resource)}
                                                            >
                                                                <X size={15} />
                                                                Reject
                                                            </Button>
                                                        </>
                                                    )}

                                                    {/* Delete */}
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        disabled={isProcessing}
                                                        onClick={() => handleDelete(resource)}
                                                    >
                                                        <Trash2 size={15} />
                                                        Delete
                                                    </Button>

                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>

                        </table>
                    </div>
                )}

            </Card>

            {/* Results count */}
            {!loading && (
                <p className="text-sm text-slate-500">
                    Showing {filteredResources.length} of {resources.length} resources
                </p>
            )}

            {/* Resource preview dialog */}
            {previewResource && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">

                    <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">

                        {/* Preview header */}
                        <div className="flex items-center justify-between gap-4 border-b border-slate-200 p-4 sm:px-6">
                            <div className="min-w-0">
                                <h2 className="truncate text-lg font-semibold text-slate-900">
                                    {currentResource.title}
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Uploaded by{" "}
                                    {currentResource.uploadedBy?.fullName || "Unknown"}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closePreview}
                                className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                                aria-label="Close preview"
                            >
                                <XCircle size={23} />
                            </button>
                        </div>

                        {/* Resource information */}
                        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-6">

                            <Badge variant="info">
                                {currentResource.category}
                            </Badge>

                            <Badge variant={getStatusVariant(currentResource.status)}>
                                {currentResource.status}
                            </Badge>

                            {currentResource.subject && (
                                <span className="text-xs text-slate-500">
                                    Subject: {currentResource.subject}
                                </span>
                            )}

                            {currentResource.course && (
                                <span className="text-xs text-slate-500">
                                    Course: {currentResource.course}
                                </span>
                            )}
                        </div>

                        {/* Preview content */}
                        <div className="min-h-[300px] flex-1 overflow-y-auto bg-slate-100">

                            {previewLoading ? (
                                <div className="flex min-h-[400px] flex-col items-center justify-center">
                                    <Loader2
                                        size={32}
                                        className="animate-spin text-indigo-600"
                                    />

                                    <p className="mt-3 text-sm text-slate-500">
                                        Loading resource preview...
                                    </p>
                                </div>
                            ) : currentPreview?.fileUrl ? (
                                <>
                                    {/* PDF preview */}
                                    {previewFormat === "pdf" && (
                                        <iframe
                                            src={currentPreview.fileUrl}
                                            title={currentResource.title}
                                            className="h-[65vh] min-h-[400px] w-full bg-white"
                                        />
                                    )}

                                    {/* Image preview */}
                                    {previewFormat === "image" && (
                                        <div className="flex min-h-[400px] items-center justify-center p-4">
                                            <img
                                                src={currentPreview.fileUrl}
                                                alt={currentResource.title}
                                                className="max-h-[65vh] max-w-full rounded-lg object-contain"
                                            />
                                        </div>
                                    )}

                                    {/* PowerPoint preview */}
                                    {previewFormat === "powerpoint" && (
                                        <iframe
                                            src={officeViewerUrl}
                                            title={currentResource.title}
                                            className="h-[65vh] min-h-[400px] w-full bg-white"
                                            allowFullScreen
                                        />
                                    )}

                                    {/* Unsupported format */}
                                    {previewFormat === "other" && (
                                        <div className="flex min-h-[400px] flex-col items-center justify-center p-6 text-center">

                                            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                                <FileText size={34} />
                                            </div>

                                            <h3 className="mt-4 font-semibold text-slate-800">
                                                Preview not available
                                            </h3>

                                            <p className="mt-2 max-w-md text-sm text-slate-500">
                                                This file format cannot be previewed directly in the browser.
                                                Download the resource to open it.
                                            </p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex min-h-[400px] flex-col items-center justify-center p-6 text-center">
                                    <FileText
                                        size={36}
                                        className="text-slate-300"
                                    />

                                    <h3 className="mt-3 font-semibold text-slate-800">
                                        Unable to load preview
                                    </h3>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Please close this window and try again.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Preview footer */}
                        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

                            <Button
                                variant="outline"
                                onClick={closePreview}
                            >
                                Close
                            </Button>

                            <div className="flex flex-col gap-2 sm:flex-row">

                                {currentPreview?.fileUrl && (
                                    <a
                                        href={openFileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                    >
                                        <ExternalLink size={16} />
                                        Open File
                                    </a>
                                )}

                                <Button
                                    variant="primary"
                                    onClick={() => handleDownload(currentResource)}
                                    disabled={actionLoading === currentResource._id}
                                >
                                    {actionLoading === currentResource._id ? (
                                        <Loader2
                                            size={16}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <Download size={16} />
                                    )}

                                    {actionLoading === currentResource._id
                                        ? "Downloading..."
                                        : "Download"}
                                </Button>

                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* Rejection dialog */}
            {selectedResource && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">

                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">

                        <div className="mb-4">
                            <h2 className="text-lg font-semibold text-slate-900">
                                Reject Resource
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Provide a reason for rejecting this resource.
                            </p>
                        </div>

                        <div className="mb-5">
                            <p className="mb-2 text-sm font-medium text-slate-700">
                                Resource
                            </p>

                            <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                                {selectedResource.title}
                            </p>
                        </div>

                        <div className="mb-5">
                            <label
                                htmlFor="rejectionReason"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Rejection Reason
                            </label>

                            <textarea
                                id="rejectionReason"
                                rows={4}
                                value={rejectionReason}
                                onChange={(event) =>
                                    setRejectionReason(event.target.value)
                                }
                                placeholder="Explain why this resource is being rejected..."
                                className="w-full resize-none rounded-lg border border-slate-200 p-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                size="md"
                                onClick={closeRejectDialog}
                                disabled={actionLoading !== null}
                            >
                                Cancel
                            </Button>

                            <Button
                                variant="danger"
                                size="md"
                                onClick={handleReject}
                                disabled={
                                    !rejectionReason.trim() ||
                                    actionLoading !== null
                                }
                            >
                                {actionLoading === selectedResource._id ? (
                                    <Loader2
                                        size={16}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <X size={16} />
                                )}
                                Reject Resource
                            </Button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default ManageResources;
