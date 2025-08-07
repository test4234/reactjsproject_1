// src/pages/orders/components/TrackSteps.jsx

import React from 'react';

const steps = [
  { key: 'placed', label: 'Order Placed', icon: '📝' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🚚' },
  { key: 'delivered', label: 'Delivered', icon: '✅' },
];

const TrackSteps = ({ status }) => {
  const currentIndex = steps.findIndex(step => step.key === status);

  return (
    <div className="relative flex justify-between items-center w-full px-4 sm:px-8">
      {/* Background Connector Line */}
      <div className="absolute left-1/2 -translate-x-1/2 top-[2.1rem] w-[80%] h-1 bg-gray-200 z-0"></div>

      {/* Progress Line */}
      <div
        className="absolute left-1/2 -translate-x-1/2 top-[2.1rem] h-1 bg-blue-500 z-10 transition-all duration-700 ease-in-out"
        style={{ width: `${(currentIndex / (steps.length - 1)) * 80}%` }}
      ></div>

      {steps.map((step, idx) => (
        <div key={step.key} className="flex-1 flex flex-col items-center z-20 text-center">
          <div
            className={`
              w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold transition-all duration-500 ease-in-out 
              ${idx <= currentIndex
                ? 'bg-blue-500 text-white shadow-md transform scale-110' // Active/Completed: Blue background, larger, shadow
                : 'bg-white border border-gray-300 text-gray-500' // Inactive: White, border
              }
            `}
          >
            {step.icon}
          </div>
          <p
            className={`text-xs sm:text-sm font-medium mt-3 transition-colors duration-300
              ${idx <= currentIndex ? 'text-gray-800 font-semibold' : 'text-gray-500'}
            `}
          >
            {step.label}
          </p>
        </div>
      ))}
    </div>
  );
};

export default TrackSteps;