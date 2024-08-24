const express = require("express");
const router = express.Router();
const uploads = require("../config/multerConfig");
const { userController, postController } = require("../controllers");
const { authenticateToken } = require('../middlewares/auth');

// User
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/current', authenticateToken, userController.current);
router.get('/users/:id', authenticateToken, userController.getUserById);
router.put('/users/:id', authenticateToken, userController.updatedUser);

// Post
router.post("/posts", authenticateToken, postController.createPost);
router.get("/posts", authenticateToken, postController.getAllPosts);
router.get("/posts/:id", authenticateToken, postController.getPostById);
router.delete("/posts/:id", authenticateToken, postController.deletePost);

module.exports = router;