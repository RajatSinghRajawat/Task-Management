import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { 
  MdArrowBack, MdCloudUpload, MdClose, MdAttachFile, 
  MdOutlineAssignment, MdOutlineCalendarToday, MdSchool, MdOutlineClass,
  MdFlag, MdCheckCircle, MdPeople, MdKeyboardArrowDown, MdAdd, MdDelete,
  MdShortText, MdSubject, MdTimer, MdRocketLaunch, MdLibraryBooks, MdAutoFixHigh,
  MdLayers, MdRadioButtonChecked, MdFormatAlignLeft
} from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';

const API = 'http://localhost:7001/api/tasks';
const STUDENTS_API = 'http://localhost:7001/api/students';
const AUTH_TOKEN = () => localStorage.getItem('token');

const COURSES = [
  "Software-Development", "Data-Science", "Cyber-Security", "Cloud-Computing",
  "Artificial-Intelligence", "Digital-Marketing", "UI-UX-Design",
  "Business-Analytics", "Project-Management", "DevOps"
];

const BATCHES = ["2024", "2025", "2026", "2027", "2028", "2029", "2030"];

const CreateTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const questionEndRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [students, setStudents] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
  const [questions, setQuestions] = useState([{ questionText: '', type: 'Short Answer', options: ['', '', '', ''] }]); 

  const [form, setForm] = useState({
    Title: '', Description: '', course: COURSES[0], Batch: BATCHES[0],
    Task_Type: 'Assignment', Priority: 'Medium', 
    Assign_Date: new Date().toISOString().split('T')[0],
    Deadline: '', Late_Allowed: false, Links: '',
    Marks_Feedback: '', Assigned_To: [],
    Q_Course: COURSES[0],
    Q_Batch: BATCHES[0]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = AUTH_TOKEN();
        const headers = { Authorization: `Bearer ${token}` };
        const studentRes = await axios.get(STUDENTS_API, { headers });
        setStudents(studentRes.data.students || []);

        if (isEdit) {
          const taskRes = await axios.get(`${API}/${id}`, { headers });
          const t = taskRes.data;
          setForm({
            ...form,
            Title: t.Title, Description: t.Description,
            course: t.course, Batch: t.Batch,
            Task_Type: t.Task_Type, Priority: t.Priority,
            Assign_Date: t.Assign_Date ? t.Assign_Date.split('T')[0] : '',
            Deadline: t.Deadline ? t.Deadline.slice(0, 16) : '',
            Late_Allowed: t.Late_Allowed,
            Links: t.Links?.join('\n') || '',
            Marks_Feedback: t.Marks_Feedback || '',
            Assigned_To: t.Assigned_To?.map(s => typeof s === 'string' ? s : s._id) || [],
            Q_Course: t.course,
            Q_Batch: t.Batch
          });
          if (t.questions && t.questions.length > 0) setQuestions(t.questions);
        }
      } catch (err) {
        toast.error('Sync Error');
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [id, isEdit]);

  const scrollToBottom = () => {
    questionEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleInputChange = (k, v) => setForm(f => ({ ...f, [k]: v }));
  
  const toggleStudentSelection = (studentId) => {
    setForm(prev => ({
      ...prev,
      Assigned_To: prev.Assigned_To.includes(studentId)
        ? prev.Assigned_To.filter(id => id !== studentId)
        : [...prev.Assigned_To, studentId]
    }));
  };

  const addQuestion = () => {
    setQuestions([...questions, { questionText: '', type: 'Short Answer', options: ['', '', '', ''] }]);
    setTimeout(scrollToBottom, 100);
  };
  
  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    } else {
      toast.error('At least one question must remain on the Wall');
    }
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const updateOption = (qIdx, oIdx, val) => {
    const newQuestions = [...questions];
    newQuestions[qIdx].options[oIdx] = val;
    setQuestions(newQuestions);
  };

  const handleSubmit = async (mode = 'task') => {
    if (mode === 'task' && !form.Title) return toast.error('Headline is required for Standard Task');
    if (mode === 'questions' && (!questions[0].questionText)) return toast.error('Please write at least one question on the Wall');

    setLoading(true);
    const loadToast = toast.loading(mode === 'task' ? 'Deploying Standard Task...' : 'Syncing Questions Wall...');

    try {
      const formData = new FormData();
      
      if (mode === 'task') {
        formData.append("Title", form.Title);
        formData.append("Description", form.Description);
        formData.append("course", form.course);
        formData.append("Batch", form.Batch);
        formData.append("questions", JSON.stringify([]));
      } else {
        formData.append("Title", `Questions Wall - ${form.Q_Course} (${form.Q_Batch})`);
        formData.append("Description", "Automated Questions Wall Sync");
        formData.append("course", form.Q_Course);
        formData.append("Batch", form.Q_Batch);
        formData.append("questions", JSON.stringify(questions));
      }

      formData.append("Task_Type", form.Task_Type);
      formData.append("Priority", form.Priority);
      formData.append("Assign_Date", form.Assign_Date);
      formData.append("Deadline", form.Deadline || new Date(Date.now() + 604800000).toISOString());
      formData.append("Late_Allowed", String(form.Late_Allowed));
      formData.append("Marks_Feedback", form.Marks_Feedback);
      
      form.Links.split('\n').filter(Boolean).forEach(l => formData.append('Links', l.trim()));
      form.Assigned_To.forEach(id => formData.append('Assigned_To', id));
      selectedFiles.forEach(f => formData.append('Attachments', f));

      const token = AUTH_TOKEN();
      const url = isEdit ? `${API}/${id}` : `${API}/create`;
      const method = isEdit ? 'put' : 'post';
      
      await axios[method](url, formData, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });

      toast.success(mode === 'task' ? 'Task Deployed!' : 'Questions Wall Synced!', { id: loadToast });
      navigate('/tasks');
    } catch (err) {
      toast.error('Deployment Fault', { id: loadToast });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-700 rounded-full animate-spin"></div>
    </div>
  );

  const inpClass = "w-full px-6 py-4 bg-white/60 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-400 transition-all shadow-sm";
  const lblClass = "block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2.5 ml-1";

  const TypeButton = ({ type, currentType, icon: Icon, label, onClick }) => (
    <button 
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-2 py-3 px-2 rounded-2xl border transition-all ${currentType === type ? 'bg-blue-700 border-blue-700 text-white shadow-lg shadow-blue-100' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-white hover:border-blue-200'}`}
    >
      <Icon size={20} />
      <span className="text-[9px] font-bold uppercase tracking-wide">{label}</span>
    </button>
  );

  return (
    <div className="w-full space-y-10 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/tasks')} className="p-3 bg-white rounded-2xl text-slate-400 hover:text-blue-700 shadow-sm border border-slate-200/50 transition-all active:scale-95">
            <MdArrowBack size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight ">Task Management</h1>
            <p className="text-slate-400 font-medium text-sm mt-1">Create assignments or interactive quizzes for your students.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-10 items-start">
        
        {/* 📘 SECTION 1: STANDARD TASK */}
        <div className="w-full xl:w-[38%] space-y-6 shrink-0">
          <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-3xl border border-slate-200/50 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-700 opacity-[0.03] rounded-bl-full" />
            
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center text-2xl shadow-inner">
                <MdLibraryBooks />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 ">Assignment</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">General Tasks</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className={lblClass}>Task Title</label>
                <input className={inpClass} value={form.Title} onChange={e => handleInputChange('Title', e.target.value)} placeholder="Enter task title..." />
              </div>
              <div>
                <label className={lblClass}>Instructions</label>
                <textarea className={`${inpClass} min-h-[80px] resize-none`} value={form.Description} onChange={e => handleInputChange('Description', e.target.value)} placeholder="Enter task instructions..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className={lblClass}>Subject</label>
                   <select className={inpClass} value={form.course} onChange={e => handleInputChange('course', e.target.value)}>
                     {COURSES.map(c => <option key={c} value={c}>{c.replace(/-/g, ' ')}</option>)}
                   </select>
                 </div>
                 <div>
                   <label className={lblClass}>Batch</label>
                   <select className={inpClass} value={form.Batch} onChange={e => handleInputChange('Batch', e.target.value)}>
                     {BATCHES.map(b => <option key={b} value={b}>{b}</option>)}
                   </select>
                 </div>
              </div>

              <div className="p-6 bg-blue-50/30 rounded-3xl border border-blue-100/50">
                <label className={lblClass}>Resource Upload</label>
                <div className="relative group cursor-pointer">
                  <input type="file" multiple onChange={e => setSelectedFiles(prev => [...prev, ...Array.from(e.target.files)])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className="bg-white border-2 border-dashed border-blue-200 rounded-2xl p-6 text-center group-hover:border-blue-400 group-hover:bg-blue-50/50 transition-all">
                     <MdCloudUpload className="mx-auto text-slate-300 mb-2" size={24} />
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Attach Material</p>
                  </div>
                </div>
                {selectedFiles.length > 0 && (
                  <div className="mt-4 space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                     {selectedFiles.map((f, i) => (
                       <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                          <span className="text-[10px] font-bold text-slate-600 truncate flex-1">{f.name}</span>
                          <button type="button" onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-slate-300 hover:text-rose-500"><MdClose size={16}/></button>
                       </div>
                     ))}
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={() => handleSubmit('task')}
              disabled={loading}
              className="mt-8 w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm shadow-xl hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <MdLibraryBooks size={20} /> Create Assignment
            </button>
          </div>
        </div>

        {/* 🧱 SECTION 2: QUESTIONS WALL */}
        <div className="w-full xl:flex-1 space-y-6">
          <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-3xl border border-slate-200/50 shadow-sm relative overflow-hidden h-full flex flex-col min-h-[700px]">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-700 opacity-[0.03] rounded-bl-full" />
            
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center text-2xl shadow-lg shadow-purple-100">
                  <MdLayers />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 ">Interactive Quiz</h2>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Quiz Mode Active
                  </p>
                </div>
              </div>
              <button 
                onClick={addQuestion} 
                className="px-6 py-3 bg-blue-50 text-blue-700 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-blue-700 hover:text-white transition-all shadow-sm active:scale-95"
              >
                <MdAdd size={20} /> Add Question
              </button>
            </div>

            <div className="space-y-6 flex-1 flex flex-col">
              <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50/50 rounded-[32px] border border-slate-100">
                 <div>
                   <label className={lblClass}>Target Subject</label>
                   <select className={inpClass} value={form.Q_Course} onChange={e => handleInputChange('Q_Course', e.target.value)}>
                     {COURSES.map(c => <option key={c} value={c}>{c.replace(/-/g, ' ')}</option>)}
                   </select>
                 </div>
                 <div>
                   <label className={lblClass}>Target Batch</label>
                   <select className={inpClass} value={form.Q_Batch} onChange={e => handleInputChange('Q_Batch', e.target.value)}>
                     {BATCHES.map(b => <option key={b} value={b}>{b}</option>)}
                   </select>
                 </div>
              </div>

              {/* The "Wall" Stream */}
              <div className="flex-1 overflow-y-auto pr-4 space-y-6 custom-scrollbar mt-4 max-h-[600px]">
                <AnimatePresence mode="popLayout">
                    {questions.map((q, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white p-8 rounded-[32px] border border-slate-100 relative group hover:shadow-xl hover:border-blue-200 transition-all"
                      >
                         <div className="absolute top-6 left-6 w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[10px] font-bold  shadow-lg">
                           {idx + 1}
                         </div>
                         <button onClick={() => removeQuestion(idx)} className="absolute top-6 right-6 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                           <MdDelete size={20} />
                         </button>
                         
                         <div className="mt-8 space-y-6">
                            <div>
                               <label className={lblClass}>Question Text</label>
                               <textarea 
                                  className={`${inpClass} py-4 min-h-[60px] resize-none`} 
                                  value={q.questionText} 
                                  onChange={e => updateQuestion(idx, 'questionText', e.target.value)} 
                                  placeholder="Type your inquiry here..." 
                                />
                            </div>
                            
                            <div className="space-y-4">
                               <label className={lblClass}>Response Mode</label>
                               <div className="flex gap-3">
                                  <TypeButton 
                                    type="Short Answer" 
                                    currentType={q.type} 
                                    icon={MdShortText} 
                                    label="Short" 
                                    onClick={() => updateQuestion(idx, 'type', 'Short Answer')} 
                                  />
                                  <TypeButton 
                                    type="Paragraph" 
                                    currentType={q.type} 
                                    icon={MdFormatAlignLeft} 
                                    label="Detailed" 
                                    onClick={() => updateQuestion(idx, 'type', 'Paragraph')} 
                                  />
                                  <TypeButton 
                                    type="MCQ" 
                                    currentType={q.type} 
                                    icon={MdRadioButtonChecked} 
                                    label="MCQ" 
                                    onClick={() => updateQuestion(idx, 'type', 'MCQ')} 
                                  />
                               </div>
                            </div>

                            {/* MCQ Options Wall - Open when MCQ selected */}
                            <AnimatePresence>
                               {q.type === 'MCQ' && (
                                 <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="pt-4 space-y-3 overflow-hidden"
                                 >
                                    <label className={lblClass}>Answer Options (MCQ)</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                       {q.options.map((opt, oIdx) => (
                                         <div key={oIdx} className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0 border border-blue-100">
                                              {String.fromCharCode(65 + oIdx)}
                                            </div>
                                            <input 
                                              className="flex-1 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:border-blue-300" 
                                              value={opt} 
                                              onChange={e => updateOption(idx, oIdx, e.target.value)} 
                                              placeholder={`Option ${String.fromCharCode(65 + oIdx)}`} 
                                            />
                                         </div>
                                       ))}
                                    </div>
                                    <button 
                                      onClick={() => {
                                        const newQ = [...questions];
                                        newQ[idx].options.push('');
                                        setQuestions(newQ);
                                      }}
                                      className="w-full py-2 mt-2 border-2 border-dashed border-slate-100 rounded-xl text-[9px] font-bold text-indigo-400 uppercase tracking-wide hover:bg-blue-50 transition-all"
                                    >
                                      + Add Logic Path
                                    </button>
                                 </motion.div>
                               )}
                            </AnimatePresence>
                         </div>
                      </motion.div>
                    ))}
                    <div ref={questionEndRef} />
                </AnimatePresence>
              </div>
            </div>

            <button 
              onClick={() => handleSubmit('questions')}
              disabled={loading}
              className="mt-8 w-full bg-blue-700 text-white py-5 rounded-2xl font-bold text-[12px] uppercase tracking-[0.2em] shadow-xl shadow-blue-100 hover:bg-blue-800 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <MdRocketLaunch size={24} /> Publish Quiz
            </button>
          </div>
        </div>

      </div>

      {/* Shared Configuration Hub */}
      <div className="bg-white/80 backdrop-blur-2xl p-10 rounded-3xl border border-slate-200/50 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="space-y-5">
          <h3 className="text-sm font-bold text-slate-800  flex items-center gap-3 uppercase tracking-wider">
            <MdTimer size={20} className="text-blue-700" /> Deadline Settings
          </h3>
          <input type="datetime-local" className={inpClass} value={form.Deadline} onChange={e => handleInputChange('Deadline', e.target.value)} />
          <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Allow Late Entry</span>
             <div onClick={() => handleInputChange('Late_Allowed', !form.Late_Allowed)} className={`w-12 h-6 rounded-full flex items-center px-1 cursor-pointer transition-all ${form.Late_Allowed ? 'bg-blue-700' : 'bg-slate-300'}`}>
                <motion.div animate={{ x: form.Late_Allowed ? 24 : 0 }} className="w-4 h-4 bg-white rounded-full shadow-sm" />
             </div>
          </div>
        </div>

        <div className="space-y-5">
          <h3 className="text-sm font-bold text-slate-800  flex items-center gap-3 uppercase tracking-wider">
            <MdFlag size={20} className="text-blue-700" /> Priority Level
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {['Low', 'Medium', 'High'].map(p => (
              <button 
                key={p} 
                onClick={() => handleInputChange('Priority', p)}
                className={`py-4 rounded-2xl text-[10px] font-bold uppercase tracking-wide border transition-all flex items-center justify-center gap-3 ${form.Priority === p ? 'bg-blue-700 border-blue-700 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-blue-100'}`}
              >
                {form.Priority === p && <MdCheckCircle size={16} />}
                {p} Priority
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <h3 className="text-sm font-bold text-slate-800  flex items-center gap-3 uppercase tracking-wider">
            <MdPeople size={20} className="text-blue-700" /> Target Students
          </h3>
          <div className="relative">
             <button type="button" onClick={() => setIsStudentDropdownOpen(!isStudentDropdownOpen)} className="w-full px-6 py-5 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                {form.Assigned_To.length === 0 ? 'Broadcast to All' : `${form.Assigned_To.length} Selected`}
                <MdKeyboardArrowDown className={`transition-transform ${isStudentDropdownOpen ? 'rotate-180' : ''}`} size={22} />
             </button>
             <AnimatePresence>
                {isStudentDropdownOpen && (
                   <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full mb-4 left-0 right-0 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 max-h-56 overflow-y-auto p-3 space-y-1 custom-scrollbar"
                   >
                      {students.map(s => (
                        <div key={s._id} onClick={() => toggleStudentSelection(s._id)} className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all ${form.Assigned_To.includes(s._id) ? 'bg-blue-700 text-white shadow-lg' : 'hover:bg-slate-50 text-slate-600'}`}>
                           <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center ${form.Assigned_To.includes(s._id) ? 'bg-white border-white text-blue-700' : 'border-slate-200'}`}>{form.Assigned_To.includes(s._id) && <MdCheckCircle size={14} />}</div>
                           <span className="text-[11px] font-bold truncate">{s.fullName}</span>
                        </div>
                      ))}
                   </motion.div>
                )}
             </AnimatePresence>
          </div>
          <p className="text-[10px] font-bold text-slate-300 italic text-center uppercase tracking-wide">Select specific students or broadcast to all.</p>
        </div>
      </div>
    </div>
  );
};

export default CreateTask;
