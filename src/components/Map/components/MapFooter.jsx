import React from 'react';
import { MapPinIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

const MapFooter = ({ address, isFetchingAddress, centerCoordinates, onConfirm, isMapMoving = false, isAddressStale = false }) => {
  // Determine the text to display.
  // Show skeleton if:
  // 1. Map is actively moving (isMapMoving)
  // 2. Address is currently being fetched (isFetchingAddress)
  // 3. Address is stale (meaning map has moved, but new address hasn't arrived yet)
  const showSkeleton = isFetchingAddress || isMapMoving || isAddressStale;

  const locationText = address
    ? address
    : `loading...`;

  return (
    <div className="bg-white border-t border-gray-200 px-5 py-6 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] z-10">

      {/* Location or Skeleton */}
      {showSkeleton ? (
        <div className="flex items-center bg-slate-50 p-4 rounded-xl border border-gray-200 mb-4 animate-pulse">
          <div className="w-10 h-10 bg-gray-300 rounded-md mr-4" />
          <div className="flex flex-col gap-2 flex-1">
            <div className="h-4 w-2/3 bg-gray-300 rounded" />
            <div className="h-3 w-1/3 bg-gray-300 rounded" />
          </div>
        </div>
      ) : (
        <div className="flex items-center bg-slate-50 p-4 rounded-xl border border-gray-200 mb-4 hover:bg-slate-100 transition">
          <MapPinIcon className="w-10 h-10 text-red-500 opacity-80 mr-4 shrink-0" />
          <div className="flex flex-col min-w-0">
            <div className="text-base font-semibold text-gray-800 leading-tight">{locationText}</div>
          </div>
        </div>
      )}

      {/* Confirm Button */}
      <button
        onClick={() => {
          console.log('📍 Confirmed Location:', {
            address: locationText,
            latitude: centerCoordinates.latitude,
            longitude: centerCoordinates.longitude,
          });
          onConfirm();
        }}
        // Button is disabled if an address is being fetched OR if the map is still moving OR if address is stale
        disabled={showSkeleton}
        className={`w-full text-white text-lg font-semibold py-4 rounded-xl transition-all shadow-md ${
          showSkeleton
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-800 hover:shadow-lg hover:-translate-y-0.5'
        } flex items-center justify-center gap-2`}
      >
        {/* The button text will show "Loading..." if any relevant state is true */}
        {showSkeleton ? 'Loading...' : 'Confirm Location'}
      </button>
    </div>
  );
};

export default MapFooter;