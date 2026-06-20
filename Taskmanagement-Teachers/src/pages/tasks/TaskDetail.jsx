import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { 
  MdArrowBack, MdEdit, MdAttachFile, MdLink, 
  MdOutlineCalendarToday, MdSchool, MdWarningAmber,
  MdCheckCircle, MdPending, MdPerson, MdEmail, MdAccessTime,
  MdOutlineAssignment, MdVisibility, MdClose, MdFileDownload,
  MdChatBubbleOutline, MdQuiz, MdAutoGraph, MdKeyboardArrowRight, MdCloudDownload, MdPeople
} from 'react-icons/md';
import { 
  HiOutlineClipboardList, HiOutlineLightningBolt, HiOutlineBeaker, HiOutlineBookOpen 
} from 'react-icons/hi';

import { getApiBaseUrl } from '../../utils/api';

const API = `${getApiBaseUrl()}/api/tasks`;
const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZjFkNzg4YWFjMzdmNmYyM2JlN2UwOCIsImVtYWlsIjoicmF2aUBnbWFpbC5jb20iLCJpYXQiOjE3Nzc0NTg2OTYsImV4cCI6MTc3ODA2MzQ5Nn0.gPfeSWLz0fr2GxQ93IyiJgDURV40r6eob7x0-c_PfDc";

const TYPE_THEME = {
  Assignment: { gradient: 'from-violet-500 to-violet-600', light: 'bg-violet-50', icon: <HiOutlineClipboardList size={22} />, accent: 'text-violet-600' },
  Test: { gradient: 'from-rose-500 to-rose-600', light: 'bg-rose-50', icon: <HiOutlineLightningBolt size={22} />, accent: 'text-rose-600' },
  Project: { gradient: 'from-blue-600 to-blue-700', light: 'bg-blue-50', icon: <HiOutlineBeaker size={22} />, accent: 'text-blue-700' },
  Homework: { gradient: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-50', icon: <HiOutlineBookOpen size={22} />, accent: 'text-emerald-600' },
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
                   <div className="w-8 h-8 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center shadow-sm"><MdQuiz size={16} /></div>
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
                     <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-50 rounded-[20px] hover:border-violet-200 transition-all group">
                        <div className="flex items-center gap-3 truncate">
                           <div className="w-10 h-10 bg-slate-50 text-slate-400 group-hover:bg-violet-600 group-hover:text-white rounded-xl flex items-center justify-center shrink-0 transition-all"><MdCloudDownload size={20} /></div>
                           <div className="truncate">
                              <p className="text-[11px] font-bold text-slate-800 truncate">{file.split('/').pop()}</p>
                              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wide">Binary File</p>
                           </div>
                        </div>
                        <a href={`${getApiBaseUrl()}/${file}`} target="_blank" rel="noreferrer" className="w-8 h-8 bg-slate-50 text-slate-400 hover:text-violet-600 rounded-lg flex items-center justify-center transition-all"><MdVisibility size={16} /></a>
                     </div>
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

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [submissionStats, setSubmissionStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [previewSubmission, setPreviewSubmission] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } };
      const [taskRes, statsRes] = await Promise.all([
        axios.get(`${API}/${id}`, config),
        axios.get(`${API}/${id}/submission-stats`, config)
      ]);
      setTask(taskRes.data);
      setSubmissionStats(statsRes.data);
    } catch { toast.error('Secure Sync Error'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center space-y-4">
      <div className="w-16 h-16 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin" />
      <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]">Establishing Sync</p>
    </div>
  );
  if (!task) return <div className="p-20 text-center text-rose-500 font-bold uppercase tracking-wide">Task Not Found</div>;

  const theme = TYPE_THEME[task.Task_Type] || TYPE_THEME.Assignment;
  const submissionRate = submissionStats ? Math.round((submissionStats.submittedCount / submissionStats.totalAssigned) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-8 font-sans overflow-x-hidden">
      <Toaster position="top-right" />
      <div className="max-w-[1400px] mx-auto">
        
        {/* ✨ ELITE HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-10">
          <div className="space-y-4">
             <button onClick={() => navigate('/tasks')} className="flex items-center gap-2 text-slate-400 hover:text-violet-600 font-bold text-[9px] uppercase tracking-[0.2em] transition-all group">
               <MdArrowBack size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Wall
             </button>
             <div className="flex items-center gap-5">
                <div className={`w-16 h-16 bg-gradient-to-br ${theme.gradient} text-white rounded-2xl flex items-center justify-center shadow-xl shadow-violet-200 ring-4 ring-white`}>
                   {theme.icon}
                </div>
                <div>
                   <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[9px] font-bold uppercase tracking-[0.2em] ${theme.accent}`}>{task.Task_Type}</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full" />
                      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">{task.course}</span>
                   </div>
                   <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-none">{task.Title}</h1>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-4 bg-white p-3 rounded-[32px] shadow-sm border border-slate-50 w-full lg:w-auto">
             <div className="px-5 py-1.5 border-r border-slate-50 text-center">
                <p className="text-[7px] font-bold text-slate-300 uppercase tracking-wide mb-0.5">Success Rate</p>
                <p className="text-xl font-bold text-slate-900 leading-none">{submissionRate}%</p>
             </div>
             <div className="flex-1 lg:flex-none">
                <div className="w-32 h-2 bg-slate-50 rounded-full overflow-hidden mb-1">
                   <div className={`h-full bg-gradient-to-r ${theme.gradient} transition-all duration-1000`} style={{ width: `${submissionRate}%` }} />
                </div>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">{submissionStats?.submittedCount} / {submissionStats?.totalAssigned} Personnel</p>
             </div>
             <button onClick={() => navigate(`/tasks/edit/${id}`)} className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-violet-600 transition-all active:scale-95 shadow-lg">
                <MdEdit size={20}/>
             </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-50 w-fit mb-10 shadow-sm">
           <button onClick={() => setActiveTab('details')} className={`px-8 py-3 rounded-[18px] text-[9px] font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${activeTab === 'details' ? 'bg-white text-violet-600 shadow-lg' : 'text-slate-400'}`}>
              <MdOutlineAssignment size={16}/> Mission Blueprint
           </button>
           <button onClick={() => setActiveTab('submissions')} className={`px-8 py-3 rounded-[18px] text-[9px] font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${activeTab === 'submissions' ? 'bg-white text-violet-600 shadow-lg' : 'text-slate-400'}`}>
              <MdAutoGraph size={16}/> Field Reports
           </button>
        </div>

        {activeTab === 'details' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             
             {/* 📦 Blueprint Card */}
             <div className="bg-white rounded-3xl p-10 border border-slate-50 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-violet-600 opacity-[0.01] rounded-bl-full" />
                <div className="space-y-10 relative z-10">
                   <div>
                      <h2 className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                         <span className="w-7 h-7 bg-violet-50 text-violet-600 rounded-lg flex items-center justify-center"><MdOutlineAssignment size={14}/></span>
                         Operational Directives
                      </h2>
                      <div className="p-8 bg-[#F8FAFC] rounded-[32px] border border-slate-50">
                         <p className="text-slate-600 text-sm font-bold leading-relaxed whitespace-pre-wrap">{task.Description || "No directives."}</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white p-6 rounded-[32px] border border-slate-50 shadow-sm flex items-center gap-4">
                         <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><MdSchool size={20}/></div>
                         <div>
                            <p className="text-[8px] font-bold text-slate-300 uppercase tracking-wide">Target Fleet</p>
                            <span className="text-sm font-bold text-slate-800">{task.Batch}</span>
                         </div>
                      </div>
                      <div className="bg-white p-6 rounded-[32px] border border-slate-50 shadow-sm flex items-center gap-4">
                         <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center"><MdOutlineCalendarToday size={20}/></div>
                         <div>
                            <p className="text-[8px] font-bold text-slate-300 uppercase tracking-wide">Mission Deadline</p>
                            <span className="text-sm font-bold text-slate-800">{new Date(task.Deadline).toLocaleDateString()}</span>
                         </div>
                      </div>
                      <div className="bg-white p-6 rounded-[32px] border border-slate-50 shadow-sm flex items-center gap-4">
                         <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center"><HiOutlineLightningBolt size={20}/></div>
                         <div>
                            <p className="text-[8px] font-bold text-slate-300 uppercase tracking-wide">Strategic Priority</p>
                            <span className="text-sm font-bold text-slate-800">{task.Priority}</span>
                         </div>
                      </div>
                   </div>

                   {(task.Attachments?.length > 0 || task.Links?.length > 0) && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                         {task.Attachments?.length > 0 && (
                           <div className="space-y-4">
                              <h2 className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2"><MdAttachFile className="text-violet-500" /> Intelligence Assets</h2>
                              <div className="grid grid-cols-1 gap-2">
                                 {task.Attachments.map((a, i) => (
                                   <a key={i} href={`${getApiBaseUrl()}/${a}`} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-2xl border border-slate-50 hover:bg-white hover:shadow-lg transition-all group">
                                      <div className="flex items-center gap-3 truncate">
                                         <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[8px] font-bold text-rose-500 border border-slate-50">PDF</div>
                                         <span className="text-[11px] font-bold text-slate-700 truncate max-w-[200px]">{a.split('/').pop()}</span>
                                      </div>
                                      <MdFileDownload className="text-slate-300 group-hover:text-violet-600 transition-colors" size={18} />
                                   </a>
                                 ))}
                              </div>
                           </div>
                         )}
                         {task.Links?.length > 0 && (
                           <div className="space-y-4">
                              <h2 className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2"><MdLink className="text-amber-500" /> Digital Nexus</h2>
                              <div className="grid grid-cols-1 gap-2">
                                 {task.Links.map((l, i) => (
                                   <a key={i} href={l} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-2xl border border-slate-50 hover:bg-white hover:shadow-lg transition-all group">
                                      <div className="flex items-center gap-3 truncate">
                                         <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-amber-500 border border-slate-50"><MdLink size={16}/></div>
                                         <span className="text-[11px] font-bold text-slate-700 truncate max-w-[200px]">{l}</span>
                                      </div>
                                      <MdKeyboardArrowRight className="text-slate-300 group-hover:text-amber-600 transition-colors" size={18} />
                                   </a>
                                 ))}
                              </div>
                           </div>
                         )}
                      </div>
                   )}
                </div>
             </div>

             {/* 🧩 THE QUESTIONS WALL */}
             {task.questions?.length > 0 && (
                <div className="bg-white rounded-3xl p-10 border border-slate-50 shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-48 h-48 bg-rose-600 opacity-[0.01] rounded-bl-full" />
                   <div className="relative z-10 space-y-8">
                      <h2 className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em] flex items-center gap-3">
                         <span className="w-8 h-8 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center"><MdQuiz size={16}/></span>
                         Questions Wall
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {task.questions.map((q, i) => (
                            <div key={i} className="p-6 bg-[#F8FAFC] rounded-[32px] border border-slate-50 group hover:bg-white hover:shadow-xl transition-all">
                               <div className="flex justify-between items-start mb-3">
                                  <span className="px-3 py-1 bg-white border border-slate-100 rounded-lg text-[9px] font-bold text-slate-400 uppercase tracking-wide shadow-sm">Q{i+1} • {q.type}</span>
                               </div>
                               <h4 className="text-[13px] font-bold text-slate-800 leading-relaxed mb-4 line-clamp-3">{q.questionText}</h4>
                               
                               {q.type === 'MCQ' && q.options && (
                                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100/50">
                                     {q.options.map((opt, oIdx) => (
                                        <div key={oIdx} className="px-3 py-1.5 bg-white border border-slate-50 rounded-lg text-[10px] font-bold text-slate-500 flex items-center gap-2">
                                           <span className="w-4 h-4 bg-rose-50 text-rose-500 rounded-md flex items-center justify-center text-[8px] font-bold">{String.fromCharCode(65+oIdx)}</span>
                                           {opt}
                                        </div>
                                     ))}
                                  </div>
                               )}
                            </div>
                         ))}
                      </div>
                   </div>
                </div>
             )}
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
             {/* Bento Stats Row */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-3xl border border-emerald-50 shadow-sm flex items-center gap-6 relative overflow-hidden">
                   <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner"><MdCheckCircle size={32}/></div>
                   <div>
                      <p className="text-[9px] font-bold text-emerald-800 uppercase tracking-wide mb-0.5">Finalized</p>
                      <h4 className="text-3xl font-bold text-slate-900 leading-none">{submissionStats?.submittedCount}</h4>
                   </div>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-rose-50 shadow-sm flex items-center gap-6 relative overflow-hidden">
                   <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shadow-inner"><MdPending size={32}/></div>
                   <div>
                      <p className="text-[9px] font-bold text-rose-800 uppercase tracking-wide mb-0.5">Awaiting</p>
                      <h4 className="text-3xl font-bold text-slate-900 leading-none">{submissionStats?.pendingCount}</h4>
                   </div>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-violet-50 shadow-sm flex items-center gap-6 relative overflow-hidden">
                   <div className="w-14 h-14 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center shadow-inner"><MdPeople size={32}/></div>
                   <div>
                      <p className="text-[9px] font-bold text-violet-800 uppercase tracking-wide mb-0.5">Total Force</p>
                      <h4 className="text-3xl font-bold text-slate-900 leading-none">{submissionStats?.totalAssigned}</h4>
                   </div>
                </div>
             </div>

             {/* Pro Tracking Table */}
             <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-[#F8FAFC]/50">
                   <div>
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-none mb-1">Academic Tracking Hub</h3>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide italic">Monitoring real-time scholar deployment</p>
                   </div>
                   <MdAutoGraph className="text-violet-600" size={24}/>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                      <thead>
                         <tr className="bg-slate-50/30 text-[9px] font-bold text-slate-400 uppercase tracking-wide border-b border-slate-50">
                            <th className="px-10 py-5">Personnel</th>
                            <th className="px-8 py-5">Identifier</th>
                            <th className="px-8 py-5 text-center">Status</th>
                            <th className="px-8 py-5">Timestamp</th>
                            <th className="px-10 py-5 text-right">Operation</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                         {submissionStats?.stats.map((row, i) => (
                           <tr key={i} className="hover:bg-[#F8FAFC] transition-colors group">
                              <td className="px-10 py-6">
                                 <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm ring-2 ring-white relative shrink-0">
                                       <img src={row.student.profileImage ? `${getApiBaseUrl()}/${row.student.profileImage}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${row.student.fullName}`} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="truncate">
                                       <p className="text-sm font-bold text-slate-900 tracking-tight truncate leading-none mb-1">{row.student.fullName}</p>
                                       <p className="text-[9px] font-bold text-slate-400 uppercase truncate tracking-wide">{row.student.email}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-6"><span className="text-[9px] font-bold text-slate-500 bg-white border border-slate-100 px-3 py-1 rounded-lg uppercase tracking-wide">{row.student.studentId || 'N/A'}</span></td>
                              <td className="px-8 py-6 text-center">
                                 <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-wide shadow-sm ${row.status === 'Submitted' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                    {row.status}
                                 </span>
                              </td>
                              <td className="px-8 py-6">
                                 {row.submissionDate ? (
                                   <div className="space-y-0.5">
                                      <p className="text-[11px] font-bold text-slate-700 tracking-tight">{new Date(row.submissionDate).toLocaleDateString()}</p>
                                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">{new Date(row.submissionDate).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                                   </div>
                                 ) : <span className="text-[8px] font-bold text-slate-200 uppercase tracking-wide italic">Awaiting</span>}
                              </td>
                              <td className="px-10 py-6 text-right">
                                 {row.status === 'Submitted' ? (
                                   <button 
                                     onClick={() => setPreviewSubmission({ data: row.submissionData, student: row.student })}
                                     className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-[9px] uppercase tracking-wide hover:bg-violet-600 transition-all flex items-center gap-2 ml-auto shadow-lg active:scale-95"
                                   >
                                      <MdVisibility size={16} /> Review
                                   </button>
                                 ) : <span className="text-[9px] font-bold text-slate-200 uppercase tracking-wide mr-4 italic">No Intel</span>}
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        )}

        {/* Submission Review Modal */}
        {previewSubmission && (
          <SubmissionModal 
            submission={previewSubmission.data} 
            student={previewSubmission.student} 
            onClose={() => setPreviewSubmission(null)} 
          />
        )}
      </div>
    </div>
  );
};

export default TaskDetail;
