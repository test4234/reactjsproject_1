// components/LoadingSpinner.jsx
import React from 'react';
import './LoadingSpinner.css'; // Optional for styles

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-overlay">
      <div className="spinner" />
      <p>{message}</p>
    </div>
  );
};

export default LoadingSpinner;
