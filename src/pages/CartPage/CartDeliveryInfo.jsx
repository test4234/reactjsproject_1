import React from 'react';

const CartDeliveryInfo = ({ totalItems }) => {
    return (
        <div className="w-full bg-white p-4">
            <div className="flex items-center gap-4">
                {/* Image Container */}
                <div className="relative flex items-center justify-center p-1 rounded-md bg-green-100">
                    <img 
                        alt="Delivery icon" 
                        src="https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=180/assets/eta-icons/15-mins-filled.png" 
                        loading="lazy" 
                        className="w-8 h-8 object-contain"
                    />
                </div>
                {/* Text Wrapper */}
                <div className="flex flex-col">
                    <div className="text-sm font-bold text-gray-900">
                        Delivery by <span className="text-green-600">Tomorrow, 6–8 AM</span>
                    </div>
                    <div className="text-xs text-gray-500 font-medium mt-1">
                        Shipment of {totalItems} item{totalItems !== 1 ? 's' : ''}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartDeliveryInfo;