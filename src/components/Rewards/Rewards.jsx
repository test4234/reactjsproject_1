import React from 'react';
// import './Rewards.css'; // No longer needed as we're using Tailwind directly

const Rewards = () => {
  const rewards = []; // You can replace this with data from context or props

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-900 p-6 text-white font-sans">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8 text-center">
        <h2 className="text-4xl font-extrabold text-green-800 mb-8 animate-fade-in-down">Your Rewards</h2>
        {rewards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <img
              src="https://cdn-icons-png.flaticon.com/512/4062/4062911.png"
              alt="No rewards"
              className="w-40 h-40 object-contain mb-6 opacity-75 animate-bounce-slow"
            />
            <p className="text-xl font-semibold text-gray-700">No rewards available at the moment.</p>
            <p className="text-md text-gray-500 mt-2">Check back later for exciting offers!</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {rewards.map((reward, index) => (
              <li
                key={index}
                className="bg-green-100 border border-green-300 rounded-lg p-4 flex justify-between items-center text-green-800 text-lg font-medium shadow-sm transition-all duration-200 ease-in-out hover:bg-green-200 hover:shadow-md"
              >
                <span>{reward.name}</span>
                <span className="font-bold">{reward.points} points</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Rewards;