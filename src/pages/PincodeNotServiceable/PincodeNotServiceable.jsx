// src/pages/PincodeNotServiceable/PincodeNotServiceable.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PincodeNotServiceable.module.css'; // Import the CSS module
import { useCart } from '../../context/CartContext'; // Assuming this path

const PincodeNotServiceable = () => {
    const navigate = useNavigate();
    const { selectedPincode } = useCart(); // Get the selectedPincode from CartContext

    const handleChangeAddressClick = () => {
        navigate('/address'); // Navigate to the address selection page
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Service Unavailable</h1>
                {selectedPincode ? (
                    <p className={styles.message}>
                        Unfortunately, delivery is not available for your selected pincode:{' '}
                        <span className={styles.pincode}>{selectedPincode}</span>.
                    </p>
                ) : (
                    <p className={styles.message}>
                        It looks like you haven't selected a delivery pincode yet, or the
                        selected area is not serviceable.
                    </p>
                )}

                <p className={styles.instruction}>
                    Please change your address to continue Browse products.
                </p>

                <button
                    className={styles.changeAddressButton}
                    onClick={handleChangeAddressClick}
                >
                    Change Address
                </button>

                {/* Optional: Add an illustration or icon */}
                <div className={styles.illustration}>
                    {/* You can put an SVG, an image, or an icon here */}
                    {/* Example: A simple "location off" icon or a delivery truck with a cross */}
                    <svg width="100" height="100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" fill="currentColor"/>
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" fill="url(#paint0_linear)"/>
                        <path d="M2 2L22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <defs>
                            <linearGradient id="paint0_linear" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#FF0000"/>
                                <stop offset="1" stopColor="#FF0000" stopOpacity="0"/>
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default PincodeNotServiceable;