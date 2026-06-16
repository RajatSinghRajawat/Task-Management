import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { 
  MdCloudUpload, MdClose, MdPictureAsPdf, MdOndemandVideo, MdLink, 
  MdDownload, MdEdit, MdDeleteOutline, MdFolder, MdSearch, MdFilterList,
  MdVisibility, MdAttachFile, MdPlayCircleOutline,
  MdCheckCircle, MdRefresh, MdKeyboardArrowRight
} from 'react-icons/md';

const API = 'http://localhost:7001/api/materials';
const AUTH_TOKEN = () => localStorage.getItem('token');

const COURSES = [
  "Software-Development", "Data-Science", "Cyber-Security", "Cloud-Computing", 
  "Artificial-Intelligence", "Digital-Marketing", "UI-UX-Design", 
  "Business-Analytics", "Project-Management", "DevOps"
];

const BATCHES = ["2024", "2025", "2026", "2027", "2028", "2029", "2030"];

const MaterialCard = ({ material, onEdit, onDelete, onView }) => {
  const getIcon = () => {
    switch (material.type) {
      case 'PDF': return <MdPictureAsPdf className="text-rose-500" size={32} />;
      case 'Video': return <MdOndemandVideo className="text-blue-600" size={32} />;
      case 'Image': return <MdAttachFile className="text-emerald-500" size={32} />;
      default: return <MdLink className="text-blue-500" size={32} />;
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-2xl rounded-3xl p-9 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-2xl hover:shadow-blue-600/10 transition-all duration-500 group flex flex-col relative overflow-hidden hover:-translate-y-2 h-full">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-700 opacity-[0.03] rounded-bl-full" />
      <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-all flex gap-3 z-20">
         <button onClick={() => onEdit(material)} className="w-10 h-10 bg-white/80 backdrop-blur-xl text-slate-400 hover:text-blue-700 rounded-2xl shadow-xl border border-white flex items-center justify-center transition-all hover:scale-110"><MdEdit size={18} /></button>
         <button onClick={() => onDelete(material._id)} className="w-10 h-10 bg-white/80 backdrop-blur-xl text-slate-400 hover:text-rose-600 rounded-2xl shadow-xl border border-white flex items-center justify-center transition-all hover:scale-110"><MdDeleteOutline size={18} /></button>
      </div>

      <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center mb-8 shrink-0 relative z-10 group-hover:scale-110 transition-transform duration-500">
        {getIcon()}
      </div>
      
      <div className="flex-1 space-y-4 relative z-10">
        <h3 onClick={() => onView(material)} className="text-lg font-bold text-slate-800 cursor-pointer hover:text-blue-700 transition-colors line-clamp-2 leading-tight ">
          {material.title}
        </h3>
        
        <div className="flex flex-wrap gap-2">
          {(Array.isArray(material.course) ? material.course.slice(0, 1) : [material.course]).map(c => (
             <span key={c} className="bg-blue-50 text-blue-700 text-[8px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg border border-blue-100/50">
              {c?.replace(/-/g, ' ')}
             </span>
          ))}
          <span className="bg-slate-50 text-slate-400 text-[8px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg border border-slate-200/20">B_{material.batch}</span>
        </div>

        <p className="text-[11px] font-bold text-slate-400 line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
          {material.description || "Core academic asset for specialization modules."}
        </p>
      </div>

      <div className="mt-8 pt-7 border-t border-slate-100/50 flex gap-4 relative z-10">
        <button onClick={() => onView(material)} className="flex-1 py-4 bg-slate-900 text-white hover:bg-blue-700 text-[9px] font-bold uppercase tracking-[0.4em] rounded-[20px] transition-all shadow-xl shadow-blue-100 flex justify-center items-center gap-3 group/btn active:scale-95">
           EXPLORE <MdKeyboardArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform"/>
        </button>
      </div>
    </div>
  );
};

const Materials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ course: 'All', type: 'All', search: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('upload'); 
  const [currentMaterial, setCurrentMaterial] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', course: [], batch: BATCHES[0], type: 'PDF', links: '' });
  const [files, setFiles] = useState([]);

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(API, {
        params: {
          course: filter.course === 'All' ? undefined : filter.course,
          type: filter.type === 'All' ? undefined : filter.type,
          search: filter.search
        }
      });
      setMaterials(res.data.data || []);
    } catch { toast.error("Asset Sync Fault"); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchMaterials(); }, [fetchMaterials]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.course.length === 0) {
      toast.error("Select Target Faculty");
      return;
    }
    const formData = new FormData();
    Object.keys(form).forEach(key => {
      if (key === 'course') form.course.forEach(c => formData.append('course', c));
      else formData.append(key, form[key]);
    });
    files.forEach(file => formData.append('files', file));

    try {
      const config = { headers: { Authorization: `Bearer ${AUTH_TOKEN()}` } };
      if (modalType === 'edit') await axios.put(`${API}/${currentMaterial._id}`, formData, config);
      else await axios.post(`${API}/upload`, formData, config);
      toast.success("Registry Updated");
      setIsModalOpen(false);
      fetchMaterials();
    } catch (err) { 
      const msg = err.response?.data?.message || "Operation Fault";
      toast.error(msg); 
    }
  };

  const toggleCourse = (course) => {
    setForm(prev => prev.course.includes(course) 
      ? { ...prev, course: prev.course.filter(c => c !== course) }
      : { ...prev, course: [...prev.course, course] }
    );
  };

  const handleDelete = async (id) => {
    if (!confirm("Purge Asset?")) return;
    try {
      await axios.delete(`${API}/${id}`, { headers: { Authorization: `Bearer ${AUTH_TOKEN()}` } });
      toast.success("Purged");
      fetchMaterials();
    } catch (err) { 
      const msg = err.response?.data?.message || "Purge Fault";
      toast.error(msg); 
    }
  };

  const openModal = (type, material = null) => {
    setModalType(type);
    setCurrentMaterial(material);
    if (material) {
      setForm({ 
        title: material.title, description: material.description, 
        course: Array.isArray(material.course) ? material.course : [material.course], 
        batch: material.batch || BATCHES[0],
        type: material.type, links: material.links?.join(', ') || '' 
      });
    } else {
      setForm({ title: '', description: '', course: [], batch: BATCHES[0], type: 'PDF', links: '' });
    }
    setFiles([]);
    setIsModalOpen(true);
  };

  const inp = "w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] font-bold text-sm outline-none focus:ring-4 focus:ring-blue-400/5 focus:border-blue-600 transition-all placeholder:text-slate-300";
  const lbl = "text-[9px] font-bold text-slate-400 uppercase tracking-wide ml-2 mb-2.5 block";

  return (
    <div className="w-full space-y-12 animate-in fade-in duration-700 pb-20 relative">
      {/* Background Glows */}
      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-700/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-700/5 blur-[120px] rounded-full pointer-events-none" />

      <Toaster position="top-right" />
      
      {/* 🚀 ELITE HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10">
        <div>
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight  mb-1">Asset Vault</h1>
          <p className="text-slate-400 font-bold text-sm tracking-wide flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.4)]"></span>
            Multi-Engine Knowledge Repository Synced
          </p>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={fetchMaterials} className={`p-4 bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/50 text-slate-400 hover:text-blue-700 transition-all ${loading ? 'animate-spin' : ''}`}>
              <MdRefresh size={24} />
           </button>
           <button onClick={() => openModal('upload')} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-[0.4em] shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-3 active:scale-95">
              <MdCloudUpload size={22} /> Deploy Asset
           </button>
        </div>
      </div>

      {/* 📊 ASSET ANALYTICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
         {[
           { label: 'Total Vectors', val: materials.length, icon: <MdFolder />, bg: 'bg-blue-50', color: 'text-blue-700' },
           { label: 'PDF Engines', val: materials.filter(m => m.type === 'PDF').length, icon: <MdPictureAsPdf />, bg: 'bg-rose-50', color: 'text-rose-600' },
           { label: 'Video Streams', val: materials.filter(m => m.type === 'Video').length, icon: <MdOndemandVideo />, bg: 'bg-blue-50', color: 'text-blue-700' },
           { label: 'Web Links', val: materials.filter(m => m.type === 'Link').length, icon: <MdLink />, bg: 'bg-emerald-50', color: 'text-emerald-600' },
         ].map(s => (
           <div key={s.label} className="bg-white/60 backdrop-blur-2xl p-8 rounded-[44px] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex items-center gap-7 group hover:shadow-2xl hover:shadow-blue-600/10 transition-all hover:-translate-y-1">
              <div className={`w-16 h-16 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-transform`}>{s.icon}</div>
              <div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{s.label}</p>
                 <p className="text-3xl font-bold text-slate-800  mt-0.5 tracking-tighter">{s.val}</p>
              </div>
           </div>
         ))}
      </div>

      {/* 🔍 FILTER ENGINE */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
         <div className="relative col-span-2 group">
            <MdSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-700 transition-colors" size={24} />
            <input placeholder="Search assets by identifier..." value={filter.search} onChange={e => setFilter({...filter, search: e.target.value})} className="w-full pl-16 pr-8 py-5 bg-white/60 backdrop-blur-xl border border-white/60 rounded-2xl shadow-sm font-bold text-sm outline-none focus:ring-8 focus:ring-indigo-400/5 transition-all shadow-inner" />
         </div>
         <div className="relative">
            <select value={filter.course} onChange={e => setFilter({...filter, course: e.target.value})} className="w-full px-8 py-5 bg-white/60 backdrop-blur-xl border border-white/60 rounded-2xl shadow-sm font-bold text-[10px] uppercase tracking-[0.2em] outline-none cursor-pointer hover:bg-blue-50 transition-all appearance-none">
               <option value="All">All Faculties</option>
               {COURSES.map(c => <option key={c} value={c}>{c.replace(/-/g, ' ')}</option>)}
            </select>
            <MdFilterList className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={20} />
         </div>
         <div className="relative">
            <select value={filter.type} onChange={e => setFilter({...filter, type: e.target.value})} className="w-full px-8 py-5 bg-white/60 backdrop-blur-xl border border-white/60 rounded-2xl shadow-sm font-bold text-[10px] uppercase tracking-[0.2em] outline-none cursor-pointer hover:bg-blue-50 transition-all appearance-none">
               <option value="All">All Formats</option>
               <option value="PDF">PDF Engine</option>
               <option value="Video">Video stream</option>
               <option value="Link">Web Vectors</option>
            </select>
            <MdKeyboardArrowRight className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none rotate-90" size={20} />
         </div>
      </div>

      {/* 🧩 ASSET GRID */}
      {loading && materials.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 relative z-10">
           {[...Array(4)].map((_,i) => <div key={i} className="h-80 bg-white/20 backdrop-blur-3xl rounded-3xl animate-pulse border border-white/40" />)}
        </div>
      ) : materials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 relative z-10">
          {materials.map(material => (
            <MaterialCard key={material._id} material={material} onEdit={(m) => openModal('edit', m)} onDelete={handleDelete} onView={(m) => openModal('view', m)} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-40 bg-white/40 backdrop-blur-2xl rounded-[64px] border border-white/60 shadow-sm relative z-10">
           <MdFolder size={80} className="text-slate-200 mb-8 opacity-50" />
           <p className="text-2xl font-bold text-slate-300 uppercase tracking-[0.4em]">Vault Empty</p>
        </div>
      )}

      {/* 📦 MODALS */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white rounded-[56px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-300">
              <div className="p-12 border-b border-slate-50 flex justify-between items-center bg-[#F8FAFC]/50">
                 <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight leading-none mb-2">
                       {modalType === 'view' ? 'Material Details' : modalType === 'edit' ? 'Edit Material' : 'Add New Material'}
                    </h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">Fill in the details below to sync assets</p>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="p-4 text-slate-300 hover:text-rose-600 rounded-2xl transition-all"><MdClose size={28} /></button>
              </div>

              <div className="p-12 overflow-y-auto no-scrollbar">
                 {modalType === 'view' ? (
                    <div className="space-y-12">
                       <div className="flex items-center gap-8 p-10 bg-slate-50 rounded-[44px] border border-slate-50">
                          <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-xl">
                             {currentMaterial.type === 'PDF' && <MdPictureAsPdf className="text-rose-500" size={48} />}
                             {currentMaterial.type === 'Video' && <MdOndemandVideo className="text-violet-500" size={48} />}
                             {currentMaterial.type === 'Link' && <MdLink className="text-blue-600" size={48} />}
                             {currentMaterial.type === 'Image' && <MdAttachFile className="text-emerald-500" size={48} />}
                          </div>
                          <div>
                             <h4 className="text-2xl font-bold text-slate-900 tracking-tight leading-none mb-3">{currentMaterial.title}</h4>
                             <div className="flex gap-2">
                                <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wide bg-violet-50 px-3 py-1.5 rounded-lg">Batch {currentMaterial.batch}</span>
                             </div>
                          </div>
                       </div>
                       
                       <div className="space-y-4">
                          <p className={lbl}>Technical Abstract</p>
                          <div className="p-10 bg-slate-50/50 rounded-3xl border border-slate-100 font-bold text-slate-500 leading-relaxed text-sm">
                             {currentMaterial.description || "Core resource deployed for specialization modules."}
                          </div>
                       </div>

                       <div className="space-y-4">
                          {currentMaterial.type === 'Link' ? (
                             <a href={currentMaterial.links?.[0]} target="_blank" rel="noreferrer" className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-bold text-[11px] uppercase tracking-[0.4em] text-center hover:bg-violet-600 transition-all shadow-2xl flex items-center justify-center gap-3">Launch Link <MdKeyboardArrowRight size={20}/></a>
                          ) : (
                             <div className="space-y-3">
                                {currentMaterial.files?.map((f, i) => (
                                   <a key={i} href={`http://localhost:7001/${f}`} target="_blank" rel="noreferrer" className="w-full py-5 bg-white border border-slate-100 rounded-2xl flex items-center justify-center gap-3 font-bold text-[10px] uppercase tracking-wide text-slate-600 hover:bg-slate-900 hover:text-white transition-all group">
                                      <MdDownload size={20} className="group-hover:translate-y-1 transition-transform"/> Download Vector {i + 1}
                                   </a>
                                ))}
                             </div>
                          )}
                       </div>
                    </div>
                 ) : (
                    <form onSubmit={handleSave} className="space-y-10">
                        <div className="space-y-8">
                           <div>
                              <label className={lbl}>Material Title</label>
                              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className={inp} placeholder="e.g. React Basics Notes" required />
                           </div>

                           <div>
                              <label className={lbl}>Assign to Courses</label>
                             <div className="grid grid-cols-2 gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-50">
                                {COURSES.map(course => (
                                   <button type="button" key={course} onClick={() => toggleCourse(course)} className={`flex items-center gap-3 px-5 py-4 rounded-2xl border-2 transition-all text-left ${form.course.includes(course) ? 'bg-violet-600 border-violet-600 text-white shadow-xl' : 'bg-white border-white text-slate-400 hover:border-violet-100'}`}>
                                      <span className="text-[10px] font-bold uppercase tracking-wide leading-none">{course.replace(/-/g, ' ')}</span>
                                   </button>
                                ))}
                             </div>
                          </div>

                          <div className="grid grid-cols-2 gap-8">
                              <div>
                                 <label className={lbl}>Target Batch</label>
                                 <select value={form.batch} onChange={e => setForm({...form, batch: e.target.value})} className={inp} required>
                                    {BATCHES.map(b => <option key={b} value={b}>{b}</option>)}
                                 </select>
                              </div>
                              <div>
                                 <label className={lbl}>Material Type</label>
                                 <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className={inp}>
                                    <option value="PDF">PDF Document</option>
                                    <option value="Video">Video Tutorial</option>
                                    <option value="Image">Image Reference</option>
                                    <option value="Link">External Link</option>
                                 </select>
                              </div>
                          </div>
                       </div>

                        <div className="space-y-4">
                           <label className={lbl}>Upload Files</label>
                          <div className="relative group">
                             <input type="file" multiple onChange={e => setFiles(Array.from(e.target.files))} className="w-full px-6 py-16 bg-slate-50 border-4 border-dashed border-slate-100 rounded-3xl text-[10px] font-bold uppercase text-slate-300 file:hidden cursor-pointer hover:bg-blue-50/50 hover:border-blue-200 transition-all text-center" />
                             <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 flex-col gap-4">
                                <MdCloudUpload size={48} className="text-slate-200 group-hover:text-violet-400 transition-all" />
                                <span className="font-bold text-[10px] tracking-[0.4em] uppercase">{files.length > 0 ? `${files.length} FILES INJECTED` : "READY FOR INJECTION"}</span>
                             </div>
                          </div>
                       </div>

                        <button type="submit" className="w-full py-7 bg-slate-900 text-white rounded-[32px] font-bold text-[12px] uppercase tracking-[0.5em] shadow-2xl hover:bg-blue-700 transition-all transform active:scale-[0.98]">
                           {modalType === 'edit' ? 'SAVE CHANGES' : 'UPLOAD MATERIAL'}
                        </button>
                    </form>
                 )}
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default Materials;
