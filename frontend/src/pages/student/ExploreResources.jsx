
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
    BookOpen,
    SlidersHorizontal,
    FileText,
    Filter,
    RefreshCw,
} from "lucide-react";

import { getResources } from "../../services/resource.service";

import SearchBar from "../../components/common/SearchBar";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import Pagination from "../../components/common/Pagination";
import EmptyState from "../../components/common/EmptyState";
import Loader from "../../components/common/Loader";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";

const ExploreResources = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // Search and filter states
    const [search, setSearch] = useState(
        searchParams.get("search") || ""
    );

    const [appliedSearch, setAppliedSearch] = useState(
        searchParams.get("search") || ""
    );

    const [college, setCollege] = useState("");
    const [course, setCourse] = useState("");
    const [semester, setSemester] = useState("");
    const [category, setCategory] = useState("");

    // Resource states
    const [resources, setResources] = useState([]);
    const [collegeOptions, setCollegeOptions] = useState([]);
    const [courseOptions, setCourseOptions] = useState([]);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalResources, setTotalResources] = useState(0);

    // Loading, error and retry states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [retryCount, setRetryCount] = useState(0);

    const limit = 8;

    // Category options
    const categoryOptions = [
        { label: "Notes", value: "Notes" },
        { label: "Question Paper", value: "Question Paper" },
        { label: "Assignment", value: "Assignment" },
        { label: "Book", value: "Book" },
        { label: "Presentation", value: "Presentation" },
        { label: "Research Paper", value: "Research Paper" },
        { label: "Other", value: "Other" },
    ];

    // Semester options
    const semesterOptions = [1, 2, 3, 4, 5, 6, 7, 8].map(
        (number) => ({
            label: `Semester ${number}`,
            value: number.toString(),
        })
    );

    // Load college and course filter options
    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                const response = await getResources({
                    page: 1,
                    limit: 50,
                });

                const availableResources = response.data.resources || [];

                const colleges = [
                    ...new Set(
                        availableResources
                            .map((resource) => resource.college)
                            .filter(Boolean)
                    ),
                ];

                const courses = [
                    ...new Set(
                        availableResources
                            .map((resource) => resource.course)
                            .filter(Boolean)
                    ),
                ];

                setCollegeOptions(
                    colleges.sort().map((name) => ({
                        label: name,
                        value: name,
                    }))
                );

                setCourseOptions(
                    courses.sort().map((name) => ({
                        label: name,
                        value: name,
                    }))
                );
            } catch (error) {
                console.error("Failed to load filter options:", error);
            }
        };

        fetchFilterOptions();
    }, []);

    // Fetch resources whenever search, filters or page changes
    useEffect(() => {
        const fetchResources = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await getResources({
                    search: appliedSearch,
                    college,
                    course,
                    semester,
                    category,
                    page: currentPage,
                    limit,
                });

                const data = response.data;

                setResources(data.resources || []);
                setCurrentPage(data.currentPage);
                setTotalPages(data.totalPages);
                setTotalResources(data.totalResources);
            } catch (error) {
                console.error("Failed to fetch resources:", error);

                setError(
                    error.response?.data?.message ||
                    "Unable to load resources. Please try again."
                );

                setResources([]);
            } finally {
                setLoading(false);
            }
        };

        fetchResources();
    }, [
        appliedSearch,
        college,
        course,
        semester,
        category,
        currentPage,
        retryCount,
    ]);

    // Handle search submission
    const handleSearch = () => {
        setCurrentPage(1);
        setAppliedSearch(search.trim());

        if (search.trim()) {
            setSearchParams({ search: search.trim() });
        } else {
            setSearchParams({});
        }
    };

    // Clear search and all filters
    const handleResetFilters = () => {
        setSearch("");
        setAppliedSearch("");
        setCollege("");
        setCourse("");
        setSemester("");
        setCategory("");
        setCurrentPage(1);
        setSearchParams({});
    };

    // Handle filter changes
    const handleFilterChange = (setter, value) => {
        setter(value);
        setCurrentPage(1);
    };

    // Retry fetching resources
    const handleRetry = () => {
        setRetryCount((previous) => previous + 1);
    };

    return (
        <div className="space-y-6">

            {/* Page heading */}
            <section>
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    <BookOpen size={18} />
                    Academic Resources
                </div>

                <h1 className="mt-2 text-2xl font-bold text-text-primary sm:text-3xl">
                    Explore Resources
                </h1>

                <p className="mt-2 text-sm text-text-secondary sm:text-base">
                    Discover notes, question papers, assignments, research
                    papers and other academic materials shared by students.
                </p>
            </section>

            {/* Search */}
            <Card>
                <h2 className="mb-3 font-semibold text-text-primary">
                    Search Academic Resources
                </h2>

                <SearchBar
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onSubmit={handleSearch}
                    placeholder="Search by title, subject or keywords..."
                />
            </Card>

            {/* Filters */}
            <Card>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal size={19} className="text-primary" />

                        <h2 className="font-semibold text-text-primary">
                            Filter Resources
                        </h2>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleResetFilters}
                    >
                        <RefreshCw size={14} />
                        Clear filters
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    <Select
                        label="College"
                        name="college"
                        value={college}
                        onChange={(e) =>
                            handleFilterChange(setCollege, e.target.value)
                        }
                        options={collegeOptions}
                        placeholder="All Colleges"
                    />

                    <Select
                        label="Course"
                        name="course"
                        value={course}
                        onChange={(e) =>
                            handleFilterChange(setCourse, e.target.value)
                        }
                        options={courseOptions}
                        placeholder="All Courses"
                    />

                    <Select
                        label="Semester"
                        name="semester"
                        value={semester}
                        onChange={(e) =>
                            handleFilterChange(setSemester, e.target.value)
                        }
                        options={semesterOptions}
                        placeholder="All Semesters"
                    />

                    <Select
                        label="Category"
                        name="category"
                        value={category}
                        onChange={(e) =>
                            handleFilterChange(setCategory, e.target.value)
                        }
                        options={categoryOptions}
                        placeholder="All Categories"
                    />

                </div>
            </Card>

            {/* Resource listing */}
            <section>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-semibold text-text-primary">
                            Available Resources
                        </h2>

                        <p className="mt-1 text-sm text-text-secondary">
                            {totalResources} resources found
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <Filter size={16} />
                        Latest first
                    </div>
                </div>

                {/* Loading state */}
                {loading && (
                    <Card className="flex justify-center py-12">
                        <Loader />
                    </Card>
                )}

                {/* Error state */}
                {!loading && error && (
                    <Card className="p-8 text-center">
                        <p className="text-sm text-error">{error}</p>

                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={handleRetry}
                        >
                            Try again
                        </Button>
                    </Card>
                )}

                {/* Empty state */}
                {!loading && !error && resources.length === 0 && (
                    <Card>
                        <EmptyState
                            icon={FileText}
                            title="No resources found"
                            description="Try changing your search or filters to find academic resources."
                            action={
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleResetFilters}
                                >
                                    Clear filters
                                </Button>
                            }
                        />
                    </Card>
                )}

                {/* Resource cards */}
                {!loading && !error && resources.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                            {resources.map((resource) => (
                                <Link
                                    to={`/student/resources/${resource._id}`}
                                    key={resource._id}
                                    className="block"
                                >
                                    <Card className="h-full transition hover:border-primary hover:shadow-sm">

                                        <div className="flex items-start gap-3">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-50 text-error">
                                                <FileText size={22} />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-semibold text-text-primary">
                                                    {resource.title}
                                                </h3>

                                                <p className="mt-1 text-sm text-text-secondary">
                                                    {resource.subject}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            <Badge variant="primary">
                                                {resource.category}
                                            </Badge>

                                            <Badge variant="default">
                                                {resource.course}
                                            </Badge>

                                            <Badge variant="default">
                                                Semester {resource.semester}
                                            </Badge>
                                        </div>

                                        <div className="mt-4 border-t border-border pt-3">
                                            <p className="truncate text-xs text-text-secondary">
                                                {resource.college}
                                            </p>
                                        </div>

                                    </Card>
                                </Link>
                            ))}

                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-6">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        )}
                    </>
                )}
            </section>

        </div>
    );
};

export default ExploreResources;
