const express = require("express");
const router = express.Router();
const upload = require("../multer");
const authMiddleware = require("../middleware/authMiddleware");
const { getProfile, updateProfile } = require("../controllers/teacherController");

// Routes
router.get("/me", authMiddleware, getProfile);
router.put("/update", authMiddleware, upload.single("profileImage"), updateProfile);

module.exports = router;
