import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Bell, X, Check, AlertTriangle, MessageSquare, Star, FileText } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_FIXIVO_APP_API_URL;

const TYPE_CONFIG = {
  emergency: { icon: AlertTriangle, color: '#DC2626', bg: '#FEF2F2', label: 'Emergency' },
  request:   { icon: FileText,      color: '#F59E0B', bg: '#FFFBEB', label: 'Request' },
  message:   { icon: MessageSquare, color: '#3B82F6', bg: '#EFF6FF', label: 'Message' },
  review:    { icon: Star,          color: '#8B5CF6', bg: '#F5F3FF', label: 'Review' },
};

export default function NotificationBell() {
  const { accessToken } = useSelector(s => s.auth);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = accessToken || localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/api/notification`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch notifications');
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error('Notification fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [accessToken]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const markAsRead = async (id) => {
    try {
      const token = accessToken || localStorage.getItem('accessToken');
      await fetch(`${API_BASE_URL}/api/notification/${id}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true, readAt: new Date() } : n)
      );
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="w-[42px] h-[42px] rounded-xl bg-white border border-slate-200 text-slate-500 flex items-center justify-center cursor-pointer relative transition-all hover:bg-slate-50 hover:text-blue-700"
        onClick={() => { setOpen(o => !o); if (!open) fetchNotifications(); }}
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[16px] h-[16px] px-1 bg-red-500 rounded-full border-[1.5px] border-white text-white text-[9px] font-extrabold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-[calc(100%+8px)] right-0 w-[340px] bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-slate-100 z-[100] overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-[0.95rem] text-slate-900">Notifications</h3>
            <button onClick={() => setOpen(false)} className="bg-transparent border-none text-slate-400 cursor-pointer p-1 hover:text-slate-700">
              <X size={16} />
            </button>
          </div>

          <div className="max-h-[380px] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="p-8 flex flex-col items-center justify-center gap-2 text-slate-400 text-sm font-medium">Loading…</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 flex flex-col items-center justify-center gap-2 text-slate-400 text-sm font-medium">
                <Bell size={32} color="#D1D5DB" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => {
                const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.request;
                const Icon = cfg.icon;
                return (
                  <div
                    key={n._id}
                    className={`flex items-start gap-3 p-4 border-b border-slate-50 cursor-pointer transition-colors hover:bg-slate-50 ${n.isRead ? '' : 'bg-blue-50/30'}`}
                    onClick={() => !n.isRead && markAsRead(n._id)}
                  >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: cfg.bg }}>
                      <Icon size={16} style={{ color: cfg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-slate-700 leading-snug mb-1">{n.message}</p>
                      <span className="text-[11px] font-semibold text-slate-400">{timeAgo(n.createdAt)}</span>
                    </div>
                    {!n.isRead && (
                      <div className="w-2 h-2 rounded-full bg-blue-600 mt-1" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
