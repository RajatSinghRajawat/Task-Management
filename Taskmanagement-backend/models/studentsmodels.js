const mongoose = require('mongoose');

const studentsAuth = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    courses: {
        type: String,
        required: true
    },
    batch: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["Active", "Inactive", "Suspended"],
        default: "Active"
    },
    profileImage: {
        type: String,
        default: ""
    },
    resume: {
        type: String,
        default: ""
    },
    mobile: {
        type: String,
        default: ""
    },
    location: {
        type: String,
        default: ""
    },
    resumeData: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model("StudentAuth", studentsAuth);