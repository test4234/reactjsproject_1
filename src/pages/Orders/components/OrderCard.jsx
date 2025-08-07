import React from 'react';
import { useNavigate } from 'react-router-dom';

const OrderCard = ({ order }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/orders/${order._id}`, { state: { order } });
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });

  const getStatusBadge = (status) => {
    let bgColor = 'bg-gray-200';
    let textColor = 'text-gray-800';

    switch (status.toLowerCase()) {
      case 'delivered':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case 'pending':
      case 'processing':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        break;
      case 'shipped':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        break;
      case 'cancelled':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
      default:
        bgColor = 'bg-gray-200';
        textColor = 'text-gray-700';
        break;
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${bgColor} ${textColor}`}>
        {status}
      </span>
    );
  };

  // --- MODIFIED: getEstimatedDeliveryDisplay function ---
  const getEstimatedDeliveryDisplay = (fromIso, toIso) => {
    const fromDate = new Date(fromIso);
    const toDate = new Date(toIso);

    // Get current date and tomorrow's date at the start of the day for accurate comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of today

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Reset to start of tomorrow

    const fromDateWithoutTime = new Date(fromDate);
    fromDateWithoutTime.setHours(0, 0, 0, 0); // Reset delivery date to start of day

    const fromTime = formatTime(fromIso);
    const toTime = formatTime(toIso);

    let datePrefix = '';

    if (fromDateWithoutTime.getTime() === today.getTime()) {
      datePrefix = 'Today';
    } else if (fromDateWithoutTime.getTime() === tomorrow.getTime()) {
      datePrefix = 'Tomorrow';
    } else {
      // If it's not today or tomorrow, show the actual date
      datePrefix = fromDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    }

    // Handle delivery window crossing midnight
    if (fromDate.toDateString() === toDate.toDateString()) {
      // Same day delivery
      return `${datePrefix}, ${fromTime} – ${toTime}`;
    } else {
      // Delivery spans across different days
      const toDatePrefix = toDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      return `${datePrefix} ${fromTime} – ${toDatePrefix} ${toTime}`;
    }
  };
  // --- END MODIFIED FUNCTION ---

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 shadow-md p-5 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col"
      onClick={handleClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-semibold text-gray-800">Order ID:</span>{' '}
            <span className="text-gray-700 font-mono text-xs tracking-wider">{order.orderId}</span>
          </p>
          <p className="text-xs text-gray-500">Ordered on {formatDate(order.orderDate)}</p>
        </div>
        {order.orderStatus && getStatusBadge(order.orderStatus)}
      </div>

      <hr className="my-3 border-gray-200" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex -space-x-3">
          {order.items.slice(0, 3).map((item) => (
            <img
              key={item.itemId}
              src={item.imageUrl}
              alt={item.itemName}
              className="w-12 h-12 rounded-full border-2 border-white object-cover shadow-sm"
              title={item.itemName}
            />
          ))}
          {order.items.length > 3 && (
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600 border-2 border-white shadow-sm">
              +{order.items.length - 3}
            </div>
          )}
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-gray-800">₹{(order.totalPrice || 0).toFixed(2)}</p>
          <p className="text-xs text-gray-500">Total Amount</p>
        </div>
      </div>

      <div className="mt-auto pt-3 border-t border-gray-200 flex items-end justify-between gap-2">
        <div className="flex flex-col min-w-0 flex-grow">
          <p className="text-sm text-gray-700 flex items-center flex-shrink-0">
            <span className="mr-2 text-blue-500 flex-shrink-0">🗓️</span>
            <span className="font-medium">Estimated Delivery:</span>
          </p>
          <p className="text-sm text-gray-800 font-semibold mt-1 truncate">
            {/* Modified call to getEstimatedDeliveryDisplay */}
            {getEstimatedDeliveryDisplay(order.expectedDeliverySlot.from, order.expectedDeliverySlot.to)}
          </p>
        </div>
        <p className="text-xs text-gray-500 flex-shrink-0 mb-1">View Details &rarr;</p>
      </div>
    </div>
  );
};

export default OrderCard;