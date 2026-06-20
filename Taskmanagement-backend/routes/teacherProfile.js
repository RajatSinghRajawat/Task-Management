const express = require("express");
const router = express.Router();
const upload = require("../multer");
const authMiddleware = require("../middleware/authMiddleware");
const { 
    getProfile, 
    updateProfile,
    getAllTeachers,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    getTeacherById
} = require("../controllers/teacherController");

// Routes
router.get("/me", authMiddleware, getProfile);
router.put("/update", authMiddleware, upload.single("profileImage"), updateProfile);

// Admin CRUD operations for Teachers
router.get("/", authMiddleware, getAllTeachers);
router.post("/", authMiddleware, upload.single("profileImage"), createTeacher);
router.get("/:id", authMiddleware, getTeacherById);
router.put("/:id", authMiddleware, upload.single("profileImage"), updateTeacher);
router.delete("/:id", authMiddleware, deleteTeacher);

module.exports = router;
