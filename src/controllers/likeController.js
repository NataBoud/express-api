const Like = require("../models/Like");
const User = require("../models/User");
const Post = require("../models/Post");
const { sendErrorResponse } = require("../utils/errors");

const likeController = {
    likePost: async (req, res) => {
        const { postId } = req.body;
        const userId = req.user.userId;

        if (!postId) {
            return sendErrorResponse(res, 400, "All fields are required!");
        }

        try {
            // Check if the user has already liked the post
            const existingLike = await Like.findOne({ postId, userId });

            if (existingLike) {
                return res.status(400).json({ error: 'You have already liked this post' });
            }

            // Create a new like
            const newLike = new Like({ postId, userId });
            const savedLike = await newLike.save();

            // Update the post's likes count or add the like reference
            await Post.findByIdAndUpdate(
                postId,
                { $push: { likes: savedLike._id } },
                { new: true }
            );

            // Update the user's likes list
            await User.findByIdAndUpdate(
                userId,
                { $push: { likes: savedLike._id } },
                { new: true }
            );

            res.status(201).json(savedLike);
        } catch (error) {
            console.error('Error liking post:', error);
            return sendErrorResponse(res, 500, "Internal server error.");
        }
    },

    unlikePost: async (req, res) => {
        const { id } = req.params;
        const userId = req.user.userId;

        if (!id) {
            return sendErrorResponse(res, 400, "You have already disliked this post.");
        }

        try {
            // Check if the like exists
            const existingLike = await Like.findOne({ postId: id, userId });

            if (!existingLike) {
                return res.status(400).json({ error: 'You have already disliked this post.' });
            }

            // Remove the like
            await Like.findByIdAndDelete(existingLike._id);

            // Update the post's likes
            await Post.findByIdAndUpdate(
                id,
                { $pull: { likes: existingLike._id } },
                { new: true }
            );

            // Update the user's likes list
            await User.findByIdAndUpdate(
                userId,
                { $pull: { likes: existingLike._id } },
                { new: true }
            );

            res.json({ message: 'Like removed successfully' });
        } catch (error) {
            console.error('Error unliking post:', error);
            return sendErrorResponse(res, 500, "Internal server error.");
        }
    }
};

module.exports = likeController;
