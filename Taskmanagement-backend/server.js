const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

dotenv.config();

// Connect to Database
const connectDB = require("./config/db");
connectDB();

// Middleware
app.use(express.json());

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["*"];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes("*")) {
      return callback(null, true);
    }
    return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
  },
  credentials: true
}));
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/uploads/materials", express.static(path.join(__dirname, "public/uploads/materials")));
app.use("/uploads", express.static(path.join(__dirname, "public/Uploads")));
// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/students", require("./routes/student"));
app.use("/api/tasks", require("./routes/task-Teachers.js"));
app.use("/api/reports", require("./routes/Report"));
app.use("/api/materials", require("./routes/Material"));
app.use("/api/notifications", require("./routes/Notification"));
app.use("/api/teacher", require("./routes/teacherProfile"));


// 🤖 Automatic Overdue Check (Runs every 10 minutes)
const { checkOverdueTasks } = require("./controllers/Notification");
setInterval(checkOverdueTasks, 10 * 60 * 1000); 
setTimeout(checkOverdueTasks, 5000); // Initial check after 5s

// Server Start
const PORT = process.env.PORT || 7001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
