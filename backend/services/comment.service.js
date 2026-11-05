
const Comment = require("../models/comment.model");
const Post = require("../models/post.model");

// Create a new comment or reply
const createCommentService = async (postId, userId, data) => {

    // Check whether the post exists and is active
    const post = await Post.findOne({
        _id: postId,
        status: "active"
    });

    if (!post) {
        throw new Error("Post not found");
    }

    // Check whether the parent comment exists
    if (data.parentComment) {

        const parentComment = await Comment.findOne({
            _id: data.parentComment,
            post: postId,
            status: "active"
        });

        if (!parentComment) {
            throw new Error("Parent comment not found");
        }
    }

    // Create the comment
    const comment = await Comment.create({
        post: postId,
        author: userId,
        content: data.content,
        parentComment: data.parentComment || null
    });

    // Increase the post's comment count
    post.commentsCount += 1;
    await post.save();

    // Return comment with author details
    const populatedComment = await Comment.findById(comment._id)
        .populate("author", "fullName college profilePicture");

    return populatedComment;
};


// Get comments for a post
const getCommentsService = async (postId, query) => {

    const Post = require("../models/post.model");

    // Check whether the post exists
    const post = await Post.findOne({
        _id: postId,
        status: "active"
    });

    if (!post) {
        throw new Error("Post not found");
    }

    const page = Math.max(parseInt(query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query.limit) || 10, 1), 50);

    const skip = (page - 1) * limit;

    // Fetch top-level comments
    const filter = {
        post: postId,
        parentComment: null,
        status: "active"
    };

    // Count all comments and replies
    const totalComments = await Comment.countDocuments({
        post: postId,
        status: "active"
    });

    const comments = await Comment.find(filter)
        .populate("author", "fullName college profilePicture")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    // Fetch all replies belonging to this post
    const replies = await Comment.find({
        post: postId,
        parentComment: { $ne: null },
        status: "active"
    })
        .populate("author", "fullName college profilePicture")
        .sort({ createdAt: 1 })
        .lean();

    // Organize replies under their parent comments
    const commentMap = new Map();

    comments.forEach((comment) => {
        comment.replies = [];
        commentMap.set(comment._id.toString(), comment);
    });

    replies.forEach((reply) => {
        reply.replies = [];
        commentMap.set(reply._id.toString(), reply);
    });

    // Build the nested reply structure
    const rootComments = [];

    [...comments, ...replies].forEach((comment) => {

        if (comment.parentComment) {

            const parent = commentMap.get(
                comment.parentComment.toString()
            );

            if (parent) {
                parent.replies.push(comment);
            }

        } else {
            rootComments.push(comment);
        }
    });

    return {
        comments: rootComments,
        totalComments,
        currentPage: page,
        totalPages: Math.ceil(totalComments / limit)
    };
};


// Update a comment
const updateCommentService = async (commentId, userId, data) => {

    const comment = await Comment.findOne({
        _id: commentId,
        author: userId,
        status: "active"
    });

    if (!comment) {
        throw new Error("Comment not found or access denied");
    }

    comment.content = data.content;

    await comment.save();

    return comment;
};


// Delete a comment
const deleteCommentService = async (commentId, userId) => {

    // Find the comment and verify ownership
    const comment = await Comment.findOne({
        _id: commentId,
        author: userId,
        status: "active"
    });

    if (!comment) {
        throw new Error("Comment not found or access denied");
    }

    // Fetch all active comments belonging to the same post
    const allComments = await Comment.find({
        post: comment.post,
        status: "active"
    }).select("_id parentComment");

    // Group comments by their parent comment
    const childrenMap = new Map();

    allComments.forEach((item) => {

        if (item.parentComment) {
            const parentId = item.parentComment.toString();

            if (!childrenMap.has(parentId)) {
                childrenMap.set(parentId, []);
            }

            childrenMap.get(parentId).push(item._id.toString());
        }
    });

    // Collect the original comment and all its replies
    const commentIdsToDelete = [comment._id.toString()];

    for (let i = 0; i < commentIdsToDelete.length; i++) {

        const currentId = commentIdsToDelete[i];

        const children = childrenMap.get(currentId) || [];

        commentIdsToDelete.push(...children);
    }

    // Delete the comment and all its replies
    await Comment.deleteMany({
        _id: { $in: commentIdsToDelete },
        post: comment.post
    });

    // Update the post's comment count
    await Post.updateOne(
        { _id: comment.post },
        { $inc: { commentsCount: -commentIdsToDelete.length } }
    );

    return {
        deletedCount: commentIdsToDelete.length
    };
};


module.exports = {
    createCommentService,
    getCommentsService,
    updateCommentService,
    deleteCommentService
};
