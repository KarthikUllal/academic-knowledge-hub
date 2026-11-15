
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import StudentLayout from "../layouts/StudentLayout";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ResetPassword from "../pages/auth/ResetPassword";
import ForgotPassword from "../pages/auth/ForgotPassword";
import Dashboard from "../pages/student/Dashboard";
import ExploreResources from "../pages/student/ExploreResources";
import ResourceDetails from "../pages/student/ResourceDetails";
const Placeholder = ({ title }) => <h1>{title}</h1>;

const AppRoutes = () => (
    <Routes>
        <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        <Route
            path="/reset-password/:token"
            element={<ResetPassword />}
        />

        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
            <Route path="/student" element={<StudentLayout />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="resources" element={<ExploreResources />} />
                <Route path="upload" element={<Placeholder title="Upload Resource" />} />
                <Route path="ai" element={<Placeholder title="AI Assistant" />} />
                <Route path="profile" element={<Placeholder title="My Profile" />} />
                <Route path="resources/:id" element={<ResourceDetails />} />
            </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin/dashboard" element={<Placeholder title="Admin Dashboard" />} />
            <Route path="/admin/resources" element={<Placeholder title="Manage Resources" />} />
            <Route path="/admin/users" element={<Placeholder title="Manage Users" />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
    </Routes>
);

export default AppRoutes;
