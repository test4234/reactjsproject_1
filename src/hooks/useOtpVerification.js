// src/hooks/useOtpVerification.js (or a similar path)

import { useState, useEffect, useCallback } from 'react';
import axios from '../utils/axios'; // Make sure the path is correct

const OTP_LENGTH = 4;
const RESEND_DELAY = 30;

const useOtpVerification = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Mobile Input, 2: OTP Input
  const [resendTimer, setResendTimer] = useState(RESEND_DELAY);
  const [resendDisabled, setResendDisabled] = useState(true);

  // Reset timer when moving to the OTP step
  useEffect(() => {
    if (step === 2) {
      setResendDisabled(true);
      setResendTimer(RESEND_DELAY);
    }
  }, [step]);

  // Countdown for the resend timer
  useEffect(() => {
    let interval;
    if (step === 2 && resendDisabled) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
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

  const sendOtp = useCallback(async () => {
    const isValidMobile = /^\d{10}$/.test(mobileNumber);
    if (!isValidMobile) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await axios.post('/auth/send-otp', { mobileNumber });
      setStep(2);
      setOtp(new Array(OTP_LENGTH).fill(''));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [mobileNumber]);

  const verifyOtp = useCallback(async () => {
    const code = otp.join('');
    if (code.length < OTP_LENGTH) {
      setError(`Please enter a valid ${OTP_LENGTH}-digit OTP.`);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/auth/verify-otp', { mobileNumber, code });
      const { accessToken, refreshToken } = res.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // The caller will handle navigation or further actions
      return { success: true, message: 'Verification successful.' };
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
      return { success: false, message: 'Verification failed.' };
    } finally {
      setLoading(false);
    }
  }, [mobileNumber, otp]);

  const handleOtpChange = useCallback((e, index) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (!value) return;

    const newOtp = [...otp];
    newOtp[index] = value[0];
    setOtp(newOtp);

    // Auto-focus the next input
    if (index < OTP_LENGTH - 1) {
      document.getElementById(`otp-input-${index + 1}`)?.focus();
    }
  }, [otp]);

  const handleOtpPaste = useCallback((e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (new RegExp(`^\\d{${OTP_LENGTH}}$`).test(pasted)) {
      const digits = pasted.slice(0, OTP_LENGTH).split('');
      setOtp(digits);
      // Manually focus the last input
      document.getElementById(`otp-input-${OTP_LENGTH - 1}`)?.focus();
    }
  }, []);

  const handleChangeNumber = useCallback(() => {
    setStep(1);
    setOtp(new Array(OTP_LENGTH).fill(''));
    setError('');
    setMobileNumber('');
    setResendDisabled(true);
    setResendTimer(RESEND_DELAY);
  }, []);

  const resetState = useCallback(() => {
    setMobileNumber('');
    setOtp(new Array(OTP_LENGTH).fill(''));
    setError('');
    setLoading(false);
    setStep(1);
    setResendTimer(RESEND_DELAY);
    setResendDisabled(true);
  }, []);


  return {
    mobileNumber,
    setMobileNumber,
    otp,
    setOtp,
    error,
    setError,
    loading,
    setLoading,
    step,
    setStep,
    resendTimer,
    resendDisabled,
    sendOtp,
    verifyOtp,
    handleOtpChange,
    handleOtpPaste,
    handleChangeNumber,
    resetState,
    OTP_LENGTH,
  };
};

export default useOtpVerification;