import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  MdNotificationsActive, MdCheckCircle, MdWarningAmber, 
  MdDeleteOutline, MdRefresh, MdDoneAll, MdTimer, MdAutoFixHigh,
  MdKeyboardArrowRight, MdLayers, MdRocketLaunch
} from 'react-icons/md';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import { getApiBaseUrl } from '../utils/api';

const API = `${getApiBaseUrl()}/api/notifications`;
const AUTH_TOKEN = () => localStorage.getItem('token');

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${AUTH_TOKEN()}` }
      });
      setNotifications(res.data.data || []);
    } catch { toast.error("Sync Fault"); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  const markAllRead = async () => {
    try {
      await axios.put(`${API}/mark-read`, {}, {
        headers: { Authorization: `Bearer ${AUTH_TOKEN()}` }
      });
      toast.success("Stream Status: Optimized");
      fetchNotifications(true);
    } catch { toast.error("Operation Failed"); }
  };

  const deleteAll = async () => {
    if (!confirm("Purge entire activity stream? This action is irreversible.")) return;
    try {
      await axios.delete(`${API}/delete-all`, {
        headers: { Authorization: `Bearer ${AUTH_TOKEN()}` }
      });
      toast.success("Stream Purged");
      setNotifications([]);
    } catch { toast.error("Purge Fault"); }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => fetchNotifications(true), 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return (
    <div className="w-full space-y-12 animate-in fade-in duration-700 pb-20 relative">
      {/* Background Glows */}
      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-700/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-700/5 blur-[120px] rounded-full pointer-events-none" />

      <Toaster position="top-right" />
      
      <div className="max-w-5xl mx-auto space-y-12 relative z-10">
        
        {/* 🚀 ELITE HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 tracking-tight  mb-1">Activity Stream</h1>
            <p className="text-slate-400 font-bold text-sm tracking-wide flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.4)]"></span>
              Automated Intelligence & System Logs Synced
            </p>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={() => fetchNotifications(true)} className={`p-4 bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 text-slate-400 hover:text-blue-700 transition-all ${refreshing ? 'animate-spin' : ''}`}>
                <MdRefresh size={24} />
             </button>
             <div className="flex bg-white/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/60 shadow-sm">
                <button onClick={markAllRead} className="px-6 py-3.5 text-blue-700 hover:bg-blue-50 rounded-2xl text-[10px] font-bold uppercase tracking-wide flex items-center gap-2 transition-all">
                   <MdDoneAll size={20} /> Mark Read
                </button>
                <button onClick={deleteAll} className="px-6 py-3.5 text-rose-500 hover:bg-rose-50 rounded-2xl text-[10px] font-bold uppercase tracking-wide flex items-center gap-2 transition-all">
                   <MdDeleteOutline size={20} /> Purge All
                </button>
             </div>
          </div>
        </div>

        {/* 🧩 NOTIFICATIONS FEED */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {loading && notifications.length === 0 ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-white/20 backdrop-blur-3xl rounded-3xl animate-pulse border border-white/40 shadow-sm" />
              ))
            ) : notifications.length > 0 ? (
              notifications.map((note) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={note._id} 
                  className={`group p-8 rounded-3xl border transition-all flex items-start gap-8 relative overflow-hidden ${note.isRead ? 'bg-white/40 border-slate-100/50 opacity-60' : 'bg-white/70 backdrop-blur-2xl border-white shadow-[0_8px_30px_rgba(99,102,241,0.05)] ring-1 ring-blue-50'}`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-700 opacity-[0.02] rounded-bl-full" />
                  
                  <div className={`w-18 h-18 rounded-2xl flex items-center justify-center text-3xl shadow-lg shrink-0 relative z-10 transition-transform group-hover:scale-110 ${
                    note.type === 'Task_Overdue' || note.type === 'Missed_Deadline' ? 'bg-rose-50 text-rose-500 shadow-rose-100' : 
                    note.type === 'Late_Submission' ? 'bg-amber-50 text-amber-500 shadow-amber-100' :
                    'bg-blue-50 text-blue-700 shadow-blue-100'
                  }`}>
                    {note.type === 'Task_Overdue' || note.type === 'Missed_Deadline' ? <MdWarningAmber /> : 
                     note.type === 'Late_Submission' ? <MdTimer /> :
                     <MdAutoFixHigh />}
                  </div>

                  <div className="flex-1 relative z-10">
                    <div className="flex justify-between items-start mb-3">
                      <div className="space-y-1">
                        <h3 className={`text-xl font-bold tracking-tight  ${note.isRead ? 'text-slate-500' : 'text-slate-800'}`}>
                          {note.title}
                        </h3>
                        <div className="flex items-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                           <span className="flex items-center gap-1.5"><MdTimer size={14}/> {new Date(note.createdAt).toLocaleDateString()}</span>
                           <span className="w-1 h-1 bg-slate-200 rounded-full" />
                           <span>{new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                    <p className={`text-sm font-bold leading-relaxed max-w-2xl ${note.isRead ? 'text-slate-400' : 'text-slate-600'}`}>
                      {note.message}
                    </p>
                  </div>

                  {!note.isRead && (
                    <div className="w-3 h-3 rounded-full bg-blue-700 mt-5 shadow-xl shadow-blue-600 animate-pulse relative z-10" />
                  )}
                  
                  <div className="opacity-0 group-hover:opacity-100 transition-all absolute right-8 bottom-8">
                     <button className="p-3 bg-white text-slate-300 hover:text-blue-700 rounded-xl shadow-xl border border-slate-50 transition-all hover:scale-110">
                        <MdKeyboardArrowRight size={22} />
                     </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-40 bg-white/40 backdrop-blur-2xl rounded-[64px] border border-white/60 shadow-sm text-center relative z-10">
                <div className="w-24 h-24 rounded-[32px] bg-slate-50 text-slate-200 flex items-center justify-center mb-10 opacity-50 shadow-inner">
                   <MdNotificationsActive size={48} />
                </div>
                <h3 className="text-2xl font-bold text-slate-300 uppercase tracking-[0.4em]">Stream Clear</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-4">All intelligence logs have been processed.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default Notifications;
