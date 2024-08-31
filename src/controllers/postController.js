const Post = require("../models/Post");
const Like = require("../models/Like");
const Comment = require("../models/Comment");
const User = require("../models/User");
const { sendErrorResponse } = require("../utils/errors");

const postController = {
    createPost: async (req, res) => {
        const { content } = req.body;
        const authorId = req.user.userId;

        if (!content) {
            return sendErrorResponse(res, 400, "The content of the post is required!");
        }
        try {
            // Creation of a new Post instance
            const newPost = new Post({
                content,
                authorId,
            });
            // Save post to database
            const savedPost = await newPost.save();
            // Update the user's posts
            await User.findByIdAndUpdate(
                authorId,
                { $push: { posts: savedPost._id } },
                { new: true }
            );
            // Reply with created post
            res.status(201).json(savedPost);
        } catch (error) {
            console.error("Error during post creation:", error);
            return sendErrorResponse(res, 500, "Internal server error.");
        }
    },
    getAllPosts: async (req, res) => {
        const userId = req.user.userId;
        try {
            const posts = await Post.find()
                .populate({
                    path: 'authorId',
                    select: 'email name avatarUrl',
                })
                .populate('likes')
                .populate({
                    path: 'comments',
                    populate: {
                        path: 'userId',
                        select: 'email name avatarUrl',
                    }
                })
                .sort({ createdAt: -1 });

            const postsWithLikeInfo = posts.map(post => ({
                _id: post._id,
                content: post.content,
                likes: post.likes,
                comments: post.comments.map(comment => ({
                    _id: comment._id,
                    content: comment.content,
                    postId: comment.postId,
                    createdAt: comment.createdAt,
                    user: {
                        id: comment.userId._id,
                        email: comment.userId.email,
                        name: comment.userId.name,
                        avatarUrl: comment.userId.avatarUrl
                    },
                })),
                createdAt: post.createdAt,
                author: post.authorId, 
                likedByUser: post.likes.some(like => like.userId.toString() === userId.toString()) 
            }));

            res.json(postsWithLikeInfo);
        } catch (error) {
            console.error("Error retrieving posts:", error);
            return sendErrorResponse(res, 500, "Internal server error.");
        }
    },
    getPostById: async (req, res) => {
        const { id } = req.params;
        const userId = req.user.userId;

        try {
            const post = await Post.findById(id)
                .populate({
                    path: 'authorId',
                    select: 'email name avatarUrl',
                })
                .populate('likes')
                .populate({
                    path: 'comments',
                    populate: {
                        path: 'userId',
                        select: 'email name avatarUrl',
                    }
                });

            if (!post) {
                return sendErrorResponse(res, 404, "Post not found!");
            }
            const likedByUser = post.likes.some(like => like.userId.toString() === userId.toString());

            const postWithLikeInfo = {
                _id: post._id,
                content: post.content,
                likes: post.likes,
                comments: post.comments.map(comment => ({
                    _id: comment._id,
                    content: comment.content,
                    postId: comment.postId,
                    createdAt: comment.createdAt,
                    user: {
                        _id: comment.userId._id,
                        email: comment.userId.email,
                        name: comment.userId.name,
                        avatarUrl: comment.userId.avatarUrl
                    },
                })),
                createdAt: post.createdAt,
                author: post.authorId,
                likedByUser
            };

            res.json(postWithLikeInfo);
        } catch (error) {
            console.error("Error retrieving post:", error);
            return sendErrorResponse(res, 500, "Internal server error.");
        }
    },
    deletePost: async (req, res) => {
        const { id } = req.params;
        const userId = req.user.userId;

        try {
            // Check if the post exists
            const post = await Post.findById(id);
            if (!post) {
                return sendErrorResponse(res, 404, "Post not found!");
            }
            // Check that the user is the author of the post
            if (post.authorId.toString() !== userId.toString()) {
                return sendErrorResponse(res, 403, "No access!");
            }
            // Delete comments and likes associated with the post
            await Comment.deleteMany({ postId: id });
            await Like.deleteMany({ postId: id });
            // Delete the post
            await Post.findByIdAndDelete(id);
            // Remove post reference from User's posts list
            await User.findByIdAndUpdate(
                userId,
                { $pull: { posts: id } },
                { new: true }
            );
            res.json({ message: "Post deleted successfully!" });
        } catch (error) {
            console.error("Error deleting post:", error);
            return sendErrorResponse(res, 500, "Internal server error.");
        }
    }

};

module.exports = postController;
