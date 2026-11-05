
const express = require("express");

const {
    createComment,
    getComments,
    updateComment,
    deleteComment
} = require("../controllers/comment.controller");

const protect = require("../middleware/auth.middleware");

const router = express.Router();

// Create a comment or reply
router.post("/posts/:postId/comments", protect, createComment);

// Get comments for a post
router.get("/posts/:postId/comments", protect, getComments);

// Update a comment
router.put("/comments/:id", protect, updateComment);

// Delete a comment
router.delete("/comments/:id", protect, deleteComment);

module.exports = router;
