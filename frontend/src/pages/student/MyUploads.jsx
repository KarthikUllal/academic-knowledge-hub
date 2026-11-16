
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { UploadCloud, RefreshCw, FileText } from "lucide-react";
import { toast } from "sonner";

import { getMyUploads } from "../../services/user.service";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";

import UploadSummary from "../../components/student/uploads/UploadSummary";
import UploadFilters from "../../components/student/uploads/UploadFilters";
import UploadResourceCard from "../../components/student/uploads/UploadResourceCard";

const MyUploads = () => {

    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");

    // Fetch resources uploaded by the logged-in user
    const fetchMyUploads = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getMyUploads();

            setResources(response.data.resources || []);

        } catch (error) {
            console.error("Fetch my uploads error:", error);

            setError(
                error.response?.data?.message ||
                "Failed to fetch your uploaded resources."
            );

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyUploads();
    }, []);

    // Get unique categories from uploaded resources
    const categories = useMemo(() => {
        return [
            ...new Set(
                resources.map((resource) => resource.category)
            )
        ].filter(Boolean);
    }, [resources]);

    // Apply search, status and category filters
    const filteredResources = useMemo(() => {

        return resources.filter((resource) => {

            const searchText = search.toLowerCase();

            const matchesSearch =
                resource.title?.toLowerCase().includes(searchText) ||
                resource.subject?.toLowerCase().includes(searchText);

            const matchesStatus =
                statusFilter === "all" ||
                resource.status === statusFilter;

            const matchesCategory =
                categoryFilter === "all" ||
                resource.category === categoryFilter;

            return matchesSearch && matchesStatus && matchesCategory;
        });

    }, [resources, search, statusFilter, categoryFilter]);

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">

            {/* Page heading */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        My Uploads
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Track and manage the academic resources you have uploaded.
                    </p>
                </div>

                <Link to="/student/upload">
                    <Button>
                        <span className="flex items-center gap-2">
                            <UploadCloud size={17} />
                            Upload Resource
                        </span>
                    </Button>
                </Link>

            </div>

            {/* Upload summary */}
            <UploadSummary resources={resources} />

            {/* Resource list section */}
            <Card padding="lg">

                <div className="mb-5">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Uploaded Resources
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        {filteredResources.length} resources found
                    </p>
                </div>

                {/* Filters */}
                <UploadFilters
                    search={search}
                    setSearch={setSearch}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    categoryFilter={categoryFilter}
                    setCategoryFilter={setCategoryFilter}
                    categories={categories}
                />

                {/* Error state */}
                {error && (
                    <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">

                        <p className="text-sm text-red-700">
                            {error}
                        </p>

                        <button
                            onClick={fetchMyUploads}
                            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-red-700 hover:text-red-800"
                        >
                            <RefreshCw size={15} />
                            Try Again
                        </button>

                    </div>
                )}

                {/* Empty state */}
                {!error && filteredResources.length === 0 && (
                    <div className="py-12 text-center">

                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                            <FileText size={25} className="text-slate-400" />
                        </div>

                        <h3 className="mt-4 font-semibold text-slate-900">
                            {resources.length === 0
                                ? "No uploads yet"
                                : "No matching resources"}
                        </h3>

                        <p className="mt-2 text-sm text-slate-500">
                            {resources.length === 0
                                ? "Your uploaded resources will appear here."
                                : "Try changing your search or filters."}
                        </p>

                        {resources.length === 0 && (
                            <Link to="/student/upload" className="mt-5 inline-block">
                                <Button>
                                    Upload Your First Resource
                                </Button>
                            </Link>
                        )}

                    </div>
                )}

                {/* Resource cards */}
                {!error && filteredResources.length > 0 && (
                    <div className="mt-5 space-y-4">

                        {filteredResources.map((resource) => (
                            <UploadResourceCard
                                key={resource._id}
                                resource={resource}
                            />
                        ))}

                    </div>
                )}

            </Card>

        </div>
    );
};

export default MyUploads;
