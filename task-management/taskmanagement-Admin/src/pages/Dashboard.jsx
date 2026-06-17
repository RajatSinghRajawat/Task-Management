import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdLogout, MdPeople, MdAssignment, MdNotifications, MdSettings } from 'react-icons/md';

const Dashboard = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem('adminData');
    if (!data) {
      navigate('/login');
      return;
    }
    setAdmin(JSON.parse(data));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/login');
  };

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans text-slate-800">
      {/* Top Header */}
      <header className="bg-slate-950 text-white py-6 px-12 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-4">
          <div className="h-10 w-2 bg-red-600 rounded-full" />
          <h1 className="text-2xl font-black tracking-tight">Admin Intelligence</h1>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-sm text-slate-300 font-semibold">Welcome, {admin.name}</span>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider py-2 px-4 rounded-xl transition-all"
          >
            <MdLogout size={16} />
            Logout
          </button>
        </div>
      </header>

      {/* Main Stats and UI */}
      <main className="max-w-7xl mx-auto py-12 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12"
        >
          {/* Card 1 */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-6">
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
              <MdPeople size={32} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Scholars</p>
              <h3 className="text-3xl font-black text-slate-800">1,248</h3>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-6">
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl">
              <MdPeople size={32} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Faculty Members</p>
              <h3 className="text-3xl font-black text-slate-800">84</h3>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-6">
            <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl">
              <MdAssignment size={32} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Tasks</p>
              <h3 className="text-3xl font-black text-slate-800">312</h3>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-6">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
              <MdNotifications size={32} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Alerts</p>
              <h3 className="text-3xl font-black text-slate-800">0</h3>
            </div>
          </div>
        </motion.div>

        {/* Central Console placeholder */}
        <div className="bg-white rounded-[32px] p-12 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-800">Control Panel Console</h2>
              <p className="text-slate-400 text-sm">Monitor services status and configurations across your deployment.</p>
            </div>
            <MdSettings className="text-slate-300 animate-spin-slow" size={36} />
          </div>

          <div className="space-y-4">
            <div className="p-6 bg-slate-50 rounded-2xl flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-800">Students Portal</h4>
                <p className="text-xs text-slate-400">Linked to students.tipsgalwar.in</p>
              </div>
              <span className="bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-wider py-1 px-3 rounded-full">Online</span>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-800">Teachers Portal</h4>
                <p className="text-xs text-slate-400">Linked to teachers.tipsgalwar.in</p>
              </div>
              <span className="bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-wider py-1 px-3 rounded-full">Online</span>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-800">Backend Express API</h4>
                <p className="text-xs text-slate-400">Linked to api.tipsgalwar.in</p>
              </div>
              <span className="bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-wider py-1 px-3 rounded-full">Online</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
