import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getApiBaseUrl } from '../utils/api';
import { 
  MdDashboard, 
  MdPeople, 
  MdAssignment, 
  MdFolderOpen, 
  MdAssessment, 
  MdNotifications, 
  MdSettings, 
  MdLogout,
  MdMenu,
  MdClose,
  MdShield
} from 'react-icons/md';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [admin, setAdmin] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const data = localStorage.getItem('adminData');
    if (data) {
      setAdmin(JSON.parse(data));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: MdDashboard },
    { name: 'Students', path: '/students', icon: MdPeople },
    { name: 'Teachers', path: '/teachers', icon: MdPeople },
    { name: 'Tasks', path: '/tasks', icon: MdAssignment },
    { name: 'Materials', path: '/materials', icon: MdFolderOpen },
    { name: 'Reports', path: '/reports', icon: MdAssessment },
    { name: 'Notifications', path: '/notifications', icon: MdNotifications },
    { name: 'Profile Settings', path: '/profile', icon: MdSettings },
  ];

  const getPageTitle = () => {
    const active = navItems.find(item => item.path === location.pathname);
    return active ? active.name : 'Console';
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex font-sans text-slate-800 antialiased overflow-x-hidden">
      
      {/* 💻 DESKTOP SIDEBAR */}
      <aside 
        className={`hidden md:flex flex-col bg-white border-r border-slate-100 text-slate-600 transition-all duration-300 relative z-30 shrink-0 ${
          isSidebarOpen ? 'w-[280px]' : 'w-[88px]'
        }`}
      >
        {/* Branding header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 overflow-hidden">
          <div className="flex items-center gap-3 min-w-[200px]">
            <div className="p-2 bg-gradient-to-tr from-slate-800 to-slate-700 rounded-xl flex justify-center items-center text-white shadow-md shrink-0">
              <MdShield size={24} />
            </div>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col"
              >
                <span className="font-black text-[15px] uppercase tracking-wider text-slate-800 leading-none">TaskManager</span>
                <span className="text-[9px] uppercase tracking-[0.25em] text-red-500 font-bold mt-1">Admin Panel</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 py-8 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`group flex items-center gap-4 py-3.5 px-4 rounded-2xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-slate-100 text-slate-900 font-bold shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={22} className={`shrink-0 ${isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600 transition-colors'}`} />
                {isSidebarOpen && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm font-bold tracking-wide"
                  >
                    {item.name}
                  </motion.span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User / Session section */}
        <div className="p-4 border-t border-slate-100">
          <div className={`flex items-center gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 ${isSidebarOpen ? '' : 'justify-center'}`}>
            <img 
              src={admin?.profileImage ? `${getApiBaseUrl()}/${admin.profileImage}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${admin?.email || 'admin'}`} 
              className="w-10 h-10 rounded-full border border-slate-200 bg-white object-cover shrink-0" 
              onError={(e) => {
                e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${admin?.email || 'admin'}`;
              }}
            />
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-800 truncate">{admin?.name || 'Administrator'}</p>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">{admin?.designation || 'System Admin'}</p>
              </div>
            )}
            {isSidebarOpen && (
              <button 
                onClick={handleLogout} 
                className="text-slate-400 hover:text-red-500 transition-colors p-1"
                title="Logout Session"
              >
                <MdLogout size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Sidebar Collapse Toggle */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-24 w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-md hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <span className="text-[10px]">{isSidebarOpen ? '◀' : '▶'}</span>
        </button>
      </aside>

      {/* 📱 MOBILE SIDEBAR / DRAWER */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-slate-900 z-40 md:hidden"
            />

            {/* Slide-out Panel */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 bottom-0 left-0 w-[280px] bg-white border-r border-slate-100 text-slate-600 p-6 flex flex-col z-50 md:hidden animate-slide-in"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-tr from-slate-800 to-slate-700 rounded-xl text-white shadow-md shrink-0">
                    <MdShield size={24} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-[15px] uppercase tracking-wider text-slate-800 leading-none">TaskManager</span>
                    <span className="text-[9px] uppercase tracking-[0.25em] text-red-500 font-bold mt-1">Admin Panel</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMobileOpen(false)} 
                  className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-500 hover:text-slate-800"
                >
                  <MdClose size={20} />
                </button>
              </div>

              <nav className="flex-1 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-4 py-3.5 px-4 rounded-2xl transition-all duration-200 ${
                        isActive 
                          ? 'bg-slate-100 text-slate-900 font-bold shadow-sm' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Icon size={22} className="shrink-0" />
                      <span className="text-sm font-bold tracking-wide">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-6 border-t border-slate-100 mt-auto">
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <img 
                    src={admin?.profileImage ? `${getApiBaseUrl()}/${admin.profileImage}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${admin?.email || 'admin'}`} 
                    className="w-10 h-10 rounded-full border border-slate-200 bg-white object-cover shrink-0" 
                    onError={(e) => {
                      e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${admin?.email || 'admin'}`;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-800 truncate">{admin?.name || 'Administrator'}</p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{admin?.designation || 'System Admin'}</p>
                  </div>
                  <button 
                    onClick={handleLogout} 
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                  >
                    <MdLogout size={18} />
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 🚀 MAIN CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top bar header */}
        <header className="h-20 bg-white/70 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 md:px-12 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 md:hidden"
            >
              <MdMenu size={24} />
            </button>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-800 capitalize">
              {getPageTitle()}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick profile info */}
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-bold text-slate-700">{admin?.name || 'Admin User'}</span>
              <span className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-0.5">{admin?.designation || 'Faculty'}</span>
            </div>
            
            <Link to="/profile">
              <img 
                src={admin?.profileImage ? `${getApiBaseUrl()}/${admin.profileImage}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${admin?.email || 'admin'}`} 
                className="w-10 h-10 rounded-full border border-slate-100 bg-white object-cover cursor-pointer hover:ring-4 hover:ring-indigo-500/10 transition-all shadow-sm"
                onError={(e) => {
                  e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${admin?.email || 'admin'}`;
                }}
              />
            </Link>
          </div>
        </header>

        {/* Screen Content */}
        <main className="flex-1 p-6 md:p-12 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

    </div>
  );
};

export default Layout;
