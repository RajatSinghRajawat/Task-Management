import { useEffect, useState } from 'react';
import { MdClose, MdSchool, MdPhone, MdEmail, MdAssignment, MdAccessTime } from 'react-icons/md';
import { getApiBaseUrl } from '../utils/api';
import toast from 'react-hot-toast';

const TeacherDetailsModal = ({ isOpen, onClose, teacherId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teacherId || !isOpen) return;

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('adminToken');
        const headers = { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };

        const baseUrl = getApiBaseUrl();

        // Fetch Teacher profile and tasks
        const resDetail = await fetch(`${baseUrl}/api/teacher/${teacherId}`, { headers });
        if (!resDetail.ok) throw new Error("Failed to load teacher details");
        const jsonDetail = await resDetail.json();
        setData(jsonDetail);
      } catch (err) {
        console.error(err);
        toast.error("Error retrieving faculty details");
        onClose();
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [teacherId, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-end z-50 transition-opacity">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col relative animate-slide-in">
        
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-8 border-b border-slate-100 shrink-0">
          <h3 className="font-black text-slate-800 tracking-tight text-lg">Faculty Details Console</h3>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-slate-800 transition-colors"
          >
            <MdClose size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-slate-900"></div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            
            {/* Quick Profile Summary Card */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <img 
                src={data?.teacher?.profileImage ? `${getApiBaseUrl()}/${data.teacher.profileImage}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${data?.teacher?.email}`} 
                className="w-20 h-20 rounded-full border border-slate-200 bg-white object-cover" 
                onError={(e) => {
                  e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${data?.teacher?.email}`;
                }}
              />
              <div className="text-center sm:text-left space-y-1">
                <h4 className="font-black text-slate-800 text-lg leading-none">{data?.teacher?.name}</h4>
                <p className="text-xs text-slate-400 font-bold">{data?.teacher?.email}</p>
                <div className="flex gap-2 mt-2 justify-center sm:justify-start">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">
                    {data?.teacher?.designation}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-slate-200/60 text-slate-600 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <MdSchool size={12} /> {data?.teacher?.subject}
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tasks Created</span>
                <span className="text-2xl font-black text-slate-800 mt-2">{data?.tasks?.length || 0}</span>
              </div>
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Contact Phone</span>
                <span className="text-sm font-black text-slate-800 mt-3 flex items-center gap-1.5">
                  <MdPhone className="text-slate-400" size={16} /> {data?.teacher?.phone || 'N/A'}
                </span>
              </div>
            </div>

            {/* Timelines of Tasks Created */}
            <div className="space-y-4">
              <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">Tasks Assigned by Faculty</h5>
              {data?.tasks?.length === 0 ? (
                <p className="text-slate-400 text-xs py-4 text-center">No tasks assigned by this faculty member yet.</p>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto pr-2 border border-slate-100 rounded-3xl p-4">
                  {data?.tasks?.map((task) => (
                    <div key={task._id} className="py-4 flex justify-between items-start gap-4">
                      <div>
                        <h6 className="text-sm font-bold text-slate-800">{task.Title}</h6>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] text-slate-400 font-semibold">
                          <span>Target: {task.course} ({task.Batch})</span>
                          <span>•</span>
                          <span className="text-rose-500">Deadline: {new Date(task.Deadline).toLocaleString()}</span>
                        </div>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 bg-slate-100 text-slate-600`}>
                        {task.Task_Type}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default TeacherDetailsModal;
