const mongoose = require("mongoose");
const Submission = require("../models/Submission");
const Task = require("../models/task-Teachers");

const submitTask = async (req, res) => {
    try {
        const { taskId, comments, answers } = req.body;
        const studentId = req.user.id; // From authMiddleware

        if (!taskId) {
            return res.status(400).json({ message: "Task ID is required" });
        }

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        const isLate = new Date() > new Date(task.Deadline);
        const files = req.files ? req.files.map(file => file.path) : [];

        // Parse answers if they come as a string
        const parsedAnswers = typeof answers === 'string' ? JSON.parse(answers) : answers;

        let submission = await Submission.findOne({ taskId, studentId });

        if (submission) {
            // Update existing submission
            submission.files = files.length > 0 ? files : submission.files;
            submission.feedback = comments || submission.feedback;
            submission.answers = parsedAnswers || submission.answers;
            submission.submissionDate = new Date();
            submission.status = isLate ? "Late" : "Updated";
            await submission.save();
        } else {
            // Create new submission
            submission = new Submission({
                taskId,
                studentId,
                status: isLate ? "Late" : "Submitted",
                files,
                feedback: comments,
                answers: parsedAnswers,
                submissionDate: new Date()
            });
            await submission.save();
        }

        // 🔔 Notify the Teacher
        try {
            const Notification = require("../models/Notification");
            const StudentAuth = require("../models/studentsmodels");
            const student = await StudentAuth.findById(studentId);
            
            let title = "📝 New Task Submission";
            let message = `Student ${student?.fullName || "A student"} has submitted the task: "${task.Title}".`;

            if (isLate) {
                title = "⏰ Late Task Submission";
                message = `Student ${student?.fullName || "A student"} has submitted the task: "${task.Title}" AFTER the deadline.`;
            } else if (submission.status === "Updated") {
                title = "🔄 Task Submission Updated";
                message = `Student ${student?.fullName || "A student"} has updated their submission for: "${task.Title}".`;
            }

            await Notification.create({
                recipient: task.uploadedBy,
                recipientModel: "User",
                title,
                message,
                type: isLate ? "Late_Submission" : "Task_Submitted",
                relatedId: task._id,
                relatedModel: "Task"
            });
        } catch (noteError) {
            console.error("Failed to notify teacher:", noteError.message);
        }

        res.status(201).json({ message: `Task ${submission.status === "Updated" ? "Updated" : "Submitted"} Successfully`, submission });
    } catch (error) {
        console.error("SUBMIT TASK ERROR:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

const getSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({ taskId: req.params.taskId }).populate("studentId", "fullName email");
        res.status(200).json(submissions);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

const getMySubmission = async (req, res) => {
    try {
        const studentId = req.user.id;
        const taskId = req.params.taskId;

        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({ message: "Invalid Task ID" });
        }

        const submission = await Submission.findOne({ taskId, studentId });
        if (!submission) {
            return res.status(404).json({ message: "No submission found" });
        }
        res.status(200).json(submission);
    } catch (error) {
        console.error("GET MY SUBMISSION ERROR:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

const gradeSubmission = async (req, res) => {
    try {
        const { marks, feedback } = req.body;
        const { id } = req.params; // Submission ID

        const submission = await Submission.findById(id);
        if (!submission) {
            return res.status(404).json({ message: "Submission not found" });
        }

        submission.marks = marks;
        submission.feedback = feedback;
        submission.status = "Graded";
        await submission.save();

        // Notify student about graded submission
        try {
            const Notification = require("../models/Notification");
            const Task = require("../models/task-Teachers");
            const task = await Task.findById(submission.taskId);
            
            await Notification.create({
                recipient: submission.studentId,
                recipientModel: "StudentAuth",
                title: "🎯 Submission Graded",
                message: `Your submission for task "${task?.Title || 'assignment'}" has been graded. Marks: ${marks}`,
                type: "Submission_Graded",
                relatedId: submission.taskId,
                relatedModel: "Task"
            });
        } catch (noteErr) {
            console.error("Failed to notify student of grade:", noteErr.message);
        }

        res.status(200).json({ message: "Submission graded successfully", submission });
    } catch (error) {
        console.error("GRADE SUBMISSION ERROR:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    submitTask,
    getSubmissions,
    getMySubmission,
    gradeSubmission
};
