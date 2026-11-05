const {
    createPostService,
    getAllPostsService,
    getPostByIdService,
    updatePostService,
    toggleUpvoteService
} = require("../services/post.service");

// Create a new post
const createPost = async (req, res) => {
    try {
        const post = await createPostService(
            req.body,
            req.user.userId
        );

        res.status(201).json({
            message: "Post created successfully",
            post
        });

    } catch (error) {
        console.error("Create post error:", error);

        res.status(500).json({
            message: "Failed to create post"
        });
    }
};


// Get all posts
// Get all posts
const getAllPosts = async (req, res) => {
    try {
        const result = await getAllPostsService(req.query);

        res.status(200).json({
            message: "Posts fetched successfully",
            ...result
        });

    } catch (error) {
        console.error("Get all posts error:", error);

        res.status(500).json({
            message: "Failed to fetch posts"
        });
    }
};


// Get a single post
const getPostById = async (req, res) => {
    try {
        const post = await getPostByIdService(req.params.id);

        res.status(200).json({
            message: "Post fetched successfully",
            post
        });

    } catch (error) {
        console.error("Get post error:", error);

        if (error.message === "Post not found") {
            return res.status(404).json({
                message: error.message
            });
        }

        res.status(500).json({
            message: "Failed to fetch post"
        });
    }
};


// Update a post
const updatePost = async (req, res) => {
    try {
        const post = await updatePostService(
            req.params.id,
            req.user.userId,
            req.body
        );

        res.status(200).json({
            message: "Post updated successfully",
            post
        });

    } catch (error) {
        console.error("Update post error:", error);

        if (error.message === "Post not found or access denied") {
            return res.status(404).json({
                message: error.message
            });
        }

        res.status(500).json({
            message: "Failed to update post"
        });
    }
};


// Delete a post
const deletePost = async (req, res) => {
    try {
        await deletePostService(
            req.params.id,
            req.user.userId
        );

        res.status(200).json({
            message: "Post deleted successfully"
        });

    } catch (error) {
        console.error("Delete post error:", error);

        if (error.message === "Post not found or access denied") {
            return res.status(404).json({
                message: error.message
            });
        }

        res.status(500).json({
            message: "Failed to delete post"
        });
    }
};


// Toggle upvote on a post
const toggleUpvote = async (req, res) => {

    try {
        const result = await toggleUpvoteService(
            req.params.id,
            req.user.userId
        );

        res.status(200).json({
            message: result.hasUpvoted
                ? "Post upvoted successfully"
                : "Upvote removed successfully",

            hasUpvoted: result.hasUpvoted,
            totalUpvotes: result.totalUpvotes
        });

    } catch (error) {

        console.error("Toggle upvote error:", error);

        if (error.message === "Post not found") {
            return res.status(404).json({
                message: error.message
            });
        }

        res.status(500).json({
            message: "Failed to update upvote"
        });
    }
};

module.exports = {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost,
    toggleUpvote
};