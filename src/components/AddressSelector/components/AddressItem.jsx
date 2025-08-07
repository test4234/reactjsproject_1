import React from 'react';
import { FaMapMarkerAlt, FaHome, FaBuilding, FaTag, FaEdit, FaTrash } from 'react-icons/fa';

const getAddressIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'home': return <FaHome className="text-green-500 text-lg mr-[5px] flex-shrink-0" />;
    case 'work': return <FaBuilding className="text-green-500 text-lg mr-[5px] flex-shrink-0" />;
    case 'others': return <FaTag className="text-green-500 text-lg mr-[5px] flex-shrink-0" />;
    default: return <FaMapMarkerAlt className="text-green-500 text-lg mr-[5px] flex-shrink-0" />;
  }
};

const AddressItem = ({
  item,
  onSelect,
  onEdit,
  onDelete,
  isSavingLoading,
  showActions = true,
  className = ''
}) => {
  return (
    <div className={`flex justify-between items-start p-[14px] border border-[#e0e0e0] rounded-[10px] mb-[10px] bg-white relative shadow-[0_2px_4px_rgba(0,0,0,0.04)] transition-shadow duration-200
      ${isSavingLoading ? 'opacity-60 pointer-events-none cursor-not-allowed' : ''} hover:shadow-[0_4px_8px_rgba(0,0,0,0.08)] ${className}`}>
      <div
        className="flex-grow cursor-pointer pr-[15px] flex flex-col hover:bg-[#f9f9f9]"
        onClick={!isSavingLoading ? () => onSelect(item) : undefined}
        role="button"
        tabIndex={isSavingLoading ? -1 : 0}
        aria-disabled={isSavingLoading}
      >
        <div className="font-semibold text-[15px] text-[#333] mb-[4px] flex items-center gap-[5px]">
          {getAddressIcon(item.address_type)} {item.address_type || 'Address'}
        </div>
        <div className="text-[14px] text-[#555] leading-[1.4]">
          {item.full_address}
        </div>
      </div>
      {showActions && (
        <div className="relative ml-[10px] flex-shrink-0 flex items-center justify-center">
          <button
            className="bg-none border-none text-[20px] text-[#888] cursor-pointer p-0 px-[5px] leading-none transition-colors duration-200 hover:text-[#333]"
            onClick={(e) => {
              e.stopPropagation();
              if (!isSavingLoading) onEdit(item, e);
            }}
            aria-label="Edit address"
            disabled={isSavingLoading}
          >
            <FaEdit />
          </button>
          <button
            className="bg-none border-none text-[20px] text-[#888] cursor-pointer p-0 px-[5px] leading-none transition-colors duration-200 hover:text-[#dc3545] ml-[5px]"
            onClick={(e) => {
              e.stopPropagation();
              if (!isSavingLoading) onDelete(item, e);
            }}
            aria-label="Delete address"
            disabled={isSavingLoading}
          >
            <FaTrash />
          </button>
        </div>
      )}
    </div>
  );
};

export default AddressItem;