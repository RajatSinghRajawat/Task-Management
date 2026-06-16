const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'recipientModel'
    },
    recipientModel: {
        type: String,
        required: true,
        enum: ["User", "StudentAuth"],
        default: "User"
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["Task_Assigned", "Task_Overdue", "Task_Submission", "System", "Announcement"],
        default: "System"
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId, // Can be Task ID, Student ID, etc.
        refPath: 'relatedModel'
    },
    relatedModel: {
        type: String,
        enum: ["Task", "Student", "Report"]
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model("Notification", NotificationSchema);
