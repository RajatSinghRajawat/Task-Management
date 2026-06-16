const express = require("express");
const router = express.Router();
const { getNotifications, getMyNotifications, markAsRead, deleteAllNotifications } = require("../controllers/Notification");
const auth = require("../middleware/authMiddleware");

router.get("/", auth, getNotifications);
router.get("/my-notifications", auth, getMyNotifications);
router.put("/mark-read", auth, markAsRead);
router.delete("/delete-all", auth, deleteAllNotifications);

module.exports = router;
