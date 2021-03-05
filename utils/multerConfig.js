const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, res, callback) => {
        callback(null, 'public/uploads');
    },
    filename: (req, file, callback) => {
        callback(
            null,
            `${Date.now().toString()}-${req.user.username}${path
                .extname(file.originalname)
                .toLowerCase()}`
        );
    },
});

module.exports = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5,
    },
    fileFilter: (req, file, callback) => {
        const types = /jpeg|jpg|png|gif/;
        const extensionName = types.test(
            path.extname(file.originalname).toLowerCase()
        );
        const mimeType = types.test(file.mimetype);

        if (extensionName && mimeType) {
            callback(null, true);
        } else {
            callback(new Error('Only support images'));
        }
    },
});
