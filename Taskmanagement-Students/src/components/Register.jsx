import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getApiBaseUrl } from '../utils/api';
import { 
  MdPerson, 
  MdEmail, 
  MdLock, 
  MdArrowForward, 
  MdSchool, 
  MdClass, 
  MdCalendarToday,
  MdRocketLaunch
} from 'react-icons/md';
import toast, { Toaster } from 'react-hot-toast';

const COURSES = [
  "Software-Development", "Data-Science", "Cyber-Security", "Cloud-Computing", 
  "Artificial-Intelligence", "Digital-Marketing", "UI-UX-Design", 
  "Business-Analytics", "Project-Management", "DevOps"
];

const BATCHES = ["2024", "2025", "2026", "2027", "2028", "2029", "2030"];

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', courses: '', batch: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Security key must be at least 6 characters');
    
    setLoading(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/students/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      localStorage.setItem('studentToken', data.token);
      localStorage.setItem('studentData', JSON.stringify(data.user));
      
      toast.success('Registration Successful! Deploying Dashboard...');
      window.dispatchEvent(new Event('storage'));

      setTimeout(() => {
        navigate('/');
        window.location.reload();
      }, 1500);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 font-sans overflow-hidden bg-[#fafafa] selection:bg-indigo-500/30">
      <Toaster position="top-center" />
      
      {/* 🔮 ELITE BACKGROUND ARCHITECTURE */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[150px] animate-pulse pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[1100px] w-full bg-white/40 backdrop-blur-[40px] rounded-[56px] shadow-[0_32px_100px_rgba(0,0,0,0.06)] border border-white/60 overflow-hidden flex flex-col lg:flex-row min-h-[750px] relative z-10"
      >
        
        {/* 🚀 BRANDING SIDE (DYNAMICS) */}
        <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-16 overflow-hidden bg-slate-900">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-blue-600/20 opacity-40" />
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center p-2">
                 <img src="/logo.png" alt="Logo" className="h-16 w-auto invert brightness-0" />
              </div>
              <div className="h-14 w-px bg-white/20"></div>
              <div>
                <h1 className="font-black text-3xl text-white tracking-tighter uppercase font-display">TIPS G</h1>
                <p className="text-[10px] uppercase tracking-[0.4em] text-indigo-400 font-black">Student Network</p>
              </div>
            </div>
          </div>

          <div className="relative z-10">
             <h2 className="text-6xl font-black text-white mb-8 leading-[1.05] tracking-tighter font-display">
                Start Your <br/>Scholar <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400 font-black">Identity.</span>
             </h2>
             <p className="text-slate-400 text-base font-medium leading-relaxed max-w-sm mb-12">
                Join our elite cohort of scholars. Initialize your academic identity to synchronize your performance metrics.
             </p>
             
             <div className="flex items-center gap-6 p-6 bg-white/5 backdrop-blur-md rounded-[32px] border border-white/10 w-fit ring-1 ring-white/10">
                <div className="flex -space-x-4">
                   {[1,2,3].map(i => (
                     <div key={i} className="w-12 h-12 rounded-full border-4 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=student_sample_${i}`} className="w-full h-full object-cover" />
                     </div>
                   ))}
                </div>
                <div>
                   <p className="text-xs font-black text-white tracking-wide">ELITE SCHOLAR NETWORK</p>
                   <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5">Verified Registration</p>
                </div>
             </div>
          </div>
        </div>

        {/* 📂 REGISTRATION SIDE (SAMPLE STYLE) */}
        <div className="flex-1 p-8 lg:p-16 flex flex-col justify-center relative">
          <div className="max-w-md w-full mx-auto">
            
            {/* Mobile Logo Visibility */}
            <div className="lg:hidden flex justify-center mb-10">
               <div className="p-3 rounded-2xl bg-white shadow-xl border border-slate-100">
                  <img src="/logo.png" alt="Logo" className="h-14 w-auto" />
               </div>
            </div>

            <div className="mb-12 text-center lg:text-left">
               <div className="hidden lg:block w-2 h-10 bg-slate-900 rounded-full mb-6" />
               <h2 className="text-4xl font-black text-slate-800 tracking-tighter font-display mb-2 uppercase">Create Identity</h2>
               <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Student Enrollment Protocol</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2"><MdPerson size={14} className="text-indigo-500" /> Full Identity Name</label>
                <div className="relative group">
                  <input 
                    type="text" required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-8 py-4.5 bg-white border border-slate-200 text-slate-800 text-sm font-bold rounded-[22px] focus:outline-none focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/5 transition-all shadow-sm"
                    placeholder="e.g. John Wick"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2"><MdEmail size={14} className="text-indigo-500" /> Authorized Email</label>
                <div className="relative group">
                  <input 
                    type="email" required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-8 py-4.5 bg-white border border-slate-200 text-slate-800 text-sm font-bold rounded-[22px] focus:outline-none focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/5 transition-all shadow-sm"
                    placeholder="email@tipsgalwar.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2"><MdClass size={14} className="text-indigo-500" /> Course</label>
                    <select 
                      required
                      value={form.courses}
                      onChange={(e) => setForm({ ...form, courses: e.target.value })}
                      className="w-full px-6 py-4.5 bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-[22px] focus:outline-none focus:border-indigo-500 transition-all shadow-sm appearance-none cursor-pointer"
                    >
                      <option value="">Select</option>
                      {COURSES.map(c => <option key={c} value={c}>{c.replace(/-/g, ' ')}</option>)}
                    </select>
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2"><MdCalendarToday size={14} className="text-indigo-500" /> Batch</label>
                    <select 
                      required
                      value={form.batch}
                      onChange={(e) => setForm({ ...form, batch: e.target.value })}
                      className="w-full px-6 py-4.5 bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-[22px] focus:outline-none focus:border-indigo-500 transition-all shadow-sm appearance-none cursor-pointer"
                    >
                      <option value="">Select</option>
                      {BATCHES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                 </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2"><MdLock size={14} className="text-indigo-500" /> Access Key (Password)</label>
                <div className="relative group">
                  <input 
                    type="password" required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-8 py-4.5 bg-white border border-slate-200 text-slate-800 text-sm font-bold rounded-[22px] focus:outline-none focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/5 transition-all shadow-sm"
                    placeholder="Minimum 6 characters"
                  />
                </div>
              </div>

              <div className="pt-6">
                <button 
                  type="submit"
                  disabled={loading}
                  className={`group relative w-full flex items-center justify-center gap-3 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.3em] py-6 px-10 rounded-[28px] transition-all duration-500 shadow-2xl hover:bg-indigo-600 hover:shadow-indigo-500/30 hover:-translate-y-1 active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed pointer-events-none' : ''}`}
                >
                  {loading ? 'INITIALIZING...' : 'START ENROLLMENT'}
                  {!loading && <MdArrowForward size={22} className="group-hover:translate-x-2 transition-transform" />}
                </button>
              </div>
            </form>

            <div className="mt-10 text-center">
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  ALREADY A MEMBER?{' '}
                  <Link to="/login" className="text-indigo-600 font-black hover:underline ml-1">
                    SIGN IN HERE
                  </Link>
               </p>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default Register;
