const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    students: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentAuth",
      required: false,
    },
    Title: {
      type: String,
      required: true,
      trim: true,
    },
    Description: {
      type: String,
      required: false,
    },
    course: {
      type: String,
      required: true,
    },
    Batch: {
      type: String,
      enum: ["2024", "2025", "2026", "2027", "2028", "2029", "2030"],
      required: true,
    },
    Task_Type: {
      type: String,
      enum: ["Assignment", "Project", "Test"],
      required: true,
    },
    Priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    Assigned_To: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StudentAuth",
      },
    ],
    Assign_Date: {
      type: Date,
      default: Date.now,
    },
    Deadline: {
      type: Date,
      required: true,
    },
    Attachments: [
      {
        type: String,
      },
    ],
    Links: [
      {
        type: String,
      },
    ],
    Late_Allowed: {
      type: Boolean,
      default: false,
    },
    Status: {
      type: String,
      enum: ["Pending", "In-Progress", "Completed", "Overdue"],
      default: "Pending",
    },
    Marks_Feedback: {
      type: String,
      default: "",
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questions: [
      {
        questionText: { type: String, required: true },
        type: {
          type: String,
          enum: ["Short Answer", "Paragraph", "MCQ"],
          required: true,
        },
        options: [String], // Only for MCQ
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Task", TaskSchema);
