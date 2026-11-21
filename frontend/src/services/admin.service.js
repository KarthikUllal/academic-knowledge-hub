
import api from "./api";

// Dashboard statistics
export const getDashboardStats = () => {
    return api.get("/admin/dashboard/stats");
};

// Get all resources
export const getAllResources = () => {
    return api.get("/admin/resources");
};

// Get pending resources
export const getPendingResources = () => {
    return api.get("/admin/resources/pending");
};

// Approve a resource
export const approveResource = (id) => {
    return api.patch(`/admin/resources/${id}/approve`);
};

// Reject a resource
export const rejectResource = (id, rejectionReason) => {
    return api.patch(`/admin/resources/${id}/reject`, {
        rejectionReason
    });
};

// Delete a resource
export const deleteResourceByAdmin = (id) => {
    return api.delete(`/admin/resources/${id}`);
};

// Get resource preview for admin
export const getAdminResourcePreview = (id) => {
    return api.get(`/admin/resources/${id}/preview`);
};

export const downloadAdminResource = (id) => {
    return api.get(`/admin/resources/${id}/download`, {
        responseType: "blob"
    });
};


// Manage User // 

// Get all students
export const getAllUsers = () => {
    return api.get("/admin/users");
};

// Get student details
export const getUserById = (id) => {
    return api.get(`/admin/users/${id}`);
};

// Update student account status
export const updateStudentStatus = (id, isActive) => {
    return api.patch(`/admin/users/${id}/status`, {
        isActive
    });
};

// Delete student account
export const deleteStudent = (id) => {
    return api.delete(`/admin/users/${id}`);
};