import React, { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { CartContext } from "../../context/CartContext";
import { LocationContext } from "../../context/LocationContext";
import { AuthContext } from "../../context/AuthContext";

import Navbar from "../../components/Navbar/Navbar";
import SearchBar from "../../components/SearchBar/SearchBar";
import FoodBar from "../../components/FoodBar/FoodBar";
import HomepageContentLayout from "../../components/ProductFetchList/HomepageContentLayout";
import GoToCartButton from "../../components/GoToCartButton/GoToCartButton";
import ActiveOrdersFloatButton from "../../components/ActiveOrdersFloatButton/ActiveOrdersFloatButton";
import Footer from "../../components/Footer/Footer";

// Import app configuration
import homepageConfig from "../../components/ProductFetchList/homepageConfig.json";

const HomePage = () => {
  const navigate = useNavigate();
  const { cart } = useContext(CartContext);
  const { location, isLoading: locationLoading } = useContext(LocationContext);
  const { user } = useContext(AuthContext);

  // Updated state: categories is now an array
  const [selectedFood, setSelectedFood] = useState({
    type: 'all',
    categories: ['all'],
  });

  // Updated to work with new FoodBar output
  const handleFoodSelect = (food) => {
    setSelectedFood(food);
  };

  const handleSearchClick = () => {
    navigate("/SearchPage");
  };

  const handleGoToCart = () => {
    navigate("/cartpage");
  };

  const activeOrderCount = useMemo(() => {
    if (!user || !Array.isArray(user.orders)) return 0;
    return user.orders.filter(
      (order) => order.orderStatus?.toLowerCase() === "placed"
    ).length;
  }, [user]);

  // Header background styling logic
  const headerBgInfo = useMemo(() => {
    const headerBackground = homepageConfig.headerBackground;
    let style = {};
    let className = '';

    if (headerBackground) {
      if (headerBackground.type === "img" && headerBackground.value) {
        style = {
          backgroundImage: `url('${headerBackground.value}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        };
      } else if (headerBackground.type === "color" && headerBackground.value) {
        if (
          headerBackground.value.startsWith('#') ||
          headerBackground.value.startsWith('rgb') ||
          headerBackground.value.startsWith('hsl')
        ) {
          style = { backgroundColor: headerBackground.value };
        } else {
          className = `bg-${headerBackground.value}-500`;
        }
      }
    }

    if (Object.keys(style).length === 0 && className === '') {
      className = 'bg-green-500'; // Default fallback Tailwind class
    }

    return { style, className };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className={headerBgInfo.className} style={headerBgInfo.style}>
        <Navbar />
        <SearchBar onSearchClick={handleSearchClick} />
      </div>

      <FoodBar
        setSelectedValues={handleFoodSelect}
        headerBgClass={headerBgInfo.className}
        headerBgStyle={headerBgInfo.style}
      />

      <div className="flex-grow pb-[10px]">
        <HomepageContentLayout selectedFood={selectedFood} />
      </div>

      <Footer />

      {Array.isArray(cart) && cart.length > 0 && (
        <div className="sticky bottom-0 bg-white px-4 py-2 z-10 shadow-[0_-2px_4px_rgba(0,0,0,0.1)]">
          <button
            onClick={handleGoToCart}
            className="
              w-full
              py-3.5
              text-base
              font-bold
              bg-green-800
              text-white
              rounded-lg
              hover:bg-green-900
              transition-colors
            "
          >
            Go to Cart ({cart.length})
          </button>
        </div>
      )}

      {activeOrderCount > 0 && (
        <ActiveOrdersFloatButton count={activeOrderCount} />
      )}
    </div>
  );
};

export default HomePage;
