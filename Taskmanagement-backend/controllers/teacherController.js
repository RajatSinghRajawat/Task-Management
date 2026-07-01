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

const getAllTeachers = async (req, res) => {
    try {
        const teachers = await User.find().select("-password").sort({ createdAt: -1 });
        res.status(200).json({ total: teachers.length, teachers });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createTeacher = async (req, res) => {
    try {
        const { name, email, password, designation, phone, subject, joinedDate, gender } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Required fields missing (name, email, password)" });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Teacher email already registered" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const teacher = new User({
            name,
            email,
            password: hashedPassword,
            designation: designation || "Trainer",
            phone: phone || "",
            subject: subject || "General",
            joinedDate: joinedDate || "",
            gender: gender || "Male",
            profileImage: req.file ? getUploadUrl(req.file.path) : ""
        });
        await teacher.save();
        res.status(201).json({ message: "Teacher enrolled successfully", teacher });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateTeacher = async (req, res) => {
    try {
        const { name, email, designation, phone, subject, joinedDate, gender, password } = req.body;
        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (designation) updateData.designation = designation;
        if (phone !== undefined) updateData.phone = phone;
        if (subject) updateData.subject = subject;
        if (joinedDate !== undefined) updateData.joinedDate = joinedDate;
        if (gender) updateData.gender = gender;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }
        if (req.file) {
            updateData.profileImage = getUploadUrl(req.file.path);
        }
        const teacher = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { returnDocument: "after" }
        ).select("-password");
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }
        res.status(200).json({ message: "Teacher updated successfully", teacher });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteTeacher = async (req, res) => {
    try {
        const teacher = await User.findByIdAndDelete(req.params.id);
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }
        res.status(200).json({ message: "Teacher deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTeacherById = async (req, res) => {
    try {
        const teacher = await User.findById(req.params.id).select("-password");
        if (!teacher) return res.status(404).json({ message: "Teacher not found" });
        
        // Fetch all tasks created by this teacher
        const Task = require("../models/task-Teachers");
        const tasks = await Task.find({ uploadedBy: teacher._id }).sort({ createdAt: -1 });
        
        res.status(200).json({ teacher, tasks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    getAllTeachers,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    getTeacherById
};
