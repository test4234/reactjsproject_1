// src/pages/orders/TrackOrderPage.jsx

import React from 'react';
import { useLocation } from 'react-router-dom';
import TrackSteps from './components/TrackSteps';
import BillSummary from './components/BillSummary';
import OrderSummaryCard from './components/OrderSummaryCard';
import OrderCustomerInfo from './components/OrderCustomerInfo';


const TrackOrderPage = () => {
  const { state } = useLocation();
  const order = state?.order;

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-6 bg-white rounded-lg shadow-lg text-center">
          <p className="text-2xl font-bold text-red-600 mb-3">Oops!</p>
          <p className="text-gray-700">Order details could not be loaded.</p>
          <p className="text-gray-500 text-sm mt-2">Please go back and try again.</p>
        </div>
      </div>
    );
  }

  // Calculate itemTotal from the items array
  const itemTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Create the bill object with all the required properties
const bill = {
  itemTotal: itemTotal,
  gst: order.charges.gst,
  delivery: order.charges.delivery,
  handling: order.charges.handling,
  discount: order.charges.discount,
  totalPrice: order.totalPrice,
  finalAmount: order.finalAmount
};
  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-2xl font-extrabold text-gray-900 text-center">
          Order Tracking <span role="img" aria-label="package-emoji">📦</span>
        </h1>

        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 shadow-lg">
          <h2 className="text-lg font-semibold text-blue-700 mb-4 flex items-center">
            <span className="mr-2 text-xl">🚀</span> Tracking Progress
          </h2>
          <TrackSteps status={order.orderStatus} />
        </div>

        <OrderSummaryCard items={order.items} />

        <div className="bg-green-50 rounded-xl border border-green-100 shadow-lg">
          <h2 className="text-lg font-semibold text-green-700 mb-4 flex items-center">
            <span className="mr-2 text-xl">📋</span> Delivery Details
          </h2>
          <BillSummary bill={bill} />
          <OrderCustomerInfo order={order} />

        </div>
      </div>
    </div>
  );
};

export default TrackOrderPage;
