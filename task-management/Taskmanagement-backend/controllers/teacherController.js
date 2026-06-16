const User = require("../models/User");
const bcrypt = require("bcryptjs");
const path = require("path");

const getUploadUrl = (filePath) => {
    return `uploads/${encodeURIComponent(path.basename(filePath))}`;
};

// ── GET TEACHER PROFILE ───────────────────────────────────────────
const getProfile = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Invalid session" });
        }
        const user = await User.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({ message: "Internal Server Error during profile fetch" });
    }
};

// ── UPDATE TEACHER PROFILE ────────────────────────────────────────
const updateProfile = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized access" });
        }

        const { name, email, designation, phone, subject, joinedDate, gender, password } = req.body;
        
        console.log("Updating Profile for User ID:", req.user.id);

        // 📝 Basic Fields
        const updateData = {};
        if (name && name.trim() !== "") updateData.name = name;
        if (email && email.trim() !== "") updateData.email = email;
        if (designation !== undefined) updateData.designation = designation;
        if (phone !== undefined) updateData.phone = phone;
        if (subject !== undefined) updateData.subject = subject;
        if (joinedDate !== undefined) updateData.joinedDate = joinedDate;
        if (gender !== undefined) updateData.gender = gender;

        // 🔐 Password Update Logic
        if (password && password.trim() !== "") {
            try {
                const salt = await bcrypt.genSalt(10);
                updateData.password = await bcrypt.hash(password, salt);
                console.log("Password hash generated successfully");
            } catch (bcryptErr) {
                console.error("Bcrypt Error:", bcryptErr);
                return res.status(500).json({ message: "Security update fault" });
            }
        }

        // 🖼️ Profile Image Logic
        if (req.file) {
            updateData.profileImage = getUploadUrl(req.file.path);
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateData },
            { returnDocument: "after", runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ message: "Profile mismatch: User not found" });
        }

        res.status(200).json({ message: "Profile synchronized successfully", user });
    } catch (error) {
        console.error("Update Profile Error:", error);
        if (error.code === 11000) {
            return res.status(400).json({ message: "System Error: Email identity already assigned" });
        }
        res.status(500).json({ message: error.message || "Internal Server Error during identity update" });
    }
};

module.exports = {
    getProfile,
    updateProfile
};
