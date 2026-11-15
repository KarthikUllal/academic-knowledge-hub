
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Upload,
    Bot,
    BookOpen,
    ArrowRight,
    FileText,
    Sparkles,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getResources } from "../../services/resource.service";

import SearchBar from "../../components/common/SearchBar";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import EmptyState from "../../components/common/EmptyState";
import Loader from "../../components/common/Loader";

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [search, setSearch] = useState("");

    const [resources, setResources] = useState([]);
    const [loadingResources, setLoadingResources] = useState(true);
    const [resourceError, setResourceError] = useState("");

    // Fetch the latest 4 approved resources
    useEffect(() => {
        const fetchResources = async () => {
            try {
                const response = await getResources({
                    page: 1,
                    limit: 4,
                });

                setResources(response.data.resources || []);
            } catch (error) {
                console.error("Failed to fetch resources:", error);
                setResourceError("Unable to load resources.");
            } finally {
                setLoadingResources(false);
            }
        };

        fetchResources();
    }, []);

    const firstName = user?.fullName
        ? user.fullName.split(" ")[0]
        : "Student";

    // Navigate to Explore Resources with the search query
    const handleSearch = () => {
        if (!search.trim()) {
            navigate("/student/resources");
            return;
        }

        navigate(
            `/student/resources?search=${encodeURIComponent(search.trim())}`
        );
    };

    return (
        <div className="space-y-8">

            {/* Welcome section */}
            <section>
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    <Sparkles size={16} />
                    Student Dashboard
                </div>

                <h1 className="mt-2 text-2xl font-bold text-text-primary sm:text-3xl">
                    Welcome back, {firstName}!
                </h1>

                <p className="mt-2 text-sm text-text-secondary sm:text-base">
                    Find learning materials, share knowledge and continue your academic journey.
                </p>
            </section>

            {/* Search section */}
            <section className="rounded-2xl bg-primary p-6 text-white sm:p-8">
                <h2 className="text-xl font-semibold sm:text-2xl">
                    Discover Academic Resources
                </h2>

                <p className="mt-2 text-sm text-indigo-100">
                    Explore notes, question papers, assignments and more.
                </p>

                <div className="mt-5 max-w-xl">
                    <SearchBar
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search notes, question papers, subjects..."
                        onSubmit={handleSearch}
                    />
                </div>
            </section>

            {/* Quick actions */}
            <section>
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-text-primary">
                        Quick Actions
                    </h2>

                    <p className="mt-1 text-sm text-text-secondary">
                        Get started with your academic activities.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                    {/* Explore resources */}
                    <Link to="/student/resources" className="block">
                        <Card
                            padding="md"
                            className="group h-full transition hover:border-primary hover:shadow-sm"
                        >
                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-soft text-primary">
                                <BookOpen size={22} />
                            </div>

                            <h3 className="mt-4 font-semibold text-text-primary">
                                Explore Resources
                            </h3>

                            <p className="mt-2 text-sm text-text-secondary">
                                Browse academic materials shared by students.
                            </p>

                            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary">
                                Explore now
                                <ArrowRight
                                    size={16}
                                    className="transition group-hover:translate-x-1"
                                />
                            </div>
                        </Card>
                    </Link>

                    {/* Upload resource */}
                    <Link to="/student/upload" className="block">
                        <Card
                            padding="md"
                            className="group h-full transition hover:border-primary hover:shadow-sm"
                        >
                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-soft text-primary">
                                <Upload size={22} />
                            </div>

                            <h3 className="mt-4 font-semibold text-text-primary">
                                Upload Resource
                            </h3>

                            <p className="mt-2 text-sm text-text-secondary">
                                Share your notes and study materials with others.
                            </p>

                            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary">
                                Upload now
                                <ArrowRight
                                    size={16}
                                    className="transition group-hover:translate-x-1"
                                />
                            </div>
                        </Card>
                    </Link>

                    {/* AI assistant */}
                    <Link to="/student/ai" className="block">
                        <Card
                            padding="md"
                            className="group h-full transition hover:border-primary hover:shadow-sm"
                        >
                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-soft text-primary">
                                <Bot size={22} />
                            </div>

                            <h3 className="mt-4 font-semibold text-text-primary">
                                AI Assistant
                            </h3>

                            <p className="mt-2 text-sm text-text-secondary">
                                Ask questions and learn from academic resources.
                            </p>

                            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary">
                                Ask AI
                                <ArrowRight
                                    size={16}
                                    className="transition group-hover:translate-x-1"
                                />
                            </div>
                        </Card>
                    </Link>

                </div>
            </section>

            {/* Recently added resources */}
            <section>
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-text-primary">
                            Recently Added Resources
                        </h2>

                        <p className="mt-1 text-sm text-text-secondary">
                            Explore the latest academic materials.
                        </p>
                    </div>

                    <Link
                        to="/student/resources"
                        className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark"
                    >
                        View all
                        <ArrowRight size={16} />
                    </Link>
                </div>

                {/* Loading state */}
                {loadingResources && (
                    <Card className="flex justify-center py-12">
                        <Loader />
                    </Card>
                )}

                {/* Error state */}
                {!loadingResources && resourceError && (
                    <Card className="p-8 text-center">
                        <p className="text-sm text-error">
                            {resourceError}
                        </p>
                    </Card>
                )}

                {/* Empty state */}
                {!loadingResources && !resourceError && resources.length === 0 && (
                    <Card>
                        <EmptyState
                            icon={FileText}
                            title="No resources available yet"
                            description="New academic resources will appear here."
                        />
                    </Card>
                )}

                {/* Resource cards */}
                {!loadingResources && !resourceError && resources.length > 0 && (
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
                )}
            </section>

        </div>
    );
};

export default Dashboard;
