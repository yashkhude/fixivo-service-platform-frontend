import { useState, useEffect } from 'react';
import ProviderDetails from '../../components/ProviderDetails';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList, Clock, CheckCircle2, XCircle, AlertCircle,
  User, Wrench, Calendar, RefreshCw, LogOut, ChevronRight,
  TrendingUp, Star, Briefcase, Shield, AlertTriangle
} from 'lucide-react';
import { logout } from '../../app/slices/authSlice';
import NotificationBell from '../../components/NotificationBell';
import EmergencyRequests from '../Tabs/EmergencyRequests';

const API_BASE_URL = import.meta.env.VITE_FIXIVO_APP_API_URL;

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: '#F59E0B', bg: '#FFFBEB', icon: Clock },
  accepted:  { label: 'Accepted',  color: '#10B981', bg: '#ECFDF5', icon: CheckCircle2 },
  rejected:  { label: 'Rejected',  color: '#EF4444', bg: '#FEF2F2', icon: XCircle },
  completed: { label: 'Completed', color: '#6366F1', bg: '#EEF2FF', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: '#6B7280', bg: '#F9FAFB', icon: XCircle },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      <Icon size={12} />{cfg.label}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="bg-white rounded-2xl p-5 flex items-center gap-3.5 shadow-sm border border-slate-100 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div>
        <p className="text-[28px] font-extrabold text-slate-900 leading-none">{value}</p>
        <p className="text-xs text-slate-400 mt-1 font-medium">{label}</p>
      </div>
    </div>
  );
}

export default function ProviderDashboard() {
  const { user, provider, accessToken } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState(() => localStorage.getItem('providerFilterTab') || 'all');
  const [confirmRejectId, setConfirmRejectId] = useState(null);
  const [viewRequestId, setViewRequestId] = useState(null);
  const [activeTab, setActiveTab] = useState('requests');

  useEffect(() => { localStorage.setItem('providerFilterTab', filter); }, [filter]);

  useEffect(() => {
    if (!provider?.isVerified) navigate('/dashboard', { replace: true });
  }, [provider?.isVerified, navigate]);

  const fetchRequests = async () => {
    setLoading(true); setError('');
    try {
      const token = accessToken || localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/api/request/see-requests-inside-provider-dashboard`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to fetch requests');
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleAcceptRequest = async (requestId) => {
    if (!provider?.isVerified) { alert('Please complete your profile first.'); navigate('/dashboard'); return; }
    setLoading(true);
    try {
      const token = accessToken || localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/api/request/accept-request/${requestId}`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId })
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to accept');
      await fetchRequests();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleRejectRequest = async (requestId) => {
    setLoading(true);
    try {
      const token = accessToken || localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/api/request/reject-request/${requestId}`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId })
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to reject');
      await fetchRequests();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRequests(); }, []);

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    accepted: requests.filter(r => r.status === 'accepted').length,
    completed: requests.filter(r => r.status === 'completed').length,
  };
  const handleLogout = () => { dispatch(logout()); navigate('/login'); };

  const NavBtn = ({ tab, icon, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl text-sm mb-0.5 transition-all text-left border-none cursor-pointer
        ${activeTab === tab ? 'bg-white/[0.18] text-white font-semibold' : 'bg-transparent text-white/65 hover:bg-white/10 hover:text-white font-medium'}`}
    >
      {icon}{label}
    </button>
  );

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-[250px] bg-gradient-to-b from-[#1E3A8A] to-[#1E40AF] flex flex-col fixed inset-y-0 left-0 z-40 py-6">
        <div className="flex items-center gap-2.5 px-6 mb-9">
          <div className="w-9 h-9 bg-white/20 rounded-[10px] flex items-center justify-center">
            <Wrench size={20} color="#fff" />
          </div>
          <span className="text-xl font-extrabold text-white">Fixivo</span>
        </div>

        <nav className="flex-1 px-3 overflow-y-auto">
          <div className="mb-6">
            <p className="text-[10px] font-bold text-white/45 tracking-[0.12em] uppercase px-3 mb-2">Overview</p>
            <NavBtn tab="requests"    icon={<ClipboardList size={18} />} label="My Requests" />
            <NavBtn tab="emergencies" icon={<AlertTriangle size={18} className={activeTab !== 'emergencies' ? 'text-red-400' : ''} />} label="Emergency Requests" />
            <NavBtn tab="analytics"   icon={<TrendingUp size={18} />}    label="Analytics" />
            <NavBtn tab="reviews"     icon={<Star size={18} />}          label="Reviews" />
            <NavBtn tab="services"    icon={<Briefcase size={18} />}     label="My Services" />
          </div>
        </nav>

        <div className="px-4 pt-4 border-t border-white/[0.12] flex items-center gap-2.5">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-[10px] bg-white/25 text-white font-bold text-[15px] flex items-center justify-center shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'P'}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-white truncate">{user?.name || 'Provider'}</p>
              <p className="text-[11px] text-white/50">Service Provider</p>
            </div>
          </div>
          <button onClick={handleLogout} title="Logout"
            className="w-[34px] h-[34px] bg-white/[0.12] border-none rounded-[10px] text-white/70 flex items-center justify-center cursor-pointer transition-all shrink-0 hover:bg-red-500/25 hover:text-red-300">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-[250px] flex-1 p-8 overflow-y-auto">
        <header className="flex items-start justify-between mb-7 flex-wrap gap-3">
          <div>
            <h1 className="text-[26px] font-extrabold text-slate-900 leading-tight">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-0.5">Welcome back, {user?.name || 'Provider'}! 👋</p>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
              <Shield size={18} className="text-green-600" />
              <span className="text-sm font-semibold text-green-700">Profile Verified</span>
            </div>
            <NotificationBell />
            <button onClick={fetchRequests}
              className="flex items-center gap-1.5 px-[18px] py-2.5 bg-blue-700 text-white border-none rounded-xl text-[13px] font-semibold cursor-pointer transition-colors hover:bg-blue-900">
              <RefreshCw size={16} />Refresh
            </button>
          </div>
        </header>

        {activeTab === 'requests' && (
          <>
            <section className="grid grid-cols-4 gap-4 mb-7">
              <StatCard icon={ClipboardList} label="Total Requests" value={stats.total}     color="#6366F1" bg="#EEF2FF" />
              <StatCard icon={Clock}         label="Pending"        value={stats.pending}   color="#F59E0B" bg="#FFFBEB" />
              <StatCard icon={CheckCircle2}  label="Accepted"       value={stats.accepted}  color="#10B981" bg="#ECFDF5" />
              <StatCard icon={Star}          label="Completed"      value={stats.completed} color="#F97316" bg="#FFF7ED" />
            </section>

            <div className="flex gap-2 mb-6 flex-wrap">
              {['all', 'pending', 'accepted', 'completed', 'rejected'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`flex items-center gap-1.5 px-[18px] py-2 rounded-[10px] text-[13px] font-medium cursor-pointer transition-all border
                    ${filter === f ? 'bg-blue-700 border-blue-700 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-700 hover:text-blue-700'}`}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                  {f !== 'all' && requests.filter(r => r.status === f).length > 0 && (
                    <span className={`text-[11px] font-bold px-[7px] py-0.5 rounded-full min-w-[20px] text-center
                      ${filter === f ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {requests.filter(r => r.status === f).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <section>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400 text-center">
                  <div className="w-10 h-10 border-[3px] border-slate-200 border-t-blue-700 rounded-full animate-spin" />
                  <p className="text-sm">Loading your requests…</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400 text-center">
                  <AlertCircle size={40} color="#EF4444" /><p className="text-sm">{error}</p>
                  <button onClick={fetchRequests} className="mt-2 px-6 py-2.5 bg-blue-700 text-white border-none rounded-[10px] font-semibold cursor-pointer">Try Again</button>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400 text-center">
                  <ClipboardList size={56} color="#D1D5DB" />
                  <h3 className="text-lg font-bold text-slate-500">No requests yet</h3>
                  <p className="text-sm">When customers send you service requests, they'll appear here.</p>
                </div>
              ) : (
                <div className="grid gap-[18px]" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))' }}>
                  {filtered.map(req => {
                    const customer = req.customerId;
                    const scheduledDate = req.scheduledTime
                      ? new Date(req.scheduledTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                      : null;
                    return (
                      <div key={req._id} className="bg-white rounded-[18px] border border-slate-100 p-5 shadow-sm flex flex-col gap-3.5 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(30,64,175,0.08)]">
                        <div className="flex items-center gap-3">
                          <div className="w-[42px] h-[42px] rounded-xl bg-gradient-to-br from-indigo-500 to-blue-700 text-white font-bold text-base flex items-center justify-center shrink-0">
                            {customer?.name?.[0]?.toUpperCase() || <User size={20} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900">{customer?.name || 'Customer'}</p>
                            <p className="text-xs text-slate-400 truncate">{customer?.email || ''}</p>
                          </div>
                          <StatusBadge status={req.status} />
                        </div>
                        <div className="flex flex-col gap-2.5">
                          <div className="flex items-start gap-2.5">
                            <Wrench size={15} className="text-slate-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-[0.08em]">Service</p>
                              <p className="text-[13px] text-slate-600 font-medium">{req.serviceType}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <AlertCircle size={15} className="text-slate-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-[0.08em]">Details</p>
                              <p className="text-[13px] text-slate-600 font-medium">{req.details}</p>
                            </div>
                          </div>
                          {scheduledDate && (
                            <div className="flex items-start gap-2.5">
                              <Calendar size={15} className="text-slate-400 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-[0.08em]">Scheduled</p>
                                <p className="text-[13px] text-slate-600 font-medium">{scheduledDate}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-slate-50 mt-1">
                          <span className="text-xs text-slate-400">
                            {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                          <div className="flex gap-2">
                            {req.status === 'pending' ? (
                              <>
                                <button onClick={() => handleAcceptRequest(req._id)}
                                  className="px-4 py-2 rounded-[10px] text-[13px] font-bold cursor-pointer bg-blue-700 text-white border-none transition-all hover:bg-blue-900 hover:shadow-[0_4px_12px_rgba(30,64,175,0.2)]">
                                  Accept
                                </button>
                                <button onClick={() => setConfirmRejectId(req._id)}
                                  className="px-4 py-2 rounded-[10px] text-[13px] font-bold cursor-pointer bg-red-50 text-red-500 border-none transition-all hover:bg-red-500 hover:text-white">
                                  Reject
                                </button>
                              </>
                            ) : (
                              <button onClick={() => setViewRequestId(req._id)}
                                className="flex items-center gap-1 text-[13px] font-semibold text-blue-700 bg-blue-50 border-none rounded-lg px-3 py-1.5 cursor-pointer transition-all hover:bg-blue-700 hover:text-white">
                                View Details <ChevronRight size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === 'emergencies' && <EmergencyRequests />}

        {activeTab === 'analytics' && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400 text-center">
            <TrendingUp size={56} color="#D1D5DB" />
            <h3 className="text-lg font-bold text-slate-500">Analytics coming soon</h3>
            <p className="text-sm">We are working on bringing you detailed insights into your performance.</p>
          </div>
        )}
        {activeTab === 'reviews' && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400 text-center">
            <Star size={56} color="#D1D5DB" />
            <h3 className="text-lg font-bold text-slate-500">Reviews coming soon</h3>
            <p className="text-sm">See what your customers are saying about your services.</p>
          </div>
        )}
        {activeTab === 'services' && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400 text-center">
            <Briefcase size={56} color="#D1D5DB" />
            <h3 className="text-lg font-bold text-slate-500">Service Management coming soon</h3>
            <p className="text-sm">Update your offerings and pricing here.</p>
          </div>
        )}
      </main>

      {confirmRejectId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[4px] z-[200] flex items-center justify-center p-6"
          onClick={() => setConfirmRejectId(null)}>
          <div className="bg-white rounded-3xl w-full max-w-[480px] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
            onClick={e => e.stopPropagation()}>
            <div className="mb-6">
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
                <AlertCircle size={24} color="#EF4444" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">Reject Request?</h2>
              <p className="text-[13px] text-slate-500 mt-0.5">This action cannot be undone. The customer will be notified.</p>
            </div>
            <div className="flex gap-3 mt-8">
              <button className="flex-1 py-3 rounded-xl bg-slate-100 border-none font-semibold text-slate-500 cursor-pointer transition-all hover:bg-slate-200 hover:text-slate-700"
                onClick={() => setConfirmRejectId(null)}>Cancel</button>
              <button className="flex-[1.5] py-3 rounded-xl border-none font-bold text-white cursor-pointer bg-red-500 transition-all hover:bg-red-600 hover:shadow-[0_4px_12px_rgba(239,68,68,0.25)]"
                onClick={() => { handleRejectRequest(confirmRejectId); setConfirmRejectId(null); }}>Yes, Reject</button>
            </div>
          </div>
        </div>
      )}

      {viewRequestId && (
        <ProviderDetails requestId={viewRequestId} onClose={() => setViewRequestId(null)}
          onSuccess={() => { setViewRequestId(null); fetchRequests(); }} />
      )}
    </div>
  );
}
