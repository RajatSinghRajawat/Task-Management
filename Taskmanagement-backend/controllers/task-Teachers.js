const mongoose = require('mongoose');
const path = require('path');
const Task = require('../models/task-Teachers');
const Student = require('../models/student');
const StudentAuth = require('../models/studentsmodels');
const Submission = require('../models/Submission');
const Notification = require('../models/Notification');
const sendEmail = require('../common/emailsander');

const createTask = async (req, res) => {
    try {
        const {
            Title,
            Description,
            course,
            Task_Type,
            Priority,
            Assigned_To,
            Deadline,
            Batch
        } = req.body;

        if (!Title || !course || !Task_Type || !Deadline || !Batch) {
            return res.status(400).json({ message: "Required fields missing" });
        }

        // 👇 Get students
        let students;
        if (Assigned_To && Assigned_To.length > 0) {
            students = await StudentAuth.find({ _id: { $in: Assigned_To } });
        } else {
            students = await StudentAuth.find({ courses: course, batch: Batch });
        }

        // 👇 Create Task
        const task = await Task.create({
            Title,
            Description,
            course,
            Task_Type,
            Priority,
            Deadline,
            Batch,
            Assigned_To: students.map(s => s._id),
            uploadedBy: req.user.id,
            Attachments: req.files ? req.files.map(file => file.path) : []
        });

        await Promise.all(students.map(s =>
            Notification.create({
                recipient: s._id,
                title: "New Task Assigned",
                message: `${Title} task assigned`,
                relatedId: task._id
            })
        ));

        // ======================
        // 📧 Email Send (TEXT + HTML UI)
        // ======================
        const emails = students.map(s => s.email).filter(Boolean);

        if (emails.length > 0) {

            // 🔹 Plain Text (fallback)
            const message = `
New Task Assigned

Title: ${Title}
Course: ${course}
Batch: ${Batch}
Type: ${Task_Type}
Deadline: ${new Date(Deadline).toLocaleString()}
Description: ${Description || "No description"}
            `;

            // 🔥 PROFESSIONAL HTML UI
            const html = `
<div style="background:#eef2ff;padding:40px 0;font-family:'Segoe UI',sans-serif;">
  
  <div style="max-width:650px;margin:auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.1);">

    <!-- TOP STRIP -->
    <div style="background:linear-gradient(135deg,#6366f1,#4f46e5);padding:30px;text-align:center;color:#fff;">
      <h1 style="margin:0;font-size:26px;">🚀 New Task Assigned</h1>
      <p style="margin-top:8px;font-size:14px;opacity:0.9;">
        Stay focused. Complete your task on time.
      </p>
    </div>

    <!-- CONTENT -->
    <div style="padding:30px;">
      
      <!-- TITLE -->
      <h2 style="margin:0 0 10px;color:#111;font-size:22px;">
        ${Title}
      </h2>

      <!-- DESC -->
      <p style="color:#6b7280;font-size:14px;line-height:1.6;">
        ${Description || "No description provided"}
      </p>

      <!-- INFO CARDS -->
      <div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap;">
        
        <div style="flex:1;min-width:120px;background:#f1f5f9;padding:12px;border-radius:10px;">
          <p style="margin:0;font-size:12px;color:#888;">Course</p>
          <strong>${course}</strong>
        </div>

        <div style="flex:1;min-width:120px;background:#f1f5f9;padding:12px;border-radius:10px;">
          <p style="margin:0;font-size:12px;color:#888;">Batch</p>
          <strong>${Batch}</strong>
        </div>

        <div style="flex:1;min-width:120px;background:#f1f5f9;padding:12px;border-radius:10px;">
          <p style="margin:0;font-size:12px;color:#888;">Type</p>
          <strong>${Task_Type}</strong>
        </div>

      </div>

      <!-- DEADLINE CARD -->
      <div style="margin-top:20px;background:#fee2e2;padding:15px;border-radius:10px;text-align:center;">
        <p style="margin:0;font-size:13px;color:#991b1b;">⏰ Deadline</p>
        <h3 style="margin:5px 0;color:#dc2626;">
          ${new Date(Deadline).toLocaleString()}
        </h3>
      </div>

      <!-- BUTTON -->
      <div style="text-align:center;margin-top:30px;">
        <a href="http://localhost:5174" style="
          background:linear-gradient(135deg,#6366f1,#4f46e5);
          color:#fff;
          padding:14px 26px;
          border-radius:8px;
          text-decoration:none;
          font-weight:bold;
          display:inline-block;
          box-shadow:0 6px 15px rgba(99,102,241,0.4);
        ">
             View Task on Your Dashboard

        </a>
      </div>

    </div>

    <!-- FOOTER -->
    <div style="background:#f9fafb;padding:15px;text-align:center;font-size:12px;color:#999;">
      You're receiving this because you're enrolled in this course.<br/>
      © 2026 Task System
    </div>

  </div>
</div>
`;

            try {
                await sendEmail(
                    emails,
                    `New Task: ${Title}`,
                    message,
                    html   // 👈 UI yaha add kiya
                );
            } catch (emailError) {
                console.error("SMTP Notification Email Error (skipping):", emailError);
            }
        }

        res.status(201).json({
            message: "Task Created Successfully",
            students: students.length,
            task
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};


const getTasks = async (req, res) => {
    try {
        let rawTasks;
        try {
            rawTasks = await Task.find()
                .sort({ createdAt: -1 })
                .populate("Assigned_To", "name email");
        } catch (popError) {
            console.warn("⚠️ Population failed, returning raw tasks:", popError.message);
            rawTasks = await Task.find().sort({ createdAt: -1 });
        }

        const tasks = rawTasks.map(task => {
            const t = task.toObject();
            if (t.Assigned_To) {
                t.Assigned_To = t.Assigned_To.map(s => ({
                    ...s,
                    fullName: s.name
                }));
            }
            return t;
        });

        res.status(200).json({
            total: tasks.length,
            tasks
        });

    } catch (error) {
        console.error("GET TASKS CRITICAL ERROR:", error);
        res.status(500).json({ message: "❌ Server Error" });
    }
};



// ==============================
// ✅ GET TASK BY COURSE (Student)
// ==============================
const getTasksByCourse = async (req, res) => {
    try {
        const { course, batch } = req.query;

        const query = {};
        if (course) query.course = course;
        if (batch) query.Batch = batch; // Use capital 'B' as per Model

        if (!course && !batch) {
            return res.status(400).json({ message: "Course or Batch is required" });
        }

        const tasks = await Task.find(query).lean();

        // Add submission status for each task
        const tasksWithStatus = await Promise.all(tasks.map(async (task) => {
            const submission = await Submission.findOne({ taskId: task._id, studentId: req.user.id });
            return {
                ...task,
                status: submission ? "completed" : task.Status
            };
        }));

        res.status(200).json({ total: tasksWithStatus.length, tasks: tasksWithStatus });

    } catch (error) {
        console.error("GET TASKS BY COURSE/BATCH ERROR:", error);
        res.status(500).json({ message: "❌ Server Error" });
    }
};



// ==============================
// ✅ GET SINGLE TASK DETAILS
// ==============================
const getSingleTask = async (req, res) => {
    try {
        const rawTask = await Task.findById(req.params.id).populate("Assigned_To", "name email");

        if (!rawTask) return res.status(404).json({ message: "❌ Task not found" });

        const task = rawTask.toObject();
        if (task.Assigned_To) {
            task.Assigned_To = task.Assigned_To.map(s => ({
                ...s,
                fullName: s.name
            }));
        }

        res.status(200).json(task);

    } catch (error) {
        console.error("GET SINGLE TASK ERROR:", error);
        res.status(500).json({ message: "❌ Server Error" });
    }
};



// ==============================
// ✅ UPDATE TASK
// ==============================
const updateTask = async (req, res) => {
    try {
        const updateData = req.body;

        if (req.files && req.files.length > 0) {
            updateData.Attachments = req.files.map(file => file.path);
        }

        if (updateData.questions) {
            updateData.questions = typeof updateData.questions === 'string' ? JSON.parse(updateData.questions) : updateData.questions;
        }

        if (updateData.Assigned_To === "" || updateData.Assigned_To === "(Student Object ID - Optional)") {
            delete updateData.Assigned_To;
        }

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            updateData,
            { returnDocument: "after" }
        );

        if (!updatedTask) return res.status(404).json({ message: "❌ Task not found" });

        res.status(200).json({ message: "✅ Task Updated", task: updatedTask });

    } catch (error) {
        console.error("UPDATE TASK ERROR:", error);
        res.status(500).json({ message: "❌ Server Error" });
    }
};



// ==============================
// ✅ DELETE TASK
// ==============================
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) return res.status(404).json({ message: "❌ Task not found" });

        res.status(200).json({ message: "🗑 Task Deleted Successfully" });

    } catch (error) {
        res.status(500).json({ message: "❌ Server Error" });
    }
};



// ==============================
// 📊 GET TASK SUBMISSION STATS (Teacher)
// ==============================
const getTaskSubmissionStats = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });

        // 1. Get all students in the course/batch from StudentAuth
        const allStudents = await StudentAuth.find({
            courses: task.course,
            batch: task.Batch
        }).select("name email profileImage");

        // 2. Get all submissions for this task
        const submissions = await Submission.find({ taskId: task._id })
            .populate("studentId", "name email");

        // 3. Map status
        const submissionMap = new Map();
        submissions.forEach(s => {
            submissionMap.set(s.studentId?._id.toString(), s);
        });

        const stats = allStudents.map(s => {
            const sub = submissionMap.get(s._id.toString());
            return {
                student: { ...s._doc, fullName: s.name },
                status: sub ? "Submitted" : "Pending",
                submissionDate: sub ? sub.submissionDate : null,
                submissionId: sub ? sub._id : null,
                submissionData: sub || null
            };
        });

        res.status(200).json({
            taskTitle: task.Title,
            totalAssigned: allStudents.length,
            submittedCount: submissions.length,
            pendingCount: allStudents.length - submissions.length,
            stats
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// ==============================
// 🚀 EXPORT ALL
// ==============================
module.exports = {
    createTask,
    getTasks,
    getTasksByCourse,
    getSingleTask,
    getTaskSubmissionStats,
    updateTask,
    deleteTask
};
