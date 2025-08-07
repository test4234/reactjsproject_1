import React from 'react';
import CartItemDisplay from './CartItemDisplay'; // Ensure correct path
// import './CartItemsList.css'; // Remove this line!

const CartItemsList = React.memo(({ cart, productsData, handleIncrement, handleDecrement, getQuantityDisplay, calculateItemTotal, safeParseFloat }) => {
    return (
        <div className=" overflow-y-auto px-3 md:max-h-[calc(100vh-250px)]">
            {cart.map((product) => {
                const productData = productsData.find(p => p._id === product.id);
                return (
                    <CartItemDisplay
                        key={product.id}
                        product={product}
                        productData={productData}
                        onIncrement={handleIncrement}
                        onDecrement={handleDecrement}
                        getQuantityDisplay={getQuantityDisplay}
                        calculateItemTotal={calculateItemTotal}
                        safeParseFloat={safeParseFloat}
                    />
                );
            })}
        </div>
    );
});

export default CartItemsList;