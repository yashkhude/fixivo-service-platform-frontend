import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Search, X, CheckCircle2, Star, MapPin, Briefcase, Clock,
  Send, LogOut, Bell, User, Wrench, ChevronRight, AlertCircle,
  RefreshCw, Calendar, FileText, Info, ShieldAlert, Key, AlertTriangle
} from 'lucide-react';
import { logout } from '../../app/slices/authSlice';
import NotificationBell from '../../components/NotificationBell';
import EmergencyService from '../../components/EmergencyService';


const API_BASE_URL = import.meta.env.VITE_FIXIVO_APP_API_URL;

const SERVICE_TYPES = [
  'Plumber', 'Electrician', 'AC Technician', 'Home Cleaner',
  'Painter', 'Carpenter', 'Appliance Repair'
];

function ProviderCard({ provider, onBook, onViewProfile }) {
  const user = provider.userId;
  const initial = user?.name?.[0]?.toUpperCase() || 'P';

  return (
    <div className="bg-white rounded-[20px] border border-slate-100 p-5 shadow-sm flex flex-col gap-3.5 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(30,64,175,0.1)]">
      <div className="flex items-center gap-3">
        <div className="w-[50px] h-[50px] rounded-xl bg-gradient-to-br from-orange-500 to-blue-700 text-white font-extrabold text-xl flex items-center justify-center shrink-0">{initial}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-[15px] font-bold text-slate-900">{user?.name || 'Provider'}</p>
            {provider.isVerified && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <CheckCircle2 size={11} /> Verified
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            <Briefcase size={12} style={{ display: 'inline', marginRight: 4 }} />
            {provider.serviceType || 'General Services'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5">
        <div className="flex items-center gap-1 text-xs text-slate-600 font-medium">
          <Star size={14} color="#F59E0B" />
          <span>{provider.averageRating || '—'}</span>
          <span className="text-slate-400">{provider.reviewCount ? `(${provider.reviewCount})` : ''}</span>
        </div>
        {provider.experience && (
          <div className="flex items-center gap-1 text-xs text-slate-600 font-medium">
            <Clock size={14} color="#6366F1" />
            <span>{provider.experience} Yrs Exp.</span>
          </div>
        )}
      </div>

      {provider.bio && (
        <p className="text-[13px] text-slate-500 leading-relaxed line-clamp-2">{provider.bio}</p>
      )}

      <div className="grid grid-cols-2 gap-2.5 mt-auto">
        <button onClick={() => onViewProfile(provider._id)} className="flex items-center justify-center gap-2 p-3 bg-white border-[1.5px] border-slate-200 text-slate-600 rounded-xl text-sm font-semibold cursor-pointer transition-all hover:border-blue-700 hover:text-blue-700 hover:bg-blue-50">
          <User size={15} />Profile
        </button>
        <button onClick={() => onBook(provider)} className="flex items-center justify-center gap-2 p-3 bg-gradient-to-br from-blue-700 to-blue-500 text-white border-none rounded-xl text-sm font-semibold cursor-pointer transition-all mt-auto hover:from-blue-900 hover:to-blue-700 hover:shadow-[0_4px_14px_rgba(30,64,175,0.25)] hover:-translate-y-px">
          <Send size={15} />Book
        </button>
      </div>
    </div>
  );
}

function ReviewModal({ requestId, provider, onClose, onSuccess }) {
  const { accessToken } = useSelector(s => s.auth);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = accessToken || localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/api/review/submit-review`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requestId, rating, comment })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit review');
      setSuccess(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Rate Service</h2>
            <p className="text-sm text-gray-500 mt-1">How was your experience with {provider?.name || 'the professional'}?</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="p-12 flex flex-col items-center text-center animate-in slide-in-from-bottom-4 duration-500">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 size={40} className="text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
            <p className="text-gray-600">Your feedback helps us maintain high quality service.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="flex flex-col items-center gap-4 py-4">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setRating(num)}
                    className="transition-all duration-200 transform hover:scale-110 active:scale-95"
                  >
                    <Star 
                      size={36} 
                      className={`${num <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-none'}`} 
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm font-semibold text-amber-600 bg-amber-50 px-4 py-1 rounded-full">
                {rating === 5 ? 'Excellent! 🤩' : rating === 4 ? 'Very Good! 😊' : rating === 3 ? 'Good! 🙂' : rating === 2 ? 'Fair 😐' : 'Poor ☹️'}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Write a Review (optional)</label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Share your experience with others…"
                rows={4}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none text-gray-800 placeholder:text-gray-400"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <><RefreshCw className="animate-spin" size={18} /> Submitting…</>
              ) : (
                'Submit Review'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function ProviderProfileModal({ providerId, onClose, onBook }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      setReviewsLoading(true);
      try {
        // Fetch Provider Basic Info
        const res = await fetch(`${API_BASE_URL}/api/customer/provider/${providerId}`);
        if (!res.ok) throw new Error('Failed to fetch provider profile');
        const json = await res.json();
        setData(json);

        // Fetch Provider Reviews separately as per backend logic
        const revRes = await fetch(`${API_BASE_URL}/api/review/provider/${providerId}`);
        if (revRes.ok) {
          const revData = await revRes.json();
          setReviews(revData.reviews || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        setReviewsLoading(false);
      }
    };
    if (providerId) fetchProfileData();
  }, [providerId]);

  if (!providerId) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[4px] z-[200] flex items-center justify-center p-6" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-[600px] max-h-[85vh] overflow-y-auto p-7 shadow-[0_20px_60px_rgba(0,0,0,0.18)]" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-xl font-extrabold text-slate-900">Provider Profile</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-[10px] bg-slate-100 border-none text-slate-500 flex items-center justify-center cursor-pointer shrink-0 hover:bg-red-100 hover:text-red-500"><X size={20} /></button>
        </div>
        {loading ? (
          <div className="flex flex-col items-center justify-center p-10 gap-4">
            <div className="w-10 h-10 border-[3px] border-slate-200 border-t-blue-700 rounded-full animate-spin" />
            <p>Loading profile…</p>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-3.5 py-2.5 rounded-[10px] text-[13px]">
            <AlertCircle size={24} /><p>{error}</p>
          </div>
        ) : data && (
          <div>
            <div className="flex items-center gap-5 mb-6 pb-6 border-b border-slate-100">
              <div className="w-20 h-20 rounded-[20px] bg-gradient-to-br from-blue-700 to-blue-500 text-white text-[32px] font-extrabold flex items-center justify-center shrink-0">{data.provider.name?.[0]?.toUpperCase() || 'P'}</div>
              <div>
                <h3 className="text-[22px] font-extrabold text-slate-900 mb-1">{data.provider.name}</h3>
                <p className="text-[15px] text-slate-500 font-medium mb-3">{data.provider.serviceType}</p>
                <div className="flex gap-2 flex-wrap">
                  {data.provider.isVerified && (<span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"><CheckCircle2 size={12} /> Verified Professional</span>)}
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-500 bg-indigo-50 px-2.5 py-0.5 rounded-full"><Clock size={12} /> {data.provider.experience} Years Experience</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-7">
              <div className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center text-center gap-2"><Star size={20} color="#F59E0B" fill="#F59E0B" /><span className="text-lg font-extrabold text-slate-900">{data.provider.averageRating || 'N/A'}</span><span className="text-[11px] text-slate-400 font-semibold uppercase">Average Rating</span></div>
              <div className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center text-center gap-2"><FileText size={20} color="#6366F1" /><span className="text-lg font-extrabold text-slate-900">{data.provider.reviewCount || 0}</span><span className="text-[11px] text-slate-400 font-semibold uppercase">Total Reviews</span></div>
              <div className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center text-center gap-2"><MapPin size={20} color="#10B981" /><span className="text-lg font-extrabold text-slate-900">Available</span><span className="text-[11px] text-slate-400 font-semibold uppercase">{data.provider.availability || 'Full Time'}</span></div>
            </div>
            <div className="mb-7">
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-[0.05em] mb-4 flex items-center gap-2">Contact Information</h4>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2.5 text-sm text-slate-600"><Bell size={16} className="text-slate-400" /><span>{data.provider.email}</span></div>
                {data.provider.phone && (<div className="flex items-center gap-2.5 text-sm text-slate-600"><CheckCircle2 size={16} className="text-slate-400" /><span>{data.provider.phone}</span></div>)}
              </div>
            </div>
            <div className="mb-7">
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-[0.05em] mb-4 flex items-center gap-2">Customer Reviews ({reviews.length})</h4>
              {reviewsLoading ? (<div className="flex justify-center py-8"><RefreshCw className="animate-spin text-indigo-600" size={24} /></div>
              ) : reviews.length === 0 ? (
                <p className="text-slate-400 text-center py-8 italic bg-slate-50 rounded-xl">No reviews yet for this provider.</p>
              ) : (
                <div className="space-y-4 mt-4">
                  {reviews.map(review => (
                    <div key={review._id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-indigo-100 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs">{review.customerId?.name?.[0]?.toUpperCase() || 'C'}</div>
                          <div><span className="block font-bold text-gray-900 text-sm">{review.customerId?.name || 'Customer'}</span><span className="block text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Verified Client</span></div>
                        </div>
                        <div className="flex gap-0.5">{[...Array(5)].map((_,i)=>(<Star key={i} size={12} className={i<review.rating?'text-amber-400 fill-amber-400':'text-gray-200 fill-none'} />))}</div>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed mb-3 pl-11">{review.comment || 'No comment provided.'}</p>
                      <div className="flex justify-between items-center pl-11 border-t border-gray-100 pt-3">
                        <span className="text-[10px] text-gray-400 flex items-center gap-1"><Calendar size={10} />{new Date(review.createdAt).toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'})}</span>
                        {review.requestId?.serviceType&&(<span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-gray-100 text-gray-500 font-medium italic">Service: {review.requestId.serviceType}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => { onClose(); onBook(data.provider); }} className="w-full p-4 bg-blue-700 text-white border-none rounded-xl font-bold text-base cursor-pointer flex items-center justify-center gap-2.5 transition-all hover:bg-blue-900 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(30,64,175,0.2)]">
              <Send size={18} /> Book This Professional
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function RequestModal({ provider, onClose, onSuccess }) {
  const { accessToken } = useSelector(s => s.auth);
  const [serviceType, setServiceType] = useState(provider.serviceType || '');
  const [details, setDetails] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!serviceType || !details.trim()) {
      setError('Service type and details are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const token = accessToken || localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/api/request/send-request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          providerId: provider._id,
          requestDetails: {
            serviceType,
            details,
            scheduledTime: scheduledTime || null
          }
        })
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to send request');
      setSuccess(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[4px] z-[200] flex items-center justify-center p-6" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-[480px] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.18)]" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Send Service Request</h2>
            <p className="text-[13px] text-slate-500 mt-0.5">To: {provider.userId?.name || 'Provider'}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-[10px] bg-slate-100 border-none text-slate-500 flex items-center justify-center cursor-pointer shrink-0 hover:bg-red-100 hover:text-red-500"><X size={20} /></button>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle2 size={52} color="#10B981" />
            <h3 className="text-xl font-extrabold text-slate-900">Request Sent!</h3>
            <p className="text-sm text-slate-500">Your request has been sent to the provider.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-3.5 py-2.5 rounded-[10px] text-[13px]">
                <AlertCircle size={16} />{error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-gray-700">Service Type *</label>
              <select value={serviceType} onChange={e => setServiceType(e.target.value)} required
                className="px-3.5 py-3 border-[1.5px] border-gray-200 rounded-xl text-sm text-gray-700 bg-white outline-none transition-all focus:border-blue-700 focus:shadow-[0_0_0_3px_rgba(30,64,175,0.08)]">
                <option value="">Select a service type</option>
                {SERVICE_TYPES.map(s => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-gray-700">Request Details *</label>
              <textarea value={details} onChange={e => setDetails(e.target.value)} placeholder="Describe what you need help with…" rows={4} required
                className="px-3.5 py-3 border-[1.5px] border-gray-200 rounded-xl text-sm text-gray-700 bg-white outline-none transition-all resize-y focus:border-blue-700 focus:shadow-[0_0_0_3px_rgba(30,64,175,0.08)]" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-gray-700">
                <Calendar size={14} style={{ display: 'inline', marginRight: 4 }} />
                Preferred Date &amp; Time (optional)
              </label>
              <input type="datetime-local" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)}
                className="px-3.5 py-3 border-[1.5px] border-gray-200 rounded-xl text-sm text-gray-700 bg-white outline-none transition-all focus:border-blue-700 focus:shadow-[0_0_0_3px_rgba(30,64,175,0.08)]" />
            </div>

            <button type="submit" disabled={loading}
              className="flex items-center justify-center gap-2 py-3.5 bg-gradient-to-br from-blue-700 to-blue-500 text-white border-none rounded-xl text-[15px] font-bold cursor-pointer transition-all mt-1 disabled:opacity-65 disabled:cursor-not-allowed hover:from-blue-900 hover:to-blue-700 hover:shadow-[0_4px_16px_rgba(30,64,175,0.3)]">
              {loading ? (
                <><div className="w-[18px] h-[18px] border-[2.5px] border-white/35 border-t-white rounded-full animate-spin" /> Sending…</>
              ) : (
                <><Send size={16} /> Send Request</>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function CustomerDashboard() {
  const { user, accessToken } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedService, setSelectedService] = useState('all');
  const [bookingProvider, setBookingProvider] = useState(null);
  const [viewingProfileId, setViewingProfileId] = useState(null);
  const [ratingRequest, setRatingRequest] = useState(null);
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('customerActiveTab') || 'explore';
  });
  const [myRequests, setMyRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState('');
  
  const [myReviews, setMyReviews] = useState([]);
  const [myReviewsLoading, setMyReviewsLoading] = useState(false);
  const [myReviewsError, setMyReviewsError] = useState('');

  // Save active tab to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('customerActiveTab', activeTab);
  }, [activeTab]);

  const fetchProviders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/customer/verified-providers`);
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to fetch providers');
      const data = await res.json();
      setProviders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRequests = async () => {
    setRequestsLoading(true);
    setRequestsError('');
    try {
      const token = accessToken || localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/api/request/customer-requests-status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to fetch requests');
      const data = await res.json();
      console.log("customer dashboard requests data",data);
      setMyRequests(data.requests || []);
      
    } catch (err) {
      setRequestsError(err.message);
    } finally {
      setRequestsLoading(false);
    }
  };

  const fetchMyReviews = async () => {
    setMyReviewsLoading(true);
    setMyReviewsError('');
    try {
      const token = accessToken || localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/api/review/my-reviews`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to fetch reviews');
      const data = await res.json();
      setMyReviews(data.reviews || []);
    } catch (err) {
      setMyReviewsError(err.message);
    } finally {
      setMyReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'explore') fetchProviders();
    if (activeTab === 'requests') fetchMyRequests();
    if (activeTab === 'reviews') fetchMyReviews();
  }, [accessToken, activeTab]);

  const filtered = providers.filter(p => {
    const name = p.userId?.name?.toLowerCase() || '';
    const svc = p.serviceType?.toLowerCase() || '';
    const q = search.toLowerCase();
    const matchSearch = !q || name.includes(q) || svc.includes(q);
    const matchService = selectedService === 'all' || svc === selectedService.toLowerCase();
    return matchSearch && matchService;
  });

  const serviceTypes = ['all', ...new Set(providers.map(p => p.serviceType).filter(Boolean))];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-[250px] bg-gradient-to-b from-[#0C1445] to-[#1E40AF] flex flex-col fixed inset-y-0 left-0 z-40 py-6">
        <div className="flex items-center gap-2.5 px-6 mb-9">
          <div className="w-9 h-9 bg-white/20 rounded-[10px] flex items-center justify-center">
            <Wrench size={20} color="#fff" />
          </div>
          <span className="text-xl font-extrabold text-white">Fixivo</span>
        </div>

        <nav className="flex-1 px-3 overflow-y-auto">
          <p className="text-[10px] font-bold text-white/40 tracking-[0.12em] uppercase px-3 mb-2">Main Menu</p>
          {[
            { tab: 'explore',   icon: <User size={18} />,          label: 'Find Providers' },
            { tab: 'requests',  icon: <FileText size={18} />,       label: 'My Requests' },
            { tab: 'emergency', icon: <AlertTriangle size={18} />,  label: 'Emergency' },
            { tab: 'reviews',   icon: <Star size={18} />,           label: 'Reviews' },
          ].map(({ tab, icon, label }) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl text-sm mb-0.5 transition-all text-left border-none cursor-pointer
                ${activeTab === tab ? 'bg-white/[0.18] text-white font-semibold' : 'bg-transparent text-white/65 hover:bg-white/10 hover:text-white font-medium'}`}>
              {icon} {label}
            </button>
          ))}
        </nav>

        <div className="px-4 pt-4 border-t border-white/[0.12] flex items-center gap-2.5">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-[10px] bg-white/25 text-white font-bold text-[15px] flex items-center justify-center shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'C'}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-white truncate">{user?.name || 'Customer'}</p>
              <p className="text-[11px] text-white/50">Customer</p>
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
        {/* Topbar */}
        <header className="flex items-start justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-[26px] font-extrabold text-slate-900 leading-tight">
              {activeTab === 'explore' ? 'Find Professionals' : activeTab === 'emergency' ? 'Emergency Service' : activeTab === 'reviews' ? 'My Reviews' : 'My Service Requests'}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {activeTab === 'explore'
                ? `${filtered.length} verified provider${filtered.length !== 1 ? 's' : ''} available`
                : activeTab === 'emergency'
                ? 'Request urgent help from nearby providers'
                : activeTab === 'reviews'
                ? `You have shared ${myReviews.length} review${myReviews.length !== 1 ? 's' : ''}`
                : `${myRequests.length} request${myRequests.length !== 1 ? 's' : ''} total`
              }
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <NotificationBell />
            <button onClick={activeTab === 'explore' ? fetchProviders : fetchMyRequests}
              className="flex items-center gap-1.5 px-[18px] py-2.5 bg-blue-700 text-white border-none rounded-xl text-[13px] font-semibold cursor-pointer transition-colors hover:bg-blue-900">
              <RefreshCw size={16} />Refresh
            </button>
          </div>
        </header>

        {activeTab === 'emergency' ? (
          <EmergencyService />
        ) : activeTab === 'explore' ? (
          <>
            {/* Search & Filter */}
            <div className="mb-4">
              <div className="flex items-center gap-2.5 bg-white border-[1.5px] border-slate-200 rounded-2xl px-4 py-3 transition-all max-w-[500px] focus-within:border-blue-700 focus-within:shadow-[0_0_0_3px_rgba(30,64,175,0.08)]">
                <Search size={18} className="text-slate-400 shrink-0" />
                <input type="text" placeholder="Search by name or service…" value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="flex-1 border-none outline-none text-sm text-slate-600 bg-transparent" />
                {search && (
                  <button onClick={() => setSearch('')} className="text-slate-400 bg-transparent border-none cursor-pointer flex items-center p-0 hover:text-slate-700">
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Service Filter Pills */}
            <div className="flex gap-2 flex-wrap mb-6">
              {serviceTypes.map(s => (
                <button key={s} onClick={() => setSelectedService(s)}
                  className={`py-[7px] px-4 rounded-full text-[13px] font-medium cursor-pointer transition-all whitespace-nowrap border
                    ${selectedService === s ? 'bg-blue-700 border-blue-700 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-700 hover:text-blue-700'}`}>
                  {s === 'all' ? '✨ All Services' : s}
                </button>
              ))}
            </div>

            {/* Providers Grid */}
            <section>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400 text-center">
                  <div className="w-10 h-10 border-[3px] border-slate-200 border-t-blue-700 rounded-full animate-spin" />
                  <p className="text-sm">Loading providers…</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400 text-center">
                  <AlertCircle size={40} color="#EF4444" /><p className="text-sm">{error}</p>
                  <button onClick={fetchProviders} className="mt-2 px-6 py-2.5 bg-blue-700 text-white border-none rounded-[10px] font-semibold cursor-pointer">Try Again</button>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400 text-center">
                  <User size={56} color="#D1D5DB" />
                  <h3 className="text-lg font-bold text-slate-500">No providers found</h3>
                  <p className="text-sm">Try adjusting your search or filter.</p>
                </div>
              ) : (
                <div className="grid gap-[18px]" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))' }}>
                  {filtered.map(provider => (
                    <ProviderCard key={provider._id} provider={provider} onBook={setBookingProvider} onViewProfile={setViewingProfileId} />
                  ))}
                </div>
              )}
            </section>
          </>
        ) : activeTab === 'reviews' ? (
          <section className="p-6">
            {myReviewsLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <RefreshCw className="animate-spin text-indigo-600 mb-4" size={40} />
                <p className="text-gray-500 font-medium">Loading your reviews…</p>
              </div>
            ) : myReviewsError ? (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
                <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                <p className="text-red-800 font-semibold mb-4">{myReviewsError}</p>
                <button onClick={fetchMyReviews} className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors">Try Again</button>
              </div>
            ) : myReviews.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-200 rounded-3xl p-20 text-center shadow-sm">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6"><Star size={40} className="text-gray-300" /></div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No reviews shared yet</h3>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">Your feedback helps providers improve and helps other customers make better choices.</p>
                <button onClick={() => setActiveTab('requests')} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">Go to Completed Requests</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myReviews.map(review => (
                  <div key={review._id} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-inner group-hover:rotate-3 transition-transform">
                          {review.providerId?.name?.[0]?.toUpperCase() || 'P'}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{review.providerId?.name || 'Provider'}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{review.requestId?.serviceType || 'Service'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-0.5 bg-amber-50 p-1.5 rounded-xl">
                        {[...Array(5)].map((_, i) => (<Star key={i} size={14} className={i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-none'} />))}
                      </div>
                    </div>
                    <div className="bg-gray-50/50 rounded-2xl p-4 mb-4 min-h-[80px]">
                      <p className="text-gray-600 text-sm italic leading-relaxed">"{review.comment || 'You didn\'t leave a written comment for this service.'}"</p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                      <div className="flex items-center gap-1.5"><Calendar size={12} />{new Date(review.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      <div className="flex items-center gap-1.5 text-indigo-500"><CheckCircle2 size={12} />Verified Review</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : (
          /* My Requests Tab */
          <section className="mt-1">
            {requestsLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400 text-center">
                <div className="w-10 h-10 border-[3px] border-slate-200 border-t-blue-700 rounded-full animate-spin" />
                <p className="text-sm">Fetching your requests…</p>
              </div>
            ) : requestsError ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400 text-center">
                <AlertCircle size={40} color="#EF4444" /><p className="text-sm">{requestsError}</p>
                <button onClick={fetchMyRequests} className="mt-2 px-6 py-2.5 bg-blue-700 text-white border-none rounded-[10px] font-semibold cursor-pointer">Try Again</button>
              </div>
            ) : myRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400 text-center">
                <FileText size={56} color="#D1D5DB" />
                <h3 className="text-lg font-bold text-slate-500">No requests yet</h3>
                <p className="text-sm">Start by finding a professional to help you.</p>
                <button onClick={() => setActiveTab('explore')} className="mt-2 px-6 py-2.5 bg-blue-700 text-white border-none rounded-[10px] font-semibold cursor-pointer">Explore Providers</button>
              </div>
            ) : (
              <div className="flex flex-col gap-4 max-w-[900px]">
                {myRequests.map(req => {
                  const statusColors = {
                    pending:   'bg-amber-100 text-amber-800',
                    accepted:  'bg-blue-100 text-blue-700',
                    completed: 'bg-emerald-100 text-emerald-800',
                    cancelled: 'bg-red-100 text-red-800',
                  };
                  return (
                    <div key={req._id} className="bg-white rounded-2xl border border-slate-200 p-5 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-blue-700 hover:shadow-[0_8px_16px_rgba(0,0,0,0.06)]">
                      <div className="flex items-center justify-between mb-4 gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center font-bold text-lg shrink-0">
                            {req.providerId?.name?.[0]?.toUpperCase() || 'P'}
                          </div>
                          <div>
                            <p className="text-[15px] font-bold text-slate-900">{req.providerId?.name || 'Unknown Provider'}</p>
                            <p className="text-xs text-slate-500 font-medium">{req.requestDetails?.serviceType || 'General Service'}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.05em] ${statusColors[req.status?.toLowerCase()] || 'bg-slate-100 text-slate-600'}`}>
                          {req.status}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2.5 p-4 bg-slate-50 rounded-xl mb-4 border border-slate-100">
                        <div className="flex items-start gap-2.5 text-slate-600 text-[13px]">
                          <Info size={14} className="text-slate-400 mt-0.5 shrink-0" /><p>{req.requestDetails?.details}</p>
                        </div>
                        {req.requestDetails?.scheduledTime && (
                          <div className="flex items-start gap-2.5 text-slate-600 text-[13px]">
                            <Clock size={14} className="text-slate-400 mt-0.5 shrink-0" />
                            <span>Scheduled: {new Date(req.requestDetails.scheduledTime).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                          </div>
                        )}
                        <div className="flex items-start gap-2.5 text-slate-600 text-[13px]">
                          <Calendar size={14} className="text-slate-400 mt-0.5 shrink-0" />
                          <span>Created: {(req.createdAt || req.updatedAt) ? new Date(req.createdAt || req.updatedAt).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </div>

                      {req.otp && req.status !== 'completed' && (
                        <div className="bg-blue-50 border-[1.5px] border-dashed border-blue-400 rounded-xl p-4 my-4 text-center">
                          <div className="flex items-center justify-center gap-1.5 text-blue-800 text-[11px] font-extrabold uppercase mb-2.5">
                            <ShieldAlert size={14} /><span>Completion OTP</span>
                          </div>
                          <div className="text-[28px] font-extrabold text-blue-800 tracking-[0.2em] mb-2">{req.otp}</div>
                          <p className="text-[11px] text-slate-500 font-medium max-w-[200px] mx-auto">Share this code with the provider only when the work is done.</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-4">
                        <div className="text-xs text-slate-500">
                          {req.providerId?.phone && (<p className="mb-0.5"><span className="font-semibold text-slate-600">Phone:</span> {req.providerId.phone}</p>)}
                          {req.providerId?.email && (<p><span className="font-semibold text-slate-600">Email:</span> {req.providerId.email}</p>)}
                        </div>
                        <div className="flex gap-2.5 items-center">
                          {!req.hasBeenReviewed && req.status === 'completed' && (
                            <button onClick={() => setRatingRequest(req)}
                              className="flex items-center gap-1.5 px-4 py-2 bg-orange-50 border border-orange-100 text-orange-600 rounded-[10px] text-[13px] font-semibold cursor-pointer transition-all hover:bg-amber-500 hover:border-amber-500 hover:text-white hover:shadow-[0_4px_12px_rgba(245,158,11,0.2)]">
                              <Star size={14} /> Rate Service
                            </button>
                          )}
                          <button className="flex items-center gap-1.5 bg-transparent border-[1.5px] border-slate-200 px-4 py-2 rounded-[10px] text-[13px] font-semibold text-slate-600 cursor-pointer transition-all hover:bg-slate-100 hover:border-slate-300 hover:text-slate-900">
                            View Details <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>

      {bookingProvider && (
        <RequestModal provider={bookingProvider} onClose={() => setBookingProvider(null)}
          onSuccess={() => { fetchMyRequests(); fetchProviders(); }} />
      )}
      {viewingProfileId && (
        <ProviderProfileModal providerId={viewingProfileId} onClose={() => setViewingProfileId(null)} onBook={setBookingProvider} />
      )}
      {ratingRequest && (
        <ReviewModal requestId={ratingRequest._id} provider={ratingRequest.providerId}
          onClose={() => setRatingRequest(null)}
          onSuccess={() => { fetchMyRequests(); fetchProviders(); }} />
      )}
    </div>
  );
}
