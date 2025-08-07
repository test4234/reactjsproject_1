import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const ConfirmationModal = ({
  title,
  message,
  itemName,
  onCancel,
  onConfirm,
  isRemoving,
  confirmText = 'Remove',
  cancelText = 'Cancel'
}) => (
  <div className="fixed inset-0 backdrop-blur-md bg-white/5 flex justify-center items-center z-[1000]" role="dialog" aria-modal="true">
    <div className="bg-white p-[1.5rem] px-[2rem] rounded-lg max-w-[400px] w-11/12 shadow-[0_4px_8px_rgba(0,0,0,0.2)] text-center text-black">
      <h3 className="mt-0 mb-[15px] text-[#333] text-[1.3em] font-bold">{title}</h3>
      <p className="mb-[20px] text-[#555]">{message}</p>
      <p className="font-bold text-lg text-gray-900 mb-[20px]"><strong>{itemName}</strong></p>
      <div className="flex justify-center gap-[1rem] mt-[1rem]">
        <button
          onClick={onCancel}
          disabled={isRemoving}
          className="py-[0.7rem] px-[1.2rem] bg-[#ccc] text-[#333] rounded-[4px] cursor-pointer text-[1em] transition-colors duration-200 hover:bg-[#b3b3b3] flex items-center justify-center gap-[5px] disabled:opacity-80 disabled:cursor-not-allowed disabled:bg-[#cccccc] disabled:text-[#888888]"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          disabled={isRemoving}
          className="py-[0.7rem] px-[1.2rem] bg-[#dc3545] text-white rounded-[4px] cursor-pointer text-[1em] transition-colors duration-200 hover:bg-[#c82333] flex items-center justify-center gap-[5px] disabled:opacity-80 disabled:cursor-not-allowed disabled:bg-[#cccccc] disabled:text-[#888888]"
        >
          {isRemoving ? `${confirmText}...` : confirmText}
          {isRemoving && <LoadingSpinner />}
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmationModal;