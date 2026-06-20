import { useEffect, useState } from 'react';
import { MdSettings, MdCloudUpload, MdLock, MdPhone, MdPerson, MdEmail, MdSchool } from 'react-icons/md';
import { getApiBaseUrl } from '../utils/api';
import toast, { Toaster } from 'react-hot-toast';

const Profile = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    designation: 'Professor',
    phone: '',
    subject: 'Computer Science',
    joinedDate: '',
    gender: 'Male',
    password: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/teacher/me`, { headers });
      if (!res.ok) throw new Error("Failed to load profile details");
      const data = await res.json();
      
      setForm({
        name: data.name || '',
        email: data.email || '',
        designation: data.designation || 'Professor',
        phone: data.phone || '',
        subject: data.subject || 'General',
        joinedDate: data.joinedDate || '',
        gender: data.gender || 'Male',
        password: ''
      });
      setImagePreview(data.profileImage ? `${getApiBaseUrl()}/${data.profileImage}` : null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const token = localStorage.getItem('adminToken');
    const baseUrl = getApiBaseUrl();
    
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('email', form.email);
    formData.append('designation', form.designation);
    formData.append('phone', form.phone);
    formData.append('subject', form.subject);
    formData.append('joinedDate', form.joinedDate);
    formData.append('gender', form.gender);
    if (form.password) {
      formData.append('password', form.password);
    }

    if (imageFile) {
      formData.append('profileImage', imageFile);
    }

    try {
      const res = await fetch(`${baseUrl}/api/teacher/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Identity synchronization failed');

      toast.success("Profile saved and synchronized!");
      
      // Update local storage values
      if (data.user) {
        localStorage.setItem('adminData', JSON.stringify(data.user));
      }
      
      // Clear password field
      setForm(prev => ({ ...prev, password: '' }));
      setImageFile(null);
      fetchProfile(); // reload
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Error occurred while saving profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Toaster position="top-center" />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Identity & Profile Settings</h1>
        <p className="text-slate-400 text-xs mt-0.5">Modify designations, phone numbers, profile images, and reset your credentials.</p>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Avatar block */}
        <div className="md:w-1/3 bg-slate-50 border-r border-slate-100 p-8 flex flex-col items-center justify-center space-y-6">
          <div className="relative w-36 h-36 rounded-full border-4 border-white shadow-xl bg-white flex items-center justify-center overflow-hidden group">
            {imagePreview ? (
              <img src={imagePreview} className="w-full h-full object-cover" />
            ) : (
              <MdPerson className="text-slate-300" size={64} />
            )}
            <label className="absolute inset-0 bg-black/40 text-white text-[10px] font-black uppercase tracking-wider flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              Change Photo
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          <div className="text-center space-y-1">
            <h3 className="font-black text-slate-800 text-base leading-none">{form.name}</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{form.designation}</p>
          </div>
        </div>

        {/* Right Side: Form inputs */}
        <form onSubmit={handleSubmit} className="flex-1 p-8 md:p-12 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none focus:border-red-500 focus:bg-white transition-all shadow-inner"
                  required
                />
                <MdPerson className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none focus:border-red-500 focus:bg-white transition-all shadow-inner"
                  required
                />
                <MdEmail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              </div>
            </div>

            {/* Designation */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Designation</label>
              <select
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none focus:border-red-500 cursor-pointer"
              >
                <option value="Professor">Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Lecturer">Lecturer</option>
                <option value="Department Head">Department Head</option>
              </select>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Contact Phone</label>
              <div className="relative">
                <input 
                  type="tel" 
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none focus:border-red-500 focus:bg-white transition-all shadow-inner"
                  placeholder="Enter phone number..."
                />
                <MdPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Subject Specialization</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none focus:border-red-500 focus:bg-white transition-all shadow-inner"
                  required
                />
                <MdSchool className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              </div>
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none focus:border-red-500 cursor-pointer"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

          </div>

          {/* Password Section */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <h4 className="text-xs font-black text-slate-800 tracking-tight uppercase flex items-center gap-2">
              <MdLock size={16} /> Reset security password
            </h4>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">New Security Password</label>
              <input 
                type="password" 
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none focus:border-red-500 focus:bg-white transition-all shadow-inner"
                placeholder="Leave blank to keep current password..."
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="py-4 px-10 bg-slate-900 text-white text-xs font-black uppercase tracking-wider rounded-2xl hover:bg-red-600 hover:shadow-lg transition-all disabled:opacity-75 cursor-pointer"
            >
              {saving ? 'Synchronizing Profile...' : 'Save & Sync Details'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default Profile;
