import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="bg-white px-3 py-4 flex items-center justify-center relative z-20 shadow-md shrink-0">
      <div
        className="absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer p-2 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        onClick={() => navigate(-1)}
      >
        <FaArrowLeft className="text-[20px] text-[#1c1c1c]" />
      </div>
      <div className="text-[1.1rem] font-semibold text-[#1c1c1c]">
        Select Delivery Location
      </div>
    </nav>
  );
};

export default Navbar;
