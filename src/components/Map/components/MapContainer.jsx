import React from 'react';
import LocationSearchBar from './LocationSearchBar';
import UseMyLocationButton from './UseMyLocationButton';

const MapContainer = ({
  mapRef,
  mapContainerRef,
  isLocating,
  useCurrentLocation,
  onLocationSelect,
}) => {
  return (
    <div className="relative flex-grow overflow-hidden rounded-lg shadow-lg">
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-xl px-4">
        <LocationSearchBar onSelectLocation={onLocationSelect} />
      </div>

      <div ref={mapContainerRef} className="w-full h-full rounded-lg" />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[-100%] z-10 pointer-events-none">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="text-red-500 drop-shadow-lg"
        >
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
        </svg>
      </div>

      {/* ✅ Use My Location Button Component */}
      <UseMyLocationButton onClick={useCurrentLocation} isLocating={isLocating} />
    </div>
  );
};

export default MapContainer;
