const User = require("../models/User");
const Follow = require("../models/Follow");
const { sendErrorResponse } = require("../utils/errors");

const followController = {
    followUser: async (req, res) => {
        const { followingId } = req.body;
        const userId = req.user.userId;

        // Check if the user is trying to follow themselves
        if (followingId === userId) {
            return sendErrorResponse(res, 400, "You cannot follow yourself.");
        }

        try {
            // Check if the follow relationship already exists
            const existingSubscription = await Follow.findOne({
                followerId: userId,
                followingId: followingId,
            });

            if (existingSubscription) {
                return sendErrorResponse(res, 400, "You are already following this user.");
            }

            // Find the user being followed
            const userToFollow = await User.findById(followingId);

            // Create the follow relationship
            const newFollow = new Follow({
                followerId: userId,
                followingId: followingId,
            });

            await newFollow.save();

            // Update the user's `followers` and `following`
            await User.findByIdAndUpdate(
                userId,
                { $push: { following: followingId } },
                { new: true }
            );
            await User.findByIdAndUpdate(
                followingId,
                { $push: { followers: userId } },
                { new: true }
            );

            res.status(201).json({ message: `You have successfully followed ${userToFollow.name}.` });
        } catch (error) {
            console.log('Error in followUser:', error);
            return sendErrorResponse(res, 500, "Server error occurred while trying to follow the user.");
        }
    },

    unfollowUser: async (req, res) => {
        const followingId = req.params.id; // Retrieves ID from URL parameters
        const userId = req.user.userId;

        try {
            // Find the follow relationship
            const follow = await Follow.findOne({
                followerId: userId,
                followingId: followingId,
            });

            if (!follow) {
                return sendErrorResponse(res, 404, "Follow relationship not found.");
            }

            // Find the user being unfollowed
            const userToUnfollow = await User.findById(followingId);

            // Remove the follow relationship
            await Follow.deleteOne({
                followerId: userId,
                followingId: followingId,
            });

            // Update the user's `followers` and `following`
            await User.findByIdAndUpdate(
                userId,
                { $pull: { following: followingId } },
                { new: true }
            );
            await User.findByIdAndUpdate(
                followingId,
                { $pull: { followers: userId } },
                { new: true }
            );

            res.status(200).json({ message: `You have successfully unfollowed ${userToUnfollow.name}.` });
        } catch (error) {
            console.log('Error in unfollowUser:', error);
            return sendErrorResponse(res, 500, "Server error occurred while trying to unfollow the user.");
        }
    }
};

module.exports = followController;
