import React, { useState, useEffect } from 'react';
import { MdSearch, MdNotificationsNone, MdMenu, MdOutlineCalendarToday } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getApiBaseUrl } from '../../utils/api';

const Topbar = ({ setIsMobileOpen }) => {
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const updateUserData = () => {
      const userData = localStorage.getItem('studentData');
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (e) {
          console.error("Error parsing user data", e);
        }
      }
    };

    updateUserData();
    window.addEventListener('storage', updateUserData);

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('storage', updateUserData);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const profileImageUrl = user?.profileImage 
    ? `${getApiBaseUrl()}/${user.profileImage.replace(/\\/g, '/')}`
    : null;

  return (
    <header className={`h-20 sticky top-0 z-30 px-6 lg:px-10 flex items-center justify-between transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] border-b border-white/20' : 'bg-transparent'}`}>
      <div className="flex items-center gap-6">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden p-2.5 rounded-2xl bg-white text-slate-600 hover:text-blue-700 transition-all active:scale-95 border border-slate-100 shadow-sm"
        >
          <MdMenu size={24} />
        </button>

        {/* Search Bar */}
        <div className="hidden md:flex items-center bg-white/70 backdrop-blur-md px-5 py-2.5 rounded-[20px] border border-slate-200/60 focus-within:border-indigo-400/50 focus-within:bg-white focus-within:shadow-[0_8px_30px_rgba(99,102,241,0.08)] transition-all group w-[300px] lg:w-[450px]">
          <MdSearch className="text-slate-400 group-focus-within:text-blue-500 transition-colors" size={22} />
          <input 
            type="text" 
            placeholder="Search tasks, materials..." 
            className="bg-transparent border-none outline-none text-[15px] text-slate-700 w-full placeholder:text-slate-400 font-medium ml-3"
          />
          <div className="hidden lg:flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 ml-2">
            <span className="text-[10px] font-bold text-slate-400">⌘</span>
            <span className="text-[10px] font-bold text-slate-400">K</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 lg:gap-8">
        {/* Date / Welcome */}
        <div className="hidden sm:flex flex-col items-end mr-2">
          <div className="flex items-center gap-2 text-slate-400 mb-0.5">
            <MdOutlineCalendarToday size={14} className="text-indigo-400" />
            <span className="text-[11px] font-bold uppercase tracking-[0.1em]">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <h2 className="text-sm font-bold text-slate-800 ">
            {new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening'}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-700">{user?.name ? user.name.split(' ')[0] : 'Student'}</span>
          </h2>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          <Link to="/notifications">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-3 rounded-2xl bg-white text-slate-600 hover:text-blue-700 transition-all border border-slate-100 shadow-sm group"
            >
              <MdNotificationsNone size={22} />
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white shadow-sm animate-pulse"></span>
            </motion.button>
          </Link>

          <div className="w-px h-8 bg-slate-200/60 mx-1 hidden lg:block"></div>

          {/* Profile Avatar */}
          <Link 
            to="/profile"
            className="flex items-center gap-3 p-1 pr-4 rounded-2xl hover:bg-white transition-all group"
          >
            <motion.div 
              whileHover={{ rotate: 5, scale: 1.05 }}
              className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-blue-500 to-blue-700 p-0.5 shadow-md relative overflow-hidden"
            >
              {profileImageUrl ? (
                 <img src={profileImageUrl} alt="Avatar" className="h-full w-full object-cover rounded-[14px]" />
              ) : (
                <div className="h-full w-full rounded-[14px] bg-white border-2 border-white overflow-hidden flex items-center justify-center font-bold text-blue-700 text-xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
                </div>
              )}
            </motion.div>
            <div className="hidden lg:block">
              <p className="text-[13px] font-bold text-slate-800 leading-tight truncate w-24">
                {user?.name || 'Student Account'}
              </p>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-tighter">
                Scholar
              </p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Topbar;

