import { useCallback } from 'react';

const useAddressActions = ({
  saveLocation,
  savedLocation,
  removeRecentLocation,
  removeSavedAddress,
  isSavingLoading,
  navigate,
  isModal,
  onAddressSelected,
  redirectType,
  modalType
}) => {
  const handleNavigation = useCallback((targetPath = '/') => {
    if (redirectType === 'cartpage') {
      navigate('/CartPage', { replace: true });
    } else {
      navigate(targetPath, { replace: true });
    }
  }, [navigate, redirectType]);

  const handleRecentClick = useCallback(async (loc) => {
    if (isSavingLoading) return;

    try {
      const selectedLocation = {
        full_address: loc.full_address || loc.address || '',
        apartment: loc.apartment || '',
        street: loc.street || '',
        address_type: loc.address_type || 'recent',
        lat: loc.lat,
        lon: loc.lon,
        pincode: loc.pincode || '',
        customer_name: loc.customer_name || '',
        customer_mobile: loc.customer_mobile || '',
        _id: loc._id || `temp-${Date.now()}`,
      };

      await saveLocation(selectedLocation);

      if (isModal && onAddressSelected) {
        onAddressSelected(selectedLocation);
      } else {
        handleNavigation();
      }
    } catch (error) {
      console.error('Error selecting recent location:', error);
    }
  }, [saveLocation, isModal, onAddressSelected, handleNavigation, isSavingLoading]);

  const handleSuggestionClick = useCallback(async (feature) => {
    const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;


    if (isSavingLoading) return;

    const coords = feature.center;
    const fullAddress = feature.place_name;
    const [lon, lat] = coords;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${MAPBOX_TOKEN}&types=address,poi,place,locality,postcode,neighborhood,district&limit=1`
      );
      const data = await response.json();

      if (!data.features?.[0]) {
        console.warn('No detailed features found for suggestion:', feature);
        return;
      }

      const featureData = data.features[0];
      const context = featureData?.context || [];
      let pincode = '';

      const postcodeEntry = context.find(c => c.id.startsWith('postcode.'));
      if (postcodeEntry) {
        pincode = postcodeEntry.text;
      } else if (featureData?.place_type?.includes('postcode')) {
        pincode = featureData.text;
      }

      const properties = featureData?.properties || {};
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

      const locationObj = {
        full_address: fullAddress,
        apartment: apartment || '',
        street: street || '',
        address_type: 'recent',
        lat,
        lon,
        pincode: pincode || '',
        customer_name: '',
        customer_mobile: '',
        _id: `temp-${Date.now()}`,
      };

      await saveLocation(locationObj);

      if (isModal && onAddressSelected) {
        onAddressSelected(locationObj);
      } else {
        handleNavigation();
      }
    } catch (error) {
      console.error('Error handling suggestion click:', error);
    }
  }, [saveLocation, isModal, onAddressSelected, handleNavigation, isSavingLoading]);

  const handleSavedClick = useCallback(async (loc) => {
    if (isSavingLoading) return;

    try {
      const selectedSavedLocation = {
        full_address: loc.full_address,
        apartment: loc.apartment,
        street: loc.street,
        address_type: loc.address_type,
        lat: loc.lat,
        lon: loc.lon,
        pincode: loc.pincode,
        customer_name: loc.customer_name,
        customer_mobile: loc.customer_mobile,
        _id: loc._id,
      };

      await savedLocation(selectedSavedLocation);

      if (isModal && onAddressSelected) {
        onAddressSelected(selectedSavedLocation);
      } else {
        handleNavigation();
      }
    } catch (error) {
      console.error('Error saving selected saved location:', error);
    }
  }, [savedLocation, isModal, onAddressSelected, handleNavigation, isSavingLoading]);

  const handleAddAddress = useCallback(() => {
    if (isSavingLoading) return;
    navigate("/mappage", {
      state: {
        ...(redirectType === 'cartpage' && { redirect_type: 'cartpage' }),
        ...(isModal && { fromModal: true, modalRedirectType: modalType })
      }
    });
  }, [navigate, redirectType, isModal, modalType, isSavingLoading]);

  const handleEditAddress = useCallback((item, e) => {
    e.stopPropagation();
    if (isSavingLoading) return;
    navigate('/mappage', {
      state: {
        editAddressId: item._id,
        apartment: item.apartment,
        street: item.street,
        address_type: item.address_type,
        lat: item.lat,
        lon: item.lon,
        full_address: item.full_address,
        pincode: item.pincode,
        customer_name: item.customer_name,
        customer_mobile: item.customer_mobile,
        formType: 'edit',
        ...(isModal && { fromModal: true, modalRedirectType: modalType })
      },
    });
  }, [navigate, isModal, modalType, isSavingLoading]);

  return {
    handleRecentClick,
    handleSuggestionClick,
    handleSavedClick,
    handleAddAddress,
    handleEditAddress,
    handleNavigation
  };
};

export default useAddressActions;