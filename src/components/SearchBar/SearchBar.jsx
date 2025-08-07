import React, { useState, useEffect, memo } from 'react';
import { FaSearch, FaArrowRight } from 'react-icons/fa';

// The SearchBar component is now memoized for performance.
const SearchBar = memo(({ onSearchClick }) => {
  const placeholders = ["onion", "tomato", "potato", "carrot", "broccoli"];
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);

  useEffect(() => {
    // Cycles through the placeholders every 2 seconds.
    const interval = setInterval(() => {
      setCurrentPlaceholderIndex((prevIndex) =>
        (prevIndex + 1) % placeholders.length
      );
    }, 5000);

    return () => clearInterval(interval); // Cleanup on unmount.
  }, [placeholders.length]);

  return (
    <div
      className="flex items-center justify-center w-full h-[60px] px-2.5 box-border cursor-pointer"
      onClick={onSearchClick}
    >
      <div className="relative flex items-center w-[99%] h-[50px] rounded-[10px] bg-white shadow-md transition-shadow duration-300 hover:shadow-xl">
        {/* Left search icon */}
        <FaSearch className="absolute left-4 text-gray-500 text-[20px] z-10" />
        
        {/* Hidden input to handle the click event and maintain focus logic. */}
        <input
          className="flex-grow h-full w-full rounded-[10px] px-[40px] text-[16px] bg-transparent border-none focus:outline-none cursor-pointer"
          type="text"
          readOnly
        />
        
        {/* Animated placeholder text. Using a key forces the animation to restart. */}
        <div 
          key={currentPlaceholderIndex}
          className="absolute left-[40px] text-gray-400 text-base font-medium overflow-hidden animate-fade-in-up flex items-center"
        >
          {`Search for ${placeholders[currentPlaceholderIndex]}`}
        </div>

        {/* Right arrow icon */}
        <FaArrowRight className="absolute right-4 text-gray-500 text-[20px] z-10 animate-pulse-fade" />
      </div>
    </div>
  );
});

export default SearchBar;

// CSS for animations. In a production app, these would be in a separate CSS file.
// We are defining them here for a self-contained example.
// The `key` on the div element above triggers these animations to restart.
