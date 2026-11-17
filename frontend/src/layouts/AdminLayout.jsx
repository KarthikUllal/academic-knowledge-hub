
import { useState } from "react";
import { Outlet } from "react-router-dom";

import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 lg:flex">

            {/* Sidebar */}
            <AdminSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main content */}
            <div className="flex min-w-0 flex-1 flex-col">

                {/* Header */}
                <AdminHeader
                    onMenuClick={() => setIsSidebarOpen(true)}
                />

                {/* Current admin page */}
                <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
                    <Outlet />
                </main>

            </div>
        </div>
    );
};

export default AdminLayout;
