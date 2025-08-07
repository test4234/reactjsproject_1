import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

// Create a React Context for the toast functionality
const ToastContext = createContext(null);

// ToastProvider component to manage and display toasts
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]); // State to hold active toasts
  const toastIdRef = useRef(0); // Ref to generate unique IDs for toasts

  // Memoized function to add a new toast
  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = toastIdRef.current++; // Unique ID for each toast
    const newToast = { id, message, type, duration };

    // Add the new toast to the beginning of the array
    setToasts((prevToasts) => [newToast, ...prevToasts]);

    // Automatically remove the toast after its duration
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  // Memoized function to remove a toast manually
  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {createPortal(
        <div
          className="
            fixed top-4 left-1/2 -translate-x-1/2
            z-[1000]
            flex flex-col-reverse
            space-y-3 space-y-reverse
            items-center
          "
        >
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

// Custom hook to consume toast context easily
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Individual Toast component
const ToastItem = ({ toast, onClose }) => {
  const { message, type, duration } = toast;

  // Set colors based on toast type
  let bgColor = 'bg-blue-500';
  let borderColor = 'border-blue-700';
  let textColor = 'text-white';

  switch (type) {
    case 'success':
      bgColor = 'bg-green-500';
      borderColor = 'border-green-700';
      break;
    case 'error':
      bgColor = 'bg-red-500';
      borderColor = 'border-red-700';
      break;
    case 'warning':
      bgColor = 'bg-yellow-500';
      borderColor = 'border-yellow-700';
      textColor = 'text-gray-800'; // Warning text is typically darker
      break;
    default:
      break;
  }

  return (
    <div
      className={`
        relative p-4 rounded-lg shadow-lg
        max-w-sm w-full min-w-[250px]
        flex items-center justify-between overflow-hidden
        ${bgColor} ${textColor} border-l-4 ${borderColor}
      `}
      role="alert"
    >
      <span>{message}</span>

      <button
        onClick={onClose}
        className={`
          ml-4 ${textColor} opacity-80 hover:opacity-100
          transition-opacity
        `}
        aria-label="Close"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Progress bar at the bottom */}
      <div
        className="absolute bottom-0 left-0 h-1 bg-white bg-opacity-30"
        style={{
          width: '100%',
          // The animation property now refers to the keyframes defined in your global CSS
          animation: `toast-progress ${duration}ms linear forwards`,
        }}
      ></div>

      {/*
        THIS <style jsx> BLOCK HAS BEEN REMOVED
        You need to move the @keyframes definition to a global CSS file.
      */}
    </div>
  );
};