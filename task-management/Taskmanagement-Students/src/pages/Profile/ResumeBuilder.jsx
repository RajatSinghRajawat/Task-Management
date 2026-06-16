import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Save,
  Link,
  Globe,
  Link2,
  ChevronLeft,
  Plus,
  Trash2,
  Zap,
  Edit3,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ResumeBuilder = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // 📝 INTERACTIVE FORM STATE
  const [resumeData, setResumeData] = useState({
    summary: "",
    experience: [],
    projects: [],
    skills: [],
    education: { school: "", year: "" },
    socials: { linkedin: "", github: "", portfolio: "" }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('studentToken');
        const profileRes = await axios.get('http://localhost:7001/api/students/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStudent(profileRes.data);
        
        if (profileRes.data.resumeData) {
           setResumeData(profileRes.data.resumeData);
        }
      } catch (err) {
        toast.error("Failed to initialize builder");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('studentToken');
      await axios.put('http://localhost:7001/api/students/update-profile', {
        resumeData: resumeData
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Professional Dossier Updated!");
      setIsEditing(false);
    } catch (err) {
      toast.error("Sync failed");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (path, value) => {
    const keys = path.split('.');
    setResumeData(prev => {
      let next = { ...prev };
      let current = next;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const addListItem = (type) => {
    setResumeData(prev => ({
      ...prev,
      [type]: [...prev[type], type === 'experience' || type === 'projects' ? { title: "New Entry", company: "", duration: "", description: "" } : "New Skill"]
    }));
  };

  const removeListItem = (type, index) => {
    setResumeData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  if (loading && !student) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
       <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 px-6">
      <Toaster position="top-right" />
      
      {/* HEADER SECTION - SAME AS PROFILE */}
      <div className="max-w-5xl mx-auto pt-10 mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
           <div>
              <div className="flex items-center gap-4 mb-2">
                 <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl text-slate-400 hover:text-indigo-600 transition-all border border-slate-100 shadow-sm">
                    <ChevronLeft size={20} />
                 </button>
                 <h1 className="text-4xl font-black text-slate-800 tracking-tight font-display">Resume Builder</h1>
              </div>
              <p className="text-slate-400 font-bold text-[10px] tracking-[0.15em] uppercase flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                 Build & Refine Your Professional Academic Dossier
              </p>
           </div>
           
           <div className="flex items-center gap-3">
              {!isEditing ? (
                 <button onClick={() => setIsEditing(true)} className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all">
                    <Edit3 size={18} /> Modify Resume
                 </button>
              ) : (
                 <div className="flex gap-3">
                    <button onClick={() => setIsEditing(false)} className="px-6 py-4 bg-white text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 transition-all border border-slate-100 shadow-sm">Cancel</button>
                    <button onClick={handleSave} disabled={loading} className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
                       {loading ? <Plus className="animate-spin" size={18} /> : <><Save size={18} /> Synchronize</>}
                    </button>
                 </div>
              )}
           </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-8">
         
         {/* MAIN FORM CARD */}
         <div className="bg-white/80 backdrop-blur-2xl p-10 lg:p-14 rounded-[56px] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-12">
            
            {/* SECTION: SUMMARY */}
            <div className="space-y-6">
               <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                     <User size={24} />
                  </div>
                  <h2 className="text-xl font-black text-slate-800 font-display uppercase tracking-tight">Professional Summary</h2>
               </div>
               <textarea 
                  value={resumeData.summary}
                  onChange={(e) => updateField('summary', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Tell your professional story..."
                  className={`w-full px-8 py-6 rounded-[32px] text-sm font-medium transition-all min-h-[150px] resize-none ${isEditing ? 'bg-white border-2 border-indigo-100 focus:border-indigo-500 shadow-lg shadow-indigo-50 text-slate-800' : 'bg-slate-50 border border-slate-100 text-slate-500 cursor-not-allowed'}`}
               />
            </div>

            {/* SECTION: EXPERIENCE */}
            <div className="space-y-8">
               <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shadow-inner">
                        <Briefcase size={24} />
                     </div>
                     <h2 className="text-xl font-black text-slate-800 font-display uppercase tracking-tight">Experience & Training</h2>
                  </div>
                  {isEditing && (
                     <button onClick={() => addListItem('experience')} className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">
                        <Plus size={20} />
                     </button>
                  )}
               </div>
               
               <div className="space-y-6">
                  {resumeData.experience.map((exp, i) => (
                     <div key={i} className="relative p-8 bg-slate-50/50 rounded-[40px] border border-slate-100 group">
                        {isEditing && (
                           <button onClick={() => removeListItem('experience', i)} className="absolute top-6 right-6 p-3 bg-white text-rose-500 rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-50">
                              <Trash2 size={18} />
                           </button>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role Title</label>
                              <input disabled={!isEditing} value={exp.title} onChange={(e) => {
                                 const next = [...resumeData.experience]; next[i].title = e.target.value; updateField('experience', next);
                              }} className={`w-full px-6 py-4 rounded-2xl text-sm font-bold ${isEditing ? 'bg-white border border-slate-200' : 'bg-transparent border-none p-0'}`} />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Institution/Company</label>
                              <input disabled={!isEditing} value={exp.company} onChange={(e) => {
                                 const next = [...resumeData.experience]; next[i].company = e.target.value; updateField('experience', next);
                              }} className={`w-full px-6 py-4 rounded-2xl text-sm font-bold ${isEditing ? 'bg-white border border-slate-200' : 'bg-transparent border-none p-0'}`} />
                           </div>
                           <div className="md:col-span-2 space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Details & Achievements</label>
                              <textarea disabled={!isEditing} value={exp.description} onChange={(e) => {
                                 const next = [...resumeData.experience]; next[i].description = e.target.value; updateField('experience', next);
                              }} className={`w-full px-6 py-4 rounded-2xl text-sm font-medium min-h-[100px] resize-none ${isEditing ? 'bg-white border border-slate-200' : 'bg-transparent border-none p-0'}`} />
                           </div>
                        </div>
                     </div>
                  ))}
                  {resumeData.experience.length === 0 && (
                     <div className="p-10 border-2 border-dashed border-slate-200 rounded-[40px] text-center">
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No Experience Listed Yet</p>
                     </div>
                  )}
               </div>
            </div>

            {/* SECTION: SKILLS */}
            <div className="space-y-8">
               <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
                        <Zap size={24} />
                     </div>
                     <h2 className="text-xl font-black text-slate-800 font-display uppercase tracking-tight">Core Competencies</h2>
                  </div>
                  {isEditing && (
                     <button onClick={() => addListItem('skills')} className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2">
                        <Plus size={16} /> Add Skill
                     </button>
                  )}
               </div>
               
               <div className="flex flex-wrap gap-4">
                  {resumeData.skills.map((skill, i) => (
                     <div key={i} className="group relative">
                        <input 
                           disabled={!isEditing} 
                           value={skill} 
                           onChange={(e) => {
                              const next = [...resumeData.skills]; next[i] = e.target.value; updateField('skills', next);
                           }} 
                           className={`px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${isEditing ? 'bg-white border-2 border-indigo-100 w-48' : 'bg-slate-100 text-slate-600 w-auto'}`}
                        />
                        {isEditing && (
                           <button onClick={() => removeListItem('skills', i)} className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75">
                              <Trash2 size={12} />
                           </button>
                        )}
                     </div>
                  ))}
               </div>
            </div>

            {/* SECTION: EDUCATION */}
            <div className="space-y-8">
               <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                  <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner">
                     <GraduationCap size={24} />
                  </div>
                  <h2 className="text-xl font-black text-slate-800 font-display uppercase tracking-tight">Academic Foundation</h2>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Principal Institution</label>
                     <input disabled={!isEditing} value={resumeData.education.school} onChange={(e) => updateField('education.school', e.target.value)} className={`w-full px-8 py-5 rounded-2xl text-sm font-bold ${isEditing ? 'bg-white border-2 border-indigo-100' : 'bg-slate-50 border border-slate-100'}`} />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Batch / Graduation Year</label>
                     <input disabled={!isEditing} value={resumeData.education.year} onChange={(e) => updateField('education.year', e.target.value)} className={`w-full px-8 py-5 rounded-2xl text-sm font-bold ${isEditing ? 'bg-white border-2 border-indigo-100' : 'bg-slate-50 border border-slate-100'}`} />
                  </div>
               </div>
            </div>

            {/* SECTION: SOCIALS */}
            <div className="space-y-8">
               <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                  <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shadow-inner">
                     <Globe size={24} />
                  </div>
                  <h2 className="text-xl font-black text-slate-800 font-display uppercase tracking-tight">Global Presence</h2>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Link size={14} className="text-indigo-400" /> LinkedIn Profile</label>
                     <input disabled={!isEditing} value={resumeData.socials.linkedin} onChange={(e) => updateField('socials.linkedin', e.target.value)} className={`w-full px-8 py-5 rounded-2xl text-sm font-bold ${isEditing ? 'bg-white border-2 border-indigo-100' : 'bg-slate-50 border border-slate-100'}`} />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Link2 size={14} className="text-indigo-400" /> GitHub Portfolio</label>
                     <input disabled={!isEditing} value={resumeData.socials.github} onChange={(e) => updateField('socials.github', e.target.value)} className={`w-full px-8 py-5 rounded-2xl text-sm font-bold ${isEditing ? 'bg-white border-2 border-indigo-100' : 'bg-slate-50 border border-slate-100'}`} />
                  </div>
               </div>
            </div>

         </div>

         {/* SUBMIT SECTION */}
         {isEditing && (
            <div className="flex justify-center pt-8">
               <button onClick={handleSave} className="px-12 py-6 bg-slate-900 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-600 transition-all flex items-center gap-4">
                  <CheckCircle2 size={24} className="text-emerald-400" /> Confirm & Sync All Data
               </button>
            </div>
         )}

      </div>
    </div>
  );
};

export default ResumeBuilder;
