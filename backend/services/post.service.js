const Post = require("../models/post.model");

// Create a new post
const createPostService = async (data, userId) => {

    const post = await Post.create({
        title: data.title,
        content: data.content,
        type: data.type,
        category: data.category,
        tags: data.tags || [],
        author: userId
    });

    return post;
};

// Get all posts with search, filters and pagination
const getAllPostsService = async (query) => {

    const { search, type, category } = query;

    const page = Math.max(parseInt(query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query.limit) || 10, 1), 50);

    const skip = (page - 1) * limit;

    // Build filter conditions
    const filter = {
        status: "active"
    };

    // Search by title or content
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { content: { $regex: search, $options: "i" } }
        ];
    }

    // Filter by post type (case-insensitive)
    if (type) {
        filter.type = {
            $regex: `^${type}$`,
            $options: "i"
        };
    }

    // Filter by category (case-insensitive)
    if (category) {
        filter.category = {
            $regex: `^${category}$`,
            $options: "i"
        };
    }

    // Get total matching posts
    const totalPosts = await Post.countDocuments(filter);

    // Fetch posts
    const posts = await Post.find(filter)
        .populate("author", "fullName college profilePicture")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    return {
        posts,
        totalPosts,
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit)
    };
};


// Get a single post by ID
const getPostByIdService = async (postId) => {

    const post = await Post.findOne({
        _id: postId,
        status: "active"
    }).populate("author", "fullName college profilePicture");

    if (!post) {
        throw new Error("Post not found");
    }

    return post;
};

// Update a post
const updatePostService = async (postId, userId, data) => {

    const post = await Post.findOne({
        _id: postId,
        author: userId,
        status: "active"
    });

    if (!post) {
        throw new Error("Post not found or access denied");
    }

    // Update allowed fields
    if (data.title !== undefined) post.title = data.title;
    if (data.content !== undefined) post.content = data.content;
    if (data.type !== undefined) post.type = data.type;
    if (data.category !== undefined) post.category = data.category;
    if (data.tags !== undefined) post.tags = data.tags;

    await post.save();

    return post;
};


// Delete a post
const deletePostService = async (postId, userId) => {

    const post = await Post.findOneAndDelete({
        _id: postId,
        author: userId
    });

    if (!post) {
        throw new Error("Post not found or access denied");
    }

    return post;
};


//upvote a post
const toggleUpvoteService = async (postId, userId) => {

    // Find the active post
    const post = await Post.findOne({
        _id: postId,
        status: "active"
    });

    if (!post) {
        throw new Error("Post not found");
    }

    // Check whether the user has already upvoted
    const hasUpvoted = post.upvotes.some(
        (id) => id.toString() === userId.toString()
    );

    if (hasUpvoted) {

        // Remove the user's upvote
        post.upvotes.pull(userId);

    } else {

        // Add the user's upvote
        post.upvotes.addToSet(userId);
    }

    // Save changes to MongoDB
    await post.save();

    return {
        hasUpvoted: !hasUpvoted,
        totalUpvotes: post.upvotes.length
    };
};


module.exports = {
    createPostService,
    getAllPostsService,
    getPostByIdService,
    updatePostService,
    deletePostService,
    toggleUpvoteService
};