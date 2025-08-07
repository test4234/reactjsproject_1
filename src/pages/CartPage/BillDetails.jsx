import React from 'react';

const BillDetails = React.memo(({
    itemsTotal,
    discount = 0,
    totalSavings = 0, // A new prop to pass the total savings amount
    deliveryCharge = 0,
    handlingCharge = 0,
    gstRate = 0,
    tip = 0,
}) => {
    // Calculate GST based on itemsTotal
    const gstAmount = (itemsTotal * gstRate) / 100;

    // Calculate the final Grand Total without platformCharge
    const grandTotal = itemsTotal + deliveryCharge + handlingCharge + gstAmount + tip - discount;

    return (
        <div className="p-4 bg-white border-t border-gray-200 text-black ">
            <h3 className="text-base font-semibold mb-3">Bill Details</h3>
            
            {/* Items Total */}
            <div className="flex justify-between my-1.5 text-sm text-gray-700">
                <span>Items Total</span>
                <span>₹{(itemsTotal || 0).toFixed(2)}</span>
            </div>

            {/* Discount */}
            {discount > 0 && (
                <div className="flex justify-between my-1.5 text-sm text-red-500 font-medium">
                    <span>Discount</span>
                    <span>- ₹{discount.toFixed(2)}</span>
                </div>
            )}
            
            {/* Delivery Charges */}
            <div className="flex justify-between my-1.5 text-sm text-gray-700">
                <span>Delivery Charges</span>
                <span>
                    {deliveryCharge === 0 ? (
                        <span className="text-green-600 font-medium">Free</span>
                    ) : (
                        <span>₹{deliveryCharge.toFixed(2)}</span>
                    )}
                </span>
            </div>

            {/* Handling Charges */}
            <div className="flex justify-between my-1.5 text-sm text-gray-700">
                <span>Handling Charges</span>
                <span>
                    {handlingCharge === 0 ? (
                        <span className="text-green-600 font-medium">Free</span>
                    ) : (
                        <span>₹{handlingCharge.toFixed(2)}</span>
                    )}
                </span>
            </div>

            {/* GST */}
            {gstAmount > 0 && (
                <div className="flex justify-between my-1.5 text-sm text-gray-700">
                    <span>GST ({gstRate}%)</span>
                    <span>₹{gstAmount.toFixed(2)}</span>
                </div>
            )}

            {/* Tip */}
            {tip > 0 && (
                <div className="flex justify-between my-1.5 text-sm text-gray-700">
                    <span>Tip</span>
                    <span>₹{tip.toFixed(2)}</span>
                </div>
            )}

            {/* You Saved section - New addition */}
            {totalSavings > 0 && (
                <div className="flex justify-between pt-2.5 border-t border-gray-300 font-bold text-base mt-4 text-green-600">
                    <span>You Saved</span>
                    <span>₹{totalSavings.toFixed(2)}</span>
                </div>
            )}

            {/* Grand Total */}
            <div className="flex justify-between pt-2.5 border-t border-gray-300 font-bold text-lg mt-1.5">
                <span>Grand Total</span>
                <span>₹{grandTotal.toFixed(2)}</span>
            </div>
        </div>
    );
});

export default BillDetails;