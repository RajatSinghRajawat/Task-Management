import { useState, useEffect } from 'react';
import { MdClose, MdCloudUpload } from 'react-icons/md';
import { getApiBaseUrl } from '../utils/api';

const TeacherModal = ({ isOpen, onClose, onSave, teacher }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    designation: 'Digital Marketing',
    phone: '',
    subject: 'Computer Science',
    joinedDate: '',
    gender: 'Male'
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (teacher) {
      setForm({
        name: teacher.name || '',
        email: teacher.email || '',
        password: '', // Leave empty to keep unchanged
        designation: teacher.designation || 'Digital Marketing',
        phone: teacher.phone || '',
        subject: teacher.subject || 'General',
        joinedDate: teacher.joinedDate || '',
        gender: teacher.gender || 'Male'
      });
      setImagePreview(teacher.profileImage ? `${getApiBaseUrl()}/${teacher.profileImage}` : null);
    } else {
      setForm({
        name: '',
        email: '',
        password: '',
        designation: 'Digital Marketing',
        phone: '',
        subject: 'Computer Science',
        joinedDate: '',
        gender: 'Male'
      });
      setImageFile(null);
      setImagePreview(null);
    }
  }, [teacher, isOpen]);

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
    formData.append('name', form.name);
    formData.append('email', form.email);
    if (form.password) {
      formData.append('password', form.password);
    }
    formData.append('designation', form.designation);
    formData.append('phone', form.phone);
    formData.append('subject', form.subject);
    formData.append('joinedDate', form.joinedDate);
    formData.append('gender', form.gender);

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
      <div className="bg-white rounded-[32px] w-full max-w-lg border border-slate-100 shadow-2xl overflow-hidden flex flex-col my-8 animate-slide-in">
        
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-8 border-b border-slate-100 shrink-0">
          <h3 className="font-black text-slate-800 tracking-tight">
            {teacher ? 'Modify Faculty Profile' : 'Enroll Faculty Member'}
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
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
              <input 
                type="text" 
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                placeholder="teacher@university.edu"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                Password {teacher && <span className="text-slate-400 font-medium">(Leave blank to keep unchanged)</span>}
              </label>
              <input 
                type="password" 
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none focus:border-red-500 focus:bg-white transition-all shadow-inner"
                placeholder="Enter security password..."
                required={!teacher}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Designation */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Designation</label>
                <select
                  value={form.designation}
                  onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none cursor-pointer"
                >
                  <option value="Digital Marketing">Digital Marketing</option>
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Cyber Security">Cyber Security</option>
                  <option value="Ai/Ml & Data Science">Ai/Ml & Data Science</option>
                </select>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Specialization</label>
                <input 
                  type="text" 
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none shadow-inner"
                  placeholder="e.g. Computer Science"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Contact Phone</label>
                <input 
                  type="tel" 
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none shadow-inner"
                  placeholder="Phone number..."
                />
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none cursor-pointer"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            {/* Joined Date */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Joined Date</label>
              <input 
                type="date" 
                value={form.joinedDate}
                onChange={(e) => setForm({ ...form, joinedDate: e.target.value })}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none cursor-pointer"
              />
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
              {loading ? 'Saving...' : 'Save Faculty Profile'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default TeacherModal;
