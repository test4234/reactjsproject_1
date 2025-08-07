import React, {
    createContext,
    useState,
    useEffect,
    useContext,
    useCallback,
    useMemo
} from "react";

export const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};

export const useCartState = () => {
    const { cart, loading } = useCart();
    return { cart, loading };
};

export const useCartActions = () => {
    const {
        handleAddToCart,
        handleRemoveFromCart,
        changeItemQuantityInCart,
        removeItemFromCartById,
        clearCart
    } = useCart();
    return {
        handleAddToCart,
        handleRemoveFromCart,
        changeItemQuantityInCart,
        removeItemFromCartById,
        clearCart
    };
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const storedCart = localStorage.getItem("cart");
        return storedCart ? JSON.parse(storedCart) : [];
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    const getProductQuantityFormat = useCallback((productId, productsList) => {
        const product = productsList?.find(p => p._id === productId);
        return product?.quantity_format?.type || 'weight';
    }, []);

    const handleAddToCart = useCallback((productToAdd, quantity) => {
        setCart(prevCart => {
            const productInCart = prevCart.find(item => item.id === productToAdd._id);
            const baseQty = parseInt(productToAdd.quantity_format?.qty || 0, 10);

            if (productInCart) {
                return prevCart.map(item =>
                    item.id === productToAdd._id ? { ...item, quantity } : item
                );
            } else {
                return [
                    ...prevCart,
                    {
                        id: productToAdd._id,
                        name: productToAdd.name,
                        image: productToAdd.images?.[0] || '',
                        quantity,
                        base_qty: baseQty,
                        quantity_format: productToAdd.quantity_format?.type,
                        price:
                            productToAdd.quantity_format?.type === 'weight'
                                ? (productToAdd.discounted_price * quantity) / 1000
                                : productToAdd.discounted_price
                    }
                ];
            }
        });
    }, []);

    const handleRemoveFromCart = useCallback(productId => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    }, []);

    const changeItemQuantityInCart = useCallback(
        (productId, action, quantityFormatOrAmount = null, productsList = []) => {
            setCart(prevCart => {
                return prevCart.reduce((updatedCart, item) => {
                    if (item.id !== productId) {
                        updatedCart.push(item);
                        return updatedCart;
                    }

                    let newQuantity = item.quantity;
                    const format = typeof quantityFormatOrAmount === "string"
                        ? quantityFormatOrAmount
                        : getProductQuantityFormat(productId, productsList);

                    const baseQty = parseInt(item.base_qty || 0, 10);
                    const isUnit = format === 'unit';
                    const step = isUnit ? 1 : 250;
                    const minQty = isUnit ? 1 : 250 + baseQty;

                    if (action === 'increment') {
                        newQuantity += step;
                        updatedCart.push({ ...item, quantity: newQuantity });
                    } else if (action === 'decrement') {
                        const decreased = newQuantity - step;

                        if (decreased < minQty) {
                            // Remove item from cart
                            return updatedCart;
                        } else {
                            updatedCart.push({ ...item, quantity: decreased });
                        }
                    }

                    return updatedCart;
                }, []);
            });
        },
        [getProductQuantityFormat]
    );

    const removeItemFromCartById = useCallback(productId => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    }, []);

    const clearCart = useCallback(() => {
        setCart([]);
        localStorage.removeItem('cart');
    }, []);

    const getQuantityDisplay = useCallback((quantity, quantityFormat) => {
        if (quantityFormat === 'unit') {
            return quantity === 1 ? '1 unit' : `${quantity} units`;
        } else {
            if (quantity >= 1000) {
                const kg = quantity / 1000;
                return kg % 1 === 0 ? `${kg}kg` : `${kg.toFixed(1)}kg`;
            }
            return `${quantity}g`;
        }
    }, []);

    const calculateItemTotal = useCallback((price, quantity, quantityFormat) => {
        if (quantityFormat === 'unit') {
            return price * quantity;
        } else {
            return (price * quantity) / 1000;
        }
    }, []);

    const getDefaultQuantity = useCallback((productId, productsList = []) => {
        const format = getProductQuantityFormat(productId, productsList);
        return format === 'unit' ? 1 : 250;
    }, [getProductQuantityFormat]);

    const cartContextValue = useMemo(() => ({
        loading,
        cart,
        setCart,
        handleAddToCart,
        handleRemoveFromCart,
        changeItemQuantityInCart,
        removeItemFromCartById,
        clearCart,
        getProductQuantityFormat,
        getQuantityDisplay,
        calculateItemTotal,
        getDefaultQuantity
    }), [
        loading,
        cart,
        handleAddToCart,
        handleRemoveFromCart,
        changeItemQuantityInCart,
        removeItemFromCartById,
        clearCart,
        getProductQuantityFormat,
        getQuantityDisplay,
        calculateItemTotal,
        getDefaultQuantity
    ]);

    return (
        <CartContext.Provider value={cartContextValue}>
            {children}
        </CartContext.Provider>
    );
};
