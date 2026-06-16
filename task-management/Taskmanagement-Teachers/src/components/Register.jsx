import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MdPerson, MdEmail, MdLock, MdArrowForward, MdRocketLaunch } from 'react-icons/md';
import { motion } from 'framer-motion';

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('Male');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:7001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, gender })
      });
      const result = await response.json();

      if (response.ok) {
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
        navigate('/dashboard');
      } else {
        setError(result.message || 'Registration request rejected');
      }
    } catch (err) {
      setError('Satellite link fault. Check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 font-sans overflow-hidden bg-[#fafafa] selection:bg-blue-600/30">
      
      {/* 🌌 ELITE BACKGROUND ARCHITECTURE */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[150px] animate-pulse pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[1100px] w-full bg-white/40 backdrop-blur-[40px] rounded-[56px] shadow-[0_32px_100px_rgba(0,0,0,0.06)] border border-white/60 overflow-hidden flex flex-col lg:flex-row min-h-[700px] relative z-10"
      >
        
        {/* 🚀 BRANDING SIDE (DYNAMICS) */}
        <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-16 overflow-hidden bg-slate-900">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-700/20 to-blue-700/20 opacity-40" />
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center p-2">
                 <img src="/logo.png" alt="Logo" className="h-16 w-auto invert brightness-0" />
              </div>
              <div className="h-14 w-px bg-white/20"></div>
              <div>
                <h1 className="font-bold text-3xl text-white tracking-tighter uppercase ">TIPS G</h1>
                <p className="text-[10px] uppercase tracking-[0.4em] text-indigo-300 font-bold">Alwar Intelligence</p>
              </div>
            </div>
          </div>

          <div className="relative z-10">
             <h2 className="text-5xl font-bold text-white mb-6 leading-[1.1] tracking-tighter ">
                Join The <br/>Academic <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Elite.</span>
             </h2>
             <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm mb-10">
                Initialize your faculty account to start deploying high-fidelity curriculum and monitoring student success.
             </p>
             
             <div className="flex items-center gap-6 p-6 bg-white/5 backdrop-blur-md rounded-[32px] border border-white/10 w-fit">
                <div className="flex -space-x-4">
                   {[5,6,7].map(i => (
                     <div key={i} className="w-12 h-12 rounded-full border-4 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden ring-2 ring-blue-500/20">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+100}`} className="w-full h-full object-cover" />
                     </div>
                   ))}
                </div>
                <div>
                   <p className="text-xs font-bold text-white tracking-wide">NEW PERSONNEL PORTAL</p>
                   <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wide mt-0.5">Faculty Registration</p>
                </div>
             </div>
          </div>
        </div>

        {/* 📂 REGISTRATION SIDE */}
        <div className="flex-1 p-8 lg:p-20 flex flex-col justify-center relative">
          <div className="max-w-md w-full mx-auto">
            
            {/* Mobile Logo Visibility */}
            <div className="lg:hidden flex justify-center mb-10">
               <div className="p-3 rounded-2xl bg-white shadow-xl border border-slate-100">
                  <img src="/logo.png" alt="Logo" className="h-14 w-auto" />
               </div>
            </div>

            <div className="mb-10 text-center lg:text-left">
               <div className="hidden lg:block w-1.5 h-10 bg-blue-700 rounded-full mb-6" />
               <h2 className="text-4xl font-bold text-slate-800 tracking-tighter  mb-2">Request Access</h2>
               <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.1em]">Faculty Credential Initialization</p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }}
                className="mb-6 p-5 bg-rose-50/50 backdrop-blur-xl text-rose-600 text-[11px] font-bold uppercase tracking-wide rounded-2xl border border-rose-100 flex items-center gap-4 shadow-sm"
              >
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Personnel Full Name</label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-700 transition-colors">
                    <MdPerson size={22} />
                  </div>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-16 pr-6 py-4.5 bg-white/60 border border-slate-100 text-slate-800 text-sm font-bold rounded-[22px] focus:outline-none focus:border-blue-500 focus:ring-8 focus:ring-blue-500/5 transition-all placeholder:text-slate-200 shadow-sm"
                    placeholder="Enter your full identity..."
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Operational Email</label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-700 transition-colors">
                    <MdEmail size={22} />
                  </div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-16 pr-6 py-4.5 bg-white/60 border border-slate-100 text-slate-800 text-sm font-bold rounded-[22px] focus:outline-none focus:border-blue-500 focus:ring-8 focus:ring-blue-500/5 transition-all placeholder:text-slate-200 shadow-sm"
                    placeholder="Enter personnel email..."
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Secure Logic Key</label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-700 transition-colors">
                    <MdLock size={22} />
                  </div>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-16 pr-6 py-4.5 bg-white/60 border border-slate-100 text-slate-800 text-sm font-bold rounded-[22px] focus:outline-none focus:border-blue-500 focus:ring-8 focus:ring-blue-500/5 transition-all placeholder:text-slate-200 shadow-sm"
                    placeholder="Create secure logic key..."
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Gender</label>
                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setGender('Male')}
                    className={`flex-1 py-3.5 rounded-[22px] border font-bold text-xs uppercase tracking-wide transition-all ${gender === 'Male' ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}
                  >
                    Sir (Male)
                  </button>
                  <button 
                    type="button"
                    onClick={() => setGender('Female')}
                    className={`flex-1 py-3.5 rounded-[22px] border font-bold text-xs uppercase tracking-wide transition-all ${gender === 'Female' ? 'bg-blue-700 text-white border-blue-700 shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}
                  >
                    Mam (Female)
                  </button>
                </div>
              </div>

              <div className="pt-6">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className={`group relative w-full flex items-center justify-center gap-3 bg-slate-900 text-white text-[11px] font-bold uppercase tracking-[0.3em] py-5 px-10 rounded-2xl transition-all duration-500 shadow-2xl hover:bg-blue-700 hover:shadow-blue-500/30 hover:-translate-y-1 active:scale-95 ${isLoading ? 'opacity-70 cursor-not-allowed pointer-events-none' : ''}`}
                >
                  {isLoading ? 'INITIALIZING...' : 'REQUEST ACCESS'}
                  {!isLoading && <MdArrowForward size={22} className="group-hover:translate-x-2 transition-transform" />}
                </button>
              </div>
            </form>

            <div className="mt-10 text-center">
               <p className="text-xs font-bold text-slate-400">
                  Already Verified?{' '}
                  <Link to="/" className="text-blue-700 font-bold uppercase tracking-wide hover:underline ml-1">
                    Return To Hub
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

