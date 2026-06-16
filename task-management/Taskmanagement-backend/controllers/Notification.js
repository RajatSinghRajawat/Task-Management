const Notification = require("../models/Notification");
const Task = require("../models/task-Teachers");
const Submission = require("../models/Submission");
const StudentAuth = require("../models/studentsmodels");

// ==============================
// 📥 GET NOTIFICATIONS (Teacher/Generic)
// ==============================
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50);
        
        res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==============================
// 🎯 GET MY NOTIFICATIONS (For Student Portal)
// ==============================
const getMyNotifications = async (req, res) => {
    try {
        const studentId = req.user.id; // From student auth middleware

        const notifications = await Notification.find({ recipient: studentId })
            .sort({ createdAt: -1 })
            .limit(30);

        res.status(200).json({
            success: true,
            total: notifications.length,
            data: notifications
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==============================
// ✅ MARK AS READ
// ==============================
const markAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.id, isRead: false },
            { $set: { isRead: true } }
        );
        res.status(200).json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==============================
// 🗑️ DELETE ALL NOTIFICATIONS
// ==============================
const deleteAllNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({ recipient: req.user.id });
        res.status(200).json({ success: true, message: "Activity stream purged successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==============================
// 🤖 AUTO-CHECK OVERDUE TASKS
// ==============================
const checkOverdueTasks = async () => {
    try {
        const now = new Date();
        // Find all tasks where deadline has passed
        const overdueTasks = await Task.find({ Deadline: { $lt: now } });

        for (const task of overdueTasks) {
            // For each student assigned to this task
            for (const studentId of task.Assigned_To) {
                // Check if they have a submission
                const submission = await Submission.findOne({ taskId: task._id, studentId });
                
                if (!submission) {
                    const student = await StudentAuth.findById(studentId);
                    if (!student) continue;

                    const teacherId = task.uploadedBy || "69f1d788aac37f6f23be7e08";
                    const studentFullName = student.name;

                    // Check if notification already exists for this student + task
                    const existingNote = await Notification.findOne({
                        recipient: teacherId,
                        relatedId: task._id,
                        message: { $regex: studentFullName, $options: 'i' }
                    });

                    if (!existingNote) {
                        await Notification.create({
                            recipient: teacherId,
                            title: "🚨 Task Deadline Missed!",
                            message: `Student ${studentFullName} has NOT completed the task: "${task.Title}" before the deadline.`,
                            type: "Task_Overdue",
                            relatedId: task._id,
                            relatedModel: "Task"
                        });
                        console.log(`Notification sent for overdue task: ${task.Title} by student: ${studentFullName}`);
                    }
                }
            }
        }
    } catch (error) {
        console.error("Auto-check error:", error.message);
    }
};

module.exports = {
    getNotifications,
    getMyNotifications,
    markAsRead,
    deleteAllNotifications,
    checkOverdueTasks
};
