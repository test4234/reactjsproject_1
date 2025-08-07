import React from 'react';
// import './UnavailableItemsDisplay.css'; // Remove this line!

const UnavailableItemsDisplay = React.memo(({ unavailableItems, onRemoveUnavailableItems }) => {
    if (unavailableItems.length === 0) return null;

    return (
        <div className="p-2.5 border border-red-200 bg-red-50 rounded-lg m-3">
            <h2 className="text-lg text-red-700 mb-3 font-bold">Unavailable Items</h2>
            {unavailableItems.map((product) => (
                <div key={product._id} className="flex items-center border-t border-red-300 mb-2.5 shadow-none bg-transparent pt-2.5 first:border-t-0 first:mt-2.5">
                    <img
                        src={product?.images?.[0] || 'https://placehold.co/80x80'}
                        alt={product?.name || 'Product'}
                        className="w-[70px] h-[70px] rounded-lg object-cover border border-gray-200 mr-3 opacity-60"
                        loading="lazy"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                        <div className="text-base font-medium text-red-700 mb-1">{product?.name || 'Unavailable Product'}</div>
                        <div className="flex items-center justify-between">
                            <div className="text-sm italic text-red-600">Not available for your location</div>
                        </div>
                    </div>
                </div>
            ))}
            <div className="flex justify-center mt-3 pt-2.5 border-t border-red-300">
                <button
                    className="bg-red-600 text-white border-none py-2.5 px-3.5 rounded-md cursor-pointer text-sm font-bold transition-colors duration-300 hover:bg-red-700"
                    onClick={onRemoveUnavailableItems}
                >
                    Remove Unavailable Items
                </button>
            </div>
        </div>
    );
});

export default UnavailableItemsDisplay;