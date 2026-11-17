
import { Menu } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import Avatar from "../common/Avatar";

const AdminHeader = ({ onMenuClick }) => {
    const { user } = useAuth();

    return (
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">

            {/* Left section */}
            <div className="flex items-center gap-3">

                {/* Mobile menu button */}
                <button
                    type="button"
                    onClick={onMenuClick}
                    className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                    aria-label="Open sidebar"
                >
                    <Menu size={22} />
                </button>

                <div>
                    <h1 className="text-sm font-semibold text-slate-900 sm:text-base">
                        Admin Panel
                    </h1>

                    <p className="hidden text-xs text-slate-500 sm:block">
                        Manage your Academic Knowledge Hub
                    </p>
                </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-3">

                <div className="hidden text-right sm:block">
                    <p className="text-sm font-semibold text-slate-800">
                        {user?.fullName || "Admin"}
                    </p>

                    <p className="text-xs text-slate-500">
                        Administrator
                    </p>
                </div>

                <Avatar
                    src={user?.profilePicture}
                    name={user?.fullName || "Admin"}
                    size="md"
                />

            </div>
        </header>
    );
};

export default AdminHeader;
