import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdBook, MdAssignment, MdCheckCircle, MdShowChart,
  MdNotificationsActive, MdAccessTime, MdAutorenew,
  MdKeyboardArrowRight, MdBarChart, MdSchool,
  MdPlayArrow, MdTimeline, MdOutlineEmojiEvents
} from 'react-icons/md';
import { useNavigate, Link } from 'react-router-dom';

import { getApiBaseUrl } from '../utils/api';

const API_BASE = `${getApiBaseUrl()}/api`;

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [user, setUser] = useState(null);
  const [data, setData] = useState({
    tasks: [],
    notifications: [],
    profile: null
  });

  const fetchAll = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const token = localStorage.getItem('studentToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [profileRes, notesRes] = await Promise.all([
        axios.get(`${API_BASE}/students/me`, config).catch(() => ({ data: { student: null } })),
        axios.get(`${API_BASE}/notifications/my-notifications`, config).catch(() => ({ data: { data: [] } }))
      ]);

      const student = profileRes.data.student;

      if (profileRes.data?.success === false || profileRes.data?.noProfile === true) {
        localStorage.clear();
        navigate('/login');
        window.location.reload();
        return;
      }

      const course = student?.courses || student?.course || localStorage.getItem('studentCourse') || 'General';
      const batch = student?.batch || localStorage.getItem('studentBatch') || '2024';

      const tasksRes = await axios.get(`${API_BASE}/tasks/tasks-by-course?course=${encodeURIComponent(course)}&batch=${encodeURIComponent(batch)}`, config)
        .catch(() => ({ data: { tasks: [] } }));

      setData({
        profile: student,
        tasks: tasksRes.data.tasks || [],
        notifications: notesRes.data.data || []
      });

      if (student) {
        localStorage.setItem('studentData', JSON.stringify(student));
      }
    } catch (err) {
      console.error("Dashboard Sync Fault:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('studentData');
    if (userData) setUser(JSON.parse(userData));

    fetchAll();
    const pollId = setInterval(() => fetchAll(true), 10000); // Sync every 10s
    const clockId = setInterval(() => setCurrentTime(new Date()), 1000);

    return () => {
      clearInterval(pollId);
      clearInterval(clockId);
    };
  }, [fetchAll]);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    const name = data.profile?.fullName ? data.profile.fullName.split(' ')[0] : (user?.name ? user.name.split(' ')[0] : 'Student');
    const timeGreeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
    return `${timeGreeting}, ${name}`;
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="w-14 h-14 border-4 border-blue-100 border-t-blue-700 rounded-full animate-spin"></div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Loading Portal Data...</p>
    </div>
  );

  const pendingCount = data.tasks.filter(t => (t.Status || 'Pending').toLowerCase() !== 'completed').length;
  const completedCount = data.tasks.filter(t => (t.Status || 'Pending').toLowerCase() === 'completed').length;

  const stats = [
    {
      label: 'Academic Course',
      val: data.profile?.course || 'General',
      icon: <MdSchool size={20} />,
      color: 'text-blue-700',
      bg: 'bg-blue-50',
      path: '/profile',
      desc: 'Active learning track'
    },
    {
      label: 'Pending Tasks',
      val: pendingCount,
      icon: <MdAssignment size={20} />,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      path: '/tasks',
      desc: 'Tasks to be completed'
    },
    {
      label: 'Completed Tasks',
      val: completedCount,
      icon: <MdCheckCircle size={20} />,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      path: '/tasks',
      desc: 'Successfully completed'
    },
    {
      label: 'Learning Streak',
      val: '94%',
      icon: <MdTimeline size={20} />,
      color: 'text-blue-900',
      bg: 'bg-slate-100',
      path: '/report',
      desc: 'Performance consistency'
    },
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-700 pb-10 bg-slate-50 min-h-screen">

      {/* 🚀 ELITE HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 px-4 sm:px-6 pt-6">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-700 text-white flex items-center justify-center shadow-md hidden sm:flex">
             <MdSchool size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
              {getGreeting()}
            </h1>
            <p className="text-slate-500 font-semibold text-[10px] tracking-wide uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Student Management System • Session Verified
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="px-4 py-2 bg-slate-50 rounded-xl flex items-center gap-3">
            <MdAccessTime size={16} className="text-blue-700" />
            <span className="text-xs font-bold text-slate-800 tabular-nums">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <button
            onClick={() => fetchAll(true)}
            className={`p-2.5 bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition-all active:scale-95 shadow-md ${refreshing ? 'animate-spin' : ''}`}
          >
            <MdAutorenew size={18} />
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-6 space-y-6">
        {/* 📊 LIVE METRICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div
              whileHover={{ y: -3 }}
              key={i}
              onClick={() => navigate(s.path)}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-pointer relative overflow-hidden"
            >
              <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-3 transition-transform group-hover:scale-105 shadow-sm`}>
                {s.icon}
              </div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-0.5">{s.label}</p>
              <div className="flex items-end justify-between">
                <div className="flex items-baseline gap-1">
                  <p className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">{s.val}</p>
                  <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                </div>
                <MdKeyboardArrowRight size={16} className="text-slate-300 group-hover:text-blue-700 transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* 🛠️ LEARNING COMMAND CENTER */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-bl-full -z-0 opacity-50" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-md">
                  <MdPlayArrow size={18} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Learning Command Hub</h3>
              </div>
              <p className="text-slate-400 font-semibold text-xs leading-relaxed max-w-lg">
                Access your active course assignments, track performance metrics, and download verified academic records.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
              <button onClick={() => navigate('/tasks')} className="py-3 px-4 bg-blue-700 text-white rounded-xl font-semibold text-[10px] uppercase tracking-wide shadow-md flex items-center justify-center gap-2 hover:bg-blue-800 transition-all active:scale-95">
                <MdAssignment size={18} /> View Tasks
              </button>
              <button onClick={() => navigate('/materials')} className="py-3 px-4 bg-white text-slate-900 border border-slate-300 rounded-xl font-semibold text-[10px] uppercase tracking-wide shadow-sm flex items-center justify-center gap-2 hover:bg-slate-100 transition-all active:scale-95">
                <MdBook size={18} /> Materials
              </button>
              <button onClick={() => navigate('/report')} className="py-3 px-4 bg-slate-900 text-white rounded-xl font-semibold text-[10px] uppercase tracking-wide shadow-md flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95">
                <MdBarChart size={18} /> My Report
              </button>
            </div>
          </div>

          {/* 🔔 LIVE INTEL FEED */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 tracking-tight">Latest Intel</h3>
                <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                  <MdNotificationsActive size={16} />
                </div>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[220px] pr-1 custom-scrollbar">
                {data.notifications.slice(0, 5).map((n, i) => (
                  <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <MdNotificationsActive size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-700 leading-snug mb-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {data.notifications.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">No New Notifications</p>
                  </div>
                )}
              </div>
            </div>

            <button onClick={() => navigate('/notifications')} className="w-full py-3 mt-4 bg-slate-50 text-slate-400 rounded-xl font-bold text-[9px] uppercase tracking-wide hover:bg-slate-100 transition-all border border-slate-100">
              See All Activity
            </button>
          </div>
        </div>

        {/* 🏆 RECENT ACHIEVEMENTS / TASKS */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6 px-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <MdOutlineEmojiEvents size={20} className="text-blue-700" /> Active Assignments
              </h3>
              <p className="text-slate-500 font-bold text-[10px] tracking-wide uppercase mt-0.5">Current deployments awaiting synchronization</p>
            </div>
            <button onClick={() => navigate('/tasks')} className="p-2 bg-white border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 transition-all">
              <MdKeyboardArrowRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.tasks.slice(0, 3).map((task) => (
              <div key={task._id} onClick={() => navigate('/tasks')} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-blue-300 hover:bg-white hover:shadow-md transition-all group cursor-pointer">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-white text-slate-400 flex items-center justify-center border border-slate-200 group-hover:text-blue-700 transition-colors shadow-sm">
                    <MdAssignment size={18} />
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-sm font-bold text-slate-800 truncate">{task.Title}</h4>
                    <p className="text-[9px] font-semibold text-blue-600 uppercase tracking-wide">{task.course}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <span className={`text-[9px] font-bold uppercase tracking-wide px-2 py-1 rounded-md ${task.Status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                    {task.Status}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                    Due {new Date(task.Deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {data.tasks.length === 0 && (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wide">No active deployments found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
