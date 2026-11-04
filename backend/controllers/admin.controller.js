
const {
    getPendingResourcesService,
    approveResourceService,
    rejectResourceService,
    getAllResourcesService,
    deleteResourceByAdminService,
    getAllUsersService,
    getUserByIdService,
    updateStudentStatusService,
    deleteStudentService,
    getDashboardStatsService
} = require("../services/admin.service");

// Get all pending resources
const getPendingResources = async (req, res) => {
    try {
        const resources = await getPendingResourcesService();

        res.status(200).json({
            message: "Pending resources fetched successfully",
            count: resources.length,
            resources
        });

    } catch (error) {
        console.error("Get pending resources error:", error);

        res.status(500).json({
            message: "Failed to fetch pending resources"
        });
    }
};

// Approve a resource
const approveResource = async (req, res) => {
    try {
        const resource = await approveResourceService(req.params.id);

        res.status(200).json({
            message: "Resource approved successfully",
            resource
        });

    } catch (error) {
        console.error("Approve resource error:", error);

        res.status(error.statusCode || 500).json({
            message: error.message || "Failed to approve resource"
        });
    }
};


// Reject a resource
const rejectResource = async (req, res) => {
    try {
        const { rejectionReason } = req.body;

        if (!rejectionReason || !rejectionReason.trim()) {
            return res.status(400).json({
                message: "Rejection reason is required"
            });
        }

        const resource = await rejectResourceService(
            req.params.id,
            rejectionReason.trim()
        );

        res.status(200).json({
            message: "Resource rejected successfully",
            resource
        });

    } catch (error) {
        console.error("Reject resource error:", error);

        res.status(error.statusCode || 500).json({
            message: error.message || "Failed to reject resource"
        });
    }
};

// Get all resources
const getAllResources = async (req, res) => {
    try {
        const resources = await getAllResourcesService();

        res.status(200).json({
            message: "All resources fetched successfully",
            count: resources.length,
            resources
        });

    } catch (error) {
        console.error("Get all resources error:", error);

        res.status(500).json({
            message: "Failed to fetch resources"
        });
    }
};

// Delete a resource by admin
const deleteResourceByAdmin = async (req, res) => {
    try {
        const resource = await deleteResourceByAdminService(req.params.id);

        res.status(200).json({
            message: "Resource deleted successfully",
            resource
        });

    } catch (error) {
        console.error("Admin delete resource error:", error);

        res.status(error.statusCode || 500).json({
            message: error.message || "Failed to delete resource"
        });
    }
};



// User Management Controllers //

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await getAllUsersService();

        res.status(200).json({
            message: "Users fetched successfully",
            count: users.length,
            users
        });

    } catch (error) {
        console.error("Get all users error:", error);

        res.status(500).json({
            message: "Failed to fetch users"
        });
    }
};


// Get a student by ID
const getUserById = async (req, res) => {
    try {
        const user = await getUserByIdService(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.status(200).json({
            message: "Student details fetched successfully",
            user
        });

    } catch (error) {
        console.error("Get student error:", error);

        res.status(error.statusCode || 500).json({
            message: error.message || "Failed to fetch student details"
        });
    }
};


// Update student account status
const updateStudentStatus = async (req, res) => {
    try {
        const { isActive } = req.body;

        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                message: "isActive must be true or false"
            });
        }

        const user = await updateStudentStatusService(
            req.params.id,
            isActive
        );

        res.status(200).json({
            message: `Student account ${isActive ? "activated" : "deactivated"} successfully`,
            user
        });

    } catch (error) {
        console.error("Update student status error:", error);

        res.status(error.statusCode || 500).json({
            message: error.message || "Failed to update student status"
        });
    }
};


// Delete a student account
const deleteStudent = async (req, res) => {
    try {
        const result = await deleteStudentService(req.params.id);

        res.status(200).json({
            message: result.message,
            deletedResources: result.deletedResources
        });

    } catch (error) {
        console.error("Delete student error:", error);

        res.status(error.statusCode || 500).json({
            message: error.message || "Failed to delete student"
        });
    }
};


// Get admin dashboard statistics
const getDashboardStats = async (req, res) => {
    try {
        const stats = await getDashboardStatsService();

        res.status(200).json({
            message: "Dashboard statistics fetched successfully",
            stats
        });

    } catch (error) {
        console.error("Dashboard statistics error:", error);

        res.status(500).json({
            message: "Failed to fetch dashboard statistics"
        });
    }
};

module.exports = {
    getPendingResources,
    approveResource,
    rejectResource,
    getAllResources,
    deleteResourceByAdmin,
    getAllUsers,
    getUserById,
    updateStudentStatus,
    deleteStudent,
    getDashboardStats
};
