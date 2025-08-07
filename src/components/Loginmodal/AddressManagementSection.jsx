import React, { useContext, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'; // Adjust path if needed
import { useLocationData, useLocationActions } from '../../context/LocationContext'; // Adjust path if needed

// Assuming these are your components for loading and confirmation
import LoadingSpinner from '../AddressSelector/components/LoadingSpinner';
import ConfirmationModal from '../AddressSelector/components/ConfirmationModal';

// --- AddAddressCard Component ---
const AddAddressCard = ({ onAddAddressClick, highlight, isDisabled, isAuthPrompt = false }) => {
  return (
    <div
      onClick={isDisabled ? null : onAddAddressClick}
      className={`relative flex items-center justify-between w-[99%] mx-auto p-4 bg-white rounded-xl shadow-md transition-all duration-300 ease-in-out transform
        ${isDisabled
          ? 'opacity-60 cursor-not-allowed'
          : 'cursor-pointer hover:shadow-lg hover:-translate-y-1'
        }
        ${highlight ? 'animate-pulse-highlight' : ''}`
      }
    >
      <div className="flex items-center space-x-4">
        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-100 text-green-600 flex-shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <span className="text-gray-800 text-lg font-semibold">
          {isAuthPrompt ? 'Add Address' : 'Add Address'}
        </span>
      </div>
      <div className="flex-shrink-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
};

// --- MySavedAddressesList Component ---
const MySavedAddressesList = ({
  onAddressSelected,
  onEditAddress,
  onDeleteAddress,
  savedAddresses,
  isSavingLoading,
  isRemoving,
  onConfirmDelete,
  onCancelDelete,
  addressToDelete,
  title = "My Saved Addresses"
}) => {
  if (!savedAddresses || savedAddresses.length === 0) {
    return null; // Will be handled by parent if no addresses are present
  }

  return (
    <div className="saved-addresses-list-section w-[99%] mx-auto mt-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
      {/* Added max-h-64 and overflow-y-auto for scrolling */}
      <ul className="space-y-3 max-h-64 overflow-y-auto pr-2"> 
        {savedAddresses.map((address) => (
          <li
            key={address._id}
            className={`flex items-center justify-between p-4 bg-white rounded-lg shadow-sm transition-all duration-200
              ${isSavingLoading ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-md cursor-pointer'}`
            }
            onClick={() => !isSavingLoading && onAddressSelected(address)}
          >
            <div>
              <p className="font-semibold text-gray-900">{address.address_type.toUpperCase() || 'Saved Address'}</p>
              <p className="text-sm text-gray-600">{address.full_address}</p>
            </div>
  <div className="flex items-center">
  <button
    onClick={(e) => {
      e.stopPropagation();
      !isSavingLoading && onAddressSelected(address);
    }}
    className={`px-4 py-2 border border-green-500 text-green-600 rounded-md text-sm font-semibold bg-transparent hover:bg-green-50 transition duration-200 ${
      isSavingLoading ? 'opacity-50 cursor-not-allowed' : ''
    }`}
    disabled={isSavingLoading}
  >
    Select
  </button>
</div>

          </li>
        ))}
      </ul>

      {addressToDelete && (
        <ConfirmationModal
          title="Confirm Remove"
          message="Are you sure you want to remove this saved address?"
          itemName={addressToDelete.full_address}
          onCancel={onCancelDelete}
          onConfirm={onConfirmDelete}
          isRemoving={isRemoving}
        />
      )}
    </div>
  );
};


// --- Main AddressManagementSection Component ---
// Exported as AddressFormCard (to match your preferred file naming)
const AddressManagementSection = ({ onAddAddressClick, highlight, onClose }) => {
  const navigate = useNavigate();
  const { isGuest } = useContext(AuthContext);
  const { savedAddresses, isLoading, isSavingLoading } = useLocationData();
  const { savedLocation, removeSavedAddress } = useLocationActions();

  const [addressToDelete, setAddressToDelete] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const memoizedIsGuest = useMemo(() => isGuest, [isGuest]);

const handleAddAddressInternal = useCallback(() => {
  if (isSavingLoading) return;

  if (!memoizedIsGuest) {
    // Authenticated user: go to /mappage with state/props
    navigate('/mappage', { state: { formType: 'add', redirectType: 'cartpage' } });
  } else {
    // Unauthenticated user: fallback (maybe prompt login or stay on page)
    navigate('/add-address'); // Or trigger login flow
  }
}, [navigate, isSavingLoading, memoizedIsGuest]);


const handleSelectSavedAddress = useCallback((address) => {
  if (isSavingLoading) return;
  console.log('Selected saved address:', address);
  savedLocation(address, 'saved_address');

  // ✅ Close modal after a short delay to ensure location saves first
  setTimeout(() => {
    onClose?.();
  }, 200); // Optional delay for smoother UI
}, [savedLocation, isSavingLoading, onClose]);


  const handleEditSavedAddress = useCallback((address) => {
    if (isSavingLoading) return;
    console.log('Editing saved address:', address);
    navigate('/add-address', { state: { address_to_edit: address } });
  }, [navigate, isSavingLoading]);

  const handleDeleteSavedAddress = useCallback((address) => {
    if (isSavingLoading) return;
    setAddressToDelete(address);
  }, [isSavingLoading]);

  const handleConfirmRemoveSaved = useCallback(async () => {
    if (!addressToDelete || isSavingLoading) return;

    try {
      setIsRemoving(true);
      await removeSavedAddress(addressToDelete._id);
      setAddressToDelete(null);
    } catch (error) {
      console.error('Error removing saved address:', error);
      alert('Failed to remove address. Please try again.');
    } finally {
      setIsRemoving(false);
    }
  }, [addressToDelete, removeSavedAddress, isSavingLoading]);

  const handleCancelRemoveSaved = useCallback(() => {
    setAddressToDelete(null);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <LoadingSpinner className="w-10 h-10 border-4 !ml-0" />
        <p className="ml-4 text-lg text-gray-700">Loading addresses...</p>
      </div>
    );
  }

  return (
    <div className="address-management-container p-4 bg-gray-50">
      {/* <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">Manage Your Addresses</h1> */}

      {isSavingLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-85 flex flex-col justify-center items-center z-[100] transition-opacity duration-300 text-center rounded-lg">
          <LoadingSpinner className="w-10 h-10 border-4 !ml-0" />
          <p className="mt-4 text-xl text-gray-700 font-medium">Processing request...</p>
        </div>
      )}

      {/* Logic for Unauthenticated Users */}
      {memoizedIsGuest && (
        <>
          {/* Default "Add Address" button for unauthenticated users */}
          <AddAddressCard
            onAddAddressClick={onAddAddressClick || handleAddAddressInternal}
            isDisabled={isSavingLoading}
            highlight={highlight}
            isAuthPrompt={true} 
          />
          {/* You can add a subtle prompt here if needed, but the button text already indicates it */}
          <p className="text-center text-gray-600 text-sm mt-2">
            Log in to save and manage multiple addresses.
          </p>
        </>
      )}

      {/* Logic for Authenticated Users */}
      {!memoizedIsGuest && (
        <>
          {/* Always show AddAddressCard for authenticated users */}
          <AddAddressCard
            onAddAddressClick={onAddAddressClick || handleAddAddressInternal}
            isDisabled={isSavingLoading}
            highlight={highlight}
          />

          {/* Show MySavedAddressesList only if authenticated AND savedAddresses exist */}
          {savedAddresses.length > 0 ? (
            <MySavedAddressesList
              savedAddresses={savedAddresses}
              isSavingLoading={isSavingLoading}
              onAddressSelected={handleSelectSavedAddress}
              onEditAddress={handleEditSavedAddress}
              onDeleteAddress={handleDeleteSavedAddress}
              addressToDelete={addressToDelete}
              isRemoving={isRemoving}
              onConfirmDelete={handleConfirmRemoveSaved}
              onCancelDelete={handleCancelRemoveSaved}
              title="Your Saved Delivery Addresses"
            />
          ) : (
            // Message for authenticated users with no saved addresses (below the Add Address button)
            <p className="text-center text-gray-600 mt-4">
              You haven't saved any addresses yet. Add your first address!
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default AddressManagementSection; // Changed export to match common practice for main component