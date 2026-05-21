import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    X, User, Mail, Phone, Calendar, Clock, Wrench,
    Info, CheckCircle2, AlertCircle, ShieldCheck, Lock
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_FIXIVO_APP_API_URL || 'https://fixivo-service-platform-backend.onrender.com';

export default function ProviderDetails({ requestId, onClose, onSuccess }) {
    const { accessToken } = useSelector(s => s.auth);
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [otpStep, setOtpStep] = useState(false); 
    const [otp, setOtp] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [otpSuccess, setOtpSuccess] = useState(false);

    const fetchRequestDetails = async () => {
        setLoading(true);
        setError('');
        try {
            const token = accessToken || localStorage.getItem('accessToken');
            const res = await fetch(`${API_BASE_URL}/api/request/see-requests-inside-provider-dashboard`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to load request details');
            const data = await res.json();
            const found = data.requests.find(r => r._id === requestId);
            if (!found) throw new Error('Request not found');
            setRequest(found);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequestDetails();
    }, [requestId]);

    const handleStartCompletion = async () => {
        setOtpLoading(true);
        setOtpError('');
        try {
            const token = accessToken || localStorage.getItem('accessToken');
            const res = await fetch(`${API_BASE_URL}/api/provider/complete-work/${requestId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await res.json();

            if (res.status === 400 && data.message?.toLowerCase().includes('already generated')) {
                setOtpStep(true);
                return;
            }

            if (!res.ok) throw new Error(data.message || 'Failed to generate OTP');
            
            setOtpStep(true);
        } catch (err) {
            setOtpError(err.message);
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setOtpError('Please enter a 6-digit OTP');
            return;
        }
        setOtpLoading(true);
        setOtpError('');
        try {
            const token = accessToken || localStorage.getItem('accessToken');
            const res = await fetch(`${API_BASE_URL}/api/provider/verify-otp/${requestId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ otp })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Verification failed');

            setOtpSuccess(true);
            // Optionally update the local request state with the new details from data.request
            if (data.request) {
                setRequest(prev => ({ ...prev, ...data.request }));
            }
            
            setTimeout(() => {
                onSuccess();
            }, 2500);
        } catch (err) {
            setOtpError(err.message);
        } finally {
            setOtpLoading(false);
        }
    };

    if (!requestId) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[4px] z-[200] flex items-center justify-center p-6" onClick={onClose}>
            <div className="bg-white rounded-3xl w-full max-w-[600px] max-h-[85vh] overflow-y-auto p-7 shadow-[0_20px_60px_rgba(0,0,0,0.18)]" onClick={e => e.stopPropagation()}>
                <div className="flex items-start justify-between mb-6 pb-4 border-b border-slate-100">
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-900">Service Details</h2>
                        <p className="text-[13px] text-slate-500 mt-0.5">Request ID: {requestId.slice(-8).toUpperCase()}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-[10px] bg-slate-100 border-none text-slate-500 flex items-center justify-center cursor-pointer transition-all hover:bg-red-100 hover:text-red-500 disabled:opacity-50 shrink-0"
                        disabled={otpLoading || loading}
                    >
                        <X size={20} />
                    </button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center p-10 gap-4 text-slate-400">
                        <div className="w-10 h-10 border-[3px] border-slate-200 border-t-blue-700 rounded-full animate-spin" />
                        <p>Loading details...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center p-10 gap-3 text-red-500 bg-red-50 rounded-2xl">
                        <AlertCircle size={40} color="#EF4444" />
                        <p>{error}</p>
                    </div>
                ) : !request ? (
                    <p className="text-center text-slate-500 py-8">Request not found.</p>
                ) : otpStep ? (
                    <div className="py-4">
                        {otpSuccess ? (
                            <div className="flex flex-col items-center gap-3 py-8 text-center">
                                <ShieldCheck size={52} color="#10B981" />
                                <h3 className="text-xl font-extrabold text-slate-900">Work Completed!</h3>
                                <p className="text-sm text-slate-600">Service for <strong>{request?.customerId?.name || 'the customer'}</strong> has been marked as completed.</p>
                                <div className="flex flex-col gap-1 mt-2 text-sm text-slate-500 font-medium bg-slate-50 p-4 rounded-xl w-full">
                                    <span>Type: {request?.serviceType}</span>
                                    <span>Time: {new Date().toLocaleTimeString()}</span>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleVerifyOtp} className="flex flex-col items-center gap-2 max-w-[320px] mx-auto text-center">
                                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-2">
                                    <Lock size={32} color="#6366F1" />
                                </div>
                                <h3 className="text-xl font-extrabold text-slate-900">Verify Completion</h3>
                                <p className="text-[13px] text-slate-500 mb-4 leading-relaxed">Please enter the 6-digit OTP sent to the customer to complete this work.</p>

                                {otpError && <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-3.5 py-2.5 rounded-[10px] text-[13px] w-full text-left mb-4"><AlertCircle size={16} />{otpError}</div>}

                                <input
                                    type="text"
                                    maxLength={6}
                                    placeholder="000000"
                                    value={otp}
                                    onChange={e => {
                                        setOtp(e.target.value.replace(/\D/g, ''));
                                        if (otpError) setOtpError('');
                                    }}
                                    className="w-full text-center text-[32px] font-extrabold tracking-[0.2em] py-4 bg-slate-50 border-[1.5px] border-slate-200 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white transition-all"
                                    disabled={otpLoading}
                                    autoFocus
                                />

                                <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-slate-100 w-full">
                                    <button
                                        type="button"
                                        className="px-5 py-2.5 bg-slate-100 text-slate-600 border-none rounded-xl font-bold cursor-pointer hover:bg-slate-200 transition-colors disabled:opacity-50"
                                        disabled={otpLoading}
                                        onClick={() => {
                                            setOtpStep(false);
                                            setOtpError('');
                                        }}
                                    >
                                        Back
                                    </button>
                                    <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white border-none rounded-xl font-bold cursor-pointer hover:bg-blue-700 transition-colors disabled:opacity-50" disabled={otpLoading}>
                                        {otpLoading ? 'Verifying...' : 'Verify & Complete'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-5 md:grid-cols-2">
                            <section className="flex flex-col gap-3">
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Customer Information</h4>
                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col gap-3">
                                    <div className="flex items-start gap-3 text-[13px] text-slate-700">
                                        <User size={16} className="text-slate-400" />
                                        <span className="font-semibold">{request.customerId?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-start gap-3 text-[13px] text-slate-700">
                                        <Mail size={16} className="text-slate-400" />
                                        <span>{request.customerId?.email || 'N/A'}</span>
                                    </div>
                                </div>
                            </section>

                            <section className="flex flex-col gap-3">
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Service Info</h4>
                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col gap-3">
                                    <div className="flex items-start gap-3 text-[13px] text-slate-700">
                                        <Wrench size={16} className="text-slate-400 shrink-0" />
                                        <span className="font-semibold">{request.serviceType || request.requestDetails?.serviceType}</span>
                                    </div>
                                    <div className="flex items-start gap-3 text-[13px] text-slate-700">
                                        <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
                                        <p className="leading-relaxed">{request.details || request.requestDetails?.details}</p>
                                    </div>
                                </div>
                            </section>

                            <section className="flex flex-col gap-3 md:col-span-2">
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Schedule & Status</h4>
                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col gap-3">
                                    <div className="flex items-start gap-3 text-[13px] text-slate-700">
                                        <Calendar size={16} className="text-slate-400 shrink-0" />
                                        <span>{new Date(request.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                                    </div>
                                    {request.requestDetails?.scheduledTime && (
                                        <div className="flex items-start gap-3 text-[13px] text-slate-700">
                                            <Clock size={16} className="text-slate-400 shrink-0" />
                                            <span>Scheduled: {new Date(request.requestDetails.scheduledTime).toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 text-[13px] mt-2">
                                        <span className="text-xs uppercase font-bold text-gray-400">Status:</span>
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${request.status === 'accepted' ? 'bg-green-100 text-green-700' : request.status === 'pending' ? 'bg-amber-100 text-amber-700' : request.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-700'}`}>
                                            {request.status}
                                        </span>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-2 pt-4 border-t border-slate-100">
                            <button onClick={onClose} className="px-5 py-2.5 bg-slate-100 text-slate-600 border-none rounded-xl font-bold cursor-pointer hover:bg-slate-200 transition-colors">Close</button>
                            {request.status === 'accepted' && (
                                <button
                                    onClick={handleStartCompletion}
                                    disabled={otpLoading}
                                    className="px-5 py-2.5 bg-emerald-500 text-white border-none rounded-xl font-bold cursor-pointer hover:bg-emerald-600 transition-colors disabled:opacity-50"
                                >
                                    {otpLoading ? 'Generating OTP...' : 'Complete Work'}
                                </button>
                            )}
                            {request.status === 'completed' && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-sm">
                                    <CheckCircle2 size={16} />
                                    Work Completed
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
