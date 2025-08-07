import { useState, useCallback } from 'react';
import api from '../../../utils/axios';

const usePaymentLogic = (
    cart,
    user,
    location,
    totalAmount,
    normalizeCartData,
    MINIMUM_ORDER_AMOUNT,
    setShowModal,
    isGuest,
    clearCart,
    navigate,
    fbTrack,
    loadRazorpayScript // add this as a parameter
) => {
    const [showCodLimitOnlineOption, setShowCodLimitOnlineOption] = useState(false);
    const [payOnlineLoading, setPayOnlineLoading] = useState(false);
    const [activeCodOrderMessage, setActiveCodOrderMessage] = useState("");
    const [orderStatus, setOrderStatus] = useState(null);

    const ORDERS_BASE_URL = import.meta.env.VITE_ORDER_BASE_URL;
    const COD_URL = import.meta.env.VITE_CREATE_CODORDER_URL;
    const ONLINE_URL = import.meta.env.VITE_CREATE_ONLINEORDER_URL;
    const VERIFY_URL = import.meta.env.VITE_VERIFY_PAYMENT_URL || '/api/orders/verify-payment';

    const {
        cod: isCodSupported = true,
        online: isOnlineSupported = true,
        cod_max_limit: COD_MAX_LIMIT = 0
    } = user?.payments_support || {};

    // ---- COD ORDER LOGIC ----
    const confirmOrder = useCallback(async (productsData, selectedAddress) => {
        const normalizedCart = normalizeCartData(cart, productsData);

        // Fix: Don't allow order if address is missing
        if (!selectedAddress || !selectedAddress.pincode) {
            alert("Please select a delivery address before placing your order.");
            return;
        }
        if (normalizedCart.length === 0) {
            alert("No valid items in cart. Please refresh and try again.");
            return;
        }

        setPayOnlineLoading(true);
        setOrderStatus(null);

        try {
            const payload = {
                cart: normalizedCart,
                user_id: user?._id || 'guest_' + Date.now(),
                customer: {
                    id: user?._id || 'guest_' + Date.now(),
                    name: user?.name || 'Guest',
                    email: user?.email || 'guest@example.com',
                    phone: user?.mobile_number || '9999999999',
                    pincode: selectedAddress.pincode,
                },
                address: selectedAddress,
                paymentMethod: 'cod',
            };
            console.log('COD Payload to /create-cod-order:', payload);

            const res = await fetch(`${ORDERS_BASE_URL}${COD_URL}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (res.ok) {
                setOrderStatus('success');
                fbTrack('Purchase', {
                    contents: cart.map(item => {
                        const product = productsData.find(p => p._id === item.id);
                        return {
                            id: item.id,
                            quantity: item.quantity,
                            item_price: product?.discounted_price || 0,
                        };
                    }),
                    value: totalAmount,
                    currency: 'INR',
                    num_items: cart.length
                });
                clearCart();
            } else {
                throw new Error(data.error || 'Order placement failed');
            }
        } catch (err) {
            console.error('COD order error:', err);
            alert('Order failed: ' + err.message);
            setOrderStatus('error');
        } finally {
            setPayOnlineLoading(false);
            setShowModal(true);
        }
    }, [cart, user, normalizeCartData, totalAmount, ORDERS_BASE_URL, COD_URL, fbTrack, clearCart, setShowModal]);

    // ---- ONLINE ORDER LOGIC (RAZORPAY) ----
    const handlePayOnlineInitiation = useCallback(async (productsData, selectedAddress) => {
        setPayOnlineLoading(true);
        setShowCodLimitOnlineOption(false);

        // Fix: Don't allow order if address is missing
        if (!selectedAddress || !selectedAddress.pincode) {
            alert("Please select a delivery address before proceeding to payment.");
            setPayOnlineLoading(false);
            return;
        }

        if (!isOnlineSupported) {
            alert('Online payment is not supported at this time. Please select Cash on Delivery.');
            setPayOnlineLoading(false);
            return;
        }
        if (isGuest || !user?._id) {
            alert('Please log in to pay online.');
            setPayOnlineLoading(false);
            return;
        }
        const normalizedCart = normalizeCartData(cart, productsData);

        const onlinePayload = {
            cart: normalizedCart,
            user_id: user?._id,
            customer: {
                id: user?._id,
                name: user?.name || 'Guest',
                email: user?.email || 'guest@example.com',
                phone: user?.mobile_number || '9999999999',
                pincode: selectedAddress.pincode,
            },
            address: selectedAddress,
        };
        console.log('Online Payload to /create-order:', onlinePayload);

        try {
            const res = await fetch(`${ORDERS_BASE_URL}${ONLINE_URL}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(onlinePayload),
            });
            if (!res.ok) {
                const errorData = await res.json();
                alert('Payment initiation failed: ' + (errorData.error || 'Unknown error'));
                setPayOnlineLoading(false);
                return;
            }
            const data = await res.json();
            const loaded = await loadRazorpayScript();
            if (!loaded) {
                alert('Failed to load Razorpay SDK. Please try again.');
                setPayOnlineLoading(false);
                return;
            }
            if (!data.razorpay_order_id) {
                alert('Order generation failed. Please try again.');
                setPayOnlineLoading(false);
                return;
            }
            const options = {
                key: data.key_id,
                amount: data.amount,
                currency: data.currency,
                name: "Your Store Name",
                description: "Order Payment",
                order_id: data.razorpay_order_id,
                prefill: {
                    name: user?.name,
                    email: user?.email,
                    contact: user?.mobile_number
                },
                handler: async function (response) {
                    setPayOnlineLoading(true);
                    try {
                        const verifyRes = await fetch(`${ORDERS_BASE_URL}${VERIFY_URL}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                order_id: data.order_id
                            }),
                        });
                        const verifyData = await verifyRes.json();
                        if (verifyRes.ok) {
                            setOrderStatus('success');
                            clearCart();
                            fbTrack('Purchase', {
                                contents: cart.map(item => ({
                                    id: item.id,
                                    quantity: item.quantity,
                                    item_price: productsData.find(p => p._id === item.id)?.discounted_price || 0,
                                })),
                                value: totalAmount,
                                currency: 'INR',
                                num_items: cart.length
                            });
                        } else {
                            setOrderStatus('error');
                            alert('Payment verification failed: ' + (verifyData.error || 'Unknown error'));
                        }
                    } catch (err) {
                        setOrderStatus('error');
                        alert('Payment verification failed.');
                    }
                    setPayOnlineLoading(false);
                    setShowModal(true);
                },
                theme: { color: "#3399cc" }
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            alert('Payment initiation failed. Please check your internet connection or try again later.');
            console.error("Online payment error:", err);
        } finally {
            setPayOnlineLoading(false);
        }
    }, [cart, user, isGuest, isOnlineSupported, normalizeCartData, ORDERS_BASE_URL, ONLINE_URL, VERIFY_URL, clearCart, fbTrack, setShowModal, loadRazorpayScript, totalAmount]);

    // ---- GENERIC PAYMENT INITIATION ----
    const initiatePayment = useCallback(
        async (paymentMethod, productsData, selectedAddress) => {
            // Fix: Don't allow order if address is missing
            if (!selectedAddress || !selectedAddress.pincode) {
                alert("Please select a delivery address before placing your order.");
                return;
            }
            if (totalAmount < MINIMUM_ORDER_AMOUNT) {
                alert(`Your cart total is below the minimum order amount of ₹${MINIMUM_ORDER_AMOUNT}. Please add more items.`);
                return;
            }
            fbTrack('InitiateCheckout', {
                contents: cart.map(item => {
                    const product = productsData.find(p => p._id === item.id);
                    return {
                        id: item.id,
                        quantity: item.quantity,
                        item_price: product?.discounted_price || 0,
                    };
                }),
                value: totalAmount,
                currency: 'INR',
            });
            if (paymentMethod === 'cod') {
                if (!isCodSupported) {
                    setActiveCodOrderMessage('Cash on Delivery is not available for your account. Please choose Online Payment.');
                    setShowCodLimitOnlineOption(true);
                    return;
                }
                if (COD_MAX_LIMIT > 0 && totalAmount > COD_MAX_LIMIT) {
                    setActiveCodOrderMessage(`Cash on Delivery is only available for orders up to ₹${COD_MAX_LIMIT}. Please choose Online Payment.`);
                    setShowCodLimitOnlineOption(true);
                    return;
                }
                if (user?._id) {
                    try {
                        const res = await api.get('/user/has-active-cod-orders');
                        const data = res.data;
                        if (data.hasActiveCodOrders) {
                            setActiveCodOrderMessage(
                                "You have an active Cash on Delivery order. You cannot place another COD order until your previous order is delivered." +
                                (isOnlineSupported ? " Please choose Online Payment to continue." : " Online payment is not available at this time.")
                            );
                            setShowCodLimitOnlineOption(true);
                            return;
                        }
                    } catch (err) {
                        console.error("Error checking active COD orders:", err.response?.data || err);
                        alert("Failed to check for active COD orders. Please try again.");
                        return;
                    }
                }
                setActiveCodOrderMessage("");
                setShowModal(true);
            } else if (paymentMethod === 'online') {
                if (!isOnlineSupported) {
                    alert('Online payment is not available for your account. Please choose Cash on Delivery.');
                    return;
                }
                await handlePayOnlineInitiation(productsData, selectedAddress);
            }
        },
        [
            totalAmount,
            MINIMUM_ORDER_AMOUNT,
            cart,
            fbTrack,
            handlePayOnlineInitiation,
            setShowModal,
            isCodSupported,
            isOnlineSupported,
            COD_MAX_LIMIT,
            user,
            isGuest,
            setActiveCodOrderMessage,
            setShowCodLimitOnlineOption,
        ]
    );

    const closeModal = useCallback(() => {
        setShowModal(false);
        setShowCodLimitOnlineOption(false);
        setActiveCodOrderMessage("");
        if (orderStatus === 'success') {
            navigate('/');
        }
        setOrderStatus(null);
    }, [orderStatus, navigate]);

    return {
        initiatePayment,
        confirmOrder,
        handlePayOnlineInitiation,
        payOnlineLoading,
        showCodLimitOnlineOption,
        activeCodOrderMessage,
        orderStatus,
        closeModal,
        setShowCodLimitOnlineOption,
    };
};

export default usePaymentLogic;