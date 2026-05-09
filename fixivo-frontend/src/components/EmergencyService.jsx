import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  AlertTriangle, MapPin, Send, CheckCircle2, X, AlertCircle, Loader,
  Clock, Phone, User, Eye, RefreshCcw, ChevronRight, Wrench
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_FIXIVO_APP_API_URL;

const SERVICE_TYPES = [
  'Plumber', 'Electrician', 'AC Technician', 'Home Cleaner',
  'Painter', 'Carpenter', 'Appliance Repair'
];

export default function EmergencyService() {
  const { accessToken } = useSelector(s => s.auth);

  // Form State
  const [serviceType, setServiceType] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [location, setLocation] = useState(null);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  // Table State
  const [emergencies, setEmergencies] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [viewingDetails, setViewingDetails] = useState(false);

  const fetchEmergencies = async () => {
    setFetching(true);
    setFetchError('');
    try {
      const token = accessToken || localStorage.getItem('accessToken');
      // Using the customer requests status endpoint which might include emergencies, 
      // or a dedicated one if it exists. 
      const res = await fetch(`${API_BASE_URL}/api/request/customer-requests-status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch emergency history');
      const data = await res.json();
      // Relaxed filter: show requests if they are flagged as emergencies, 
      // or show all if we're in this tab and no specific filtering is possible yet.
      const allRequests = data.requests || [];
      const emergencyFiltered = allRequests.filter(r => r.isEmergency || r.type === 'emergency' || r.isEmergencyRequest);

      setEmergencies(emergencyFiltered.length > 0 ? emergencyFiltered : allRequests);
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setFetching(false);
    }
  };

  const fetchStatus = async (emergencyId) => {
    try {
      const token = accessToken || localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/api/customer/emergencies/${emergencyId}/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch status');
      const data = await res.json();
      console.log(data);
      return data.emergency;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const handleViewStatus = async (emergency) => {
    setSelectedEmergency(emergency);
    setViewingDetails(true);
    const updated = await fetchStatus(emergency._id || emergency.id);
    if (updated) {
      setSelectedEmergency(updated);
    }
  };

  useEffect(() => {
    fetchEmergencies();
  }, [accessToken]);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setFormError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setFormError('');
    navigator.geolocation.getCurrentPosition(
       async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const response = await fetch(
             `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await response.json();
          setLocation({
            coordinates: [lng,lat],
            address: data.display_name
          })
        } catch (error) {
            setError("Failed to fetch address");
        } finally {
           setLocating(false);
        }
      },
      (err) => {
        setFormError('Unable to get your location. Please allow location access.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!location) {
      setFormError('Please share your location first.');
      return;
    }
    if (!serviceType) {
      setFormError('Please select a service type.');
      return;
    }

    setLoading(true);
    try {
      const token = accessToken || localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/api/request/emergency-service`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          location,
          description: description.trim(),
          serviceType
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send emergency request');

      setFormSuccess(true);
      setDescription('');
      setServiceType('');
      setLocation(null);
      fetchEmergencies(); // Refresh table
      setTimeout(() => setFormSuccess(false), 3000);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-1 animate-in fade-in duration-500">
      {/* Left Column: Form */}
      <div className="lg:w-1/3 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-fit">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-50 rounded-lg">
            <AlertTriangle size={24} className="text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 leading-tight">Request Emergency</h2>
            <p className="text-xs text-slate-500">Immediate help from nearby providers</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
              <AlertCircle size={16} />
              {formError}
            </div>
          )}

          {formSuccess && (
            <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-xl text-sm border border-green-100">
              <CheckCircle2 size={16} />
              Request sent successfully!
            </div>
          )}

          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Your Location *</label>
            {location ? (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl">
                <MapPin size={16} className="text-green-600" />
                <span className="text-sm text-green-700 font-medium">{location.address || "Location captured"}</span>
                <button
                  type="button"
                  onClick={() => setLocation(null)}
                  className="ml-auto p-1 hover:bg-green-100 rounded-full transition-colors"
                >
                  <X size={14} className="text-green-700" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={getLocation}
                disabled={locating}
                className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all disabled:opacity-50"
              >
                {locating ? (
                  <><Loader size={18} className="animate-spin" /> Locating...</>
                ) : (
                  <><MapPin size={18} /> Share My Location</>
                )}
              </button>
            )}
          </div>

          {/* Service Type */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Service Type *</label>
            <select
              value={serviceType}
              onChange={e => setServiceType(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              required
            >
              <option value="">Select service type</option>
              {SERVICE_TYPES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Description (optional)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What happened? Briefly describe..."
              rows={3}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 p-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <><Loader size={20} className="animate-spin" /> Sending...</>
            ) : (
              <><Send size={20} /> Send Emergency Request</>
            )}
          </button>
        </form>
      </div>

      {/* Right Column: Table View */}
      <div className="lg:w-2/3 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-800">Emergency History</h2>
          <button
            onClick={fetchEmergencies}
            className="flex items-center gap-2 text-sm text-blue-600 font-semibold hover:text-blue-800 transition-colors"
          >
            <RefreshCcw size={16} className={fetching ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Service</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Provider</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {fetching && emergencies.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    <Loader size={24} className="animate-spin mx-auto mb-2" />
                    Loading history...
                  </td>
                </tr>
              ) : emergencies.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    No emergency requests found.
                  </td>
                </tr>
              ) : (
                emergencies.map((req) => (
                  <tr key={req._id || req.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="py-4 text-sm text-slate-600">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 text-sm font-semibold text-slate-800">
                      {req.serviceType || req.requestDetails?.serviceType}
                    </td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${req.status === 'accepted' ? 'bg-green-100 text-green-700' :
                          req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-slate-100 text-slate-600'
                        }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-slate-600">
                      {(req.providerId?.name || req.assignedProviderId?.name) || (
                        <span className="text-slate-400 text-xs italic">Searching...</span>
                      )}
                    </td>
                    <td className="py-4">
                      <button
                        onClick={() => handleViewStatus(req)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {viewingDetails && selectedEmergency && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Request Status</h3>
                <p className="text-xs text-slate-400">ID: {selectedEmergency._id || selectedEmergency.id}</p>
              </div>
              <button
                onClick={() => setViewingDetails(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Main Status */}
              <div className="text-center space-y-2">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${selectedEmergency.status === 'accepted' ? 'bg-green-100 text-green-600' :
                    selectedEmergency.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                      'bg-slate-100 text-slate-600'
                  }`}>
                  {selectedEmergency.status === 'accepted' ? <CheckCircle2 size={32} /> : <Clock size={32} />}
                </div>
                <h4 className="text-2xl font-black uppercase tracking-tight text-slate-900">{selectedEmergency.status}</h4>
                <p className="text-sm text-slate-500">
                  {selectedEmergency.status === 'pending'
                    ? 'Wait while providers near you respond.'
                    : selectedEmergency.status === 'accepted'
                      ? 'A provider is on their way!'
                      : 'The request was completed or cancelled.'}
                </p>
              </div>

              {/* Provider Info */}
              {(selectedEmergency.assignedProvider || selectedEmergency.providerId) && (
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold">
                      {(selectedEmergency.assignedProvider?.name || selectedEmergency.providerId?.name)?.[0]}
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Assigned Provider</p>
                      <p className="text-sm font-bold text-slate-900">
                        {selectedEmergency.assignedProvider?.name || selectedEmergency.providerId?.name}
                      </p>
                    </div>
                  </div>
                  {/* <div className="flex gap-2">
                    <a 
                      href={`tel:${selectedEmergency.assignedProvider?.phone || selectedEmergency.providerId?.phone}`}
                      className="flex-1 flex items-center justify-center gap-2 p-2 bg-white text-blue-600 rounded-xl text-sm font-bold border border-blue-200 hover:bg-blue-600 hover:text-white transition-all"
                    >
                      <Phone size={14} /> Call Now
                    </a>
                  </div> */}
                </div>
              )}

              {/* Details List */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Wrench size={16} /></div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Service</p>
                    <p className="text-sm font-medium text-slate-700">{selectedEmergency.serviceType}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><MapPin size={16} /></div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location</p>
                    <p className="text-sm font-medium text-slate-700">Coordinates Captured</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-50">
              <button
                onClick={() => setViewingDetails(false)}
                className="w-full p-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
