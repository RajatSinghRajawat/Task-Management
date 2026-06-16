import { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdSpaceDashboard,
  MdTaskAlt,
  MdPeopleOutline,
  MdInsertChartOutlined,
  MdOutlineFolderZip,
  MdNotificationsNone,
  MdOutlinePersonOutline,
  MdMenuOpen,
  MdMenu,
  MdClose,
  MdLogout
} from 'react-icons/md';

const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsMobile(true);
        setIsOpen(true);
      } else {
        setIsMobile(false);
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsMobileOpen]);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch("http://localhost:7001/api/auth/logout", {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` }
        });
      }
    } catch (e) { console.error(e); }
    finally {
      localStorage.clear();
      navigate("/");
      window.location.reload();
    }
  };

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <MdSpaceDashboard size={22} /> },
    { name: "Assignments", path: "/tasks", icon: <MdTaskAlt size={22} /> },
    { name: "Student Directory", path: "/students", icon: <MdPeopleOutline size={22} /> },
    { name: "Performance Analytics", path: "/reports", icon: <MdInsertChartOutlined size={22} /> },
    { name: "Learning Assets", path: "/materials", icon: <MdOutlineFolderZip size={22} /> },
    { name: "Notifications", path: "/notifications", icon: <MdNotificationsNone size={22} /> },
    { name: "Account Settings", path: "/profile", icon: <MdOutlinePersonOutline size={22} /> },
  ];

  const sidebarVariants = {
    open: { width: 280, transition: { duration: 0.3 } },
    closed: { width: 88, transition: { duration: 0.3 } },
    mobile: { x: 0, width: 280, transition: { duration: 0.3 } },
    mobileClosed: { x: -280, width: 280, transition: { duration: 0.3 } }
  };

  return (
    <>
      <AnimatePresence>
        {isMobile && isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <motion.div
        variants={sidebarVariants}
        animate={isMobile ? (isMobileOpen ? 'mobile' : 'mobileClosed') : (isOpen ? 'open' : 'closed')}
        className={`${isMobile ? 'fixed' : 'relative'} h-screen bg-white text-slate-700 z-50 flex flex-col border-r border-slate-200 shadow-sm overflow-hidden font-sans`}
      >
        <div className={`flex flex-col items-center justify-center p-4 mb-2 border-b border-slate-50 relative group min-h-[140px]`}>
          <button
            onClick={isMobile ? () => setIsMobileOpen(false) : toggleSidebar}
            className="absolute right-2 top-2 p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-700 transition-all active:scale-95 border border-slate-100 shadow-sm z-10"
          >
            {isMobile ? <MdClose size={16} /> : (isOpen ? <MdMenuOpen size={16} /> : <MdMenu size={16} />)}
          </button>

          <div className="flex flex-col items-center justify-center w-full">
            <img
              src="/logo.png"
              alt="TIPS-G Logo"
              className={`w-[220px] h-[130px] object-contain transition-all duration-500 ${isOpen ? 'scale-100' : 'scale-75 opacity-50'}`}
            />
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto py-2 px-4 space-y-1 custom-scrollbar">
          {menuItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              onClick={() => isMobile && setIsMobileOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative
                ${isActive
                  ? 'bg-blue-50 text-blue-700 font-bold shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-blue-700 font-medium'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <div className={`transition-transform duration-300 group-hover:scale-110 shrink-0 ${isActive ? 'text-blue-700' : 'text-slate-400 group-hover:text-blue-600'}`}>
                    {item.icon}
                  </div>
                  {(isMobile || isOpen) && (
                    <span className="font-sans tracking-wide whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                      {item.name}
                    </span>
                  )}
                  {isActive && (
                    <div className="absolute left-0 w-1 h-5 bg-blue-700 rounded-r-full" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Bottom Profile Section */}
        <div className="p-4 mt-auto">
          <div className={`p-3 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm transition-all duration-300 ${(!isMobile && !isOpen) ? 'flex flex-col items-center gap-4' : 'flex items-center gap-3'}`}>
            <Link
              to="/profile"
              onClick={() => isMobile && setIsMobileOpen(false)}
              className={`flex items-center gap-3 flex-1 overflow-hidden group`}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-800 p-0.5 shadow-sm shrink-0 relative group-hover:scale-110 transition-transform duration-300">
                <div className="w-full h-full rounded-[10px] bg-white overflow-hidden flex items-center justify-center font-bold text-blue-800 text-xs">
                  {user?.profileImage ? (
                    <img
                      src={`http://localhost:7001/${user.profileImage}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.name ? user.name.charAt(0).toUpperCase() : 'T'
                  )}
                </div>
              </div>

              {(isMobile || isOpen) && (
                <div className="overflow-hidden animate-in fade-in slide-in-from-left-2 duration-300">
                  <p className="text-sm font-bold text-slate-800 truncate leading-none mb-1 ">
                    {user?.name ? `${user.name.split(' ')[0]} ${user.gender === 'Female' ? 'Mam' : 'Sir'}` : 'Teacher'}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    Admin
                  </p>
                </div>
              )}
            </Link>

            <button
              onClick={handleLogout}
              className={`p-2 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-90 shrink-0`}
              title="Logout"
            >
              <MdLogout size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
