import React from 'react';
import { FaMapMarkerAlt, FaTrash } from 'react-icons/fa';

const RecentLocations = ({
  recentLocations,
  isSavingLoading,
  onSelect,
  onDelete
}) => {
  if (recentLocations.length === 0) return null;

  return (
    <div className="mt-[20px]">
      <h4 className="text-[16px] mt-[20px] mb-[10px] text-[#444] font-semibold border-b border-[#eee] pb-[5px]">Recent Locations</h4>
      <ul role="list" className="list-none pl-0 my-0">
        {recentLocations.map((loc) => (
          <li
            key={loc._id || `recent-${loc.tempId}`}
            className={`flex items-center justify-between p-[12px] px-[14px] cursor-pointer transition-colors duration-200 border-b border-[#eee] text-black last:border-b-0
            ${isSavingLoading ? 'opacity-60 pointer-events-none cursor-not-allowed' : ''} hover:bg-[#f0f4ff]`}
          >
            <div
              onClick={!isSavingLoading ? () => onSelect(loc) : undefined}
              className="flex-grow flex items-center text-[14px] text-[#555]"
              role="button"
              tabIndex={isSavingLoading ? -1 : 0}
              aria-disabled={isSavingLoading}
            >
              <FaMapMarkerAlt className="text-green-500 text-[18px] mr-[5px] flex-shrink-0" />
              <span>
                {loc.apartment && loc.street
                  ? `${loc.apartment}, ${loc.street}`
                  : loc.full_address}
              </span>
            </div>
            <button
              className="bg-transparent text-green-500 border-none cursor-pointer p-0 px-[5px] text-[1.2em] transition-colors duration-200 hover:text-green-700"
              onClick={(e) => onDelete(loc, e)}
              aria-label={`Remove recent location ${loc.full_address}`}
              disabled={isSavingLoading}
            >
              <FaTrash />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentLocations;