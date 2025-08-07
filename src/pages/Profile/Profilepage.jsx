// src/pages/orders/Profilepage.jsx

import React, { useContext } from 'react'; // Removed unused useState, useEffect
import {
  FaPhone,
  FaMapMarkerAlt,
  FaBox,
  FaStar,
  FaCog,
  FaShieldAlt,
  FaSignOutAlt,
  FaUndoAlt,
  FaChevronRight // Added for navigation arrows
} from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import { LocationContext } from '../../context/LocationContext'; // Keep if using saved addresses
import { useNavigate } from 'react-router-dom';

const Profilepage = () => {
  const { user, logout } = useContext(AuthContext);
  // Keep LocationContext if you plan to re-enable saved addresses display
  const { savedAddresses, isLoading, removeSavedAddress } = useContext(LocationContext);
  const navigate = useNavigate();

  // Navigation Handlers
  const handleClick = (path) => () => { // Curried function for cleaner onClick
    navigate(path);
  };

  // Handler for deleting a saved address (if re-enabled)
  const handleRemoveSavedAddress = (addressId) => {
    removeSavedAddress(addressId);
  };

  const menuItems = [
    { section: "Your Information", items: [
      { label: "Address Saved", icon: <FaMapMarkerAlt />, path: "/address", color: "text-indigo-500" },
      { label: "Orders History", icon: <FaBox />, path: "/orders", color: "text-green-500" },
      { label: "Rewards", icon: <FaStar />, path: "/Rewards", color: "text-yellow-500" },
      { label: "Settings", icon: <FaCog />, path: "/settings", color: "text-gray-500", disabled: true } // Example for a disabled item
    ]},
    { section: "Support", items: [
      { label: "Contact Us", icon: <FaPhone />, path: "/contactus", color: "text-purple-500" },
      { label: "Terms and Conditions", icon: <FaShieldAlt />, path: "/termsandcondtions", color: "text-blue-600" },
      { label: "Refund Policy", icon: <FaUndoAlt />, path: "/refundpolicy", color: "text-red-500" },
    ]}
  ];


  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8"> {/* Lighter background, more vertical padding */}
      <div className="max-w-2xl mx-auto space-y-6"> {/* Wider max-width, consistent spacing */}

        {/* User Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-xl shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xl font-bold mb-1">Hello, {user?.name || 'Rythuri Customer'}</p> {/* Assuming user has a name */}
            <p className="text-sm opacity-90">Mobile: {user?.mobile_number}</p>
          </div>
          {/* You could add a profile picture placeholder here */}
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-semibold">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
        </div>

        {/* Dynamic Sections (Your Information, Support) */}
        {menuItems.map((sectionData, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden"> {/* Improved card styling */}
            <h2 className="text-xl font-semibold text-gray-800 p-5 border-b border-gray-100">{sectionData.section}</h2>
            <ul className="divide-y divide-gray-100"> {/* Subtle dividers */}
              {sectionData.items.map((item, itemIdx) => (
                <li
                  key={itemIdx}
                  className={`flex items-center justify-between p-5 transition duration-200 ease-in-out
                            ${item.disabled ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'}
                          `}
                  onClick={!item.disabled ? handleClick(item.path) : undefined}
                >
                  <div className="flex items-center">
                    <span className={`${item.color} mr-4 text-2xl`}>
                      {item.icon}
                    </span>
                    <span className="text-gray-700 font-medium text-lg">
                      {item.label}
                    </span>
                  </div>
                  {!item.disabled && (
                    <FaChevronRight className="text-gray-400 text-sm" />
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Saved Addresses Snippet (Optional - uncomment to use) */}
        {/*
        {savedAddresses && savedAddresses.length > 0 && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <h2 className="text-xl font-semibold text-gray-800 p-5 border-b border-gray-100">Your Saved Addresses</h2>
            <ul className="divide-y divide-gray-100">
              {isLoading ? (
                <li className="p-5 text-gray-600">Loading addresses...</li>
              ) : (
                savedAddresses.map((address) => (
                  <li key={address._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 hover:bg-gray-50 transition duration-200">
                    <p className="text-gray-700 text-base flex-1 pr-4 mb-2 sm:mb-0">
                      {address.fullAddress}
                    </p>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleClick(`/edit-address/${address._id}`)}
                        className="px-4 py-2 text-sm rounded-full bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemoveSavedAddress(address._id)}
                        className="px-4 py-2 text-sm rounded-full bg-red-50 text-red-700 font-medium hover:bg-red-100 transition"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
            <div className="p-5 border-t border-gray-100 text-center">
                <button
                    onClick={handleClick('/address')}
                    className="text-blue-600 hover:underline font-medium"
                >
                    Manage All Addresses
                </button>
            </div>
          </div>
        )}
        */}

        {/* Logout Button */}
        {user && (
          <button
            onClick={logout}
            className="w-full bg-red-500 text-white py-4 rounded-xl shadow-lg flex items-center justify-center font-semibold text-lg
                       transition transform hover:bg-red-600 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <FaSignOutAlt className="mr-3 text-xl" />
            Logout
          </button>
        )}
      </div>
    </div>
  );
};

export default Profilepage;