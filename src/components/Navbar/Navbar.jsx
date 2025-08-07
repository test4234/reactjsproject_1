import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import { LocationContext } from '../../context/LocationContext';

// IMPORTANT: Import your app configuration
import homepageConfig from "../../components/ProductFetchList/homepageConfig.json";

// Helper function to ensure Tailwind text color class format
const getTailwindTextColorClass = (colorName, defaultClass) => {
  if (!colorName) return defaultClass;

  // If it already starts with 'text-', use it as is (e.g., 'text-white', 'text-red-500')
  if (colorName.startsWith('text-')) {
    return colorName;
  }

  // Handle direct 'white' and 'black' without shades
  if (['white', 'black'].includes(colorName.toLowerCase())) {
    return `text-${colorName.toLowerCase()}`;
  }

  // If it's a color name with a shade (e.g., 'pink-500', 'blue-700')
  if (colorName.includes('-') && !isNaN(parseInt(colorName.split('-').pop()))) {
      return `text-${colorName}`;
  }

  // Default to appending -500 shade for simple color names (e.g., 'pink' becomes 'text-pink-500')
  return `text-${colorName}-500`;
};

const Navbar = () => {
  const navigate = useNavigate();
  const { location } = useContext(LocationContext);

  const handleAddressClick = () => {
    navigate('/address');
  };

  // Ensure fullAddress always has a value for display
  const fullAddress = location?.full_address || 'Select your address';

  // Destructure navbar settings from homepageConfig, with fallbacks
  const {
    textColor: rawTextColor = 'white',
    textSize = 'text-base',
    orderDeliveryTextSize = 'text-base',
    orderDeliveryTextColor: rawOrderDeliveryTextColor = 'white',
    addressTextColor: rawAddressTextColor = 'white',
    addressTextSize = 'text-sm',
    arrowColor: rawArrowColor = 'white'
  } = homepageConfig.navbarSettings || {};

  // Process raw color values to ensure they are valid Tailwind classes
  const generalTextColor = getTailwindTextColorClass(rawTextColor, 'text-white');
  const orderDeliveryColor = getTailwindTextColorClass(rawOrderDeliveryTextColor, 'text-white');
  const addressColor = getTailwindTextColorClass(rawAddressTextColor, 'text-white');
  const arrowFinalColor = getTailwindTextColorClass(rawArrowColor, 'text-white');


  return (
    // Apply generalTextColor to the main Navbar div, which will cascade to children
    // unless overridden by more specific classes.
    <div className={`flex justify-between items-center ${generalTextColor} p-3 min-h-[60px]`}>
      {/* Entire left area is clickable */}
      <div className="flex flex-col justify-center flex-grow pr-2 min-w-0 cursor-pointer" onClick={handleAddressClick}>
        <div className="flex items-baseline mb-1">
          {/* Apply specific order delivery text color and size */}
          <span className={`${orderDeliveryTextSize} ${orderDeliveryColor} font-normal mr-1`}>
            Order Delivery by
          </span>
          <span className={`${orderDeliveryTextSize} ${orderDeliveryColor} font-bold`}>
            Morning 6-8 AM
          </span>
        </div>

        <span className={`flex items-center whitespace-nowrap overflow-hidden text-ellipsis ${addressTextSize} ${addressColor} max-w-full relative`} title={fullAddress}>
          <span className={`inline-block max-w-[calc(100%-25px-17px)] overflow-hidden text-ellipsis`}>
            {fullAddress}
          </span>
          {/* Apply specific arrow color */}
          <span className={`flex-shrink-0 ml-1 text-xs ${arrowFinalColor}`}>▼</span>
        </span>
      </div>

      {/* User Icon */}
      <button
        className="p-2 bg-none border-none cursor-pointer flex-shrink-0 ml-2"
        onClick={() => navigate('/profile')}
      >
        {/* Apply generalTextColor to the user icon */}
        <FaUser className={`${generalTextColor} text-2xl`} />
      </button>
    </div>
  );
};

export default Navbar;
