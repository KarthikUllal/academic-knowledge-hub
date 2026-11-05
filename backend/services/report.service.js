
const Report = require("../models/report.model");
const Post = require("../models/post.model");
const Comment = require("../models/comment.model");

// Create a new report
const createReportService = async (userId, data) => {

    // Check whether the report targets a post or comment
    const hasPost = Boolean(data.post);
    const hasComment = Boolean(data.comment);

    if (hasPost === hasComment) {
        throw new Error("Report must target either a post or a comment");
    }

    // Check whether the reported post exists
    if (hasPost) {
        const post = await Post.findOne({
            _id: data.post,
            status: "active"
        });

        if (!post) {
            throw new Error("Post not found");
        }
    }

    // Check whether the reported comment exists
    if (hasComment) {
        const comment = await Comment.findOne({
            _id: data.comment,
            status: "active"
        });

        if (!comment) {
            throw new Error("Comment not found");
        }
    }

    // Create the report
    const report = await Report.create({
        reportedBy: userId,
        post: hasPost ? data.post : null,
        comment: hasComment ? data.comment : null,
        reason: data.reason,
        description: data.description || ""
    });

    return report;
};


// Get reports submitted by a student
const getMyReportsService = async (userId, query) => {

    const page = Math.max(parseInt(query.page) || 1, 1);
    const limit = Math.min(
        Math.max(parseInt(query.limit) || 10, 1),
        50
    );

    const skip = (page - 1) * limit;

    // Find reports submitted by the logged-in student
    const reports = await Report.find({
        reportedBy: userId
    })
        .populate("post", "title type category")
        .populate({
            path: "comment",
            select: "content post",
            populate: {
                path: "post",
                select: "title"
            }
        })
        .populate("reviewedBy", "fullName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    // Count the student's total reports
    const totalReports = await Report.countDocuments({
        reportedBy: userId
    });

    return {
        reports,
        totalReports,
        currentPage: page,
        totalPages: Math.ceil(totalReports / limit)
    };
};



// Get all reports for admin
const getAllReportsService = async (query) => {

    const page = Math.max(parseInt(query.page) || 1, 1);

    const limit = Math.min(
        Math.max(parseInt(query.limit) || 10, 1),
        50
    );

    const skip = (page - 1) * limit;

    // Build the report filter
    const filter = {};

    if (query.status) {
        filter.status = query.status;
    }

    if (query.reason) {
        filter.reason = query.reason;
    }

    // Fetch reports
    const reports = await Report.find(filter)
        .populate("reportedBy", "fullName email college")
        .populate("post", "title type category status")
        .populate({
            path: "comment",
            select: "content post status",
            populate: {
                path: "post",
                select: "title"
            }
        })
        .populate("reviewedBy", "fullName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    // Count matching reports
    const totalReports = await Report.countDocuments(filter);

    return {
        reports,
        totalReports,
        currentPage: page,
        totalPages: Math.ceil(totalReports / limit)
    };
};


// Get a single report by ID
const getReportByIdService = async (reportId) => {

    const report = await Report.findById(reportId)
        .populate("reportedBy", "fullName email college")
        .populate("post", "title content type category status")
        .populate({
            path: "comment",
            select: "content post status",
            populate: {
                path: "post",
                select: "title content"
            }
        })
        .populate("reviewedBy", "fullName email");

    if (!report) {
        throw new Error("Report not found");
    }

    return report;
};


// Review and Update a report status

const reviewReportService = async (reportId, adminId, data) => {

    const { action, adminNote } = data;

    // Validate the review action
    if (!["dismiss", "remove"].includes(action)) {
        throw new Error("Invalid review action");
    }

    // Find the report
    const report = await Report.findById(reportId);

    if (!report) {
        throw new Error("Report not found");
    }

    // Check whether the report is still pending
    if (report.status !== "pending") {
        throw new Error("Report has already been reviewed");
    }

    // Dismiss the report without removing the content
    if (action === "dismiss") {
        report.status = "dismissed";
    }

    // Remove the reported content using soft deletion
    if (action === "remove") {

        // Remove the reported post
        if (report.post) {

            const post = await Post.findById(report.post);

            if (!post) {
                throw new Error("Reported post not found");
            }

            post.status = "removed";
            await post.save();
        }

        // Remove the reported comment and its replies
        if (report.comment) {

            const comment = await Comment.findById(report.comment);

            if (!comment) {
                throw new Error("Reported comment not found");
            }

            // Find all comments belonging to the same post
            const comments = await Comment.find({
                post: comment.post
            }).select("_id parentComment status");

            // Group replies by their parent comment
            const childrenMap = new Map();

            for (const item of comments) {

                if (item.parentComment) {

                    const parentId = item.parentComment.toString();

                    if (!childrenMap.has(parentId)) {
                        childrenMap.set(parentId, []);
                    }

                    childrenMap.get(parentId).push(item);
                }
            }

            // Collect the reported comment and all its replies
            const commentIdsToRemove = [comment._id.toString()];

            for (let i = 0; i < commentIdsToRemove.length; i++) {

                const currentId = commentIdsToRemove[i];
                const children = childrenMap.get(currentId) || [];

                for (const child of children) {
                    commentIdsToRemove.push(child._id.toString());
                }
            }

            // Find comments that are currently active
            const activeCommentIds = comments
                .filter(item =>
                    commentIdsToRemove.includes(item._id.toString()) &&
                    item.status === "active"
                )
                .map(item => item._id);

            // Mark the comment and its replies as removed
            await Comment.updateMany(
                {
                    _id: { $in: commentIdsToRemove }
                },
                {
                    $set: { status: "removed" }
                }
            );

            // Update the post's comment count
            if (activeCommentIds.length > 0) {

                await Post.updateOne(
                    { _id: comment.post },
                    {
                        $inc: {
                            commentsCount: -activeCommentIds.length
                        }
                    }
                );
            }
        }

        report.status = "resolved";
    }

    // Save review information
    report.reviewedBy = adminId;
    report.reviewedAt = new Date();
    report.adminNote = adminNote || "";

    await report.save();

    return report;
};



module.exports = {
    createReportService,
    getMyReportsService,
    getAllReportsService,
    getReportByIdService,
    reviewReportService
};


