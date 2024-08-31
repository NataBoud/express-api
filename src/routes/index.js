const express = require("express");
const router = express.Router();
const uploads = require("../config/multerConfig");
const { 
    userController, 
    postController, 
    commentController, 
    likeController, 
    followController 
} = require("../controllers");
const { authenticateToken } = require('../middlewares/auth');

// User
router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/current", authenticateToken, userController.current);
router.get("/users/:id", authenticateToken, userController.getUserById);
router.put("/users/:id", authenticateToken, uploads.single('avatar'), userController.updateUser);

// Post
router.post("/posts", authenticateToken, postController.createPost);
router.get("/posts", authenticateToken, postController.getAllPosts);
router.get("/posts/:id", authenticateToken, postController.getPostById);
router.delete("/posts/:id", authenticateToken, postController.deletePost);

// Comments
router.post("/comments", authenticateToken, commentController.createComment);
router.delete("/comments/:id", authenticateToken, commentController.deleteComment);

// Like
router.post("/likes", authenticateToken, likeController.likePost);
router.delete("/likes/:id", authenticateToken, likeController.unlikePost);

// Follow
router.post("/follow", authenticateToken, followController.followUser);
router.delete("/unfollow/:id", authenticateToken, followController.unfollowUser);

module.exports = router;