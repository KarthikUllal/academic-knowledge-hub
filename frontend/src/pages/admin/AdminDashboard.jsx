
import { useEffect, useState } from "react";
import {
    Users,
    Files,
    CheckCircle,
    Clock,
    XCircle,
    Download
} from "lucide-react";
import { toast } from "sonner";

import { getDashboardStats } from "../../services/admin.service";

import StatCard from "../../components/admin/dashboard/StatCard";
import RecentResources from "../../components/admin/dashboard/RecentResources";
import RecentStudents from "../../components/admin/dashboard/RecentStudents";

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch dashboard statistics
    const fetchDashboardStats = async () => {
        try {
            setLoading(true);

            const response = await getDashboardStats();

            setStats(response.data.stats);
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to load dashboard statistics"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    // Show loading state
    if (loading) {
        return (
            <div className="flex min-h-[300px] items-center justify-center">
                <p className="text-sm text-slate-500">
                    Loading dashboard...
                </p>
            </div>
        );
    }

    // Dashboard statistics
    const dashboardCards = [
        {
            title: "Total Students",
            value: stats?.totalStudents,
            icon: Users,
            iconColor: "bg-indigo-50 text-indigo-600"
        },
        {
            title: "Total Resources",
            value: stats?.totalResources,
            icon: Files,
            iconColor: "bg-blue-50 text-blue-600"
        },
        {
            title: "Approved Resources",
            value: stats?.approvedResources,
            icon: CheckCircle,
            iconColor: "bg-green-50 text-green-600"
        },
        {
            title: "Pending Resources",
            value: stats?.pendingResources,
            icon: Clock,
            iconColor: "bg-amber-50 text-amber-600"
        },
        {
            title: "Rejected Resources",
            value: stats?.rejectedResources,
            icon: XCircle,
            iconColor: "bg-red-50 text-red-600"
        },
        {
            title: "Total Downloads",
            value: stats?.totalDownloads,
            icon: Download,
            iconColor: "bg-purple-50 text-purple-600"
        }
    ];

    return (
        <div className="space-y-6">

            {/* Page heading */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">
                    Dashboard
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Overview of your Academic Knowledge Hub
                </p>
            </div>

            {/* Statistics cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {dashboardCards.map((card) => (
                    <StatCard
                        key={card.title}
                        title={card.title}
                        value={card.value}
                        icon={card.icon}
                        iconColor={card.iconColor}
                    />
                ))}
            </div>

            {/* Recent activity */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

                <RecentResources
                    resources={stats?.recentResources || []}
                />

                <RecentStudents
                    students={stats?.recentStudents || []}
                />

            </div>

        </div>
    );
};

export default AdminDashboard;
