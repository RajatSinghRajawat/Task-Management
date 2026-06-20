const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
const uploadDir = "public/Uploads";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Remove spaces from filenames to avoid URL issues
        const cleanName = file.originalname.replace(/\s+/g, "_");
        cb(null, Date.now() + "_" + cleanName);
    },
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /avif|jpeg|jpg|png|gif|webp|svg|mp4|webm|dat|xlsx|xls|csv|pdf|zip/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            return cb(new Error("invalid file type"), false);
        }
    },
});

module.exports = upload;