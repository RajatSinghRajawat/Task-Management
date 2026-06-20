import { useEffect, useState } from 'react';
import { MdNotifications, MdDelete, MdCheckCircle, MdAccessTime, MdInfo, MdSend } from 'react-icons/md';
import { getApiBaseUrl } from '../utils/api';
import toast, { Toaster } from 'react-hot-toast';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Broadcast state
  const [broadcast, setBroadcast] = useState({ target: 'Students', title: '', message: '' });
  const [broadcasting, setBroadcasting] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/notifications`, { headers });
      if (!res.ok) throw new Error("Failed to load notifications stream");
      const json = await res.json();
      setNotifications(json.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load notifications stream");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/notifications/mark-read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error("Mark read operation failed");
      toast.success("All alerts marked as read");
      fetchNotifications();
    } catch (err) {
      console.error(err);
      toast.error("Error updating notifications");
    }
  };

  const handlePurge = async () => {
    if (!window.confirm("Are you sure you want to permanently clear your activity feed?")) return;

    try {
      const token = localStorage.getItem('adminToken');
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/notifications/delete-all`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error("Purge operation failed");
      toast.success("Activity feed cleared");
      fetchNotifications();
    } catch (err) {
      console.error(err);
      toast.error("Error clearing notifications");
    }
  };

  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    setBroadcasting(true);

    try {
      const token = localStorage.getItem('adminToken');
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/notifications/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(broadcast)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Broadcast failed');

      toast.success(data.message || "Announcement broadcasted successfully!");
      setBroadcast({ target: 'Students', title: '', message: '' });
      fetchNotifications();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Error occurred during broadcast');
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Broadcasting & Security Feed</h1>
          <p className="text-slate-400 text-xs mt-0.5">Send global notifications to teachers and students, and monitor logs.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={handleMarkRead}
            disabled={notifications.length === 0}
            className="flex-1 sm:flex-initial flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-black uppercase tracking-wider py-3.5 px-5 rounded-2xl transition-all cursor-pointer disabled:opacity-50"
          >
            <MdCheckCircle size={16} />
            Mark All Read
          </button>
          <button
            onClick={handlePurge}
            disabled={notifications.length === 0}
            className="flex-1 sm:flex-initial flex items-center gap-2 bg-slate-900 text-white hover:bg-red-600 text-xs font-black uppercase tracking-wider py-3.5 px-5 rounded-2xl transition-all cursor-pointer disabled:opacity-50"
          >
            <MdDelete size={16} />
            Purge Stream
          </button>
        </div>
      </div>

      {/* 📢 ANNOUNCEMENT BROADCAST COMPOSER */}
      <div className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-black text-slate-800 tracking-tight">Compose Announcement</h3>
          <p className="text-slate-400 text-xs mt-0.5">Publish global messages directly to all target accounts separately.</p>
        </div>

        <form onSubmit={handleBroadcastSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Title */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Announcement Title</label>
              <input 
                type="text" 
                value={broadcast.title}
                onChange={(e) => setBroadcast({ ...broadcast, title: e.target.value })}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none focus:border-red-500 focus:bg-white transition-all shadow-inner"
                placeholder="e.g. Schedule Maintenance, Holiday notice..."
                required
              />
            </div>

            {/* Target Select */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Target Group</label>
              <select
                value={broadcast.target}
                onChange={(e) => setBroadcast({ ...broadcast, target: e.target.value })}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none cursor-pointer"
              >
                <option value="Students">All Students</option>
                <option value="Teachers">All Teachers</option>
                <option value="All">All Users (Both)</option>
              </select>
            </div>
          </div>

          {/* Message Body */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Announcement message</label>
            <textarea 
              value={broadcast.message}
              onChange={(e) => setBroadcast({ ...broadcast, message: e.target.value })}
              rows={3}
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold rounded-2xl focus:outline-none focus:border-red-500 focus:bg-white transition-all shadow-inner resize-none"
              placeholder="Enter announcement guidelines or message body..."
              required
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={broadcasting}
              className="flex items-center gap-2 py-3.5 px-8 bg-slate-900 text-white hover:bg-red-600 text-xs font-black uppercase tracking-wider rounded-2xl transition-all shadow-md cursor-pointer disabled:opacity-70"
            >
              <MdSend size={16} />
              {broadcasting ? 'Broadcasting...' : 'Broadcast Message'}
            </button>
          </div>
        </form>
      </div>

      {/* Logs feed list */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Activity Stream</h3>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-slate-900"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white p-16 rounded-[32px] border border-slate-100 text-center space-y-3">
            <MdNotifications className="mx-auto text-slate-200" size={48} />
            <p className="text-slate-400 text-sm">Your activity stream is currently empty. No new notifications.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => {
              const isRead = n.isRead;
              return (
                <div 
                  key={n._id}
                  className={`p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                    isRead 
                      ? 'bg-white border-slate-100' 
                      : 'bg-indigo-50/20 border-indigo-100/50 shadow-sm'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                    isRead ? 'bg-slate-300' : 'bg-indigo-600 animate-pulse'
                  }`} />

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="font-bold text-slate-800 text-sm leading-snug">{n.title}</h4>
                      <span className="text-[9px] font-bold text-slate-400 shrink-0">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                      {n.message}
                    </p>

                    <div className="flex items-center gap-2 pt-1 text-[9px] font-bold text-slate-400 uppercase">
                      <MdInfo size={12} />
                      <span>Type: {n.type || 'Alert'}</span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default Notifications;
