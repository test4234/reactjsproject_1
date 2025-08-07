import React, { useState } from 'react';

const OrderSummaryCard = ({ items }) => {
  const [showAllItems, setShowAllItems] = useState(false);

  const displayedItems = showAllItems ? items : items.slice(0, 3);
  const hasMoreItems = items.length > 3;

  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-lg p-4 text-center text-gray-600">
        No items in this order.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-lg p-4">
      <div className="space-y-4">
        {displayedItems.map((item) => (
          <div
            key={item.itemId}
            className="flex items-center gap-4 p-2 border border-gray-100 rounded-lg bg-gray-50 hover:shadow-sm"
          >
            {/* Image */}
            <img
              src={item.imageUrl}
              alt={item.itemName}
              className="w-14 h-14 object-cover rounded-md"
            />

            {/* Name, Quantity, Price in 3-column flex */}
            <div className="flex-1 grid grid-cols-3 gap-2 items-center text-sm text-gray-800">
              <div className="truncate font-medium">{item.itemName}</div>
              <div className="text-gray-600">
                {/* Use the new quantity_label here */}
                {item.quantity_label}
              </div>
              <div className="text-right font-semibold text-green-700">₹{item.price}</div>
            </div>
          </div>
        ))}
      </div>

      {hasMoreItems && (
        <div className="text-center mt-4">
          <button
            onClick={() => setShowAllItems(!showAllItems)}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            {showAllItems ? `Show Less` : `View All Items (${items.length - 3} more)`}
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderSummaryCard;