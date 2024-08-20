const bcrypt = require('bcryptjs');
const jdenticon = require('jdenticon');
const path = require('path');
const fs = require('fs');
const User = require('../models/User')

const userController = {
    register: async (req, res) => {
        const { email, password, name } = req.body;
        console.log('Received registration request:', { email, password, name });

        if (!email || !password || !name) {
            return res.status(400).json({ error: "All fields are required!" });
        }

        try {
            const existingUser = await User.findOne({ email });
            console.log('Existing user check:', existingUser);

            if (existingUser) {
                return res.status(400).json({ error: "The user already exists!" });
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
            return res.status(500).json({ error: error.message });
        }
    },
    login: async (req, res) => {
        res.send('login');
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
