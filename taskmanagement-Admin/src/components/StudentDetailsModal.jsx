import { useEffect, useState } from 'react';
import { MdClose, MdTrendingUp, MdCheckCircle, MdPending, MdCancel, MdAccessTime } from 'react-icons/md';
import { getApiBaseUrl } from '../utils/api';
import toast from 'react-hot-toast';

const StudentDetailsModal = ({ isOpen, onClose, studentId }) => {
  const [data, setData] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId || !isOpen) return;

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('adminToken');
        const headers = { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };

        const baseUrl = getApiBaseUrl();

        // 1. Fetch Student profile & tasks
        const resDetail = await fetch(`${baseUrl}/api/students/${studentId}`, { headers });
        if (!resDetail.ok) throw new Error("Failed to load student details");
        const jsonDetail = await resDetail.json();
        setData(jsonDetail);

        // 2. Fetch Activity log
        const resAct = await fetch(`${baseUrl}/api/students/${studentId}/activity`, { headers });
        if (resAct.ok) {
          const jsonAct = await resAct.json();
          setActivity(jsonAct);
        }
      } catch (err) {
        console.error(err);
        toast.error("Error retrieving scholar dashboard details");
        onClose();
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [studentId, isOpen]);

  if (!isOpen) return null;

  const countStatus = (status) => {
    if (!data || !data.tasks) return 0;
    return data.tasks.filter(t => t.submissionStatus === status).length;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-end z-50 transition-opacity">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col relative animate-slide-in">
        
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-8 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <h3 className="font-black text-slate-800 tracking-tight text-lg">Scholar Performance Desk</h3>
          </div>
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
                src={data?.profileImage ? `${getApiBaseUrl()}/${data.profileImage}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${data?.email}`} 
                className="w-20 h-20 rounded-full border border-slate-200 bg-white object-cover" 
                onError={(e) => {
                  e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${data?.email}`;
                }}
              />
              <div className="text-center sm:text-left space-y-1">
                <h4 className="font-black text-slate-800 text-lg leading-none">{data?.fullName || data?.name}</h4>
                <p className="text-xs text-slate-400 font-bold">{data?.email}</p>
                <div className="flex gap-2 mt-2 justify-center sm:justify-start">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">
                    {data?.course || data?.courses}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-slate-200/60 text-slate-600 px-2.5 py-1 rounded-full">
                    {data?.batch}
                  </span>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    data?.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {data?.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-50 flex flex-col items-center">
                <span className="text-indigo-600 mb-1"><MdTrendingUp size={24} /></span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Total Assigned</span>
                <span className="text-2xl font-black text-slate-800 mt-1">{data?.tasks?.length || 0}</span>
              </div>

              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-50 flex flex-col items-center">
                <span className="text-emerald-600 mb-1"><MdCheckCircle size={24} /></span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Completed</span>
                <span className="text-2xl font-black text-slate-800 mt-1">{countStatus("Submitted") + countStatus("Graded")}</span>
              </div>

              <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-50 flex flex-col items-center">
                <span className="text-amber-600 mb-1"><MdPending size={24} /></span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Pending</span>
                <span className="text-2xl font-black text-slate-800 mt-1">{countStatus("Pending")}</span>
              </div>

              <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-50 flex flex-col items-center">
                <span className="text-rose-600 mb-1"><MdCancel size={24} /></span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Missed</span>
                <span className="text-2xl font-black text-slate-800 mt-1">{countStatus("Missed")}</span>
              </div>
            </div>

            {/* Submissions Timelines */}
            <div className="space-y-4">
              <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">Academic Task Roster</h5>
              {data?.tasks?.length === 0 ? (
                <p className="text-slate-400 text-xs py-4 text-center">No tasks assigned to this scholar.</p>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto pr-2 border border-slate-100 rounded-3xl p-4">
                  {data?.tasks?.map((task) => (
                    <div key={task._id} className="py-4 flex justify-between items-start gap-4">
                      <div>
                        <h6 className="text-sm font-bold text-slate-800">{task.Title}</h6>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] text-slate-400 font-semibold">
                          <span>Deadline: {new Date(task.Deadline).toLocaleString()}</span>
                          {task.submissionDate && (
                            <>
                              <span>•</span>
                              <span className="text-indigo-600">Submitted: {new Date(task.submissionDate).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full shrink-0 ${
                        task.submissionStatus === 'Submitted' || task.submissionStatus === 'Graded'
                          ? 'bg-emerald-100 text-emerald-700'
                          : task.submissionStatus === 'Pending'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                        {task.submissionStatus}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Activity Chart Graph Preview */}
            <div className="space-y-4">
              <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">Task Activity Heatmap</h5>
              {activity.length === 0 ? (
                <p className="text-slate-400 text-xs py-2 text-center">No activity recorded.</p>
              ) : (
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl space-y-4">
                  <div className="flex flex-wrap gap-1">
                    {activity.map((act, idx) => {
                      let color = 'bg-slate-200';
                      if (act.status === 'Completed') color = 'bg-emerald-500';
                      if (act.status === 'Late') color = 'bg-amber-500';
                      if (act.status === 'Missed') color = 'bg-rose-500';

                      return (
                        <div 
                          key={idx} 
                          title={`${act.taskTitle}: ${act.status} (${act.fullDate})`}
                          className={`w-6 h-6 rounded-md ${color} hover:ring-2 hover:ring-slate-400 cursor-pointer transition-all`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex gap-4 text-[10px] font-bold text-slate-400 uppercase justify-center mt-2">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500 block"></span> Completed</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-500 block"></span> Late</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-rose-500 block"></span> Missed</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-slate-200 block"></span> Pending</span>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default StudentDetailsModal;
