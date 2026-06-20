const fs = require('fs');
const path = "c:/Users/acer/OneDrive/Desktop/Task Management App/Taskmanagement-Teachers/src/pages/reports/Reports.jsx";
let content = fs.readFileSync(path, 'utf8');

// Find the start of the table and the end of the broken tbody
const tableStart = content.indexOf('<table className="w-full text-left">');
const registryStart = content.indexOf("{activeTab === 'registry' && (");

if (tableStart !== -1 && registryStart !== -1) {
    const newTable = `<table className="w-full text-left">
                        <thead>
                           <tr className="bg-slate-50/30 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100">
                              <th className="px-12 py-7">Student Identity</th>
                              <th className="px-10 py-7 text-center">History Archive</th>
                              <th className="px-10 py-7 text-center">Score Index</th>
                              <th className="px-10 py-7 text-center">Outcome</th>
                              <th className="px-12 py-7 text-right">Actions</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                           {groupedReports.filter(g => g.student?.fullName.toLowerCase().includes(search.toLowerCase())).map((g, idx) => (
                              <tr key={g.student?._id || idx} onClick={() => handleOpenDetail(g)} className="hover:bg-indigo-50/40 transition-all group cursor-pointer">
                                 <td className="px-12 py-6">
                                    <div className="flex items-center gap-5">
                                       <div className="w-14 h-14 rounded-[22px] bg-white overflow-hidden ring-4 ring-slate-50 shadow-sm group-hover:ring-indigo-100 transition-all shrink-0">
                                          <img src={g.student?.profileImage ? \`http://localhost:7001/\${g.student.profileImage.replace(/\\\\/g, '/')}\` : \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${g.student?.fullName}\`} className="w-full h-full object-cover" />
                                       </div>
                                       <div className="min-w-0">
                                          <p className="text-base font-black text-slate-800 leading-tight mb-1 group-hover:text-indigo-600 transition-colors truncate font-display text-slate-800">{g.student?.fullName}</p>
                                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{g.student?.studentId}</p>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-10 py-6 text-center text-sm font-black text-slate-700">
                                    {g.allReports.length} {g.allReports.length === 1 ? 'Record' : 'Records'}
                                 </td>
                                 <td className="px-10 py-6 text-center">
                                    <div className="flex flex-col items-center">
                                       <span className="text-sm font-black text-slate-800 font-display">{g.latestReport.averageTestMarks?.toFixed(0) || 0}%</span>
                                       <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-2.5 overflow-hidden shadow-inner"><div className="h-full bg-indigo-500 rounded-full" style={{width:\`\${g.latestReport.averageTestMarks || 0}%\`}}/></div>
                                    </div>
                                 </td>
                                 <td className="px-10 py-6 text-center">
                                    <span className={\`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest \${g.latestReport.overallPerformance === 'Excellent' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400 border border-slate-200/50'}\`}>{g.latestReport.overallPerformance}</span>
                                 </td>
                                 <td className="px-12 py-6 text-right space-x-2" onClick={e=>e.stopPropagation()}>
                                    <button onClick={() => handleOpenDetail(g)} className="p-3 bg-white text-slate-400 hover:text-indigo-600 rounded-xl shadow-sm border border-slate-100 transition-all hover:scale-110" title="View Full History"><MdVisibility size={20}/></button>
                                    <button onClick={() => handleDelete(g.latestReport._id)} className="p-3 bg-white text-slate-400 hover:text-rose-600 rounded-xl shadow-sm border border-slate-100 transition-all hover:scale-110" title="Purge Record"><MdDeleteOutline size={20}/></button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            </motion.div>
         )}

         {/* ── STUDENT STREAM ENGINE ──`;

    const prefix = content.substring(0, tableStart);
    const suffix = content.substring(registryStart);

    fs.writeFileSync(path, prefix + newTable + suffix);
    console.log("File fixed successfully!");
} else {
    console.log("Failed to find markers.");
}
