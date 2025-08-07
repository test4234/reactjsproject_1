// src/components/BillSummary.jsx

import React from 'react';

const BillSummary = ({ bill }) => {
  // Destructure the bill object for easier access
  const {
    delivery,
    handling,
    gst,
    discount,
    totalPrice,
    finalAmount
  } = bill;

  // Helper function to format currency
  const formatCurrency = (amount) => {
    const numericAmount = typeof amount === 'number' ? amount : 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(numericAmount);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 space-y-4">
      {/* Bill Summary Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xl">
          🧾
        </div>
        <h2 className="text-xl font-bold text-gray-800">Bill Summary</h2>
      </div>

      {/* Bill Items */}
      <div className="space-y-3 text-gray-700">
        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <span className="text-sm">Delivery Fee</span>
          <span className="text-sm font-medium">{formatCurrency(delivery)}</span>
        </div>

        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <span className="text-sm">Handling Fee</span>
          <span className="text-sm font-medium">{formatCurrency(handling)}</span>
        </div>

        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <span className="text-sm">GST</span>
          <span className="text-sm font-medium">{formatCurrency(gst)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm">Discount</span>
          <span className="text-sm font-medium text-red-600">- {formatCurrency(discount)}</span>
        </div>
      </div>

      {/* Total Price Section */}
      <div className="pt-4 border-t-2 border-dashed border-gray-200 mt-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-base font-semibold text-gray-800">Total Price</span>
          <span className="text-base font-semibold text-gray-800">{formatCurrency(totalPrice)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-gray-800">Final Amount</span>
          <span className="text-lg font-bold text-green-600">{formatCurrency(finalAmount)}</span>
        </div>
      </div>
    </div>
  );
};

export default BillSummary;
