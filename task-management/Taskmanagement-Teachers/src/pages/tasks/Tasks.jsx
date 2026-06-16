import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
   MdAdd, MdEdit, MdDeleteOutline, MdSearch, MdRefresh,
   MdCalendarToday, MdSchool, MdOutlineClass, 
   MdDoneAll, MdPendingActions, MdErrorOutline, MdListAlt,
   MdFilterList, MdClearAll, MdKeyboardArrowRight, MdCheckCircleOutline
} from 'react-icons/md';
import TaskCard from '../../components/TaskCard';

const API = 'http://localhost:7001/api/tasks';
const AUTH_TOKEN = () => localStorage.getItem('token');

const COURSES = [
   "Software-Development", "Data-Science", "Cyber-Security", "Cloud-Computing",
   "Artificial-Intelligence", "Digital-Marketing", "UI-UX-Design",
   "Business-Analytics", "Project-Management", "DevOps"
];

const Tasks = () => {

   const navigate = useNavigate();
   const [tasks, setTasks] = useState([]);
   const [loading, setLoading] = useState(true);
   const [refreshing, setRefreshing] = useState(false);
   const [search, setSearch] = useState('');
   const [filters, setFilters] = useState({ course: 'All', priority: 'All', status: 'All', batch: 'All' });

   const fetchData = useCallback(async (isSilent = false) => {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);
      try {
         const token = AUTH_TOKEN();
         const res = await axios.get(API, { headers: { Authorization: `Bearer ${token}` } });
         setTasks(res.data.tasks || []);
      } catch { toast.error('Telemetry Sync Fault'); }
      finally { setLoading(false); setRefreshing(false); }
   }, []);

   useEffect(() => { 
      fetchData(); 
      const pollId = setInterval(() => fetchData(true), 15000); // High-frequency live poll
      return () => clearInterval(pollId);
   }, [fetchData]);

   const filteredTasks = useMemo(() => tasks.filter(t => {
      const s = search.toLowerCase();
      const matchesSearch = t.Title?.toLowerCase().includes(s) || t.course?.toLowerCase().includes(s) || t.Batch?.toLowerCase().includes(s);
      const matchesCourse = filters.course === 'All' || t.course === filters.course;
      const matchesPriority = filters.priority === 'All' || t.Priority === filters.priority;
      const matchesStatus = filters.status === 'All' || t.Status === filters.status;
      const matchesBatch = filters.batch === 'All' || t.Batch === filters.batch;
      return matchesSearch && matchesCourse && matchesPriority && matchesStatus && matchesBatch;
   }), [tasks, search, filters]);

   const stats = useMemo(() => [
      { label: 'Active Tasks', val: filteredTasks.length, color: 'text-blue-700', bg: 'bg-blue-50', icon: <MdListAlt size={26} /> },
      { label: 'Pending', val: filteredTasks.filter(t => t.Status === 'Pending').length, color: 'text-blue-700', bg: 'bg-blue-50', icon: <MdPendingActions size={26} /> },
      { label: 'Completed', val: filteredTasks.filter(t => t.Status === 'Completed').length, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <MdCheckCircleOutline size={26} /> },
      { label: 'Overdue', val: filteredTasks.filter(t => new Date(t.Deadline) < new Date() && t.Status !== 'Completed').length, color: 'text-rose-600', bg: 'bg-rose-50', icon: <MdErrorOutline size={26} /> },
   ], [filteredTasks]);


   return (
      <div className="relative w-full space-y-10 animate-in fade-in duration-700 pb-20">
         <Toaster position="top-right" />

         {/* 🎨 DECORATIVE BACKGROUND BLOBS */}
         <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
         <div className="absolute top-1/2 -left-24 w-72 h-72 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

         {/* Header */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
            <div>
               <h1 className="text-4xl font-bold text-slate-800 tracking-tight  mb-1">Curriculum Management</h1>
               <p className="text-slate-400 font-bold text-[10px] tracking-[0.15em] uppercase flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Task & Assignment Control
               </p>
            </div>
            <div className="flex items-center gap-3 bg-white/50 backdrop-blur-xl p-2 rounded-3xl border border-white shadow-sm">
               <button 
                  onClick={() => fetchData(true)} 
                  className={`p-4 bg-white rounded-2xl text-slate-400 hover:text-blue-700 transition-all border border-slate-100 shadow-sm ${refreshing ? 'animate-spin' : ''}`}
               >
                  <MdRefresh size={22} />
               </button>
               <button 
                  onClick={() => navigate('/tasks/create')} 
                  className="bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-wide shadow-xl shadow-blue-100 hover:bg-blue-800 transition-all flex items-center gap-3 active:scale-95"
               >
                  <MdAdd size={22} /> Create New Task
               </button>
            </div>
         </div>

         {/* 📊 LIVE PERFORMANCE GRID */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {stats.map(s => (
               <motion.div 
                  key={s.label} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  className="bg-white p-8 rounded-3xl border border-slate-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex items-center gap-6 group transition-all hover:shadow-2xl hover:shadow-blue-600/5"
               >
                  <div className={`w-16 h-16 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center text-3xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-inner`}>
                     {s.icon}
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1 opacity-60">{s.label}</p>
                     <div className="flex items-baseline gap-1.5">
                        <p className="text-4xl font-bold text-slate-800 leading-tight tabular-nums ">{s.val}</p>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                     </div>
                  </div>
               </motion.div>
            ))}
         </div>

         {/* 🔍 INTELLIGENT FILTERING */}
         <div className="bg-white/80 backdrop-blur-2xl p-4 rounded-[32px] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col lg:flex-row items-center gap-4 relative z-10">
            <div className="flex-1 w-full relative group">
               <MdSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={24} />
               <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search deployments, curriculum, or batch identifiers..."
                  className="w-full pl-16 pr-8 py-5 bg-slate-50/50 border-none rounded-2xl text-sm font-bold text-slate-600 focus:ring-4 focus:ring-blue-600/5 transition-all placeholder:text-slate-300"
               />
            </div>

            <div className="flex flex-wrap lg:flex-nowrap gap-3 w-full lg:w-auto">
               <select value={filters.course} onChange={e => setFilters({ ...filters, course: e.target.value })} className="px-6 py-5 bg-slate-50/50 rounded-2xl text-[10px] font-bold uppercase tracking-wide text-slate-500 hover:bg-slate-100 transition-all cursor-pointer border-none focus:ring-0">
                  <option value="All">All Courses</option>
                  {COURSES.map(c => <option key={c} value={c}>{c.replace(/-/g, ' ')}</option>)}
               </select>
               <button onClick={() => { setSearch(''); setFilters({ course: 'All', priority: 'All', status: 'All', batch: 'All' }); }} className="p-5 bg-rose-50 text-rose-500 hover:bg-rose-600 hover:text-white rounded-2xl transition-all shadow-sm"><MdClearAll size={24} /></button>
            </div>
         </div>

         {/* Task Wall Grid */}
         {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
               {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-80 bg-white rounded-3xl border border-slate-50 animate-pulse" />)}
            </div>
         ) : filteredTasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 relative z-10">
               <AnimatePresence mode="popLayout">
                  {filteredTasks.map(t => (
                     <TaskCard 
                        key={t._id} 
                        task={t} 
                        onEdit={(id) => navigate(`/tasks/edit/${id}`)} 
                        onView={(id) => navigate(`/tasks/${id}`)} 
                        onDelete={async (id) => { 
                           toast((toastObj) => (
                              <div className="flex flex-col gap-3">
                                 <p className="text-xs font-bold text-slate-800">Confirm task removal?</p>
                                 <div className="flex gap-2">
                                    <button onClick={async () => {
                                       try {
                                          const token = AUTH_TOKEN();
                                          await axios.delete(`${API}/${id}`, { headers: { Authorization: `Bearer ${token}` } }); 
                                          toast.success('Task Permanently Removed'); 
                                          fetchData(true);
                                          toast.dismiss(toastObj.id);
                                       } catch { toast.error('Action Failed'); }
                                    }} className="px-3 py-1.5 bg-rose-600 text-white text-[10px] font-bold rounded-lg">Delete</button>
                                    <button onClick={() => toast.dismiss(toastObj.id)} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg">Cancel</button>
                                 </div>
                              </div>
                           ), { duration: 5000 });
                        }} 
                     />
                  ))}
               </AnimatePresence>
            </div>
         ) : (
            <div className="py-40 text-center bg-white/80 backdrop-blur-xl rounded-[64px] border border-white shadow-sm relative overflow-hidden z-10">
               <div className="absolute top-0 left-0 w-full h-2 bg-blue-700 opacity-20" />
               <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <MdListAlt className="text-slate-200" size={56} />
               </div>
               <h3 className="text-3xl font-bold text-slate-800 tracking-tight ">No Curriculums Found</h3>
               <p className="text-slate-400 font-bold text-sm mt-3 tracking-wide">Sync parameters or update filters to view task wall deployments.</p>
            </div>
         )}
      </div>

   );
};

export default Tasks;
