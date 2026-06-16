const Report = require("../models/Report");
const Notification = require("../models/Notification");
const StudentAuth = require("../models/studentsmodels");
const Submission = require("../models/Submission");
const Task = require("../models/task-Teachers");

// ==============================
// 🧠 HELPER: AUTO CALCULATE
// ==============================
const calculateStats = (data) => {
    const totalTests = data.tests?.length || 0;
    const testMarksSum = data.tests?.reduce((sum, t) => sum + (Number(t.marksObtained) || 0), 0) || 0;
    const testMarksTotal = Math.max(data.tests?.reduce((sum, t) => sum + (Number(t.totalMarks) || 0), 0) || 100, 1);

    const averageTestMarks = Math.min(totalTests > 0 ? (testMarksSum / testMarksTotal) * 100 : 0, 100);
    const attendancePercentage = data.totalClasses
        ? Math.min((data.present / data.totalClasses) * 100, 100)
        : 0;

    return {
        totalTests,
        averageTestMarks,
        attendancePercentage
    };
};


// ==============================
// ✅ CREATE REPORT
// ==============================
const createReport = async (req, res) => {
    try {
        const {
            student,
            reportTitle,
            reportType,
            fromDate,
            toDate,
            tests,
            totalTasks,
            completedTasks,
            pendingTasks,
            lateSubmissions,
            totalClasses,
            present,
            absent,
            overallPerformance,
            grade,
            remarks,
            suggestions,
            behavior,
            attachments,
            conduct
        } = req.body;

        if (!student || !reportTitle || !fromDate || !toDate) {
            return res.status(400).json({
                message: "Required fields missing (student, reportTitle, fromDate, toDate)"
            });
        }

        const { totalTests, averageTestMarks, attendancePercentage } =
            calculateStats({ tests, totalClasses, present });

        const report = new Report({
            student,
            reportTitle,
            reportType,
            fromDate,
            toDate,
            tests,
            totalTests,
            averageTestMarks,
            totalTasks,
            completedTasks,
            pendingTasks,
            lateSubmissions,
            totalClasses,
            present,
            absent,
            attendancePercentage,
            overallPerformance,
            grade,
            remarks,
            suggestions,
            behavior,
            attachments,
            conduct,
            createdBy: req.user.id
        });

        await report.save();

        // 🔔 Create Notification for Student
        try {
            await Notification.create({
                recipient: student,
                title: "📊 Report Published",
                message: `Your academic report "${reportTitle}" has been published. Overall Performance: ${overallPerformance}`,
                type: "Report_Published",
                relatedId: report._id,
                relatedModel: "Report"
            });
        } catch (noteError) {
            console.error("Failed to send report notification:", noteError.message);
        }

        res.status(201).json({ message: "Report created successfully", report });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// ==============================
// ✅ UPDATE REPORT
// ==============================
const updateReport = async (req, res) => {
    try {
        const { totalTests, averageTestMarks, attendancePercentage } = calculateStats(req.body);

        const updatedReport = await Report.findByIdAndUpdate(
            req.params.id,
            { ...req.body, totalTests, averageTestMarks, attendancePercentage },
            { returnDocument: "after" }
        );

        if (!updatedReport) return res.status(404).json({ message: "Report not found" });

        res.status(200).json({ message: "Report updated", report: updatedReport });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// ==============================
// 🗑 DELETE REPORT
// ==============================
const deleteReport = async (req, res) => {
    try {
        const report = await Report.findByIdAndDelete(req.params.id);
        if (!report) return res.status(404).json({ message: "Report not found" });
        res.status(200).json({ message: "Report deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// ==============================
// 📋 GET ALL REPORTS (FILTER)
// ==============================
const getReports = async (req, res) => {
    try {
        const { student, reportType, search } = req.query;
        let filter = {};

        if (student) filter.student = student;
        if (reportType && reportType !== 'All') filter.reportType = reportType;

        const rawReports = await Report.find(filter)
            .populate("student", "name email profileImage")
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });

        const mappedReports = rawReports.map(r => {
            const doc = r.toObject();
            if (doc.student) {
                doc.student.fullName = doc.student.name;
            }
            return doc;
        });

        // 🔍 Optional Search in populated student name
        let finalReports = mappedReports;
        if (search) {
            const q = search.toLowerCase();
            finalReports = mappedReports.filter(r =>
                r.student?.fullName?.toLowerCase().includes(q) ||
                r.reportTitle?.toLowerCase().includes(q)
            );
        }

        res.status(200).json({
            total: finalReports.length,
            reports: finalReports
        });

    } catch (error) {
        console.error("GET REPORTS ERROR:", error);
        res.status(500).json({ message: error.message });
    }
};


// ==============================
// 🎯 GET MY REPORTS (For Student Portal)
// ==============================
const getMyReports = async (req, res) => {
    try {
        const studentId = req.user.id;

        const rawReports = await Report.find({ student: studentId })
            .populate("student", "name email profileImage")
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });

        const reports = rawReports.map(r => {
            const doc = r.toObject();
            if (doc.student) {
                doc.student.fullName = doc.student.name;
            }
            return doc;
        });

        res.status(200).json({
            total: reports.length,
            reports
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// ==============================
// 🔍 GET SINGLE REPORT
// ==============================
const getSingleReport = async (req, res) => {
    try {
        const rawReport = await Report.findById(req.params.id)
            .populate("student", "name email profileImage")
            .populate("createdBy", "name email");

        if (!rawReport) return res.status(404).json({ message: "Report not found" });

        const report = rawReport.toObject();
        if (report.student) {
            report.student.fullName = report.student.name;
        }

        res.status(200).json(report);
    } catch (error) {
        res.status(500).json(error.message);
    }
};

// ==============================
// 🎯 GET STUDENT TEST HISTORY (For Auto-fill)
// ==============================
const getStudentTestHistory = async (req, res) => {
    try {
        const { studentId } = req.params;

        // Find all graded submissions for this student where task type is Test
        const submissions = await Submission.find({ 
            studentId, 
            status: { $in: ["Graded", "Updated"] },
            marks: { $exists: true }
        }).populate({
            path: 'taskId',
            match: { Task_Type: 'Test' }
        });

        // Filter out null taskIds (non-test tasks)
        const gradedTests = submissions
            .filter(s => s.taskId)
            .map(s => ({
                testName: s.taskId.Title,
                marksObtained: s.marks,
                totalMarks: 100, // Default to 100 or use a marks field if added to Task
                date: s.submissionDate || s.updatedAt
            }));

        res.status(200).json({ tests: gradedTests });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    createReport,
    updateReport,
    deleteReport,
    getReports,
    getSingleReport,
    getMyReports,
    getStudentTestHistory
};
