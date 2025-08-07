import React, { useState } from 'react';

// Import all SVGs needed for the icons
import AllIcon from '../../assets/All.svg';
import LeafyIcon from '../../assets/Leafy.svg';
import FruityIcon from '../../assets/Fruity.svg';
import TuberIcon from '../../assets/Tuber.svg';
import FlowerIcon from '../../assets/Flower.svg';
import SpicyIcon from '../../assets/Spicy.svg';
import ChiliIcon from '../../assets/Chili.svg';

// Import combined config JSON
import homepageConfig from '../ProductFetchList/homepageConfig.json';

// Map icon strings to imported SVGs
const iconMap = {
  AllIcon,
  LeafyIcon,
  FruityIcon,
  TuberIcon,
  FlowerIcon,
  SpicyIcon,
  ChiliIcon,
};

const FoodBar = ({ setSelectedValues, headerBgClass, headerBgStyle }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const categories = homepageConfig.foodBarCategories || [];

  const handleCategorySelect = (item, index) => {
    setActiveIndex(index);

    if (setSelectedValues) {
      const selectedCategories = Array.isArray(item.categories)
        ? item.categories
        : [item.category || 'all'];

      setSelectedValues({
        type: item.type,
        categories: selectedCategories,
      });
    }
  };

  return (
    <div
      className={`${headerBgClass} sticky top-0 z-50 border-[#EBECEF] pt-2.5`}
      style={headerBgStyle}
    >
      <div className="flex overflow-x-auto whitespace-nowrap custom-scrollbar">
        {categories.map((item, index) => {
          const isActive = activeIndex === index;
          const IconComponent = iconMap[item.icon];

          return (
            <button
              key={index}
              className={`flex flex-col items-center gap-1 px-5 py-2.5 bg-none border-none cursor-pointer text-white relative ${
                isActive ? 'rounded-tl-lg rounded-tr-lg font-bold' : ''
              }`}
              onClick={() => handleCategorySelect(item, index)}
            >
              <div className="foodbarIcon w-7 h-7 flex items-center justify-center">
                {IconComponent && (
                  <img
                    src={IconComponent}
                    alt={`${item.name} icon`}
                    width={28}
                    height={28}
                  />
                )}
              </div>
              <span className={`foodbarText ${isActive ? 'font-bold' : ''}`}>
                {item.name}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-white rounded-tl-lg rounded-tr-lg"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FoodBar;
