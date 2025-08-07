import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './OrdersHistory.css'; // Optional: use if you want custom styles

function OrdersHistory() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [visibleItems, setVisibleItems] = useState({});

  const toggleItemsVisibility = (orderId) => {
    setVisibleItems((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const getDeliveredByDate = (orderDateString) => {
    const orderDate = new Date(orderDateString);
    orderDate.setDate(orderDate.getDate() + 1);
    return orderDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  };

  if (!user || !user.orders || user.orders.length === 0) {
    return (
      <div className="text-center mt-10">
        <h2 className="text-3xl font-bold mb-4">Your Order History</h2>
        <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl shadow-md"
        >
          Shop Now
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-3xl font-bold text-center mb-8">My Orders</h2>
      {user.orders
        .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
        .map((order) => {
          const showItems = visibleItems[order.orderId];
          const orderDate = new Date(order.orderDate).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });

          return (
            <div key={order.orderId} className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
              <div className="flex items-center p-4">
                {/* Thumbnail group */}
                <div className="flex-shrink-0 flex -space-x-2">
                  {order.items.slice(0, 3).map((item, index) => (
                    <img
                      key={index}
                      src={item.image || '/basket.png'}
                      alt={item.itemName}
                      className="w-12 h-12 rounded-full border-2 border-white shadow"
                    />
                  ))}
                  {order.items.length > 3 && (
                    <div className="w-12 h-12 rounded-full bg-gray-200 text-sm flex items-center justify-center font-bold text-gray-700">
                      +{order.items.length - 3}
                    </div>
                  )}
                </div>

                {/* Order Info */}
                <div className="ml-4 flex-1">
                  <div className="text-sm text-gray-500">Order#: {order.orderId}</div>
                  <div className="font-medium text-lg">{orderDate}</div>
                  <div className="text-sm text-green-600">
                    {order.deliveryStatus.toLowerCase() === 'delivered'
                      ? `Delivered on ${getDeliveredByDate(order.orderDate)}`
                      : `Estimated Delivery on ${getDeliveredByDate(order.orderDate)}`}
                  </div>
                </div>

                {/* Status */}
                <div className="text-right">
                  <div
                    className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      order.paymentStatus.toLowerCase() === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {order.paymentStatus}
                  </div>
                  <div
                    className={`mt-1 text-xs px-2 py-1 rounded-full font-semibold ${
                      order.deliveryStatus.toLowerCase() === 'delivered'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {order.deliveryStatus}
                  </div>
                </div>
              </div>

              {/* Toggle Item View */}
              <div className="px-4 pb-4">
                <button
                  className="text-sm text-blue-600 hover:underline"
                  onClick={() => toggleItemsVisibility(order.orderId)}
                >
                  {showItems ? 'Hide Items ▲' : 'View Items ▼'}
                </button>

                {showItems && (
                  <ul className="mt-4 space-y-3">
                    {order.items.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image || '/basket.png'}
                            alt={item.itemName}
                            className="w-10 h-10 rounded-full object-cover border"
                          />
                          <div>
                            <div className="font-medium">{item.itemName}</div>
                            <div className="text-xs text-gray-500">
                              Qty: {item.quantity >= 1 ? `${item.quantity} kg` : `${item.quantity * 1000} gm`}
                            </div>
                          </div>
                        </div>
                        <div className="font-semibold text-green-600">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
}

export default OrdersHistory;
