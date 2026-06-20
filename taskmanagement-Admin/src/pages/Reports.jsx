import { useEffect, useState } from 'react';
import { MdAdd, MdSearch, MdEdit, MdDelete, MdFilterList, MdCheckCircle, MdKeyboardArrowDown, MdKeyboardArrowUp, MdAssessment } from 'react-icons/md';
import { getApiBaseUrl } from '../utils/api';
import ReportModal from '../components/ReportModal';
import toast, { Toaster } from 'react-hot-toast';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const baseUrl = getApiBaseUrl();
      const params = new URLSearchParams();
      if (selectedType !== 'All') params.append('reportType', selectedType);
      if (search) params.append('search', search);

      const res = await fetch(`${baseUrl}/api/reports?${params.toString()}`, { headers });
      if (!res.ok) throw new Error("Failed to load report cards");
      const json = await res.json();
      setReports(json.reports || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load academic reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedType, search]);

  const handleSaveReport = async (payload) => {
    const token = localStorage.getItem('adminToken');
    const baseUrl = getApiBaseUrl();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    try {
      let res;
      if (editingReport) {
        // Update Report
        res = await fetch(`${baseUrl}/api/reports/${editingReport._id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload)
        });
      } else {
        // Create/Publish Report
        res = await fetch(`${baseUrl}/api/reports`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Operation failed');

      toast.success(editingReport ? 'Report updated successfully' : 'Report published & notified scholar');
      fetchReports();
      setIsModalOpen(false);
      setEditingReport(null);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Error occurred');
    }
  };

  const handleDeleteReport = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this report card?")) return;

    try {
      const token = localStorage.getItem('adminToken');
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/reports/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Deletion failed');

      toast.success('Report card deleted successfully');
      fetchReports();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Error occurred');
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const openEditModal = (report) => {
    setEditingReport(report);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingReport(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Report Cards</h1>
          <p className="text-slate-400 text-xs mt-0.5">Publish test result summaries, grading sheets, and feedback to student portfolios.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-slate-900 text-white text-xs font-black uppercase tracking-wider py-4 px-6 rounded-2xl hover:bg-red-600 shadow-lg hover:shadow-red-500/20 transition-all cursor-pointer w-full sm:w-auto justify-center"
        >
          <MdAdd size={18} />
          Publish Report Card
        </button>
      </div>

      {/* Control bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between gap-6">
        
        {/* Search */}
        <div className="flex-1 max-w-md relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search report title or scholar name..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 text-sm font-semibold rounded-2xl focus:outline-none focus:border-red-500 focus:bg-white transition-all shadow-inner"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <MdSearch size={20} />
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <MdFilterList className="text-slate-400" size={18} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filters:</span>
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-3 bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 rounded-xl focus:outline-none cursor-pointer"
          >
            <option value="All">All Types</option>
            <option value="Assessment">Assessment</option>
            <option value="MidTerm">MidTerm</option>
            <option value="EndTerm">EndTerm</option>
            <option value="WeeklyQuiz">WeeklyQuiz</option>
          </select>
        </div>

      </div>

      {/* Reports List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-slate-900"></div>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white p-12 rounded-[32px] border border-slate-100 text-center space-y-3">
          <p className="text-slate-400 text-sm">No student report cards published yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => {
            const isExpanded = expandedId === r._id;
            return (
              <div 
                key={r._id}
                className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden hover:shadow-md transition-all"
              >
                {/* Accordion Row */}
                <div 
                  onClick={() => toggleExpand(r._id)}
                  className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img 
                      src={r.student?.profileImage ? `${getApiBaseUrl()}/${r.student.profileImage}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.student?.email}`} 
                      className="w-12 h-12 rounded-full border border-slate-100 bg-slate-50 object-cover shrink-0"
                      onError={(e) => {
                        e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.student?.email}`;
                      }}
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-800 truncate leading-none mb-1">{r.student?.fullName || r.student?.name || 'Deleted student'}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{r.reportTitle} ({r.reportType})</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-center shrink-0">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Grade Award</p>
                      <span className="text-sm font-black text-indigo-600 block mt-0.5">{r.grade}</span>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Attendance</p>
                      <span className="text-sm font-black text-slate-700 block mt-0.5">{r.attendancePercentage?.toFixed(0)}%</span>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Avg Test</p>
                      <span className="text-sm font-black text-slate-700 block mt-0.5">{r.averageTestMarks?.toFixed(0)}%</span>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Performance</p>
                      <span className="text-xs font-black text-slate-700 block mt-1">{r.overallPerformance}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-4 md:pt-0">
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); openEditModal(r); }}
                        className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                        title="Edit Report Card"
                      >
                        <MdEdit size={16} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteReport(r._id); }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                        title="Delete Report Card"
                      >
                        <MdDelete size={16} />
                      </button>
                    </div>
                    {isExpanded ? <MdKeyboardArrowUp size={24} className="text-slate-400" /> : <MdKeyboardArrowDown size={24} className="text-slate-400" />}
                  </div>

                </div>

                {/* Extended Details */}
                {isExpanded && (
                  <div className="bg-slate-50 border-t border-slate-100 p-6 md:p-8 space-y-6">
                    
                    {/* Performance metrics & Behavior */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-inner">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Assignment Compliance</p>
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <span className="text-[8px] font-black text-slate-400 uppercase">Assigned</span>
                            <p className="text-base font-black text-slate-700">{r.totalTasks}</p>
                          </div>
                          <div>
                            <span className="text-[8px] font-black text-slate-400 uppercase">Completed</span>
                            <p className="text-base font-black text-emerald-600">{r.completedTasks}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-inner">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Student Behavior Reviews</p>
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <span className="text-[8px] font-black text-slate-400 uppercase">Conduct</span>
                            <p className="text-xs font-black text-slate-700 mt-1">{r.conduct}</p>
                          </div>
                          <div>
                            <span className="text-[8px] font-black text-slate-400 uppercase">Behavior</span>
                            <p className="text-xs font-black text-slate-700 mt-1">{r.behavior}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-inner">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Term Duration</p>
                        <div className="text-xs font-semibold text-slate-600 space-y-1 mt-1">
                          <p>Start Date: {new Date(r.fromDate).toLocaleDateString()}</p>
                          <p>End Date: {new Date(r.toDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Test Marks table */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Test Grades Breakdown</p>
                      {r.tests?.length === 0 ? (
                        <p className="text-slate-400 text-xs text-center py-2">No test marks logged in this card.</p>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {r.tests.map((test, idx) => (
                            <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-700">{test.testName}</span>
                              <span className="font-black text-indigo-600">{test.marksObtained} / {test.totalMarks}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Remarks & Suggestions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
                      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-inner space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Faculty Remarks</p>
                        <p className="text-slate-600 font-semibold">{r.remarks || 'No remarks logged.'}</p>
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-inner space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Recommendations for Improvement</p>
                        <p className="text-slate-600 font-semibold">{r.suggestions || 'No recommendations logged.'}</p>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Publish Report Modal */}
      <ReportModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveReport}
        report={editingReport}
      />

    </div>
  );
};

export default Reports;
