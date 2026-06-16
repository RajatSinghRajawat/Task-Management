import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const StudentLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
