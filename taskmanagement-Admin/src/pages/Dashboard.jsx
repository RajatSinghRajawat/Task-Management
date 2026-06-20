import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MdPeople, 
  MdAssignment, 
  MdFolderOpen, 
  MdAssessment, 
  MdSettings, 
  MdSpeed, 
  MdDns, 
  MdWeb,
  MdArrowForward,
  MdAdd,
  MdCheckCircle
} from 'react-icons/md';
import { getApiBaseUrl } from '../utils/api';
import toast, { Toaster } from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    students: 0,
    tasks: 0,
    materials: 0,
    reports: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentStudents, setRecentStudents] = useState([]);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const adminData = localStorage.getItem('adminData');
    if (adminData) {
      setAdmin(JSON.parse(adminData));
    }

    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const headers = { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };

        const baseUrl = getApiBaseUrl();

        // 1. Fetch Students
        const resStudents = await fetch(`${baseUrl}/api/students`, { headers });
        const dataStudents = await resStudents.json();
        
        // 2. Fetch Tasks
        const resTasks = await fetch(`${baseUrl}/api/tasks`, { headers });
        const dataTasks = await resTasks.json();

        // 3. Fetch Materials
        const resMaterials = await fetch(`${baseUrl}/api/materials`, { headers });
        const dataMaterials = await resMaterials.json();

        // 4. Fetch Reports
        const resReports = await fetch(`${baseUrl}/api/reports`, { headers });
        const dataReports = await resReports.json();

        setStats({
          students: dataStudents.total || 0,
          tasks: dataTasks.total || 0,
          materials: dataMaterials.total || 0,
          reports: dataReports.total || 0
        });

        if (dataStudents.students) {
          setRecentStudents(dataStudents.students.slice(0, 5));
        }

      } catch (error) {
        console.error("Dashboard Stats Fetch Error:", error);
        toast.error("Failed to load dashboard metrics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { name: 'Total Scholars', val: stats.students, icon: MdPeople, color: 'text-indigo-600', bg: 'bg-indigo-50', path: '/students' },
    { name: 'Tasks Assigned', val: stats.tasks, icon: MdAssignment, color: 'text-red-600', bg: 'bg-red-50', path: '/tasks' },
    { name: 'Shared Materials', val: stats.materials, icon: MdFolderOpen, color: 'text-purple-600', bg: 'bg-purple-50', path: '/materials' },
    { name: 'Reports Published', val: stats.reports, icon: MdAssessment, color: 'text-blue-600', bg: 'bg-blue-50', path: '/reports' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Toaster position="top-center" />

      {/* 👋 WELCOME BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-[24px] p-6 md:p-8 text-white relative overflow-hidden shadow-md">
        <div className="absolute top-[-30%] right-[-10%] w-[300px] h-[300px] bg-red-600/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[-30%] left-[-10%] w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 space-y-2 max-w-2xl">
          <span className="text-[9px] font-black text-red-400 uppercase tracking-[0.3em]">ADMIN CONTROL CONSOLE</span>
          <h1 className="text-xl md:text-3xl font-black tracking-tight leading-snug">
            Welcome back, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-indigo-400">{admin?.name || 'Academic Director'}</span>
          </h1>
          <p className="text-slate-400 text-xs font-semibold leading-relaxed">
            Monitor tasks, grade submissions, manage materials, and publish results.
          </p>
        </div>
      </div>

      {/* 📊 LIVE COUNTERS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => navigate(card.path)}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 cursor-pointer hover:shadow-md hover:border-slate-200 transition-all group"
            >
              <div className={`p-3 ${card.bg} ${card.color} rounded-xl`}>
                <Icon size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{card.name}</p>
                <h3 className="text-2xl font-black text-slate-800 mt-0.5">{card.val}</h3>
              </div>
              <MdArrowForward className="text-slate-300 group-hover:text-red-500 group-hover:translate-x-1 transition-all" size={18} />
            </motion.div>
          );
        })}
      </div>

      {/* 🚀 QUICK ACTIONS & SYSTEM METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Quick Actions (Col 1) */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-black tracking-tight text-slate-800">Quick Operations</h3>
            <p className="text-slate-400 text-xs mt-0.5">Rapid dispatch and system shortcuts.</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Link 
              to="/students" 
              className="flex items-center justify-between p-4 bg-slate-50 hover:bg-red-50 rounded-2xl text-slate-700 hover:text-red-600 font-bold text-sm transition-colors group"
            >
              <span className="flex items-center gap-3">
                <span className="p-1.5 bg-white border border-slate-100 rounded-lg group-hover:text-red-500"><MdAdd size={16} /></span>
                Enroll New Student
              </span>
              <MdArrowForward size={16} />
            </Link>

            <Link 
              to="/tasks" 
              className="flex items-center justify-between p-4 bg-slate-50 hover:bg-indigo-50 rounded-2xl text-slate-700 hover:text-indigo-600 font-bold text-sm transition-colors group"
            >
              <span className="flex items-center gap-3">
                <span className="p-1.5 bg-white border border-slate-100 rounded-lg group-hover:text-indigo-50"><MdAdd size={16} /></span>
                Create New Task
              </span>
              <MdArrowForward size={16} />
            </Link>

            <Link 
              to="/materials" 
              className="flex items-center justify-between p-4 bg-slate-50 hover:bg-purple-50 rounded-2xl text-slate-700 hover:text-purple-600 font-bold text-sm transition-colors group"
            >
              <span className="flex items-center gap-3">
                <span className="p-1.5 bg-white border border-slate-100 rounded-lg group-hover:text-purple-50"><MdAdd size={16} /></span>
                Share Lecture Note
              </span>
              <MdArrowForward size={16} />
            </Link>

            <Link 
              to="/reports" 
              className="flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 rounded-2xl text-slate-700 hover:text-blue-600 font-bold text-sm transition-colors group"
            >
              <span className="flex items-center gap-3">
                <span className="p-1.5 bg-white border border-slate-100 rounded-lg group-hover:text-blue-50"><MdAdd size={16} /></span>
                Publish Student Report
              </span>
              <MdArrowForward size={16} />
            </Link>
          </div>
        </div>

        {/* Recent Enrolled (Col 2) */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black tracking-tight text-slate-800">Recent Roster</h3>
              <p className="text-slate-400 text-xs mt-0.5">Recently active student signups.</p>
            </div>
            <Link to="/students" className="text-xs font-black text-indigo-600 hover:underline uppercase tracking-wider">View All</Link>
          </div>

          <div className="space-y-4">
            {recentStudents.length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-6">No students registered yet.</p>
            ) : (
              recentStudents.map((student) => (
                <div key={student._id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={student.profileImage ? `${getApiBaseUrl()}/${student.profileImage}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.email}`} 
                      className="w-10 h-10 rounded-full border border-slate-200 bg-white object-cover" 
                      onError={(e) => {
                        e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.email}`;
                      }}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-700 truncate">{student.fullName}</p>
                      <p className="text-[10px] text-slate-400 truncate">{student.course} ({student.batch})</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${
                    student.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {student.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Service Monitor (Col 3) */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-black tracking-tight text-slate-800">Service Status</h3>
            <p className="text-slate-400 text-xs mt-0.5">Health and deployment checklist.</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <MdDns size={20} className="text-slate-400" />
                <div>
                  <h4 className="text-xs font-bold text-slate-700">API Gateway</h4>
                  <p className="text-[10px] text-slate-400">Node/Express Port 7001</p>
                </div>
              </div>
              <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full">
                <MdCheckCircle size={14} /> Online
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <MdWeb size={20} className="text-slate-400" />
                <div>
                  <h4 className="text-xs font-bold text-slate-700">Student Portal</h4>
                  <p className="text-[10px] text-slate-400">Vite Frontend Port 5174</p>
                </div>
              </div>
              <span className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded-full">
                <MdCheckCircle size={14} /> Ready
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <MdSpeed size={20} className="text-slate-400" />
                <div>
                  <h4 className="text-xs font-bold text-slate-700">Scheduler Daemon</h4>
                  <p className="text-[10px] text-slate-400">Overdue checker interval</p>
                </div>
              </div>
              <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full">
                <MdCheckCircle size={14} /> Running
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
