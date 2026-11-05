const express = require("express");

const {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost,
    toggleUpvote
} = require("../controllers/post.controller");

const protect = require("../middleware/auth.middleware");
const { getPostByIdService } = require("../services/post.service");

const router = express.Router();

// Create a new post
router.post("/", protect, createPost);


// Get all posts
router.get("/", protect, getAllPosts);

// Get a single post
router.get("/:id", protect, getPostById);

// Update a post
router.put("/:id", protect, updatePost);

// Delete a post
router.delete("/:id", protect, deletePost);

// Toggle upvote on a post
router.patch("/:id/upvote", protect, toggleUpvote);


module.exports = router;