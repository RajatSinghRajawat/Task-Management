import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Book, 
  Video, 
  FileText, 
  Download, 
  Play, 
  Eye,
  ArrowLeft,
  Clock,
  ExternalLink,
  RefreshCcw,
  Library,
  Layers,
  CheckCircle2,
  AlertCircle,
  FileDown,
  MonitorPlay,
  FileStack,
  ArrowRight
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

import { getApiBaseUrl } from '../../utils/api';

const API_BASE = `${getApiBaseUrl()}/api`;
const COURSES = [
  "Software-Development", "Data-Science", "Cyber-Security", "Cloud-Computing",
  "Artificial-Intelligence", "Digital-Marketing", "UI-UX-Design",
  "Business-Analytics", "Project-Management", "DevOps"
];

const Materials = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'details'
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMaterials = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    try {
      const course = localStorage.getItem('studentCourse') || 'Software-Development';
      let url = `${API_BASE}/materials`;
      
      const params = new URLSearchParams();
      if (course) params.append('course', course);
      if (activeTab !== 'All') params.append('subject', activeTab);
      
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setMaterials(data.data || []);
      }
    } catch (err) {
      toast.error('Asset Sync Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const stats = useMemo(() => [
    { label: 'Total Assets', val: materials.length, color: 'text-blue-700', bg: 'bg-blue-50', icon: <Library size={24} /> },
    { label: 'Video Lectures', val: materials.filter(m => m.type === 'Video').length, color: 'text-slate-700', bg: 'bg-slate-100', icon: <MonitorPlay size={24} /> },
    { label: 'PDF Resources', val: materials.filter(m => m.type === 'PDF').length, color: 'text-blue-900', bg: 'bg-blue-50', icon: <FileStack size={24} /> },
    { label: 'Web Links', val: materials.filter(m => m.type === 'Link').length, color: 'text-emerald-700', bg: 'bg-emerald-50', icon: <ExternalLink size={24} /> },
  ], [materials]);

  const getIcon = (type) => {
    switch (type) {
      case 'Video': return Video;
      case 'PDF': return FileText;
      case 'Link': return ExternalLink;
      case 'Image': return Eye;
      default: return Book;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'Video': return { text: "text-slate-700", bg: "bg-slate-50", border: "border-slate-200" };
      case 'PDF': return { text: "text-blue-700", bg: "bg-blue-50", border: "border-blue-100" };
      case 'Link': return { text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" };
      default: return { text: "text-blue-900", bg: "bg-blue-50", border: "border-blue-200" };
    }
  };

  const filteredMaterials = materials.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewMaterial = (material) => {
    setSelectedMaterial(material);
    setViewMode('details');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedMaterial(null);
  };

  // ----------------------------------------------------
  // LIST VIEW
  // ----------------------------------------------------
  if (viewMode === 'list') {
    return (
      <div className="relative w-full space-y-10 animate-in fade-in duration-700 pb-20 bg-slate-50 min-h-screen px-4 sm:px-8 pt-8">
        <Toaster position="top-right" />

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
           <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-1">Academic Asset Wall</h1>
              <p className="text-slate-500 font-semibold text-xs tracking-wide uppercase flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                 Centralized Learning Resources & Intelligence Hub
              </p>
           </div>
           <div className="flex items-center gap-3 bg-white p-2 rounded-3xl border border-slate-200 shadow-sm">
              <button onClick={() => fetchMaterials(true)} className={`p-4 bg-white rounded-2xl text-slate-400 hover:text-blue-700 transition-all border border-slate-100 shadow-sm ${refreshing ? 'animate-spin' : ''}`}>
                 <RefreshCcw size={22} />
              </button>
              <div className="px-6 py-3 bg-blue-700 text-white rounded-xl font-semibold text-xs uppercase tracking-wide shadow-md flex items-center gap-2">
                 <Layers size={18} /> Resources Online
              </div>
           </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
           {stats.map(s => (
              <motion.div 
                 key={s.label} 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 whileHover={{ y: -5 }}
                 className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-6 group transition-all hover:shadow-md"
              >
                 <div className={`w-14 h-14 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-sm`}>
                    {s.icon}
                 </div>
                 <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{s.label}</p>
                    <div className="flex items-baseline gap-1.5">
                       <p className="text-4xl font-extrabold text-slate-900 tracking-tight tabular-nums">{s.val}</p>
                    </div>
                 </div>
              </motion.div>
           ))}
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center gap-4 relative z-10">
           <div className="flex-1 w-full relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-700 transition-colors" size={24} />
              <input
                 value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                 placeholder="Search assets or curriculum notes..."
                 className="w-full pl-16 pr-8 py-5 bg-slate-50 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300"
              />
           </div>
           <div className="flex flex-wrap lg:flex-nowrap gap-3 w-full lg:w-auto">
              {['All', 'Video', 'PDF', 'Link'].map(t => (
                <button 
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-6 py-4 rounded-xl text-[10px] font-bold uppercase tracking-wide transition-all ${activeTab === t ? 'bg-blue-700 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                  {t}
                </button>
              ))}
           </div>
        </div>

        {/* Materials Wall */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-80 bg-white rounded-3xl border border-slate-200 animate-pulse" />)}
          </div>
        ) : filteredMaterials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
             <AnimatePresence mode="popLayout">
                {filteredMaterials.map(m => {
                  const Icon = getIcon(m.type);
                  const theme = getColor(m.type);
                  return (
                    <motion.div 
                      key={m._id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ y: -5 }}
                      onClick={() => handleViewMaterial(m)}
                      className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm group cursor-pointer transition-all hover:shadow-md hover:border-blue-300"
                    >
                       <div className="flex items-start justify-between mb-8">
                          <div className={`w-14 h-14 rounded-2xl ${theme.bg} ${theme.text} flex items-center justify-center shadow-sm border ${theme.border} transition-transform group-hover:scale-110`}>
                             <Icon size={24} />
                          </div>
                          <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wide rounded-lg border border-slate-100">
                             {m.subject || 'GENERAL'}
                          </span>
                       </div>
                       
                       <div className="space-y-3">
                          <h3 className="text-lg font-bold text-slate-900 tracking-tight group-hover:text-blue-700 transition-colors line-clamp-2">
                             {m.title}
                          </h3>
                          <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed">
                             {m.description || 'No descriptive intel provided for this asset.'}
                          </p>
                       </div>

                       <div className="flex items-center justify-between pt-8 mt-8 border-t border-slate-100">
                          <div className="flex items-center gap-3 text-slate-400">
                             <Clock size={16} />
                             <span className="text-[10px] font-bold uppercase tracking-wide">{new Date(m.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-blue-700">
                             <span className="text-[10px] font-bold uppercase tracking-wide">ACCESS</span>
                             <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                          </div>
                       </div>
                    </motion.div>
                  );
                })}
             </AnimatePresence>
          </div>
        ) : (
          <div className="py-32 text-center bg-white rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden z-10">
             <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Book className="text-slate-200" size={48} />
             </div>
             <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Asset Vault Empty</h3>
             <p className="text-slate-500 font-semibold text-xs mt-3 tracking-wide uppercase">No educational materials have been deployed to this sector.</p>
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // DETAILS VIEW (BENTO STYLE)
  // ----------------------------------------------------
  if (viewMode === 'details' && selectedMaterial) {
    const Icon = getIcon(selectedMaterial.type);
    const theme = getColor(selectedMaterial.type);

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-10 pb-24 overflow-hidden relative">
        <Toaster position="top-right" />
        
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-500/5 rounded-full blur-[150px] -z-10" />
        
        <button onClick={handleBackToList} className="group flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl text-slate-500 hover:text-blue-700 transition-all shadow-sm">
           <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
           <span className="text-[11px] font-bold uppercase tracking-wide">Back to Wall</span>
        </button>

        <div className="flex flex-col xl:flex-row gap-10 items-start">
           
           <div className="w-full xl:w-[65%] space-y-8">
              {/* Header Card */}
              <div className="bg-white/80 backdrop-blur-2xl p-10 lg:p-14 rounded-3xl border border-slate-200/50 shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-48 h-48 bg-blue-700/5 rounded-bl-[100px] -z-10" />
                 
                 <div className="space-y-8">
                    <div className="flex flex-wrap items-center gap-4">
                       <div className="px-4 py-2 bg-slate-900 text-white text-[9px] font-bold uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-slate-100">{selectedMaterial.type} ASSET</div>
                       <div className={`px-4 py-2 text-[9px] font-bold uppercase tracking-[0.2em] rounded-xl border-2 ${theme.border} ${theme.bg} ${theme.text}`}>{selectedMaterial.subject}</div>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-bold text-slate-800 tracking-tighter leading-none  uppercase">{selectedMaterial.title}</h1>
                    
                    <div className="flex flex-wrap items-center gap-10 pt-6">
                       <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-2xl ${theme.bg} ${theme.text} flex items-center justify-center text-3xl shadow-xl border ${theme.border}`}><Icon /></div>
                          <div>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Asset Status</p>
                             <p className="text-lg font-bold text-slate-700">Online & Active</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-700 text-xl border border-blue-100"><Clock /></div>
                          <div>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Deployed On</p>
                             <p className="text-lg font-bold text-slate-700">{new Date(selectedMaterial.createdAt).toLocaleDateString()}</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Description Card */}
              <div className="bg-white/80 backdrop-blur-2xl p-10 lg:p-14 rounded-3xl border border-slate-200/50 shadow-sm">
                 <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center text-2xl shadow-inner"><FileText /></div>
                    <h2 className="text-2xl font-bold text-slate-800  uppercase tracking-tight">Technical Description</h2>
                 </div>
                 <div className="prose prose-slate max-w-none text-slate-500 font-medium leading-[2] text-lg whitespace-pre-wrap">
                    {selectedMaterial.description}
                 </div>
              </div>

              {/* Asset Display */}
              <div className="bg-slate-900 rounded-3xl aspect-video flex flex-col items-center justify-center text-white relative shadow-2xl overflow-hidden group">
                 {selectedMaterial.type === 'Video' ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-900/50">
                       <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform hover:bg-blue-700 border border-white/20 shadow-2xl">
                          <Play size={40} fill="currentColor" />
                       </div>
                       <p className="absolute bottom-8 text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-400 animate-pulse">Streaming Authorized</p>
                    </div>
                 ) : (
                    <div className="text-center space-y-6">
                       <Icon size={80} className="mx-auto text-blue-500/20" />
                       <p className="text-sm font-bold text-slate-400 tracking-[0.4em] uppercase">Document Asset Synchronized</p>
                       <button className="px-10 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-[10px] font-bold uppercase tracking-wide hover:bg-white hover:text-slate-900 transition-all">Preview Mode Active</button>
                    </div>
                 )}
              </div>
           </div>

           <div className="w-full xl:w-[35%] space-y-8">
              {/* Resources Card */}
              <div className="bg-white/80 backdrop-blur-2xl p-10 rounded-3xl border border-slate-200/50 shadow-sm space-y-10">
                 <h3 className="text-xl font-bold text-slate-800  uppercase tracking-tight flex items-center gap-3">
                    <FileDown className="text-rose-500" /> Resource Downloads
                 </h3>
                 <div className="space-y-4">
                    {selectedMaterial.files?.length > 0 ? selectedMaterial.files.map((file, i) => (
                       <a 
                          key={i} 
                          href={`${API_BASE.replace('/api', '')}/${file.replace(/\\/g, '/')}`} 
                          target="_blank" 
                          className="flex items-center gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-400 hover:bg-white transition-all group"
                       >
                          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm text-rose-500 group-hover:bg-rose-50 transition-colors">
                             <FileText size={24} />
                          </div>
                          <div className="flex-1 overflow-hidden">
                             <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wide truncate">{file.split(/[\\/]/).pop()}</p>
                             <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wide">SECURE DOWNLOAD</p>
                          </div>
                       </a>
                    )) : (
                       <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-3xl opacity-30">
                          <p className="text-[10px] font-bold uppercase tracking-wide">No local files</p>
                       </div>
                    )}

                    {selectedMaterial.links?.length > 0 && selectedMaterial.links.map((link, i) => (
                       <a 
                          key={i} 
                          href={link} 
                          target="_blank" 
                          className="flex items-center gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-emerald-400 hover:bg-white transition-all group"
                       >
                          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm text-emerald-500 group-hover:bg-emerald-50 transition-colors">
                             <ExternalLink size={24} />
                          </div>
                          <div className="flex-1 overflow-hidden">
                             <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wide truncate">{link}</p>
                             <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wide">EXTERNAL ACCESS</p>
                          </div>
                       </a>
                    ))}
                 </div>
              </div>

              {/* Faculty Info Card */}
              <div className="bg-slate-900 p-10 rounded-3xl shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-500" />
                 <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white text-3xl font-bold">
                       {selectedMaterial.uploadedBy?.charAt(0) || 'F'}
                    </div>
                    <div>
                       <p className="text-white text-lg font-bold  uppercase tracking-tight">{selectedMaterial.uploadedBy || 'Faculty'}</p>
                       <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Research Lead</p>
                    </div>
                 </div>
                 <div className="mt-8 p-6 bg-white/5 rounded-3xl border border-white/10">
                    <p className="text-slate-400 text-[10px] font-medium leading-relaxed italic">
                       "This material has been vetted for academic integrity and curriculum alignment. Ensure thorough study before the next deployment."
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </motion.div>
    );
  }

  return null;
};

export default Materials;
