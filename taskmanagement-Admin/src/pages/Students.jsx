import { useEffect, useState } from 'react';
import { MdAdd, MdSearch, MdEdit, MdDelete, MdInfo, MdFilterList } from 'react-icons/md';
import { getApiBaseUrl } from '../utils/api';
import StudentModal from '../components/StudentModal';
import StudentDetailsModal from '../components/StudentDetailsModal';
import toast, { Toaster } from 'react-hot-toast';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailsStudentId, setDetailsStudentId] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      const baseUrl = getApiBaseUrl();
      const params = new URLSearchParams();
      if (selectedCourse !== 'All') params.append('course', selectedCourse);
      if (selectedStatus !== 'All') params.append('status', selectedStatus);
      if (search) params.append('search', search);

      const res = await fetch(`${baseUrl}/api/students?${params.toString()}`, { headers });
      if (!res.ok) throw new Error("Failed to load students list");
      const data = await res.json();
      setStudents(data.students || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load scholars");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce/Fetch on filter change
    fetchStudents();
  }, [selectedCourse, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleSaveStudent = async (formData) => {
    const token = localStorage.getItem('adminToken');
    const baseUrl = getApiBaseUrl();
    const headers = {
      'Authorization': `Bearer ${token}`
    };

    try {
      let res;
      if (editingStudent) {
        // Update Student
        res = await fetch(`${baseUrl}/api/students/${editingStudent._id}`, {
          method: 'PUT',
          headers,
          body: formData
        });
      } else {
        // Enroll/Create Student
        res = await fetch(`${baseUrl}/api/students`, {
          method: 'POST',
          headers,
          body: formData
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Operation failed');

      toast.success(editingStudent ? 'Scholar profile updated' : 'Scholar enrolled successfully');
      fetchStudents();
      setIsModalOpen(false);
      setEditingStudent(null);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Error occurred');
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this student account?")) return;

    try {
      const token = localStorage.getItem('adminToken');
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/students/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Deletion failed');

      toast.success('Scholar deleted successfully');
      fetchStudents();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Error occurred');
    }
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingStudent(null);
    setIsModalOpen(true);
  };

  const openDetailsModal = (id) => {
    setDetailsStudentId(id);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-8">
      <Toaster position="top-center" />

      {/* Roster Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Scholars Roster</h1>
          <p className="text-slate-400 text-[11px] mt-0.5">Manage and track student enrollment statuses and progress.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider py-3 px-5 rounded-xl hover:bg-red-600 shadow-md transition-all cursor-pointer w-full sm:w-auto justify-center"
        >
          <MdAdd size={16} />
          Enroll Scholar
        </button>
      </div>

      {/* Filters & Search Control bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between gap-4">
        
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search scholars by name or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl focus:outline-none focus:border-slate-400 focus:bg-white transition-all shadow-inner"
          />
          <button type="submit" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <MdSearch size={18} />
          </button>
        </form>

        {/* Filters dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <MdFilterList className="text-slate-400" size={16} />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Filters:</span>
          </div>

          {/* Course select */}
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl focus:outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all cursor-pointer"
          >
            <option value="All">All Courses</option>
            <option value="BCA">BCA</option>
            <option value="MCA">MCA</option>
            <option value="B.Tech">B.Tech</option>
            <option value="M.Tech">M.Tech</option>
            <option value="BBA">BBA</option>
            <option value="MBA">MBA</option>
          </select>

          {/* Status select */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl focus:outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Graduated">Graduated</option>
          </select>
        </div>

      </div>

      {/* Scholars List (Grid) */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-slate-900"></div>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white p-12 rounded-[24px] border border-slate-100 text-center space-y-3">
          <p className="text-slate-400 text-xs">No scholars found matching your current filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <div 
              key={student._id}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6 hover:shadow-md hover:border-slate-200 transition-all flex flex-col justify-between relative overflow-hidden group"
            >
              
              {/* Header inside card */}
              <div className="flex items-center gap-4">
                <img 
                  src={student.profileImage ? `${getApiBaseUrl()}/${student.profileImage}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.email}`} 
                  className="w-14 h-14 rounded-full border border-slate-100 bg-slate-50 object-cover shrink-0" 
                  onError={(e) => {
                    e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.email}`;
                  }}
                />
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-800 truncate leading-none mb-1">{student.fullName}</h3>
                  <p className="text-xs text-slate-400 font-semibold truncate">{student.email}</p>
                </div>
              </div>

              {/* Course batch details */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl text-xs font-bold text-slate-600">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Course</p>
                  <span>{student.course}</span>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Batch</p>
                  <span>{student.batch}</span>
                </div>
              </div>

              {/* Status & Action layout */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                  student.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {student.status}
                </span>

                <div className="flex gap-2">
                  <button 
                    onClick={() => openDetailsModal(student._id)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer"
                    title="Scholar Metrics & Activity"
                  >
                    <MdInfo size={18} />
                  </button>
                  <button 
                    onClick={() => openEditModal(student)}
                    className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                    title="Edit Profile"
                  >
                    <MdEdit size={18} />
                  </button>
                  <button 
                    onClick={() => handleDeleteStudent(student._id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                    title="Delete Account"
                  >
                    <MdDelete size={18} />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <StudentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveStudent}
        student={editingStudent}
      />

      {/* Details Side-Drawer Modal */}
      <StudentDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        studentId={detailsStudentId}
      />

    </div>
  );
};

export default Students;
