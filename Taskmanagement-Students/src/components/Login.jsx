import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getApiBaseUrl } from '../utils/api';
import { 
  MdPerson, 
  MdLock, 
  MdArrowForward, 
  MdSchool, 
  MdFingerprint,
  MdRocketLaunch,
  MdGroups,
  MdShield
} from 'react-icons/md';
import toast, { Toaster } from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/students/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Authentication failed');

      localStorage.setItem('studentToken', data.token);
      localStorage.setItem('studentData', JSON.stringify(data.user));
      localStorage.setItem('studentCourse', data.user.courses);
      localStorage.setItem('studentBatch', data.user.batch);
      
      toast.success('Access Granted! Synchronizing identity...');
      
      window.dispatchEvent(new Event('storage'));
      
      setTimeout(() => {
        navigate('/');
        window.location.reload();
      }, 1000);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 font-sans overflow-hidden bg-[#fafafa] selection:bg-indigo-500/30">
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* 🌌 ELITE BACKGROUND ARCHITECTURE */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[150px] animate-pulse pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[1100px] w-full bg-white/40 backdrop-blur-[40px] rounded-[56px] shadow-[0_32px_100px_rgba(0,0,0,0.06)] border border-white/60 overflow-hidden flex flex-col lg:flex-row min-h-[750px] relative z-10"
      >
        
        {/* 🚀 BRANDING SIDE (DYNAMICS) */}
        <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-16 overflow-hidden bg-slate-900">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 opacity-40" />
          <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-6">
              <div className="flex items-center justify-center p-2">
                 <img src="/logo.png" alt="Logo" className="h-16 w-auto invert brightness-0" />
              </div>
              <div className="h-14 w-px bg-white/20"></div>
              <div>
                <h1 className="font-black text-2xl text-white tracking-tighter uppercase font-display leading-none">Scholar</h1>
                <p className="text-[10px] uppercase tracking-[0.4em] text-indigo-300 font-black mt-1">Intelligence Portal</p>
              </div>
            </div>
          </div>

          <div className="relative z-10">
             <h2 className="text-5xl font-black text-white mb-6 leading-[1.1] tracking-tighter font-display">
                Initialize Your <br/>Scholar <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Intelligence.</span>
             </h2>
             <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm mb-10">
                Synchronize your academic credentials to access your personalized learning dashboard, task wall, and performance metrics.
             </p>
             
             <div className="flex items-center gap-6 p-6 bg-white/5 backdrop-blur-md rounded-[32px] border border-white/10 w-fit">
                <div className="flex -space-x-4">
                   {[1,2,3,4].map(i => (
                     <div key={i} className="w-12 h-12 rounded-full border-4 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden ring-2 ring-indigo-500/20">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=student${i}`} className="w-full h-full object-cover" />
                     </div>
                   ))}
                </div>
                <div>
                   <p className="text-xs font-black text-white tracking-wide">2,500+ SCHOLARS ACTIVE</p>
                   <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5">Verified Learning Network</p>
                </div>
             </div>
          </div>
        </div>

        {/* 📂 AUTHENTICATION SIDE */}
        <div className="flex-1 p-8 lg:p-20 flex flex-col justify-center relative">
          <div className="max-w-md w-full mx-auto">
            
            {/* Mobile Logo Visibility */}
            <div className="lg:hidden flex justify-center mb-10">
               <div className="p-3 rounded-2xl bg-white shadow-xl border border-slate-100">
                  <img src="/logo.png" alt="Logo" className="h-14 w-auto" />
               </div>
            </div>

            <div className="mb-14 text-center lg:text-left">
               <div className="hidden lg:block w-1.5 h-10 bg-indigo-600 rounded-full mb-6" />
               <h2 className="text-4xl font-black text-slate-800 tracking-tighter font-display mb-2">Identify Yourself</h2>
               <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.1em]">Student Synchronization Gateway</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Authorized Email</label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors">
                    <MdPerson size={24} />
                  </div>
                  <input 
                    type="email" 
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full pl-16 pr-6 py-5 bg-white/60 border border-slate-100 text-slate-800 text-sm font-bold rounded-[24px] focus:outline-none focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/5 transition-all placeholder:text-slate-200 shadow-sm"
                    placeholder="Enter student email..."
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Security Key</label>
                  <button type="button" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Forgot Key?</button>
                </div>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors">
                    <MdLock size={24} />
                  </div>
                  <input 
                    type="password" 
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full pl-16 pr-6 py-5 bg-white/60 border border-slate-100 text-slate-800 text-sm font-bold rounded-[24px] focus:outline-none focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/5 transition-all placeholder:text-slate-200 shadow-sm"
                    placeholder="Enter secure password..."
                    required
                  />
                </div>
              </div>

              <div className="pt-6">
                <button 
                  type="submit"
                  disabled={loading}
                  className={`group relative w-full flex items-center justify-center gap-3 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.3em] py-6 px-10 rounded-[28px] transition-all duration-500 shadow-2xl hover:bg-indigo-600 hover:shadow-indigo-500/30 hover:-translate-y-1 active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed pointer-events-none' : ''}`}
                >
                  {loading ? 'SYNCHRONIZING...' : 'INITIALIZE HUB'}
                  {!loading && <MdArrowForward size={22} className="group-hover:translate-x-2 transition-transform" />}
                </button>
              </div>
            </form>

            <div className="mt-12 text-center">
               <p className="text-xs font-bold text-slate-400">
                  New to the Learning Network?{' '}
                  <Link to="/register" className="text-indigo-600 font-black uppercase tracking-widest hover:underline ml-1">
                    Enroll Today
                  </Link>
               </p>
            </div>
          </div>
        </div>

      </motion.div>
      
      {/* Footer Branding */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-30">
         <MdShield className="text-slate-400" size={14} />
         <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Encrypted Deployment v2.5.0</span>
      </div>
    </div>
  );
};

export default Login;
