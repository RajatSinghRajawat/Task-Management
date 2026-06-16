const express = require("express");
const router = express.Router();
const upload = require("../multer");

const {
  createStudent,
  getAllStudents,
  getStudentById,
  getStudentProfile,
  updateStudent,
  deleteStudent,
  getStudentActivity
} = require("../controllers/student");

const {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword
} = require("../controllers/studentsauth");

const authMiddleware = require("../middleware/authMiddleware");

// 🔐 Authentication
router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);
router.get("/me", authMiddleware, getStudentProfile);
router.put("/update-profile", authMiddleware, upload.fields([{ name: "profileImage", maxCount: 1 }, { name: "resume", maxCount: 1 }]), updateProfile);
router.put("/change-password", authMiddleware, changePassword);

// 📝 CRUD Operations (Teacher Managed)
router.post("/", upload.single("profileImage"), createStudent);
router.get("/", getAllStudents);
router.get("/:id", getStudentById);
router.get("/:id/activity", getStudentActivity);
router.put("/:id", upload.single("profileImage"), updateStudent);
router.delete("/:id", deleteStudent);

module.exports = router;