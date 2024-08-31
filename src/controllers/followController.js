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

            // Create the follow relationship
            const newFollow = new Follow({
                followerId: userId,
                followingId: followingId,
            });

            await newFollow.save();

            // Update the user's `followers` and `following`
            const userUpdateResult = await User.findByIdAndUpdate(
                userId,
                { $addToSet: { following: followingId } }, // $addToSet pour éviter les doublons
                { new: true }
            );

            const followedUserUpdateResult = await User.findByIdAndUpdate(
                followingId,
                { $addToSet: { followers: userId } }, // $addToSet pour éviter les doublons
                { new: true }
            );

            if (!userUpdateResult || !followedUserUpdateResult) {
                return sendErrorResponse(res, 500, "Error updating user follow data.");
            }

            res.status(201).json({ message: `You have successfully followed ${followedUserUpdateResult.name}.` });
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

            // Remove the follow relationship
            await Follow.deleteOne({
                followerId: userId,
                followingId: followingId,
            });

            // Update the user's `followers` and `following`
            const userUpdateResult = await User.findByIdAndUpdate(
                userId,
                { $pull: { following: followingId } },
                { new: true }
            );

            const unfollowedUserUpdateResult = await User.findByIdAndUpdate(
                followingId,
                { $pull: { followers: userId } },
                { new: true }
            );

            if (!userUpdateResult || !unfollowedUserUpdateResult) {
                return sendErrorResponse(res, 500, "Error updating user unfollow data.");
            }

            res.status(200).json({ message: `You have successfully unfollowed ${unfollowedUserUpdateResult.name}.` });
        } catch (error) {
            console.log('Error in unfollowUser:', error);
            return sendErrorResponse(res, 500, "Server error occurred while trying to unfollow the user.");
        }
    }
};



module.exports = followController;
