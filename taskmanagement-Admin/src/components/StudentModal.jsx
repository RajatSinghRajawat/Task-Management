import { useState, useEffect } from 'react';
import { MdClose, MdCloudUpload } from 'react-icons/md';
import { getApiBaseUrl } from '../utils/api';

const StudentModal = ({ isOpen, onClose, onSave, student }) => {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    course: 'BCA',
    batch: '2023-2026',
    status: 'Active'
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student) {
      setForm({
        fullName: student.fullName || student.name || '',
        email: student.email || '',
        password: '', // Leave blank for edit unless they want to change
        course: student.course || student.courses || 'BCA',
        batch: student.batch || '2023-2026',
        status: student.status || 'Active'
      });
      setImagePreview(student.profileImage ? `${getApiBaseUrl()}/${student.profileImage}` : null);
    } else {
      setForm({
        fullName: '',
        email: '',
        password: '',
        course: 'BCA',
        batch: '2023-2026',
        status: 'Active'
      });
      setImageFile(null);
      setImagePreview(null);
    }
  }, [student, isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('fullName', form.fullName);
    formData.append('email', form.email);
    if (form.password) {
      formData.append('password', form.password);
    }
    formData.append('course', form.course);
    formData.append('batch', form.batch);
    formData.append('status', form.status);

    if (imageFile) {
      formData.append('profileImage', imageFile);
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
            {student ? 'Modify Scholar Profile' : 'Enroll New Scholar'}
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
          
          {/* Profile Image Uploader */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-28 h-28 rounded-full border-2 border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden group shadow-inner">
              {imagePreview ? (
                <img src={imagePreview} className="w-full h-full object-cover" />
              ) : (
                <MdCloudUpload className="text-slate-300" size={32} />
              )}
              <label className="absolute inset-0 bg-black/40 text-white text-[10px] font-black uppercase tracking-wider flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                Change Photo
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scholar Image</span>
          </div>

          <div className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
              <input 
                type="text" 
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none focus:border-red-500 focus:bg-white transition-all shadow-inner"
                placeholder="Enter full name..."
                required
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
              <input 
                type="email" 
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none focus:border-red-500 focus:bg-white transition-all shadow-inner"
                placeholder="student@example.com"
                required
              />
            </div>

            {/* Password (Only required on Create) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                Password {student && <span className="text-slate-400 font-medium">(Leave blank to keep unchanged)</span>}
              </label>
              <input 
                type="password" 
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none focus:border-red-500 focus:bg-white transition-all shadow-inner"
                placeholder="Enter account security key..."
                required={!student}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Course selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Course</label>
                <select
                  value={form.course}
                  onChange={(e) => setForm({ ...form, course: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none focus:border-red-500 focus:bg-white transition-all shadow-inner"
                >
                  <option value="BCA">BCA</option>
                  <option value="MCA">MCA</option>
                  <option value="B.Tech">B.Tech</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="BBA">BBA</option>
                  <option value="MBA">MBA</option>
                </select>
              </div>

              {/* Batch selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Batch Year</label>
                <select
                  value={form.batch}
                  onChange={(e) => setForm({ ...form, batch: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none focus:border-red-500 focus:bg-white transition-all shadow-inner"
                >
                  <option value="2022-2025">2022-2025</option>
                  <option value="2023-2026">2023-2026</option>
                  <option value="2024-2027">2024-2027</option>
                  <option value="2025-2028">2025-2028</option>
                </select>
              </div>
            </div>

            {/* Status selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none focus:border-red-500 focus:bg-white transition-all shadow-inner"
              >
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Graduated">Graduated</option>
              </select>
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
              className="flex-1 py-4 px-6 bg-slate-900 text-white text-xs font-black uppercase tracking-wider rounded-2xl hover:bg-red-600 shadow-lg hover:shadow-red-500/20 transition-all disabled:opacity-75"
            >
              {loading ? 'Saving Changes...' : 'Save Profile'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default StudentModal;
