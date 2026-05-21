import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Phone, Mail, Lock, ArrowLeft, Wrench, CheckCircle } from 'lucide-react';
import { ImageWithFallback } from '../../components/error/error';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { setAuth } from '../../app/slices/authSlice';
import { useToast, ToastContainer } from '../../components/Toast';

const ILLUSTRATION = 'https://images.unsplash.com/photo-1587813723351-a43ed2cae4d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900';

const API_BASE_URL = import.meta.env.VITE_FIXIVO_APP_API_URL || 'https://fixivo-service-platform-backend.onrender.com';

// API helper functions
const registerCustomerAPI = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/customer/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }
    return response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Network error: Cannot connect to ${API_BASE_URL}. Make sure the backend server is running.`);
    }
    throw error;
  }
};

const loginCustomerAPI = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/customer/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    return response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Network error: Cannot connect to ${API_BASE_URL}. Make sure the backend server is running.`);
    }
    throw error;
  }
};

const registerProviderAPI = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/provider/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    console.log('Register Provider API Response:', response);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }
    return response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Network error: Cannot connect to ${API_BASE_URL}. Make sure the backend server is running.`);
    }
    throw error;
  }
};

const loginProviderAPI = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/provider/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    return response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Network error: Cannot connect to ${API_BASE_URL}. Make sure the backend server is running.`);
    }
    throw error;
  }
};

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { toasts, showToast, removeToast } = useToast();
  
  // Detect if this is signup or login page based on URL
  const isSignupPage = location.pathname === '/signup' || searchParams.get('tab') === 'signup';
  
  const [loginType, setLoginType] = useState('customer');
  const [formMode, setFormMode] = useState(isSignupPage ? 'signup' : 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [usePhone, setUsePhone] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  
  // Form fields state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    serviceType: '',
    experience: '',
    availability: '',
    location: ''
  });
  
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  // Update form mode when location changes
  useEffect(() => {
    setFormMode(isSignupPage ? 'signup' : 'login');
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      serviceType: '',
      experience: '',
      availability: '',
      location: ''
    });
    setErrors({});
    setApiError('');
  }, [location.pathname]);

  // Mutations
  const registerCustomerMutation = useMutation({
    mutationFn: registerCustomerAPI,
    onSuccess: (data) => {
      dispatch(setAuth({
        user: data.user,
        provider: null,
        accessToken: null,
        refreshToken: null,
        role: 'customer'
      }));
      showToast(`Welcome ${data.user?.name}! Account created successfully.`, 'success');
      setTimeout(() => navigate('/dashboard'), 1000);
    },
    onError: (error) => {
      setApiError(error.message);
      showToast(error.message, 'error');
    }
  });

  const loginCustomerMutation = useMutation({
    mutationFn: loginCustomerAPI,
    onSuccess: (data) => {
      dispatch(setAuth({
        user: data.user,
        provider: null,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        role: 'customer'
      }));
      showToast(`Welcome back, ${data.user?.name}!`, 'success');
      setTimeout(() => navigate('/dashboard'), 1000);
    },
    onError: (error) => {
      setApiError(error.message);
      showToast(error.message, 'error');
    }
  });

  const registerProviderMutation = useMutation({
    mutationFn: registerProviderAPI,
    onSuccess: (data) => {
      dispatch(setAuth({
        user: data.user,
        provider: data.provider,
        accessToken: null,
        refreshToken: null,
        role: 'provider'
      }));
      showToast(`Welcome ${data.user?.name}! Professional account created successfully.`, 'success');
      setTimeout(() => navigate('/login'), 500);
    },
    onError: (error) => {
      setApiError(error.message);
      showToast(error.message, 'error');
    }
  });

  const loginProviderMutation = useMutation({
    mutationFn: loginProviderAPI,
    onSuccess: (data) => {
      dispatch(setAuth({
        user: data.user,
        provider: data.provider,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        role: 'provider'
      }));
      showToast(`Welcome back, ${data.user?.name}!`, 'success');
      setTimeout(() => navigate('/dashboard'), 1000);
    },
    onError: (error) => {
      setApiError(error.message);
      showToast(error.message, 'error');
    }
  });

  const isSignup = formMode === 'signup';
  const isOtp = formMode === 'otp';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (isSignup) {
      // Signup validation
      if (!formData.name.trim()) {
        newErrors.name = 'Full name is required';
      }
      if (usePhone) {
        if (!formData.phone.trim()) {
          newErrors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
          newErrors.phone = 'Phone number must be 10 digits';
        }
      } else {
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Invalid email format';
        }
        if (!formData.password.trim()) {
          newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
          newErrors.password = 'Password must be at least 6 characters';
        }
      }

      // Professional specific validation
      if (loginType === 'worker') {
        if (!formData.serviceType) {
          newErrors.serviceType = 'Service type is required';
        }
      }
    } else {
      // Login validation
      if (usePhone) {
        if (!formData.phone.trim()) {
          newErrors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
          newErrors.phone = 'Phone number must be 10 digits';
        }
      } else {
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Invalid email format';
        }
        if (!formData.password.trim()) {
          newErrors.password = 'Password is required';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!validateForm()) {
      return;
    }

    // Prepare data based on form type
    let apiData = {};

    if (isSignup) {
      apiData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        ...(loginType === 'worker' && {
          serviceType: formData.serviceType
        })
      };
    } else {
      apiData = {
        email: formData.email,
        password: formData.password
      };
    }

    // Call appropriate mutation
    if (isSignup) {
      if (loginType === 'customer') {
        registerCustomerMutation.mutate(apiData);
      } else {
        registerProviderMutation.mutate(apiData);
      }
    } else {
      if (loginType === 'customer') {
        loginCustomerMutation.mutate(apiData);
      } else {
        loginProviderMutation.mutate(apiData);
      }
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="min-h-screen flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Left Illustration Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#1E40AF]">
        <ImageWithFallback
          src={ILLUSTRATION}
          alt="Fixivo services"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center">
              <Wrench className="w-5 h-5 text-[#1E40AF]" />
            </div>
            <span className="text-2xl text-white" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}>
              Fixivo
            </span>
          </button>

          {/* Center text */}
          <div>
            <h2
              className="text-4xl text-white mb-4"
              style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800 }}
            >
              Your Home,<br />
              Our Expertise.
            </h2>
            <p className="text-blue-200 text-lg mb-10 leading-relaxed">
              Connect with 2,400+ verified professionals for all your home service needs.
            </p>

            {/* Trust points */}
            <div className="space-y-4">
              {[
                'Verified & background-checked professionals',
                'Book in under 2 minutes',
                'Pay only after job completion',
                '50,000+ happy customers across India',
              ].map(point => (
                <div key={point} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-[#10B981] rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-blue-100 text-sm" style={{ fontWeight: 400 }}>{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom rating strip */}
          <div className="flex items-center gap-4 bg-white/15 backdrop-blur-sm rounded-2xl p-4">
            <div className="text-center">
              <div className="text-white text-xl" style={{ fontWeight: 800 }}>4.8★</div>
              <div className="text-blue-200 text-xs">App Rating</div>
            </div>
            <div className="w-px h-10 bg-white/20"></div>
            <div className="text-center">
              <div className="text-white text-xl" style={{ fontWeight: 800 }}>50K+</div>
              <div className="text-blue-200 text-xs">Happy Customers</div>
            </div>
            <div className="w-px h-10 bg-white/20"></div>
            <div className="text-center">
              <div className="text-white text-xl" style={{ fontWeight: 800 }}>99%</div>
              <div className="text-blue-200 text-xs">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-[#F9FAFB]">
        <div className="w-full max-w-md">
          {/* Mobile back button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1E40AF] transition-colors mb-8 lg:hidden"
            style={{ fontWeight: 500 }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>

          {/* Mobile Logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-[#1E40AF] rounded-xl flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl text-[#1E40AF]" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}>Fixivo</span>
          </div>

          {!isOtp ? (
            <>
              {/* Role Tabs */}
              <div className="flex bg-gray-200 rounded-2xl p-1 mb-8">
                <button
                  onClick={() => setLoginType('customer')}
                  className={`flex-1 py-3 rounded-xl text-sm transition-all ${loginType === 'customer'
                    ? 'bg-white text-[#1E40AF] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                  style={{ fontWeight: loginType === 'customer' ? 700 : 500 }}
                >
                  Customer Login
                </button>
                <button
                  onClick={() => setLoginType('worker')}
                  className={`flex-1 py-3 rounded-xl text-sm transition-all ${loginType === 'worker'
                    ? 'bg-white text-[#1E40AF] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                  style={{ fontWeight: loginType === 'worker' ? 700 : 500 }}
                >
                  Professional Login
                </button>
              </div>

              <div className="mb-6">
                <h1
                  className="text-2xl text-gray-900 mb-1"
                  style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}
                >
                  {isSignup ? 'Create Account' : 'Welcome Back!'}
                </h1>
                <p className="text-gray-500 text-sm">
                  {isSignup
                    ? `Sign up as a ${loginType === 'customer' ? 'customer' : 'service professional'} to get started.`
                    : `Login to your ${loginType === 'customer' ? 'customer' : 'professional'} account.`
                  }
                </p>
              </div>

              {/* Social Login */}
              <div className="flex gap-3 mb-6">
                <button className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-2xl bg-white hover:bg-gray-50 transition-colors">
                  <svg viewBox="0 0 24 24" className="w-4 h-4">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="text-sm text-gray-600" style={{ fontWeight: 500 }}>Google</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-2xl bg-white hover:bg-gray-50 transition-colors">
                  <div className="w-4 h-4 bg-[#1877F2] rounded flex items-center justify-center">
                    <span className="text-white text-xs" style={{ fontWeight: 700 }}>f</span>
                  </div>
                  <span className="text-sm text-gray-600" style={{ fontWeight: 500 }}>Facebook</span>
                </button>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-gray-400 text-xs">or continue with</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              {/* Toggle Email/Phone */}
              <div className="flex bg-gray-100 rounded-xl p-0.5 mb-5 w-fit">
                <button
                  onClick={() => setUsePhone(false)}
                  className={`px-4 py-1.5 rounded-lg text-xs transition-all ${!usePhone ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}
                  style={{ fontWeight: !usePhone ? 600 : 400 }}
                >
                  Email
                </button>
                <button
                  onClick={() => setUsePhone(true)}
                  className={`px-4 py-1.5 rounded-lg text-xs transition-all ${usePhone ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}
                  style={{ fontWeight: usePhone ? 600 : 400 }}
                >
                  Phone
                </button>
              </div>

              {/* Form */}
              <form className="space-y-4" onSubmit={handleFormSubmit}>
                {apiError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm">
                    {apiError}
                  </div>
                )}
                {isSignup && (
                  <div>
                    <label className="block text-gray-700 text-xs mb-1.5" style={{ fontWeight: 600 }}>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className={`w-full px-4 py-3.5 bg-white border rounded-2xl text-sm text-gray-700 outline-none transition-all ${errors.name ? 'border-red-500 focus:ring-2 focus:ring-red-300' : 'border-gray-200 focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/10'}`}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>
                )}

                {isSignup && loginType === 'worker' && (
                  <>
                    <div>
                      <label className="block text-gray-700 text-xs mb-1.5" style={{ fontWeight: 600 }}>Service Type</label>
                      <select 
                        name="serviceType"
                        value={formData.serviceType}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3.5 bg-white border rounded-2xl text-sm text-gray-700 outline-none transition-all ${errors.serviceType ? 'border-red-500 focus:ring-2 focus:ring-red-300' : 'border-gray-200 focus:border-[#1E40AF]'}`}
                      >
                        <option value="">Select your profession</option>
                        {['Plumber', 'Electrician', 'AC Technician', 'Home Cleaner', 'Painter', 'Carpenter', 'Appliance Repair'].map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                      {errors.serviceType && <p className="text-red-500 text-xs mt-1">{errors.serviceType}</p>}
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-gray-700 text-xs mb-1.5" style={{ fontWeight: 600 }}>
                    {usePhone ? 'Phone Number' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      {usePhone ? <Phone className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                    </div>
                    <input
                      type={usePhone ? 'tel' : 'email'}
                      name={usePhone ? 'phone' : 'email'}
                      value={usePhone ? formData.phone : formData.email}
                      onChange={handleInputChange}
                      placeholder={usePhone ? '+91 98765 43210' : 'you@example.com'}
                      className={`w-full pl-11 pr-4 py-3.5 bg-white border rounded-2xl text-sm text-gray-700 outline-none transition-all ${errors.phone || errors.email ? 'border-red-500 focus:ring-2 focus:ring-red-300' : 'border-gray-200 focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/10'}`}
                    />
                  </div>
                  {(errors.phone || errors.email) && <p className="text-red-500 text-xs mt-1">{errors.phone || errors.email}</p>}
                </div>

                {!usePhone && (
                  <div>
                    <label className="block text-gray-700 text-xs mb-1.5" style={{ fontWeight: 600 }}>Password</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter your password"
                        className={`w-full pl-11 pr-11 py-3.5 bg-white border rounded-2xl text-sm text-gray-700 outline-none transition-all ${errors.password ? 'border-red-500 focus:ring-2 focus:ring-red-300' : 'border-gray-200 focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/10'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>
                )}

                {!isSignup && !usePhone && (
                  <div className="flex justify-end">
                    <button type="button" className="text-[#1E40AF] text-xs hover:underline" style={{ fontWeight: 500 }}>
                      Forgot password?
                    </button>
                  </div>
                )}

                {usePhone && (
                  <button
                    type="submit"
                    disabled={registerCustomerMutation.isPending || registerProviderMutation.isPending || loginCustomerMutation.isPending || loginProviderMutation.isPending}
                    className="w-full py-4 bg-[#1E40AF] text-white rounded-2xl hover:bg-blue-900 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontWeight: 700 }}
                  >
                    {registerCustomerMutation.isPending || registerProviderMutation.isPending || loginCustomerMutation.isPending || loginProviderMutation.isPending ? 'Sending...' : 'Send OTP'}
                  </button>
                )}

                {!usePhone && (
                  <button
                    type="submit"
                    disabled={registerCustomerMutation.isPending || registerProviderMutation.isPending || loginCustomerMutation.isPending || loginProviderMutation.isPending}
                    className="w-full py-4 bg-[#1E40AF] text-white rounded-2xl hover:bg-blue-900 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontWeight: 700 }}
                  >
                    {registerCustomerMutation.isPending || registerProviderMutation.isPending || loginCustomerMutation.isPending || loginProviderMutation.isPending ? 'Processing...' : (isSignup ? 'Create Account' : 'Login')}
                  </button>
                )}
              </form>

              <p className="text-center text-sm text-gray-500 mt-5">
                {isSignup ? 'Already have an account? ' : "Don't have an account? "}
                <button
                  onClick={() => {
                    setFormData({
                      name: '',
                      email: '',
                      phone: '',
                      password: '',
                      serviceType: '',
                      experience: '',
                      availability: '',
                      location: ''
                    });
                    setErrors({});
                    navigate(isSignup ? '/login' : '/signup');
                  }}
                  className="text-[#1E40AF] hover:underline"
                  style={{ fontWeight: 600 }}
                >
                  {isSignup ? 'Login' : 'Sign Up'}
                </button>
              </p>

              {loginType === 'worker' && !isSignup && (
                <p className="text-center text-xs text-gray-400 mt-3">
                  Want to join as a professional?{' '}
                  <button
                    onClick={() => navigate('/become-partner')}
                    className="text-[#F97316]"
                    style={{ fontWeight: 600 }}
                  >
                    Apply Now →
                  </button>
                </p>
              )}
            </>
          ) : (
            /* OTP Verification */
            <div>
              <button
                onClick={() => {
                  setFormMode(isSignup ? 'signup' : 'login');
                  setOtpValues(['', '', '', '', '', '']);
                }}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1E40AF] mb-8 transition-colors"
                style={{ fontWeight: 500 }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-[#EFF6FF] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-7 h-7 text-[#1E40AF]" />
                </div>
                <h1 className="text-2xl text-gray-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}>
                  Verify OTP
                </h1>
                <p className="text-gray-500 text-sm">
                  We've sent a 6-digit OTP to your phone number.
                </p>
              </div>

              <div className="flex gap-2 justify-center mb-6">
                {otpValues.map((val, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    maxLength={1}
                    value={val}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    className="w-12 h-14 text-center text-lg text-gray-900 bg-white border-2 border-gray-200 rounded-2xl outline-none focus:border-[#1E40AF] transition-colors"
                    style={{ fontWeight: 700 }}
                  />
                ))}
              </div>

              <button
                onClick={() => {
                  if (otpValues.every(val => val !== '')) {
                    navigate('/');
                  } else {
                    setErrors({ otp: 'Please enter all 6 digits' });
                  }
                }}
                className="w-full py-4 bg-[#1E40AF] text-white rounded-2xl hover:bg-blue-900 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontWeight: 700 }}
                disabled={!otpValues.every(val => val !== '')}
              >
                Verify & Login
              </button>

              {errors.otp && <p className="text-red-500 text-xs mt-2 text-center">{errors.otp}</p>}

              <p className="text-center text-sm text-gray-500 mt-5">
                Didn't receive OTP?{' '}
                <button className="text-[#1E40AF]" style={{ fontWeight: 600 }}>Resend OTP</button>
              </p>
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
}

export default LoginPage;
