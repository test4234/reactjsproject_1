import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Assuming you are using react-router-dom

const useGeolocation = (MAPBOX_TOKEN, saveLocation, isSavingLoading) => {
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [geolocationError, setGeolocationError] = useState(null);
  const navigate = useNavigate(); // Get the navigate function

  const handleUseCurrentLocation = async () => {
    if (isSavingLoading) return;

    setIsGeolocating(true);
    setGeolocationError(null);

    if (!navigator.geolocation) {
      setGeolocationError('Geolocation is not supported by your browser');
      setIsGeolocating(false);
      return;
    }

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: true
        });
      });

      const coords = [position.coords.longitude, position.coords.latitude];
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords[0]},${coords[1]}.json?access_token=${MAPBOX_TOKEN}&country=in&types=address,poi,place,locality,postcode,neighborhood,district`
      );
      const data = await response.json();

      if (data.features?.[0]) {
        const feature = data.features[0];
        const fullAddress = feature.place_name;

        let pincode = '';
        const context = feature.context || [];
        const postcodeEntry = context.find(c => c.id.startsWith('postcode.'));
        if (postcodeEntry) {
          pincode = postcodeEntry.text;
        } else if (feature.place_type?.includes('postcode') && feature.text) {
          pincode = feature.text;
        }

        const properties = feature.properties || {};
        const address = properties.address || {};

        let apartment = address.house_number || address.name || '';
        let street = address.street || address.road || '';

        if (!apartment && !street) {
          const streetContext = context.find(c => c.id.startsWith('place.') || c.id.startsWith('locality.'));
          if (streetContext) {
            street = streetContext.text;
          }
          if (!street) {
            const addressParts = fullAddress.split(',').map(part => part.trim());
            if (addressParts.length > 0) {
              apartment = addressParts[0];
              if (addressParts.length > 1) {
                street = addressParts[1];
              }
            }
          }
        }

        const currentLocationObj = {
          full_address: fullAddress || 'Current Location',
          apartment: apartment || '',
          street: street || '',
          address_type: 'recent',
          lat: coords[1],
          lon: coords[0],
          pincode: pincode || '',
          customer_name: '',
          customer_mobile: '',
          _id: `temp-${Date.now()}`,
        };

        await saveLocation(currentLocationObj);
        
        // Navigate to the root path after successfully saving the location
        navigate('/');

        return currentLocationObj;
      } else {
        setGeolocationError('Could not find a detailed address for your current location. Please try again or search manually.');
      }
    } catch (error) {
      console.error('Error getting or saving current location:', error);
      if (error.code === error.PERMISSION_DENIED) {
        setGeolocationError('Location access was denied. Please enable location services in your browser settings.');
      } else {
        setGeolocationError('Failed to fetch current location details. Please check your internet or try again.');
      }
      throw error;
    } finally {
      setIsGeolocating(false);
    }
  };

  return {
    isGeolocating,
    geolocationError,
    handleUseCurrentLocation
  };
};

export default useGeolocation;