
import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Files,
    Users,
    LogOut,
    GraduationCap,
    X
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "../../context/AuthContext";
import Button from "../common/Button";

const AdminSidebar = ({ isOpen, onClose }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    // Admin navigation links
    const navItems = [
        {
            name: "Dashboard",
            path: "/admin/dashboard",
            icon: LayoutDashboard
        },
        {
            name: "Manage Resources",
            path: "/admin/resources",
            icon: Files
        },
        {
            name: "Manage Users",
            path: "/admin/users",
            icon: Users
        }
    ];

    // Handle admin logout
    const handleLogout = async () => {
        try {
            await logout();

            toast.success("Logged out successfully");

            navigate("/login", { replace: true });
        } catch (error) {
            toast.error("Failed to logout. Please try again.");
        }
    };

    return (
        <>
            {/* Mobile sidebar overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Sidebar logo */}
                <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">

                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
                            <GraduationCap size={22} className="text-white" />
                        </div>

                        <div>
                            <h2 className="font-bold text-slate-900">
                                Academic Hub
                            </h2>

                            <p className="text-xs text-slate-500">
                                Administration
                            </p>
                        </div>
                    </div>

                    {/* Close button for mobile */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
                        aria-label="Close sidebar"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation links */}
                <nav className="flex-1 space-y-1 px-3 py-5">

                    <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Main Menu
                    </p>

                    {navItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive
                                        ? "bg-indigo-50 text-indigo-700"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    }`
                                }
                            >
                                <Icon size={19} />
                                {item.name}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Logout button */}
                <div className="border-t border-slate-200 p-3">
                    <Button
                        variant="danger"
                        size="md"
                        onClick={handleLogout}
                        className="w-full"
                    >
                        <LogOut size={18} />
                        Logout
                    </Button>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
