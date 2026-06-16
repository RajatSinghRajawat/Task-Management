import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';
import html2pdf from 'html2pdf.js';

const API = 'http://localhost:7001/api/reports/my-reports';

const MyReport = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    const token = localStorage.getItem('studentToken');
    if (!token) return;

    try {
      const res = await fetch(API, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to load reports");

      setReports(data.reports || []);
      if (data.reports?.length > 0) {
        setSelectedReport(data.reports[0]);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  if (loading) {
    return (
      <div className="p-8 space-y-8 animate-pulse bg-slate-50 min-h-screen">
        <div className="h-10 bg-slate-200 w-1/4 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-white rounded-3xl" />)}
        </div>
        <div className="h-96 bg-white rounded-3xl" />
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
        <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center shadow-xl mb-8 text-slate-200">
          <FileText size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">No Reports Published</h2>
        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-3">Your academic record is awaiting validation.</p>
      </div>
    );
  }

  const report = selectedReport || reports[0];
  const student = JSON.parse(localStorage.getItem('studentData') || '{}');

  const handleDownload = () => {
    const element = document.getElementById('final-pdf-content');
    if (!element) return;

    const opt = {
      margin: 0,
      filename: `Report_${student.fullName || 'Student'}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          // Remove all external styles/links to prevent 'oklch' parsing errors.
          // The template uses inline styles so it won't be affected.
          const styles = clonedDoc.getElementsByTagName('style');
          const links = clonedDoc.getElementsByTagName('link');
          for (let i = styles.length - 1; i >= 0; i--) styles[i].remove();
          for (let i = links.length - 1; i >= 0; i--) links[i].remove();
        }
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    toast.loading('Generating Official PDF...', { id: 'pdf-toast' });

    html2pdf().set(opt).from(element).save().then(() => {
      toast.success('Downloaded!', { id: 'pdf-toast' });
    }).catch(err => {
      console.error('Student PDF Error:', err);
      toast.error(`Error: ${err.message || 'Check console'}. Use Print button.`);
    });
  };

  return (
    <>
      <div className="relative w-full overflow-hidden bg-slate-50">
        <Toaster position="top-right" />

        {/* 🛑 PDF DESIGN (BLUE & BLACK THEME) */}
        <style>
          {`
          #final-pdf-content { background: white; }
          @media print {
            body * { visibility: hidden; }
            #final-pdf-content, #final-pdf-content * { visibility: visible !important; }
            #final-pdf-content { 
              position: absolute; 
              left: 0; 
              top: 0; 
              width: 100% !important; 
              margin: 0 !important; 
              padding: 0 !important; 
              display: block !important; 
            }
          }
        `}
        </style>



        {/* WEB UI */}
        <div className="mx-auto max-w-7xl p-4 sm:p-8 lg:p-10 space-y-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-1">My Academic Report</h1>
              <p className="text-slate-500 font-semibold text-xs tracking-wide uppercase">Official performance insights and published results</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={handleDownload} className="px-6 py-3 bg-blue-700 text-white rounded-xl font-semibold text-xs uppercase tracking-wide shadow-md flex items-center gap-2 hover:bg-blue-800 transition-all active:scale-95">
                <Download size={18} /> Download PDF
              </button>
              <button onClick={() => window.print()} className="px-6 py-3 bg-white text-slate-900 border border-slate-300 rounded-xl font-semibold text-xs uppercase tracking-wide shadow-sm flex items-center gap-2 hover:bg-slate-100 transition-all active:scale-95">
                <Printer size={18} /> Print Report
              </button>
            </div>
          </div>

          {/* Dashboard View */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-blue-700 text-white flex items-center justify-center shadow-md"><GraduationCap /></div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">{report.reportTitle}</h2>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1">Student: {student.fullName}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="text-center p-6 bg-blue-50 rounded-2xl border border-blue-100">
                    <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-1">Average Score</p>
                    <p className="text-4xl font-extrabold text-blue-700">{Math.round(report.averageTestMarks || 0)}%</p>
                  </div>
                  <div className="text-center p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wide mb-1">Attendance</p>
                    <p className="text-4xl font-extrabold text-emerald-600">{Math.round(report.attendancePercentage || 0)}%</p>
                  </div>
                  <div className="text-center p-6 bg-slate-900 rounded-2xl text-white">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Grade</p>
                    <p className="text-4xl font-extrabold">{report.grade || 'A'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3"><FileText className="text-blue-700" /> Exam Results</h3>
                <div className="space-y-4">
                  {report.tests?.map((test, idx) => (
                    <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center group hover:bg-blue-50 transition-all">
                      <div className="flex items-center gap-5">
                        <div className="w-10 h-10 rounded-xl bg-white text-slate-400 flex items-center justify-center border border-slate-200 group-hover:text-blue-600"><ShieldCheck size={20} /></div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{test.testName}</p>
                          <p className="text-xs font-medium text-slate-500">{new Date(test.date || Date.now()).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900">{test.marksObtained} <span className="text-slate-400">/</span> {test.totalMarks}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-blue-900 p-8 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="relative z-10 space-y-6">
                  <h3 className="text-white text-xl font-bold">Report Actions</h3>
                  <button onClick={handleDownload} className="w-full py-4 bg-white text-blue-900 text-xs font-semibold uppercase tracking-wide rounded-xl shadow-md hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
                    <Download size={18} /> Download PDF
                  </button>
                  <p className="text-blue-200 text-xs font-medium leading-relaxed">Use this file for official submission and academic reference.</p>
                </div>
              </div>

              {report.behavior && (
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Behavior Note</h4>
                  <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                    <p className="text-sm font-medium text-blue-900 italic leading-relaxed">"{report.behavior}"</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div id="pdf-wrapper" style={{ position: 'absolute', left: '-9999px', top: '0', zIndex: -100 }}>
        {/* 🖼️ THE MARKSHEET (BLUE & BLACK DESIGN) */}
        <div id="final-pdf-content" style={{ width: '210mm', padding: '0', background: 'white', color: 'black', fontFamily: 'Arial, sans-serif' }}>
          <div style={{ margin: '15mm', border: '6px double #1e3a8a', padding: '30px', minHeight: '260mm', display: 'flex', flexDirection: 'column', alignItems: 'center', boxSizing: 'border-box' }}>
             
             {/* HEADER (Cleaned) */}
             <div style={{ textAlign: 'center', width: '100%', borderBottom: '3px solid #1e3a8a', paddingBottom: '20px', marginBottom: '30px' }}>
                <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'center' }}>
                   <img src="/logo.png" alt="Logo" onError={(e) => e.target.style.display = 'none'} style={{ height: '80px', width: 'auto' }} />
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Academic Record Archive</div>
             </div>

             {/* STUDENT INFO */}
             <div style={{ textAlign: 'center', width: '100%', background: '#f8fafc', padding: '25px', borderRadius: '15px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
                <p style={{ margin: '0', fontSize: '10px', color: '#1e40af', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Student Dossier</p>
                <h3 style={{ margin: '5px 0', fontSize: '28px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase' }}>{student.fullName || 'STUDENT'}</h3>
                <p style={{ margin: '0', fontSize: '12px', fontWeight: 'bold', color: '#1e40af' }}>REG ID: {student.studentId || 'N/A'}</p>
             </div>

             {/* SUMMARY STATS */}
             <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', width: '100%', marginBottom: '30px' }}>
                <div style={{ flex: 1, border: '2px solid #1e3a8a', padding: '15px', textAlign: 'center', borderRadius: '12px' }}>
                   <div style={{ fontSize: '9px', color: '#1e3a8a', fontWeight: 'bold', textTransform: 'uppercase' }}>Average Score</div>
                   <div style={{ fontSize: '24px', fontWeight: '900', color: '#000' }}>
                      {Math.round(report.averageTestMarks || 0)}%
                   </div>
                </div>
                <div style={{ flex: 1, background: '#1e3a8a', padding: '15px', textAlign: 'center', borderRadius: '12px', color: 'white' }}>
                   <div style={{ fontSize: '9px', color: '#bfdbfe', fontWeight: 'bold', textTransform: 'uppercase' }}>Final Grade</div>
                   <div style={{ fontSize: '24px', fontWeight: '900' }}>
                      {report.grade || 'A'}
                   </div>
                </div>
                <div style={{ flex: 1, border: '2px solid #1e3a8a', padding: '15px', textAlign: 'center', borderRadius: '12px' }}>
                   <div style={{ fontSize: '9px', color: '#1e3a8a', fontWeight: 'bold', textTransform: 'uppercase' }}>Attendance</div>
                   <div style={{ fontSize: '24px', fontWeight: '900', color: '#000' }}>
                      {Math.round(report.attendancePercentage || 0)}%
                   </div>
                </div>
             </div>

             {/* CONDUCT */}
             {report.behavior && (
                <div style={{ width: '100%', marginBottom: '30px', padding: '20px', border: '1px dashed #1e3a8a', borderRadius: '12px', background: '#fcfcfc', textAlign: 'center' }}>
                   <p style={{ margin: '0 0 5px', fontSize: '9px', color: '#1e3a8a', fontWeight: 'bold', textTransform: 'uppercase' }}>Conduct Evaluation</p>
                   <p style={{ margin: '0', fontSize: '14px', fontStyle: 'italic', color: '#1e293b', fontWeight: '600' }}>"{report.behavior}"</p>
                </div>
             )}

             {/* MARKS TABLE */}
             <div style={{ width: '100%', marginBottom: '40px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #1e3a8a' }}>
                   <thead>
                      <tr style={{ background: '#1e3a8a', color: 'white' }}>
                         <th style={{ padding: '12px', fontSize: '11px', textAlign: 'center', border: '1px solid #1e3a8a' }}>DATE</th>
                         <th style={{ padding: '12px', fontSize: '11px', textAlign: 'center', border: '1px solid #1e3a8a' }}>SUBJECT / MODULE</th>
                         <th style={{ padding: '12px', fontSize: '11px', textAlign: 'center', border: '1px solid #1e3a8a' }}>MARKS</th>
                         <th style={{ padding: '12px', fontSize: '11px', textAlign: 'center', border: '1px solid #1e3a8a' }}>PERC.</th>
                      </tr>
                   </thead>
                   <tbody>
                      {report.tests?.map((t, i) => (
                         <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                            <td style={{ padding: '12px', fontSize: '12px', color: '#334155', textAlign: 'center', border: '1px solid #e2e8f0' }}>{new Date(t.date || Date.now()).toLocaleDateString('en-GB')}</td>
                            <td style={{ padding: '12px', fontSize: '12px', fontWeight: 'bold', color: '#1e3a8a', textAlign: 'center', border: '1px solid #e2e8f0', textTransform: 'uppercase' }}>{t.testName}</td>
                            <td style={{ padding: '12px', fontSize: '12px', fontWeight: '600', textAlign: 'center', border: '1px solid #e2e8f0' }}>{t.marksObtained} / {t.totalMarks}</td>
                            <td style={{ padding: '12px', fontSize: '12px', fontWeight: '800', textAlign: 'center', color: '#0f172a', border: '1px solid #e2e8f0' }}>{Math.round((t.marksObtained / t.totalMarks) * 100)}%</td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>

             {/* FOOTER */}
             <div style={{ marginTop: 'auto', width: '100%', textAlign: 'center', borderTop: '1px solid #1e3a8a', paddingTop: '20px' }}>
                <p style={{ margin: '5px 0 0', fontSize: '8px', color: '#94a3b8' }}>Issued: {new Date().toLocaleString()}</p>
             </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyReport;
