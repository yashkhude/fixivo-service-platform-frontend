import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Wrench, Loader } from 'lucide-react';
import { setAuth } from '../app/slices/authSlice';

const API_BASE_URL = import.meta.env.VITE_FIXIVO_APP_API_URL || 'https://fixivo-service-platform-backend.onrender.com';

export default function CompleteProfile() {
  const { user, provider, accessToken } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    experience: provider?.experience || '',
    availability: provider?.availability || 'full-time',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [location, setLocation] = useState(null);
  const [locError, setLocError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLocError('');
      },
      (error) => {
        setLocError('Unable to retrieve your location');
      }
    );
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.experience.trim()) {
      setError('Please enter your experience');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = accessToken || localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/api/provider/complete-profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          experience: formData.experience,
          availability: formData.availability,
          latitude: location?.latitude,
          longitude: location?.longitude
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to update profile');
      }

      const data = await res.json();
      console.log('Profile update response:', data);
      
      // Update Redux with verified provider
      dispatch(setAuth({
        user,
        provider: data.provider,
        accessToken,
        refreshToken: localStorage.getItem('refreshToken'),
        role: 'provider'
      }));

      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          {/* Header */}
          <div className="flex justify-center mb-6">
            <div className="bg-indigo-100 p-4 rounded-full">
              <Wrench size={32} className="text-indigo-600" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-center text-gray-600 text-sm mb-8">
            Let customers know about your experience and availability
          </p>

          {/* Success State */}
          {success ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="bg-green-100 p-4 rounded-full mb-4">
                <CheckCircle2 size={48} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Profile Completed!
              </h2>
              <p className="text-gray-600 text-sm mb-1">
                Your profile has been verified successfully.
              </p>
              <p className="text-indigo-600 text-sm font-semibold animate-pulse">
                Redirecting to dashboard...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Alert */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 items-start">
                  <AlertCircle
                    size={20}
                    className="text-red-500 flex-shrink-0 mt-0.5"
                  />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Experience Field */}
              <div>
                <label
                  htmlFor="experience"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Professional Experience{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="Describe your professional experience, certifications, and expertise (e.g., 5+ years in plumbing, licensed electrician, etc.)"
                  rows="5"
                  disabled={loading}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none placeholder-gray-400 text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  This helps customers understand your qualifications
                </p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                  disabled={loading}
                >
                  Get Current Location
                </button>
                {location && (
                  <p className="text-xs text-green-700 mt-1">
                    Location set: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                  </p>
                )}
                {locError && (
                  <p className="text-xs text-red-600 mt-1">{locError}</p>
                )}
              </div>

              {/* Availability Field */}
              <div>
                <label
                  htmlFor="availability"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Availability <span className="text-red-500">*</span>
                </label>
                <select
                  id="availability"
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white text-gray-900 cursor-pointer appearance-none"
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="weekend">Weekends Only</option>
                  <option value="flexible">Flexible</option>
                </select>
                <p className="text-xs text-gray-500 mt-1.5">
                  When are you available to provide services?
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 mt-8"
              >
                {loading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Updating Profile...
                  </>
                ) : (
                  "Complete Profile"
                )}
              </button>

              {/* Note */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> Your profile will be verified once
                  submitted. You'll then be able to accept service requests
                  immediately.
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-6">
          {user?.name && (
            <span>
              Welcome, <strong className="text-gray-900">{user.name}</strong>!
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
