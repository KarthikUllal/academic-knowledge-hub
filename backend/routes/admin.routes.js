const express = require("express");

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const {
    getPendingResources,
    approveResource,
    rejectResource,
    getAllResources,
    deleteResourceByAdmin,
    getAllUsers,
    getUserById,
    updateStudentStatus,
    deleteStudent,
    getDashboardStats,
} = require("../controllers/admin.controller");
const { getAllReports, getReportById, reviewReport } = require("../controllers/report.controller");

const router = express.Router();

// Admin dashboard test route
router.get("/dashboard", protect, authorize("admin"), (req, res) => {
    res.status(200).json({
        message: "Welcome to the admin dashboard",
    });
});

//admin route for managing reports
router.get("/reports", protect, authorize("admin"), getAllReports);

// Get all users
router.get("/users", protect, authorize("admin"), getAllUsers);

// Get all resources
router.get("/resources", protect, authorize("admin"), getAllResources);

// Get pending resources
router.get(
    "/resources/pending",
    protect,
    authorize("admin"),
    getPendingResources,
);

// Get a student by ID
router.get("/users/:id", protect, authorize("admin"), getUserById);

// Get a single report (admin only)
router.get(
    "/reports/:id",
    protect,
    authorize("admin"),
    getReportById
);

//review a report (admin only)
// Review a report
router.patch(
    "/reports/:id/review",
    protect,
    authorize("admin"),
    reviewReport
);


// Update student account status
router.patch(
    "/users/:id/status",
    protect,
    authorize("admin"),
    updateStudentStatus,
);

// Delete a student account
router.delete("/users/:id", protect, authorize("admin"), deleteStudent);

// Get admin dashboard statistics
router.get("/dashboard/stats", protect, authorize("admin"), getDashboardStats);

// Approve a resource
router.patch(
    "/resources/:id/approve",
    protect,
    authorize("admin"),
    approveResource,
);

// Reject a resource
router.patch(
    "/resources/:id/reject",
    protect,
    authorize("admin"),
    rejectResource,
);

// Delete any resource by admin
router.delete(
    "/resources/:id",
    protect,
    authorize("admin"),
    deleteResourceByAdmin,
);

module.exports = router;
