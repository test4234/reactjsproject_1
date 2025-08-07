import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import Cookies from 'js-cookie';
import axios from '../utils/axios';
import { AuthContext } from './AuthContext';

export const LocationContext = createContext();
export const LocationActionsContext = createContext();

export const LocationProvider = ({ children }) => {
    const { isGuest, loading: authLoading } = useContext(AuthContext);

    const [location, setLocation] = useState(null);
    const [recentLocations, setRecentLocations] = useState([]);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Initial load for entire context
    const [isSavingLoading, setIsSavingLoading] = useState(false); // NEW: For save/update operations
    const [error, setError] = useState(null);

    // Default location should also align with the new schema if possible
    const DEFAULT_LOCATION = useMemo(() => ({
        _id: 'default_location',
        full_address: 'Machilipatnam, 521001', // Changed 'address' to 'full_address'
        pincode: '521001',
        lat: 16.19042858752346, // Ensure numbers are numbers, not strings
        lon: 81.14152662876882, // Ensure numbers are numbers, not strings
        address_type: 'Default Location', // Changed 'type' to 'address_type', 'label' to 'address_type'
        customer_name: 'Guest User', // Added for consistency
        customer_mobile: 'N/A', // Added for consistency
        apartment: '',
        street: '',
        instructions: ''
    }), []);

    // normalizeAddress should now work with 'full_address'
    const normalizeAddress = useCallback((addressObj) =>
        addressObj?.full_address?.trim().toLowerCase().replace(/\s+/g, ' ') || '',
        []
    );

    const areLocationsEqual = useCallback((loc1, loc2) => {
        if (!loc1 || !loc2) return false;
        return (
            String(loc1.lat) === String(loc2.lat) &&
            String(loc1.lon) === String(loc2.lon) &&
            normalizeAddress(loc1) === normalizeAddress(loc2) // Compare using the normalized full_address
        );
    }, [normalizeAddress]);

    // NEW HELPER FUNCTION: To get a consistent string ID from any location object
    const getLocationStringId = useCallback((loc) => {
        if (!loc) return null;
        // Prioritize actual _id from backend, then tempId (for guests)
        return loc._id ? (loc._id.$oid || loc._id.toString()) : loc.tempId;
    }, []);

    const loadData = useCallback(async () => {
        if (authLoading) return;

        try {
            setIsLoading(true);
            setError(null);

            if (isGuest) {
                const [cookieLocation, cookieRecent] = [
                    Cookies.get('guest_location'),
                    Cookies.get('recent_locations')
                ];

                let fetchedLocation = null;
                let fetchedRecentLocations = [];

                if (cookieLocation) {
                    try {
                        const parsed = JSON.parse(cookieLocation);
                        // Ensure parsed guest location also aligns with new schema for consistency
                        fetchedLocation = {
                            ...parsed,
                            _id: parsed._id || Date.now().toString(), // Use _id directly from cookie if available
                            full_address: parsed.full_address || parsed.address, // Prioritize full_address
                            address_type: parsed.address_type || parsed.type || 'recent', // Prioritize address_type
                            customer_name: parsed.customer_name || parsed.receiver_name || 'Guest User',
                            customer_mobile: parsed.customer_mobile || parsed.receiver_mobile || 'N/A',
                        };
                    } catch (e) {
                        console.error('Error parsing guest_location cookie', e);
                        Cookies.remove('guest_location');
                    }
                }

                if (cookieRecent) {
                    try {
                        const parsed = JSON.parse(cookieRecent);
                        fetchedRecentLocations = parsed.map(loc => ({
                            ...loc,
                            _id: loc._id || Date.now().toString(), // Use _id directly from cookie if available
                            full_address: loc.full_address || loc.address, // Prioritize full_address
                            address_type: loc.address_type || loc.type || 'recent', // Prioritize address_type
                            customer_name: loc.customer_name || loc.receiver_name || 'Guest User',
                            customer_mobile: loc.customer_mobile || loc.receiver_mobile || 'N/A',
                        }));
                    } catch (e) {
                        console.error('Error parsing recent_locations cookie', e);
                        Cookies.remove('recent_locations');
                    }
                }

                setLocation(fetchedLocation || DEFAULT_LOCATION);
                setRecentLocations(fetchedRecentLocations);
                setSavedAddresses([]); // Guests don't have saved addresses

            } else {
                const res = await axios.get('/user/me');
                const {
                    selected_recent_address,
                    multiple_recent_addresses,
                    saved_address
                } = res.data;

                let finalLocation = selected_recent_address;

                // Ensure data from backend matches frontend expectations (e.g., has full_address)
                if (finalLocation) {
                    finalLocation = {
                        ...finalLocation,
                        full_address: finalLocation.full_address || finalLocation.address,
                        address_type: finalLocation.address_type || finalLocation.type,
                        customer_name: finalLocation.customer_name || finalLocation.receiver_name,
                        customer_mobile: finalLocation.customer_mobile || finalLocation.receiver_mobile,
                    };
                }

                // If no pincode (invalid address), fallback to guest cookie or default
                if (!finalLocation?.pincode) {
                    const guestCookie = Cookies.get('guest_location');
                    if (guestCookie) {
                        try {
                            const guestLoc = JSON.parse(guestCookie);
                            finalLocation = {
                                ...guestLoc,
                                _id: guestLoc._id || Date.now().toString(),
                                full_address: guestLoc.full_address || guestLoc.address,
                                address_type: guestLoc.address_type || guestLoc.type || 'recent',
                                customer_name: guestLoc.customer_name || guestLoc.receiver_name || 'Guest User',
                                customer_mobile: guestLoc.customer_mobile || guestLoc.receiver_mobile || 'N/A',
                            };
                        } catch (e) {
                            console.error('Error parsing guest_location cookie (authenticated fallback)', e);
                            Cookies.remove('guest_location');
                            finalLocation = DEFAULT_LOCATION;
                        }
                    } else {
                        finalLocation = DEFAULT_LOCATION;
                    }
                }

                // Process multiple_recent_addresses
                const processedRecent = Array.isArray(multiple_recent_addresses)
                    ? multiple_recent_addresses.slice(0, 5).map(loc => ({
                        ...loc,
                        full_address: loc.full_address || loc.address,
                        address_type: loc.address_type || loc.type,
                        customer_name: loc.customer_name || loc.receiver_name,
                        customer_mobile: loc.customer_mobile || loc.receiver_mobile,
                    }))
                    : [];

                // Process saved_address
                const processedSaved = Array.isArray(saved_address)
                    ? saved_address.map(addr => ({
                        ...addr,
                        full_address: addr.full_address || addr.address,
                        address_type: addr.address_type || addr.type,
                        customer_name: addr.customer_name || addr.receiver_name,
                        customer_mobile: addr.customer_mobile || addr.receiver_mobile,
                    }))
                    : [];

                setLocation(finalLocation);
                setRecentLocations(processedRecent);
                setSavedAddresses(processedSaved);
            }
        } catch (err) {
            console.error('Error loading location data:', err);
            setError('Failed to load location data');
            setLocation(DEFAULT_LOCATION);
        } finally {
            setIsLoading(false);
        }
    }, [isGuest, authLoading, DEFAULT_LOCATION]);


    useEffect(() => {
        loadData();
    }, [loadData]);

    const saveLocation = useCallback(async (selectedLocation) => {
        setIsSavingLoading(true); // Set saving loading true
        try {
            // For guest, generate a temp ID. For authenticated, do NOT generate _id here.
            // The backend will generate/assign the official MongoDB _id.
            const locationToSetInState = isGuest
                ? {
                    ...selectedLocation,
                    _id: selectedLocation._id || Date.now().toString(),
                    full_address: selectedLocation.full_address || selectedLocation.address, // Ensure full_address for guest
                    address_type: selectedLocation.address_type || selectedLocation.type || 'recent',
                    customer_name: selectedLocation.customer_name || selectedLocation.receiver_name || 'Guest User',
                    customer_mobile: selectedLocation.customer_mobile || selectedLocation.receiver_mobile || 'N/A',
                }
                : {
                    ...selectedLocation,
                    full_address: selectedLocation.full_address || selectedLocation.address,
                    address_type: selectedLocation.address_type || selectedLocation.type || 'recent',
                    customer_name: selectedLocation.customer_name || selectedLocation.receiver_name,
                    customer_mobile: selectedLocation.customer_mobile || selectedLocation.receiver_mobile,
                };

            setLocation(locationToSetInState); // Update frontend state immediately

            if (isGuest) {
                Cookies.set('guest_location', JSON.stringify(locationToSetInState), {
                    expires: 7,
                    sameSite: 'strict'
                });

            } else {
                // For authenticated users, send the *content* of the location, aligning to backend schema.
                const backendPayload = {
                    lat: selectedLocation.lat,
                    lon: selectedLocation.lon,
                    full_address: selectedLocation.full_address || selectedLocation.address, // Use full_address
                    pincode: selectedLocation.pincode,
                   address_type: selectedLocation.address_type || selectedLocation.type || 'recent',
                    apartment: selectedLocation.apartment || '',
                    street: selectedLocation.street || '',
                    instructions: selectedLocation.instructions || '', // Pass instructions if available
                    customer_name: selectedLocation.customer_name || selectedLocation.receiver_name || '', // Use customer_name
                    customer_mobile: selectedLocation.customer_mobile || selectedLocation.receiver_mobile || '', // Use customer_mobile
                };

                await axios.put('/user/update', {
                    multiple_recent_addresses: backendPayload, // backend will also set selected_recent_address internally
                });

                loadData(); // Re-fetch all data to get the backend's official _id for `location` and `recentLocations`
            }
        } catch (error) {
            console.error('Failed to save location:', error);
            setError('Failed to save location'); // Set error
            throw error;
        } finally {
            setIsSavingLoading(false); // Reset saving loading
        }
    }, [isGuest, loadData]);

    const savedLocation = useCallback(async (selectedSavedAddress) => {
        setIsSavingLoading(true); // Set saving loading true
        try {
            // Ensure data aligns with frontend's `location` state structure
            const locationWithId = {
                ...selectedSavedAddress, // Spread to copy all properties, including _id
                full_address: selectedSavedAddress.full_address || selectedSavedAddress.address,
                address_type: selectedSavedAddress.address_type || selectedSavedAddress.type,
                customer_name: selectedSavedAddress.customer_name || selectedSavedAddress.receiver_name,
                customer_mobile: selectedSavedAddress.customer_mobile || selectedSavedAddress.receiver_mobile,
                apartment: selectedSavedAddress.apartment || '', // Ensure apartment is present
                street: selectedSavedAddress.street || '', // Ensure street is present
                instructions: selectedSavedAddress.instructions || '', // Ensure instructions are present
            };

            setLocation(locationWithId);

            if (isGuest) {
                Cookies.set('guest_location', JSON.stringify(locationWithId), {
                    expires: 7,
                    sameSite: 'strict',
                });
            } else {
                // Send the saved address details to the backend to set as selected_recent_address
                // The `saved_address` key in updateUserDetails expects a full address object for processing
                await axios.put('/user/update', {
                    saved_address: {
                        lat: locationWithId.lat,
                        lon: locationWithId.lon,
                        full_address: locationWithId.full_address,
                        pincode: locationWithId.pincode,
                        address_type: locationWithId.address_type,
                        apartment: locationWithId.apartment,
                        street: locationWithId.street,
                        instructions: locationWithId.instructions,
                        customer_name: locationWithId.customer_name,
                        customer_mobile: locationWithId.customer_mobile,
                        _id: getLocationStringId(locationWithId) // Pass the original _id
                    },
                });
                loadData(); // Re-fetch to confirm backend state
            }
        } catch (error) {
            console.error('Failed to set saved address as current location:', error);
            setError('Failed to set saved address'); // Set error
            throw error;
        } finally {
            setIsSavingLoading(false); // Reset saving loading
        }
    }, [isGuest, getLocationStringId, loadData]);

    const addRecentLocation = useCallback(async (newLocation) => {
        setIsSavingLoading(true); // Set saving loading true
        try {
            const locationToProcess = {
                ...newLocation,
                full_address: newLocation.full_address || newLocation.address, // Ensure full_address
                address_type: newLocation.address_type || newLocation.type || 'recent', // Ensure address_type
                customer_name: newLocation.customer_name || newLocation.receiver_name || 'Guest User',
                customer_mobile: newLocation.customer_mobile || newLocation.receiver_mobile || 'N/A',
                apartment: newLocation.apartment || '',
                street: newLocation.street || '',
                instructions: newLocation.instructions || '',
            };

            // For guest, generate a temp ID. For authenticated, do NOT generate _id here.
            const locationWithClientTempId = isGuest
                ? { ...locationToProcess, _id: locationToProcess._id || Date.now().toString() }
                : locationToProcess;

            // Use getLocationStringId for consistent comparison
            const newLocationId = getLocationStringId(locationWithClientTempId);
            const exists = recentLocations.some(loc => getLocationStringId(loc) === newLocationId);

            let updatedList;
            if (exists) {
                // If exists, move to top
                updatedList = [
                    locationWithClientTempId,
                    ...recentLocations.filter(loc => getLocationStringId(loc) !== newLocationId)
                ].slice(0, 5);
                console.log('Location already in recent list, moving to top:', newLocationId);
            } else {
                // If new, add to top
                updatedList = [locationWithClientTempId, ...recentLocations].slice(0, 5);
                console.log('Adding new recent location:', newLocationId);
            }

            setRecentLocations(updatedList);

            if (isGuest) {
                Cookies.set('recent_locations', JSON.stringify(updatedList), {
                    expires: 7,
                    sameSite: 'strict'
                });
            } else {
                // For authenticated users, send the content to the backend.
                // The backend will generate the _id and add it to `multiple_recent_addresses`.
                const backendPayload = {
                    lat: locationToProcess.lat,
                    lon: locationToProcess.lon,
                    full_address: locationToProcess.full_address,
                    pincode: locationToProcess.pincode,
                    address_type: 'recent',
                    apartment: locationToProcess.apartment,
                    street: locationToProcess.street,
                    instructions: locationToProcess.instructions,
                    customer_name: locationToProcess.customer_name,
                    customer_mobile: locationToProcess.customer_mobile,
                };
                await axios.put('/user/update', {
                    multiple_recent_addresses: backendPayload,
                });
                loadData(); // Re-fetch to get the backend-assigned _id
            }
        } catch (error) {
            console.error('Failed to add recent location:', error);
            setError('Failed to add recent location'); // Set error
            throw error;
        } finally {
            setIsSavingLoading(false); // Reset saving loading
        }
    }, [isGuest, recentLocations, getLocationStringId, loadData]);

    const removeRecentLocation = useCallback(async (id) => {
        setIsSavingLoading(true); // Set saving loading true
        try {
            // Filter using the consistent ID getter
            const updated = recentLocations.filter(loc =>
                getLocationStringId(loc) !== id
            );
            setRecentLocations(updated);

            // Handle current location update if the deleted one was current
            let isCurrentLocationDeleted = location && getLocationStringId(location) === id;

            if (isGuest) {
                const cookieOptions = { expires: 7, sameSite: 'strict' };
                Cookies.set('recent_locations', JSON.stringify(updated), cookieOptions);
                if (isCurrentLocationDeleted) {
                    const newLocationForCurrent = updated.length > 0 ? updated[0] : DEFAULT_LOCATION;
                    setLocation(newLocationForCurrent);
                    Cookies.set('guest_location', JSON.stringify(newLocationForCurrent), cookieOptions);
                }
            } else {
                // Backend DELETE call. `id` passed here is the correct MongoDB _id string.
                const res = await axios.delete(`/user/recent-address/${id}`);

                // Update frontend state based on backend response if needed
                if (Array.isArray(res.data.multiple_recent_addresses)) {
                    setRecentLocations(res.data.multiple_recent_addresses.map(loc => ({
                        ...loc,
                        full_address: loc.full_address || loc.address,
                        address_type: loc.address_type || loc.type,
                        customer_name: loc.customer_name || loc.receiver_name,
                        customer_mobile: loc.customer_mobile || loc.receiver_mobile,
                    })));
                }
                if (res.data.selected_recent_address) {
                    setLocation({
                        ...res.data.selected_recent_address,
                        full_address: res.data.selected_recent_address.full_address || res.data.selected_recent_address.address,
                        address_type: res.data.selected_recent_address.address_type || res.data.selected_recent_address.type,
                        customer_name: res.data.selected_recent_address.customer_name || res.data.selected_recent_address.receiver_name,
                        customer_mobile: res.data.selected_recent_address.customer_mobile || res.data.selected_recent_address.receiver_mobile,
                    });
                } else if (isCurrentLocationDeleted) {
                    setLocation(DEFAULT_LOCATION); // Fallback if backend didn't provide new selected
                }
            }
        } catch (error) {
            console.error('Failed to remove recent location:', error);
            setError('Failed to remove recent location'); // Set error
            throw error;
        } finally {
            setIsSavingLoading(false); // Reset saving loading
        }
    }, [isGuest, recentLocations, location, DEFAULT_LOCATION, getLocationStringId]);

    const addSavedAddress = useCallback(async (newAddressData) => {
        if (isGuest) {
            console.warn('Guest users cannot add permanent saved addresses.');
            return;
        }
        setIsSavingLoading(true); // Set saving loading true
        try {
            // Frontend does not generate _id for saved addresses, backend will.
            // Ensure newAddressData sent to backend uses the correct keys
            const payload = {
                address_type: newAddressData.address_type || newAddressData.name, // Use address_type
                apartment: newAddressData.apartment || '',
                street: newAddressData.street || '',
                instructions: newAddressData.instructions || '',
                lat: newAddressData.lat,
                lon: newAddressData.lon,
                full_address: newAddressData.full_address || newAddressData.address, // Use full_address
                pincode: newAddressData.pincode || '',
                customer_name: newAddressData.customer_name || newAddressData.receiver_name || '', // Use customer_name
                customer_mobile: newAddressData.customer_mobile || newAddressData.receiver_mobile || '', // Use customer_mobile
            };

            const res = await axios.post('/user/saved-address', payload);
            const newAddress = {
                ...res.data.new_address, // Backend should return the new address with its official _id
                full_address: res.data.new_address.full_address || res.data.new_address.address,
                address_type: res.data.new_address.address_type || res.data.new_address.type,
                customer_name: res.data.new_address.customer_name || res.data.new_address.receiver_name,
                customer_mobile: res.data.new_address.customer_mobile || res.data.new_address.receiver_mobile,
            };

            setSavedAddresses(prev => [newAddress, ...prev]); // Add to the beginning for immediate visibility
            setLocation(newAddress); // Also set it as the current location (from backend response)

        } catch (error) {
            console.error('Failed to add saved address:', error);
            setError('Failed to add saved address'); // Set error
            throw error;
        } finally {
            setIsSavingLoading(false); // Reset saving loading
        }
    }, [isGuest]);

    const updateSavedAddress = useCallback(async (id, updatedAddressData) => {
        if (isGuest) {
            console.warn('Guest users cannot update permanent saved addresses.');
            return;
        }
        setIsSavingLoading(true); // Set saving loading true
        try {
            // Ensure `id` passed is the correct backend MongoDB _id string.
            // Ensure updatedAddressData sent to backend uses the correct keys
            const payload = {
                address_type: updatedAddressData.address_type || updatedAddressData.name,
                apartment: updatedAddressData.apartment || '',
                street: updatedAddressData.street || '',
                instructions: updatedAddressData.instructions || '',
                lat: updatedAddressData.lat,
                lon: updatedAddressData.lon,
                full_address: updatedAddressData.full_address || updatedAddressData.address,
                pincode: updatedAddressData.pincode || '',
                customer_name: updatedAddressData.customer_name || updatedAddressData.receiver_name || '',
                customer_mobile: updatedAddressData.customer_mobile || updatedAddressData.receiver_mobile || '',
            };

            const res = await axios.put(`/user/saved-address/${id}`, payload);
            const returnedSavedAddresses = Array.isArray(res.data.saved_address) ? res.data.saved_address : [];
            const returnedSelectedAddress = res.data.selected_recent_address;

            // Map and update saved addresses
            setSavedAddresses(returnedSavedAddresses.map(addr => ({
                ...addr,
                full_address: addr.full_address || addr.address,
                address_type: addr.address_type || addr.type,
                customer_name: addr.customer_name || addr.receiver_name,
                customer_mobile: addr.customer_mobile || addr.receiver_mobile,
            })));

            // Update current location if it's the same address that was updated or if backend specified new selected
            if (returnedSelectedAddress) {
                setLocation({
                    ...returnedSelectedAddress,
                    full_address: returnedSelectedAddress.full_address || returnedSelectedAddress.address,
                    address_type: returnedSelectedAddress.address_type || returnedSelectedAddress.type,
                    customer_name: returnedSelectedAddress.customer_name || returnedSelectedAddress.receiver_name,
                    customer_mobile: returnedSelectedAddress.customer_mobile || returnedSelectedAddress.receiver_mobile,
                });
            } else if (location && getLocationStringId(location) === id) {
                // If the updated address was the current location, and backend didn't return a new selected,
                // find the updated version in the new savedAddresses array and set it.
                const updatedCurrent = returnedSavedAddresses.find(addr => getLocationStringId(addr) === id);
                if (updatedCurrent) {
                    setLocation(updatedCurrent);
                }
            }

        } catch (error) {
            console.error('Failed to update saved address:', error);
            setError('Failed to update saved address'); // Set error
            throw error;
        } finally {
            setIsSavingLoading(false); // Reset saving loading
        }
    }, [isGuest, location, getLocationStringId]);

    const removeSavedAddress = useCallback(async (id) => {
        setIsSavingLoading(true); // Set saving loading true
        try {
            if (isGuest) {
                const updated = savedAddresses.filter(addr =>
                    getLocationStringId(addr) !== id
                );
                setSavedAddresses(updated);
            } else {
                // Ensure `id` passed is the correct backend MongoDB _id string.
                const res = await axios.delete(`/user/saved-address/${id}`);

                // Process and update saved addresses
                const processedSavedAddresses = Array.isArray(res.data.saved_address)
                    ? res.data.saved_address.map(addr => ({
                        ...addr,
                        full_address: addr.full_address || addr.address,
                        address_type: addr.address_type || addr.type,
                        customer_name: addr.customer_name || addr.receiver_name,
                        customer_mobile: addr.customer_mobile || addr.receiver_mobile,
                    }))
                    : [];
                setSavedAddresses(processedSavedAddresses);

                // Handle current location update if the deleted one was current
                let isCurrentLocationDeleted = location && getLocationStringId(location) === id;
                if (isCurrentLocationDeleted) {
                    const selectedAddressFromBackend = res.data.selected_recent_address;
                    if (selectedAddressFromBackend) {
                        setLocation({
                            ...selectedAddressFromBackend,
                            full_address: selectedAddressFromBackend.full_address || selectedAddressFromBackend.address,
                            address_type: selectedAddressFromBackend.address_type || selectedAddressFromBackend.type,
                            customer_name: selectedAddressFromBackend.customer_name || selectedAddressFromBackend.receiver_name,
                            customer_mobile: selectedAddressFromBackend.customer_mobile || selectedAddressFromBackend.receiver_mobile,
                        });
                    } else {
                        setLocation(DEFAULT_LOCATION); // Fallback if backend didn't provide new selected
                    }
                }
            }
        } catch (error) {
            console.error('Failed to remove saved address:', error);
            setError('Failed to remove saved address'); // Set error
            throw error;
        } finally {
            setIsSavingLoading(false); // Reset saving loading
        }
    }, [isGuest, savedAddresses, location, DEFAULT_LOCATION, getLocationStringId]);

    const locationData = useMemo(() => ({
        location,
        recentLocations,
        savedAddresses,
        isLoading,
        isSavingLoading, // NEW: Expose the saving loading state
        error,
    }), [location, recentLocations, savedAddresses, isLoading, isSavingLoading, error]);

    const locationActions = useMemo(() => ({
        saveLocation,
        addRecentLocation,
        removeRecentLocation,
        savedLocation,
        addSavedAddress,
        updateSavedAddress,
        removeSavedAddress,
        reload: loadData,
    }), [
        saveLocation,
        addRecentLocation,
        removeRecentLocation,
        savedLocation,
        addSavedAddress,
        updateSavedAddress,
        removeSavedAddress,
        loadData,
    ]);

    return (
        <LocationContext.Provider value={locationData}>
            <LocationActionsContext.Provider value={locationActions}>
                {children}
            </LocationActionsContext.Provider>
        </LocationContext.Provider>
    );
};

export const useLocationData = () => {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error('useLocationData must be used within a LocationProvider');
    }
    return context;
};

export const useLocationActions = () => {
    const context = useContext(LocationActionsContext);
    if (!context) {
        throw new Error('useLocationActions must be used within a LocationProvider');
    }
    return context;
};

export const useLocation = () => {
    const data = useLocationData();
    const actions = useLocationActions();
    return { ...data, ...actions };
};