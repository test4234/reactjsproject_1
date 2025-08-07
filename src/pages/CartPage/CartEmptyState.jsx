import React from 'react';
// import './CartEmptyState.css'; // Remove this line

const CartEmptyState = React.memo(({ onContinueShopping }) => {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-[40vh]">
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-4">Add some items to get started!</p>
            <button
                onClick={onContinueShopping}
                className="bg-[#27ae60] text-white border-none py-3 px-6 rounded cursor-pointer mt-4 hover:bg-green-700 transition-colors duration-200"
            >
                Continue Shopping
            </button>
        </div>
    );
});

export default CartEmptyState;