import React from 'react';

const OrderCustomerInfo = ({ order }) => {
  const {
    address,
    paymentMethod,
    paymentStatus,
    orderDate,
  } = order;

  const paymentIcon = paymentMethod === 'online' ? '💳' : '💵';
  const paymentLabel = paymentMethod === 'online' ? 'Online Payment' : 'Cash on Delivery';

  const statusIcon = paymentStatus === 'paid' ? '✅' : '❌';
  const statusLabel = paymentStatus === 'paid' ? 'Paid' : 'Not Paid';

  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-5 space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Customer Details</h2>

      {/* Customer Name */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500">Customer Name</span>
        <span className="font-medium text-gray-700">{address?.name || 'N/A'}</span>
      </div>

      {/* Payment Method */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500">Payment Method</span>
        <span className="font-medium flex items-center gap-2 text-gray-700">
          <span>{paymentIcon}</span> {paymentLabel}
        </span>
      </div>

      {/* Payment Status */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500">Payment Status</span>
        <span className={`font-medium flex items-center gap-2 ${paymentStatus === 'paid' ? 'text-green-600' : 'text-red-500'}`}>
          {statusIcon} {statusLabel}
        </span>
      </div>
      
      {/* Delivery Address */}
      <div className="flex flex-col text-sm pt-2 border-t border-gray-100">
        <span className="text-gray-500 mb-1">Delivery Address</span>
        <p className="font-medium text-gray-700">{address?.address || 'N/A'}</p>
      </div>
    </div>
  );
};

export default OrderCustomerInfo;