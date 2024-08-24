const Post = require("../models/Post");
const Like = require("../models/Like");
const Comment = require("../models/Comment");
const User = require("../models/User");
const { sendErrorResponse } = require("../utils/errors");

const postController = {
    createPost: async (req, res) => {
        const { content } = req.body;
        const authorId = req.user.userId;
        // Check if the post content is present
        if (!content) {
            return sendErrorResponse(res,400,"The content of the post is required!");
        }
        try {
            // Creation of a new Post instance
            const newPost = new Post({
                content,
                authorId,
            });
            // Save post to database
            await newPost.save();
            res.status(201).json(newPost);
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
                    select: 'email name avatarUrl dateOfBirth bio location createdAt updatedAt',
                })
                .populate('likes')
                .populate('comments')
                .sort({ createdAt: -1 });

            const postsWithLikeInfo = posts.map(post => ({
                _id: post._id,
                content: post.content,
                likes: post.likes,
                comments: post.comments,
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
                    select: "email name avatarUrl dateOfBirth bio location createdAt updatedAt",
                })
                .populate('likes')
                .populate('comments');

            if (!post) {
                return sendErrorResponse(res, 404, "Post not found!");
            }
            const postWithLikeInfo = {
                _id: post._id,
                content: post.content,
                likes: post.likes,
                comments: post.comments,
                createdAt: post.createdAt,
                author: post.authorId,
                likedByUser: post.likes.some(like => like.userId.toString() === userId.toString()) 
            };
            res.json(postWithLikeInfo);
        } catch (error) {
            console.error("Error retrieving post:", error);
            return sendErrorResponse(res, 500, "Internal server error.");
        }
    },
    deletePost: async (req, res) => {
        const { id } = req.params;
        try {
            // Check if the post exists
            const post = await Post.findById(id);
            if (!post) {
                return sendErrorResponse(res, 404, "Post not found!");
            }
            // Check that the user is the author of the post
            if (post.authorId.toString() !== req.user.userId.toString()) {
                return sendErrorResponse(res, 403, "No access!");
            }
            // Delete comments and likes, then the post
            await Comment.deleteMany({ postId: id });
            await Like.deleteMany({ postId: id });
            await Post.findByIdAndDelete(id);

            res.json({ message: "Post deleted successfully!" });
        } catch (error) {
            console.error("Error deleting post:", error);
            return sendErrorResponse(res, 500, "Internal server error.");
        }
    }

};

module.exports = postController;
