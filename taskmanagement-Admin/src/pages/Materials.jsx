import { useEffect, useState } from 'react';
import { MdAdd, MdSearch, MdEdit, MdDelete, MdFilterList, MdAttachFile, MdLink, MdFolderOpen } from 'react-icons/md';
import { getApiBaseUrl } from '../utils/api';
import MaterialModal from '../components/MaterialModal';
import toast, { Toaster } from 'react-hot-toast';

const Materials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const baseUrl = getApiBaseUrl();
      const params = new URLSearchParams();
      // Filter course if specified
      if (selectedCourse !== 'All') params.append('course', selectedCourse);
      if (selectedType !== 'All') params.append('type', selectedType);

      const res = await fetch(`${baseUrl}/api/materials?${params.toString()}`, { headers });
      if (!res.ok) throw new Error("Failed to load materials");
      const json = await res.json();
      
      let data = json.data || [];

      // Perform local search if name matched
      if (search) {
        const q = search.toLowerCase();
        data = data.filter(m => m.title?.toLowerCase().includes(q) || m.description?.toLowerCase().includes(q) || m.subject?.toLowerCase().includes(q));
      }

      setMaterials(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load study materials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [selectedCourse, selectedType, search]);

  const handleSaveMaterial = async (formData) => {
    const token = localStorage.getItem('adminToken');
    const baseUrl = getApiBaseUrl();
    const headers = {
      'Authorization': `Bearer ${token}`
    };

    try {
      let res;
      if (editingMaterial) {
        // Update Material
        res = await fetch(`${baseUrl}/api/materials/${editingMaterial._id}`, {
          method: 'PUT',
          headers,
          body: formData
        });
      } else {
        // Upload Material
        res = await fetch(`${baseUrl}/api/materials/upload`, {
          method: 'POST',
          headers,
          body: formData
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Operation failed');

      toast.success(editingMaterial ? 'Material updated successfully' : 'Course material shared successfully');
      fetchMaterials();
      setIsModalOpen(false);
      setEditingMaterial(null);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Error occurred');
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this material?")) return;

    try {
      const token = localStorage.getItem('adminToken');
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/materials/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Deletion failed');

      toast.success('Material removed from roster');
      fetchMaterials();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Error occurred');
    }
  };

  const openEditModal = (material) => {
    setEditingMaterial(material);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingMaterial(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Resource library</h1>
          <p className="text-slate-400 text-xs mt-0.5">Upload educational notes, syllabus structures, and reference guides.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-slate-900 text-white text-xs font-black uppercase tracking-wider py-4 px-6 rounded-2xl hover:bg-red-600 shadow-lg hover:shadow-red-500/20 transition-all cursor-pointer w-full sm:w-auto justify-center"
        >
          <MdAdd size={18} />
          Share Resource
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
            placeholder="Search materials by title or subject..."
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
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-4 py-3 bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 rounded-xl focus:outline-none cursor-pointer"
          >
            <option value="All">All Courses</option>
            <option value="BCA">BCA</option>
            <option value="MCA">MCA</option>
            <option value="B.Tech">B.Tech</option>
            <option value="M.Tech">M.Tech</option>
            <option value="BBA">BBA</option>
            <option value="MBA">MBA</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-3 bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 rounded-xl focus:outline-none cursor-pointer"
          >
            <option value="All">All Types</option>
            <option value="Notes">Notes</option>
            <option value="Syllabus">Syllabus</option>
            <option value="Previous Year Paper">Previous Year Paper</option>
            <option value="Lecture Slides">Lecture Slides</option>
          </select>
        </div>

      </div>

      {/* Grid List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-slate-900"></div>
        </div>
      ) : materials.length === 0 ? (
        <div className="bg-white p-12 rounded-[32px] border border-slate-100 text-center space-y-3">
          <p className="text-slate-400 text-sm">No shared resources found matching criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((m) => (
            <div 
              key={m._id}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6 hover:shadow-md hover:border-slate-200 transition-all flex flex-col justify-between relative"
            >
              <div className="space-y-4">
                
                {/* Header info */}
                <div className="flex justify-between items-start">
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    m.type === 'Syllabus' ? 'bg-indigo-100 text-indigo-700' :
                    m.type === 'Lecture Slides' ? 'bg-purple-100 text-purple-700' :
                    m.type === 'Previous Year Paper' ? 'bg-rose-100 text-rose-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {m.type}
                  </span>
                  
                  <span className="text-[10px] font-bold text-slate-400">
                    Views: {m.views || 0}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-slate-800 text-base leading-snug">{m.title}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                    {m.subject} • {m.course?.join(', ')} ({m.batch})
                  </p>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                  {m.description || 'No description provided.'}
                </p>

                {/* Tags */}
                {m.tags && m.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {m.tags.map((tag, i) => (
                      <span key={i} className="text-[9px] font-bold bg-slate-50 text-slate-500 px-2 py-0.5 rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Attachments & Links & Actions */}
              <div className="space-y-4 pt-4 border-t border-slate-50">
                {/* Attachment downloads */}
                {m.files && m.files.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Lecture Downloads</p>
                    <div className="flex flex-wrap gap-1.5">
                      {m.files.map((f, idx) => (
                        <a 
                          key={idx}
                          href={`${getApiBaseUrl()}/${f}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/50 hover:underline px-2.5 py-1 rounded-xl"
                        >
                          <MdAttachFile size={12} /> File {idx + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* External links */}
                {m.links && m.links.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Reference Links</p>
                    <div className="flex flex-col gap-1">
                      {m.links.map((link, idx) => (
                        <a 
                          key={idx}
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 hover:text-indigo-600 truncate hover:underline"
                        >
                          <MdLink size={14} className="shrink-0" /> {link}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-50/50">
                  <button 
                    onClick={() => openEditModal(m)}
                    className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                    title="Edit Resource"
                  >
                    <MdEdit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteMaterial(m._id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                    title="Delete Resource"
                  >
                    <MdDelete size={16} />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Upload/Edit Modal */}
      <MaterialModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMaterial}
        material={editingMaterial}
      />

    </div>
  );
};

export default Materials;
