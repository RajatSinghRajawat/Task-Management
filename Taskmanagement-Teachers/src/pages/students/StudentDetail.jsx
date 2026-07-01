import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { 
  MdArrowBack, MdEmail, MdPhone, MdLocationOn, MdCake, MdSchool, 
  MdClass, MdCalendarToday, MdTrendingUp, MdAssignment, MdCheckCircle,
  MdWarning, MdPerson, MdEdit, MdAssessment, MdOutlineClass, MdRefresh,
  MdLayers, MdAutoFixHigh, MdOutlineCalendarMonth, MdAnalytics, MdKeyboardArrowRight,
  MdDescription, MdVisibility, MdClose, MdAccessTime, MdAttachFile, MdCloudDownload,
  MdChatBubbleOutline, MdQuestionAnswer
} from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';

import { getApiBaseUrl } from '../../utils/api';

const API = `${getApiBaseUrl()}/api/students`;
const REPORTS_API = `${getApiBaseUrl()}/api/reports`;
const AUTH_TOKEN = () => localStorage.getItem('token');

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [reports, setReports] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [previewSubmission, setPreviewSubmission] = useState(null);

  const fetchStudentData = useCallback(async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${AUTH_TOKEN()}` } };
      const [stuRes, repRes, actRes] = await Promise.all([
        axios.get(`${API}/${id}`, config),
        axios.get(REPORTS_API, config),
        axios.get(`${API}/${id}/activity`, config)
      ]);
      setStudent(stuRes.data);
      setActivity(actRes.data || []);
      // Filter reports for this student
      const studentReports = (repRes.data.reports || []).filter(r => r.student?._id === id || r.student === id);
      setReports(studentReports);
    } catch (err) {
      toast.error('Sync Error');
      navigate('/students');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { fetchStudentData(); }, [fetchStudentData]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-700 rounded-full animate-spin"></div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Loading Student Profile...</p>
    </div>
  );

  if (!student) return null;

  const attendanceRate = student.totalClasses ? ((student.present / student.totalClasses) * 100).toFixed(1) : 0;
  
  const stats = [
    { label: 'Attendance', value: `${attendanceRate}%`, icon: <MdOutlineCalendarMonth/>, color: 'text-emerald-600' },
    { label: 'Academic Performance', value: `${student.averageMarks || 0}%`, icon: <MdAnalytics/>, color: 'text-blue-700' },
    { label: 'Tasks Completed', value: student.tasksCompleted || 0, icon: <MdCheckCircle/>, color: 'text-blue-700' },
    { label: 'Reports Published', value: reports.length, icon: <MdDescription/>, color: 'text-amber-600' },
  ];

  return (
    <div className="w-full space-y-10 animate-in fade-in duration-500 max-w-6xl mx-auto pb-20">
      <Toaster position="top-right" />
      
      {/* 🚀 HEADER */}
      <div className="flex justify-between items-center">
        <button onClick={() => navigate('/students')} className="flex items-center gap-2 text-slate-400 hover:text-blue-700 transition-colors font-bold text-sm uppercase tracking-wide active:scale-95">
          <MdArrowBack size={20}/> Student Directory
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* 👤 LEFT: PROFILE CARD */}
        <div className="space-y-8">
          <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-3xl border border-slate-200/50 shadow-sm text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-slate-900 to-blue-900 opacity-[0.03]" />
             <div className="w-32 h-32 rounded-[32px] bg-slate-50 mx-auto overflow-hidden ring-4 ring-white shadow-inner relative z-10">
                <img 
                  src={student.profileImage ? `${getApiBaseUrl()}/${student.profileImage}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.fullName}`} 
                  alt={student.fullName} 
                  className="w-full h-full object-cover"
                />
             </div>
             <h2 className="text-2xl font-bold text-slate-800 mt-6 tracking-tight relative z-10">{student.fullName}</h2>
             <p className="text-blue-700 font-bold uppercase tracking-wide text-[9px] mt-1 relative z-10">{student.course?.replace(/-/g, ' ')}</p>
             
             <div className="mt-8 pt-8 border-t border-slate-50 space-y-4 text-left relative z-10">
                <div className="flex items-center gap-4 text-slate-500">
                   <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center"><MdEmail size={16} /></div>
                   <span className="text-xs font-bold truncate">{student.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-4 text-slate-500">
                   <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center"><MdPhone size={16} /></div>
                   <span className="text-xs font-bold">{student.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-4 text-slate-500">
                   <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center"><MdSchool size={16} /></div>
                   <span className="text-xs font-bold">Batch {student.batch}</span>
                </div>
             </div>
          </div>

          {/* 📋 REPORTS PREVIEW WALL */}
          <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full translate-x-16 -translate-y-16 blur-2xl group-hover:scale-110 transition-transform duration-1000"></div>
             <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2"><MdDescription size={20} className="text-indigo-400" /> Evaluations</h3>
                </div>
                <div className="space-y-4">
                   {reports.length > 0 ? reports.slice(0, 3).map((r, i) => (
                      <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all cursor-pointer">
                         <div>
                            <p className="text-xs font-bold text-slate-300">{r.reportTitle}</p>
                            <span className="text-[9px] font-bold text-indigo-400">{r.overallPerformance}</span>
                         </div>
                      </div>
                   )) : (
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide italic">No reports generated yet.</p>
                   )}
                   {reports.length > 3 && <button onClick={() => navigate('/reports')} className="text-[9px] font-bold text-blue-400 uppercase tracking-wide hover:underline mt-2">View All Reports</button>}
                </div>
             </div>
          </div>
        </div>

        {/* 📊 RIGHT: ANALYTICS & TIMELINE */}
        <div className="lg:col-span-2 space-y-8">
           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map((s, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-2xl p-6 rounded-[32px] border border-slate-200/50 shadow-sm text-center group hover:shadow-xl transition-all">
                   <div className={`${s.color} mb-3 flex justify-center group-hover:scale-110 transition-transform`}>{s.icon}</div>
                   <p className="text-xl font-bold text-slate-800 leading-none">{s.value}</p>
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-2">{s.label}</p>
                </div>
              ))}
           </div>

           {/* 🟢 CONTRIBUTION GRAPH (ENHANCED) */}
           <div className="bg-white/80 backdrop-blur-2xl rounded-3xl border border-slate-200/50 shadow-sm p-8 space-y-8 relative overflow-hidden">
              <div className="flex justify-between items-center">
                 <div>
                    <h3 className="text-lg font-bold text-slate-800 ">Task Contribution Activity</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">Real-time performance mapping</p>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-[4px] bg-emerald-500" /><span className="text-[9px] font-bold text-slate-400 uppercase">On-Time</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-[4px] bg-amber-500" /><span className="text-[9px] font-bold text-slate-400 uppercase">Late</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-[4px] bg-rose-500" /><span className="text-[9px] font-bold text-slate-400 uppercase">Missed</span></div>
                 </div>
              </div>
              
              <div className="flex gap-4">
                 <div className="flex flex-col justify-between py-1 text-[9px] font-bold text-slate-300 uppercase tracking-tight">
                    <span>SOM</span>
                    <span>MAN</span>
                    <span>BUD</span>
                    <span>JUM</span>
                    <span>SHU</span>
                    <span>SAN</span>
                    <span>AIT</span>
                 </div>

                 <div className="flex-1 overflow-x-auto scrollbar-hide">
                    <div className="flex gap-2">
                       {Array.from({ length: 12 }).map((_, weekIdx) => (
                          <div key={weekIdx} className="flex flex-col gap-2">
                             {Array.from({ length: 7 }).map((_, dayIdx) => {
                                const totalDays = (11 - weekIdx) * 7 + (6 - dayIdx);
                                const date = new Date();
                                date.setDate(date.getDate() - totalDays);
                                const dateStr = date.toISOString().split('T')[0];
                                const dayActivity = activity.find(a => a.date === dateStr);
                                
                                let color = 'bg-slate-100';
                                if (dayActivity) {
                                   if (dayActivity.status === 'Completed') color = 'bg-emerald-500 shadow-lg shadow-emerald-500/20';
                                   else if (dayActivity.status === 'Late') color = 'bg-amber-500 shadow-lg shadow-amber-500/20';
                                   else if (dayActivity.status === 'Missed') color = 'bg-rose-500 shadow-lg shadow-rose-500/20';
                                }

                                return (
                                   <div 
                                     key={dayIdx} 
                                     title={dayActivity ? `${dayActivity.taskTitle} (${dayActivity.fullDate}): ${dayActivity.status}` : `${date.toDateString()}: No Activity`}
                                     onClick={() => dayActivity && setSelectedActivity(dayActivity)}
                                     className={`w-4 h-4 rounded-[4px] ${color} transition-all hover:scale-125 cursor-pointer relative group`}
                                   >
                                   </div>
                                );
                             })}
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
              
              <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide italic opacity-60">Displaying task history for the last 84 days (12 weeks).</p>
                 <div className="flex items-center gap-2 text-[9px] font-bold text-blue-700 uppercase tracking-wide bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">
                    <MdAutoFixHigh size={14} /> Total Impact: {activity.filter(a => a.status === 'Completed').length} Missions
                 </div>
              </div>

              <AnimatePresence>
                 {selectedActivity && (
                    <motion.div 
                       initial={{ opacity: 0, scale: 0.9 }} 
                       animate={{ opacity: 1, scale: 1 }} 
                       exit={{ opacity: 0, scale: 0.9 }}
                       className="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-[60] flex flex-col items-center justify-center p-8 text-center rounded-3xl"
                    >
                       <button type="button" onClick={() => setSelectedActivity(null)} className="absolute top-8 right-8 p-3 bg-white/10 text-white/40 rounded-2xl hover:text-white transition-all"><MdArrowBack className="rotate-90" size={20} /></button>
                       <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center ${selectedActivity.status === 'Completed' ? 'bg-emerald-500' : selectedActivity.status === 'Late' ? 'bg-amber-500' : 'bg-rose-500'} text-white shadow-2xl shadow-slate-900/50`}>
                          <MdCheckCircle size={32} />
                       </div>
                       <h4 className="text-white font-bold text-xl uppercase tracking-tight mb-2 ">{selectedActivity.taskTitle}</h4>
                       <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-6">{selectedActivity.fullDate}</p>
                       <div className="flex flex-col gap-4 w-full max-w-[240px]">
                          <div className={`px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg ${selectedActivity.status === 'Completed' ? 'bg-emerald-500 text-white' : selectedActivity.status === 'Late' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'}`}>
                             {selectedActivity.status}
                          </div>
                          <button 
                             type="button"
                             onClick={() => navigate(`/tasks/${selectedActivity.taskId}`)}
                             className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
                          >
                             <MdVisibility size={16} /> INSPECT MISSION
                          </button>
                       </div>
                    </motion.div>
                 )}
              </AnimatePresence>
           </div>

           <div className="bg-white/80 backdrop-blur-2xl rounded-3xl border border-slate-200/50 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                 <h3 className="text-lg font-bold text-slate-800 ">Mission History</h3>
                 <span className="text-[9px] font-bold text-blue-700 uppercase tracking-wide bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">
                    {student.tasks?.length || 0} Assignments
                 </span>
              </div>
              <div className="overflow-x-auto scrollbar-hide">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="border-b border-slate-50 bg-slate-50/20">
                          <th className="px-8 py-4 text-[9px] font-bold text-slate-400 uppercase tracking-wide">Operation</th>
                          <th className="px-8 py-4 text-[9px] font-bold text-slate-400 uppercase tracking-wide text-center">Status</th>
                          <th className="px-8 py-4 text-[9px] font-bold text-slate-400 uppercase tracking-wide text-center">Submission</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {student.tasks && student.tasks.length > 0 ? student.tasks.map((task, i) => (
                         <tr key={i} className="hover:bg-blue-50/30 transition-colors group">
                            <td className="px-8 py-5">
                               <p className="text-sm font-bold text-slate-700 group-hover:text-blue-700 transition-colors">{task.Title || "Untitled Task"}</p>
                               <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Deadline: {new Date(task.Deadline).toLocaleDateString()}</p>
                            </td>
                            <td className="px-8 py-5 text-center">
                               <span className={`text-[9px] font-bold uppercase tracking-wide px-4 py-1.5 rounded-xl ${
                                 task.submissionStatus === 'Submitted' || task.submissionStatus === 'Graded' || task.submissionStatus === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 
                                 task.submissionStatus === 'Late' ? 'bg-amber-50 text-amber-500' :
                                 task.submissionStatus === 'Missed' ? 'bg-rose-50 text-rose-600' :
                                 'bg-slate-50 text-slate-400'
                               }`}>
                                  {task.submissionStatus || task.Status}
                               </span>
                            </td>
                            <td className="px-8 py-5 text-center">
                               {task.submissionDate ? (
                                  <div className="flex flex-col items-center gap-1.5">
                                     <p className="text-[10px] font-bold text-slate-500">
                                        {new Date(task.submissionDate).toLocaleString()}
                                     </p>
                                     {task.submissionData && (
                                        <button 
                                           type="button"
                                           onClick={() => setPreviewSubmission({ data: task.submissionData, student })}
                                           className="px-3 py-1 bg-violet-50 text-violet-600 rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-violet-600 hover:text-white transition-all shadow-sm active:scale-95 animate-in fade-in"
                                        >
                                           Inspect
                                        </button>
                                     )}
                                  </div>
                               ) : (
                                  <p className="text-[10px] font-bold text-slate-300">---</p>
                                )}
                            </td>
                         </tr>
                       )) : (
                         <tr>
                            <td colSpan="3" className="py-20 text-center opacity-30 text-[10px] font-bold uppercase tracking-wide">No Operational History</td>
                         </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* EVALUATION BLOCK */}
           <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-3xl border border-slate-200/50 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-700 opacity-[0.02] rounded-bl-full" />
              <div className="relative z-10 flex items-start gap-6">
                 <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"><MdAutoFixHigh size={24}/></div>
                 <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-3">Professional Evaluation</h4>
                    <p className="text-base font-bold text-slate-600 leading-relaxed italic">
                       "{student.remarks || "No professional evaluation found. Continuous performance mapping required to maintain academic indices."}"
                    </p>
                 </div>
              </div>
           </div>
        </div>

      </div>

      {previewSubmission && (
        <SubmissionModal 
          submission={previewSubmission.data} 
          student={previewSubmission.student} 
          onClose={() => setPreviewSubmission(null)} 
        />
      )}
    </div>
  );
};

// ── Submission Preview Modal ──────────────────────────────────────────
const SubmissionModal = ({ submission, student, onClose }) => {
  if (!submission) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh] border border-white/20">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-[#F8FAFC]/80 backdrop-blur-sm">
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-xl ring-4 ring-white relative group">
                 <img src={student.profileImage ? `${getApiBaseUrl()}/${student.profileImage}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.fullName}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
              </div>
              <div>
                 <p className="text-[9px] text-violet-600 font-bold uppercase tracking-[0.2em] mb-0.5">Submission Portfolio</p>
                 <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{student.fullName}</h2>
                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide flex items-center gap-2"><MdAccessTime className="text-slate-300"/> Logged {new Date(submission.submissionDate).toLocaleString()}</p>
              </div>
           </div>
           <button onClick={onClose} className="w-12 h-12 bg-white text-slate-400 hover:text-rose-600 rounded-xl transition-all shadow-sm border border-slate-50 flex items-center justify-center"><MdClose size={24} /></button>
        </div>

        <div className="p-8 overflow-y-auto space-y-10 no-scrollbar">
           {submission.answers?.length > 0 && (
             <div className="space-y-6">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center shadow-sm"><MdQuestionAnswer size={16} /></div>
                   <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-[0.2em]">Response Intelligence</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                   {submission.answers.map((ans, i) => (
                     <div key={i} className="p-6 bg-[#F8FAFC] rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-lg transition-all">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                           <span className="w-5 h-5 rounded-md bg-white border border-slate-200 flex items-center justify-center text-[7px] text-slate-900">{i+1}</span>
                           {ans.questionText}
                        </p>
                        <div className="text-xs font-bold text-slate-800 leading-relaxed bg-white p-4 rounded-xl border border-slate-50 group-hover:border-violet-100">
                           {ans.answer || <span className="text-slate-300 italic font-medium">No response recorded.</span>}
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           )}

           {submission.files?.length > 0 && (
             <div className="space-y-6">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shadow-sm"><MdAttachFile size={16} /></div>
                   <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-[0.2em]">Deployment Assets</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                   {submission.files.map((file, i) => (
                      <a key={i} href={`${getApiBaseUrl()}/${file.replace(/\\/g, '/')}`} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-white border border-slate-50 rounded-[20px] hover:border-violet-200 transition-all group cursor-pointer animate-in fade-in">
                         <div className="flex items-center gap-3 truncate">
                            <div className="w-10 h-10 bg-slate-50 text-slate-400 group-hover:bg-violet-600 group-hover:text-white rounded-xl flex items-center justify-center shrink-0 transition-all"><MdCloudDownload size={20} /></div>
                            <div className="truncate">
                               <p className="text-[11px] font-bold text-slate-800 truncate">{file.split(/[\\/]/).pop()}</p>
                               <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wide">Binary File</p>
                            </div>
                         </div>
                         <div className="w-8 h-8 bg-slate-50 text-slate-400 hover:text-violet-600 rounded-lg flex items-center justify-center transition-all"><MdVisibility size={16} /></div>
                      </a>
                   ))}
                </div>
             </div>
           )}

           <div className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center shadow-sm"><MdChatBubbleOutline size={16} /></div>
                 <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-[0.2em]">Student Narrative</h3>
              </div>
              <div className="p-6 bg-amber-50/20 rounded-2xl border border-amber-100/30">
                 <p className="text-slate-600 text-xs font-bold leading-relaxed italic">
                    "{submission.feedback || submission.comments || "No commentary provided."}"
                 </p>
              </div>
           </div>
        </div>

        <div className="p-8 border-t border-slate-50 bg-[#F8FAFC]/80 backdrop-blur-sm flex justify-end">
           <button onClick={onClose} className="px-10 py-4 bg-slate-900 text-white font-bold text-[10px] uppercase tracking-wide rounded-xl shadow-xl hover:bg-violet-600 transition-all">Finalize Review</button>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;
