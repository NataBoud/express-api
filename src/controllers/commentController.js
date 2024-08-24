const Comment = require("../models/Comment");
const User = require("../models/User");
const Post = require("../models/Post");
const { sendErrorResponse } = require("../utils/errors");

const commentController = {
    createComment: async (req, res) => {
        const { postId, content } = req.body;
        const userId = req.user.userId;

        if (!postId || !content) {
            return sendErrorResponse(res, 400, "All fields are required!");
        }
        try {
            // Create a new Comment instance
            const newComment = new Comment({
                postId,
                userId,
                content
            });
            // Save the comment to the database
            const savedComment = await newComment.save();

            // Update the post to add the comment
            await Post.findByIdAndUpdate(
                postId,
                { $push: { comments: savedComment._id } },
                { new: true }
            );
            // Update the user's comment list if necessary
            await User.findByIdAndUpdate(
                userId,
                { $push: { comments: savedComment._id } },
                { new: true }
            );
            res.status(201).json(savedComment);
        } catch (error) {
            console.error('Error creating comment:', error);
            return sendErrorResponse(res, 500, "Internal server error.");
        }
    },

    deleteComment: async (req, res) => {
        const { id } = req.params;
        const userId = req.user.userId;

        try {
            // Check if the comment exists
            const comment = await Comment.findById(id);

            if (!comment) {
                return sendErrorResponse(res, 404, "Comment not found.");
            }
            // Check if the user is the owner of the comment
            if (comment.userId.toString() !== userId) {
                return sendErrorResponse(res, 403, "You are not authorized to delete this comment!");
            }
            // Delete the comment
            await Comment.findByIdAndDelete(id);
            // Remove comment reference from User's comments list
            await User.findByIdAndUpdate(
                userId,
                { $pull: { comments: id } },
                { new: true }
            );
            // Remove comment reference from Post's comments list
            await Post.findByIdAndUpdate(
                comment.postId,
                { $pull: { comments: id } },
                { new: true }
            );
            res.json({ message: 'Comment deleted successfully', comment });
        } catch (error) {
            console.error('Error deleting comment:', error);
            return sendErrorResponse(res, 500, "Failed to delete comment.");
        }
    }

};


module.exports = commentController