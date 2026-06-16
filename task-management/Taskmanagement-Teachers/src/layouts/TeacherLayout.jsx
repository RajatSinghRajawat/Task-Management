import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const TeacherLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden selection:bg-blue-100 selection:text-blue-900 text-slate-900">
      {/* Sidebar Component */}
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Topbar Component */}
        <Topbar setIsMobileOpen={setIsMobileOpen} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#f8fafc]">
          <div className="px-6 lg:px-10 py-8 mx-auto w-full max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;
