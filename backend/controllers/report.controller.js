
const {
    createReportService,
    getMyReportsService,
    getAllReportsService,
    getReportByIdService,
    reviewReportService
} = require("../services/report.service");

console.log("getReportByIdService:", typeof getReportByIdService);

// Create a new report
const createReport = async (req, res) => {

    try {
        const report = await createReportService(
            req.user.userId,
            req.body
        );

        res.status(201).json({
            message: "Report submitted successfully",
            report
        });

    } catch (error) {

        console.error("Create report error:", error);

        if (
            error.message === "Report must target either a post or a comment" ||
            error.message === "Post not found" ||
            error.message === "Comment not found"
        ) {
            return res.status(400).json({
                message: error.message
            });
        }

        // Handle duplicate reports
        if (error.code === 11000) {
            return res.status(409).json({
                message: "You have already reported this content"
            });
        }

        // Handle invalid report fields
        if (
            error.name === "ValidationError" ||
            error.name === "CastError"
        ) {
            return res.status(400).json({
                message: error.message
            });
        }

        res.status(500).json({
            message: "Failed to submit report"
        });
    }
};


// Get reports submitted by the logged-in student
const getMyReports = async (req, res) => {

    try {
        const result = await getMyReportsService(
            req.user.userId,
            req.query
        );

        res.status(200).json({
            message: "Your reports fetched successfully",
            ...result
        });

    } catch (error) {

        console.error("Get my reports error:", error);

        res.status(500).json({
            message: "Failed to fetch your reports"
        });
    }
};


// Get all reports (Admin only)
const getAllReports = async (req, res) => {

    try {
        const result = await getAllReportsService(req.query);

        res.status(200).json({
            message: "Reports fetched successfully",
            ...result
        });

    } catch (error) {

        console.error("Get all reports error:", error);

        res.status(500).json({
            message: "Failed to fetch reports"
        });
    }
};


// Get a single report
const getReportById = async (req, res) => {

    try {
        const report = await getReportByIdService(req.params.id);

        res.status(200).json({
            message: "Report fetched successfully",
            report
        });

    } catch (error) {

        console.error("Get report error:", error);

        if (error.message === "Report not found") {
            return res.status(404).json({
                message: error.message
            });
        }

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid report ID"
            });
        }

        res.status(500).json({
            message: "Failed to fetch report"
        });
    }
};



// Review a report (Admin only)
const reviewReport = async (req, res) => {

    try {
        const report = await reviewReportService(
            req.params.id,
            req.user.userId,
            req.body
        );

        res.status(200).json({
            message: "Report reviewed successfully",
            report
        });

    } catch (error) {

        console.error("Review report error:", error);

        if (
            error.message === "Report not found" ||
            error.message === "Reported post not found" ||
            error.message === "Reported comment not found"
        ) {
            return res.status(404).json({
                message: error.message
            });
        }

        if (
            error.message === "Invalid review action" ||
            error.message === "Report has already been reviewed"
        ) {
            return res.status(400).json({
                message: error.message
            });
        }

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid report ID"
            });
        }

        res.status(500).json({
            message: "Failed to review report"
        });
    }
};


module.exports = {
    createReport,
    getMyReports,
    getAllReports,
    getReportById,
    reviewReport    
};
