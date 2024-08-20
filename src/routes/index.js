const express = require("express");
const router = express.Router();
const multer = require('multer');
const userController = require("../controllers");

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
router.get('/current', userController.current)
router.get('/users/:id', userController.getUserById)
router.put('/users/:id', userController.updatedUser)


module.exports = router;