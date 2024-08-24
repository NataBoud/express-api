const multer = require('multer');

const uploadDestination = 'uploads';

// show where to store the files
const storage = multer.diskStorage({
    destination: uploadDestination,
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const uploads = multer({ storage: storage });

module.exports = uploads;