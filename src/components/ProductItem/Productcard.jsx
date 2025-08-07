import React, { memo } from "react";

// Helper to format weight nicely (e.g., 1000 -> 1 kg, 1250 -> 1.25 kg)
function formatWeight(quantityInGrams) {
  if (typeof quantityInGrams !== "number" || isNaN(quantityInGrams)) return "";
  if (quantityInGrams >= 1000) {
    const kg = quantityInGrams / 1000;
    return `${parseFloat(kg.toFixed(2))} kg`;
  }
  return `${quantityInGrams}g`;
}

// NEW: Helper function to get the quantity display string
const getQuantityDisplay = (quantityFormat) => {
  if (!quantityFormat) return '1 piece';

  const { type, qty } = quantityFormat;
  const quantity = qty && parseInt(qty) > 0 ? parseInt(qty) : 0;

  if (type === 'weight') {
    return quantity > 0 ? `250-${250 + quantity} gm` : '250 gm';
  } else {
    return quantity > 0 ? `${quantity} piece` : '1 piece';
  }
};

const Productcard = memo(({
  item,
  onProductClick,
  handleAddClick,
  handleIncrement,
  handleDecrement,
  cartQuantity,
  card_height,
  card_width,
  card_border_radius,
  add_button_color,
  badge_color,
  badge_text_color,
  badge_text,
  card_style // New prop for card style type
}) => {
  const isInCart = cartQuantity !== null && typeof cartQuantity !== "undefined";
  const { actual_price, discounted_price, discount_percentage, quantity_format } = item;

  let displayDiscountedPrice, displayActualPrice;

  if (quantity_format?.type === 'weight') {
    displayDiscountedPrice = Math.round((discounted_price * 250) / 1000);
    displayActualPrice = Math.round((actual_price * 250) / 1000);
  } else {
    displayDiscountedPrice = discounted_price;
    displayActualPrice = actual_price;
  }

  // Common styles for all card types (can be overridden by specific types)
  const commonCardStyles = {
    borderRadius: card_border_radius,
    width: card_width === 'auto' ? '100%' : card_width,
    maxWidth: card_width === 'auto' ? '100%' : card_width,
    minWidth: card_width === 'auto' ? undefined : card_width,
    flexShrink: card_width === 'auto' ? undefined : 0,
    flexGrow: card_width === 'auto' ? undefined : 0,
    height: card_height === 'auto' ? undefined : card_height,
  };

  const addButtonBgColor = {
    backgroundColor: add_button_color,
    borderColor: add_button_color
  };

  const badgeStyles = {
    backgroundColor: badge_color,
    color: badge_text_color,
  };

  const addButtonStyle = {
    backgroundColor: add_button_color,
    borderColor: add_button_color,
    color: 'white',
  };

  const addHoverStyle = {
    '--hover-bg': add_button_color,
    '--hover-text': 'white',
  };

  // --- Card Type 1 (Your original style) ---
  const CardType1 = () => (
    <div
      className="
        relative
        flex flex-col items-start
        gap-[8px]
        bg-white
        border border-[#e5e7eb]
        pb-[10px]
        box-border
        shadow-sm
      "
      style={commonCardStyles}
    >
      {discount_percentage > 0 && (
        <div
          className="
            absolute left-[12px] top-0 z-10
            flex items-center justify-center
            w-[29px] h-[28px]
          "
        >
          <svg
            width="29" height="28" viewBox="0 0 29 28" fill="none" xmlns="http://www.w3.org/2000/svg"
            className="absolute w-full h-full top-0 left-0"
          >
            <path d="M28.9499 0C28.3999 0 27.9361 1.44696 27.9361 2.60412V27.9718L24.5708 25.9718L21.2055 27.9718L17.8402 25.9718L14.4749 27.9718L11.1096 25.9718L7.74436 27.9718L4.37907 25.9718L1.01378 27.9718V2.6037C1.01378 1.44655 0.549931 0 0 0H28.9499Z" fill="green"></path>
          </svg>
          <div
            className="
              relative z-20
              w-[20px] text-center
              text-[9px] font-extrabold
              text-white
              leading-[1]
              whitespace-nowrap
            "
          >
            {discount_percentage}%<br className="leading-none" />OFF
          </div>
        </div>
      )}

      <div
        className="
          relative w-full overflow-hidden
          rounded-t-[8px] rounded-b-none
          border-b border-b-[#e5e7eb]
        "
      >
        <div
          className="
            flex w-full h-auto
            rounded-t-[8px] rounded-b-none
            aspect-square
            overflow-hidden
            cursor-pointer
          "
          onClick={() => onProductClick(item)}
        >
          {item.images?.[0] ? (
            <img
              src={item.images[0]}
              alt={item.name}
              className="
                w-full h-full object-cover
                transition-opacity duration-150 ease-in-out
                opacity-100
              "
            />
          ) : (
            <div
              className="
                w-full h-full
                bg-gradient-to-r from-[#e5e7eb] to-[#d1d5db]
                animate-pulse-custom
              "
            ></div>
          )}
        </div>
      </div>

      <div
        className="
          w-full px-[8px]
          box-border
        "
      >
        <div className="flex flex-wrap gap-[4px] mb-[5px] items-center w-full">
          <div
            className="
              py-[2px] px-[6px]
              rounded-[4px]
              flex items-center gap-[2px]
              text-[10px] font-bold
              "
            style={badgeStyles}
          >
            {badge_text}
          </div>
        </div>

        <div className="flex flex-col w-full min-h-[48px] justify-start">
          <div
            className="
              mb-[4px]
              text-[0.95rem] font-semibold
              line-clamp-2
              text-[#1a1a1a]
              leading-[1.3]
            "
          >
            {item.name}
          </div>
          <div
            className="
              flex items-center
              text-[0.8rem] font-medium
              text-[#4b5563]
              whitespace-nowrap overflow-hidden text-ellipsis
            "
          >
            {getQuantityDisplay(quantity_format)}
          </div>
        </div>

        <div className="flex items-center justify-between w-full min-h-[38px]">
          <div className="flex flex-col items-start min-w-0">
            <div className="text-[1rem] font-semibold text-[#1a1a1a] whitespace-nowrap">
              ₹{displayDiscountedPrice}
            </div>
            {actual_price > discounted_price && (
              <div className="text-[0.8rem] font-medium line-through text-[#6b7280] whitespace-nowrap">
                ₹{displayActualPrice}
              </div>
            )}
          </div>
          {isInCart ? (
            <div
              className="
                flex items-center justify-between
                rounded-[6px]
                text-white
                text-[0.65rem]
                min-w-[70px] max-w-[90px]
                box-border
                h-[42px] flex-grow-0 flex-shrink-0
                px-[6px]
              "
              style={addButtonBgColor}
            >
              <button
                className="
                  bg-transparent border-none
                  text-white
                  text-[1.2rem]
                  px-[4px] py-0
                  cursor-pointer font-bold
                "
                onClick={(e) => { e.stopPropagation(); handleDecrement(item._id); }}
              >
                -
              </button>
              <p className="text-white font-semibold m-0 text-center flex-grow">
                {quantity_format?.type === 'weight'
                  ? formatWeight(cartQuantity)
                  : `${cartQuantity} piece`}
              </p>
              <button
                className="
                  bg-transparent border-none
                  text-white
                  text-[1.2rem]
                  px-[4px] py-0
                  cursor-pointer font-bold
                "
                onClick={(e) => { e.stopPropagation(); handleIncrement(item._id); }}
              >
                +
              </button>
            </div>
          ) : (
            <button
              className="
                rounded-[6px]
                font-sans
                flex justify-center items-center
                font-semibold
                relative
                text-[0.9rem]
                py-[8px] px-[12px]
                gap-[2px]
                min-w-[50px]
                border
                cursor-pointer uppercase
                box-border
                transition-colors duration-200
                add-button-hover
                flex-grow-0 flex-shrink-0
              "
              style={{ ...addButtonStyle, ...addHoverStyle }}
              onClick={(e) => { e.stopPropagation(); handleAddClick(item); }}
            >
              ADD
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // --- Card Type 2 ---
const CardType2 = () => (
  <div
    className="
      bg-white rounded-lg shadow-md overflow-hidden relative
      flex flex-col
    "
    style={{ ...commonCardStyles, height: card_height || 'auto' }}
  >
    {/* Image Wrapper */}
    <div
      className="
        relative w-full
        overflow-hidden
        flex justify-center items-center
        cursor-pointer
      "
      style={{ height: commonCardStyles.width }}
      onClick={() => onProductClick(item)}
    >
      {item.images?.[0] ? (
        <img
          src={item.images[0]}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gray-200 animate-pulse-custom"></div>
      )}

      {/* Sponsor Tag (if needed, currently not in your item data) */}
      {item.sponsor_text && (
        <div className="absolute top-2 left-2 bg-white bg-opacity-90 rounded px-1.5 py-1 flex items-center gap-1 text-xs font-medium text-gray-700 z-10">
          {item.sponsor_icon && <img src={item.sponsor_icon} alt="Sponsor" className="h-[10px] w-[14px]" />}
          {item.sponsor_text}
        </div>
      )}

      {/* Add/Quantity Button (remains in image wrapper as it's an overlay for the image) */}
      {isInCart ? (
        <div
          className="
            absolute bottom-2 right-2
            flex items-center justify-between
            rounded-md
            text-xs
            min-w-[80px] max-w-[100px]
            h-[36px]
            px-1.5
          "
          style={{ backgroundColor: add_button_color, filter: 'brightness(90%)' }}
        >
          <button
            className="
              bg-transparent border-none text-white text-lg px-1 py-0
              cursor-pointer font-bold w-7 h-7 flex items-center justify-center
            "
            onClick={(e) => { e.stopPropagation(); handleDecrement(item._id); }}
          >
            -
          </button>
          <p className="text-white font-semibold m-0 text-center flex-grow text-xs">
            {quantity_format?.type === 'weight'
              ? formatWeight(cartQuantity)
              : `${cartQuantity} pc`}
          </p>
          <button
            className="
              bg-transparent border-none text-white text-lg px-1 py-0
              cursor-pointer font-bold w-7 h-7 flex items-center justify-center
            "
            onClick={(e) => { e.stopPropagation(); handleIncrement(item._id); }}
          >
            +
          </button>
        </div>
      ) : (
        <button
          className="
            absolute bottom-2 right-2
            rounded-md
            px-4 py-2 text-sm font-semibold cursor-pointer z-10
            transition-colors duration-200
          "
          style={{ backgroundColor: 'white', color: add_button_color, borderColor: add_button_color, border: '1px solid' }}
          onClick={(e) => { e.stopPropagation(); handleAddClick(item); }}
        >
          ADD
        </button>
      )}
    </div>

    {/* Content Area */}
    <div className="p-[8px] px-[10px] pb-[10px] flex flex-col flex-grow">
      <div className="flex justify-between items-baseline flex-wrap mb-[6px]">
        <div className="flex items-baseline gap-[6px]">
          <p className="text-base font-bold text-gray-800">
            ₹{displayDiscountedPrice}
          </p>
          {actual_price > discounted_price && (
            <p className="text-xs text-gray-500 line-through">
              ₹{displayActualPrice}
            </p>
          )}
        </div>
        {discount_percentage > 0 && ( // Display save info only if there's a discount
          <div className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-tight">
            SAVE ₹{displayActualPrice - displayDiscountedPrice}
          </div>
        )}
      </div>

      {/* Discount Badge - NEW LOCATION: Now within the content area, placed above the text badge */}
      {discount_percentage > 0 && (
        <div
          className="mb-[4px] px-1.5 py-0.5 rounded text-[10px] font-bold self-start"
          style={{ backgroundColor: badge_color, color: badge_text_color }}
        >
          {discount_percentage}% OFF
        </div>
      )}

      {/* Text Badge - REMAINS IN CONTENT */}
      {badge_text && (
        <div
          className="mb-[4px] px-1.5 py-0.5 rounded text-[10px] font-bold self-start"
          style={badgeStyles}
        >
          {badge_text}
        </div>
      )}

      <p className="text-xs text-gray-600 mb-[4px] font-normal">
      {getQuantityDisplay(quantity_format)}
      </p>
      <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-tight flex-grow mb-[6px]">
        {item.name}
      </p>
      {/* Rating Info */}
      {item.rating && (
        <div className="flex items-center gap-[4px] text-xs text-gray-700 mt-auto pt-[4px]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-green-500">
            <path d="M12 .587l3.668 7.568 8.332 1.209-6.001 5.855 1.416 8.292-7.415-3.906-7.415 3.906 1.416-8.292-6.001-5.855 8.332-1.209z"/>
          </svg>
          <span className="font-semibold">{item.rating.value}</span>
          <span className="text-gray-500">({item.rating.count})</span>
        </div>
      )}
    </div>
  </div>
);

  // --- Card Type 3 ---
  const CardType3 = () => (
    <div
      className="
        relative flex flex-col bg-white rounded-xl overflow-hidden shadow-lg
        transition-transform duration-200 hover:scale-[1.02]
      "
      style={commonCardStyles}
    >
      <div
        className="relative w-full aspect-square overflow-hidden rounded-t-xl cursor-pointer"
        onClick={() => onProductClick(item)}
      >
        {item.images?.[0] ? (
          <img
            src={item.images[0]}
            alt={item.name}
            className="w-full h-full object-cover transition-opacity duration-150 ease-in-out opacity-100"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-100 to-purple-100 animate-pulse-custom"></div>
        )}

        {/* Discount Badge - BACK TO IMAGE OVERLAY */}
        {discount_percentage > 0 && (
          <div
            className="absolute top-2 right-2 px-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold  py-1 rounded-full shadow-md"
          >
            -{discount_percentage}%
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col flex-grow">
        {/* Text Badge - REMAINS IN CONTENT */}
        {badge_text && (
          <div
            className="mb-1  py-0.5 rounded-full text-xs font-bold self-start"
            style={badgeStyles}
          >
            {badge_text}
          </div>
        )}
        <p className="text-sm font-medium text-gray-500 mb-1">
          {getQuantityDisplay(quantity_format)}
        </p>
        <h3 className="text-base font-semibold text-gray-900 line-clamp-2 mb-2 flex-grow">
          {item.name}
        </h3>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <p className="text-lg font-bold text-gray-900">
              ₹{displayDiscountedPrice}
            </p>
            {actual_price > discounted_price && (
              <p className="text-sm text-gray-500 line-through">
                ₹{displayActualPrice}
              </p>
            )}
          </div>
          {isInCart ? (
            <div
              className="
                flex items-center justify-between
                rounded-full
                text-white
                text-sm
                min-w-[80px] max-w-[100px]
                h-[40px]
                px-3
              "
              style={addButtonBgColor}
            >
              <button
                className="bg-transparent border-none text-white text-xl px-1 py-0 cursor-pointer font-bold"
                onClick={(e) => { e.stopPropagation(); handleDecrement(item._id); }}
              >
                -
              </button>
              <p className="text-white font-semibold m-0 text-center flex-grow text-sm">
                {quantity_format?.type === 'weight'
                  ? formatWeight(cartQuantity)
                  : `${cartQuantity} pc`}
              </p>
              <button
                className="bg-transparent border-none text-white text-xl px-1 py-0 cursor-pointer font-bold"
                onClick={(e) => { e.stopPropagation(); handleIncrement(item._id); }}
              >
                +
              </button>
            </div>
          ) : (
            <button
              className="
                bg-blue-600 text-white rounded-full
                px-5 py-2.5 text-sm font-semibold shadow-md
                transition-colors duration-200 hover:bg-blue-700
              "
              style={addButtonStyle}
              onClick={(e) => { e.stopPropagation(); handleAddClick(item); }}
            >
              ADD
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // --- Main Productcard Component Rendering ---
  return (
    <>
      <style>
        {`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse-custom {
          animation: pulse 1.5s infinite ease-in-out;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Dynamic hover styles for ADD button */
        .add-button-hover:hover {
          background-color: var(--hover-bg) !important;
          color: var(--hover-text) !important;
        }
        `}
      </style>
      {/* Conditional rendering based on card_style */}
      {card_style === 'type_2' ? (
        <CardType2 />
      ) : card_style === 'type_3' ? (
        <CardType3 />
      ) : (
        <CardType1 /> // Default to type_1 if no matching style or undefined
      )}
    </>
  );
});

export default Productcard;