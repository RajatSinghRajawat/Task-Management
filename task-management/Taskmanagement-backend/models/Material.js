const mongoose = require("mongoose");

const MaterialSchema = new mongoose.Schema({

    // 📝 Basic Info
    title: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String
    },

    // 📚 Academic Target
    course: [{
        type: String,
        required: true
    }],

    batch: {
        type: String,
        required: false
    },

    className: {
        type: String,
        required: false
    },

    section: {
        type: String
    },

    subject: {
        type: String
    },

    // 📦 Material Type
    type: {
        type: String,
        enum: ["PDF", "Video", "Link", "Image", "Document"],
        required: true
    },

    // 📎 Files (multer uploads)
    files: [{
        type: String
    }],

    // 🔗 External Links
    links: [{
        type: String
    }],

    // 👨‍🏫 Uploaded By
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // 👁 Visibility
    visibility: {
        type: String,
        enum: ["Public", "Private"],
        default: "Public"
    },

    // 📊 Tracking
    views: {
        type: Number,
        default: 0
    },

    downloads: {
        type: Number,
        default: 0
    },

    // ⭐ Optional
    tags: [{
        type: String
    }],

    // 📅 Date
    uploadDate: {
        type: Date,
        default: Date.now
    }

}, { timestamps: true });

module.exports = mongoose.model("Material", MaterialSchema);