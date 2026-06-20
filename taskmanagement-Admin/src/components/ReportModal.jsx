import { useState, useEffect } from 'react';
import { MdClose, MdAdd, MdDelete, MdAutorenew } from 'react-icons/md';
import { getApiBaseUrl } from '../utils/api';
import toast from 'react-hot-toast';

const ReportModal = ({ isOpen, onClose, onSave, report }) => {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({
    student: '',
    reportTitle: '',
    reportType: 'Assessment',
    fromDate: '',
    toDate: '',
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    lateSubmissions: 0,
    totalClasses: 30,
    present: 28,
    absent: 2,
    overallPerformance: 'Excellent',
    grade: 'A+',
    remarks: '',
    suggestions: '',
    behavior: 'Excellent',
    conduct: 'Excellent'
  });
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  // Fetch student lists on mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const baseUrl = getApiBaseUrl();
        const res = await fetch(`${baseUrl}/api/students`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStudents(data.students || []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchStudents();
  }, [isOpen]);

  useEffect(() => {
    if (report) {
      setForm({
        student: report.student?._id || report.student || '',
        reportTitle: report.reportTitle || '',
        reportType: report.reportType || 'Assessment',
        fromDate: report.fromDate ? report.fromDate.substring(0, 10) : '',
        toDate: report.toDate ? report.toDate.substring(0, 10) : '',
        totalTasks: report.totalTasks || 0,
        completedTasks: report.completedTasks || 0,
        pendingTasks: report.pendingTasks || 0,
        lateSubmissions: report.lateSubmissions || 0,
        totalClasses: report.totalClasses || 30,
        present: report.present || 28,
        absent: report.absent || 2,
        overallPerformance: report.overallPerformance || 'Excellent',
        grade: report.grade || 'A+',
        remarks: report.remarks || '',
        suggestions: report.suggestions || '',
        behavior: report.behavior || 'Excellent',
        conduct: report.conduct || 'Excellent'
      });
      setTests(report.tests || []);
    } else {
      setForm({
        student: '',
        reportTitle: '',
        reportType: 'Assessment',
        fromDate: '',
        toDate: '',
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        lateSubmissions: 0,
        totalClasses: 30,
        present: 28,
        absent: 2,
        overallPerformance: 'Excellent',
        grade: 'A+',
        remarks: '',
        suggestions: '',
        behavior: 'Excellent',
        conduct: 'Excellent'
      });
      setTests([]);
    }
  }, [report, isOpen]);

  // Auto-fetch student task statistics & test history on student select
  const handleStudentChange = async (studentId) => {
    setForm(prev => ({ ...prev, student: studentId }));
    if (!studentId) return;

    setStatsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const baseUrl = getApiBaseUrl();
      const headers = { 'Authorization': `Bearer ${token}` };

      // 1. Fetch Student profile & tasks for stats
      const resProfile = await fetch(`${baseUrl}/api/students/${studentId}`, { headers });
      if (resProfile.ok) {
        const profile = await resProfile.json();
        if (profile.tasks) {
          const total = profile.tasks.length;
          const completed = profile.tasks.filter(t => t.submissionStatus === 'Submitted' || t.submissionStatus === 'Graded').length;
          const pending = profile.tasks.filter(t => t.submissionStatus === 'Pending').length;
          const late = profile.tasks.filter(t => t.submissionStatus === 'Late').length;

          setForm(prev => ({
            ...prev,
            totalTasks: total,
            completedTasks: completed,
            pendingTasks: pending,
            lateSubmissions: late
          }));
        }
      }

      // 2. Fetch Graded tests history for this student
      const resTests = await fetch(`${baseUrl}/api/reports/student/${studentId}/test-history`, { headers });
      if (resTests.ok) {
        const testHistory = await resTests.json();
        if (testHistory.tests) {
          setTests(testHistory.tests.map(t => ({
            testName: t.testName || 'Test Evaluation',
            marksObtained: t.marksObtained || 0,
            totalMarks: t.totalMarks || 100
          })));
        }
      }
      toast.success("Scholar academic statistics loaded successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to auto-load student performance stats");
    } finally {
      setStatsLoading(false);
    }
  };

  const handleTestChange = (index, field, value) => {
    const updated = [...tests];
    updated[index][field] = value;
    setTests(updated);
  };

  const addTestRow = () => {
    setTests([...tests, { testName: '', marksObtained: 0, totalMarks: 100 }]);
  };

  const removeTestRow = (index) => {
    setTests(tests.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...form,
        tests
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-[32px] w-full max-w-2xl border border-slate-100 shadow-2xl overflow-hidden flex flex-col my-8">
        
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-8 border-b border-slate-100 shrink-0">
          <h3 className="font-black text-slate-800 tracking-tight">
            {report ? 'Edit Scholar Performance Card' : 'Generate Scholar Performance Card'}
          </h3>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-slate-800 transition-colors"
          >
            <MdClose size={18} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 p-8 space-y-6 overflow-y-auto max-h-[75vh]">
          
          <div className="space-y-4">
            
            {/* Student Select */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Select Scholar</label>
              <div className="flex gap-2">
                <select
                  value={form.student}
                  onChange={(e) => handleStudentChange(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none focus:border-red-500 cursor-pointer"
                  required
                  disabled={!!report} // Cannot change student during edit
                >
                  <option value="">Choose student...</option>
                  {students.map(s => (
                    <option key={s._id} value={s._id}>{s.fullName} ({s.course})</option>
                  ))}
                </select>
                {statsLoading && (
                  <div className="flex items-center px-4 bg-slate-50 border rounded-2xl">
                    <MdAutorenew className="animate-spin text-slate-400" size={18} />
                  </div>
                )}
              </div>
            </div>

            {/* Report Title */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Report Title</label>
              <input 
                type="text" 
                value={form.reportTitle}
                onChange={(e) => setForm({ ...form, reportTitle: e.target.value })}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none focus:border-red-500 shadow-inner"
                placeholder="e.g. End Semester Roster 2026"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Type */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Term Type</label>
                <select
                  value={form.reportType}
                  onChange={(e) => setForm({ ...form, reportType: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none cursor-pointer"
                >
                  <option value="Assessment">Assessment</option>
                  <option value="MidTerm">MidTerm</option>
                  <option value="EndTerm">EndTerm</option>
                  <option value="WeeklyQuiz">WeeklyQuiz</option>
                </select>
              </div>

              {/* fromDate */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">From Date</label>
                <input 
                  type="date" 
                  value={form.fromDate}
                  onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none cursor-pointer"
                  required
                />
              </div>

              {/* toDate */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">To Date</label>
                <input 
                  type="date" 
                  value={form.toDate}
                  onChange={(e) => setForm({ ...form, toDate: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none cursor-pointer"
                  required
                />
              </div>
            </div>

            {/* Task stats section */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-3xl space-y-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Task Statistics</span>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="text-[8px] font-black text-slate-400 uppercase">Assigned</label>
                  <input type="number" min={0} value={form.totalTasks} onChange={(e) => setForm({ ...form, totalTasks: Number(e.target.value) })} className="w-full p-2 bg-white border border-slate-100 text-xs rounded-xl focus:outline-none" />
                </div>
                <div>
                  <label className="text-[8px] font-black text-slate-400 uppercase">Completed</label>
                  <input type="number" min={0} value={form.completedTasks} onChange={(e) => setForm({ ...form, completedTasks: Number(e.target.value) })} className="w-full p-2 bg-white border border-slate-100 text-xs rounded-xl" />
                </div>
                <div>
                  <label className="text-[8px] font-black text-slate-400 uppercase">Pending</label>
                  <input type="number" min={0} value={form.pendingTasks} onChange={(e) => setForm({ ...form, pendingTasks: Number(e.target.value) })} className="w-full p-2 bg-white border border-slate-100 text-xs rounded-xl" />
                </div>
                <div>
                  <label className="text-[8px] font-black text-slate-400 uppercase">Late</label>
                  <input type="number" min={0} value={form.lateSubmissions} onChange={(e) => setForm({ ...form, lateSubmissions: Number(e.target.value) })} className="w-full p-2 bg-white border border-slate-100 text-xs rounded-xl" />
                </div>
              </div>
            </div>

            {/* Attendance section */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-3xl space-y-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Attendance details</span>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[8px] font-black text-slate-400 uppercase">Total lectures</label>
                  <input type="number" min={0} value={form.totalClasses} onChange={(e) => setForm({ ...form, totalClasses: Number(e.target.value) })} className="w-full p-2 bg-white border border-slate-100 text-xs rounded-xl" />
                </div>
                <div>
                  <label className="text-[8px] font-black text-slate-400 uppercase">Lectures Present</label>
                  <input type="number" min={0} value={form.present} onChange={(e) => setForm({ ...form, present: Number(e.target.value) })} className="w-full p-2 bg-white border border-slate-100 text-xs rounded-xl" />
                </div>
                <div>
                  <label className="text-[8px] font-black text-slate-400 uppercase">Lectures Absent</label>
                  <input type="number" min={0} value={form.absent} onChange={(e) => setForm({ ...form, absent: Number(e.target.value) })} className="w-full p-2 bg-white border border-slate-100 text-xs rounded-xl" />
                </div>
              </div>
            </div>

            {/* Tests & Scores List */}
            <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Test Scores / Marks Roster</span>
                <button 
                  type="button" 
                  onClick={addTestRow}
                  className="flex items-center gap-1 text-[9px] font-black bg-white hover:bg-slate-900 hover:text-white px-2.5 py-1.5 rounded-xl border border-slate-100 transition-colors uppercase tracking-wider"
                >
                  <MdAdd size={14} /> Add test
                </button>
              </div>

              {tests.length === 0 ? (
                <p className="text-slate-400 text-xs py-2 text-center">No graded tests listed. Click "Add test" to log marks.</p>
              ) : (
                <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
                  {tests.map((test, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <input 
                        type="text" 
                        value={test.testName}
                        onChange={(e) => handleTestChange(idx, 'testName', e.target.value)}
                        placeholder="Test Name"
                        className="flex-1 p-2 bg-white border border-slate-100 text-xs rounded-xl"
                        required
                      />
                      <input 
                        type="number" 
                        min={0}
                        value={test.marksObtained}
                        onChange={(e) => handleTestChange(idx, 'marksObtained', Number(e.target.value))}
                        placeholder="Marks"
                        className="w-20 p-2 bg-white border border-slate-100 text-xs rounded-xl text-center"
                        required
                      />
                      <span className="text-xs text-slate-400">/</span>
                      <input 
                        type="number" 
                        min={1}
                        value={test.totalMarks}
                        onChange={(e) => handleTestChange(idx, 'totalMarks', Number(e.target.value))}
                        placeholder="Total"
                        className="w-20 p-2 bg-white border border-slate-100 text-xs rounded-xl text-center"
                        required
                      />
                      <button 
                        type="button" 
                        onClick={() => removeTestRow(idx)}
                        className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg"
                      >
                        <MdDelete size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Performance description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Overall Review</label>
                <select
                  value={form.overallPerformance}
                  onChange={(e) => setForm({ ...form, overallPerformance: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none cursor-pointer"
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                  <option value="Needs Improvement">Needs Improvement</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>

              {/* Grade */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Letter Grade</label>
                <select
                  value={form.grade}
                  onChange={(e) => setForm({ ...form, grade: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none cursor-pointer"
                >
                  <option value="A+">A+</option>
                  <option value="A">A</option>
                  <option value="B+">B+</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="F">F</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Behavior */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Behavior review</label>
                <select
                  value={form.behavior}
                  onChange={(e) => setForm({ ...form, behavior: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none cursor-pointer"
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Satisfactory">Satisfactory</option>
                  <option value="Needs Improvement">Needs Improvement</option>
                </select>
              </div>

              {/* Conduct */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Conduct review</label>
                <select
                  value={form.conduct}
                  onChange={(e) => setForm({ ...form, conduct: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none cursor-pointer"
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Satisfactory">Satisfactory</option>
                  <option value="Needs Improvement">Needs Improvement</option>
                </select>
              </div>
            </div>

            {/* Remarks */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Faculty Remarks</label>
              <textarea 
                value={form.remarks}
                onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                rows={2}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none resize-none"
                placeholder="Give positive encouragement or comments..."
              />
            </div>

            {/* Suggestions */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Suggestions for Improvement</label>
              <textarea 
                value={form.suggestions}
                onChange={(e) => setForm({ ...form, suggestions: e.target.value })}
                rows={2}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none resize-none"
                placeholder="Suggest resources or study methods..."
              />
            </div>

          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 px-6 border border-slate-100 text-slate-500 text-xs font-black uppercase tracking-wider rounded-2xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 px-6 bg-slate-900 text-white text-xs font-black uppercase tracking-wider rounded-2xl hover:bg-red-600 shadow-lg transition-all"
            >
              {loading ? 'Submitting...' : 'Publish Report'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default ReportModal;
