import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { 
  MdPerson, MdEmail, MdPhone, MdBadge, MdCameraAlt, 
  MdSave, MdRefresh, MdShield, MdVerifiedUser, MdLogout,
  MdFingerprint, MdVpnKey, MdSecurity, MdRocketLaunch,
  MdKeyboardArrowRight, MdLayers, MdHistory, MdAnalytics,
  MdCloudDone, MdAutoFixHigh, MdOutlineFactCheck, MdLockOutline,
  MdClass, MdCalendarMonth, MdEdit, MdClose, MdVisibility,
  MdChat
} from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';

import { getApiBaseUrl } from '../../utils/api';

const API = `${getApiBaseUrl()}/api/teacher`;

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  
  const [profile, setProfile] = useState({
    name: '', email: '', designation: '', phone: '', profileImage: '', 
    subject: '', joinedDate: '', gender: 'Male'
  });
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } });
      setProfile(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch { toast.error('Identity Sync Fault'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      toast.success("New Image Staged");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('name', profile.name || '');
      formData.append('email', profile.email || '');
      formData.append('designation', profile.designation || '');
      formData.append('phone', profile.phone || '');
      formData.append('subject', profile.subject || '');
      formData.append('joinedDate', profile.joinedDate || '');
      formData.append('gender', profile.gender || 'Male');
      if (selectedImage) formData.append('profileImage', selectedImage);

      const res = await axios.put(`${API}/update`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Profile Optimized');
      setProfile(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setSelectedImage(null);
      setIsEditing(false);
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update Fault');
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/update`, { password: passwords.newPassword }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Security Key Updated');
      setShowPasswordModal(false);
      setPasswords({ newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Security Update Failed');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="p-12 flex items-center justify-center min-h-[80vh]">
      <div className="w-16 h-16 border-4 border-blue-700 border-t-transparent rounded-full animate-spin shadow-2xl shadow-blue-100"></div>
    </div>
  );

  const inp = "w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm text-slate-800 outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all placeholder:text-slate-300 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed";
  const lbl = "block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wide ml-1";

  const currentImageUrl = previewUrl || (profile.profileImage ? `${getApiBaseUrl()}/${profile.profileImage}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`);

  return (
    <div className="w-full space-y-10 animate-in fade-in duration-500 pb-20 relative">
      <Toaster position="top-right" />
      
      <div className="max-w-5xl mx-auto space-y-10 relative z-10">
        
        {/* 🚀 HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-1">My Identity Hub</h1>
            <p className="text-slate-400 font-bold text-xs tracking-wide">Secure Management of Faculty Credentials</p>
          </div>
          <div className="flex items-center gap-3">
             {!isEditing ? (
               <button onClick={() => setIsEditing(true)} className="px-6 py-3.5 bg-blue-700 text-white rounded-2xl text-[10px] font-bold uppercase tracking-wide hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200">
                  <MdEdit size={18} /> Edit Profile
               </button>
             ) : (
               <button onClick={() => setIsEditing(false)} className="px-6 py-3.5 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-bold uppercase tracking-wide hover:bg-slate-200 transition-all flex items-center gap-2">
                  <MdClose size={18} /> Cancel Edit
               </button>
             )}
             <button onClick={() => setShowPasswordModal(true)} className="px-6 py-3.5 bg-white text-blue-700 rounded-2xl text-[10px] font-bold uppercase tracking-wide border border-blue-100 hover:bg-blue-50 transition-all flex items-center gap-2 shadow-sm">
                <MdLockOutline size={18} /> Security Key
             </button>
             <button onClick={() => { localStorage.clear(); window.location.href = "/"; }} className="px-6 py-3.5 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-bold uppercase tracking-wide border border-rose-100 hover:bg-rose-600 hover:text-white transition-all flex items-center gap-2 shadow-sm">
                <MdLogout size={18} /> Logout
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           
           {/* 👤 AVATAR CARD */}
           <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm text-center relative group">
                 <div className="relative mx-auto w-full max-w-[200px] mb-8">
                    <div className="w-full aspect-square rounded-3xl overflow-hidden bg-slate-50 border-4 border-white shadow-xl relative group-hover:shadow-indigo-200 transition-all duration-500 cursor-pointer">
                       <img 
                          onClick={() => setShowImagePreview(true)}
                          src={currentImageUrl} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          alt="Profile"
                       />
                       <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 backdrop-blur-[0px] group-hover:backdrop-blur-[2px] transition-all flex flex-col items-center justify-center pointer-events-none">
                          <MdVisibility className="text-white opacity-0 group-hover:opacity-100 size-10 mb-2 transition-all" />
                          <span className="text-[9px] font-bold text-white opacity-0 group-hover:opacity-100 uppercase tracking-wide">View Image</span>
                       </div>
                    </div>
                    {isEditing && (
                      <label className="absolute bottom-4 right-4 p-3 bg-white text-blue-700 rounded-2xl shadow-2xl border border-slate-100 cursor-pointer hover:scale-110 transition-transform">
                         <MdCameraAlt size={22} />
                         <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                      </label>
                    )}
                 </div>
                 <h2 className="text-2xl font-bold text-slate-800 tracking-tight leading-none mb-1">{profile.name}</h2>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-6">{profile.designation}</p>
                 
                 <div className="pt-6 border-t border-slate-50 flex justify-center gap-4 mb-6">
                    <div className="flex flex-col items-center">
                       <p className="text-xs font-bold text-slate-800">42</p>
                       <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">Assets</p>
                    </div>
                    <div className="w-px h-8 bg-slate-100"></div>
                    <div className="flex flex-col items-center">
                       <p className="text-xs font-bold text-slate-800">128</p>
                       <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">Reports</p>
                    </div>
                 </div>

                 {/* 💬 QUICK CHAT OPTION */}
                 <button onClick={() => toast.success("Chat Sync Active")} className="w-full py-4 bg-blue-50 text-blue-700 rounded-[20px] font-bold text-[10px] uppercase tracking-wide flex items-center justify-center gap-3 hover:bg-blue-700 hover:text-white transition-all border border-blue-100 active:scale-95">
                    <MdChat size={18} /> Student Quick Chat
                 </button>
              </div>

              <div className="bg-blue-700 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-10 -translate-y-10 blur-2xl group-hover:scale-110 transition-transform duration-700" />
                 <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/10 backdrop-blur-md">
                       <MdVerifiedUser size={24} />
                    </div>
                    <div>
                       <h3 className="text-sm font-bold tracking-tight leading-none mb-1">Identity Verified</h3>
                       <p className="text-[8px] font-bold uppercase tracking-wide opacity-60">System Security Clearance</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* 📝 PROFILE FORM */}
           <div className="lg:col-span-2">
              <form onSubmit={handleUpdate} className="bg-white p-10 sm:p-12 rounded-3xl border border-slate-100 shadow-sm space-y-10 relative overflow-hidden">
                 <AnimatePresence>
                   {!isEditing && (
                     <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-10 bg-white/10 cursor-default" 
                        onClick={() => toast.error("Click Edit Profile to modify")}
                     />
                   )}
                 </AnimatePresence>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                       <label className={lbl}>Personnel Name</label>
                       <input disabled={!isEditing} value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className={inp} placeholder="Full Name" required />
                    </div>
                    <div>
                       <label className={lbl}>Faculty Role</label>
                       <input disabled={!isEditing} value={profile.designation} onChange={e => setProfile({...profile, designation: e.target.value})} className={inp} placeholder="Role" required />
                    </div>
                    <div>
                       <label className={lbl}>System Email</label>
                       <input disabled={!isEditing} value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} className={inp} placeholder="Email" required />
                    </div>
                    <div>
                       <label className={lbl}>Phone Number</label>
                       <input disabled={!isEditing} value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className={inp} placeholder="Phone" />
                    </div>
                    <div>
                       <label className={lbl}>Primary Subject</label>
                       <input disabled={!isEditing} value={profile.subject} onChange={e => setProfile({...profile, subject: e.target.value})} className={inp} placeholder="Subject" />
                    </div>
                    <div>
                       <label className={lbl}>Joined Date</label>
                       <input disabled={!isEditing} value={profile.joinedDate} onChange={e => setProfile({...profile, joinedDate: e.target.value})} className={inp} placeholder="Date" />
                    </div>
                    <div>
                       <label className={lbl}>Gender</label>
                       <select 
                          disabled={!isEditing} 
                          value={profile.gender || 'Male'} 
                          onChange={e => setProfile({...profile, gender: e.target.value})} 
                          className={inp}
                       >
                          <option value="Male">Sir (Male)</option>
                          <option value="Female">Mam (Female)</option>
                       </select>
                    </div>
                 </div>

                 {isEditing && (
                   <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="pt-8 border-t border-slate-50 flex gap-4 relative z-20">
                      <button type="submit" disabled={updating} className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-bold text-[11px] uppercase tracking-wide shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
                         {updating ? 'Saving Changes...' : <><MdSave size={20}/> Authorize Updates</>}
                      </button>
                      <button type="button" onClick={() => setIsEditing(false)} className="px-8 py-5 bg-slate-50 text-slate-400 rounded-2xl font-bold text-[10px] uppercase tracking-wide hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                         <MdClose size={20}/> Cancel
                      </button>
                   </motion.div>
                 )}
              </form>
           </div>
        </div>

      </div>

      {/* 🖼️ IMAGE PREVIEW MODAL */}
      <AnimatePresence>
        {showImagePreview && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-xl">
             <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative max-w-2xl w-full"
             >
                <button onClick={() => setShowImagePreview(false)} className="absolute -top-16 right-0 p-4 bg-white/10 text-white hover:bg-white/20 rounded-full transition-all">
                   <MdClose size={32} />
                </button>
                <img src={currentImageUrl} className="w-full h-auto rounded-3xl shadow-2xl border-4 border-white/20" alt="Full Preview" />
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🔐 PASSWORD MODAL */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPasswordModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="p-10 sm:p-12">
                <div className="flex justify-between items-start mb-10">
                   <div>
                      <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Security Access</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">Update system entry key</p>
                   </div>
                   <button onClick={() => setShowPasswordModal(false)} className="p-3 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-2xl transition-all">
                      <MdClose size={24} />
                   </button>
                </div>

                <form onSubmit={handlePasswordUpdate} className="space-y-8">
                   <div>
                      <label className={lbl}>New Security Key</label>
                      <input 
                        type="password" 
                        value={passwords.newPassword}
                        onChange={e => setPasswords({...passwords, newPassword: e.target.value})}
                        className={inp} 
                        placeholder="New Password" 
                        required 
                      />
                   </div>
                   <div>
                      <label className={lbl}>Confirm Security Key</label>
                      <input 
                        type="password" 
                        value={passwords.confirmPassword}
                        onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})}
                        className={inp} 
                        placeholder="Re-enter password" 
                        required 
                      />
                   </div>
                   <div className="pt-4">
                      <button type="submit" disabled={updating} className="w-full py-6 bg-slate-900 text-white rounded-2xl font-bold text-[12px] uppercase tracking-[0.3em] shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
                         {updating ? 'Updating Key...' : <><MdVpnKey size={24}/> Update Key</>}
                      </button>
                   </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
