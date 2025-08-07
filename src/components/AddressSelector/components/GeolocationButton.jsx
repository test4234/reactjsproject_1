import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const GeolocationButton = ({
  onClick,
  isGeolocating,
  isSavingLoading,
  geolocationError
}) => {
  const buttonText = isGeolocating || isSavingLoading
    ? 'Finding your location...'
    : 'Use current location';

  const isDisabled = isGeolocating || isSavingLoading;

  return (
    <>
      <button
        className={`w-full p-4 border rounded-lg transition-colors duration-200 text-sm font-semibold 
          ${
            isDisabled
              ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
              : 'bg-white text-green-700 border-green-500 hover:bg-green-50'
          }
          flex items-center justify-center gap-2`}
        onClick={onClick}
        disabled={isDisabled}
      >
        {isDisabled ? (
          <LoadingSpinner />
        ) : (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        )}
        {buttonText}
      </button>
      {geolocationError && (
        <p className="text-center text-red-600 text-sm mt-3">
          {geolocationError}
        </p>
      )}
    </>
  );
};

export default GeolocationButton;