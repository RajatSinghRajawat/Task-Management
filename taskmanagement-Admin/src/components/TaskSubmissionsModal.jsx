import { useEffect, useState } from 'react';
import { MdClose, MdCheckCircle, MdPending, MdFeedback, MdStar } from 'react-icons/md';
import { getApiBaseUrl } from '../utils/api';
import toast from 'react-hot-toast';

const TaskSubmissionsModal = ({ isOpen, onClose, taskId }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gradingSub, setGradingSub] = useState(null); // Submission data currently being graded
  const [gradeForm, setGradeForm] = useState({ marks: '', feedback: '' });
  const [gradeLoading, setGradeLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/tasks/${taskId}/submission-stats`, { headers });
      if (!res.ok) throw new Error("Failed to load submission statistics");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load task submissions");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (taskId && isOpen) {
      fetchStats();
      setGradingSub(null);
    }
  }, [taskId, isOpen]);

  const openGradingPanel = (sub) => {
    setGradingSub(sub);
    setGradeForm({
      marks: sub.submissionData?.marks || '',
      feedback: sub.submissionData?.feedback || ''
    });
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    setGradeLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      const baseUrl = getApiBaseUrl();
      
      const res = await fetch(`${baseUrl}/api/tasks/submissions/${gradingSub.submissionId}/grade`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          marks: Number(gradeForm.marks),
          feedback: gradeForm.feedback
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Grading failed');

      toast.success("Scholar grade submitted successfully");
      setGradingSub(null);
      fetchStats(); // Reload details
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Error saving grade');
    } finally {
      setGradeLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-end z-50 transition-opacity">
      <div className="bg-white w-full max-w-3xl h-full shadow-2xl flex flex-col relative animate-slide-in">
        
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-8 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="font-black text-slate-800 tracking-tight text-lg">Scholar Submissions Console</h3>
            <p className="text-xs text-slate-400 font-bold mt-0.5">{stats?.taskTitle}</p>
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
          <div className="flex-1 overflow-hidden flex flex-col">
            
            {/* Stats summary banner */}
            <div className="grid grid-cols-3 divide-x divide-slate-100 bg-slate-50 border-b border-slate-100 p-6 shrink-0 text-center">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Scholars</p>
                <h4 className="text-xl font-black text-slate-800 mt-1">{stats?.totalAssigned}</h4>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Submitted</p>
                <h4 className="text-xl font-black text-emerald-600 mt-1">{stats?.submittedCount}</h4>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending</p>
                <h4 className="text-xl font-black text-amber-600 mt-1">{stats?.pendingCount}</h4>
              </div>
            </div>

            {/* Main Area (List + Grading form overlay/split) */}
            <div className="flex-1 flex overflow-hidden relative">
              
              {/* Submission Roster List */}
              <div className="flex-1 overflow-y-auto p-8 space-y-4">
                {stats?.stats?.length === 0 ? (
                  <p className="text-slate-400 text-xs py-8 text-center">No scholars enrolled in this course / batch.</p>
                ) : (
                  stats?.stats?.map((sub) => (
                    <div 
                      key={sub.student._id}
                      className="p-5 bg-white border border-slate-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-200 transition-colors shadow-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img 
                          src={sub.student.profileImage ? `${getApiBaseUrl()}/${sub.student.profileImage}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${sub.student.email}`} 
                          className="w-10 h-10 rounded-full border border-slate-100 bg-slate-50 object-cover" 
                          onError={(e) => {
                            e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${sub.student.email}`;
                          }}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-700 truncate">{sub.student.fullName}</p>
                          <p className="text-[10px] text-slate-400 truncate">{sub.student.email}</p>
                        </div>
                      </div>

                      {/* Submitted content files */}
                      {sub.status === 'Submitted' && sub.submissionData && (
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Submitted Attachments</p>
                          <div className="flex flex-wrap gap-1.5">
                            {sub.submissionData.files?.map((f, idx) => (
                              <a 
                                key={idx}
                                href={`${getApiBaseUrl()}/${f}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] font-bold text-indigo-600 hover:underline bg-indigo-50 px-2 py-0.5 rounded"
                              >
                                File {idx + 1}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Marks / Grading status */}
                      <div className="flex items-center justify-between md:justify-end gap-6">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${
                          sub.status === 'Submitted'
                            ? sub.submissionData?.status === 'Late' 
                              ? 'bg-amber-100 text-amber-700' 
                              : 'bg-indigo-100 text-indigo-700'
                            : sub.status === 'Graded' || sub.submissionData?.status === 'Graded'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {sub.submissionData?.status || sub.status}
                        </span>

                        {sub.status === 'Submitted' && (
                          <button
                            onClick={() => openGradingPanel(sub)}
                            className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white py-2 px-4 rounded-xl hover:bg-red-600 transition-colors"
                          >
                            <MdStar size={14} /> Grade
                          </button>
                        )}

                        {sub.submissionData?.status === 'Graded' && (
                          <div className="text-right">
                            <span className="text-xs font-bold text-emerald-600">Marks: {sub.submissionData.marks}/100</span>
                            <button
                              onClick={() => openGradingPanel(sub)}
                              className="block text-[8px] font-bold text-slate-400 uppercase hover:underline mt-0.5"
                            >
                              Edit Grade
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  ))
                )}
              </div>

              {/* GRADING PANEL SLIDE-OVER */}
              {gradingSub && (
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-end z-20">
                  <form 
                    onSubmit={handleGradeSubmit}
                    className="w-full max-w-sm bg-white border-l border-slate-100 p-8 space-y-6 flex flex-col justify-between shadow-2xl animate-slide-in"
                  >
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h4 className="font-black text-slate-800 text-sm tracking-tight uppercase">Submit Grade Evaluation</h4>
                        <button 
                          type="button" 
                          onClick={() => setGradingSub(null)}
                          className="p-1 rounded-lg hover:bg-slate-100"
                        >
                          <MdClose size={18} />
                        </button>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                        <img 
                          src={gradingSub.student.profileImage ? `${getApiBaseUrl()}/${gradingSub.student.profileImage}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${gradingSub.student.email}`} 
                          className="w-10 h-10 rounded-full border border-slate-100 bg-white object-cover" 
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-700">{gradingSub.student.fullName}</p>
                          <p className="text-[10px] text-slate-400">{gradingSub.student.email}</p>
                        </div>
                      </div>

                      {/* Score Input */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Award Score (Max 100)</label>
                        <input 
                          type="number" 
                          min={0}
                          max={100}
                          value={gradeForm.marks}
                          onChange={(e) => setGradeForm({ ...gradeForm, marks: e.target.value })}
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none focus:border-red-500 focus:bg-white transition-all shadow-inner"
                          placeholder="e.g. 85"
                          required
                        />
                      </div>

                      {/* Feedback Comment */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Faculty Feedback</label>
                        <textarea 
                          value={gradeForm.feedback}
                          onChange={(e) => setForm ? setGradeForm({ ...gradeForm, feedback: e.target.value }) : null}
                          rows={4}
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none focus:border-red-500 focus:bg-white transition-all shadow-inner resize-none"
                          placeholder="Enter brief guidelines or review remarks..."
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setGradingSub(null)}
                        className="flex-1 py-4 border border-slate-100 text-slate-500 text-xs font-black uppercase tracking-wider rounded-2xl hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={gradeLoading}
                        className="flex-1 py-4 bg-slate-900 text-white text-xs font-black uppercase tracking-wider rounded-2xl hover:bg-red-600 shadow-lg transition-all"
                      >
                        {gradeLoading ? 'Evaluating...' : 'Apply Grade'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default TaskSubmissionsModal;
