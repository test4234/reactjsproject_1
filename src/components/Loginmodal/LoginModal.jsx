// LoginModal.jsx
import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import MobileVerificationCard from './MobileVerificationCard';
import AddressManagementSection from './AddressManagementSection';
import { useToast } from '../Map/contexts/ToastContext';
import { useNavigate } from 'react-router-dom';

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const { checkAuth, user } = useContext(AuthContext);
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Track all state internally to prevent parent rerenders
  const [state, setState] = useState({
    mobileNumber: user?.mobile_number || '',
    otp: '',
    otpSent: false,
    otpError: '',
    otpLoading: false,
    resendTimer: 0,
    verified: user?.mobile_number ? true : false,
  });

  // State for animations
  const [showMobileShake, setShowMobileShake] = useState(false);
  const [showAddressHighlight, setShowAddressHighlight] = useState(false); // New state for highlight

  // Use ref to track verification without causing rerenders
  const verificationRef = useRef({
    verified: user?.mobile_number ? true : false,
    mobileNumber: user?.mobile_number || '',
  });

  // Initialize with user's mobile if already verified
  useEffect(() => {
    if (user?.mobile_number) {
      verificationRef.current = {
        verified: true,
        mobileNumber: user.mobile_number,
      };
      setState((prev) => ({
        ...prev,
        mobileNumber: user.mobile_number,
        verified: true,
      }));
    }
  }, [user?.mobile_number]);

  // OTP resend timer (already present and functional)
  useEffect(() => {
    let timer;
    if (state.otpSent && !state.verified && state.resendTimer > 0) {
      timer = setInterval(() => {
        setState((prev) => ({ ...prev, resendTimer: prev.resendTimer - 1 }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [state.otpSent, state.verified, state.resendTimer]);

  // Handle verification success from MobileVerificationCard
  const handleVerificationSuccess = useCallback(async () => {
    try {
      // Update verification state in ref - MobileVerificationCard now guarantees backend verification
      verificationRef.current.verified = true;

      // Delay auth context update to prevent UI jump
      setTimeout(() => {
        checkAuth().then(() => {
          onLoginSuccess?.();
          addToast('Mobile number verified successfully!', 'success'); // Toast on successful verification
        });
      }, 500); // Increased delay for safety
    } catch (error) {
      // This catch might be for issues with checkAuth or onLoginSuccess,
      // actual verification errors are handled in MobileVerificationCard
      addToast('An error occurred after verification.', 'error');
    }
  }, [checkAuth, onLoginSuccess, addToast]);

  // Handle click on Add Address button
  const handleAddAddressAttempt = useCallback(() => {
    if (!verificationRef.current.verified) {
      setShowMobileShake(true);
      addToast('Verify mobile number to add address', 'warning');
      setTimeout(() => setShowMobileShake(false), 1000);
    } else {
      setShowAddressHighlight(true);
      addToast('Redirecting to address form...', 'info');
      setTimeout(() => setShowAddressHighlight(false), 1000);

      // ✅ Navigate to mappage with props
      navigate('/mappage', {
        state: {
          formType: 'add',
          modalRedirectType: 'cartpage',
        },
      });
    }
  }, [addToast, navigate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black/55 flex justify-center items-end z-[1000] backdrop-blur-sm">
      {/* CSS for Shake and Highlight Animations */}
      <style>
        {`
          @keyframes shake {
            0%, 100% {
              transform: translateX(0);
            }
            10%, 30%, 50%, 70%, 90% {
              transform: translateX(-5px);
            }
            20%, 40%, 60%, 80% {
              transform: translateX(5px);
            }
          }

          .animate-shake {
            animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
          }

          @keyframes pulse-highlight {
            0% {
              box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); /* Tailwind blue-500 with opacity */
            }
            70% {
              box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
            }
          }

          .animate-pulse-highlight {
            animation: pulse-highlight 1s ease-out;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .animate-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
          }
        `}
      </style>
      <div className="fixed bottom-0 w-full max-w-[600px] h-[80vh] bg-white rounded-t-[16px] shadow-lg z-[1000] flex flex-col overflow-y-auto">
        <div className="flex-shrink-0 px-4 py-3">
          <MobileVerificationCard
            state={state}
            setState={setState}
            onVerificationSuccess={handleVerificationSuccess} // Renamed for clarity
            onClose={onClose}
            showShake={showMobileShake}
            addToast={addToast}
          />
        </div>

        <div className="px-4">
          <AddressManagementSection
            onAddAddressClick={handleAddAddressAttempt}
            highlight={showAddressHighlight}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginModal;