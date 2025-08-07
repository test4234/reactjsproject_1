import React, { useMemo, memo, useEffect } from "react";

const QuantitySelector = memo(({
    isVisible,
    selectedProduct,
    quantity,
    handleSelectQuantity,
    handleConfirm,
    handleClosePopup,
}) => {
    const isWeightBased = selectedProduct?.quantity_format?.type === 'weight';
    const qtyExtra = isWeightBased ? Number(selectedProduct?.quantity_format?.qty || 0) : 0;

    const quantityOptions = useMemo(() => {
        return isWeightBased
            ? [
                { label: "250gm", value: 250 },
                { label: "500gm", value: 500 },
                { label: "1kg", value: 1000 },
            ]
            : [
                { label: "1 piece", value: 1 },
                { label: "2 piece", value: 2 },
                { label: "3 piece", value: 3 },
            ];
    }, [isWeightBased]);

    const basePrice = useMemo(() =>
        selectedProduct?.discounted_price || 0, [selectedProduct]);

    const optionPrices = useMemo(() => {
        return quantityOptions.reduce((acc, option) => {
            let calcValue = option.value;

            if (isWeightBased && qtyExtra) {
                calcValue += qtyExtra;
            }

            const price = isWeightBased
                ? (basePrice / 1000) * calcValue
                : basePrice * option.value;

            acc[option.value] = price.toFixed(2);
            return acc;
        }, {});
    }, [basePrice, quantityOptions, isWeightBased, qtyExtra]);

    const totalPrice = useMemo(() => {
        if (!quantity || !basePrice) return "0.00";

        const calcValue = isWeightBased && qtyExtra
            ? quantity + qtyExtra
            : quantity;

        const price = isWeightBased
            ? (basePrice / 1000) * calcValue
            : basePrice * quantity;

        return price.toFixed(2);
    }, [quantity, basePrice, isWeightBased, qtyExtra]);

    const productImage = useMemo(() =>
        selectedProduct?.images?.[0] ||
        "https://ik.imagekit.io/oj4o1nw9x/Burger%20yankees.jpg?updatedAt=1737365484203",
        [selectedProduct]);

    // ✅ Correct quantity and label sent to cart
    const handleConfirmQuantity = () => {
        const finalQuantity = isWeightBased ? quantity + qtyExtra : quantity;

        const label = isWeightBased && qtyExtra
            ? `${quantity}-${finalQuantity}gm`
            : isWeightBased
                ? `${quantity}gm`
                : `${quantity} piece`;

        handleConfirm({
            product: selectedProduct,
            quantity: finalQuantity,
            price: totalPrice,
            label,
        });
    };

    useEffect(() => {
        if (isVisible) {
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = originalOverflow;
            };
        }
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.73)] flex justify-center items-end z-[1000]">
            {/* Floating Close Icon (center top) */}
            <div className="absolute bottom-[72%] left-1/2 transform -translate-x-1/2 z-[1001]">
                <button
                    onClick={handleClosePopup}
                    aria-label="Close"
                    className="w-10 h-10 rounded-full bg-white text-black text-2xl font-bold 
                           shadow-lg flex items-center justify-center"
                >
                    ×
                </button>
            </div>

            <div className="bg-white w-full max-h-[70%] rounded-t-[15px] shadow-[0_-2px_4px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-green-800 text-white p-4 rounded-t-[15px] flex justify-center items-center">
                    <span className="text-lg font-bold">Select Quantity</span>
                </div>

                {/* Content */}
                <div className="p-5 overflow-y-auto flex-1">
                    {/* Product */}
                    <div className="flex items-center mb-4">
                        <img
                            src={productImage}
                            alt={selectedProduct?.name || "Product"}
                            className="w-[60px] h-[60px] rounded-lg mr-4 object-cover"
                            loading="lazy"
                        />
                        <div className="flex-1">
                            <div className="text-lg font-bold mb-1">
                                {selectedProduct?.name}
                            </div>
                            <div className="text-base">
                                Price: ₹{basePrice} {isWeightBased ? 'per Kg' : 'per unit'}
                            </div>
                        </div>
                    </div>

                    {/* Quantity Options */}
                    <div className="mt-4 space-y-2">
                        {quantityOptions.map((option) => {
                            const isSelected = quantity === option.value;

                          const label = (() => {
    if (isWeightBased && qtyExtra) {
        const endValue = option.value + qtyExtra;
        const startLabel = option.label.replace(/gm|kg/, '').trim();
        return `${startLabel}-${endValue}gm`;
    }

    if (!isWeightBased && selectedProduct?.quantity_format?.qty) {
        const totalPieces = option.value * selectedProduct.quantity_format.qty;
        return `${totalPieces} piece${totalPieces > 1 ? 's' : ''}`;
    }

    return option.label;
})();


                            return (
                                <button
                                    key={option.value}
                                    onClick={() => handleSelectQuantity(option.value)}
                                    className={`w-full flex justify-between items-center px-4 py-3 rounded-xl border-2 transition-all duration-200 
                                        ${isSelected
                                            ? 'bg-green-50 border-green-700'
                                            : 'bg-gray-100 border-transparent hover:bg-green-50'}`}
                                >
                                    <span className="text-base font-medium">
                                        {label}
                                    </span>
                                    <span className="text-base font-bold">
                                        ₹{optionPrices[option.value]}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-300 bg-gray-100">
                    <div className="text-center text-lg font-bold mb-2 text-black">
                        Total Price: ₹{totalPrice}
                    </div>
                    <button
                        onClick={handleConfirmQuantity}
                        disabled={!quantity}
                        className={`w-full py-3 rounded-md font-bold text-white text-center 
                            ${quantity
                                ? 'bg-green-800 hover:bg-green-700'
                                : 'bg-gray-400 cursor-not-allowed'}`}
                    >
                        Confirm
                    </button>
                    {!quantity && (
                        <div className="text-center text-red-600 text-sm mt-2">
                            Please select a quantity option
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

QuantitySelector.displayName = 'QuantitySelector';
export default QuantitySelector;
