import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useLocationData, useLocationActions } from '../../context/LocationContext';

// Components
import LoadingSpinner from './components/LoadingSpinner';
import SearchAddress from './components/SearchAddress';
import GeolocationButton from './components/GeolocationButton';
import SavedAddresses from './components/SavedAddresses';
import RecentLocations from './components/RecentLocations';
import ConfirmationModal from './components/ConfirmationModal';

// Hooks
import useGeolocation from './hooks/useGeolocation';
import useMapboxSearch from './hooks/useMapboxSearch';
import useAddressActions from './hooks/useAddressActions';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const AddressSelector = React.memo(({ isModal = false, modalType = null, onAddressSelected }) => {
  const reactRouterLocation = useLocation();
  const navigate = useNavigate();

  const redirectType = useMemo(() =>
    reactRouterLocation.state?.redirect_type || null,
    [reactRouterLocation.state?.redirect_type]
  );

  const { isGuest } = useContext(AuthContext);
  const memoizedIsGuest = useMemo(() => isGuest, [isGuest]);

  const locationData = useLocationData();
  const locationActions = useLocationActions();

  const { location, recentLocations, savedAddresses, isSavingLoading, isLoading } = useMemo(() => ({
    location: locationData.location,
    recentLocations: locationData.recentLocations,
    savedAddresses: locationData.savedAddresses,
    isSavingLoading: locationData.isSavingLoading,
    isLoading: locationData.isLoading
  }), [locationData]);

  const {
    saveLocation,
    savedLocation,
    removeRecentLocation,
    removeSavedAddress,
  } = useMemo(() => ({
    saveLocation: locationActions.saveLocation,
    savedLocation: locationActions.savedLocation,
    removeRecentLocation: locationActions.removeRecentLocation,
    removeSavedAddress: locationActions.removeSavedAddress,
  }), [locationActions]);

  const [isRemoving, setIsRemoving] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [savedAddressToDelete, setSavedAddressToDelete] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Custom hooks
  const {
    isGeolocating,
    geolocationError,
    handleUseCurrentLocation
  } = useGeolocation(MAPBOX_TOKEN, saveLocation, isSavingLoading);

  const {
    search,
    suggestions,
    handleSearchChange
  } = useMapboxSearch(MAPBOX_TOKEN, isSavingLoading);

  const {
    handleRecentClick,
    handleSuggestionClick,
    handleSavedClick,
    handleAddAddress,
    handleEditAddress,
    handleNavigation
  } = useAddressActions({
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
  });

  const handleRemoveRecent = useCallback(async () => {
    if (!addressToDelete || isSavingLoading) return;

    try {
      setIsRemoving(true);
      await removeRecentLocation(addressToDelete._id || addressToDelete.tempId);
      setAddressToDelete(null);
    } catch (error) {
      console.error('Error removing recent address:', error);
      alert('Failed to remove address. Please try again.');
    } finally {
      setIsRemoving(false);
    }
  }, [addressToDelete, removeRecentLocation, isSavingLoading]);

  const handleRemoveSaved = useCallback(async () => {
    if (!savedAddressToDelete || isSavingLoading) return;

    try {
      setIsRemoving(true);
      await removeSavedAddress(savedAddressToDelete._id);
      setSavedAddressToDelete(null);
    } catch (error) {
      console.error('Error removing saved address:', error);
      alert('Failed to remove saved address. Please try again.');
    } finally {
      setIsRemoving(false);
    }
  }, [savedAddressToDelete, removeSavedAddress, isSavingLoading]);

  const handleDeleteSaved = useCallback((item, e) => {
    e.stopPropagation();
    if (isSavingLoading) return;
    setSavedAddressToDelete(item);
  }, [isSavingLoading]);

  const handleDeleteRecent = useCallback((loc, e) => {
    e.stopPropagation();
    if (isSavingLoading) return;
    setAddressToDelete(loc);
  }, [isSavingLoading]);

  const handleDropdownToggle = useCallback((index, e) => {
    e.stopPropagation();
    if (isSavingLoading) return;
    setActiveDropdown(prev => (prev === index ? null : index));
  }, [isSavingLoading]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown !== null && !event.target.closest('.as-menu-wrapper')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [activeDropdown]);

  const showSearchSection = !isModal || (isModal && modalType !== 'saved_addresses');
  const showGeolocationSection = !isModal || (isModal && modalType !== 'saved_addresses');
  const showRecentLocations = !isModal || (isModal && modalType !== 'saved_addresses');
  const showSavedAddresses = !memoizedIsGuest || (isModal && modalType === 'saved_addresses');

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen text-[1.2em] text-[#555] fixed top-0 left-0 bg-white z-[2000]">
        <p>Loading addresses...</p>
        <LoadingSpinner className="w-[30px] h-[30px] border-[3px] mb-[15px] !ml-0" />
      </div>
    );
  }

  return (
    <div className="box-border min-h-screen flex flex-col relative font-sans bg-[#f7f7f7] select-none" role="region" aria-label="Address selector">
      <div className="h-[60px] bg-green-500 text-white flex items-center justify-center text-[20px] font-bold flex-shrink-0 shadow-[0_2px_4px_rgba(0,0,0,0.1)]">Select Location</div>
      <div className="max-w-[500px] p-[15px] w-full mx-auto my-[20px] flex-grow flex flex-col relative bg-white rounded-lg shadow-[0_4px_10px_rgba(0,0,0,0.05)]
          md:max-w-full md:p-[15px] lg:max-w-[500px] lg:mx-auto">
        {isSavingLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-85 flex flex-col justify-center items-center z-[100] rounded-lg transition-opacity duration-300 text-center" role="status" aria-label="Processing request">
            <LoadingSpinner className="w-[25px] h-[25px] border-[3px] !ml-0" />
            <p className="mt-[15px] text-[1.1em] text-[#333] font-medium">Processing...</p>
          </div>
        )}

        {showSearchSection && (
          <SearchAddress
            search={search}
            suggestions={suggestions}
            isSavingLoading={isSavingLoading}
            onSearchChange={handleSearchChange}
            onSuggestionClick={handleSuggestionClick}
          />
        )}

        {showGeolocationSection && (
          <GeolocationButton
            onClick={handleUseCurrentLocation}
            isGeolocating={isGeolocating}
            isSavingLoading={isSavingLoading}
            geolocationError={geolocationError}
          />
        )}

        {!memoizedIsGuest && (
          <div className="flex justify-center mt-[20px] mb-[10px]">
            <button
              className={`w-full p-[12px] text-[rgb(13,141,64)] border-2 border-green-500 rounded-lg cursor-pointer transition-all duration-200 bg-transparent text-[14px] flex items-center justify-center gap-[8px]
                hover:bg-green-500 hover:text-white
                ${isSavingLoading ? 'opacity-80 cursor-not-allowed bg-[#cccccc] text-[#888888] border-[#cccccc] hover:bg-[#cccccc] hover:text-[#888888]' : ''}`}
              onClick={handleAddAddress}
              disabled={isSavingLoading}
            >
              Add Address
            </button>
          </div>
        )}

        {showSavedAddresses && savedAddresses.length > 0 && (
          <SavedAddresses
            savedAddresses={savedAddresses}
            isSavingLoading={isSavingLoading}
            onSelect={handleSavedClick}
            onEdit={handleEditAddress}
            onDelete={handleDeleteSaved}
          />
        )}

        {showRecentLocations && recentLocations.length > 0 && (
          <RecentLocations
            recentLocations={recentLocations}
            isSavingLoading={isSavingLoading}
            onSelect={handleRecentClick}
            onDelete={handleDeleteRecent}
          />
        )}

        {addressToDelete && (
          <ConfirmationModal
            title="Confirm Remove"
            message="Are you sure you want to remove this recent address?"
            itemName={addressToDelete.full_address}
            onCancel={() => setAddressToDelete(null)}
            onConfirm={handleRemoveRecent}
            isRemoving={isRemoving}
          />
        )}

        {savedAddressToDelete && (
          <ConfirmationModal
            title="Confirm Remove"
            message="Are you sure you want to remove this saved address?"
            itemName={savedAddressToDelete.full_address}
            onCancel={() => setSavedAddressToDelete(null)}
            onConfirm={handleRemoveSaved}
            isRemoving={isRemoving}
          />
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.isModal === nextProps.isModal && prevProps.modalType === nextProps.modalType;
});

AddressSelector.displayName = 'AddressSelector';

export default AddressSelector;