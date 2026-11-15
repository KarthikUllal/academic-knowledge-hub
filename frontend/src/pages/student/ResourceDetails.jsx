
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
    ArrowLeft,
    FileText,
    Download,
    Eye,
    BookOpen,
    Calendar,
    GraduationCap,
    Building2,
    User,
    RefreshCw,
    Image,
} from "lucide-react";

import {
    getResourceById,
    previewResource,
    downloadResource,
} from "../../services/resource.service";

import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import getFileName from "../../utils/getFileName";

const ResourceDetails = () => {
    const { id } = useParams();

    const [resource, setResource] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [previewUrl, setPreviewUrl] = useState("");
    const [previewType, setPreviewType] = useState("");
    const [previewLoading, setPreviewLoading] = useState(false);

    const [downloading, setDownloading] = useState(false);

    const [retryCount, setRetryCount] = useState(0);

    // Fetch resource details
    useEffect(() => {
        const fetchResource = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await getResourceById(id);

                setResource(response.data.resource);
            } catch (error) {
                console.error("Failed to fetch resource:", error);

                setError(
                    error.response?.data?.message ||
                    "Unable to load resource details."
                );

                setResource(null);
            } finally {
                setLoading(false);
            }
        };

        fetchResource();
    }, [id, retryCount]);

    // Supported preview formats
    const supportedPreviewTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/webp",
    ];

    // Check whether the resource supports preview
    const canPreview = supportedPreviewTypes.includes(
        resource?.fileType
    );

    // Check whether the resource is an image
    const isImage = [
        "image/jpeg",
        "image/png",
        "image/webp",
    ].includes(resource?.fileType);

    // Load resource preview
    const handlePreview = async () => {
        try {
            setPreviewLoading(true);

            const response = await previewResource(id);

            const preview = response.data.preview;

            if (!preview.fileUrl) {
                throw new Error("Preview URL not found");
            }

            setPreviewUrl(preview.fileUrl);
            setPreviewType(preview.fileType);

            // Scroll to the document preview section
            setTimeout(() => {
                document.getElementById("document-preview")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }, 100);

        } catch (error) {
            console.error("Preview error:", error);

            alert(
                error.response?.data?.message ||
                "Unable to load resource preview."
            );
        } finally {
            setPreviewLoading(false);
        }
    };

    // Download resource

    const handleDownload = async () => {
        try {
            setDownloading(true);

            // Get the download URL from the backend
            const response = await downloadResource(id);

            const downloadData = response.data.download;
            const fileUrl = downloadData?.fileUrl;

            if (!fileUrl) {
                throw new Error("Download URL not found");
            }

            // Update the download count
            setResource((previous) => ({
                ...previous,
                downloads: downloadData.downloads,
            }));

            // Create a temporary download link
            const link = document.createElement("a");

            link.href = fileUrl;
            link.download = getFileName(resource.title, resource.fileType);

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error("Download error:", error);

            alert(
                error.response?.data?.message ||
                "Unable to download the resource. Please try again."
            );
        } finally {
            setDownloading(false);
        }
    };


    // Loading state
    if (loading) {
        return (
            <div className="flex min-h-80 items-center justify-center">
                <Loader />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="space-y-5">
                <Link
                    to="/student/resources"
                    className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition hover:text-primary"
                >
                    <ArrowLeft size={18} />
                    Back to Resources
                </Link>

                <Card className="text-center" padding="lg">
                    <p className="text-sm text-error">
                        {error}
                    </p>

                    <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() =>
                            setRetryCount((previous) => previous + 1)
                        }
                    >
                        <RefreshCw size={15} />
                        Try Again
                    </Button>
                </Card>
            </div>
        );
    }

    // Resource not found
    if (!resource) {
        return (
            <EmptyState
                icon={FileText}
                title="Resource not found"
                description="The resource you're looking for may have been removed or is unavailable."
                action={
                    <Link to="/student/resources">
                        <Button variant="outline">
                            Back to Resources
                        </Button>
                    </Link>
                }
            />
        );
    }

    return (
        <div className="space-y-6">

            {/* Back navigation */}
            <Link
                to="/student/resources"
                className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition hover:text-primary"
            >
                <ArrowLeft size={18} />
                Back to Resources
            </Link>

            {/* Resource information */}
            <Card>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                    {/* Resource heading */}
                    <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                            <FileText size={25} />
                        </div>

                        <div className="min-w-0">
                            <div className="mb-2">
                                <Badge variant="primary">
                                    {resource.category}
                                </Badge>
                            </div>

                            <h1 className="text-xl font-bold text-text-primary sm:text-2xl">
                                {resource.title}
                            </h1>

                            <p className="mt-2 text-sm text-text-secondary">
                                {resource.subject}
                            </p>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-3">

                        <Button
                            variant="outline"
                            onClick={handlePreview}
                            disabled={previewLoading || !canPreview}
                        >
                            <Eye size={17} />
                            {previewLoading
                                ? "Loading Preview..."
                                : "Preview"}
                        </Button>

                        <Button
                            onClick={handleDownload}
                            disabled={downloading}
                        >
                            <Download size={17} />
                            {downloading
                                ? "Downloading..."
                                : "Download"}
                        </Button>

                    </div>
                </div>

                {/* Resource metadata */}
                <div className="mt-6 grid grid-cols-1 gap-4 border-t border-border pt-5 sm:grid-cols-2 lg:grid-cols-4">

                    <div className="flex items-start gap-3">
                        <GraduationCap
                            size={19}
                            className="mt-0.5 shrink-0 text-primary"
                        />

                        <div>
                            <p className="text-xs text-text-secondary">
                                Course
                            </p>

                            <p className="mt-1 text-sm font-medium text-text-primary">
                                {resource.course || "Not specified"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <BookOpen
                            size={19}
                            className="mt-0.5 shrink-0 text-primary"
                        />

                        <div>
                            <p className="text-xs text-text-secondary">
                                Semester
                            </p>

                            <p className="mt-1 text-sm font-medium text-text-primary">
                                {resource.semester
                                    ? `Semester ${resource.semester}`
                                    : "Not specified"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Building2
                            size={19}
                            className="mt-0.5 shrink-0 text-primary"
                        />

                        <div>
                            <p className="text-xs text-text-secondary">
                                College
                            </p>

                            <p className="mt-1 text-sm font-medium text-text-primary">
                                {resource.college || "Not specified"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <User
                            size={19}
                            className="mt-0.5 shrink-0 text-primary"
                        />

                        <div>
                            <p className="text-xs text-text-secondary">
                                Uploaded By
                            </p>

                            <p className="mt-1 text-sm font-medium text-text-primary">
                                {resource.uploadedBy?.fullName || "Unknown"}
                            </p>
                        </div>
                    </div>

                </div>
            </Card>

            {/* Resource description */}
            <Card>
                <h2 className="text-lg font-semibold text-text-primary">
                    About This Resource
                </h2>

                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-text-secondary">
                    {resource.description || "No description provided."}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-text-secondary">

                    {resource.createdAt && (
                        <div className="flex items-center gap-2">
                            <Calendar size={17} />

                            <span>
                                Uploaded on{" "}
                                {new Date(
                                    resource.createdAt
                                ).toLocaleDateString()}
                            </span>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <Download size={17} />

                        <span>
                            {resource.downloads || 0} downloads
                        </span>
                    </div>

                </div>
            </Card>

            {/* Resource preview */}
            <div id="document-preview" className="scroll-mt-6">

                <Card padding="none" className="overflow-hidden">

                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4 sm:px-6">
                        <div>
                            <h2 className="font-semibold text-text-primary">
                                Document Preview
                            </h2>

                            <p className="mt-1 text-xs text-text-secondary">
                                View the resource before downloading.
                            </p>
                        </div>

                        <Badge variant="info">
                            {resource.fileType}
                        </Badge>
                    </div>

                    {/* PDF preview */}
                    {previewUrl &&
                        previewType === "application/pdf" && (
                            <iframe
                                src={previewUrl}
                                title={resource.title}
                                className="h-[500px] w-full bg-background sm:h-[650px]"
                            />
                        )}

                    {/* Image preview */}
                    {previewUrl && isImage && (
                        <div className="flex justify-center bg-background p-4 sm:p-6">
                            <img
                                src={previewUrl}
                                alt={resource.title}
                                className="max-h-[650px] w-full object-contain"
                            />
                        </div>
                    )}

                    {/* Unsupported format */}
                    {!canPreview && (
                        <div className="flex min-h-80 flex-col items-center justify-center bg-background p-6 text-center">

                            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary-soft text-primary">
                                <FileText size={34} />
                            </div>

                            <h3 className="mt-4 font-semibold text-text-primary">
                                Preview not available
                            </h3>

                            <p className="mt-2 max-w-sm text-sm text-text-secondary">
                                This file format cannot be previewed here.
                                Please download the resource to view it.
                            </p>

                            <Button
                                className="mt-4"
                                onClick={handleDownload}
                                disabled={downloading}
                            >
                                <Download size={17} />
                                {downloading
                                    ? "Downloading..."
                                    : "Download Resource"}
                            </Button>

                        </div>
                    )}

                    {/* Supported format, but preview not loaded */}
                    {canPreview && !previewUrl && (
                        <div className="flex min-h-80 flex-col items-center justify-center bg-background p-6 text-center">

                            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary-soft text-primary">
                                {isImage ? (
                                    <Image size={34} />
                                ) : (
                                    <FileText size={34} />
                                )}
                            </div>

                            <h3 className="mt-4 font-semibold text-text-primary">
                                Click Preview to view this resource
                            </h3>

                            <p className="mt-2 max-w-sm text-sm text-text-secondary">
                                Load the document to view it here.
                            </p>

                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={handlePreview}
                                disabled={previewLoading}
                            >
                                <Eye size={17} />
                                {previewLoading
                                    ? "Loading Preview..."
                                    : "Preview"}
                            </Button>

                        </div>
                    )}

                </Card>

            </div>

        </div>
    );
};

export default ResourceDetails;
