const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({

    // 👤 Basic Info
    fullName: {
        type: String,
        required: true,
        trim: true
    },

    studentId: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },

    email: {
        type: String,
        lowercase: true,
        trim: true
    },

    phone: {
        type: String
    },

    profileImage: {
        type: String,
        default: ""
    },

    resume: {
        type: String,
        default: ""
    },

    gender: {
        type: String,
        enum: ["Male", "Female", "Other"]
    },

    dateOfBirth: Date,


    // 🏫 Academic Info
    className: {
        type: String,
        required: true
    },

    section: {
        type: String,
        required: true
    },

    course: {
        type: String,
        required: true
    },

    academicYear: {
        type: String
    },
    batch: {
        type: String,
        required: true
    },

    enrollmentDate: {
        type: Date,
        default: Date.now
    },


    // 📊 Performance (AUTO CALCULATED - manual मत छेड़)
    totalTasksAssigned: { type: Number, default: 0 },
    tasksCompleted: { type: Number, default: 0 },
    pendingTasks: { type: Number, default: 0 },
    lateSubmissions: { type: Number, default: 0 },
    averageMarks: { type: Number, default: 0 },


    // 📅 Attendance
    totalClasses: { type: Number, default: 0 },
    present: { type: Number, default: 0 },
    absent: { type: Number, default: 0 },


    // ⚠️ Extra
    remarks: String,
    warnings: String,
    parentContact: String,


    // 🟢 Status
    status: {
        type: String,
        enum: ["Active", "Inactive", "Suspended"],
        default: "Active"
    },


    // 🔗 Relation (IMPORTANT)
    assignedTasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task"
    }]

}, { timestamps: true });


// ==============================
// 🔥 AUTO CALCULATE METHOD
// ==============================

StudentSchema.methods.updateTaskStats = async function (tasks) {
    this.totalTasksAssigned = tasks.length;

    this.tasksCompleted = tasks.filter(t => t.Status === "Completed").length;

    this.pendingTasks = tasks.filter(t => t.Status === "Pending").length;

    this.lateSubmissions = tasks.filter(t => t.Status === "Overdue").length;

    const marksArr = tasks
        .map(t => Number(t.marks || 0))
        .filter(m => m > 0);

    this.averageMarks = marksArr.length
        ? marksArr.reduce((a, b) => a + b, 0) / marksArr.length
        : 0;

    await this.save();
};


module.exports = mongoose.model("Student", StudentSchema);