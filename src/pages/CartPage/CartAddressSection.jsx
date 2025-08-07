import React from 'react';

const CartAddressSection = React.memo(({ location, onAddressChange }) => {
    // Determine the title based on address_type, or default if not available
    const addressTitle = location?.type
        ? `Delivering to ${location.type}`
        : 'Delivery Address';

    // Determine the full address to display
    const displayAddress = location?.full_address || location?.address || 'Please choose an address';

    return (
        <div className="
            bg-white /* Clean white background */
            rounded-xl /* More rounded corners for a softer look */
            shadow-sm /* Subtle shadow for depth */
            py-5 px-[10px] /* 10px padding on the left and right, original padding on top and bottom */
            flex justify-between items-center
            border border-gray-100 /* Very subtle border */
        ">
            <div className="flex items-center gap-3">
                {/* Modernized Home Icon - NOW GREEN */}
                <div className="
                    w-10 h-10 /* Larger icon container */
                    flex items-center justify-center
                    rounded-full /* Circular background */
                    bg-green-100 /* Light green background for the icon */
                    text-green-600 /* Green color for the icon */
                ">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-6 h-6" /* Adjusted icon size */
                    >
                        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                    </svg>
                </div>
                <div className="flex flex-col">
                    {/* Address Title */}
                    <div className="text-base font-semibold text-gray-900">
                        {addressTitle}
                    </div>
                    {/* Display Address */}
                    <div className="text-sm text-gray-700 leading-tight pr-2">
                        {displayAddress}
                    </div>
                </div>
            </div>
            {/* Change Address Button - NOW GREEN */}
            <button
                className="
                    flex items-center gap-1
                    text-green-600 font-semibold text-sm /* Green text */
                    py-2 px-3 /* Padding for a button feel */
                    rounded-md /* Softly rounded button */
                    bg-green-50 hover:bg-green-100 /* Light green background, subtle hover effect */
                    transition-colors duration-200 cursor-pointer
                    active:scale-95 transform /* Click effect */
                "
                onClick={onAddressChange}
            >
                Change
                {/* Arrow Icon - color inherited from text-green-600 */}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
            </button>
        </div>
    );
});

export default CartAddressSection;