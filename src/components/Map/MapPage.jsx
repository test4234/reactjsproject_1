import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useLocation } from 'react-router-dom'; // Import useLocation to read route state

import MapFooter from './components/MapFooter';
import MapContainer from './components/MapContainer';
import Navbar from './components/Navbar';
import { createPulsingDot } from './utils/pulsingDot';
import { useToast } from './contexts/ToastContext';
import AddressForm from '../../components/Address/AddressForm';

mapboxgl.accessToken = 'pk.eyJ1IjoiamZ1bjU4NDI2IiwiYSI6ImNtMzF1bjJxZjB4Y3YyanNod2Y3ZTA3MW8ifQ.pOFakSMCsDxVy2z45f-8bg';

const MAPBOX_GEOCODING_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';

function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const MapPage = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const { addToast } = useToast();
  const location = useLocation(); // Get the location object to read route state

  // Extract initial values from location.state
  // These values will be used for the map's initial center and the AddressForm's mode
  const initialLat = location.state?.lat || 28.6139;
  const initialLon = location.state?.lon || 77.209;
  const initialFormType = location.state?.formType || 'add';
  const initialEditAddressId = location.state?.editAddressId || null;
  const initialRedirectType = location.state?.modalRedirectType || ''; // Use modalRedirectType if navigating from a modal context

  const [centerCoordinates, setCenterCoordinates] = useState({
    latitude: initialLat, // Initialize with latitude from route state
    longitude: initialLon, // Initialize with longitude from route state
  });

  const [isLocating, setIsLocating] = useState(false);
  const [isMapMoving, setIsMapMoving] = useState(false);
  const [address, setAddress] = useState('');
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);
  const [isAddressStale, setIsAddressStale] = useState(false);
  const isFirstRender = useRef(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLocationForForm, setSelectedLocationForForm] = useState(null);
  const [formType, setFormType] = useState(initialFormType); // Initialize with formType from route state
  const [editAddressId, setEditAddressId] = useState(initialEditAddressId); // Initialize with editAddressId from route state
  const [redirectType, setRedirectType] = useState(initialRedirectType); // Initialize with redirectType from route state
  const [locationInfoForForm, setLocationInfoForForm] = useState({ city: '', postalCode: '' });

  // console.log("Current Form Type:", formType); // Debugging
  // console.log("Initial Coordinates:", initialLat, initialLon); // Debugging

  // Stable callback for updating center coordinates from map move
  const handleMapMove = useCallback(() => {
    if (mapRef.current) {
      const center = mapRef.current.getCenter();
      const newLat = parseFloat(center.lat.toFixed(6));
      const newLng = parseFloat(center.lng.toFixed(6));
      setCenterCoordinates((prev) => {
        if (prev.latitude !== newLat || prev.longitude !== newLng) {
          setIsAddressStale(true); // Mark address as stale when coordinates change
          return { latitude: newLat, longitude: newLng };
        }
        return prev;
      });
    }
  }, []);

  console.log(redirectType)

  // Fetch address function (no debounce here)
  const fetchAddress = useCallback(async ({ latitude, longitude }) => {
    setIsFetchingAddress(true);
    let displayAddressForFooter = 'Unknown location';
    let cityForForm = '';
    let postalCodeForForm = '';

    try {
      let url = `${MAPBOX_GEOCODING_URL}${longitude},${latitude}.json?access_token=${mapboxgl.accessToken}&types=address,place,locality,postcode,region,country&language=en`;
      let res = await fetch(url);
      let data = await res.json();

      if (data.features?.length > 0) {
        const primaryFeature = data.features[0];

        const postcodeContext = primaryFeature.context?.find(
          contextItem => contextItem.id.startsWith('postcode.')
        );
        if (postcodeContext) {
          postalCodeForForm = postcodeContext.text;
        } else {
          const postcodeFeature = data.features.find(
            feature => feature.place_type.includes('postcode')
          );
          if (postcodeFeature) {
            postalCodeForForm = postcodeFeature.text;
          }
        }

        const placeContext = primaryFeature.context?.find(
          contextItem => contextItem.id.startsWith('place.')
        );
        const localityContext = primaryFeature.context?.find(
          contextItem => contextItem.id.startsWith('locality.')
        );

        if (placeContext) {
          cityForForm = placeContext.text;
        } else if (localityContext) {
          cityForForm = localityContext.text;
        } else {
          cityForForm = primaryFeature.text || 'Unknown City';
        }

        const relevantPlaceName = placeContext?.text || localityContext?.text || primaryFeature.text;
        const regionContext = primaryFeature.context?.find(
          contextItem => contextItem.id.startsWith('region.')
        );
        const countryContext = primaryFeature.context?.find(
          contextItem => contextItem.id.startsWith('country.')
        );
        const districtContext = primaryFeature.context?.find(
          contextItem => contextItem.id.startsWith('district.')
        );

        if (relevantPlaceName && regionContext && countryContext) {
          displayAddressForFooter = `${relevantPlaceName}, ${regionContext.text}, ${countryContext.text}`;
        } else if (relevantPlaceName && districtContext && regionContext && countryContext) {
          displayAddressForFooter = `${relevantPlaceName}, ${districtContext.text}, ${regionContext.text}, ${countryContext.text}`;
        } else {
          const broaderFeatureForDisplay = data.features.find(f =>
            f.place_type.includes('place') || f.place_type.includes('locality')
          );
          displayAddressForFooter = broaderFeatureForDisplay?.place_name || primaryFeature.place_name || 'Unknown location';
        }

      } else {
        url = `${MAPBOX_GEOCODING_URL}${longitude},${latitude}.json?access_token=${mapboxgl.accessToken}&types=locality,postcode,place,region,country&language=en`;
        res = await fetch(url);
        data = await res.json();

        if (data.features?.[0]) {
          const fallbackFeature = data.features[0];

          const placeContext = fallbackFeature.context?.find(c => c.id.startsWith('place.'));
          const localityContext = fallbackFeature.context?.find(c => c.id.startsWith('locality.'));
          const regionContext = fallbackFeature.context?.find(c => c.id.startsWith('region.'));
          const countryContext = fallbackFeature.context?.find(c => c.id.startsWith('country.'));
          const districtContext = fallbackFeature.context?.find(c => c.id.startsWith('district.'));

          if (placeContext) {
            cityForForm = placeContext.text;
          } else if (localityContext) {
            cityForForm = localityContext.text;
          } else {
            cityForForm = fallbackFeature.text || 'Unknown City';
          }

          const postcodeContext = fallbackFeature.context?.find(c => c.id.startsWith('postcode.'));
          if (postcodeContext) {
            postalCodeForForm = postcodeContext.text;
          } else if (fallbackFeature.place_type?.includes('postcode')) {
            postalCodeForForm = fallbackFeature.text;
          }

          const relevantPlaceName = placeContext?.text || localityContext?.text || fallbackFeature.text;

          if (relevantPlaceName && regionContext && countryContext) {
            displayAddressForFooter = `${relevantPlaceName}, ${regionContext.text}, ${countryContext.text}`;
          } else if (relevantPlaceName && districtContext && regionContext && countryContext) {
            displayAddressForFooter = `${relevantPlaceName}, ${districtContext.text}, ${regionContext.text}, ${countryContext.text}`;
          } else {
            displayAddressForFooter = fallbackFeature.place_name || fallbackFeature.text || 'Unknown location';
          }

        } else {
          displayAddressForFooter = 'Unknown location';
          cityForForm = '';
          postalCodeForForm = '';
        }
      }

      setAddress(prev => prev === displayAddressForFooter ? prev : displayAddressForFooter);
      setLocationInfoForForm(prev => {
        if (prev.city === cityForForm && prev.postalCode === postalCodeForForm) {
          return prev;
        }
        return { city: cityForForm, postalCode: postalCodeForForm };
      });

    } catch (e) {
      setAddress('Unable to fetch address');
      setLocationInfoForForm({ city: '', postalCode: '' });
      addToast('Failed to fetch address details.', 'error');
    }
    setIsFetchingAddress(false);
    setIsAddressStale(false);
  }, [addToast]);

  const debouncedFetchAddressRef = useRef(debounce(fetchAddress, 1000));

  // Effect to call debounced fetchAddress when centerCoordinates change
  // Also handles initial fetch based on route state
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      // Fetch initial address using the coordinates from route state
      debouncedFetchAddressRef.current({ latitude: initialLat, longitude: initialLon });
      return;
    }
    // For subsequent map moves, use the updated centerCoordinates state
    debouncedFetchAddressRef.current(centerCoordinates);
  }, [centerCoordinates, initialLat, initialLon]); // Add initialLat/Lon to dependencies for first render logic

  // Map initialization and event handlers
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [initialLon, initialLat], // Initialize map center with coordinates from route state
        zoom: 12,
        attributionControl: false,
      });

      const handleMoveStart = () => setIsMapMoving(true);
      const handleMoveEnd = () => {
        setIsMapMoving(false);
        handleMapMove();
      };

      mapRef.current.on('movestart', handleMoveStart);
      mapRef.current.on('moveend', handleMoveEnd);
      mapRef.current.on('load', handleMapMove); // This calls handleMapMove which updates centerCoordinates

      const resizeObserver = new ResizeObserver(() => {
        mapRef.current?.resize();
      });
      resizeObserver.observe(mapContainerRef.current);

      return () => {
        mapRef.current?.off('movestart', handleMoveStart);
        mapRef.current?.off('moveend', handleMoveEnd);
        mapRef.current?.off('load', handleMapMove);
        mapRef.current?.remove();
        mapRef.current = null;
        resizeObserver.disconnect();
      };
    }
  }, [handleMapMove, initialLat, initialLon]); // Add initialLat, initialLon to dependencies

  const handleConfirmLocation = () => {
    setSelectedLocationForForm({
      latitude: centerCoordinates.latitude,
      longitude: centerCoordinates.longitude,
    });
    setModalOpen(true); // Open the AddressForm modal
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedLocationForForm(null); // Clear selected location when modal closes
  };

  const useCurrentLocation = () => {
    setIsLocating(true);

    if (!navigator.geolocation) {
      addToast('Geolocation is not supported by your browser', 'error');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude, longitude } = coords;

        if (mapRef.current) {
          mapRef.current.flyTo({ center: [longitude, latitude], zoom: 16, essential: true });
          createPulsingDot(mapRef.current);

          if (mapRef.current.getSource('user-location')) {
            mapRef.current.removeLayer('user-location-layer');
            mapRef.current.removeSource('user-location');
          }

          mapRef.current.addSource('user-location', {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [longitude, latitude] },
            },
          });

          mapRef.current.addLayer({
            id: 'user-location-layer',
            type: 'symbol',
            source: 'user-location',
            layout: { 'icon-image': 'pulsing-dot' },
          });
        }

        setCenterCoordinates({ latitude, longitude });
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        addToast(`Location error: ${err.message}`, 'error');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="flex flex-col h-screen font-inter bg-gray-50">
      <Navbar />

      <MapContainer
        mapRef={mapRef}
        mapContainerRef={mapContainerRef}
        isLocating={isLocating}
        useCurrentLocation={useCurrentLocation}
        onLocationSelect={({ lat, lon, name }) => {
          if (mapRef.current) {
            mapRef.current.flyTo({ center: [lon, lat], zoom: 14, essential: true });
          }
          setCenterCoordinates({ latitude: lat, longitude: lon });
          setAddress(name);
          setIsAddressStale(false);
        }}
      />

      <MapFooter
        address={address}
        isFetchingAddress={isFetchingAddress}
        centerCoordinates={centerCoordinates}
        isMapMoving={isMapMoving}
        isAddressStale={isAddressStale}
        onConfirm={handleConfirmLocation}
        postalCode={locationInfoForForm.postalCode}
      />

      {modalOpen && selectedLocationForForm && (
        <AddressForm
          formUsage="map"
          onClose={handleModalClose}
          selectedLocation={selectedLocationForForm}
          city={locationInfoForForm.city}
          postalCode={locationInfoForForm.postalCode}
          formType={formType}
          editAddressId={editAddressId}
          redirectType={redirectType}
        />
      )}
    </div>
  );
};

export default MapPage;