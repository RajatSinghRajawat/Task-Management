import { useState, useEffect } from 'react';
import { MdClose, MdAttachFile } from 'react-icons/md';

const TaskModal = ({ isOpen, onClose, onSave, task }) => {
  const [form, setForm] = useState({
    Title: '',
    Description: '',
    course: 'BCA',
    Batch: '2023-2026',
    Task_Type: 'Assignment',
    Priority: 'Medium',
    Deadline: ''
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      // Formats date string to match datetime-local input (YYYY-MM-DDTHH:MM)
      let formattedDeadline = '';
      if (task.Deadline) {
        const d = new Date(task.Deadline);
        // Correct timezone offset formatting
        const tzoffset = d.getTimezoneOffset() * 60000; 
        const localISOTime = (new Date(d.getTime() - tzoffset)).toISOString().slice(0, -1);
        formattedDeadline = localISOTime.substring(0, 16);
      }

      setForm({
        Title: task.Title || '',
        Description: task.Description || '',
        course: task.course || 'BCA',
        Batch: task.Batch || '2023-2026',
        Task_Type: task.Task_Type || 'Assignment',
        Priority: task.Priority || 'Medium',
        Deadline: formattedDeadline
      });
      setFiles([]);
    } else {
      setForm({
        Title: '',
        Description: '',
        course: 'BCA',
        Batch: '2023-2026',
        Task_Type: 'Assignment',
        Priority: 'Medium',
        Deadline: ''
      });
      setFiles([]);
    }
  }, [task, isOpen]);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('Title', form.Title);
    formData.append('Description', form.Description);
    formData.append('course', form.course);
    formData.append('Batch', form.Batch);
    formData.append('Task_Type', form.Task_Type);
    formData.append('Priority', form.Priority);
    formData.append('Deadline', form.Deadline);

    if (files.length > 0) {
      files.forEach((file) => {
        formData.append('Attachments', file);
      });
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
          <h3 className="font-black text-slate-800 tracking-tight">
            {task ? 'Update Assigned Task' : 'Assign New Task'}
          </h3>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-slate-800 transition-colors"
          >
            <MdClose size={18} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 p-8 space-y-6 overflow-y-auto max-h-[75vh]">
          
          <div className="space-y-4">
            
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Task Title</label>
              <input 
                type="text" 
                value={form.Title}
                onChange={(e) => setForm({ ...form, Title: e.target.value })}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none focus:border-red-500 focus:bg-white transition-all shadow-inner"
                placeholder="Enter task/assignment title..."
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Description / Guidelines</label>
              <textarea 
                value={form.Description}
                onChange={(e) => setForm({ ...form, Description: e.target.value })}
                rows={4}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none focus:border-red-500 focus:bg-white transition-all shadow-inner resize-none"
                placeholder="Detail task requirements and guidelines..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Course selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Target Course</label>
                <select
                  value={form.course}
                  onChange={(e) => setForm({ ...form, course: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none focus:border-red-500 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="BCA">BCA</option>
                  <option value="MCA">MCA</option>
                  <option value="B.Tech">B.Tech</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="BBA">BBA</option>
                  <option value="MBA">MBA</option>
                </select>
              </div>

              {/* Batch selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Target Batch</label>
                <select
                  value={form.Batch}
                  onChange={(e) => setForm({ ...form, Batch: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none focus:border-red-500 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="2022-2025">2022-2025</option>
                  <option value="2023-2026">2023-2026</option>
                  <option value="2024-2027">2024-2027</option>
                  <option value="2025-2028">2025-2028</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Task Type */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Task Category</label>
                <select
                  value={form.Task_Type}
                  onChange={(e) => setForm({ ...form, Task_Type: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none focus:border-red-500 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="Assignment">Assignment</option>
                  <option value="Project">Project</option>
                  <option value="Test">Test</option>
                  <option value="Quiz">Quiz</option>
                </select>
              </div>

              {/* Priority */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Priority Level</label>
                <select
                  value={form.Priority}
                  onChange={(e) => setForm({ ...form, Priority: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none focus:border-red-500 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            {/* Deadline */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Submission Deadline</label>
              <input 
                type="datetime-local" 
                value={form.Deadline}
                onChange={(e) => setForm({ ...form, Deadline: e.target.value })}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none focus:border-red-500 focus:bg-white transition-all cursor-pointer"
                required
              />
            </div>

            {/* Attachments */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Upload Reference Materials</label>
              <div className="relative border-2 border-dashed border-slate-200 hover:border-red-500 bg-slate-50 hover:bg-white rounded-2xl p-6 transition-all text-center cursor-pointer">
                <input 
                  type="file" 
                  multiple 
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <MdAttachFile className="mx-auto text-slate-300 mb-2" size={28} />
                <span className="text-xs font-bold text-slate-500">
                  {files.length > 0 ? `${files.length} Files Selected` : 'Drag files here or click to browse'}
                </span>
              </div>
              {files.length > 0 && (
                <div className="text-[10px] font-bold text-slate-400 mt-2 space-y-1 pl-1">
                  {files.map((f, i) => <p key={i} className="truncate">• {f.name}</p>)}
                </div>
              )}
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
              className="flex-1 py-4 px-6 bg-slate-900 text-white text-xs font-black uppercase tracking-wider rounded-2xl hover:bg-red-600 shadow-lg hover:shadow-red-500/20 transition-all disabled:opacity-75"
            >
              {loading ? 'Publishing...' : 'Publish Task'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default TaskModal;
