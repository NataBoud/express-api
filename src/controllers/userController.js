const bcrypt = require('bcryptjs');
const jdenticon = require('jdenticon');
const path = require('path');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const User = require('../models/User');
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
            const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: "1800s"});
            res.status(200).json({ token });
        } catch (error) {
            console.error("Login error during registration:", error);
            return sendErrorResponse(res, 500, "Internal server error.");
        }
    },
    getUserById: async (req, res) => {
        res.send('getUserById');
    },
    updatedUser: async (req, res) => {
        res.send('updatedUser');
    },
    current: async (req, res) => {
        res.send('current');
    },
};

module.exports = userController;
