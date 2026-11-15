
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Home,
  BookOpen,
  Upload,
  Bot,
  UserCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import Dropdown from "../common/Dropdown";

const StudentNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    {
      name: "Home",
      path: "/student/dashboard",
      icon: Home,
    },
    {
      name: "Explore Resources",
      path: "/student/resources",
      icon: BookOpen,
    },
    {
      name: "Upload",
      path: "/student/upload",
      icon: Upload,
    },
    {
      name: "AI Assistant",
      path: "/student/ai",
      icon: Bot,
    },
  ];

  const linkStyles = ({ isActive }) =>
    `flex items-center gap-2 text-sm font-medium transition-colors ${
      isActive
        ? "text-primary"
        : "text-text-secondary hover:text-primary"
    }`;

  const mobileLinkStyles = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
      isActive
        ? "bg-primary-soft text-primary"
        : "text-text-secondary hover:bg-background"
    }`;

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Dropdown menu options
  const dropdownItems = [
    {
      label: "My Profile",
      icon: <UserCircle size={17} />,
      onClick: () => navigate("/student/profile"),
    },
    {
      label: "Logout",
      icon: <LogOut size={17} />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  // Get student initials
  const fullName = user?.fullName || "Student";

  const initials = fullName
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface">

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <NavLink
          to="/student/dashboard"
          className="flex items-center gap-2"
        >
          <GraduationCap size={30} className="text-primary" />

          <span className="text-lg font-bold text-text-primary">
            Academic Hub
          </span>
        </NavLink>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => {
            const Icon = link.icon;

            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={linkStyles}
              >
                <Icon size={18} />
                {link.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Desktop Profile Dropdown */}
        <div className="hidden md:block">
          <Dropdown
            trigger={
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                  {initials}
                </div>

                <span className="text-sm font-medium text-text-primary">
                  {fullName}
                </span>
              </div>
            }
            items={dropdownItems}
          />
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() =>
            setIsMobileMenuOpen((prev) => !prev)
          }
          className="rounded-lg p-2 text-text-primary hover:bg-background md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}
        </button>

      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <nav className="border-t border-border bg-surface px-4 py-3 md:hidden">

          <div className="flex flex-col gap-1">

            {navLinks.map((link) => {
              const Icon = link.icon;

              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={mobileLinkStyles}
                >
                  <Icon size={18} />
                  {link.name}
                </NavLink>
              );
            })}

            <NavLink
              to="/student/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className={mobileLinkStyles}
            >
              <UserCircle size={18} />
              My Profile
            </NavLink>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-error hover:bg-red-50"
            >
              <LogOut size={18} />
              Logout
            </button>

          </div>
        </nav>
      )}

    </header>
  );
};

export default StudentNavbar;
