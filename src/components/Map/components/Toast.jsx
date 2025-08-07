import React, { useEffect, useState } from 'react';

const Toast = ({ message, type = 'error', duration = 3000, onClose }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const stepTime = 50;
    const steps = duration / stepTime;
    let current = 0;

    const interval = setInterval(() => {
      current++;
      setProgress(100 - (current / steps) * 100);
      if (current >= steps) {
        clearInterval(interval);
        onClose();
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, [duration, onClose]);

  const bgColor = type === 'error' ? 'bg-red-600' : 'bg-green-600';

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 ${bgColor} text-white px-4 py-3 rounded shadow-lg z-50 w-[90%] max-w-sm`}>
      <p className="text-sm font-medium">{message}</p>
      <div className="mt-2 h-1 bg-red-300 rounded overflow-hidden">
        <div className="h-full bg-white" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
};

export default Toast;
