const routes = require("express").Router();
const {
    createTask,
    getTasks,
    getTasksByCourse,
    getSingleTask,
    getTaskSubmissionStats,
    updateTask,
    deleteTask
} = require("../controllers/task-Teachers");
const { submitTask, getMySubmission } = require("../controllers/submissionController");

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../multer");

// 🟢 Specific Routes First
routes.get("/tasks-by-course", authMiddleware, getTasksByCourse);

routes.post("/create", authMiddleware, upload.array("Attachments"), createTask);

routes.get("/", authMiddleware, getTasks);

routes.get("/:id", authMiddleware, getSingleTask);
routes.get("/:id/submission-stats", authMiddleware, getTaskSubmissionStats);

// ✅ Added upload.array("Attachments") for updates too
routes.put("/:id", authMiddleware, upload.array("Attachments"), updateTask);

routes.delete("/:id", authMiddleware, deleteTask);

// 📤 Student Submission
routes.post("/submit", authMiddleware, upload.array("files"), submitTask);
routes.get("/my-submission/:taskId", authMiddleware, getMySubmission);

module.exports = routes;