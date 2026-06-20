import { useState, useEffect } from 'react';
import { MdClose, MdAttachFile } from 'react-icons/md';

const MaterialModal = ({ isOpen, onClose, onSave, material }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    course: 'BCA',
    batch: '2023-2026',
    className: 'BCA-3A',
    subject: 'Web Technologies',
    type: 'Notes',
    links: '',
    tags: '',
    visibility: 'Public'
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (material) {
      setForm({
        title: material.title || '',
        description: material.description || '',
        course: Array.isArray(material.course) ? material.course[0] : (material.course || 'BCA'),
        batch: material.batch || '2023-2026',
        className: material.className || 'BCA-3A',
        subject: material.subject || 'Web Technologies',
        type: material.type || 'Notes',
        links: Array.isArray(material.links) ? material.links.join(', ') : (material.links || ''),
        tags: Array.isArray(material.tags) ? material.tags.join(', ') : (material.tags || ''),
        visibility: material.visibility || 'Public'
      });
      setFiles([]);
    } else {
      setForm({
        title: '',
        description: '',
        course: 'BCA',
        batch: '2023-2026',
        className: 'BCA-3A',
        subject: 'Web Technologies',
        type: 'Notes',
        links: '',
        tags: '',
        visibility: 'Public'
      });
      setFiles([]);
    }
  }, [material, isOpen]);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('course', form.course);
    formData.append('batch', form.batch);
    formData.append('className', form.className);
    formData.append('subject', form.subject);
    formData.append('type', form.type);
    formData.append('links', form.links);
    formData.append('tags', form.tags);
    formData.append('visibility', form.visibility);

    if (files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-[32px] w-full max-w-lg border border-slate-100 shadow-2xl overflow-hidden flex flex-col my-8">
        
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-8 border-b border-slate-100 shrink-0">
          <h3 className="font-black text-slate-800 tracking-tight">
            {material ? 'Edit Course Material' : 'Share Course Material'}
          </h3>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-slate-800 transition-colors"
          >
            <MdClose size={18} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 p-8 space-y-6 overflow-y-auto max-h-[75vh]">
          
          <div className="space-y-4">
            
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Material Title</label>
              <input 
                type="text" 
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none focus:border-red-500 focus:bg-white transition-all shadow-inner"
                placeholder="e.g. Intro to Node.js Framework"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Overview Description</label>
              <textarea 
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none focus:border-red-500 focus:bg-white transition-all shadow-inner resize-none"
                placeholder="Give a brief summary of what this document covers..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Course */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Course</label>
                <select
                  value={form.course}
                  onChange={(e) => setForm({ ...form, course: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none focus:border-red-500 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="BCA">BCA</option>
                  <option value="MCA">MCA</option>
                  <option value="B.Tech">B.Tech</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="BBA">BBA</option>
                  <option value="MBA">MBA</option>
                </select>
              </div>

              {/* Batch */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Batch Year</label>
                <select
                  value={form.batch}
                  onChange={(e) => setForm({ ...form, batch: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none cursor-pointer"
                >
                  <option value="2022-2025">2022-2025</option>
                  <option value="2023-2026">2023-2026</option>
                  <option value="2024-2027">2024-2027</option>
                  <option value="2025-2028">2025-2028</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Subject */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Subject Name</label>
                <input 
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none focus:border-red-500 shadow-inner"
                  placeholder="e.g. Web Tech"
                />
              </div>

              {/* Category type */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Material Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none cursor-pointer"
                >
                  <option value="Notes">Notes</option>
                  <option value="Syllabus">Syllabus</option>
                  <option value="Previous Year Paper">Previous Year Paper</option>
                  <option value="Lecture Slides">Lecture Slides</option>
                </select>
              </div>
            </div>

            {/* External Links */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Reference Links (comma separated)</label>
              <input 
                type="text" 
                value={form.links}
                onChange={(e) => setForm({ ...form, links: e.target.value })}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none focus:border-red-500 shadow-inner"
                placeholder="https://drive.google.com/..., https://github.com/..."
              />
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Tags (comma separated)</label>
              <input 
                type="text" 
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none focus:border-red-500 shadow-inner"
                placeholder="javascript, express, routing"
              />
            </div>

            {/* Files */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Upload Lectures/Notes Files</label>
              <div className="relative border-2 border-dashed border-slate-200 hover:border-red-500 bg-slate-50 hover:bg-white rounded-2xl p-6 transition-all text-center cursor-pointer">
                <input 
                  type="file" 
                  multiple 
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-500">
                  {files.length > 0 ? `${files.length} Files Selected` : 'Drag documents here or click to browse'}
                </span>
              </div>
              {files.length > 0 && (
                <div className="text-[10px] font-bold text-slate-400 mt-2 space-y-1 pl-1">
                  {files.map((f, i) => <p key={i} className="truncate">• {f.name}</p>)}
                </div>
              )}
            </div>

          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 px-6 border border-slate-100 text-slate-500 text-xs font-black uppercase tracking-wider rounded-2xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 px-6 bg-slate-900 text-white text-xs font-black uppercase tracking-wider rounded-2xl hover:bg-red-600 shadow-lg transition-all"
            >
              {loading ? 'Sharing...' : 'Share Material'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default MaterialModal;
