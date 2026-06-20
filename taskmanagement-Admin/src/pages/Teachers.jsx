import { useEffect, useState } from 'react';
import { MdAdd, MdSearch, MdEdit, MdDelete, MdFilterList, MdInfo } from 'react-icons/md';
import { getApiBaseUrl } from '../utils/api';
import TeacherModal from '../components/TeacherModal';
import TeacherDetailsModal from '../components/TeacherDetailsModal';
import toast, { Toaster } from 'react-hot-toast';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDesignation, setSelectedDesignation] = useState('All');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailsTeacherId, setDetailsTeacherId] = useState(null);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/teacher`, { headers });
      if (!res.ok) throw new Error("Failed to load teachers roster");
      const data = await res.json();
      
      let filtered = data.teachers || [];

      // Apply Filters
      if (selectedDesignation !== 'All') {
        filtered = filtered.filter(t => t.designation === selectedDesignation);
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(t => t.name?.toLowerCase().includes(q) || t.email?.toLowerCase().includes(q) || t.subject?.toLowerCase().includes(q));
      }

      setTeachers(filtered);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load faculty members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [selectedDesignation, search]);

  const handleSaveTeacher = async (formData) => {
    const token = localStorage.getItem('adminToken');
    const baseUrl = getApiBaseUrl();
    const headers = {
      'Authorization': `Bearer ${token}`
    };

    try {
      let res;
      if (editingTeacher) {
        // Update Teacher
        res = await fetch(`${baseUrl}/api/teacher/${editingTeacher._id}`, {
          method: 'PUT',
          headers,
          body: formData
        });
      } else {
        // Enroll Teacher
        res = await fetch(`${baseUrl}/api/teacher`, {
          method: 'POST',
          headers,
          body: formData
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Operation failed');

      toast.success(editingTeacher ? 'Faculty profile updated' : 'Faculty enrolled successfully');
      fetchTeachers();
      setIsModalOpen(false);
      setEditingTeacher(null);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Error occurred');
    }
  };

  const handleDeleteTeacher = async (id) => {
    if (!window.confirm("Are you sure you want to permanently revoke this teacher's system credentials?")) return;

    try {
      const token = localStorage.getItem('adminToken');
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/teacher/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Revocation failed');

      toast.success('Faculty credentials revoked successfully');
      fetchTeachers();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Error occurred');
    }
  };

  const openEditModal = (teacher) => {
    setEditingTeacher(teacher);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingTeacher(null);
    setIsModalOpen(true);
  };

  const openDetailsModal = (id) => {
    setDetailsTeacherId(id);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-8">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Faculty Roster</h1>
          <p className="text-slate-400 text-[11px] mt-0.5">Enroll new faculty members, adjust designations, and manage academic fields.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider py-3 px-5 rounded-xl hover:bg-red-600 shadow-md transition-all cursor-pointer w-full sm:w-auto justify-center"
        >
          <MdAdd size={16} />
          Enroll Faculty
        </button>
      </div>

      {/* Control bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between gap-4">
        
        {/* Search */}
        <div className="flex-1 max-w-md relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search faculty by name, email, or subject..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl focus:outline-none focus:border-slate-400 focus:bg-white transition-all shadow-inner"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <MdSearch size={18} />
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <MdFilterList className="text-slate-400" size={16} />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Filters:</span>
          </div>

          <select
            value={selectedDesignation}
            onChange={(e) => setSelectedDesignation(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl focus:outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all cursor-pointer"
          >
            <option value="All">All Designations</option>
            <option value="Professor">Professor</option>
            <option value="Associate Professor">Associate Professor</option>
            <option value="Assistant Professor">Assistant Professor</option>
            <option value="Lecturer">Lecturer</option>
            <option value="Department Head">Department Head</option>
          </select>
        </div>

      </div>

      {/* Grid List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-slate-900"></div>
        </div>
      ) : teachers.length === 0 ? (
        <div className="bg-white p-12 rounded-[24px] border border-slate-100 text-center space-y-3">
          <p className="text-slate-400 text-xs">No registered faculty found matching selection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((t) => (
            <div 
              key={t._id}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6 hover:shadow-md hover:border-slate-200 transition-all flex flex-col justify-between relative overflow-hidden"
            >
              {/* Header inside card */}
              <div className="flex items-center gap-4">
                <img 
                  src={t.profileImage ? `${getApiBaseUrl()}/${t.profileImage}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.email}`} 
                  className="w-14 h-14 rounded-full border border-slate-100 bg-slate-50 object-cover shrink-0" 
                  onError={(e) => {
                    e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.email}`;
                  }}
                />
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-800 text-sm truncate leading-none mb-1">{t.name}</h3>
                  <p className="text-[10px] text-slate-400 font-semibold truncate">{t.email}</p>
                </div>
              </div>

              {/* Subject Batch stats */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl text-xs font-bold text-slate-600">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Specialization</p>
                  <span className="truncate block">{t.subject}</span>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Joined</p>
                  <span>{t.joinedDate ? new Date(t.joinedDate).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>

              {/* Status & Action layout */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                  {t.designation}
                </span>

                <div className="flex gap-2">
                  <button 
                    onClick={() => openDetailsModal(t._id)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer"
                    title="Faculty Metrics & Tasks"
                  >
                    <MdInfo size={18} />
                  </button>
                  <button 
                    onClick={() => openEditModal(t)}
                    className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                    title="Edit Profile"
                  >
                    <MdEdit size={18} />
                  </button>
                  <button 
                    onClick={() => handleDeleteTeacher(t._id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                    title="Revoke Credentials"
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
      <TeacherModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTeacher}
        teacher={editingTeacher}
      />

      {/* Details Modal */}
      <TeacherDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        teacherId={detailsTeacherId}
      />

    </div>
  );
};

export default Teachers;
