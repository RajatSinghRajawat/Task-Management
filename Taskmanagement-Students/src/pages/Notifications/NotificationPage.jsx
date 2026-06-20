import React, { useState, useEffect, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  CheckCircle2, 
  FileText, 
  Megaphone, 
  Trash2, 
  Clock, 
  RefreshCcw, 
  ShieldAlert,
  GraduationCap,
  ArrowRight
} from 'lucide-react';

import { getApiBaseUrl } from '../../utils/api';

const API = `${getApiBaseUrl()}/api/notifications`;

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    
    const token = localStorage.getItem('studentToken');
    if (!token) return;

    try {
      const res = await fetch(`${API}/my-notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data || []);
      }
    } catch (err) {
      toast.error('Sync failure detected');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllAsRead = async () => {
    const token = localStorage.getItem('studentToken');
    try {
      await fetch(`${API}/mark-read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('System clear. All read.');
      fetchNotifications(true);
    } catch (err) {
      toast.error('Command failed');
    }
  };

  const deleteNotification = (id) => {
     setNotifications(prev => prev.filter(n => n._id !== id));
     toast.success('Notification purged');
  };

  const getIcon = (type) => {
    switch (type) {
      case 'Task_Assigned': return { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' };
      case 'Report_Published': return { icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' };
      case 'Task_Overdue': 
      case 'Missed_Deadline': return { icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' };
      case 'Announcement': return { icon: Megaphone, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' };
      default: return { icon: Bell, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100' };
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 space-y-6 animate-pulse bg-slate-50 min-h-screen">
        <div className="h-12 bg-slate-200 w-1/4 rounded-2xl" />
        <div className="space-y-6">
          {[...Array(6)].map((_, i) => <div key={i} className="h-28 bg-white rounded-[32px] shadow-sm" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full space-y-10 animate-in fade-in duration-700 pb-20 overflow-hidden bg-[#F8FAFC]">
      <Toaster position="top-right" />

      {/* Decorative Blobs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 -left-24 w-72 h-72 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Simplified Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10 max-w-5xl mx-auto">
         <div>
            <h1 className="text-4xl font-bold text-slate-800 tracking-tight  mb-1">Notifications</h1>
            <p className="text-slate-400 font-bold text-[10px] tracking-[0.15em] uppercase flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
               Live Command Center Feed
            </p>
         </div>
         <div className="flex items-center gap-3">
            <button onClick={() => fetchNotifications(true)} className={`p-4 bg-white/80 backdrop-blur-md rounded-2xl text-slate-400 hover:text-blue-700 transition-all border border-slate-100 shadow-sm ${refreshing ? 'animate-spin' : ''}`}>
               <RefreshCcw size={22} />
            </button>
            <button 
               onClick={markAllAsRead}
               disabled={notifications.length === 0}
               className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-[11px] uppercase tracking-wide shadow-xl shadow-slate-100 flex items-center gap-3 hover:bg-blue-700 transition-all disabled:opacity-50"
            >
               <CheckCircle2 size={22} /> Mark all as read
            </button>
         </div>
      </div>

      {/* Clean Notifications List */}
      <div className="max-w-5xl mx-auto space-y-6 relative z-10">
         <AnimatePresence mode="popLayout">
            {notifications.length > 0 ? notifications.map((n, idx) => {
               const { icon: Icon, color, bg, border } = getIcon(n.type);
               return (
                  <motion.div 
                     key={n._id}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     transition={{ delay: idx * 0.03 }}
                     className={`relative bg-white/80 backdrop-blur-2xl p-8 rounded-3xl border border-white shadow-[0_4px_20px_rgb(0,0,0,0.01)] flex flex-col md:flex-row items-start md:items-center gap-8 transition-all hover:shadow-xl hover:border-blue-100 group ${!n.isRead ? 'border-l-[6px] border-l-blue-700' : ''}`}
                  >
                     {/* Icon */}
                     <div className={`w-16 h-16 rounded-2xl ${bg} ${color} flex items-center justify-center text-3xl shadow-inner border ${border} shrink-0`}>
                        <Icon size={28} />
                     </div>

                     {/* Content */}
                     <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                           <div>
                              <div className="flex items-center gap-3 mb-1">
                                 <span className={`px-2.5 py-1 rounded-lg text-[8px] font-bold uppercase tracking-wide ${bg} ${color} border ${border}`}>{n.type?.replace(/_/g, ' ')}</span>
                                 {!n.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(79,70,229,0.5)]"></span>}
                              </div>
                              <h3 className={`text-lg font-bold tracking-tight  ${!n.isRead ? 'text-slate-900' : 'text-slate-600'}`}>
                                 {n.title}
                              </h3>
                           </div>
                           <div className="text-right shrink-0">
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2 justify-end">
                                 <Clock size={12} /> {new Date(n.createdAt).toLocaleDateString()}
                              </p>
                           </div>
                        </div>
                        
                        <p className={`text-sm leading-relaxed ${!n.isRead ? 'text-slate-600 font-bold' : 'text-slate-500 font-medium'}`}>
                           {n.message}
                        </p>

                        <div className="flex items-center gap-4 pt-2">
                           <button className="text-[9px] font-bold uppercase tracking-[0.2em] text-blue-700 hover:gap-3 transition-all flex items-center gap-1">
                              View Details <ArrowRight size={12} />
                           </button>
                           <span className="w-1 h-1 rounded-full bg-slate-100"></span>
                           <button onClick={() => deleteNotification(n._id)} className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-300 hover:text-rose-500 transition-colors">
                              Dismiss
                           </button>
                        </div>
                     </div>

                     {/* Trash Action */}
                     <button onClick={() => deleteNotification(n._id)} className="absolute right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all hidden lg:block p-3 text-slate-300 hover:text-rose-600">
                        <Trash2 size={20} />
                     </button>
                  </motion.div>
               );
            }) : (
               <div className="py-40 text-center bg-white/80 backdrop-blur-xl rounded-[64px] border border-white shadow-sm relative overflow-hidden">
                  <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-slate-200">
                     <Bell size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 tracking-tight ">No Notifications</h3>
                  <p className="text-slate-400 font-bold text-xs mt-2 tracking-wide uppercase">Your command center feed is currently empty.</p>
               </div>
            )}
         </AnimatePresence>
      </div>
    </div>
  );
};

export default NotificationPage;
