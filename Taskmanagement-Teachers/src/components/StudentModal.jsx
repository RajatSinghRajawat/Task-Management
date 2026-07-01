import { useState, useEffect } from 'react';
import { MdClose, MdCloudUpload } from 'react-icons/md';
import { getApiBaseUrl } from '../utils/api';

const COURSES = [
  "Software Development", "Data Science & AI/ML", "Cyber Security", "Digital Marketing",
  "Cloud Computing", "Artificial Intelligence", "UI-UX Design",
  "Business Analytics", "Project Management", "DevOps"
];

const BATCHES = ["2024", "2025", "2026", "2027", "2028", "2029", "2030"];

const StudentModal = ({ isOpen, onClose, onSave, student }) => {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    course: COURSES[0],
    batch: BATCHES[0],
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
        password: '', // Leave blank for edit unless changing
        course: student.course || student.courses || COURSES[0],
        batch: student.batch || BATCHES[0],
        status: student.status || 'Active'
      });
      setImagePreview(student.profileImage ? `${getApiBaseUrl()}/${student.profileImage}` : null);
    } else {
      setForm({
        fullName: '',
        email: '',
        password: '',
        course: COURSES[0],
        batch: BATCHES[0],
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
          <h3 className="font-black text-slate-800 tracking-tight text-base">
            {student ? 'Modify Scholar Profile' : 'Enroll New Scholar'}
          </h3>
          <button 
            type="button"
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
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-inner"
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
                className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-inner"
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
                className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-inner"
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
                  className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-inner cursor-pointer"
                >
                  {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Batch selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Batch Year</label>
                <select
                  value={form.batch}
                  onChange={(e) => setForm({ ...form, batch: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-inner cursor-pointer"
                >
                  {BATCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>

            {/* Status selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-inner cursor-pointer"
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
              className="flex-1 py-4 px-6 bg-slate-900 text-white text-xs font-black uppercase tracking-wider rounded-2xl hover:bg-blue-700 hover:shadow-lg shadow-xl shadow-slate-100 transition-all disabled:opacity-75"
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
