import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { 
  MdAdd, MdClose, MdEmail, MdShowChart, MdEdit, MdDeleteOutline, 
  MdSearch, MdFilterList, MdRefresh, MdSchool, MdClass, MdPerson,
  MdPhone, MdCalendarToday, MdAssessment, MdWarningAmber, MdClearAll,
  MdCameraAlt, MdTransgender, MdFactCheck, MdLayers, MdArrowForward,
  MdCheckCircle, MdOutlineClass, MdFiberManualRecord, MdKeyboardArrowRight
} from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';

import { getApiBaseUrl } from '../../utils/api';

const AUTH_TOKEN = () => localStorage.getItem('token');
const API = `${getApiBaseUrl()}/api/students`;
const BASE_URL = `${getApiBaseUrl()}/`;

const COURSES = [
  "Software-Development", "Data-Science", "Cyber-Security", "Cloud-Computing", 
  "Artificial-Intelligence", "Digital-Marketing", "UI-UX-Design", 
  "Business-Analytics", "Project-Management", "DevOps"
];

const Students = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ course: 'All', status: 'All' });
  const [modalOpen, setModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);

  const fetchStudents = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${AUTH_TOKEN()}` },
        params: { search, ...filters }
      });
      setStudents(res.data.students || []);
    } catch { 
      toast.error('Sync Error'); 
    } finally { 
      setLoading(false); 
      setRefreshing(false);
    }
  }, [search, filters]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove from registry?')) return;
    try {
      await axios.delete(`${API}/${id}`, { headers: { Authorization: `Bearer ${AUTH_TOKEN()}` } });
      toast.success('Purged');
      fetchStudents(true);
    } catch { toast.error('Purge Failed'); }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchSearch = s.fullName.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
      const matchCourse = filters.course === 'All' || s.course === filters.course;
      return matchSearch && matchCourse;
    });
  }, [students, search, filters.course]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-700 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 pb-20">
      <Toaster position="top-right" />
      
      {/* 🚀 ELITE HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h1 className="text-3xl font-bold text-slate-800 tracking-tight  mb-1">Personnel Directory</h1>
           <p className="text-slate-400 font-bold text-xs flex items-center gap-2">
             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
             {filteredStudents.length} Active Records
           </p>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={() => fetchStudents(true)} className={`p-3.5 bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 text-slate-400 hover:text-blue-700 transition-all ${refreshing ? 'animate-spin' : ''}`}>
              <MdRefresh size={22} />
           </button>
        </div>
      </div>

      {/* 🔍 SEARCH & FILTERS - GLASS DESIGN */}
      <div className="bg-white/80 backdrop-blur-2xl p-3 rounded-3xl border border-slate-200/50 shadow-sm flex flex-col lg:flex-row gap-3">
         <div className="flex-1 relative group">
            <MdSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-700 transition-colors" size={20} />
            <input 
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search personnel identity..." 
              className="w-full pl-14 pr-6 py-3.5 bg-slate-50/50 border border-transparent focus:border-blue-100 rounded-2xl text-sm font-bold text-slate-700 outline-none transition-all placeholder:text-slate-300"
            />
         </div>
         <div className="flex gap-3">
            <select 
              value={filters.course} onChange={e => setFilters({...filters, course: e.target.value})} 
              className="px-6 py-3.5 bg-slate-50/50 border border-transparent focus:border-blue-100 rounded-2xl text-[10px] font-bold uppercase tracking-wide text-slate-500 outline-none cursor-pointer hover:bg-blue-50/50 transition-all"
            >
               <option value="All">All Specializations</option>
               {COURSES.map(c => <option key={c} value={c}>{c.replace(/-/g, ' ')}</option>)}
            </select>
            <button className="p-3.5 bg-slate-900 text-white rounded-2xl hover:bg-blue-700 transition-all">
               <MdFilterList size={20} />
            </button>
         </div>
      </div>

      {/* 📋 ULTIMATE TABLE DIRECTORY */}
      <div className="bg-white/80 backdrop-blur-2xl rounded-3xl border border-slate-200/50 shadow-sm overflow-hidden">
         <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50/30 border-b border-slate-100">
                     <th className="px-10 py-6 text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Personnel ID & Identity</th>
                     <th className="px-8 py-6 text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">Batch</th>
                     <th className="px-8 py-6 text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Course Stream</th>
                     <th className="px-8 py-6 text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">Registry Status</th>
                     <th className="px-10 py-6 text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  <AnimatePresence>
                    {filteredStudents.length > 0 ? filteredStudents.map((s, idx) => (
                       <motion.tr 
                         key={s._id}
                         initial={{ opacity: 0, x: -10 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ delay: idx * 0.02 }}
                         onClick={() => navigate(`/students/${s._id}`)}
                         className="hover:bg-blue-50/30 transition-all group cursor-pointer relative"
                       >
                          <td className="px-10 py-5">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white overflow-hidden ring-4 ring-slate-50 shadow-sm group-hover:ring-blue-100 transition-all shrink-0">
                                   <img 
                                     src={s.profileImage ? `${BASE_URL}${s.profileImage}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.fullName}`} 
                                     alt={s.fullName} 
                                     className="w-full h-full object-cover"
                                   />
                                </div>
                                <div className="min-w-0">
                                   <p className="text-sm font-bold text-slate-800 tracking-tight leading-tight mb-1 group-hover:text-blue-700 transition-colors truncate">{s.fullName}</p>
                                   <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide truncate">{s.email}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-5 text-center">
                             <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide bg-slate-100/50 px-4 py-1.5 rounded-xl border border-slate-200/30">
                               {s.batch}
                             </span>
                          </td>
                          <td className="px-8 py-5">
                             <div className="flex flex-col">
                                <span className="text-[13px] font-bold text-slate-700 tracking-tight">{s.course?.replace(/-/g, ' ')}</span>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide mt-0.5 italic">{s.gender || 'Scholar'}</span>
                             </div>
                          </td>
                          <td className="px-8 py-5 text-center">
                             <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full text-[9px] font-bold uppercase tracking-wide ${s.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${s.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                                {s.status}
                             </div>
                          </td>
                          <td className="px-10 py-5 text-right" onClick={e => e.stopPropagation()}>
                             <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                <button onClick={() => { setCurrentStudent(s); setModalOpen(true); }} className="p-2.5 bg-white text-slate-400 hover:text-blue-700 rounded-xl shadow-sm border border-slate-100 transition-all">
                                   <MdEdit size={16} />
                                </button>
                                <button onClick={() => handleDelete(s._id)} className="p-2.5 bg-white text-slate-400 hover:text-rose-500 rounded-xl shadow-sm border border-slate-100 transition-all">
                                   <MdDeleteOutline size={16} />
                                </button>
                                <button onClick={() => navigate(`/students/${s._id}`)} className="p-2.5 bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-100 transition-all ml-1">
                                   <MdKeyboardArrowRight size={20} />
                                </button>
                             </div>
                          </td>
                       </motion.tr>
                    )) : (
                       <tr>
                          <td colSpan="5" className="py-40 text-center opacity-30 text-[11px] font-bold uppercase tracking-wide">No Active Personnel Found</td>
                       </tr>
                    )}
                  </AnimatePresence>
               </tbody>
            </table>
         </div>
      </div>
      
      {/* Modal Re-Polish */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
           <motion.div 
             initial={{ scale: 0.95, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl relative"
           >
              <button onClick={() => setModalOpen(false)} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-rose-500 transition-all"><MdClose size={24} /></button>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight  mb-6">Modify Identity</h2>
              <div className="space-y-5">
                 <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-2 block ml-1">Personnel Full Name</label>
                    <input className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-400 transition-all" defaultValue={currentStudent?.fullName} />
                 </div>
                 <button className="w-full py-4.5 bg-blue-700 text-white rounded-[20px] font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-100 hover:bg-blue-800 transition-all mt-4">
                    Commit Changes
                 </button>
              </div>
           </motion.div>
        </div>
      )}
    </div>
  );
};

export default Students;
