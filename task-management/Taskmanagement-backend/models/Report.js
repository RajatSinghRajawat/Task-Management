const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({

    // 👤 Student Link
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StudentAuth",
        required: true
    },

    // 🧾 Report Info
    reportTitle: {
        type: String,
        required: true
    },

    reportType: {
        type: String,
        enum: ["Weekly", "Monthly", "Custom"],
        default: "Monthly"
    },

    fromDate: {
        type: Date,
        required: true
    },

    toDate: {
        type: Date,
        required: true
    },


    // 📊 TEST PERFORMANCE
    tests: [{
        testName: String,
        marksObtained: Number,
        totalMarks: Number,
        date: Date
    }],

    totalTests: {
        type: Number,
        default: 0
    },

    averageTestMarks: {
        type: Number,
        default: 0
    },


    // 📋 TASK PERFORMANCE (AUTO या SAVE)
    totalTasks: {
        type: Number,
        default: 0
    },

    completedTasks: {
        type: Number,
        default: 0
    },

    pendingTasks: {
        type: Number,
        default: 0
    },

    lateSubmissions: {
        type: Number,
        default: 0
    },


    // 📅 ATTENDANCE
    totalClasses: {
        type: Number,
        default: 0
    },

    present: {
        type: Number,
        default: 0
    },

    absent: {
        type: Number,
        default: 0
    },

    attendancePercentage: {
        type: Number,
        default: 0
    },


    // 🎭 CONDUCT & ACTIVITIES (New for Premium Design)
    conduct: {
        attentiveness: { type: Number, default: 85 },
        punctuality: { type: Number, default: 85 },
        neatness: { type: Number, default: 85 },
        extracurriculars: { type: Number, default: 85 }
    },

    // ⭐ FINAL PERFORMANCE
    overallPerformance: {
        type: String,
        enum: ['Excellent', 'Good', 'Average', 'Needs Improvement', 'Critical'],
        default: "Average"
    },

    grade: {
        type: String
    },


    // 💬 Teacher Remarks
    remarks: {
        type: String
    },

    suggestions: {
        type: String
    },

    behavior: {
        type: String
    },


    // 📎 Attachments (PDF report etc.)
    attachments: [{
        type: String
    }],

    // 👨‍🏫 Created By (Teacher)
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }

}, { timestamps: true });

module.exports = mongoose.model("Report", ReportSchema);