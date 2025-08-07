import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartActions } from '../../context/CartContext';

const PaymentStatus = () => {
  const [status, setStatus] = useState('checking'); // 'checking' | 'success' | 'failed' | 'missing' | 'error'
  const [message, setMessage] = useState('🔄 Checking payment status...');
  const [redirect, setRedirect] = useState(false);

  const { clearCart } = useCartActions();
  const navigate = useNavigate();

  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('order_id');

  useEffect(() => {
    if (!orderId) {
      setStatus('missing');
      setMessage('❌ Missing order ID.');
      return;
    }

    const checkStatus = async () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];

        if (cart.length === 0) {
          setStatus('error');
          setMessage('❌ Cart data missing. Cannot verify payment.');
          return;
        }

        const res = await fetch(`http://localhost:5001/api/orders/payment-status?order_id=${orderId}`);
        const data = await res.json();

        if (res.ok && data.status === 'PAID') {
          setStatus('success');
          setMessage('✅ Payment Successful!');
          localStorage.removeItem('cart');
          clearCart();
          setRedirect(true);
        } else if (res.ok) {
          setStatus('failed');
          setMessage(`❌ Payment ${data.status || 'Failed'}.`);
        } else {
          setStatus('error');
          setMessage('❌ Error checking payment status.');
        }
      } catch (err) {
        console.error('❌ Error:', err);
        setStatus('error');
        setMessage('❌ Error occurred while verifying payment.');
      }
    };

    checkStatus();
  }, [orderId, clearCart]);

  useEffect(() => {
    if (redirect) {
      const timer = setTimeout(() => navigate('/', { replace: true }), 5000);
      return () => clearTimeout(timer);
    }
  }, [redirect, navigate]);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center font-sans space-y-4">
      {status === 'checking' && (
        <>
          <div className="border-6 border-t-6 border-[#f3f3f3] border-t-[#007bff] rounded-full w-16 h-16 animate-spin"></div>
          <h2 className="text-xl">Verifying Payment...</h2>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="text-5xl text-green-500 animate-[pop_0.3s_ease-out]">✔</div>
          <h2 className="text-xl text-green-500">{message}</h2>
          <p className="text-lg text-gray-500 mt-2 mb-4">Redirecting to home...</p>
          <button
            className="px-5 py-2.5 text-lg bg-[#007bff] text-white rounded-md hover:bg-blue-600 transition-all"
            onClick={() => navigate('/')}
          >
            Go to Home
          </button>
        </>
      )}

      {(status === 'failed' || status === 'error' || status === 'missing') && (
        <>
          <div className="text-5xl text-red-600 animate-[shake_0.3s_ease-in-out]">✖</div>
          <h2 className="text-xl text-red-600">{message}</h2>
          <p className="text-lg text-gray-500 mt-2 mb-4">There was an issue. Try again or go back.</p>
          <button
            className="px-5 py-2.5 text-lg bg-[#007bff] text-white rounded-md hover:bg-blue-600 transition-all"
            onClick={() => navigate('/')}
          >
            Go Back
          </button>
        </>
      )}
    </div>
  );
};

export default PaymentStatus;
