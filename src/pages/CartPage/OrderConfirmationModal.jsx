// OrderConfirmationModal.jsx (TailwindCSS Version)
import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const OrderConfirmationModal = React.memo(({
  show,
  onClose,
  onConfirm,
  address,
  isPlacingOrder,
  orderStatus,
  showPayOnlineButton,
  onPayOnline,
  payOnlineLoading,
  activeCodOrderMessage,
  totalAmount,
  onRedirectToHome
}) => {
  if (!show) return null;

  const isLoading = isPlacingOrder || payOnlineLoading;
  const [redirectSeconds, setRedirectSeconds] = useState(3);
  const { checkAuth } = useContext(AuthContext);

  useEffect(() => {
    if (orderStatus === 'success') {
      setRedirectSeconds(3);
    }
  }, [orderStatus]);

  useEffect(() => {
    if (orderStatus === 'success') {
      localStorage.removeItem('cart');
      checkAuth();
    }
  }, [orderStatus]);

  useEffect(() => {
    if (orderStatus !== 'success') return;
    const timeout = setTimeout(() => {
      setRedirectSeconds(prev => {
        if (prev <= 1) {
          onRedirectToHome?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearTimeout(timeout);
  }, [redirectSeconds, orderStatus, onRedirectToHome]);

  return (
    <div className="fixed inset-0 bg-white/20 backdrop-blur-md z-[10000] flex items-center justify-center backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className={`w-[90%] max-w-[550px] max-h-[calc(100vh-40px)] m-5 flex flex-col overflow-hidden translate-y-5 animate-slideInUp rounded-xl shadow-xl bg-white z-[10001] ${orderStatus === 'success' ? 'bg-green-50 h-[80%] p-0 justify-start items-stretch' : 'p-6'}`}>
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-95 rounded-xl z-[10002]">
            <div className="w-10 h-10 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mb-4"></div>
            <p className="text-lg text-gray-700">Processing your order...</p>
          </div>
        ) : orderStatus === 'success' ? (
          <>
            <div className="bg-green-100 py-6 px-8 flex justify-center items-center relative">
              <h3 className="text-2xl font-bold text-green-600">Order Placed!</h3>
              <button className="absolute top-4 right-5 text-2xl text-gray-500 hover:text-gray-800 hover:rotate-90 transition-transform" onClick={onClose}>✖</button>
            </div>
            <div className="flex-grow w-full h-full px-8 py-4 flex flex-col items-center justify-center text-green-600 text-center text-[1.1em] leading-relaxed">
              <svg className="w-20 h-20 text-green-600 mb-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Your order has been placed!</h2>
              <p className="text-[1.05rem] text-gray-700 max-w-[90%] mb-5">
                Your Vegetables will be delivered by <strong>tomorrow morning between 6 AM - 8 AM</strong>.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-0">
              <h3 className="text-xl font-semibold text-gray-800">Confirm Order</h3>
              <button className="text-2xl text-gray-500 hover:text-gray-800 hover:rotate-90 transition-transform" onClick={onClose}>✖</button>
            </div>
            <div className="text-[1.05em] text-gray-700 leading-relaxed overflow-y-auto flex-grow py-4">
              {showPayOnlineButton ? (
                activeCodOrderMessage ? (
                  <p>{activeCodOrderMessage}</p>
                ) : (
                  <>
                    <p>Cash on Delivery is only available for orders under <strong>₹100</strong>.</p>
                    <p>Your current order total is <strong>₹{totalAmount?.toFixed(2)}</strong>.</p>
                    <p>Please select <strong>Online Payment</strong> to continue or reduce your order value to below ₹100 for COD.</p>
                  </>
                )
              ) : (
                <>
                  <p>
                    Are you sure {address?.customer_name && <strong>{address.customer_name}</strong>} you want to place the order to the selected address?
                  </p>
                  <p>
                    <strong>Address:</strong>{" "}
                    {address && typeof address === "object" ? (
                      <>{address.address && <span>{address.address}</span>}</>
                    ) : (
                      address
                    )}
                  </p>
                </>
              )}
            </div>
            <div className="flex justify-end gap-4 border-t border-gray-200 pt-5 mt-0">
              {showPayOnlineButton && (
                <button
                  className="bg-green-600 text-white px-6 py-3 rounded-md font-medium hover:bg-green-700 transition"
                  onClick={onPayOnline}
                >
                  Pay Online
                </button>
              )}
              <button
                className="bg-green-600 text-white px-6 py-3 rounded-md font-medium hover:bg-green-700 transition"
                onClick={onConfirm}
                disabled={showPayOnlineButton}
                style={{ display: showPayOnlineButton ? 'none' : 'block' }}
              >
                Yes, Place Order
              </button>
              <button
                className="bg-gray-100 text-gray-700 border border-gray-300 px-6 py-3 rounded-md font-medium hover:bg-gray-200 hover:text-gray-900 transition"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
});

export default OrderConfirmationModal;
