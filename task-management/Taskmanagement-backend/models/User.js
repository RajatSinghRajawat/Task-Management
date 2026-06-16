const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
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
    profileImage: {
        type: String,
        default: ""
    },
    designation: {
        type: String,
        default: "Professor"
    },
    phone: {
        type: String,
        default: ""
    },
    subject: {
        type: String,
        default: "General"
    },
    joinedDate: {
        type: String,
        default: ""
    },
    gender: {
        type: String,
        enum: ["Male", "Female"],
        default: "Male"
    }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);