import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  Shield, 
  BookOpen, 
  Award,
  Save,
  Lock,
  Edit3,
  CheckCircle2,
  X,
  UploadCloud,
  RefreshCcw,
  UserCheck,
  ArrowRight,
  FileText as FileIcon,
  Eye,
  Trash2,
  Zap,
  Plus,
  GraduationCap,
  Globe,
  Trophy
} from 'lucide-react';

const API_BASE = 'http://localhost:7001/api/students';

const ProfileView = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const navigate = useNavigate();
  
  const [student, setStudent] = useState(JSON.parse(localStorage.getItem('studentData') || '{}'));
  const [formData, setFormData] = useState({
    name: student.name || '',
    email: student.email || '',
    mobile: student.mobile || '',
    location: student.location || '',
    course: student.courses || '',
    batch: student.batch || ''
  });

  const [resumeData, setResumeData] = useState({
    summary: "",
    experience: [],
    projects: [],
    skills: [],
    education: { school: "", year: "" },
    socials: { linkedin: "", github: "", portfolio: "" }
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [activityData, setActivityData] = useState([]);
  const [impactCount, setImpactCount] = useState(0);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const fileInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  useEffect(() => {
     const fetchLatest = async () => {
        try {
           const token = localStorage.getItem('studentToken');
           if (!token) return;
           const res = await axios.get(`${API_BASE}/profile`, {
              headers: { Authorization: `Bearer ${token}` }
           });
           setStudent(res.data);
           setFormData({
              name: res.data.name,
              email: res.data.email,
              mobile: res.data.mobile || '',
              location: res.data.location || '',
              course: res.data.courses,
              batch: res.data.batch
           });
           if (res.data.resumeData) {
              setResumeData(res.data.resumeData);
           }
           localStorage.setItem('studentData', JSON.stringify(res.data));

           // Fetch Activity Data
           const activityRes = await axios.get(`http://localhost:7001/api/students/${res.data._id}/activity`, {
              headers: { Authorization: `Bearer ${token}` }
           });
           setActivityData(activityRes.data);
           setImpactCount(activityRes.data.filter(a => a.status === 'Completed' || a.status === 'Late').length);
        } catch (err) {
           console.error("Fetch profile error", err);
        }
     };
     fetchLatest();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageClick = () => {
     if (isEditing) fileInputRef.current?.click();
     else toast.error("Please enter 'Edit Mode' to change your identity image.");
  };

  const handleFileChange = async (e) => {
     const file = e.target.files[0];
     if (!file) return;

     setLoading(true);
     const token = localStorage.getItem('studentToken');
     const uploadData = new FormData();
     uploadData.append('profileImage', file);

     try {
        const res = await axios.put(`${API_BASE}/update-profile`, uploadData, {
           headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
           }
        });
        setStudent(res.data.user);
        localStorage.setItem('studentData', JSON.stringify(res.data.user));
        toast.success("Identity synchronized successfully!");
        window.dispatchEvent(new Event('storage'));
     } catch (err) {
        toast.error("Cloud synchronization failed");
     } finally {
        setLoading(false);
     }
  };

  const handleResumeClick = () => {
     if (isEditing) resumeInputRef.current?.click();
     else toast.error("Please enter 'Edit Mode' to upload your academic resume.");
  };

  const handleResumeChange = async (e) => {
     const file = e.target.files[0];
     if (!file) return;
     if (file.type !== 'application/pdf') {
        return toast.error("Only PDF files are accepted for resumes.");
     }

     setLoading(true);
     const token = localStorage.getItem('studentToken');
     const uploadData = new FormData();
     uploadData.append('resume', file);

     try {
        const res = await axios.put(`${API_BASE}/update-profile`, uploadData, {
           headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
           }
        });
        setStudent(res.data.user);
        localStorage.setItem('studentData', JSON.stringify(res.data.user));
        toast.success("Professional resume synchronized!");
        window.dispatchEvent(new Event('storage'));
     } catch (err) {
        toast.error("Resume upload failed");
     } finally {
        setLoading(false);
     }
  };

  const handleSave = async () => {
    setLoading(true);
    const token = localStorage.getItem('studentToken');
    try {
      const res = await axios.put(`${API_BASE}/update-profile`, {
         mobile: formData.mobile,
         location: formData.location,
         resumeData: resumeData
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStudent(res.data.user);
      localStorage.setItem('studentData', JSON.stringify(res.data.user));
      setIsEditing(false);
      toast.success('Profile credentials updated!');
    } catch (err) {
      toast.error('Update operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
     e.preventDefault();
     if (passwords.newPassword !== passwords.confirmPassword) {
        return toast.error("New passwords do not match!");
     }

     setLoading(true);
     const token = localStorage.getItem('studentToken');
     try {
        await axios.put(`${API_BASE}/change-password`, {
           currentPassword: passwords.currentPassword,
           newPassword: passwords.newPassword
        }, {
           headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Security protocols updated!");
        setShowPasswordModal(false);
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
     } catch (err) {
        toast.error(err.response?.data?.message || "Password update failed");
     } finally {
        setLoading(false);
     }
  };

  const profileImageUrl = student.profileImage 
     ? `http://localhost:7001/${student.profileImage.replace(/\\/g, '/')}`
     : `https://ui-avatars.com/api/?name=${student.name}&background=6366f1&color=fff&size=128`;

  return (
    <div className="relative w-full space-y-10 animate-in fade-in duration-700 pb-20 overflow-hidden bg-slate-50 min-h-screen px-4 sm:px-8 pt-8">
      <Toaster position="top-right" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
         <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-1">Scholar Profile</h1>
            <p className="text-slate-500 font-semibold text-xs tracking-wide uppercase flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
               Manage Authorized Identity & Security Credentials
            </p>
         </div>
         <div className="flex items-center gap-3 bg-white p-2 rounded-3xl border border-slate-200 shadow-sm">
            <button onClick={() => window.location.reload()} className="p-4 bg-white rounded-2xl text-slate-400 hover:text-blue-700 transition-all border border-slate-100 shadow-sm">
               <RefreshCcw size={22} />
            </button>
            <div className="px-6 py-3 bg-blue-700 text-white rounded-xl font-semibold text-xs uppercase tracking-wide shadow-md flex items-center gap-2">
               <UserCheck size={18} /> Verified
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start relative z-10">
         <div className="xl:col-span-4 space-y-8">
            <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm text-center relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-32 bg-blue-700 -z-10 opacity-5 transition-opacity" />
               <div className="relative mt-4 mb-8">
                  <div 
                     onClick={handleImageClick}
                     className={`w-32 h-32 mx-auto rounded-3xl border-4 border-white shadow-lg bg-white overflow-hidden relative group/img cursor-pointer ${isEditing ? 'ring-4 ring-blue-500/20' : ''}`}
                  >
                     <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover transition-transform group-hover/img:scale-110" />
                     {isEditing && (
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex flex-col items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all">
                           <Camera className="w-8 h-8 text-white mb-2" />
                           <span className="text-[8px] font-bold text-white uppercase tracking-widest">Update Photo</span>
                        </div>
                     )}
                     {loading && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                           <div className="w-6 h-6 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                     )}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden accept="image/*" />
               </div>
               <div className="space-y-2">
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{student.name}</h2>
                  <p className="text-xs font-semibold text-blue-700 bg-blue-50 py-2 px-4 rounded-xl inline-block uppercase tracking-wide">{student.courses || 'Scholar'}</p>
               </div>
               <div className="grid grid-cols-2 gap-4 mt-10">
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                     <BookOpen className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Batch</p>
                     <p className="text-sm font-bold text-slate-700">{student.batch || '2024'}</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                     <Award className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Standing</p>
                     <p className="text-sm font-bold text-slate-700">Level 1</p>
                  </div>
               </div>
            </div>
            
            <div className="bg-slate-900 p-10 rounded-3xl shadow-xl relative overflow-hidden group">
               <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white backdrop-blur-xl border border-white/10">
                        <Shield size={24} />
                     </div>
                     <h3 className="text-xl font-bold text-white uppercase tracking-tight">Security</h3>
                  </div>
                  <div className="space-y-4">
                     <button 
                        onClick={() => setShowPasswordModal(true)}
                        className="w-full flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all group"
                     >
                        <div className="flex items-center gap-3">
                           <Lock size={18} className="text-blue-400" />
                           <span className="text-[11px] font-bold uppercase tracking-wide">Rotate Password</span>
                        </div>
                        <ArrowRight size={18} className="text-white/20 group-hover:translate-x-1 transition-transform" />
                     </button>
                  </div>
               </div>
            </div>

            {/* 📄 ACADEMIC RESUME CARD */}
            <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center shadow-inner">
                     <FileIcon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Academic Resume</h3>
               </div>
               
               <div className="space-y-6">
                  {student.resume ? (
                     <div className="p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100 flex items-center justify-between group/res transition-all hover:bg-emerald-50">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                              <CheckCircle2 size={20} />
                           </div>
                           <div>
                              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Document Status</p>
                              <p className="text-xs font-bold text-slate-700">Verified_Resume.pdf</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <a 
                              href={`http://localhost:7001/${student.resume}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-3 bg-white rounded-xl text-emerald-600 shadow-sm border border-emerald-100 hover:scale-110 transition-transform"
                           >
                              <Eye size={18} />
                           </a>
                        </div>
                     </div>
                  ) : (
                     <div className="p-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">No Resume Found</p>
                        <p className="text-[9px] font-bold text-slate-400 max-w-[180px] mx-auto uppercase">Upload your professional credentials to unlock job portals.</p>
                     </div>
                  )}

                  <button 
                     onClick={handleResumeClick}
                     className={`w-full py-5 rounded-2xl text-[10px] font-bold uppercase tracking-wide flex items-center justify-center gap-3 transition-all ${isEditing ? 'bg-blue-700 text-white shadow-md hover:bg-blue-800' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                  >
                     <UploadCloud size={20} /> {student.resume ? 'Update Manual PDF' : 'Upload Academic Resume'}
                  </button>
                  <input type="file" ref={resumeInputRef} onChange={handleResumeChange} hidden accept=".pdf" />
               </div>
            </div>

            {/* 🎯 TASK CONTRIBUTION ACTIVITY (MOVED TO SIDEBAR) */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
               <div className="flex flex-col gap-4 mb-6">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center shadow-inner">
                        <Zap size={20} className="text-blue-700" />
                     </div>
                     <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Mission Streak</h3>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-[4px] bg-emerald-500" /><span className="text-[8px] font-bold text-slate-400 uppercase">On-Time</span></div>
                     <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-[4px] bg-blue-700" /><span className="text-[8px] font-bold text-slate-400 uppercase">Late</span></div>
                     <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-[4px] bg-rose-500" /><span className="text-[8px] font-bold text-slate-400 uppercase">Missed</span></div>
                  </div>
               </div>

               <div className="flex items-start gap-2 overflow-x-auto pb-4 scrollbar-hide">
                  <div className="grid grid-rows-7 gap-1.5 pt-1">
                     {['S', 'M', 'B', 'J', 'S', 'S', 'A'].map(day => (
                        <span key={day} className="text-[7px] font-bold text-slate-300 uppercase h-4 flex items-center">{day}</span>
                     ))}
                  </div>
                  <div className="flex gap-1.5">
                     {Array.from({ length: 12 }).map((_, weekIndex) => (
                        <div key={weekIndex} className="grid grid-rows-7 gap-1.5">
                           {Array.from({ length: 7 }).map((_, dayIndex) => {
                              const dayOffset = (weekIndex * 7) + dayIndex;
                              const date = new Date();
                              date.setDate(date.getDate() - (83 - dayOffset));
                              const dateString = date.toISOString().split('T')[0];
                              const activity = activityData.find(a => a.date === dateString);
                              
                              let colorClass = "bg-slate-50";
                              if (activity) {
                                 if (activity.status === "Completed") colorClass = "bg-emerald-500 shadow-lg shadow-emerald-100";
                                 else if (activity.status === "Late") colorClass = "bg-blue-700 shadow-lg shadow-blue-100";
                                 else if (activity.status === "Missed") colorClass = "bg-rose-500 shadow-lg shadow-rose-100";
                              }

                              return (
                                 <div 
                                    key={dayIndex} 
                                    onClick={() => activity && setSelectedActivity(activity)}
                                    className={`w-4 h-4 rounded-[4px] transition-all cursor-pointer hover:scale-125 ${colorClass}`}
                                 ></div>
                              );
                           })}
                        </div>
                     ))}
                  </div>
               </div>

               <div className="mt-4 pt-4 border-t border-slate-50">
                  <div className="px-4 py-2.5 bg-slate-900 text-white rounded-2xl font-bold text-[9px] uppercase tracking-widest flex items-center justify-between shadow-xl">
                     <span className="flex items-center gap-2">Impact Index</span>
                     <span>{impactCount} Missions</span>
                  </div>
               </div>

               <AnimatePresence>
                  {selectedActivity && (
                     <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-20 flex flex-col items-center justify-center p-8 text-center"
                     >
                        <button onClick={() => setSelectedActivity(null)} className="absolute top-4 right-4 text-white/40 hover:text-white"><X size={20} /></button>
                        <div className={`w-12 h-12 rounded-2xl mb-4 flex items-center justify-center ${selectedActivity.status === 'Completed' ? 'bg-emerald-500' : selectedActivity.status === 'Late' ? 'bg-blue-700' : 'bg-rose-500'} text-white shadow-xl shadow-slate-900/50`}>
                           <CheckCircle2 size={24} />
                        </div>
                        <h4 className="text-white font-bold text-sm uppercase tracking-tight mb-1">{selectedActivity.taskTitle}</h4>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4">{selectedActivity.fullDate}</p>
                        <div className={`px-4 py-1 rounded-full text-[8px] font-bold uppercase tracking-[0.2em] ${selectedActivity.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' : selectedActivity.status === 'Late' ? 'bg-blue-700/20 text-blue-400' : 'bg-rose-500/20 text-rose-400'}`}>
                           {selectedActivity.status}
                        </div>
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>
         </div>

         <div className="xl:col-span-8 space-y-10">
            <div className="bg-white p-10 lg:p-14 rounded-3xl border border-slate-200 shadow-sm relative">
               <div className="flex items-center justify-between mb-12 pb-8 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center shadow-inner">
                        <User size={24} />
                     </div>
                     <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Scholar Profile</h2>
                  </div>
                  {!isEditing ? (
                     <button onClick={() => setIsEditing(true)} className="px-6 py-3 bg-white text-slate-900 border border-slate-300 rounded-xl font-semibold text-xs uppercase tracking-wide shadow-sm flex items-center gap-2 hover:bg-slate-100 transition-all active:scale-95">
                        <Edit3 size={18} /> Edit Profile
                     </button>
                  ) : (
                     <div className="flex gap-3">
                        <button onClick={() => setIsEditing(false)} className="px-6 py-3 bg-slate-50 text-slate-400 rounded-xl font-bold text-[10px] uppercase tracking-wide">Cancel</button>
                        <button onClick={handleSave} disabled={loading} className="px-6 py-3 bg-blue-700 text-white rounded-xl font-semibold text-xs uppercase tracking-wide shadow-md flex items-center gap-2 hover:bg-blue-800 transition-all active:scale-95">
                           {loading ? <RefreshCcw className="animate-spin" size={18} /> : <><Save size={18} /> Save Changes</>}
                        </button>
                     </div>
                  )}
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                     <div className="space-y-3">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1 flex items-center gap-2"><User size={14} className="text-blue-700" /> Full Name</label>
                        <input type="text" value={formData.name} disabled className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-400 cursor-not-allowed" />
                     </div>
                     <div className="space-y-3">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1 flex items-center gap-2"><Mail size={14} className="text-blue-700" /> Email Address</label>
                        <input type="email" value={formData.email} disabled className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-400 cursor-not-allowed" />
                     </div>
                  </div>
                  <div className="space-y-8">
                     <div className="space-y-3">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1 flex items-center gap-2"><Phone size={14} className="text-blue-700" /> Mobile Number</label>
                        <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} disabled={!isEditing} placeholder="+91 XXXXX XXXXX" className={`w-full px-6 py-4 rounded-xl text-sm font-bold transition-all ${isEditing ? 'bg-white border-2 border-blue-100 focus:border-blue-500 text-slate-800' : 'bg-slate-50 border border-slate-100 text-slate-500 cursor-not-allowed'}`} />
                     </div>
                     <div className="space-y-3">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1 flex items-center gap-2"><MapPin size={14} className="text-blue-700" /> Location</label>
                        <input type="text" name="location" value={formData.location} onChange={handleChange} disabled={!isEditing} placeholder="Location" className={`w-full px-6 py-4 rounded-xl text-sm font-bold transition-all ${isEditing ? 'bg-white border-2 border-blue-100 focus:border-blue-500 text-slate-800' : 'bg-slate-50 border border-slate-100 text-slate-500 cursor-not-allowed'}`} />
                     </div>
                  </div>
               </div>
            </div>

            {/* 🚀 INTEGRATED RESUME BUILDER FORM */}
            <div className="bg-white p-10 lg:p-14 rounded-3xl border border-slate-200 shadow-sm">
               <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-100">
                  <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center shadow-inner">
                     <Zap size={24} className="text-blue-700" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Interactive Dossier</h2>
               </div>

               <div className="space-y-12">
                  <div className="space-y-4">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Professional Summary</label>
                     <textarea 
                        disabled={!isEditing}
                        value={resumeData.summary}
                        onChange={(e) => setResumeData({...resumeData, summary: e.target.value})}
                        placeholder="Describe your professional journey..."
                        className={`w-full px-8 py-6 rounded-2xl text-sm font-medium transition-all min-h-[120px] resize-none ${isEditing ? 'bg-white border-2 border-blue-100 focus:border-blue-500 shadow-sm text-slate-800' : 'bg-slate-50 border border-slate-100 text-slate-500 cursor-not-allowed'}`}
                     />
                  </div>

                  <div className="space-y-6">
                     <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Experience & Projects</label>
                        {isEditing && (
                           <button 
                              onClick={() => setResumeData({...resumeData, experience: [...resumeData.experience, { title: "", company: "", duration: "", description: "" }]})}
                              className="p-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-700 hover:text-white transition-all"
                           >
                              <Plus size={18} />
                           </button>
                        )}
                     </div>
                     <div className="space-y-4">
                        {resumeData.experience.map((exp, i) => (
                           <div key={i} className="p-8 bg-slate-50/50 rounded-3xl border border-slate-100 relative group">
                              {isEditing && (
                                 <button 
                                    onClick={() => setResumeData({...resumeData, experience: resumeData.experience.filter((_, idx) => idx !== i)})}
                                    className="absolute top-6 right-6 p-2 text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                                 >
                                    <Trash2 size={16} />
                                 </button>
                              )}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <input disabled={!isEditing} placeholder="Title" value={exp.title} onChange={e => {
                                    const next = [...resumeData.experience]; next[i].title = e.target.value; setResumeData({...resumeData, experience: next});
                                 }} className={`w-full px-6 py-4 rounded-2xl text-sm font-bold ${isEditing ? 'bg-white border border-slate-200' : 'bg-transparent border-none p-0'}`} />
                                 <input disabled={!isEditing} placeholder="Institution/Company" value={exp.company} onChange={e => {
                                    const next = [...resumeData.experience]; next[i].company = e.target.value; setResumeData({...resumeData, experience: next});
                                 }} className={`w-full px-6 py-4 rounded-2xl text-[10px] font-bold text-blue-700 uppercase tracking-widest text-right ${isEditing ? 'bg-white border border-slate-200' : 'bg-transparent border-none p-0'}`} />
                                 <textarea disabled={!isEditing} placeholder="Description" value={exp.description} onChange={e => {
                                    const next = [...resumeData.experience]; next[i].description = e.target.value; setResumeData({...resumeData, experience: next});
                                 }} className={`md:col-span-2 w-full px-6 py-4 rounded-2xl text-sm font-medium min-h-[100px] resize-none ${isEditing ? 'bg-white border border-slate-200' : 'bg-transparent border-none p-0'}`} />
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-6">
                     <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Core Skills</label>
                        {isEditing && (
                           <button 
                              onClick={() => setResumeData({...resumeData, skills: [...resumeData.skills, ""]})}
                              className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-slate-200 transition-all"
                           >
                              <Plus size={14} />
                           </button>
                        )}
                     </div>
                     <div className="flex flex-wrap gap-3">
                        {resumeData.skills.map((skill, i) => (
                           <div key={i} className="relative group">
                              <input 
                                 disabled={!isEditing}
                                 value={skill}
                                 onChange={e => {
                                    const next = [...resumeData.skills]; next[i] = e.target.value; setResumeData({...resumeData, skills: next});
                                 }}
                                 className={`px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${isEditing ? 'bg-white border border-blue-100 w-32' : 'bg-slate-100 text-slate-500 w-auto'}`}
                              />
                              {isEditing && (
                                 <button onClick={() => setResumeData({...resumeData, skills: resumeData.skills.filter((_, idx) => idx !== i)})} className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 transition-all">
                                    <X size={10} />
                                 </button>
                              )}
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Education */}
                  <div className="space-y-8">
                     <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                           <GraduationCap size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800  uppercase tracking-tight">Academic Foundation</h2>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Principal Institution</label>
                           <input disabled={!isEditing} value={resumeData.education.school} onChange={(e) => setResumeData({...resumeData, education: {...resumeData.education, school: e.target.value}})} className={`w-full px-8 py-5 rounded-2xl text-sm font-bold ${isEditing ? 'bg-white border-2 border-blue-100' : 'bg-slate-50 border border-slate-100'}`} placeholder="University Name" />
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Batch / Year</label>
                           <input disabled={!isEditing} value={resumeData.education.year} onChange={(e) => setResumeData({...resumeData, education: {...resumeData.education, year: e.target.value}})} className={`w-full px-8 py-5 rounded-2xl text-sm font-bold ${isEditing ? 'bg-white border-2 border-blue-100' : 'bg-slate-50 border border-slate-100'}`} placeholder="2020 - 2024" />
                        </div>
                     </div>
                  </div>

                  {/* Socials */}
                  <div className="space-y-8">
                     <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shadow-inner">
                           <Globe size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800  uppercase tracking-tight">Global Presence</h2>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">LinkedIn URL</label>
                           <input disabled={!isEditing} value={resumeData.socials.linkedin} onChange={(e) => setResumeData({...resumeData, socials: {...resumeData.socials, linkedin: e.target.value}})} className={`w-full px-8 py-5 rounded-2xl text-sm font-bold ${isEditing ? 'bg-white border-2 border-blue-100' : 'bg-slate-50 border border-slate-100'}`} placeholder="LinkedIn Link" />
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">GitHub URL</label>
                           <input disabled={!isEditing} value={resumeData.socials.github} onChange={(e) => setResumeData({...resumeData, socials: {...resumeData.socials, github: e.target.value}})} className={`w-full px-8 py-5 rounded-2xl text-sm font-bold ${isEditing ? 'bg-white border-2 border-blue-100' : 'bg-slate-50 border border-slate-100'}`} placeholder="GitHub Link" />
                        </div>
                        <div className="md:col-span-2 space-y-3">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">Portfolio Website</label>
                           <input disabled={!isEditing} value={resumeData.socials.portfolio} onChange={(e) => setResumeData({...resumeData, socials: {...resumeData.socials, portfolio: e.target.value}})} className={`w-full px-8 py-5 rounded-2xl text-sm font-bold ${isEditing ? 'bg-white border-2 border-blue-100' : 'bg-slate-50 border border-slate-100'}`} placeholder="Your Portfolio URL" />
                        </div>
                     </div>
                  </div>
               </div>
            </div>

         </div>
      </div>

      <AnimatePresence>
         {showPasswordModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPasswordModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
               <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-md p-10 rounded-3xl shadow-2xl border border-white">
                  <button onClick={() => setShowPasswordModal(false)} className="absolute right-8 top-8 p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-rose-500 transition-colors"><X size={20} /></button>
                  <div className="text-center space-y-6">
                     <div className="w-20 h-20 bg-blue-50 text-blue-700 rounded-[28px] flex items-center justify-center mx-auto shadow-inner"><Lock size={36} /></div>
                     <h3 className="text-2xl font-bold text-slate-800  uppercase tracking-tight">Rotate Credentials</h3>
                  </div>
                  <form onSubmit={handlePasswordChange} className="mt-10 space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                        <input type="password" required className="w-full px-8 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold" value={passwords.currentPassword} onChange={e => setPasswords({...passwords, currentPassword: e.target.value})} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">New Key</label>
                        <input type="password" required className="w-full px-8 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold" value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Confirm Key</label>
                        <input type="password" required className="w-full px-8 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold" value={passwords.confirmPassword} onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})} />
                     </div>
                     <button type="submit" disabled={loading} className="w-full py-5 bg-slate-900 text-white rounded-[24px] text-[11px] font-bold uppercase tracking-[0.2em] shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
                        {loading ? <RefreshCcw className="animate-spin" size={18} /> : <>UPDATE SECURITY KEY <Save size={18} /></>}
                     </button>
                  </form>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileView;
