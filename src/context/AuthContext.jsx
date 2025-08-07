import React, { createContext, useState, useEffect } from 'react';
import axios from '../utils/axios';
// Removed LocationContext import as it's not directly used here for state, only for schema understanding.
// import { LocationContext } from './LocationContext'; // Not needed here, it's a separate context

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isGuest, setIsGuest] = useState(true);

    console.log(user)

    const getCookie = (name) => {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? decodeURIComponent(match[2]) : null;
    };

    const checkAuth = async () => {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
            // No refresh token, treat as guest
            setUser(null);
            setIsGuest(true);
            setLoading(false);
            return;
        }

        try {
            const res = await axios.get('/user/me');
            setUser(res.data);
            setIsGuest(false);

            // Optionally sync guest location cookie to user profile
            const recentLocationCookie = getCookie('guest_location');
            if (recentLocationCookie) {
                try {
                    const locationData = JSON.parse(recentLocationCookie);

                    // Map the cookie data to the new selected_recent_address schema
                    const formattedLocationData = {
                        full_address: locationData.full_address || locationData.address || '',
                        address_type: locationData.address_type || locationData.type || 'others', // Default type if not specified
                        receiver_name: locationData.receiver_name || res.data.name || '', // Use user's name if not in cookie
                        pincode: locationData.pincode || '',
                        latitude: locationData.latitude || null,
                        longitude: locationData.longitude || null,
                        // Add any other fields from your cookie that should be saved
                    };

                    await axios.put('/user/update', {
                        selected_recent_address: formattedLocationData,
                    });
                    // After successfully syncing, consider removing the guest_location cookie
                    // if it's no longer needed for a logged-in user.
                    // document.cookie = 'guest_location=; Max-Age=0; path=/;';

                } catch (parseErr) {
                    console.error('Error parsing guest_location cookie or updating user address:', parseErr);
                }
            }
        } catch (err) {
            console.error('Authentication check failed:', err); // Log the error for debugging
            setUser(null);
            setIsGuest(true);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        checkAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array means this runs once on mount

    const logout = async () => {
        try {
            // Send refreshToken in body (not as cookie)
            await axios.post('/auth/logout', { refreshToken: localStorage.getItem('refreshToken') });
        } catch (error) {
            console.error('Error during logout:', error);
            // Even if logout fails on server, clear client-side tokens
        } finally {
            setUser(null);
            setIsGuest(true);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        }
    };

    const updateUser = async (updatedData) => {
        try {
            const response = await axios.put('/user/update', updatedData);
            setUser(response.data);
        } catch (error) {
            console.error('Error updating user:', error);
            // Optionally, refresh user data or show an error message
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                checkAuth,
                logout,
                updateUser,
                loading,
                isGuest,
                setIsGuest,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};