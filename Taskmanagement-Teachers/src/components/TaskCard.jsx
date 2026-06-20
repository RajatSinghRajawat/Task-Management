import { motion } from 'framer-motion';
import { MdEdit, MdDeleteOutline, MdAssignmentTurnedIn, MdOutlineTimer, MdKeyboardArrowRight, MdSchool, MdOutlineClass, MdCheckCircleOutline } from 'react-icons/md';

const TaskCard = ({ task, onEdit, onDelete, onView }) => {
   const isOverdue = new Date(task.Deadline) < new Date() && task.Status === 'Pending';
   const isCompleted = task.Status === 'Completed';
   
   return (
      <motion.div 
         layout
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         exit={{ opacity: 0, scale: 0.95 }}
         whileHover={{ y: -8 }}
         className="bg-white p-8 rounded-3xl border border-slate-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-2xl hover:shadow-blue-600/5 transition-all group flex flex-col relative overflow-hidden h-full"
      >
         {/* Status Glow */}
         <div className={`absolute top-0 right-0 w-32 h-32 opacity-[0.03] rounded-bl-full transition-all duration-500 group-hover:scale-110 ${isCompleted ? 'bg-emerald-500' : isOverdue ? 'bg-rose-500' : 'bg-blue-600'}`} />
         
         <div className="flex justify-between items-start mb-6 relative z-10">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wide ${task.Task_Type === 'Question' ? 'bg-amber-50 text-amber-600 border border-amber-100' : isCompleted ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
               <MdCheckCircleOutline size={16} /> {task.Task_Type || 'Assignment'}
            </div>

            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
               <button onClick={(e) => { e.stopPropagation(); onEdit?.(task._id); }} className="p-2.5 bg-slate-50 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100"><MdEdit size={18} /></button>
               <button onClick={(e) => { e.stopPropagation(); onDelete?.(task._id); }} className="p-2.5 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100"><MdDeleteOutline size={18} /></button>
            </div>
         </div>

         <div className="flex-1 cursor-pointer relative z-10" onClick={() => onView?.(task._id)}>
            <h3 className="text-xl font-bold text-slate-800 line-clamp-1 mb-2 group-hover:text-blue-700 transition-colors  tracking-tight leading-tight">{task.Title}</h3>
            <p className="text-slate-400 text-[12px] font-medium leading-relaxed line-clamp-2 mb-6 opacity-80">{task.Description}</p>

            <div className="flex flex-wrap gap-2 mb-8">
               <span className={`text-[8px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-lg border shadow-sm ${task.Priority === 'High' ? 'bg-rose-50 text-rose-600 border-rose-100' : task.Priority === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                  {task.Priority}
               </span>
               <span className={`text-[8px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-lg border shadow-sm ${isCompleted ? 'bg-emerald-600 text-white border-emerald-600' : isOverdue ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                  {isOverdue ? 'Overdue' : task.Status}
               </span>
            </div>
         </div>

         <div className="pt-6 border-t border-slate-50 flex flex-col gap-4 relative z-10 mt-auto">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-slate-400 font-bold text-[9px] uppercase tracking-wide">
                  <MdOutlineTimer size={18} className={isOverdue ? 'text-rose-500' : 'text-blue-600'} />
                  {new Date(task.Deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
               </div>
               <div className="flex items-center gap-3">
                  <MdKeyboardArrowRight size={22} className="text-slate-200 group-hover:text-blue-700 transition-all group-hover:translate-x-1" />
               </div>
            </div>
            <div className="flex items-center justify-between text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] bg-slate-50/80 backdrop-blur-md p-3 rounded-xl border border-slate-100/50">
               <span className="flex items-center gap-1.5 truncate max-w-[100px]"><MdSchool className="text-blue-600" size={14} /> {task.course?.split('-')[0]}</span>
               <span className="flex items-center gap-1.5"><MdOutlineClass className="text-blue-600" size={14} /> BATCH {task.Batch}</span>
            </div>
         </div>
      </motion.div>
   );
};

export default TaskCard;
