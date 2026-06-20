const mongoose = require("mongoose");

const SubmissionSchema = new mongoose.Schema({
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StudentAuth",
        required: true
    },
    status: {
        type: String,
        enum: ["Submitted", "Pending", "Late", "Graded", "Updated"],
        default: "Pending"
    },
    files: [{
        type: String
    }],
    submissionDate: {
        type: Date
    },
    feedback: {
        type: String
    },
    marks: {
        type: Number
    },
    answers: [{
        questionId: String,
        questionText: String,
        answer: String
    }]
}, { timestamps: true });

module.exports = mongoose.model("Submission", SubmissionSchema);
