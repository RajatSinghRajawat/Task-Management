const mongoose = require("mongoose");
const Task = require("../models/task-Teachers");
const Student = require("../models/studentsmodels"); // Pointing to StudentAuth model
const path = require("path");

const getUploadUrl = (filePath) => {
  return `uploads/${encodeURIComponent(path.basename(filePath))}`;
};

// ==============================
// ✅ CREATE STUDENT (Now mostly redundant as students signup themselves)
// ==============================
const createStudent = async (req, res) => {
  try {
    const {
      fullName, // mapped to name
      email,
      password,
      course, // mapped to courses
      batch,
      status
    } = req.body;

    if (!fullName || !email || !password || !course || !batch) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const existing = await Student.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const student = new Student({
      name: fullName,
      email,
      password, // Note: Should be hashed if created manually, but we prefer signup
      courses: course,
      batch,
      status: status || "Active",
      profileImage: req.file ? getUploadUrl(req.file.path) : ""
    });

    await student.save();

    res.status(201).json({
      message: "Student enrolled successfully",
      student: { ...student._doc, fullName: student.name, course: student.courses }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ==============================
// ✅ GET ALL STUDENTS (FILTER)
// ==============================
const getAllStudents = async (req, res) => {
  try {
    const { course, status, search } = req.query;

    let filter = {};

    if (course && course !== 'All') filter.courses = course;
    if (status && status !== 'All') filter.status = status;
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const rawStudents = await Student.find(filter).sort({ createdAt: -1 });

    // Map fields for frontend compatibility
    const students = rawStudents.map(s => ({
      ...s._doc,
      fullName: s.name,
      course: s.courses
    }));

    res.status(200).json({
      total: students.length,
      students
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ==============================
// ✅ GET STUDENT BY ID
// ==============================
const getStudentById = async (req, res) => {
  try {
    const rawStudent = await Student.findById(req.params.id);

    if (!rawStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    const student = {
      ...rawStudent._doc,
      fullName: rawStudent.name,
      course: rawStudent.courses
    };

    const tasks = await Task.find({ 
      $or: [
        { Assigned_To: student._id },
        { course: student.course, Batch: student.batch }
      ]
    }).sort({ Deadline: -1 });

    const Submission = require("../models/Submission");
    const Notification = require("../models/Notification");

    // Fetch all submissions for this student
    const submissions = await Submission.find({ studentId: student._id });

    // Enhance tasks with submission status and check for missed deadlines
    const enhancedTasks = await Promise.all(tasks.map(async (task) => {
      const submission = submissions.find(s => s.taskId.toString() === task._id.toString());
      
      let status = "Pending";
      let submissionDate = null;

      if (submission) {
        status = submission.status; // Submitted, Late, Graded, etc.
        submissionDate = submission.submissionDate;
      } else if (new Date() > new Date(task.Deadline)) {
        status = "Missed";
        
        // 🔔 Optional: Create a notification for the teacher if it doesn't exist
        try {
          const existingNote = await Notification.findOne({
            recipient: task.uploadedBy,
            type: "Missed_Deadline",
            relatedId: task._id,
            message: { $regex: student.fullName }
          });

          if (!existingNote) {
            // Notify Teacher
            await Notification.create({
              recipient: task.uploadedBy,
              recipientModel: "User",
              title: "⚠️ Task Deadline Missed",
              message: `Student ${student.fullName} has missed the deadline for task: "${task.Title}".`,
              type: "Missed_Deadline",
              relatedId: task._id,
              relatedModel: "Task"
            });

            // Notify Student
            await Notification.create({
              recipient: student._id,
              recipientModel: "StudentAuth",
              title: "🚨 Task Deadline Missed!",
              message: `You missed the deadline for task: "${task.Title}". Please submit as soon as possible if late submissions are allowed.`,
              type: "Missed_Deadline",
              relatedId: task._id,
              relatedModel: "Task"
            });
          }
        } catch (e) {}
      }

      return {
        ...task._doc,
        submissionStatus: status,
        submissionDate
      };
    }));
    
    res.status(200).json({ ...student, tasks: enhancedTasks });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// 🎯 GET STUDENT ACTIVITY (For Contribution Graph)
// ==============================
const getStudentActivity = async (req, res) => {
  try {
    const studentId = req.params.id;
    const Student = require("../models/studentsmodels");
    const rawStudent = await Student.findById(studentId);

    if (!rawStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    const tasks = await Task.find({ 
      $or: [
        { Assigned_To: studentId },
        { course: rawStudent.courses, Batch: rawStudent.batch }
      ]
    });

    const Submission = require("../models/Submission");
    const submissions = await Submission.find({ studentId });

    // Create a map of dates to status
    const activity = [];

    tasks.forEach(task => {
      const submission = submissions.find(s => s.taskId.toString() === task._id.toString());
      const date = submission ? submission.submissionDate : task.Deadline;
      
      let status = "Pending";
      if (submission) {
        status = submission.status === "Late" ? "Late" : "Completed";
      } else if (new Date() > new Date(task.Deadline)) {
        status = "Missed";
      }

      activity.push({
        date: date ? new Date(date).toISOString().split('T')[0] : null,
        fullDate: date ? new Date(date).toDateString() : 'No Date',
        status,
        taskTitle: task.Title,
        taskId: task._id
      });
    });

    res.status(200).json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ==============================
// ✅ UPDATE STUDENT
// ==============================
const updateStudent = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.fullName) updateData.name = updateData.fullName;
    if (updateData.course) updateData.courses = updateData.course;
    if (req.file) updateData.profileImage = getUploadUrl(req.file.path);

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: "after" }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({
      message: "Student updated",
      student: { ...student._doc, fullName: student.name, course: student.courses }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ==============================
// ✅ DELETE STUDENT
// ==============================
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ==============================
// 🎯 GET STUDENT PROFILE (For Student Portal)
// ==============================
const getStudentProfile = async (req, res) => {
  try {
    const studentEmail = req.user.email;
    const rawStudent = await Student.findOne({ email: studentEmail });

    if (!rawStudent) {
      return res.status(200).json({ 
        success: false, 
        message: "Account found but profile details are missing.",
        noProfile: true
      });
    }

    const student = {
      ...rawStudent._doc,
      fullName: rawStudent.name,
      course: rawStudent.courses
    };

    const tasks = await Task.find({ 
      $or: [
        { Assigned_To: student._id },
        { course: student.course, Batch: student.batch }
      ]
    });
    
    res.status(200).json({
      success: true,
      student,
      tasks
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ==============================
// 🚀 EXPORT
// ==============================
module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  getStudentProfile,
  updateStudent,
  deleteStudent,
  getStudentActivity
};
