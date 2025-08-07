import React from "react";
// No need to import './GoToCartButton.css' anymore

const GoToCartButton = ({ cartLength, onClick }) => {
  // If cartLength is not an array and is falsy (e.g., 0, null, undefined), don't render.
  // We're checking for non-array falsy values specifically.
  if (!Array.isArray(cartLength) && !cartLength && cartLength !== 0) return null;


  return (
    <div
      className="
        mt-auto               /* margin-top: auto; - Pushes it to bottom when content is short */
        sticky                /* position: sticky; */
        bottom-0              /* bottom: 0; */
        bg-white              /* background-color: #fff; */
        py-[10px] px-[16px]   /* padding: 10px 16px; */
        z-10                  /* z-index: 10; */
        shadow-[0_-2px_4px_rgba(0,0,0,0.1)] /* box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1); */
      "
    >
      <button
        onClick={onClick}
        className="
          w-full              /* width: 100%; */
          p-[14px]            /* padding: 14px; */
          text-[16px]         /* font-size: 16px; */
          font-bold           /* font-weight: bold; */
          bg-[#047237]         /* background-color: #047237; */
          text-white          /* color: white; */
          border-none         /* border: none; */
          rounded-[8px]       /* border-radius: 8px; */
          cursor-pointer      /* cursor: pointer; */
          transition-colors duration-200 /* Optional: for a smoother hover effect */
          hover:opacity-90    /* Optional: subtle hover effect */
        "
      >
        🛒 Go to Cart ({cartLength} items)
      </button>
    </div>
  );
};

export default GoToCartButton;