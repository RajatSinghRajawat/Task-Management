// routes/authRoutes.js

const express = require("express");
const router = express.Router();

const {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword
} = require("../controllers/studentsauth");

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../multer");

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);
router.put("/update-profile", authMiddleware, upload.single("profileImage"), updateProfile);
router.put("/change-password", authMiddleware, changePassword);

module.exports = router;