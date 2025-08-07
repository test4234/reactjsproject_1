import React, { useState, useContext, useEffect, useRef } from 'react';
import axios from '../../utils/axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LocationContext } from '../../context/LocationContext'; // Assuming this path is correct

const OTP_LENGTH = 4;
const RESEND_DELAY = 30;

const LoginPage = () => {
    const [step, setStep] = useState(1);
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(''));
    const [error, setError] = useState('');
    const [timer, setTimer] = useState(RESEND_DELAY);
    const [resendDisabled, setResendDisabled] = useState(true);
    const [loading, setLoading] = useState(false);

    const { checkAuth, setIsGuest, reload } = useContext(AuthContext);
    const { location } = useContext(LocationContext);
    const navigate = useNavigate();
    const inputRefs = useRef([]);

    // Reset timer when going to OTP step
    useEffect(() => {
        if (step === 2) {
            setResendDisabled(true);
            setTimer(RESEND_DELAY);
        }
    }, [step]);

    // Countdown for resend
    useEffect(() => {
        let interval;
        if (step === 2 && resendDisabled) {
            interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev === 1) {
                        clearInterval(interval);
                        setResendDisabled(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [step, resendDisabled]);

    // Autofetch OTP using Web OTP API
    useEffect(() => {
        if (step === 2 && 'OTPCredential' in window) {
            const ac = new AbortController();

            navigator.credentials.get({
                otp: { transport: ['sms'] },
                signal: ac.signal
            }).then(otpCredential => {
                if (otpCredential?.code) {
                    const digits = otpCredential.code.split('').slice(0, OTP_LENGTH);
                    setOtp(digits);
                }
            }).catch(err => {
                if (err.name !== 'AbortError') {
                    console.log('Web OTP API failed:', err);
                }
            });

            return () => ac.abort();
        }
    }, [step]);

    // Auto-verify when full OTP entered
    useEffect(() => {
        if (otp.join('').length === OTP_LENGTH) {
            verifyOtp();
        }
        // eslint-disable-next-line
    }, [otp]);

    const sendOtp = async () => {
        const isValidMobile = /^\d{10}$/.test(mobile);
        if (!isValidMobile) {
            setError("Please enter a valid 10-digit mobile number.");
            return;
        }

        try {
            setLoading(true);
            await axios.post('/auth/send-otp', { mobileNumber: mobile });
            setStep(2);
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async () => {
        const code = otp.join('');
        if (code.length < OTP_LENGTH) {
            setError(`Please enter a valid ${OTP_LENGTH}-digit OTP.`);
            return;
        }

        try {
            setLoading(true);
            const res = await axios.post('/auth/verify-otp', { mobileNumber: mobile, code });
            const { accessToken, refreshToken } = res.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            setIsGuest(false);

            document.cookie = "is_guest=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            document.cookie = "guest_location=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

            await checkAuth();
            await reload();
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e, index) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        if (!value) return;

        const newOtp = [...otp];
        newOtp[index] = value[0];
        setOtp(newOtp);

        if (index < OTP_LENGTH - 1 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleBackspace = (e, index) => {
        if (e.key === 'Backspace') {
            e.preventDefault();
            const newOtp = [...otp];
            if (newOtp[index]) {
                newOtp[index] = '';
                setOtp(newOtp);
            } else if (index > 0) {
                inputRefs.current[index - 1].focus();
                newOtp[index - 1] = '';
                setOtp(newOtp);
            }
        }
    };

    const handlePaste = (e) => {
        const pasted = e.clipboardData.getData('text').trim();
        if (new RegExp(`^\\d{${OTP_LENGTH}}$`).test(pasted)) {
            const digits = pasted.slice(0, OTP_LENGTH).split('');
            setOtp(digits);
            inputRefs.current[OTP_LENGTH - 1]?.focus();
        }
        e.preventDefault();
    };

    const handleResend = () => {
        if (!resendDisabled) {
            sendOtp();
        }
    };

    const handleChangeNumber = () => {
        setStep(1);
        setOtp(new Array(OTP_LENGTH).fill(''));
        setError('');
        setResendDisabled(true);
        setTimer(RESEND_DELAY);
    };

    const handleSkip = () => {
        document.cookie = "is_guest=true; path=/; max-age=86400";

        if (location) {
            navigate('/', { replace: true });
        } else {
            navigate('/address');
        }
    };

    return (
        // Full screen container with a pure solid dark green background (bg-green-900)
        // Removed all previous background effects (blur, animations, multiple divs).
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-green-900 text-white font-sans overflow-y-auto"> {/* Added overflow-y-auto */}

            {/* Skip/Close Button */}
            <button
                onClick={handleSkip}
                className="absolute top-6 right-6 text-white hover:text-green-200 text-4xl font-light transition-all duration-300 ease-in-out z-20"
                aria-label="Skip login"
            >
                &times;
            </button>

            {/* Main content area */}
            <div className="relative z-10 w-full max-w-sm text-center flex flex-col items-center justify-center flex-grow pb-12"> {/* Added flex-grow and pb-12 */}

                {/* Brand Info - prominent and fresh */}
                <div className="mb-10"> {/* Removed animate-fade-in-down as it requires custom config */}
                    <h1 className="text-7xl md:text-8xl font-black text-white leading-none tracking-tighter mb-3">
                        Rythuri
                    </h1>
                    <p className="text-xl font-semibold text-green-200 italic opacity-90">
                        Farm Fresh, Delivered Daily
                    </p>
                </div>

                {/* Step 1: Mobile Number Input */}
                {step === 1 && (
                    <div className="w-full flex flex-col items-center gap-6"> {/* Removed animate-fade-in */}
                        <h2 className="text-3xl font-bold text-white mb-2">Login or Sign Up</h2>
                        <div className="relative w-full"> {/* Container for prefix and input */}
                            <span className="absolute left-0 top-0 bottom-0 flex items-center pl-4 pr-2 text-gray-800 text-xl font-bold bg-white rounded-l-lg border-2 border-r-0 border-green-300">
                                +91
                            </span>
                            <input
                                type="tel"
                                placeholder="Enter your 10-digit mobile number"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                className="w-full px-5 py-3 rounded-lg border-2 border-green-300 bg-white text-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-green-200 focus:border-green-600 transition-all duration-300 shadow-md pl-16" // pl-16 for +91
                                inputMode="numeric"
                                pattern="[0-9]{10}"
                                aria-label="Mobile number input"
                            />
                        </div>
                        <button
                            onClick={sendOtp}
                            // Applied direct style for background color
                            style={{ backgroundColor: '#33cc33' }}
                            className="w-full py-3.5 text-white rounded-lg text-xl font-bold shadow-lg transition-all duration-300 ease-in-out hover:bg-green-700 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            disabled={loading || mobile.length !== 10}
                        >
                            {loading ? (
                                <>
                                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> {/* Removed animate-spin */}
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Sending OTP...</span>
                                </>
                            ) : (
                                'Send OTP'
                            )}
                        </button>
                        <p className="text-lg text-white">
                            Or{' '}
                            <span
                                onClick={handleSkip}
                                className="text-green-300 font-semibold cursor-pointer hover:underline hover:text-green-200 transition-colors duration-200"
                            >
                                Continue as Guest
                            </span>
                        </p>
                    </div>
                )}

                {/* Step 2: OTP Verification */}
                {step === 2 && (
                    <div className="w-full flex flex-col items-center gap-6 animate-fade-in">
                        <h2 className="text-3xl font-bold text-white mb-2">Verify Your Mobile</h2>
                        <p className="text-lg text-white">We've sent a <span className="font-semibold text-green-300">{OTP_LENGTH}-digit code</span> to <span className="font-bold text-green-200">+91 {mobile}</span></p>
                        <div className="flex justify-center gap-4 mb-4" onPaste={handlePaste}>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength="1"
                                    value={digit}
                                    aria-label={`OTP Digit ${index + 1}`}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    onChange={(e) => handleChange(e, index)}
                                    onKeyDown={(e) => handleBackspace(e, index)}
                                    className="w-16 h-16 text-4xl text-center rounded-lg border-2 border-green-300 bg-white text-gray-800 font-extrabold focus:outline-none focus:ring-4 focus:ring-green-200 focus:border-green-600 transition-all duration-300 shadow-md"
                                />
                            ))}
                        </div>
                        <button
                            onClick={verifyOtp}
                            // Applied direct style for background color
                            style={{ backgroundColor: '#33cc33' }}
                            className="w-full py-3.5 text-white rounded-lg text-xl font-bold shadow-lg transition-all duration-300 ease-in-out hover:bg-green-700 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            disabled={loading || otp.join('').length !== OTP_LENGTH}
                        >
                            {loading ? (
                                <>
                                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> {/* Removed animate-spin */}
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Verifying...</span>
                                </>
                            ) : (
                                'Verify OTP'
                            )}
                        </button>
                        <div className="flex justify-between w-full text-lg">
                            <p className="text-white">
                                {resendDisabled ? (
                                    `Resend in ${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, '0')}`
                                ) : (
                                    <span
                                        onClick={handleResend}
                                        className="text-green-300 font-semibold cursor-pointer hover:underline hover:text-green-200 transition-colors duration-200"
                                    >
                                        Resend OTP
                                    </span>
                                )}
                            </p>
                            <p
                                onClick={handleChangeNumber}
                                className="text-green-300 font-semibold cursor-pointer hover:underline hover:text-green-200 transition-colors duration-200"
                            >
                                Change Mobile Number
                            </p>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <p className="bg-red-100 text-red-700 border border-red-400 p-3 rounded-lg mt-8 text-center w-full max-w-sm animate-shake">
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
};

export default LoginPage;