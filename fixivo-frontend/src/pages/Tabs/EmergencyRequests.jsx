import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  AlertCircle, Clock, CheckCircle2, XCircle,
  User, Phone, MapPin, Calendar, Wrench, RefreshCw,
  ChevronRight, AlertTriangle, History, Inbox
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_FIXIVO_APP_API_URL || 'https://fixivo-service-platform-backend.onrender.com';

export default function EmergencyRequests() {
  const { accessToken } = useSelector(s => s.auth);
  const [emergencies, setEmergencies] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('pending'); // 'pending' or 'history'

  const fetchEmergencies = async () => {
    setLoading(true);
    setError('');
    try {
      const token = accessToken || localStorage.getItem('accessToken');

      // Fetch Pending
      const pendingRes = await fetch(`${API_BASE_URL}/api/provider/emergencies/assigned`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const pendingResult = await pendingRes.json();
      if (!pendingRes.ok) throw new Error(pendingResult.message || 'Failed to fetch pending requests');
      setEmergencies(pendingResult.data || []);

      // Fetch History (Assuming a history endpoint exists or using a similar query)
      try {
        const historyRes = await fetch(`${API_BASE_URL}/api/provider/emergencies/history`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const historyResult = await historyRes.json();
        console.log(historyResult)
        if (historyRes.ok) {
          setHistory(historyResult.data || []);
        }
      } catch (err) {
        console.warn("History endpoint not found, fallback to empty", err);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (emergencyId, action) => {
    setProcessingId(emergencyId);
    try {
      const token = accessToken || localStorage.getItem('accessToken');
      const endpoint = action === 'accept' ? 'accept' : 'reject';

      const res = await fetch(`${API_BASE_URL}/api/provider/emergencies/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ emergencyId })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || `Failed to ${action} request`);

      // Refresh list
      fetchEmergencies();
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    fetchEmergencies();
  }, []);

  const currentData = activeSubTab === 'pending' ? emergencies : history;

  return (
    <div className="emergency-requests-page">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={28} />
            Emergency Center
          </h2>
          <p className="text-sm text-slate-500 font-medium">Manage and track urgent service requests</p>
        </div>

        {/* Sub-tabs */}
        <div className="flex bg-slate-100 p-1 rounded-2xl w-fit">
          <button
            onClick={() => setActiveSubTab('pending')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeSubTab === 'pending'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            <Inbox size={18} />
            New Requests
            {emergencies.length > 0 && (
              <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {emergencies.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeSubTab === 'history'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            <History size={18} />
            My Responses
          </button>
        </div>

        <button
          onClick={fetchEmergencies}
          className="provider-refresh-btn !rounded-xl"
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading && currentData.length === 0 ? (
        <div className="provider-loading">
          <div className="provider-spinner" />
          <p className="font-medium text-slate-500">Updating emergency feed...</p>
        </div>
      ) : error && activeSubTab === 'pending' ? (
        <div className="provider-error bg-white p-12 rounded-3xl border border-red-100 shadow-sm">
          <AlertCircle size={48} className="text-red-500 mb-4" />
          <h3 className="text-lg font-bold text-slate-800">Connection Error</h3>
          <p className="text-slate-500 mb-6">{error}</p>
          <button onClick={fetchEmergencies} className="provider-retry-btn">Try Again</button>
        </div>
      ) : currentData.length === 0 ? (
        <div className="provider-empty bg-white p-16 rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            {activeSubTab === 'pending' ? (
              <Inbox size={40} className="text-slate-300" />
            ) : (
              <History size={40} className="text-slate-300" />
            )}
          </div>
          <h3 className="text-xl font-bold text-slate-800">
            {activeSubTab === 'pending' ? 'All Clear!' : 'No History Yet'}
          </h3>
          <p className="text-slate-500 max-w-xs mx-auto">
            {activeSubTab === 'pending'
              ? "There are no new emergency requests right now. We'll alert you when help is needed!"
              : "You haven't responded to any emergency requests yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {currentData.map((req) => {
            const myStatus = req.providerStatus || req.status || 'processed';
            return (
              <div key={req._id} className={`group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${activeSubTab === 'pending' ? 'border-l-4 border-l-red-500' :
                  myStatus === 'accepted' ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-slate-300'
                }`}>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black ${activeSubTab === 'pending' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-600'
                      }`}>
                      {req.customerId?.name?.[0]?.toUpperCase() || <User size={20} />}
                    </div>
                    <div>
                      <p className="text-base font-bold text-slate-800 leading-tight">{req.customerId?.name || 'Customer'}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                        {req.customerId?.phone ? (
                          <><Phone size={10} /> {req.customerId.phone}</>
                        ) : req.customerId?.email ? (
                          <span className="truncate">{req.customerId.email}</span>
                        ) : (
                          'Private Member'
                        )}
                      </p>
                    </div>
                  </div>
                  {activeSubTab === 'history' && (
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${myStatus === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                      {myStatus}
                    </span>
                  )}
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex gap-3">
                    <div className="p-2 bg-slate-50 rounded-xl h-fit text-slate-400"><Wrench size={16} /></div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Service</p>
                      <p className="text-sm font-bold text-slate-700">{req.serviceType || 'Emergency'}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="p-2 bg-slate-50 rounded-xl h-fit text-slate-400"><AlertCircle size={16} /></div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</p>
                      <p className="text-sm font-medium text-slate-600 line-clamp-2">{req.description || req.details || 'Urgent assistance required.'}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="p-2 bg-slate-50 rounded-xl h-fit text-slate-400"><Clock size={16} /></div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time</p>
                      <p className="text-sm font-bold text-slate-700">
                        {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        <span className="ml-2 font-medium text-slate-400 text-xs">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {activeSubTab === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t border-slate-50">
                    <button
                      onClick={() => handleAction(req._id, 'accept')}
                      disabled={processingId === req._id}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-2xl transition-all shadow-lg shadow-red-100 active:scale-95 disabled:opacity-50"
                    >
                      {processingId === req._id ? 'Processing...' : 'Accept'}
                    </button>
                    <button
                      onClick={() => handleAction(req._id, 'reject')}
                      disabled={processingId === req._id}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-2xl transition-all active:scale-95 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .emergency-requests-page {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
