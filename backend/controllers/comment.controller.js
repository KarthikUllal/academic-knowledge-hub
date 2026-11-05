
const {
    createCommentService,
    getCommentsService,
    updateCommentService,
    deleteCommentService
} = require("../services/comment.service");

// Create a new comment or reply
const createComment = async (req, res) => {

    try {
        const comment = await createCommentService(
            req.params.postId,
            req.user.userId,
            req.body
        );

        res.status(201).json({
            message: "Comment created successfully",
            comment
        });

    } catch (error) {

        console.error("Create comment error:", error);

        if (
            error.message === "Post not found" ||
            error.message === "Parent comment not found"
        ) {
            return res.status(404).json({
                message: error.message
            });
        }

        res.status(500).json({
            message: "Failed to create comment"
        });
    }
};


// Get comments for a post
const getComments = async (req, res) => {

    try {
        const result = await getCommentsService(
            req.params.postId,
            req.query
        );

        res.status(200).json({
            message: "Comments fetched successfully",
            ...result
        });

    } catch (error) {

        console.error("Get comments error:", error);

        if (error.message === "Post not found") {
            return res.status(404).json({
                message: error.message
            });
        }

        res.status(500).json({
            message: "Failed to fetch comments"
        });
    }
};


// Update a comment
const updateComment = async (req, res) => {

    try {
        const comment = await updateCommentService(
            req.params.id,
            req.user.userId,
            req.body
        );

        res.status(200).json({
            message: "Comment updated successfully",
            comment
        });

    } catch (error) {

        console.error("Update comment error:", error);

        if (error.message === "Comment not found or access denied") {
            return res.status(404).json({
                message: error.message
            });
        }

        res.status(500).json({
            message: "Failed to update comment"
        });
    }
};

// Delete a comment

const deleteComment = async (req, res) => {

    try {
        const result = await deleteCommentService(
            req.params.id,
            req.user.userId
        );

        res.status(200).json({
            message: "Comment and its replies deleted successfully",
            deletedCount: result.deletedCount
        });

    } catch (error) {

        console.error("Delete comment error:", error);

        if (error.message === "Comment not found or access denied") {
            return res.status(404).json({
                message: error.message
            });
        }

        res.status(500).json({
            message: "Failed to delete comment"
        });
    }
};


module.exports = {
    createComment,
    getComments,
    updateComment,
    deleteComment
};
