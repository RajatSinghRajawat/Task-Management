import { useEffect, useState } from 'react';
import { MdAdd, MdSearch, MdEdit, MdDelete, MdFolderShared, MdFilterList, MdAttachFile, MdAccessTime } from 'react-icons/md';
import { getApiBaseUrl } from '../utils/api';
import TaskModal from '../components/TaskModal';
import TaskSubmissionsModal from '../components/TaskSubmissionsModal';
import toast, { Toaster } from 'react-hot-toast';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [isSubmissionsOpen, setIsSubmissionsOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/tasks`, { headers });
      if (!res.ok) throw new Error("Failed to load task roster");
      const data = await res.json();
      
      let filtered = data.tasks || [];

      // Apply Frontend Filter as backend search filter might be basic
      if (selectedCourse !== 'All') {
        filtered = filtered.filter(t => t.course === selectedCourse);
      }
      if (selectedType !== 'All') {
        filtered = filtered.filter(t => t.Task_Type === selectedType);
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(t => t.Title?.toLowerCase().includes(q) || t.Description?.toLowerCase().includes(q));
      }

      setTasks(filtered);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load assignments roster");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [selectedCourse, selectedType, search]);

  const handleSaveTask = async (formData) => {
    const token = localStorage.getItem('adminToken');
    const baseUrl = getApiBaseUrl();
    const headers = {
      'Authorization': `Bearer ${token}`
    };

    try {
      let res;
      if (editingTask) {
        // Update Task
        res = await fetch(`${baseUrl}/api/tasks/${editingTask._id}`, {
          method: 'PUT',
          headers,
          body: formData
        });
      } else {
        // Create/Assign Task
        res = await fetch(`${baseUrl}/api/tasks/create`, {
          method: 'POST',
          headers,
          body: formData
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Operation failed');

      toast.success(editingTask ? 'Task updated successfully' : 'Task assigned & notifications sent');
      fetchTasks();
      setIsModalOpen(false);
      setEditingTask(null);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Error occurred');
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this task assignments?")) return;

    try {
      const token = localStorage.getItem('adminToken');
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Deletion failed');

      toast.success('Task deleted successfully');
      fetchTasks();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Error occurred');
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openSubmissionsModal = (id) => {
    setSelectedTaskId(id);
    setIsSubmissionsOpen(true);
  };

  return (
    <div className="space-y-8">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Assigned Tasks</h1>
          <p className="text-slate-400 text-xs mt-0.5">Publish assignments, homework, test links, and view student response files.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-slate-900 text-white text-xs font-black uppercase tracking-wider py-4 px-6 rounded-2xl hover:bg-red-600 shadow-lg hover:shadow-red-500/20 transition-all cursor-pointer w-full sm:w-auto justify-center"
        >
          <MdAdd size={18} />
          Assign Task
        </button>
      </div>

      {/* Control bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between gap-6">
        
        {/* Search */}
        <div className="flex-1 max-w-md relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assignments by title..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 text-sm font-semibold rounded-2xl focus:outline-none focus:border-red-500 focus:bg-white transition-all shadow-inner"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <MdSearch size={20} />
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <MdFilterList className="text-slate-400" size={18} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filters:</span>
          </div>

          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-4 py-3 bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 rounded-xl focus:outline-none cursor-pointer"
          >
            <option value="All">All Courses</option>
            <option value="BCA">BCA</option>
            <option value="MCA">MCA</option>
            <option value="B.Tech">B.Tech</option>
            <option value="M.Tech">M.Tech</option>
            <option value="BBA">BBA</option>
            <option value="MBA">MBA</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-3 bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 rounded-xl focus:outline-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="Assignment">Assignment</option>
            <option value="Project">Project</option>
            <option value="Test">Test</option>
            <option value="Quiz">Quiz</option>
          </select>
        </div>

      </div>

      {/* Grid of Tasks */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-slate-900"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white p-12 rounded-[32px] border border-slate-100 text-center space-y-3">
          <p className="text-slate-400 text-sm">No assignments posted for these criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tasks.map((task) => (
            <div 
              key={task._id}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6 hover:shadow-md hover:border-slate-200 transition-all flex flex-col justify-between relative overflow-hidden"
            >
              <div className="space-y-4">
                
                {/* Top Category Badge / Priority */}
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    task.Task_Type === 'Project' ? 'bg-purple-100 text-purple-700' :
                    task.Task_Type === 'Test' ? 'bg-rose-100 text-rose-700' :
                    task.Task_Type === 'Quiz' ? 'bg-amber-100 text-amber-700' :
                    'bg-indigo-100 text-indigo-700'
                  }`}>
                    {task.Task_Type}
                  </span>
                  
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${
                    task.Priority === 'High' ? 'text-red-500' :
                    task.Priority === 'Medium' ? 'text-amber-500' :
                    'text-slate-400'
                  }`}>
                    {task.Priority} Priority
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-800 text-base leading-snug">{task.Title}</h3>
                  <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                    Course: <span className="text-slate-600">{task.course}</span> ({task.Batch})
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                  {task.Description || 'No description provided.'}
                </p>

                {/* Attachments rendering */}
                {task.Attachments && task.Attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-50">
                    {task.Attachments.map((f, idx) => (
                      <a 
                        key={idx}
                        href={`${getApiBaseUrl()}/${f}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/50 hover:underline px-2.5 py-1 rounded-xl"
                      >
                        <MdAttachFile size={12} /> Reference {idx + 1}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Deadline & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                  <MdAccessTime size={16} />
                  <span>Deadline: {new Date(task.Deadline).toLocaleString()}</span>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button 
                    onClick={() => openSubmissionsModal(task._id)}
                    className="flex items-center gap-1.5 py-2.5 px-4 bg-slate-900 text-white hover:bg-indigo-600 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md shadow-slate-900/5"
                  >
                    <MdFolderShared size={16} /> Submissions
                  </button>
                  <button 
                    onClick={() => openEditModal(task)}
                    className="p-2.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                    title="Edit Task"
                  >
                    <MdEdit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteTask(task._id)}
                    className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                    title="Delete Task"
                  >
                    <MdDelete size={16} />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Task Creation Modal */}
      <TaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
      />

      {/* Submissions Stats View Modal */}
      <TaskSubmissionsModal
        isOpen={isSubmissionsOpen}
        onClose={() => setIsSubmissionsOpen(false)}
        taskId={selectedTaskId}
      />

    </div>
  );
};

export default Tasks;
