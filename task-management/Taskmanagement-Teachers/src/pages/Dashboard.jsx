import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdPeople, MdAssignment, MdCheckCircle, MdShowChart,
  MdNotificationsActive, MdAdd, MdDescription, MdCloudUpload,
  MdAccessTime, MdAutorenew, MdKeyboardArrowRight,
  MdBarChart, MdQuiz, MdGroupAdd
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import TaskCard from '../components/TaskCard';


const API_BASE = 'http://localhost:7001/api';
const AUTH_TOKEN = () => localStorage.getItem('token');

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [user, setUser] = useState(null);
  const [data, setData] = useState({
    students: [],
    tasks: [],
    materials: [],
    reports: [],
    notifications: []
  });

  const fetchAll = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const token = AUTH_TOKEN();
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [stRes, tkRes, mtRes, rpRes, ntRes] = await Promise.all([
        axios.get(`${API_BASE}/students`, config).catch(() => ({ data: { students: [] } })),
        axios.get(`${API_BASE}/tasks`, config).catch(() => ({ data: { tasks: [] } })),
        axios.get(`${API_BASE}/materials`, config).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_BASE}/reports`, config).catch(() => ({ data: { reports: [] } })),
        axios.get(`${API_BASE}/notifications`, config).catch(() => ({ data: { data: [] } }))
      ]);

      setData({
        students: stRes.data.students || [],
        tasks: tkRes.data.tasks || [],
        materials: mtRes.data.data || [],
        reports: rpRes.data.reports || [],
        notifications: ntRes.data.data || []
      });
    } catch (err) {
      console.error("Dashboard Sync Fault:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));

    fetchAll();
    const pollId = setInterval(() => fetchAll(true), 5000); // High-frequency live sync
    const clockId = setInterval(() => setCurrentTime(new Date()), 1000);

    return () => {
      clearInterval(pollId);
      clearInterval(clockId);
    };
  }, [fetchAll]);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    const name = user?.name ? user.name.split(' ')[0] : 'Faculty';
    const timeGreeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
    const honorific = user?.gender === 'Female' ? 'Mam' : 'Sir';
    return `${timeGreeting}, ${name} ${honorific}`;
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="w-14 h-14 border-4 border-blue-100 border-t-blue-700 rounded-full animate-spin"></div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Loading Dashboard Data...</p>
    </div>
  );

  const stats = [
    {
      label: 'Enrolled Students',
      val: data.students.length,
      icon: <MdPeople size={26} />,
      color: 'text-blue-700',
      bg: 'bg-blue-50',
      path: '/students',
      desc: 'Total active student accounts'
    },
    {
      label: 'Assigned Tasks',
      val: data.tasks.filter(t => t.Title).length,
      icon: <MdAssignment size={26} />,
      color: 'text-blue-700',
      bg: 'bg-blue-50',
      path: '/tasks',
      desc: 'Active curriculum assignments'
    },
    {
      label: 'Academic Materials',
      val: data.materials.length,
      icon: <MdCloudUpload size={26} />,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      path: '/materials',
      desc: 'Resources deployed to cloud'
    },
    {
      label: 'Performance Insights',
      val: data.reports.length,
      icon: <MdBarChart size={26} />,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      path: '/reports',
      desc: 'Generated analytical reports'
    },
  ];

  return (
    <div className="w-full space-y-10 animate-in fade-in duration-700 pb-20">

      {/* 🚀 ELITE HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-10">
          <img src="/logo.png" alt="TIPS-G Logo" className="h-28 w-auto hidden sm:block border-r-4 border-blue-700 pr-10" />
          <div>
            <h1 className="text-4xl font-bold text-slate-800 tracking-tight  mb-1">
              {getGreeting()}
            </h1>
            <p className="text-slate-400 font-bold text-xs tracking-[0.1em] uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Faculty Management Portal • Connection Active
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-3xl border border-slate-100 shadow-sm">
          <div className="px-6 py-3 bg-slate-50 rounded-2xl flex items-center gap-4">
            <MdAccessTime size={20} className="text-blue-700" />
            <span className="text-sm font-bold text-slate-800 tabular-nums">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
          <button
            onClick={() => fetchAll(true)}
            className={`p-4 bg-blue-700 text-white rounded-2xl hover:bg-blue-800 transition-all active:scale-95 shadow-lg shadow-blue-100 ${refreshing ? 'animate-spin' : ''}`}
          >
            <MdAutorenew size={22} />
          </button>
        </div>
      </div>

      {/* 📊 LIVE METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <motion.div
            whileHover={{ y: -5 }}
            key={i}
            onClick={() => navigate(s.path)}
            className="bg-white/80 backdrop-blur-xl p-6 rounded-[32px] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-2xl hover:shadow-blue-600/5 transition-all group cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 opacity-0 group-hover:opacity-100 rounded-bl-full transition-opacity" />
            <div className={`w-12 h-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110 relative z-10 shadow-inner`}>
              {s.icon}
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1 relative z-10 opacity-70">{s.label}</p>
            <div className="flex items-end justify-between relative z-10">
              <div className="flex items-baseline gap-1.5">
                <p className="text-3xl font-bold text-slate-800 tracking-tight  tabular-nums">{s.val}</p>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <MdKeyboardArrowRight size={20} className="text-slate-300 group-hover:text-blue-700 transition-colors" />
            </div>
          </motion.div>
        ))}


      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* 🛠️ ELITE COMMAND CENTER */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-2xl p-10 rounded-[56px] border border-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] translate-x-20 -translate-y-20 group-hover:scale-110 transition-transform duration-1000" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/5 rounded-full blur-[80px]" />

          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-100">
                  <MdAutorenew className="animate-spin-slow" size={20} />
                </div>
                <h3 className="text-3xl font-bold text-slate-800  tracking-tight">Academic Operations Center</h3>
              </div>
              <p className="text-slate-400 text-sm font-bold max-w-md leading-relaxed">
                Manage curriculum, assign tasks, and handle student enrollment.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
              <button onClick={() => navigate('/tasks/create')} className="p-6 bg-blue-700 text-white rounded-2xl font-bold text-[11px] uppercase tracking-wide flex items-center justify-center gap-3 hover:bg-blue-800 transition-all shadow-xl shadow-blue-100 active:scale-95">
                <MdAdd size={22} /> Create Assignment
              </button>
              <button onClick={() => navigate('/students')} className="p-6 bg-white border border-slate-100 text-slate-600 rounded-2xl font-bold text-[11px] uppercase tracking-wide flex items-center justify-center gap-3 hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
                <MdGroupAdd size={22} /> Enroll Student
              </button>
              <button onClick={() => navigate('/materials')} className="p-6 bg-white border border-slate-100 text-slate-600 rounded-2xl font-bold text-[11px] uppercase tracking-wide flex items-center justify-center gap-3 hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
                <MdCloudUpload size={22} /> Upload Resources
              </button>
            </div>
          </div>
        </div>


        {/* 🔔 LIVE ACTIVITY FEED */}
        <div className="bg-white p-10 rounded-[56px] border border-slate-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-slate-800  tracking-tight">Live Feed</h3>
            <button onClick={() => navigate('/notifications')} className="p-2.5 bg-slate-50 text-blue-700 rounded-xl hover:bg-blue-50 transition-all">
              <MdNotificationsActive size={20} />
            </button>
          </div>

          <div className="space-y-6 flex-1 overflow-y-auto max-h-[320px] pr-2 custom-scrollbar">
            {data.notifications.slice(0, 5).map((n, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all group cursor-default border border-transparent hover:border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <MdNotificationsActive size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-slate-700 leading-snug mb-1 line-clamp-2">{n.message}</p>
                  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-wide">
                    {new Date(n.createdAt).toLocaleDateString()} • {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {data.notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                  <MdNotificationsActive size={32} />
                </div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">No notifications found</p>
              </div>
            )}
          </div>

          <button onClick={() => navigate('/notifications')} className="w-full py-5 mt-6 bg-slate-50 text-slate-400 rounded-2xl font-bold text-[10px] uppercase tracking-wide hover:text-blue-700 transition-all">
            View Notifications
          </button>
        </div>

      </div>


    </div>
  );
};


export default Dashboard;
