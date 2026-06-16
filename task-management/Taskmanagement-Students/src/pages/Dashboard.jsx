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

const API_BASE = 'http://localhost:7001/api';

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
      icon: <MdSchool size={26} />,
      color: 'text-blue-700',
      bg: 'bg-blue-50',
      path: '/profile',
      desc: 'Active learning track'
    },
    {
      label: 'Pending Tasks',
      val: pendingCount,
      icon: <MdAssignment size={26} />,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      path: '/tasks',
      desc: 'Tasks to be completed'
    },
    {
      label: 'Completed Tasks',
      val: completedCount,
      icon: <MdCheckCircle size={26} />,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      path: '/tasks',
      desc: 'Successfully completed'
    },
    {
      label: 'Learning Streak',
      val: '94%',
      icon: <MdTimeline size={26} />,
      color: 'text-blue-900',
      bg: 'bg-slate-100',
      path: '/report',
      desc: 'Performance consistency'
    },
  ];

  return (
    <div className="w-full space-y-10 animate-in fade-in duration-700 pb-20 bg-slate-50 min-h-screen">

      {/* 🚀 ELITE HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 px-4 sm:px-8 pt-8">
        <div className="flex items-center gap-10">
          <div className="w-20 h-20 rounded-3xl bg-blue-700 text-white flex items-center justify-center shadow-lg hidden sm:flex">
             <MdSchool size={40} />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-1">
              {getGreeting()}
            </h1>
            <p className="text-slate-500 font-semibold text-xs tracking-wide uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Student Management System • Session Verified
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-3xl border border-slate-200 shadow-sm">
          <div className="px-6 py-3 bg-slate-50 rounded-2xl flex items-center gap-4">
            <MdAccessTime size={20} className="text-blue-700" />
            <span className="text-sm font-bold text-slate-800 tabular-nums">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <button
            onClick={() => fetchAll(true)}
            className={`p-4 bg-blue-700 text-white rounded-2xl hover:bg-blue-800 transition-all active:scale-95 shadow-md ${refreshing ? 'animate-spin' : ''}`}
          >
            <MdAutorenew size={22} />
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-8 space-y-10">
        {/* 📊 LIVE METRICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              whileHover={{ y: -5 }}
              key={i}
              onClick={() => navigate(s.path)}
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-pointer relative overflow-hidden"
            >
              <div className={`w-14 h-14 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center mb-6 transition-transform group-hover:scale-110 shadow-sm`}>
                {s.icon}
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{s.label}</p>
              <div className="flex items-end justify-between">
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-extrabold text-slate-900 tracking-tight tabular-nums">{s.val}</p>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                </div>
                <MdKeyboardArrowRight size={24} className="text-slate-300 group-hover:text-blue-700 transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* 🛠️ LEARNING COMMAND CENTER */}
          <div className="lg:col-span-2 bg-white p-10 rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-bl-full -z-0 opacity-50" />
            
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-700 text-white flex items-center justify-center shadow-md">
                    <MdPlayArrow size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Learning Command Hub</h3>
                </div>
                <p className="text-slate-500 font-medium max-w-lg leading-relaxed">
                  Access your active course assignments, track performance metrics, and download verified academic records.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
                <button onClick={() => navigate('/tasks')} className="px-6 py-4 bg-blue-700 text-white rounded-xl font-semibold text-xs uppercase tracking-wide shadow-md flex items-center justify-center gap-2 hover:bg-blue-800 transition-all active:scale-95">
                  <MdAssignment size={20} /> View Tasks
                </button>
                <button onClick={() => navigate('/materials')} className="px-6 py-4 bg-white text-slate-900 border border-slate-300 rounded-xl font-semibold text-xs uppercase tracking-wide shadow-sm flex items-center justify-center gap-2 hover:bg-slate-100 transition-all active:scale-95">
                  <MdBook size={20} /> Materials
                </button>
                <button onClick={() => navigate('/report')} className="px-6 py-4 bg-slate-900 text-white rounded-xl font-semibold text-xs uppercase tracking-wide shadow-md flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95">
                  <MdBarChart size={20} /> My Report
                </button>
              </div>
            </div>
          </div>

          {/* 🔔 LIVE INTEL FEED */}
          <div className="bg-white p-10 rounded-[32px] border border-slate-200 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">Latest Intel</h3>
              <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                <MdNotificationsActive size={20} />
              </div>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto max-h-[320px] pr-2 custom-scrollbar">
              {data.notifications.slice(0, 5).map((n, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <MdNotificationsActive size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-700 leading-snug mb-1 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {data.notifications.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">No New Notifications</p>
                </div>
              )}
            </div>

            <button onClick={() => navigate('/notifications')} className="w-full py-4 mt-6 bg-slate-50 text-slate-500 rounded-xl font-bold text-[10px] uppercase tracking-wide hover:bg-slate-100 transition-all border border-slate-100">
              See All Activity
            </button>
          </div>
        </div>

        {/* 🏆 RECENT ACHIEVEMENTS / TASKS */}
        <div className="bg-white p-10 rounded-[32px] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-10 px-4 pb-6 border-b border-slate-100">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                <MdOutlineEmojiEvents size={28} className="text-blue-700" /> Active Assignments
              </h3>
              <p className="text-slate-500 font-semibold text-xs tracking-wide uppercase mt-1">Current deployments awaiting synchronization</p>
            </div>
            <button onClick={() => navigate('/tasks')} className="p-3 bg-white border border-slate-300 text-slate-500 rounded-xl hover:bg-slate-50 transition-all">
              <MdKeyboardArrowRight size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {data.tasks.slice(0, 3).map((task) => (
              <div key={task._id} onClick={() => navigate('/tasks')} className="bg-slate-50 p-8 rounded-3xl border border-slate-200 hover:border-blue-300 hover:bg-white hover:shadow-md transition-all group cursor-pointer">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-white text-slate-400 flex items-center justify-center border border-slate-200 group-hover:text-blue-700 transition-colors shadow-sm">
                    <MdAssignment size={22} />
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-base font-bold text-slate-800 truncate">{task.Title}</h4>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">{task.course}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-lg ${task.Status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                    {task.Status}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    Due {new Date(task.Deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {data.tasks.length === 0 && (
              <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                <p className="text-slate-400 font-bold text-xs uppercase tracking-wide">No active deployments found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
