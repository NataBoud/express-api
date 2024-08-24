const bcrypt = require('bcryptjs');
const jdenticon = require('jdenticon');
const path = require('path');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const User = require('../models/User');
const Follows = require('../models/Follows');
const { sendErrorResponse } = require('../utils/errors');
const secretKey = process.env.SECRET_KEY;

const userController = {
    register: async (req, res) => {
        const { email, password, name } = req.body;
        console.log('Received registration request:', { email, password, name });

        if (!email || !password || !name) {
            return sendErrorResponse(res, 400, "All fields are required!");
        }

        try {
            const existingUser = await User.findOne({ email });
            console.log('Existing user check:', existingUser);

            if (existingUser) {
                return sendErrorResponse(res, 400, "The user already exists!");
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            console.log('Password hashed:', hashedPassword);

            const png = jdenticon.toPng(name, 200);
            const avatarName = `${name}_${Date.now()}.png`;
            const avatarPath = path.join(__dirname, '../../uploads', avatarName);
            fs.writeFileSync(avatarPath, png);
            console.log('Avatar created at:', avatarPath);

            const user = new User({
                email,
                password: hashedPassword,
                name,
                avatarUrl: `/uploads/${avatarName}`
            });

            await user.save();
            console.log('User saved:', user);

            return res.status(201).json(user);
        } catch (error) {
            console.error("Error during registration:", error);
            return sendErrorResponse(res, 500, error.message);
        }
    },
    login: async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return sendErrorResponse(res, 400, "All fields are required!");
        }

        try {
            // search user in db
            const user = await User.findOne({ email });
            if (!user) {
                return sendErrorResponse(res, 400, "Incorrect login or password.")
            }
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                return sendErrorResponse(res, 401, "Incorrect login or password.")
            }
            const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: "360000s"});
            res.status(200).json({ token });
        } catch (error) {
            console.error("Login error during registration:", error);
            return sendErrorResponse(res, 500, "Internal server error.");
        }
    },
    getUserById: async (req, res) => {
        const { id } = req.params;
        const userId = req.user.userId; 

        try {
            // User search by ID and population of followers and following fields
            const user = await User.findById(id)
                .populate('followers')
                .populate('following');

            if (!user) {
                return sendErrorResponse(res, 404, "User not found.");
            }
            // Checks whether the current user follows the requested user
            const isFollowing = await Follows.findOne({
                followerId: userId,
                followingId: id
            });
            res.json({ ...user.toObject(), isFollowing: Boolean(isFollowing) });
        } catch (error) {
            console.error("Error retrieving user by ID :", error);
            return sendErrorResponse(res, 500, "Internal server error.");
        }
    },
    updatedUser: async (req, res) => {
        const { id } = req.params;
        const { email, name, dateOfBirth, bio, location } = req.body;
        const filePath = req.file?.path;
        // let filePath = req.file && req.file.path ? req.file.path : undefined;  
        if (id !== req.user.userId) {
            return sendErrorResponse(res, 403, "No access !");
        }
        try {
            if (email) {
                const existingUser = await User.findOne({ email });
                if (existingUser && existingUser._id.toString() !== id) {
                    return sendErrorResponse(res, 400, "Email is already in use.")
                }
            }
            const updatedUser = await User.findByIdAndUpdate(
                id,
                {
                    email: email || undefined,
                    name: name || undefined,
                    avatarUrl: filePath ? `/${filePath}` : undefined,
                    dateOfBirth: dateOfBirth || undefined,
                    bio: bio || undefined,
                    location: location || undefined,
                },
                { new: true } // Returns the updated document
            );
            if (!updatedUser) {
                return sendErrorResponse(res, 404, "User not found.");
            }
            res.json(updatedUser);
        } catch (error) {
            console.error("Update user error:", error);
            return sendErrorResponse(res, 500, "Internal server error.");
        }
    },
    current: async (req, res) => {
        try {
            // Retrieves the logged-in user using the ID stored in the JWT token
            const user = await User.findById(req.user.userId)
                .populate('followers')
                .populate('following');

            if (!user) {
                return sendErrorResponse(res, 404, "User not found.");
            }
            return res.status(200).json(user);
        } catch (error) {
            console.error("Error retrieving current user:", error);
            return sendErrorResponse(res, 500, "Internal server error.");
        }
    }
};

module.exports = userController;
