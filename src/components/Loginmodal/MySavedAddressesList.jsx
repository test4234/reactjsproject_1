// import React, { useContext, useCallback } from 'react';
// import { useLocationData, useLocationActions } from '../../context/LocationContext';
// import { AuthContext } from '../../context/AuthContext'; // Assuming AuthContext is needed for guest check

// const MySavedAddressesList = ({ onAddressSelected, title = "My Saved Addresses" }) => {
//   const { isGuest } = useContext(AuthContext);
//   const { savedAddresses, isLoading, isSavingLoading } = useLocationData();
//   const { saveLocation } = useLocationActions();

//   // Handle selecting an address
//   const handleSelectAddress = useCallback((address) => {
//     if (isSavingLoading) return; // Prevent actions if something is already processing
//     console.log('Selected address:', address);

//     // Update the global location context (optional, depending on your app's needs)
//     saveLocation(address, 'saved_address');

//     // Call the callback prop to inform the parent component
//     if (onAddressSelected) {
//       onAddressSelected(address);
//     }
//     // You might also want to navigate away here, similar to AddressSelector
//     // navigate('/some-other-page');
//   }, [isSavingLoading, saveLocation, onAddressSelected]);

//   if (isLoading) {
//     return <p>Loading your addresses...</p>;
//   }

//   if (isGuest) {
//     return <p>Please log in to view your saved addresses.</p>;
//   }

//   if (!savedAddresses || savedAddresses.length === 0) {
//     return <p>You have no saved addresses yet.</p>;
//   }

//   return (
//     <div className="saved-addresses-container">
//       <h2>{title}</h2>
//       <ul className="address-list">
//         {savedAddresses.map((address) => (
//           <li
//             key={address._id} // Assuming _id is unique for saved addresses
//             className={`address-item ${isSavingLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
//             onClick={() => handleSelectAddress(address)}
//             style={{
//               padding: '10px',
//               margin: '8px 0',
//               border: '1px solid #ddd',
//               borderRadius: '5px',
//               cursor: isSavingLoading ? 'not-allowed' : 'pointer',
//               backgroundColor: isSavingLoading ? '#f0f0f0' : '#fff',
//               transition: 'background-color 0.2s',
//             }}
//           >
//             <p className="address-label" style={{ fontWeight: 'bold' }}>
//               {address.address_type}
//             </p>
//             <p className="full-address" style={{ fontSize: '0.9em', color: '#555' }}>
//               {address.full_address}
//             </p>
//             {/* You could add edit/delete buttons here if you want those features in this component */}
//           </li>
//         ))}
//       </ul>
//       {isSavingLoading && <p style={{ textAlign: 'center', marginTop: '10px', color: '#777' }}>Processing selection...</p>}
//     </div>
//   );
// };

// export default MySavedAddressesList;