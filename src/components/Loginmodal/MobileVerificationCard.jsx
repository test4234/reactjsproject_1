// MobileVerificationCard.jsx
import React, { useCallback, useEffect, useRef } from 'react';
import axios from '../../utils/axios'; // Assuming axios is correctly configured for your backend

const MobileVerificationCard = ({ state, setState, onVerificationSuccess, onClose, showShake, addToast }) => {
  const { mobileNumber, otp, otpSent, otpError, otpLoading, resendTimer, verified } = state;

  // Refs for OTP input fields
  const otpInputRefs = useRef([]);
  const OTP_LENGTH = 4; // OTP length is 4 digits as requested

  // Handle input changes for mobile number and individual OTP digits
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      if (name === 'mobileNumber') {
        const sanitizedValue = value.replace(/\D/g, '').slice(0, 10);
        setState((prev) => ({
          ...prev,
          [name]: sanitizedValue,
          otpError: '', // Clear specific field error on change
        }));
      } else if (name.startsWith('otp-')) {
        const index = parseInt(name.split('-')[1], 10);
        const sanitizedDigit = value.replace(/\D/g, '').slice(0, 1); // Only allow one digit

        // Update the OTP string
        const newOtpArray = otp.split('');
        newOtpArray[index] = sanitizedDigit;
        const newOtp = newOtpArray.join('');

        setState((prev) => ({
          ...prev,
          otp: newOtp,
          otpError: '',
        }));

        // Move focus to the next input if a digit was entered and it's not the last input
        if (sanitizedDigit && index < OTP_LENGTH - 1) {
          otpInputRefs.current[index + 1]?.focus();
        }
      }
    },
    [otp, setState, OTP_LENGTH]
  );

  // Handle paste event for OTP input
  const handleOtpPaste = useCallback(
    (e) => {
      e.preventDefault();
      const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
      setState((prev) => ({ ...prev, otp: pasteData, otpError: '' }));

      // Distribute pasted digits to inputs and focus the last one
      for (let i = 0; i < pasteData.length; i++) {
        if (otpInputRefs.current[i]) {
          otpInputRefs.current[i].value = pasteData[i];
        }
      }
      if (otpInputRefs.current[pasteData.length - 1]) {
        otpInputRefs.current[pasteData.length - 1].focus();
      }
    },
    [setState, OTP_LENGTH]
  );

  // Handle key down for OTP inputs (e.g., backspace)
  const handleOtpKeyDown = useCallback(
    (e) => {
      const index = parseInt(e.target.name.split('-')[1], 10);

      if (e.key === 'Backspace' && !e.target.value) {
        // If backspace is pressed and current input is empty, move focus to previous
        if (index > 0) {
          otpInputRefs.current[index - 1]?.focus();
        }
        // Clear the digit in the state as well
        const newOtpArray = otp.split('');
        newOtpArray[index] = '';
        setState((prev) => ({ ...prev, otp: newOtpArray.join('') }));
      } else if (e.key === 'ArrowLeft' && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
      } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
        otpInputRefs.current[index + 1]?.focus();
      }
    },
    [otp, setState, OTP_LENGTH]
  );

  // Send OTP
  const handleSendOtp = useCallback(async () => {
    if (mobileNumber.length !== 10) {
      setState((prev) => ({ ...prev, otpError: 'Please enter a valid 10-digit mobile number.' }));
      return;
    }
    setState((prev) => ({ ...prev, otpLoading: true, otpError: '' }));
    try {
      await axios.post('/auth/send-otp', { mobileNumber });

      setState((prev) => ({
        ...prev,
        otpSent: true,
        resendTimer: 30, // Start 30-second timer
        otpLoading: false,
        otp: '', // Clear OTP field on new OTP sent
      }));
      addToast('OTP sent successfully!', 'success'); // --- Added success toast for OTP sent ---
      // Focus the first OTP input after sending
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } catch (err) {
      setState((prev) => ({
        ...prev,
        otpError: err.response?.data?.message || 'Failed to send OTP. Please try again.',
        otpLoading: false,
      }));
      addToast(err.response?.data?.message || 'Failed to send OTP.', 'error'); // Toast on send failure
    }
  }, [mobileNumber, setState, addToast]);

  // Verify OTP - NOW HANDLES THE BACKEND CALL
  const handleVerifyOtp = useCallback(async () => {
    if (otp.length !== OTP_LENGTH) {
      setState((prev) => ({ ...prev, otpError: `Please enter the ${OTP_LENGTH}-digit OTP.` }));
      return;
    }
    setState((prev) => ({ ...prev, otpLoading: true, otpError: '' }));
    try {
      const response = await axios.post('/auth/verify-otp', {
        mobileNumber: mobileNumber,
        code: otp,
      });

      // Assuming a successful response from the backend means verification is complete
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);

      setState((prev) => ({
        ...prev,
        verified: true, // Only set to true after successful backend response
        otpLoading: false,
        otpError: '',
      }));
      onVerificationSuccess(); // Signal to parent that verification is successful
    } catch (err) {
      setState((prev) => ({
        ...prev,
        otpError: err.response?.data?.message || 'Verification failed. Please check your OTP and try again.',
        otpLoading: false,
        verified: false, // Ensure verified state is false on failure
      }));
      addToast(err.response?.data?.message || 'Verification failed. Please try again.', 'error'); // Toast on verification failure
    }
  }, [mobileNumber, otp, onVerificationSuccess, setState, OTP_LENGTH, addToast]); // Added addToast to dependencies

  // useEffect for Resend Timer
  useEffect(() => {
    let timer;
    if (otpSent && resendTimer > 0 && !verified) {
      timer = setInterval(() => {
        setState((prev) => ({ ...prev, resendTimer: prev.resendTimer - 1 }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpSent, resendTimer, verified, setState]);

  // Function to reset to mobile number input state
  const handleChangeNumber = useCallback(() => {
    setState((prev) => ({
      ...prev,
      otpSent: false,
      otp: '',
      resendTimer: 0,
      otpError: '',
      verified: false,
      mobileNumber: '', // Clear mobile number as well for a full reset
    }));
  }, [setState]);

  return (
    <div
      className={`relative bg-white rounded-lg shadow-sm w-full mx-auto overflow-hidden font-inter mb-2.5 ${
        showShake ? 'animate-shake' : ''
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
        <h3 className="text-xl font-semibold text-gray-800">
          {verified ? 'Mobile Verified' : 'Verify Mobile Number'}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-4xl transition-transform transform hover:rotate-90 focus:outline-none"
          aria-label="Close"
        >
          &times;
        </button>
      </div>

      {/* Main Content Area */}
      <div className="p-6 sm:p-1">
        {verified ? (
          // Verified State UI
          <div className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-xl border border-green-200 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-green-500 mb-4 animate-bounce-in"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-2xl font-bold text-green-700 mb-2">Verified!</p>
            <p className="text-gray-700 text-lg mb-4">Your mobile number has been successfully verified.</p>
            <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-inner text-gray-800 font-medium">
              <span className="text-gray-500 mr-2">+91</span>
              <span>{mobileNumber}</span>
            </div>
          </div>
        ) : (
          // Input Form UI
          <>
            {/* Mobile Number Input */}
            <div className="mb-6">
              <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="flex rounded-lg shadow-sm border border-gray-300 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500">
                <span className="inline-flex items-center px-4 rounded-l-lg bg-gray-50 text-gray-600 text-base font-medium border-r border-gray-300">
                  +91
                </span>
                <input
                  type="tel"
                  id="mobileNumber"
                  name="mobileNumber"
                  value={mobileNumber}
                  onChange={handleChange}
                  maxLength="10"
                  inputMode="numeric"
                  className="flex-1 block w-full px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none bg-white rounded-r-lg disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                  placeholder="10 digits mobile number"
                  disabled={otpSent || verified}
                />
              </div>
            </div>

            {/* OTP Error Message */}
            {otpError && (
              <div className="mb-4 text-sm text-red-700 p-3 bg-red-100 rounded-lg border border-red-200 animate-fade-in">
                {otpError}
              </div>
            )}

            {!otpSent ? (
              // Send OTP Button (conditionally rendered and styled)
              mobileNumber.length === 10 && (
                <button
                  onClick={handleSendOtp}
                  disabled={otpLoading || mobileNumber.length !== 10}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {otpLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    'Send OTP'
                  )}
                </button>
              )
            ) : (
              // OTP Input (multiple fields) and Verify Button
              <>
                <div className="mb-6">
                  <label htmlFor="otp-input" className="block text-sm font-medium text-gray-700 mb-2">
                    Enter {OTP_LENGTH}-digit OTP <span className="text-red-500">*</span>
                  </label>
                  <div className="flex justify-center space-x-2">
                    {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                      <input
                        key={index}
                        type="tel"
                        id={`otp-${index}`}
                        name={`otp-${index}`}
                        maxLength="1"
                        inputMode="numeric"
                        autoComplete="one-time-code" // Helps with autofill on some devices
                        value={otp[index] || ''} // Display individual digit
                        onChange={handleChange}
                        onKeyDown={handleOtpKeyDown}
                        onPaste={handleOtpPaste}
                        ref={(el) => (otpInputRefs.current[index] = el)}
                        className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-150"
                        disabled={verified}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleVerifyOtp}
                  disabled={otpLoading || otp.length !== OTP_LENGTH || verified}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors duration-200 mb-4"
                >
                  {otpLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    'Verify OTP'
                  )}
                </button>

                {/* Resend Timer/Button and Change Number */}
                <div className="flex justify-between items-center text-center mt-2">
                  {resendTimer > 0 ? (
                    <p className="text-sm text-gray-500">
                      Resend OTP in <span className="font-semibold text-green-600">{resendTimer}</span> seconds
                    </p>
                  ) : (
                    <button
                      onClick={handleSendOtp}
                      disabled={otpLoading}
                      className="text-sm text-green-600 hover:text-green-800 font-medium focus:outline-none disabled:text-green-300"
                    >
                      Resend OTP
                    </button>
                  )}
                  <button
                    onClick={handleChangeNumber}
                    className="text-sm text-gray-600 hover:text-gray-800 font-medium focus:outline-none"
                  >
                    Change Number
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MobileVerificationCard;