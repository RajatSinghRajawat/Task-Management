const fs = require('fs');
const path = "c:/Users/acer/OneDrive/Desktop/Task Management App/Taskmanagement-Teachers/src/pages/reports/Reports.jsx";

const content = \`import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { 
  MdTaskAlt, MdPendingActions, MdPeople, MdShowChart, MdCheckCircle, 
  MdSearch, MdDownload, MdClose, MdSchedule, MdAdd, MdRefresh,
  MdAssessment, MdTimeline, MdAssignmentTurnedIn, MdWarningAmber,
  MdFilterList, MdDeleteOutline, MdDescription, MdPerson, MdCalendarToday,
  MdEdit, MdStar, MdEventAvailable, MdAttachFile, MdQuiz, MdCategory, MdHistory,
  MdKeyboardArrowRight, MdTrendingUp, MdVisibility, MdArrowBack, MdRocketLaunch,
  MdAnalytics, MdOutlineCalendarMonth, MdLayers, MdAutoFixHigh, MdOutlineFactCheck,
  MdStream, MdArrowForward
} from 'react-icons/md';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, AreaChart, Area, Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const REPORTS_API = 'http://localhost:7001/api/reports';
const STUDENTS_API = 'http://localhost:7001/api/students';
const TASKS_API = 'http://localhost:7001/api/tasks';
const AUTH_TOKEN = () => localStorage.getItem('token');

const COURSES = [
  "Software-Development", "Data-Science", "Cyber-Security", "Cloud-Computing", 
  "Artificial-Intelligence", "Digital-Marketing", "UI-UX-Design", 
  "Business-Analytics", "Project-Management", "DevOps"
];

const BATCHES = ["2024", "2025", "2026", "2027", "2028", "2029", "2030"];

// ── ELITE REPORT ENGINE (MODAL) ────────────────────────────────────────────────
const CreateReportModal = ({ onClose, onSaved }) => {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [tests, setTests] = useState([{ testName: '', marksObtained: '', totalMarks: '', date: new Date().toISOString().split('T')[0] }]);
  const [form, setForm] = useState({
    student: '', reportTitle: '', reportType: 'Monthly', fromDate: '', toDate: '',
    overallPerformance: 'Average', remarks: '', suggestions: '', totalClasses: '', present: '',
    behavior: '',
    conduct: { attentiveness: 85, punctuality: 85, neatness: 85, extracurriculars: 85 }
  });

  const fetchTestHistory = useCallback(async (sid, from, to) => {
    if (!sid) return;
    try {
      const res = await axios.get(\`\${REPORTS_API}/student/\${sid}/test-history\`, { 
        headers: { Authorization: \`Bearer \${AUTH_TOKEN()}\` } 
      });
      let fetchedTests = res.data.tests || [];
      
      if (from && to) {
        const start = new Date(from);
        const end = new Date(to);
        fetchedTests = fetchedTests.filter(t => {
          const d = new Date(t.date);
          return d >= start && d <= end;
        });
      }

      if (fetchedTests.length > 0) {
        setTests(fetchedTests);
        toast.success(\`Synced \${fetchedTests.length} tests for this period\`);
      } else {
        setTests([{ testName: '', marksObtained: '', totalMarks: '', date: new Date().toISOString().split('T')[0] }]);
      }
    } catch (err) {
      console.error("Auto-fetch error", err);
    }
  }, []);

  useEffect(() => {
    if (form.student) {
      fetchTestHistory(form.student, form.fromDate, form.toDate);
    }
  }, [form.student, form.fromDate, form.toDate, fetchTestHistory]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get(STUDENTS_API, { headers: { Authorization: \`Bearer \${AUTH_TOKEN()}\` } });
        setStudents(res.data.students || []);
      } catch (err) { console.error(err); }
    };
    fetchStudents();
  }, []);

  const addTest = () => setTests([...tests, { testName: '', marksObtained: '', totalMarks: '', date: new Date().toISOString().split('T')[0] }]);
  const removeTest = (index) => tests.length > 1 && setTests(tests.filter((_, i) => i !== index));
  const updateTest = (index, field, val) => {
    const newTests = [...tests];
    newTests[index][field] = val;
    setTests(newTests);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.student) return toast.error('Target Identity required');
    setLoading(true);
    const loadToast = toast.loading('Synchronizing Report...');
    try {
      await axios.post(REPORTS_API, { ...form, tests }, { headers: { Authorization: \`Bearer \${AUTH_TOKEN()}\` } });
      toast.success('Report Synchronized', { id: loadToast });
      onSaved();
      onClose();
    } catch (err) { toast.error('Satellite Fault', { id: loadToast }); }
    finally { setLoading(false); }
  };

  const inp = "w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-slate-300";
  const lbl = "block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em] ml-1";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <motion.div 
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        className="bg-white/95 backdrop-blur-3xl rounded-[48px] shadow-[0_32px_80px_rgba(0,0,0,0.15)] w-full max-w-6xl overflow-hidden flex flex-col max-h-[95vh] border border-white/20"
      >
        <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-5">
             <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-3xl shadow-xl shadow-indigo-100">
                <MdRocketLaunch />
             </div>
             <div>
               <h2 className="text-3xl font-black text-slate-800 tracking-tight font-display">Generate Report</h2>
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1">Create a new academic performance record</p>
             </div>
          </div>
          <button onClick={onClose} className="p-4 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"><MdClose size={32} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-10 space-y-12 overflow-y-auto no-scrollbar custom-scrollbar flex-1">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                  <label className={lbl}>Select Student</label>
                  <select className={inp} value={form.student} onChange={(e) => setForm({...form, student: e.target.value})} required>
                     <option value="">Select Student...</option>
                     {students.map(s => <option key={s._id} value={s._id}>{s.fullName} ({s.studentId})</option>)}
                  </select>
               </div>
               <div className="lg:col-span-1">
                  <label className={lbl}>Report Title</label>
                  <input className={inp} value={form.reportTitle} onChange={e => setForm({...form, reportTitle: e.target.value})} placeholder="e.g. Annual Result" required />
               </div>
               <div>
                  <label className={lbl}>From Date</label>
                  <input type="date" className={inp} value={form.fromDate} onChange={e => setForm({...form, fromDate: e.target.value})} required />
               </div>
               <div>
                  <label className={lbl}>To Date</label>
                  <input type="date" className={inp} value={form.toDate} onChange={e => setForm({...form, toDate: e.target.value})} required />
               </div>
           </div>

           <div className="space-y-6">
              <div className="flex justify-between items-end px-2">
                 <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                       <MdOutlineFactCheck className="text-indigo-600" size={22} /> Assessment Vectors
                    </h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Define specific test outcomes for analysis</p>
                 </div>
                  <button type="button" onClick={addTest} className="px-6 py-3 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                     <MdAdd size={18}/> Add Test Score
                  </button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                 {tests.map((test, idx) => (
                   <motion.div key={idx} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-12 gap-5 items-end bg-slate-50/50 p-6 rounded-[32px] border border-slate-100 hover:border-indigo-100 transition-all group">
                     <div className="col-span-5">
                       <label className={lbl}>Vector Identity (Subject/Test)</label>
                       <input className={\`\${inp} bg-white\`} placeholder="e.g. Data structures" value={test.testName} onChange={e => updateTest(idx, 'testName', e.target.value)} required />
                     </div>
                     <div className="col-span-3">
                       <label className={lbl}>Marks Gained</label>
                       <input type="number" className={\`\${inp} bg-white text-center font-display text-lg\`} placeholder="0" value={test.marksObtained} onChange={e => updateTest(idx, 'marksObtained', e.target.value)} required />
                     </div>
                     <div className="col-span-3">
                       <label className={lbl}>Maximum Potential</label>
                       <input type="number" className={\`\${inp} bg-white text-center font-display text-lg\`} placeholder="100" value={test.totalMarks} onChange={e => updateTest(idx, 'totalMarks', e.target.value)} required />
                     </div>
                     <div className="col-span-1 flex justify-center">
                        <button type="button" onClick={() => removeTest(idx)} className="p-3 text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"><MdDeleteOutline size={26}/></button>
                     </div>
                   </motion.div>
                 ))}
              </div>
           </div>

           <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <div>
                    <label className={lbl}>Performance Evaluation</label>
                    <select className={inp} value={form.overallPerformance} onChange={e => setForm({...form, overallPerformance: e.target.value})}>
                       {['Excellent', 'Good', 'Average', 'Needs Improvement', 'Critical'].map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className={lbl}>Student Behavior (Vyavhar)</label>
                    <textarea className={\`\${inp} min-h-[60px] resize-none\`} value={form.behavior} onChange={e => setForm({...form, behavior: e.target.value})} placeholder="e.g. Respectful, Good, or Needs Focus..." />
                 </div>
                 <div>
                    <label className={lbl}>Official Remarks</label>
                    <textarea className={\`\${inp} min-h-[60px] resize-none\`} value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})} placeholder="Professional assessment..." />
                 </div>
              </div>
           </div>

           <div className="p-8 bg-indigo-600 rounded-[40px] text-white shadow-2xl shadow-indigo-200">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl"><MdAssessment /></div>
                    <div>
                       <h4 className="text-xl font-black tracking-tight uppercase">Live Report Analytics</h4>
                       <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mt-1">Calculated based on {tests.length} vectors</p>
                    </div>
                 </div>
                 <div className="flex gap-10">
                    <div className="text-center">
                       <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Aggregate Score</p>
                       <p className="text-4xl font-black">
                          {Math.round((tests.reduce((s,t)=>s+(Number(t.marksObtained)||0),0) / Math.max(tests.reduce((s,t)=>s+(Number(t.totalMarks)||0),0),1)) * 100)}%
                       </p>
                    </div>
                    <div className="text-center border-l border-white/20 pl-10">
                       <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Predicted Grade</p>
                       <p className="text-4xl font-black">
                          {(() => {
                             const p = (tests.reduce((s,t)=>s+(Number(t.marksObtained)||0),0) / Math.max(tests.reduce((s,t)=>s+(Number(t.totalMarks)||0),0),1)) * 100;
                             return p >= 90 ? 'A+' : p >= 80 ? 'A' : p >= 70 ? 'B+' : p >= 60 ? 'B' : 'C';
                          })()}
                       </p>
                    </div>
                 </div>
              </div>
           </div>

           <button type="submit" disabled={loading} className="w-full py-7 bg-slate-900 text-white font-black text-[12px] uppercase tracking-[0.4em] rounded-[32px] shadow-2xl hover:bg-indigo-600 transition-all active:scale-95 flex items-center justify-center gap-4">
             <MdRocketLaunch size={28} /> {loading ? 'Synchronizing Report...' : 'Authorize & Synchronize Hub'}
           </button>
        </form>
      </motion.div>
    </div>
  );
};

// ── MAIN REPORTS MODULE ────────────────────────────────────────────────────────
const Reports = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('performance');
  const [reports, setReports] = useState([]);
  const [students, setStudents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [viewDetail, setViewDetail] = useState(false);

  const fetchAllData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    try {
      const config = { headers: { Authorization: \`Bearer \${AUTH_TOKEN()}\` } };
      const [repRes, stuRes, tskRes] = await Promise.all([
        axios.get(REPORTS_API, config),
        axios.get(STUDENTS_API, config),
        axios.get(TASKS_API, config)
      ]);
      setReports(repRes.data.reports || []);
      setStudents(stuRes.data.students || []);
      setTasks(tskRes.data.tasks || []);
    } catch { toast.error('Sync Error'); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  const groupedReports = useMemo(() => {
    const groups = {};
    reports.forEach(r => {
      const sid = r.student?._id;
      if (!sid) return;
      if (!groups[sid]) {
        groups[sid] = {
          student: r.student,
          allReports: [],
          latestReport: r
        };
      }
      groups[sid].allReports.push(r);
    });
    return Object.values(groups);
  }, [reports]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  const handleDelete = async (id) => {
    if (!confirm('Purge dossier?')) return;
    try {
      await axios.delete(\`\${REPORTS_API}/\${id}\`, { headers: { Authorization: \`Bearer \${AUTH_TOKEN()}\` } });
      toast.success('Purged');
      fetchAllData(true);
    } catch { toast.error('Purge Fault'); }
  };

  const handleOpenDetail = (group) => {
    const allTests = group.allReports.flatMap(r => r.tests || []);
    allTests.sort((a, b) => new Date(b.date) - new Date(a.date));
    const latest = group.latestReport;
    const consolidated = {
      ...latest,
      reportTitle: "Consolidated Academic History",
      tests: allTests,
      remarks: latest.remarks || "Automated consolidation of student records."
    };
    setSelectedReport(consolidated);
    setViewDetail(true);
  };

  const allQuestions = tasks.flatMap(t => (t.questions || []).map(q => ({ ...q, course: t.course, taskTitle: t.Title, id: t._id })));

  const stats = [
    { label: 'Active Dossiers', val: reports.length, icon: <MdDescription />, bg: 'bg-indigo-50', color: 'text-indigo-600' },
    { label: 'Scholar Stream', val: students.length, icon: <MdPeople />, bg: 'bg-emerald-50', color: 'text-emerald-600' },
    { label: 'Logic Archive', val: allQuestions.length, icon: <MdQuiz />, bg: 'bg-purple-50', color: 'text-purple-600' },
    { label: 'Deployed Hub', val: tasks.length, icon: <MdAssignmentTurnedIn />, bg: 'bg-amber-50', color: 'text-amber-600' },
  ];

  if (viewDetail && selectedReport) {
    const totalMarks = selectedReport.tests?.reduce((a, b) => a + (b.totalMarks || 0), 0) || 100;
    const obtainedMarks = selectedReport.tests?.reduce((a, b) => a + (b.marksObtained || 0), 0) || 0;
    const percentage = Math.round((obtainedMarks / totalMarks) * 100);

    return (
      <div className="w-full space-y-10 animate-in fade-in duration-700 pb-20">
        <style>{\`
          @media print {
            @page { size: A4; margin: 0; }
            body { margin: 0; padding: 0; background: white !important; }
            body * { visibility: hidden; }
            #printable-marksheet, #printable-marksheet * { visibility: visible; }
            #printable-marksheet { 
              position: absolute; left: 0; top: 0; width: 100%; min-height: 297mm; padding: 15mm; background: white !important; color: black !important; display: block !important; z-index: 9999;
            }
            .marksheet-border { border: 6px double #1e293b !important; padding: 10mm !important; }
          }
        \`}</style>

        <div id="printable-marksheet" className="hidden print:block bg-white marksheet-border relative">
           <div className="absolute top-0 left-0 w-32 h-32 border-t-8 border-l-8 border-indigo-700/20 rounded-tl-3xl pointer-events-none" />
           <div className="absolute top-0 right-0 w-32 h-32 border-t-8 border-r-8 border-indigo-700/20 rounded-tr-3xl pointer-events-none" />
           <div className="absolute bottom-0 left-0 w-32 h-32 border-b-8 border-l-8 border-indigo-700/20 rounded-bl-3xl pointer-events-none" />
           <div className="absolute bottom-0 right-0 w-32 h-32 border-b-8 border-r-8 border-indigo-700/20 rounded-br-3xl pointer-events-none" />
           <div className="text-center space-y-4 mb-10 border-b-[6px] border-double border-indigo-900 pb-10 relative z-10">
              <h1 className="text-6xl font-black text-indigo-800 uppercase font-display leading-none">TIPS-G ALWAR</h1>
              <p className="text-[11px] font-black tracking-[0.6em] text-slate-400 uppercase mt-2">Official Academic Dossier</p>
           </div>
           <div className="p-10 bg-slate-50/50 rounded-[48px] border border-slate-100 mb-10">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Student Identity</p>
              <p className="text-4xl font-black text-slate-900 uppercase">{selectedReport.student?.fullName}</p>
              <p className="text-sm font-black text-slate-500 mt-2">ID: {selectedReport.student?.studentId}</p>
           </div>
           <div className="rounded-[32px] border-2 border-slate-900 overflow-hidden bg-white mb-10">
              <table className="w-full text-left">
                 <thead className="bg-slate-900 text-white">
                    <tr><th className="px-8 py-5">Assessment Vector</th><th className="px-8 py-5 text-center">Marks</th><th className="px-8 py-5 text-center">Max</th><th className="px-8 py-5 text-center">Date</th></tr>
                 </thead>
                 <tbody>
                    {selectedReport.tests?.map((t, i) => (
                       <tr key={i} className="border-b border-slate-100">
                          <td className="px-8 py-5 font-black text-slate-700">{t.testName}</td>
                          <td className="px-8 py-5 text-center font-display font-bold">{t.marksObtained}</td>
                          <td className="px-8 py-5 text-center font-display">{t.totalMarks}</td>
                          <td className="px-8 py-5 text-center text-[10px] font-black text-slate-400">{new Date(t.date).toLocaleDateString()}</td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
           <div className="p-10 border-t-2 border-slate-100 mt-20 flex justify-between items-end">
              <div><p className="text-[10px] font-black text-slate-400 uppercase mb-10">Principal Authorization</p><div className="w-48 h-px bg-slate-900"></div></div>
              <div className="text-right"><p className="text-3xl font-black text-slate-900">GRADE: {percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B+' : 'B'}</p></div>
           </div>
        </div>

        <div className="no-print">
           <button onClick={() => setViewDetail(false)} className="flex items-center gap-3 text-slate-400 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest transition-all mb-10">
              <MdArrowBack size={22} /> Return to Archive
           </button>
           <div className="bg-white/80 backdrop-blur-2xl p-12 rounded-[56px] border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-12">
                 <h2 className="text-4xl font-black text-slate-800 font-display">Performance Analysis Hub</h2>
                 <button onClick={() => window.print()} className="px-10 py-5 bg-slate-900 text-white rounded-[24px] font-black text-[11px] uppercase tracking-widest flex items-center gap-4 hover:bg-indigo-600 transition-all shadow-2xl"><MdDownload size={24} /> Export Dossier</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                 <div className="p-10 bg-slate-50 rounded-[44px] border border-slate-100 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Aggregate Index</p>
                    <p className="text-6xl font-black text-indigo-700 font-display">{percentage}%</p>
                 </div>
                 <div className="p-10 bg-slate-50 rounded-[44px] border border-slate-100 lg:col-span-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Behavioral Assessment</p>
                    <p className="text-xl font-bold text-slate-700 italic">"{selectedReport.behavior || "Consistent performance and focus."}"</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-12 animate-in fade-in duration-700 pb-32">
       <div className="flex flex-col md:flex-row justify-between items-center gap-10">
         <div>
            <h1 className="text-5xl font-black text-slate-800 tracking-tighter leading-none font-display">Performance Hub</h1>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3 ml-1 flex items-center gap-4">
              <div className="w-12 h-0.5 bg-indigo-600 rounded-full" /> Academic Intelligence Archive
            </p>
         </div>
         <div className="flex items-center gap-6">
            <button onClick={() => fetchAllData(true)} className={\`p-5 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm \${refreshing ? 'animate-spin' : ''}\`}><MdRefresh size={24} /></button>
            <button onClick={() => setModalOpen(true)} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-3 active:scale-95"><MdAnalytics size={22} /> Students Generate Report</button>
         </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map(s => (
            <div key={s.label} className="bg-white/60 backdrop-blur-2xl p-8 rounded-[44px] border border-white/60 shadow-sm flex items-center gap-7 group hover:shadow-2xl transition-all">
               <div className={\`w-16 h-16 rounded-[24px] \${s.bg} \${s.color} flex items-center justify-center text-3xl transition-transform group-hover:scale-110\`}>{s.icon}</div>
               <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{s.label}</p><p className="text-3xl font-black text-slate-800 font-display mt-0.5 tracking-tighter">{s.val}</p></div>
            </div>
          ))}
       </div>

       <div className="flex flex-wrap bg-white/40 backdrop-blur-md p-2 rounded-[36px] w-fit shadow-sm border border-white/60">
          {[
            { id: 'performance', label: 'Performance Wall', icon: <MdShowChart /> },
            { id: 'registry', label: 'Student Stream', icon: <MdPeople /> },
            { id: 'questions', label: 'Questions Lab', icon: <MdQuiz /> }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={\`px-10 py-4 rounded-[28px] text-[10px] font-black uppercase tracking-[0.25em] flex items-center gap-3 transition-all \${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-lg' : 'text-slate-400 hover:text-slate-600'}\`}>{tab.icon} {tab.label}</button>
          ))}
       </div>

       <AnimatePresence mode="wait">
         {activeTab === 'performance' && (
            <motion.div key="performance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
               <div className="bg-white/80 backdrop-blur-2xl rounded-[48px] border border-slate-200/50 shadow-sm overflow-hidden">
                  <div className="p-12 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
                     <h3 className="text-2xl font-black text-slate-800 tracking-tight font-display">Student Reports Archive</h3>
                     <div className="relative w-full md:w-96 group">
                        <MdSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={24} />
                        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search reports..." className="w-full pl-16 pr-8 py-4.5 bg-slate-50 border border-transparent focus:border-indigo-100 rounded-2xl text-xs font-black outline-none placeholder:text-slate-300" />
                     </div>
                  </div>
                  <div className="overflow-x-auto scrollbar-hide">
                     <table className="w-full text-left">
                        <thead>
                           <tr className="bg-slate-50/30 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100">
                              <th className="px-12 py-7">Student Identity</th>
                              <th className="px-10 py-7 text-center">History Archive</th>
                              <th className="px-10 py-7 text-center">Score Index</th>
                              <th className="px-10 py-7 text-center">Outcome</th>
                              <th className="px-12 py-7 text-right">Actions</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                           {groupedReports.filter(g => g.student?.fullName.toLowerCase().includes(search.toLowerCase())).map((g, idx) => (
                              <tr key={g.student?._id || idx} onClick={() => handleOpenDetail(g)} className="hover:bg-indigo-50/40 transition-all group cursor-pointer">
                                 <td className="px-12 py-6">
                                    <div className="flex items-center gap-5">
                                       <div className="w-14 h-14 rounded-[22px] bg-white overflow-hidden ring-4 ring-slate-50 shadow-sm group-hover:ring-indigo-100 shrink-0">
                                          <img src={g.student?.profileImage ? \`http://localhost:7001/\${g.student.profileImage.replace(/\\\\/g, '/')}\` : \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${g.student?.fullName}\`} className="w-full h-full object-cover" />
                                       </div>
                                       <div className="min-w-0">
                                          <p className="text-base font-black text-slate-800 leading-tight mb-1 group-hover:text-indigo-600 truncate font-display">{g.student?.fullName}</p>
                                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{g.student?.studentId}</p>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-10 py-6 text-center text-sm font-black text-slate-700">{g.allReports.length} {g.allReports.length === 1 ? 'Record' : 'Records'}</td>
                                 <td className="px-10 py-6 text-center">
                                    <div className="flex flex-col items-center">
                                       <span className="text-sm font-black text-slate-800 font-display">{g.latestReport.averageTestMarks?.toFixed(0) || 0}%</span>
                                       <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-2.5 overflow-hidden shadow-inner"><div className="h-full bg-indigo-500 rounded-full" style={{width:\`\${g.latestReport.averageTestMarks || 0}%\`}}/></div>
                                    </div>
                                 </td>
                                 <td className="px-10 py-6 text-center">
                                    <span className={\`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest \${g.latestReport.overallPerformance === 'Excellent' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400 border border-slate-200/50'}\`}>{g.latestReport.overallPerformance}</span>
                                 </td>
                                 <td className="px-12 py-6 text-right space-x-2" onClick={e=>e.stopPropagation()}>
                                    <button onClick={() => handleOpenDetail(g)} className="p-3 bg-white text-slate-400 hover:text-indigo-600 rounded-xl shadow-sm border border-slate-100 transition-all hover:scale-110"><MdVisibility size={20}/></button>
                                    <button onClick={() => handleDelete(g.latestReport._id)} className="p-3 bg-white text-slate-400 hover:text-rose-600 rounded-xl shadow-sm border border-slate-100 transition-all hover:scale-110"><MdDeleteOutline size={20}/></button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            </motion.div>
         )}

         {activeTab === 'registry' && (
            <motion.div key="registry" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {students.map((s, idx) => (
                 <div key={s._id} className="bg-white/80 backdrop-blur-2xl p-10 rounded-[48px] border border-slate-200/50 shadow-sm relative group hover:shadow-2xl transition-all cursor-pointer overflow-hidden" onClick={() => navigate(\`/students/\${s._id}\`)}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600 opacity-[0.02] rounded-bl-full" />
                    <div className="flex items-center gap-6 mb-10 relative z-10">
                       <div className="w-20 h-20 rounded-[28px] bg-slate-50 overflow-hidden ring-4 ring-white shadow-2xl transition-transform group-hover:scale-105">
                          <img src={s.profileImage ? \`http://localhost:7001/\${s.profileImage}\` : \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${s.fullName}\`} className="w-full h-full object-cover" />
                       </div>
                       <div className="min-w-0">
                          <h4 className="text-xl font-black text-slate-800 tracking-tight leading-tight mb-1 group-hover:text-indigo-600 truncate font-display">{s.fullName}</h4>
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{s.course?.replace('-', ' ')}</p>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-5 mb-10 relative z-10">
                       <div className="bg-slate-50/80 p-5 rounded-3xl border border-slate-100/50">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Index ID</p>
                          <p className="text-sm font-black text-slate-700 font-display">{s.studentId || 'N/A'}</p>
                       </div>
                       <div className="bg-slate-50/80 p-5 rounded-3xl border border-slate-100/50">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Registry</p>
                          <p className="text-sm font-black text-slate-700 font-display">{s.batch}</p>
                       </div>
                    </div>
                    <div className="flex justify-between items-center pt-8 border-t border-slate-50 relative z-10">
                       <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-3">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" /> Profile Synced
                       </span>
                       <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center transition-all group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-110 shadow-sm">
                          <MdArrowForward size={22} />
                       </div>
                    </div>
                 </div>
               ))}
            </motion.div>
         )}

         {activeTab === 'questions' && (
            <motion.div key="questions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
               {allQuestions.map((q, i) => (
                 <div key={i} className="bg-white/80 backdrop-blur-2xl p-10 rounded-[56px] border border-slate-200/50 shadow-sm relative group hover:shadow-2xl transition-all overflow-hidden flex flex-col min-h-[260px]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600 opacity-[0.03] rounded-bl-full" />
                    <div className="flex justify-between items-start mb-8 shrink-0 relative z-10">
                       <div className="px-5 py-2 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100">{q.course}</div>
                       <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest italic font-display">L_{i+1}</span>
                    </div>
                    <div className="flex-1 space-y-6 relative z-10">
                       <h4 className="text-lg font-black text-slate-700 leading-tight line-clamp-3 group-hover:text-indigo-600 transition-colors font-display">"{q.questionText}"</h4>
                       <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><MdLayers size={18} /></div>
                          {q.type} Processor
                       </div>
                    </div>
                    <div className="mt-10 pt-8 border-t border-slate-50 flex justify-between items-center relative z-10">
                       <div className="min-w-0">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Source Operation</p>
                          <p className="text-xs font-bold text-slate-500 truncate">{q.taskTitle}</p>
                       </div>
                       <button onClick={()=>navigate(\`/tasks/\${q.id}\`)} className="w-12 h-12 bg-slate-50 text-slate-300 hover:text-indigo-600 hover:bg-white rounded-2xl flex items-center justify-center transition-all shadow-sm hover:scale-110">
                          <MdKeyboardArrowRight size={28} />
                       </button>
                    </div>
                 </div>
               ))}
            </motion.div>
         )}
       </AnimatePresence>

       {modalOpen && <CreateReportModal onClose={() => setModalOpen(false)} onSaved={fetchAllData} />}
    </div>
  );
};

export default Reports;\`;

fs.writeFileSync(path, content);
console.log("File completely reconstructed successfully!");
