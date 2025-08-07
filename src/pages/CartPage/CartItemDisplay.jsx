import React from 'react';

const CartItemDisplay = React.memo(({ product, productData, onIncrement, onDecrement, getQuantityDisplay, calculateItemTotal, safeParseFloat }) => {
    if (!productData) return null;

    const price = safeParseFloat(productData?.discounted_price, 0);
    const actualPrice = safeParseFloat(productData?.actual_price, 0);
    const quantity = safeParseFloat(product.quantity, 0);
    const quantityFormat = productData?.quantity_format?.type || 'weight';

    const itemTotal = calculateItemTotal(price, quantity, quantityFormat);
    const originalTotal = calculateItemTotal(actualPrice, quantity, quantityFormat);

    return (
        <div className="flex bg-white items-center py-2 border-b border-gray-200">
            {/* Left Container: Product Image */}
            <div className="flex-shrink-0 p-2">
                <img
                    src={productData?.images?.[0] || 'https://placehold.co/80x80'}
                    alt={productData?.name || 'Product'}
                    className="w-[72px] h-[72px] rounded-lg object-cover"
                    loading="lazy"
                />
            </div>
            {/* Right Container: Product Details */}
            <div className="flex-1 flex flex-col justify-center px-2">
                <div className="font-normal text-sm leading-5 text-gray-800 line-clamp-2 mb-1">
                    {productData?.name || 'Loading...'}
                </div>
                {/* Price and Buttons */}
                <div className="flex items-center justify-between mt-1">
                    {/* Price and Original Price */}
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-green-700 text-base">₹{itemTotal.toFixed(2)}</span>
                        {actualPrice > price && (
                            <span className="line-through text-gray-500 text-sm">₹{originalTotal.toFixed(2)}</span>
                        )}
                    </div>
                    {/* Add/Minus Buttons */}
                  <div
  className="flex items-center rounded-md overflow-hidden"
  style={{ backgroundColor: 'rgb(49, 134, 22)' }}
>
  <button
    onClick={() => onDecrement(product.id, product.quantity, quantityFormat)}
    className="text-white text-sm w-8 h-8 flex items-center justify-center font-bold"
    aria-label="Decrease quantity"
  >
    -
  </button>
  <span className="min-w-5 text-center text-sm font-bold px-1 text-white">
    {getQuantityDisplay(product.quantity, quantityFormat)}
  </span>
  <button
    onClick={() => onIncrement(product.id, quantityFormat)}
    className="text-white text-sm w-8 h-8 flex items-center justify-center font-bold"
    aria-label="Increase quantity"
  >
    +
  </button>
</div>

                </div>
            </div>
        </div>
    );
});

export default CartItemDisplay;