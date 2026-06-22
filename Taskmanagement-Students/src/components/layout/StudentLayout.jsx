import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { getApiBaseUrl } from '../../utils/api';

const StudentLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const token = localStorage.getItem('studentToken');
        if (!token) return;
        const res = await axios.get(`${getApiBaseUrl()}/api/students/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // If the account was deleted from the database, res.data will be null
        if (!res.data || res.data.success === false) {
          localStorage.clear();
          navigate('/login');
          window.location.reload();
        }
      } catch (err) {
        if (err.response && (err.response.status === 401 || err.response.status === 404)) {
          localStorage.clear();
          navigate('/login');
          window.location.reload();
        }
      }
    };
    checkUser();
  }, [navigate]);

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden selection:bg-blue-100 selection:text-blue-900">
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden relative w-full">
        <Topbar setIsMobileOpen={setIsMobileOpen} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#f8fafc] scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          <div className="px-6 lg:px-10 py-8 mx-auto w-full max-w-full min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
