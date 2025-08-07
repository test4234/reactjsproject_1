import React from 'react';

const LoadingSpinner = ({ className = '' }) => (
  <div className={`border-2 border-t-2 border-gray-200 border-t-green-500 rounded-full w-[18px] h-[18px] animate-spin inline-block align-middle ml-[5px] flex-shrink-0 ${className}`} />
);

export default LoadingSpinner;