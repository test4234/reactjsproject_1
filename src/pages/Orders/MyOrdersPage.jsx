import React, { useContext } from 'react';
import { AuthContext } from "../../context/AuthContext";
import OrderCard from './components/OrderCard';

const MyOrdersPage = () => {
  const { user } = useContext(AuthContext);

  if (!user || !user.orders || user.orders.length === 0) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold mb-4 text-gray-800">My Orders</h1>
        <p className="text-center text-gray-500">No orders found.</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-4 text-gray-800">My Orders</h1>
      <div className="space-y-4">
        {user.orders.map(order => (
          <OrderCard key={order._id} order={order} />
        ))}
      </div>
    </div>
  );
};

export default MyOrdersPage;