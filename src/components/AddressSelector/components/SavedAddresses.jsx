import React from 'react';
import AddressItem from './AddressItem';

const SavedAddresses = ({
  savedAddresses,
  isSavingLoading,
  onSelect,
  onEdit,
  onDelete
}) => {
  if (savedAddresses.length === 0) return null;

  return (
    <div className="mt-[20px]">
      <h4 className="text-[16px] mt-[20px] mb-[10px] text-[#444] font-semibold border-b border-[#eee] pb-[5px]">Saved Addresses</h4>
      <ul className="list-none pl-0 my-0">
        {savedAddresses.map((item) => (
          <AddressItem
            key={item._id}
            item={item}
            onSelect={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
            isSavingLoading={isSavingLoading}
          />
        ))}
      </ul>
    </div>
  );
};

export default SavedAddresses;