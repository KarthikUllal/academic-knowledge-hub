import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

import StudentLayout from "../layouts/StudentLayout";
import AdminLayout from "../layouts/AdminLayout";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ResetPassword from "../pages/auth/ResetPassword";
import ForgotPassword from "../pages/auth/ForgotPassword";

import Dashboard from "../pages/student/Dashboard";
import ExploreResources from "../pages/student/ExploreResources";
import ResourceDetails from "../pages/student/ResourceDetails";
import UploadResource from "../pages/student/UploadResource";
import MyUploads from "../pages/student/MyUploads";
import EditResource from "../pages/student/EditResource";
import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageResources from "../pages/admin/ManageResources";
import ManageUsers from "../pages/admin/ManageUsers";
import MyProfile from "../pages/student/MyProfile";

const Placeholder = ({ title }) => <h1>{title}</h1>;

const AppRoutes = () => (
    <Routes>
        {/* Public routes */}
        <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Student routes */}
        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
            <Route path="/student" element={<StudentLayout />}>
                <Route path="dashboard" element={<Dashboard />} />

                <Route path="resources" element={<ExploreResources />} />

                <Route path="resources/:id" element={<ResourceDetails />} />

                <Route path="resources/:id/edit" element={<EditResource />} />

                <Route path="upload" element={<UploadResource />} />

                <Route path="my-uploads" element={<MyUploads />} />

                <Route path="ai" element={<Placeholder title="AI Assistant" />} />

                <Route path="profile" element={<MyProfile />} />
            </Route>
        </Route>

        {/* Admin routes */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
                <Route
                    path="dashboard"
                    element={<AdminDashboard />}
                />

                <Route
                    path="resources"
                    element={<ManageResources/>}
                />

                <Route path="users" element={<ManageUsers />} />
            </Route>
        </Route>

        {/* Default route */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 404 route */}
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
    </Routes>
);

export default AppRoutes;
