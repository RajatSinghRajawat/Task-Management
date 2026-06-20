// controllers/authController.js

const Student = require("../models/studentsmodels");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");

const getUploadUrl = (filePath) => {
    return `uploads/${encodeURIComponent(path.basename(filePath))}`;
};

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

// REGISTER
const register = async (req, res) => {
    try {
        const { name, email, password, courses, batch } = req.body;

        if (!name || !email || !password || !courses || !batch) {
            return res.status(400).json({ message: "All fields required" });
        }

        const existingUser = await Student.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await Student.create({
            name,
            email,
            password: hashedPassword,
            courses,
            batch
        });

        const token = generateToken(user);

        res.status(201).json({
            message: "User registered",
            token,
            user
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
};


// LOGIN
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await Student.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = generateToken(user);

        res.status(200).json({
            message: "Login successful",
            token,
            user
        });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// GET PROFILE
const getProfile = async (req, res) => {
    try {
        const user = await Student.findById(req.user.id).select("-password");
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// UPDATE PROFILE
const updateProfile = async (req, res) => {
    try {
        const { name, mobile, location, resumeData } = req.body;
        const studentId = req.user.id;

        const updateData = {};
        if (name) updateData.name = name;
        if (mobile) updateData.mobile = mobile;
        if (location) updateData.location = location;
        if (resumeData) {
            // Handle if resumeData is sent as a string (from FormData)
            updateData.resumeData = typeof resumeData === 'string' ? JSON.parse(resumeData) : resumeData;
        }
        
        if (req.files) {
            if (req.files.profileImage) {
                updateData.profileImage = getUploadUrl(req.files.profileImage[0].path);
            }
            if (req.files.resume) {
                updateData.resume = getUploadUrl(req.files.resume[0].path);
            }
        }

        const updatedUser = await Student.findByIdAndUpdate(
            studentId,
            { $set: updateData },
            { returnDocument: "after" }
        ).select("-password");

        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        });
    } catch (error) {
        console.error("UPDATE PROFILE ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// CHANGE PASSWORD
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const studentId = req.user.id;

        const user = await Student.findById(studentId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password incorrect" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("CHANGE PASSWORD ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword
};
