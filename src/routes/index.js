const express = require("express");
const router = express.Router();
const multer = require('multer');
const userController = require("../controllers");
const { authenticateToken } = require('../middlewares/auth');

const uploadDestination = 'uploads'

// show where to store the files
const storage = multer.diskStorage({
    destination: uploadDestination,
    filename: function(req, file, cb) {
        cb(null, file.originalname)
    }
})

const uploads = multer({ storage: storage })

router.post('/register', userController.register)
router.post('/login', userController.login)
router.get('/current',authenticateToken, userController.current)
router.get('/users/:id',authenticateToken, userController.getUserById)
router.put('/users/:id',authenticateToken, userController.updatedUser)


module.exports = router;