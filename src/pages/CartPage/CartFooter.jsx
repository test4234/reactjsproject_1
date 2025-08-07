import React, { useState } from 'react';

// New Modal Component
const PaymentModal = ({ isOpen, onClose, onSelect, currentMethod }) => {
    if (!isOpen) return null;

    return (
<div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/10 backdrop-blur-sm">

         <div className="bg-white w-full h-[70vh] rounded-t-xl p-6 shadow-lg overflow-y-auto">

                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Select Payment Method</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={() => onSelect('online')} 
                        className={`w-full py-3 px-4 rounded-lg border-2 font-semibold transition-colors duration-200 
                            ${currentMethod === 'online' 
                                ? 'bg-green-50 text-green-700 border-green-500' 
                                : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                            }`}
                    >
                        Online Payment
                    </button>
                    <button 
                        onClick={() => onSelect('cod')} 
                        className={`w-full py-3 px-4 rounded-lg border-2 font-semibold transition-colors duration-200 
                            ${currentMethod === 'cod' 
                                ? 'bg-green-50 text-green-700 border-green-500' 
                                : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                            }`}
                    >
                        Cash on Delivery (COD)
                    </button>
                </div>
            </div>
        </div>
    );
};

const CartFooter = React.memo(({
    totalAmount,
    paymentMethod,
    setPaymentMethod,
    onPlaceOrder,
    minOrderAmount
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const isMinimumOrderMet = totalAmount >= minOrderAmount;
    const amountNeeded = minOrderAmount - (totalAmount || 0);

    const handleSelectPayment = (method) => {
        setPaymentMethod(method);
        setIsModalOpen(false);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[999] bg-white border-t border-gray-300 shadow-[0_-1px_6px_rgba(0,0,0,0.1)] py-4 px-4">
            <div className="flex items-center justify-between h-full">
                {/* Left side: Pay using button to open modal */}
                <div className="flex flex-col items-start gap-1">
                    <span className="text-sm text-gray-500 font-medium">Pay using</span>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className={`flex items-center gap-2 py-2 pl-3 pr-2 rounded-lg border-2 text-sm font-bold transition-all duration-200 focus:outline-none
                            ${paymentMethod === 'cod'
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-300 text-gray-700'
                            }`}
                    >
                        <span>{paymentMethod === 'cod' ? 'COD' : 'Online'}</span>
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                        </svg>
                    </button>
                </div>

                {/* Right side: Button with price and action text */}
                <button
                    className={`flex-1 ml-4 flex items-center justify-center gap-2 py-5 px-4 text-sm font-bold border-none rounded-lg cursor-pointer transition-colors duration-200 text-center
                        ${isMinimumOrderMet
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-300 text-black cursor-not-allowed opacity-70'
                        }
                    `}
                    onClick={onPlaceOrder}
                    disabled={!isMinimumOrderMet}
                    title={!isMinimumOrderMet ? `Minimum order amount is ₹${minOrderAmount}` : ''}
                >
                    {!isMinimumOrderMet
                        ? `Add ₹${amountNeeded.toFixed(2)} more`
                        : (
                            <span className="flex items-center w-full justify-between">
                                <span className="flex items-center gap-2">
                                    <span className="text-xs font-normal">Total</span>
                                    <span className="font-semibold text-lg leading-none">
                                        ₹{(totalAmount || 0).toFixed(2)}
                                    </span>
                                </span>
                                
                                <span className="flex items-center gap-1 leading-none">
                                    Order Now
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                    </svg>
                                </span>
                            </span>
                        )
                    }
                </button>
            </div>

            {/* Payment Method Modal */}
            <PaymentModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSelect={handleSelectPayment} 
                currentMethod={paymentMethod}
            />
        </div>
    );
});

export default CartFooter;