import React, { useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from 'react-router-dom';
import { LocationContext } from "../../context/LocationContext";
import { fbTrack } from '../../utils/facebookPixel';

import CartSkeleton from './CartSkeleton';
import OrderConfirmationModal from './OrderConfirmationModal';
import CartAddressSection from './CartAddressSection';
import CartEmptyState from './CartEmptyState';
import UnavailableItemsDisplay from './UnavailableItemsDisplay';
import CartItemsList from './CartItemsList';
import BillDetails from './BillDetails';
import CartFooter from './CartFooter';
import CartHeader from './CartHeader';
import CartDeliveryInfo from './CartDeliveryInfo';
import AddressSelector from '../../components/AddressSelector/AddressSelector';
import Addressselectormodal from '../../components/modal/Addressselectormodal';
import LoginModal from '../../components/Loginmodal/LoginModal';
import usePaymentLogic from './hooks/usePaymentLogic';

// Import charges data from the JSON file
import chargesData from './charges.json';

const MINIMUM_ORDER_AMOUNT = 50;

// Razorpay script loader
const useRazorpayScript = () => {
    const loader = useCallback(() => {
        return new Promise((resolve) => {
            if (window.Razorpay) return resolve(true);
            const script = document.createElement('script');
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    }, []);
    return loader;
};

const CartPage = () => {
    const { cart, changeItemQuantityInCart, removeItemFromCartById, clearCart, handleRemoveFromCart } = useContext(CartContext);
    const { user, isGuest } = useContext(AuthContext);
    const { location, savedAddresses, setLocation } = useContext(LocationContext);

    const [showModal, setShowModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [productsData, setProductsData] = useState([]);
    const [unavailableItems, setUnavailableItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [showAddressSelectorModal, setShowAddressSelectorModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    const selectedPincode = useMemo(() => location?.pincode, [location?.pincode]);
    const selectedAddress = useMemo(() => {
        if (!location) return null;
        return {
            name: location.customer_name || user?.name || '',
            apartment: location.apartment || '',
            street: location.street || '',
            type: location.address_type || '',
            lat: location.lat,
            lon: location.lon,
            pincode: location.pincode,
            address: location.full_address || '',
        };
    }, [location, user]);

    const PRODUCTSFETCH_IDS = import.meta.env.VITE_PRODUCTSAPI_IDS_URL;
    const fetchedProductIdsRef = useRef(new Set());
    const [cachedProductsData, setCachedProductsData] = useState(new Map());

    const safeParseFloat = useCallback((value, fallback = 0) => {
        const parsed = parseFloat(value);
        return isNaN(parsed) || !isFinite(parsed) ? fallback : parsed;
    }, []);
    const getQuantityDisplay = useCallback((quantity, quantityFormat) => {
        if (quantityFormat === 'unit') {
            return `${quantity} unit${quantity > 1 ? 's' : ''}`;
        }
        return `${quantity}g`;
    }, []);
    const calculateItemTotal = useCallback((price, quantity, quantityFormat) => {
        if (quantityFormat === 'unit') {
            return price * quantity;
        }
        return (price * quantity) / 1000;
    }, []);
    const calculateItemSavings = useCallback((actualPrice, discountedPrice, quantity, quantityFormat) => {
        if (actualPrice <= discountedPrice) return 0;
        const savingsPerUnit = actualPrice - discountedPrice;
        if (quantityFormat === 'unit') {
            return savingsPerUnit * quantity;
        }
        return (savingsPerUnit * quantity) / 1000;
    }, []);
    
    // itemsTotal is the sum of all item prices, before any other charges/discounts
    const itemsTotal = useMemo(() => {
        if (!productsData.length || !cart.length) {
            return 0;
        }
        try {
            return cart.reduce((acc, product) => {
                const productData = productsData.find(p => p._id === product.id);
                if (productData?.discounted_price && product.quantity) {
                    const price = safeParseFloat(productData.discounted_price, 0);
                    const quantity = safeParseFloat(product.quantity, 0);
                    if (price > 0 && quantity > 0) {
                        return acc + calculateItemTotal(price, quantity, productData.quantity_format?.type);
                    }
                }
                return acc;
            }, 0);
        } catch (err) {
            console.error('Error calculating cart totals:', err);
            return 0;
        }
    }, [cart, productsData, safeParseFloat, calculateItemTotal]);
    
    // Example values for discount and tip (these could come from state)
    const discount = 0.00;
    const tip = 0.00;

    // Calculate the final grand total using itemsTotal and charges from the JSON
    const grandTotal = useMemo(() => {
        const gstAmount = (itemsTotal * chargesData.gstRate) / 100;
        return itemsTotal + chargesData.deliveryCharge + chargesData.handlingCharge + chargesData.platformCharge + gstAmount + tip - discount;
    }, [itemsTotal]);

    const totalSavings = useMemo(() => {
        let savings = 0;
        cart.forEach(item => {
            const productData = productsData.find(p => p._id === item.id);
            if (productData) {
                const actualPrice = safeParseFloat(productData.actual_price, 0);
                const discountedPrice = safeParseFloat(productData.discounted_price, 0);
                const quantity = safeParseFloat(item.quantity, 0);
                savings += calculateItemSavings(actualPrice, discountedPrice, quantity, productData.quantity_format?.type);
            }
        });
        return savings; // Corrected: Return the number, not a formatted string.
    }, [cart, productsData, safeParseFloat, calculateItemSavings]);

    const loadRazorpayScript = useRazorpayScript();

    const {
        initiatePayment,
        confirmOrder,
        handlePayOnlineInitiation,
        payOnlineLoading,
        showCodLimitOnlineOption,
        activeCodOrderMessage,
        orderStatus,
        closeModal,
        setShowCodLimitOnlineOption
    } = usePaymentLogic(
        cart,
        user,
        location,
        grandTotal, // Use the new grandTotal here
        useCallback((cartItems, productsData) => {
            return cartItems.map(item => {
                const product = productsData.find(p => p._id === item.id);
                if (!product) return null;
                const price = safeParseFloat(product.discounted_price, 0);
                let quantity;
                if (product.quantity_format?.type === 'unit') {
                    quantity = safeParseFloat(item.quantity, 1);
                } else {
                    quantity = safeParseFloat(item.quantity, 250);
                }
                if (price <= 0 || quantity <= 0) return null;
                return {
                    productId: item.id,
                    name: product.name || 'Unknown Product',
                    price: price,
                    quantity: quantity,
                };
            }).filter(item => item !== null);
        }, [safeParseFloat]),
        MINIMUM_ORDER_AMOUNT,
        setShowModal,
        isGuest,
        clearCart,
        navigate,
        fbTrack,
        loadRazorpayScript
    );

    const productIds = useMemo(() =>
        cart.map(item => item.id).filter(id => id !== undefined && id !== null),
        [cart]
    );

    const openLoginModal = useCallback(() => setShowLoginModal(true), []);
    const closeLoginModal = useCallback(() => setShowLoginModal(false), []);
    const handleIncrement = useCallback((productId, quantityFormat) => {
        changeItemQuantityInCart(productId, 'increment', quantityFormat);
    }, [changeItemQuantityInCart]);
    const handleDecrement = useCallback((productId, currentQuantity, quantityFormat) => {
        const minQuantity = quantityFormat === 'unit' ? 1 : 250;
        if (currentQuantity <= minQuantity) {
            handleRemoveFromCart(productId);
        } else {
            changeItemQuantityInCart(productId, 'decrement', quantityFormat);
        }
    }, [changeItemQuantityInCart, handleRemoveFromCart]);
    const handleAddressChange = useCallback(() => {
        if (isGuest || (user && user._id && savedAddresses.length === 0)) {
            openLoginModal();
        } else if (savedAddresses && savedAddresses.length > 0) {
            setShowAddressSelectorModal(true);
        }
    }, [isGuest, user, savedAddresses, openLoginModal]);
    const handleLogin = useCallback(() => {
        navigate('/login');
    }, [navigate]);
    const handleRemoveUnavailableItems = useCallback(() => {
        unavailableItems.forEach(p => removeItemFromCartById(p._id));
        setUnavailableItems([]);
    }, [unavailableItems, removeItemFromCartById]);

    useEffect(() => {
        if (cart.length === 0 && !loading && !showModal && !showCodLimitOnlineOption && !showAddressSelectorModal && !showLoginModal) {
            navigate('/');
        }
    }, [cart.length, loading, navigate, showModal, showCodLimitOnlineOption, showAddressSelectorModal, showLoginModal]);
    useEffect(() => {
        if (cart.length > 0) {
            localStorage.setItem('cart', JSON.stringify(cart));
        } else {
            localStorage.removeItem('cart');
        }
    }, [cart]);
    useEffect(() => {
        if (productIds.length === 0) {
            setProductsData([]);
            setUnavailableItems([]);
            setLoading(false);
            return;
        }
        if (!selectedPincode) {
            setLoading(false);
            return;
        }
        const fetchProductsData = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${PRODUCTSFETCH_IDS}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        productIds,
                        pincode: selectedPincode
                    }),
                });
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                const data = await res.json();
                const newCachedData = new Map(cachedProductsData);
                data.forEach(product => {
                    newCachedData.set(product._id, product);
                    fetchedProductIdsRef.current.add(product._id);
                });
                setCachedProductsData(newCachedData);
                let validProducts = [];
                let unavailable = [];
                data.forEach(product => {
                    const isActuallyAvailable =
                        product.available === true &&
                        product.stock > 0 &&
                        product.discounted_price !== null && product.discounted_price > 0;
                    if (isActuallyAvailable) {
                        validProducts.push(product);
                    } else {
                        const cartItem = cart.find(item => item.id === product._id);
                        unavailable.push({
                            ...product,
                            quantity: cartItem ? cartItem.quantity : 0
                        });
                    }
                });
                const returnedProductIds = new Set(data.map(p => p._id));
                cart.forEach(cartItem => {
                    if (!returnedProductIds.has(cartItem.id)) {
                        unavailable.push({
                            _id: cartItem.id,
                            name: 'Unknown Product (Not found)',
                            images: [],
                            message: "Product not found or unavailable for pincode",
                            quantity: cartItem.quantity
                        });
                    }
                });
                setProductsData(validProducts);
                setUnavailableItems(unavailable);
            } catch (err) {
                console.error("Error fetching product details:", err);
                setError('Failed to load product details. Please try again.');
                setProductsData([]);
                setUnavailableItems([]);
            } finally {
                setLoading(false);
            }
        };
        const hasAllProductsInCache = productIds.every(id => fetchedProductIdsRef.current.has(id));
        if (productIds.length > 0 && selectedPincode && (!hasAllProductsInCache || cachedProductsData.size === 0)) {
            fetchProductsData();
        } else if (productIds.length === 0) {
            setLoading(false);
        }
    }, [productIds.join(','), selectedPincode, cart, cachedProductsData, PRODUCTSFETCH_IDS]);
    useEffect(() => {
        fetchedProductIdsRef.current.clear();
        setCachedProductsData(new Map());
    }, [selectedPincode]);
    useEffect(() => {
        if (productsData.length > 0) {
            const updatedUnavailableItems = unavailableItems.map(unavailableItem => {
                const cartItem = cart.find(item => item.id === unavailableItem._id);
                return {
                    ...unavailableItem,
                    quantity: cartItem ? cartItem.quantity : 0
                };
            });
            const hasQuantityChanges = updatedUnavailableItems.some((item, index) =>
                unavailableItems[index]?.quantity !== item.quantity
            );
            if (hasQuantityChanges) {
                setUnavailableItems(updatedUnavailableItems);
            }
        }
    }, [cart, productsData.length, unavailableItems]);
    const handlePayOnlineFromModal = useCallback(async () => {
        await handlePayOnlineInitiation(productsData, selectedAddress);
        setShowCodLimitOnlineOption(false);
    }, [handlePayOnlineInitiation, productsData, selectedAddress, setShowCodLimitOnlineOption]);
    const handleAddressSelectedFromSelector = useCallback((selectedAddressFromModal) => {
        if (setLocation) setLocation(selectedAddressFromModal);
        setShowAddressSelectorModal(false);
    }, [setLocation]);
    const closeAddressSelectorModal = useCallback(() => {
        setShowAddressSelectorModal(false);
    }, []);
    const handlePlaceOrderClick = useCallback(() => {
        const validLocationTypes = ['home', 'work', 'others'];
        const currentLocationType = location?.address_type?.toLowerCase() || location?.type?.toLowerCase();
        if (grandTotal < MINIMUM_ORDER_AMOUNT) {
            alert(`Your cart total is below the minimum order amount of ₹${MINIMUM_ORDER_AMOUNT}. Please add more items.`);
            return;
        }
        if (!selectedAddress || !selectedAddress.pincode) {
            alert('Please select a delivery address before placing your order.');
            return;
        }
        if (isGuest || (user && user._id && (!savedAddresses || savedAddresses.length === 0))) {
            openLoginModal();
            return;
        }
        if (user && user._id && !validLocationTypes.includes(currentLocationType)) {
            setShowAddressSelectorModal(true);
            return;
        }
        initiatePayment(paymentMethod, productsData, selectedAddress);
    }, [
        grandTotal,
        MINIMUM_ORDER_AMOUNT,
        isGuest,
        user,
        savedAddresses,
        location,
        openLoginModal,
        setShowAddressSelectorModal,
        initiatePayment,
        paymentMethod,
        productsData,
        selectedAddress
    ]);

    if (loading) {
        return <CartSkeleton />;
    }
    if (error) {
        return (
            <div className="flex flex-col min-h-screen bg-gray-50 box-border pb-[100px]">
                <div className="flex flex-col items-center justify-center p-5 text-center">
                    <h2 className="text-xl font-semibold text-red-600 mb-3">Something went wrong</h2>
                    <p className="text-gray-700 mb-5">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors duration-200"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }
    return (
        <div className="flex flex-col min-h-screen bg-gray-50 box-border pb-[100px]">
            <OrderConfirmationModal
                show={showModal || showCodLimitOnlineOption}
                onClose={closeModal}
                onConfirm={() => confirmOrder(productsData, selectedAddress)}
                address={selectedAddress}
                isPlacingOrder={payOnlineLoading}
                orderStatus={orderStatus}
                showPayOnlineButton={showCodLimitOnlineOption}
                onPayOnline={handlePayOnlineFromModal}
                payOnlineLoading={payOnlineLoading}
                activeCodOrderMessage={activeCodOrderMessage}
                totalAmount={grandTotal} // Use the new grandTotal here
                onRedirectToHome={() => navigate('/')}
            />
            {showLoginModal && (
                <LoginModal
                    isOpen={showLoginModal}
                    onClose={() => setShowLoginModal(false)}
                    onLoginSuccess={() => {
                        console.log("User successfully verified mobile");
                    }}
                />
            )}
            <Addressselectormodal
                isOpen={showAddressSelectorModal}
                onClose={closeAddressSelectorModal}
            >
                <AddressSelector
                    isModal={true}
                    modalType="saved_addresses"
                    onAddressSelected={handleAddressSelectedFromSelector}
                    onClose={closeAddressSelectorModal}
                />
            </Addressselectormodal>
            <CartHeader savedAmount={totalSavings} />
            <CartAddressSection
                location={selectedAddress}
                onAddressChange={handleAddressChange}
            />
            {cart.length === 0 ? (
                <CartEmptyState onContinueShopping={() => navigate('/')} />
            ) : (
                <>
                    <CartDeliveryInfo />
                    <UnavailableItemsDisplay
                        unavailableItems={unavailableItems}
                        onRemoveUnavailableItems={handleRemoveUnavailableItems}
                    />
                    <CartItemsList
                        cart={cart}
                        productsData={productsData}
                        handleIncrement={handleIncrement}
                        handleDecrement={handleDecrement}
                        getQuantityDisplay={getQuantityDisplay}
                        calculateItemTotal={calculateItemTotal}
                        safeParseFloat={safeParseFloat}
                    />
                    <BillDetails
                        itemsTotal={itemsTotal}
                        discount={discount}
                        tip={tip}
                        totalSavings={totalSavings} 
                        deliveryCharge={chargesData.deliveryCharge}
                        handlingCharge={chargesData.handlingCharge}
                        gstRate={chargesData.gstRate}
                    />
                </>
            )}
            {cart.length > 0 && (
                <CartFooter
                    totalAmount={grandTotal} 
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    onPlaceOrder={handlePlaceOrderClick}
                    minOrderAmount={MINIMUM_ORDER_AMOUNT}
                />
            )}
        </div>
    );
};

export default CartPage;